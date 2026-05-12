import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPostMeta, getPostBySlug } from "@/lib/posts";

type BlogPostPageProps = {
  params: { slug: string };
};

function formatDate(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export async function generateStaticParams() {
  const posts = getAllPostMeta();
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main id="main-content" className="min-h-screen bg-[var(--lab-surface)] px-6 py-10 text-[var(--lab-ink)] md:px-10">
      <article className="mx-auto max-w-3xl space-y-6">
        <Link className="inline-block text-[var(--lab-muted)] hover:text-[var(--lab-ink)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lab-gold)]/50 rounded-sm" href="/blog">
          ← Back to insights
        </Link>

        <header className="space-y-4">
          <h1 className="font-serif text-4xl leading-tight md:text-5xl font-semibold text-[var(--lab-ink)]">{post.title}</h1>
          <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--lab-muted)]">{formatDate(post.date)}</p>
        </header>

        <div
          className="max-w-none space-y-4 font-sans text-sm leading-[1.7] text-[var(--lab-ink)] [&_a]:text-[var(--lab-ink)] [&_a]:underline [&_a:hover]:text-[var(--lab-gold)] [&_blockquote]:border-l-[3px] [&_blockquote]:border-[var(--lab-gold)] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:opacity-90 [&_code]:rounded [&_code]:bg-[var(--lab-shadow-dark)]/20 [&_code]:px-1.5 [&_code]:py-0.5 [&_h1]:mt-10 [&_h1]:font-serif [&_h1]:text-4xl [&_h1]:leading-tight [&_h1]:font-semibold [&_h2]:mt-10 [&_h2]:font-serif [&_h2]:text-3xl [&_h2]:leading-tight [&_h2]:font-semibold [&_h3]:mt-8 [&_h3]:font-serif [&_h3]:text-2xl [&_h3]:leading-snug [&_h3]:font-semibold [&_hr]:border-[var(--lab-shadow-dark)]/30 [&_li]:mt-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:leading-[1.7] [&_p]:text-[var(--lab-ink)] [&_pre]:overflow-x-auto [&_pre]:rounded-[8px] [&_pre]:bg-[var(--lab-surface)] [&_pre]:shadow-[var(--shadow-pressed)] [&_pre]:p-4 [&_pre]:text-xs [&_pre]:font-mono [&_ul]:list-disc [&_ul]:pl-6"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />
      </article>
    </main>
  );
}
