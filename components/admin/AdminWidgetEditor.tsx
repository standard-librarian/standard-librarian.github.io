"use client";

import { useState } from "react";
import type { DBWidget } from "@/types/widget";

export function AdminWidgetEditor({ comp }: { comp: DBWidget }) {
  const [definition, setDefinition] = useState(
    JSON.stringify(JSON.parse(comp.definition), null, 2)
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      JSON.parse(definition); // validate
    } catch {
      setMessage("Invalid JSON");
      setSaving(false);
      return;
    }
    const res = await fetch(`/api/widgets/${comp.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: comp.name, description: comp.description, definition }),
    });
    setMessage(res.ok ? "Saved." : "Error saving.");
    setSaving(false);
  }

  async function setStatus(status: "approved" | "rejected") {
    setSaving(true);
    setMessage("");
    const res = await fetch(`/api/widgets/${comp.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setMessage(res.ok ? `Status set to ${status}.` : "Error updating status.");
    setSaving(false);
  }

  return (
    <div>
      <h2 className="section-title" style={{ fontSize: "1rem", marginBottom: "12px" }}>
        Definition (JSON)
      </h2>
      <textarea
        value={definition}
        onChange={(e) => setDefinition(e.target.value)}
        style={{
          width: "100%",
          minHeight: "400px",
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
      {message && (
        <p style={{ color: "var(--text-muted)", margin: "8px 0" }}>{message}</p>
      )}
      <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
        <button className="btn primary" onClick={save} disabled={saving}>
          Save Definition
        </button>
        <button
          className="btn"
          onClick={() => setStatus("approved")}
          disabled={saving}
          style={{ background: "var(--success, #22c55e)", color: "#fff" }}
        >
          Approve
        </button>
        <button
          className="btn"
          onClick={() => setStatus("rejected")}
          disabled={saving}
          style={{ background: "var(--danger, #ef4444)", color: "#fff" }}
        >
          Reject
        </button>
      </div>
    </div>
  );
}
