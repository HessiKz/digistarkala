# DigiStarKala Premium Static Storefront

Personal **UI/UX redesign demo** of a Persian RTL appliance shop. Catalog is **static JSON** (scraped or sample). Cart is **localStorage only** (no live payment / Sanctum).

> Not affiliated with digistarkala.ir. Commercial use of their catalog/brand requires permission.

## Stack

- Vite + React 19 + TypeScript
- Tailwind CSS v4
- React Router, TanStack Query, Zustand
- GSAP ScrollTrigger
- Phosphor icons
- GitHub Pages deploy workflow

## Quick start

```bash
# seed catalog + brand assets (logo, sliders, banners, palettes)
npm run catalog:prepare

# install + dev
cd apps/storefront && npm install && npm run dev
```

**Theme:** light/dark toggle in the nav. Accent color tracks the active homepage slider/banner palette (sampled from official digistarkala assets).

Open the URL Vite prints (usually `http://localhost:5173`).

## Full catalog scrape

Requires Chromium (Playwright) and network access to digistarkala.ir:

```bash
# all sitemap products (~1 req/s)
npm run catalog:scrape

# or limited
CAP=100 npm run catalog:scrape
```

Writes:

- `apps/storefront/public/data/catalog.json`
- `apps/storefront/public/data/categories.json`
- `apps/storefront/public/data/home.json`

## Build for GitHub Pages

```bash
cd apps/storefront
npm ci
# project site (repo name in path)
VITE_BASE=/YOUR_REPO_NAME/ npm run build
# or user site root
VITE_BASE=/ npm run build
```

`dist/404.html` is copied from `index.html` for SPA deep links.

### Enable Pages

1. Push to GitHub
2. Settings → Pages → Source: **GitHub Actions**
3. Push to `main` (or run workflow manually)

Do **not** commit personal access tokens. Use `gh auth login` or Actions secrets only.

## Routes (parity with digistarkala.ir)

| Path | Page |
|------|------|
| `/` | Home |
| `/products` | Catalog + filters + `?q=` / `incredible_offers` / `brands[]` |
| `/products/categories/:slug` | Category |
| `/products/:id/:slug?` | Product detail |
| `/cart` | Local cart |
| `/pages/:slug` | CMS pages (اقساط، فروشنده شو، واردات، طرح‌ها، پرداخت) |
| `/about` `/faq` `/privacy` `/terms` `/contact` | Info pages |
| `/blog` `/blog/articles/:id` | Blog |
| `/profile/tickets` | Support landing (auth tickets on origin) |

Refresh CMS content: `npm run catalog:pages`

## Security note

If a GitHub token was pasted in chat, **revoke it immediately** in GitHub → Settings → Developer settings → Personal access tokens.

## Research

Feasibility notes and API inventory live in [`research/REPORT.md`](research/REPORT.md).
