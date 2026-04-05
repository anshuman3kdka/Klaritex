import { AmbiguityScore } from "@/components/results/AmbiguityScore";
import { ClarityLevel } from "@/components/results/ClarityLevel";
import { ExposureCheck } from "@/components/results/ExposureCheck";
import { ScoreSummaryBar } from "@/components/results/ScoreSummaryBar";
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
    </section>
  );
}
