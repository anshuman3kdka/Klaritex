"use client";

import { useMemo, useState } from "react";

import type { CommitmentElement, ElementStatus } from "@/lib/types";

interface CommitmentBreakdownProps {
  elements?: CommitmentElement[];
}

type ViewMode = "breakdown" | "stress";
type StressLabel = "Testable" | "Contested" | "Untestable";

const questionByElement: Record<string, string> = {
  Who: "Who is doing it?",
  Action: "What happens?",
  Object: "Who is affected?",
  Measure: "How do we know?",
  Timeline: "When?",
  Premise: "Why?"
};

const orderedElements = ["Who", "Action", "Object", "Measure", "Timeline", "Premise"];

const statusLabel: Record<ElementStatus, "Locked In" | "Unclear" | "Missing"> = {
  clear: "Locked In",
  broad: "Unclear",
  missing: "Missing"
};

const statusStyles: Record<ElementStatus, string> = {
  clear: "k-status-clear",
  broad: "k-status-broad",
  missing: "k-status-missing"
};

const stressStyles: Record<StressLabel, { row: string; badge: string }> = {
  Testable: {
    row: "border-l-2 border-[var(--border-accent)] opacity-100",
    badge: "k-status-testable"
  },
  Contested: {
    row: "bg-[var(--tier2-color)]/8 opacity-80",
    badge: "k-status-contested"
  },
  Untestable: {
    row: "opacity-35 grayscale",
    badge: "k-status-untestable"
  }
};

function getStressLabel(status: ElementStatus | null): StressLabel {
  if (status === "clear") {
    return "Testable";
  }

  if (status === "broad") {
    return "Contested";
  }

  return "Untestable";
}

function getStressVerdict(testableCount: number): string {
  if (testableCount >= 5) {
    return "This statement is largely stress-testable.";
  }

  if (testableCount >= 3) {
    return `Partial accountability — ${testableCount} of 6 elements can be verified in future.`;
  }

  if (testableCount >= 1) {
    return "Mostly unverifiable. Little can be held to later.";
  }

  return "This statement is accountability-proof. Nothing can be verified.";
}

export function CommitmentBreakdown({ elements }: CommitmentBreakdownProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("breakdown");

  const elementMap = useMemo(
    () => new Map((elements ?? []).map((element) => [element.name, element])),
    [elements]
  );

  const stressLabels = useMemo(
    () => orderedElements.map((name) => getStressLabel(elementMap.get(name)?.status ?? null)),
    [elementMap]
  );

  const stressTestableCount = useMemo(
    () => stressLabels.filter((label) => label === "Testable").length,
    [stressLabels]
  );

  return (
    <article className="k-module-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="k-module-label">Module 10 · Commitment Breakdown</h3>

        <div className="inline-flex border-b border-[var(--border)]">
          <button
            type="button"
            onClick={() => setViewMode("breakdown")}
            className={`font-ui border-b-2 px-3 py-1.5 text-xs font-semibold transition ${
              viewMode === "breakdown"
                ? "border-[var(--border-accent)] text-[var(--text-gold)]"
                : "border-transparent text-[var(--text-secondary)]"
            }`}
            aria-pressed={viewMode === "breakdown"}
          >
            Breakdown
          </button>
          <button
            type="button"
            onClick={() => setViewMode("stress")}
            className={`font-ui border-b-2 px-3 py-1.5 text-xs font-semibold transition ${
              viewMode === "stress"
                ? "border-[var(--border-accent)] text-[var(--text-gold)]"
                : "border-transparent text-[var(--text-secondary)]"
            }`}
            aria-pressed={viewMode === "stress"}
          >
            Stress Test
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="font-mono-ui border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--text-secondary)]">
              <th className="pb-2 pr-3">Component</th>
              <th className="pb-2 pr-3">Question</th>
              <th className="pb-2 pr-3">Extracted Value</th>
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {orderedElements.map((name) => {
              const element = elementMap.get(name);
              const status: ElementStatus | null = element?.status ?? null;
              const extractedValue = element?.status === "missing" ? "—" : element?.notes || "—";
              const stressLabel = getStressLabel(status);
              const rowClasses =
                viewMode === "stress"
                  ? `border-b border-[var(--border)]/40 align-top transition ${stressStyles[stressLabel].row}`
                  : "border-b border-[var(--border)]/40 align-top odd:bg-[var(--bg-surface)] even:bg-[var(--bg-elevated)]";

              return (
                <tr key={name} className={rowClasses}>
                  <td className="font-ui py-3 pr-3 font-medium text-[var(--text-primary)]">{name}</td>
                  <td className="font-ui py-3 pr-3 text-[var(--text-secondary)]">{questionByElement[name]}</td>
                  <td className="font-ui py-3 pr-3 text-[var(--text-primary)]">{extractedValue}</td>
                  <td className="py-3">
                    {status ? (
                      <span
                        className={`k-badge ${
                          viewMode === "stress" ? stressStyles[stressLabel].badge : statusStyles[status]
                        }`}
                      >
                        {viewMode === "stress" ? stressLabel : statusLabel[status]}
                      </span>
                    ) : (
                      <span
                        className={
                          viewMode === "stress"
                            ? "k-badge k-status-untestable"
                            : "font-ui text-[var(--text-secondary)]"
                        }
                      >
                        {viewMode === "stress" ? "Untestable" : "—"}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {viewMode === "stress" ? (
        <p className="font-display mt-4 text-sm italic text-[var(--text-gold)]">{getStressVerdict(stressTestableCount)}</p>
      ) : null}
    </article>
  );
}
