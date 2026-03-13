import { NextRequest, NextResponse } from "next/server";
import { getDb, ensureReactionsSchema, getReactionsForPost } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const reactions = await getReactionsForPost(params.slug);
    return NextResponse.json(reactions);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { emoji, delta } = await request.json() as { emoji: string; delta: 1 | -1 };

  if (!emoji || (delta !== 1 && delta !== -1)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  await ensureReactionsSchema();
  const db = getDb();

  await db.execute({
    sql: `INSERT INTO reactions (post_slug, emoji, count) VALUES (?, ?, MAX(0, ?))
          ON CONFLICT(post_slug, emoji) DO UPDATE SET count = MAX(0, count + ?)`,
    args: [params.slug, emoji, delta, delta],
  });

  const result = await db.execute({
    sql: "SELECT count FROM reactions WHERE post_slug = ? AND emoji = ?",
    args: [params.slug, emoji],
  });

  const count = Number(result.rows[0]?.count ?? 0);
  return NextResponse.json({ emoji, count });
}
