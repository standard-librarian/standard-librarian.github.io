import { NextRequest, NextResponse } from "next/server";
import { getComponentById, updateComponent, setComponentStatus } from "@/lib/components";
import { cookies } from "next/headers";

function isAdmin(request: NextRequest): boolean {
  const password = process.env.ADMIN_PASSWORD;
  const session = request.cookies.get("admin-session");
  return !!(password && session && session.value === password);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const comp = await getComponentById(params.id);
  if (!comp) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(comp);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, description, definition } = body;

  await updateComponent(params.id, {
    name,
    description,
    definition: typeof definition === "string" ? definition : JSON.stringify(definition),
  });

  return NextResponse.json({ ok: true });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { status } = body;

  if (!["pending", "approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await setComponentStatus(params.id, status);
  return NextResponse.json({ ok: true });
}
