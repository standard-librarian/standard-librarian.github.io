"use client";

import { useState } from "react";
import type { OSSPR } from "@/lib/github";
import PRTimelineItem from "@/components/PRTimelineItem";

const FILTERS = ["merged", "open", "closed", "all"] as const;
type Filter = typeof FILTERS[number];

function matches(pr: OSSPR, filter: Filter): boolean {
  if (filter === "all") return true;
  if (filter === "merged") return !!pr.merged_at;
  if (filter === "open") return pr.state === "open" && !pr.merged_at;
  if (filter === "closed") return pr.state === "closed" && !pr.merged_at;
  return true;
}

export default function PRList({ prs }: { prs: OSSPR[] }) {
  const [filter, setFilter] = useState<Filter>("merged");

  const visible = prs.filter((pr) => matches(pr, filter));
  const counts: Record<Filter, number> = {
    merged: prs.filter((p) => p.merged_at).length,
    open: prs.filter((p) => p.state === "open" && !p.merged_at).length,
    closed: prs.filter((p) => p.state === "closed" && !p.merged_at).length,
    all: prs.length,
  };

  return (
    <>
      <div className="oss-filter-row">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            className={`oss-filter-btn${filter === f ? " oss-filter-btn-active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
            <span className="oss-filter-count">{counts[f]}</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="oss-empty">No {filter} PRs.</p>
      ) : (
        <div className="oss-pr-list">
          {visible.map((pr, i) => (
            <PRTimelineItem
              key={pr.id}
              pr={pr}
              isLast={i === visible.length - 1}
            />
          ))}
        </div>
      )}
    </>
  );
}
