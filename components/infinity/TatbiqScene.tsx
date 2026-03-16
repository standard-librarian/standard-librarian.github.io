"use client";

import { useEffect, useRef, useState } from "react";
import type * as THREE from "three";

const N = 12;
const SPACING = 2.0;
const ROW_Y = 1.2;

export function TatbiqScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLInputElement>(null);
  const [sliderValue, setSliderValue] = useState(0);
  const [showResolution, setShowResolution] = useState(false);
  const sceneStateRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    animId: number;
    spheresA: THREE.Mesh[];
    spheresB: THREE.Mesh[];
    threads: THREE.Line[];
    labelContainer: HTMLDivElement;
    slider: number;
    ro: ResizeObserver;
  } | null>(null);

  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    let cancelled = false;

    async function init() {
      const THREE = await import("three");

      if (cancelled || !mountRef.current) return;

      const container = mountRef.current;
      const WIDTH = container.clientWidth;
      const HEIGHT = 380;

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(WIDTH, HEIGHT);
      renderer.shadowMap.enabled = true;
      renderer.setClearColor(0x000000, 1);
      const canvas = renderer.domElement;
      canvas.style.display = "block";
      canvas.style.width = "100%";
      canvas.style.height = `${HEIGHT}px`;
      container.appendChild(canvas);

      // Scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);
      scene.fog = new THREE.FogExp2(0x000000, 0.055);

      // Camera
      const camera = new THREE.PerspectiveCamera(55, WIDTH / HEIGHT, 0.1, 200);
      camera.position.set(11, 6, 14);
      camera.lookAt(11, 0, 0);

      // Ambient light
      const ambient = new THREE.AmbientLight(0xffffff, 0.15);
      scene.add(ambient);

      // Point lights for glow effect
      const purpleLight = new THREE.PointLight(0x7c3aed, 3, 20);
      purpleLight.position.set(5, 4, 2);
      scene.add(purpleLight);

      const cyanLight = new THREE.PointLight(0x0891b2, 3, 20);
      cyanLight.position.set(5, -4, 2);
      scene.add(cyanLight);

      const warmLight = new THREE.PointLight(0xfbbf24, 2, 30);
      warmLight.position.set(12, 0, 5);
      scene.add(warmLight);

      // Sphere geometry
      const geo = new THREE.SphereGeometry(0.38, 32, 32);

      // Row A spheres (purple)
      const spheresA: THREE.Mesh[] = [];
      for (let i = 0; i < N; i++) {
        const mat = new THREE.MeshStandardMaterial({
          color: 0x7c3aed,
          emissive: 0x3b0e8c,
          emissiveIntensity: 0.4,
          roughness: 0.2,
          metalness: 0.6,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set((i + 1) * SPACING, ROW_Y, 0);
        mesh.castShadow = true;
        scene.add(mesh);
        spheresA.push(mesh);
      }

      // Row B spheres (cyan)
      const spheresB: THREE.Mesh[] = [];
      for (let i = 0; i < N; i++) {
        const mat = new THREE.MeshStandardMaterial({
          color: 0x0891b2,
          emissive: 0x044e63,
          emissiveIntensity: 0.4,
          roughness: 0.2,
          metalness: 0.6,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set((i + 2) * SPACING, -ROW_Y, 0);
        mesh.castShadow = true;
        scene.add(mesh);
        spheresB.push(mesh);
      }

      // Thread lines (amber) connecting B[i] -> A[i]
      const threads: THREE.Line[] = [];
      const threadMat = new THREE.LineBasicMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0,
        linewidth: 2,
      });
      for (let i = 0; i < N; i++) {
        const points = [
          new THREE.Vector3((i + 2) * SPACING, -ROW_Y, 0),
          new THREE.Vector3((i + 1) * SPACING, ROW_Y, 0),
        ];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeo, threadMat.clone() as THREE.LineBasicMaterial);
        scene.add(line);
        threads.push(line);
      }

      // Label overlay container
      const labelContainer = document.createElement("div");
      labelContainer.style.cssText =
        "position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:hidden;";
      container.style.position = "relative";
      container.appendChild(labelContainer);

      // Number labels for spheres
      const sphereLabels: HTMLDivElement[] = [];
      for (let i = 0; i < N; i++) {
        const div = document.createElement("div");
        div.textContent = String(i + 1);
        div.style.cssText =
          "position:absolute;color:#a78bfa;font-size:11px;font-family:monospace;transform:translate(-50%,-50%);pointer-events:none;text-shadow:0 0 6px #7c3aed;";
        labelContainer.appendChild(div);
        sphereLabels.push(div);
      }
      const sphereLabelsBRow: HTMLDivElement[] = [];
      for (let i = 0; i < N; i++) {
        const div = document.createElement("div");
        div.textContent = String(i + 2);
        div.style.cssText =
          "position:absolute;color:#67e8f9;font-size:11px;font-family:monospace;transform:translate(-50%,-50%);pointer-events:none;text-shadow:0 0 6px #0891b2;";
        labelContainer.appendChild(div);
        sphereLabelsBRow.push(div);
      }

      // Row labels
      const rowALabel = document.createElement("div");
      rowALabel.textContent = "A";
      rowALabel.style.cssText =
        "position:absolute;color:#a78bfa;font-size:13px;font-weight:bold;font-family:monospace;transform:translate(-50%,-50%);text-shadow:0 0 8px #7c3aed;";
      labelContainer.appendChild(rowALabel);

      const rowBLabel = document.createElement("div");
      rowBLabel.textContent = "B";
      rowBLabel.style.cssText =
        "position:absolute;color:#67e8f9;font-size:13px;font-weight:bold;font-family:monospace;transform:translate(-50%,-50%);text-shadow:0 0 8px #0891b2;";
      labelContainer.appendChild(rowBLabel);

      // Main status label
      const statusLabel = document.createElement("div");
      statusLabel.style.cssText =
        "position:absolute;bottom:16px;left:50%;transform:translateX(-50%);color:#f5f5f5;font-size:13px;font-family:monospace;text-align:center;padding:6px 14px;background:rgba(0,0,0,0.7);border-radius:6px;border:1px solid #333;max-width:90%;line-height:1.5;";
      labelContainer.appendChild(statusLabel);

      // Contradiction label
      const contradictionLabel = document.createElement("div");
      contradictionLabel.style.cssText =
        "position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#f59e0b;font-size:22px;font-weight:bold;font-family:monospace;text-shadow:0 0 20px #f59e0b,0 0 40px #f59e0b;opacity:0;transition:opacity 0.3s;letter-spacing:4px;";
      contradictionLabel.textContent = "CONTRADICTION";
      labelContainer.appendChild(contradictionLabel);

      let currentSlider = 0;

      function projectToScreen(pos: THREE.Vector3): { x: number; y: number } {
        const v = pos.clone().project(camera);
        const rect = canvas.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const x = ((v.x + 1) / 2) * WIDTH;
        const y = ((-v.y + 1) / 2) * HEIGHT;
        return { x, y };
      }

      function updateScene(slider: number) {
        currentSlider = slider;
        const bOffset = -slider * SPACING;

        // Update B sphere positions
        for (let i = 0; i < N; i++) {
          const newX = (i + 2) * SPACING + bOffset;
          spheresB[i].position.x = newX;
        }

        // Orphan sphere A[0] glow
        const orphanMat = spheresA[0].material as THREE.MeshStandardMaterial;
        if (slider < 0.45) {
          orphanMat.color.setHex(0xef4444);
          orphanMat.emissive.setHex(0x7f1d1d);
          orphanMat.emissiveIntensity = 0.6 + Math.sin(Date.now() * 0.004) * 0.3;
        } else if (slider > 0.55) {
          orphanMat.color.setHex(0x7c3aed);
          orphanMat.emissive.setHex(0x3b0e8c);
          orphanMat.emissiveIntensity = 0.4;
        } else {
          const t = (slider - 0.45) / 0.1;
          orphanMat.color.setHex(0x7c3aed);
          orphanMat.emissiveIntensity = 0.4;
        }

        // Thread opacity and positions
        const threadOpacity = Math.max(0, (slider - 0.2) / 0.8);
        for (let i = 0; i < N; i++) {
          const mat = threads[i].material as THREE.LineBasicMaterial;
          mat.opacity = threadOpacity;

          const bx = (i + 2) * SPACING + bOffset;
          const ax = (i + 1) * SPACING;
          const positions = threads[i].geometry.attributes.position as THREE.BufferAttribute;
          positions.setXYZ(0, bx, -ROW_Y, 0);
          positions.setXYZ(1, ax, ROW_Y, 0);
          positions.needsUpdate = true;
        }

        // Status labels
        if (slider < 0.45) {
          statusLabel.innerHTML =
            '1 &isin; A, but 1 &notin; B &nbsp;&rarr;&nbsp; B &sub; A strictly &nbsp;&rarr;&nbsp; <span style="color:#f59e0b">|A| &gt; |B|</span>';
          contradictionLabel.style.opacity = "0";
        } else if (slider > 0.55) {
          statusLabel.innerHTML =
            'f(n) = n+1 is a bijection &nbsp;&rarr;&nbsp; <span style="color:#34d399">|A| = |B|</span>';
          contradictionLabel.style.opacity = "0";
        } else {
          statusLabel.innerHTML =
            '<span style="color:#a78bfa">|A| &gt; |B|</span> &nbsp;AND&nbsp; <span style="color:#34d399">|A| = |B|</span>';
          contradictionLabel.style.opacity = "1";
        }
      }

      function animate() {
        const id = requestAnimationFrame(animate);
        sceneStateRef.current!.animId = id;

        // Animate orphan glow
        if (currentSlider < 0.45) {
          const orphanMat = spheresA[0].material as THREE.MeshStandardMaterial;
          orphanMat.emissiveIntensity = 0.5 + Math.sin(Date.now() * 0.004) * 0.35;
        }

        // Slow camera drift
        const t = Date.now() * 0.0003;
        camera.position.x = 11 + Math.sin(t) * 0.5;
        camera.position.y = 6 + Math.cos(t * 0.7) * 0.3;
        camera.lookAt(11, 0, 0);

        renderer.render(scene, camera);

        // Update sphere label positions
        for (let i = 0; i < N; i++) {
          const pa = projectToScreen(spheresA[i].position);
          sphereLabels[i].style.left = `${pa.x}px`;
          sphereLabels[i].style.top = `${pa.y}px`;

          const pb = projectToScreen(spheresB[i].position);
          sphereLabelsBRow[i].style.left = `${pb.x}px`;
          sphereLabelsBRow[i].style.top = `${pb.y}px`;
        }

        // Row label positions (slightly left of first sphere)
        const pA = projectToScreen(new THREE.Vector3(SPACING - 0.8, ROW_Y, 0));
        rowALabel.style.left = `${pA.x}px`;
        rowALabel.style.top = `${pA.y}px`;

        const pB = projectToScreen(new THREE.Vector3(SPACING + 0.2 - 0.8, -ROW_Y, 0));
        rowBLabel.style.left = `${pB.x}px`;
        rowBLabel.style.top = `${pB.y}px`;
      }

      const ro = new ResizeObserver(() => {
        if (!container) return;
        const w = container.clientWidth;
        camera.aspect = w / HEIGHT;
        camera.updateProjectionMatrix();
        renderer.setSize(w, HEIGHT);
      });
      ro.observe(container);

      sceneStateRef.current = {
        renderer,
        scene,
        camera,
        animId: 0,
        spheresA,
        spheresB,
        threads,
        labelContainer,
        slider: 0,
        ro,
      };

      updateScene(0);
      animate();

      // Expose updateScene via ref for slider
      (sceneStateRef.current as any).updateScene = updateScene;
    }

    init();

    return () => {
      cancelled = true;
      if (sceneStateRef.current) {
        cancelAnimationFrame(sceneStateRef.current.animId);
        sceneStateRef.current.ro.disconnect();
        sceneStateRef.current.renderer.dispose();
        sceneStateRef.current.labelContainer.remove();
        if (mountRef.current) {
          const canvas = mountRef.current.querySelector("canvas");
          canvas?.remove();
        }
        sceneStateRef.current = null;
      }
    };
  }, []);

  function handleSlider(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseFloat(e.target.value);
    setSliderValue(val);
    if (sceneStateRef.current && (sceneStateRef.current as any).updateScene) {
      (sceneStateRef.current as any).updateScene(val);
    }
  }

  const modeLabel =
    sliderValue < 0.35
      ? "Containment View"
      : sliderValue > 0.65
      ? "Bijection View"
      : "⚡ Contradiction";

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
      <div ref={mountRef} style={{ width: "100%", height: "380px", position: "relative" }} />
      <div
        style={{
          padding: "16px 20px",
          background: "#0c0c0c",
          borderTop: "1px solid #1f1f1f",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span
            style={{
              color: "#737373",
              fontSize: "11px",
              fontFamily: "monospace",
              minWidth: "110px",
            }}
          >
            Containment
          </span>
          <input
            ref={sliderRef}
            type="range"
            min={0}
            max={1}
            step={0.01}
            defaultValue={0}
            onChange={handleSlider}
            style={{
              flex: 1,
              accentColor: "#f59e0b",
              cursor: "pointer",
            }}
          />
          <span
            style={{
              color: "#737373",
              fontSize: "11px",
              fontFamily: "monospace",
              minWidth: "80px",
              textAlign: "right",
            }}
          >
            Bijection
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            style={{
              color:
                sliderValue < 0.35
                  ? "#a78bfa"
                  : sliderValue > 0.65
                  ? "#34d399"
                  : "#f59e0b",
              fontSize: "13px",
              fontFamily: "monospace",
              fontWeight: "600",
              flex: 1,
            }}
          >
            {modeLabel}
          </span>
          <button
            onClick={() => setShowResolution((v) => !v)}
            style={{
              background: showResolution ? "#1c1917" : "transparent",
              border: "1px solid #404040",
              borderRadius: "6px",
              color: "#f5f5f5",
              padding: "6px 14px",
              fontSize: "12px",
              fontFamily: "monospace",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {showResolution ? "Hide" : "Show"} Cantor&apos;s Resolution
          </button>
        </div>
        {showResolution && (
          <div
            style={{
              background: "#0a0a0a",
              border: "1px solid #292929",
              borderRadius: "8px",
              padding: "14px 16px",
              fontSize: "13px",
              lineHeight: "1.7",
              color: "#d4d4d4",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            <p style={{ margin: "0 0 10px", color: "#f59e0b", fontWeight: "600", fontFamily: "monospace" }}>
              Cantor&apos;s Resolution:
            </p>
            <p style={{ margin: "0 0 8px" }}>
              Cantor defined two sets as having the <em>same cardinality</em> if and only if a bijection
              (one-to-one correspondence) exists between them. Under this definition, ℕ and ℕ\{"{1}"} are
              equal in size — the bijection f(n) = n+1 suffices.
            </p>
            <p style={{ margin: "0 0 8px", color: "#f87171" }}>
              <strong>The Mutakallimun&apos;s reply:</strong> This definition is not self-evident — it must
              be <em>stipulated</em>. The containment view (proper subset = smaller set) is equally coherent.
              Both definitions are internally consistent. Cantor&apos;s choice only makes sense if you have
              already accepted that actual infinite sets exist and can be compared. The argument presupposes
              what it needs to prove.
            </p>
            <p style={{ margin: 0, color: "#737373", fontSize: "12px" }}>
              See: Al-Ghazali, <em>Tahafut al-Falasifa</em>; John Mayberry, <em>The Foundations of Mathematics
              in the Theory of Sets</em>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
