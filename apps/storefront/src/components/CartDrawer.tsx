import { Link } from "react-router-dom";
import { X, Minus, Plus, Trash } from "@phosphor-icons/react";
import { useCartStore } from "@/store/cart";
import { formatPrice, productPath } from "@/lib/format";
import { Button } from "./Button";

export function CartDrawer() {
  const open = useCartStore((s) => s.drawerOpen);
  const setOpen = useCartStore((s) => s.setDrawerOpen);
  const items = useCartStore((s) => s.items);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.subtotal());

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-start">
      <button
        type="button"
        className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
        aria-label="بستن سبد"
        onClick={() => setOpen(false)}
      />
      <aside className="relative z-10 flex h-full w-full max-w-md flex-col border-e border-line bg-ink-soft shadow-2xl">
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-lg font-semibold">سبد خرید</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 hover:bg-white/10"
            aria-label="بستن"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-mist">
              <p>سبد شما خالی است</p>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                ادامه خرید
              </Button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.productId}
                  className="flex gap-3 rounded-2xl border border-line bg-panel p-3"
                >
                  <Link
                    to={productPath({ id: item.productId, slug: item.slug })}
                    onClick={() => setOpen(false)}
                    className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-ink"
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <Link
                      to={productPath({ id: item.productId, slug: item.slug })}
                      onClick={() => setOpen(false)}
                      className="line-clamp-2 text-sm font-medium"
                    >
                      {item.title}
                    </Link>
                    <p className="text-sm text-accent">
                      {formatPrice(item.price)}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 rounded-full border border-line bg-ink/40 p-0.5">
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10"
                          onClick={() =>
                            updateQty(item.productId, item.qty - 1)
                          }
                          aria-label="کاهش"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center text-sm">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10"
                          onClick={() =>
                            updateQty(item.productId, item.qty + 1)
                          }
                          aria-label="افزایش"
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
          )}
        </div>

        {items.length > 0 && (
          <footer className="border-t border-line px-5 py-5">
            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="text-mist">جمع جزء</span>
              <span className="font-display text-base font-semibold">
                {formatPrice(subtotal)}
              </span>
            </div>
            <p className="mb-4 text-xs leading-relaxed text-mist">
              این نسخه نمایشی است. سبد روی دستگاه شما ذخیره می‌شود و به درگاه
              پرداخت متصل نیست.
            </p>
            <div className="flex flex-col gap-2">
              <Link to="/cart" onClick={() => setOpen(false)}>
                <Button className="w-full justify-center" icon>
                  مشاهده سبد
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="w-full justify-center"
                onClick={() => setOpen(false)}
              >
                ادامه خرید
              </Button>
            </div>
          </footer>
        )}
      </aside>
    </div>
  );
}
