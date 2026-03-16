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
    animId: number;
    ro: ResizeObserver;
    panelMats: THREE.ShaderMaterial[][];
    cleanup: () => void;
  } | null>(null);
  const waveTimeoutRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const HEIGHT = 360;

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
      renderer.toneMappingExposure = 1.1;
      const canvas = renderer.domElement;
      canvas.style.display = "block";
      canvas.style.width = "100%";
      canvas.style.height = `${HEIGHT}px`;
      container.appendChild(canvas);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);
      scene.fog = new THREE.FogExp2(0x000000, 0.04);

      const camera = new THREE.PerspectiveCamera(60, W / HEIGHT, 0.1, 200);
      camera.position.set(0, 0.5, 6);
      camera.lookAt(0, 0, -30);

      const composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      const bloom = new UnrealBloomPass(
        new THREE.Vector2(W, HEIGHT),
        1.4,
        0.5,
        0.05
      );
      composer.addPass(bloom);

      // Panel ShaderMaterial with scan-line animation
      const panelVert = /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `;
      const panelFrag = /* glsl */ `
        uniform float time;
        uniform vec3 roomColor;
        uniform float wavePhase;
        varying vec2 vUv;
        void main() {
          float scan = fract(vUv.y + time * 0.3 + wavePhase);
          float line = smoothstep(0.95, 1.0, scan) * 0.5;
          float edge = 1.0 - abs(vUv.x - 0.5) * 2.0;
          edge = pow(edge, 3.0);
          vec3 col = roomColor * (0.3 + edge * 0.7 + line);
          gl_FragColor = vec4(col, 0.8);
        }
      `;

      const panelGeo = new THREE.PlaneGeometry(1.2, 2.5);
      const panelMats: THREE.ShaderMaterial[][] = [];

      // Label overlay
      container.style.position = "relative";
      const overlay = document.createElement("div");
      overlay.style.cssText =
        "position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;";
      container.appendChild(overlay);

      const roomLabels: HTMLDivElement[] = [];

      for (let i = 0; i < NUM_ROOMS; i++) {
        const z = -(i * ROOM_SPACING);
        const brightness = Math.max(0.12, 1 - i * 0.05);

        const makePanel = (side: number): THREE.ShaderMaterial => {
          const mat = new THREE.ShaderMaterial({
            uniforms: {
              time: { value: 0 },
              roomColor: { value: new THREE.Color(0x1e40af).multiplyScalar(brightness) },
              wavePhase: { value: i * 0.4 },
            },
            vertexShader: panelVert,
            fragmentShader: panelFrag,
            transparent: true,
            side: THREE.DoubleSide,
          });
          const mesh = new THREE.Mesh(panelGeo, mat);
          mesh.position.set(side * 2.5, 0, z);
          scene.add(mesh);
          return mat;
        };

        const leftMat = makePanel(-1);
        const rightMat = makePanel(1);
        panelMats.push([leftMat, rightMat]);

        // Top bar
        const barGeo = new THREE.PlaneGeometry(5.0, 0.15);
        const barMat = new THREE.ShaderMaterial({
          uniforms: {
            time: { value: 0 },
            roomColor: { value: new THREE.Color(0x1e40af).multiplyScalar(brightness) },
            wavePhase: { value: i * 0.4 + 1.0 },
          },
          vertexShader: panelVert,
          fragmentShader: panelFrag,
          transparent: true,
          side: THREE.DoubleSide,
        });
        const bar = new THREE.Mesh(barGeo, barMat);
        bar.position.set(0, 1.3, z);
        scene.add(bar);

        // Room number label
        const div = document.createElement("div");
        div.textContent = String(i + 1);
        div.style.cssText =
          "position:absolute;color:#93c5fd;font-size:10px;font-family:monospace;transform:translate(-50%,-50%);text-shadow:0 0 6px #3b82f6;opacity:" +
          brightness.toFixed(2) +
          ";";
        overlay.appendChild(div);
        roomLabels.push(div);
      }

      // Floor
      const floorGeo = new THREE.PlaneGeometry(6, 80);
      const floorMat = new THREE.MeshStandardMaterial({
        color: 0x050508,
        roughness: 0.95,
        metalness: 0.05,
      });
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.position.set(0, -1.3, -20);
      scene.add(floor);

      // Counter display
      const counterDiv = document.createElement("div");
      counterDiv.style.cssText =
        "position:absolute;top:12px;right:16px;color:#fbbf24;font-size:22px;font-family:monospace;font-weight:bold;text-shadow:0 0 16px #f59e0b,0 0 32px #f59e0b;opacity:0;transition:opacity 0.3s;";
      overlay.appendChild(counterDiv);

      function projectToScreen(pos: THREE.Vector3): { x: number; y: number } {
        const v = pos.clone().project(camera);
        const x = ((v.x + 1) / 2) * W;
        const y = ((-v.y + 1) / 2) * HEIGHT;
        return { x, y };
      }

      const clock = new THREE.Clock();

      function animate() {
        const id = requestAnimationFrame(animate);
        sceneRef.current!.animId = id;

        const elapsed = clock.getElapsedTime();

        // Update all panel time uniforms
        for (let i = 0; i < NUM_ROOMS; i++) {
          panelMats[i][0].uniforms.time.value = elapsed;
          panelMats[i][1].uniforms.time.value = elapsed;
        }

        camera.position.y = 0.5 + Math.sin(elapsed * 0.3) * 0.08;

        composer.render();

        for (let i = 0; i < NUM_ROOMS; i++) {
          const worldPos = new THREE.Vector3(0, 0.8, -(i * ROOM_SPACING));
          const p = projectToScreen(worldPos);
          if (p.x > 0 && p.x < W && p.y > 0 && p.y < HEIGHT) {
            roomLabels[i].style.left = `${p.x}px`;
            roomLabels[i].style.top = `${p.y}px`;
            roomLabels[i].style.display = "block";
          } else {
            roomLabels[i].style.display = "none";
          }
        }
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
        panelMats,
        cleanup: () => {
          ro.disconnect();
          renderer.dispose();
          overlay.remove();
          canvas.remove();
        },
      };

      // Expose counterDiv on ref
      (sceneRef.current as unknown as Record<string, unknown>).counterDiv = counterDiv;

      animate();
    }

    init();

    return () => {
      cancelled = true;
      waveTimeoutRef.current.forEach(clearTimeout);
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animId);
        sceneRef.current.cleanup();
        sceneRef.current = null;
      }
    };
  }, []);

  function animateRoomColor(
    i: number,
    r: number, g: number, b: number,
    duration: number,
    tr: number, tg: number, tb: number
  ) {
    if (!sceneRef.current) return;
    const mats = sceneRef.current.panelMats[i];
    const brightness = Math.max(0.12, 1 - i * 0.05);

    mats.forEach((mat) => {
      mat.uniforms.roomColor.value.setRGB(r * brightness, g * brightness, b * brightness);
    });

    const t = setTimeout(() => {
      if (!sceneRef.current) return;
      mats.forEach((mat) => {
        mat.uniforms.roomColor.value.setRGB(tr * brightness, tg * brightness, tb * brightness);
      });
    }, duration);
    waveTimeoutRef.current.push(t);
  }

  function handleNewGuest() {
    if (busy || !sceneRef.current) return;
    setBusy(true);
    setCounter("∞ + 1 = ∞");
    const counterDiv = (sceneRef.current as unknown as Record<string, HTMLDivElement>)
      .counterDiv;
    if (counterDiv) {
      counterDiv.style.opacity = "1";
      counterDiv.textContent = "∞ + 1 = ∞";
    }

    // BASE blue: #1e40af = 0.118, 0.251, 0.686
    const [br, bg, bb] = [0.118, 0.251, 0.686];
    // YELLOW: #fbbf24 = 0.984, 0.749, 0.141
    const [yr, yg, yb] = [0.984, 0.749, 0.141];

    for (let i = 0; i < NUM_ROOMS; i++) {
      const t = setTimeout(() => {
        animateRoomColor(i, yr, yg, yb, 380, br, bg, bb);
        if (i === NUM_ROOMS - 1) {
          setTimeout(() => setBusy(false), 700);
        }
      }, i * 80);
      waveTimeoutRef.current.push(t);
    }
  }

  function handleInfiniteBus() {
    if (busy || !sceneRef.current) return;
    setBusy(true);
    setCounter("∞ + ∞ = ∞");
    const counterDiv = (sceneRef.current as unknown as Record<string, HTMLDivElement>)
      .counterDiv;
    if (counterDiv) {
      counterDiv.style.opacity = "1";
      counterDiv.textContent = "∞ + ∞ = ∞";
    }

    type RGB = [number, number, number];
    const colorPalette: RGB[] = [
      [0.937, 0.267, 0.267],
      [0.984, 0.620, 0.040],
      [0.063, 0.725, 0.506],
      [0.486, 0.361, 0.929],
      [0.231, 0.510, 0.965],
      [0.925, 0.302, 0.596],
    ];

    let flashCount = 0;
    const totalFlashes = 35;
    const [br, bg, bb] = [0.118, 0.251, 0.686];

    const doFlash = () => {
      if (!sceneRef.current) return;
      for (let i = 0; i < NUM_ROOMS; i++) {
        const [r, g, b] = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        animateRoomColor(i, r, g, b, 180, r, g, b);
      }
      flashCount++;
      if (flashCount < totalFlashes) {
        const t = setTimeout(doFlash, 100);
        waveTimeoutRef.current.push(t);
      } else {
        for (let i = 0; i < NUM_ROOMS; i++) {
          const t = setTimeout(() => {
            animateRoomColor(i, br, bg, bb, 600, br, bg, bb);
            if (i === NUM_ROOMS - 1) {
              setTimeout(() => setBusy(false), 700);
            }
          }, i * 60);
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
