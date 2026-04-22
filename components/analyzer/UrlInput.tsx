"use client";

import type { RefObject } from "react";

interface UrlInputProps {
  value: string;
  disabled?: boolean;
  errorMessage?: string | null;
  onChange: (value: string) => void;
  inputRef?: RefObject<HTMLInputElement | null>;
}

export function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function UrlInput({ value, disabled = false, errorMessage, onChange, inputRef }: UrlInputProps) {
  const hasError = Boolean(errorMessage);
  const helperId = "klaritex-url-helper";
  const messageId = "klaritex-url-message";

  return (
    <div>
      <label htmlFor="klaritex-url-input" className="font-ui k-text-heading mb-2 block">
        URL to analyze
      </label>
      <input
        ref={inputRef}
        id="klaritex-url-input"
        type="url"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        placeholder="https://..."
        aria-invalid={hasError}
        aria-describedby={hasError ? `${helperId} ${messageId}` : helperId}
        className={`font-ui k-radius-primary k-text-body w-full border bg-[var(--bg-primary)] p-3 outline-none transition-[border-color,box-shadow,background-color] duration-200 disabled:cursor-not-allowed disabled:bg-[var(--bg-elevated)] ${
          hasError
            ? "border-[var(--missing-color)] focus-visible:border-[var(--missing-color)] focus-visible:ring-2 focus-visible:ring-[var(--missing-color)]/35 focus-visible:shadow-[0_0_0_4px_rgba(220,76,100,0.16)]"
            : "k-border-ui focus-visible:border-[var(--gold-primary)] focus-visible:ring-2 focus-visible:ring-[var(--gold-primary)]/25 focus-visible:shadow-[0_0_0_4px_rgba(201,168,76,0.14)]"
        }`}
      />

      <p id={helperId} className="font-ui k-text-helper mt-2 text-sm leading-5">
        Klaritex analyzes the article&apos;s text only. It does not search the web or fact-check claims.
      </p>
      <p
        id={messageId}
        role={hasError ? "alert" : "status"}
        aria-live={hasError ? "assertive" : "polite"}
        className={`font-ui mt-2 min-h-5 text-sm leading-5 ${hasError ? "text-[var(--missing-color)]" : "text-transparent"}`}
      >
        {errorMessage ?? "Input looks good."}
      </p>
    </div>
  );
}
