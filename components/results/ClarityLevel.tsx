interface ClarityLevelProps {
  clarityLevel?: number;
}

const clarityCopy: Record<number, { label: string; description: string }> = {
  1: {
    label: "Solid",
    description: "Statement is clear and structurally complete. High accountability."
  },
  2: {
    label: "Workable",
    description: "Statement has real content but some gaps. Can be verified with effort."
  },
  3: {
    label: "Fragmented",
    description: "Key elements are missing. Accountability requires significant inference."
  },
  4: {
    label: "Hollow",
    description: "Statement is mostly structural noise. Minimal real commitment."
  },
  5: {
    label: "Rhetorical",
    description: "Statement is rhetorical. Contains no verifiable accountability."
  }
};

export function ClarityLevel({ clarityLevel }: ClarityLevelProps) {
  if (typeof clarityLevel !== "number") {
    return (
      <article className="k-module-card p-5">
        <h3 className="k-module-label">Module 2 · Clarity Level</h3>
        <p className="font-ui mt-4 rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-elevated)] p-4 text-sm text-[var(--text-secondary)]">—</p>
      </article>
    );
  }

  const boundedLevel = Math.min(5, Math.max(1, Math.round(clarityLevel)));

  return (
    <article className="k-module-card p-5">
      <h3 className="k-module-label">Module 2 · Clarity Level</h3>

      <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
        <p className="font-ui text-sm font-semibold text-[var(--text-primary)]">
          Level {boundedLevel} · {clarityCopy[boundedLevel].label}
        </p>
        <p className="font-ui mt-2 text-sm text-[var(--text-secondary)]">{clarityCopy[boundedLevel].description}</p>
      </div>
    </article>
  );
}
