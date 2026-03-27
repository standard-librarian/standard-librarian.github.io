import type { Metadata } from "next";
import type { Post } from "@/lib/posts";
import { site } from "@/lib/site";

export function buildPostMetadata(post: Post): Metadata {
  return {
    title: post.title,
    description: post.summary,
    robots: post.isUnlisted ? { index: false, follow: false } : undefined,
    openGraph: {
      title: post.title,
      description: post.summary,
      url: `${site.url}/posts/${post.slug}`,
      type: "article",
    },
  };
}
