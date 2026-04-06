interface ActionTalkRatioProps {
  actionRatio?: number;
  talkRatio?: number;
  ratioLabel?: string;
}

export function ActionTalkRatio({ actionRatio, talkRatio, ratioLabel }: ActionTalkRatioProps) {
  const hasRatios = typeof actionRatio === "number" && typeof talkRatio === "number";
  const safeAction = hasRatios ? Math.min(100, Math.max(0, actionRatio)) : 0;
  const safeTalk = hasRatios ? Math.min(100, Math.max(0, talkRatio)) : 0;

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">Module 7 · Action vs Talk Ratio</h3>

      {!hasRatios ? (
        <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">—</p>
      ) : (
        <>
          <p className="mt-4 text-sm font-semibold text-slate-900">
            {safeAction}% Action / {safeTalk}% Talk
          </p>

          <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
            <div className="flex h-full w-full">
              <div className="h-full bg-emerald-500" style={{ width: `${safeAction}%` }} />
              <div className="h-full bg-rose-500" style={{ width: `${safeTalk}%` }} />
            </div>
          </div>

          <p className="mt-3 inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
            {ratioLabel || "—"}
          </p>
        </>
      )}
    </article>
  );
}
