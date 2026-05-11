import * as React from "react";

import { cn } from "@/lib/utils";

type Tone =
  | "neutral"
  | "clear"
  | "broad"
  | "missing"
  | "gold"
  | "muted";

type Variant = "pressed" | "extruded";

export interface LabPillProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Color of the pill text. Determines semantic meaning. */
  tone?: Tone;
  /** Pressed (default — status / verdict) or extruded (control). */
  variant?: Variant;
  /** Dense vs roomy padding. */
  size?: "sm" | "md";
}

const toneClass: Record<Tone, string> = {
  neutral: "text-[var(--lab-ink)]",
  clear: "text-[var(--lab-clear)]",
  broad: "text-[var(--lab-broad)]",
  missing: "text-[var(--lab-missing)]",
  gold: "text-[var(--lab-gold)]",
  muted: "text-[var(--lab-muted)]",
};

const variantClass: Record<Variant, string> = {
  pressed: "shadow-pressed-sm",
  extruded: "shadow-extruded-sm",
};

const sizeClass: Record<"sm" | "md", string> = {
  sm: "px-2.5 py-1 text-[10px]",
  md: "px-3 py-1.5 text-[11px]",
};

/**
 * `LabPill` — DM Mono status / tier badge.
 *
 * Used everywhere a small inline status must be communicated:
 *   - Tier labels (Solid / Marginal / Rhetorical → clear / broad / missing)
 *   - Commitment Breakdown statuses (LOCKED IN / UNCLEAR / MISSING and
 *     their adversarial reclassifications TESTABLE / CONTESTED / UNTESTABLE)
 *   - Issue tags ([NO TIMELINE], [NO METRIC], …)
 *   - Toggle state indicators
 *
 * Always Lab Surface background; meaning is conveyed by text color +
 * inset/outset depth. No borders, ever.
 */
export const LabPill = React.forwardRef<HTMLSpanElement, LabPillProps>(
  function LabPill(
    { tone = "neutral", variant = "pressed", size = "md", className, children, ...rest },
    ref,
  ) {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 bg-[var(--lab-surface)] lab-radius-pill",
          "font-mono font-semibold uppercase tracking-[0.08em] leading-none",
          "whitespace-nowrap",
          variantClass[variant],
          sizeClass[size],
          toneClass[tone],
          className,
        )}
        {...rest}
      >
        {children}
      </span>
    );
  },
);
