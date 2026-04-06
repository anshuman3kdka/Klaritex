import type { ExposureItem } from "@/lib/types";

interface ExposureCheckProps {
  exposureCheck?: ExposureItem[];
}

const statusStyles: Record<ExposureItem["status"], string> = {
  "locked-in": "text-[var(--clear-color)]",
  unclear: "text-[var(--broad-color)]",
  missing: "text-[var(--missing-color)]"
};

export function ExposureCheck({ exposureCheck }: ExposureCheckProps) {
  const items = exposureCheck ?? [];
  const lockedInCount = items.filter((item) => item.status === "locked-in").length;
  const unclearCount = items.filter((item) => item.status === "unclear").length;
  const missingCount = items.filter((item) => item.status === "missing").length;
  const total = items.length || 1;

  return (
    <article className="k-module-card p-5">
      <h3 className="k-module-label">Module 3 · Exposure Check</h3>
      <p className="font-ui mt-2 text-sm text-[var(--text-secondary)]">
        This module lists what is clearly committed versus what stays unclear or missing.
      </p>

      {items.length === 0 ? (
        <p className="font-ui mt-4 rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-elevated)] p-4 text-sm text-[var(--text-secondary)]">
          No exposure items were returned by the analysis.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li key={`${item.label}-${item.status}`} className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
              <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                <p className="font-ui text-sm font-medium text-[var(--text-primary)]">{item.label}</p>
                <p className={`font-mono-ui inline-flex items-center gap-2 text-xs uppercase tracking-wide ${statusStyles[item.status]}`}>
                  <span className={`h-2.5 w-2.5 rounded-full ${
                    item.status === "locked-in"
                      ? "bg-[var(--clear-color)]"
                      : item.status === "unclear"
                        ? "bg-[var(--broad-color)]"
                        : "bg-[var(--missing-color)]"
                  }`} />
                  {item.status === "locked-in" ? "Locked In" : item.status === "unclear" ? "Unclear" : "Missing"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {items.length > 0 ? (
        <div className="mt-4">
          <p className="k-module-label mb-2">Distribution</p>
          <div className="flex h-2.5 overflow-hidden rounded-full bg-[var(--bg-primary)]">
            <div className="bg-[var(--clear-color)]" style={{ width: `${(lockedInCount / total) * 100}%` }} />
            <div className="bg-[var(--broad-color)]" style={{ width: `${(unclearCount / total) * 100}%` }} />
            <div className="bg-[var(--missing-color)]" style={{ width: `${(missingCount / total) * 100}%` }} />
          </div>
        </div>
      ) : null}
    </article>
  );
}
