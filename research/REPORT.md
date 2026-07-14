# DigiStarKala data-source feasibility report

**Target:** https://digistarkala.ir/  
**Tested:** 2026-07-13 / 2026-07-14  
**Machine egress IP:** `46.224.211.234`  
**Stack observed:** Nuxt SPA (`x-powered-by: Nuxt`), MihanShop backend, API base `public.api_base_url = "/shop/api"`, Laravel Sanctum cookies (`DIGISTARKALA-XSRF-TOKEN`, `mahan_dr_session`).

---

## 1. Reachability

| Check | Result |
|-------|--------|
| `curl -I https://digistarkala.ir/` | **HTTP/2 200**, `content-type: text/html;charset=utf-8`, `x-powered-by: Nuxt` |
| Timeout / geo block / Cloudflare interstitial | **None** on this egress |
| JSON API without browser | Works after Sanctum bootstrap |

**Evidence:** [captures/reachability.txt](captures/reachability.txt)

**Verdict:** Origin is reachable from this machine. No Iran-egress VPN required for the tests below. Proceeded with full suite.

---

## 2. Endpoint inventory

Playwright (headed Chromium, realistic UA) visited:

| Page | URL | HTTP | Title |
|------|-----|------|-------|
| home | `/` | 200 | دیجی استار کالا |
| category | `/products/categories/جارو-برقی` | 200 | … \| جارو برقی |
| product | `/products/22/…` | 200 | … \| جارو برقی عصائی کوماتسو 1192 |
| search | `/products?query=جارو` | 200 | … \| لیست محصولات |
| cart | `/cart` | 200 | redirects to login UI when empty/unauth |

**Artifacts**

- Full catalog: [endpoints.json](endpoints.json) (45 XHR/fetch rows; 13 `/shop/api/*`)
- HAR: [captures/session.har](captures/session.har)
- Response body samples: [captures/bodies/](captures/bodies/)
- API summary table: [captures/api-summary.json](captures/api-summary.json)

