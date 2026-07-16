import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BannerPalette } from "@/lib/types";

export type ColorMode = "light" | "dark";

export type DesignVariant =
  | "v1"
  | "v2"
  | "v3"
  | "v4"
  | "v5"
  | "v6"
  | "v7";

export interface VariantMeta {
  id: DesignVariant;
  label: string;
  swatchLight: string;
  swatchDark: string;
}

export const VARIANTS: VariantMeta[] = [
  { id: "v1", label: "دیجی", swatchLight: "#f6f4f1", swatchDark: "#141218" },
  { id: "v2", label: "بروتال", swatchLight: "#fafaf7", swatchDark: "#0a0a0a" },
  { id: "v3", label: "مجله", swatchLight: "#fcf9f3", swatchDark: "#1c1917" },
  { id: "v4", label: "نرم", swatchLight: "#f4f1ef", swatchDark: "#2a2522" },
  { id: "v5", label: "مینیمال", swatchLight: "#ffffff", swatchDark: "#0b0b0d" },
  { id: "v6", label: "شیشه", swatchLight: "#0a0b0d", swatchDark: "#050505" },
  { id: "v7", label: "نئون", swatchLight: "#0a1929", swatchDark: "#050a18" },
];

interface ThemeState {
  mode: ColorMode;
  variant: DesignVariant;
  palette: BannerPalette | null;
  setMode: (mode: ColorMode) => void;
  toggleMode: () => void;
  setVariant: (variant: DesignVariant) => void;
  setPalette: (palette: BannerPalette | null) => void;
  applyToDom: () => void;
}

function writeCssVars(
  palette: BannerPalette | null,
  mode: ColorMode,
  variant: DesignVariant
) {
  const root = document.documentElement;
  root.setAttribute("data-theme", mode);
  root.setAttribute("data-variant", variant);
  if (!palette) return;
  // Brand palette overrides only apply to v1 (default) so other variants keep own identity.
  if (variant !== "v1") return;
  root.style.setProperty("--brand-accent", palette.accent);
  root.style.setProperty("--brand-accent-dim", palette.accentDim);
  root.style.setProperty("--brand-accent-soft", palette.accentSoft);
  root.style.setProperty("--brand-glow", palette.glow);
  root.style.setProperty("--brand-mesh-a", palette.meshA);
  root.style.setProperty("--brand-mesh-b", palette.meshB);
  if (mode === "light" && palette.accentLight) {
    root.style.setProperty("--brand-accent", palette.accentLight);
  }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: "light",
      variant: "v1",
      palette: null,
      setMode: (mode) => {
        set({ mode });
        writeCssVars(get().palette, mode, get().variant);
      },
      toggleMode: () => {
        const mode = get().mode === "dark" ? "light" : "dark";
        get().setMode(mode);
      },
      setVariant: (variant) => {
        set({ variant });
        writeCssVars(get().palette, get().mode, variant);
      },
      setPalette: (palette) => {
        set({ palette });
        writeCssVars(palette, get().mode, get().variant);
      },
      applyToDom: () => {
        writeCssVars(get().palette, get().mode, get().variant);
      },
    }),
    {
      name: "dsk-theme-v1",
      partialize: (s) => ({ mode: s.mode, variant: s.variant }),
      onRehydrateStorage: () => (state) => {
        state?.applyToDom();
      },
    }
  )
);

/** Call once on app boot before first paint if possible */
export function initThemeFromStorage() {
  try {
    const raw = localStorage.getItem("dsk-theme-v1");
    if (!raw) {
      document.documentElement.setAttribute("data-theme", "light");
      document.documentElement.setAttribute("data-variant", "v1");
      return;
    }
    const parsed = JSON.parse(raw) as {
      state?: { mode?: ColorMode; variant?: DesignVariant };
    };
    const mode = parsed.state?.mode === "dark" ? "dark" : "light";
    const variant = parsed.state?.variant || "v1";
    document.documentElement.setAttribute("data-theme", mode);
    document.documentElement.setAttribute("data-variant", variant);
  } catch {
    document.documentElement.setAttribute("data-theme", "light");
    document.documentElement.setAttribute("data-variant", "v1");
  }
}
