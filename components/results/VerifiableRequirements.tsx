interface VerifiableRequirementsProps {
  verifiableRequirements?: string[];
}

export function VerifiableRequirements({ verifiableRequirements }: VerifiableRequirementsProps) {
  const requirements = verifiableRequirements ?? null;

  return (
    <article className="k-module-card p-5">
      <h3 className="k-module-label">Module 11 · Verifiable Requirements</h3>

      {!requirements ? (
        <p className="font-ui mt-4 rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-elevated)] p-4 text-sm text-[var(--text-secondary)]">—</p>
      ) : requirements.length === 0 ? (
        <p className="font-ui mt-4 rounded-lg border border-[var(--clear-color)]/40 bg-[var(--clear-color)]/15 p-4 text-sm font-medium text-[var(--clear-color)]">
          No additional requirements — this statement is fully verifiable.
        </p>
      ) : (
        <ul className="font-ui mt-4 list-disc space-y-2 pl-5 text-sm text-[var(--text-primary)]">
          {requirements.map((item, index) => (
            <li key={`${item}-${index}`}>{item}</li>
          ))}
        </ul>
      )}
    </article>
  );
}
