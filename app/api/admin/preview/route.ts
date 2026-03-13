// Preview is handled by a Server Action + /admin/preview/[id] page.
// This file is kept as a no-op to avoid 404s from any cached references.
import { NextResponse } from "next/server";
export async function POST() {
  return NextResponse.json({ error: "Use the preview page instead." }, { status: 410 });
}
