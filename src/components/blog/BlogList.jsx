"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";

const PAGE_SIZE = 9;

function PostCard({ post, featured = false }) {
  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-md ${
        featured ? "sm:col-span-2 lg:col-span-2" : ""
      }`}
    >
      <Link href={`/blog/${post.slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-[1.9/1] w-full overflow-hidden bg-slate-100">
          {post.coverImage ? (
            <Image src={post.coverImage} alt={post.title} fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-blue-500 to-blue-600 text-lg font-bold text-white">
              ContextGPT
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-6">
          <h2
            className={`font-bold leading-snug text-slate-900 group-hover:text-blue-600 ${
              featured ? "text-xl" : "text-lg"
            }`}
          >
            {post.title}
          </h2>

          <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
            {post.description}
          </p>

          <div className="mt-5 flex items-center gap-2.5">
            <div className="relative h-7 w-7 overflow-hidden rounded-full bg-slate-200">
              {post.author.avatar ? (
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-slate-500">
                  {post.author.name?.[0] ?? "C"}
                </div>
              )}
            </div>
            <span className="text-sm text-slate-700">{post.author.name}</span>
            <span className="text-slate-300">·</span>
            <span className="text-sm text-slate-500">
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

export default function BlogList({ posts, featuredPosts = [] }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [page, setPage] = useState(1);

  const usesCategories = posts.some((post) => post.category);

  const categories = useMemo(() => {
    if (usesCategories) {
      const cats = new Set();
      posts.forEach((post) => post.category && cats.add(post.category));
      return ["All", ...Array.from(cats)];
    }
    const tags = new Set();
    posts.forEach((post) => post.tags.forEach((tag) => tags.add(tag)));
    return ["All", ...Array.from(tags)];
  }, [posts, usesCategories]);

  const filteredPosts = useMemo(() => {
    if (activeCategory === "All") return posts;
    return usesCategories
      ? posts.filter((post) => post.category === activeCategory)
      : posts.filter((post) => post.tags.includes(activeCategory));
  }, [posts, activeCategory, usesCategories]);

  function selectCategory(cat) {
    setActiveCategory(cat);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE));
  const paginatedPosts = filteredPosts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      {featuredPosts.length > 0 && activeCategory === "All" && page === 1 && (
        <section className="px-4 pb-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Featured
            </h2>
            <div className="grid gap-8 sm:grid-cols-2">
              {featuredPosts.map((post) => (
                <PostCard key={post.slug} post={post} featured />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Category Filter ─── */}
      <section className="px-4 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => selectCategory(cat)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "border-blue-300 bg-blue-50 text-blue-700"
                  : "border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* ─── Posts Grid ─── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedPosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-slate-500">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
