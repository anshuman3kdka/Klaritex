import { isIP } from "node:net";

export function extractLastHeaderValue(value: string | null): string | null {
  if (!value) return null;
  const parts = value.split(",");
  const last = parts[parts.length - 1]?.trim();
  return last || null;
}

export function normalizeIp(value: string | null): string | null {
  if (!value) return null;
  const candidate = value.replace(/^\[|\]$/g, "");
  return isIP(candidate) ? candidate : null;
}

export function getClientIdentifier(request: Request): string {
  const headerCandidates = [
    request.headers.get("cf-connecting-ip"),
    request.headers.get("x-real-ip"),
    extractLastHeaderValue(request.headers.get("x-forwarded-for")),
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
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  return contentType.includes("application/json");
}
