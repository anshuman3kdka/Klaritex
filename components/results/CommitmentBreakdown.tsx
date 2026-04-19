"use client";

import { gsap } from "gsap";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { CommitmentElement, ElementStatus } from "@/lib/types";
import { CollapsibleCard } from "./CollapsibleCard";

interface CommitmentBreakdownProps {
  elements?: CommitmentElement[];
  defaultExpanded?: boolean;
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
    row: "k-row-stress-testable",
    badge: "k-breakdown-status-testable"
  },
  Contested: {
    row: "k-row-stress-contested",
    badge: "k-breakdown-status-contested"
  },
  Untestable: {
    row: "k-row-stress-untestable",
    badge: "k-breakdown-status-untestable"
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

export function CommitmentBreakdown({ elements, defaultExpanded = false }: CommitmentBreakdownProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("breakdown");
  const rootRef = useRef<HTMLDivElement>(null);
  const verdictRef = useRef<HTMLParagraphElement>(null);

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

  const animateVerdict = useCallback((delaySeconds = 0) => {
    if (!verdictRef.current || viewMode !== "stress") {
      return;
    }

    const characters = verdictRef.current.querySelectorAll(".k-verdict-char");
    gsap.set(characters, { opacity: 0 });
    gsap.to(characters, {
      opacity: 1,
      stagger: 0.028,
      duration: 0.01,
      ease: "none",
      delay: delaySeconds
    });
  }, [viewMode]);

  const animateTableReveal = useCallback((isModeTransition = false) => {
    if (!rootRef.current) {
      return;
    }

    const rows = rootRef.current.querySelectorAll<HTMLTableRowElement>(".breakdown-row");
    const badges = rootRef.current.querySelectorAll<HTMLElement>(".breakdown-badge");
    const accentBars = rootRef.current.querySelectorAll<HTMLElement>(".k-row-accent[data-active='true']");

    gsap.killTweensOf(rows);
    gsap.killTweensOf(badges);
    gsap.killTweensOf(accentBars);

    const timeline = gsap.timeline();

    if (isModeTransition) {
      timeline.to(rows, {
        opacity: 0.3,
        duration: 0.2,
        ease: "power1.out"
      });
    }

    if (viewMode !== "stress") {
      gsap.set(rows, { opacity: 1, filter: "grayscale(0%)", backgroundColor: "transparent" });
    }

    timeline.from(rows, {
      opacity: 0,
      y: 16,
      duration: 0.45,
      stagger: 0.09,
      ease: "power2.out",
      delay: 0.15
    });

    timeline.from(
      badges,
      {
        opacity: 0,
        scale: 0.7,
        duration: 0.25,
        stagger: 0.09,
        ease: "back.out(2)",
        delay: 0.06
      },
      "<"
    );

    timeline.fromTo(
      accentBars,
      { clipPath: "inset(0 0 100% 0)" },
      {
        clipPath: "inset(0 0 0% 0)",
        duration: 0.3,
        stagger: 0.09,
        ease: "power2.out"
      },
      "<"
    );

    if (viewMode === "stress") {
      rows.forEach((row) => {
        const stressClass = row.dataset.stressClass;

        if (stressClass === "Testable") {
          gsap.fromTo(
            row,
            { backgroundColor: "rgba(45,122,79,0.25)", opacity: 1, filter: "grayscale(0%)" },
            { backgroundColor: "rgba(45,122,79,0)", duration: 0.45, ease: "power2.out", delay: 0.35 }
          );
          return;
        }

        if (stressClass === "Contested") {
          gsap.fromTo(
            row,
            { backgroundColor: "rgba(184,134,11,0.25)", opacity: 0.92, filter: "grayscale(0%)" },
            { backgroundColor: "rgba(184,134,11,0)", duration: 0.45, ease: "power2.out", delay: 0.35 }
          );
          return;
        }

        gsap.to(row, {
          filter: "grayscale(70%)",
          opacity: 0.45,
          duration: 0.4,
          ease: "power2.out",
          delay: 0.3
        });
      });

      animateVerdict(1.25);
    }
  }, [animateVerdict, viewMode]);

  useEffect(() => {
    const handleModuleReveal = (event: Event) => {
      const customEvent = event as CustomEvent<{ moduleId?: string }>;
      if (customEvent.detail?.moduleId !== "module-10") {
        return;
      }

      animateTableReveal(false);
    };

    document.addEventListener("moduleRevealed", handleModuleReveal);
    return () => {
      document.removeEventListener("moduleRevealed", handleModuleReveal);
    };
  }, [animateTableReveal]);

  useEffect(() => {
    animateTableReveal(true);
  }, [animateTableReveal]);

  const handleViewChange = (nextView: ViewMode) => {
    if (nextView === viewMode) {
      return;
    }

    setViewMode(nextView);
  };

  return (
    <CollapsibleCard
      title="Module 10 · Commitment Breakdown"
      moduleId="module-10"
      defaultExpanded={defaultExpanded}
      headerAction={
        <div className="k-radius-secondary k-border-ui inline-flex items-center gap-1 bg-[var(--bg-primary)]/45 p-1">
          <button
            type="button"
            onClick={() => handleViewChange("breakdown")}
            className={`font-ui k-radius-secondary px-3 py-1.5 text-xs font-semibold transition-transform duration-100 ease-out transition-colors active:scale-[0.96] ${
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
            className={`font-ui k-stress-toggle k-radius-secondary px-3 py-1.5 text-xs font-semibold transition-transform duration-100 ease-out transition-colors active:scale-[0.96] ${
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
      <div ref={rootRef}>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="font-mono-ui border-b k-border-color text-left text-xs uppercase tracking-wide text-[var(--text-secondary)]">
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
                const rowClasses = `breakdown-row k-commitment-row border-b border-[var(--border)]/40 align-top ${
                  isStressMode
                    ? stressStyles[stressLabel].row
                    : "odd:bg-[var(--bg-surface)] even:bg-[var(--bg-elevated)]"
                }`;

                return (
                  <tr key={name} className={rowClasses} data-stress-class={stressLabel}>
                    <td className="font-ui relative py-3 pr-3 pl-3 font-medium text-[var(--text-primary)]">
                      <span
                        className="k-row-accent"
                        data-active={isStressMode && stressLabel === "Testable" ? "true" : "false"}
                      />
                      {name}
                    </td>
                    <td className="font-ui py-3 pr-3 text-[var(--text-secondary)]">{questionByElement[name]}</td>
                    <td className="font-ui py-3 pr-3 text-[var(--text-primary)]">{extractedValue}</td>
                    <td className="py-3">
                      {status ? (
                        <span
                          className={`k-badge module-status-badge breakdown-badge ${
                            viewMode === "stress" ? stressStyles[stressLabel].badge : statusStyles[status]
                          }`}
                        >
                          {viewMode === "stress" ? stressLabel : statusLabel[status]}
                        </span>
                      ) : (
                        <span
                          className={`breakdown-badge ${
                            viewMode === "stress"
                              ? "k-badge module-status-badge k-breakdown-status-untestable"
                              : "font-ui text-[var(--text-secondary)]"
                          }`}
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
          <p ref={verdictRef} className="font-display mt-4 text-sm italic text-[var(--text-gold)]" aria-label={verdictText}>
            {verdictText.split("").map((character, index) => (
              <span key={`${character}-${index}`} className="k-verdict-char">
                {character}
              </span>
            ))}
          </p>
        ) : null}
      </div>
    </CollapsibleCard>
  );
}
