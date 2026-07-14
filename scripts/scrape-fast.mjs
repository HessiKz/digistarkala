/**
 * Fast catalog via server-side Sanctum session (research Option A).
 * Much faster than Playwright page crawl; same public JSON endpoints.
 *
 * Env: CAP=0 all, THROTTLE_MS=200, DELAY between products
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "apps", "storefront", "public", "data");
const ORIGIN = "https://digistarkala.ir";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const THROTTLE_MS = Number(process.env.THROTTLE_MS || 1100);
const CAP = Number(process.env.CAP || 0);
const MAX_RETRIES = Number(process.env.RETRIES || 3);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function slugify(pathStr) {
  if (!pathStr) return "other";
  const leaf = pathStr.includes(">")
    ? pathStr.split(">").pop().trim()
    : pathStr.trim();
  return leaf
    .replace(/\s+/g, "-")
    .replace(/[\/\\?#&]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function leaf(pathStr) {
  if (!pathStr) return "سایر";
  return pathStr.includes(">")
    ? pathStr.split(">").pop().trim()
    : pathStr.trim();
}

function parseSetCookie(res) {
  const raw = res.headers.getSetCookie?.() || [];
  if (raw.length) return raw;
  const single = res.headers.get("set-cookie");
  return single ? [single] : [];
}

function mergeCookies(jar, setList) {
  for (const raw of setList) {
    const part = raw.split(";")[0];
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    jar.set(part.slice(0, eq).trim(), part.slice(eq + 1).trim());
  }
}

function cookieHeader(jar) {
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

function xsrfFromJar(jar) {
  const t = jar.get("DIGISTARKALA-XSRF-TOKEN");
  return t ? decodeURIComponent(t) : "";
}

async function api(jar, pathName, { method = "GET", body } = {}) {
  const headers = {
    "User-Agent": UA,
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
    lang: "fa",
    Origin: ORIGIN,
    Referer: `${ORIGIN}/`,
    Cookie: cookieHeader(jar),
  };
  const xsrf = xsrfFromJar(jar);
  if (xsrf) headers["X-XSRF-TOKEN"] = xsrf;

  const res = await fetch(`${ORIGIN}${pathName}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  mergeCookies(jar, parseSetCookie(res));
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { status: res.status, json, text };
}

function parseSitemapLocs(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

async function collectProductIds() {
  const ids = [];
  for (let page = 1; page <= 50; page++) {
    const res = await fetch(
      `${ORIGIN}/shop/sitemap/shop/products.xml?page=${page}`,
      { headers: { "User-Agent": UA } }
    );
    if (!res.ok) break;
    const body = await res.text();
    const locs = parseSitemapLocs(body);
    if (!locs.length) break;
    for (const u of locs) {
      const m = u.match(/\/products\/(\d+)/);
      if (m) ids.push(Number(m[1]));
    }
    console.log(`sitemap page ${page}: total ids ${ids.length}`);
    if (locs.length < 10) break;
    await sleep(200);
  }
  return CAP > 0 ? ids.slice(0, CAP) : ids;
}

function normalize(productPayload, id) {
  if (!productPayload?.product) {
    return {
      id,
      title: null,
      slug: String(id),
      price: null,
      images: [],
      category: null,
      description: null,
      stock: null,
      source: "missing",
      url: `${ORIGIN}/products/${id}`,
    };
  }
  const p = productPayload.product;
  const images = [];
  if (p.image) images.push(p.image);
  for (const key of ["thumbnails", "gallery", "images"]) {
    if (!Array.isArray(p[key])) continue;
    for (const im of p[key]) {
      const u =
        typeof im === "string"
          ? im
          : im?.file || im?.url || im?.src || im?.original;
      if (u) images.push(u.startsWith("http") ? u : ORIGIN + u);
    }
  }
  const uniqImages = [...new Set(images.filter(Boolean))];
  const price = p.stocks?.[0]?.pricing?.price ?? p.price ?? null;
  const stock =
    p.in_stock ?? (Array.isArray(p.stocks) ? p.stocks.length > 0 : null);
  const category =
    productPayload.breadcrumbs?.map((b) => b.title).join(" > ") ||
    p.category?.title ||
    p.categories?.[0]?.title ||
    null;

  return {
    id: p.id ?? id,
    title: p.page_title || p.title || p.name || null,
    slug: p.slug || p.uri?.split("/").pop() || String(id),
    price,
    images: uniqImages,
    category,
    description: p.description || p.short_description || null,
    stock,
    code: p.code || null,
    source: "api-sanctum",
    url: `${ORIGIN}/products/${id}`,
  };
}

function writeOutputs(products) {
  fs.mkdirSync(outDir, { recursive: true });
  const generatedAt = new Date().toISOString();
  const catalog = {
    generatedAt,
    source: ORIGIN,
    count: products.length,
    products,
  };
  fs.writeFileSync(
    path.join(outDir, "catalog.json"),
    JSON.stringify(catalog, null, 2)
  );

  const catMap = new Map();
  for (const p of products) {
    const title = leaf(p.category);
    const slug = slugify(p.category);
    if (!catMap.has(slug)) {
      catMap.set(slug, {
        title,
        slug,
        productIds: [],
        image: p.images?.[0] || null,
      });
    }
    const c = catMap.get(slug);
    c.productIds.push(p.id);
    if (!c.image && p.images?.[0]) c.image = p.images[0];
  }
  const flat = [...catMap.values()].sort(
    (a, b) => b.productIds.length - a.productIds.length
  );
  fs.writeFileSync(
    path.join(outDir, "categories.json"),
    JSON.stringify(
      {
        generatedAt,
        count: flat.length,
        categories: flat.map((c) => ({
          id: c.slug,
          title: c.title,
          slug: c.slug,
          productCount: c.productIds.length,
          image: c.image,
        })),
        flat,
      },
      null,
      2
    )
  );

  const stocked = products.filter((p) => p.stock && p.price);
  const home = {
    generatedAt,
    title: "دیجی استار کالا",
    hero: {
      headline: "خانه مدرن، خرید بی‌دردسر",
      subtext:
        "لوازم خانگی و ابزار برگزیده با قیمت شفاف و تجربه خرید روان.",
      image: products.find((p) => p.images?.length)?.images[0] || null,
      ctaPrimary: "مشاهده محصولات",
      ctaSecondary: "کالاهای موجود",
    },
    featuredProductIds: (stocked.length ? stocked : products)
      .slice(0, 8)
      .map((p) => p.id),
    categoryHighlights: flat.slice(0, 6).map((c) => ({
      title: c.title,
      slug: c.slug,
      image: c.image,
      count: c.productIds.length,
    })),
    marquee: flat.slice(0, 10).map((c) => c.title),
  };
  fs.writeFileSync(
    path.join(outDir, "home.json"),
    JSON.stringify(home, null, 2)
  );
  return { flat, stocked };
}

async function main() {
  const t0 = Date.now();
  const jar = new Map();

  console.log("csrf bootstrap…");
  const csrf = await fetch(`${ORIGIN}/shop/api/sanctum/csrf-cookie`, {
    headers: {
      "User-Agent": UA,
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
      lang: "fa",
    },
  });
  mergeCookies(jar, parseSetCookie(csrf));
  console.log("cookies", [...jar.keys()].join(", "));

  const ids = await collectProductIds();
  console.log(`fetching ${ids.length} products…`);

  const products = [];
  const erroredIds = [];

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    try {
      const { status, json } = await api(jar, `/shop/api/products/${id}`);
      if (status !== 200 || !json?.product) {
        erroredIds.push(id);
      }
      products.push(normalize(json, id));
    } catch (e) {
      erroredIds.push(id);
      products.push(normalize(null, id));
    }
    if ((i + 1) % 20 === 0 || i === ids.length - 1) {
      console.log(`  ${i + 1}/${ids.length} (errored: ${erroredIds.length})`);
    }
    await sleep(THROTTLE_MS);
  }

  // Retry errored ids with backoff to recover 429s
  const retryResult = [];
  for (let attempt = 1; erroredIds.length && attempt <= MAX_RETRIES; attempt++) {
    console.log(
      `retry ${attempt}: ${erroredIds.length} ids, sleeping ${attempt * 8000}ms`
    );
    await sleep(attempt * 8000);
    const thisAttempt = erroredIds.splice(0);
    for (const id of thisAttempt) {
      try {
        const { status, json } = await api(jar, `/shop/api/products/${id}`);
        if (status === 200 && json?.product) {
          const idx = products.findIndex((p) => p.id === id);
          if (idx >= 0) products[idx] = normalize(json, id);
        } else {
          erroredIds.push(id);
        }
      } catch {
        erroredIds.push(id);
      }
      retryResult.push(id);
    }
  }

  const { flat } = writeOutputs(products);
  const meta = {
    mode: "sanctum-fast",
    elapsedSec: Math.round((Date.now() - t0) / 1000),
    scraped: products.length,
    withPrice: products.filter((p) => p.price != null).length,
    withImages: products.filter((p) => p.images?.length).length,
    withTitle: products.filter((p) => p.title).length,
    categories: flat.length,
    errorCount: erroredIds.length,
    errors: erroredIds.slice(0, 30).map((id) => ({ id })),
  };
  fs.writeFileSync(
    path.join(outDir, "scrape-meta.json"),
    JSON.stringify(meta, null, 2)
  );
  console.log(
    `done products=${products.length} cats=${flat.length} errors=${erroredIds.length} ${meta.elapsedSec}s`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
