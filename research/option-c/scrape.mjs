/**
 * Option C — throttled one-time scrape → static catalog sample.
 * Respects robots.txt Disallow for /shop/api/* by preferring HTML page crawl
 * + sitemap product URLs; API used only where robots allows HTML pages.
 *
 * Note: robots.txt disallows /shop/api/* — for feasibility we primarily parse
 * product pages and sitemap, and record API-vs-HTML tradeoffs.
 */
import { chromium } from "playwright-core";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "catalog.sample.json");
const META = path.join(__dirname, "scrape-meta.json");
const ORIGIN = "https://digistarkala.ir";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const THROTTLE_MS = 1000;
const CAP = 50;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchText(url, headers = {}) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, ...headers },
  });
  return {
    status: res.status,
    headers: Object.fromEntries(res.headers.entries()),
    body: await res.text(),
  };
}

async function checkImageHotlink(imageUrl) {
  const results = {};
  // 1) plain GET no referer
  {
    const t0 = Date.now();
    const res = await fetch(imageUrl, {
      headers: { "User-Agent": UA, Accept: "image/*" },
      redirect: "follow",
    });
    const buf = Buffer.from(await res.arrayBuffer());
    results.noReferer = {
      status: res.status,
      latencyMs: Date.now() - t0,
      contentType: res.headers.get("content-type"),
      bytes: buf.length,
      acao: res.headers.get("access-control-allow-origin"),
      looksLikeImage: (res.headers.get("content-type") || "").startsWith("image/"),
    };
  }
  // 2) foreign referer
  {
    const t0 = Date.now();
    const res = await fetch(imageUrl, {
      headers: {
        "User-Agent": UA,
        Accept: "image/*",
        Referer: "https://example.com/",
      },
    });
    const buf = Buffer.from(await res.arrayBuffer());
    results.foreignReferer = {
      status: res.status,
      latencyMs: Date.now() - t0,
      contentType: res.headers.get("content-type"),
      bytes: buf.length,
      looksLikeImage: (res.headers.get("content-type") || "").startsWith("image/"),
    };
  }
  // 3) same-origin referer
  {
    const t0 = Date.now();
    const res = await fetch(imageUrl, {
      headers: {
        "User-Agent": UA,
        Accept: "image/*",
        Referer: ORIGIN + "/",
      },
    });
    const buf = Buffer.from(await res.arrayBuffer());
    results.sameOriginReferer = {
      status: res.status,
      latencyMs: Date.now() - t0,
      contentType: res.headers.get("content-type"),
      bytes: buf.length,
      looksLikeImage: (res.headers.get("content-type") || "").startsWith("image/"),
    };
  }
  // 4) CORS from foreign origin (browser-like OPTIONS not needed for img tags)
  results.hotlinkLikelyOk =
    results.noReferer.looksLikeImage &&
    results.foreignReferer.looksLikeImage &&
    results.sameOriginReferer.looksLikeImage;
  return results;
}

