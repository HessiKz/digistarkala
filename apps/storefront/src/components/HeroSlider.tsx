import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import type { SliderSlide } from "@/lib/types";
import { useThemeStore } from "@/store/theme";
import { Button } from "./Button";

function mapInternalUrl(url: string): string {
  if (!url) return "/products";
  if (url.startsWith("http")) {
    try {
      const u = new URL(url);
      return u.pathname + u.search;
    } catch {
      return "/products";
    }
  }
  if (url.startsWith("/products")) return url;
  if (url.includes("products")) return "/products";
  return "/products";
}

export function HeroSlider({ slides }: { slides: SliderSlide[] }) {
  const [index, setIndex] = useState(0);
  const setPalette = useThemeStore((s) => s.setPalette);
  const logoPalette = useThemeStore((s) => s.palette);
  const timer = useRef<number | null>(null);
  const list = slides.length ? slides : [];

  useEffect(() => {
    if (!list.length) return;
    const slide = list[index];
    if (slide?.palette) setPalette(slide.palette);
  }, [index, list, setPalette]);

  useEffect(() => {
    if (list.length < 2) return;
    timer.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % list.length);
    }, 5500);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [list.length]);

  // restore logo palette when leaving homepage unmount
  useEffect(() => {
    return () => {
      // keep last banner palette site-wide is intentional for brand continuity
      void logoPalette;
    };
  }, [logoPalette]);

  if (!list.length) return null;
  const current = list[index];

  function go(delta: number) {
    setIndex((i) => (i + delta + list.length) % list.length);
    if (timer.current) window.clearInterval(timer.current);
  }

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative min-h-[min(88dvh,820px)] w-full">
        {list.map((slide, i) => {
          const active = i === index;
          return (
            <div
              key={slide.id}
              className={[
                "absolute inset-0 transition-opacity duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
                active ? "opacity-100 z-[1]" : "opacity-0 z-0 pointer-events-none",
              ].join(" ")}
              aria-hidden={!active}
            >
              <picture>
                {slide.mobileImage && (
                  <source media="(max-width: 768px)" srcSet={slide.mobileImage} />
                )}
                <img
                  src={slide.image || ""}
                  alt={slide.title}
                  className={[
                    "h-full w-full object-cover transition-transform duration-[6s] ease-out",
                    active ? "scale-100" : "scale-105",
                  ].join(" ")}
                  fetchPriority={i === 0 ? "high" : "low"}
                />
              </picture>
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-ink)] via-[color-mix(in_oklab,var(--surface-ink)_45%,transparent)] to-[color-mix(in_oklab,var(--surface-ink)_20%,transparent)]" />
              <div
                className="absolute inset-0 opacity-50"
                style={{
                  background: `radial-gradient(ellipse 70% 60% at 70% 40%, ${slide.palette?.glow || "transparent"}, transparent 70%)`,
                }}
              />
            </div>
          );
        })}

        <div className="relative z-10 mx-auto flex min-h-[min(88dvh,820px)] max-w-[1400px] flex-col justify-end px-4 pb-16 pt-28 md:px-6 md:pb-20">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex rounded-full border border-line bg-[color-mix(in_oklab,var(--surface-ink)_50%,transparent)] px-3 py-1 text-[11px] font-medium text-accent backdrop-blur-md">
              دیجی استار کالا
            </p>
            <h1 className="font-display max-w-5xl text-balance text-[clamp(2.2rem,5vw,4.25rem)] font-bold leading-[1.1] tracking-tight text-snow drop-shadow-sm">
              {current.title}
            </h1>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={mapInternalUrl(current.url)}>
                <Button icon>مشاهده</Button>
              </Link>
              <Link to="/products">
                <Button variant="ghost">همه محصولات</Button>
              </Link>
            </div>
          </div>

          <div className="mt-10 flex items-center gap-3">
            <button
              type="button"
              onClick={() => go(-1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-[color-mix(in_oklab,var(--surface-ink)_55%,transparent)] backdrop-blur-md hover:border-accent"
              aria-label="اسلاید قبلی"
            >
              <CaretRight size={18} weight="bold" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-[color-mix(in_oklab,var(--surface-ink)_55%,transparent)] backdrop-blur-md hover:border-accent"
              aria-label="اسلاید بعدی"
            >
              <CaretLeft size={18} weight="bold" />
            </button>
            <div className="ms-2 flex gap-2">
              {list.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`اسلاید ${i + 1}`}
                  className={[
                    "h-1.5 rounded-full transition-all duration-500",
                    i === index
                      ? "w-8 bg-accent"
                      : "w-3 bg-[color-mix(in_oklab,var(--surface-snow)_35%,transparent)]",
                  ].join(" ")}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
