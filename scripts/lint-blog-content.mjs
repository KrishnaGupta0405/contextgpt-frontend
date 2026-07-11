import fs from "fs";
import path from "path";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const IMG_NO_ALT = /!\[\s*\]\(/g;
const INTERNAL_LINK = /\]\(\/blog\/([a-z0-9-]+)\)/g;

function getSlugs() {
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

function lintFile(filename, slugs) {
  const raw = fs.readFileSync(path.join(BLOG_DIR, filename), "utf8");
  const issues = [];

  if (IMG_NO_ALT.test(raw)) {
    issues.push("image(s) with missing alt text");
  }

  for (const match of raw.matchAll(INTERNAL_LINK)) {
    const targetSlug = match[1];
    if (!slugs.includes(targetSlug)) {
      issues.push(`broken internal link to /blog/${targetSlug}`);
    }
  }

  return issues;
}

function main() {
  if (!fs.existsSync(BLOG_DIR)) {
    console.log("No content/blog directory found.");
    return;
  }

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));
  const slugs = getSlugs();
  let hasIssues = false;

  for (const file of files) {
    const issues = lintFile(file, slugs);
    if (issues.length > 0) {
      hasIssues = true;
      console.log(`\n${file}`);
      issues.forEach((issue) => console.log(`  - ${issue}`));
    }
  }

  if (!hasIssues) {
    console.log(`Checked ${files.length} post(s). No issues found.`);
  }
}

main();
