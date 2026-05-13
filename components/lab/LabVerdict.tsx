import React from 'react';

interface LabVerdictProps extends React.HTMLAttributes<HTMLDivElement> {
  verdict: string;
  tier: 1 | 2 | 3;
}

export function LabVerdict({ verdict, tier, className = '', ...props }: LabVerdictProps) {
  const getDotColor = () => {
    switch (tier) {
      case 1: return 'bg-[var(--tier1-color)]';
      case 2: return 'bg-[var(--tier2-color)]';
      case 3: return 'bg-[var(--tier3-color)]';
      default: return 'bg-[var(--lab-muted)]';
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`} {...props}>
      <span className={`w-2 h-2 rounded-full shadow-[var(--shadow-pressed)] ${getDotColor()}`} />
      <span className="font-serif text-2xl font-semibold text-[var(--lab-ink)]">{verdict}</span>
    </div>
  );
}
