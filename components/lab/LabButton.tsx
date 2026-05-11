"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

export interface LabButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Adds the Diagnostic Gold outer glow (Active Engine state). */
  glow?: boolean;
  /** Force the pressed shadow state regardless of :active. */
  pressed?: boolean;
}

const sizeClass: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

const variantTextClass: Record<Variant, string> = {
  primary: "text-[var(--lab-ink)] font-mono uppercase tracking-[0.1em]",
  secondary: "text-[var(--lab-muted)] font-mono uppercase tracking-[0.1em]",
  ghost: "text-[var(--lab-muted)] font-sans",
};

/**
 * `LabButton` — the canonical mechanical control.
 *
 * Implements the "Mechanical Shift" interaction (neumorphism §6):
 *   - Rest: `shadow-extruded`
 *   - Hover: `shadow-extruded-lg` (subtle lift)
 *   - Active / pressed: `shadow-pressed` (the button physically
 *     depresses into the console)
 *   - Transition: 0.2s ease-in-out across all shadows
 *
 * Variants are purely typographic; geometry is identical. The Gold
 * glow (`glow`) is reserved for "Active Engine" / "Verification"
 * states such as the Stress Test toggle in its `on` position.
 */
export const LabButton = React.forwardRef<HTMLButtonElement, LabButtonProps>(
  function LabButton(
    {
      variant = "primary",
      size = "md",
      glow = false,
      pressed = false,
      className,
      children,
      type,
      ...rest
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type ?? "button"}
        data-pressed={pressed || undefined}
        className={cn(
          "relative inline-flex items-center justify-center gap-2",
          "bg-[var(--lab-surface)] lab-radius-pill",
          "font-medium select-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          sizeClass[size],
          variantTextClass[variant],
          pressed ? "shadow-pressed" : "shadow-mechanical",
          glow && "shadow-gold-glow",
          "data-[pressed=true]:shadow-pressed",
          className,
        )}
        {...rest}
      >
        {children}
      </button>
    );
  },
);
