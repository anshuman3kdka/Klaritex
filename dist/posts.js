// lib/posts.ts
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import * as cheerio from "cheerio";
var POSTS_DIR = path.join(process.cwd(), "content/posts");
function normalizeMeta(data, filename) {
  const slug = typeof data.slug === "string" && data.slug ? data.slug : filename.replace(/\.md$/, "");
  const title = typeof data.title === "string" ? data.title : slug;
  const excerpt = typeof data.excerpt === "string" ? data.excerpt : "";
  const published = data.published === true;
  let date;
  if (data.date instanceof Date) {
    const d = data.date;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    date = `${y}-${m}-${day}`;
  } else if (typeof data.date === "string" && data.date) {
    date = data.date;
  } else {
    date = "1970-01-01";
  }
  return { title, date, slug, excerpt, published };
}
function sanitizeHtml(rawHtml) {
  const $ = cheerio.load(rawHtml, null, false);
  const dangerousTags = ["script", "iframe", "object", "embed", "form", "base", "math"];
  dangerousTags.forEach((tag) => $(tag).remove());
  $("*").each((_, el) => {
    if (el.type === "tag") {
      const attribs = el.attribs;
      for (const attr in attribs) {
        if (attr.toLowerCase().startsWith("on")) {
          $(el).removeAttr(attr);
        }
      }
    }
  });
  const isSafeUrl = (url) => {
    if (!url)
      return false;
    if (url.startsWith("/") || url.startsWith("#") || url.startsWith("?"))
      return true;
    try {
      const parsed = new URL(url, "http://localhost");
      return ["http:", "https:", "mailto:", "tel:"].includes(parsed.protocol);
    } catch {
      return false;
    }
  };
  $("[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!isSafeUrl(href)) {
      $(el).removeAttr("href");
    }
  });
  $("[src]").each((_, el) => {
    const src = $(el).attr("src");
    if (!isSafeUrl(src)) {
      $(el).removeAttr("src");
    }
  });
  return $.html();
}
function getAllPostMeta() {
  if (!fs.existsSync(POSTS_DIR))
    return [];
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
  return files.map((filename) => {
    const raw = fs.readFileSync(path.join(POSTS_DIR, filename), "utf8");
    const { data } = matter(raw);
    return normalizeMeta(data, filename);
  }).filter((p) => p.published).sort((a, b) => {
    if (a.date === b.date)
      return 0;
    return a.date < b.date ? 1 : -1;
  });
}
async function getPostBySlug(slug) {
  if (!fs.existsSync(POSTS_DIR))
    return null;
  const candidate = path.join(POSTS_DIR, `${slug}.md`);
  if (fs.existsSync(candidate)) {
    const raw = fs.readFileSync(candidate, "utf8");
    const { data, content } = matter(raw);
    const meta = normalizeMeta(data, `${slug}.md`);
    if (meta.published && meta.slug === slug) {
      const processed = await remark().use(html).process(content);
      return { ...meta, contentHtml: sanitizeHtml(processed.toString()) };
    }
  }
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
  for (const filename of files) {
    const raw = fs.readFileSync(path.join(POSTS_DIR, filename), "utf8");
    const { data, content } = matter(raw);
    const meta = normalizeMeta(data, filename);
    if (meta.slug === slug && meta.published) {
      const processed = await remark().use(html).process(content);
      return { ...meta, contentHtml: sanitizeHtml(processed.toString()) };
    }
  }
  return null;
}
export {
  getPostBySlug,
  getAllPostMeta
};
