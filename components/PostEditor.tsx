"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Post } from "@/lib/posts";
import { createPreview } from "@/app/admin/preview-action";

type PostEditorProps = {
  post?: Post;
};

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function PostEditor({ post }: PostEditorProps) {
  const router = useRouter();
  const isNew = !post;

  const today = new Date().toISOString().split("T")[0];

  const [title, setTitle] = useState(post?.title ?? "");
  const [date, setDate] = useState(post?.date ?? today);
  const [tags, setTags] = useState(post?.tags.join(", ") ?? "");
  const [summary, setSummary] = useState(post?.summary ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [titleError, setTitleError] = useState("");

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
    setTitleError("");
    setSaving(true);
    setSaved(false);
    setError("");

    const slug = isNew ? slugify(title) : post.slug;
    const tagArray = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    // Rough reading time estimate: ~200 words/min
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    const mins = Math.max(1, Math.round(wordCount / 200));
    const reading_time = `${mins} min read`;

    const body = { slug, title, date, tags: tagArray, summary, content, reading_time };

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
                onChange={(e) => { setTitle(e.target.value); if (e.target.value.trim()) setTitleError(""); }}
                placeholder="Post title"
              />
              {titleError && <p className="admin-field-error">{titleError}</p>}
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
