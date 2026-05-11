import * as React from "react";

import { cn } from "@/lib/utils";

type Padding = "none" | "sm" | "md" | "lg";
type Radius = "card" | "pill" | "dial";
type Depth = "default" | "sm";

export interface LabWellProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: keyof React.JSX.IntrinsicElements;
  /** Internal padding. Defaults to `"md"`. */
  padding?: Padding;
  /** Corner radius. Defaults to `"pill"` (8px). */
  radius?: Radius;
  /** Inset depth. Defaults to `"default"` (4/4/8). */
  depth?: Depth;
}

const paddingClass: Record<Padding, string> = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-6 sm:p-8",
};

const radiusClass: Record<Radius, string> = {
  card: "lab-radius-card",
  pill: "lab-radius-pill",
  dial: "lab-radius-dial",
};

const depthClass: Record<Depth, string> = {
  default: "shadow-pressed",
  sm: "shadow-pressed-sm",
};

/**
 * `LabWell` — the canonical pressed/recessed surface.
 *
 * Represents *Evidence / Input / Data Collection / a Well*
 * (system_instructions §1). Use for:
 *   - Text inputs, file drop zones, URL fields
 *   - Distribution-bar tracks (Modules 3 & 7)
 *   - The circular inner well of `LabDial` (Modules 1 & 4)
 *   - The Source pane in the Forensic Inspector (Module ↔ Module 10)
 *
 * Never carries a border. Depth is communicated entirely through
 * inset shadow against the identical-color background.
 */
export const LabWell = React.forwardRef<HTMLDivElement, LabWellProps>(
  function LabWell(
    {
      as: Tag = "div",
      padding = "md",
      radius = "pill",
      depth = "default",
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const Component = Tag as React.ElementType;
    return (
      <Component
        ref={ref}
        className={cn(
          "relative bg-[var(--lab-surface)] text-[var(--lab-ink)]",
          radiusClass[radius],
          depthClass[depth],
          paddingClass[padding],
          className,
        )}
        {...rest}
      >
        {children}
      </Component>
    );
  },
);
