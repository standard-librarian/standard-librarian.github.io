import { NextRequest, NextResponse } from "next/server";
import { getPostBySlug } from "@/lib/posts";
import { db, ensureSchema } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { normalizePostSlug } from "@/lib/post-slugs";

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
  const { slug, title, date, tags, summary, content, reading_time, isUnlisted } = body;
  const normalizedSlug = normalizePostSlug(String(slug ?? params.slug));

  if (!normalizedSlug) {
    return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  }

  await ensureSchema();
  await db.execute({
    sql: `UPDATE posts
          SET slug = ?,
              title = ?,
              date = ?,
              tags = ?,
              summary = ?,
              content = ?,
              reading_time = ?,
              is_unlisted = ?,
              updated_at = datetime('now')
          WHERE slug = ?`,
    args: [
      normalizedSlug,
      title,
      date,
      JSON.stringify(tags ?? []),
      summary ?? "",
      content ?? "",
      reading_time ?? "",
      isUnlisted ? 1 : 0,
      params.slug,
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
