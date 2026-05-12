import { jsPDF } from "jspdf";

import type { AnalysisMode, AnalysisResult, InputMode } from "@/lib/types";

interface ReportInputSource {
  mode: InputMode;
  text?: string;
  url?: string;
  fileName?: string;
}

interface GenerateAnalysisReportOptions {
  result: AnalysisResult;
  source: ReportInputSource;
  processingMode: AnalysisMode;
}

const PAGE_MARGIN = 14;
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;
const GOLD: [number, number, number] = [214, 170, 80];
const INK: [number, number, number] = [17, 24, 39];
const SUBTLE: [number, number, number] = [71, 85, 105];
const GOOD: [number, number, number] = [22, 163, 74];
const WARNING: [number, number, number] = [217, 119, 6];
const RISK: [number, number, number] = [220, 38, 38];

const H1_SIZE = 12.5;
const H2_SIZE = 11.8;
const H3_SIZE = 11;
const BODY_SIZE = 10.5;
const CAPTION_SIZE = 9.5;
const CHROME_TITLE_SIZE = 11;
const CARD_TITLE_SIZE = H2_SIZE;
const H1_LINE_HEIGHT = 5.7;
const H2_LINE_HEIGHT = 5.7;
const H3_LINE_HEIGHT = 5.7;
const BODY_LINE_HEIGHT = 5.1;
const CHROME_FOOTER_LINE_HEIGHT = 6;

const HEADING_STYLES = {
  1: { size: H1_SIZE, lineHeight: H1_LINE_HEIGHT, font: "bold" as const, color: INK },
  2: { size: H2_SIZE, lineHeight: H2_LINE_HEIGHT, font: "bold" as const, color: INK },
  3: { size: H3_SIZE, lineHeight: H3_LINE_HEIGHT, font: "bold" as const, color: INK },
} as const;

function modeLabel(mode: AnalysisMode): string {
  return mode === "deep" ? "Deep" : "Quick";
}

function formatSourcePreview(source: ReportInputSource): string {
  if (source.mode === "url") {
    return source.url ?? "No URL available";
  }

  if (source.mode === "pdf") {
    return source.fileName ?? "No filename available";
  }

  return source.text?.trim() ? source.text : "No text available";
}

