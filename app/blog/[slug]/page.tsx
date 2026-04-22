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
    <main id="main-content" className="min-h-screen bg-[var(--bg-primary)] px-6 py-10 text-[var(--text-primary)] md:px-10">
      <article className="mx-auto max-w-3xl space-y-6">
        <Link className="inline-block text-[var(--text-gold)] hover:underline" href="/blog">
          ← Back to insights
        </Link>

        <header className="space-y-2">
          <h1 className="font-display text-4xl leading-tight md:text-5xl">{post.title}</h1>
          <p className="text-sm text-[var(--text-gold)]">{formatDate(post.date)}</p>
        </header>

        <div
          className="max-w-none space-y-4 text-[var(--text-primary)] [&_a]:text-[var(--text-gold)] [&_a]:underline [&_a:hover]:opacity-90 [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--border-accent)] [&_blockquote]:pl-4 [&_blockquote]:italic [&_code]:rounded [&_code]:bg-white/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_h1]:mt-8 [&_h1]:font-display [&_h1]:text-4xl [&_h1]:leading-tight [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-3xl [&_h2]:leading-tight [&_h3]:mt-6 [&_h3]:font-display [&_h3]:text-2xl [&_h3]:leading-snug [&_hr]:border-white/10 [&_li]:mt-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:leading-7 [&_p]:text-[var(--text-secondary)] [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-white/5 [&_pre]:p-4 [&_pre]:text-sm [&_ul]:list-disc [&_ul]:pl-6"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />
      </article>
    </main>
  );
}
