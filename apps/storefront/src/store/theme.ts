import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BannerPalette } from "@/lib/types";

export type ColorMode = "light" | "dark";

interface ThemeState {
  mode: ColorMode;
  palette: BannerPalette | null;
  setMode: (mode: ColorMode) => void;
  toggleMode: () => void;
  setPalette: (palette: BannerPalette | null) => void;
  applyToDom: () => void;
}

function writeCssVars(palette: BannerPalette | null, mode: ColorMode) {
  const root = document.documentElement;
  root.setAttribute("data-theme", mode);
  if (!palette) return;
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
      palette: null,
      setMode: (mode) => {
        set({ mode });
        writeCssVars(get().palette, mode);
      },
      toggleMode: () => {
        const mode = get().mode === "dark" ? "light" : "dark";
        get().setMode(mode);
      },
      setPalette: (palette) => {
        set({ palette });
        writeCssVars(palette, get().mode);
      },
      applyToDom: () => {
        writeCssVars(get().palette, get().mode);
      },
    }),
    {
      name: "dsk-theme-v1",
      partialize: (s) => ({ mode: s.mode }),
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
      return;
    }
    const parsed = JSON.parse(raw) as { state?: { mode?: ColorMode } };
    const mode = parsed.state?.mode === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", mode);
  } catch {
    document.documentElement.setAttribute("data-theme", "light");
  }
}
