import fs from "fs";
import path from "path";
import crypto from "crypto";
import os from "os";

const tmpDir = path.join(os.tmpdir(), "mdht-preview");

export function storePreview(content: string): string {
  fs.mkdirSync(tmpDir, { recursive: true });
  const id = crypto.randomUUID();
  fs.writeFileSync(path.join(tmpDir, `${id}.mdx`), content, "utf8");
  setTimeout(() => {
    try { fs.unlinkSync(path.join(tmpDir, `${id}.mdx`)); } catch {}
  }, 30 * 60 * 1000);
  return id;
}

export function getPreview(id: string): string | null {
  const filePath = path.join(tmpDir, `${id}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, "utf8");
}
