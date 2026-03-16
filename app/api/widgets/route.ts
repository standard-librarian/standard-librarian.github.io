import { NextRequest, NextResponse } from "next/server";
import { getAllWidgets, createWidget } from "@/lib/widget-queries";

export async function GET() {
  const components = await getAllWidgets();
  return NextResponse.json(components);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { id, name, description, definition, author } = body;

  if (!id || !name || !definition) {
    return NextResponse.json({ error: "id, name, and definition are required" }, { status: 400 });
  }

  // Validate definition is valid JSON
  try {
    JSON.parse(typeof definition === "string" ? definition : JSON.stringify(definition));
  } catch {
    return NextResponse.json({ error: "definition must be valid JSON" }, { status: 400 });
  }

  await createWidget({
    id,
    name,
    description: description ?? "",
    definition: typeof definition === "string" ? definition : JSON.stringify(definition),
    author: author ?? "",
    status: "pending",
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
