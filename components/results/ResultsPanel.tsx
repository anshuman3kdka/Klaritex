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
import type { AnalysisResult } from "@/lib/types";

interface ResultsPanelProps {
  result: AnalysisResult;
}

export function ResultsPanel({ result }: ResultsPanelProps) {
  return (
    <section className="mx-auto mt-6 w-full max-w-3xl space-y-4">
      <ScoreSummaryBar
        ambiguityScore={result.ambiguityScore}
        tier={result.tier}
        tierOverride={result.tierOverride}
        overrideRule={result.overrideRule}
      />

      <AmbiguityScore ambiguityScore={result.ambiguityScore} rawPenaltyScore={result.rawPenaltyScore} />

      <ClarityLevel clarityLevel={result.clarityLevel} />

      <ExposureCheck exposureCheck={result.exposureCheck} />

      <UnanchoredClaims unanchoredClaimsCount={result.unanchoredClaimsCount} />

      <VagueLines vagueLines={result.vagueLines} />

      <LowestAnchors lowestAnchors={result.lowestAnchors} />

      <ActionTalkRatio actionRatio={result.actionRatio} talkRatio={result.talkRatio} ratioLabel={result.ratioLabel} />

      <CommitmentSummary commitmentSummary={result.commitmentSummary} />

      <AmbiguityExplanation ambiguityExplanation={result.ambiguityExplanation} />

      <CommitmentBreakdown elements={result.elements} />

      <VerifiableRequirements verifiableRequirements={result.verifiableRequirements} />
    </section>
  );
}
