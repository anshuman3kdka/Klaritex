interface VerifiableRequirementsProps {
  verifiableRequirements?: string[];
}

export function VerifiableRequirements({ verifiableRequirements }: VerifiableRequirementsProps) {
  const requirements = verifiableRequirements ?? null;

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">Module 11 · Verifiable Requirements</h3>

      {!requirements ? (
        <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">—</p>
      ) : requirements.length === 0 ? (
        <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
          No additional requirements — this statement is fully verifiable.
        </p>
      ) : (
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-800">
          {requirements.map((item, index) => (
            <li key={`${item}-${index}`}>{item}</li>
          ))}
        </ul>
      )}
    </article>
  );
}
