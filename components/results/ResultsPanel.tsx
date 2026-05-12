import { ActionTalkRatio } from "@/components/results/ActionTalkRatio";
import { AmbiguityExplanation } from "@/components/results/AmbiguityExplanation";
import { ClarityLevel } from "@/components/results/ClarityLevel";
import { CommitmentBreakdown } from "@/components/results/CommitmentBreakdown";
import { CommitmentSummary } from "@/components/results/CommitmentSummary";
import { LowestAnchors } from "@/components/results/LowestAnchors";
import { ScoreSummaryBar } from "@/components/results/ScoreSummaryBar";
import { ScrollRevealCard } from "@/components/results/ScrollRevealCard";
import { UnanchoredClaims } from "@/components/results/UnanchoredClaims";
import { VagueLines } from "@/components/results/VagueLines";
import { VerifiableRequirements } from "@/components/results/VerifiableRequirements";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { APP_CONFIG } from "@/lib/config";
import type { AnalysisResult, AmbiguityTier } from "@/lib/types";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

interface ResultsPanelProps {
  result?: AnalysisResult | null;
  isLoading?: boolean;
}

type AmbientPreset = "green" | "amber" | "red";

const AMBIENT_PRESET_BY_TIER: Record<AmbiguityTier, AmbientPreset> = {
  1: "green",
  2: "amber",
  3: "red",
};

const SKELETON_CARD_HEIGHTS = [120, 132, 116, 128, 122, 148, 156, 120, 136, 144, 170];

const SKELETON_LINE_PATTERNS = [
  ["80%", "60%", "75%"],
  ["78%", "55%"],
  ["82%", "66%", "73%"],
  ["76%", "62%", "70%"],
  ["80%", "58%"],
  ["84%", "60%", "76%"],
  ["75%", "52%", "68%"],
  ["82%", "61%"],
  ["79%", "63%", "74%"],
  ["77%", "57%", "69%"],
  ["81%", "64%", "72%"],
];

const DYNAMIC_COMPONENT_SKELETON_INDICES = {
  ambiguityScore: 1,
  exposureCheck: 3,
} as const;

const DynamicAmbiguityScore = dynamic(
  () => import("@/components/results/AmbiguityScore").then((module) => module.AmbiguityScore),
  {
    loading: () => (
      <SkeletonCard
        minHeight={SKELETON_CARD_HEIGHTS[DYNAMIC_COMPONENT_SKELETON_INDICES.ambiguityScore]}
        lineWidths={SKELETON_LINE_PATTERNS[DYNAMIC_COMPONENT_SKELETON_INDICES.ambiguityScore]}
      />
    ),
  },
);

const DynamicExposureCheck = dynamic(
  () => import("@/components/results/ExposureCheck").then((module) => module.ExposureCheck),
  {
    loading: () => (
      <SkeletonCard
        minHeight={SKELETON_CARD_HEIGHTS[DYNAMIC_COMPONENT_SKELETON_INDICES.exposureCheck]}
        lineWidths={SKELETON_LINE_PATTERNS[DYNAMIC_COMPONENT_SKELETON_INDICES.exposureCheck]}
      />
    ),
  },
);

function ModuleLayer({ index, setActiveModuleIndex, children }: { index: number; setActiveModuleIndex: (index: number) => void; children: ReactNode }) {
  return (
    <div onMouseEnter={() => setActiveModuleIndex(index)} onFocus={() => setActiveModuleIndex(index)}>
      {children}
    </div>
  );
}

function PriorityModuleLayer({
  index,
  setActiveModuleIndex,
  children,
}: {
  index: number;
  setActiveModuleIndex: (index: number) => void;
  children: ReactNode;
}) {
  return (
    <div className="py-1 sm:py-1.5 md:py-2">
      <ModuleLayer index={index} setActiveModuleIndex={setActiveModuleIndex}>
        {children}
      </ModuleLayer>
    </div>
  );
}

function SectionSeparator({ label }: { label: string }) {
  return (
    <div className="pt-1">
      <div className="h-px w-full bg-white/10" aria-hidden="true" />
      <p className="k-module-label mt-2">{label}</p>
    </div>
  );
}

const MODULE_PHASES = [
  { label: "Summary", moduleIndexes: [0, 1, 2, 3] },
  { label: "Findings", moduleIndexes: [4, 5, 6, 7, 8] },
  { label: "Evidence Details", moduleIndexes: [9, 10, 11] },
] as const;

