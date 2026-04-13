import { CollapsibleCard } from "./CollapsibleCard";

interface AmbiguityExplanationProps {
  ambiguityExplanation?: string[];
}

export function AmbiguityExplanation({ ambiguityExplanation }: AmbiguityExplanationProps) {
  const explanations = ambiguityExplanation ?? null;

  return (
    <CollapsibleCard title="Module 9 · Structural Ambiguity Explanation" moduleId="module-9">
      {!explanations ? (
        <p className="font-ui rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-elevated)] p-4 text-sm text-[var(--text-secondary)]">—</p>
      ) : explanations.length === 0 ? (
        <p className="font-ui rounded-lg border border-[var(--clear-color)]/40 bg-[var(--clear-color)]/15 p-4 text-sm text-[var(--clear-color)]">
          No structural ambiguity markers were returned.
        </p>
      ) : (
        <ul className="font-ui list-disc space-y-2 pl-5 text-sm text-[var(--text-primary)]">
          {explanations.slice(0, 4).map((item, index) => (
            <li key={`${item}-${index}`}>{item}</li>
          ))}
        </ul>
      )}
    </CollapsibleCard>
  );
}
