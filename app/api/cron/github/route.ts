import { setCacheEntry } from "@/lib/db";
import { fetchGitHubCache } from "@/lib/github";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;

  const isVercelCron = request.headers.get("x-vercel-cron") === "1";
  const isAuthorized = !secret || isVercelCron || auth === `Bearer ${secret}`;

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cache = await fetchGitHubCache();
    await setCacheEntry("github:data", cache);
    return NextResponse.json({
      ok: true,
      updated: cache.last_updated,
      repos: cache.repos.length,
      prs: cache.prs.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
