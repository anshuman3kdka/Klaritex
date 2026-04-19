"use client";

import { useEffect, useMemo, useState } from "react";
import {
  type VisualEffectsQuality,
  VISUAL_EFFECTS_EVENT,
  getEffectiveVisualEffectsQuality,
  getStoredVisualEffectsQuality,
  setStoredVisualEffectsQuality,
} from "@/lib/visualEffects";

export function useVisualEffectsQuality() {
  const [userQuality, setUserQuality] = useState<VisualEffectsQuality>(() => {
    if (typeof window === "undefined") {
      return "medium";
    }
    return getStoredVisualEffectsQuality();
  });

  useEffect(() => {
    const handleUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<VisualEffectsQuality>;
      if (customEvent.detail) {
        setUserQuality(customEvent.detail);
        return;
      }
      setUserQuality(getStoredVisualEffectsQuality());
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key) {
        setUserQuality(getStoredVisualEffectsQuality());
      }
    };

    window.addEventListener(VISUAL_EFFECTS_EVENT, handleUpdate as EventListener);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(VISUAL_EFFECTS_EVENT, handleUpdate as EventListener);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const effectiveQuality = useMemo(() => getEffectiveVisualEffectsQuality(userQuality), [userQuality]);

  const updateUserQuality = (nextQuality: VisualEffectsQuality) => {
    setUserQuality(nextQuality);
    setStoredVisualEffectsQuality(nextQuality);
  };

  return {
    userQuality,
    effectiveQuality,
    setUserQuality: updateUserQuality,
  };
}
