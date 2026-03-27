import { describe, expect, it } from "vitest";
import {
  normalizePostSlug,
  setCustomSlug,
  syncSlugWithTitle,
} from "@/lib/post-slugs";

describe("post slug editor helpers", () => {
  it("auto-generates a slug from the title until the slug is manually edited", () => {
    const initial = { slug: "", slugTouched: false };
    const autoSynced = syncSlugWithTitle(initial, "Client Workflow Walkthrough");
    expect(autoSynced).toEqual({
      slug: "client-workflow-walkthrough",
      slugTouched: false,
    });

    const custom = setCustomSlug("brief-7k2m-client-flow");
    expect(custom).toEqual({
      slug: "brief-7k2m-client-flow",
      slugTouched: true,
    });

    const preserved = syncSlugWithTitle(custom, "A Completely Different Title");
    expect(preserved.slug).toBe("brief-7k2m-client-flow");
    expect(preserved.slugTouched).toBe(true);
  });

  it("normalizes manual slug input", () => {
    expect(normalizePostSlug("  Hidden Client Page 2026!  ")).toBe(
      "hidden-client-page-2026"
    );
  });
});
