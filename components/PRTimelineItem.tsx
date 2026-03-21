"use client";

import { useState } from "react";
import type { OSSPR } from "@/lib/github";

function formatStars(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PRTimelineItem({
  pr,
}: {
  pr: OSSPR;
  isLast: boolean;
}) {
  const [open, setOpen] = useState(false);

  const isMerged = !!pr.merged_at;
  const isOpen = pr.state === "open";
  const statusLabel = isMerged ? "merged" : isOpen ? "open" : "closed";
  const badgeClass = `oss-pr-badge${isMerged ? " oss-pr-badge-merged" : ""}`;

  const trimmedBody = pr.body?.trim() ?? "";

  return (
    <div className="oss-pr">
      <div className="oss-pr-main">
        <a
          href={pr.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="oss-pr-title"
        >
          {pr.title}
        </a>
        <span className={badgeClass}>{statusLabel}</span>
      </div>

      <div className="oss-pr-meta">
        <a
          href={pr.repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="oss-pr-repo"
        >
          {pr.repo.full_name}
        </a>
        <span>#{pr.number}</span>
        {pr.repo.language && <span>{pr.repo.language}</span>}
        <span>{formatStars(pr.repo.stargazers_count)} ★</span>
        <span>{formatDate(pr.created_at)}</span>
        {trimmedBody && (
          <button
            className="oss-pr-toggle"
            onClick={() => setOpen((v) => !v)}
            type="button"
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="currentColor"
              style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform 0.15s" }}
            >
              <path d="M3 2l4 3-4 3V2z" />
            </svg>
            {open ? "hide" : "description"}
          </button>
        )}
      </div>

      {open && trimmedBody && (
        <div className="oss-pr-body">{trimmedBody}</div>
      )}
    </div>
  );
}
