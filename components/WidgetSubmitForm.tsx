"use client";

import { useState } from "react";

const PLACEHOLDER = JSON.stringify(
  {
    name: "My Widget",
    description: "What it does",
    state: [{ id: "count", type: "number", initialValue: 0 }],
    actions: [
      { id: "increment", ops: [{ type: "increment", target: "count" }] },
    ],
    blocks: [
      { id: "btn", type: "button", props: { label: "Click me", action: "increment" } },
      { id: "stat", type: "stat", props: { label: "${count}" } },
    ],
  },
  null,
  2
);

export function WidgetSubmitForm() {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [author, setAuthor] = useState("");
  const [definition, setDefinition] = useState(PLACEHOLDER);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<"success" | "error" | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    setErrorMsg("");

    let parsed: unknown;
    try {
      parsed = JSON.parse(definition);
    } catch {
      setErrorMsg("Definition is not valid JSON.");
      setSubmitting(false);
      return;
    }

    const res = await fetch("/api/widgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name, author, definition: parsed }),
    });

    if (res.ok) {
      setResult("success");
    } else {
      const data = await res.json().catch(() => ({}));
      setErrorMsg(data.error ?? "Submission failed.");
      setResult("error");
    }
    setSubmitting(false);
  }

  if (result === "success") {
    return (
      <div
        style={{
          padding: "24px",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "1.1rem", marginBottom: "8px" }}>Submitted!</p>
        <p style={{ color: "var(--text-muted)" }}>
          Your widget is pending review. The admin will approve or reject it shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <span>Widget ID (slug, e.g. <code className="mdx-code">my-counter</code>)</span>
        <input
          className="admin-input"
          type="text"
          value={id}
          onChange={(e) => setId(e.target.value)}
          pattern="[a-z0-9-]+"
          required
          placeholder="my-counter"
        />
      </label>

      <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <span>Name</span>
        <input
          className="admin-input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="My Counter"
        />
      </label>

      <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <span>Your name / handle (optional)</span>
        <input
          className="admin-input"
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="anonymous"
        />
      </label>

      <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <span>Widget Definition (JSON)</span>
        <textarea
          value={definition}
          onChange={(e) => setDefinition(e.target.value)}
          required
          style={{
            width: "100%",
            minHeight: "360px",
            fontFamily: "monospace",
            fontSize: "0.85rem",
            padding: "12px",
            background: "var(--surface)",
            color: "var(--text)",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            resize: "vertical",
          }}
        />
      </label>

      {result === "error" && (
        <p style={{ color: "var(--danger, #ef4444)" }}>{errorMsg}</p>
      )}

      <button
        type="submit"
        className="btn primary"
        disabled={submitting}
        style={{ alignSelf: "flex-start" }}
      >
        {submitting ? "Submitting…" : "Submit for Review"}
      </button>
    </form>
  );
}
