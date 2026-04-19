"use client";

import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { useVisualEffectsQuality } from "@/components/background/useVisualEffectsQuality";

type StarConfig = {
  id: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
};

function createStars(count: number, minSize: number, maxSize: number, minOpacity: number, maxOpacity: number, seedPrefix: string): StarConfig[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `${seedPrefix}-${index}`,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: minSize + Math.random() * (maxSize - minSize),
    opacity: minOpacity + Math.random() * (maxOpacity - minOpacity),
  }));
}

export function SpaceVoidBackground() {
  const { effectiveQuality } = useVisualEffectsQuality();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const layerOneRef = useRef<HTMLDivElement | null>(null);
  const layerTwoRef = useRef<HTMLDivElement | null>(null);
  const layerThreeRef = useRef<HTMLDivElement | null>(null);
  const nebulaRefs = useRef<Array<HTMLDivElement | null>>([]);
  const isInViewRef = useRef(true);
  const isPageVisibleRef = useRef(true);
  const activeAnimationsRef = useRef<Array<{ pause: () => void; resume: () => void }>>([]);
  const rootVisibleClassRef = useRef(false);

  const starsSmall = useMemo(() => {
    if (effectiveQuality === "off") return [];
    if (effectiveQuality === "low") return createStars(34, 0.6, 1.2, 0.14, 0.28, "small");
    if (effectiveQuality === "medium") return createStars(90, 0.6, 1.5, 0.18, 0.42, "small");
    return createStars(130, 0.6, 1.8, 0.2, 0.5, "small");
  }, [effectiveQuality]);
  const starsMedium = useMemo(() => {
    if (effectiveQuality === "off") return [];
    if (effectiveQuality === "low") return createStars(16, 1.2, 2, 0.28, 0.48, "medium");
    if (effectiveQuality === "medium") return createStars(55, 1.2, 2.4, 0.35, 0.65, "medium");
    return createStars(80, 1.2, 2.6, 0.38, 0.72, "medium");
  }, [effectiveQuality]);
  const starsLarge = useMemo(() => {
    if (effectiveQuality === "off") return [];
    if (effectiveQuality === "low") return createStars(6, 1.8, 2.8, 0.45, 0.72, "large");
    if (effectiveQuality === "medium") return createStars(20, 2, 3.2, 0.6, 0.92, "large");
    return createStars(32, 2.2, 3.4, 0.64, 0.96, "large");
  }, [effectiveQuality]);

  useEffect(() => {
    const rootElement = rootRef.current;
    if (!rootElement || effectiveQuality === "off") {
      return;
    }
    const shouldReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches || effectiveQuality === "low";
    const updateMotionState = () => {
      const shouldPause = !isInViewRef.current || !isPageVisibleRef.current;
      activeAnimationsRef.current.forEach((animation) => {
        if (shouldPause) {
          animation.pause();
          return;
        }
        animation.resume();
      });
    };
    isPageVisibleRef.current = document.visibilityState === "visible";
    updateMotionState();

    const context = gsap.context(() => {
      const animations: Array<{ pause: () => void; resume: () => void }> = [];
      const layers = [
        { element: layerOneRef.current, distance: effectiveQuality === "high" ? 30 : 22, duration: effectiveQuality === "high" ? 50 : 62 },
        { element: layerTwoRef.current, distance: effectiveQuality === "high" ? 44 : 34, duration: effectiveQuality === "high" ? 64 : 82 },
        { element: layerThreeRef.current, distance: effectiveQuality === "high" ? 56 : 44, duration: effectiveQuality === "high" ? 88 : 108 },
      ];

      layers.forEach((layer, index) => {
        if (!layer.element) {
          return;
        }

        gsap.set(layer.element, { willChange: "transform", force3D: true });
        if (shouldReduceMotion) {
          return;
        }

        const tween = gsap.to(layer.element, {
          y: index % 2 === 0 ? -layer.distance : layer.distance,
          x: index % 2 === 0 ? 8 : -6,
          duration: layer.duration,
          ease: "none",
          repeat: -1,
          yoyo: true,
          force3D: true,
        });
        animations.push(tween);
      });

      const stars = gsap.utils.toArray<HTMLElement>(".void-star", rootRef.current);
      stars.forEach((star) => {
        gsap.set(star, { willChange: "opacity", force3D: true });
        if (shouldReduceMotion) {
          return;
        }

        const tween = gsap.to(star, {
          opacity: gsap.utils.random(0.2, 1),
          duration: gsap.utils.random(1.8, effectiveQuality === "high" ? 4.4 : 5.4),
          delay: gsap.utils.random(0, 4),
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          force3D: true,
        });
        animations.push(tween);
      });

      nebulaRefs.current.forEach((nebula, index) => {
        if (!nebula) {
          return;
        }

        gsap.set(nebula, { willChange: "transform", force3D: true });
        if (shouldReduceMotion) {
          return;
        }

        const tween = gsap.to(nebula, {
          x: index === 1 ? -38 : 34,
          y: index === 2 ? -28 : 24,
          rotate: index % 2 === 0 ? 10 : -12,
          duration: 95 + index * 22,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          force3D: true,
        });
        animations.push(tween);
      });

      activeAnimationsRef.current = animations;
      updateMotionState();
    }, rootRef);

    const handleVisibilityChange = () => {
      isPageVisibleRef.current = document.visibilityState === "visible";
      updateMotionState();
    };

    const mainElement = document.querySelector("main");
    let observer: IntersectionObserver | null = null;

    if (mainElement) {
      observer = new IntersectionObserver(
        ([entry]) => {
          isInViewRef.current = entry.isIntersecting;
          if (rootVisibleClassRef.current !== entry.isIntersecting) {
            rootElement.classList.toggle("space-void-bg--offscreen", !entry.isIntersecting);
            rootVisibleClassRef.current = entry.isIntersecting;
          }
          updateMotionState();
        },
        { threshold: 0.05 },
      );

      observer.observe(mainElement);
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      activeAnimationsRef.current = [];
      context.revert();
    };
  }, [effectiveQuality]);

  useEffect(() => {
    const rootElement = rootRef.current;
    if (!rootElement) {
      return;
    }

    const updateNebulaIntensity = () => {
      const resultsVisible = Boolean(document.querySelector("section .k-module-label"));
      rootElement.classList.toggle("space-void-bg--low-intensity", resultsVisible);
    };

    updateNebulaIntensity();

    const observer = new MutationObserver(() => {
      updateNebulaIntensity();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  if (effectiveQuality === "off") {
    return null;
  }

  return (
    <div ref={rootRef} aria-hidden="true" className="space-void-bg pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="space-void-nebula nebula-one"
        ref={(element) => {
          nebulaRefs.current[0] = element;
        }}
      />
      <div
        className="space-void-nebula nebula-two"
        ref={(element) => {
          nebulaRefs.current[1] = element;
        }}
      />
      <div
        className="space-void-nebula nebula-three"
        ref={(element) => {
          nebulaRefs.current[2] = element;
        }}
      />

      <div ref={layerOneRef} className="space-void-layer">
        {starsSmall.map((star) => (
          <span
            key={star.id}
            className="void-star void-star-small"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
            }}
          />
        ))}
      </div>

      <div ref={layerTwoRef} className="space-void-layer">
        {starsMedium.map((star) => (
          <span
            key={star.id}
            className="void-star void-star-medium"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
            }}
          />
        ))}
      </div>

      <div ref={layerThreeRef} className="space-void-layer">
        {starsLarge.map((star) => (
          <span
            key={star.id}
            className="void-star void-star-large"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
            }}
          />
        ))}
      </div>
    </div>
  );
}
