import { notFound } from "next/navigation";
import {
  getAllPosts,
  getPostBySlug,
  getAdjacentPosts,
  getRelatedPosts,
} from "@/lib/blog";
import { compileMdx } from "@/lib/mdx";
import { mdxComponents } from "@/components/blog/MDXComponents";
import AuthorBar from "@/components/blog/AuthorBar";
import TableOfContents from "@/components/blog/TableOfContents";
import PrevNextNav from "@/components/blog/PrevNextNav";
import RelatedPosts from "@/components/blog/RelatedPosts";

const SITE_URL = "https://contextgpt.in";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const url = `${SITE_URL}/blog/${slug}`;

  return {
    title: `${post.title} | ContextGPT Blog`,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
      authors: [post.author.name],
      tags: post.tags,
      images: post.coverImage
        ? [{ url: post.coverImage, width: 1200, height: 630, alt: post.title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const { MDXContent, headings } = await compileMdx(post.content);
  const { prev, next } = getAdjacentPosts(slug);
  const related = getRelatedPosts(post);

  const url = `${SITE_URL}/blog/${slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: post.coverImage ? `${SITE_URL}${post.coverImage}` : undefined,
    author: { "@type": "Organization", name: post.author.name },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  return (
    <div className="bg-white text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-6xl px-4 pt-16 pb-24 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-[1fr_240px] lg:gap-12">
          <article className="min-w-0">
            <header className="mb-8">
              <div className="mb-3 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                {post.title}
              </h1>
              <p className="mt-3 text-lg text-slate-600">{post.description}</p>
              <div className="mt-6">
                <AuthorBar post={post} />
              </div>
            </header>

            <div className="prose prose-slate max-w-none prose-headings:scroll-mt-24 prose-pre:p-0">
              <MDXContent components={mdxComponents} />
            </div>

            <PrevNextNav prev={prev} next={next} />
            <RelatedPosts posts={related} />
          </article>

          <TableOfContents headings={headings} />
        </div>
      </div>
    </div>
  );
}
