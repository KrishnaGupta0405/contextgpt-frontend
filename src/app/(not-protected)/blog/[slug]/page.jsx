import { notFound } from "next/navigation";
import {
  getAllPosts,
  getPostBySlug,
  getAdjacentPosts,
  getRelatedPosts,
  getSeriesPosts,
} from "@/lib/blog";
import { compileMdx } from "@/lib/mdx";
import { getPostUrl, getPostImageUrl, buildArticleJsonLd, buildBreadcrumbJsonLd } from "@/lib/seo";
import { mdxComponents } from "@/components/blog/MDXComponents";
import AuthorBar, { formatDate } from "@/components/blog/AuthorBar";
import TableOfContents from "@/components/blog/TableOfContents";
import PrevNextNav from "@/components/blog/PrevNextNav";
import RelatedPosts from "@/components/blog/RelatedPosts";
import SeriesNav from "@/components/blog/SeriesNav";
import NewsletterCTA from "@/components/blog/NewsletterCTA";
import AuthorCard from "@/components/blog/AuthorCard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const url = getPostUrl(post, SITE_URL);
  const image = getPostImageUrl(post, SITE_URL);

  return {
    title: `${post.title} | ContextGPT Blog`,
    description: post.description,
    keywords: post.keywords.length ? post.keywords : undefined,
    alternates: { canonical: url },
    robots: { index: !post.noindex, follow: true },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
      authors: [`${SITE_URL}/blog/author/${post.author.slug}`],
      tags: post.tags,
      images: [{ url: image, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [image],
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
  const seriesPosts = post.series ? getSeriesPosts(post.series.name) : [];

  const url = getPostUrl(post, SITE_URL);
  const articleJsonLd = buildArticleJsonLd(post, SITE_URL);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(post, SITE_URL);

  return (
    <div className="bg-white text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="mx-auto max-w-[1600px] px-4 pt-16 pb-24 sm:px-6 lg:px-8">
        <header className="m-28 mb-16 mt-20 max-w-5xl">
          <h1 className="text-3xl font-bold tracking-tight text-secondary-900 mt-8 sm:text-4xl lg:text-5xl xl:text-6xl">
            {post.title}
          </h1>
          <p className="text-lg font-normal text-secondary-600 mt-4 lg:text-2xl text-slate-600 leading-tight tracking-tighter">{post.description}</p>
          <div className="mt-10 flex flex-wrap items-center gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
              >
                {tag}
              </span>
            ))}
            <span className="text-sm text-slate-500">
              • {" "} Published on {formatDate(post.publishedAt)}
              {post.updatedAt && ` • Updated ${formatDate(post.updatedAt)}`}
            </span>
          </div>

          {/* <div className="mt-8">
          </div> */}
        </header>

        <div className="lg:grid lg:grid-cols-[240px_minmax(0,42rem)_240px] lg:justify-center lg:gap-16">
          <div className="hidden lg:block">
            <AuthorBar post={post} />
          </div>

          <article className="min-w-0">
            <SeriesNav series={post.series} posts={seriesPosts} currentSlug={post.slug} />

            <div className="prose prose-slate max-w-none prose-headings:scroll-mt-24 prose-pre:p-0">
              <MDXContent components={mdxComponents} />
              <NewsletterCTA />
              <PrevNextNav prev={prev} next={next} />
            </div>
          </article>

          <TableOfContents headings={headings} className="ml-20" />
        </div>
          <AuthorCard post={post} url={url} />
            <RelatedPosts posts={related} />

      </div>
    </div>
  );
}
