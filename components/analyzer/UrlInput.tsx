"use client";

import { LabLabel } from "../lab";

interface UrlInputProps {
  value: string;
  disabled?: boolean;
  errorMessage?: string | null;
  onChange: (value: string) => void;
}

export function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function UrlInput({ value, disabled = false, errorMessage, onChange }: UrlInputProps) {
  const hasError = Boolean(errorMessage);
  const helperId = "klaritex-url-helper";
  const messageId = "klaritex-url-message";

  return (
    <div>
      <LabLabel className="mb-2 block">
        <label htmlFor="klaritex-url-input">URL to analyze</label>
      </LabLabel>
      <input
        id="klaritex-url-input"
        type="url"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        placeholder="https://..."
        aria-invalid={hasError}
        aria-describedby={hasError ? `${helperId} ${messageId}` : helperId}
        className={`font-sans w-full bg-[var(--lab-surface)] p-4 outline-none transition-[box-shadow,background-color] duration-200 rounded-[8px] disabled:cursor-not-allowed disabled:opacity-50 ${
          hasError
            ? "shadow-[var(--shadow-pressed)] ring-2 ring-[var(--lab-red)]"
            : "shadow-[var(--shadow-pressed)] focus-visible:ring-2 focus-visible:ring-[var(--lab-gold)]/50"
        }`}
      />

      <p id={helperId} className="font-sans text-[var(--lab-muted)] mt-2 text-xs">
        Klaritex analyzes the article&apos;s text only. It does not search the web or fact-check claims.
      </p>
      <p
        id={messageId}
        role={hasError ? "alert" : "status"}
        aria-live={hasError ? "assertive" : "polite"}
        className={`font-sans mt-2 min-h-5 text-sm ${hasError ? "text-[var(--lab-red)]" : "text-transparent"}`}
      >
        {errorMessage ?? "Input looks good."}
      </p>
    </div>
  );
}
