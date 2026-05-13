import { LabCard, LabLabel, LabWell } from "../lab";

interface VerifiableRequirementsProps {
  verifiableRequirements?: string[];
}

export function VerifiableRequirements({ verifiableRequirements }: VerifiableRequirementsProps) {
  const requirements = verifiableRequirements ?? null;

  return (
    <LabCard className="p-6">
      <LabLabel className="mb-6 block">Module 11 · Verifiable Requirements</LabLabel>
      {!requirements ? (
        <p className="font-mono text-sm text-[var(--lab-muted)]">—</p>
      ) : requirements.length === 0 ? (
        <LabWell className="p-4 flex items-center justify-center min-h-[100px]">
          <p className="font-sans text-sm font-semibold text-[var(--lab-green)] text-center">
            No additional requirements — this statement is fully verifiable.
          </p>
        </LabWell>
      ) : (
        <ul className="font-mono text-xs list-disc space-y-3 pl-5 text-[var(--lab-ink)]">
          {requirements.map((item, index) => (
            <li key={`${item}-${index}`} className="leading-relaxed">{item}</li>
          ))}
        </ul>
      )}
    </LabCard>
  );
}
