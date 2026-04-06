import type { StructuralAnchor } from "@/lib/types";

interface LowestAnchorsProps {
  lowestAnchors?: StructuralAnchor[];
}

export function LowestAnchors({ lowestAnchors }: LowestAnchorsProps) {
  const anchors = lowestAnchors?.slice(0, 3);

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">Module 6 · Lowest Structural Anchors</h3>

      {!anchors ? (
        <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">—</p>
      ) : anchors.length === 0 ? (
        <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
          No low-anchor lines detected.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {anchors.map((anchor, index) => (
            <li key={`${anchor.sentence}-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-900">{anchor.sentence}</p>
              <p className="mt-2 text-sm font-medium text-rose-700">{anchor.issue || "Structural failure detected."}</p>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
