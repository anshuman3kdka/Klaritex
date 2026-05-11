import React from 'react';

interface LabButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  activeGlow?: boolean;
}

export function LabButton({ children, activeGlow, className = '', ...props }: LabButtonProps) {
  return (
    <button
      className={`
        bg-[var(--lab-surface)] text-[var(--lab-ink)] rounded-[8px] font-sans font-medium px-4 py-2
        shadow-[var(--shadow-extruded)] active:shadow-[var(--shadow-pressed)]
        transition-shadow duration-200 ease-in-out cursor-pointer
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lab-gold)]/50
        ${activeGlow ? 'shadow-[var(--shadow-gold-glow)]' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
