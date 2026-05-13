import { isIP } from "node:net";
import { NextResponse } from "next/server";

function extractFirstHeaderValue(value: string | null): string | null {
  if (!value) return null;
  const first = value.split(",")[0]?.trim();
  return first || null;
}

function normalizeIp(value: string | null): string | null {
  if (!value) return null;
  const candidate = value.replace(/^\[|\]$/g, "");
  return isIP(candidate) ? candidate : null;
}

export function getClientIdentifier(request: Request): string {
  const headerCandidates = [
    request.headers.get("cf-connecting-ip"),
    request.headers.get("x-real-ip"),
    extractFirstHeaderValue(request.headers.get("x-forwarded-for")),
  ];

  for (const candidate of headerCandidates) {
    const ip = normalizeIp(candidate);
    if (ip) {
      return `ip:${ip}`;
    }
  }

  return "fallback:unknown";
}

export function isJsonRequest(request: Request): boolean {
  return hasExpectedContentType(request, "application/json");
}

export function hasExpectedContentType(request: Request, expectedMimeType: string): boolean {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  const mimeType = contentType.split(";")[0]?.trim() ?? "";
  return mimeType === expectedMimeType;
}

export function isAllowedApiOrigin(request: Request): boolean {
  const fetchSite = request.headers.get("sec-fetch-site")?.toLowerCase().trim();
  if (fetchSite === "cross-site") {
    return false;
  }

  const originHeader = request.headers.get("origin");
  if (!originHeader) {
    return true;
  }

  try {
    const requestOrigin = new URL(request.url).origin;
    const providedOrigin = new URL(originHeader).origin;
    return requestOrigin === providedOrigin;
  } catch {
    return false;
  }
}

export async function parseJsonBodyWithLimit<T>(
  request: Request,
  maxBytes: number
): Promise<
  | { ok: true; body: T }
  | {
      ok: false;
      status: number;
      error: string;
    }
> {
  let rawBody: string;

  try {
    rawBody = await request.text();
  } catch {
    return { ok: false, status: 400, error: "Invalid request body." };
  }

  if (Buffer.byteLength(rawBody, "utf8") > maxBytes) {
    return { ok: false, status: 413, error: "Request body is too large." };
  }

  try {
    return { ok: true, body: JSON.parse(rawBody) as T };
  } catch {
    return { ok: false, status: 400, error: "Invalid JSON body." };
  }
}

export function secureJsonResponse(
  payload: unknown,
  init: { status?: number; headers?: HeadersInit } = {}
): NextResponse {
  const response = NextResponse.json(payload, init);

  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  response.headers.set("X-Content-Type-Options", "nosniff");

  return response;
}
