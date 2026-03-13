import { getAllPosts } from "@/lib/posts";
import { site } from "@/lib/site";

export async function GET() {
  const posts = await getAllPosts();

  const lines = [
    `${site.title} - ${site.description}`,
    "",
    "Blog posts:"
  ];

  for (const post of posts) {
    lines.push(`- ${post.title} (${site.url}/posts/${post.slug})`);
    if (post.summary) {
      lines.push(`  Summary: ${post.summary}`);
    }
  }

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
}
