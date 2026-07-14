import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getBrand } from "@/api/catalog";
import { getMenus, toAppPath, isExternal } from "@/api/content";
import type { MenuItem } from "@/lib/content-types";

function FooterLink({ item }: { item: MenuItem }) {
  const href = toAppPath(item.link);
  if (!href || href === "#") {
    return <span className="text-mist">{item.title}</span>;
  }
  if (isExternal(href)) {
    return (
      <a href={href} className="hover:text-accent" target="_blank" rel="noreferrer">
        {item.title}
      </a>
    );
  }
  return (
    <Link to={href} className="hover:text-accent">
      {item.title}
    </Link>
  );
}

export function Footer() {
  const { data: brand } = useQuery({ queryKey: ["brand"], queryFn: getBrand });
  const { data: menus } = useQuery({ queryKey: ["menus"], queryFn: getMenus });
  const logo = brand?.logo.footer || brand?.logo.header;
  const about = brand?.footerAbout;
  const contacts = brand?.contacts;
  const footerGroups = menus?.footer || [];

  return (
    <footer className="border-t border-line bg-ink-soft">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-16 md:grid-cols-12 md:px-6 md:py-20">
        <div className="md:col-span-4">
          {logo ? (
            <img
              src={logo}
              alt={brand?.name || "دیجی استار کالا"}
              className="logo-mark mb-5 h-12 w-auto max-w-[200px] object-contain"
            />
          ) : (
            <p className="mb-4 font-semibold">{brand?.name || "دیجی استار کالا"}</p>
          )}
          {about?.body ? (
            <div
              className="max-w-md text-sm leading-relaxed text-mist prose-product"
              dangerouslySetInnerHTML={{
                __html:
                  about.body.slice(0, 420) +
                  (about.body.length > 420 ? "…" : ""),
              }}
            />
          ) : (
            <p className="max-w-sm text-sm leading-relaxed text-mist">
              فروشگاه دیجی استار کالا
            </p>
          )}
        </div>

        {footerGroups.length > 0
          ? footerGroups.map((group) => (
              <div key={group.id ?? group.title} className="md:col-span-2">
                <p className="mb-3 text-sm font-semibold text-snow">
                  {group.title}
                </p>
                <ul className="space-y-2 text-sm text-mist">
                  {(group.children || []).map((item) => (
                    <li key={item.id ?? item.title}>
                      <FooterLink item={item} />
                    </li>
                  ))}
                </ul>
              </div>
            ))
          : (
            <div className="md:col-span-4">
              <p className="mb-3 text-sm font-semibold text-snow">دسترسی</p>
              <ul className="space-y-2 text-sm text-mist">
                <li>
                  <Link to="/products" className="hover:text-accent">
                    محصولات
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-accent">
                    درباره ما
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-accent">
                    تماس
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="hover:text-accent">
                    وبلاگ
                  </Link>
                </li>
              </ul>
            </div>
          )}

        <div className="md:col-span-2">
          <p className="mb-3 text-sm font-semibold text-snow">تماس</p>
          <ul className="space-y-1 text-sm text-mist">
            {contacts?.phone?.map((p) => (
              <li key={p}>
                <a href={`tel:${p}`} className="hover:text-accent" dir="ltr">
                  {p}
                </a>
              </li>
            ))}
            {contacts?.mobile?.map((p) => (
              <li key={p}>
                <a href={`tel:${p}`} className="hover:text-accent" dir="ltr">
                  {p}
                </a>
              </li>
            ))}
            {contacts?.email && (
              <li>
                <a
                  href={`mailto:${contacts.email}`}
                  className="hover:text-accent"
                >
                  {contacts.email}
                </a>
              </li>
            )}
            {contacts?.address && <li>{contacts.address}</li>}
          </ul>
          {brand?.social && brand.social.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-3">
              {brand.social.map((s) => (
                <a
                  key={s.id}
                  href={s.link}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-line bg-panel p-1.5 hover:border-accent"
                  title={s.title}
                >
                  {s.logo ? (
                    <img
                      src={s.logo}
                      alt={s.title}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs">{s.title.slice(0, 2)}</span>
                  )}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {(brand?.guarantees?.length || brand?.namads?.length) && (
        <div className="border-t border-line">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-center gap-6 px-4 py-8 md:justify-between md:px-6">
            <div className="flex flex-wrap justify-center gap-6">
              {brand?.guarantees?.map((g) => (
                <div
                  key={g.title}
                  className="flex items-center gap-2 text-xs text-mist"
                >
                  {g.logo && (
                    <img src={g.logo} alt="" className="h-8 w-8 object-contain" />
                  )}
                  <span>{g.title}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-4">
              {brand?.namads?.map((n) =>
                n.image ? (
                  <img
                    key={n.id}
                    src={n.image}
                    alt={n.name}
                    className="h-14 w-14 object-contain opacity-90"
                  />
                ) : null
              )}
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-line px-4 py-5 text-center text-xs text-mist">
        redesign demo · full site map · local cart
      </div>
    </footer>
  );
}
