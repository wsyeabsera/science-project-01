import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useSimStore } from "./store";

const PLANET_SCALE = 8;

const BODY_ORDER = [
  "sun",
  "mercury",
  "venus",
  "earth",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
];

export function KeyboardControls({
  controlsRef,
  onFocusBody,
}: {
  controlsRef: React.RefObject<{ target: THREE.Vector3; update: () => void } | null>;
  onFocusBody: (name: string | null) => void;
}) {
  const { camera } = useThree();
  const bodies = useSimStore((s) => s.bodies);

  // Held key state — use ref to avoid re-renders
  const keysRef = useRef<Record<string, boolean>>({});

  // Smooth focus animation state
  const targetPositionRef = useRef<THREE.Vector3 | null>(null);
  const targetLookAtRef = useRef<THREE.Vector3 | null>(null);
  const focusedIndexRef = useRef<number>(-1);

  // Track which bodies exist at runtime
  const bodiesRef = useRef(bodies);
  useEffect(() => { bodiesRef.current = bodies; }, [bodies]);

  // Callback ref to avoid stale closure
  const onFocusBodyRef = useRef(onFocusBody);
  useEffect(() => { onFocusBodyRef.current = onFocusBody; }, [onFocusBody]);

  // Helper: focus a body by index in BODY_ORDER
  const focusBodyAtIndex = (idx: number) => {
    const allBodies = bodiesRef.current;
    if (allBodies.length === 0) return;

    // Clamp/wrap index within available bodies in BODY_ORDER that exist in store
    const availableIds = BODY_ORDER.filter((id) => allBodies.some((b) => b.id === id));
    if (availableIds.length === 0) return;

    const clampedIdx = ((idx % availableIds.length) + availableIds.length) % availableIds.length;
    focusedIndexRef.current = clampedIdx;

    const bodyId = availableIds[clampedIdx];
    const body = allBodies.find((b) => b.id === bodyId);
    if (!body || !controlsRef.current) return;

    const pos = new THREE.Vector3(...(body.position as [number, number, number]));

    const orbitDist =
      body.id === "sun"
        ? 150
        : Math.max(body.radius * PLANET_SCALE * 4, 30);

    // Position camera offset slightly above and in front
    const camOffset = new THREE.Vector3(orbitDist * 0.6, orbitDist * 0.4, orbitDist * 0.8).normalize().multiplyScalar(orbitDist);

    targetLookAtRef.current = pos.clone();
    targetPositionRef.current = pos.clone().add(camOffset);

    onFocusBodyRef.current(body.id.charAt(0).toUpperCase() + body.id.slice(1));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing in an input field
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) return;

      const key = e.key.toLowerCase();

      // Tab cycling
      if (e.key === "Tab") {
        e.preventDefault();
        const allBodies = bodiesRef.current;
        const availableIds = BODY_ORDER.filter((id) => allBodies.some((b) => b.id === id));
        if (availableIds.length === 0) return;
        const current = focusedIndexRef.current;
        const next = e.shiftKey
          ? (current <= 0 ? availableIds.length - 1 : current - 1)
          : (current + 1) % availableIds.length;
        focusBodyAtIndex(next);
        return;
      }

      // Number keys 1–9 for direct jump
      if (/^[1-9]$/.test(e.key)) {
        e.preventDefault();
        focusBodyAtIndex(parseInt(e.key, 10) - 1);
        return;
      }

      keysRef.current[key] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((_state, delta) => {
    if (!controlsRef.current) return;

    // ── Smooth focus lerp ──────────────────────────────────────────────────────
    if (targetPositionRef.current && targetLookAtRef.current) {
      const lerpFactor = 1 - Math.pow(0.001, delta);

      camera.position.lerp(targetPositionRef.current, lerpFactor);
      controlsRef.current.target.lerp(targetLookAtRef.current, lerpFactor);
      controlsRef.current.update();

      // Stop lerping when close enough
      if (
        camera.position.distanceTo(targetPositionRef.current) < 0.1 &&
        controlsRef.current.target.distanceTo(targetLookAtRef.current) < 0.1
      ) {
        camera.position.copy(targetPositionRef.current);
        controlsRef.current.target.copy(targetLookAtRef.current);
        targetPositionRef.current = null;
        targetLookAtRef.current = null;
      }
    }

    // ── WASD free-fly ─────────────────────────────────────────────────────────
    const keys = keysRef.current;
    const moving =
      keys["w"] || keys["s"] || keys["a"] || keys["d"] || keys["q"] || keys["e"];

    if (!moving) return;

    // Cancel any in-progress focus animation when user takes manual control
    targetPositionRef.current = null;
    targetLookAtRef.current = null;

    const dist = camera.position.distanceTo(controlsRef.current.target);
    const speed = dist * 0.8 * delta;

    // Forward = camera look direction (full 3D)
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);

    // Right = camera right vector
    const right = new THREE.Vector3();
    right.crossVectors(forward, camera.up).normalize();

    const movement = new THREE.Vector3();

    if (keys["w"]) movement.addScaledVector(forward, speed);
    if (keys["s"]) movement.addScaledVector(forward, -speed);
    if (keys["a"]) movement.addScaledVector(right, -speed);
    if (keys["d"]) movement.addScaledVector(right, speed);
    if (keys["e"]) movement.y += speed;
    if (keys["q"]) movement.y -= speed;

    camera.position.add(movement);
    controlsRef.current.target.add(movement);
    controlsRef.current.update();
  });

  return null;
}
