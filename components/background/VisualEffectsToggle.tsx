"use client";

import type { VisualEffectsQuality } from "@/lib/visualEffects";
import { useVisualEffectsQuality } from "@/components/background/useVisualEffectsQuality";

const OPTIONS: Array<{ value: VisualEffectsQuality; label: string }> = [
  { value: "off", label: "Off" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export function VisualEffectsToggle() {
  const { userQuality, effectiveQuality, setUserQuality } = useVisualEffectsQuality();

  return (
    <label className="inline-flex items-center gap-2 text-xs text-[var(--text-secondary)] sm:text-sm">
      <span className="font-ui">Visual Effects</span>
      <select
        className="rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-2 py-1 text-[var(--text-primary)] outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--gold-primary)]/45"
        value={userQuality}
        onChange={(event) => setUserQuality(event.target.value as VisualEffectsQuality)}
        aria-label="Visual effects quality"
      >
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {effectiveQuality !== userQuality ? (
        <span className="font-ui text-[10px] text-[var(--text-secondary)]/80 sm:text-xs">Auto-capped: {effectiveQuality}</span>
      ) : null}
    </label>
  );
}
