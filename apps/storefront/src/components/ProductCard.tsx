import { Link } from "react-router-dom";
import { ShoppingCartSimple } from "@phosphor-icons/react";
import type { Product } from "@/lib/types";
import { formatPrice, productPath, categoryLeaf } from "@/lib/format";
import { useCartStore } from "@/store/cart";

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const img = product.images[0];
  const inStock = product.stock === true;

  return (
    <article className="double-bezel group h-full" data-reveal>
      <div className="double-bezel-inner flex h-full flex-col">
        <Link
          to={productPath(product)}
          className="relative block aspect-[4/3] overflow-hidden bg-ink-soft"
        >
          {img ? (
            <img
              src={img}
              alt={product.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-mist text-sm">
              بدون تصویر
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent opacity-80" />
          <span
            className={[
              "absolute top-3 start-3 rounded-full px-2.5 py-1 text-[11px] font-medium",
              inStock
                ? "bg-accent-soft text-accent"
                : "bg-white/10 text-mist",
            ].join(" ")}
          >
            {inStock ? "موجود" : "ناموجود"}
          </span>
        </Link>

        <div className="flex flex-1 flex-col gap-3 p-4 md:p-5">
          {product.category && (
            <p className="text-[11px] text-mist">{categoryLeaf(product.category)}</p>
          )}
          <Link to={productPath(product)} className="flex-1">
            <h3 className="text-[15px] font-semibold leading-snug text-snow line-clamp-2 transition-colors duration-300 group-hover:text-accent">
              {product.title}
            </h3>
          </Link>
          <div className="mt-auto flex items-center justify-between gap-3">
            <p className="font-display text-base font-semibold tracking-tight text-snow">
              {formatPrice(product.price)}
            </p>
            <button
              type="button"
              disabled={!inStock || product.priceNumber == null}
              onClick={() => addItem(product)}
              aria-label="افزودن به سبد"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-on-accent transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:bg-[color-mix(in_oklab,var(--surface-snow)_10%,transparent)] disabled:text-mist"
            >
              <ShoppingCartSimple size={18} weight="bold" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
