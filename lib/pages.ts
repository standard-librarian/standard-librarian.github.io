import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type Page = {
  slug: string;
  title: string;
  content: string;
};

const pagesDirectory = path.join(process.cwd(), "content", "pages");

export function getPageBySlug(slug: string): Page | null {
  const filePath = path.join(pagesDirectory, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    slug,
    title: String(data.title ?? slug),
    content
  };
}
