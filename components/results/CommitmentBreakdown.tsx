"use client";

import { useEffect, useMemo, useState } from "react";

import type { CommitmentElement, ElementStatus } from "@/lib/types";
import { CollapsibleCard } from "./CollapsibleCard";

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
    row: "k-row-stress-untestable",
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

function useTypewriter(text: string, speed: number): string {
  const [visibleText, setVisibleText] = useState("");

  useEffect(() => {
    if (!text) {
      setVisibleText("");
      return;
    }

    setVisibleText("");
    let currentIndex = 0;
    const interval = window.setInterval(() => {
      currentIndex += 1;
      setVisibleText(text.slice(0, currentIndex));

      if (currentIndex >= text.length) {
        window.clearInterval(interval);
      }
    }, speed);

    return () => {
      window.clearInterval(interval);
    };
  }, [speed, text]);

  return visibleText;
}

export function CommitmentBreakdown({ elements }: CommitmentBreakdownProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("breakdown");
  const [stressActivationTick, setStressActivationTick] = useState(0);

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

  const verdictText = getStressVerdict(stressTestableCount);
  const typedVerdict = useTypewriter(viewMode === "stress" ? verdictText : "", 30);

  const handleViewChange = (nextView: ViewMode) => {
    if (nextView === viewMode) {
      return;
    }

    if (nextView === "stress") {
      setStressActivationTick((previous) => previous + 1);
    }

    setViewMode(nextView);
  };

  return (
    <CollapsibleCard
      title="Module 10 · Commitment Breakdown"
      headerAction={
        <div className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--bg-primary)]/45 p-1">
          <button
            type="button"
            onClick={() => handleViewChange("breakdown")}
            className={`font-ui rounded px-3 py-1.5 text-xs font-semibold transition-transform duration-100 ease-out transition-colors active:scale-[0.96] ${
              viewMode === "breakdown"
                ? "bg-[var(--bg-elevated)] text-[var(--text-gold)]"
                : "bg-transparent text-[var(--text-secondary)]"
            }`}
            style={{ transitionDuration: "100ms, 300ms" }}
            aria-pressed={viewMode === "breakdown"}
          >
            Breakdown
          </button>
          <button
            type="button"
            onClick={() => handleViewChange("stress")}
            className={`font-ui k-stress-toggle rounded px-3 py-1.5 text-xs font-semibold transition-transform duration-100 ease-out transition-colors active:scale-[0.96] ${
              viewMode === "stress"
                ? "bg-[var(--gold-primary)]/18 text-[var(--text-gold)]"
                : "bg-transparent text-[var(--text-secondary)]"
            }`}
            style={{ transitionDuration: "100ms, 300ms" }}
            aria-pressed={viewMode === "stress"}
          >
            Stress Test
          </button>
        </div>
      }
    >
      <div className="overflow-x-auto">
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
              const isStressMode = viewMode === "stress";
              const rowClasses = `k-commitment-row border-b border-[var(--border)]/40 align-top ${
                isStressMode
                  ? `${stressStyles[stressLabel].row} ${stressActivationTick > 0 ? `k-row-enter-${stressLabel.toLowerCase()}` : ""}`
                  : "odd:bg-[var(--bg-surface)] even:bg-[var(--bg-elevated)]"
              }`;

              return (
                <tr key={name} className={rowClasses}>
                  <td className="font-ui py-3 pr-3 font-medium text-[var(--text-primary)]">{name}</td>
                  <td className="font-ui py-3 pr-3 text-[var(--text-secondary)]">{questionByElement[name]}</td>
                  <td className="font-ui py-3 pr-3 text-[var(--text-primary)]">{extractedValue}</td>
                  <td className="py-3">
                    {status ? (
                      <span
                        className={`k-badge module-status-badge ${
                          viewMode === "stress" ? stressStyles[stressLabel].badge : statusStyles[status]
                        }`}
                      >
                        {viewMode === "stress" ? stressLabel : statusLabel[status]}
                      </span>
                    ) : (
                      <span
                        className={
                          viewMode === "stress"
                            ? "k-badge module-status-badge k-status-untestable"
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
        <p className="font-display mt-4 text-sm italic text-[var(--text-gold)]">{typedVerdict}</p>
      ) : null}
    </CollapsibleCard>
  );
}
