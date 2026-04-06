import type { StructuralAnchor } from "@/lib/types";

interface LowestAnchorsProps {
  lowestAnchors?: StructuralAnchor[];
}

export function LowestAnchors({ lowestAnchors }: LowestAnchorsProps) {
  const anchors = lowestAnchors?.slice(0, 3);

  return (
    <article className="k-module-card p-5">
      <h3 className="k-module-label">Module 6 · Lowest Structural Anchors</h3>

      {!anchors ? (
        <p className="font-ui mt-4 rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-elevated)] p-4 text-sm text-[var(--text-secondary)]">—</p>
      ) : anchors.length === 0 ? (
        <p className="font-ui mt-4 rounded-lg border border-[var(--clear-color)]/40 bg-[var(--clear-color)]/15 p-4 text-sm font-medium text-[var(--clear-color)]">
          No low-anchor lines detected.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {anchors.map((anchor, index) => (
            <li key={`${anchor.sentence}-${index}`} className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
              <p className="font-ui text-sm text-[var(--text-primary)]">{anchor.sentence}</p>
              <p className="font-ui mt-2 text-sm font-medium text-[var(--missing-color)]">{anchor.issue || "Structural failure detected."}</p>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
