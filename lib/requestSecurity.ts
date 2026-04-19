import { isIP } from "node:net";

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

  const userAgent = request.headers.get("user-agent") ?? "unknown-agent";
  return `fallback:${userAgent.slice(0, 120)}`;
}

export function isJsonRequest(request: Request): boolean {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  return contentType.includes("application/json");
}
