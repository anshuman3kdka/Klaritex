"use client";

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
  return (
    <div>
      <label htmlFor="klaritex-url-input" className="font-ui k-text-heading mb-2 block">
        URL to analyze
      </label>
      <input
        id="klaritex-url-input"
        type="url"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        placeholder="https://..."
        className="font-ui k-radius-primary k-border-ui k-text-body w-full bg-[var(--bg-primary)] p-3 outline-none transition focus:border-[var(--gold-primary)] focus:ring-2 focus:ring-[var(--gold-primary)]/20 disabled:cursor-not-allowed disabled:bg-[var(--bg-elevated)]"
      />

      <p className="font-ui k-text-helper mt-2">
        Klaritex analyzes the article&apos;s text only. It does not search the web or fact-check claims.
      </p>
      {errorMessage ? <p className="font-ui k-text-body mt-2 text-[var(--missing-color)]">{errorMessage}</p> : null}
    </div>
  );
}
