function isoDuration(readingTimeText) {
  const minutes = Math.max(1, Math.ceil(parseFloat(readingTimeText) || 1));
  return `PT${minutes}M`;
}

function wordCount(content) {
  return content.trim().split(/\s+/).filter(Boolean).length;
}

export function getPostUrl(post, siteUrl) {
  return post.canonicalUrl ?? `${siteUrl}/blog/${post.slug}`;
}

export function getPostImageUrl(post, siteUrl) {
  return post.coverImage
    ? `${siteUrl}${post.coverImage}`
    : `${siteUrl}/blog/${post.slug}/opengraph-image`;
}

export function getPostDates(post) {
  return {
    publishedAt: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
  };
}

export function buildArticleJsonLd(post, siteUrl) {
  const url = getPostUrl(post, siteUrl);
  const image = getPostImageUrl(post, siteUrl);
  const { publishedAt, dateModified } = getPostDates(post);
  const authors = post.authors ?? [post.author];
  const authorJsonLd = authors.map((author) => {
    const sameAs = Object.values(author.socials ?? {}).filter(Boolean);
    return {
      "@type": "Person",
      name: author.name,
      url: `${siteUrl}/blog/author/${author.slug}`,
      ...(sameAs.length ? { sameAs } : {}),
    };
  });

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image,
    author: authorJsonLd.length === 1 ? authorJsonLd[0] : authorJsonLd,
    publisher: {
      "@type": "Organization",
      name: "ContextGPT",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/icons/Contextgpt_icon.svg`,
      },
    },
    datePublished: publishedAt,
    dateModified,
    inLanguage: "en",
    keywords: [...post.tags, ...post.keywords].join(", ") || undefined,
    wordCount: wordCount(post.content),
    timeRequired: isoDuration(post.readingTime),
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };
}

export function buildBreadcrumbJsonLd(post, siteUrl) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${siteUrl}/blog` },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: getPostUrl(post, siteUrl),
      },
    ],
  };
}
