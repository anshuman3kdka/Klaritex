import * as cheerio from "cheerio";

export function sanitizeHtml(htmlContent: string): string {
  const $ = cheerio.load(htmlContent, null, false);
  const allowedTags = new Set([
    "a", "b", "br", "code", "div", "em", "h1", "h2", "h3", "h4", "h5", "h6",
    "hr", "i", "img", "li", "ol", "p", "pre", "span", "strong", "table",
    "tbody", "td", "th", "thead", "tr", "ul", "blockquote"
  ]);

  $("*").each((_, el) => {
    if (el.type === "script" || el.type === "style") {
      $(el).remove();
      return;
    }

    if (el.type !== "tag") return;

    if (!allowedTags.has(el.name)) {
      $(el).remove();
      return;
    }

    const attribs = el.attribs;
    for (const attr in attribs) {
      if (attr.toLowerCase().startsWith("on")) {
        $(el).removeAttr(attr);
      }
    }

    if (el.name === "a" && attribs.href) {
      try {
        const url = new URL(attribs.href, "http://localhost");
        if (!["http:", "https:", "mailto:", "tel:"].includes(url.protocol)) {
          $(el).removeAttr("href");
        }
      } catch (e) {
        $(el).removeAttr("href");
      }
    }

    if (el.name === "img" && attribs.src) {
      try {
        const url = new URL(attribs.src, "http://localhost");
        if (!["http:", "https:"].includes(url.protocol)) {
          $(el).removeAttr("src");
        }
      } catch (e) {
        $(el).removeAttr("src");
      }
    }
  });

  return $.html();
}
