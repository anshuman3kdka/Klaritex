"use client";

import { gsap } from "gsap";
import { ReactNode, useEffect, useId, useRef, useState } from "react";
import { useGSAPAccordion } from "./useGSAPAccordion";

interface ModuleAccordionProps {
  title: string;
  moduleId?: string;
  children: ReactNode;
  headerAction?: ReactNode;
  className?: string;
  defaultExpanded?: boolean;
}

export function ModuleAccordion({
  title,
  moduleId = "",
  children,
  headerAction,
  className = "",
  defaultExpanded = false,
}: ModuleAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const contentId = useId();
  const contentRef = useRef<HTMLDivElement>(null);
  const chevronRef = useRef<SVGSVGElement>(null);

  useGSAPAccordion(isExpanded, contentRef);

  useEffect(() => {
    setIsExpanded(defaultExpanded);
  }, [defaultExpanded]);

  useEffect(() => {
    if (!chevronRef.current) return;
    gsap.to(chevronRef.current, {
      rotate: isExpanded ? 180 : 0,
      duration: 0.2,
      ease: "back.out(1.4)",
    });
  }, [isExpanded]);

  return (
    <article className={`module-card flex flex-col ${className}`}>
      <button
        type="button"
        onClick={() => setIsExpanded((current) => !current)}
        className="flex w-full items-center justify-between bg-transparent p-5 text-left transition-colors duration-150 hover:bg-[#162035] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold-primary)]/50"
        aria-expanded={isExpanded}
        aria-controls={contentId}
      >
        <h3 className="k-module-label module-card-title flex-1">{title}</h3>

        <div className="flex items-center gap-3">
          {headerAction ? <div onClick={(e) => e.stopPropagation()}>{headerAction}</div> : null}
          <svg
            ref={chevronRef}
            className="h-4 w-4 text-[var(--text-secondary)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      <div
        id={contentId}
        ref={contentRef}
        data-module-id={moduleId}
        style={{ height: defaultExpanded ? "auto" : 0, opacity: defaultExpanded ? 1 : 0, overflow: "hidden" }}
      >
        <div className="border-t border-[var(--border)] p-5 pt-4">{children}</div>
      </div>
    </article>
  );
}

