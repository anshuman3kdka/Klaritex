import * as React from "react";

import { cn } from "@/lib/utils";

type Tone = "muted" | "ink" | "gold";

export interface LabLabelProps extends React.HTMLAttributes<HTMLElement> {
  as?: "span" | "div" | "p" | "label" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  /** Text color. Defaults to `"muted"` (#7A8B99). */
  tone?: Tone;
  htmlFor?: string;
}

const toneClass: Record<Tone, string> = {
  muted: "text-[var(--lab-muted)]",
  ink: "text-[var(--lab-ink)]",
  gold: "text-[var(--lab-gold)]",
};

/**
 * `LabLabel` — the canonical 11px UPPERCASE DM Mono label.
 *
 * Specification (typographic_tension §3.2):
 *   - Font: DM Mono
 *   - Size: 11px
 *   - Weight: 500
 *   - Case: UPPERCASE
 *   - Tracking: 0.1em
 *   - Color: #7A8B99 (muted)
 *
 * Use for every module label ("OVERALL AMBIGUITY", "STRESS TEST",
 * "CLARITY LEVEL", …) and every metadata caption in the system.
 */
export const LabLabel = React.forwardRef<HTMLElement, LabLabelProps>(
  function LabLabel({ as = "span", tone = "muted", className, children, ...rest }, ref) {
    const Component = as as React.ElementType;
    return (
      <Component
        ref={ref as React.Ref<HTMLElement>}
        className={cn("lab-label", toneClass[tone], className)}
        {...rest}
      >
        {children}
      </Component>
    );
  },
);
