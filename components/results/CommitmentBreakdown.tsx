"use client";

import { gsap } from "gsap";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { CommitmentElement, ElementStatus } from "@/lib/types";
import { LabCard, LabLabel, LabToggle, LabWell, LabPill } from "../lab";

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
    <LabCard className="p-6 relative">
      <div className="flex justify-between items-start mb-6">
        <LabLabel className="block">Module 10 · Commitment Breakdown</LabLabel>
        <div className="flex items-center gap-3">
          <LabLabel className="hidden sm:block">Stress Test</LabLabel>
          <LabToggle
            checked={viewMode === "stress"}
            onChange={(checked) => handleViewChange(checked ? "stress" : "breakdown")}
            aria-label="Toggle Stress Test Mode"
          />
        </div>
      </div>

      <div ref={rootRef} className="relative">
        {viewMode === "stress" && (
          <div className="absolute top-0 bottom-0 w-px bg-[var(--lab-gold)] blur-[1px] opacity-80 shadow-[0_0_8px_rgba(201,168,76,0.8)] z-10 animate-sweep pointer-events-none" />
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-spacing-y-2 border-separate">
            <thead>
              <tr className="text-left font-mono text-[10px] uppercase tracking-wider text-[var(--lab-muted)]">
                <th className="pb-2 px-3 font-normal">Component</th>
                <th className="pb-2 px-3 font-normal hidden sm:table-cell">Question</th>
                <th className="pb-2 px-3 font-normal">Extracted Value</th>
                <th className="pb-2 px-3 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {orderedElements.map((name, rowIndex) => {
                const element = elementMap.get(name);
                const status = element?.status ?? null;
                const extractedValue = status === "missing" || !status ? "—" : element?.notes || "—";
                const stressLabel = getStressLabel(status);

                const opacityClass = viewMode === "stress"
                  ? (stressLabel === "Testable" ? "opacity-100" : stressLabel === "Contested" ? "opacity-70" : "opacity-35")
                  : "opacity-100";

                const bgClass = viewMode === "stress" && stressLabel === "Testable"
                  ? "bg-[var(--lab-gold)]/10 shadow-[var(--shadow-pressed)]"
                  : "bg-[var(--lab-surface)] shadow-[var(--shadow-pressed)]";

                return (
                  <tr key={name} className={`transition-all duration-300 ${opacityClass} breakdown-row`} data-stress-class={stressLabel}>
                    <td className={`font-sans py-3 px-3 font-semibold text-[var(--lab-ink)] rounded-l-[8px] ${bgClass}`}>
                      {viewMode === "stress" && stressLabel === "Testable" && (
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--lab-gold)] rounded-l-[8px]" />
                      )}
                      {name}
                    </td>
                    <td className={`font-sans py-3 px-3 text-[var(--lab-muted)] hidden sm:table-cell ${bgClass}`}>
                      {questionByElement[name]}
                    </td>
                    <td className={`font-sans py-3 px-3 text-[var(--lab-ink)] ${bgClass}`}>
                      {extractedValue}
                    </td>
                    <td className={`py-3 px-3 rounded-r-[8px] ${bgClass}`}>
                      <LabPill status={viewMode === "stress" ? stressLabel : status ? statusLabel[status] : "Untestable" as any} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {viewMode === "stress" && (
          <LabWell className="mt-6 flex items-start gap-3 p-4  text-[var(--lab-gold)]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mt-0.5 shrink-0"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <div className="font-sans text-sm text-[var(--lab-ink)]/90">
              <strong className="text-[var(--lab-gold)]">Stress Test Active.</strong>
              <p className="mt-1 leading-relaxed text-[var(--lab-muted)]">
                The framework shifts from structural extraction to adversarial testing. Unclear or missing components are downgraded, showing only what can be definitively tested.
              </p>
            </div>
          </LabWell>
        )}
      </div>

      <style jsx>{`
        @keyframes sweep {
          0% { left: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
        .animate-sweep {
          animation: sweep 1.5s ease-in-out infinite;
        }
      `}</style>
    </LabCard>
  );
}
