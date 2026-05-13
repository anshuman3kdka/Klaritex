import { LabCard, LabLabel } from "../lab";

interface AmbiguityExplanationProps {
  ambiguityExplanation?: string[];
}

export function AmbiguityExplanation({ ambiguityExplanation }: AmbiguityExplanationProps) {
  const explanations = ambiguityExplanation ?? null;

  return (
    <LabCard className="p-6">
      <LabLabel className="mb-6 block">Module 9 · Structural Ambiguity Explanation</LabLabel>
      {!explanations ? (
        <p className="font-mono text-sm text-[var(--lab-muted)]">—</p>
      ) : explanations.length === 0 ? (
        <p className="font-sans text-sm font-semibold text-[var(--lab-green)]">
          No structural ambiguity markers were returned.
        </p>
      ) : (
        <ul className="font-mono text-xs list-disc space-y-3 pl-5 text-[var(--lab-ink)]">
          {explanations.slice(0, 4).map((item, index) => (
            <li key={`${item}-${index}`} className="leading-relaxed">{item}</li>
          ))}
        </ul>
      )}
    </LabCard>
  );
}
