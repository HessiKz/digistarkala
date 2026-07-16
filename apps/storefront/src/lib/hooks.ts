import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useThemeStore, type DesignVariant } from "@/store/theme";

gsap.registerPlugin(ScrollTrigger);

export interface VariantMotion {
  ease: string;
  duration: number;
  stagger: number;
  y: number;
  spring: { stiffness: number; damping: number };
}

const MOTION: Record<DesignVariant, VariantMotion> = {
  // V1 curated, V5 tech-minimal: subtle
  v1: { ease: "power3.out", duration: 0.75, stagger: 0.07, y: 28, spring: { stiffness: 100, damping: 20 } },
  // V2 brutalist: instant-ish, tight
  v2: { ease: "power4.out", duration: 0.5, stagger: 0.04, y: 18, spring: { stiffness: 140, damping: 22 } },
  // V3 editorial: slow, elegant
  v3: { ease: "power2.out", duration: 1.1, stagger: 0.12, y: 36, spring: { stiffness: 80, damping: 18 } },
  // V4 neumorphic: soft, calm
  v4: { ease: "power2.out", duration: 0.95, stagger: 0.09, y: 24, spring: { stiffness: 90, damping: 22 } },
  v5: { ease: "power3.out", duration: 0.8, stagger: 0.06, y: 26, spring: { stiffness: 110, damping: 22 } },
  // V6 glass: cinematic, heavy
  v6: { ease: "power3.out", duration: 1.2, stagger: 0.14, y: 48, spring: { stiffness: 70, damping: 16 } },
  // V7 cyber: snappy, arcade
  v7: { ease: "power4.out", duration: 0.6, stagger: 0.05, y: 22, spring: { stiffness: 160, damping: 18 } },
};

export function useVariantMotion(): VariantMotion {
  const variant = useThemeStore((s) => s.variant);
  return MOTION[variant];
}

export function useReveal<T extends HTMLElement>(deps: unknown[] = []) {
  const ref = useRef<T | null>(null);
  const motion = useVariantMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mm = gsap.matchMedia();
    mm.add(
      {
        reduceMotion: "(prefers-reduced-motion: reduce)",
        motionOk: "(prefers-reduced-motion: no-preference)",
      },
      (context) => {
        const { reduceMotion } = context.conditions as {
          reduceMotion: boolean;
        };
        if (reduceMotion) {
          gsap.set(el.querySelectorAll("[data-reveal]"), {
            opacity: 1,
            y: 0,
            clearProps: "transform",
          });
          return;
        }
        const targets = el.querySelectorAll("[data-reveal]");
        gsap.fromTo(
          targets,
          { opacity: 0, y: motion.y },
          {
            opacity: 1,
            y: 0,
            duration: motion.duration,
            stagger: motion.stagger,
            ease: motion.ease,
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              once: true,
            },
          }
        );
      }
    );

    return () => {
      mm.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [motion, ...deps]);

  return ref;
}

export function useHeroMotion(scopeRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = scopeRef.current;
    if (!root) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(
        root.querySelectorAll("[data-hero]"),
        { opacity: 0, y: 36 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 }
      );
      const img = root.querySelector("[data-hero-img]");
      if (img) {
        gsap.fromTo(
          img,
          { scale: 1.08, opacity: 0.6 },
          { scale: 1, opacity: 1, duration: 1.4, ease: "power2.out" }
        );
      }
    });
    return () => mm.revert();
  }, [scopeRef]);
}
