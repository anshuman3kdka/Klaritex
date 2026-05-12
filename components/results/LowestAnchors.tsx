import type { StructuralAnchor } from "@/lib/types";
import { LabCard, LabLabel, LabWell, LabPill } from "../lab";

interface LowestAnchorsProps {
  lowestAnchors?: StructuralAnchor[];
}

export function LowestAnchors({ lowestAnchors }: LowestAnchorsProps) {
  const anchors = lowestAnchors?.slice(0, 3);

  return (
    <LabCard className="p-6">
      <LabLabel className="mb-6 block">Module 6 · Lowest Anchors</LabLabel>
      {!anchors ? (
        <p className="font-mono text-sm text-[var(--lab-muted)]">—</p>
      ) : anchors.length === 0 ? (
        <p className="font-sans text-sm font-semibold text-[var(--lab-green)]">No low-anchor lines detected.</p>
      ) : (
        <ul className="space-y-4">
          {anchors.map((anchor, index) => (
            <li key={`${anchor.sentence}-${index}`}>
              <LabWell className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start gap-3">
                  <p className="font-sans text-sm text-[var(--lab-ink)]">{anchor.sentence}</p>
                  <LabPill status="Missing" />
                </div>
                <p className="font-mono text-[11px] uppercase tracking-wide text-[var(--lab-red)]">{anchor.issue || "Structural failure detected."}</p>
              </LabWell>
            </li>
          ))}
        </ul>
      )}
    </LabCard>
  );
}
