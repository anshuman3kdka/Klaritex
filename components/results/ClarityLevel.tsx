import { LabCard, LabLabel, LabWell } from "../lab";

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
      <LabCard className="p-6">
        <LabLabel className="mb-4 block">Module 2 · Clarity Level</LabLabel>
        <p className="font-mono text-sm text-[var(--lab-muted)]">—</p>
      </LabCard>
    );
  }

  const boundedLevel = Math.min(5, Math.max(1, Math.round(clarityLevel)));

  return (
    <LabCard className="p-6">
      <LabLabel className="mb-4 block">Module 2 · Clarity Level</LabLabel>
      <LabWell className="p-5 flex flex-col gap-2">
        <p className="font-serif text-2xl font-semibold text-[var(--lab-ink)]">
          L{boundedLevel} · {clarityCopy[boundedLevel].label}
        </p>
        <p className="font-mono text-sm text-[var(--lab-muted)]">{clarityCopy[boundedLevel].description}</p>
      </LabWell>
    </LabCard>
  );
}
