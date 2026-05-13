import Link from "next/link";
import { getAllPostMeta } from "@/lib/posts";

function formatDate(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function BlogPage() {
  const posts = getAllPostMeta();

  return (
    <main id="main-content" className="min-h-screen bg-[var(--lab-surface)] px-6 py-10 text-[var(--lab-ink)] md:px-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <Link className="inline-block text-[var(--lab-muted)] hover:text-[var(--lab-ink)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lab-gold)]/50 rounded-sm" href="/">
          ← Back to home
        </Link>

        <header className="space-y-3">
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-[var(--lab-ink)]">Insights</h1>
          <p className="max-w-3xl text-[var(--lab-muted)] font-sans">
            Analysis, commentary, and applications of the Clarity Engine framework.
          </p>
        </header>

        {posts.length === 0 ? (
          <p className="font-sans text-[var(--lab-muted)]">No posts yet.</p>
        ) : (
          <section className="grid gap-5">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block rounded-[16px] bg-[var(--lab-surface)] shadow-[var(--shadow-extruded)] hover:shadow-[var(--shadow-pressed)] p-6 transition-[box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lab-gold)]/50"
              >
                <h2 className="font-serif text-2xl font-semibold text-[var(--lab-ink)]">{post.title}</h2>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-[var(--lab-muted)]">{formatDate(post.date)}</p>
                <p className="mt-4 font-sans text-sm text-[var(--lab-ink)] leading-relaxed">{post.excerpt}</p>
              </Link>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
