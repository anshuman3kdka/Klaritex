import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPostMeta, getPostBySlug } from "@/lib/posts";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
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
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#080d1a] px-6 py-10 text-[#e8edf5] md:px-10">
      <article className="mx-auto max-w-3xl space-y-6">
        <Link className="inline-block text-[#c9a84c] hover:underline" href="/blog">
          ← Back to insights
        </Link>

        <header className="space-y-2">
          <h1 className="font-serif text-4xl leading-tight md:text-5xl">{post.title}</h1>
          <p className="text-sm text-[#c9a84c]">{formatDate(post.date)}</p>
        </header>

        <div
          className="prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />
      </article>
    </main>
  );
}
