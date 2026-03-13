"use server";

import { storePreview } from "@/lib/preview-store";

export async function createPreview(content: string): Promise<string> {
  return storePreview(content);
}
