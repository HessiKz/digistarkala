/**
 * Extract brand assets from captured init/home (or live API) into public/data.
 * Also samples dominant colors from slider/banner images for adaptive theming.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "apps", "storefront", "public", "data");
const ORIGIN = "https://digistarkala.ir";

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function absUrl(u) {
  if (!u || typeof u !== "string") return null;
  if (u.startsWith("http")) return u;
  if (u.startsWith("//")) return "https:" + u;
  if (u.startsWith("/")) return ORIGIN + u;
  return u;
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      default:
        h = ((r - g) / d + 4) / 6;
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToCss(h, s, l) {
  return `hsl(${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%)`;
}

async function sampleImagePalette(url) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "image/*",
        Referer: ORIGIN + "/",
      },
    });
    if (!res.ok) throw new Error(String(res.status));
    const buf = Buffer.from(await res.arrayBuffer());
    // Use sharp if present, else crude average from JPEG headers fallback via dynamic import of sharp/jimp
    let sharp;
    try {
      sharp = (await import("sharp")).default;
    } catch {
      sharp = null;
    }
    if (!sharp) {
      // fallback palette from average of first bytes - better use solid brand red
      return defaultPaletteFromHue(350);
    }
    const { data, info } = await sharp(buf)
      .resize(48, 48, { fit: "cover" })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // k-means-ish: collect colorful pixels, pick median hue of saturated ones
    const hues = [];
    let rSum = 0;
    let gSum = 0;
    let bSum = 0;
    let n = 0;
    for (let i = 0; i < data.length; i += 3) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const { h, s, l } = rgbToHsl(r, g, b);
      if (s > 18 && l > 12 && l < 88) {
        hues.push(h);
        rSum += r;
        gSum += g;
        bSum += b;
        n++;
      }
    }
    if (!n) {
      // overall average
      let rr = 0,
        gg = 0,
        bb = 0,
        nn = 0;
      for (let i = 0; i < data.length; i += 3) {
        rr += data[i];
        gg += data[i + 1];
        bb += data[i + 2];
        nn++;
      }
      const avg = rgbToHsl(rr / nn, gg / nn, bb / nn);
      return defaultPaletteFromHue(avg.h || 350, Math.max(avg.s, 45));
    }
    hues.sort((a, b) => a - b);
    const hue = hues[Math.floor(hues.length / 2)];
    const avg = rgbToHsl(rSum / n, gSum / n, bSum / n);
    return defaultPaletteFromHue(hue, Math.min(85, Math.max(40, avg.s)));
  } catch (e) {
    console.warn("palette fail", url, e.message);
    return defaultPaletteFromHue(350);
  }
}

function defaultPaletteFromHue(h, s = 72) {
  const hue = ((h % 360) + 360) % 360;
  return {
    hue: Math.round(hue),
    accent: hslToCss(hue, s, 48),
    accentSoft: `hsla(${Math.round(hue)}, ${Math.round(s)}%, 50%, 0.14)`,
    accentDim: hslToCss(hue, s, 38),
    glow: `hsla(${Math.round(hue)}, ${Math.round(s)}%, 55%, 0.22)`,
    meshA: `hsla(${Math.round(hue)}, ${Math.round(s)}%, 50%, 0.18)`,
    meshB: `hsla(${Math.round((hue + 40) % 360)}, 55%, 45%, 0.1)`,
    // for light surfaces
    accentLight: hslToCss(hue, Math.min(s + 5, 80), 42),
  };
}

function extractInit(init) {
  const logo = init.logo || {};
  const add = init.additional || {};
  const namads = (add.namads || []).map((n) => {
    const html = String(n.html || "");
    // Prefer real src= not data-src=
    const srcMatch =
      html.match(/(?:^|[\s"'])src="([^"#][^"]*)"/) ||
      html.match(/src='([^'#][^']*)'/);
    const raw = srcMatch?.[1] || null;
    return {
      id: n.id,
      name: n.name,
      image: raw && raw !== "#" ? absUrl(raw) : null,
    };
  });
  const guarantees = (add.guarantees || []).map((g) => ({
    title: g.title,
    description: g.description,
    logo: absUrl(g.logo),
    link: g.link,
  }));
  return {
    name: init.name || "دیجی استار کالا",
    logo: {
      favicon: absUrl(logo.favicon),
      header: absUrl(logo.header),
      footer: absUrl(logo.footer),
    },
    menuTop: (init.menu?.top || []).map((m) => ({
      id: m.id,
      title: m.title,
      url: m.url || m.uri || m.link || "#",
    })),
    social: (init.social_networks || []).map((s) => ({
      id: s.id,
      title: s.title,
      link: s.link,
      logo: absUrl(s.logo),
    })),
    contacts: init.contacts || {},
    namads,
    guarantees,
    footerAbout: add.footer?.about || null,
    currency: add.currency || "تومان",
  };
}

function extractHome(home) {
  const blocks = home.blocks || [];
  const sliders = [];
  const banners = [];
  const brandItems = [];
  const articles = [];
  const productSections = [];
  const categorySections = [];
  const specialOffers = [];

  for (const b of blocks) {
    const type = b.type;
    const data = b.data;
    if (type === "slider" && Array.isArray(data)) {
      for (const s of data) {
        sliders.push({
          id: s.id,
          title: s.title,
          url: s.url,
          image: absUrl(s.image),
          mobileImage: absUrl(s.mobile_image),
          position: s.position ?? 0,
        });
      }
    } else if (type === "banner" && data && typeof data === "object") {
      banners.push({
        id: b.id,
        title: data.title,
        url: data.url,
        image: absUrl(data.image),
        mobileImage: absUrl(data.mobile_image),
      });
    } else if (type === "brand" && data?.items) {
      for (const br of data.items) {
        brandItems.push({
          id: br.id,
          name: br.name,
          enName: br.en_name,
          logo: absUrl(br.logo),
          uri: br.uri,
        });
      }
    } else if (type === "article" && data?.items) {
      for (const a of data.items) {
        articles.push({
          id: a.id,
          title: a.title || a.page_title,
          description: a.description,
          image: absUrl(a.image || a.thumbnail || a.cover),
          uri: a.uri || a.url,
        });
      }
    } else if (type === "product" && data?.items) {
      productSections.push({
        id: b.id,
        title: data.title,
        description: data.description,
        url: data.url,
        productIds: data.items.map((p) => p.id).filter(Boolean),
      });
    } else if (type === "special_offer" && data?.items) {
      specialOffers.push({
        id: b.id,
        title: data.title,
        description: data.description,
        url: data.url,
        productIds: data.items.map((p) => p.id).filter(Boolean),
      });
    } else if (type === "category_with_product" && data?.items) {
      categorySections.push({
        id: b.id,
        title: data.title,
        description: data.description,
        items: data.items.map((c) => ({
          id: c.id,
          title: c.title,
          slug: c.slug,
          icon: absUrl(c.icon),
          uri: c.uri,
          productIds: (c.products || []).map((p) => p.id),
        })),
      });
    }
  }

  sliders.sort((a, b) => a.position - b.position);
  return {
    title: home.title,
    sliders,
    banners,
    brands: brandItems,
    articles,
    productSections,
    specialOffers,
    categorySections,
  };
}

async function main() {
  const initPath = path.join(
    root,
    "research/captures/bodies/003_GET_200.bin"
  );
  const homePath = path.join(
    root,
    "research/captures/bodies/005_GET_200.bin"
  );
  if (!fs.existsSync(initPath) || !fs.existsSync(homePath)) {
    console.error("Missing capture bodies for init/home");
    process.exit(1);
  }

  const init = loadJson(initPath);
  const homeRaw = loadJson(homePath);
  const brand = extractInit(init);
  const homeBlocks = extractHome(homeRaw);

  console.log("sampling slider palettes…");
  for (const s of homeBlocks.sliders) {
    if (s.image) {
      s.palette = await sampleImagePalette(s.image);
      console.log("  slider", s.title, s.palette.accent);
    }
  }
  console.log("sampling banner palettes…");
  for (const b of homeBlocks.banners) {
    if (b.image) {
      b.palette = await sampleImagePalette(b.image);
      console.log("  banner", b.title, b.palette.accent);
    }
  }

  // logo palette
  let logoPalette = defaultPaletteFromHue(350, 70);
  if (brand.logo.header) {
    logoPalette = await sampleImagePalette(brand.logo.header);
    console.log("logo palette", logoPalette.accent);
  }

  const brandFile = {
    generatedAt: new Date().toISOString(),
    source: ORIGIN,
    ...brand,
    logoPalette,
  };

  // featured from special offers + product sections
  const featuredIds = [
    ...(homeBlocks.specialOffers[0]?.productIds || []),
    ...(homeBlocks.productSections.flatMap((s) => s.productIds) || []),
  ].filter((v, i, a) => a.indexOf(v) === i);

  // load catalog for category counts if present
  let catalog = { products: [] };
  const catPath = path.join(outDir, "catalog.json");
  if (fs.existsSync(catPath)) catalog = loadJson(catPath);

  const homeOut = {
    generatedAt: new Date().toISOString(),
    title: homeBlocks.title || brand.name,
    hero: {
      headline: homeBlocks.sliders[0]?.title || "دیجی استار کالا",
      subtext:
        brand.footerAbout?.body?.replace(/<[^>]+>/g, " ").slice(0, 120) ||
        "لوازم خانگی و ابزار با تجربه خرید مدرن",
      image: homeBlocks.sliders[0]?.image || null,
      ctaPrimary: "مشاهده محصولات",
      ctaSecondary: "کالاهای موجود",
    },
    sliders: homeBlocks.sliders,
    banners: homeBlocks.banners,
    brands: homeBlocks.brands,
    articles: homeBlocks.articles,
    productSections: homeBlocks.productSections,
    specialOffers: homeBlocks.specialOffers,
    categorySections: homeBlocks.categorySections,
    featuredProductIds: featuredIds.slice(0, 12),
    categoryHighlights: (homeBlocks.categorySections[0]?.items || []).map(
      (c) => ({
        title: c.title,
        slug: c.slug,
        image: c.icon,
        count:
          catalog.products.filter((p) =>
            (p.category || "").includes(c.title)
          ).length || c.productIds?.length || 0,
      })
    ),
    marquee: (homeBlocks.brands || []).map((b) => b.name).filter(Boolean),
    guarantees: brand.guarantees,
  };

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, "brand.json"),
    JSON.stringify(brandFile, null, 2)
  );
  fs.writeFileSync(
    path.join(outDir, "home.json"),
    JSON.stringify(homeOut, null, 2)
  );

  // also keep raw home for debugging
  fs.writeFileSync(
    path.join(outDir, "home-raw-blocks.json"),
    JSON.stringify(
      {
        title: homeRaw.title,
        blockTypes: (homeRaw.blocks || []).map((b) => ({
          id: b.id,
          type: b.type,
          component: b.component,
        })),
      },
      null,
      2
    )
  );

  console.log(
    `brand + home written: ${homeBlocks.sliders.length} sliders, ${homeBlocks.banners.length} banners, ${homeBlocks.brands.length} brands`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
