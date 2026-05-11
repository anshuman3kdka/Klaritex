import * as React from "react";

import { cn } from "@/lib/utils";

type Tone = "clear" | "broad" | "missing" | "neutral" | "gold";

export interface LabDialProps {
  /** Diameter in pixels. Defaults to 180. */
  size?: number;
  /** Stroke width of the segmented arc in pixels. Defaults to 8. */
  stroke?: number;
  /** Normalized progress 0–1. Determines how much of the arc is filled. */
  value?: number;
  /** Visual / semantic color of the filled arc. Defaults to `"neutral"`. */
  tone?: Tone;
  /** Number of segments in the arc. Defaults to 24 (laboratory readout look). */
  segments?: number;
  /** Centered content (typically the Playfair score or DM Mono count). */
  children?: React.ReactNode;
  /** Optional small label rendered above the center content. */
  label?: React.ReactNode;
  /** Optional caption rendered below the center content. */
  caption?: React.ReactNode;
  className?: string;
  /** Accessible label for the dial as a whole. */
  ariaLabel?: string;
}

const toneStrokeVar: Record<Tone, string> = {
  clear: "var(--lab-clear)",
  broad: "var(--lab-broad)",
  missing: "var(--lab-missing)",
  neutral: "var(--lab-ink)",
  gold: "var(--lab-gold)",
};

/**
 * `LabDial` — the Diagnostic Dial used for Module 1 (Ambiguity Score)
 * and Module 4 (Unanchored Claims).
 *
 * Anatomy (neumorphism §5):
 *   - Outer ring: `shadow-extruded` perfect circle.
 *   - Inner well: `shadow-pressed` perfect circle, hosts the verdict.
 *   - Segmented arc: SVG ring with `segments` discrete ticks; the first
 *     `round(value × segments)` ticks are illuminated in the tone color,
 *     remaining ticks recede to the muted subtle gray. This produces
 *     the "medical-equipment readout" feel mandated by the spec.
 *
 * The dial never displays a border. All geometry is conveyed through
 * extrusion / recession on the single Lab Surface.
 */
export function LabDial({
  size = 180,
  stroke = 8,
  value = 0,
  tone = "neutral",
  segments = 24,
  children,
  label,
  caption,
  className,
  ariaLabel,
}: LabDialProps) {
  const clamped = Math.max(0, Math.min(1, value));
  const filled = Math.round(clamped * segments);

  const center = size / 2;
  // Radius of the arc track sits between the outer extruded ring and the
  // inner pressed well, leaving room for the shadow halo to read cleanly.
  const arcRadius = (size - stroke) / 2 - 6;
  const circumference = 2 * Math.PI * arcRadius;
  const gap = 2; // pixels between segments
  const segmentLength = circumference / segments - gap;

  const wellSize = size - stroke * 2 - 24;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={ariaLabel}
    >
      {/* Outer extruded ring */}
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-[var(--lab-surface)] lab-radius-dial shadow-extruded"
      />

      {/* Segmented diagnostic arc */}
      <svg
        aria-hidden="true"
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        className="relative -rotate-90"
      >
        <circle
          cx={center}
          cy={center}
          r={arcRadius}
          fill="none"
          stroke="var(--lab-subtle)"
          strokeOpacity={0.55}
          strokeWidth={stroke}
          strokeDasharray={`${segmentLength} ${gap}`}
          strokeLinecap="butt"
        />
        {filled > 0 && (
          <circle
            cx={center}
            cy={center}
            r={arcRadius}
            fill="none"
            stroke={toneStrokeVar[tone]}
            strokeWidth={stroke}
            strokeDasharray={`${segmentLength} ${gap}`}
            strokeDashoffset={0}
            strokeLinecap="butt"
            style={{
              // Reveal exactly `filled` segments.
              strokeDasharray: `${filled * (segmentLength + gap) - gap} ${circumference}`,
            }}
          />
        )}
      </svg>

      {/* Inner pressed well + centered content */}
      <div
        className="absolute flex flex-col items-center justify-center gap-1 bg-[var(--lab-surface)] lab-radius-dial shadow-pressed"
        style={{ width: wellSize, height: wellSize }}
      >
        {label && <span className="lab-label">{label}</span>}
        <div className="flex items-baseline justify-center text-[var(--lab-ink)]">
          {children}
        </div>
        {caption && (
          <span className="lab-label" style={{ fontSize: 10 }}>
            {caption}
          </span>
        )}
      </div>
    </div>
  );
}
