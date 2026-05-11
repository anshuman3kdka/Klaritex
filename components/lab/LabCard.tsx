import * as React from "react";

import { cn } from "@/lib/utils";

type Padding = "none" | "sm" | "md" | "lg";
type Elevation = "default" | "sm" | "lg";

export interface LabCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Render as a different element. Default: `div`.
   * Use `"section"`, `"article"`, `"aside"`, etc. for semantic regions.
   */
  as?: keyof React.JSX.IntrinsicElements;
  /** Internal padding. Defaults to `"md"` (1.25rem). */
  padding?: Padding;
  /** Shadow depth. Defaults to `"default"` (6/6/12). */
  elevation?: Elevation;
  /** Adds a lift-on-hover interaction (extruded → larger extruded). */
  interactive?: boolean;
  /** Adds the Diagnostic Gold outer glow (Active Engine state). */
  glow?: boolean;
}

const paddingClass: Record<Padding, string> = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-6 sm:p-8",
};

const elevationClass: Record<Elevation, string> = {
  default: "shadow-extruded",
  sm: "shadow-extruded-sm",
  lg: "shadow-extruded-lg",
};

/**
 * `LabCard` — the canonical extruded surface of the Klaritex system.
 *
 * Represents a *Result / Conclusion / Control* (per system_instructions §1).
 * Always uses Lab Surface (`#EBEFF5`) with neumorphic outset shadows.
 * Never carries a border.
 *
 * Use for: Module containers (Modules 1–11), command-center panels,
 * any element that "pops out" of the Lab White surface.
 */
export const LabCard = React.forwardRef<HTMLDivElement, LabCardProps>(
  function LabCard(
    {
      as: Tag = "div",
      padding = "md",
      elevation = "default",
      interactive = false,
      glow = false,
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
          "relative bg-[var(--lab-surface)] text-[var(--lab-ink)] lab-radius-card",
          elevationClass[elevation],
          paddingClass[padding],
          interactive &&
            "transition-shadow duration-200 ease-in-out hover:shadow-extruded-lg motion-safe:hover:-translate-y-px transform-gpu",
          glow && "shadow-gold-glow",
          className,
        )}
        {...rest}
      >
        {children}
      </Component>
    );
  },
);
