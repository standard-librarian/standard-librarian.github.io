import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { ensureSchema, getDb } from "@/lib/db";
import { getSearchItems } from "@/lib/search";
import sitemap from "@/app/sitemap";
import { GET as getRss } from "@/app/rss.xml/route";
import { GET as getLlmsTxt } from "@/app/llms.txt/route";
import { GET as getLlmsFullTxt } from "@/app/llms-full.txt/route";
import { GET as listPosts, POST as createPost } from "@/app/api/posts/route";
import { GET as getPostRoute, PUT as updatePostRoute } from "@/app/api/posts/[slug]/route";
import { buildPostMetadata } from "@/lib/post-metadata";
import { getPostBySlug } from "@/lib/posts";

const cleanupSlugs = new Set<string>();
const adminPassword = "test-admin-password";

function uniqueSlug(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function makeFixture(overrides: Partial<{
  slug: string;
  title: string;
  summary: string;
  content: string;
  is_unlisted: number;
}> = {}) {
  const slug = overrides.slug ?? uniqueSlug("surface-post");
  cleanupSlugs.add(slug);

  return {
    slug,
    title: overrides.title ?? "Surface Test Post",
    date: "2026-02-10",
    tags: ["tests", "visibility"],
    summary: overrides.summary ?? "Testing public surfaces.",
    content: overrides.content ?? "## Surface Test\n\nThis post checks public outputs.",
    reading_time: "1 min read",
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

beforeEach(() => {
  process.env.ADMIN_PASSWORD = adminPassword;
});

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

describe("public surfaces", () => {
  it("keeps unlisted posts out of search, sitemap, RSS, and llms outputs", async () => {
    const publicPost = makeFixture({ title: "Public Surface Post" });
    const unlistedPost = makeFixture({
      slug: uniqueSlug("client-brief"),
      title: "Hidden Client Flow",
      summary: "Private brief",
      content: "This should only work by direct URL.",
      is_unlisted: 1,
    });

    await insertFixture(publicPost);
    await insertFixture(unlistedPost);

    const searchItems = await getSearchItems();
    expect(searchItems.some((item) => item.url === `/posts/${publicPost.slug}`)).toBe(true);
    expect(searchItems.some((item) => item.url === `/posts/${unlistedPost.slug}`)).toBe(false);

    const sitemapEntries = await sitemap();
    expect(sitemapEntries.some((entry) => entry.url.endsWith(`/posts/${publicPost.slug}`))).toBe(
      true
    );
    expect(
      sitemapEntries.some((entry) => entry.url.endsWith(`/posts/${unlistedPost.slug}`))
    ).toBe(false);

    const rssXml = await (await getRss()).text();
    expect(rssXml).toContain(`/posts/${publicPost.slug}`);
    expect(rssXml).not.toContain(`/posts/${unlistedPost.slug}`);

    const llmsTxt = await (await getLlmsTxt()).text();
    expect(llmsTxt).toContain(`/posts/${publicPost.slug}`);
    expect(llmsTxt).not.toContain(`/posts/${unlistedPost.slug}`);

    const llmsFullTxt = await (await getLlmsFullTxt()).text();
    expect(llmsFullTxt).toContain(`/posts/${publicPost.slug}`);
    expect(llmsFullTxt).not.toContain(`/posts/${unlistedPost.slug}`);
  });

  it("excludes unlisted posts from the public posts API but still serves them by slug", async () => {
    const publicPost = makeFixture({ title: "API Public Post" });
    const unlistedPost = makeFixture({
      slug: uniqueSlug("stealth-post"),
      title: "API Hidden Post",
      is_unlisted: 1,
    });

    await insertFixture(publicPost);
    await insertFixture(unlistedPost);

    const listResponse = await listPosts();
    const listedPosts = await listResponse.json();
    expect(listedPosts.some((post: { slug: string }) => post.slug === publicPost.slug)).toBe(true);
    expect(listedPosts.some((post: { slug: string }) => post.slug === unlistedPost.slug)).toBe(
      false
    );

    const slugResponse = await getPostRoute(
      new NextRequest(`http://localhost/api/posts/${unlistedPost.slug}`),
      { params: { slug: unlistedPost.slug } }
    );
    const body = await slugResponse.json();
    expect(body.slug).toBe(unlistedPost.slug);
    expect(body.isUnlisted).toBe(true);
  });

  it("marks unlisted post pages as noindex", async () => {
    const unlistedPost = makeFixture({
      slug: uniqueSlug("metadata-brief"),
      title: "Metadata Hidden Post",
      is_unlisted: 1,
    });
    await insertFixture(unlistedPost);

    const post = await getPostBySlug(unlistedPost.slug);
    const metadata = buildPostMetadata(post!);
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});

describe("post routes", () => {
  it("creates an unlisted post through POST payloads", async () => {
    const slug = uniqueSlug("brief-7k2m");
    cleanupSlugs.add(slug);

    const response = await createPost(
      new NextRequest("http://localhost/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: `admin-session=${adminPassword}`,
        },
        body: JSON.stringify({
          slug,
          title: "Client Delivery Walkthrough",
          date: "2026-03-01",
          tags: ["client", "process"],
          summary: "A private workflow explainer.",
          content: "## Discovery\n\nWe turn rough ideas into implementable scope.",
          reading_time: "1 min read",
          isUnlisted: true,
        }),
      })
    );

    expect(response.status).toBe(200);

    const post = await getPostBySlug(slug);
    expect(post).not.toBeNull();
    expect(post!.isUnlisted).toBe(true);
  });

  it("updates slug and unlisted state through PUT payloads", async () => {
    const original = makeFixture({ slug: uniqueSlug("edit-source") });
    await insertFixture(original);

    const updatedSlug = uniqueSlug("edit-target");
    cleanupSlugs.add(updatedSlug);

    const response = await updatePostRoute(
      new NextRequest(`http://localhost/api/posts/${original.slug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          cookie: `admin-session=${adminPassword}`,
        },
        body: JSON.stringify({
          slug: updatedSlug,
          title: "Updated Client Flow",
          date: original.date,
          tags: original.tags,
          summary: original.summary,
          content: original.content,
          reading_time: original.reading_time,
          isUnlisted: true,
        }),
      }),
      { params: { slug: original.slug } }
    );

    expect(response.status).toBe(200);

    const oldPost = await getPostBySlug(original.slug);
    const updatedPost = await getPostBySlug(updatedSlug);
    expect(oldPost).toBeNull();
    expect(updatedPost?.title).toBe("Updated Client Flow");
    expect(updatedPost?.isUnlisted).toBe(true);
  });
});
