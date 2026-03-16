"use client";

import { useEffect, useRef, useState } from "react";
import type * as THREE from "three";

const NUM_ROOMS = 15;
const ROOM_SPACING = 3;

export function HilbertHotel() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [counter, setCounter] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    animId: number;
    leftPanels: THREE.Mesh[];
    rightPanels: THREE.Mesh[];
    roomLabels: HTMLDivElement[];
    ro: ResizeObserver;
  } | null>(null);
  const waveTimeoutRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const HEIGHT = 360;

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
      scene.fog = new THREE.Fog(0x000000, 5, 50);

      const camera = new THREE.PerspectiveCamera(65, W / HEIGHT, 0.1, 200);
      camera.position.set(0, 2, 8);
      camera.lookAt(0, 0, -20);

      // Lights
      scene.add(new THREE.AmbientLight(0x1a1a3a, 1));
      const corridorLight = new THREE.PointLight(0x3b82f6, 4, 20);
      corridorLight.position.set(0, 3, 0);
      scene.add(corridorLight);

      // Floor
      const floorGeo = new THREE.PlaneGeometry(10, 80);
      const floorMat = new THREE.MeshStandardMaterial({
        color: 0x050508,
        roughness: 0.9,
        metalness: 0.1,
      });
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.position.set(0, -1.5, -30);
      scene.add(floor);

      // Ceiling
      const ceilGeo = new THREE.PlaneGeometry(10, 80);
      const ceilMat = new THREE.MeshStandardMaterial({ color: 0x040407, roughness: 1 });
      const ceil = new THREE.Mesh(ceilGeo, ceilMat);
      ceil.rotation.x = Math.PI / 2;
      ceil.position.set(0, 3.5, -30);
      scene.add(ceil);

      // Create room door frames
      const leftPanels: THREE.Mesh[] = [];
      const rightPanels: THREE.Mesh[] = [];
      const panelGeo = new THREE.BoxGeometry(0.25, 3.5, 0.15);

      // Row labels
      container.style.position = "relative";
      const overlay = document.createElement("div");
      overlay.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;";
      container.appendChild(overlay);

      const roomLabels: HTMLDivElement[] = [];

      for (let i = 0; i < NUM_ROOMS; i++) {
        const z = -(i * ROOM_SPACING);
        const brightness = Math.max(0.05, 1 - i * 0.06);

        const mat = () =>
          new THREE.MeshStandardMaterial({
            color: 0x1e40af,
            emissive: 0x1e3a8a,
            emissiveIntensity: 0.5 * brightness,
            roughness: 0.3,
            metalness: 0.7,
          });

        // Door frame: two vertical pillars + a top bar
        const leftPillar = new THREE.Mesh(panelGeo, mat());
        leftPillar.position.set(-2.5, 1, z);
        scene.add(leftPillar);
        leftPanels.push(leftPillar);

        const rightPillar = new THREE.Mesh(panelGeo, mat());
        rightPillar.position.set(2.5, 1, z);
        scene.add(rightPillar);
        rightPanels.push(rightPillar);

        // Top bar
        const topBarGeo = new THREE.BoxGeometry(5.25, 0.2, 0.15);
        const topBar = new THREE.Mesh(topBarGeo, mat());
        topBar.position.set(0, 2.75, z);
        scene.add(topBar);

        // Room light
        if (i < 8) {
          const roomGlow = new THREE.PointLight(0x1d4ed8, 1.2 * brightness, 3);
          roomGlow.position.set(0, 1, z);
          scene.add(roomGlow);
        }

        // Label
        const div = document.createElement("div");
        div.textContent = String(i + 1);
        div.style.cssText =
          "position:absolute;color:#93c5fd;font-size:10px;font-family:monospace;transform:translate(-50%,-50%);opacity:" +
          brightness.toFixed(2) +
          ";text-shadow:0 0 6px #3b82f6;";
        overlay.appendChild(div);
        roomLabels.push(div);
      }

      // Counter display
      const counterDiv = document.createElement("div");
      counterDiv.style.cssText =
        "position:absolute;top:12px;right:16px;color:#fbbf24;font-size:20px;font-family:monospace;font-weight:bold;text-shadow:0 0 12px #f59e0b;opacity:0;transition:opacity 0.3s;";
      overlay.appendChild(counterDiv);

      function projectToScreen(pos: THREE.Vector3): { x: number; y: number } {
        const v = pos.clone().project(camera);
        const w = renderer.domElement.clientWidth || W;
        const x = ((v.x + 1) / 2) * w;
        const y = ((-v.y + 1) / 2) * HEIGHT;
        return { x, y };
      }

      function animate() {
        const id = requestAnimationFrame(animate);
        sceneRef.current!.animId = id;

        const time = Date.now() * 0.001;
        // Slow corridor breathing
        corridorLight.intensity = 3.5 + Math.sin(time * 0.5) * 0.5;
        camera.position.y = 2 + Math.sin(time * 0.3) * 0.1;

        renderer.render(scene, camera);

        // Update room label positions
        for (let i = 0; i < NUM_ROOMS; i++) {
          const worldPos = new THREE.Vector3(0, 1.5, -(i * ROOM_SPACING));
          const p = projectToScreen(worldPos);
          // Only show if in front of camera and in viewport
          if (p.x > 0 && p.x < W && p.y > 0 && p.y < HEIGHT) {
            roomLabels[i].style.left = `${p.x}px`;
            roomLabels[i].style.top = `${p.y}px`;
            roomLabels[i].style.display = "block";
          } else {
            roomLabels[i].style.display = "none";
          }
        }
      }

      sceneRef.current = {
        renderer,
        scene,
        camera,
        animId: 0,
        leftPanels,
        rightPanels,
        roomLabels,
        ro: new ResizeObserver(() => {
          const nw = container.clientWidth;
          camera.aspect = nw / HEIGHT;
          camera.updateProjectionMatrix();
          renderer.setSize(nw, HEIGHT);
        }),
      };

      sceneRef.current.ro.observe(container);
      animate();

      // Expose counterDiv
      (sceneRef.current as any).counterDiv = counterDiv;
    }

    init();

    return () => {
      cancelled = true;
      waveTimeoutRef.current.forEach(clearTimeout);
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animId);
        sceneRef.current.ro.disconnect();
        sceneRef.current.renderer.dispose();
        if (mountRef.current) {
          mountRef.current.querySelector("canvas")?.remove();
          mountRef.current.querySelector("div")?.remove();
        }
        sceneRef.current = null;
      }
    };
  }, []);

  function flashRoom(i: number, color: number, duration = 400) {
    if (!sceneRef.current) return;
    const { leftPanels, rightPanels } = sceneRef.current;
    const setColor = (c: number) => {
      [leftPanels[i], rightPanels[i]].forEach((p) => {
        const mat = p.material as THREE.MeshStandardMaterial;
        mat.color.setHex(c);
        mat.emissive.setHex(c === 0xfbbf24 ? 0x92400e : 0x1e3a8a);
        mat.emissiveIntensity = c === 0xfbbf24 ? 1.2 : 0.5;
      });
    };
    setColor(color);
    const t = setTimeout(() => setColor(0x1e40af), duration);
    waveTimeoutRef.current.push(t);
  }

  function handleNewGuest() {
    if (busy || !sceneRef.current) return;
    setBusy(true);
    setCounter("∞ + 1 = ∞");
    const counterDiv = (sceneRef.current as any).counterDiv as HTMLDivElement;
    if (counterDiv) { counterDiv.style.opacity = "1"; counterDiv.textContent = "∞ + 1 = ∞"; }

    // Wave from front to back
    for (let i = 0; i < NUM_ROOMS; i++) {
      const t = setTimeout(() => {
        flashRoom(i, 0xfbbf24, 350);
        if (i === NUM_ROOMS - 1) {
          setTimeout(() => setBusy(false), 600);
        }
      }, i * 120);
      waveTimeoutRef.current.push(t);
    }
  }

  function handleInfiniteBus() {
    if (busy || !sceneRef.current) return;
    setBusy(true);
    setCounter("∞ + ∞ = ∞");
    const counterDiv = (sceneRef.current as any).counterDiv as HTMLDivElement;
    if (counterDiv) { counterDiv.style.opacity = "1"; counterDiv.textContent = "∞ + ∞ = ∞"; }

    const colors = [0xef4444, 0xf59e0b, 0x10b981, 0x7c3aed, 0x3b82f6, 0xec4899];
    let flashCount = 0;
    const totalFlashes = 40;

    const doFlash = () => {
      if (!sceneRef.current) return;
      for (let i = 0; i < NUM_ROOMS; i++) {
        const c = colors[Math.floor(Math.random() * colors.length)];
        flashRoom(i, c, 200);
      }
      flashCount++;
      if (flashCount < totalFlashes) {
        const t = setTimeout(doFlash, 120);
        waveTimeoutRef.current.push(t);
      } else {
        // Settle back to blue wave
        for (let i = 0; i < NUM_ROOMS; i++) {
          const t = setTimeout(() => {
            flashRoom(i, 0x3b82f6, 500);
            if (i === NUM_ROOMS - 1) {
              setTimeout(() => setBusy(false), 600);
            }
          }, i * 80);
          waveTimeoutRef.current.push(t);
        }
      }
    };

    doFlash();
  }

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
          padding: "14px 20px",
          background: "#0c0c0c",
          borderTop: "1px solid #1f1f1f",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={handleNewGuest}
          disabled={busy}
          style={{
            padding: "8px 18px",
            background: busy ? "transparent" : "#1c1917",
            border: `1px solid ${busy ? "#333" : "#fbbf24"}`,
            borderRadius: "6px",
            color: busy ? "#555" : "#fbbf24",
            fontSize: "12px",
            fontFamily: "monospace",
            cursor: busy ? "default" : "pointer",
            transition: "all 0.2s",
          }}
        >
          New Guest Arrives
        </button>
        <button
          onClick={handleInfiniteBus}
          disabled={busy}
          style={{
            padding: "8px 18px",
            background: busy ? "transparent" : "#0f172a",
            border: `1px solid ${busy ? "#333" : "#7c3aed"}`,
            borderRadius: "6px",
            color: busy ? "#555" : "#a78bfa",
            fontSize: "12px",
            fontFamily: "monospace",
            cursor: busy ? "default" : "pointer",
            transition: "all 0.2s",
          }}
        >
          Infinite Bus Arrives
        </button>
        {counter && (
          <span
            style={{
              color: "#f59e0b",
              fontSize: "18px",
              fontFamily: "monospace",
              fontWeight: "bold",
              textShadow: "0 0 10px #f59e0b",
              marginLeft: "auto",
            }}
          >
            {counter}
          </span>
        )}
      </div>
    </div>
  );
}
