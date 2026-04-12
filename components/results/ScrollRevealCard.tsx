"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { useScrollReveal } from "./useScrollReveal";

interface ScrollRevealCardProps {
  children: ReactNode;
}

export function ScrollRevealCard({ children }: ScrollRevealCardProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isVisible = useScrollReveal(containerRef);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setReduceMotion(mediaQuery.matches);

    updateMotionPreference();

    mediaQuery.addEventListener("change", updateMotionPreference);

    return () => mediaQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  return (
    <div
      ref={containerRef}
      style={
        reduceMotion
          ? undefined
          : {
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(24px)",
              transition: "opacity 500ms ease-out, transform 500ms ease-out",
            }
      }
    >
      {children}
    </div>
  );
}
