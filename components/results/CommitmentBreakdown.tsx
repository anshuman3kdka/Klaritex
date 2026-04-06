import type { CommitmentElement, ElementStatus } from "@/lib/types";

interface CommitmentBreakdownProps {
  elements?: CommitmentElement[];
}

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

export function CommitmentBreakdown({ elements }: CommitmentBreakdownProps) {
  const elementMap = new Map((elements ?? []).map((element) => [element.name, element]));

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">Module 10 · Commitment Breakdown</h3>

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

              return (
                <tr key={name} className="border-b border-slate-100 align-top">
                  <td className="py-3 pr-3 font-medium text-slate-900">{name}</td>
                  <td className="py-3 pr-3 text-slate-600">{questionByElement[name]}</td>
                  <td className="py-3 pr-3 text-slate-700">{extractedValue}</td>
                  <td className="py-3">
                    {status ? (
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${statusStyles[status]}`}
                      >
                        {statusLabel[status]}
                      </span>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </article>
  );
}
