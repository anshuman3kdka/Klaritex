import { NextResponse } from "next/server";

import { analyzeText, sanitizeInput } from "@/lib/gemini";
import { parseGeminiResponse } from "@/lib/parseResponse";
import type { AnalysisMode } from "@/lib/types";

interface AnalyzeRequestBody {
  text?: unknown;
  mode?: unknown;
}

function isValidMode(value: unknown): value is AnalysisMode {
  return value === "quick" || value === "deep";
}

export async function POST(request: Request) {
  let body: AnalyzeRequestBody;

  try {
    body = (await request.json()) as AnalyzeRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const rawText = body.text;
  const mode = body.mode;

  if (typeof rawText !== "string") {
    return NextResponse.json({ error: "Text is required." }, { status: 400 });
  }

  if (!isValidMode(mode)) {
    return NextResponse.json({ error: "Mode must be 'quick' or 'deep'." }, { status: 400 });
  }

  const sanitizedText = sanitizeInput(rawText);

  if (!sanitizedText) {
    return NextResponse.json({ error: "Text is required." }, { status: 400 });
  }

  try {
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
