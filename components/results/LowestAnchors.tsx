import type { StructuralAnchor } from "@/lib/types";
import { CollapsibleCard } from "./CollapsibleCard";

interface LowestAnchorsProps {
  lowestAnchors?: StructuralAnchor[];
}

export function LowestAnchors({ lowestAnchors }: LowestAnchorsProps) {
  const anchors = lowestAnchors?.slice(0, 3);

  return (
    <CollapsibleCard title="Module 6 · Lowest Structural Anchors" moduleId="module-6">
      {!anchors ? (
        <p className="font-ui k-radius-primary k-border-ui border-dashed bg-[var(--bg-elevated)] p-4 text-sm text-[var(--text-secondary)]">—</p>
      ) : anchors.length === 0 ? (
        <p className="font-ui k-radius-primary border border-[var(--clear-color)]/40 bg-[var(--clear-color)]/15 p-4 text-sm font-medium text-[var(--clear-color)]">
          No low-anchor lines detected.
        </p>
      ) : (
        <ul className="space-y-3">
          {anchors.map((anchor, index) => (
            <li key={`${anchor.sentence}-${index}`} className="k-radius-primary k-border-ui bg-[var(--bg-elevated)] p-4">
              <p className="font-ui k-text-body">{anchor.sentence}</p>
              <p className="font-ui k-text-body mt-2 font-medium text-[var(--missing-color)]">{anchor.issue || "Structural failure detected."}</p>
            </li>
          ))}
        </ul>
      )}
    </CollapsibleCard>
  );
}
