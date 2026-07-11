import * as runtime from "react/jsx-runtime";
import { evaluate } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeKatex from "rehype-katex";
import { visit } from "unist-util-visit";

function getText(node) {
  if (node.type === "text") return node.value;
  return (node.children ?? []).map(getText).join("");
}

function extractHeadings(headings) {
  return () => (tree) => {
    visit(tree, "element", (node) => {
      if (!/^h[2-3]$/.test(node.tagName)) return;
      const id = node.properties?.id;
      if (!id) return;
      const text = getText(node);
      headings.push({ id, text, depth: Number(node.tagName[1]) });
    });
  };
}

export async function compileMdx(source) {
  const headings = [];

  const { default: MDXContent } = await evaluate(source, {
    ...runtime,
    remarkPlugins: [remarkGfm, remarkMath],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: "wrap" }],
      [rehypePrettyCode, { theme: "github-dark" }],
      rehypeKatex,
      extractHeadings(headings),
    ],
  });

  return { MDXContent, headings };
}
