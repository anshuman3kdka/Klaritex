"use client";

import { RefObject, useEffect, useState } from "react";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useScrollReveal<T extends HTMLElement>(ref: RefObject<T | null>): boolean {
  const [isVisible, setIsVisible] = useState(() => (typeof window === "undefined" ? true : prefersReducedMotion()));

  useEffect(() => {
    if (!ref.current || isVisible) {
      return;
    }

    if (prefersReducedMotion()) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.15) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: [0.15],
      }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [isVisible, ref]);

  return isVisible;
}
