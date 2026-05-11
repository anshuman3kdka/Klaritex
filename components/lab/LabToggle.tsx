"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface LabToggleProps {
  /** Controlled checked state. */
  checked: boolean;
  /** Callback fired with the next checked state. */
  onCheckedChange: (next: boolean) => void;
  /** Accessible label. Required for assistive tech. */
  label: string;
  /** Optional id; auto-generated if omitted. */
  id?: string;
  /** Visually hides the label (still announced). */
  srLabel?: boolean;
  /** Disable interaction. */
  disabled?: boolean;
  className?: string;
}

/**
 * `LabToggle` — the industrial Stress Test switch.
 *
 * A pressed track (8px radius) hosts an extruded circular knob
 * (50% radius) that slides between two end positions. The active
 * (on) state illuminates the knob with the Diagnostic Gold glow,
 * signalling that the Active Engine is engaged.
 *
 * Used in Module 10 (Commitment Breakdown — Stress Test) per
 * adversarial_logic §2; also reusable as the canonical mode switch
 * anywhere in the application.
 *
 * Interaction:
 *   - Click anywhere on the track or knob → toggle.
 *   - Space / Enter on focus → toggle.
 *   - 200ms ease-in-out shadow + transform.
 */
export function LabToggle({
  checked,
  onCheckedChange,
  label,
  id,
  srLabel = false,
  disabled = false,
  className,
}: LabToggleProps) {
  const reactId = React.useId();
  const inputId = id ?? `lab-toggle-${reactId}`;

  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <button
        id={inputId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={srLabel ? label : undefined}
        disabled={disabled}
        onClick={() => !disabled && onCheckedChange(!checked)}
        className={cn(
          "relative inline-flex h-9 w-[68px] shrink-0 items-center",
          "bg-[var(--lab-surface)] lab-radius-pill shadow-pressed-sm",
          "transition-shadow duration-200 ease-in-out",
          "disabled:cursor-not-allowed disabled:opacity-50",
          checked && "shadow-pressed-sm shadow-gold-glow-soft",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "absolute top-1 left-1 inline-flex h-7 w-7 items-center justify-center",
            "bg-[var(--lab-surface)] lab-radius-dial shadow-extruded-sm",
            "transition-transform duration-200 ease-in-out",
            checked && "translate-x-[32px] shadow-extruded-sm shadow-gold-glow",
          )}
        >
          <span
            className={cn(
              "block h-1.5 w-1.5 lab-radius-dial transition-colors duration-200",
              checked
                ? "bg-[var(--lab-gold)]"
                : "bg-[var(--lab-subtle)]",
            )}
          />
        </span>
      </button>

      {!srLabel && (
        <label
          htmlFor={inputId}
          className={cn(
            "lab-label cursor-pointer select-none",
            checked && "text-[var(--lab-gold)]",
            disabled && "cursor-not-allowed opacity-60",
          )}
        >
          {label}
        </label>
      )}
    </span>
  );
}
