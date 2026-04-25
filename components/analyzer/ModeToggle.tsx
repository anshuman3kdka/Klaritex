"use client";

import { useEffect, useRef, useState, KeyboardEvent } from "react";

import type { AnalysisMode } from "@/lib/types";

interface ModeToggleProps {
  value: AnalysisMode;
  onChange: (value: AnalysisMode) => void;
  disabled?: boolean;
}

const MODE_OPTIONS: Array<{
  value: AnalysisMode;
  label: string;
  icon: React.ReactNode;
  description: string;
}> = [
  {
    value: "quick",
    label: "Quick",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="k-icon-16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    description: "Faster analysis. Good for a first pass.",
  },
  {
    value: "deep",
    label: "Deep",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="k-icon-16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    description: "Thorough analysis. Recommended for serious evaluation.",
  },
];

export function ModeToggle({ value, onChange, disabled = false }: ModeToggleProps) {
  const [touchFlashMode, setTouchFlashMode] = useState<AnalysisMode | null>(null);
  const touchFlashTimeoutRef = useRef<number | null>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = MODE_OPTIONS.findIndex((opt) => opt.value === value);
    if (currentIndex === -1) return;

    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % MODE_OPTIONS.length;
      const nextValue = MODE_OPTIONS[nextIndex].value;
      onChange(nextValue);
      buttonRefs.current[nextValue]?.focus();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const nextIndex = (currentIndex - 1 + MODE_OPTIONS.length) % MODE_OPTIONS.length;
      const nextValue = MODE_OPTIONS[nextIndex].value;
      onChange(nextValue);
      buttonRefs.current[nextValue]?.focus();
    }
  };

  const triggerTouchFlash = (mode: AnalysisMode) => {
    if (touchFlashTimeoutRef.current !== null) {
      window.clearTimeout(touchFlashTimeoutRef.current);
    }

    setTouchFlashMode(mode);
    touchFlashTimeoutRef.current = window.setTimeout(() => {
      setTouchFlashMode((current) => (current === mode ? null : current));
      touchFlashTimeoutRef.current = null;
    }, 130);
  };

  useEffect(() => {
    return () => {
      if (touchFlashTimeoutRef.current !== null) {
        window.clearTimeout(touchFlashTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-3">
      <p id="processing-mode-label" className="font-ui k-text-heading">
        Processing Mode
      </p>
      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-labelledby="processing-mode-label" onKeyDown={handleKeyDown}>
        {MODE_OPTIONS.map((option) => {
          const isActive = option.value === value;
          const isTouchFlashing = touchFlashMode === option.value;

          return (
            <button
              key={option.value}
              ref={(el) => {
                buttonRefs.current[option.value] = el;
              }}
              role="radio"
              aria-checked={isActive}
              tabIndex={isActive ? 0 : -1}
              type="button"
              disabled={disabled}
              onTouchStart={() => {
                if (!disabled) {
                  triggerTouchFlash(option.value);
                }
              }}
              onClick={() => onChange(option.value)}
              className={`k-radius-primary border p-3 text-left transition-transform duration-150 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold-primary)]/50 ${
                isTouchFlashing
                  ? "bg-[var(--bg-elevated)]"
                  : ""
              } ${
                isActive
                  ? "border-[var(--gold-primary)] bg-[var(--bg-elevated)]"
                  : "k-border-ui bg-[var(--bg-surface)]"
              } ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
            >
              <p className={`font-ui k-text-heading flex items-center gap-2 ${isActive ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>
                {option.icon}
                {option.label}
              </p>
              <p className={`font-ui mt-1 ${isActive ? "text-[var(--text-primary)]" : "k-text-helper"}`}>{option.description}</p>
              <span
                aria-hidden
                className="mt-2 block h-px origin-left bg-[var(--gold-primary)] transition-[transform,opacity] duration-150"
                style={{
                  transform: isActive ? "scaleX(1)" : "scaleX(0)",
                  opacity: isActive ? 1 : 0,
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
