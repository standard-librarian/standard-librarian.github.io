import type { Post } from "@/lib/posts";

const imgTag = /<img\s+[^>]*>/gi;
const nextImageTag = /<Image\s+[^>]*\/>/gi;

function extractAttr(tag: string, attr: string): string | null {
  const match = new RegExp(`${attr}=("([^"]*)"|'([^']*)')`, "i").exec(tag);
  return match ? match[2] ?? match[3] ?? "" : null;
}

function toMarkdownImage(tag: string): string {
  const alt = extractAttr(tag, "alt") ?? "";
  const src = extractAttr(tag, "src") ?? "";
  return `![${alt}](${src})`;
}

export function normalizeImages(markdown: string): string {
  return markdown
    .replace(nextImageTag, (match) => toMarkdownImage(match))
    .replace(imgTag, (match) => toMarkdownImage(match));
}

export function buildCopyText(post: Post, prompt: string): string {
  const content = normalizeImages(post.content).trim();
  return `${prompt}\n\n---\n\n${content}`.trim();
}

export function buildSummaryText(post: Post): string {
  const content = normalizeImages(post.content).trim();
  const prompt = `Summarize this post in 5 bullet points and identify the single most important insight.`;
  return `${prompt}\n\n---\n\n${content}`.trim();
}
