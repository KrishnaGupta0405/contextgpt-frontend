"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { TextAlignStart } from "lucide-react";

const INDENT_STEP = 8; // px shift per heading depth level [right and leftness of section and subscetion ]
const BASE_INDENT = 4; // [distance between line and section] x-position (px) of the line for the shallowest heading — controls line's starting offset

function lineX(depth, minDepth) {
  return BASE_INDENT + (depth - minDepth) * INDENT_STEP;
}

export default function TableOfContents({ headings, className = "" }) {
  const [activeId, setActiveId] = useState(headings[0]?.id);
  const [layout, setLayout] = useState({
    path: "",
    width: 0,
    height: 0,
    totalLen: 0,
    startLen: 0,
    endLen: 0,
    activeTop: 0,
    activeX: 0,
  });
  const listRef = useRef(null);
  const itemRefs = useRef(new Map());

  const minDepth = headings.length ? Math.min(...headings.map((h) => h.depth)) : 2;

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-96px 0px -70% 0px" }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  useLayoutEffect(() => {
    const updateLayout = () => {
      const listEl = listRef.current;
      if (!listEl || headings.length === 0) return;

      const listRect = listEl.getBoundingClientRect();
      const points = headings.map((heading) => {
        const el = itemRefs.current.get(heading.id);
        const rect = el.getBoundingClientRect();
        return {
          id: heading.id,
          x: lineX(heading.depth, minDepth),
          top: rect.top - listRect.top,
          mid: rect.top - listRect.top + rect.height / 2,
          bottom: rect.top - listRect.top + rect.height,
        };
      });

      const r = 6;
      let d = `M ${points[0].x} 0`;
      let prevX = points[0].x;
      let cursorX = points[0].x;
      let cursorY = 0;
      let len = 0;
      const cumLen = [];
      const addSeg = (x2, y2) => {
        len += Math.hypot(x2 - cursorX, y2 - cursorY);
        cursorX = x2;
        cursorY = y2;
      };

      points.forEach((p, i) => {
        if (i === 0) {
          d += ` L ${p.x} ${p.mid}`;
          addSeg(p.x, p.mid);
        } else if (p.x !== prevX) {
          d += ` L ${prevX} ${p.top - r}`;
          addSeg(prevX, p.top - r);
          d += ` L ${p.x} ${p.top + r}`;
          addSeg(p.x, p.top + r);
          d += ` L ${p.x} ${p.mid}`;
          addSeg(p.x, p.mid);
        } else {
          d += ` L ${p.x} ${p.mid}`;
          addSeg(p.x, p.mid);
        }
        cumLen[i] = len;
        prevX = p.x;
      });
      d += ` L ${prevX} ${listRect.height}`;
      addSeg(prevX, listRect.height);

      const activeIndex = points.findIndex((p) => p.id === activeId);
      const active = activeIndex >= 0 ? points[activeIndex] : points[0];

      // Find the nearest preceding top-level (minDepth) heading — the
      // section the active heading belongs to — and start the colored
      // segment there instead of from the very top of the list.
      let sectionStartIndex = activeIndex >= 0 ? activeIndex : 0;
      for (let i = activeIndex; i >= 0; i--) {
        if (headings[i].depth === minDepth) {
          sectionStartIndex = i;
          break;
        }
      }
      const startLen =
        sectionStartIndex === activeIndex
          ? cumLen[activeIndex]
          : cumLen[sectionStartIndex];
      const endLen = activeIndex >= 0 ? cumLen[activeIndex] : 0;

      setLayout({
        path: d,
        width: Math.max(...points.map((p) => p.x)) + 8,
        height: listRect.height,
        totalLen: len,
        startLen,
        endLen,
        activeTop: active.mid,
        activeX: active.x,
      });
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, [activeId, headings, minDepth]);

  if (headings.length === 0) return null;

  // Ancestors of the active heading: walk backwards and collect every
  // preceding heading down to (and including) the nearest shallower
  // section heading, so sibling sub-headings under the same parent are
  // highlighted along with the true ancestor chain.
  const activeIndex = headings.findIndex((h) => h.id === activeId);
  const ancestorIds = new Set();
  if (activeIndex >= 0) {
    const activeDepth = headings[activeIndex].depth;
    if (activeDepth > minDepth) {
      for (let i = activeIndex - 1; i >= 0; i--) {
        ancestorIds.add(headings[i].id);
        if (headings[i].depth < activeDepth) break;
      }
    }
  }

  return (
    <nav className={`sticky top-24 hidden max-h-[calc(100vh-8rem)] overflow-y-auto lg:block ${className}`}>
      <p className="mb-3 flex items-center gap-1.5 text-xs uppercase tracking-wide">
        <TextAlignStart className="size-4" />
        On this page
      </p>
      <ul ref={listRef} className="relative space-y-2 text-sm">
        <svg
          className="pointer-events-none absolute left-0 top-0 overflow-visible"
          width={layout.width}
          height={layout.height}
        >
          <path
            d={layout.path}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-slate-200"
          />
          <path
            d={layout.path}
            fill="none"
            stroke="#155ded"
            strokeWidth="1.5"
            strokeLinecap="round"
            pathLength={layout.totalLen || 1}
            strokeDasharray={`${Math.max(layout.endLen - layout.startLen, 0)} ${layout.totalLen}`}
            strokeDashoffset={-layout.startLen}
            className="transition-all duration-300 ease-out"
          />
          <circle
            cx={layout.activeX}
            cy={layout.activeTop}
            r="3"
            fill="#155ded"
            className="transition-all duration-300 ease-out"
          />
        </svg>
        {headings.map((heading) => (
          <li
            key={heading.id}
            ref={(el) => {
              if (el) itemRefs.current.set(heading.id, el);
              else itemRefs.current.delete(heading.id);
            }}
            style={{ paddingLeft: lineX(heading.depth, minDepth) + 18 }}
          >
            <a
              href={`#${heading.id}`}
              className={`block py-1 transition-colors ${
                activeId === heading.id
                  ? "font-medium text-[#155ded] underline underline-offset-4"
                  : ancestorIds.has(heading.id)
                    ? "font-medium text-[#155ded]"
                    : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
