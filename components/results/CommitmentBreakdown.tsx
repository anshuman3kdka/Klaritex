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
  clear: "bg-emerald-100 text-emerald-800 border-emerald-200",
  broad: "bg-amber-100 text-amber-800 border-amber-200",
  missing: "bg-rose-100 text-rose-800 border-rose-200"
};

const stressStyles: Record<StressLabel, { row: string; badge: string }> = {
  Testable: {
    row: "bg-emerald-50/70",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200"
  },
  Contested: {
    row: "opacity-80 bg-amber-50/60",
    badge: "bg-amber-100 text-amber-800 border-amber-200"
  },
  Untestable: {
    row: "opacity-40",
    badge: "bg-slate-100 text-slate-600 border-slate-200"
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
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-900">Module 10 · Commitment Breakdown</h3>

        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => setViewMode("breakdown")}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
              viewMode === "breakdown" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
            }`}
            aria-pressed={viewMode === "breakdown"}
          >
            Breakdown
          </button>
          <button
            type="button"
            onClick={() => setViewMode("stress")}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
              viewMode === "stress" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
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
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
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
                  ? `border-b border-slate-100 align-top transition ${stressStyles[stressLabel].row}`
                  : "border-b border-slate-100 align-top";

              return (
                <tr key={name} className={rowClasses}>
                  <td className="py-3 pr-3 font-medium text-slate-900">{name}</td>
                  <td className="py-3 pr-3 text-slate-600">{questionByElement[name]}</td>
                  <td className="py-3 pr-3 text-slate-700">{extractedValue}</td>
                  <td className="py-3">
                    {status ? (
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
                          viewMode === "stress" ? stressStyles[stressLabel].badge : statusStyles[status]
                        }`}
                      >
                        {viewMode === "stress" ? stressLabel : statusLabel[status]}
                      </span>
                    ) : (
                      <span
                        className={
                          viewMode === "stress"
                            ? "inline-flex rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600"
                            : "text-slate-500"
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
        <p className="mt-4 text-sm font-medium text-slate-700">{getStressVerdict(stressTestableCount)}</p>
      ) : null}
    </article>
  );
}
