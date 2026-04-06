"use client";

import { useState, useRef, useEffect, ReactNode } from "react";

interface CollapsibleCardProps {
  title: string;
  children: ReactNode;
  headerAction?: ReactNode;
  className?: string;
  defaultExpanded?: boolean;
}

export function CollapsibleCard({
  title,
  children,
  headerAction,
  className = "",
  defaultExpanded = false,
}: CollapsibleCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <article className={`k-module-card flex flex-col ${className}`}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-[var(--bg-elevated)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-accent)]"
        aria-expanded={isExpanded}
      >
        <h3 className="k-module-label flex-1">{title}</h3>

        <div className="flex items-center gap-3">
          {headerAction && (
            <div onClick={(e) => e.stopPropagation()}>{headerAction}</div>
          )}
          <svg
            className={`h-4 w-4 text-[var(--text-secondary)] transition-transform duration-300 ${
              isExpanded ? "rotate-180" : ""
            }`}
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
        className="grid transition-[grid-template-rows,opacity] duration-300 ease-out"
        style={{
          gridTemplateRows: isExpanded ? "1fr" : "0fr",
          opacity: isExpanded ? 1 : 0,
        }}
      >
        <div className="overflow-hidden">
          <div className="border-t border-[var(--border)] p-5 pt-4">
            {children}
          </div>
        </div>
      </div>
    </article>
  );
}
