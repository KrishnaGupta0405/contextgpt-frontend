import { notFound } from "next/navigation";
import Image from "next/image";
import { Twitter, Linkedin, Facebook, Instagram, Globe } from "lucide-react";
import { getAllAuthors, getPostsByAuthor } from "@/lib/blog";
import BlogList from "@/components/blog/BlogList";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateMetadata({ params }) {
  const { name } = await params;
  const authors = await getAllAuthors();
  const author = authors.find((a) => a.slug === name);
  if (!author) return {};

  return {
    title: `${author.name} | ContextGPT Blog`,
    description: author.bio || `Posts written by ${author.name} on the ContextGPT blog.`,
  };
}

export default async function AuthorPage({ params }) {
  const { name } = await params;
  const authors = await getAllAuthors();
  const author = authors.find((a) => a.slug === name);
  if (!author) notFound();

  const posts = await getPostsByAuthor(name);
  const hasSocials =
    author.socials?.twitter ||
    author.socials?.linkedin ||
    author.socials?.facebook ||
    author.socials?.instagram ||
    author.socials?.website;

  return (
    <div className="bg-white text-slate-900">
      <section className="px-4 pt-24 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-full bg-slate-200">
            {author.avatar ? (
              <Image src={author.avatar} alt={author.name} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-slate-500">
                {author.name?.[0] ?? "C"}
              </div>
            )}
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
            {author.name}
          </h1>
          {author.title && <p className="mt-1 text-slate-500">{author.title}</p>}

          {author.bio && (
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
              {author.bio}
            </p>
          )}

          {hasSocials && (
            <div className="mt-4 flex items-center justify-center gap-3">
              {author.socials.twitter && (
                <a
                  href={author.socials.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5 text-slate-500 hover:text-blue-600" />
                </a>
              )}
              {author.socials.linkedin && (
                <a
                  href={author.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5 text-slate-500 hover:text-blue-600" />
                </a>
              )}
              {author.socials.facebook && (
                <a
                  href={author.socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5 text-slate-500 hover:text-blue-600" />
                </a>
              )}
              {author.socials.instagram && (
                <a
                  href={author.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5 text-slate-500 hover:text-blue-600" />
                </a>
              )}
              {author.socials.website && (
                <a
                  href={author.socials.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Website"
                >
                  <Globe className="h-5 w-5 text-slate-500 hover:text-blue-600" />
                </a>
              )}
            </div>
          )}

          <p className="mt-6 text-sm text-slate-500">
            {posts.length} post{posts.length === 1 ? "" : "s"}
          </p>
        </div>
      </section>

      {posts.length > 0 ? (
        <BlogList posts={posts} />
      ) : (
        <section className="px-4 pb-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl text-sm text-slate-500">
            No posts yet.
          </div>
        </section>
      )}
    </div>
  );
}
