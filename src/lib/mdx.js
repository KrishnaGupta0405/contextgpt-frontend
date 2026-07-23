import * as runtime from "react/jsx-runtime";
import { evaluate } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { visit } from "unist-util-visit";
import GithubSlugger from "github-slugger";

function getText(node) {
  if (node.type === "text") return node.value;
  return (node.children ?? []).map(getText).join("");
}

function getMdxJsxAttr(node, name) {
  const attr = node.attributes?.find((a) => a.name === name);
  return typeof attr?.value === "string" ? attr.value : undefined;
}

function extractHeadings(headings) {
  return () => (tree) => {
    const slugger = new GithubSlugger();

    visit(tree, (node) => {
      if (node.type === "element" && /^h[2-4]$/.test(node.tagName)) {
        const id = node.properties?.id;
        if (!id) return;
        slugger.slug(id, true);
        headings.push({ id, text: getText(node), depth: Number(node.tagName[1]) });
        return;
      }

      if (node.type === "mdxJsxFlowElement") {
        const match = /^Heading([2-4])$/.exec(node.name ?? "");
        if (!match) return;
        const text = getText(node);
        let id = getMdxJsxAttr(node, "id");
        if (!id) {
          id = slugger.slug(text);
          node.attributes = [
            ...(node.attributes ?? []),
            { type: "mdxJsxAttribute", name: "id", value: id },
          ];
        } else {
          slugger.slug(id, true);
        }
        const toc = getMdxJsxAttr(node, "toc");
        headings.push({
          id,
          text: toc ?? text,
          depth: Number(match[1]),
        });
      }
    });
  };
}

const compileCache = new Map();

async function compileMdxUncached(source) {
  const headings = [];

  const { default: MDXContent } = await evaluate(source, {
    ...runtime,
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: "wrap" }],
      extractHeadings(headings),
    ],
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
