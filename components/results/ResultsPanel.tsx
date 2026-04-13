import { ActionTalkRatio } from "@/components/results/ActionTalkRatio";
import { AmbiguityExplanation } from "@/components/results/AmbiguityExplanation";
import { AmbiguityScore } from "@/components/results/AmbiguityScore";
import { ClarityLevel } from "@/components/results/ClarityLevel";
import { CommitmentBreakdown } from "@/components/results/CommitmentBreakdown";
import { CommitmentSummary } from "@/components/results/CommitmentSummary";
import { DecorativeThreeBackground } from "@/components/results/DecorativeThreeBackground";
import { ExposureCheck } from "@/components/results/ExposureCheck";
import { LowestAnchors } from "@/components/results/LowestAnchors";
import { ScoreSummaryBar } from "@/components/results/ScoreSummaryBar";
import { ScrollRevealCard } from "@/components/results/ScrollRevealCard";
import { UnanchoredClaims } from "@/components/results/UnanchoredClaims";
import { VagueLines } from "@/components/results/VagueLines";
import { VerifiableRequirements } from "@/components/results/VerifiableRequirements";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { APP_CONFIG } from "@/lib/config";
import type { AnalysisResult } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

interface ResultsPanelProps {
  result?: AnalysisResult | null;
  isLoading?: boolean;
}

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

function ModuleLayer({ index, setActiveModuleIndex, children }: { index: number; setActiveModuleIndex: (index: number) => void; children: ReactNode }) {
  return (
    <div onMouseEnter={() => setActiveModuleIndex(index)} onFocus={() => setActiveModuleIndex(index)}>
      {children}
    </div>
  );
}

export function ResultsPanel({ result, isLoading = false }: ResultsPanelProps) {
  const resultKey = useMemo(() => (result ? "active" : "empty"), [result]);
  const [showSkeleton, setShowSkeleton] = useState(isLoading);
  const [animationKey, setAnimationKey] = useState(0);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);

  useEffect(() => {
    if (isLoading) {
      setShowSkeleton(true);
      return;
    }

    const timer = window.setTimeout(() => setShowSkeleton(false), 300);
    return () => window.clearTimeout(timer);
  }, [isLoading]);

  useEffect(() => {
    if (result) {
      setAnimationKey((current) => current + 1);
      setActiveModuleIndex(0);
    }
  }, [result]);

  return (
    <>
      {showSkeleton ? (
        <section
          className="mx-auto mt-6 w-full max-w-3xl space-y-4 transition-opacity duration-300"
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
          className="relative mx-auto mt-6 w-full max-w-3xl overflow-hidden rounded-xl"
          style={{ opacity: isLoading ? 0 : 1, transition: "opacity 400ms ease" }}
        >
          <DecorativeThreeBackground
            tier={result.tier}
            activeModuleIndex={activeModuleIndex}
            isEnabled={APP_CONFIG.enableResultsThreeBackground}
          />

          <div className="relative z-10 space-y-4">
            <ModuleLayer index={0} setActiveModuleIndex={setActiveModuleIndex}>
              <ScoreSummaryBar
                ambiguityScore={result.ambiguityScore}
                tier={result.tier}
                tierOverride={result.tierOverride}
                overrideRule={result.overrideRule}
              />
            </ModuleLayer>

            <ModuleLayer index={1} setActiveModuleIndex={setActiveModuleIndex}>
              <ScrollRevealCard>
                <AmbiguityScore
                  ambiguityScore={result.ambiguityScore}
                  rawPenaltyScore={result.rawPenaltyScore}
                  tier={result.tier}
                  animationKey={animationKey}
                  defaultExpanded
                />
              </ScrollRevealCard>
            </ModuleLayer>

            <ModuleLayer index={2} setActiveModuleIndex={setActiveModuleIndex}>
              <ScrollRevealCard>
                <ClarityLevel clarityLevel={result.clarityLevel} />
              </ScrollRevealCard>
            </ModuleLayer>

            <ModuleLayer index={3} setActiveModuleIndex={setActiveModuleIndex}>
              <ScrollRevealCard>
                <ExposureCheck elements={result.elements} />
              </ScrollRevealCard>
            </ModuleLayer>

            <ModuleLayer index={4} setActiveModuleIndex={setActiveModuleIndex}>
              <ScrollRevealCard>
                <UnanchoredClaims unanchoredClaimsCount={result.unanchoredClaimsCount} />
              </ScrollRevealCard>
            </ModuleLayer>

            <ModuleLayer index={5} setActiveModuleIndex={setActiveModuleIndex}>
              <ScrollRevealCard>
                <VagueLines vagueLines={result.vagueLines} />
              </ScrollRevealCard>
            </ModuleLayer>

            <ModuleLayer index={6} setActiveModuleIndex={setActiveModuleIndex}>
              <ScrollRevealCard>
                <LowestAnchors lowestAnchors={result.lowestAnchors} />
              </ScrollRevealCard>
            </ModuleLayer>

            <ModuleLayer index={7} setActiveModuleIndex={setActiveModuleIndex}>
              <ScrollRevealCard>
                <ActionTalkRatio actionRatio={result.actionRatio} talkRatio={result.talkRatio} ratioLabel={result.ratioLabel} />
              </ScrollRevealCard>
            </ModuleLayer>

            <ModuleLayer index={8} setActiveModuleIndex={setActiveModuleIndex}>
              <ScrollRevealCard>
                <CommitmentSummary commitmentSummary={result.commitmentSummary} />
              </ScrollRevealCard>
            </ModuleLayer>

            <ModuleLayer index={9} setActiveModuleIndex={setActiveModuleIndex}>
              <ScrollRevealCard>
                <AmbiguityExplanation ambiguityExplanation={result.ambiguityExplanation} />
              </ScrollRevealCard>
            </ModuleLayer>

            <ModuleLayer index={10} setActiveModuleIndex={setActiveModuleIndex}>
              <ScrollRevealCard>
                <CommitmentBreakdown elements={result.elements} defaultExpanded />
              </ScrollRevealCard>
            </ModuleLayer>

            <ModuleLayer index={11} setActiveModuleIndex={setActiveModuleIndex}>
              <ScrollRevealCard>
                <VerifiableRequirements verifiableRequirements={result.verifiableRequirements} />
              </ScrollRevealCard>
            </ModuleLayer>
          </div>
        </section>
      ) : null}
    </>
  );
}
