"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export function MdhtPortrait() {
  const [isWink, setIsWink] = useState(false);
  const [motionEnabled, setMotionEnabled] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const lastTriggerRef = useRef(0);

  const triggerWink = () => {
    const now = Date.now();
    if (now - lastTriggerRef.current < 800) return;
    lastTriggerRef.current = now;
    setIsWink(true);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setIsWink(false), 1200);
  };

  const enableMotionIfNeeded = async () => {
    if (motionEnabled) return;
    const maybeRequest = async (evt: typeof DeviceMotionEvent | typeof DeviceOrientationEvent) => {
      const anyEvt = evt as unknown as { requestPermission?: () => Promise<PermissionState> };
      if (typeof anyEvt.requestPermission === "function") {
        const res = await anyEvt.requestPermission();
        return res === "granted";
      }
      return true;
    };

    try {
      const motionOk = typeof DeviceMotionEvent !== "undefined"
        ? await maybeRequest(DeviceMotionEvent)
        : true;
      const orientOk = typeof DeviceOrientationEvent !== "undefined"
        ? await maybeRequest(DeviceOrientationEvent)
        : true;
      if (motionOk && orientOk) setMotionEnabled(true);
    } catch {
      // ignore permission errors; tap still works
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!motionEnabled) return;

    const onTilt = (event: DeviceOrientationEvent) => {
      const beta = event.beta ?? 0;
      const gamma = event.gamma ?? 0;
      if (Math.abs(beta) > 25 || Math.abs(gamma) > 25) {
        triggerWink();
      }
    };

    const onShake = (event: DeviceMotionEvent) => {
      const accel = event.accelerationIncludingGravity ?? event.acceleration;
      if (!accel) return;
      const x = accel.x ?? 0;
      const y = accel.y ?? 0;
      const z = accel.z ?? 0;
      const magnitude = Math.abs(x) + Math.abs(y) + Math.abs(z);
      if (magnitude > 35) {
        triggerWink();
      }
    };

    window.addEventListener("deviceorientation", onTilt, { passive: true });
    window.addEventListener("devicemotion", onShake, { passive: true });
    return () => {
      window.removeEventListener("deviceorientation", onTilt);
      window.removeEventListener("devicemotion", onShake);
    };
  }, [motionEnabled]);

  return (
    <button
      type="button"
      className={`mdht-portrait${isWink ? " is-wink" : ""}`}
      onClick={() => {
        triggerWink();
        enableMotionIfNeeded();
      }}
      aria-label="Mdht portrait"
    >
      <span className="mdht-portrait-stack">
        <Image
          src="/mdht.png"
          alt="Mdht"
          fill
          sizes="220px"
          className="mdht-portrait-img mdht-portrait-base"
          priority
        />
        <Image
          src="/mdht-wink.png"
          alt="Mdht winking"
          fill
          sizes="220px"
          className="mdht-portrait-img mdht-portrait-wink"
        />
      </span>
    </button>
  );
}
