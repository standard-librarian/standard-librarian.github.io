import { getAllPosts } from "@/lib/posts";
import { site } from "@/lib/site";
import { normalizeImages } from "@/lib/copy";

export async function GET() {
  const posts = await getAllPosts();

  const lines = [`${site.title} - ${site.description}`, ""];

  for (const post of posts) {
    lines.push(`# ${post.title}`);
    lines.push(`${site.url}/posts/${post.slug}`);
    lines.push("");
    lines.push(normalizeImages(post.content).trim());
    lines.push("");
  }

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
}
