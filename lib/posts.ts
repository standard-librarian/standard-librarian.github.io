import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

export type Post = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  summary: string;
  readingTime: string;
  content: string;
};

// ---------------------------------------------------------------------------
// File-based fallback (used when TURSO_DATABASE_URL is not set)
// ---------------------------------------------------------------------------

const postsDirectory = path.join(process.cwd(), "content", "posts");
const datePrefix = /^\d{4}-\d{2}-\d{2}-/;

function getPostsFromFiles(): Post[] {
  if (!fs.existsSync(postsDirectory)) return [];

  const files = fs.readdirSync(postsDirectory).filter((f) => f.endsWith(".mdx"));

  return files
    .map((fileName) => {
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);

      const rawSlug = fileName.replace(/\.mdx$/, "");
      const slug = rawSlug.replace(datePrefix, "");

      const blocks = content
        .split(/\n\s*\n/)
        .map((b) => b.trim())
        .filter(Boolean);
      const inferred = blocks[0]?.replace(/\s+/g, " ") ?? "";
      const summary =
        typeof data.summary === "string"
          ? data.summary
          : inferred.length > 200
          ? `${inferred.slice(0, 197)}...`
          : inferred;

      return {
        slug,
        title: String(data.title ?? "Untitled"),
        date: String(data.date ?? ""),
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        summary,
        readingTime: readingTime(content).text,
        content,
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// ---------------------------------------------------------------------------
// DB-backed implementation (Turso)
// ---------------------------------------------------------------------------

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

async function getPostsFromDB(): Promise<Post[]> {
  const { db, ensureSchema } = await import("@/lib/db");
  await ensureSchema();
  const result = await db.execute("SELECT * FROM posts ORDER BY date DESC");
  return result.rows.map((r) => rowToPost(r as Record<string, unknown>));
}

async function getPostBySlugFromDB(slug: string): Promise<Post | null> {
  const { db, ensureSchema } = await import("@/lib/db");
  await ensureSchema();
  const result = await db.execute({
    sql: "SELECT * FROM posts WHERE slug = ?",
    args: [slug],
  });
  if (result.rows.length === 0) return null;
  return rowToPost(result.rows[0] as Record<string, unknown>);
}

// ---------------------------------------------------------------------------
// Public API — routes through DB when TURSO_DATABASE_URL is set
// ---------------------------------------------------------------------------

export async function getAllPosts(): Promise<Post[]> {
  if (process.env.TURSO_DATABASE_URL) {
    try {
      return await getPostsFromDB();
    } catch (err) {
      console.warn("[posts] DB error, falling back to files:", err);
    }
  }
  return getPostsFromFiles();
}

export async function getPostSlugs(): Promise<string[]> {
  const posts = await getAllPosts();
  return posts.map((p) => p.slug);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  if (process.env.TURSO_DATABASE_URL) {
    try {
      return await getPostBySlugFromDB(slug);
    } catch (err) {
      console.warn("[posts] DB error, falling back to files:", err);
    }
  }
  const posts = getPostsFromFiles();
  return posts.find((p) => p.slug === slug) ?? null;
}
