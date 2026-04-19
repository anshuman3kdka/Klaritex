export type VisualEffectsQuality = "high" | "medium" | "low" | "off";

export const VISUAL_EFFECTS_STORAGE_KEY = "klaritex-visual-effects-quality";
export const VISUAL_EFFECTS_EVENT = "klaritex:visual-effects-updated";

const QUALITY_RANK: Record<VisualEffectsQuality, number> = {
  off: 0,
  low: 1,
  medium: 2,
  high: 3,
};

function parseQuality(value: string | null | undefined): VisualEffectsQuality | null {
  if (value === "high" || value === "medium" || value === "low" || value === "off") {
    return value;
  }

  return null;
}

export function getDeviceQualityCap(): VisualEffectsQuality {
  if (typeof navigator === "undefined") {
    return "medium";
  }

  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const hardware = nav.hardwareConcurrency;
  const memory = nav.deviceMemory;
  const saveData = Boolean(nav.connection?.saveData);

  const veryWeakDevice =
    saveData ||
    (typeof hardware === "number" && hardware <= 2) ||
    (typeof memory === "number" && memory <= 2);

  if (veryWeakDevice) {
    return "off";
  }

  const weakerDevice =
    (typeof hardware === "number" && hardware <= 4) ||
    (typeof memory === "number" && memory <= 4);

  if (weakerDevice) {
    return "low";
  }

  return "high";
}

export function clampQuality(preferred: VisualEffectsQuality, cap: VisualEffectsQuality): VisualEffectsQuality {
  return QUALITY_RANK[preferred] <= QUALITY_RANK[cap] ? preferred : cap;
}

export function getStoredVisualEffectsQuality(): VisualEffectsQuality {
  if (typeof window === "undefined") {
    return "medium";
  }

  const parsed = parseQuality(window.localStorage.getItem(VISUAL_EFFECTS_STORAGE_KEY));
  return parsed ?? "medium";
}

export function setStoredVisualEffectsQuality(quality: VisualEffectsQuality) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(VISUAL_EFFECTS_STORAGE_KEY, quality);
  window.dispatchEvent(new CustomEvent(VISUAL_EFFECTS_EVENT, { detail: quality }));
}

export function getEffectiveVisualEffectsQuality(preferred: VisualEffectsQuality): VisualEffectsQuality {
  return clampQuality(preferred, getDeviceQualityCap());
}
