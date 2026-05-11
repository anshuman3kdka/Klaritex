/**
 * Lab — atomic Laboratory White primitives.
 *
 * These are the only building blocks Phase 3-6 components should
 * compose. Never reimplement neumorphic shadow logic at the call site;
 * always reach for these primitives so the system stays consistent.
 *
 * Refs:
 *   - Design/system_instructions.md_2.md
 *   - Design/03_deep_dive_neumorphism.md_2.md
 *   - Design/04_deep_dive_typographic_tension.md_2.md
 */
export { LabCard } from "./LabCard";
export type { LabCardProps } from "./LabCard";

export { LabWell } from "./LabWell";
export type { LabWellProps } from "./LabWell";

export { LabLabel } from "./LabLabel";
export type { LabLabelProps } from "./LabLabel";

export { LabPill } from "./LabPill";
export type { LabPillProps } from "./LabPill";

export { LabButton } from "./LabButton";
export type { LabButtonProps } from "./LabButton";

export { LabToggle } from "./LabToggle";
export type { LabToggleProps } from "./LabToggle";

export { LabDial } from "./LabDial";
export type { LabDialProps } from "./LabDial";

export { LabVerdict } from "./LabVerdict";
export type { LabVerdictProps } from "./LabVerdict";
