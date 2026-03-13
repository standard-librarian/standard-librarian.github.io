import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();

  return [
    {
      url: site.url,
      lastModified: new Date()
    },
    {
      url: `${site.url}/posts`,
      lastModified: new Date()
    },
    {
      url: `${site.url}/about`,
      lastModified: new Date()
    },
    {
      url: `${site.url}/now`,
      lastModified: new Date()
    },
    ...posts.map((post) => ({
      url: `${site.url}/posts/${post.slug}`,
      lastModified: new Date(post.date)
    }))
  ];
}
