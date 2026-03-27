"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Post } from "@/lib/posts";
import {
  normalizePostSlug,
  setCustomSlug,
  syncSlugWithTitle,
} from "@/lib/post-slugs";
import { createPreview } from "@/app/admin/preview-action";

type PostEditorProps = {
  post?: Post;
};

export function PostEditor({ post }: PostEditorProps) {
  const router = useRouter();
  const isNew = !post;

  const today = new Date().toISOString().split("T")[0];

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post?.slug));
  const [date, setDate] = useState(post?.date ?? today);
  const [tags, setTags] = useState(post?.tags.join(", ") ?? "");
  const [summary, setSummary] = useState(post?.summary ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [isUnlisted, setIsUnlisted] = useState(post?.isUnlisted ?? false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [titleError, setTitleError] = useState("");
  const [slugError, setSlugError] = useState("");

  async function handlePreview() {
    setError("");
    try {
      const id = await createPreview(content);
      setPreviewUrl(`/admin/preview/${id}`);
    } catch (err) {
      setError(String(err));
    }
  }

  async function handleSave() {
    if (!title.trim()) {
      setTitleError("Title is required");
      return;
    }
    const normalizedSlug = normalizePostSlug(slug);
    if (!normalizedSlug) {
      setSlugError("Slug is required");
      return;
    }
    setTitleError("");
    setSlugError("");
    setSaving(true);
    setSaved(false);
    setError("");

    setSlug(normalizedSlug);
    const tagArray = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    // Rough reading time estimate: ~200 words/min
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    const mins = Math.max(1, Math.round(wordCount / 200));
    const reading_time = `${mins} min read`;

    const body = {
      slug: normalizedSlug,
      title,
      date,
      tags: tagArray,
      summary,
      content,
      reading_time,
      isUnlisted,
    };

    const res = await fetch(isNew ? "/api/posts" : `/api/posts/${post.slug}`, {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setSaved(true);
      setTimeout(() => {
        router.push("/admin");
        router.refresh();
      }, 600);
    } else {
      const text = await res.text();
      setError(text || "Save failed");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this post permanently?")) return;
    await fetch(`/api/posts/${post!.slug}`, { method: "DELETE" });
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="admin-editor">
      <div className="admin-editor-panes">
        <div className="admin-editor-left">
          <div className="admin-fields">
            <label className="admin-label">Title *</label>
            <div>
              <input
                className={`admin-input${titleError ? " admin-input-error" : ""}`}
                value={title}
                onChange={(e) => {
                  const nextTitle = e.target.value;
                  const nextSlugState = syncSlugWithTitle(
                    { slug, slugTouched },
                    nextTitle
                  );
                  setTitle(nextTitle);
                  setSlug(nextSlugState.slug);
                  setSlugTouched(nextSlugState.slugTouched);
                  if (nextTitle.trim()) setTitleError("");
                  if (nextSlugState.slug.trim()) setSlugError("");
                }}
                placeholder="Post title"
              />
              {titleError && <p className="admin-field-error">{titleError}</p>}
            </div>

            <label className="admin-label">Slug *</label>
            <div>
              <input
                className={`admin-input${slugError ? " admin-input-error" : ""}`}
                value={slug}
                onChange={(e) => {
                  const nextSlugState = setCustomSlug(e.target.value);
                  setSlug(nextSlugState.slug);
                  setSlugTouched(nextSlugState.slugTouched);
                  if (nextSlugState.slug.trim()) setSlugError("");
                }}
                placeholder="custom-opaque-slug"
              />
              {slugError && <p className="admin-field-error">{slugError}</p>}
            </div>

            <label className="admin-label">Date</label>
            <input
              className="admin-input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <label className="admin-label">Tags (comma-separated)</label>
            <input
              className="admin-input"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="go, platform, ai"
            />

            <label className="admin-label">Summary</label>
            <input
              className="admin-input"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="One-sentence summary for the listing page"
            />

            <label className="admin-label" htmlFor="is-unlisted">
              Visibility
            </label>
            <label
              htmlFor="is-unlisted"
              style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}
            >
              <input
                id="is-unlisted"
                type="checkbox"
                checked={isUnlisted}
                onChange={(e) => setIsUnlisted(e.target.checked)}
                style={{ marginTop: "4px" }}
              />
              <span style={{ color: "var(--muted)", lineHeight: 1.5 }}>
                Mark as unlisted. The post will still work on its direct URL, but it will stay out
                of public listings and be served with <code>noindex</code>.
              </span>
            </label>
          </div>

          <textarea
            className="admin-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your MDX here…"
          />
        </div>

        <div className="admin-editor-right">
          {previewUrl ? (
            <iframe
              key={previewUrl}
              src={previewUrl}
              className="admin-preview-frame"
              title="Post preview"
            />
          ) : (
            <div className="admin-preview-placeholder">
              Click Preview to see rendered output
            </div>
          )}
        </div>
      </div>

      <div className="admin-editor-footer">
        <div className="admin-footer-left">
          <button className="btn primary" onClick={handleSave} disabled={saving || !title.trim()}>
            {saving ? "Saving…" : saved ? "Saved ✓" : "Save"}
          </button>
          <button className="btn ghost" onClick={handlePreview} type="button">
            Preview
          </button>
          <button
            className="btn ghost"
            onClick={() => router.push("/admin")}
            type="button"
          >
            Cancel
          </button>
        </div>

        {!isNew && (
          <button className="admin-delete-btn" onClick={handleDelete} type="button">
            Delete
          </button>
        )}

        {error && <p className="admin-error admin-error-footer">{error}</p>}
      </div>
    </div>
  );
}
