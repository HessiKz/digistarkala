import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BannerPalette } from "@/lib/types";

export type ColorMode = "light" | "dark";

export type DesignVariant = "v1" | "v2" | "v3" | "v4";

export interface VariantMeta {
  id: DesignVariant;
  label: string;
  name: string;
  swatchLight: string;
  swatchDark: string;
  accent: string;
}

// 4 skill-grounded design systems (ui-ux-pro-max generated)
export const VARIANTS: VariantMeta[] = [
  {
    id: "v1",
    label: "اصلی",
    name: "Original Glass",
    swatchLight: "#f6f4f1",
    swatchDark: "#0a0b0d",
    accent: "#d45324",
  },
  {
    id: "v2",
    label: "مجله",
    name: "Editorial Storytelling",
    swatchLight: "#fafafa",
    swatchDark: "#09090b",
    accent: "#ec4899",
  },
  {
    id: "v3",
    label: "بروتال",
    name: "Brutalist Portfolio Grid",
    swatchLight: "#f8fafc",
    swatchDark: "#0a0a0a",
    accent: "#f97316",
  },
  {
    id: "v4",
    label: "نئون",
    name: "Cyber Retro-Futurism",
    swatchLight: "#0f0f23",
    swatchDark: "#07071a",
    accent: "#7c3aed",
  },
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
  // Banner palette only influences V1 (premium) brand continuity
  if (variant !== "v1" || !palette) return;
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
