import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProduct, getRelated } from "@/api/catalog";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/Button";
import { PageSkeleton } from "@/components/Skeleton";
import { formatPrice, categoryLeaf, categoryPath } from "@/lib/format";
import { useCartStore } from "@/store/cart";

export function ProductPage() {
  const { id } = useParams();
  const productId = Number(id);
  const addItem = useCartStore((s) => s.addItem);
  const [active, setActive] = useState(0);

  const productQ = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProduct(productId),
    enabled: Number.isFinite(productId),
  });

  const relatedQ = useQuery({
    queryKey: ["related", productId],
    queryFn: () => getRelated(productQ.data!),
    enabled: Boolean(productQ.data),
  });

  if (productQ.isLoading) return <PageSkeleton />;
  if (!productQ.data) {
    return (
      <div className="mx-auto max-w-xl px-4 py-32 text-center">
        <p className="mb-4 text-mist">محصول پیدا نشد.</p>
        <Link to="/products">
          <Button variant="ghost">بازگشت به فروشگاه</Button>
        </Link>
      </div>
    );
  }

  const product = productQ.data;
  const images = product.images.length ? product.images : [];
  const img = images[active] || images[0];
  const canBuy = product.stock === true && product.priceNumber != null;

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 md:px-6 md:py-14">
      <div className="mb-6 text-sm text-mist">
        <Link to="/" className="hover:text-accent">
          خانه
        </Link>
        <span className="mx-2 opacity-40">/</span>
        {product.categorySlug && (
          <>
            <Link
              to={categoryPath(product.categorySlug)}
              className="hover:text-accent"
            >
              {categoryLeaf(product.category)}
            </Link>
            <span className="mx-2 opacity-40">/</span>
          </>
        )}
        <span className="text-fog">{product.title}</span>
      </div>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <div className="double-bezel">
            <div className="double-bezel-inner aspect-square bg-ink-soft">
              {img ? (
                <img
                  src={img}
                  alt={product.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-mist">
                  بدون تصویر
                </div>
              )}
            </div>
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
              {images.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  onClick={() => setActive(i)}
                  className={[
                    "h-16 w-16 shrink-0 overflow-hidden rounded-xl border",
                    i === active ? "border-accent" : "border-line",
                  ].join(" ")}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          {product.category && (
            <p className="mb-3 text-sm text-mist">
              {categoryLeaf(product.category)}
            </p>
          )}
          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            {product.title}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <p className="font-display text-2xl font-semibold text-accent md:text-3xl">
              {formatPrice(product.price)}
            </p>
            <span
              className={[
                "rounded-full px-3 py-1 text-xs font-medium",
                product.stock
                  ? "bg-accent-soft text-accent"
                  : "bg-white/10 text-mist",
              ].join(" ")}
            >
              {product.stock ? "موجود در انبار" : "ناموجود"}
            </span>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              icon
              disabled={!canBuy}
              onClick={() => addItem(product)}
            >
              افزودن به سبد
            </Button>
            <Link to="/cart">
              <Button variant="ghost">مشاهده سبد</Button>
            </Link>
          </div>

          {product.description && (
            <div className="mt-12 border-t border-line pt-8">
              <h2 className="mb-4 text-lg font-semibold">توضیحات</h2>
              <div
                className="prose-product"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          )}
        </div>
      </div>

      {relatedQ.data && relatedQ.data.length > 0 && (
        <section className="mt-24 md:mt-32">
          <h2 className="mb-8 font-display text-2xl font-bold md:text-3xl">
            محصولات مشابه
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {relatedQ.data.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
