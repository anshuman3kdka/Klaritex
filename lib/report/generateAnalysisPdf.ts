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
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(title, PAGE_MARGIN, 13.2);

  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.7);
  doc.line(PAGE_MARGIN, 22, PAGE_WIDTH - PAGE_MARGIN, 22);

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(PAGE_MARGIN, PAGE_HEIGHT - 12, PAGE_WIDTH - PAGE_MARGIN, PAGE_HEIGHT - 12);

  doc.setTextColor(107, 114, 128);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9.5);
  doc.text("Klaritex · Clarity Engine Framework", PAGE_MARGIN, PAGE_HEIGHT - 6);

  if (pageNumber) {
    doc.setFont("helvetica", "normal");
    doc.text(`Page ${pageNumber}`, PAGE_WIDTH - PAGE_MARGIN - 14, PAGE_HEIGHT - 6);
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

function writeCard(doc: jsPDF, y: number, title: string, pageTitle: string, pageNumberRef: { value: number }): number {
  y = ensurePageSpace(doc, y, 16, pageTitle, pageNumberRef);

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(PAGE_MARGIN, y - 5, CONTENT_WIDTH, 14, 2.5, 2.5, "F");

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.roundedRect(PAGE_MARGIN, y - 5, CONTENT_WIDTH, 14, 2.5, 2.5);

  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(title, PAGE_MARGIN + 4, y + 3.5);

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
  const baseSize = options?.baseSize ?? 10.5;
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
    let lineHeight = 5.1;

    if (headingMatch) {
      content = headingMatch[2];
      fontSize = headingMatch[1].length === 1 ? 12.5 : headingMatch[1].length === 2 ? 11.8 : 11;
      lineHeight = 5.7;
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
      doc.setFont("helvetica", headingMatch ? "bold" : "normal");
      doc.setTextColor(...(headingMatch ? INK : SUBTLE));
      doc.setFontSize(fontSize);
      doc.text(wrappedLines[i], x, y);

      y += lineHeight;
    }

    y += headingMatch ? 1.2 : 0.8;
  }

  return y;
}

export function generateAnalysisPdf({ result, source, processingMode }: GenerateAnalysisReportOptions) {
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const pageCounter = { value: 1 };

  doc.setFillColor(...INK);
  doc.rect(0, 0, PAGE_WIDTH, 70, "F");

  doc.setTextColor(...GOLD);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("Klaritex Analysis Report", PAGE_MARGIN, 30);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(226, 232, 240);
  doc.setFontSize(10.5);
  doc.text("Clean, structured clarity and commitment diagnostics", PAGE_MARGIN, 38);

  const generatedAt = new Date().toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  });

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(PAGE_MARGIN, 50, CONTENT_WIDTH, 35, 3.5, 3.5, "F");

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(PAGE_MARGIN, 50, CONTENT_WIDTH, 35, 3.5, 3.5);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...INK);
  doc.setFontSize(12);
  doc.text("Report Metadata", PAGE_MARGIN + 4, 58);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...SUBTLE);
  doc.setFontSize(10.5);
  doc.text(`Generated: ${generatedAt}`, PAGE_MARGIN + 4, 66);
  doc.text(`Input Type: ${source.mode.toUpperCase()}`, PAGE_MARGIN + 4, 72);
  doc.text(`Analysis Mode: ${modeLabel(processingMode)}`, PAGE_MARGIN + 4, 78);

  doc.setFillColor(254, 249, 195);
  doc.roundedRect(PAGE_MARGIN + CONTENT_WIDTH - 55, 54, 49, 25, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setTextColor(120, 53, 15);
  doc.setFontSize(10);
  doc.text("Ambiguity Score", PAGE_MARGIN + CONTENT_WIDTH - 50.5, 61);
  doc.setFontSize(16);
  doc.text(`${result.ambiguityScore.toFixed(1)} / 10`, PAGE_MARGIN + CONTENT_WIDTH - 50.5, 69);
  doc.setFontSize(10);
  doc.text(`Tier ${result.tier}`, PAGE_MARGIN + CONTENT_WIDTH - 50.5, 75.5);

  addPageChrome(doc, "Executive Summary", pageCounter.value);
  let y = 95;

  y = writeCard(doc, y, "Summary", "Executive Summary", pageCounter);
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
  y = writeCard(doc, y, "Input Prompt", "Input & Evidence", pageCounter);
  y = writeRichParagraph(
    doc,
    `**Source Type:** ${sourceTypeLabel}\n\n${formatSourcePreview(source)}`,
    y,
    "Input & Evidence",
    pageCounter
  );

  y += 3;
  y = writeCard(doc, y, "Verifiable Requirements", "Input & Evidence", pageCounter);
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

  y = writeCard(doc, y, "Ambiguity Explanation", "Analysis Details", pageCounter);
  y = writeRichParagraph(
    doc,
    result.ambiguityExplanation.length > 0 ? result.ambiguityExplanation.map((item) => `- ${item}`).join("\n") : "No explanation provided.",
    y,
    "Analysis Details",
    pageCounter
  );

  y += 3;
  y = writeCard(doc, y, "Vague Lines", "Analysis Details", pageCounter);
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
  y = writeCard(doc, y, "Commitment Breakdown", "Analysis Details", pageCounter);

  if (result.elements.length === 0) {
    y = writeRichParagraph(doc, "No commitment elements provided.", y, "Analysis Details", pageCounter);
  } else {
    for (const element of result.elements) {
      y = ensurePageSpace(doc, y, 18, "Analysis Details", pageCounter);
      y = writeRichParagraph(
        doc,
        `### ${element.name} (${element.status})\nPenalty: **${element.penalty}**\n${element.notes}`,
        y,
        "Analysis Details",
        pageCounter
      );
      y += 0.6;
    }
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

  doc.save("klaritex-analysis-report.pdf");
}

export type { ReportInputSource };
