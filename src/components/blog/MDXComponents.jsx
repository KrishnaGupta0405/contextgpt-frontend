import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, Info, Lightbulb, Link as LinkIcon } from "lucide-react";
import CodeBlock from "./CodeBlock";
import { Tabs, Tab } from "./Tabs";
import { Accordion, AccordionItem } from "./Accordion";
import { CodeGroup, CodeGroupItem } from "./CodeGroup";
import { FileTree, FileTreeItem } from "./FileTree";
import { YouTube } from "./YouTube";
import { Giphy } from "./Giphy";
import RelatedPost from "./RelatedPost";

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

function Blockquote({ children, className, ...props }) {
  const text = extractText(children);
  const match = text.match(/^\[!(NOTE|TIP|WARNING)\]\s*/);

  if (!match) {
    return (
      <blockquote
        className={[
          "border-l-4 border-slate-300 pl-4 italic text-slate-600",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {children}
      </blockquote>
    );
  }

  const kind = match[1];
  const { icon: Icon, className: calloutClassName } = CALLOUT_STYLES[kind];

  return (
    <div
      className={[
        `my-6 flex gap-3 rounded-xl border-l-4 p-4 ${calloutClassName}`,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="[&>p]:m-0">{stripPrefix(children, match[0])}</div>
    </div>
  );
}

function Callout({ kind = "NOTE", children, className, ...props }) {
  const { icon: Icon, className: calloutClassName } = CALLOUT_STYLES[kind];

  return (
    <div
      className={[
        `my-6 flex gap-3 rounded-xl border-l-4 p-4 ${calloutClassName}`,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="[&>p]:m-0">{children}</div>
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

const HEADING_STYLES = {
  h1: "text-5xl font-bold tracking-tight",
  h2: "text-4xl font-bold tracking-tight",
  h3: "text-3xl font-semibold",
  h4: "text-2xl font-semibold",
};

function headingAnchor(Tag) {
  return function Heading({ children, className, ...props }) {
    const kids = Array.isArray(children) ? children : [children];
    const [anchor, ...rest] = kids;
    const isAnchor = anchor?.type === "a" || anchor?.props?.href;
    const headingClassName = [HEADING_STYLES[Tag], className]
      .filter(Boolean)
      .join(" ");

    if (!isAnchor) {
      return (
        <Tag className={headingClassName} {...props}>
          {children}
        </Tag>
      );
    }

    const { href, children: anchorChildren, ...anchorProps } = anchor.props;

    return (
      <Tag className={headingClassName} {...props}>
        <a
          href={href}
          {...anchorProps}
          className="group relative no-underline hover:no-underline"
        >
          <LinkIcon
            aria-hidden="true"
            className="absolute right-full top-1/2 mr-2 h-[0.7em] w-[0.7em] -translate-y-1/2 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100"
          />
          {anchorChildren}
        </a>
        {rest}
      </Tag>
    );
  };
}

function Paragraph({ children, className, ...props }) {
  return (
    <div
      className={[
        "my-4 text-lg leading-relaxed text-slate-800 [&>p]:m-0",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

function UnorderedList({ children, className, ...props }) {
  return (
    <ul
      className={[
        "my-4 list-disc space-y-2 pl-6 text-lg leading-relaxed text-slate-800 marker:text-blue-500",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </ul>
  );
}

function OrderedList({ children, className, ...props }) {
  return (
    <ol
      className={[
        "my-4 list-decimal space-y-2 pl-6 text-lg leading-relaxed text-slate-800 marker:text-blue-500",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </ol>
  );
}

function ListItem({ children, className, ...props }) {
  return (
    <li className={["pl-1 [&>p]:m-0", className].filter(Boolean).join(" ")} {...props}>
      {children}
    </li>
  );
}

// TODO: pending blog enhancements
// 1. Add a TLDR section component (short summary block rendered at the top of a post).
// 2. Add an FAQ section component (question/answer list, ideally with FAQ schema markup).
// 3. Extend BlogImage: clicking the image should expand it to a larger/lightbox view,
//    and clicking again should collapse it back to its inline size.
function BlogImage({ src, alt, className, caption, ...props }) {
  if (process.env.NODE_ENV !== "production" && !alt) {
    console.warn(`[blog] Image is missing alt text: ${src}`);
  }
  return (
    <figure className="not-prose">
      <span
        className={[
          "block overflow-hidden rounded-xl border border-slate-200",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <Image
          src={src}
          alt={alt ?? caption ?? ""}
          width={1200}
          height={630}
          className="relative h-auto w-full"
          {...props}
        />
      </span>
      {caption && (
        <figcaption className="mt-1 text-left text-sm text-slate-500">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

function headingComponent(Tag) {
  const headingClassName = HEADING_STYLES[Tag];
  return function NamedHeading({ children, className, toc, id, ...props }) {
    const mergedClassName = [headingClassName, className].filter(Boolean).join(" ");

    if (!id) {
      return (
        <Tag className={mergedClassName} {...props}>
          {children}
        </Tag>
      );
    }

    return (
      <Tag id={id} className={mergedClassName} {...props}>
        <a
          href={`#${id}`}
          className="group relative no-underline hover:no-underline"
        >
          <LinkIcon
            aria-hidden="true"
            className="absolute right-full top-1/2 mr-2 h-[0.7em] w-[0.7em] -translate-y-1/2 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100"
          />
          {children}
        </a>
      </Tag>
    );
  };
}

export const mdxComponents = {
  p: Paragraph,
  blockquote: Blockquote,
  pre: CodeBlock,
  h1: headingAnchor("h1"),
  h2: headingAnchor("h2"),
  h3: headingAnchor("h3"),
  h4: headingAnchor("h4"),
  // Explicit component aliases — same rendering as the HTML tags above,
  // used when a post needs to pass extra props (e.g. className, id) that
  // plain markdown syntax (##, etc.) can't carry.
  Heading1: headingComponent("h1"),
  Heading2: headingComponent("h2"),
  Heading3: headingComponent("h3"),
  Heading4: headingComponent("h4"),
  Paragraph,
  a: ({ href, children, className, ...props }) => {
    const linkClassName = [
      "text-blue-600 hover:text-blue-800",
      className,
    ]
      .filter(Boolean)
      .join(" ");
    const isInternal = href?.startsWith("/") || href?.startsWith("#");
    if (isInternal) {
      return (
        <Link href={href} className={linkClassName} {...props}>
          {children}
        </Link>
      );
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClassName}
        {...props}
      >
        {children}
      </a>
    );
  },
  img: BlogImage,
  ul: UnorderedList,
  ol: OrderedList,
  li: ListItem,
  Callout,
  Blockquote,
  BlogImage,
  Tabs,
  Tab,
  Accordion,
  AccordionItem,
  CodeGroup,
  CodeGroupItem,
  FileTree,
  FileTreeItem,
  YouTube,
  Giphy,
  RelatedPost,
};