export function ResultsPanel({ result, isLoading = false }: ResultsPanelProps) {
  const resultKey = useMemo(() => (result ? "active" : "empty"), [result]);
  const [showSkeleton, setShowSkeleton] = useState(isLoading);
  const [animationKey, setAnimationKey] = useState(0);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [isExpandAllEnabled, setIsExpandAllEnabled] = useState(false);

  useEffect(() => {
    if (isLoading) {
      const showId = window.setTimeout(() => {
        setShowSkeleton(true);
      }, 0);
      return () => window.clearTimeout(showId);
    }

    const timer = window.setTimeout(() => setShowSkeleton(false), 300);
    return () => window.clearTimeout(timer);
  }, [isLoading]);

  useEffect(() => {
    if (result) {
      const animationId = window.setTimeout(() => {
        setAnimationKey((current) => current + 1);
        setActiveModuleIndex(0);
        setActivePhaseIndex(0);
        setIsExpandAllEnabled(false);
      }, 0);
      return () => window.clearTimeout(animationId);
    }
  }, [result]);

  const totalPhases = MODULE_PHASES.length;
  const progressPercent = ((activePhaseIndex + 1) / totalPhases) * 100;
  const ambientPreset = result ? AMBIENT_PRESET_BY_TIER[result.tier] : "green";

  const goToPhase = (phaseIndex: number) => {
    const boundedPhaseIndex = Math.max(0, Math.min(phaseIndex, totalPhases - 1));
    setActivePhaseIndex(boundedPhaseIndex);
    setActiveModuleIndex(MODULE_PHASES[boundedPhaseIndex].moduleIndexes[0] ?? 0);
  };

  const renderModule = (moduleIndex: number) => {
    switch (moduleIndex) {
      case 0:
        return (
          <PriorityModuleLayer index={0} setActiveModuleIndex={setActiveModuleIndex}>
            <ScoreSummaryBar
              ambiguityScore={result!.ambiguityScore}
              tier={result!.tier}
              tierOverride={result!.tierOverride}
              overrideRule={result!.overrideRule}
            />
          </PriorityModuleLayer>
        );
      case 1:
        return (
          <PriorityModuleLayer index={1} setActiveModuleIndex={setActiveModuleIndex}>
            <ScrollRevealCard>
              <DynamicAmbiguityScore
                ambiguityScore={result!.ambiguityScore}
                rawPenaltyScore={result!.rawPenaltyScore}
                tier={result!.tier}
                animationKey={animationKey}
                defaultExpanded
              />
            </ScrollRevealCard>
          </PriorityModuleLayer>
        );
      case 2:
        return (
          <ModuleLayer index={2} setActiveModuleIndex={setActiveModuleIndex}>
            <ScrollRevealCard>
              <ClarityLevel clarityLevel={result!.clarityLevel} />
            </ScrollRevealCard>
          </ModuleLayer>
        );
      case 3:
        return (
          <ModuleLayer index={3} setActiveModuleIndex={setActiveModuleIndex}>
            <ScrollRevealCard>
              <DynamicExposureCheck elements={result!.elements} />
            </ScrollRevealCard>
          </ModuleLayer>
        );
      case 4:
        return (
          <ModuleLayer index={4} setActiveModuleIndex={setActiveModuleIndex}>
            <ScrollRevealCard>
              <UnanchoredClaims unanchoredClaimsCount={result!.unanchoredClaimsCount} />
            </ScrollRevealCard>
          </ModuleLayer>
        );
      case 5:
        return (
          <ModuleLayer index={5} setActiveModuleIndex={setActiveModuleIndex}>
            <ScrollRevealCard>
              <VagueLines vagueLines={result!.vagueLines} />
            </ScrollRevealCard>
          </ModuleLayer>
        );
      case 6:
        return (
          <ModuleLayer index={6} setActiveModuleIndex={setActiveModuleIndex}>
            <ScrollRevealCard>
              <LowestAnchors lowestAnchors={result!.lowestAnchors} />
            </ScrollRevealCard>
          </ModuleLayer>
        );
      case 7:
        return (
          <ModuleLayer index={7} setActiveModuleIndex={setActiveModuleIndex}>
            <ScrollRevealCard>
              <ActionTalkRatio actionRatio={result!.actionRatio} talkRatio={result!.talkRatio} ratioLabel={result!.ratioLabel} />
            </ScrollRevealCard>
          </ModuleLayer>
        );
      case 8:
        return (
          <ModuleLayer index={8} setActiveModuleIndex={setActiveModuleIndex}>
            <ScrollRevealCard>
              <CommitmentSummary commitmentSummary={result!.commitmentSummary} />
            </ScrollRevealCard>
          </ModuleLayer>
        );
      case 9:
        return (
          <ModuleLayer index={9} setActiveModuleIndex={setActiveModuleIndex}>
            <ScrollRevealCard>
              <AmbiguityExplanation ambiguityExplanation={result!.ambiguityExplanation} />
            </ScrollRevealCard>
          </ModuleLayer>
        );
      case 10:
        return (
          <ModuleLayer index={10} setActiveModuleIndex={setActiveModuleIndex}>
            <ScrollRevealCard>
              <CommitmentBreakdown elements={result!.elements} defaultExpanded />
            </ScrollRevealCard>
          </ModuleLayer>
        );
      case 11:
        return (
          <ModuleLayer index={11} setActiveModuleIndex={setActiveModuleIndex}>
            <ScrollRevealCard>
              <VerifiableRequirements verifiableRequirements={result!.verifiableRequirements} />
            </ScrollRevealCard>
          </ModuleLayer>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {showSkeleton ? (
        <section
          className="mx-auto mt-6 w-full max-w-3xl space-y-3 sm:space-y-4 md:space-y-5 transition-opacity duration-300"
          style={{ opacity: isLoading ? 1 : 0 }}
          aria-live="polite"
          aria-busy={isLoading}
        >
          {SKELETON_CARD_HEIGHTS.map((height, index) => (
            <SkeletonCard key={`skeleton-card-${index}`} minHeight={height} lineWidths={SKELETON_LINE_PATTERNS[index]} />
          ))}
        </section>
      ) : null}

      {result ? (
        <section
          key={`${resultKey}-${animationKey}`}
          className="results-panel-shell relative mx-auto mt-6 w-full max-w-[1200px]"
          data-ambient-preset={ambientPreset}
          style={{ opacity: isLoading ? 0 : 1, transition: "opacity 400ms ease" }}
        >
          {/* Phase 4: Removed DynamicDecorativeThreeBackground for Laboratory White. */}

          <div className="relative z-10 flex flex-col lg:grid lg:grid-cols-3 gap-6">
            <div
              className="flex flex-col gap-6 px-1 col-span-3 lg:col-span-3"
              role="group"
              aria-label={`Results navigation. Phase ${activePhaseIndex + 1} of ${totalPhases}.`}
              onKeyDown={(event) => {
                if (isExpandAllEnabled) return;
                if (event.key === "ArrowRight") {
                  event.preventDefault();
                  goToPhase(activePhaseIndex + 1);
                }
                if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  goToPhase(activePhaseIndex - 1);
                }
              }}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-xs text-white/75">
                  <span aria-live="polite">
                    Phase {activePhaseIndex + 1} of {totalPhases}: {MODULE_PHASES[activePhaseIndex].label}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="rounded-md border border-white/20 px-2 py-1 text-xs font-medium text-white transition hover:border-white/40 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                      onClick={() => setIsExpandAllEnabled((current) => !current)}
                      aria-pressed={isExpandAllEnabled}
                      aria-label={isExpandAllEnabled ? "Collapse back to phased view" : "Expand all sections in one scrollable view"}
                    >
                      {isExpandAllEnabled ? "Use phased view" : "Expand all"}
                    </button>
                  </div>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuemin={1} aria-valuemax={totalPhases} aria-valuenow={activePhaseIndex + 1} aria-label="Analysis phase progress">
                  <div className="h-full rounded-full bg-white/70 transition-all duration-300 ease-out" style={{ width: `${progressPercent}%` }} />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    className="rounded-md border border-white/20 px-3 py-1.5 text-sm text-white transition hover:border-white/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                    onClick={() => goToPhase(activePhaseIndex - 1)}
                    disabled={isExpandAllEnabled || activePhaseIndex === 0}
                    aria-label={`Go to previous phase. Current phase is ${MODULE_PHASES[activePhaseIndex].label}.`}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-white/20 px-3 py-1.5 text-sm text-white transition hover:border-white/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                    onClick={() => goToPhase(activePhaseIndex + 1)}
                    disabled={isExpandAllEnabled || activePhaseIndex === totalPhases - 1}
                    aria-label={`Go to next phase. Current phase is ${MODULE_PHASES[activePhaseIndex].label}.`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

            {(isExpandAllEnabled ? MODULE_PHASES : [MODULE_PHASES[activePhaseIndex]]).map((phase) => (
              <div key={phase.label} className="space-y-3 sm:space-y-4 md:space-y-5">
                <SectionSeparator label={phase.label} />
                {phase.moduleIndexes.map((moduleIndex) => (
                  <div key={`module-${moduleIndex}`}>{renderModule(moduleIndex)}</div>
                ))}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
