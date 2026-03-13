import { getAllPosts } from "@/lib/posts";

export type SearchItem = {
  id: string;
  title: string;
  summary?: string;
  type: "post" | "page";
  url: string;
  date?: string;
  tags?: string[];
};

export async function getSearchItems(): Promise<SearchItem[]> {
  const posts = (await getAllPosts()).map((post) => ({
    id: `post:${post.slug}`,
    title: post.title,
    summary: post.summary,
    type: "post" as const,
    url: `/posts/${post.slug}`,
    date: post.date,
    tags: post.tags,
  }));

  const pages: SearchItem[] = [
    {
      id: "page:posts",
      title: "All posts",
      summary: "Browse every blog post.",
      type: "page",
      url: "/posts",
    },
    {
      id: "page:about",
      title: "About",
      summary: "Background and focus areas.",
      type: "page",
      url: "/about",
    },
    {
      id: "page:now",
      title: "Now",
      summary: "Current focus and priorities.",
      type: "page",
      url: "/now",
    },
  ];

  return [...posts, ...pages];
}
