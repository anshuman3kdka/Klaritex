import * as cheerio from "cheerio";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import fetch from "node-fetch";

const MAX_REDIRECT_HOPS = 2;

export class UrlExtractionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UrlExtractionError";
  }
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function isBlockedIpv4Prefix(p1: number, p2: number): boolean {
  return (
    p1 === 0 || // 0.0.0.0/8
    p1 === 10 || // 10.0.0.0/8
    p1 === 127 || // 127.0.0.0/8
    (p1 === 172 && p2 >= 16 && p2 <= 31) || // 172.16.0.0/12
    (p1 === 192 && p2 === 168) || // 192.168.0.0/16
    (p1 === 169 && p2 === 254) // 169.254.0.0/16
  );
}

function parseDottedIpv4Octets(parts: Array<string | undefined>): number[] | null {
  if (parts.length !== 4 || parts.some((part) => !part)) {
    return null;
  }

  const octets = parts.map((part) => parseInt(part!, 10));
  if (octets.some((part) => Number.isNaN(part) || part < 0 || part > 255)) {
    return null;
  }

  return octets;
}

function isBlockedEmbeddedIpv4FromHexWords(highWordHex: string, lowWordHex: string): boolean {
  const high = parseInt(highWordHex, 16);
  const low = parseInt(lowWordHex, 16);
  const octets = [(high >> 8) & 0xff, high & 0xff, (low >> 8) & 0xff, low & 0xff];
  return isBlockedIpv4Prefix(octets[0], octets[1]);
}

function isBlockedIpAddress(address: string): boolean {
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = address.match(ipv4Regex);
  if (match) {
    const octets = match.slice(1).map((part) => parseInt(part, 10));
    if (octets.some((part) => part < 0 || part > 255)) {
      return true;
    }
    return isBlockedIpv4Prefix(octets[0]!, octets[1]!);
  }

  const ipv6 = address.toLowerCase();
  const mappedDotted = ipv6.match(
    /^(?:(?:0:){5}|::)ffff:(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
  );
  if (mappedDotted) {
    const octets = parseDottedIpv4Octets([
      mappedDotted[1],
      mappedDotted[2],
      mappedDotted[3],
      mappedDotted[4],
    ]);
    if (!octets) {
      return true;
    }
    return isBlockedIpv4Prefix(octets[0], octets[1]);
  }

  const compatibleDotted = ipv6.match(
    /^(?:(?:0:){6}|::)(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
  );
  if (compatibleDotted) {
    const octets = parseDottedIpv4Octets([
      compatibleDotted[1],
      compatibleDotted[2],
      compatibleDotted[3],
      compatibleDotted[4],
    ]);
    if (!octets) {
      return true;
    }
    return isBlockedIpv4Prefix(octets[0], octets[1]);
  }

  const mappedHex = ipv6.match(
    /^(?:(?:0:){5}|::)ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/
  );
  if (mappedHex) {
    return isBlockedEmbeddedIpv4FromHexWords(mappedHex[1]!, mappedHex[2]!);
  }

  const compatibleHex = ipv6.match(/^(?:(?:0:){6}|::)([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (compatibleHex) {
    return isBlockedEmbeddedIpv4FromHexWords(compatibleHex[1]!, compatibleHex[2]!);
  }

  return (
    ipv6 === "::" ||
    ipv6 === "::1" ||
    ipv6 === "0:0:0:0:0:0:0:0" ||
    ipv6 === "0:0:0:0:0:0:0:1" ||
    ipv6.startsWith("fd") ||
    ipv6.startsWith("fc") ||
    ipv6.startsWith("fe80")
  );
}

function isSafeUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;

    const hostname = url.hostname.toLowerCase();
    if (url.username || url.password) {
      return false;
    }
    if (url.port && url.port !== "80" && url.port !== "443") {
      return false;
    }

    if (
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".")
    ) {
      return false;
    }

    const normalizedHostname = hostname.replace(/^\[|\]$/g, "");
    if (isIP(normalizedHostname) && isBlockedIpAddress(normalizedHostname)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

async function assertPublicDnsResolution(urlString: string): Promise<void> {
  const url = new URL(urlString);
  const records = await lookup(url.hostname, { all: true });

  if (!records.length) {
    throw new UrlExtractionError("Could not fetch content from URL.");
  }

  for (const record of records) {
    if (isBlockedIpAddress(record.address)) {
      throw new UrlExtractionError("Could not fetch content from URL.");
    }
  }
}

async function fetchWithRedirectLimit(initialUrl: string): Promise<string> {
  let currentUrl = initialUrl;

  for (let hop = 0; hop <= MAX_REDIRECT_HOPS; hop += 1) {
    if (!isSafeUrl(currentUrl)) {
      throw new UrlExtractionError("Could not fetch content from URL.");
    }
    await assertPublicDnsResolution(currentUrl);

    const response = await fetch(currentUrl, {
      method: "GET",
      redirect: "manual",
      size: 5 * 1024 * 1024, // 5MB limit to prevent memory exhaustion DoS
      signal: AbortSignal.timeout(8000),
    });

    const status = response.status;
    const isRedirect = status >= 300 && status < 400;

    if (isRedirect) {
      if (hop >= MAX_REDIRECT_HOPS) {
        throw new UrlExtractionError("Could not fetch content from URL.");
      }

      const location = response.headers.get("location");

      if (!location) {
        throw new UrlExtractionError("Could not fetch content from URL.");
      }

      currentUrl = new URL(location, currentUrl).toString();
      continue;
    }

    if (!response.ok) {
      throw new UrlExtractionError("Could not fetch content from URL.");
    }

    const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
    const isSupportedContentType =
      contentType.includes("text/html") ||
      contentType.includes("application/xhtml+xml") ||
      contentType.includes("text/plain");

    if (!isSupportedContentType) {
      throw new UrlExtractionError("Could not fetch content from URL.");
    }

    return await response.text();
  }

  throw new UrlExtractionError("Could not fetch content from URL.");
}

export async function extractUrlText(url: string): Promise<string> {
  let html: string;

  try {
    html = await fetchWithRedirectLimit(url);
  } catch (error) {
    if (error instanceof UrlExtractionError) {
      throw error;
    }

    throw new UrlExtractionError("Could not fetch content from URL.");
  }

  const $ = cheerio.load(html);

  $("script, style, nav, header, footer").remove();

  const parts: string[] = [];

  $("main, article, p").each((_, element) => {
    const text = normalizeWhitespace($(element).text());
    if (text) {
      parts.push(text);
    }
  });

  const extracted = normalizeWhitespace(parts.join("\n"));

  if (!extracted) {
    throw new UrlExtractionError("Could not fetch content from URL.");
  }

  return extracted.slice(0, 10000);
}
