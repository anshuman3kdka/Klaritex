import { ActionTalkRatio } from "@/components/results/ActionTalkRatio";
import { AmbiguityExplanation } from "@/components/results/AmbiguityExplanation";
import { AmbiguityScore } from "@/components/results/AmbiguityScore";
import { ClarityLevel } from "@/components/results/ClarityLevel";
import { CommitmentBreakdown } from "@/components/results/CommitmentBreakdown";
import { CommitmentSummary } from "@/components/results/CommitmentSummary";
import { ExposureCheck } from "@/components/results/ExposureCheck";
import { LowestAnchors } from "@/components/results/LowestAnchors";
import { ResultsSkeleton } from "@/components/results/ResultsSkeleton";
import { ScoreSummaryBar } from "@/components/results/ScoreSummaryBar";
import { UnanchoredClaims } from "@/components/results/UnanchoredClaims";
import { VagueLines } from "@/components/results/VagueLines";
import { VerifiableRequirements } from "@/components/results/VerifiableRequirements";
import { useMemo } from "react";
import type { AnalysisResult } from "@/lib/types";

interface ResultsPanelProps {
  result?: AnalysisResult | null;
  isLoading?: boolean;
}

export function ResultsPanel({ result, isLoading = false }: ResultsPanelProps) {
  const resultKey = useMemo(() => (result ? "active" : "empty"), [result]);

  const animationStyle = (index: number) => ({
    animation: `slideUpFade 400ms cubic-bezier(0.22, 1, 0.36, 1) ${index * 80}ms both`,
  });

  return (
    <>
      {isLoading ? <ResultsSkeleton /> : null}

      {result ? (
        <section key={resultKey} className="mx-auto mt-6 w-full max-w-3xl space-y-4">
          <div style={animationStyle(0)}>
            <ScoreSummaryBar
              ambiguityScore={result.ambiguityScore}
              tier={result.tier}
              tierOverride={result.tierOverride}
              overrideRule={result.overrideRule}
            />
          </div>

          <div style={animationStyle(1)}>
            <AmbiguityScore
              ambiguityScore={result.ambiguityScore}
              rawPenaltyScore={result.rawPenaltyScore}
              tier={result.tier}
            />
          </div>

          <div style={animationStyle(2)}>
            <ClarityLevel clarityLevel={result.clarityLevel} />
          </div>

          <div style={animationStyle(3)}>
            <ExposureCheck elements={result.elements} />
          </div>

          <div style={animationStyle(4)}>
            <UnanchoredClaims unanchoredClaimsCount={result.unanchoredClaimsCount} />
          </div>

          <div style={animationStyle(5)}>
            <VagueLines vagueLines={result.vagueLines} />
          </div>

          <div style={animationStyle(6)}>
            <LowestAnchors lowestAnchors={result.lowestAnchors} />
          </div>

          <div style={animationStyle(7)}>
            <ActionTalkRatio actionRatio={result.actionRatio} talkRatio={result.talkRatio} ratioLabel={result.ratioLabel} />
          </div>

          <div style={animationStyle(8)}>
            <CommitmentSummary commitmentSummary={result.commitmentSummary} />
          </div>

          <div style={animationStyle(9)}>
            <AmbiguityExplanation ambiguityExplanation={result.ambiguityExplanation} />
          </div>

          <div style={animationStyle(10)}>
            <CommitmentBreakdown elements={result.elements} />
          </div>

          <div style={animationStyle(11)}>
            <VerifiableRequirements verifiableRequirements={result.verifiableRequirements} />
          </div>
        </section>
      ) : null}
    </>
  );
}
