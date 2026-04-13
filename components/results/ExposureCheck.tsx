"use client";

import * as d3 from "d3";
import gsap from "gsap";
import { useEffect, useMemo, useRef, useState } from "react";

import type { CommitmentElement } from "@/lib/types";
import { CollapsibleCard } from "./CollapsibleCard";

interface ExposureCheckProps {
  elements: CommitmentElement[];
}

const orderedElements = ["Who", "Action", "Object", "Measure", "Timeline", "Premise"] as const;
const statusLabels: Record<CommitmentElement["status"], string> = {
  clear: "Locked In",
  broad: "Unclear",
  missing: "Missing"
};

const statusDistance: Record<CommitmentElement["status"], number> = {
  clear: 0.2,
  broad: 0.6,
  missing: 1
};

const statusColors: Record<CommitmentElement["status"], string> = {
  clear: "#2d7a4f",
  broad: "#b8860b",
  missing: "#9b2c2c"
};

const CHART_SIZE = 260;
const CENTER = CHART_SIZE / 2;
const RADIUS = 92;

export function ExposureCheck({ elements }: ExposureCheckProps) {
  const [activeTooltip, setActiveTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
  const polygonClipCircleRef = useRef<SVGCircleElement | null>(null);
  const pointRefs = useRef<(SVGCircleElement | null)[]>([]);
  const barSegmentRefs = useRef<(HTMLDivElement | null)[]>([]);

  const elementMap = useMemo(() => new Map((elements ?? []).map((element) => [element.name, element])), [elements]);

  const items = useMemo(
    () =>
      orderedElements.map((name) => {
        const entry = elementMap.get(name);
        return {
          name,
          status: entry?.status ?? "missing",
          penalty: entry?.penalty ?? 0
        };
      }),
    [elementMap]
  );

  const lockedInCount = items.filter((item) => item.status === "clear").length;
  const unclearCount = items.filter((item) => item.status === "broad").length;
  const missingCount = items.filter((item) => item.status === "missing").length;
  const total = items.length || 1;

  const polygonStyle = useMemo(() => {
    if (missingCount >= 4) {
      return { fill: "rgba(155,44,44,0.2)", stroke: "#9b2c2c" };
    }

    if (lockedInCount >= 4) {
      return { fill: "rgba(45,122,79,0.2)", stroke: "#2d7a4f" };
    }

    return { fill: "rgba(184,134,11,0.2)", stroke: "#b8860b" };
  }, [lockedInCount, missingCount]);

  const chartData = useMemo(() => {
    const angleStep = (Math.PI * 2) / orderedElements.length;

    return items.map((item, index) => {
      const angle = -Math.PI / 2 + index * angleStep;
      const distance = RADIUS * statusDistance[item.status];
      const point = d3.pointRadial(angle, distance);
      const labelPoint = d3.pointRadial(angle, RADIUS + 26);

      return {
        ...item,
        x: CENTER + point[0],
        y: CENTER + point[1],
        labelX: CENTER + labelPoint[0],
        labelY: CENTER + labelPoint[1],
        angle
      };
    });
  }, [items]);

  const polygonPath = useMemo(() => {
    const line = d3.lineRadial<{ angle: number; radius: number }>()
      .angle((point) => point.angle)
      .radius((point) => point.radius)
      .curve(d3.curveLinearClosed);

    const radialData = items.map((item, index) => ({
      angle: -Math.PI / 2 + index * ((Math.PI * 2) / orderedElements.length),
      radius: RADIUS * statusDistance[item.status]
    }));

    return line(radialData) ?? "";
  }, [items]);

  useEffect(() => {
    const runAnimations = () => {
      const pointNodes = pointRefs.current.filter(Boolean);
      const segmentNodes = barSegmentRefs.current.filter(Boolean);

      if (polygonClipCircleRef.current) {
        gsap.set(polygonClipCircleRef.current, { attr: { r: 0 } });
      }

      gsap.set(pointNodes, { scale: 0, transformOrigin: "50% 50%" });
      gsap.set(segmentNodes, { width: "0%" });

      const timeline = gsap.timeline();

      if (polygonClipCircleRef.current) {
        timeline.to(polygonClipCircleRef.current, {
          attr: { r: RADIUS },
          duration: 0.9,
          ease: "back.out(1.2)"
        });
      }

      timeline.to(pointNodes, {
        scale: 1,
        duration: 0.2,
        ease: "back.out(2)",
        stagger: 0.08
      });

      const segmentWidths = [
        `${(lockedInCount / total) * 100}%`,
        `${(unclearCount / total) * 100}%`,
        `${(missingCount / total) * 100}%`
      ];

      timeline.to(
        segmentNodes,
        {
          width: (_index, target) => {
            const idx = segmentNodes.findIndex((node) => node === target);
            return segmentWidths[idx] ?? "0%";
          },
          duration: 0.35,
          ease: "power2.out",
          stagger: 0.1
        },
        "<"
      );
    };

    const handleModuleReveal = (event: Event) => {
      const customEvent = event as CustomEvent<{ moduleId?: string }>;
      if (customEvent.detail?.moduleId !== "module-3") {
        return;
      }

      runAnimations();
    };

    document.addEventListener("moduleRevealed", handleModuleReveal);
    return () => {
      document.removeEventListener("moduleRevealed", handleModuleReveal);
    };
  }, [lockedInCount, missingCount, total, unclearCount]);

  return (
    <CollapsibleCard title="Module 3 · Exposure Check" moduleId="module-3">
      <p className="font-ui text-sm text-[var(--text-secondary)]">
        This module lists what is clearly committed versus what stays unclear or missing.
      </p>

      <div className="relative mt-4 flex justify-center">
        <svg width={CHART_SIZE} height={CHART_SIZE} viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`} role="img" aria-label="Exposure radar chart">
          {[0.2, 0.6, 1].map((ring) => (
            <circle
              key={ring}
              cx={CENTER}
              cy={CENTER}
              r={RADIUS * ring}
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={1}
            />
          ))}

          {chartData.map((point) => {
            const axisTip = d3.pointRadial(point.angle, RADIUS);
            return (
              <line
                key={`axis-${point.name}`}
                x1={CENTER}
                y1={CENTER}
                x2={CENTER + axisTip[0]}
                y2={CENTER + axisTip[1]}
                stroke="rgba(201,168,76,0.15)"
                strokeWidth={1}
              />
            );
          })}

          <defs>
            <clipPath id="exposure-radar-clip">
              <circle ref={polygonClipCircleRef} cx={CENTER} cy={CENTER} r={0} />
            </clipPath>
          </defs>

          <g transform={`translate(${CENTER}, ${CENTER})`} clipPath="url(#exposure-radar-clip)">
            <path d={polygonPath} fill={polygonStyle.fill} stroke={polygonStyle.stroke} strokeWidth={2} />
          </g>

          {chartData.map((point, index) => (
            <circle
              key={`point-${point.name}`}
              ref={(node) => {
                pointRefs.current[index] = node;
              }}
              cx={point.x}
              cy={point.y}
              r={5}
              fill={statusColors[point.status]}
            />
          ))}

          {chartData.map((point) => (
            <text
              key={`label-${point.name}`}
              x={point.labelX}
              y={point.labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              onClick={() => setActiveTooltip({ text: `${point.name}: ${statusLabels[point.status]} — ${point.penalty} pts`, x: point.labelX, y: point.labelY - 18 })}
              style={{ cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: "10px", fill: "rgba(232,237,245,0.6)" }}
            >
              {point.name}
            </text>
          ))}
        </svg>

        {activeTooltip ? (
          <button
            type="button"
            className="absolute rounded-md border border-[var(--border)] bg-[var(--bg-elevated)]/95 px-2 py-1 font-mono-ui text-[10px] text-[var(--text-primary)]"
            style={{ left: activeTooltip.x, top: activeTooltip.y, transform: "translate(-50%, -100%)" }}
            onClick={() => setActiveTooltip(null)}
          >
            {activeTooltip.text}
          </button>
        ) : null}
      </div>

      <div className="mt-2">
        <p className="k-module-label mb-2">Distribution</p>
        <div className="flex h-2.5 overflow-hidden rounded-full bg-[var(--bg-primary)]">
          <div ref={(node) => { barSegmentRefs.current[0] = node; }} className="bg-[var(--clear-color)]" style={{ width: "0%" }} />
          <div ref={(node) => { barSegmentRefs.current[1] = node; }} className="bg-[var(--broad-color)]" style={{ width: "0%" }} />
          <div ref={(node) => { barSegmentRefs.current[2] = node; }} className="bg-[var(--missing-color)]" style={{ width: "0%" }} />
        </div>
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {items.map((item) => (
          <li key={`${item.name}-${item.status}`} className="rounded-md bg-[var(--bg-elevated)]/45 px-2 py-1.5">
            <div className="flex items-center justify-between gap-2">
              <p className="font-ui text-[11px] text-[var(--text-secondary)]">{item.name}</p>
              <p className="font-mono-ui inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-[var(--text-secondary)]/80">
                <span className={`h-1.5 w-1.5 rounded-full ${
                  item.status === "clear"
                    ? "bg-[var(--clear-color)]"
                    : item.status === "broad"
                      ? "bg-[var(--broad-color)]"
                      : "bg-[var(--missing-color)]"
                }`} />
                {statusLabels[item.status]}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </CollapsibleCard>
  );
}
