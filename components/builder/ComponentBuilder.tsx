"use client";

import { useState } from "react";
import type { ComponentDef, BlockDef, BlockType, BlockProps } from "@/types/component";
import { BlockPalette } from "./BlockPalette";
import { BuilderCanvas } from "./BuilderCanvas";
import { BlockInspector } from "./BlockInspector";
import { StatePanel } from "./StatePanel";

const EMPTY_DEF: ComponentDef = {
  name: "New Component",
  description: "",
  state: [],
  actions: [],
  blocks: [],
};

function makeBlock(type: BlockType): BlockDef {
  const id = `${type}-${Date.now()}`;
  const defaults: Partial<Record<BlockType, BlockDef["props"]>> = {
    stat: { label: "Value: ${count}" },
    "progress-bar": { value: "${count}", max: 10, variant: "tokens" },
    button: { label: "Click", action: "" },
    "event-log": { source: "log" },
    slider: { label: "Slider", stateId: "", min: 0, max: 100, step: 1 },
    text: { content: "Static text here." },
    divider: {},
    row: {},
    column: {},
    "chat-feed": { source: "messages" },
    "chat-input": { inputState: "input", sendAction: "send", placeholder: "Type a message…" },
    card: { title: "Card" },
    grid: { columns: 2 },
    badge: { label: "Badge", variant: "info" },
    avatar: { label: "A" },
    tabs: { tabLabels: ["Tab 1", "Tab 2"], tabContents: [[], []] },
    panel: { title: "Panel", collapsible: true },
    "code-display": { language: "json" },
    "mermaid-block": { mermaid: "graph TD\n  A --> B" },
    "svg-block": { svgContent: "<svg><!-- paste SVG here --></svg>" },
    "typing-indicator": {},
    image: { src: "", alt: "" },
    "list-block": { items: "list" },
    split: {},
    pill: { label: "Pill" },
  };
  return { id, type, props: defaults[type] ?? {} };
}

type Props = {
  initialDefinition?: ComponentDef;
  onSave?: (def: ComponentDef) => Promise<void>;
  saveLabel?: string;
};

export function ComponentBuilder({
  initialDefinition = EMPTY_DEF,
  onSave,
  saveLabel = "Save",
}: Props) {
  const [definition, setDefinition] = useState<ComponentDef>(initialDefinition);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const selectedBlock = definition.blocks.find((b) => b.id === selectedId) ?? null;

  function dropBlock(type: BlockType) {
    const block = makeBlock(type);
    setDefinition((d) => ({ ...d, blocks: [...d.blocks, block] }));
    setSelectedId(block.id);
  }

  function moveBlock(id: string, direction: "up" | "down") {
    setDefinition((d) => {
      const blocks = [...d.blocks];
      const idx = blocks.findIndex((b) => b.id === id);
      if (idx < 0) return d;
      const swap = direction === "up" ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= blocks.length) return d;
      [blocks[idx], blocks[swap]] = [blocks[swap], blocks[idx]];
      return { ...d, blocks };
    });
  }

  function deleteBlock(id: string) {
    setDefinition((d) => ({ ...d, blocks: d.blocks.filter((b) => b.id !== id) }));
    if (selectedId === id) setSelectedId(null);
  }

  function updateBlockProps(id: string, props: BlockProps) {
    setDefinition((d) => ({
      ...d,
      blocks: d.blocks.map((b) => (b.id === id ? { ...b, props } : b)),
    }));
  }

  async function save() {
    if (!onSave) return;
    setSaving(true);
    setMessage("");
    await onSave(definition);
    setMessage("Saved.");
    setSaving(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* Header */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <input
          className="admin-input"
          value={definition.name}
          onChange={(e) => setDefinition((d) => ({ ...d, name: e.target.value }))}
          style={{ flex: 1, fontSize: "1rem", fontWeight: "bold" }}
          placeholder="Component name"
        />
        {onSave && (
          <button className="btn primary" onClick={save} disabled={saving}>
            {saving ? "Saving…" : saveLabel}
          </button>
        )}
        {message && <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{message}</span>}
      </div>

      {/* Three-panel layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "180px 1fr 220px",
          gap: "12px",
          minHeight: "500px",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        {/* Palette */}
        <div
          style={{
            padding: "12px",
            borderRight: "1px solid var(--border)",
            overflowY: "auto",
          }}
        >
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "8px" }}>
            Blocks
          </p>
          <BlockPalette />
        </div>

        {/* Canvas */}
        <div style={{ padding: "12px", overflowY: "auto" }}>
          <BuilderCanvas
            definition={definition}
            selectedId={selectedId}
            onSelectBlock={setSelectedId}
            onDropBlock={dropBlock}
            onMoveBlock={moveBlock}
            onDeleteBlock={deleteBlock}
          />
        </div>

        {/* Inspector + State */}
        <div
          style={{
            borderLeft: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
          }}
        >
          <div style={{ padding: "12px", borderBottom: "1px solid var(--border)" }}>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "8px" }}>
              Inspector
            </p>
            <BlockInspector
              block={selectedBlock}
              definition={definition}
              onUpdate={updateBlockProps}
            />
          </div>
          <div style={{ padding: "12px" }}>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "8px" }}>
              State & Actions
            </p>
            <StatePanel
              definition={definition}
              onUpdate={(patch) => setDefinition((d) => ({ ...d, ...patch }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
