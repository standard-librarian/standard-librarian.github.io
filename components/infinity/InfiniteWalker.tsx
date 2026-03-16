"use client";

import { useEffect, useRef, useState } from "react";

export function InfiniteWalker() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleScroll = () => {
      const rect = el.getBoundingClientRect();
      const viewH = window.innerHeight;
      // 0 when element enters bottom, 1 when it exits top
      const progress = Math.min(1, Math.max(0, 1 - rect.bottom / (viewH + rect.height)));
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Figure walk cycle based on scroll (or auto-animate)
  const [walkPhase, setWalkPhase] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setWalkPhase((p) => (p + 1) % 4);
    }, 200);
    return () => clearInterval(id);
  }, []);

  const figureX = 80 + scrollProgress * 220; // walks from left toward vanishing point
  const figureScale = 1 - scrollProgress * 0.55; // shrinks as it approaches horizon
  const figureY = 148 - scrollProgress * 30; // rises toward horizon

  // Walking leg angles
  const legAngles = [
    [15, -15],
    [5, -5],
    [-15, 15],
    [-5, 5],
  ];
  const [lLeg, rLeg] = legAngles[walkPhase];

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
      <svg
        viewBox="0 0 600 280"
        style={{ width: "100%", height: "100%", display: "block" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1a1a1a" />
            <stop offset="100%" stopColor="#0a0a0a" />
          </linearGradient>
          <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Repeating road dashes */}
          <pattern id="dashPattern" x="0" y="0" width="60" height="10" patternUnits="userSpaceOnUse">
            <rect x="0" y="4" width="35" height="2" fill="#333" />
          </pattern>
        </defs>

        {/* Sky */}
        <rect x="0" y="0" width="600" height="280" fill="#000" />

        {/* Stars */}
        {Array.from({ length: 60 }).map((_, i) => {
          const sx = ((i * 97 + 13) % 580) + 10;
          const sy = ((i * 53 + 7) % 150) + 5;
          const sz = 0.5 + (i % 3) * 0.5;
          return (
            <circle
              key={i}
              cx={sx}
              cy={sy}
              r={sz * 0.7}
              fill="#fff"
              opacity={0.3 + (i % 5) * 0.1}
            />
          );
        })}

        {/* Road surface - perspective trapezoid */}
        <polygon
          points="0,280 600,280 430,165 170,165"
          fill="url(#roadGrad)"
        />

        {/* Road edges */}
        <line x1="0" y1="280" x2="430" y2="165" stroke="#2a2a2a" strokeWidth="1.5" />
        <line x1="600" y1="280" x2="430" y2="165" stroke="#2a2a2a" strokeWidth="1.5" />

        {/* Road center dashes - perspective lines */}
        {Array.from({ length: 10 }).map((_, i) => {
          const t = i / 10;
          const t2 = (i + 0.6) / 10;
          // Lerp between bottom-center and vanishing point
          const x1 = 300 + (300 - 300) * t; // stays center
          const y1 = 280 - t * (280 - 165);
          const x2 = 300;
          const y2 = 280 - t2 * (280 - 165);
          const w = 2 * (1 - t);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#404040"
              strokeWidth={w}
              opacity={0.6}
            />
          );
        })}

        {/* Horizon glow */}
        <ellipse cx="300" cy="165" rx="60" ry="15" fill="url(#glowGrad)" />

        {/* "NOW" marker at vanishing point */}
        <g transform="translate(300, 158)" filter="url(#glow)">
          <rect x="-22" y="-10" width="44" height="18" rx="3" fill="#000" stroke="#f59e0b" strokeWidth="1" opacity="0.9" />
          <text
            x="0"
            y="3"
            textAnchor="middle"
            fill="#f59e0b"
            fontSize="9"
            fontFamily="monospace"
            fontWeight="bold"
            letterSpacing="2"
          >
            NOW
          </text>
        </g>

        {/* Road behind figure - path already walked */}
        <line
          x1="30"
          y1="270"
          x2={figureX - 5}
          y2={figureY + 22 * figureScale}
          stroke="#7c3aed"
          strokeWidth={1.5}
          opacity={0.4}
          strokeDasharray="4 4"
        />

        {/* Walking figure */}
        <g transform={`translate(${figureX}, ${figureY}) scale(${figureScale})`}>
          {/* Body */}
          <line x1="0" y1="-18" x2="0" y2="0" stroke="#f5f5f5" strokeWidth="2.5" strokeLinecap="round" />
          {/* Head */}
          <circle cx="0" cy="-23" r="5" fill="none" stroke="#f5f5f5" strokeWidth="2" />
          {/* Arms */}
          <line
            x1="0"
            y1="-14"
            x2={-10 + Math.sin((walkPhase * Math.PI) / 2) * 4}
            y2="-6"
            stroke="#f5f5f5"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="0"
            y1="-14"
            x2={10 - Math.sin((walkPhase * Math.PI) / 2) * 4}
            y2="-6"
            stroke="#f5f5f5"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Left leg */}
          <line
            x1="0"
            y1="0"
            x2={-6 + Math.sin(((lLeg * Math.PI) / 180) * 8)}
            y2={14}
            stroke="#f5f5f5"
            strokeWidth="2"
            strokeLinecap="round"
            transform={`rotate(${lLeg}, 0, 0)`}
          />
          {/* Right leg */}
          <line
            x1="0"
            y1="0"
            x2={6 + Math.sin(((rLeg * Math.PI) / 180) * 8)}
            y2={14}
            stroke="#f5f5f5"
            strokeWidth="2"
            strokeLinecap="round"
            transform={`rotate(${rLeg}, 0, 0)`}
          />

          {/* Glow aura */}
          <circle cx="0" cy="-10" r="18" fill="#7c3aed" opacity="0.08" />
        </g>

        {/* "∞" symbols along the road behind */}
        {[60, 110, 155].map((x, i) => {
          const t = (x - 30) / 270;
          const y = 275 - t * (275 - figureY - 10 * figureScale);
          const sz = 14 - t * 8;
          return (
            <text
              key={i}
              x={x}
              y={y}
              fill="#7c3aed"
              fontSize={sz}
              fontFamily="monospace"
              opacity={0.25 + i * 0.08}
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
          top: "20px",
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
            lineHeight: "1.5",
            margin: 0,
            textShadow: "0 0 20px rgba(0,0,0,0.8)",
            maxWidth: "400px",
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
          }}
        >
          — Burhan Al-Tatbiq, The Argument from Correspondence
        </p>
      </div>
    </div>
  );
}
