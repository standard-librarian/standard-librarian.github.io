import { NextRequest, NextResponse } from "next/server";
import { getAllPosts } from "@/lib/posts";
import { db, ensureSchema } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { normalizePostSlug } from "@/lib/post-slugs";

export async function GET() {
  const posts = await getAllPosts();
  return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { slug, title, date, tags, summary, content, reading_time, isUnlisted } = body;
  const normalizedSlug = normalizePostSlug(String(slug ?? ""));

  if (!normalizedSlug) {
    return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  }

  await ensureSchema();
  await db.execute({
    sql: `INSERT INTO posts (slug, title, date, tags, summary, content, reading_time, is_unlisted)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      normalizedSlug,
      title,
      date,
      JSON.stringify(tags ?? []),
      summary ?? "",
      content ?? "",
      reading_time ?? "",
      isUnlisted ? 1 : 0,
    ],
  });

  return NextResponse.json({ ok: true });
}
