import type { Product, SearchParams, SearchResult } from "./types";
import { parsePrice } from "./format";

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\s+/g, " ")
    .trim();
}

/** Loose category match: strip hyphens/spaces so site slugs still hit catalog paths */
function catKey(s: string): string {
  return normalize(s).replace(/[-_\s‌]/g, "");
}

export function filterProducts(
  products: Product[],
  params: SearchParams = {}
): SearchResult {
  const pageSize = params.pageSize ?? 24;
  const page = Math.max(1, params.page ?? 1);
  const q = params.query ? normalize(params.query) : "";
  const cat = params.category ? catKey(params.category) : "";
  const brand = params.brand ? normalize(params.brand) : "";

  let list = products.slice();

  if (q) {
    list = list.filter((p) => {
      const hay = normalize(
        [p.title, p.code ?? "", p.category ?? "", p.slug].join(" ")
      );
      return hay.includes(q);
    });
  }

  if (cat) {
    list = list.filter((p) => {
      const slug = catKey(p.categorySlug || "");
      const path = catKey(p.category || "");
      const leaf = path.includes(">")
        ? path.split(">").pop() || path
        : path;
      return (
        slug === cat ||
        path.includes(cat) ||
        leaf === cat ||
        slug.includes(cat) ||
        cat.includes(slug)
      );
    });
  }

  if (brand) {
    list = list.filter((p) => {
      const hay = normalize(
        [p.title, p.category ?? "", p.description ?? ""].join(" ")
      );
      return hay.includes(brand);
    });
  }

  if (params.incredibleOffers) {
    // Static catalog has no discount flag; prefer in-stock priced items as "offers"
    list = list.filter((p) => p.stock === true && p.priceNumber != null);
  }

  if (params.inStockOnly) {
    list = list.filter((p) => p.stock === true);
  }

  if (params.minPrice != null) {
    list = list.filter((p) => (p.priceNumber ?? 0) >= params.minPrice!);
  }
  if (params.maxPrice != null) {
    list = list.filter(
      (p) => p.priceNumber != null && p.priceNumber <= params.maxPrice!
    );
  }

  switch (params.sort) {
    case "price-asc":
      list.sort(
        (a, b) => (a.priceNumber ?? Infinity) - (b.priceNumber ?? Infinity)
      );
      break;
    case "price-desc":
      list.sort((a, b) => (b.priceNumber ?? -1) - (a.priceNumber ?? -1));
      break;
    case "title":
      list.sort((a, b) => a.title.localeCompare(b.title, "fa"));
      break;
    case "newest":
    default:
      list.sort((a, b) => b.id - a.id);
      break;
  }

  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const slice = list.slice(start, start + pageSize);

  return {
    products: slice,
    total,
    page: Math.min(page, totalPages),
    pageSize,
    totalPages,
  };
}

export function priceBounds(products: Product[]): {
  min: number;
  max: number;
} {
  const nums = products
    .map((p) => p.priceNumber ?? parsePrice(p.price))
    .filter((n): n is number => n != null && n > 0);
  if (!nums.length) return { min: 0, max: 0 };
  return { min: Math.min(...nums), max: Math.max(...nums) };
}
