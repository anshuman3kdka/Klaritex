import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const POSTS_DIR = path.join(process.cwd(), "content/posts");

export interface PostMeta {
  title: string;
  date: string;
  slug: string;
  excerpt: string;
  published: boolean;
}

export interface Post extends PostMeta {
  contentHtml: string;
}

function normalizeMeta(data: Record<string, unknown>, filename: string): PostMeta {
  const slug =
    typeof data.slug === "string" && data.slug
      ? data.slug
      : filename.replace(/\.md$/, "");
  const title = typeof data.title === "string" ? data.title : slug;
  const excerpt = typeof data.excerpt === "string" ? data.excerpt : "";
  const published = data.published === true;
  // js-yaml may parse unquoted YYYY-MM-DD as a Date object (local midnight).
  // Read back local components to avoid UTC off-by-one in non-UTC environments.
  let date: string;
  if (data.date instanceof Date) {
    const d = data.date;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    date = `${y}-${m}-${day}`;
  } else if (typeof data.date === "string" && data.date) {
    date = data.date;
  } else {
    // Sentinel: missing-date posts sort to the bottom.
    date = "1970-01-01";
  }
  return { title, date, slug, excerpt, published };
}

export function getAllPostMeta(): PostMeta[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
  return files
    .map((filename) => {
      const raw = fs.readFileSync(path.join(POSTS_DIR, filename), "utf8");
      const { data } = matter(raw);
      return normalizeMeta(data as Record<string, unknown>, filename);
    })
    .filter((p) => p.published)
    .sort((a, b) => {
      if (a.date === b.date) return 0;
      return a.date < b.date ? 1 : -1;
    });
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  if (!fs.existsSync(POSTS_DIR)) return null;
  // Attempt direct filename resolution first (slug == basename without extension)
  const candidate = path.join(POSTS_DIR, `${slug}.md`);
  if (fs.existsSync(candidate)) {
    const raw = fs.readFileSync(candidate, "utf8");
    const { data, content } = matter(raw);
    const meta = normalizeMeta(data as Record<string, unknown>, `${slug}.md`);
    if (meta.published && meta.slug === slug) {
      const processed = await remark().use(html).process(content);
      return { ...meta, contentHtml: processed.toString() };
    }
  }
  // Fall back to a linear scan for posts whose slug differs from their filename
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
  for (const filename of files) {
    const raw = fs.readFileSync(path.join(POSTS_DIR, filename), "utf8");
    const { data, content } = matter(raw);
    const meta = normalizeMeta(data as Record<string, unknown>, filename);
    if (meta.slug === slug && meta.published) {
      const processed = await remark().use(html).process(content);
      return { ...meta, contentHtml: processed.toString() };
    }
  }
  return null;
}
