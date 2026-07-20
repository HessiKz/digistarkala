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

// motion-design skill: choreography matches each design language's personality
const MOTION: Record<DesignVariant, VariantMotion> = {
  // V1 Premium (Liquid Glass): cinematic, fluid 400-600ms curves, heavy lift
  v1: { ease: "power3.out", duration: 1.1, stagger: 0.12, y: 48, spring: { stiffness: 70, damping: 16 } },
  // V2 Editorial (Storytelling): slow, elegant, deliberate reveal
  v2: { ease: "power2.out", duration: 1.3, stagger: 0.14, y: 40, spring: { stiffness: 80, damping: 18 } },
  // V3 Brutalist (Portfolio Grid): instant-ish, tight, 200-300ms
  v3: { ease: "power4.out", duration: 0.45, stagger: 0.03, y: 14, spring: { stiffness: 160, damping: 20 } },
  // V4 Cyber (Retro-Futurism): snappy, arcade, kinetic
  v4: { ease: "power4.out", duration: 0.6, stagger: 0.05, y: 22, spring: { stiffness: 170, damping: 16 } },
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
