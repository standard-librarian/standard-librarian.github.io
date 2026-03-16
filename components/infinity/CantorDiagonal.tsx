"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type * as THREE from "three";

const GRID = 8;
const CELL_W = 0.95;
const CELL_H = 0.55;
const CELL_D = 0.05;
const GAP_X = 1.05;
const GAP_Y = 0.65;

type StepId = 0 | 1 | 2 | 3 | 4;

const STEP_LABELS: Record<StepId, { title: string; body: string }> = {
  0: {
    title: "The Setup",
    body: "Assume ℝ is countable — imagine a complete list of all real numbers between 0 and 1.",
  },
  1: {
    title: "The List",
    body: "We write them as infinite decimals: r₁ = 0.a₁a₂a₃…, r₂ = 0.b₁b₂b₃…, and so on.",
  },
  2: {
    title: "The Diagonal",
    body: "Pick the nth digit of the nth number. This diagonal cuts across the entire list.",
  },
  3: {
    title: "The Flip",
    body: "Change each diagonal digit (e.g. if it's 5, make it 6). The resulting number differs from every row at the highlighted position — it cannot be in the list.",
  },
  4: {
    title: "The Hidden Premise",
    body: 'But the entire proof depends on Step 0 already being true. The "complete list" assumes a finished actual infinity. Where did that completed object come from?',
  },
};

