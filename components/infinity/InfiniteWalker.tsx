"use client";

import { useEffect, useRef, useState } from "react";

export function InfiniteWalker() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [walkPhase, setWalkPhase] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleScroll = () => {
      const rect = el.getBoundingClientRect();
      const viewH = window.innerHeight;
      const progress = Math.min(1, Math.max(0, 1 - rect.bottom / (viewH + rect.height)));
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setWalkPhase((p) => (p + 1) % 4), 180);
    return () => clearInterval(id);
  }, []);

  const VP_X = 300; // vanishing point x
  const VP_Y = 158; // vanishing point y
  const figureX = 70 + scrollProgress * 210;
  const figureScale = 1 - scrollProgress * 0.6;
  const figureY = 200 - scrollProgress * 42;

  const legSwing = [16, 6, -16, -6];
  const armSwing = [-12, -4, 12, 4];
  const lLeg = legSwing[walkPhase];
  const rLeg = -lLeg;
  const armL = armSwing[walkPhase];
  const armR = -armL;

  // Trail dots behind the walker
  const trailDots = [0.18, 0.36, 0.54, 0.72, 0.9].map((t) => {
    const tx = 70 + t * figureX * 0.9;
    const ty = 200 - t * (200 - figureY) * 0.9;
    return { x: tx, y: ty, opacity: t * 0.45, r: 2.5 * t };
  });

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "280px",
        background: "#000",
        borderRadius: "10px",
        overflow: "hidden",
        border: "1px solid #1f1f1f",
        marginBottom: "2rem",
        position: "relative",
      }}
    >
      {/* CSS keyframe animations injected inline */}
      <style>{`
        @keyframes dashScroll {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -60; }
        }
        @keyframes nowPulse {
          0%, 100% { opacity: 1; filter: drop-shadow(0 0 6px #f59e0b) drop-shadow(0 0 14px #f59e0b); }
          50% { opacity: 0.6; filter: drop-shadow(0 0 2px #f59e0b); }
        }
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.9; }
        }
        @keyframes lensFlare {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.15); }
        }
      `}</style>

      <svg
        viewBox="0 0 600 280"
        style={{ width: "100%", height: "100%", display: "block" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Road surface gradient */}
          <linearGradient id="roadSurface" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#1a1520" />
            <stop offset="100%" stopColor="#0a0808" />
          </linearGradient>

          {/* Vanishing point radial glow */}
          <radialGradient id="vpGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
            <stop offset="30%" stopColor="#a855f7" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          {/* Purple trail gradient */}
          <linearGradient id="trailGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.0" />
          </linearGradient>

          {/* Atmospheric horizon glow */}
          <radialGradient id="horizonGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
            <stop offset="60%" stopColor="#7c3aed" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="strongGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Sky background */}
        <rect x="0" y="0" width="600" height="280" fill="#000" />

        {/* Stars — deterministic positions */}
        {Array.from({ length: 80 }).map((_, i) => {
          const sx = ((i * 107 + 23) % 570) + 15;
          const sy = ((i * 67 + 11) % 145) + 5;
          const sr = 0.4 + (i % 3) * 0.35;
          const delay = (i % 7) * 0.4;
          return (
            <circle
              key={i}
              cx={sx}
              cy={sy}
              r={sr}
              fill="#ffffff"
              style={{
                animation: `starTwinkle ${1.8 + (i % 5) * 0.4}s ${delay}s ease-in-out infinite`,
                opacity: 0.4,
              }}
            />
          );
        })}

        {/* Subtle nebula wisps */}
        <ellipse cx="150" cy="60" rx="90" ry="20" fill="#1e0a40" opacity="0.18" />
        <ellipse cx="450" cy="80" rx="70" ry="15" fill="#052e3f" opacity="0.15" />

        {/* Road trapezoid */}
        <polygon
          points={`0,280 600,280 ${VP_X + 120},${VP_Y + 7} ${VP_X - 120},${VP_Y + 7}`}
          fill="url(#roadSurface)"
        />

        {/* Road edges — glowing */}
        <line x1="0" y1="280" x2={VP_X - 120} y2={VP_Y + 7} stroke="#2a1a3a" strokeWidth="1.5" filter="url(#glow)" />
        <line x1="600" y1="280" x2={VP_X + 120} y2={VP_Y + 7} stroke="#2a1a3a" strokeWidth="1.5" filter="url(#glow)" />

        {/* Scrolling center dashes */}
        {Array.from({ length: 14 }).map((_, i) => {
          const t = i / 13;
          const t2 = (i + 0.55) / 13;
          const y1 = VP_Y + 7 + (1 - t) * (273 - VP_Y - 7);
          const y2 = VP_Y + 7 + (1 - t2) * (273 - VP_Y - 7);
          const w = 1.5 * (1 - t * 0.85);
          return (
            <line
              key={i}
              x1={VP_X}
              y1={y1}
              x2={VP_X}
              y2={y2}
              stroke="#6b21a8"
              strokeWidth={w}
              opacity={0.4 + t * 0.3}
              style={{ animation: `dashScroll 1.2s ${-i * 0.086}s linear infinite` }}
            />
          );
        })}

        {/* Horizon atmospheric glow */}
        <ellipse cx={VP_X} cy={VP_Y + 4} rx="200" ry="50" fill="url(#horizonGlow)" />

        {/* Lens flare rings around vanishing point */}
        <circle
          cx={VP_X}
          cy={VP_Y}
          r="28"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="0.5"
          opacity="0.25"
          style={{ animation: "lensFlare 2s ease-in-out infinite" }}
        />
        <circle
          cx={VP_X}
          cy={VP_Y}
          r="16"
          fill="none"
          stroke="#f5d060"
          strokeWidth="0.8"
          opacity="0.35"
          style={{ animation: "lensFlare 2s 0.5s ease-in-out infinite" }}
        />
        <circle
          cx={VP_X}
          cy={VP_Y}
          r="7"
          fill="url(#vpGlow)"
          opacity="0.9"
          style={{ animation: "lensFlare 2s 0.25s ease-in-out infinite" }}
        />

        {/* NOW marker */}
        <g
          transform={`translate(${VP_X}, ${VP_Y - 14})`}
          style={{ animation: "nowPulse 2.2s ease-in-out infinite" }}
        >
          <rect x="-20" y="-9" width="40" height="16" rx="3" fill="#0a0505" stroke="#f59e0b" strokeWidth="1" />
          <text
            x="0"
            y="3"
            textAnchor="middle"
            fill="#f59e0b"
            fontSize="8"
            fontFamily="monospace"
            fontWeight="bold"
            letterSpacing="3"
          >
            NOW
          </text>
        </g>

        {/* Purple trail behind walker */}
        <line
          x1="30"
          y1="272"
          x2={figureX - 4}
          y2={figureY + 20 * figureScale}
          stroke="url(#trailGrad)"
          strokeWidth="2"
          opacity="0.5"
        />

        {/* Trail dots */}
        {trailDots.map((dot, i) => (
          <circle
            key={i}
            cx={dot.x}
            cy={dot.y}
            r={dot.r}
            fill="#7c3aed"
            opacity={dot.opacity}
          />
        ))}

        {/* Walking figure */}
        <g
          transform={`translate(${figureX}, ${figureY}) scale(${figureScale})`}
          filter="url(#glow)"
        >
          {/* Aura */}
          <circle cx="0" cy="-12" r="20" fill="#7c3aed" opacity="0.07" />
          {/* Body */}
          <line x1="0" y1="-18" x2="0" y2="2" stroke="#f5f5f5" strokeWidth="2.5" strokeLinecap="round" />
          {/* Head */}
          <circle cx="0" cy="-24" r="5.5" fill="none" stroke="#f5f5f5" strokeWidth="2" />
          {/* Arms */}
          <line
            x1="0" y1="-13"
            x2={-11 + Math.sin((armL * Math.PI) / 180) * 6}
            y2="-4"
            stroke="#f5f5f5" strokeWidth="2" strokeLinecap="round"
          />
          <line
            x1="0" y1="-13"
            x2={11 + Math.sin((armR * Math.PI) / 180) * 6}
            y2="-4"
            stroke="#f5f5f5" strokeWidth="2" strokeLinecap="round"
          />
          {/* Left leg */}
          <line
            x1="0" y1="2"
            x2={-5 + Math.sin((lLeg * Math.PI) / 180) * 4}
            y2="16"
            stroke="#f5f5f5" strokeWidth="2" strokeLinecap="round"
            transform={`rotate(${lLeg * 0.6}, 0, 2)`}
          />
          {/* Right leg */}
          <line
            x1="0" y1="2"
            x2={5 + Math.sin((rLeg * Math.PI) / 180) * 4}
            y2="16"
            stroke="#f5f5f5" strokeWidth="2" strokeLinecap="round"
            transform={`rotate(${rLeg * 0.6}, 0, 2)`}
          />
        </g>

        {/* ∞ symbols along the road */}
        {[55, 100, 145].map((x, i) => {
          const t = (x - 30) / 270;
          const sy = 275 - t * (275 - figureY - 8 * figureScale);
          const sz = 13 - t * 7;
          return (
            <text
              key={i}
              x={x}
              y={sy}
              fill="#7c3aed"
              fontSize={sz}
              fontFamily="monospace"
              opacity={0.2 + i * 0.1}
              textAnchor="middle"
            >
              ∞
            </text>
          );
        })}
      </svg>

      {/* Text overlay */}
      <div
        style={{
          position: "absolute",
          top: "18px",
          left: "24px",
          right: "24px",
          pointerEvents: "none",
        }}
      >
        <p
          style={{
            color: "#d4d4d4",
            fontSize: "15px",
            fontFamily: "system-ui, Georgia, serif",
            fontStyle: "italic",
            lineHeight: "1.6",
            margin: 0,
            textShadow: "0 0 24px rgba(0,0,0,0.9)",
            maxWidth: "380px",
          }}
        >
          &ldquo;If the past were infinite, you would never have arrived here.&rdquo;
        </p>
        <p
          style={{
            color: "#737373",
            fontSize: "11px",
            fontFamily: "monospace",
            margin: "6px 0 0",
            textShadow: "0 0 10px rgba(0,0,0,0.9)",
          }}
        >
          — Burhan Al-Tatbiq, The Argument from Correspondence
        </p>
      </div>
    </div>
  );
}
