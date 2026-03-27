import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getPostBySlug } from "@/lib/posts";
import { renderMdx } from "@/lib/mdx";
import { site } from "@/lib/site";
import { buildPostMetadata } from "@/lib/post-metadata";
import { getReactionsForPost } from "@/lib/db";
import { PostPrompt } from "@/components/PostPrompt";
import { ShareButtons } from "@/components/ShareButtons";
import { PostReactions } from "@/components/PostReactions";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return {};
  }

  return buildPostMetadata(post);
}

export default async function PostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const content = await renderMdx(post.content);
  const postUrl = `${site.url}/posts/${post.slug}`;
  const reactions = await getReactionsForPost(post.slug).catch(() => []);

  return (
    <section className="post-shell">
      <div className="container">
        <header className="post-header reveal">
          <p className="post-meta">
            {new Date(post.date).toLocaleDateString("en-US", {
              month: "long",
              day: "2-digit",
              year: "numeric",
            })}
            {` • ${post.readingTime}`}
          </p>
          <h1 className="post-title">{post.title}</h1>
          <div className="tag-row">
            {post.tags.map((tag) => (
              <Link key={tag} href={`/posts?tag=${tag}`} className="tag">
                #{tag}
              </Link>
            ))}
          </div>
        </header>
        <ShareButtons title={post.title} url={postUrl} />
        <PostReactions slug={post.slug} initialReactions={reactions}>
          <PostPrompt post={post} />
          <article className="reveal delay-1">{content}</article>
        </PostReactions>
      </div>
    </section>
  );
}
