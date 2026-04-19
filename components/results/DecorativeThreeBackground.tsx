"use client";

import { useEffect, useRef } from "react";
import type { AmbiguityTier } from "@/lib/types";

interface DecorativeThreeBackgroundProps {
  tier: AmbiguityTier;
  activeModuleIndex: number;
  isEnabled: boolean;
}

type ThreeNamespace = {
  Scene: new () => any;
  PerspectiveCamera: new (fov: number, aspect: number, near: number, far: number) => any;
  WebGLRenderer: new (params: { alpha: boolean; antialias: boolean; powerPreference: string }) => any;
  BufferGeometry: new () => any;
  Float32BufferAttribute: new (array: number[], itemSize: number) => any;
  PointsMaterial: new (params: Record<string, unknown>) => any;
  Points: new (geometry: any, material: any) => any;
  Group: new () => any;
};

declare global {
  interface Window {
    THREE?: ThreeNamespace;
  }
}

function loadThreeScript(): Promise<ThreeNamespace | null> {
  if (typeof window === "undefined") {
    return Promise.resolve(null);
  }

  if (window.THREE) {
    return Promise.resolve(window.THREE);
  }

  const existingScript = document.querySelector<HTMLScriptElement>('script[data-three="decorative-bg"]');

  if (existingScript) {
    return new Promise((resolve) => {
      existingScript.addEventListener("load", () => resolve(window.THREE ?? null), { once: true });
      existingScript.addEventListener("error", () => resolve(null), { once: true });
    });
  }

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://unpkg.com/three@0.160.0/build/three.min.js";
    script.async = true;
    script.dataset.three = "decorative-bg";
    script.onload = () => resolve(window.THREE ?? null);
    script.onerror = () => resolve(null);
    document.head.appendChild(script);
  });
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isLowPerformanceDevice(): boolean {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const fewCores = typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 4;
  const lowMemory = typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4;
  const dataSaver = Boolean(nav.connection?.saveData);

  return fewCores || lowMemory || dataSaver;
}

export function DecorativeThreeBackground({ tier, activeModuleIndex, isEnabled }: DecorativeThreeBackgroundProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!isEnabled || !mountRef.current) {
      return;
    }

    const hostElement = mountRef.current;
    let frameId = 0;
    let isMounted = true;
    let renderer: any;
    let cleanupResize: (() => void) | null = null;
    const shouldReduceEffects = prefersReducedMotion() || isLowPerformanceDevice();

    loadThreeScript().then((THREE) => {
      if (!THREE || !isMounted) {
        return;
      }

      const host = hostElement;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
      camera.position.z = 8;

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "low-power" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, shouldReduceEffects ? 1 : 1.5));
      renderer.setClearColor(0x000000, 0);
      host.appendChild(renderer.domElement);

      const particleCount = shouldReduceEffects ? 80 : 140;
      const spread = 10;
      const positions: number[] = [];

      for (let i = 0; i < particleCount; i += 1) {
        positions.push((Math.random() - 0.5) * spread, (Math.random() - 0.5) * spread, (Math.random() - 0.5) * 2);
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));

      const tierColors: Record<AmbiguityTier, number> = {
        1: 0x6ee7b7,
        2: 0xfde68a,
        3: 0xfca5a5,
      };

      const material = new THREE.PointsMaterial({
        color: tierColors[tier],
        transparent: true,
        opacity: shouldReduceEffects ? 0.07 : 0.1,
        size: shouldReduceEffects ? 0.04 : 0.06,
        depthWrite: false,
      });

      const points = new THREE.Points(geometry, material);
      const group = new THREE.Group();
      group.add(points);
      scene.add(group);

      const resize = () => {
        if (!mountRef.current) {
          return;
        }

        const { clientWidth, clientHeight } = mountRef.current;
        camera.aspect = clientWidth / Math.max(clientHeight, 1);
        camera.updateProjectionMatrix();
        renderer.setSize(clientWidth, clientHeight);
      };

      resize();
      window.addEventListener("resize", resize);
      cleanupResize = () => window.removeEventListener("resize", resize);

      const speedMultiplier = shouldReduceEffects ? 0.0007 : 0.0015;

      const animate = (time: number) => {
        if (!isMounted) {
          return;
        }

        group.rotation.y = time * speedMultiplier;
        group.rotation.x = Math.sin(time * speedMultiplier * 0.7) * 0.04;

        const moduleShift = (activeModuleIndex % 8) * 0.02;
        group.position.x += (moduleShift - group.position.x) * 0.03;

        renderer.render(scene, camera);

        if (!shouldReduceEffects) {
          frameId = window.requestAnimationFrame(animate);
        }
      };

      animate(0);

      if (!shouldReduceEffects) {
        frameId = window.requestAnimationFrame(animate);
      }
    });

    return () => {
      isMounted = false;
      window.cancelAnimationFrame(frameId);
      cleanupResize?.();

      if (renderer && hostElement.contains(renderer.domElement)) {
        hostElement.removeChild(renderer.domElement);
      }

      renderer?.dispose?.();
    };
  }, [activeModuleIndex, isEnabled, tier]);

  if (!isEnabled) {
    return null;
  }

  return <div ref={mountRef} aria-hidden="true" className="k-radius-primary pointer-events-none absolute inset-0 z-0 overflow-hidden" />;
}
