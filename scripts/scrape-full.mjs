/**
 * Full catalog scrape → apps/storefront/public/data/*
 * Polite page navigation + XHR intercept (same pattern as research/option-c).
 *
 * Env:
 *   CAP=0          unlimited (default 0 = all sitemap URLs)
 *   CAP=100        limit products
 *   THROTTLE_MS=1000
 *   CHROMIUM_PATH  override browser binary
 */
import { chromium } from "playwright-core";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "apps", "storefront", "public", "data");
const ORIGIN = "https://digistarkala.ir";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const THROTTLE_MS = Number(process.env.THROTTLE_MS || 1000);
const CAP = Number(process.env.CAP || 0);

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

async function fetchText(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  return { status: res.status, body: await res.text() };
}

function parseSitemapLocs(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

async function collectAllProductUrls() {
  const urls = [];
  for (let page = 1; page <= 50; page++) {
    const sm = await fetchText(
      `${ORIGIN}/shop/sitemap/shop/products.xml?page=${page}`
    );
    if (sm.status !== 200) break;
    const locs = parseSitemapLocs(sm.body);
    if (!locs.length) break;
    urls.push(...locs);
    console.log(`sitemap page ${page}: +${locs.length} (total ${urls.length})`);
    if (locs.length < 10) break;
    await sleep(400);
  }
  return CAP > 0 ? urls.slice(0, CAP) : urls;
}

function normalizeProduct(productPayload, url, id) {
  if (!productPayload?.product) {
    return {
      id,
      title: null,
      slug: url.split("/").pop(),
      price: null,
      images: [],
      category: null,
      description: null,
      stock: null,
      source: "missing",
      url,
    };
  }
  const p = productPayload.product;
  const images = [];
  if (p.image) images.push(p.image);
  if (Array.isArray(p.thumbnails)) {
    for (const im of p.thumbnails) {
      const u = typeof im === "string" ? im : im?.url || im?.src;
      if (u) images.push(u.startsWith("http") ? u : ORIGIN + u);
    }
  }
  if (Array.isArray(p.gallery)) {
    for (const im of p.gallery) {
      const u =
        typeof im === "string" ? im : im?.file || im?.url || im?.src;
      if (u) images.push(u.startsWith("http") ? u : ORIGIN + u);
    }
  }
  if (Array.isArray(p.images)) {
    for (const im of p.images) {
      const u = typeof im === "string" ? im : im?.url || im?.src;
      if (u) images.push(u.startsWith("http") ? u : ORIGIN + u);
    }
  }
  const uniqImages = [...new Set(images.filter(Boolean))];
  const price =
    p.stocks?.[0]?.pricing?.price ??
    p.price ??
    p.final_price ??
    null;
  const stock =
    p.in_stock ??
    (Array.isArray(p.stocks) ? p.stocks.length > 0 : null);
  const category =
    productPayload.breadcrumbs?.map((b) => b.title).join(" > ") ||
    p.category?.title ||
    p.categories?.[0]?.title ||
    null;

  return {
    id: p.id ?? id,
    title: p.page_title || p.title || p.name || null,
    slug: p.slug || p.uri?.split("/").pop() || url.split("/").pop(),
    price,
    images: uniqImages,
    category,
    description: p.description || p.short_description || null,
    stock,
    code: p.code || null,
    source: "page-intercepted-api",
    url,
  };
}

async function main() {
  const t0 = Date.now();
  fs.mkdirSync(outDir, { recursive: true });

  const productUrls = await collectAllProductUrls();
  console.log(`scraping ${productUrls.length} products…`);

  const chromiumPath =
    process.env.CHROMIUM_PATH ||
    (fs.existsSync("/snap/bin/chromium")
      ? "/snap/bin/chromium"
      : fs.existsSync("/usr/bin/chromium")
        ? "/usr/bin/chromium"
        : fs.existsSync("/usr/bin/chromium-browser")
          ? "/usr/bin/chromium-browser"
          : undefined);

  const browser = await chromium.launch({
    executablePath: chromiumPath,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
  });
  const context = await browser.newContext({
    userAgent: UA,
    locale: "fa-IR",
  });
  const page = await context.newPage();

  const products = [];
  const errors = [];

  for (let i = 0; i < productUrls.length; i++) {
    const url = productUrls[i];
    const idMatch = url.match(/\/products\/(\d+)/);
    const id = idMatch ? Number(idMatch[1]) : null;
    console.log(`[${i + 1}/${productUrls.length}] ${url}`);

    let productPayload = null;
    const onResp = async (res) => {
      try {
        const u = res.url();
        if (
          id &&
          u.includes(`/shop/api/products/${id}`) &&
          !u.includes("/comments") &&
          !u.includes("/qa")
        ) {
          productPayload = await res.json();
        }
      } catch {
        /* ignore */
      }
    };
    page.on("response", onResp);

    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
      const deadline = Date.now() + 8000;
      while (!productPayload && Date.now() < deadline) await sleep(200);
      products.push(normalizeProduct(productPayload, url, id));
      if (!productPayload?.product) {
        errors.push({ url, error: "no product JSON" });
      }
    } catch (e) {
      errors.push({ url, error: e.message });
      products.push(normalizeProduct(null, url, id));
    }

    page.off("response", onResp);
    await sleep(THROTTLE_MS);
  }

  await browser.close();

  const catalog = {
    generatedAt: new Date().toISOString(),
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
  const categories = {
    generatedAt: catalog.generatedAt,
    count: flat.length,
    categories: flat.map((c) => ({
      id: c.slug,
      title: c.title,
      slug: c.slug,
      productCount: c.productIds.length,
      image: c.image,
    })),
    flat,
  };
  fs.writeFileSync(
    path.join(outDir, "categories.json"),
    JSON.stringify(categories, null, 2)
  );

  const stocked = products.filter((p) => p.stock && p.price);
  const home = {
    generatedAt: catalog.generatedAt,
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

  const meta = {
    elapsedSec: Math.round((Date.now() - t0) / 1000),
    scraped: products.length,
    withPrice: products.filter((p) => p.price != null).length,
    withImages: products.filter((p) => p.images?.length).length,
    errors: errors.slice(0, 30),
    errorCount: errors.length,
  };
  fs.writeFileSync(
    path.join(outDir, "scrape-meta.json"),
    JSON.stringify(meta, null, 2)
  );

  console.log(
    `done products=${products.length} cats=${flat.length} errors=${errors.length} ${meta.elapsedSec}s -> ${outDir}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
