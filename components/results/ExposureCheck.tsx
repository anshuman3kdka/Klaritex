import type { ExposureItem } from "@/lib/types";

interface ExposureCheckProps {
  exposureCheck?: ExposureItem[];
}

const statusStyles: Record<ExposureItem["status"], string> = {
  "locked-in": "bg-emerald-100 text-emerald-800 border-emerald-200",
  unclear: "bg-amber-100 text-amber-800 border-amber-200",
  missing: "bg-rose-100 text-rose-800 border-rose-200"
};

export function ExposureCheck({ exposureCheck }: ExposureCheckProps) {
  const items = exposureCheck ?? [];

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">Module 3 · ExposureCheck</h3>
      <p className="mt-2 text-sm text-slate-600">
        This module lists what is clearly committed versus what stays unclear or missing.
      </p>

      {items.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
          No exposure items were returned by the analysis.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li key={`${item.label}-${item.status}`} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                <p className="text-sm font-medium text-slate-900">{item.label}</p>
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusStyles[item.status]}`}
                >
                  {item.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