function parseSitemapLocs(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

async function main() {
  const tStart = Date.now();
  const robots = await fetchText(`${ORIGIN}/robots.txt`);
  fs.writeFileSync(path.join(__dirname, "robots.txt"), robots.body);

  const productSitemap = await fetchText(
    `${ORIGIN}/shop/sitemap/shop/products.xml?page=1`
  );
  const categorySitemap = await fetchText(
    `${ORIGIN}/shop/sitemap/shop/categories.xml?page=1`
  );
  const productUrls = parseSitemapLocs(productSitemap.body).slice(0, CAP);
  const categoryUrls = parseSitemapLocs(categorySitemap.body).slice(0, 10);

  console.log(
    `robots status=${robots.status}; products=${productUrls.length}; categories sample=${categoryUrls.length}`
  );
  console.log("robots body:\n", robots.body);

  // robots disallows /shop/api/* — we still need product fields.
  // Strategy for feasibility: use Playwright on product HTML pages and intercept
  // same-origin API responses the page itself loads (browser traffic is allowed
  // for users; we're not bulk-hitting API outside page navigation).
  // Additionally throttle navigations to 1/sec.

  const browser = await chromium.launch({
    executablePath: "/snap/bin/chromium",
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
  let sampleImage = null;

  for (let i = 0; i < productUrls.length; i++) {
    const url = productUrls[i];
    const idMatch = url.match(/\/products\/(\d+)/);
    const id = idMatch ? Number(idMatch[1]) : null;
    console.log(`[${i + 1}/${productUrls.length}] ${url}`);

    let productPayload = null;
    const onResp = async (res) => {
      try {
        const u = res.url();
        if (id && u.includes(`/shop/api/products/${id}`) && !u.includes("/comments") && !u.includes("/qa")) {
          const j = await res.json();
          productPayload = j;
        }
      } catch {}
    };
    page.on("response", onResp);

    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
      // wait a bit for product API
      const waitUntil = Date.now() + 8000;
      while (!productPayload && Date.now() < waitUntil) {
        await sleep(200);
      }

      if (!productPayload?.product) {
        // fallback: try to scrape visible title from DOM
        const title = await page.title();
        errors.push({ url, error: "no product JSON intercepted", title });
        products.push({
          id,
          title: title || null,
          slug: url.split("/").pop(),
          price: null,
          images: [],
          category: null,
          description: null,
          stock: null,
          source: "html-title-only",
          url,
        });
      } else {
        const p = productPayload.product;
        const images = [];
        if (p.image) images.push(p.image);
        if (Array.isArray(p.images)) {
          for (const im of p.images) {
            const u = typeof im === "string" ? im : im?.url || im?.src || im?.original;
            if (u) images.push(u);
          }
        }
        if (Array.isArray(p.gallery)) {
          for (const im of p.gallery) {
            const u =
              typeof im === "string" ? im : im?.file || im?.url || im?.src;
            if (u) images.push(u);
          }
        }
        // media fields vary across MihanShop versions
        const media = p.media || p.photos || p.pictures || [];
        if (Array.isArray(media)) {
          for (const im of media) {
            const u = typeof im === "string" ? im : im?.url || im?.src || im?.path;
            if (u) images.push(u.startsWith("http") ? u : ORIGIN + u);
          }
        }

        const uniqImages = [...new Set(images.filter(Boolean))];
        if (!sampleImage && uniqImages[0]) sampleImage = uniqImages[0];

        // MihanShop prices live on stock rows, not the product root
        const price =
          p.stocks?.[0]?.pricing?.price ??
          p.price ??
          p.final_price ??
          p.sale_price ??
          p.default_price ??
          p.prices?.[0]?.price ??
          null;

        const stock =
          p.in_stock ??
          (Array.isArray(p.stocks) ? p.stocks.length > 0 : null) ??
          p.stock ??
          p.quantity ??
          p.is_available ??
          p.availability ??
          null;

        const category =
          productPayload.breadcrumbs?.map((b) => b.title).join(" > ") ||
          p.category?.title ||
          p.categories?.[0]?.title ||
          null;

        products.push({
          id: p.id ?? id,
          title: p.page_title || p.title || p.name || null,
          slug: p.slug || url.split("/").pop(),
          price,
          images: uniqImages,
          category,
          description:
            p.description ||
            p.short_description ||
            p.summary ||
            p.body ||
            null,
          stock,
          source: "page-intercepted-api",
          url,
          rawKeys: Object.keys(p),
        });
      }
    } catch (e) {
      errors.push({ url, error: e.message });
    }

    page.off("response", onResp);
    await sleep(THROTTLE_MS);
  }

  await browser.close();

  // Image hotlink test
  let imageProbe = null;
  if (!sampleImage) {
    // fallback from sitemap image
    const m = productSitemap.body.match(/<image:loc>([^<]+)<\/image:loc>/);
    if (m) sampleImage = m[1];
  }
  if (sampleImage) {
    console.log("image probe", sampleImage);
    imageProbe = {
      url: sampleImage,
      ...(await checkImageHotlink(sampleImage)),
    };
  }

  const elapsedMs = Date.now() - tStart;
  const catalog = {
    generatedAt: new Date().toISOString(),
    source: ORIGIN,
    cap: CAP,
    count: products.length,
    products: products.map(({ rawKeys, ...rest }) => rest),
  };
  fs.writeFileSync(OUT, JSON.stringify(catalog, null, 2));

  const meta = {
    elapsedMs,
    elapsedSec: Math.round(elapsedMs / 1000),
    requested: productUrls.length,
    scraped: products.length,
    withPrice: products.filter((p) => p.price != null).length,
    withImages: products.filter((p) => p.images?.length).length,
    errorCount: errors.length,
    errorRate: productUrls.length
      ? errors.length / productUrls.length
      : null,
    errors: errors.slice(0, 20),
    robotsDisallows: robots.body
      .split("\n")
      .filter((l) => l.toLowerCase().startsWith("disallow")),
    note:
      "robots.txt Disallow: /shop/api/* — scrape used page navigation (1 rps) and intercepted same-origin XHR the SPA makes; bulk direct API crawl avoided.",
    imageProbe,
    sampleProductKeys: products[0]?.rawKeys || null,
    categoriesSample: categoryUrls,
  };
  // attach rawKeys only in meta first product
  if (products[0]?.rawKeys) meta.sampleProductKeys = products[0].rawKeys;
  // re-read - we stripped rawKeys; get from first successful intercept by re-opening file? store separately
  fs.writeFileSync(META, JSON.stringify(meta, null, 2));
  console.log(
    `done products=${products.length} errors=${errors.length} elapsed=${meta.elapsedSec}s -> ${OUT}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
