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
      <label htmlFor="klaritex-url-input" className="mb-2 block text-sm font-medium text-slate-900">
        URL to analyze
      </label>
      <input
        id="klaritex-url-input"
        type="url"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        placeholder="https://..."
        className="w-full rounded-lg border border-slate-300 p-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:bg-slate-100"
      />

      <p className="mt-2 text-xs text-slate-500">
        Klaritex analyzes the article&apos;s text only. It does not search the web or fact-check claims.
      </p>
      {errorMessage ? <p className="mt-2 text-sm text-red-600">{errorMessage}</p> : null}
    </div>
  );
}
