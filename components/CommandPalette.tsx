"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import type { SearchItem } from "@/lib/search";

type CommandPaletteProps = {
  items: SearchItem[];
};

const MAX_RESULTS = 8;

export function CommandPalette({ items }: CommandPaletteProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const fuse = useMemo(
    () =>
      new Fuse(items, {
        keys: ["title", "summary", "tags"],
        includeScore: true,
        threshold: 0.35
      }),
    [items]
  );

  const results = useMemo(() => {
    if (!query.trim()) {
      return items.slice(0, MAX_RESULTS);
    }
    return fuse.search(query).map((res) => res.item).slice(0, MAX_RESULTS);
  }, [items, fuse, query]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
        return;
      }

      if (!open) {
        return;
      }

      if (event.key === "Escape") {
        setOpen(false);
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (results.length > 0) {
          setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
        }
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        if (results.length > 0) {
          setActiveIndex((prev) => Math.max(prev - 1, 0));
        }
      }

      if (event.key === "Enter") {
        const selected = results[activeIndex];
        if (selected) {
          setOpen(false);
          router.push(selected.url);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, results, activeIndex, router]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    function handleOpen() {
      setOpen(true);
    }

    window.addEventListener("cmdk:open", handleOpen);
    return () => window.removeEventListener("cmdk:open", handleOpen);
  }, []);

  if (!open) {
    return null;
  }

  return (
    <div className="cmdk-overlay" onClick={() => setOpen(false)}>
      <div className="cmdk" onClick={(event) => event.stopPropagation()}>
        <input
          className="cmdk-input"
          autoFocus
          placeholder="Search posts and pages..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="cmdk-results">
          {results.length === 0 && (
            <div className="cmdk-empty">No matches found.</div>
          )}
          {results.map((item, index) => (
            <button
              key={item.id}
              className={`cmdk-item ${index === activeIndex ? "cmdk-item-active" : ""}`}
              onClick={() => {
                setOpen(false);
                router.push(item.url);
              }}
              type="button"
            >
              <div className="cmdk-item-text">
                <div className="cmdk-title">{item.title}</div>
                {item.summary && <div className="cmdk-meta">{item.summary}</div>}
              </div>
              <span className="cmdk-type">{item.type}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
