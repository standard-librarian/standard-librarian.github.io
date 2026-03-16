#!/usr/bin/env node
/**
 * Seed script for the infinity widgets.
 * Usage: node scripts/seed-infinity-widgets.mjs
 * Requires TURSO_DATABASE_URL (and optionally TURSO_AUTH_TOKEN) in .env.local
 */

import { createClient } from "@libsql/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// Load .env.local
try {
  const envPath = resolve(ROOT, ".env.local");
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
} catch {
  console.warn("No .env.local found — relying on environment variables.");
}

const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_DATABASE_URL) {
  console.error("Error: TURSO_DATABASE_URL is not set.");
  process.exit(1);
}

const db = createClient({
  url: TURSO_DATABASE_URL,
  authToken: TURSO_AUTH_TOKEN,
});

// ---------------------------------------------------------------------------
// SVG content
// ---------------------------------------------------------------------------

const walkerSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 260" width="100%" height="100%" style="display:block">
<defs>
  <radialGradient id="vpGlow" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="#a855f7" stop-opacity="0.5"/>
    <stop offset="100%" stop-color="#a855f7" stop-opacity="0"/>
  </radialGradient>
  <filter id="glow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <style>
    @keyframes dashFlow { to { stroke-dashoffset: -48; } }
    @keyframes nowPulse { 0%,100%{opacity:.6}50%{opacity:1} }
    @keyframes trailFade { 0%,100%{opacity:.8}50%{opacity:.4} }
    .road-dash { animation: dashFlow 1.4s linear infinite; }
    .now-text { animation: nowPulse 2s ease-in-out infinite; }
    .trail { animation: trailFade 3s ease-in-out infinite; }
  </style>
</defs>
<rect width="640" height="260" fill="#000"/>
<!-- Road edges converging to vanishing point (320,120) -->
<line x1="0" y1="260" x2="320" y2="120" stroke="#1f2937" stroke-width="1.5"/>
<line x1="640" y1="260" x2="320" y2="120" stroke="#1f2937" stroke-width="1.5"/>
<line x1="100" y1="260" x2="320" y2="120" stroke="#111827" stroke-width="1"/>
<line x1="540" y1="260" x2="320" y2="120" stroke="#111827" stroke-width="1"/>
<!-- Center dashes flowing toward vanishing point -->
<line class="road-dash" x1="320" y1="260" x2="320" y2="120" stroke="#374151" stroke-width="1.5" stroke-dasharray="18 30"/>
<!-- Vanishing point glow -->
<circle cx="320" cy="120" r="70" fill="url(#vpGlow)"/>
<!-- NOW marker -->
<text class="now-text" filter="url(#glow)" x="320" y="114" text-anchor="middle" fill="#a855f7" font-size="10" font-family="monospace" font-weight="bold" letter-spacing="4">NOW</text>
<!-- Trail behind walker -->
<circle class="trail" cx="285" cy="215" r="3.5" fill="#7c3aed" opacity=".7"/>
<circle class="trail" cx="256" cy="228" r="2.5" fill="#7c3aed" opacity=".45" style="animation-delay:.4s"/>
<circle class="trail" cx="228" cy="240" r="2" fill="#7c3aed" opacity=".25" style="animation-delay:.8s"/>
<circle class="trail" cx="200" cy="251" r="1.5" fill="#7c3aed" opacity=".12" style="animation-delay:1.2s"/>
<!-- Walker figure -->
<circle cx="320" cy="193" r="9" fill="#e5e7eb"/>
<line x1="320" y1="202" x2="320" y2="228" stroke="#e5e7eb" stroke-width="2.5"/>
<line x1="320" y1="214" x2="307" y2="225" stroke="#e5e7eb" stroke-width="2"/>
<line x1="320" y1="214" x2="333" y2="225" stroke="#e5e7eb" stroke-width="2"/>
<line x1="320" y1="228" x2="311" y2="244" stroke="#e5e7eb" stroke-width="2"/>
<line x1="320" y1="228" x2="329" y2="244" stroke="#e5e7eb" stroke-width="2"/>
<!-- Infinite symbols fading in distance -->
<text x="320" y="148" text-anchor="middle" fill="#374151" font-size="10" font-family="monospace" opacity=".5">∞</text>
<text x="320" y="165" text-anchor="middle" fill="#374151" font-size="10" font-family="monospace" opacity=".3">∞</text>
<text x="320" y="180" text-anchor="middle" fill="#374151" font-size="10" font-family="monospace" opacity=".15">∞</text>
</svg>`;

const tatbiqContainmentSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 190" width="100%" height="100%" style="display:block">
<defs>
  <radialGradient id="cPurple" cx="38%" cy="32%" r="65%"><stop offset="0%" stop-color="#c084fc"/><stop offset="100%" stop-color="#6d28d9"/></radialGradient>
  <radialGradient id="cCyan" cx="38%" cy="32%" r="65%"><stop offset="0%" stop-color="#67e8f9"/><stop offset="100%" stop-color="#0e7490"/></radialGradient>
  <radialGradient id="cRed" cx="38%" cy="32%" r="65%"><stop offset="0%" stop-color="#fca5a5"/><stop offset="100%" stop-color="#b91c1c"/></radialGradient>
  <filter id="glowR"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="glowP"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <style>@keyframes orphanPulse{0%,100%{opacity:.8}50%{opacity:1}}.orphan{animation:orphanPulse 1.5s ease-in-out infinite}</style>
</defs>
<rect width="600" height="190" fill="#000" rx="4"/>
<!-- Row labels -->
<text x="10" y="58" fill="#a78bfa" font-size="12" font-family="monospace" font-weight="bold">A:</text>
<text x="10" y="118" fill="#67e8f9" font-size="12" font-family="monospace" font-weight="bold">B:</text>
<!-- Row A spheres - 8 spheres at x=40,107,174,241,308,375,442,509 -->
<!-- Sphere 1 (orphan, red) -->
<g class="orphan" filter="url(#glowR)"><circle cx="40" cy="52" r="20" fill="url(#cRed)"/><text x="40" y="57" text-anchor="middle" fill="white" font-size="12" font-family="monospace" font-weight="bold">1</text></g>
<!-- Spheres 2-8 (purple) -->
<g filter="url(#glowP)">
<circle cx="107" cy="52" r="20" fill="url(#cPurple)"/><text x="107" y="57" text-anchor="middle" fill="white" font-size="12" font-family="monospace" font-weight="bold">2</text>
<circle cx="174" cy="52" r="20" fill="url(#cPurple)"/><text x="174" y="57" text-anchor="middle" fill="white" font-size="12" font-family="monospace" font-weight="bold">3</text>
<circle cx="241" cy="52" r="20" fill="url(#cPurple)"/><text x="241" y="57" text-anchor="middle" fill="white" font-size="12" font-family="monospace" font-weight="bold">4</text>
<circle cx="308" cy="52" r="20" fill="url(#cPurple)"/><text x="308" y="57" text-anchor="middle" fill="white" font-size="12" font-family="monospace" font-weight="bold">5</text>
<circle cx="375" cy="52" r="20" fill="url(#cPurple)"/><text x="375" y="57" text-anchor="middle" fill="white" font-size="12" font-family="monospace" font-weight="bold">6</text>
<circle cx="442" cy="52" r="20" fill="url(#cPurple)"/><text x="442" y="57" text-anchor="middle" fill="white" font-size="12" font-family="monospace" font-weight="bold">7</text>
<circle cx="509" cy="52" r="20" fill="url(#cPurple)"/><text x="509" y="57" text-anchor="middle" fill="white" font-size="12" font-family="monospace" font-weight="bold">8</text>
</g>
<!-- Infinity indicator -->
<text x="548" y="57" fill="#4b5563" font-size="18" font-family="monospace">→∞</text>
<text x="548" y="117" fill="#4b5563" font-size="18" font-family="monospace">→∞</text>
<!-- Row B - gap at x=40, spheres 2-8 at x=107..509 -->
<circle cx="40" cy="112" r="20" fill="none" stroke="#374151" stroke-dasharray="5 4" stroke-width="1.5"/>
<text x="40" y="117" text-anchor="middle" fill="#4b5563" font-size="14" font-family="monospace">∅</text>
<g filter="url(#glowP)">
<circle cx="107" cy="112" r="20" fill="url(#cCyan)"/><text x="107" y="117" text-anchor="middle" fill="white" font-size="12" font-family="monospace" font-weight="bold">2</text>
<circle cx="174" cy="112" r="20" fill="url(#cCyan)"/><text x="174" y="117" text-anchor="middle" fill="white" font-size="12" font-family="monospace" font-weight="bold">3</text>
<circle cx="241" cy="112" r="20" fill="url(#cCyan)"/><text x="241" y="117" text-anchor="middle" fill="white" font-size="12" font-family="monospace" font-weight="bold">4</text>
<circle cx="308" cy="112" r="20" fill="url(#cCyan)"/><text x="308" y="117" text-anchor="middle" fill="white" font-size="12" font-family="monospace" font-weight="bold">5</text>
<circle cx="375" cy="112" r="20" fill="url(#cCyan)"/><text x="375" y="117" text-anchor="middle" fill="white" font-size="12" font-family="monospace" font-weight="bold">6</text>
<circle cx="442" cy="112" r="20" fill="url(#cCyan)"/><text x="442" y="117" text-anchor="middle" fill="white" font-size="12" font-family="monospace" font-weight="bold">7</text>
<circle cx="509" cy="112" r="20" fill="url(#cCyan)"/><text x="509" y="117" text-anchor="middle" fill="white" font-size="12" font-family="monospace" font-weight="bold">8</text>
</g>
<!-- Bottom label -->
<rect x="20" y="145" width="560" height="32" rx="5" fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.2)" stroke-width="1"/>
<text x="300" y="166" text-anchor="middle" fill="#f87171" font-size="12" font-family="monospace">1 ∈ A,  but  1 ∉ B  →  B ⊂ A strictly  →  |A| &gt; |B|</text>
</svg>`;

const tatbiqBijectionSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 190" width="100%" height="100%" style="display:block">
<defs>
  <radialGradient id="bPurple" cx="38%" cy="32%" r="65%"><stop offset="0%" stop-color="#c084fc"/><stop offset="100%" stop-color="#6d28d9"/></radialGradient>
  <radialGradient id="bCyan" cx="38%" cy="32%" r="65%"><stop offset="0%" stop-color="#67e8f9"/><stop offset="100%" stop-color="#0e7490"/></radialGradient>
  <filter id="bGlow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <style>@keyframes threadPulse{0%,100%{opacity:.4}50%{opacity:.9}}.thread{animation:threadPulse 2s ease-in-out infinite}</style>
</defs>
<rect width="600" height="190" fill="#000" rx="4"/>
<text x="10" y="58" fill="#a78bfa" font-size="12" font-family="monospace" font-weight="bold">A:</text>
<text x="10" y="118" fill="#67e8f9" font-size="12" font-family="monospace" font-weight="bold">B:</text>
<!-- Dashed connecting lines (amber) -->
<g class="thread" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4 4" fill="none">
<line x1="40" y1="72" x2="40" y2="92"/>
<line x1="107" y1="72" x2="107" y2="92"/>
<line x1="174" y1="72" x2="174" y2="92"/>
<line x1="241" y1="72" x2="241" y2="92"/>
<line x1="308" y1="72" x2="308" y2="92"/>
<line x1="375" y1="72" x2="375" y2="92"/>
<line x1="442" y1="72" x2="442" y2="92"/>
<line x1="509" y1="72" x2="509" y2="92"/>
</g>
<!-- Row A (all purple, 1-8) -->
<g filter="url(#bGlow)">
<circle cx="40" cy="52" r="20" fill="url(#bPurple)"/><text x="40" y="57" text-anchor="middle" fill="white" font-size="12" font-family="monospace" font-weight="bold">1</text>
<circle cx="107" cy="52" r="20" fill="url(#bPurple)"/><text x="107" y="57" text-anchor="middle" fill="white" font-size="12" font-family="monospace" font-weight="bold">2</text>
<circle cx="174" cy="52" r="20" fill="url(#bPurple)"/><text x="174" y="57" text-anchor="middle" fill="white" font-size="12" font-family="monospace" font-weight="bold">3</text>
<circle cx="241" cy="52" r="20" fill="url(#bPurple)"/><text x="241" y="57" text-anchor="middle" fill="white" font-size="12" font-family="monospace" font-weight="bold">4</text>
<circle cx="308" cy="52" r="20" fill="url(#bPurple)"/><text x="308" y="57" text-anchor="middle" fill="white" font-size="12" font-family="monospace" font-weight="bold">5</text>
<circle cx="375" cy="52" r="20" fill="url(#bPurple)"/><text x="375" y="57" text-anchor="middle" fill="white" font-size="12" font-family="monospace" font-weight="bold">6</text>
<circle cx="442" cy="52" r="20" fill="url(#bPurple)"/><text x="442" y="57" text-anchor="middle" fill="white" font-size="12" font-family="monospace" font-weight="bold">7</text>
<circle cx="509" cy="52" r="20" fill="url(#bPurple)"/><text x="509" y="57" text-anchor="middle" fill="white" font-size="12" font-family="monospace" font-weight="bold">8</text>
</g>
<!-- Row B aligned to A (2-9) at same x positions -->
<g filter="url(#bGlow)">
<circle cx="40" cy="112" r="20" fill="url(#bCyan)"/><text x="40" y="117" text-anchor="middle" fill="white" font-size="12" font-family="monospace" font-weight="bold">2</text>
<circle cx="107" cy="112" r="20" fill="url(#bCyan)"/><text x="107" y="117" text-anchor="middle" fill="white" font-size="12" font-family="monospace" font-weight="bold">3</text>
<circle cx="174" cy="112" r="20" fill="url(#bCyan)"/><text x="174" y="117" text-anchor="middle" fill="white" font-size="12" font-family="monospace" font-weight="bold">4</text>
<circle cx="241" cy="112" r="20" fill="url(#bCyan)"/><text x="241" y="117" text-anchor="middle" fill="white" font-size="12" font-family="monospace" font-weight="bold">5</text>
<circle cx="308" cy="112" r="20" fill="url(#bCyan)"/><text x="308" y="117" text-anchor="middle" fill="white" font-size="12" font-family="monospace" font-weight="bold">6</text>
<circle cx="375" cy="112" r="20" fill="url(#bCyan)"/><text x="375" y="117" text-anchor="middle" fill="white" font-size="12" font-family="monospace" font-weight="bold">7</text>
<circle cx="442" cy="112" r="20" fill="url(#bCyan)"/><text x="442" y="117" text-anchor="middle" fill="white" font-size="12" font-family="monospace" font-weight="bold">8</text>
<circle cx="509" cy="112" r="20" fill="url(#bCyan)"/><text x="509" y="117" text-anchor="middle" fill="white" font-size="12" font-family="monospace" font-weight="bold">9</text>
</g>
<text x="548" y="57" fill="#4b5563" font-size="18" font-family="monospace">→∞</text>
<text x="548" y="117" fill="#4b5563" font-size="18" font-family="monospace">→∞</text>
<!-- f(n) = n+1 label -->
<rect x="20" y="145" width="560" height="32" rx="5" fill="rgba(52,211,153,0.08)" stroke="rgba(52,211,153,0.2)" stroke-width="1"/>
<text x="300" y="166" text-anchor="middle" fill="#34d399" font-size="12" font-family="monospace">f(n) = n+1 is a bijection  →  every element has a partner  →  |A| = |B|</text>
</svg>`;

const tatbiqContradictionSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 190" width="100%" height="100%" style="display:block">
<defs>
  <filter id="xGlow"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <style>@keyframes contraFlash{0%,100%{opacity:.9;transform:scale(1)}50%{opacity:1;transform:scale(1.04)}}.contra{animation:contraFlash 2s ease-in-out infinite;transform-origin:300px 95px}</style>
</defs>
<rect width="600" height="190" fill="#000" rx="4"/>
<!-- Top: containment claim -->
<rect x="60" y="18" width="480" height="32" rx="5" fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.25)" stroke-width="1"/>
<text x="300" y="39" text-anchor="middle" fill="#f87171" font-size="12" font-family="monospace">B ⊂ A strictly  (1 has no partner)  →  |A| &gt; |B|</text>
<!-- Contradiction label -->
<g class="contra" filter="url(#xGlow)">
  <text x="300" y="105" text-anchor="middle" fill="#f59e0b" font-size="26" font-family="monospace" font-weight="bold" letter-spacing="6">⚡ CONTRADICTION</text>
</g>
<!-- Bottom: bijection claim -->
<rect x="60" y="140" width="480" height="32" rx="5" fill="rgba(52,211,153,0.1)" stroke="rgba(52,211,153,0.25)" stroke-width="1"/>
<text x="300" y="161" text-anchor="middle" fill="#34d399" font-size="12" font-family="monospace">f(n) = n+1 is a valid bijection  →  |A| = |B|</text>
<!-- Explanation -->
<text x="300" y="75" text-anchor="middle" fill="#737373" font-size="11" font-family="system-ui,sans-serif">Both follow logically from assuming A and B are actual infinite sets.</text>
</svg>`;

const cantorSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 580 260" width="100%" height="100%" style="display:block">
<defs>
  <style>
    /* Base cells */
    @keyframes cellBase{0%{fill:#111827}25%{fill:#1e293b}50%{fill:#1e293b}75%{fill:#1e293b}100%{fill:rgba(30,41,59,.15)}}
    /* Diagonal cells */
    @keyframes cellDiag{0%{fill:#111827}24.9%{fill:#111827}25%{fill:#1e293b}49.9%{fill:#1e293b}50%{fill:#f59e0b}74.9%{fill:#f59e0b}75%{fill:#7c3aed}100%{fill:rgba(124,58,237,.15)}}
    /* New number row */
    @keyframes cellNew{0%{fill:#111827;opacity:0}74.9%{fill:#111827;opacity:0}75%{fill:#10b981;opacity:1}100%{fill:rgba(16,185,129,.15);opacity:1}}
    /* Premise row (row 0) */
    @keyframes cellPremise{0%{fill:#111827}99.9%{fill:#1e293b}100%{fill:#ef4444}}
    /* Premise pulse */
    @keyframes premisePulse{0%,100%{opacity:.7}50%{opacity:1}}
    /* Step indicator dots */
    @keyframes dotActive{0%,100%{fill:#4b5563}50%{fill:#a855f7}}
    /* Labels appear at step 1+ */
    @keyframes labelAppear{0%{opacity:0}24.9%{opacity:0}25%{opacity:.7}100%{opacity:.7}}

    .cell-base { animation: cellBase 4s step-start; animation-play-state: paused; animation-fill-mode: both; animation-delay: calc(var(--anim-frame, 0) * -1s); }
    .cell-diag { animation: cellDiag 4s step-start; animation-play-state: paused; animation-fill-mode: both; animation-delay: calc(var(--anim-frame, 0) * -1s); }
    .cell-new  { animation: cellNew  4s step-start; animation-play-state: paused; animation-fill-mode: both; animation-delay: calc(var(--anim-frame, 0) * -1s); }
    .cell-prem { animation: cellPremise 4s step-start; animation-play-state: paused; animation-fill-mode: both; animation-delay: calc(var(--anim-frame, 0) * -1s); }
    .label-row { animation: labelAppear 4s step-start; animation-play-state: paused; animation-fill-mode: both; animation-delay: calc(var(--anim-frame, 0) * -1s); }
  </style>
</defs>
<rect width="580" height="260" fill="#000" rx="4"/>
<!-- Row labels (r1..r8) appear at step 1+ -->
<text class="label-row" x="30" y="44" text-anchor="middle" fill="#a78bfa" font-size="10" font-family="monospace">r₁</text>
<text class="label-row" x="30" y="74" text-anchor="middle" fill="#a78bfa" font-size="10" font-family="monospace">r₂</text>
<text class="label-row" x="30" y="104" text-anchor="middle" fill="#a78bfa" font-size="10" font-family="monospace">r₃</text>
<text class="label-row" x="30" y="134" text-anchor="middle" fill="#a78bfa" font-size="10" font-family="monospace">r₄</text>
<text class="label-row" x="30" y="164" text-anchor="middle" fill="#a78bfa" font-size="10" font-family="monospace">r₅</text>
<text class="label-row" x="30" y="194" text-anchor="middle" fill="#a78bfa" font-size="10" font-family="monospace">r₆</text>
<!-- Column labels d₁..d₈ -->
<text class="label-row" x="68" y="17" text-anchor="middle" fill="#67e8f9" font-size="9" font-family="monospace">d₁</text>
<text class="label-row" x="118" y="17" text-anchor="middle" fill="#67e8f9" font-size="9" font-family="monospace">d₂</text>
<text class="label-row" x="168" y="17" text-anchor="middle" fill="#67e8f9" font-size="9" font-family="monospace">d₃</text>
<text class="label-row" x="218" y="17" text-anchor="middle" fill="#67e8f9" font-size="9" font-family="monospace">d₄</text>
<text class="label-row" x="268" y="17" text-anchor="middle" fill="#67e8f9" font-size="9" font-family="monospace">d₅</text>
<text class="label-row" x="318" y="17" text-anchor="middle" fill="#67e8f9" font-size="9" font-family="monospace">d₆</text>
<!-- Grid: 6 rows × 6 cols, cells 44px wide × 28px tall, starting x=46, y=22 -->
<!-- Row 0 (r₁) - premise row (will turn red at step 4) -->
<rect class="cell-prem" x="47" y="23" width="42" height="26" rx="2"/><rect class="cell-base" x="99" y="23" width="42" height="26" rx="2"/><rect class="cell-base" x="151" y="23" width="42" height="26" rx="2"/><rect class="cell-base" x="203" y="23" width="42" height="26" rx="2"/><rect class="cell-base" x="255" y="23" width="42" height="26" rx="2"/><rect class="cell-base" x="307" y="23" width="42" height="26" rx="2"/>
<!-- Row 1 (r₂) - has diagonal at col 1 -->
<rect class="cell-base" x="47" y="55" width="42" height="26" rx="2"/><rect class="cell-diag" x="99" y="55" width="42" height="26" rx="2"/><rect class="cell-base" x="151" y="55" width="42" height="26" rx="2"/><rect class="cell-base" x="203" y="55" width="42" height="26" rx="2"/><rect class="cell-base" x="255" y="55" width="42" height="26" rx="2"/><rect class="cell-base" x="307" y="55" width="42" height="26" rx="2"/>
<!-- Row 2 (r₃) - diagonal at col 2 -->
<rect class="cell-base" x="47" y="87" width="42" height="26" rx="2"/><rect class="cell-base" x="99" y="87" width="42" height="26" rx="2"/><rect class="cell-diag" x="151" y="87" width="42" height="26" rx="2"/><rect class="cell-base" x="203" y="87" width="42" height="26" rx="2"/><rect class="cell-base" x="255" y="87" width="42" height="26" rx="2"/><rect class="cell-base" x="307" y="87" width="42" height="26" rx="2"/>
<!-- Row 3 (r₄) - diagonal at col 3 -->
<rect class="cell-base" x="47" y="119" width="42" height="26" rx="2"/><rect class="cell-base" x="99" y="119" width="42" height="26" rx="2"/><rect class="cell-base" x="151" y="119" width="42" height="26" rx="2"/><rect class="cell-diag" x="203" y="119" width="42" height="26" rx="2"/><rect class="cell-base" x="255" y="119" width="42" height="26" rx="2"/><rect class="cell-base" x="307" y="119" width="42" height="26" rx="2"/>
<!-- Row 4 (r₅) - diagonal at col 4 -->
<rect class="cell-base" x="47" y="151" width="42" height="26" rx="2"/><rect class="cell-base" x="99" y="151" width="42" height="26" rx="2"/><rect class="cell-base" x="151" y="151" width="42" height="26" rx="2"/><rect class="cell-base" x="203" y="151" width="42" height="26" rx="2"/><rect class="cell-diag" x="255" y="151" width="42" height="26" rx="2"/><rect class="cell-base" x="307" y="151" width="42" height="26" rx="2"/>
<!-- Row 5 (r₆) - diagonal at col 5 -->
<rect class="cell-base" x="47" y="183" width="42" height="26" rx="2"/><rect class="cell-base" x="99" y="183" width="42" height="26" rx="2"/><rect class="cell-base" x="151" y="183" width="42" height="26" rx="2"/><rect class="cell-base" x="203" y="183" width="42" height="26" rx="2"/><rect class="cell-base" x="255" y="183" width="42" height="26" rx="2"/><rect class="cell-diag" x="307" y="183" width="42" height="26" rx="2"/>
<!-- New number row (appears at step 3) -->
<rect class="cell-new" x="47" y="218" width="42" height="26" rx="2"/><rect class="cell-new" x="99" y="218" width="42" height="26" rx="2"/><rect class="cell-new" x="151" y="218" width="42" height="26" rx="2"/><rect class="cell-new" x="203" y="218" width="42" height="26" rx="2"/><rect class="cell-new" x="255" y="218" width="42" height="26" rx="2"/><rect class="cell-new" x="307" y="218" width="42" height="26" rx="2"/>
<!-- New number label -->
<text class="cell-new" x="360" y="235" fill="#10b981" font-size="10" font-family="monospace">← new number</text>
<!-- Side label: "..." to indicate continuation -->
<text x="365" y="44" fill="#4b5563" font-size="12" font-family="monospace">...</text>
<text x="365" y="74" fill="#4b5563" font-size="12" font-family="monospace">...</text>
<text x="365" y="104" fill="#4b5563" font-size="12" font-family="monospace">...</text>
<text x="365" y="134" fill="#4b5563" font-size="12" font-family="monospace">...</text>
<text x="365" y="164" fill="#4b5563" font-size="12" font-family="monospace">...</text>
<text x="365" y="194" fill="#4b5563" font-size="12" font-family="monospace">...</text>
</svg>`;

const hotelSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 280" width="100%" height="100%" style="display:block">
<defs>
  <linearGradient id="floorGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#0f172a"/><stop offset="100%" stop-color="#000"/></linearGradient>
  <filter id="roomGlow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <style>
    @keyframes roomPulse0 {0%{opacity:.4}50%{opacity:.9}100%{opacity:.4}}
    @keyframes roomPulse1 {0%{opacity:.4}50%{opacity:.9}100%{opacity:.4}}
    /* Wave: each room lights up at a different phase based on --anim-frame */
    .room { fill: #1e40af; transition: fill 0.2s; }
    /* We use animation-delay to create wave effect: room i has delay = i * 0.15s relative to frame */
    .r1 { animation: roomPulse0 4.8s ease-in-out infinite; animation-delay: calc(var(--anim-frame, 0) * -0.08s); }
    .r2 { animation: roomPulse0 4.8s ease-in-out infinite; animation-delay: calc(var(--anim-frame, 0) * -0.08s + 0.4s); }
    .r3 { animation: roomPulse0 4.8s ease-in-out infinite; animation-delay: calc(var(--anim-frame, 0) * -0.08s + 0.8s); }
    .r4 { animation: roomPulse0 4.8s ease-in-out infinite; animation-delay: calc(var(--anim-frame, 0) * -0.08s + 1.2s); }
    .r5 { animation: roomPulse0 4.8s ease-in-out infinite; animation-delay: calc(var(--anim-frame, 0) * -0.08s + 1.6s); }
    .r6 { animation: roomPulse0 4.8s ease-in-out infinite; animation-delay: calc(var(--anim-frame, 0) * -0.08s + 2.0s); }
    .r7 { animation: roomPulse0 4.8s ease-in-out infinite; animation-delay: calc(var(--anim-frame, 0) * -0.08s + 2.4s); }
    .r8 { animation: roomPulse0 4.8s ease-in-out infinite; animation-delay: calc(var(--anim-frame, 0) * -0.08s + 2.8s); }
    .r9 { animation: roomPulse0 4.8s ease-in-out infinite; animation-delay: calc(var(--anim-frame, 0) * -0.08s + 3.2s); }
    .r10 { animation: roomPulse0 4.8s ease-in-out infinite; animation-delay: calc(var(--anim-frame, 0) * -0.08s + 3.6s); }
    .r11 { animation: roomPulse0 4.8s ease-in-out infinite; animation-delay: calc(var(--anim-frame, 0) * -0.08s + 4.0s); }
    .r12 { animation: roomPulse0 4.8s ease-in-out infinite; animation-delay: calc(var(--anim-frame, 0) * -0.08s + 4.4s); }
  </style>
</defs>
<rect width="600" height="280" fill="#000" rx="4"/>
<!-- Floor and ceiling lines converging to vanishing point (300, 140) -->
<line x1="0" y1="280" x2="300" y2="140" stroke="#0f172a" stroke-width="2"/>
<line x1="600" y1="280" x2="300" y2="140" stroke="#0f172a" stroke-width="2"/>
<line x1="0" y1="0" x2="300" y2="140" stroke="#0f172a" stroke-width="2"/>
<line x1="600" y1="0" x2="300" y2="140" stroke="#0f172a" stroke-width="2"/>
<!-- Corridor glow at vanishing point -->
<circle cx="300" cy="140" r="30" fill="rgba(30,64,175,0.2)"/>
<!-- Room panels - left and right walls with perspective scaling -->
<!-- Room 1 (closest, largest) -->
<rect class="r1" filter="url(#roomGlow)" x="30" y="30" width="45" height="220" rx="3"/><text x="52" y="148" text-anchor="middle" fill="white" font-size="10" font-family="monospace" opacity=".6">1</text>
<rect class="r1" filter="url(#roomGlow)" x="525" y="30" width="45" height="220" rx="3"/>
<!-- Room 2 -->
<rect class="r2" filter="url(#roomGlow)" x="82" y="50" width="38" height="180" rx="2"/><text x="101" y="148" text-anchor="middle" fill="white" font-size="9" font-family="monospace" opacity=".6">2</text>
<rect class="r2" filter="url(#roomGlow)" x="480" y="50" width="38" height="180" rx="2"/>
<!-- Room 3 -->
<rect class="r3" filter="url(#roomGlow)" x="127" y="65" width="32" height="150" rx="2"/><text x="143" y="148" text-anchor="middle" fill="white" font-size="9" font-family="monospace" opacity=".6">3</text>
<rect class="r3" filter="url(#roomGlow)" x="441" y="65" width="32" height="150" rx="2"/>
<!-- Room 4 -->
<rect class="r4" filter="url(#roomGlow)" x="166" y="78" width="26" height="124" rx="2"/>
<rect class="r4" filter="url(#roomGlow)" x="408" y="78" width="26" height="124" rx="2"/>
<!-- Room 5 -->
<rect class="r5" filter="url(#roomGlow)" x="199" y="89" width="22" height="102" rx="2"/>
<rect class="r5" filter="url(#roomGlow)" x="379" y="89" width="22" height="102" rx="2"/>
<!-- Room 6 -->
<rect class="r6" filter="url(#roomGlow)" x="227" y="99" width="18" height="82" rx="2"/>
<rect class="r6" filter="url(#roomGlow)" x="355" y="99" width="18" height="82" rx="2"/>
<!-- Room 7 -->
<rect class="r7" filter="url(#roomGlow)" x="250" y="107" width="15" height="66" rx="2"/>
<rect class="r7" filter="url(#roomGlow)" x="335" y="107" width="15" height="66" rx="2"/>
<!-- Rooms 8-12 smaller, fading -->
<rect class="r8" x="270" y="114" width="12" height="52" rx="1" fill="#1e40af" opacity=".7"/>
<rect class="r8" x="318" y="114" width="12" height="52" rx="1" fill="#1e40af" opacity=".7"/>
<rect class="r9" x="284" y="120" width="9" height="40" rx="1" fill="#1e40af" opacity=".5"/>
<rect class="r9" x="307" y="120" width="9" height="40" rx="1" fill="#1e40af" opacity=".5"/>
<rect class="r10" x="291" y="125" width="7" height="30" rx="1" fill="#1e40af" opacity=".35"/>
<rect class="r10" x="302" y="125" width="7" height="30" rx="1" fill="#1e40af" opacity=".35"/>
<rect class="r11" x="295" y="129" width="5" height="22" rx="1" fill="#1e40af" opacity=".2"/>
<rect class="r11" x="300" y="129" width="5" height="22" rx="1" fill="#1e40af" opacity=".2"/>
<!-- "→ ∞" at vanishing point -->
<text x="300" y="155" text-anchor="middle" fill="#374151" font-size="9" font-family="monospace">∞</text>
</svg>`;

const universeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 220" width="100%" height="100%" style="display:block">
<defs>
  <radialGradient id="cosmosGrad" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="#0a0a1a"/>
    <stop offset="100%" stop-color="#000"/>
  </radialGradient>
  <filter id="starGlow"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <style>
    @keyframes twinkle { 0%,100%{opacity:.2}50%{opacity:1} }
    @keyframes twinkle2 { 0%,100%{opacity:.5}50%{opacity:.1} }
    @keyframes twinkle3 { 0%,100%{opacity:.8}50%{opacity:.3} }
    .s1{animation:twinkle 2.1s ease-in-out infinite}
    .s2{animation:twinkle2 3.4s ease-in-out infinite}
    .s3{animation:twinkle3 1.8s ease-in-out infinite}
    .s4{animation:twinkle 4.2s ease-in-out infinite}
    .s5{animation:twinkle2 2.7s ease-in-out infinite}
  </style>
</defs>
<rect width="600" height="220" fill="url(#cosmosGrad)" rx="4"/>
<!-- Stars - distribute them across the SVG with varying sizes/brightness -->
<!-- Bright stars -->
<circle class="s1" filter="url(#starGlow)" cx="45" cy="30" r="2.5" fill="white"/>
<circle class="s2" filter="url(#starGlow)" cx="120" cy="18" r="2" fill="#e0e7ff"/>
<circle class="s3" filter="url(#starGlow)" cx="210" cy="45" r="3" fill="white"/>
<circle class="s1" filter="url(#starGlow)" cx="310" cy="22" r="2.5" fill="#fef3c7"/>
<circle class="s4" filter="url(#starGlow)" cx="420" cy="35" r="2" fill="white"/>
<circle class="s2" filter="url(#starGlow)" cx="520" cy="14" r="3" fill="#e0e7ff"/>
<circle class="s5" filter="url(#starGlow)" cx="570" cy="55" r="2" fill="white"/>
<circle class="s3" filter="url(#starGlow)" cx="80" cy="80" r="2.5" fill="#fef3c7"/>
<circle class="s1" filter="url(#starGlow)" cx="175" cy="100" r="2" fill="white"/>
<circle class="s4" filter="url(#starGlow)" cx="350" cy="75" r="3" fill="white"/>
<circle class="s2" filter="url(#starGlow)" cx="460" cy="90" r="2" fill="#e0e7ff"/>
<circle class="s5" filter="url(#starGlow)" cx="545" cy="110" r="2.5" fill="white"/>
<circle class="s3" filter="url(#starGlow)" cx="30" cy="140" r="2" fill="white"/>
<circle class="s1" filter="url(#starGlow)" cx="140" cy="155" r="3" fill="#fef3c7"/>
<circle class="s4" filter="url(#starGlow)" cx="260" cy="130" r="2" fill="white"/>
<circle class="s2" filter="url(#starGlow)" cx="390" cy="150" r="2.5" fill="#e0e7ff"/>
<circle class="s3" filter="url(#starGlow)" cx="480" cy="140" r="2" fill="white"/>
<circle class="s5" filter="url(#starGlow)" cx="560" cy="165" r="3" fill="white"/>
<!-- Smaller/dimmer stars - many of them -->
<circle class="s2" cx="65" cy="55" r="1" fill="#9ca3af"/><circle class="s4" cx="95" cy="30" r="1" fill="#9ca3af"/>
<circle class="s1" cx="155" cy="65" r="1" fill="#9ca3af"/><circle class="s3" cx="190" cy="20" r="1.5" fill="#9ca3af"/>
<circle class="s5" cx="240" cy="80" r="1" fill="#9ca3af"/><circle class="s2" cx="280" cy="50" r="1" fill="#9ca3af"/>
<circle class="s4" cx="330" cy="105" r="1.5" fill="#9ca3af"/><circle class="s1" cx="370" cy="30" r="1" fill="#9ca3af"/>
<circle class="s3" cx="400" cy="60" r="1" fill="#9ca3af"/><circle class="s5" cx="445" cy="115" r="1" fill="#9ca3af"/>
<circle class="s2" cx="495" cy="45" r="1.5" fill="#9ca3af"/><circle class="s4" cx="530" cy="80" r="1" fill="#9ca3af"/>
<circle class="s1" cx="50" cy="120" r="1" fill="#9ca3af"/><circle class="s3" cx="105" cy="105" r="1" fill="#9ca3af"/>
<circle class="s5" cx="220" cy="165" r="1" fill="#9ca3af"/><circle class="s2" cx="300" cy="160" r="1.5" fill="#9ca3af"/>
<circle class="s4" cx="430" cy="175" r="1" fill="#9ca3af"/><circle class="s1" cx="510" cy="195" r="1" fill="#9ca3af"/>
<!-- Very faint background stars -->
<circle cx="75" cy="170" r=".7" fill="#6b7280" opacity=".5"/><circle cx="160" cy="185" r=".7" fill="#6b7280" opacity=".5"/>
<circle cx="230" cy="195" r=".7" fill="#6b7280" opacity=".5"/><circle cx="320" cy="180" r=".7" fill="#6b7280" opacity=".4"/>
<circle cx="410" cy="200" r=".7" fill="#6b7280" opacity=".5"/><circle cx="490" cy="170" r=".7" fill="#6b7280" opacity=".4"/>
<circle cx="555" cy="190" r=".7" fill="#6b7280" opacity=".5"/>
<!-- Central text -->
<text x="300" y="115" text-anchor="middle" fill="rgba(255,255,255,0.08)" font-size="72" font-family="monospace" font-weight="bold">∞</text>
<!-- Finite label -->
<rect x="200" y="185" width="200" height="24" rx="4" fill="rgba(139,92,246,0.1)" stroke="rgba(139,92,246,0.2)" stroke-width="1"/>
<text x="300" y="201" text-anchor="middle" fill="#a78bfa" font-size="11" font-family="monospace">Observable universe: finite</text>
</svg>`;

// ---------------------------------------------------------------------------
// Widget definitions
// ---------------------------------------------------------------------------

const widgets = [
  // Widget 1: infinity-walker
  {
    id: "infinity-walker",
    name: "The Infinite Path",
    description: "",
    definition: {
      name: "The Infinite Path",
      state: [],
      actions: [],
      blocks: [
        {
          id: "svg",
          type: "svg-block",
          props: {
            width: "100%",
            height: "280px",
            svgContent: walkerSvg,
          },
        },
        {
          id: "caption",
          type: "text",
          props: {
            content:
              "If the past were actually infinite, you would never have arrived at this moment.",
          },
        },
      ],
    },
  },

  // Widget 2: infinity-tatbiq
  {
    id: "infinity-tatbiq",
    name: "Burhan Al-Tatbiq",
    description: "",
    definition: {
      name: "Burhan Al-Tatbiq",
      state: [
        { name: "vC", type: "boolean", initial: true },
        { name: "vB", type: "boolean", initial: false },
        { name: "vX", type: "boolean", initial: false },
        { name: "showNote", type: "boolean", initial: false },
      ],
      actions: [
        {
          name: "showC",
          steps: [
            { type: "set", target: "vC", value: true },
            { type: "set", target: "vB", value: false },
            { type: "set", target: "vX", value: false },
          ],
        },
        {
          name: "showB",
          steps: [
            { type: "set", target: "vC", value: false },
            { type: "set", target: "vB", value: true },
            { type: "set", target: "vX", value: false },
          ],
        },
        {
          name: "showX",
          steps: [
            { type: "set", target: "vC", value: false },
            { type: "set", target: "vB", value: false },
            { type: "set", target: "vX", value: true },
          ],
        },
        {
          name: "toggleNote",
          steps: [{ type: "toggle", target: "showNote" }],
        },
      ],
      blocks: [
        {
          id: "view-buttons",
          type: "row",
          props: {},
          children: [
            {
              id: "btn-c",
              type: "button",
              props: { label: "Containment View", action: "showC" },
            },
            {
              id: "btn-b",
              type: "button",
              props: { label: "Bijection View", action: "showB" },
            },
            {
              id: "btn-x",
              type: "button",
              props: { label: "Contradiction", action: "showX" },
            },
          ],
        },
        {
          id: "svg-containment",
          type: "svg-block",
          visibleWhen: "vC",
          props: {
            width: "100%",
            height: "190px",
            svgContent: tatbiqContainmentSvg,
          },
        },
        {
          id: "svg-bijection",
          type: "svg-block",
          visibleWhen: "vB",
          props: {
            width: "100%",
            height: "190px",
            svgContent: tatbiqBijectionSvg,
          },
        },
        {
          id: "svg-contradiction",
          type: "svg-block",
          visibleWhen: "vX",
          props: {
            width: "100%",
            height: "190px",
            svgContent: tatbiqContradictionSvg,
          },
        },
        {
          id: "divider-1",
          type: "divider",
          props: {},
        },
        {
          id: "btn-note",
          type: "button",
          props: { label: "Show Cantor's Resolution", action: "toggleNote" },
        },
        {
          id: "cantor-note",
          type: "panel",
          visibleWhen: "showNote",
          props: { collapsible: false },
          children: [
            {
              id: "note-text-1",
              type: "text",
              props: {
                content:
                  "Cantor's resolution: two sets have the same cardinality when there exists a bijection between them. Under this definition, the set of natural numbers and the set of natural numbers greater than 1 are the same size — both are countably infinite.",
              },
            },
            {
              id: "note-text-2",
              type: "text",
              props: {
                content:
                  "The Mutakallimun's reply: this definition works as formal mathematics, but it resolves the contradiction only by stipulating that the bijection view is the correct one. The containment view — which says that a proper subset must be smaller — is equally intuitive. Cantor chose a definition; he did not discover a fact about physical infinity.",
              },
            },
          ],
        },
      ],
    },
  },

  // Widget 3: infinity-cantor
  {
    id: "infinity-cantor",
    name: "Cantor's Diagonal",
    description: "",
    definition: {
      name: "Cantor's Diagonal",
      state: [
        { name: "step", type: "number", initial: 0 },
        { name: "s0", type: "boolean", initial: true },
        { name: "s1", type: "boolean", initial: false },
        { name: "s2", type: "boolean", initial: false },
        { name: "s3", type: "boolean", initial: false },
        { name: "s4", type: "boolean", initial: false },
      ],
      actions: [
        {
          name: "next",
          steps: [
            {
              type: "conditional",
              condition: { left: "step", op: "eq", right: 0 },
              then: [
                { type: "set", target: "s0", value: false },
                { type: "set", target: "s1", value: true },
                { type: "increment", target: "step" },
              ],
            },
            {
              type: "conditional",
              condition: { left: "step", op: "eq", right: 1 },
              then: [
                { type: "set", target: "s1", value: false },
                { type: "set", target: "s2", value: true },
                { type: "increment", target: "step" },
              ],
            },
            {
              type: "conditional",
              condition: { left: "step", op: "eq", right: 2 },
              then: [
                { type: "set", target: "s2", value: false },
                { type: "set", target: "s3", value: true },
                { type: "increment", target: "step" },
              ],
            },
            {
              type: "conditional",
              condition: { left: "step", op: "eq", right: 3 },
              then: [
                { type: "set", target: "s3", value: false },
                { type: "set", target: "s4", value: true },
                { type: "increment", target: "step" },
              ],
            },
          ],
        },
        {
          name: "prev",
          steps: [
            {
              type: "conditional",
              condition: { left: "step", op: "eq", right: 4 },
              then: [
                { type: "set", target: "s4", value: false },
                { type: "set", target: "s3", value: true },
                { type: "decrement", target: "step" },
              ],
            },
            {
              type: "conditional",
              condition: { left: "step", op: "eq", right: 3 },
              then: [
                { type: "set", target: "s3", value: false },
                { type: "set", target: "s2", value: true },
                { type: "decrement", target: "step" },
              ],
            },
            {
              type: "conditional",
              condition: { left: "step", op: "eq", right: 2 },
              then: [
                { type: "set", target: "s2", value: false },
                { type: "set", target: "s1", value: true },
                { type: "decrement", target: "step" },
              ],
            },
            {
              type: "conditional",
              condition: { left: "step", op: "eq", right: 1 },
              then: [
                { type: "set", target: "s1", value: false },
                { type: "set", target: "s0", value: true },
                { type: "decrement", target: "step" },
              ],
            },
          ],
        },
      ],
      blocks: [
        {
          id: "cantor-svg",
          type: "svg-block",
          frameState: "step",
          props: {
            width: "100%",
            height: "260px",
            svgContent: cantorSvg,
          },
        },
        {
          id: "nav-row",
          type: "row",
          props: {},
          children: [
            {
              id: "btn-prev",
              type: "button",
              props: { label: "← Prev", action: "prev", disabledWhen: "s0" },
            },
            {
              id: "btn-next",
              type: "button",
              props: { label: "Next →", action: "next", disabledWhen: "s4" },
            },
          ],
        },
        {
          id: "desc-0",
          type: "text",
          visibleWhen: "s0",
          props: {
            content:
              "Step 1 of 5 — Assume ℝ is countable. Imagine a complete list of all real numbers: r₁, r₂, r₃, ...",
          },
        },
        {
          id: "desc-1",
          type: "text",
          visibleWhen: "s1",
          props: {
            content:
              "Step 2 of 5 — Each real number has infinitely many decimal digits. The table shows a few digits of each.",
          },
        },
        {
          id: "desc-2",
          type: "text",
          visibleWhen: "s2",
          props: {
            content:
              "Step 3 of 5 — Take the diagonal: the 1st digit of r₁, the 2nd digit of r₂, the 3rd digit of r₃, and so on.",
          },
        },
        {
          id: "desc-3",
          type: "text",
          visibleWhen: "s3",
          props: {
            content:
              "Step 4 of 5 — Change each diagonal digit. The new number d differs from every rₙ at the nth digit — it cannot be anywhere in the list.",
          },
        },
        {
          id: "desc-4",
          type: "text",
          visibleWhen: "s4",
          props: {
            content:
              "Step 5 of 5 — ⚠ But the proof needed a complete infinite list in Step 1. The diagonal cannot run on a finite or incomplete list. Actual infinity was assumed, not proved.",
          },
        },
      ],
    },
  },

  // Widget 4: infinity-hotel
  {
    id: "infinity-hotel",
    name: "Hilbert's Hotel",
    description: "",
    definition: {
      name: "Hilbert's Hotel",
      state: [
        { name: "frame", type: "number", initial: 0 },
        { name: "mode", type: "number", initial: 0 },
        { name: "counter", type: "string", initial: "∞ rooms, all full" },
      ],
      timer: { intervalMs: 80, action: "tick" },
      actions: [
        {
          name: "tick",
          steps: [
            { type: "increment", target: "frame" },
            { type: "mod", target: "frame", modulus: 60 },
          ],
        },
        {
          name: "newGuest",
          steps: [
            { type: "set", target: "mode", value: 1 },
            { type: "set", target: "counter", value: "∞ + 1 = ∞" },
            {
              type: "delay",
              ms: 2000,
              then: [{ type: "set", target: "mode", value: 0 }],
            },
          ],
        },
        {
          name: "infiniteBus",
          steps: [
            { type: "set", target: "mode", value: 2 },
            { type: "set", target: "counter", value: "∞ + ∞ = ∞" },
            {
              type: "delay",
              ms: 2500,
              then: [{ type: "set", target: "mode", value: 0 }],
            },
          ],
        },
      ],
      blocks: [
        {
          id: "hotel-svg",
          type: "svg-block",
          frameState: "frame",
          props: {
            width: "100%",
            height: "280px",
            svgContent: hotelSvg,
          },
        },
        {
          id: "hotel-stat",
          type: "stat",
          props: { value: "${counter}" },
        },
        {
          id: "hotel-buttons",
          type: "row",
          props: {},
          children: [
            {
              id: "btn-guest",
              type: "button",
              props: { label: "New Guest Arrives", action: "newGuest" },
            },
            {
              id: "btn-bus",
              type: "button",
              props: { label: "Infinite Bus", action: "infiniteBus" },
            },
          ],
        },
      ],
    },
  },

  // Widget 5: infinity-universe
  {
    id: "infinity-universe",
    name: "The Finite Universe",
    description: "",
    definition: {
      name: "The Finite Universe",
      state: [{ name: "count", type: "number", initial: 0 }],
      timer: { intervalMs: 30, action: "tick" },
      actions: [
        {
          name: "tick",
          steps: [
            { type: "increment", target: "count" },
            { type: "clamp", target: "count", min: 0, max: 100 },
          ],
        },
      ],
      blocks: [
        {
          id: "universe-svg",
          type: "svg-block",
          frameState: "count",
          props: {
            width: "100%",
            height: "220px",
            svgContent: universeSvg,
          },
        },
        {
          id: "universe-stat",
          type: "stat",
          props: { label: "${count}% of the observable universe catalogued" },
        },
        {
          id: "universe-progress",
          type: "progress-bar",
          props: {
            value: "${count}",
            max: 100,
            label: "~10⁸⁰ particles — finite and measurable",
          },
        },
        {
          id: "universe-text",
          type: "text",
          props: {
            content:
              "Infinity appears at the edges of equations — which is where models break, not where reality ends.",
          },
        },
      ],
    },
  },
];

// ---------------------------------------------------------------------------
// Schema + seed
// ---------------------------------------------------------------------------

async function run() {
  // Ensure widgets table exists
  await db.execute(`CREATE TABLE IF NOT EXISTS widgets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    definition TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    author TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`);

  for (const widget of widgets) {
    await db.execute({
      sql: `INSERT INTO widgets (id, name, description, definition, author, status)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              name=excluded.name,
              description=excluded.description,
              definition=excluded.definition,
              status=excluded.status,
              updated_at=datetime('now')`,
      args: [
        widget.id,
        widget.name,
        widget.description,
        JSON.stringify(widget.definition),
        "mdht",
        "approved",
      ],
    });
    console.log(`✓ Widget seeded: ${widget.id} (${widget.name})`);
  }

  console.log("\nAll 5 infinity widgets seeded successfully.");
  process.exit(0);
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
