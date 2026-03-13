"use client";

import { useEffect, useState } from "react";
import { ReactionBar } from "./ReactionBar";

type Reaction = { emoji: string; count: number };

export function PostReactions({
  slug,
  initialReactions,
  children,
}: {
  slug: string;
  initialReactions: Reaction[];
  children: React.ReactNode;
}) {
  const [reactions, setReactions] = useState<Reaction[]>(initialReactions);
  const [myReactions, setMyReactions] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(`reactions:${slug}`);
      if (raw) setMyReactions(new Set(JSON.parse(raw)));
    } catch {}
  }, [slug]);

  async function toggle(emoji: string) {
    const alreadyReacted = myReactions.has(emoji);
    const delta = alreadyReacted ? -1 : 1;

    setReactions((prev) => {
      const existing = prev.find((r) => r.emoji === emoji);
      if (existing) {
        return prev
          .map((r) => r.emoji === emoji ? { ...r, count: Math.max(0, r.count + delta) } : r)
          .filter((r) => r.count > 0);
      }
      return delta === 1 ? [...prev, { emoji, count: 1 }] : prev;
    });

    const newMine = new Set(myReactions);
    if (alreadyReacted) newMine.delete(emoji);
    else newMine.add(emoji);
    setMyReactions(newMine);

    try {
      localStorage.setItem(`reactions:${slug}`, JSON.stringify([...newMine]));
    } catch {}

    await fetch(`/api/reactions/${slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emoji, delta }),
    });
  }

  return (
    <>
      <ReactionBar
        top
        reactions={reactions}
        myReactions={myReactions}
        onToggle={toggle}
        mounted={mounted}
      />
      {children}
      <ReactionBar
        reactions={reactions}
        myReactions={myReactions}
        onToggle={toggle}
        mounted={mounted}
      />
    </>
  );
}
