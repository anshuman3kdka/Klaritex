"use client";

import type { AnalysisMode } from "@/lib/types";

interface ModeToggleProps {
  value: AnalysisMode;
  onChange: (value: AnalysisMode) => void;
  disabled?: boolean;
}

const MODE_OPTIONS: Array<{
  value: AnalysisMode;
  label: string;
  description: string;
}> = [
  {
    value: "quick",
    label: "⚡ Quick",
    description: "Faster analysis. Good for a first pass.",
  },
  {
    value: "deep",
    label: "🔍 Deep",
    description: "Thorough analysis. Recommended for serious evaluation.",
  },
];

export function ModeToggle({ value, onChange, disabled = false }: ModeToggleProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-900">Processing Mode</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {MODE_OPTIONS.map((option) => {
          const isActive = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isActive}
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className={`rounded-lg border p-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
                isActive
                  ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-200"
                  : "border-slate-300 bg-white hover:border-slate-400"
              } ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
            >
              <p className="font-medium text-slate-900">{option.label}</p>
              <p className="mt-1 text-sm text-slate-600">{option.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
