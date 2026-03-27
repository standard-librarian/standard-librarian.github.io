import { afterEach, describe, expect, it } from "vitest";
import { ensureSchema, ensureTableHasColumn, getDb } from "@/lib/db";
import { getAllPosts, getPostBySlug } from "@/lib/posts";

const cleanupSlugs = new Set<string>();

function uniqueSlug(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function makeFixture(overrides: Partial<{
  slug: string;
  title: string;
  date: string;
  tags: string[];
  summary: string;
  content: string;
  reading_time: string;
  is_unlisted: number;
}> = {}) {
  const slug = overrides.slug ?? uniqueSlug("test-post");
  cleanupSlugs.add(slug);

  return {
    slug,
    title: overrides.title ?? "Test Post",
    date: overrides.date ?? "2026-01-01",
    tags: overrides.tags ?? ["test", "vitest"],
    summary: overrides.summary ?? "A post created by the test suite.",
    content: overrides.content ?? "## Hello\n\nThis is test content.",
    reading_time: overrides.reading_time ?? "1 min read",
    is_unlisted: overrides.is_unlisted ?? 0,
  };
}

async function insertFixture(fixture: ReturnType<typeof makeFixture>) {
  await ensureSchema();
  await getDb().execute({
    sql: `INSERT INTO posts (slug, title, date, tags, summary, content, reading_time, is_unlisted)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      fixture.slug,
      fixture.title,
      fixture.date,
      JSON.stringify(fixture.tags),
      fixture.summary,
      fixture.content,
      fixture.reading_time,
      fixture.is_unlisted,
    ],
  });
}

afterEach(async () => {
  if (cleanupSlugs.size === 0) {
    return;
  }

  await ensureSchema();
  const db = getDb();
  for (const slug of cleanupSlugs) {
    await db.execute({ sql: "DELETE FROM posts WHERE slug = ?", args: [slug] });
  }
  cleanupSlugs.clear();
});

describe("ensureSchema", () => {
  it("creates the posts table (idempotent)", async () => {
    await ensureSchema();
    await ensureSchema();
    const db = getDb();
    const result = await db.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='posts'"
    );
    expect(result.rows.length).toBe(1);
  });

  it("adds the is_unlisted column to an existing table without it", async () => {
    const db = getDb();
    const tableName = uniqueSlug("posts_migration").replace(/-/g, "_");
    await db.execute(`DROP TABLE IF EXISTS ${tableName}`);
    await db.execute(`
      CREATE TABLE ${tableName} (
        slug TEXT PRIMARY KEY,
        title TEXT NOT NULL
      )
    `);

    await ensureTableHasColumn(tableName, "is_unlisted", "INTEGER NOT NULL DEFAULT 0");
    await ensureTableHasColumn(tableName, "is_unlisted", "INTEGER NOT NULL DEFAULT 0");

    const result = await db.execute(`PRAGMA table_info(${tableName})`);
    expect(result.rows.some((row) => String(row.name) === "is_unlisted")).toBe(true);

    await db.execute(`DROP TABLE IF EXISTS ${tableName}`);
  });
});

describe("INSERT", () => {
  it("inserts a new post into the DB", async () => {
    const fixture = makeFixture();
    await insertFixture(fixture);

    const result = await getDb().execute({
      sql: "SELECT * FROM posts WHERE slug = ?",
      args: [fixture.slug],
    });
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].title).toBe(fixture.title);
  });
});

describe("getAllPosts", () => {
  it("includes public posts in the listing", async () => {
    const fixture = makeFixture();
    await insertFixture(fixture);

    const posts = await getAllPosts();
    const found = posts.find((post) => post.slug === fixture.slug);
    expect(found).toBeDefined();
    expect(found!.title).toBe(fixture.title);
    expect(found!.tags).toEqual(fixture.tags);
    expect(found!.isUnlisted).toBe(false);
  });

  it("excludes unlisted posts from the public listing", async () => {
    const fixture = makeFixture({ is_unlisted: 1 });
    await insertFixture(fixture);

    const posts = await getAllPosts();
    expect(posts.some((post) => post.slug === fixture.slug)).toBe(false);
  });

  it("includes unlisted posts when explicitly requested", async () => {
    const fixture = makeFixture({ is_unlisted: 1 });
    await insertFixture(fixture);

    const posts = await getAllPosts({ includeUnlisted: true });
    const found = posts.find((post) => post.slug === fixture.slug);
    expect(found).toBeDefined();
    expect(found!.isUnlisted).toBe(true);
  });
});

describe("getPostBySlug", () => {
  it("returns the correct post with all fields", async () => {
    const fixture = makeFixture({ is_unlisted: 1 });
    await insertFixture(fixture);

    const post = await getPostBySlug(fixture.slug);
    expect(post).not.toBeNull();
    expect(post!.slug).toBe(fixture.slug);
    expect(post!.date).toBe(fixture.date);
    expect(post!.summary).toBe(fixture.summary);
    expect(post!.content).toBe(fixture.content);
    expect(post!.isUnlisted).toBe(true);
  });

  it("returns null for a slug that does not exist", async () => {
    await ensureSchema();
    const post = await getPostBySlug("this-slug-does-not-exist-ever");
    expect(post).toBeNull();
  });
});

describe("upsert (PUT logic)", () => {
  it("updates an existing post without losing created_at and persists is_unlisted", async () => {
    const fixture = makeFixture();
    await insertFixture(fixture);

    const before = await getDb().execute({
      sql: "SELECT created_at FROM posts WHERE slug = ?",
      args: [fixture.slug],
    });
    const createdAt = before.rows[0].created_at;

    await getDb().execute({
      sql: `INSERT INTO posts (slug, title, date, tags, summary, content, reading_time, is_unlisted)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(slug) DO UPDATE SET
              title        = excluded.title,
              date         = excluded.date,
              tags         = excluded.tags,
              summary      = excluded.summary,
              content      = excluded.content,
              reading_time = excluded.reading_time,
              is_unlisted  = excluded.is_unlisted,
              updated_at   = datetime('now')`,
      args: [
        fixture.slug,
        "Updated Title",
        fixture.date,
        JSON.stringify(fixture.tags),
        fixture.summary,
        fixture.content,
        fixture.reading_time,
        1,
      ],
    });

    const result = await getDb().execute({
      sql: "SELECT * FROM posts WHERE slug = ?",
      args: [fixture.slug],
    });
    expect(result.rows[0].title).toBe("Updated Title");
    expect(result.rows[0].created_at).toBe(createdAt);
    expect(Number(result.rows[0].is_unlisted)).toBe(1);
  });
});

describe("DELETE", () => {
  it("removes the post from the DB", async () => {
    const fixture = makeFixture();
    await insertFixture(fixture);

    await getDb().execute({ sql: "DELETE FROM posts WHERE slug = ?", args: [fixture.slug] });

    const result = await getDb().execute({
      sql: "SELECT * FROM posts WHERE slug = ?",
      args: [fixture.slug],
    });
    expect(result.rows.length).toBe(0);
    cleanupSlugs.delete(fixture.slug);
  });
});
