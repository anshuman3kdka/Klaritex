import { ActionTalkRatio } from "@/components/results/ActionTalkRatio";
import { AmbiguityExplanation } from "@/components/results/AmbiguityExplanation";
import { AmbiguityScore } from "@/components/results/AmbiguityScore";
import { ClarityLevel } from "@/components/results/ClarityLevel";
import { CommitmentBreakdown } from "@/components/results/CommitmentBreakdown";
import { CommitmentSummary } from "@/components/results/CommitmentSummary";
import { ExposureCheck } from "@/components/results/ExposureCheck";
import { LowestAnchors } from "@/components/results/LowestAnchors";
import { ScoreSummaryBar } from "@/components/results/ScoreSummaryBar";
import { UnanchoredClaims } from "@/components/results/UnanchoredClaims";
import { VagueLines } from "@/components/results/VagueLines";
import { VerifiableRequirements } from "@/components/results/VerifiableRequirements";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { useEffect, useMemo, useState } from "react";
import type { AnalysisResult } from "@/lib/types";

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

export function ResultsPanel({ result, isLoading = false }: ResultsPanelProps) {
  const resultKey = useMemo(() => (result ? "active" : "empty"), [result]);
  const [showSkeleton, setShowSkeleton] = useState(isLoading);

  useEffect(() => {
    if (isLoading) {
      setShowSkeleton(true);
      return;
    }

    const timer = window.setTimeout(() => setShowSkeleton(false), 300);
    return () => window.clearTimeout(timer);
  }, [isLoading]);

  const contentAnimationStyle = (index: number) => ({
    animation: `slideUpFade 400ms cubic-bezier(0.22, 1, 0.36, 1) ${index * 40}ms both`,
  });

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
          key={resultKey}
          className="mx-auto mt-6 w-full max-w-3xl space-y-4"
          style={{ opacity: isLoading ? 0 : 1, transition: "opacity 400ms ease" }}
        >
          <div style={contentAnimationStyle(0)}>
            <ScoreSummaryBar
              ambiguityScore={result.ambiguityScore}
              tier={result.tier}
              tierOverride={result.tierOverride}
              overrideRule={result.overrideRule}
            />
          </div>

          <div style={contentAnimationStyle(1)}>
            <AmbiguityScore
              ambiguityScore={result.ambiguityScore}
              rawPenaltyScore={result.rawPenaltyScore}
              tier={result.tier}
            />
          </div>

          <div style={contentAnimationStyle(2)}>
            <ClarityLevel clarityLevel={result.clarityLevel} />
          </div>

          <div style={contentAnimationStyle(3)}>
            <ExposureCheck elements={result.elements} />
          </div>

          <div style={contentAnimationStyle(4)}>
            <UnanchoredClaims unanchoredClaimsCount={result.unanchoredClaimsCount} />
          </div>

          <div style={contentAnimationStyle(5)}>
            <VagueLines vagueLines={result.vagueLines} />
          </div>

          <div style={contentAnimationStyle(6)}>
            <LowestAnchors lowestAnchors={result.lowestAnchors} />
          </div>

          <div style={contentAnimationStyle(7)}>
            <ActionTalkRatio actionRatio={result.actionRatio} talkRatio={result.talkRatio} ratioLabel={result.ratioLabel} />
          </div>

          <div style={contentAnimationStyle(8)}>
            <CommitmentSummary commitmentSummary={result.commitmentSummary} />
          </div>

          <div style={contentAnimationStyle(9)}>
            <AmbiguityExplanation ambiguityExplanation={result.ambiguityExplanation} />
          </div>

          <div style={contentAnimationStyle(10)}>
            <CommitmentBreakdown elements={result.elements} />
          </div>

          <div style={contentAnimationStyle(11)}>
            <VerifiableRequirements verifiableRequirements={result.verifiableRequirements} />
          </div>
        </section>
      ) : null}
    </>
  );
}
