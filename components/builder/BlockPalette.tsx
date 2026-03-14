"use client";

import type { BlockType } from "@/types/component";

const BLOCK_TYPES: { type: BlockType; label: string; description: string }[] = [
  { type: "stat", label: "Stat", description: "Shows a labeled value" },
  { type: "progress-bar", label: "Progress Bar", description: "Fills based on value/max" },
  { type: "button", label: "Button", description: "Triggers an action" },
  { type: "event-log", label: "Event Log", description: "Shows a scrolling log" },
  { type: "slider", label: "Slider", description: "Range input bound to state" },
  { type: "text", label: "Text", description: "Static paragraph" },
  { type: "divider", label: "Divider", description: "Horizontal rule" },
  { type: "row", label: "Row", description: "Horizontal container" },
  { type: "column", label: "Column", description: "Vertical container" },
];

export function BlockPalette() {
  function onDragStart(e: React.DragEvent, type: BlockType) {
    e.dataTransfer.setData("block-type", type);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginBottom: "4px" }}>
        Drag blocks onto the canvas
      </p>
      {BLOCK_TYPES.map(({ type, label, description }) => (
        <div
          key={type}
          draggable
          onDragStart={(e) => onDragStart(e, type)}
          title={description}
          style={{
            padding: "8px 10px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            cursor: "grab",
            fontSize: "0.85rem",
            userSelect: "none",
          }}
        >
          {label}
        </div>
      ))}
    </div>
  );
}
