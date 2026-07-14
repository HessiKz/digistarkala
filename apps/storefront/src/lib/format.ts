/** Parse IRR price strings like "20,850,000" or numbers into a finite number. */
export function parsePrice(value: string | number | null | undefined): number | null {
  if (value == null) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return null;
  const n = Number(digits);
  return Number.isFinite(n) ? n : null;
}

export function formatPrice(value: string | number | null | undefined): string {
  const n = parsePrice(value);
  if (n == null) return "ناموجود";
  return new Intl.NumberFormat("fa-IR").format(n) + " تومان";
}

export function formatCount(n: number): string {
  return new Intl.NumberFormat("fa-IR").format(n);
}

export function slugifyCategory(path: string | null | undefined): string {
  if (!path) return "other";
  const leaf = path.includes(">") ? path.split(">").pop()!.trim() : path.trim();
  return leaf
    .replace(/\s+/g, "-")
    .replace(/[\/\\?#&]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

export function categoryLeaf(path: string | null | undefined): string {
  if (!path) return "سایر";
  return path.includes(">") ? path.split(">").pop()!.trim() : path.trim();
}

export function categoryRoot(path: string | null | undefined): string {
  if (!path) return "سایر";
  return path.includes(">") ? path.split(">")[0]!.trim() : path.trim();
}

export function productPath(product: { id: number; slug?: string | null }): string {
  const slug = product.slug || "product";
  return `/products/${product.id}/${encodeURIComponent(slug)}`;
}

export function categoryPath(slug: string): string {
  return `/products/categories/${encodeURIComponent(slug)}`;
}
