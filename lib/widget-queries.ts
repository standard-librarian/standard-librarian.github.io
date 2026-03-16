import { getDb, ensureSchema } from "@/lib/db";
import type { DBWidget } from "@/types/widget";

function rowToWidget(row: Record<string, unknown>): DBWidget {
  return {
    id: String(row.id),
    name: String(row.name),
    description: String(row.description ?? ""),
    definition: String(row.definition),
    status: String(row.status) as DBWidget["status"],
    author: String(row.author ?? ""),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export async function getWidgetById(id: string): Promise<DBWidget | null> {
  await ensureSchema();
  const result = await getDb().execute({
    sql: "SELECT * FROM widgets WHERE id = ?",
    args: [id],
  });
  if (result.rows.length === 0) return null;
  return rowToWidget(result.rows[0] as Record<string, unknown>);
}

export async function getApprovedWidgets(): Promise<DBWidget[]> {
  await ensureSchema();
  const result = await getDb().execute(
    "SELECT * FROM widgets WHERE status = 'approved' ORDER BY created_at DESC"
  );
  return result.rows.map((r) => rowToWidget(r as Record<string, unknown>));
}

export async function getAllWidgets(): Promise<DBWidget[]> {
  await ensureSchema();
  const result = await getDb().execute(
    "SELECT * FROM widgets ORDER BY created_at DESC"
  );
  return result.rows.map((r) => rowToWidget(r as Record<string, unknown>));
}

export async function createWidget(data: {
  id: string;
  name: string;
  description?: string;
  definition: string;
  author?: string;
  status?: DBWidget["status"];
}): Promise<void> {
  await ensureSchema();
  await getDb().execute({
    sql: `INSERT OR IGNORE INTO widgets (id, name, description, definition, author, status)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [
      data.id,
      data.name,
      data.description ?? "",
      data.definition,
      data.author ?? "",
      data.status ?? "pending",
    ],
  });
}

export async function upsertWidget(data: {
  id: string;
  name: string;
  description?: string;
  definition: string;
  author?: string;
  status?: DBWidget["status"];
}): Promise<void> {
  await ensureSchema();
  await getDb().execute({
    sql: `INSERT INTO widgets (id, name, description, definition, author, status)
          VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            description = excluded.description,
            definition = excluded.definition,
            author = excluded.author,
            status = excluded.status,
            updated_at = datetime('now')`,
    args: [
      data.id,
      data.name,
      data.description ?? "",
      data.definition,
      data.author ?? "",
      data.status ?? "pending",
    ],
  });
}

export async function updateWidget(
  id: string,
  data: { name?: string; description?: string; definition?: string; author?: string }
): Promise<void> {
  await ensureSchema();
  const fields: string[] = [];
  const args: unknown[] = [];
  if (data.name !== undefined) { fields.push("name = ?"); args.push(data.name); }
  if (data.description !== undefined) { fields.push("description = ?"); args.push(data.description); }
  if (data.definition !== undefined) { fields.push("definition = ?"); args.push(data.definition); }
  if (data.author !== undefined) { fields.push("author = ?"); args.push(data.author); }
  if (fields.length === 0) return;
  fields.push("updated_at = datetime('now')");
  args.push(id);
  await getDb().execute({
    sql: `UPDATE widgets SET ${fields.join(", ")} WHERE id = ?`,
    args: args as import("@libsql/client").InValue[],
  });
}

export async function setWidgetStatus(
  id: string,
  status: DBWidget["status"]
): Promise<void> {
  await ensureSchema();
  await getDb().execute({
    sql: "UPDATE widgets SET status = ?, updated_at = datetime('now') WHERE id = ?",
    args: [status, id],
  });
}
