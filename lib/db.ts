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

function assertSafeIdentifier(value: string): string {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
    throw new Error(`Unsafe SQL identifier: ${value}`);
  }
  return value;
}

export async function ensureTableHasColumn(
  tableName: string,
  columnName: string,
  definition: string
): Promise<void> {
  const safeTableName = assertSafeIdentifier(tableName);
  const safeColumnName = assertSafeIdentifier(columnName);
  const result = await getDb().execute(`PRAGMA table_info(${safeTableName})`);
  const hasColumn = result.rows.some((row) => String(row.name) === safeColumnName);

  if (!hasColumn) {
    await getDb().execute(
      `ALTER TABLE ${safeTableName} ADD COLUMN ${safeColumnName} ${definition}`
    );
  }
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
        is_unlisted  INTEGER NOT NULL DEFAULT 0,
        created_at   TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `)
      .then(() => ensureTableHasColumn("posts", "is_unlisted", "INTEGER NOT NULL DEFAULT 0"))
      .then(() => db.execute(`
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
    `))
      .then(() => db.execute(`
      CREATE TABLE IF NOT EXISTS previews (
        id         TEXT PRIMARY KEY,
        content    TEXT NOT NULL,
        expires_at TEXT NOT NULL DEFAULT (datetime('now', '+30 minutes'))
      )
    `))
      .then(() => undefined);
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

let _githubCacheReady: Promise<void> | undefined;

export async function ensureGitHubCacheSchema(): Promise<void> {
  if (!_githubCacheReady) {
    _githubCacheReady = getDb().execute(`
      CREATE TABLE IF NOT EXISTS github_cache (
        key        TEXT PRIMARY KEY,
        data       TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `).then(() => undefined);
  }
  return _githubCacheReady;
}

export async function setCacheEntry(key: string, data: unknown): Promise<void> {
  await ensureGitHubCacheSchema();
  const now = new Date().toISOString();
  await getDb().execute({
    sql: `INSERT INTO github_cache (key, data, updated_at)
          VALUES (?, ?, ?)
          ON CONFLICT(key) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`,
    args: [key, JSON.stringify(data), now],
  });
}

export async function getCacheEntry<T>(key: string): Promise<T | null> {
  await ensureGitHubCacheSchema();
  const result = await getDb().execute({
    sql: `SELECT data FROM github_cache WHERE key = ?`,
    args: [key],
  });
  if (!result.rows[0]) return null;
  return JSON.parse(result.rows[0].data as string) as T;
}

// Proxy so callers can write `db.execute(...)` without calling getDb() explicitly
export const db = new Proxy({} as Client, {
  get(_target, prop: string | symbol) {
    const client = getDb();
    const val = (client as unknown as Record<string | symbol, unknown>)[prop];
    return typeof val === "function" ? val.bind(client) : val;
  },
});
