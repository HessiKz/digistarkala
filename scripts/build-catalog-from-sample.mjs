/**
 * Normalize research/catalog.sample.json into storefront public/data files.
 * Fast path for dev without a full scrape.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const samplePath = path.join(root, "research", "catalog.sample.json");
const outDir = path.join(root, "apps", "storefront", "public", "data");

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

function main() {
  if (!fs.existsSync(samplePath)) {
    console.error("Missing research/catalog.sample.json");
    process.exit(1);
  }
  const sample = JSON.parse(fs.readFileSync(samplePath, "utf8"));
  fs.mkdirSync(outDir, { recursive: true });

  const products = (sample.products || []).map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    price: p.price,
    images: p.images || [],
    category: p.category,
    description: p.description,
    stock: p.stock,
    url: p.url,
    source: p.source,
  }));

  const catalog = {
    generatedAt: new Date().toISOString(),
    source: sample.source || "https://digistarkala.ir",
    count: products.length,
    products,
  };
  fs.writeFileSync(
    path.join(outDir, "catalog.json"),
    JSON.stringify(catalog, null, 2)
  );

  /** @type {Map<string, { title: string, slug: string, productIds: number[], image: string|null }>} */
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
  const featured = (stocked.length ? stocked : products)
    .slice(0, 8)
    .map((p) => p.id);

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
    featuredProductIds: featured,
    categoryHighlights: flat.slice(0, 6).map((c) => ({
      title: c.title,
      slug: c.slug,
      image: c.image,
      count: c.productIds.length,
    })),
    marquee: flat.slice(0, 8).map((c) => c.title),
  };
  fs.writeFileSync(
    path.join(outDir, "home.json"),
    JSON.stringify(home, null, 2)
  );

  console.log(
    `catalog: ${products.length} products, ${flat.length} categories -> ${outDir}`
  );
}

main();
