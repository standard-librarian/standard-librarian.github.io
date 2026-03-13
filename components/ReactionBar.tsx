"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Reaction = { emoji: string; count: number };

type ReactionBarProps = {
  reactions: Reaction[];
  myReactions: Set<string>;
  onToggle: (emoji: string) => void;
  mounted: boolean;
  top?: boolean;
};

const PICKER_EMOJIS = ["❤️", "🔥", "👍", "💡", "🤯", "😂", "🚀", "💪", "🎯", "📚", "👀", "🙌"];

export function ReactionBar({ reactions, myReactions, onToggle, mounted, top }: ReactionBarProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerPos, setPickerPos] = useState({ x: 0, bottom: 0 });
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pickerOpen) return;
    function onDown(e: MouseEvent) {
      if (
        pickerRef.current && !pickerRef.current.contains(e.target as Node) &&
        addBtnRef.current && !addBtnRef.current.contains(e.target as Node)
      ) {
        setPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [pickerOpen]);

  function openPicker() {
    if (!addBtnRef.current) return;
    const rect = addBtnRef.current.getBoundingClientRect();
    setPickerPos({
      x: rect.left,
      bottom: window.innerHeight - rect.top + 6,
    });
    setPickerOpen((v) => !v);
  }

  function pickEmoji(emoji: string) {
    setPickerOpen(false);
    onToggle(emoji);
  }

  const sorted = [...reactions].sort((a, b) => {
    const aMine = myReactions.has(a.emoji) ? 1 : 0;
    const bMine = myReactions.has(b.emoji) ? 1 : 0;
    return bMine - aMine || b.count - a.count;
  });

  return (
    <div className={`reaction-bar${top ? " reaction-bar-top" : ""}`}>
      {sorted.map((r) => (
        <button
          key={r.emoji}
          className={`reaction-pill${myReactions.has(r.emoji) ? " reaction-pill-active" : ""}`}
          onClick={() => onToggle(r.emoji)}
          type="button"
          title={`${r.count} reaction${r.count !== 1 ? "s" : ""}`}
        >
          <span className="reaction-emoji">{r.emoji}</span>
          <span className="reaction-count">{r.count}</span>
        </button>
      ))}

      <button
        ref={addBtnRef}
        className="reaction-add-btn"
        onClick={openPicker}
        type="button"
        title="Add reaction"
      >
        +
      </button>

      {mounted && pickerOpen && createPortal(
        <div
          ref={pickerRef}
          className="emoji-picker"
          style={{ left: pickerPos.x, bottom: pickerPos.bottom }}
        >
          <div className="emoji-picker-grid">
            {PICKER_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                className={`emoji-picker-btn${myReactions.has(emoji) ? " emoji-picker-btn-active" : ""}`}
                onClick={() => pickEmoji(emoji)}
                type="button"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
