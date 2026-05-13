import { analyzeWithParseRetry } from "@/lib/analyzeWithParseRetry";
import { extractUrlText, UrlExtractionError } from "@/lib/extractUrl";
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

  const parsedBody = await parseJsonBodyWithLimit<AnalyzeUrlRequestBody>(request, 51200);
  if (!parsedBody.ok) {
    return secureJsonResponse({ error: parsedBody.error }, { status: parsedBody.status });
  }
  const body = parsedBody.body;

  const rawUrl = body.url;
  const mode = body.mode;

  if (typeof rawUrl !== "string" || !isValidUrl(rawUrl)) {
    return secureJsonResponse({ error: "A valid URL is required." }, { status: 400 });
  }

  if (!isValidMode(mode)) {
    return secureJsonResponse({ error: "Mode must be 'quick' or 'deep'." }, { status: 400 });
  }

  try {
    const urlText = await extractUrlText(rawUrl);
    const sanitizedText = sanitizeInput(urlText);

    if (!sanitizedText) {
      return secureJsonResponse({ error: "Could not fetch content from URL." }, { status: 422 });
    }

    const parsed = await analyzeWithParseRetry(sanitizedText, mode);

    return secureJsonResponse(parsed, { status: 200 });
  } catch (error) {
    if (error instanceof UrlExtractionError) {
      return secureJsonResponse({ error: "Could not fetch content from URL." }, { status: 422 });
    }

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
