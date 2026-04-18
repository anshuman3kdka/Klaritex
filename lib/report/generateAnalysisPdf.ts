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

const PAGE_MARGIN = 18;
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;

function addHeader(doc: jsPDF, title: string) {
  doc.setDrawColor(201, 168, 76);
  doc.setLineWidth(0.8);
  doc.line(PAGE_MARGIN, 20, PAGE_WIDTH - PAGE_MARGIN, 20);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(15);
  doc.text(title, PAGE_MARGIN, 16);
}

function ensurePageSpace(doc: jsPDF, y: number, neededSpace: number, headerTitle: string): number {
  if (y + neededSpace <= PAGE_HEIGHT - PAGE_MARGIN) {
    return y;
  }

  doc.addPage();
  addHeader(doc, headerTitle);
  return 30;
}

function writeWrappedText(doc: jsPDF, text: string, y: number, options?: { size?: number; color?: [number, number, number] }): number {
  const lines = doc.splitTextToSize(text, CONTENT_WIDTH);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(options?.size ?? 11);

  if (options?.color) {
    doc.setTextColor(...options.color);
  } else {
    doc.setTextColor(55, 65, 81);
  }

  doc.text(lines, PAGE_MARGIN, y);

  return y + lines.length * ((options?.size ?? 11) * 0.42 + 2.2);
}

function writeSectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(17, 24, 39);
  doc.text(title, PAGE_MARGIN, y);

  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.4);
  doc.line(PAGE_MARGIN, y + 2, PAGE_WIDTH - PAGE_MARGIN, y + 2);

  return y + 8;
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

function modeLabel(mode: AnalysisMode): string {
  return mode === "deep" ? "Deep" : "Quick";
}

export function generateAnalysisPdf({ result, source, processingMode }: GenerateAnalysisReportOptions) {
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });

  // Page 1 - Title and branding
  doc.setFillColor(17, 24, 39);
  doc.rect(0, 0, PAGE_WIDTH, 56, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(250, 204, 21);
  doc.text("Klaritex Analysis Report", PAGE_MARGIN, 32);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(226, 232, 240);
  doc.text("Professional ambiguity and commitment structure assessment", PAGE_MARGIN, 41);

  const generatedAt = new Date().toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" });

  doc.setTextColor(31, 41, 55);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Report Metadata", PAGE_MARGIN, 72);

  doc.setFillColor(249, 250, 251);
  doc.roundedRect(PAGE_MARGIN, 78, CONTENT_WIDTH, 54, 2, 2, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(55, 65, 81);
  doc.text(`Generated: ${generatedAt}`, PAGE_MARGIN + 4, 89);
  doc.text(`Input Type: ${source.mode.toUpperCase()}`, PAGE_MARGIN + 4, 98);
  doc.text(`Analysis Mode: ${modeLabel(processingMode)}`, PAGE_MARGIN + 4, 107);
  doc.text(`Ambiguity Score: ${result.ambiguityScore.toFixed(1)} / 10`, PAGE_MARGIN + 4, 116);
  doc.text(`Tier: ${result.tier}`, PAGE_MARGIN + 4, 125);

  doc.setFont("helvetica", "italic");
  doc.setTextColor(107, 114, 128);
  doc.setFontSize(10);
  doc.text("Brand: Klaritex · Clarity Engine Framework", PAGE_MARGIN, PAGE_HEIGHT - 24);

  // Page 2 - input source
  doc.addPage();
  addHeader(doc, "Input Prompt");

  let y = 34;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(31, 41, 55);

  const sourceTypeLabel = source.mode === "text" ? "Raw Text" : source.mode === "url" ? "URL" : "Uploaded File";
  doc.text(`Source Type: ${sourceTypeLabel}`, PAGE_MARGIN, y);

  y += 8;
  y = writeSectionTitle(doc, "Source Content", y);

  const sourcePreview = formatSourcePreview(source);
  y = writeWrappedText(doc, sourcePreview, y, { size: 11 });

  // Page 3 and beyond - analysis output
  doc.addPage();
  addHeader(doc, "Analysis Output");

  y = 34;

  const pushTextSection = (title: string, content: string) => {
    y = ensurePageSpace(doc, y, 22, "Analysis Output");
    y = writeSectionTitle(doc, title, y);
    y = writeWrappedText(doc, content, y);
    y += 2;
  };

  pushTextSection("Summary", result.commitmentSummary);
  pushTextSection("Ratio", `Action/Talk ratio: ${result.actionRatio.toFixed(2)} / ${result.talkRatio.toFixed(2)} (${result.ratioLabel})`);
  pushTextSection("Clarity Level", `${result.clarityLevel}`);
  pushTextSection("Unanchored Claims", `${result.unanchoredClaimsCount}`);
  pushTextSection("Verifiable Requirements", result.verifiableRequirements.length > 0 ? result.verifiableRequirements.map((req, index) => `${index + 1}. ${req}`).join("\n") : "No specific requirements listed.");

  const writeBullets = (title: string, items: string[]) => {
    y = ensurePageSpace(doc, y, 20, "Analysis Output");
    y = writeSectionTitle(doc, title, y);

    if (items.length === 0) {
      y = writeWrappedText(doc, "None.", y);
      return;
    }

    for (const item of items) {
      y = ensurePageSpace(doc, y, 10, "Analysis Output");
      y = writeWrappedText(doc, `• ${item}`, y);
    }

    y += 2;
  };

  writeBullets("Ambiguity Explanation", result.ambiguityExplanation);

  writeBullets(
    "Vague Lines",
    result.vagueLines.map((line, index) => `${index + 1}) ${line.sentence} — Reason: ${line.reason}`)
  );

  writeBullets(
    "Lowest Anchors",
    result.lowestAnchors.map((anchor, index) => `${index + 1}) ${anchor.sentence} — Issue: ${anchor.issue}`)
  );

  y = ensurePageSpace(doc, y, 24, "Analysis Output");
  y = writeSectionTitle(doc, "Commitment Breakdown", y);

  if (result.elements.length === 0) {
    y = writeWrappedText(doc, "No commitment elements provided.", y);
  } else {
    for (const element of result.elements) {
      y = ensurePageSpace(doc, y, 20, "Analysis Output");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(17, 24, 39);
      doc.text(`${element.name} (${element.status})`, PAGE_MARGIN, y);
      y += 6;

      y = writeWrappedText(doc, `Penalty: ${element.penalty}`, y, { size: 10, color: [75, 85, 99] });
      y = writeWrappedText(doc, `Notes: ${element.notes}`, y, { size: 10, color: [75, 85, 99] });
      y += 2;
    }
  }

  if (result.exposureCheck && result.exposureCheck.length > 0) {
    writeBullets(
      "Exposure Check",
      result.exposureCheck.map((item) => `${item.label}: ${item.status}`)
    );
  }

  doc.save("klaritex-analysis-report.pdf");
}

export type { ReportInputSource };
