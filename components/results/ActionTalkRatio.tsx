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
    <article className="k-module-card p-5">
      <h3 className="k-module-label">Module 7 · Action vs Talk Ratio</h3>

      {!hasRatios ? (
        <p className="font-ui mt-4 rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-elevated)] p-4 text-sm text-[var(--text-secondary)]">—</p>
      ) : (
        <>
          <p className="font-mono-ui mt-4 text-sm text-[var(--text-primary)]">
            {safeAction}% Action / {safeTalk}% Talk
          </p>

          <div className="mt-3 h-3 overflow-hidden rounded-full bg-[var(--bg-primary)]">
            <div className="flex h-full w-full">
              <div className="h-full bg-[var(--gold-primary)]" style={{ width: `${safeAction}%` }} />
              <div className="h-full bg-[var(--tier3-color)]" style={{ width: `${safeTalk}%` }} />
            </div>
          </div>

          <p className="font-mono-ui mt-3 inline-flex rounded-sm border border-[var(--gold-muted)]/70 bg-[var(--gold-primary)]/14 px-3 py-1 text-xs uppercase tracking-[0.15em] text-[var(--text-gold)]">
            {ratioLabel || "—"}
          </p>
        </>
      )}
    </article>
  );
}
