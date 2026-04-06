import { CollapsibleCard } from "./CollapsibleCard";

interface VerifiableRequirementsProps {
  verifiableRequirements?: string[];
}

export function VerifiableRequirements({ verifiableRequirements }: VerifiableRequirementsProps) {
  const requirements = verifiableRequirements ?? null;

  return (
    <CollapsibleCard title="Module 11 · Verifiable Requirements">
      {!requirements ? (
        <p className="font-ui rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-elevated)] p-4 text-sm text-[var(--text-secondary)]">—</p>
      ) : requirements.length === 0 ? (
        <p className="font-ui rounded-lg border border-[var(--clear-color)]/40 bg-[var(--clear-color)]/15 p-4 text-sm font-medium text-[var(--clear-color)]">
          No additional requirements — this statement is fully verifiable.
        </p>
      ) : (
        <ul className="font-ui list-disc space-y-2 pl-5 text-sm text-[var(--text-primary)]">
          {requirements.map((item, index) => (
            <li key={`${item}-${index}`}>{item}</li>
          ))}
        </ul>
      )}
    </CollapsibleCard>
  );
}
