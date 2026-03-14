"use client";

import { useState } from "react";
import Link from "next/link";

interface Props {
  tags: string[];
  activeTag?: string;
}

export function CollapsibleTopics({ tags, activeTag }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside className="posts-sidebar">
      <button
        className="sidebar-toggle"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
      >
        <span>Topics</span>
        <span>{isOpen ? "▴" : "▾"}</span>
      </button>
      <div className={`sidebar-tags-panel${!isOpen ? " sidebar-tags-panel--closed" : ""}`}>
        <p className="sidebar-heading">Topics</p>
        <div className="sidebar-tags">
          <Link
            href="/posts"
            className={`sidebar-tag${!activeTag ? " active" : ""}`}
          >
            All
          </Link>
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/posts?tag=${tag}`}
              className={`sidebar-tag${activeTag === tag ? " active" : ""}`}
            >
              #{tag}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