### Core shop API (all returned real JSON when same-origin / server-side)

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/shop/api/sanctum/csrf-cookie` | 204 | Sets session + XSRF cookies |
| GET | `/shop/api/init` | 200 | Menu, logo, cart shell, auth state (~43 KB) |
| GET | `/shop/api/home?device=desktop` | 200 | Homepage blocks (~176 KB) |
| GET | `/shop/api/products/search/init` | 200 | Category tree / filters |
| GET | `/shop/api/products/search?…` | 200 | Listing (category or `query=`) |
| GET | `/shop/api/products/:id` | 200 | PDP; price on `stocks[].pricing.price` |
| GET | `/shop/api/products/:id/comments` | 200 | Reviews |
| GET | `/shop/api/products/:id/qa` | 200 | Q&A |
| POST | `/shop/api/cart/add` | 200 | `{"success":true,…}` (clicked «افزودن به سبد») |
| GET | `/shop/api/cart` | 200 | Cart payload |
| GET | `/shop/api/authentication/countries/code` | 200 | Login country codes |
| GET | `/shop/api/authentication/oauth/services` | 200 | Empty services list |

**Required client headers (from SPA axios plugin in Nuxt entry):**

```
Accept: application/json
X-Requested-With: XMLHttpRequest
lang: fa
Cookie: DIGISTARKALA-XSRF-TOKEN=…; mahan_dr_session=…
X-XSRF-TOKEN: <decoded XSRF cookie>   # for mutating POSTs
withCredentials: true
```

Without these, some routes return HTTP 200 with a Persian “request not considered valid” JSON error body.

**robots.txt** ([option-c/robots.txt](option-c/robots.txt)):

```
Disallow: /shop/api/*
Disallow: /*?query=
Disallow: /cart/*
Disallow: /login
Disallow: /register
Disallow: /profile/*
Sitemap: https://digistarkala.ir/shop/sitemap.xml
```

Sitemaps expose product and category URLs under `/shop/sitemap/shop/products.xml` and `…/categories.xml`.

---

## 3. Options A / B / C

| Option | Verdict | Evidence |
|--------|---------|----------|
| **A — Server-side proxy** (Node + Cloudflare Worker) | **WORKS** | Real JSON, no WAF challenge from this egress or CF edge |
| **B — Browser direct (CORS)** | **BLOCKED** | No `Access-Control-Allow-Origin`; preflight unusable for foreign origins |
| **C — Periodic scrape → static JSON** | **WORKS (catalog only)** | 50/50 products, 0 errors, ~222s @ 1 req/s; cart/checkout not scrapeable |

---

### Option A — Server-side proxy

#### A1. Plain Node `fetch` (this machine)

Script: [option-a/node-proxy-test.mjs](option-a/node-proxy-test.mjs)  
Results: [option-a/node-results.json](option-a/node-results.json), [option-a/node-results.txt](option-a/node-results.txt)

| Endpoint | Status | Latency | JSON? | Challenge? |
|----------|--------|---------|-------|------------|
| sanctum/csrf-cookie | 204 | 1551 ms | n/a | no |
| init | 200 | 1403 ms | yes | no |
| home | 200 | 700 ms | yes | no |
| search | 200 | 386 ms | yes | no |
| product `/products/22` | 200 | 423 ms | yes | no |
| cart | 200 | 435 ms | yes | no |

Body previews are full product/home JSON (not HTML challenge pages). Rate-limit headers observed: `x-ratelimit-limit: 60`.

#### A2. Cloudflare Worker (real edge egress)

- Worker source: [option-a/worker/src/index.js](option-a/worker/src/index.js)
- Deployed: `https://dsk-proxy-probe.hessi3700.workers.dev`
- Results: [option-a/worker-remote-results.json](option-a/worker-remote-results.json)
- Local workerd control (same code, machine egress): [option-a/worker-local-results.json](option-a/worker-local-results.json)

| Endpoint | Status | Latency | JSON? | Origin `cf-ray` | Challenge? |
|----------|--------|---------|-------|-----------------|------------|
| sanctum/csrf-cookie | 204 | 1414 ms | n/a | present | no |
| init | 200 | 413 ms | yes (`json_ok`) | `a1abf62d4d591f00-GYD` | no |
| home | 200 | 632 ms | yes | … | no |
| search | 200 | 337 ms | yes | … | no |
| product | 200 | 354 ms | yes | … | no |
| cart | 200 | 409 ms | yes | … | no |

**Notes**

- `wrangler dev --remote` failed on this host with IPv6 connect timeouts to Cloudflare control plane; **`wrangler deploy` + HTTPS invoke succeeded** and is the authoritative CF-edge test.
- No Cloudflare interstitial / “Just a moment” / challenge-platform HTML in any body.
- Origin responses from the Worker included `server: cloudflare` + `cf-ray` (origin is CF-fronted for at least some paths); still returned application/json.

**A verdict:** A datacenter-hosted proxy **does receive real JSON**. Both Node and CF Workers are viable reverse-proxy frontends for the MihanShop API.

---

### Option B — Client-side direct calls (CORS)

Static probe served at `http://127.0.0.1:5173/`  
Files: [option-b/index.html](option-b/index.html), [option-b/probe.js](option-b/probe.js)  
Browser results: [option-b/cors-results.json](option-b/cors-results.json)  
Header dump: [option-b/curl-cors-headers.txt](option-b/curl-cors-headers.txt)

| Call | Browser result |
|------|----------------|
| GET init / home / search / product / cart | `TypeError: Failed to fetch` — CORS blocked |
| POST cart/add | Failed (preflight + request) |
| OPTIONS (curl) | 200 but **no** `Access-Control-Allow-Origin`, only `allow: GET,HEAD` or `allow: POST` |
| GET with `Origin: http://127.0.0.1:5173` (curl) | 200 JSON **without** ACAO (browsers still refuse to expose body) |

Console (Playwright):

> Access to fetch at 'https://digistarkala.ir/shop/api/…' from origin 'http://127.0.0.1:5173' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.

SPA itself only works same-origin (`baseURL = location.protocol + '//' + location.host + '/shop/api'`).

**B verdict:** A browser on a foreign origin **cannot** call their API directly. Option B is not viable for a third-party storefront.

---

### Option C — One-time scrape → static JSON

Script: [option-c/scrape.mjs](option-c/scrape.mjs)  
Sample catalog: [catalog.sample.json](catalog.sample.json)  
Meta: [option-c/scrape-meta.json](option-c/scrape-meta.json), log: [option-c/scrape.log](option-c/scrape.log)

| Metric | Value |
|--------|-------|
| Cap | 50 products (sitemap page 1) |
| Throttle | 1 navigation / second |
| Total time | **222 s** (~3.7 min) |
| Success | **50 / 50** (0% error rate on intercept) |
| With images | **50 / 50** |
| With price | **17 / 50** (`stocks[0].pricing.price`; null when OOS / empty `stocks[]`) |
| robots | Honored for bulk API crawl intent; used page navigation + SPA XHR intercept; `/shop/api/*` is Disallow for bots |

**Image hotlink probe** (sample thumbnail):

| Condition | Status | Content-Type | Bytes |
|-----------|--------|--------------|-------|
| No Referer | 200 | image/jpeg | 76689 |
| Referer: `https://example.com/` | 200 | image/jpeg | 76689 |
| Referer: digistarkala.ir | 200 | image/jpeg | 76689 |
| ACAO on image | **null** (irrelevant for `<img src>`; blocks canvas/WebGL CORS use) |

**Hotlink verdict:** Images can be hotlinked in `<img>` / CSS from foreign sites today (no Referer lockout observed). No CORS headers if you need canvas pixel access — rehost only if you need that or want CDN control / link rot protection.

**C limitations (inherent)**

- Cart, checkout, login, live stock races: **not scrapeable** as a transactional storefront.
- robots disallows `/shop/api/*` and search query URLs — production crawler should prefer sitemaps + HTML routes and stay polite.
- Prices/stock change often; static dump goes stale without a schedule.
- Early sitemap IDs skew toward older / OOS SKUs (many `in_stock: false`).

**C verdict:** Periodic scrape is a **workable catalog pipeline** for browse/search/PDP content. Not sufficient alone for a full purchasing storefront.

---

## 4. Recommendation

### Primary: **Option A — server-side proxy** (Cloudflare Workers or Node)

**Why**

1. Empirically returns real product/home/search/cart JSON from both this host and a deployed Cloudflare Worker — no challenge page in the test window.
2. Same-origin CORS is not required; the proxy is the browser’s origin.
3. Cart/checkout/login are live APIs (`POST /cart/add`, Sanctum session cookies) — only a server-side session-aware proxy can mirror purchasing without reverse-engineering payment gateways offline.
4. Option B is hard-blocked by missing ACAO.
5. Option C is excellent for bulk catalog bootstrap / offline demos but cannot own cart or real-time inventory alone.

### Secondary / complement: **Option C for catalog seed + image CDN policy**

Use scrape (or better: scheduled Worker pulls of sitemap + `/products/:id`) to warm a local KV/D1/R2 cache, then serve the storefront from cache with short TTL revalidation through the proxy. Hotlink images initially; rehost to R2 if you need permanence or offline.

### Do not use: **Option B alone**

Foreign-origin browser `fetch` is not permitted.

---

## 5. Next-step implementation sketch (recommended: A + light C)

### Layout

```
apps/storefront/          # Nuxt or Next storefront (your UI)
  app/… or pages/…
workers/api-proxy/        # Cloudflare Worker reverse proxy
  src/index.ts
  wrangler.toml
packages/catalog/         # optional scheduled scraper
  scrape.ts
  schema.ts
research/                 # this feasibility suite (keep)
```

### Libraries

| Piece | Suggestion |
|-------|------------|
| Proxy | Cloudflare Workers (`wrangler`), or Node (`hono` / `undici`) |
| Session | Forward `Cookie` jar; map `Set-Cookie` domain to your host; set `X-XSRF-TOKEN` from decoded XSRF cookie on POST |
| Storefront | Nuxt 3 or Next 15 App Router; React Query / ofetch for `/api/*` |
| Catalog cache (optional) | Workers KV or D1; cron trigger every N hours |
| Images | Hotlink `shop/storage/...` first; optional R2 mirror |

### Worker proxy surface (minimal)

| Your route | Upstream |
|------------|----------|
| `GET /api/init` | `GET /shop/api/init` |
| `GET /api/home` | `GET /shop/api/home?device=desktop` |
| `GET /api/search` | `GET /shop/api/products/search?…` |
| `GET /api/products/:id` | `GET /shop/api/products/:id` |
| `GET/POST /api/cart/*` | `/shop/api/cart/*` |
| `GET /api/sanctum/csrf-cookie` | passthrough once per session |

### Gotchas

1. **Sanctum cookies** — must call `/shop/api/sanctum/csrf-cookie` first; rewrite `Set-Cookie` `Domain` from `digistarkala.ir` to your storefront domain (or use Worker cookie jar server-side and never expose origin cookies).
2. **Header fidelity** — send `X-Requested-With: XMLHttpRequest` and `lang: fa` or many routes return “invalid request” JSON.
3. **Price shape** — `product.price` is often absent; use `product.stocks[].pricing.price` and `product.in_stock`.
4. **Rate limit** — `x-ratelimit-limit: 60` observed; cache homepage/listings aggressively.
5. **robots / ToS / legal** — `/shop/api/*` is disallowed for crawlers; a commercial mirror may need permission. Prefer low QPS, caching, and no credential abuse.
6. **Checkout** — payment likely requires merchant credentials / Iranian PSP; proxying checkout may break bank callbacks (return URLs). Plan cart display first; treat payment as a separate legal/product decision.
7. **CF control plane from this host** — `wrangler whoami` / `--remote` hit IPv6 timeouts; deploy via IPv4 (`NODE_OPTIONS=--dns-result-order=ipv4first`) or CI.
8. **Cart page auth** — empty cart navigates toward login UX; session still works for `POST /cart/add` while anonymous (cookie session).

### Suggested first milestone (no full storefront yet)

1. Productionize `workers/api-proxy` with cookie rewriting + path allowlist.
2. Smoke-test from a blank page on your domain: init → search → product → cart/add.
3. Optional: nightly catalog job writing `catalog.json` to KV for fast PLP.
4. Only then build UI.

---

## 6. Artifact index

| Path | What |
|------|------|
| [endpoints.json](endpoints.json) | Playwright XHR/fetch catalog |
| [captures/session.har](captures/session.har) | Full HAR |
| [captures/reachability.txt](captures/reachability.txt) | curl -I + IP |
| [option-a/node-results.json](option-a/node-results.json) | Node proxy probe |
| [option-a/worker-remote-results.json](option-a/worker-remote-results.json) | CF Worker edge probe |
| [option-b/cors-results.json](option-b/cors-results.json) | Browser CORS probe |
| [option-b/curl-cors-headers.txt](option-b/curl-cors-headers.txt) | OPTIONS/GET ACAO evidence |
| [catalog.sample.json](catalog.sample.json) | 50-product normalized sample |
| [option-c/scrape-meta.json](option-c/scrape-meta.json) | Scrape timings + image probe |

---

## 7. Bottom line

| Goal | Use |
|------|-----|
| Live mirror storefront (browse + cart API) | **Option A** |
| Static demo / SEO dump / offline catalog | **Option C** (schedule + cache) |
| Pure client JS against digistarkala.ir | **Option B — not viable** |

**Recommended path:** Cloudflare Worker (or Node) reverse proxy with Sanctum session handling, optional scheduled catalog cache, hotlinked images until you need rehosting.
