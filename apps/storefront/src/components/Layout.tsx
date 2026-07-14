import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { CartDrawer } from "./CartDrawer";
import { getBrand } from "@/api/catalog";
import { useThemeStore } from "@/store/theme";

export function Layout() {
  const location = useLocation();
  const isHome = location.pathname === "/" || location.pathname === "";
  const applyToDom = useThemeStore((s) => s.applyToDom);
  const setPalette = useThemeStore((s) => s.setPalette);
  const palette = useThemeStore((s) => s.palette);
  const brand = useQuery({ queryKey: ["brand"], queryFn: getBrand });

  useEffect(() => {
    applyToDom();
  }, [applyToDom]);

  useEffect(() => {
    if (!palette && brand.data?.logoPalette) {
      setPalette(brand.data.logoPalette);
    }
  }, [brand.data, palette, setPalette]);

  useEffect(() => {
    if (brand.data?.logo.favicon) {
      let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = brand.data.logo.favicon;
    }
    if (brand.data?.name) {
      document.title = brand.data.name;
    }
  }, [brand.data]);

  return (
    <div className="surface-mesh relative min-h-[100dvh]">
      <div className="grain" aria-hidden />
      <Navbar />
      <main
        className={[
          "w-full max-w-full overflow-x-hidden",
          isHome ? "pt-0" : "pt-20 md:pt-24",
        ].join(" ")}
      >
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
