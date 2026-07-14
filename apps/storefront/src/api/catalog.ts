import type {
  BrandFile,
  CatalogFile,
  CategoriesFile,
  HomeFile,
  Product,
  SearchParams,
  SearchResult,
} from "@/lib/types";
import { parsePrice, slugifyCategory } from "@/lib/format";
import { filterProducts } from "@/lib/search";

const base = import.meta.env.BASE_URL || "/";

async function loadJson<T>(name: string): Promise<T> {
  const url = `${base}data/${name}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load ${name}: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

let catalogPromise: Promise<Product[]> | null = null;
let categoriesPromise: Promise<CategoriesFile> | null = null;
let homePromise: Promise<HomeFile> | null = null;
let brandPromise: Promise<BrandFile> | null = null;

function normalizeProduct(
  raw: CatalogFile["products"][number]
): Product {
  const priceNumber = parsePrice(raw.price);
  return {
    id: raw.id,
    title: raw.title || `محصول ${raw.id}`,
    slug: raw.slug || String(raw.id),
    price: raw.price,
    priceNumber,
    images: Array.isArray(raw.images) ? raw.images.filter(Boolean) : [],
    category: raw.category,
    categorySlug: slugifyCategory(raw.category),
    description: raw.description,
    stock: raw.stock,
    code: raw.code ?? null,
    features: raw.features,
    url: raw.url,
    source: raw.source,
  };
}

export async function getProducts(): Promise<Product[]> {
  if (!catalogPromise) {
    catalogPromise = loadJson<CatalogFile>("catalog.json").then((file) =>
      file.products.map(normalizeProduct)
    );
  }
  return catalogPromise;
}

export async function getCategories(): Promise<CategoriesFile> {
  if (!categoriesPromise) {
    categoriesPromise = loadJson<CategoriesFile>("categories.json");
  }
  return categoriesPromise;
}

export async function getHome(): Promise<HomeFile> {
  if (!homePromise) {
    homePromise = loadJson<HomeFile>("home.json");
  }
  return homePromise;
}

export async function getBrand(): Promise<BrandFile> {
  if (!brandPromise) {
    brandPromise = loadJson<BrandFile>("brand.json");
  }
  return brandPromise;
}

/** Mirrors conceptual GET /shop/api/init */
export async function getInit() {
  const [products, categories, home, brand] = await Promise.all([
    getProducts(),
    getCategories(),
    getHome(),
    getBrand().catch(() => null),
  ]);
  return {
    is_logged_in: false,
    productCount: products.length,
    categories: categories.categories,
    title: home.title,
    logo: brand?.logo,
    brand,
  };
}

/** Mirrors conceptual GET /shop/api/home */
export async function getHomeData() {
  const [home, products, brand] = await Promise.all([
    getHome(),
    getProducts(),
    getBrand().catch(() => null),
  ]);
  const byId = new Map(products.map((p) => [p.id, p]));
  const featured = home.featuredProductIds
    .map((id) => byId.get(id))
    .filter((p): p is Product => Boolean(p));

  const sectionProducts = (ids: number[] = []) =>
    ids.map((id) => byId.get(id)).filter((p): p is Product => Boolean(p));

  return { home, featured, products, brand, sectionProducts };
}

/** Mirrors conceptual GET /shop/api/products/search */
export async function searchProducts(
  params: SearchParams = {}
): Promise<SearchResult> {
  const products = await getProducts();
  return filterProducts(products, params);
}

/** Mirrors conceptual GET /shop/api/products/:id */
export async function getProduct(id: number): Promise<Product | null> {
  const products = await getProducts();
  return products.find((p) => p.id === id) ?? null;
}

export async function getRelated(
  product: Product,
  limit = 8
): Promise<Product[]> {
  const products = await getProducts();
  return products
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.categorySlug === product.categorySlug ||
          p.category === product.category)
    )
    .slice(0, limit);
}

export async function getProductsByIds(ids: number[]): Promise<Product[]> {
  const products = await getProducts();
  const map = new Map(products.map((p) => [p.id, p]));
  return ids.map((id) => map.get(id)).filter((p): p is Product => Boolean(p));
}