export function CantorDiagonal() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<StepId>(0);
  const stepRef = useRef<StepId>(0);
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    animId: number;
    cells: THREE.Mesh[][];
    rowLabels: HTMLDivElement[];
    ro: ResizeObserver;
    updateStep: (s: StepId) => void;
  } | null>(null);

  const HEIGHT = 340;

  useEffect(() => {
    if (!mountRef.current) return;
    let cancelled = false;

    async function init() {
      const THREE = await import("three");
      if (cancelled || !mountRef.current) return;

      const container = mountRef.current;
      const W = container.clientWidth;

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(W, HEIGHT);
      renderer.setClearColor(0x000000, 1);
      const canvas = renderer.domElement;
      canvas.style.display = "block";
      canvas.style.width = "100%";
      canvas.style.height = `${HEIGHT}px`;
      container.appendChild(canvas);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);

      const camera = new THREE.PerspectiveCamera(45, W / HEIGHT, 0.1, 100);
      camera.position.set(3.5, -1.5, 12);
      camera.lookAt(3.5, -1.5, 0);

      // Lights
      scene.add(new THREE.AmbientLight(0xffffff, 0.5));
      const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
      dirLight.position.set(5, 10, 10);
      scene.add(dirLight);
      const backLight = new THREE.DirectionalLight(0x4040ff, 0.4);
      backLight.position.set(-5, -5, -5);
      scene.add(backLight);

      // Create grid cells
      const cellGeo = new THREE.BoxGeometry(CELL_W, CELL_H, CELL_D);
      const cells: THREE.Mesh[][] = [];

      for (let row = 0; row < GRID; row++) {
        cells[row] = [];
        for (let col = 0; col < GRID; col++) {
          const mat = new THREE.MeshStandardMaterial({
            color: 0x1c1c2e,
            emissive: 0x0a0a18,
            emissiveIntensity: 0.3,
            roughness: 0.4,
            metalness: 0.5,
            transparent: true,
            opacity: 0,
          });
          const mesh = new THREE.Mesh(cellGeo, mat);
          mesh.position.set(col * GAP_X, -(row * GAP_Y), 0);
          mesh.rotation.x = -0.18;
          scene.add(mesh);
          cells[row].push(mesh);
        }
      }

      // A "new number" row below
      const newRowCells: THREE.Mesh[] = [];
      for (let col = 0; col < GRID; col++) {
        const mat = new THREE.MeshStandardMaterial({
          color: 0x10b981,
          emissive: 0x064e3b,
          emissiveIntensity: 0.5,
          roughness: 0.3,
          metalness: 0.5,
          transparent: true,
          opacity: 0,
        });
        const mesh = new THREE.Mesh(cellGeo, mat);
        mesh.position.set(col * GAP_X, -((GRID + 0.5) * GAP_Y), 0);
        mesh.rotation.x = -0.18;
        scene.add(mesh);
        newRowCells.push(mesh);
      }

      // Label overlay
      container.style.position = "relative";
      const overlay = document.createElement("div");
      overlay.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;";
      container.appendChild(overlay);

      // Row labels r₁ … r₈
      const subscripts = ["₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈"];
      const rowLabels: HTMLDivElement[] = [];
      for (let row = 0; row < GRID; row++) {
        const div = document.createElement("div");
        div.textContent = `r${subscripts[row]}`;
        div.style.cssText =
          "position:absolute;color:#737373;font-size:11px;font-family:monospace;transform:translate(-100%,-50%);padding-right:4px;opacity:0;transition:opacity 0.4s;";
        overlay.appendChild(div);
        rowLabels.push(div);
      }

      // New row label
      const newRowLabel = document.createElement("div");
      newRowLabel.textContent = "d";
      newRowLabel.style.cssText =
        "position:absolute;color:#10b981;font-size:11px;font-family:monospace;transform:translate(-100%,-50%);padding-right:4px;opacity:0;transition:opacity 0.4s;font-weight:bold;text-shadow:0 0 8px #10b981;";
      overlay.appendChild(newRowLabel);

      function projectToScreen(pos: THREE.Vector3): { x: number; y: number } {
        const v = pos.clone().project(camera);
        const x = ((v.x + 1) / 2) * W;
        const y = ((-v.y + 1) / 2) * HEIGHT;
        return { x, y };
      }

      function lerpColor(
        mat: THREE.MeshStandardMaterial,
        targetHex: number,
        emissiveHex: number,
        speed = 0.08
      ) {
        const target = new THREE.Color(targetHex);
        const targetE = new THREE.Color(emissiveHex);
        mat.color.lerp(target, speed);
        mat.emissive.lerp(targetE, speed);
      }

      // Per-frame targets
      const colorTargets: { color: number; emissive: number; opacity: number }[][] = Array.from(
        { length: GRID },
        () => Array.from({ length: GRID }, () => ({ color: 0x1c1c2e, emissive: 0x0a0a18, opacity: 0 }))
      );
      const newRowTargets = Array.from({ length: GRID }, () => ({ color: 0x10b981, emissive: 0x064e3b, opacity: 0 }));

      function updateStep(s: StepId) {
        stepRef.current = s;

        // Reset all to neutral
        for (let row = 0; row < GRID; row++) {
          for (let col = 0; col < GRID; col++) {
            colorTargets[row][col] = { color: 0x1c1c2e, emissive: 0x0a0a18, opacity: s >= 1 ? 1 : 0 };
          }
        }
        for (let col = 0; col < GRID; col++) {
          newRowTargets[col] = { color: 0x10b981, emissive: 0x064e3b, opacity: 0 };
        }

        if (s === 0) {
          // All faded
        } else if (s === 1) {
          // All neutral visible
        } else if (s === 2) {
          // Diagonal gold
          for (let i = 0; i < GRID; i++) {
            colorTargets[i][i] = { color: 0xf59e0b, emissive: 0x78350f, opacity: 1 };
          }
        } else if (s === 3) {
          // Diagonal purple (flipped), new row green
          for (let i = 0; i < GRID; i++) {
            colorTargets[i][i] = { color: 0x7c3aed, emissive: 0x3b0e8c, opacity: 1 };
          }
          for (let col = 0; col < GRID; col++) {
            newRowTargets[col] = { color: 0x10b981, emissive: 0x064e3b, opacity: 1 };
          }
        } else if (s === 4) {
          // Everything fades except first row (premise) which goes red
          for (let row = 0; row < GRID; row++) {
            for (let col = 0; col < GRID; col++) {
              if (row === 0) {
                colorTargets[row][col] = { color: 0xef4444, emissive: 0x7f1d1d, opacity: 1 };
              } else {
                colorTargets[row][col] = { color: 0x1c1c2e, emissive: 0x0a0a18, opacity: 0.15 };
              }
            }
          }
          for (let col = 0; col < GRID; col++) {
            newRowTargets[col] = { color: 0x10b981, emissive: 0x064e3b, opacity: 0.15 };
          }
        }

        // Row labels visibility
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

      function animate() {
        const id = requestAnimationFrame(animate);
        sceneRef.current!.animId = id;

        // Lerp cell colors
        for (let row = 0; row < GRID; row++) {
          for (let col = 0; col < GRID; col++) {
            const mat = cells[row][col].material as THREE.MeshStandardMaterial;
            const t = colorTargets[row][col];
            mat.color.lerp(new THREE.Color(t.color), 0.06);
            mat.emissive.lerp(new THREE.Color(t.emissive), 0.06);
            mat.opacity += (t.opacity - mat.opacity) * 0.06;

            // Pulse on diagonal in step 2
            if (stepRef.current === 2 && row === col) {
              mat.emissiveIntensity = 0.5 + Math.sin(Date.now() * 0.003 + row * 0.5) * 0.3;
            } else if (stepRef.current === 4 && row === 0) {
              mat.emissiveIntensity = 0.5 + Math.sin(Date.now() * 0.004) * 0.3;
            } else {
              mat.emissiveIntensity = 0.3;
            }
          }
        }

        // New row cells
        for (let col = 0; col < GRID; col++) {
          const mat = newRowCells[col].material as THREE.MeshStandardMaterial;
          const t = newRowTargets[col];
          mat.color.lerp(new THREE.Color(t.color), 0.06);
          mat.emissive.lerp(new THREE.Color(t.emissive), 0.06);
          mat.opacity += (t.opacity - mat.opacity) * 0.06;
          if (stepRef.current === 3) {
            mat.emissiveIntensity = 0.4 + Math.sin(Date.now() * 0.003 + col * 0.3) * 0.2;
          }
        }

        // Slow camera drift
        const time = Date.now() * 0.0002;
        camera.position.x = 3.5 + Math.sin(time) * 0.3;
        camera.lookAt(3.5, -1.5, 0);

        renderer.render(scene, camera);

        // Update row label positions
        for (let row = 0; row < GRID; row++) {
          const worldPos = cells[row][0].position.clone();
          worldPos.x -= 0.6;
          const p = projectToScreen(worldPos);
          rowLabels[row].style.left = `${p.x}px`;
          rowLabels[row].style.top = `${p.y}px`;
        }

        // New row label position
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
      });
      ro.observe(container);

      sceneRef.current = {
        renderer,
        scene,
        camera,
        animId: 0,
        cells,
        rowLabels,
        ro,
        updateStep,
      };

      updateStep(0);
      animate();
    }

    init();

    return () => {
      cancelled = true;
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animId);
        sceneRef.current.ro.disconnect();
        sceneRef.current.renderer.dispose();
        if (mountRef.current) {
          const canvas = mountRef.current.querySelector("canvas");
          canvas?.remove();
          const overlay = mountRef.current.querySelector("div");
          overlay?.remove();
        }
        sceneRef.current = null;
      }
    };
  }, []);

  const goTo = useCallback(
    (s: StepId) => {
      setStep(s);
      sceneRef.current?.updateStep(s);
    },
    []
  );

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
        {/* Step indicators */}
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
                step === 4
                  ? "#ef4444"
                  : step === 3
                  ? "#10b981"
                  : step === 2
                  ? "#f59e0b"
                  : "#f5f5f5",
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
