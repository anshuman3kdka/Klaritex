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
    <main id="main-content" className="min-h-screen bg-[var(--bg-primary)] px-6 py-10 text-[var(--text-primary)] md:px-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <Link className="inline-block text-[var(--text-gold)] hover:underline" href="/">
          ← Back to home
        </Link>

        <header className="space-y-3">
          <h1 className="font-display text-4xl md:text-5xl">Insights</h1>
          <p className="max-w-3xl text-[var(--text-secondary)]">
            Analysis, commentary, and applications of the Clarity Engine framework.
          </p>
        </header>

        {posts.length === 0 ? (
          <p>No posts yet.</p>
        ) : (
          <section className="grid gap-5">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 transition hover:border-[var(--border-accent)]"
              >
                <h2 className="font-display text-2xl text-[var(--text-primary)]">{post.title}</h2>
                <p className="mt-1 text-sm text-[var(--text-gold)]">{formatDate(post.date)}</p>
                <p className="mt-3 text-[var(--text-secondary)]">{post.excerpt}</p>
              </Link>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
