import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, Info, Lightbulb } from "lucide-react";
import CodeBlock from "./CodeBlock";
import { Tabs, Tab } from "./Tabs";
import { Accordion, AccordionItem } from "./Accordion";
import { CodeGroup, CodeGroupItem } from "./CodeGroup";
import { FileTree, FileTreeItem } from "./FileTree";
import { YouTube } from "./YouTube";

const CALLOUT_STYLES = {
  NOTE: {
    icon: Info,
    className: "border-blue-300 bg-blue-50 text-blue-900",
  },
  TIP: {
    icon: Lightbulb,
    className: "border-emerald-300 bg-emerald-50 text-emerald-900",
  },
  WARNING: {
    icon: AlertTriangle,
    className: "border-amber-300 bg-amber-50 text-amber-900",
  },
};

function Blockquote({ children }) {
  const text = extractText(children);
  const match = text.match(/^\[!(NOTE|TIP|WARNING)\]\s*/);

  if (!match) {
    return (
      <blockquote className="border-l-4 border-slate-300 pl-4 italic text-slate-600">
        {children}
      </blockquote>
    );
  }

  const kind = match[1];
  const { icon: Icon, className } = CALLOUT_STYLES[kind];

  return (
    <div className={`my-6 flex gap-3 rounded-xl border-l-4 p-4 ${className}`}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="[&>p]:m-0">{stripPrefix(children, match[0])}</div>
    </div>
  );
}

function extractText(node) {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node?.props?.children) return extractText(node.props.children);
  return "";
}

function stripPrefix(children, prefix) {
  if (typeof children === "string") return children.replace(prefix, "");
  if (Array.isArray(children)) {
    const [first, ...rest] = children;
    return [stripPrefix(first, prefix), ...rest];
  }
  if (children?.props?.children) {
    return {
      ...children,
      props: {
        ...children.props,
        children: stripPrefix(children.props.children, prefix),
      },
    };
  }
  return children;
}

export const mdxComponents = {
  blockquote: Blockquote,
  pre: CodeBlock,
  a: ({ href, children, ...props }) => {
    const isInternal = href?.startsWith("/") || href?.startsWith("#");
    if (isInternal) {
      return (
        <Link href={href} {...props}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  },
  img: ({ src, alt }) => {
    if (process.env.NODE_ENV !== "production" && !alt) {
      console.warn(`[blog] Image is missing alt text: ${src}`);
    }
    return (
      <span className="my-6 block overflow-hidden rounded-xl border border-slate-200">
        <Image
          src={src}
          alt={alt ?? ""}
          width={1200}
          height={630}
          className="h-auto w-full"
        />
      </span>
    );
  },
  Tabs,
  Tab,
  Accordion,
  AccordionItem,
  CodeGroup,
  CodeGroupItem,
  FileTree,
  FileTreeItem,
  YouTube,
};
