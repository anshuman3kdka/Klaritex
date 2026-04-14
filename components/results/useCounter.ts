"use client";

import { useEffect, useState } from "react";

interface UseCounterOptions {
  target: number;
  durationMs: number;
  delayMs?: number;
  start: boolean;
  easing?: (t: number) => number;
}

const linear = (t: number) => t;

export function useCounter({ target, durationMs, delayMs = 0, start, easing = linear }: UseCounterOptions): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) {
      const resetId = window.requestAnimationFrame(() => {
        setValue(0);
      });
      return () => window.cancelAnimationFrame(resetId);
    }

    if (durationMs <= 0) {
      const immediateId = window.requestAnimationFrame(() => {
        setValue(target);
      });
      return () => window.cancelAnimationFrame(immediateId);
    }

    let frameId = 0;
    let timeoutId: number | null = null;

    timeoutId = window.setTimeout(() => {
      const startedAt = performance.now();

      const tick = () => {
        const now = performance.now();
        const elapsed = now - startedAt;
        const progress = Math.min(elapsed / durationMs, 1);
        setValue(target * easing(progress));

        if (progress < 1) {
          frameId = window.requestAnimationFrame(tick);
        } else {
          setValue(target);
        }
      };

      frameId = window.requestAnimationFrame(tick);
    }, delayMs);

    return () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [delayMs, durationMs, easing, start, target]);

  return start ? value : 0;
}
