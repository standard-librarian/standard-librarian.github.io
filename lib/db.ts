import { createClient, type Client } from "@libsql/client";

let _db: Client | undefined;
let _schemaReady: Promise<void> | undefined;

export function getDb(): Client {
  if (!_db) {
    if (!process.env.TURSO_DATABASE_URL) {
      throw new Error("TURSO_DATABASE_URL is not configured. Set it in .env.local to use the database.");
    }
    _db = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return _db;
}

// Creates the posts and widgets tables if they don't exist. Called once per process.
export async function ensureSchema(): Promise<void> {
  if (!_schemaReady) {
    const db = getDb();
    _schemaReady = db.execute(`
      CREATE TABLE IF NOT EXISTS posts (
        slug         TEXT PRIMARY KEY,
        title        TEXT NOT NULL,
        date         TEXT NOT NULL,
        tags         TEXT NOT NULL DEFAULT '[]',
        summary      TEXT NOT NULL DEFAULT '',
        content      TEXT NOT NULL DEFAULT '',
        reading_time TEXT NOT NULL DEFAULT '',
        created_at   TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `).then(() => db.execute(`
      CREATE TABLE IF NOT EXISTS widgets (
        id          TEXT PRIMARY KEY,
        name        TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        definition  TEXT NOT NULL,
        status      TEXT NOT NULL DEFAULT 'pending',
        author      TEXT NOT NULL DEFAULT '',
        created_at  TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `)).then(() => db.execute(`
      CREATE TABLE IF NOT EXISTS previews (
        id         TEXT PRIMARY KEY,
        content    TEXT NOT NULL,
        expires_at TEXT NOT NULL DEFAULT (datetime('now', '+30 minutes'))
      )
    `)).then(() => undefined);
  }
  return _schemaReady;
}

let _reactionsReady: Promise<void> | undefined;

// Creates the reactions table if it doesn't exist.
export async function ensureReactionsSchema(): Promise<void> {
  if (!_reactionsReady) {
    _reactionsReady = getDb().execute(`
      CREATE TABLE IF NOT EXISTS reactions (
        post_slug TEXT NOT NULL,
        emoji     TEXT NOT NULL,
        count     INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (post_slug, emoji)
      )
    `).then(() => undefined);
  }
  return _reactionsReady;
}

export async function getReactionsForPost(slug: string): Promise<{ emoji: string; count: number }[]> {
  await ensureReactionsSchema();
  const result = await getDb().execute({
    sql: "SELECT emoji, count FROM reactions WHERE post_slug = ? AND count > 0 ORDER BY count DESC",
    args: [slug],
  });
  return result.rows.map((r) => ({ emoji: String(r.emoji), count: Number(r.count) }));
}

// Proxy so callers can write `db.execute(...)` without calling getDb() explicitly
export const db = new Proxy({} as Client, {
  get(_target, prop: string | symbol) {
    const client = getDb();
    const val = (client as unknown as Record<string | symbol, unknown>)[prop];
    return typeof val === "function" ? val.bind(client) : val;
  },
});
