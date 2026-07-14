import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  MagnifyingGlass,
  ShoppingCartSimple,
  List,
  X,
  Moon,
  Sun,
  CaretDown,
} from "@phosphor-icons/react";
import { useCartStore } from "@/store/cart";
import { useUiStore } from "@/store/ui";
import { useThemeStore } from "@/store/theme";
import { getBrand } from "@/api/catalog";
import { getMenus, toAppPath, isExternal } from "@/api/content";
import { formatCount } from "@/lib/format";
import type { MenuItem } from "@/lib/content-types";

function MenuLink({
  item,
  className,
  onClick,
}: {
  item: MenuItem;
  className?: string;
  onClick?: () => void;
}) {
  const href = toAppPath(item.link);
  if (!href || href === "#") {
    return (
      <span className={className}>{item.title}</span>
    );
  }
  if (isExternal(href)) {
    return (
      <a
        href={href}
        className={className}
        target={item.newTab ? "_blank" : undefined}
        rel={item.newTab ? "noreferrer" : undefined}
        onClick={onClick}
      >
        {item.title}
      </a>
    );
  }
  return (
    <Link to={href} className={className} onClick={onClick}>
      {item.title}
    </Link>
  );
}

export function Navbar() {
  const count = useCartStore((s) => s.count());
  const setDrawer = useCartStore((s) => s.setDrawerOpen);
  const mobileOpen = useUiStore((s) => s.mobileNavOpen);
  const setMobile = useUiStore((s) => s.setMobileNavOpen);
  const mode = useThemeStore((s) => s.mode);
  const toggleMode = useThemeStore((s) => s.toggleMode);
  const [q, setQ] = useState("");
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const navigate = useNavigate();
  const brand = useQuery({ queryKey: ["brand"], queryFn: getBrand });
  const menus = useQuery({ queryKey: ["menus"], queryFn: getMenus });

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const query = q.trim();
    navigate(query ? `/products?q=${encodeURIComponent(query)}` : "/products");
    setMobile(false);
  }

  const logo = brand.data?.logo.header;
  const name = brand.data?.name || "دیجی استار کالا";
  const top = menus.data?.top || [];

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-40 px-3 pt-4 md:px-6 md:pt-5">
        <nav className="pointer-events-auto glass-pill mx-auto flex h-14 max-w-[1280px] items-center gap-2 rounded-full px-3 md:h-16 md:gap-3 md:px-5">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2 pe-1"
            onClick={() => setMobile(false)}
          >
            {logo ? (
              <img
                src={logo}
                alt={name}
                className="logo-mark h-9 w-auto max-w-[130px] object-contain md:h-10"
              />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent font-display text-sm font-bold text-on-accent">
                DS
              </span>
            )}
          </Link>

          <form
            onSubmit={onSearch}
            className="hidden min-w-0 flex-1 items-center gap-2 rounded-full border border-line px-3 py-2 lg:flex"
            style={{ background: "var(--nav-search-bg)" }}
          >
            <MagnifyingGlass size={18} className="shrink-0 text-mist" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="جستجوی محصول..."
              className="w-full bg-transparent text-sm text-snow outline-none placeholder:text-mist"
              aria-label="جستجو"
            />
          </form>

          <div className="ms-auto hidden items-center gap-0.5 xl:flex">
            {top.slice(0, 7).map((item) => {
              const hasKids = (item.children?.length || 0) > 0;
              return (
                <div
                  key={item.id ?? item.title}
                  className="relative"
                  onMouseEnter={() => hasKids && setOpenMenu(item.id ?? null)}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  <div className="flex items-center">
                    <MenuLink
                      item={item}
                      className="rounded-full px-2.5 py-2 text-[13px] text-fog transition-colors hover:bg-[color-mix(in_oklab,var(--surface-snow)_6%,transparent)] hover:text-snow whitespace-nowrap"
                    />
                    {hasKids && (
                      <CaretDown size={12} className="ms-[-4px] text-mist" />
                    )}
                  </div>
                  {hasKids && openMenu === item.id && (
                    <div className="absolute top-full start-0 z-50 min-w-[240px] max-w-[360px] pt-2">
                      <div className="max-h-[70vh] overflow-y-auto rounded-2xl border border-line bg-panel p-2 shadow-2xl">
                        {item.children!.map((child) => (
                          <div key={child.id ?? child.title} className="mb-1">
                            <MenuLink
                              item={child}
                              className="block rounded-xl px-3 py-2 text-sm font-medium hover:bg-[color-mix(in_oklab,var(--surface-snow)_6%,transparent)] hover:text-accent"
                              onClick={() => setOpenMenu(null)}
                            />
                            {(child.children?.length || 0) > 0 && (
                              <div className="ms-2 border-s border-line ps-2">
                                {child.children!.map((g) => (
                                  <MenuLink
                                    key={g.id ?? g.title}
                                    item={g}
                                    className="block rounded-lg px-2 py-1.5 text-xs text-mist hover:text-accent"
                                    onClick={() => setOpenMenu(null)}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={toggleMode}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--surface-snow)_6%,transparent)] hover:bg-[color-mix(in_oklab,var(--surface-snow)_10%,transparent)]"
            aria-label={mode === "dark" ? "حالت روشن" : "حالت تاریک"}
          >
            {mode === "dark" ? (
              <Sun size={18} weight="regular" />
            ) : (
              <Moon size={18} weight="regular" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setDrawer(true)}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--surface-snow)_6%,transparent)] hover:bg-[color-mix(in_oklab,var(--surface-snow)_10%,transparent)]"
            aria-label="سبد خرید"
          >
            <ShoppingCartSimple size={20} weight="regular" />
            {count > 0 && (
              <span className="absolute -top-1 -start-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-on-accent">
                {formatCount(count)}
              </span>
            )}
          </button>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--surface-snow)_6%,transparent)] hover:bg-[color-mix(in_oklab,var(--surface-snow)_10%,transparent)] xl:hidden"
            onClick={() => setMobile(!mobileOpen)}
            aria-label={mobileOpen ? "بستن منو" : "باز کردن منو"}
          >
            {mobileOpen ? <X size={20} /> : <List size={20} />}
          </button>
        </nav>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-30 overflow-y-auto bg-[color-mix(in_oklab,var(--surface-ink)_94%,transparent)] backdrop-blur-2xl xl:hidden">
          <div className="flex min-h-full flex-col px-5 pb-12 pt-24">
            <form
              onSubmit={onSearch}
              className="mb-6 flex items-center gap-2 rounded-full border border-line bg-panel px-4 py-3"
            >
              <MagnifyingGlass size={18} className="text-mist" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="جستجو..."
                className="w-full bg-transparent outline-none"
              />
            </form>
            <ul className="space-y-2">
              {top.map((item) => (
                <li key={item.id ?? item.title}>
                  <MobileMenuBranch
                    item={item}
                    onNavigate={() => setMobile(false)}
                  />
                </li>
              ))}
              <li>
                <Link
                  to="/cart"
                  onClick={() => setMobile(false)}
                  className="block rounded-2xl border border-line bg-panel px-5 py-4 text-lg font-medium"
                >
                  سبد خرید
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

function MobileMenuBranch({
  item,
  onNavigate,
  depth = 0,
}: {
  item: MenuItem;
  onNavigate: () => void;
  depth?: number;
}) {
  const [open, setOpen] = useState(depth === 0);
  const kids = item.children || [];
  const href = toAppPath(item.link);

  return (
    <div className={depth ? "ms-3 border-s border-line ps-3" : ""}>
      <div className="flex items-center gap-2">
        {href && href !== "#" ? (
          isExternal(href) ? (
            <a
              href={href}
              className="flex-1 rounded-2xl border border-line bg-panel px-4 py-3 font-medium"
              onClick={onNavigate}
            >
              {item.title}
            </a>
          ) : (
            <Link
              to={href}
              className="flex-1 rounded-2xl border border-line bg-panel px-4 py-3 font-medium"
              onClick={onNavigate}
            >
              {item.title}
            </Link>
          )
        ) : (
          <button
            type="button"
            className="flex-1 rounded-2xl border border-line bg-panel px-4 py-3 text-start font-medium"
            onClick={() => setOpen(!open)}
          >
            {item.title}
          </button>
        )}
        {kids.length > 0 && (
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-line"
            onClick={() => setOpen(!open)}
            aria-label="زیرمنو"
          >
            <CaretDown
              size={14}
              className={open ? "rotate-180 transition" : "transition"}
            />
          </button>
        )}
      </div>
      {open && kids.length > 0 && (
        <ul className="mt-2 space-y-2">
          {kids.map((c) => (
            <li key={c.id ?? c.title}>
              <MobileMenuBranch
                item={c}
                onNavigate={onNavigate}
                depth={depth + 1}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
