"use client";

import type { ComponentDef, StateVar, ActionDef } from "@/types/component";

type Props = {
  definition: ComponentDef;
  onUpdate: (patch: Partial<ComponentDef>) => void;
};

export function StatePanel({ definition, onUpdate }: Props) {
  function addStateVar() {
    const id = `var${definition.state.length + 1}`;
    onUpdate({
      state: [
        ...definition.state,
        { id, type: "number", initialValue: 0 },
      ],
    });
  }

  function removeStateVar(id: string) {
    onUpdate({ state: definition.state.filter((sv) => sv.id !== id) });
  }

  function updateStateVar(idx: number, patch: Partial<StateVar>) {
    const next = [...definition.state];
    next[idx] = { ...next[idx], ...patch };
    onUpdate({ state: next });
  }

  function addAction() {
    const id = `action${definition.actions.length + 1}`;
    onUpdate({
      actions: [...definition.actions, { id, ops: [] }],
    });
  }

  function removeAction(id: string) {
    onUpdate({ actions: definition.actions.filter((a) => a.id !== id) });
  }

  function updateActionId(idx: number, newId: string) {
    const next = [...definition.actions];
    next[idx] = { ...next[idx], id: newId };
    onUpdate({ actions: next });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* State vars */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <strong style={{ fontSize: "0.85rem" }}>State Variables</strong>
          <button className="admin-action-btn" onClick={addStateVar}>+ Add</button>
        </div>
        {definition.state.map((sv, idx) => (
          <div
            key={sv.id}
            style={{
              display: "flex",
              gap: "6px",
              alignItems: "center",
              marginBottom: "6px",
              fontSize: "0.8rem",
            }}
          >
            <input
              className="admin-input"
              value={sv.id}
              onChange={(e) => updateStateVar(idx, { id: e.target.value })}
              style={{ flex: 1 }}
              placeholder="id"
            />
            <select
              className="admin-input"
              value={sv.type}
              onChange={(e) =>
                updateStateVar(idx, { type: e.target.value as StateVar["type"] })
              }
              style={{ flex: 1 }}
            >
              <option value="number">number</option>
              <option value="boolean">boolean</option>
              <option value="log">log</option>
              <option value="timestamps">timestamps</option>
            </select>
            {sv.type === "number" && (
              <input
                className="admin-input"
                type="number"
                value={Number(sv.initialValue)}
                onChange={(e) => updateStateVar(idx, { initialValue: Number(e.target.value) })}
                style={{ width: "60px" }}
                placeholder="init"
              />
            )}
            <button
              className="admin-action-btn admin-action-danger"
              onClick={() => removeStateVar(sv.id)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <strong style={{ fontSize: "0.85rem" }}>Actions</strong>
          <button className="admin-action-btn" onClick={addAction}>+ Add</button>
        </div>
        {definition.actions.map((action, idx) => (
          <div
            key={action.id}
            style={{
              display: "flex",
              gap: "6px",
              alignItems: "center",
              marginBottom: "6px",
              fontSize: "0.8rem",
            }}
          >
            <input
              className="admin-input"
              value={action.id}
              onChange={(e) => updateActionId(idx, e.target.value)}
              style={{ flex: 1 }}
              placeholder="action id"
            />
            <span style={{ color: "var(--text-muted)" }}>
              {action.ops.length} op{action.ops.length !== 1 ? "s" : ""}
            </span>
            <button
              className="admin-action-btn admin-action-danger"
              onClick={() => removeAction(action.id)}
            >
              ✕
            </button>
          </div>
        ))}
        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
          Edit ops by modifying the JSON directly in the definition textarea.
        </p>
      </div>
    </div>
  );
}
