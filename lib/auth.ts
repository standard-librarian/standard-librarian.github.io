import type { NextRequest } from "next/server";

export function isAdmin(request: NextRequest): boolean {
  const password = process.env.ADMIN_PASSWORD;
  const session = request.cookies.get("admin-session");
  return !!(password && session && session.value === password);
}
