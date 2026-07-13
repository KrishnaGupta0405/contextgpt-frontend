import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/blog";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = false;

export default async function Image({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 26, opacity: 0.85 }}>
            {post?.authors?.length
              ? post.authors.map((author) => author.name).join(", ")
              : (post?.author?.name ?? "ContextGPT Team")}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 28,
              fontWeight: 800,
              color: "#1e3a8a",
              background: "white",
              padding: "18px 36px",
              borderRadius: 999,
              boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
            }}
          >
            Read Now →
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
