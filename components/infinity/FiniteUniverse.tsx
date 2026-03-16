"use client";

import { useEffect, useRef, useState } from "react";

const PARTICLE_COUNT = 3000;
const HEIGHT = 300;

export function FiniteUniverse() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    if (!mountRef.current) return;
    let cancelled = false;

    async function init() {
      const THREE = await import("three");
      if (cancelled || !mountRef.current) return;

      const container = mountRef.current;
      const W = container.clientWidth;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
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

      const camera = new THREE.PerspectiveCamera(60, W / HEIGHT, 0.1, 200);
      camera.position.set(0, 0, 18);
      camera.lookAt(0, 0, 0);

      // Particles
      const positions = new Float32Array(PARTICLE_COUNT * 3);
      const colors = new Float32Array(PARTICLE_COUNT * 3);

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        // Spherical distribution
        const r = 6 * Math.cbrt(Math.random()); // cube root for uniform sphere fill
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);

        // Subtle color variation: mostly white with hints of blue/gold
        const variant = Math.random();
        if (variant < 0.1) {
          colors[i * 3] = 0.5 + Math.random() * 0.3;
          colors[i * 3 + 1] = 0.7 + Math.random() * 0.3;
          colors[i * 3 + 2] = 1.0;
        } else if (variant < 0.2) {
          colors[i * 3] = 1.0;
          colors[i * 3 + 1] = 0.9 + Math.random() * 0.1;
          colors[i * 3 + 2] = 0.5 + Math.random() * 0.3;
        } else {
          const v = 0.7 + Math.random() * 0.3;
          colors[i * 3] = v;
          colors[i * 3 + 1] = v;
          colors[i * 3 + 2] = v;
        }
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      const mat = new THREE.PointsMaterial({
        size: 0.06,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        sizeAttenuation: true,
      });

      const points = new THREE.Points(geo, mat);
      scene.add(points);

      // Subtle outer glow ring
      const ringGeo = new THREE.RingGeometry(6.5, 7, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x1e40af,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.12,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      scene.add(ring);

      const ro = new ResizeObserver(() => {
        const nw = container.clientWidth;
        camera.aspect = nw / HEIGHT;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, HEIGHT);
      });
      ro.observe(container);

      let animId = 0;
      function animate() {
        animId = requestAnimationFrame(animate);
        points.rotation.y += 0.0015;
        points.rotation.x += 0.0003;
        ring.rotation.z += 0.0008;
        renderer.render(scene, camera);
      }
      animate();

      // Count up animation
      const target = 1e80;
      let count = 0;
      const countInterval = setInterval(() => {
        if (cancelled) { clearInterval(countInterval); return; }
        count = Math.min(count + target / 60, target);
        setDisplayCount(count);
        if (count >= target) clearInterval(countInterval);
      }, 16);

      // Store cleanup
      (container as any)._cleanup = () => {
        cancelAnimationFrame(animId);
        ro.disconnect();
        renderer.dispose();
        clearInterval(countInterval);
        canvas.remove();
      };
    }

    init();

    return () => {
      cancelled = true;
      if (mountRef.current && (mountRef.current as any)._cleanup) {
        (mountRef.current as any)._cleanup();
      }
    };
  }, []);

  function formatCount(n: number): string {
    if (n >= 1e80) return "~10⁸⁰";
    const exp = Math.floor(Math.log10(n || 1));
    return `~10${exp.toString().replace(/(\d)/g, (c) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[parseInt(c)])}`;
  }

  return (
    <div
      style={{
        background: "#000",
        borderRadius: "10px",
        overflow: "hidden",
        border: "1px solid #1f1f1f",
        marginBottom: "2rem",
        position: "relative",
      }}
    >
      <div ref={mountRef} style={{ width: "100%", height: `${HEIGHT}px`, position: "relative" }} />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "20px 24px",
          background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, transparent 100%)",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        <div
          style={{
            color: "#f5f5f5",
            fontSize: "28px",
            fontFamily: "monospace",
            fontWeight: "700",
            textShadow: "0 0 20px rgba(255,255,255,0.3)",
            letterSpacing: "2px",
          }}
        >
          {formatCount(displayCount)} particles
        </div>
        <div
          style={{
            color: "#93c5fd",
            fontSize: "13px",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Observable universe: finite and measurable
        </div>
        <div
          style={{
            color: "#737373",
            fontSize: "12px",
            fontFamily: "system-ui, sans-serif",
            fontStyle: "italic",
            marginTop: "2px",
          }}
        >
          Infinity appears where models break — not where reality begins.
        </div>
      </div>
    </div>
  );
}
