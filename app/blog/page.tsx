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
    <main className="min-h-screen bg-[#080d1a] px-6 py-10 text-[#e8edf5] md:px-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <Link className="inline-block text-[#c9a84c] hover:underline" href="/">
          ← Back to home
        </Link>

        <header className="space-y-3">
          <h1 className="font-serif text-4xl md:text-5xl">Insights</h1>
          <p className="max-w-3xl text-[#e8edf5]/80">
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
                className="block rounded-xl border border-white/10 bg-[#0f1829] p-6 transition hover:border-[#c9a84c]/70"
              >
                <h2 className="font-serif text-2xl text-[#e8edf5]">{post.title}</h2>
                <p className="mt-1 text-sm text-[#c9a84c]">{formatDate(post.date)}</p>
                <p className="mt-3 text-[#e8edf5]/85">{post.excerpt}</p>
              </Link>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
