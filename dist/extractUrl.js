// lib/extractUrl.ts
import * as cheerio from "cheerio";
import * as dns from "node:dns";
import * as http from "node:http";
import * as https from "node:https";
import { isIP } from "node:net";
import fetch from "node-fetch";
var MAX_REDIRECT_HOPS = 2;

class UrlExtractionError extends Error {
  constructor(message) {
    super(message);
    this.name = "UrlExtractionError";
  }
}
function normalizeWhitespace(text) {
  return text.replace(/\s+/g, " ").trim();
}
function isBlockedIpv4Prefix(p1, p2, p3) {
  return p1 === 0 || p1 === 10 || p1 === 127 || p1 === 172 && p2 >= 16 && p2 <= 31 || p1 === 192 && p2 === 168 || p1 === 169 && p2 === 254 || p1 === 100 && p2 >= 64 && p2 <= 127 || p1 === 192 && p2 === 0 && p3 === 0 || p1 === 192 && p2 === 0 && p3 === 2 || p1 === 198 && (p2 === 18 || p2 === 19) || p1 === 198 && p2 === 51 && p3 === 100 || p1 === 203 && p2 === 0 && p3 === 113 || p1 >= 224;
}
function parseDottedIpv4Octets(parts) {
  if (parts.length !== 4 || parts.some((part) => !part)) {
    return null;
  }
  const octets = parts.map((part) => parseInt(part, 10));
  if (octets.some((part) => Number.isNaN(part) || part < 0 || part > 255)) {
    return null;
  }
  return octets;
}
function isBlockedEmbeddedIpv4FromHexWords(highWordHex, lowWordHex) {
  const high = parseInt(highWordHex, 16);
  const low = parseInt(lowWordHex, 16);
  const octets = [high >> 8 & 255, high & 255, low >> 8 & 255, low & 255];
  return isBlockedIpv4Prefix(octets[0], octets[1], octets[2]);
}
function isIpv6LinkLocalAddress(ipv6) {
  return /^fe[89ab]/.test(ipv6);
}
function isBlockedIpAddress(address) {
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = address.match(ipv4Regex);
  if (match) {
    const octets = match.slice(1).map((part) => parseInt(part, 10));
    if (octets.some((part) => part < 0 || part > 255)) {
      return true;
    }
    return isBlockedIpv4Prefix(octets[0], octets[1], octets[2]);
  }
  const ipv6 = address.toLowerCase();
  const mappedDotted = ipv6.match(/^(?:(?:0:){5}|::)ffff:(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (mappedDotted) {
    const octets = parseDottedIpv4Octets([
      mappedDotted[1],
      mappedDotted[2],
      mappedDotted[3],
      mappedDotted[4]
    ]);
    if (!octets) {
      return true;
    }
    return isBlockedIpv4Prefix(octets[0], octets[1], octets[2]);
  }
  const compatibleDotted = ipv6.match(/^(?:(?:0:){6}|::)(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (compatibleDotted) {
    const octets = parseDottedIpv4Octets([
      compatibleDotted[1],
      compatibleDotted[2],
      compatibleDotted[3],
      compatibleDotted[4]
    ]);
    if (!octets) {
      return true;
    }
    return isBlockedIpv4Prefix(octets[0], octets[1], octets[2]);
  }
  const mappedHex = ipv6.match(/^(?:(?:0:){5}|::)ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (mappedHex) {
    return isBlockedEmbeddedIpv4FromHexWords(mappedHex[1], mappedHex[2]);
  }
  const compatibleHex = ipv6.match(/^(?:(?:0:){6}|::)([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (compatibleHex) {
    return isBlockedEmbeddedIpv4FromHexWords(compatibleHex[1], compatibleHex[2]);
  }
  return ipv6 === "::" || ipv6 === "::1" || ipv6 === "0:0:0:0:0:0:0:0" || ipv6 === "0:0:0:0:0:0:0:1" || ipv6.startsWith("fd") || ipv6.startsWith("fc") || isIpv6LinkLocalAddress(ipv6) || ipv6.startsWith("ff");
}
function isSafeUrl(urlString) {
  try {
    const url = new URL(urlString);
    if (url.protocol !== "http:" && url.protocol !== "https:")
      return false;
    const hostname = url.hostname.toLowerCase();
    if (url.username || url.password) {
      return false;
    }
    if (url.port && url.port !== "80" && url.port !== "443") {
      return false;
    }
    if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local") || hostname.endsWith(".localdomain") || hostname.endsWith(".internal") || hostname.endsWith(".home.arpa") || hostname.endsWith(".")) {
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
var safeLookup = (hostname, options, callback) => {
  dns.lookup(hostname, { ...options, all: true }, (err, addresses) => {
    if (err)
      return callback(err, "", 0);
    for (const record of addresses) {
      if (isBlockedIpAddress(record.address)) {
        return callback(new Error("Could not fetch content from URL."), "", 0);
      }
    }
    const first = addresses[0];
    if (!first) {
      return callback(new Error("Could not fetch content from URL."), "", 0);
    }
    callback(null, first.address, first.family || 0);
  });
};
var httpAgent = new http.Agent({ lookup: safeLookup });
var httpsAgent = new https.Agent({ lookup: safeLookup });
async function fetchWithRedirectLimit(initialUrl) {
  let currentUrl = initialUrl;
  for (let hop = 0;hop <= MAX_REDIRECT_HOPS; hop += 1) {
    if (!isSafeUrl(currentUrl)) {
      throw new UrlExtractionError("Could not fetch content from URL.");
    }
    const response = await fetch(currentUrl, {
      method: "GET",
      redirect: "manual",
      size: 5 * 1024 * 1024,
      signal: AbortSignal.timeout(8000),
      agent: (parsedUrl) => parsedUrl.protocol === "http:" ? httpAgent : httpsAgent
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
    const isSupportedContentType = contentType.includes("text/html") || contentType.includes("application/xhtml+xml") || contentType.includes("text/plain");
    if (!isSupportedContentType) {
      throw new UrlExtractionError("Could not fetch content from URL.");
    }
    return await response.text();
  }
  throw new UrlExtractionError("Could not fetch content from URL.");
}
async function extractUrlText(url) {
  let html;
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
  const parts = [];
  $("main, article, p").each((_, element) => {
    const text = normalizeWhitespace($(element).text());
    if (text) {
      parts.push(text);
    }
  });
  const extracted = normalizeWhitespace(parts.join(`
`));
  if (!extracted) {
    throw new UrlExtractionError("Could not fetch content from URL.");
  }
  return extracted.slice(0, 1e4);
}
export {
  extractUrlText,
  UrlExtractionError
};
