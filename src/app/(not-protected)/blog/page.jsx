import { getAllPosts, getFeaturedPosts, getSearchIndex } from "@/lib/blog";
import { playfairDisplay } from "@/lib/fonts";
import BlogList from "@/components/blog/BlogList";
import BlogSearch from "@/components/blog/BlogSearch";

// On-demand revalidation (via /api/revalidate) is the only mechanism that refreshes this page
export const revalidate = false;

export default async function Blog() {
  const posts = await getAllPosts();
  const featuredPosts = await getFeaturedPosts();
  const searchIndex = await getSearchIndex();

  return (
    <div className="bg-white text-slate-900">
      {/* ─── Hero ─── */}
      <section className="px-4 pt-24 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h1
              className={`${playfairDisplay.className} text-7xl leading-[1.2] font-extrabold tracking-tight text-transparent bg-clip-text pb-2`}
              style={{
                backgroundImage:
                  "linear-gradient(-45deg, #0a3280 0%, #155ded 100%)",
              }}
            >
              Blog
            </h1>
          </div>

          <BlogSearch index={searchIndex} />
        </div>
      </section>

      <BlogList posts={posts} featuredPosts={featuredPosts} />
    </div>
  );
}
