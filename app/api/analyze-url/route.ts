import { NextResponse } from "next/server";

import { extractUrlText, UrlExtractionError } from "@/lib/extractUrl";
import { analyzeText, isProviderUnavailableError, sanitizeInput } from "@/lib/gemini";
import { parseGeminiResponse } from "@/lib/parseResponse";
import type { AnalysisMode } from "@/lib/types";

interface AnalyzeUrlRequestBody {
  url?: unknown;
  mode?: unknown;
}

function isValidMode(value: unknown): value is AnalysisMode {
  return value === "quick" || value === "deep";
}

function isValidUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  let body: AnalyzeUrlRequestBody;

  try {
    body = (await request.json()) as AnalyzeUrlRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const rawUrl = body.url;
  const mode = body.mode;

  if (typeof rawUrl !== "string" || !isValidUrl(rawUrl)) {
    return NextResponse.json({ error: "A valid URL is required." }, { status: 400 });
  }

  if (!isValidMode(mode)) {
    return NextResponse.json({ error: "Mode must be 'quick' or 'deep'." }, { status: 400 });
  }

  try {
    const urlText = await extractUrlText(rawUrl);
    const sanitizedText = sanitizeInput(urlText);

    if (!sanitizedText) {
      return NextResponse.json({ error: "Could not fetch content from URL." }, { status: 422 });
    }

    const rawResponse = await analyzeText(sanitizedText, mode);
    const parsed = parseGeminiResponse(rawResponse);

    return NextResponse.json(parsed, { status: 200 });
  } catch (error) {
    if (error instanceof UrlExtractionError) {
      return NextResponse.json({ error: "Could not fetch content from URL." }, { status: 422 });
    }

    const message = error instanceof Error ? error.message : "Unknown error";

    if (message === "Analysis parsing failed.") {
      return NextResponse.json({ error: "Analysis parsing failed." }, { status: 500 });
    }

    if (isProviderUnavailableError(message)) {
      if (message.toLowerCase().includes("missing gemini api key")) {
        return NextResponse.json(
          { error: "Gemini API key is not configured on the server." },
          { status: 503 }
        );
      }

      if (message.toLowerCase().includes("missing groq api key")) {
        return NextResponse.json(
          { error: "Groq API key is not configured on the server." },
          { status: 503 }
        );
      }

      return NextResponse.json({ error: "AI service unavailable." }, { status: 503 });
    }

    return NextResponse.json({ error: "Analysis failed." }, { status: 500 });
  }
}
