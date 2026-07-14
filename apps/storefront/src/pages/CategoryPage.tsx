import { useParams, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { searchProducts, getCategories } from "@/api/catalog";
import { ProductCard } from "@/components/ProductCard";
import { PageSkeleton } from "@/components/Skeleton";
import { formatCount } from "@/lib/format";

export function CategoryPage() {
  const { slug = "" } = useParams();
  const decoded = decodeURIComponent(slug);

  const cats = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const result = useQuery({
    queryKey: ["category", decoded],
    queryFn: () =>
      searchProducts({ category: decoded, pageSize: 100, sort: "newest" }),
    enabled: Boolean(decoded),
  });

  if (!decoded) return <Navigate to="/products" replace />;
  if (result.isLoading || cats.isLoading) return <PageSkeleton />;

  const title =
    cats.data?.flat.find((c) => c.slug === decoded)?.title || decoded;

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 md:px-6 md:py-14">
      <header className="mb-10">
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-mist">
          {formatCount(result.data?.total ?? 0)} کالا در این دسته
        </p>
      </header>
      {!result.data?.products.length ? (
        <div className="rounded-3xl border border-line bg-panel p-12 text-center text-mist">
          کالایی در این دسته نیست.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {result.data.products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
