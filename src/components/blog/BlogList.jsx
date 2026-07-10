"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Tag } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

export default function BlogList({ posts }) {
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = useMemo(() => {
    const tags = new Set();
    posts.forEach((post) => post.tags.forEach((tag) => tags.add(tag)));
    return ["All", ...Array.from(tags)];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (activeCategory === "All") return posts;
    return posts.filter((post) => post.tags.includes(activeCategory));
  }, [posts, activeCategory]);

  return (
    <>
      {/* ─── Category Filter ─── */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
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
        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post, i) => (
            <motion.article
              key={post.slug}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i % 3}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-md"
            >
              <Link href={`/blog/${post.slug}`} className="flex flex-1 flex-col">
                <div className="h-2 rounded-t-2xl bg-gradient-to-r from-blue-500 to-blue-600" />

                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
                      >
                        <Tag className="h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h2 className="text-lg font-bold leading-snug text-slate-900 group-hover:text-blue-600">
                    {post.title}
                  </h2>

                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                    {post.description}
                  </p>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>
                        {new Date(post.publishedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.readingTime}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-blue-600 opacity-0 transition-opacity group-hover:opacity-100">
                      Read <ArrowRight className="inline h-3 w-3" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </section>
    </>
  );
}
