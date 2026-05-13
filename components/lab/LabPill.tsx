import React from 'react';

type PillStatus = 'Locked In' | 'Unclear' | 'Missing' | 'Testable' | 'Contested' | 'Untestable';

interface LabPillProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: PillStatus;
}

export function LabPill({ status, className = '', ...props }: LabPillProps) {
  // We'll define simple semantic colors for Phase 2, relying on our variables where we can
  const getColors = () => {
    switch (status) {
      case 'Locked In':
        return 'text-[var(--clear-color)] bg-[var(--clear-color)]/10';
      case 'Testable':
        return 'text-[var(--lab-gold)] bg-[var(--lab-gold)]/12 shadow-[var(--shadow-extruded)]';
      case 'Unclear':
      case 'Contested':
        return 'text-[var(--broad-color)] bg-[var(--broad-color)]/10';
      case 'Missing':
      case 'Untestable':
        return 'text-[var(--missing-color)] bg-[var(--missing-color)]/10';
      default:
        return 'text-[var(--lab-muted)] bg-[var(--lab-muted)]/10';
    }
  };

  return (
    <span
      className={`font-mono text-[11px] uppercase tracking-[0.04em] px-2 py-0.5 rounded-full inline-flex items-center ${getColors()} ${className}`}
      {...props}
    >
      {status}
    </span>
  );
}
