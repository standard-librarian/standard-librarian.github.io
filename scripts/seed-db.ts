/**
 * Seed: reads all MDX posts from content/posts/ and upserts them into Turso.
 *
 * Usage:
 *   pnpm seed
 */

import { config } from "dotenv";
config({ path: ".env.local" });
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { createClient } from "@libsql/client";
import { seedComponents } from "../lib/component-seeds";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const postsDirectory = path.join(process.cwd(), "content", "posts");
const datePrefix = /^\d{4}-\d{2}-\d{2}-/;

async function main() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS posts (
      slug         TEXT PRIMARY KEY,
      title        TEXT NOT NULL,
      date         TEXT NOT NULL,
      tags         TEXT NOT NULL DEFAULT '[]',
      summary      TEXT NOT NULL DEFAULT '',
      content      TEXT NOT NULL DEFAULT '',
      reading_time TEXT NOT NULL DEFAULT '',
      created_at   TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  if (!fs.existsSync(postsDirectory)) {
    console.log("No content/posts directory found.");
    return;
  }

  const files = fs.readdirSync(postsDirectory).filter((f) => f.endsWith(".mdx"));

  for (const file of files) {
    const fullPath = path.join(postsDirectory, file);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    const rawSlug = file.replace(/\.mdx$/, "");
    const slug = rawSlug.replace(datePrefix, "");

    const blocks = content.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
    const inferred = blocks[0]?.replace(/\s+/g, " ") ?? "";
    const summary =
      typeof data.summary === "string"
        ? data.summary
        : inferred.length > 200
        ? `${inferred.slice(0, 197)}...`
        : inferred;

    const rt = readingTime(content).text;

    await db.execute({
      sql: `INSERT INTO posts (slug, title, date, tags, summary, content, reading_time)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(slug) DO UPDATE SET
              title        = excluded.title,
              date         = excluded.date,
              tags         = excluded.tags,
              summary      = excluded.summary,
              content      = excluded.content,
              reading_time = excluded.reading_time,
              updated_at   = datetime('now')`,
      args: [
        slug,
        String(data.title ?? "Untitled"),
        String(data.date ?? ""),
        JSON.stringify(Array.isArray(data.tags) ? data.tags.map(String) : []),
        summary,
        content,
        rt,
      ],
    });

    console.log(`Seeded: ${slug}`);
  }

  await seedComponents({ force: true });

  console.log("Done!");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
