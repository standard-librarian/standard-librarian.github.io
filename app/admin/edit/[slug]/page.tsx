import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/posts";
import { PostEditor } from "@/components/PostEditor";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  return <PostEditor post={post} />;
}
