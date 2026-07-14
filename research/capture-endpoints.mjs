import { chromium } from "playwright-core";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "endpoints.json");
const HAR = path.join(__dirname, "captures", "session.har");
const RAW_DIR = path.join(__dirname, "captures", "bodies");

fs.mkdirSync(RAW_DIR, { recursive: true });

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const PAGES = [
  { name: "home", url: "https://digistarkala.ir/" },
  {
    name: "category",
    url: "https://digistarkala.ir/products/categories/%D8%AC%D8%A7%D8%B1%D9%88-%D8%A8%D8%B1%D9%82%DB%8C",
  },
  {
    name: "product",
    url: "https://digistarkala.ir/products/22/%D8%AC%D8%A7%D8%B1%D9%88-%D8%A8%D8%B1%D9%82%DB%8C-%D8%B9%D8%B5%D8%A7%D8%A6%DB%8C",
  },
  {
    name: "search",
    url: "https://digistarkala.ir/products?query=%D8%AC%D8%A7%D8%B1%D9%88",
  },
  { name: "cart", url: "https://digistarkala.ir/cart" },
];

const endpoints = new Map();
let bodySeq = 0;

function isInteresting(url, resourceType) {
  if (resourceType === "xhr" || resourceType === "fetch") return true;
  try {
    const u = new URL(url);
    if (u.pathname.includes("/shop/api")) return true;
  } catch {}
  return false;
}

function first500(buf) {
  if (!buf) return "";
  const slice = buf.subarray(0, 500);
  try {
    return new TextDecoder("utf-8", { fatal: false }).decode(slice);
  } catch {
    return Buffer.from(slice).toString("base64");
  }
}

async function main() {
  const browser = await chromium.launch({
    executablePath: "/snap/bin/chromium",
    headless: false,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
  });

  const context = await browser.newContext({
    userAgent: UA,
    locale: "fa-IR",
    viewport: { width: 1365, height: 900 },
    recordHar: { path: HAR, content: "embed" },
  });

  const page = await context.newPage();

  page.on("request", (req) => {
    const type = req.resourceType();
    if (!isInteresting(req.url(), type)) return;
    const key = `${req.method()} ${req.url()}`;
    if (!endpoints.has(key)) {
      endpoints.set(key, {
        key,
        method: req.method(),
        url: req.url(),
        resourceType: type,
        requestHeaders: req.headers(),
        postData: req.postData() || null,
        pagesSeen: new Set(),
        responses: [],
      });
    }
  });

  page.on("response", async (res) => {
    const req = res.request();
    const type = req.resourceType();
    if (!isInteresting(req.url(), type)) return;
    const key = `${req.method()} ${req.url()}`;
    const entry = endpoints.get(key) || {
      key,
      method: req.method(),
      url: req.url(),
      resourceType: type,
      requestHeaders: req.headers(),
      postData: req.postData() || null,
      pagesSeen: new Set(),
      responses: [],
    };

    let bodyPreview = "";
    let bodyFile = null;
    let contentType = res.headers()["content-type"] || "";
    try {
      const buf = await res.body();
      bodyPreview = first500(buf);
      bodySeq += 1;
      bodyFile = path.join(RAW_DIR, `${bodySeq.toString().padStart(3, "0")}_${req.method()}_${res.status()}.bin`);
      fs.writeFileSync(bodyFile, buf.subarray(0, Math.min(buf.length, 200_000)));
      bodyFile = path.relative(path.join(__dirname, ".."), bodyFile);
    } catch (e) {
      bodyPreview = `[body unavailable: ${e.message}]`;
    }

    entry.responses.push({
      status: res.status(),
      contentType,
      bodyPreview,
      bodyFile,
      responseHeaders: res.headers(),
      fromCache: res.fromServiceWorker(),
    });
    endpoints.set(key, entry);
  });

  const pageResults = [];

  for (const p of PAGES) {
    console.log(`NAV ${p.name} -> ${p.url}`);
    const started = Date.now();
    let status = null;
    try {
      const resp = await page.goto(p.url, {
        waitUntil: "networkidle",
        timeout: 90_000,
      });
      status = resp?.status() ?? null;
      // Allow late XHR after SPA hydrate
      await page.waitForTimeout(4000);
      // Mark current endpoints with page name
      for (const e of endpoints.values()) {
        // approximate: any request after previous nav is on this page if recently updated
      }
    } catch (e) {
      console.error(`FAIL ${p.name}: ${e.message}`);
    }
    pageResults.push({
      name: p.name,
      url: p.url,
      status,
      elapsedMs: Date.now() - started,
      title: await page.title().catch(() => ""),
    });
    console.log(`  status=${status} title=${await page.title().catch(() => "")}`);
  }

  // Attempt a lightweight cart interaction if possible (add to cart from product page)
  try {
    console.log("NAV product for cart POST probe");
    await page.goto(PAGES[2].url, { waitUntil: "networkidle", timeout: 90_000 });
    await page.waitForTimeout(2000);
    // Try common add-to-cart button selectors
    const selectors = [
      'button:has-text("افزودن به سبد")',
      'button:has-text("سبد خرید")',
      '[class*="add-to-cart"]',
      'button[type="submit"]',
    ];
    for (const sel of selectors) {
      const el = page.locator(sel).first();
      if (await el.count()) {
        console.log(`CLICK ${sel}`);
        await el.click({ timeout: 5000 }).catch(() => {});
        await page.waitForTimeout(3000);
        break;
      }
    }
  } catch (e) {
    console.error("cart probe:", e.message);
  }

  await context.close();
  await browser.close();

  const catalog = {
    capturedAt: new Date().toISOString(),
    origin: "https://digistarkala.ir",
    userAgent: UA,
    pages: pageResults,
    har: path.relative(path.join(__dirname, ".."), HAR),
    endpointCount: endpoints.size,
    endpoints: [...endpoints.values()].map((e) => ({
      method: e.method,
      url: e.url,
      resourceType: e.resourceType,
      requestHeaders: e.requestHeaders,
      postData: e.postData,
      responses: e.responses.map((r) => ({
        status: r.status,
        contentType: r.contentType,
        bodyPreview: r.bodyPreview,
        bodyFile: r.bodyFile,
        // keep subset of response headers useful for CORS/WAF
        responseHeaders: {
          "content-type": r.responseHeaders["content-type"],
          "access-control-allow-origin": r.responseHeaders["access-control-allow-origin"],
          "access-control-allow-credentials": r.responseHeaders["access-control-allow-credentials"],
          "access-control-allow-methods": r.responseHeaders["access-control-allow-methods"],
          "access-control-allow-headers": r.responseHeaders["access-control-allow-headers"],
          "cf-ray": r.responseHeaders["cf-ray"],
          server: r.responseHeaders["server"],
          "x-powered-by": r.responseHeaders["x-powered-by"],
          "set-cookie": r.responseHeaders["set-cookie"] ? "[present]" : undefined,
        },
      })),
    })),
  };

  // Prefer shop/api first in file
  catalog.endpoints.sort((a, b) => {
    const as = a.url.includes("/shop/api") ? 0 : 1;
    const bs = b.url.includes("/shop/api") ? 0 : 1;
    return as - bs || a.url.localeCompare(b.url);
  });

  fs.writeFileSync(OUT, JSON.stringify(catalog, null, 2));
  console.log(`Wrote ${OUT} with ${catalog.endpoints.length} endpoints`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
