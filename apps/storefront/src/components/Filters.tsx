import type { SearchParams } from "@/lib/types";
import { formatCount } from "@/lib/format";

interface FlatCat {
  title: string;
  slug: string;
  productIds: number[];
}

interface Props {
  categories: FlatCat[];
  params: SearchParams;
  onChange: (next: SearchParams) => void;
  total: number;
}

export function Filters({ categories, params, onChange, total }: Props) {
  return (
    <aside className="double-bezel sticky top-24">
      <div className="double-bezel-inner space-y-6 p-5">
        <div>
          <p className="mb-1 text-sm font-semibold">فیلترها</p>
          <p className="text-xs text-mist">{formatCount(total)} محصول</p>
        </div>

        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={Boolean(params.inStockOnly)}
            onChange={(e) =>
              onChange({ ...params, inStockOnly: e.target.checked, page: 1 })
            }
            className="h-4 w-4 rounded border-line accent-accent"
          />
          فقط موجود
        </label>

        <div>
          <p className="mb-2 text-xs font-medium text-mist">مرتب‌سازی</p>
          <select
            value={params.sort || "newest"}
            onChange={(e) =>
              onChange({
                ...params,
                sort: e.target.value as SearchParams["sort"],
                page: 1,
              })
            }
            className="w-full rounded-xl border border-line bg-ink/50 px-3 py-2.5 text-sm outline-none focus:border-accent"
          >
            <option value="newest">جدیدترین</option>
            <option value="price-asc">ارزان‌ترین</option>
            <option value="price-desc">گران‌ترین</option>
            <option value="title">نام</option>
          </select>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-mist">دسته‌بندی</p>
          <ul className="max-h-72 space-y-1 overflow-y-auto no-scrollbar">
            <li>
              <button
                type="button"
                onClick={() =>
                  onChange({ ...params, category: undefined, page: 1 })
                }
                className={[
                  "w-full rounded-xl px-3 py-2 text-start text-sm transition-colors",
                  !params.category
                    ? "bg-accent-soft text-accent"
                    : "hover:bg-white/5 text-fog",
                ].join(" ")}
              >
                همه
              </button>
            </li>
            {categories.map((c) => (
              <li key={c.slug}>
                <button
                  type="button"
                  onClick={() =>
                    onChange({ ...params, category: c.slug, page: 1 })
                  }
                  className={[
                    "flex w-full items-center justify-between rounded-xl px-3 py-2 text-start text-sm transition-colors",
                    params.category === c.slug
                      ? "bg-accent-soft text-accent"
                      : "hover:bg-white/5 text-fog",
                  ].join(" ")}
                >
                  <span className="line-clamp-1">{c.title}</span>
                  <span className="text-xs opacity-70">
                    {formatCount(c.productIds.length)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
