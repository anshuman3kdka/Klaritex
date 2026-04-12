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
      hostname.endsWith(".local")
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
      const ipv6 = hostname.slice(1, -1);

      // Cover the entire 10.0.0.0/8 block mapped in IPv6
      const isClassA = /^(?:::ffff:|::|0:0:0:0:0:ffff:|0:0:0:0:0:0:)a[0-f]{2}:/i.test(ipv6);

      if (
        ipv6 === "::" ||
        ipv6 === "0:0:0:0:0:0:0:0" ||
        ipv6 === "::1" ||
        ipv6 === "0:0:0:0:0:0:0:1" ||
        ipv6.startsWith("fd") ||
        ipv6.startsWith("fc") ||
        ipv6.startsWith("fe80") ||
        ipv6.includes("127.0.0.1") ||
        ipv6.startsWith("::ffff:7f") ||
        ipv6.startsWith("::ffff:a9fe:") ||
        ipv6.startsWith("::ffff:c0a8:") ||
        ipv6.startsWith("::7f") ||
        ipv6.startsWith("::a9fe:") ||
        ipv6.startsWith("::c0a8:") ||
        ipv6.startsWith("0:0:0:0:0:ffff:7f") ||
        ipv6.startsWith("0:0:0:0:0:ffff:a9fe:") ||
        ipv6.startsWith("0:0:0:0:0:ffff:c0a8:") ||
        ipv6.startsWith("0:0:0:0:0:0:7f") ||
        ipv6.startsWith("0:0:0:0:0:0:a9fe:") ||
        ipv6.startsWith("0:0:0:0:0:0:c0a8:") ||
        isClassA
      ) {
        return false;
      }

      // Handle 172.16.0.0/12 (ac10 to ac1f)
      const matchAc1 = ipv6.match(/^(?:::ffff:|::|0:0:0:0:0:ffff:|0:0:0:0:0:0:)ac1([0-9a-f])/i);
      if (matchAc1) {
        const hexDigit = matchAc1[1];
        if (hexDigit && parseInt(hexDigit, 16) >= 0 && parseInt(hexDigit, 16) <= 15) {
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
