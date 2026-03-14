"use client";

import type { BlockDef, BlockProps, ComponentDef } from "@/types/component";

type Props = {
  block: BlockDef | null;
  definition: ComponentDef;
  onUpdate: (id: string, props: BlockProps) => void;
};

export function BlockInspector({ block, definition, onUpdate }: Props) {
  if (!block) {
    return (
      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
        Select a block to edit its properties.
      </p>
    );
  }

  const stateIds = definition.state.map((sv) => sv.id);
  const actionIds = definition.actions.map((a) => a.id);

  function update(patch: Partial<BlockProps>) {
    onUpdate(block!.id, { ...block!.props, ...patch });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
        Block: <strong>{block.type}</strong> <code style={{ fontSize: "0.7rem" }}>{block.id}</code>
      </p>

      {/* label */}
      <Field label="Label">
        <input
          className="admin-input"
          value={block.props.label ?? ""}
          onChange={(e) => update({ label: e.target.value })}
          placeholder='e.g. "Send Request" or "${tokens}/5"'
        />
      </Field>

      {/* value */}
      {["stat", "progress-bar"].includes(block.type) && (
        <Field label="Value (state ref or literal)">
          <input
            className="admin-input"
            value={String(block.props.value ?? "")}
            onChange={(e) => update({ value: e.target.value })}
            placeholder="${tokens}"
          />
        </Field>
      )}

      {/* max */}
      {block.type === "progress-bar" && (
        <Field label="Max">
          <input
            className="admin-input"
            type="number"
            value={String(block.props.max ?? "")}
            onChange={(e) => update({ max: Number(e.target.value) })}
          />
        </Field>
      )}

      {/* variant */}
      {block.type === "progress-bar" && (
        <Field label="Variant">
          <select
            className="admin-input"
            value={block.props.variant ?? "tokens"}
            onChange={(e) => update({ variant: e.target.value })}
          >
            <option value="tokens">tokens (green fill)</option>
            <option value="used">used (dim fill)</option>
          </select>
        </Field>
      )}

      {/* action */}
      {["button", "slider"].includes(block.type) && (
        <Field label="Action">
          <select
            className="admin-input"
            value={block.props.action ?? ""}
            onChange={(e) => update({ action: e.target.value })}
          >
            <option value="">— none —</option>
            {actionIds.map((id) => (
              <option key={id} value={id}>{id}</option>
            ))}
          </select>
        </Field>
      )}

      {/* source (event-log) */}
      {block.type === "event-log" && (
        <Field label="Log source (state var)">
          <select
            className="admin-input"
            value={block.props.source ?? ""}
            onChange={(e) => update({ source: e.target.value })}
          >
            <option value="">— none —</option>
            {stateIds.map((id) => (
              <option key={id} value={id}>{id}</option>
            ))}
          </select>
        </Field>
      )}

      {/* content (text block) */}
      {block.type === "text" && (
        <Field label="Content">
          <textarea
            value={block.props.content ?? ""}
            onChange={(e) => update({ content: e.target.value })}
            style={{
              width: "100%",
              minHeight: "80px",
              padding: "8px",
              background: "var(--surface)",
              color: "var(--text)",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              fontFamily: "inherit",
              fontSize: "0.85rem",
              resize: "vertical",
            }}
          />
        </Field>
      )}

      {/* stateId (slider) */}
      {block.type === "slider" && (
        <Field label="Bound state var">
          <select
            className="admin-input"
            value={block.props.stateId ?? ""}
            onChange={(e) => update({ stateId: e.target.value })}
          >
            <option value="">— none —</option>
            {stateIds.map((id) => (
              <option key={id} value={id}>{id}</option>
            ))}
          </select>
        </Field>
      )}

      {/* slider min/max/step */}
      {block.type === "slider" && (
        <>
          <Field label="Min">
            <input
              className="admin-input"
              type="number"
              value={block.props.min ?? 0}
              onChange={(e) => update({ min: Number(e.target.value) })}
            />
          </Field>
          <Field label="Max">
            <input
              className="admin-input"
              type="number"
              value={String(block.props.max ?? 100)}
              onChange={(e) => update({ max: Number(e.target.value) })}
            />
          </Field>
          <Field label="Step">
            <input
              className="admin-input"
              type="number"
              value={block.props.step ?? 1}
              onChange={(e) => update({ step: Number(e.target.value) })}
            />
          </Field>
        </>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{label}</span>
      {children}
    </label>
  );
}
