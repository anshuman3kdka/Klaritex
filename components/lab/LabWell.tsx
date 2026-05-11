import React from 'react';

interface LabWellProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function LabWell({ children, className = '', ...props }: LabWellProps) {
  return (
    <div
      className={`bg-[var(--lab-surface)] rounded-[8px] shadow-[var(--shadow-pressed)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
