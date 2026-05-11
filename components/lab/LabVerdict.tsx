import * as React from "react";

import { cn } from "@/lib/utils";

type Tone = "neutral" | "clear" | "broad" | "missing" | "gold";

type Size = "sm" | "md" | "lg" | "xl";

export interface LabVerdictProps extends React.HTMLAttributes<HTMLElement> {
  as?: "p" | "div" | "h1" | "h2" | "h3" | "h4";
  /** Semantic tier color of the verdict. */
  tone?: Tone;
  /** Render a leading semantic dot (•). */
  dot?: boolean;
  /** Visual scale. Defaults to `"lg"`. */
  size?: Size;
}

const toneClass: Record<Tone, string> = {
  neutral: "text-[var(--lab-ink)]",
  clear: "text-[var(--lab-clear)]",
  broad: "text-[var(--lab-broad)]",
  missing: "text-[var(--lab-missing)]",
  gold: "text-[var(--lab-gold)]",
};

const dotClass: Record<Tone, string> = {
  neutral: "bg-[var(--lab-ink)]",
  clear: "bg-[var(--lab-clear)]",
  broad: "bg-[var(--lab-broad)]",
  missing: "bg-[var(--lab-missing)]",
  gold: "bg-[var(--lab-gold)]",
};

const sizeClass: Record<Size, string> = {
  sm: "text-base sm:text-lg",
  md: "text-xl sm:text-2xl",
  lg: "text-2xl sm:text-3xl",
  xl: "text-4xl sm:text-5xl",
};

/**
 * `LabVerdict` — Playfair Display verdict line.
 *
 * Used for the high-authority statement at the bottom of a diagnostic
 * module: "Verdict: Marginal", "Verdict: Solid (Tier One)", "Verdict:
 * Rhetorical (Marketing)". Per typographic_tension §2.1 this is the
 * voice of the *Expert*, contrasting with the surrounding DM Mono
 * voice of the *Engine*.
 *
 * Weight 600, letter-spacing -0.01em, line-height 1.1 are baked in.
 */
export const LabVerdict = React.forwardRef<HTMLElement, LabVerdictProps>(
  function LabVerdict(
    { as = "p", tone = "neutral", dot = false, size = "lg", className, children, ...rest },
    ref,
  ) {
    const Component = as as React.ElementType;
    return (
      <Component
        ref={ref as React.Ref<HTMLElement>}
        className={cn(
          "font-serif font-semibold tracking-[-0.01em] leading-[1.1]",
          "inline-flex items-baseline gap-3",
          sizeClass[size],
          toneClass[tone],
          className,
        )}
        {...rest}
      >
        {dot && (
          <span
            aria-hidden="true"
            className={cn("inline-block h-2 w-2 lab-radius-dial translate-y-[-0.15em]", dotClass[tone])}
          />
        )}
        <span>{children}</span>
      </Component>
    );
  },
);
