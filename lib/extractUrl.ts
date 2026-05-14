import * as cheerio from "cheerio";
import * as dns from "node:dns";
import * as http from "node:http";
import * as https from "node:https";
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

function isBlockedIpv4Prefix(p1: number, p2: number, p3: number): boolean {
  return (
    p1 === 0 || // 0.0.0.0/8
    p1 === 10 || // 10.0.0.0/8
    p1 === 127 || // 127.0.0.0/8
    (p1 === 172 && p2 >= 16 && p2 <= 31) || // 172.16.0.0/12
    (p1 === 192 && p2 === 168) || // 192.168.0.0/16
    (p1 === 169 && p2 === 254) || // 169.254.0.0/16
    (p1 === 100 && p2 >= 64 && p2 <= 127) || // 100.64.0.0/10
    (p1 === 192 && p2 === 0 && p3 === 0) || // 192.0.0.0/24
    (p1 === 192 && p2 === 0 && p3 === 2) || // 192.0.2.0/24 (TEST-NET-1)
    (p1 === 198 && (p2 === 18 || p2 === 19)) || // 198.18.0.0/15
    (p1 === 198 && p2 === 51 && p3 === 100) || // 198.51.100.0/24 (TEST-NET-2)
    (p1 === 203 && p2 === 0 && p3 === 113) || // 203.0.113.0/24 (TEST-NET-3)
    p1 >= 224 // Multicast and reserved space
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
  return isBlockedIpv4Prefix(octets[0], octets[1], octets[2]);
}

function isIpv6LinkLocalAddress(ipv6: string): boolean {
  return /^fe[89ab]/.test(ipv6);
}

function isBlockedIpAddress(address: string): boolean {
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = address.match(ipv4Regex);
  if (match) {
    const octets = match.slice(1).map((part) => parseInt(part, 10));
    if (octets.some((part) => part < 0 || part > 255)) {
      return true;
    }
    return isBlockedIpv4Prefix(octets[0]!, octets[1]!, octets[2]!);
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
    return isBlockedIpv4Prefix(octets[0], octets[1], octets[2]);
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
    return isBlockedIpv4Prefix(octets[0], octets[1], octets[2]);
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
    isIpv6LinkLocalAddress(ipv6) ||
    ipv6.startsWith("ff")
  );
}

function secureLookup(
  hostname: string,
  options: dns.LookupOptions,
  callback: (err: NodeJS.ErrnoException | null, address: any, family: number) => void
) {
  dns.lookup(hostname, options, (err, address, family) => {
    if (err) {
      return callback(err, address as any, family);
    }

    const addresses = Array.isArray(address)
      ? address.map((a) => a.address)
      : [address];

    for (const ip of addresses) {
      if (typeof ip === "string" && isBlockedIpAddress(ip)) {
        return callback(
          new Error("Could not fetch content from URL."),
          address as any,
          family
        );
      }
    }

    callback(null, address, family);
  });
}

const httpAgent = new http.Agent({ lookup: secureLookup as any });
const httpsAgent = new https.Agent({ lookup: secureLookup as any });

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
      hostname.endsWith(".localdomain") ||
      hostname.endsWith(".internal") ||
      hostname.endsWith(".home.arpa") ||
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

async function fetchWithRedirectLimit(initialUrl: string): Promise<string> {
  let currentUrl = initialUrl;

  for (let hop = 0; hop <= MAX_REDIRECT_HOPS; hop += 1) {
    if (!isSafeUrl(currentUrl)) {
      throw new UrlExtractionError("Could not fetch content from URL.");
    }

    const response = await fetch(currentUrl, {
      method: "GET",
      redirect: "manual",
      size: 5 * 1024 * 1024, // 5MB limit to prevent memory exhaustion DoS
      signal: AbortSignal.timeout(8000),
      agent: (parsedUrl) => (parsedUrl.protocol === "http:" ? httpAgent : httpsAgent),
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
