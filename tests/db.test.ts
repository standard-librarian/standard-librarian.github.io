import { describe, it, expect, afterEach } from "vitest";
import { getDb, ensureSchema } from "@/lib/db";
import { getAllPosts, getPostBySlug } from "@/lib/posts";

// Unique prefix so parallel/repeated runs don't collide
const slug = `test-crud-${Date.now()}`;

const fixture = {
  slug,
  title: "Test Post",
  date: "2026-01-01",
  tags: JSON.stringify(["test", "vitest"]),
  summary: "A post created by the test suite.",
  content: "## Hello\n\nThis is test content.",
  reading_time: "1 min read",
};

afterEach(async () => {
  // Always clean up the test row so the DB stays tidy
  const db = getDb();
  await db.execute({ sql: "DELETE FROM posts WHERE slug = ?", args: [slug] });
});

describe("ensureSchema", () => {
  it("creates the posts table (idempotent)", async () => {
    await ensureSchema();
    await ensureSchema(); // second call must not throw
    const db = getDb();
    const result = await db.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='posts'"
    );
    expect(result.rows.length).toBe(1);
  });
});

describe("INSERT", () => {
  it("inserts a new post into the DB", async () => {
    await ensureSchema();
    const db = getDb();
    await db.execute({
      sql: `INSERT INTO posts (slug, title, date, tags, summary, content, reading_time)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        fixture.slug, fixture.title, fixture.date,
        fixture.tags, fixture.summary, fixture.content, fixture.reading_time,
      ],
    });

    const result = await db.execute({
      sql: "SELECT * FROM posts WHERE slug = ?",
      args: [slug],
    });
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].title).toBe(fixture.title);
  });
});

describe("getAllPosts", () => {
  it("includes the inserted post in the listing", async () => {
    await ensureSchema();
    const db = getDb();
    await db.execute({
      sql: `INSERT INTO posts (slug, title, date, tags, summary, content, reading_time)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        fixture.slug, fixture.title, fixture.date,
        fixture.tags, fixture.summary, fixture.content, fixture.reading_time,
      ],
    });

    const posts = await getAllPosts();
    const found = posts.find((p) => p.slug === slug);
    expect(found).toBeDefined();
    expect(found!.title).toBe(fixture.title);
    expect(found!.tags).toEqual(["test", "vitest"]);
  });
});

describe("getPostBySlug", () => {
  it("returns the correct post with all fields", async () => {
    await ensureSchema();
    const db = getDb();
    await db.execute({
      sql: `INSERT INTO posts (slug, title, date, tags, summary, content, reading_time)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        fixture.slug, fixture.title, fixture.date,
        fixture.tags, fixture.summary, fixture.content, fixture.reading_time,
      ],
    });

    const post = await getPostBySlug(slug);
    expect(post).not.toBeNull();
    expect(post!.slug).toBe(slug);
    expect(post!.date).toBe(fixture.date);
    expect(post!.summary).toBe(fixture.summary);
    expect(post!.content).toBe(fixture.content);
  });

  it("returns null for a slug that does not exist", async () => {
    await ensureSchema();
    const post = await getPostBySlug("this-slug-does-not-exist-ever");
    expect(post).toBeNull();
  });
});

describe("upsert (PUT logic)", () => {
  it("updates an existing post without losing created_at", async () => {
    await ensureSchema();
    const db = getDb();

    // Insert initial row
    await db.execute({
      sql: `INSERT INTO posts (slug, title, date, tags, summary, content, reading_time)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        fixture.slug, fixture.title, fixture.date,
        fixture.tags, fixture.summary, fixture.content, fixture.reading_time,
      ],
    });

    const before = await db.execute({
      sql: "SELECT created_at FROM posts WHERE slug = ?",
      args: [slug],
    });
    const createdAt = before.rows[0].created_at;

    // Upsert with updated title
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
        fixture.slug, "Updated Title", fixture.date,
        fixture.tags, fixture.summary, fixture.content, fixture.reading_time,
      ],
    });

    const result = await db.execute({
      sql: "SELECT * FROM posts WHERE slug = ?",
      args: [slug],
    });
    expect(result.rows[0].title).toBe("Updated Title");
    // created_at must be unchanged
    expect(result.rows[0].created_at).toBe(createdAt);
  });
});

describe("DELETE", () => {
  it("removes the post from the DB", async () => {
    await ensureSchema();
    const db = getDb();

    await db.execute({
      sql: `INSERT INTO posts (slug, title, date, tags, summary, content, reading_time)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        fixture.slug, fixture.title, fixture.date,
        fixture.tags, fixture.summary, fixture.content, fixture.reading_time,
      ],
    });

    await db.execute({ sql: "DELETE FROM posts WHERE slug = ?", args: [slug] });

    const result = await db.execute({
      sql: "SELECT * FROM posts WHERE slug = ?",
      args: [slug],
    });
    expect(result.rows.length).toBe(0);
  });
});
