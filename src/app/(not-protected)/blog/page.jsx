import { getAllPosts } from "@/lib/blog";
import BlogList from "@/components/blog/BlogList";

export default function Blog() {
  const posts = getAllPosts();

  return (
    <div className="bg-white text-slate-900">
      

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-50/60 to-white" />
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Blog
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Insights on AI customer support, chatbot best practices, and product
            updates from the ContextGPT team.
          </p>
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 text-center text-sm font-medium text-amber-800">
        🚧 Our blog is currently under development. More content coming soon!
      </div>
        </div>
      </section>

      <BlogList posts={posts} />
    </div>
  );
}
