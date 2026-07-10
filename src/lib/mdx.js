import * as runtime from "react/jsx-runtime";
import { evaluate } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import { visit } from "unist-util-visit";

function extractHeadings(headings) {
  return () => (tree) => {
    visit(tree, "element", (node) => {
      if (!/^h[2-3]$/.test(node.tagName)) return;
      const id = node.properties?.id;
      if (!id) return;
      const text = (node.children ?? [])
        .filter((child) => child.type === "text")
        .map((child) => child.value)
        .join("");
      headings.push({ id, text, depth: Number(node.tagName[1]) });
    });
  };
}

export async function compileMdx(source) {
  const headings = [];

  const { default: MDXContent } = await evaluate(source, {
    ...runtime,
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: "wrap" }],
      [rehypePrettyCode, { theme: "github-dark" }],
      extractHeadings(headings),
    ],
  });

  return { MDXContent, headings };
}
