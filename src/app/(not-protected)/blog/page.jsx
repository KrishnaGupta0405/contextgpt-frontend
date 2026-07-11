import { getAllPosts, getFeaturedPosts, getSearchIndex } from "@/lib/blog";
import BlogList from "@/components/blog/BlogList";
import BlogSearch from "@/components/blog/BlogSearch";

export default function Blog() {
  const posts = getAllPosts();
  const featuredPosts = getFeaturedPosts();
  const searchIndex = getSearchIndex();

  return (
    <div className="bg-white text-slate-900">
      {/* ─── Hero ─── */}
      <section className="px-4 pt-24 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900">
            Blog
          </h1>
          <p className="mt-3 text-lg text-slate-500">
            Learn more about ContextGPT through our blog!
          </p>
        </div>
      </section>

      <BlogSearch index={searchIndex} />

      <BlogList posts={posts} featuredPosts={featuredPosts} />
    </div>
  );
}
