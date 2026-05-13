"use client";

import * as d3 from "d3";
import gsap from "gsap";
import { useEffect, useMemo, useRef, useState } from "react";

import type { CommitmentElement } from "@/lib/types";
import { LabCard, LabLabel, LabWell, LabPill } from "../lab";

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
  const polygonRef = useRef<SVGPolygonElement | null>(null);
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

  const polygonPoints = useMemo(() => {
    return chartData.map((point) => `${point.x},${point.y}`).join(" ");
  }, [chartData]);

  useEffect(() => {
    const runAnimations = () => {
      const pointNodes = pointRefs.current.filter(Boolean);
      const segmentNodes = barSegmentRefs.current.filter(Boolean);
      const polygonNode = polygonRef.current;

      gsap.set(pointNodes, { scale: 0, transformOrigin: "50% 50%" });
      gsap.set(segmentNodes, { width: "0%" });
      if (polygonNode) {
        const totalLength = polygonNode.getTotalLength();
        gsap.set(polygonNode, { strokeDasharray: totalLength, strokeDashoffset: totalLength, opacity: 0.2 });
      }

      const timeline = gsap.timeline();

      if (polygonNode) {
        timeline.to(polygonNode, {
          strokeDashoffset: 0,
          opacity: 1,
          duration: 0.65,
          ease: "power2.out"
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
    <LabCard className="p-6">
      <LabLabel className="mb-6 block">Module 3 · Exposure Check</LabLabel>

      <div className="relative mt-4 flex justify-center">
        <svg width={CHART_SIZE} height={CHART_SIZE} viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`} role="img" aria-label="Exposure radar chart">
          {[0.2, 0.6, 1].map((ring) => (
            <circle
              key={ring}
              cx={CENTER}
              cy={CENTER}
              r={RADIUS * ring}
              fill="none"
              stroke="var(--lab-shadow-dark)"
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
                stroke="var(--lab-shadow-dark)"
                strokeWidth={1}
              />
            );
          })}

          <polygon
            ref={polygonRef}
            points={polygonPoints}
            fill={polygonStyle.fill}
            stroke={polygonStyle.stroke}
            strokeWidth={2}
            strokeLinejoin="round"
          />

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
              style={{ cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: "10px", fill: "var(--lab-muted)" }}
            >
              {point.name}
            </text>
          ))}
        </svg>

        {activeTooltip ? (
          <button
            type="button"
            className="absolute shadow-[var(--shadow-extruded)] rounded-[8px] bg-[var(--lab-surface)] px-2 py-1 font-mono text-[10px] text-[var(--lab-ink)]"
            style={{ left: activeTooltip.x, top: activeTooltip.y, transform: "translate(-50%, -100%)" }}
            onClick={() => setActiveTooltip(null)}
          >
            {activeTooltip.text}
          </button>
        ) : null}
      </div>

      <div className="mt-8">
        <LabLabel className="mb-2 block">Distribution</LabLabel>
        <div className="flex h-3 overflow-hidden rounded-full shadow-[var(--shadow-pressed)] bg-[var(--lab-surface)]">
          <div ref={(node) => { barSegmentRefs.current[0] = node; }} className="bg-[var(--lab-green)]" style={{ width: "0%" }} />
          <div ref={(node) => { barSegmentRefs.current[1] = node; }} className="bg-[var(--lab-amber)]" style={{ width: "0%" }} />
          <div ref={(node) => { barSegmentRefs.current[2] = node; }} className="bg-[var(--lab-red)]" style={{ width: "0%" }} />
        </div>
      </div>

      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((item) => (
          <li key={`${item.name}-${item.status}`}>
            <LabWell className="flex items-center justify-between gap-2 p-2 px-3">
              <span className="font-sans text-[11px] font-semibold text-[var(--lab-ink)]">{item.name}</span>
              <LabPill status={statusLabels[item.status] as any} />
            </LabWell>
          </li>
        ))}
      </ul>
    </LabCard>
  );
}
