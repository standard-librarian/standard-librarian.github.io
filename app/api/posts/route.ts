import { NextRequest, NextResponse } from "next/server";
import { getAllPosts } from "@/lib/posts";
import { db, ensureSchema } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  const posts = await getAllPosts();
  return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { slug, title, date, tags, summary, content, reading_time } = body;

  await ensureSchema();
  await db.execute({
    sql: `INSERT INTO posts (slug, title, date, tags, summary, content, reading_time)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [slug, title, date, JSON.stringify(tags ?? []), summary ?? "", content ?? "", reading_time ?? ""],
  });

  return NextResponse.json({ ok: true });
}
