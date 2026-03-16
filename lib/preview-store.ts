import { getDb, ensureSchema } from "@/lib/db";

export async function storePreview(content: string): Promise<string> {
  await ensureSchema();
  const id = crypto.randomUUID();
  await getDb().execute({
    sql: "INSERT INTO previews (id, content) VALUES (?, ?)",
    args: [id, content],
  });
  // Fire-and-forget cleanup of expired rows
  getDb().execute("DELETE FROM previews WHERE expires_at < datetime('now')").catch(() => {});
  return id;
}

export async function getPreview(
  id: string
): Promise<{ content: string } | "expired" | null> {
  await ensureSchema();
  const result = await getDb().execute({
    sql: "SELECT content, expires_at FROM previews WHERE id = ?",
    args: [id],
  });
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  if (new Date(String(row.expires_at)) < new Date()) return "expired";
  return { content: String(row.content) };
}
