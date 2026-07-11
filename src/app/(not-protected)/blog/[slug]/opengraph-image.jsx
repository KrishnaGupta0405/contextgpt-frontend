import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/blog";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 32, fontWeight: 700 }}>ContextGPT</div>
        <div
          style={{
            display: "flex",
            fontSize: 56,
            fontWeight: 800,
            lineHeight: 1.15,
            maxWidth: 950,
          }}
        >
          {post?.title ?? "ContextGPT Blog"}
        </div>
        <div style={{ display: "flex", fontSize: 26, opacity: 0.85 }}>
          {post?.author?.name ?? "ContextGPT Team"}
        </div>
      </div>
    ),
    { ...size }
  );
}
