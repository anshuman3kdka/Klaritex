import * as cheerio from "cheerio";
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

function isSafeUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;

    const hostname = url.hostname.toLowerCase();

    if (
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".")
    ) {
      return false;
    }

    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = hostname.match(ipv4Regex);
    if (match) {
      const p1 = parseInt(match[1]!, 10);
      const p2 = parseInt(match[2]!, 10);
      if (
        p1 === 0 || // 0.0.0.0/8
        p1 === 10 || // 10.0.0.0/8
        p1 === 127 || // 127.0.0.0/8
        (p1 === 172 && p2 >= 16 && p2 <= 31) || // 172.16.0.0/12
        (p1 === 192 && p2 === 168) || // 192.168.0.0/16
        (p1 === 169 && p2 === 254) // 169.254.0.0/16
      ) {
        return false;
      }
    }

    if (hostname.startsWith("[") && hostname.endsWith("]")) {
      const ipv6 = hostname.slice(1, -1).toLowerCase();
      if (
        ipv6 === "::" ||
        ipv6 === "0:0:0:0:0:0:0:0" ||
        ipv6 === "::1" ||
        ipv6 === "0:0:0:0:0:0:0:1" ||
        ipv6.startsWith("fd") ||
        ipv6.startsWith("fc") ||
        ipv6.startsWith("fe80")
      ) {
        return false;
      }

      // Handle IPv4-compatible IPv6 addresses: ::a.b.c.d
      // Node.js normalizes ::a.b.c.d → ::(a*256+b):(c*256+d) in hex.
      const compatMatch = ipv6.match(/^::([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
      if (compatMatch) {
        const high = parseInt(compatMatch[1]!, 16);
        const p1 = (high >> 8) & 0xff;
        const p2 = high & 0xff;
        if (
          p1 === 0 ||
          p1 === 10 ||
          p1 === 127 ||
          (p1 === 172 && p2 >= 16 && p2 <= 31) ||
          (p1 === 192 && p2 === 168) ||
          (p1 === 169 && p2 === 254)
        ) {
          return false;
        }
      }

      // Handle IPv4-mapped IPv6 in dotted-decimal form: ::ffff:a.b.c.d
      const dottedMatch = ipv6.match(
        /^::ffff:(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
      );
      if (dottedMatch) {
        const p1 = parseInt(dottedMatch[1]!, 10);
        const p2 = parseInt(dottedMatch[2]!, 10);
        // Reject malformed octets (0-255 only) and private/internal ranges.
        if (
          p1 > 255 || p2 > 255 ||
          parseInt(dottedMatch[3]!, 10) > 255 ||
          parseInt(dottedMatch[4]!, 10) > 255 ||
          p1 === 0 ||
          p1 === 10 ||
          p1 === 127 ||
          (p1 === 172 && p2 >= 16 && p2 <= 31) ||
          (p1 === 192 && p2 === 168) ||
          (p1 === 169 && p2 === 254)
        ) {
          return false;
        }
      }

      // Handle IPv4-mapped IPv6 in hex form: ::ffff:HHHH:HHHH
      // Node.js normalizes ::ffff:a.b.c.d → ::ffff:(a*256+b):(c*256+d) in hex.
      // Reconstruct the first two IPv4 octets from the high 16-bit group and
      // reuse the same range checks as the IPv4 path above.
      // The low 16-bit group (third and fourth octets) is the host portion and
      // does not affect which subnet the address belongs to for any blocked range.
      const hexMatch = ipv6.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
      if (hexMatch) {
        const high = parseInt(hexMatch[1]!, 16);
        const p1 = (high >> 8) & 0xff;
        const p2 = high & 0xff;
        if (
          p1 === 0 ||
          p1 === 10 ||
          p1 === 127 ||
          (p1 === 172 && p2 >= 16 && p2 <= 31) ||
          (p1 === 192 && p2 === 168) ||
          (p1 === 169 && p2 === 254)
        ) {
          return false;
        }
      }
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
      size: 5 * 1024 * 1024 // 5MB limit to prevent memory exhaustion DoS
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
