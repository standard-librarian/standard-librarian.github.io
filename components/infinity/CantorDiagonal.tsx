"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type * as THREE from "three";

const GRID = 8;
const CELL_W = 0.9;
const CELL_H = 0.55;
const GAP_X = 1.05;
const GAP_Y = 0.65;

type StepId = 0 | 1 | 2 | 3 | 4;

const STEP_LABELS: Record<StepId, { title: string; body: string }> = {
  0: {
    title: "The Setup",
    body: "Assume ℝ is countable — a complete list of all real numbers exists.",
  },
  1: {
    title: "The List",
    body: "Every real number r₁, r₂, r₃... has an infinite decimal expansion.",
  },
  2: {
    title: "The Diagonal",
    body: "Take the nth digit of the nth number. This is the diagonal.",
  },
  3: {
    title: "The Flip",
    body: "Change each diagonal digit. The new number differs from every rₙ at position n.",
  },
  4: {
    title: "The Hidden Premise",
    body: "But Step 0 assumed the list existed. The proof needs actual infinity to run — it cannot prove it.",
  },
};

export function CantorDiagonal() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<StepId>(0);
  const stepRef = useRef<StepId>(0);
  const sceneRef = useRef<{
    animId: number;
    ro: ResizeObserver;
    updateStep: (s: StepId) => void;
    cleanup: () => void;
  } | null>(null);

  const HEIGHT = 340;

  useEffect(() => {
    if (!mountRef.current) return;
    let cancelled = false;

    async function init() {
      const THREE = await import("three");
      const { EffectComposer } = await import(
        "three/examples/jsm/postprocessing/EffectComposer.js"
      );
      const { RenderPass } = await import(
        "three/examples/jsm/postprocessing/RenderPass.js"
      );
      const { UnrealBloomPass } = await import(
        "three/examples/jsm/postprocessing/UnrealBloomPass.js"
      );

      if (cancelled || !mountRef.current) return;

      const container = mountRef.current;
      const W = container.clientWidth;

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(W, HEIGHT);
      renderer.setClearColor(0x000000, 1);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;
      const canvas = renderer.domElement;
      canvas.style.display = "block";
      canvas.style.width = "100%";
      canvas.style.height = `${HEIGHT}px`;
      container.appendChild(canvas);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);
      scene.rotation.x = -0.2;

      const camera = new THREE.PerspectiveCamera(45, W / HEIGHT, 0.1, 100);
      camera.position.set(3.5, -1.5, 12);
      camera.lookAt(3.5, -1.5, 0);

      const composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      const bloom = new UnrealBloomPass(
        new THREE.Vector2(W, HEIGHT),
        1.2,
        0.5,
        0.05
      );
      composer.addPass(bloom);

      // Cell ShaderMaterial
      const cellVert = /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `;
      const cellFrag = /* glsl */ `
        uniform vec3 cellColor;
        uniform float borderGlow;
        uniform float time;
        uniform float opacity;
        varying vec2 vUv;
        void main() {
          vec2 b = abs(vUv - 0.5) * 2.0;
          float border = max(b.x, b.y);
          float glow = smoothstep(0.85, 1.0, border) * borderGlow;
          vec3 col = mix(cellColor * 0.3, cellColor, glow);
          float a = opacity * (0.6 + glow * 0.4);
          gl_FragColor = vec4(col, a);
        }
      `;

      function makeCell(colorHex: string, visible: boolean): THREE.ShaderMaterial {
        return new THREE.ShaderMaterial({
          uniforms: {
            cellColor: { value: new THREE.Color(colorHex) },
            borderGlow: { value: 1.0 },
            time: { value: 0 },
            opacity: { value: visible ? 1.0 : 0.0 },
          },
          vertexShader: cellVert,
          fragmentShader: cellFrag,
          transparent: true,
          depthWrite: false,
          side: THREE.DoubleSide,
        });
      }

      const cellGeo = new THREE.PlaneGeometry(CELL_W, CELL_H);
      const cells: THREE.Mesh[][] = [];
      const cellMats: THREE.ShaderMaterial[][] = [];

      for (let row = 0; row < GRID; row++) {
        cells[row] = [];
        cellMats[row] = [];
        for (let col = 0; col < GRID; col++) {
          const mat = makeCell("#1e293b", false);
          cellMats[row].push(mat);
          const mesh = new THREE.Mesh(cellGeo, mat);
          mesh.position.set(col * GAP_X, -(row * GAP_Y), 0);
          scene.add(mesh);
          cells[row].push(mesh);
        }
      }

      // New number row
      const newRowCells: THREE.Mesh[] = [];
      const newRowMats: THREE.ShaderMaterial[] = [];
      for (let col = 0; col < GRID; col++) {
        const mat = makeCell("#10b981", false);
        newRowMats.push(mat);
        const mesh = new THREE.Mesh(cellGeo, mat);
        mesh.position.set(col * GAP_X, -((GRID + 0.8) * GAP_Y), 0);
        scene.add(mesh);
        newRowCells.push(mesh);
      }

      // Label overlay
      container.style.position = "relative";
      const overlay = document.createElement("div");
      overlay.style.cssText =
        "position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;";
      container.appendChild(overlay);

      const subscripts = ["₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈"];
      const rowLabels: HTMLDivElement[] = [];
      for (let row = 0; row < GRID; row++) {
        const div = document.createElement("div");
        div.textContent = `r${subscripts[row]}`;
        div.style.cssText =
          "position:absolute;color:#737373;font-size:11px;font-family:monospace;transform:translate(-100%,-50%);padding-right:6px;opacity:0;transition:opacity 0.4s;";
        overlay.appendChild(div);
        rowLabels.push(div);
      }

      const newRowLabel = document.createElement("div");
      newRowLabel.textContent = "d";
      newRowLabel.style.cssText =
        "position:absolute;color:#10b981;font-size:11px;font-family:monospace;transform:translate(-100%,-50%);padding-right:6px;opacity:0;transition:opacity 0.4s;font-weight:bold;text-shadow:0 0 8px #10b981;";
      overlay.appendChild(newRowLabel);

      function projectToScreen(pos: THREE.Vector3): { x: number; y: number } {
        const v = pos.clone().project(camera);
        const x = ((v.x + 1) / 2) * W;
        const y = ((-v.y + 1) / 2) * HEIGHT;
        return { x, y };
      }

      // Target state for lerping
      const colorTargets: { color: string; opacity: number; borderGlow: number }[][] =
        Array.from({ length: GRID }, () =>
          Array.from({ length: GRID }, () => ({
            color: "#1e293b",
            opacity: 0,
            borderGlow: 1.0,
          }))
        );
      const newRowTargets = Array.from({ length: GRID }, () => ({
        color: "#10b981",
        opacity: 0,
        borderGlow: 1.0,
      }));

      function updateStep(s: StepId) {
        stepRef.current = s;

        // Reset all
        for (let row = 0; row < GRID; row++) {
          for (let col = 0; col < GRID; col++) {
            colorTargets[row][col] = {
              color: "#1e293b",
              opacity: s >= 1 ? 1.0 : 0.0,
              borderGlow: 1.0,
            };
          }
        }
        for (let col = 0; col < GRID; col++) {
          newRowTargets[col] = { color: "#10b981", opacity: 0, borderGlow: 1.0 };
        }

        if (s === 2) {
          for (let i = 0; i < GRID; i++) {
            colorTargets[i][i] = { color: "#f59e0b", opacity: 1, borderGlow: 2.0 };
          }
        } else if (s === 3) {
          for (let i = 0; i < GRID; i++) {
            colorTargets[i][i] = { color: "#8b5cf6", opacity: 1, borderGlow: 2.0 };
          }
          for (let col = 0; col < GRID; col++) {
            newRowTargets[col] = { color: "#10b981", opacity: 1, borderGlow: 1.5 };
          }
        } else if (s === 4) {
          for (let row = 0; row < GRID; row++) {
            for (let col = 0; col < GRID; col++) {
              if (row === 0) {
                colorTargets[row][col] = {
                  color: "#ef4444",
                  opacity: 1,
                  borderGlow: 2.5,
                };
              } else {
                colorTargets[row][col] = {
                  color: "#1e293b",
                  opacity: 0.1,
                  borderGlow: 0.3,
                };
              }
            }
          }
          for (let col = 0; col < GRID; col++) {
            newRowTargets[col] = { color: "#10b981", opacity: 0.1, borderGlow: 0.3 };
          }
        }

        rowLabels.forEach((lbl, i) => {
          lbl.style.opacity = s >= 1 ? (s === 4 && i > 0 ? "0.2" : "1") : "0";
          if (i === 0 && s === 4) {
            lbl.style.color = "#ef4444";
            lbl.style.textShadow = "0 0 8px #ef4444";
          } else {
            lbl.style.color = "#737373";
            lbl.style.textShadow = "none";
          }
        });
        newRowLabel.style.opacity = s === 3 ? "1" : s === 4 ? "0.2" : "0";
      }

      const clock = new THREE.Clock();
      const tmpColor = new THREE.Color();

      function animate() {
        const id = requestAnimationFrame(animate);
        sceneRef.current!.animId = id;

        const elapsed = clock.getElapsedTime();

        for (let row = 0; row < GRID; row++) {
          for (let col = 0; col < GRID; col++) {
            const mat = cellMats[row][col];
            const t = colorTargets[row][col];
            tmpColor.set(t.color);
            mat.uniforms.cellColor.value.lerp(tmpColor, 0.07);
            mat.uniforms.opacity.value +=
              (t.opacity - mat.uniforms.opacity.value) * 0.07;
            mat.uniforms.borderGlow.value +=
              (t.borderGlow - mat.uniforms.borderGlow.value) * 0.07;
            mat.uniforms.time.value = elapsed;

            if (stepRef.current === 2 && row === col) {
              mat.uniforms.borderGlow.value =
                2.0 + 0.5 * Math.sin(elapsed * 3.0 + row * 0.5);
            } else if (stepRef.current === 4 && row === 0) {
              mat.uniforms.borderGlow.value =
                2.0 + 0.8 * Math.sin(elapsed * 4.0);
            }
          }
        }

        for (let col = 0; col < GRID; col++) {
          const mat = newRowMats[col];
          const t = newRowTargets[col];
          tmpColor.set(t.color);
          mat.uniforms.cellColor.value.lerp(tmpColor, 0.07);
          mat.uniforms.opacity.value +=
            (t.opacity - mat.uniforms.opacity.value) * 0.07;
          mat.uniforms.borderGlow.value +=
            (t.borderGlow - mat.uniforms.borderGlow.value) * 0.07;
          mat.uniforms.time.value = elapsed;
          if (stepRef.current === 3) {
            mat.uniforms.borderGlow.value =
              1.5 + 0.3 * Math.sin(elapsed * 2.5 + col * 0.3);
          }
        }

        // Subtle camera drift
        camera.position.x = 3.5 + Math.sin(elapsed * 0.18) * 0.3;
        camera.lookAt(3.5, -1.5, 0);

        composer.render();

        // Row label positions
        for (let row = 0; row < GRID; row++) {
          const worldPos = cells[row][0].position.clone();
          // Apply scene rotation to world pos for projection
          worldPos.x -= 0.6;
          const p = projectToScreen(worldPos);
          rowLabels[row].style.left = `${p.x}px`;
          rowLabels[row].style.top = `${p.y}px`;
        }

        const nrPos = newRowCells[0].position.clone();
        nrPos.x -= 0.6;
        const nrP = projectToScreen(nrPos);
        newRowLabel.style.left = `${nrP.x}px`;
        newRowLabel.style.top = `${nrP.y}px`;
      }

      const ro = new ResizeObserver(() => {
        if (!container) return;
        const nw = container.clientWidth;
        camera.aspect = nw / HEIGHT;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, HEIGHT);
        composer.setSize(nw, HEIGHT);
      });
      ro.observe(container);

      sceneRef.current = {
        animId: 0,
        ro,
        updateStep,
        cleanup: () => {
          ro.disconnect();
          renderer.dispose();
          overlay.remove();
          canvas.remove();
        },
      };

      updateStep(0);
      animate();
    }

    init();

    return () => {
      cancelled = true;
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animId);
        sceneRef.current.cleanup();
        sceneRef.current = null;
      }
    };
  }, []);

  const goTo = useCallback((s: StepId) => {
    setStep(s);
    sceneRef.current?.updateStep(s);
  }, []);

  const info = STEP_LABELS[step];

  return (
    <div
      style={{
        background: "#000",
        borderRadius: "10px",
        overflow: "hidden",
        border: "1px solid #1f1f1f",
        marginBottom: "2rem",
      }}
    >
      <div ref={mountRef} style={{ width: "100%", height: `${HEIGHT}px`, position: "relative" }} />
      <div
        style={{
          padding: "16px 20px",
          background: "#0c0c0c",
          borderTop: "1px solid #1f1f1f",
        }}
      >
        <div style={{ display: "flex", gap: "6px", marginBottom: "12px", alignItems: "center" }}>
          {([0, 1, 2, 3, 4] as StepId[]).map((s) => (
            <button
              key={s}
              onClick={() => goTo(s)}
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                border: step === s ? "2px solid #f59e0b" : "1px solid #333",
                background: step === s ? "#1c1917" : "transparent",
                color: step === s ? "#f59e0b" : "#737373",
                fontSize: "11px",
                fontFamily: "monospace",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {s}
            </button>
          ))}
          <span
            style={{
              marginLeft: "8px",
              color:
                step === 4 ? "#ef4444" : step === 3 ? "#10b981" : step === 2 ? "#f59e0b" : "#f5f5f5",
              fontSize: "13px",
              fontFamily: "monospace",
              fontWeight: "600",
            }}
          >
            {info.title}
          </span>
        </div>
        <p
          style={{
            color: step === 4 ? "#fca5a5" : "#d4d4d4",
            fontSize: "13px",
            lineHeight: "1.6",
            margin: "0 0 12px",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {info.body}
        </p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button
            onClick={() => goTo(Math.max(0, step - 1) as StepId)}
            disabled={step === 0}
            style={{
              padding: "6px 18px",
              background: "transparent",
              border: "1px solid #333",
              borderRadius: "6px",
              color: step === 0 ? "#333" : "#f5f5f5",
              fontSize: "12px",
              fontFamily: "monospace",
              cursor: step === 0 ? "default" : "pointer",
            }}
          >
            ← Prev
          </button>
          <button
            onClick={() => goTo(Math.min(4, step + 1) as StepId)}
            disabled={step === 4}
            style={{
              padding: "6px 18px",
              background: step === 4 ? "transparent" : "#1c1917",
              border: `1px solid ${step === 4 ? "#333" : "#f59e0b"}`,
              borderRadius: "6px",
              color: step === 4 ? "#333" : "#f59e0b",
              fontSize: "12px",
              fontFamily: "monospace",
              cursor: step === 4 ? "default" : "pointer",
            }}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
