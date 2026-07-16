import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useThemeStore, VARIANTS, type DesignVariant } from "@/store/theme";

function isVariant(v: string | null): v is DesignVariant {
  return !!v && VARIANTS.some((x) => x.id === v);
}

export function DesignSwitcher({ inMobile = false }: { inMobile?: boolean }) {
  const variant = useThemeStore((s) => s.variant);
  const setVariant = useThemeStore((s) => s.setVariant);
  const mode = useThemeStore((s) => s.mode);
  const [sp, setSp] = useSearchParams();

  // URL param wins on first mount (shareable links)
  useEffect(() => {
    const urlV = sp.get("design");
    if (isVariant(urlV) && urlV !== variant) {
      setVariant(urlV);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pick(id: DesignVariant) {
    setVariant(id);
    const next = new URLSearchParams(sp);
    next.set("design", id);
    setSp(next, { replace: true });
  }

  return (
    <div
      role="group"
      aria-label="انتخاب طرح"
      className={[
        "no-scrollbar flex items-center gap-1 overflow-x-auto whitespace-nowrap rounded-full border border-line p-1",
        inMobile ? "w-full" : "hidden md:flex",
      ].join(" ")}
      style={{ background: "var(--nav-search-bg)" }}
    >
      {VARIANTS.map((v) => {
        const active = v.id === variant;
        const swatch = mode === "dark" ? v.swatchDark : v.swatchLight;
        return (
          <button
            key={v.id}
            type="button"
            onClick={() => pick(v.id)}
            aria-pressed={active}
            title={v.label}
            className={[
              "flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-semibold transition-all",
              "whitespace-nowrap",
              active
                ? "bg-accent text-on-accent"
                : "text-mist hover:text-snow hover:bg-[color-mix(in_oklab,var(--surface-snow)_6%,transparent)]",
            ].join(" ")}
          >
            <span
              className="h-3 w-3 rounded-full ring-1 ring-white/20"
              style={{ background: swatch }}
            />
            {v.label}
          </button>
        );
      })}
    </div>
  );
}
