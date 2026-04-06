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
      <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Module 2 · Clarity Level</h3>
        <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">—</p>
      </article>
    );
  }

  const boundedLevel = Math.min(5, Math.max(1, Math.round(clarityLevel)));

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">Module 2 · Clarity Level</h3>

      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-900">
          Level {boundedLevel} · {clarityCopy[boundedLevel].label}
        </p>
        <p className="mt-2 text-sm text-slate-700">{clarityCopy[boundedLevel].description}</p>
      </div>
    </article>
  );
}
