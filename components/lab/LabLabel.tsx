import React from 'react';

interface LabLabelProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export function LabLabel({ children, className = '', ...props }: LabLabelProps) {
  return (
    <span className={`lab-label ${className}`} {...props}>
      {children}
    </span>
  );
}
