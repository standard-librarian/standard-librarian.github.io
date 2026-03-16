"use client";

import type { BlockDef, BlockType, WidgetDef } from "@/types/widget";
import { DynamicComponentClient } from "@/components/DynamicComponentClient";

type Props = {
  definition: WidgetDef;
  selectedId: string | null;
  onSelectBlock: (id: string) => void;
  onDropBlock: (type: BlockType) => void;
  onMoveBlock: (id: string, direction: "up" | "down") => void;
  onDeleteBlock: (id: string) => void;
};

export function BuilderCanvas({
  definition,
  selectedId,
  onSelectBlock,
  onDropBlock,
  onMoveBlock,
  onDeleteBlock,
}: Props) {
  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function onDrop(e: React.DragEvent) {
    const type = e.dataTransfer.getData("block-type") as BlockType;
    if (type) onDropBlock(type);
  }

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: "12px", height: "100%" }}
    >
      {/* Block list with controls */}
      <div
        onDragOver={onDragOver}
        onDrop={onDrop}
        style={{
          minHeight: "120px",
          border: "2px dashed var(--border)",
          borderRadius: "6px",
          padding: "8px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        {definition.blocks.length === 0 && (
          <p style={{ color: "var(--text-muted)", textAlign: "center", margin: "auto" }}>
            Drop blocks here
          </p>
        )}
        {definition.blocks.map((block, idx) => (
          <BlockRow
            key={block.id}
            block={block}
            isSelected={block.id === selectedId}
            isFirst={idx === 0}
            isLast={idx === definition.blocks.length - 1}
            onSelect={() => onSelectBlock(block.id)}
            onMove={(dir) => onMoveBlock(block.id, dir)}
            onDelete={() => onDeleteBlock(block.id)}
          />
        ))}
      </div>

      {/* Live preview */}
      <div>
        <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginBottom: "6px" }}>
          Live preview
        </p>
        <DynamicComponentClient definition={definition} />
      </div>
    </div>
  );
}

function BlockRow({
  block,
  isSelected,
  isFirst,
  isLast,
  onSelect,
  onMove,
  onDelete,
}: {
  block: BlockDef;
  isSelected: boolean;
  isFirst: boolean;
  isLast: boolean;
  onSelect: () => void;
  onMove: (dir: "up" | "down") => void;
  onDelete: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 8px",
        background: isSelected ? "var(--accent-bg, rgba(99,102,241,0.1))" : "var(--surface)",
        border: `1px solid ${isSelected ? "var(--accent, #6366f1)" : "var(--border)"}`,
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "0.8rem",
      }}
    >
      <span style={{ flex: 1 }}>
        <strong>{block.type}</strong>
        {block.props.label && <span style={{ color: "var(--text-muted)" }}> — {block.props.label}</span>}
        {block.props.action && <span style={{ color: "var(--text-muted)" }}> → {block.props.action}</span>}
      </span>
      <button
        className="admin-action-btn"
        disabled={isFirst}
        onClick={(e) => { e.stopPropagation(); onMove("up"); }}
      >
        ↑
      </button>
      <button
        className="admin-action-btn"
        disabled={isLast}
        onClick={(e) => { e.stopPropagation(); onMove("down"); }}
      >
        ↓
      </button>
      <button
        className="admin-action-btn admin-action-danger"
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
      >
        ✕
      </button>
    </div>
  );
}
