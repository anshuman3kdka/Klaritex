import React from 'react';
import { LabCard, LabLabel } from "../lab";

interface CollapsibleCardProps {
  title: string;
  moduleId: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

export function CollapsibleCard({ title, children }: CollapsibleCardProps) {
  // Phase 4 simplification for Laboratory White: No collapsibility needed in the 3-col grid,
  // we just wrap it in a LabCard. But some modules we refactored directly use LabCard now.
  // This is left as a thin wrapper for any non-migrated modules.
  return (
    <LabCard className="p-6">
      <LabLabel className="mb-6 block">{title}</LabLabel>
      {children}
    </LabCard>
  );
}
