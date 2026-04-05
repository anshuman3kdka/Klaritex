import { NextResponse } from "next/server";

import { extractPdfText } from "@/lib/extractPdf";
import { analyzeText, sanitizeInput } from "@/lib/gemini";
import { parseGeminiResponse } from "@/lib/parseResponse";
import type { AnalysisMode } from "@/lib/types";

function isValidMode(value: unknown): value is AnalysisMode {
  return value === "quick" || value === "deep";
}

export async function POST(request: Request) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const file = formData.get("file");
  const mode = formData.get("mode");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "PDF file is required." }, { status: 400 });
  }

  if (!isValidMode(mode)) {
    return NextResponse.json({ error: "Mode must be 'quick' or 'deep'." }, { status: 400 });
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfText = await extractPdfText(Buffer.from(arrayBuffer));

    if (!pdfText.trim()) {
      return NextResponse.json({ error: "PDF contains no extractable text." }, { status: 422 });
    }

    const sanitizedText = sanitizeInput(pdfText);

    if (!sanitizedText) {
      return NextResponse.json({ error: "PDF contains no extractable text." }, { status: 422 });
    }

    const rawResponse = await analyzeText(sanitizedText, mode);
    const parsed = parseGeminiResponse(rawResponse);

    return NextResponse.json(parsed, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    if (message === "Analysis parsing failed.") {
      return NextResponse.json({ error: "Analysis parsing failed." }, { status: 500 });
    }

    if (
      message.includes("KLARITEX") ||
      message.toLowerCase().includes("unavailable") ||
      message.toLowerCase().includes("quota") ||
      message.toLowerCase().includes("429")
    ) {
      return NextResponse.json({ error: "Gemini API unavailable." }, { status: 503 });
    }

    return NextResponse.json({ error: "Analysis failed." }, { status: 500 });
  }
}
