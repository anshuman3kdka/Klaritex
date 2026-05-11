import React from 'react';

interface LabToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  id?: string;
  'aria-label'?: string;
}

export function LabToggle({ checked, onChange, className = '', id, 'aria-label': ariaLabel }: LabToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      id={id}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex h-8 w-16 shrink-0 cursor-pointer items-center justify-center rounded-full
        transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lab-gold)]/50
        shadow-[var(--shadow-pressed)] bg-[var(--lab-surface)]
        ${className}
      `}
    >
      <span className="sr-only">Toggle</span>
      <span
        aria-hidden="true"
        className={`
          pointer-events-none inline-block h-6 w-6 rounded-full bg-[var(--lab-surface)]
          shadow-[var(--shadow-extruded)] ring-0 transition duration-200 ease-in-out
          ${checked ? 'translate-x-4 shadow-[var(--shadow-gold-glow)]' : '-translate-x-4'}
        `}
      />
    </button>
  );
}
