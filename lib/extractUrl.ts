import * as cheerio from "cheerio";
import fetch from "node-fetch";
import dns from "dns/promises";

const MAX_REDIRECT_HOPS = 2;

function isPrivateIP(ip: string): boolean {
  return (
    /^(127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(ip) ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip) ||
    ip === "::1" ||
    ip === "0000:0000:0000:0000:0000:0000:0000:0001" ||
    /^f[c-d][0-9a-f]{2}:/i.test(ip) ||
    /^fe80:/i.test(ip)
  );
}

async function validateSafeUrl(urlString: string): Promise<void> {
  try {
    const url = new URL(urlString);

    if (url.hostname === "localhost" || url.hostname.endsWith(".localhost")) {
      throw new Error("Unsafe");
    }

    const lookup = await dns.lookup(url.hostname);

    // Check resolved IP. If hostname was already an IP, it will be the same.
    if (isPrivateIP(lookup.address)) {
      throw new Error("Unsafe");
    }
  } catch (e) {
    throw new UrlExtractionError("Unsafe URL detected.");
  }
}

export class UrlExtractionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UrlExtractionError";
  }
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

async function fetchWithRedirectLimit(initialUrl: string): Promise<string> {
  let currentUrl = initialUrl;

  for (let hop = 0; hop <= MAX_REDIRECT_HOPS; hop += 1) {
    await validateSafeUrl(currentUrl);

    const response = await fetch(currentUrl, {
      method: "GET",
      redirect: "manual"
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
