"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export function MdhtPortrait() {
  const [isWink, setIsWink] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const triggerWink = () => {
    setIsWink(true);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setIsWink(false), 1200);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <button
      type="button"
      className={`mdht-portrait${isWink ? " is-wink" : ""}`}
      onClick={triggerWink}
      aria-label="Mdht portrait"
    >
      <span className="mdht-portrait-stack">
        <Image
          src="/mdht.png"
          alt="Mdht"
          fill
          sizes="220px"
          className="mdht-portrait-img mdht-portrait-base"
          priority
        />
        <Image
          src="/mdht-wink.png"
          alt="Mdht winking"
          fill
          sizes="220px"
          className="mdht-portrait-img mdht-portrait-wink"
        />
      </span>
    </button>
  );
}
