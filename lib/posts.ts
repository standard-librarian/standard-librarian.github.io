import readingTime from "reading-time";
import { db, ensureSchema } from "@/lib/db";

export type Post = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  summary: string;
  readingTime: string;
  content: string;
};

function rowToPost(row: Record<string, unknown>): Post {
  const content = String(row.content ?? "");
  return {
    slug: String(row.slug),
    title: String(row.title),
    date: String(row.date),
    tags: JSON.parse(String(row.tags ?? "[]")),
    summary: String(row.summary ?? ""),
    readingTime: String(row.reading_time ?? readingTime(content).text),
    content,
  };
}

export async function getAllPosts(): Promise<Post[]> {
  await ensureSchema();
  const result = await db.execute("SELECT * FROM posts ORDER BY date DESC");
  return result.rows.map((r) => rowToPost(r as Record<string, unknown>));
}

export async function getPostSlugs(): Promise<string[]> {
  await ensureSchema();
  const result = await db.execute("SELECT slug FROM posts");
  return result.rows.map((r) => String(r.slug));
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  await ensureSchema();
  const result = await db.execute({
    sql: "SELECT * FROM posts WHERE slug = ?",
    args: [slug],
  });
  if (result.rows.length === 0) return null;
  return rowToPost(result.rows[0] as Record<string, unknown>);
}
