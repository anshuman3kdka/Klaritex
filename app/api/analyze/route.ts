import { analyzeWithParseRetry } from "@/lib/analyzeWithParseRetry";
import { isProviderUnavailableError, sanitizeInput } from "@/lib/gemini";
import { checkRateLimit } from "@/lib/rateLimit";
import {
  getClientIdentifier,
  isAllowedApiOrigin,
  isJsonRequest,
  parseJsonBodyWithLimit,
  secureJsonResponse,
} from "@/lib/requestSecurity";
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
  if (!isAllowedApiOrigin(request)) {
    return secureJsonResponse({ error: "Forbidden request origin." }, { status: 403 });
  }

  if (!isJsonRequest(request)) {
    return secureJsonResponse({ error: "Content-Type must be application/json." }, { status: 415 });
  }

  // Content-Length can be absent or spoofed by clients, so this is only a fast-path guard.
  const contentLengthHeader = request.headers.get("content-length");
  const contentLength = Number(contentLengthHeader);

  if (contentLengthHeader !== null && Number.isFinite(contentLength) && contentLength > 51200) {
    return secureJsonResponse({ error: "Request body is too large." }, { status: 413 });
  }

  const ip = getClientIdentifier(request);
  const { allowed } = await checkRateLimit(ip);

  if (!allowed) {
    return secureJsonResponse(
      { error: "Too many requests. Please wait before trying again." },
      { status: 429 }
    );
  }

  const parsedBody = await parseJsonBodyWithLimit<AnalyzeRequestBody>(request, 51200);
  if (!parsedBody.ok) {
    return secureJsonResponse({ error: parsedBody.error }, { status: parsedBody.status });
  }
  const body = parsedBody.body;

  const rawText = body.text;
  const mode = body.mode;

  if (typeof rawText !== "string") {
    return secureJsonResponse({ error: "Text is required." }, { status: 400 });
  }

  if (rawText.length > 20000) {
    return secureJsonResponse(
      { error: "Text is too large. Maximum is 20,000 characters." },
      { status: 413 }
    );
  }

  if (!isValidMode(mode)) {
    return secureJsonResponse({ error: "Mode must be 'quick' or 'deep'." }, { status: 400 });
  }

  const sanitizedText = sanitizeInput(rawText);

  if (!sanitizedText) {
    return secureJsonResponse({ error: "Text is required." }, { status: 400 });
  }

  try {
    const parsed = await analyzeWithParseRetry(sanitizedText, mode);

    return secureJsonResponse(parsed, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    if (message === "Analysis parsing failed.") {
      return secureJsonResponse({ error: "Analysis parsing failed." }, { status: 500 });
    }

    if (isProviderUnavailableError(message)) {
      if (message.toLowerCase().includes("missing gemini api key")) {
        return secureJsonResponse(
          { error: "Gemini API key is not configured on the server." },
          { status: 503 }
        );
      }

      return secureJsonResponse({ error: "AI service unavailable." }, { status: 503 });
    }

    return secureJsonResponse({ error: "Analysis failed." }, { status: 500 });
  }
}
