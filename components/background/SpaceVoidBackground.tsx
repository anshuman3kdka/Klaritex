"use client";

import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";

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
  const rootRef = useRef<HTMLDivElement | null>(null);
  const layerOneRef = useRef<HTMLDivElement | null>(null);
  const layerTwoRef = useRef<HTMLDivElement | null>(null);
  const layerThreeRef = useRef<HTMLDivElement | null>(null);
  const nebulaRefs = useRef<Array<HTMLDivElement | null>>([]);

  const starsSmall = useMemo(() => createStars(90, 0.6, 1.5, 0.18, 0.42, "small"), []);
  const starsMedium = useMemo(() => createStars(55, 1.2, 2.4, 0.35, 0.65, "medium"), []);
  const starsLarge = useMemo(() => createStars(20, 2, 3.2, 0.6, 0.92, "large"), []);

  useEffect(() => {
    if (!rootRef.current) {
      return;
    }
    const shouldReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const context = gsap.context(() => {
      const layers = [
        { element: layerOneRef.current, distance: 22, duration: 62 },
        { element: layerTwoRef.current, distance: 34, duration: 82 },
        { element: layerThreeRef.current, distance: 44, duration: 108 },
      ];

      layers.forEach((layer, index) => {
        if (!layer.element) {
          return;
        }

        gsap.set(layer.element, { willChange: "transform", force3D: true });
        if (shouldReduceMotion) {
          return;
        }

        gsap.to(layer.element, {
          y: index % 2 === 0 ? -layer.distance : layer.distance,
          x: index % 2 === 0 ? 8 : -6,
          duration: layer.duration,
          ease: "none",
          repeat: -1,
          yoyo: true,
          force3D: true,
        });
      });

      const stars = gsap.utils.toArray<HTMLElement>(".void-star", rootRef.current);
      stars.forEach((star) => {
        gsap.set(star, { willChange: "opacity", force3D: true });
        if (shouldReduceMotion) {
          return;
        }

        gsap.to(star, {
          opacity: gsap.utils.random(0.2, 1),
          duration: gsap.utils.random(1.8, 5.4),
          delay: gsap.utils.random(0, 4),
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          force3D: true,
        });
      });

      nebulaRefs.current.forEach((nebula, index) => {
        if (!nebula) {
          return;
        }

        gsap.set(nebula, { willChange: "transform", force3D: true });
        if (shouldReduceMotion) {
          return;
        }

        gsap.to(nebula, {
          x: index === 1 ? -38 : 34,
          y: index === 2 ? -28 : 24,
          rotate: index % 2 === 0 ? 10 : -12,
          duration: 95 + index * 22,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          force3D: true,
        });
      });
    }, rootRef);

    return () => context.revert();
  }, []);

  return (
    <div ref={rootRef} aria-hidden="true" className="space-void-bg pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="space-void-nebula nebula-one" ref={(element) => (nebulaRefs.current[0] = element)} />
      <div className="space-void-nebula nebula-two" ref={(element) => (nebulaRefs.current[1] = element)} />
      <div className="space-void-nebula nebula-three" ref={(element) => (nebulaRefs.current[2] = element)} />

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
