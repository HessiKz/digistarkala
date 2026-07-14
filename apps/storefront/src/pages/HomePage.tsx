import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getHomeData } from "@/api/catalog";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/Button";
import { PageSkeleton } from "@/components/Skeleton";
import { HeroSlider } from "@/components/HeroSlider";
import { useReveal } from "@/lib/hooks";
import { categoryPath, formatCount } from "@/lib/format";
import { useThemeStore } from "@/store/theme";
import type { BannerPalette } from "@/lib/types";

function mapUrl(url?: string) {
  if (!url) return "/products";
  if (url.startsWith("/")) return url;
  try {
    if (url.startsWith("http")) {
      const u = new URL(url);
      if (u.hostname.includes("digistarkala")) {
        return u.pathname + u.search;
      }
      return url;
    }
  } catch {
    /* ignore */
  }
  return "/products";
}

export function HomePage() {
  const revealRef = useReveal<HTMLElement>([]);
  const setPalette = useThemeStore((s) => s.setPalette);

  const { data, isLoading, error } = useQuery({
    queryKey: ["home"],
    queryFn: getHomeData,
  });

  if (isLoading) return <PageSkeleton />;
  if (error || !data) {
    return (
      <div className="mx-auto max-w-xl px-4 py-32 text-center text-mist">
        خطا در بارگذاری کاتالوگ. فایل‌های data را بسازید.
      </div>
    );
  }

  const { home, featured, products, sectionProducts } = data;
  const sliders = home.sliders || [];
  const banners = home.banners || [];
  const brands = home.brands || [];
  const special = home.specialOffers?.[0];
  const specialProducts = special
    ? sectionProducts(special.productIds)
    : featured.slice(0, 8);
  const popular =
    home.productSections?.map((s) => ({
      ...s,
      items: sectionProducts(s.productIds),
    })) || [];

  const stocked = products.filter((p) => p.stock && p.priceNumber != null);
  const gridFallback =
    specialProducts.length > 0
      ? specialProducts
      : stocked.slice(0, 8).length
        ? stocked.slice(0, 8)
        : products.slice(0, 8);

  const highlights =
    home.categoryHighlights?.length > 0
      ? home.categoryHighlights
      : home.categorySections?.[0]?.items.map((c) => ({
          title: c.title,
          slug: c.slug,
          image: c.icon,
          count: c.productIds.length,
        })) || [];

  function onBannerEnter(palette?: BannerPalette) {
    if (palette) setPalette(palette);
  }

  return (
    <>
      {sliders.length > 0 ? (
        <HeroSlider slides={sliders} />
      ) : (
        <section className="mx-auto flex min-h-[70dvh] max-w-[1400px] items-center px-4 py-24">
          <h1 className="font-display text-4xl font-bold">{home.title}</h1>
        </section>
      )}

      {banners.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-4 py-8 md:px-6 md:py-10">
          {/* Equal 2x2 on md+; single column on mobile — no uneven col-spans */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            {banners.map((b) => (
              <Link
                key={String(b.id)}
                to={mapUrl(b.url)}
                onMouseEnter={() => onBannerEnter(b.palette)}
                onFocus={() => onBannerEnter(b.palette)}
                className="group relative block overflow-hidden rounded-[1.25rem] border border-line bg-panel ring-1 ring-[color-mix(in_oklab,var(--surface-snow)_4%,transparent)]"
              >
                <div className="relative aspect-[2/1] w-full overflow-hidden sm:aspect-[21/10] lg:aspect-[2.2/1]">
                  {b.image && (
                    <img
                      src={b.image}
                      alt={b.title}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                    />
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {highlights.length > 0 && (
        <section
          ref={revealRef}
          className="mx-auto max-w-[1400px] px-4 py-16 md:px-6 md:py-24"
        >
          <div className="mb-10" data-reveal>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              {home.categorySections?.[0]?.title || "دسته‌بندی محصولات"}
            </h2>
            <p className="mt-2 max-w-lg text-mist">
              {home.categorySections?.[0]?.description ||
                "جدیدترین محصولات فروشگاه"}
            </p>
          </div>
          <div className="grid auto-rows-[minmax(140px,auto)] grid-cols-2 gap-3 grid-flow-dense md:grid-cols-4 md:gap-4">
            {highlights.slice(0, 6).map((c, i) => {
              const span =
                i === 0
                  ? "col-span-2 row-span-2 min-h-[260px]"
                  : i === 1
                    ? "col-span-2"
                    : "col-span-1";
              return (
                <Link
                  key={c.slug}
                  to={categoryPath(c.slug)}
                  data-reveal
                  className={`group double-bezel ${span}`}
                >
                  <div className="double-bezel-inner relative h-full min-h-[130px] overflow-hidden">
                    {c.image ? (
                      <img
                        src={c.image}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-panel-elevated" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-ink)] via-transparent to-transparent" />
                    <div className="relative z-10 flex h-full flex-col justify-end p-4 md:p-6">
                      <p className="text-xs text-mist">
                        {formatCount(c.count)} کالا
                      </p>
                      <h3 className="text-lg font-semibold md:text-xl">
                        {c.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-[1400px] px-4 pb-20 md:px-6 md:pb-28">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              {special?.title || "پیشنهاد ویژه"}
            </h2>
            <p className="mt-2 text-mist">
              {special?.description || "منتخب از کاتالوگ"}
            </p>
          </div>
          <Link to={mapUrl(special?.url) || "/products"}>
            <Button variant="ghost" icon>
              مشاهده همه
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {gridFallback.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {popular.map((sec) =>
        sec.items.length ? (
          <section
            key={sec.id}
            className="mx-auto max-w-[1400px] px-4 pb-20 md:px-6 md:pb-28"
          >
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold md:text-3xl">
                  {sec.title}
                </h2>
                {sec.description && (
                  <p className="mt-1 text-sm text-mist">{sec.description}</p>
                )}
              </div>
              <Link to={mapUrl(sec.url)}>
                <Button variant="ghost">بیشتر</Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {sec.items.slice(0, 8).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        ) : null
      )}

      {brands.length > 0 && (
        <section className="border-y border-line bg-panel/40 py-12">
          <div className="mx-auto max-w-[1400px] px-4 md:px-6">
            <h2 className="mb-8 text-center font-display text-2xl font-bold">
              محبوب‌ترین برندها
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
              {brands.map((b) => (
                <Link
                  key={b.id}
                  to={mapUrl(b.uri)}
                  className="flex h-16 w-28 items-center justify-center rounded-2xl border border-line bg-panel p-3 transition-colors hover:border-accent md:h-20 md:w-32"
                  title={b.name}
                >
                  {b.logo ? (
                    <img
                      src={b.logo}
                      alt={b.name}
                      className="max-h-full max-w-full object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-xs text-mist">{b.name}</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {home.guarantees && home.guarantees.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-4 py-16 md:px-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {home.guarantees.map((g) => (
              <div
                key={g.title}
                className="double-bezel"
              >
                <div className="double-bezel-inner flex flex-col items-center gap-3 p-5 text-center">
                  {g.logo && (
                    <img src={g.logo} alt="" className="h-10 w-10 object-contain" />
                  )}
                  <p className="text-sm font-semibold">{g.title}</p>
                  {g.description && (
                    <p className="text-xs leading-relaxed text-mist line-clamp-3">
                      {g.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {home.articles && home.articles.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-4 pb-24 md:px-6 md:pb-32">
          <h2 className="mb-8 font-display text-2xl font-bold md:text-3xl">
            آخرین مقالات
          </h2>
          <div className="grid gap-5 md:grid-cols-3">
            {home.articles.map((a) => (
              <article key={a.id} className="double-bezel">
                <div className="double-bezel-inner flex h-full flex-col">
                  {a.image && (
                    <div className="aspect-[16/10] overflow-hidden">
                      <img
                        src={a.image}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <h3 className="font-semibold leading-snug">{a.title}</h3>
                    {a.description && (
                      <p className="text-sm text-mist line-clamp-3">
                        {a.description}
                      </p>
                    )}
                    {a.uri || a.id ? (
                      <Link
                        to={
                          a.uri?.startsWith("/")
                            ? a.uri
                            : `/blog/articles/${a.id}`
                        }
                        className="mt-2 text-sm text-accent"
                      >
                        ادامه مطلب
                      </Link>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="border-t border-line bg-panel/30">
        <div className="mx-auto flex max-w-[1400px] flex-col items-start gap-6 px-4 py-20 md:flex-row md:items-center md:justify-between md:px-6 md:py-28">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-5xl">
              خرید از دیجی استار کالا
            </h2>
            <p className="mt-4 text-mist">
              کاتالوگ کامل، بنرها و برندهای رسمی فروشگاه در یک تجربه بازطراحی‌شده.
            </p>
          </div>
          <Link to="/products">
            <Button icon>شروع خرید</Button>
          </Link>
        </div>
      </section>
    </>
  );
}
