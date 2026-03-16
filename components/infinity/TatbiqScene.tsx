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
    animId: number;
    ro: ResizeObserver;
    updateScene: (s: number) => void;
    cleanup: () => void;
  } | null>(null);

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
      const WIDTH = container.clientWidth;
      const HEIGHT = 380;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(WIDTH, HEIGHT);
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
      scene.fog = new THREE.FogExp2(0x000000, 0.04);

      const camera = new THREE.PerspectiveCamera(55, WIDTH / HEIGHT, 0.1, 200);
      camera.position.set(11, 6, 14);
      camera.lookAt(11, 0, 0);

      // Post-processing
      const composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      const bloom = new UnrealBloomPass(
        new THREE.Vector2(WIDTH, HEIGHT),
        1.5,
        0.4,
        0.1
      );
      composer.addPass(bloom);

      // --- Fresnel ShaderMaterial factory ---
      const fresnelVert = /* glsl */ `
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `;
      const fresnelFrag = /* glsl */ `
        uniform vec3 baseColor;
        uniform vec3 glowColor;
        uniform float time;
        uniform float pulse;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        void main() {
          vec3 viewDir = normalize(cameraPosition - vWorldPosition);
          float fresnel = pow(1.0 - dot(viewDir, vNormal), 2.5);
          vec3 col = mix(baseColor, glowColor * pulse, fresnel);
          gl_FragColor = vec4(col, 0.7 + fresnel * 0.3);
        }
      `;

      function makeSpheremat(
        base: string,
        glow: string,
        isOrphan = false
      ): THREE.ShaderMaterial {
        return new THREE.ShaderMaterial({
          uniforms: {
            baseColor: { value: new THREE.Color(base) },
            glowColor: { value: new THREE.Color(glow) },
            time: { value: 0 },
            pulse: { value: 1.0 },
          },
          vertexShader: fresnelVert,
          fragmentShader: fresnelFrag,
          transparent: true,
        });
      }

      const geo = new THREE.SphereGeometry(0.38, 32, 32);

      // Row A spheres (purple)
      const spheresA: THREE.Mesh[] = [];
      const matsA: THREE.ShaderMaterial[] = [];
      for (let i = 0; i < N; i++) {
        const mat = makeSpheremat("#1e0a40", "#a855f7");
        matsA.push(mat);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set((i + 1) * SPACING, ROW_Y, 0);
        scene.add(mesh);
        spheresA.push(mesh);
      }

      // Row B spheres (cyan)
      const spheresB: THREE.Mesh[] = [];
      const matsB: THREE.ShaderMaterial[] = [];
      for (let i = 0; i < N; i++) {
        const mat = makeSpheremat("#052e3f", "#22d3ee");
        matsB.push(mat);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set((i + 2) * SPACING, -ROW_Y, 0);
        scene.add(mesh);
        spheresB.push(mesh);
      }

      // Thread line shader with animated dash effect
      const threadVert = /* glsl */ `
        attribute float aProgress;
        varying float vProgress;
        void main() {
          vProgress = aProgress;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `;
      const threadFrag = /* glsl */ `
        uniform float opacity;
        uniform float time;
        varying float vProgress;
        void main() {
          float dash = fract(vProgress * 8.0 - time * 0.5);
          float alpha = step(0.3, dash) * opacity;
          gl_FragColor = vec4(0.96, 0.62, 0.04, alpha);
        }
      `;

      // Thread geometry helper — line with aProgress 0→1
      function makeThreadGeo(
        bx: number,
        ax: number
      ): THREE.BufferGeometry {
        const N_SEGS = 30;
        const positions = new Float32Array((N_SEGS + 1) * 3);
        const progress = new Float32Array(N_SEGS + 1);
        for (let k = 0; k <= N_SEGS; k++) {
          const t = k / N_SEGS;
          positions[k * 3] = bx + (ax - bx) * t;
          positions[k * 3 + 1] = -ROW_Y + (ROW_Y - -ROW_Y) * t;
          positions[k * 3 + 2] = 0;
          progress[k] = t;
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        g.setAttribute("aProgress", new THREE.BufferAttribute(progress, 1));
        return g;
      }

      const threadMats: THREE.ShaderMaterial[] = [];
      const threads: THREE.Line[] = [];
      for (let i = 0; i < N; i++) {
        const mat = new THREE.ShaderMaterial({
          uniforms: {
            opacity: { value: 0 },
            time: { value: 0 },
          },
          vertexShader: threadVert,
          fragmentShader: threadFrag,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        threadMats.push(mat);
        const bx = (i + 2) * SPACING;
        const ax = (i + 1) * SPACING;
        const line = new THREE.Line(makeThreadGeo(bx, ax), mat);
        scene.add(line);
        threads.push(line);
      }

      // Label overlay
      container.style.position = "relative";
      const labelContainer = document.createElement("div");
      labelContainer.style.cssText =
        "position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:hidden;";
      container.appendChild(labelContainer);

      const sphereLabelsA: HTMLDivElement[] = [];
      for (let i = 0; i < N; i++) {
        const div = document.createElement("div");
        div.textContent = String(i + 1);
        div.style.cssText =
          "position:absolute;color:#a78bfa;font-size:11px;font-family:monospace;transform:translate(-50%,-50%);pointer-events:none;text-shadow:0 0 8px #a855f7;";
        labelContainer.appendChild(div);
        sphereLabelsA.push(div);
      }
      const sphereLabelsB: HTMLDivElement[] = [];
      for (let i = 0; i < N; i++) {
        const div = document.createElement("div");
        div.textContent = String(i + 2);
        div.style.cssText =
          "position:absolute;color:#67e8f9;font-size:11px;font-family:monospace;transform:translate(-50%,-50%);pointer-events:none;text-shadow:0 0 8px #22d3ee;";
        labelContainer.appendChild(div);
        sphereLabelsB.push(div);
      }

      const rowALabel = document.createElement("div");
      rowALabel.textContent = "A";
      rowALabel.style.cssText =
        "position:absolute;color:#a78bfa;font-size:14px;font-weight:bold;font-family:monospace;transform:translate(-50%,-50%);text-shadow:0 0 10px #a855f7;";
      labelContainer.appendChild(rowALabel);

      const rowBLabel = document.createElement("div");
      rowBLabel.textContent = "B";
      rowBLabel.style.cssText =
        "position:absolute;color:#67e8f9;font-size:14px;font-weight:bold;font-family:monospace;transform:translate(-50%,-50%);text-shadow:0 0 10px #22d3ee;";
      labelContainer.appendChild(rowBLabel);

      const statusLabel = document.createElement("div");
      statusLabel.style.cssText =
        "position:absolute;bottom:16px;left:50%;transform:translateX(-50%);color:#f5f5f5;font-size:13px;font-family:monospace;text-align:center;padding:6px 14px;background:rgba(0,0,0,0.75);border-radius:6px;border:1px solid #333;max-width:90%;line-height:1.5;";
      labelContainer.appendChild(statusLabel);

      const contradictionLabel = document.createElement("div");
      contradictionLabel.style.cssText =
        "position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#f59e0b;font-size:22px;font-weight:bold;font-family:monospace;text-shadow:0 0 20px #f59e0b,0 0 40px #f59e0b;opacity:0;transition:opacity 0.3s;letter-spacing:4px;pointer-events:none;";
      contradictionLabel.textContent = "⚡ CONTRADICTION";
      labelContainer.appendChild(contradictionLabel);

      let currentSlider = 0;

      function projectToScreen(pos: THREE.Vector3): { x: number; y: number } {
        const v = pos.clone().project(camera);
        const x = ((v.x + 1) / 2) * WIDTH;
        const y = ((-v.y + 1) / 2) * HEIGHT;
        return { x, y };
      }

      function rebuildThreadGeo(i: number, bx: number) {
        const ax = (i + 1) * SPACING;
        const g = makeThreadGeo(bx, ax);
        threads[i].geometry.dispose();
        threads[i].geometry = g;
      }

      function updateScene(slider: number) {
        currentSlider = slider;
        const bOffset = -slider * SPACING;

        for (let i = 0; i < N; i++) {
          const newX = (i + 2) * SPACING + bOffset;
          spheresB[i].position.x = newX;
          rebuildThreadGeo(i, newX);
        }

        // Orphan sphere A[0]
        if (slider < 0.45) {
          matsA[0].uniforms.baseColor.value.set("#3f0a0a");
          matsA[0].uniforms.glowColor.value.set("#f87171");
        } else {
          matsA[0].uniforms.baseColor.value.set("#1e0a40");
          matsA[0].uniforms.glowColor.value.set("#a855f7");
        }

        // Thread opacity
        const threadOpacity = Math.max(0, (slider - 0.2) / 0.8);
        for (let i = 0; i < N; i++) {
          threadMats[i].uniforms.opacity.value = threadOpacity;
        }

        // Status labels
        if (slider < 0.35) {
          statusLabel.innerHTML =
            '<span style="color:#f87171">1 ∈ A, but 1 ∉ B</span> → B ⊂ A strictly → <span style="color:#f59e0b">|A| &gt; |B|</span>';
          contradictionLabel.style.opacity = "0";
        } else if (slider > 0.65) {
          statusLabel.innerHTML =
            'f(n) = n+1 is a bijection → <span style="color:#34d399">|A| = |B|</span>';
          contradictionLabel.style.opacity = "0";
        } else {
          statusLabel.innerHTML =
            '<span style="color:#a78bfa">|A| &gt; |B|</span> &nbsp;AND&nbsp; <span style="color:#34d399">|A| = |B|</span>';
          contradictionLabel.style.opacity = "1";
        }
      }

      const clock = new THREE.Clock();

      function animate() {
        const id = requestAnimationFrame(animate);
        sceneStateRef.current!.animId = id;

        const elapsed = clock.getElapsedTime();

        // Update time uniforms
        for (let i = 0; i < N; i++) {
          threadMats[i].uniforms.time.value = elapsed;
        }

        // Orphan pulse
        if (currentSlider < 0.45) {
          const pulse = 0.7 + 0.3 * Math.sin(elapsed * 3.0);
          matsA[0].uniforms.pulse.value = pulse;
        } else {
          matsA[0].uniforms.pulse.value = 1.0;
        }

        // Camera drift
        camera.position.x = 11 + Math.sin(elapsed * 0.2) * 0.8;
        camera.position.y = 6 + Math.cos(elapsed * 0.14) * 0.4;
        camera.lookAt(11, 0, 0);

        composer.render();

        // Update label positions
        for (let i = 0; i < N; i++) {
          const pa = projectToScreen(spheresA[i].position);
          sphereLabelsA[i].style.left = `${pa.x}px`;
          sphereLabelsA[i].style.top = `${pa.y}px`;

          const pb = projectToScreen(spheresB[i].position);
          sphereLabelsB[i].style.left = `${pb.x}px`;
          sphereLabelsB[i].style.top = `${pb.y}px`;
        }

        const pA = projectToScreen(new THREE.Vector3(SPACING - 0.8, ROW_Y, 0));
        rowALabel.style.left = `${pA.x}px`;
        rowALabel.style.top = `${pA.y}px`;

        const pB = projectToScreen(
          new THREE.Vector3(SPACING + 0.2 - 0.8, -ROW_Y, 0)
        );
        rowBLabel.style.left = `${pB.x}px`;
        rowBLabel.style.top = `${pB.y}px`;
      }

      const ro = new ResizeObserver(() => {
        if (!container) return;
        const w = container.clientWidth;
        camera.aspect = w / HEIGHT;
        camera.updateProjectionMatrix();
        renderer.setSize(w, HEIGHT);
        composer.setSize(w, HEIGHT);
      });
      ro.observe(container);

      sceneStateRef.current = {
        animId: 0,
        ro,
        updateScene,
        cleanup: () => {
          ro.disconnect();
          renderer.dispose();
          labelContainer.remove();
          canvas.remove();
        },
      };

      updateScene(0);
      animate();
    }

    init();

    return () => {
      cancelled = true;
      if (sceneStateRef.current) {
        cancelAnimationFrame(sceneStateRef.current.animId);
        sceneStateRef.current.cleanup();
        sceneStateRef.current = null;
      }
    };
  }, []);

  function handleSlider(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseFloat(e.target.value);
    setSliderValue(val);
    sceneStateRef.current?.updateScene(val);
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
          <span style={{ color: "#737373", fontSize: "11px", fontFamily: "monospace", minWidth: "110px" }}>
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
            style={{ flex: 1, accentColor: "#f59e0b", cursor: "pointer" }}
          />
          <span style={{ color: "#737373", fontSize: "11px", fontFamily: "monospace", minWidth: "80px", textAlign: "right" }}>
            Bijection
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            style={{
              color: sliderValue < 0.35 ? "#a78bfa" : sliderValue > 0.65 ? "#34d399" : "#f59e0b",
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
              already accepted that actual infinite sets exist and can be compared.
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
