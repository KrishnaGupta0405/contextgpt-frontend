import * as runtime from "react/jsx-runtime";
import { evaluate } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
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

const compileCache = new Map();

const hasCodeBlock = (source) => /^```/m.test(source);
const hasMath = (source) => /\$\$|\\\(|\\\[/.test(source);

async function compileMdxUncached(source) {
  const headings = [];
  const needsPrettyCode = hasCodeBlock(source);
  const needsMath = hasMath(source);

  const [remarkMath, rehypePrettyCode, rehypeKatex] = await Promise.all([
    needsMath ? import("remark-math").then((m) => m.default) : null,
    needsPrettyCode ? import("rehype-pretty-code").then((m) => m.default) : null,
    needsMath ? import("rehype-katex").then((m) => m.default) : null,
  ]);

  const { default: MDXContent } = await evaluate(source, {
    ...runtime,
    remarkPlugins: [remarkGfm, remarkMath].filter(Boolean),
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: "wrap" }],
      rehypePrettyCode && [rehypePrettyCode, { theme: "github-dark" }],
      rehypeKatex,
      extractHeadings(headings),
    ].filter(Boolean),
  });

  return { MDXContent, headings };
}

export function compileMdx(source) {
  let cached = compileCache.get(source);
  if (!cached) {
    cached = compileMdxUncached(source);
    compileCache.set(source, cached);
  }
  return cached;
}