function sanitizeFileNameSegment(value: string): string {
  return value
    .replace(/https?:\/\//gi, "")
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatReportTimestamp(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}_${hours}-${minutes}`;
}

function getSourceIdentifier(source: ReportInputSource): string | undefined {
  if (source.mode === "url" && source.url?.trim()) {
    try {
      const host = new URL(source.url).hostname.replace(/^www\./i, "");
      const sanitizedHost = sanitizeFileNameSegment(host);
      return sanitizedHost || undefined;
    } catch {
      return sanitizeFileNameSegment(source.url.trim()) || undefined;
    }
  }

  if (source.mode === "pdf" && source.fileName?.trim()) {
    const baseName = source.fileName.replace(/\.[^.]+$/, "");
    return sanitizeFileNameSegment(baseName) || undefined;
  }

  return undefined;
}

function buildAnalysisReportFileName(source: ReportInputSource, date: Date): string {
  const parts = ["klaritex-analysis-report", formatReportTimestamp(date), source.mode];
  const sourceIdentifier = getSourceIdentifier(source);

  if (sourceIdentifier) {
    parts.push(sourceIdentifier);
  }

  return `${parts.join("_")}.pdf`;
}

function cleanInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

function addPageChrome(doc: jsPDF, title: string, pageNumber?: number) {
  doc.setFillColor(...INK);
  doc.rect(0, 0, PAGE_WIDTH, 22, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("times", "bold");
  doc.setFontSize(CHROME_TITLE_SIZE);
  doc.text(title, PAGE_MARGIN, 13.2);

  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.7);
  doc.line(PAGE_MARGIN, 22, PAGE_WIDTH - PAGE_MARGIN, 22);

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(PAGE_MARGIN, PAGE_HEIGHT - 12, PAGE_WIDTH - PAGE_MARGIN, PAGE_HEIGHT - 12);

  doc.setTextColor(107, 114, 128);
  doc.setFont("times", "italic");
  doc.setFontSize(CAPTION_SIZE);
  doc.text("Klaritex · Clarity Engine Framework", PAGE_MARGIN, PAGE_HEIGHT - CHROME_FOOTER_LINE_HEIGHT);

  if (pageNumber) {
    doc.setFont("helvetica", "normal");
    doc.text(`Page ${pageNumber}`, PAGE_WIDTH - PAGE_MARGIN - 14, PAGE_HEIGHT - CHROME_FOOTER_LINE_HEIGHT);
  }
}

function ensurePageSpace(doc: jsPDF, y: number, neededSpace: number, pageTitle: string, pageNumberRef: { value: number }): number {
  if (y + neededSpace <= PAGE_HEIGHT - 18) {
    return y;
  }

  doc.addPage();
  pageNumberRef.value += 1;
  addPageChrome(doc, pageTitle, pageNumberRef.value);
  return 31;
}

type CardIconMarker = "summary" | "evidence" | "ambiguity" | "vague" | "commitment";

function drawCardIcon(doc: jsPDF, marker: CardIconMarker, x: number, yCenter: number) {
  doc.setDrawColor(...INK);
  doc.setLineWidth(0.4);

  if (marker === "summary") {
    doc.circle(x, yCenter, 2.1);
    doc.line(x - 1.2, yCenter - 0.1, x - 0.3, yCenter + 1);
    doc.line(x - 0.3, yCenter + 1, x + 1.3, yCenter - 1.1);
    return;
  }

  if (marker === "evidence") {
    doc.line(x - 2.2, yCenter - 1.7, x + 1.8, yCenter - 1.7);
    doc.line(x - 2.2, yCenter, x + 2.2, yCenter);
    doc.line(x - 2.2, yCenter + 1.7, x + 0.8, yCenter + 1.7);
    doc.circle(x - 2.7, yCenter - 1.7, 0.25);
    doc.circle(x - 2.7, yCenter, 0.25);
    doc.circle(x - 2.7, yCenter + 1.7, 0.25);
    return;
  }

  if (marker === "ambiguity") {
    doc.circle(x, yCenter - 0.4, 2.1);
    doc.line(x, yCenter + 2, x, yCenter + 2.4);
    doc.circle(x, yCenter + 3.3, 0.3);
    return;
  }

  if (marker === "vague") {
    doc.circle(x - 1.2, yCenter, 1.3);
    doc.circle(x + 1.2, yCenter, 1.3);
    doc.line(x - 0.4, yCenter, x + 0.4, yCenter);
    return;
  }

  doc.line(x - 1.8, yCenter - 1.8, x - 0.2, yCenter - 0.2);
  doc.line(x - 0.2, yCenter - 0.2, x + 2.1, yCenter - 2);
  doc.line(x - 0.1, yCenter - 0.1, x - 0.1, yCenter + 2.2);
  doc.circle(x - 1.8, yCenter - 1.8, 0.35);
  doc.circle(x + 2.1, yCenter - 2, 0.35);
  doc.circle(x - 0.1, yCenter + 2.2, 0.35);
}

function writeCard(
  doc: jsPDF,
  y: number,
  title: string,
  pageTitle: string,
  pageNumberRef: { value: number },
  iconMarker?: CardIconMarker
): number {
  y = ensurePageSpace(doc, y, 16, pageTitle, pageNumberRef);

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(PAGE_MARGIN, y - 5, CONTENT_WIDTH, 14, 2.5, 2.5, "F");

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.roundedRect(PAGE_MARGIN, y - 5, CONTENT_WIDTH, 14, 2.5, 2.5);

  doc.setTextColor(...INK);
  doc.setFont("times", "bold");
  doc.setFontSize(CARD_TITLE_SIZE);
  const iconOffset = iconMarker ? 7 : 0;
  if (iconMarker) {
    drawCardIcon(doc, iconMarker, PAGE_MARGIN + 4, y + 1.8);
  }
  doc.text(title, PAGE_MARGIN + 4 + iconOffset, y + 3.5);

  return y + 14;
}

function writeRichParagraph(
  doc: jsPDF,
  markdown: string,
  y: number,
  pageTitle: string,
  pageNumberRef: { value: number },
  options?: { baseSize?: number }
): number {
  const baseSize = options?.baseSize ?? BODY_SIZE;
  const rawLines = markdown.split(/\r?\n/);

  for (const rawLine of rawLines) {
    const line = rawLine.trimEnd();

    if (!line.trim()) {
      y += 2.6;
      continue;
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.+)/);
    const bulletMatch = line.match(/^([-*]|\d+[.)])\s+(.+)/);

    let prefix = "";
    let content = line;
    let fontSize = baseSize;
    let lineHeight = BODY_LINE_HEIGHT;
    let fontVariant: "bold" | "normal" = "normal";
    let textColor = SUBTLE;

    if (headingMatch) {
      content = headingMatch[2];
      const level = headingMatch[1].length as 1 | 2 | 3;
      const headingStyle = HEADING_STYLES[level];
      fontSize = headingStyle.size;
      lineHeight = headingStyle.lineHeight;
      fontVariant = headingStyle.font;
      textColor = headingStyle.color;
      y += 1;
    } else if (bulletMatch) {
      prefix = "• ";
      content = bulletMatch[2];
    }

    const cleanedContent = cleanInlineMarkdown(content);
    const maxWidth = CONTENT_WIDTH - (prefix ? 6 : 0);
    const wrappedLines = doc.splitTextToSize(cleanedContent, maxWidth) as string[];

    for (let i = 0; i < wrappedLines.length; i += 1) {
      y = ensurePageSpace(doc, y, lineHeight + 2, pageTitle, pageNumberRef);
      let x = PAGE_MARGIN;

      if (i === 0 && prefix) {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...SUBTLE);
        doc.setFontSize(fontSize);
        doc.text(prefix, x, y);
      }

      x += prefix ? 4 : 0;
      doc.setFont("helvetica", fontVariant);
      doc.setTextColor(...textColor);
      doc.setFontSize(fontSize);
      doc.text(wrappedLines[i], x, y);

      y += lineHeight;
    }

    y += headingMatch ? 1.2 : 0.8;
  }

  return y;
}


function writeElementsTable(
  doc: jsPDF,
  y: number,
  elements: AnalysisResult["elements"],
  pageTitle: string,
  pageNumberRef: { value: number }
): number {
  const tableX = PAGE_MARGIN;
  const tableWidth = CONTENT_WIDTH;
  const headerHeight = 8;
  const rowPaddingY = 2.2;
  const rowLineHeight = 4.8;
  const columnWidths = {
    name: tableWidth * 0.27,
    status: tableWidth * 0.16,
    penalty: tableWidth * 0.12,
    notes: tableWidth * 0.45,
  };

  const columnX = {
    name: tableX,
    status: tableX + columnWidths.name,
    penalty: tableX + columnWidths.name + columnWidths.status,
    notes: tableX + columnWidths.name + columnWidths.status + columnWidths.penalty,
  };

  const drawHeader = (yPos: number) => {
    yPos = ensurePageSpace(doc, yPos, headerHeight + 2, pageTitle, pageNumberRef);

    doc.setFillColor(241, 245, 249);
    doc.rect(tableX, yPos, tableWidth, headerHeight, "F");

    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.22);
    doc.rect(tableX, yPos, tableWidth, headerHeight);

    doc.setFont("times", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...INK);

    doc.text("Element name", columnX.name + 2, yPos + 5.2);
    doc.text("Status", columnX.status + 2, yPos + 5.2);
    doc.text("Penalty", columnX.penalty + 2, yPos + 5.2);
    doc.text("Notes", columnX.notes + 2, yPos + 5.2);

    doc.line(columnX.status, yPos, columnX.status, yPos + headerHeight);
    doc.line(columnX.penalty, yPos, columnX.penalty, yPos + headerHeight);
    doc.line(columnX.notes, yPos, columnX.notes, yPos + headerHeight);

    return yPos + headerHeight;
  };

  y = drawHeader(y);

  elements.forEach((element, index) => {
    const nameLines = doc.splitTextToSize(element.name, columnWidths.name - 4) as string[];
    const statusLines = doc.splitTextToSize(element.status, columnWidths.status - 4) as string[];
    const penaltyLines = doc.splitTextToSize(String(element.penalty), columnWidths.penalty - 4) as string[];
    const noteLines = doc.splitTextToSize(element.notes, columnWidths.notes - 4) as string[];

    const maxLines = Math.max(nameLines.length, statusLines.length, penaltyLines.length, noteLines.length, 1);
    const rowHeight = maxLines * rowLineHeight + rowPaddingY * 2;

    const ensuredY = ensurePageSpace(doc, y, rowHeight + 0.5, pageTitle, pageNumberRef);
    if (ensuredY !== y) {
      y = drawHeader(ensuredY);
    }

    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(tableX, y, tableWidth, rowHeight, "F");
    }

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.18);
    doc.line(tableX, y, tableX + tableWidth, y);
    doc.line(tableX, y, tableX, y + rowHeight);
    doc.line(tableX + tableWidth, y, tableX + tableWidth, y + rowHeight);
    doc.line(columnX.status, y, columnX.status, y + rowHeight);
    doc.line(columnX.penalty, y, columnX.penalty, y + rowHeight);
    doc.line(columnX.notes, y, columnX.notes, y + rowHeight);

    const rowTextY = y + rowPaddingY + rowLineHeight - 1;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...SUBTLE);

    doc.text(nameLines, columnX.name + 2, rowTextY);
    doc.text(statusLines, columnX.status + 2, rowTextY);
    doc.text(penaltyLines, columnX.penalty + 2, rowTextY);
    doc.text(noteLines, columnX.notes + 2, rowTextY);

    y += rowHeight;
  });

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.22);
  doc.line(tableX, y, tableX + tableWidth, y);

  return y + 2;
}

function getClarityTone(clarityLevel: number): { label: string; color: [number, number, number] } {
  if (clarityLevel >= 8) {
    return { label: "High", color: GOOD };
  }
  if (clarityLevel >= 5) {
    return { label: "Moderate", color: WARNING };
  }
  return { label: "Low", color: RISK };
}


function getAmbiguityGaugeColor(score: number): [number, number, number] {
  if (score <= 3) {
    return GOOD;
  }
  if (score <= 6) {
    return WARNING;
  }
  return RISK;
}

function drawAmbiguityGauge(doc: jsPDF, centerX: number, centerY: number, score: number): void {
  const clampedScore = Math.max(0, Math.min(10, score));
  const progress = clampedScore / 10;
  const activeColor = getAmbiguityGaugeColor(clampedScore);
  const startAngle = -210;
  const sweepAngle = 240;
  const segments = 36;
  const outerRadius = 7;
  const innerRadius = 4.8;

  const pointAt = (angleDeg: number, radius: number) => {
    const radians = (angleDeg * Math.PI) / 180;
    return {
      x: centerX + Math.cos(radians) * radius,
      y: centerY + Math.sin(radians) * radius,
    };
  };

  doc.setLineWidth(1.2);

  for (let i = 0; i < segments; i += 1) {
    const segmentStart = startAngle + (sweepAngle / segments) * i + 1;
    const segmentEnd = startAngle + (sweepAngle / segments) * (i + 1) - 1;
    const isActive = (i + 1) / segments <= progress;

    if (isActive) {
      doc.setDrawColor(...activeColor);
    } else {
      doc.setDrawColor(226, 232, 240);
    }

    const p1 = pointAt(segmentStart, outerRadius);
    const p2 = pointAt(segmentEnd, outerRadius);
    doc.line(p1.x, p1.y, p2.x, p2.y);
  }

  doc.setFillColor(255, 255, 255);
  doc.circle(centerX, centerY, innerRadius, "F");
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.25);
  doc.circle(centerX, centerY, innerRadius);
}
function getUnanchoredSeverity(unanchoredClaimsCount: number): { label: string; color: [number, number, number] } {
  if (unanchoredClaimsCount <= 2) {
    return { label: "Low", color: GOOD };
  }
  if (unanchoredClaimsCount <= 5) {
    return { label: "Medium", color: WARNING };
  }
  return { label: "High", color: RISK };
}

function writeKpiDashboard(doc: jsPDF, y: number, result: AnalysisResult): number {
  const gap = 4;
  const cardWidth = (CONTENT_WIDTH - gap) / 2;
  const cardHeight = 26;
  const leftX = PAGE_MARGIN;
  const rightX = PAGE_MARGIN + cardWidth + gap;
  const row2Y = y + cardHeight + gap;
  const clarityTone = getClarityTone(result.clarityLevel);
  const unanchoredSeverity = getUnanchoredSeverity(result.unanchoredClaimsCount);
  const actionTalkTotal = Math.max(result.actionRatio + result.talkRatio, 0.01);
  const actionShare = Math.max(0, Math.min(1, result.actionRatio / actionTalkTotal));

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.25);

  const drawCard = (x: number, yPos: number) => {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, yPos, cardWidth, cardHeight, 2.5, 2.5, "F");
    doc.roundedRect(x, yPos, cardWidth, cardHeight, 2.5, 2.5);
  };

  drawCard(leftX, y);
  drawCard(rightX, y);
  drawCard(leftX, row2Y);
  drawCard(rightX, row2Y);

  doc.setFont("times", "bold");
  doc.setFontSize(8.8);
  doc.setTextColor(...SUBTLE);
  doc.text("Ambiguity Score", leftX + 3, y + 5.5);
  doc.text("Clarity Level", rightX + 3, y + 5.5);
  doc.text("Action/Talk Ratio", leftX + 3, row2Y + 5.5);
  doc.text("Unanchored Claims", rightX + 3, row2Y + 5.5);

  const gaugeCenterX = leftX + cardWidth / 2;
  const gaugeCenterY = y + 14.2;
  drawAmbiguityGauge(doc, gaugeCenterX, gaugeCenterY, result.ambiguityScore);

  doc.setFont("times", "bold");
  doc.setTextColor(...INK);
  doc.setFontSize(8.8);
  doc.text(result.ambiguityScore.toFixed(1), gaugeCenterX, gaugeCenterY + 1, { align: "center" });

  doc.setFontSize(8.2);
  doc.setTextColor(...SUBTLE);
  doc.text(`Tier ${result.tier}`, gaugeCenterX, y + 22, { align: "center" });

  doc.setFont("times", "bold");
  doc.setTextColor(...clarityTone.color);
  doc.setFontSize(14);
  doc.text(`${result.clarityLevel.toFixed(1)}`, rightX + 3, y + 13);
  doc.setFontSize(9);
  doc.text(clarityTone.label, rightX + 3, y + 18.2);

  const barX = leftX + 3;
  const barY = row2Y + 11;
  const barWidth = cardWidth - 6;
  const barHeight = 5;
  doc.setFillColor(226, 232, 240);
  doc.roundedRect(barX, barY, barWidth, barHeight, 1.4, 1.4, "F");
  doc.setFillColor(...GOLD);
  doc.roundedRect(barX, barY, barWidth * actionShare, barHeight, 1.4, 1.4, "F");
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...SUBTLE);
  doc.setFontSize(8.6);
  doc.text(`A ${result.actionRatio.toFixed(2)} vs T ${result.talkRatio.toFixed(2)}`, leftX + 3, row2Y + 19);

  doc.setFont("times", "bold");
  doc.setTextColor(...unanchoredSeverity.color);
  doc.setFontSize(14);
  doc.text(`${result.unanchoredClaimsCount}`, rightX + 3, row2Y + 13);
  doc.setFontSize(9);
  doc.text(unanchoredSeverity.label, rightX + 3, row2Y + 18.2);

  return row2Y + cardHeight;
}

export function generateAnalysisPdf({ result, source, processingMode }: GenerateAnalysisReportOptions) {
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const pageCounter = { value: 1 };
  const now = new Date();

  doc.setFillColor(...INK);
  doc.rect(0, 0, PAGE_WIDTH, 70, "F");

  doc.setTextColor(...GOLD);
  doc.setFont("times", "bold");
  doc.setFontSize(24);
  doc.text("Klaritex Analysis Report", PAGE_MARGIN, 30);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(226, 232, 240);
  doc.setFontSize(10.5);
  doc.text("Clean, structured clarity and commitment diagnostics", PAGE_MARGIN, 38);

  const generatedAt = now.toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  });

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(PAGE_MARGIN, 50, CONTENT_WIDTH, 35, 3.5, 3.5, "F");

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(PAGE_MARGIN, 50, CONTENT_WIDTH, 35, 3.5, 3.5);

  doc.setFont("times", "bold");
  doc.setTextColor(...INK);
  doc.setFontSize(12);
  doc.text("Report Metadata", PAGE_MARGIN + 4, 58);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...SUBTLE);
  doc.setFontSize(10.5);
  doc.text(`Generated: ${generatedAt}`, PAGE_MARGIN + 4, 66);
  doc.text(`Input Type: ${source.mode.toUpperCase()}`, PAGE_MARGIN + 4, 72);
  doc.text(`Analysis Mode: ${modeLabel(processingMode)}`, PAGE_MARGIN + 4, 78);

  addPageChrome(doc, "Executive Summary", pageCounter.value);
  let y = 91;
  y = writeKpiDashboard(doc, y, result);
  y += 8;

  y = writeCard(doc, y, "Summary", "Executive Summary", pageCounter, "summary");
  y = writeRichParagraph(doc, result.commitmentSummary, y, "Executive Summary", pageCounter, { baseSize: 11 });

  y += 4;
  y = writeCard(doc, y, "Key Metrics", "Executive Summary", pageCounter);

  const metrics = [
    `Action/Talk ratio: **${result.actionRatio.toFixed(2)} / ${result.talkRatio.toFixed(2)}** (${result.ratioLabel})`,
    `Clarity level: **${result.clarityLevel}**`,
    `Unanchored claims: **${result.unanchoredClaimsCount}**`,
  ].join("\n");

  y = writeRichParagraph(doc, metrics, y, "Executive Summary", pageCounter);

  doc.addPage();
  pageCounter.value += 1;
  addPageChrome(doc, "Input & Evidence", pageCounter.value);
  y = 31;

  const sourceTypeLabel = source.mode === "text" ? "Raw text" : source.mode === "url" ? "URL" : "Uploaded PDF";
  y = writeCard(doc, y, "Input Prompt", "Input & Evidence", pageCounter, "evidence");
  y = writeRichParagraph(
    doc,
    `**Source Type:** ${sourceTypeLabel}\n\n${formatSourcePreview(source)}`,
    y,
    "Input & Evidence",
    pageCounter
  );

  y += 3;
  y = writeCard(doc, y, "Verifiable Requirements", "Input & Evidence", pageCounter, "evidence");
  y = writeRichParagraph(
    doc,
    result.verifiableRequirements.length > 0
      ? result.verifiableRequirements.map((req, index) => `${index + 1}. ${req}`).join("\n")
      : "No specific requirements listed.",
    y,
    "Input & Evidence",
    pageCounter
  );

  doc.addPage();
  pageCounter.value += 1;
  addPageChrome(doc, "Analysis Details", pageCounter.value);
  y = 31;

  y = writeCard(doc, y, "Ambiguity Explanation", "Analysis Details", pageCounter, "ambiguity");
  y = writeRichParagraph(
    doc,
    result.ambiguityExplanation.length > 0 ? result.ambiguityExplanation.map((item) => `- ${item}`).join("\n") : "No explanation provided.",
    y,
    "Analysis Details",
    pageCounter
  );

  y += 3;
  y = writeCard(doc, y, "Vague Lines", "Analysis Details", pageCounter, "vague");
  y = writeRichParagraph(
    doc,
    result.vagueLines.length > 0
      ? result.vagueLines.map((line, index) => `${index + 1}. **${line.sentence}**\n   Reason: ${line.reason}`).join("\n")
      : "No vague lines identified.",
    y,
    "Analysis Details",
    pageCounter
  );

  y += 3;
  y = writeCard(doc, y, "Lowest Anchors", "Analysis Details", pageCounter);
  y = writeRichParagraph(
    doc,
    result.lowestAnchors.length > 0
      ? result.lowestAnchors.map((anchor, index) => `${index + 1}. **${anchor.sentence}**\n   Issue: ${anchor.issue}`).join("\n")
      : "No low anchors identified.",
    y,
    "Analysis Details",
    pageCounter
  );

  y += 3;
  y = writeCard(doc, y, "Commitment Breakdown", "Analysis Details", pageCounter, "commitment");

  if (result.elements.length === 0) {
    y = writeRichParagraph(doc, "No commitment elements provided.", y, "Analysis Details", pageCounter);
  } else {
    y = writeElementsTable(doc, y, result.elements, "Analysis Details", pageCounter);
  }

  if (result.exposureCheck && result.exposureCheck.length > 0) {
    y += 3;
    y = writeCard(doc, y, "Exposure Check", "Analysis Details", pageCounter);
    y = writeRichParagraph(
      doc,
      result.exposureCheck.map((item) => `- **${item.label}:** ${item.status}`).join("\n"),
      y,
      "Analysis Details",
      pageCounter
    );
  }

  doc.save(buildAnalysisReportFileName(source, now));
}

export type { ReportInputSource };
