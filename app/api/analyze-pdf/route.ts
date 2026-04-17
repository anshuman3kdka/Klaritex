import { NextResponse } from "next/server";

import { extractPdfText } from "@/lib/extractPdf";
import { analyzeText, isProviderUnavailableError, sanitizeInput } from "@/lib/gemini";
import { parseGeminiResponse } from "@/lib/parseResponse";
import { checkRateLimit } from "@/lib/rateLimit";
import type { AnalysisMode } from "@/lib/types";

export const maxDuration = 60;

function isValidMode(value: unknown): value is AnalysisMode {
  return value === "quick" || value === "deep";
}

export async function POST(request: Request) {
  // Content-Length can be absent or spoofed by clients, so this is only a fast-path guard.
  const contentLengthHeader = request.headers.get("content-length");
  const contentLength = Number(contentLengthHeader);

  if (contentLengthHeader !== null && Number.isFinite(contentLength) && contentLength > 6291456) {
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

  // 10MB limit to prevent Memory Exhaustion DoS
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large. Maximum size is 10MB." }, { status: 413 });
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

    let rawResponse = await analyzeText(sanitizedText, mode);
    let parsed;
    try {
      parsed = parseGeminiResponse(rawResponse);
    } catch {
      // One retry helps recover from occasional truncated model JSON payloads.
      rawResponse = await analyzeText(sanitizedText, mode);
      parsed = parseGeminiResponse(rawResponse);
    }

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
