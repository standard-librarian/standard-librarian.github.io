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

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
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

      const camera = new THREE.PerspectiveCamera(60, W / HEIGHT, 0.1, 200);
      camera.position.set(0, 0, 18);
      camera.lookAt(0, 0, 0);

      const composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      const bloom = new UnrealBloomPass(
        new THREE.Vector2(W, HEIGHT),
        1.0,
        0.8,
        0.1
      );
      composer.addPass(bloom);

      // Particle attributes
      const positions = new Float32Array(PARTICLE_COUNT * 3);
      const aColor = new Float32Array(PARTICLE_COUNT * 3);
      const aSize = new Float32Array(PARTICLE_COUNT);
      const aSpeed = new Float32Array(PARTICLE_COUNT);

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const r = 2 + Math.random() * 6; // 2–8
        const dir = new THREE.Vector3().randomDirection();
        positions[i * 3] = dir.x * r;
        positions[i * 3 + 1] = dir.y * r;
        positions[i * 3 + 2] = dir.z * r;

        aSize[i] = 1.5 + Math.random() * 2.5; // 1.5–4.0

        const variant = Math.random();
        if (variant < 0.33) {
          // white
          aColor[i * 3] = 1.0;
          aColor[i * 3 + 1] = 1.0;
          aColor[i * 3 + 2] = 1.0;
        } else if (variant < 0.66) {
          // blue-white
          aColor[i * 3] = 0.7;
          aColor[i * 3 + 1] = 0.8;
          aColor[i * 3 + 2] = 1.0;
        } else {
          // warm
          aColor[i * 3] = 1.0;
          aColor[i * 3 + 1] = 0.9;
          aColor[i * 3 + 2] = 0.7;
        }

        aSpeed[i] = 0.5 + Math.random() * 1.5; // 0.5–2.0
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geo.setAttribute("aColor", new THREE.BufferAttribute(aColor, 3));
      geo.setAttribute("aSize", new THREE.BufferAttribute(aSize, 1));
      geo.setAttribute("aSpeed", new THREE.BufferAttribute(aSpeed, 1));

      const mat = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
        },
        vertexShader: /* glsl */ `
          attribute float aSize;
          attribute vec3 aColor;
          attribute float aSpeed;
          varying vec3 vColor;
          varying float vAlpha;
          uniform float time;
          void main() {
            vColor = aColor;
            vAlpha = 0.6 + 0.4 * sin(time * aSpeed + position.x * 10.0);
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = aSize * (250.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec3 vColor;
          varying float vAlpha;
          void main() {
            float d = distance(gl_PointCoord, vec2(0.5));
            if (d > 0.5) discard;
            float alpha = vAlpha * (1.0 - smoothstep(0.2, 0.5, d));
            gl_FragColor = vec4(vColor, alpha);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const points = new THREE.Points(geo, mat);
      scene.add(points);

      const clock = new THREE.Clock();
      let animId = 0;

      function animate() {
        animId = requestAnimationFrame(animate);
        const elapsed = clock.getElapsedTime();
        mat.uniforms.time.value = elapsed;
        points.rotation.y += 0.0015;
        points.rotation.x += 0.0003;
        composer.render();
      }
      animate();

      const ro = new ResizeObserver(() => {
        if (!container) return;
        const nw = container.clientWidth;
        camera.aspect = nw / HEIGHT;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, HEIGHT);
        composer.setSize(nw, HEIGHT);
      });
      ro.observe(container);

      // Count-up animation
      const target = 1e80;
      let count = 0;
      // Use exponential easing: start fast, slow down near end
      let phase = 0;
      const countInterval = setInterval(() => {
        if (cancelled) { clearInterval(countInterval); return; }
        phase = Math.min(phase + 0.018, 1.0);
        const eased = 1 - Math.pow(1 - phase, 2.5);
        count = eased * target;
        setDisplayCount(count);
        if (phase >= 1.0) clearInterval(countInterval);
      }, 16);

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
    const exp = Math.floor(Math.log10(Math.max(n, 1)));
    return `~10${exp.toString().split("").map((c) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[parseInt(c)] ?? c).join("")}`;
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
          pointerEvents: "none",
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
        <div style={{ color: "#93c5fd", fontSize: "13px", fontFamily: "system-ui, sans-serif" }}>
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
