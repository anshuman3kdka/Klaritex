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
    const parsed = new URL(urlString);

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }

    const hostname = parsed.hostname;

    // Prevent SSRF: block localhost, internal IP ranges
    if (
      hostname === "localhost" ||
      hostname.match(/^127\.\d+\.\d+\.\d+$/) ||
      hostname.match(/^10\.\d+\.\d+\.\d+$/) ||
      hostname.match(/^192\.168\.\d+\.\d+$/) ||
      hostname.match(/^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/) ||
      hostname.match(/^0\.\d+\.\d+\.\d+$/) ||
      hostname.match(/^\[?::1\]?$/) ||
      hostname.match(/^\[?::\]?$/)
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

async function fetchWithRedirectLimit(initialUrl: string): Promise<string> {
  if (!isSafeUrl(initialUrl)) {
    throw new UrlExtractionError("Could not fetch content from URL.");
  }
  let currentUrl = initialUrl;

  for (let hop = 0; hop <= MAX_REDIRECT_HOPS; hop += 1) {
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

      const nextUrl = new URL(location, currentUrl).toString();
      if (!isSafeUrl(nextUrl)) {
        throw new UrlExtractionError("Could not fetch content from URL.");
      }
      currentUrl = nextUrl;
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
