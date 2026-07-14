import { Link } from "react-router-dom";
import { Minus, Plus, Trash } from "@phosphor-icons/react";
import { useCartStore } from "@/store/cart";
import { formatPrice, productPath } from "@/lib/format";
import { Button } from "@/components/Button";

export function CartPage() {
  const items = useCartStore((s) => s.items);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const clear = useCartStore((s) => s.clear);
  const subtotal = useCartStore((s) => s.subtotal());

  if (!items.length) {
    return (
      <div className="mx-auto flex min-h-[60dvh] max-w-lg flex-col items-center justify-center px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold">سبد خالی است</h1>
        <p className="mt-3 text-mist">محصولی اضافه کنید تا اینجا ببینید.</p>
        <Link to="/products" className="mt-8">
          <Button icon>مشاهده محصولات</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-10 md:px-6 md:py-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          سبد خرید
        </h1>
        <button
          type="button"
          onClick={clear}
          className="text-sm text-mist hover:text-danger"
        >
          پاک کردن سبد
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <ul className="space-y-4">
          {items.map((item) => (
            <li
              key={item.productId}
              className="double-bezel"
            >
              <div className="double-bezel-inner flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <Link
                  to={productPath({ id: item.productId, slug: item.slug })}
                  className="h-28 w-full shrink-0 overflow-hidden rounded-2xl bg-ink sm:h-24 sm:w-24"
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    to={productPath({ id: item.productId, slug: item.slug })}
                    className="font-medium line-clamp-2"
                  >
                    {item.title}
                  </Link>
                  <p className="mt-1 text-sm text-accent">
                    {formatPrice(item.price)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 rounded-full border border-line p-0.5">
                    <button
                      type="button"
                      className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10"
                      onClick={() => updateQty(item.productId, item.qty - 1)}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-7 text-center text-sm">{item.qty}</span>
                    <button
                      type="button"
                      className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10"
                      onClick={() => updateQty(item.productId, item.qty + 1)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="text-mist hover:text-danger"
                    aria-label="حذف"
                  >
                    <Trash size={18} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="double-bezel h-fit lg:sticky lg:top-28">
          <div className="double-bezel-inner space-y-4 p-5">
            <h2 className="font-semibold">خلاصه سفارش</h2>
            <div className="flex justify-between text-sm">
              <span className="text-mist">جمع جزء</span>
              <span className="font-display font-semibold">
                {formatPrice(subtotal)}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-mist">
              پرداخت آنلاین در این نسخه دمو فعال نیست. سبد فقط روی همین مرورگر
              ذخیره می‌شود.
            </p>
            <Button className="w-full justify-center" disabled>
              پرداخت (غیرفعال)
            </Button>
            <Link to="/products" className="block">
              <Button variant="ghost" className="w-full justify-center">
                ادامه خرید
              </Button>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
