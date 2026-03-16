import { NextRequest, NextResponse } from "next/server";
import { getPostBySlug } from "@/lib/posts";
import { db, ensureSchema } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const post = await getPostBySlug(params.slug);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, date, tags, summary, content, reading_time } = body;

  await ensureSchema();
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
      params.slug,
      title,
      date,
      JSON.stringify(tags ?? []),
      summary ?? "",
      content ?? "",
      reading_time ?? "",
    ],
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureSchema();
  await db.execute({
    sql: "DELETE FROM posts WHERE slug = ?",
    args: [params.slug],
  });
  return NextResponse.json({ ok: true });
}
