import React from 'react';

interface LabDialProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number | string;
  label?: string;
  colorClass?: string;
}

export function LabDial({ value, label, colorClass = 'text-[var(--lab-ink)]', className = '', ...props }: LabDialProps) {
  return (
    <div className={`relative w-40 h-40 rounded-full shadow-[var(--shadow-extruded)] bg-[var(--lab-surface)] flex items-center justify-center p-4 ${className}`} {...props}>
      <div className="absolute inset-2 rounded-full shadow-[var(--shadow-pressed)] bg-[var(--lab-surface)] flex flex-col items-center justify-center pointer-events-none">
        <span className={`font-serif text-5xl font-semibold ${colorClass}`}>{value}</span>
        {label && <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--lab-muted)] mt-1">{label}</span>}
      </div>
    </div>
  );
}
