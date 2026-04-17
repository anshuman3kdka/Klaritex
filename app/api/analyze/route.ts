import { NextResponse } from "next/server";

import { analyzeWithParseRetry } from "@/lib/analyzeWithParseRetry";
import { isProviderUnavailableError, sanitizeInput } from "@/lib/gemini";
import { checkRateLimit } from "@/lib/rateLimit";
import type { AnalysisMode } from "@/lib/types";

export const maxDuration = 60;

interface AnalyzeRequestBody {
  text?: unknown;
  mode?: unknown;
}

function isValidMode(value: unknown): value is AnalysisMode {
  return value === "quick" || value === "deep";
}

export async function POST(request: Request) {
  // Content-Length can be absent or spoofed by clients, so this is only a fast-path guard.
  const contentLengthHeader = request.headers.get("content-length");
  const contentLength = Number(contentLengthHeader);

  if (contentLengthHeader !== null && Number.isFinite(contentLength) && contentLength > 51200) {
    return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const { allowed } = await checkRateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before trying again." },
      { status: 429 }
    );
  }

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
    const parsed = await analyzeWithParseRetry(sanitizedText, mode);

    return NextResponse.json(parsed, { status: 200 });
  } catch (error) {
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
