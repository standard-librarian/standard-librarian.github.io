"use client";

import { useEffect, useRef } from "react";

const ZAP_COLOR = "#FFE500";
const ZAP_GLOW = "#FFB800";

interface Zap {
  points: [number, number][];
  life: number;
  maxLife: number;
}

function buildZap(
  x: number,
  y: number,
): [number, number][] {
  const segments = 3 + Math.floor(Math.random() * 3);
  const length = 8 + Math.random() * 16;
  const angle = Math.random() * Math.PI * 2;
  const segLen = length / segments;
  const pts: [number, number][] = [[x, y]];
  let cx = x;
  let cy = y;
  for (let i = 0; i < segments; i++) {
    cx += segLen * Math.cos(angle) + (Math.random() - 0.5) * 7;
    cy += segLen * Math.sin(angle) + (Math.random() - 0.5) * 7;
    pts.push([cx, cy]);
  }
  return pts;
}

export default function ElectricSelection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const zapsRef = useRef<Zap[]>([]);
  const rectsRef = useRef<DOMRect[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function onSelectionChange() {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        rectsRef.current = [];
        zapsRef.current = [];
        return;
      }
      rectsRef.current = Array.from(sel.getRangeAt(0).getClientRects()).filter(
        (r) => r.width > 2,
      );
    }
    document.addEventListener("selectionchange", onSelectionChange);

    function spawnZap() {
      const rects = rectsRef.current;
      if (!rects.length) return;
      const rect = rects[Math.floor(Math.random() * rects.length)];
      const x = rect.left + Math.random() * rect.width;
      const y = rect.top + Math.random() * rect.height;
      const maxLife = 5 + Math.floor(Math.random() * 8);
      zapsRef.current.push({ points: buildZap(x, y), life: maxLife, maxLife });
    }

    let tick = 0;
    function frame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (rectsRef.current.length > 0) {
        if (tick % 3 === 0) spawnZap();
        if (Math.random() < 0.5) spawnZap();
      }

      zapsRef.current = zapsRef.current.filter((z) => z.life > 0);

      for (const zap of zapsRef.current) {
        const alpha = zap.life / zap.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = ZAP_COLOR;
        ctx.lineWidth = 1.2 + Math.random() * 0.8;
        ctx.shadowBlur = 6 + Math.random() * 6;
        ctx.shadowColor = ZAP_GLOW;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(zap.points[0][0], zap.points[0][1]);
        for (let i = 1; i < zap.points.length; i++) {
          ctx.lineTo(zap.points[i][0], zap.points[i][1]);
        }
        ctx.stroke();
        ctx.restore();
        zap.life--;
      }

      tick++;
      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      document.removeEventListener("selectionchange", onSelectionChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
}
