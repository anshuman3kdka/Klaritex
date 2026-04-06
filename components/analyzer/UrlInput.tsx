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
      <label htmlFor="klaritex-url-input" className="font-ui mb-2 block text-sm font-medium text-[var(--text-primary)]">
        URL to analyze
      </label>
      <input
        id="klaritex-url-input"
        type="url"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        placeholder="https://..."
        className="font-ui w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] p-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--gold-primary)] focus:ring-2 focus:ring-[var(--gold-primary)]/20 disabled:cursor-not-allowed disabled:bg-[var(--bg-elevated)]"
      />

      <p className="font-ui mt-2 text-xs text-[var(--text-secondary)]">
        Klaritex analyzes the article&apos;s text only. It does not search the web or fact-check claims.
      </p>
      {errorMessage ? <p className="font-ui mt-2 text-sm text-[var(--missing-color)]">{errorMessage}</p> : null}
    </div>
  );
}
