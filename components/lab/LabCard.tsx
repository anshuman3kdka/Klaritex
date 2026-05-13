import React from 'react';

interface LabCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function LabCard({ children, className = '', ...props }: LabCardProps) {
  return (
    <div
      className={`bg-[var(--lab-surface)] rounded-[16px] shadow-[var(--shadow-extruded)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
