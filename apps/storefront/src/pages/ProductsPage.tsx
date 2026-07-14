import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCategories, searchProducts } from "@/api/catalog";
import { ProductCard } from "@/components/ProductCard";
import { Filters } from "@/components/Filters";
import { PageSkeleton } from "@/components/Skeleton";
import { formatCount } from "@/lib/format";
import type { SearchParams } from "@/lib/types";
import { Button } from "@/components/Button";

export function ProductsPage() {
  const [sp, setSp] = useSearchParams();

  const params: SearchParams = useMemo(
    () => ({
      query: sp.get("q") || sp.get("query") || undefined,
      category: sp.get("category") || undefined,
      brand: sp.get("brands[]") || sp.get("brands") || sp.get("brand") || undefined,
      incredibleOffers:
        sp.get("incredible_offers") === "true" ||
        sp.get("has_discount") === "1",
      inStockOnly: sp.get("inStock") === "1",
      sort:
        (sp.get("sort") as SearchParams["sort"]) ||
        (sp.get("sort_by") === "most-sold" || sp.get("sort_by") === "most-views"
          ? "newest"
          : undefined) ||
        "newest",
      page: Number(sp.get("page") || "1") || 1,
      pageSize: 24,
    }),
    [sp]
  );

  const cats = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const result = useQuery({
    queryKey: ["search", params],
    queryFn: () => searchProducts(params),
  });

  function apply(next: SearchParams) {
    const n = new URLSearchParams();
    if (next.query) n.set("q", next.query);
    if (next.category) n.set("category", next.category);
    if (next.brand) n.set("brands[]", next.brand);
    if (next.incredibleOffers) n.set("incredible_offers", "true");
    if (next.inStockOnly) n.set("inStock", "1");
    if (next.sort && next.sort !== "newest") n.set("sort", next.sort);
    if (next.page && next.page > 1) n.set("page", String(next.page));
    setSp(n);
  }

  if (result.isLoading || cats.isLoading) return <PageSkeleton />;

  const data = result.data;
  const flat = cats.data?.flat ?? [];

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 md:px-6 md:py-14">
      <header className="mb-10">
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          {params.incredibleOffers
            ? "شگفت‌انگیزها"
            : params.brand
              ? `برند ${params.brand}`
              : params.query
                ? `نتایج «${params.query}»`
                : params.category
                  ? flat.find((c) => c.slug === params.category)?.title ||
                    "محصولات"
                  : "همه محصولات"}
        </h1>
        <p className="mt-2 text-mist">
          {data ? formatCount(data.total) : "0"} کالا
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <div className="hidden lg:block">
          <Filters
            categories={flat}
            params={params}
            onChange={apply}
            total={data?.total ?? 0}
          />
        </div>

        <div>
          <div className="mb-5 flex flex-wrap gap-2 lg:hidden">
            <label className="flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(params.inStockOnly)}
                onChange={(e) =>
                  apply({ ...params, inStockOnly: e.target.checked, page: 1 })
                }
              />
              فقط موجود
            </label>
            <select
              value={params.sort || "newest"}
              onChange={(e) =>
                apply({
                  ...params,
                  sort: e.target.value as SearchParams["sort"],
                  page: 1,
                })
              }
              className="rounded-full border border-line bg-panel px-3 py-2 text-sm"
            >
              <option value="newest">جدیدترین</option>
              <option value="price-asc">ارزان‌ترین</option>
              <option value="price-desc">گران‌ترین</option>
            </select>
          </div>

          {!data?.products.length ? (
            <div className="rounded-3xl border border-line bg-panel p-12 text-center text-mist">
              محصولی یافت نشد.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {data.products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {data && data.totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-3">
              <Button
                variant="ghost"
                disabled={data.page <= 1}
                onClick={() => apply({ ...params, page: data.page - 1 })}
              >
                قبلی
              </Button>
              <span className="text-sm text-mist">
                {formatCount(data.page)} / {formatCount(data.totalPages)}
              </span>
              <Button
                variant="ghost"
                disabled={data.page >= data.totalPages}
                onClick={() => apply({ ...params, page: data.page + 1 })}
              >
                بعدی
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
