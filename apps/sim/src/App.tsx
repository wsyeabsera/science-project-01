import { useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { StarField } from "@astrophysics-playground/ui/three";
import { connectBridge } from "./ws/bridge";
import { useSimStore, type Body } from "./store";

// Visual radius multiplier so planets are large enough to see
const PLANET_SCALE = 8;
const MIN_RADIUS = 1.5;

// ── Sun ──────────────────────────────────────────────────────────────────────
function Sun({ body }: { body: Body }) {
  const pos = body.position as [number, number, number];
  return (
    <group position={pos}>
      {/* Core */}
      <mesh>
        <sphereGeometry args={[body.radius, 48, 48]} />
        <meshStandardMaterial
          color={0x000000}
          emissive={new THREE.Color(body.color)}
          emissiveIntensity={3}
        />
      </mesh>
      {/* Inner glow */}
      <mesh>
        <sphereGeometry args={[body.radius * 1.2, 32, 32]} />
        <meshStandardMaterial
          color={body.color}
          emissive={new THREE.Color(body.color)}
          emissiveIntensity={1}
          transparent
          opacity={0.3}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[body.radius * 1.6, 32, 32]} />
        <meshStandardMaterial
          color={body.color}
          emissive={new THREE.Color(body.color)}
          emissiveIntensity={0.4}
          transparent
          opacity={0.1}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      <pointLight color={body.color} intensity={4} decay={0.3} />
    </group>
  );
}

// ── Planet ────────────────────────────────────────────────────────────────────
function Planet({ body }: { body: Body }) {
  const r = Math.max(body.radius * PLANET_SCALE, MIN_RADIUS);
  const pos = body.position as [number, number, number];
  return (
    <mesh position={pos}>
      <sphereGeometry args={[r, 48, 48]} />
      <meshStandardMaterial color={body.color} roughness={0.85} metalness={0} />
    </mesh>
  );
}

// ── Orbit ring (circle at body's current radial distance from origin) ─────────
function OrbitRing({ body }: { body: Body }) {
  const [bx, , bz] = body.position;
  const r = Math.sqrt(bx * bx + bz * bz);
  if (r < 1) return null;

  const positions = useMemo(() => {
    const pts = new Float32Array(129 * 3);
    for (let i = 0; i <= 128; i++) {
      const θ = (i / 128) * Math.PI * 2;
      pts[i * 3]     = Math.cos(θ) * r;
      pts[i * 3 + 1] = 0;
      pts[i * 3 + 2] = Math.sin(θ) * r;
    }
    return pts;
  }, [r]);

  return (
    <lineLoop>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color="#ffffff" transparent opacity={0.18} />
    </lineLoop>
  );
}

// ── Camera controller: responds to store.camera (set via MCP set_camera) ──────
function CameraController({ controlsRef }: { controlsRef: React.RefObject<{ target: THREE.Vector3; update: () => void } | null> }) {
  const { camera } = useThree();
  const storeCamera = useSimStore((s) => s.camera);
  const bodies = useSimStore((s) => s.bodies);

  useEffect(() => {
    if (!storeCamera || !controlsRef.current) return;
    const target = bodies.find((b) => b.id === storeCamera.target);
    if (!target) return;

    const [tx, ty, tz] = target.position;
    const { distance, azimuth, elevation } = storeCamera;
    const az = (azimuth * Math.PI) / 180;
    const el = (elevation * Math.PI) / 180;

    camera.position.set(
      tx + distance * Math.cos(el) * Math.sin(az),
      ty + distance * Math.sin(el),
      tz + distance * Math.cos(el) * Math.cos(az)
    );
    controlsRef.current.target.set(tx, ty, tz);
    controlsRef.current.update();
  }, [storeCamera, bodies, camera, controlsRef]);

  return null;
}

// ── Auto-fit: when first bodies arrive with no camera set, frame inner system ─
function AutoFit({ controlsRef }: { controlsRef: React.RefObject<{ target: THREE.Vector3; update: () => void } | null> }) {
  const { camera } = useThree();
  const bodies = useSimStore((s) => s.bodies);
  const storeCamera = useSimStore((s) => s.camera);
  const fitted = useRef(false);

  useEffect(() => {
    if (fitted.current || storeCamera || bodies.length === 0 || !controlsRef.current) return;
    // Frame the bounding box of all bodies
    const positions = bodies.map((b) => new THREE.Vector3(...(b.position as [number, number, number])));
    const box = new THREE.Box3().setFromPoints(positions);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3()).length();
    const dist = Math.max(size * 0.8, 200);

    camera.position.set(center.x, dist * 0.4, center.z + dist * 0.7);
    controlsRef.current.target.copy(center);
    controlsRef.current.update();
    fitted.current = true;
  }, [bodies, storeCamera, camera, controlsRef]);

  // Reset fitted flag when scene reloads
  useEffect(() => { fitted.current = false; }, [bodies.length === 0]);

  return null;
}

// ── Scene ─────────────────────────────────────────────────────────────────────
function SceneContent() {
  const bodies = useSimStore((s) => s.bodies);
  const controlsRef = useRef<{ target: THREE.Vector3; update: () => void } | null>(null);
  const sun = bodies.find((b) => b.id === "sun");
  const planets = bodies.filter((b) => b.id !== "sun");

  return (
    <>
      <color attach="background" args={["#000005"]} />
      <ambientLight intensity={0.02} />
      <StarField count={20000} />

      {sun && <Sun body={sun} />}
      {planets.map((body) => (
        <group key={body.id}>
          <Planet body={body} />
          <OrbitRing body={body} />
        </group>
      ))}

      <OrbitControls
        ref={controlsRef as React.RefObject<never>}
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={8000}
      />
      <CameraController controlsRef={controlsRef} />
      <AutoFit controlsRef={controlsRef} />
    </>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const { playback, simTime, bodies } = useSimStore();

  useEffect(() => {
    const disconnect = connectBridge();
    return disconnect;
  }, []);

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <Canvas camera={{ position: [0, 300, 500], fov: 45 }}>
        <SceneContent />
      </Canvas>
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          color: "#fff",
          fontFamily: "monospace",
          fontSize: 12,
          textShadow: "0 0 6px #000",
          pointerEvents: "none",
        }}
      >
        <div>Status: {playback}</div>
        <div>T+{simTime.toFixed(1)}s</div>
        <div>Bodies: {bodies.length}</div>
      </div>
    </div>
  );
}
