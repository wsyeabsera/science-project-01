import { useEffect, useRef, useMemo, Suspense, useState, useCallback } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import { StarField } from "@astrophysics-playground/ui/three";
import { connectBridge } from "./ws/bridge";
import { useSimStore, type Body } from "./store";
import { KeyboardControls } from "./KeyboardControls";

// Visual radius multiplier so planets are large enough to see
const PLANET_SCALE = 8;
const MIN_RADIUS = 1.5;

const TEXTURE_PATHS: Record<string, string> = {
  sun: "/textures/sun.jpg",
  mercury: "/textures/mercury.jpg",
  venus: "/textures/venus.jpg",
  earth: "/textures/earth.jpg",
  mars: "/textures/mars.jpg",
  jupiter: "/textures/jupiter.jpg",
  saturn: "/textures/saturn.jpg",
  "saturn-rings-color": "/textures/saturn-ring-color.jpg",
  "saturn-rings-alpha": "/textures/saturn-ring-alpha.gif",
  uranus: "/textures/uranus.jpg",
  neptune: "/textures/neptune.jpg",
  "earth-clouds": "/textures/earth-clouds.jpg",
  "earth-clouds-alpha": "/textures/earth-clouds-alpha.jpg",
  "earth-specular": "/textures/earth-specular.jpg",
};

// ── Saturn rings ──────────────────────────────────────────────────────────────
function SaturnRingsInner({ innerRadius, outerRadius }: { innerRadius: number; outerRadius: number }) {
  const [colorMap, alphaMap] = useTexture([
    TEXTURE_PATHS["saturn-rings-color"],
    TEXTURE_PATHS["saturn-rings-alpha"],
  ]);
  colorMap.colorSpace = THREE.SRGBColorSpace;

  const geometry = useMemo(() => {
    const geo = new THREE.RingGeometry(innerRadius, outerRadius, 128);
    const pos = geo.attributes.position;
    const uv = geo.attributes.uv;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const t = (v.length() - innerRadius) / (outerRadius - innerRadius);
      uv.setXY(i, t, t);
    }
    uv.needsUpdate = true;
    return geo;
  }, [innerRadius, outerRadius]);

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
      <meshBasicMaterial map={colorMap} alphaMap={alphaMap} transparent side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

function SaturnRings(props: { innerRadius: number; outerRadius: number }) {
  return (
    <Suspense fallback={null}>
      <SaturnRingsInner {...props} />
    </Suspense>
  );
}

// ── Sun ──────────────────────────────────────────────────────────────────────
function SunInner({ body, onSelectBody }: { body: Body; onSelectBody?: (body: Body) => void }) {
  const pos = body.position as [number, number, number];
  const texture = useTexture(TEXTURE_PATHS.sun);
  texture.colorSpace = THREE.SRGBColorSpace;

  return (
    <group position={pos} onClick={onSelectBody ? (e) => { e.stopPropagation(); onSelectBody(body); } : undefined}>
      <mesh>
        <sphereGeometry args={[body.radius, 48, 48]} />
        <meshStandardMaterial
          map={texture}
          emissiveMap={texture}
          emissive={new THREE.Color(body.color)}
          emissiveIntensity={1.5}
        />
      </mesh>
      {/* Inner glow */}
      <mesh>
        <sphereGeometry args={[body.radius * 1.2, 32, 32]} />
        <meshStandardMaterial
          color={body.color}
          emissive={new THREE.Color(body.color)}
          emissiveIntensity={1}
          transparent opacity={0.3}
          side={THREE.BackSide} depthWrite={false}
        />
      </mesh>
      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[body.radius * 1.6, 32, 32]} />
        <meshStandardMaterial
          color={body.color}
          emissive={new THREE.Color(body.color)}
          emissiveIntensity={0.4}
          transparent opacity={0.1}
          side={THREE.BackSide} depthWrite={false}
        />
      </mesh>
      <pointLight color="#ffffff" intensity={60} decay={1} />
    </group>
  );
}

function Sun({ body, onSelectBody }: { body: Body; onSelectBody?: (body: Body) => void }) {
  const pos = body.position as [number, number, number];
  return (
    <Suspense fallback={
      <group position={pos} onClick={onSelectBody ? (e) => { e.stopPropagation(); onSelectBody(body); } : undefined}>
        <mesh>
          <sphereGeometry args={[body.radius, 48, 48]} />
          <meshStandardMaterial color={body.color} emissive={new THREE.Color(body.color)} emissiveIntensity={3} />
        </mesh>
        <pointLight color="#ffffff" intensity={60} decay={1} />
      </group>
    }>
      <SunInner body={body} onSelectBody={onSelectBody} />
    </Suspense>
  );
}

// ── Earth clouds ──────────────────────────────────────────────────────────────
function EarthCloudsInner({ r }: { r: number }) {
  const [cloudMap, cloudAlpha] = useTexture([
    TEXTURE_PATHS["earth-clouds"],
    TEXTURE_PATHS["earth-clouds-alpha"],
  ]);
  cloudMap.colorSpace = THREE.SRGBColorSpace;
  return (
    <mesh>
      <sphereGeometry args={[r * 1.012, 48, 48]} />
      <meshStandardMaterial
        map={cloudMap}
        alphaMap={cloudAlpha}
        transparent
        opacity={0.9}
        side={THREE.DoubleSide}
        depthWrite={false}
        roughness={1}
        metalness={0}
      />
    </mesh>
  );
}

// ── Planet ────────────────────────────────────────────────────────────────────
function PlanetInner({ body, onSelectBody }: { body: Body; onSelectBody?: (body: Body) => void }) {
  const r = Math.max(body.radius * PLANET_SCALE, MIN_RADIUS);
  const pos = body.position as [number, number, number];
  const isEarth = body.id === "earth";

  const texPaths = isEarth
    ? [TEXTURE_PATHS.earth, TEXTURE_PATHS["earth-specular"]]
    : [TEXTURE_PATHS[body.texture] ?? TEXTURE_PATHS.mercury];

  const textures = useTexture(texPaths);
  const texture = Array.isArray(textures) ? textures[0] : textures;
  const specularMap = isEarth && Array.isArray(textures) ? textures[1] : undefined;

  texture.colorSpace = THREE.SRGBColorSpace;

  const rings = body.rings;

  return (
    <group position={pos} onClick={onSelectBody ? (e) => { e.stopPropagation(); onSelectBody(body); } : undefined}>
      <mesh>
        <sphereGeometry args={[r, 48, 48]} />
        <meshStandardMaterial
          map={texture}
          roughnessMap={specularMap}
          roughness={isEarth ? 0.6 : 0.85}
          metalness={isEarth ? 0.05 : 0}
        />
      </mesh>
      {isEarth && (
        <Suspense fallback={null}>
          <EarthCloudsInner r={r} />
        </Suspense>
      )}
      {rings && (
        <SaturnRings
          innerRadius={rings.innerRadius * PLANET_SCALE}
          outerRadius={rings.outerRadius * PLANET_SCALE}
        />
      )}
    </group>
  );
}

function Planet({ body, onSelectBody }: { body: Body; onSelectBody?: (body: Body) => void }) {
  const r = Math.max(body.radius * PLANET_SCALE, MIN_RADIUS);
  const pos = body.position as [number, number, number];
  return (
    <Suspense fallback={
      <mesh position={pos} onClick={onSelectBody ? (e) => { e.stopPropagation(); onSelectBody(body); } : undefined}>
        <sphereGeometry args={[r, 48, 48]} />
        <meshStandardMaterial color={body.color} roughness={0.85} metalness={0} />
      </mesh>
    }>
      <PlanetInner body={body} onSelectBody={onSelectBody} />
    </Suspense>
  );
}

// ── Orbit ring ────────────────────────────────────────────────────────────────
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

// ── Camera controller ─────────────────────────────────────────────────────────
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

// ── Auto-fit ──────────────────────────────────────────────────────────────────
function AutoFit({ controlsRef }: { controlsRef: React.RefObject<{ target: THREE.Vector3; update: () => void } | null> }) {
  const { camera } = useThree();
  const bodies = useSimStore((s) => s.bodies);
  const storeCamera = useSimStore((s) => s.camera);
  const fitted = useRef(false);

  useEffect(() => {
    if (fitted.current || storeCamera || bodies.length === 0 || !controlsRef.current) return;
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

  useEffect(() => { fitted.current = false; }, [bodies.length === 0]);

  return null;
}

// ── Scene ─────────────────────────────────────────────────────────────────────
function SceneContent({
  onFocusBody,
  onSelectBody,
  autoRotate,
  onManualControl,
}: {
  onFocusBody: (name: string | null) => void;
  onSelectBody: (body: Body) => void;
  autoRotate: boolean;
  onManualControl: () => void;
}) {
  const bodies = useSimStore((s) => s.bodies);
  const controlsRef = useRef<{ target: THREE.Vector3; update: () => void } | null>(null);
  const sun = bodies.find((b) => b.id === "sun");
  const planets = bodies.filter((b) => b.id !== "sun");

  return (
    <>
      <color attach="background" args={["#000005"]} />
      <ambientLight intensity={0.02} />
      <StarField count={20000} />

      {sun && <Sun body={sun} onSelectBody={onSelectBody} />}
      {planets.map((body) => (
        <group key={body.id}>
          <Planet body={body} onSelectBody={onSelectBody} />
          <OrbitRing body={body} />
        </group>
      ))}

      <OrbitControls
        ref={controlsRef as React.RefObject<never>}
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={8000}
        autoRotate={autoRotate}
        autoRotateSpeed={0.5}
      />
      <CameraController controlsRef={controlsRef} />
      <AutoFit controlsRef={controlsRef} />
      <KeyboardControls
        controlsRef={controlsRef}
        onFocusBody={onFocusBody}
        onManualControl={onManualControl}
      />
    </>
  );
}

// ── Keyboard shortcuts panel ──────────────────────────────────────────────────
const SHORTCUTS = [
  { keys: "W A S D", action: "Free-fly camera" },
  { keys: "Q / E", action: "Move up / down" },
  { keys: "Tab", action: "Next planet" },
  { keys: "Shift+Tab", action: "Previous planet" },
  { keys: "1 – 9", action: "Jump to planet" },
  { keys: "Click", action: "Focus & auto-rotate" },
  { keys: "?", action: "Toggle this panel" },
];

function KeyBadge({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        background: "rgba(255,255,255,0.1)",
        border: "1px solid rgba(255,255,255,0.25)",
        borderRadius: 4,
        padding: "1px 5px",
        fontFamily: "monospace",
        fontSize: 11,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function ShortcutsPanel({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Delay so the toggle button click doesn't immediately close
    const id = setTimeout(() => document.addEventListener("mousedown", handleClick), 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div
      ref={panelRef}
      style={{
        position: "fixed",
        bottom: 70,
        right: 24,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 10,
        padding: 16,
        minWidth: 260,
        zIndex: 100,
        color: "#fff",
      }}
    >
      <div
        style={{
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: "#aaa",
          marginBottom: 12,
          fontFamily: "sans-serif",
        }}
      >
        Controls
      </div>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <tbody>
          {SHORTCUTS.map(({ keys, action }) => (
            <tr key={keys}>
              <td style={{ paddingBottom: 8, paddingRight: 14, verticalAlign: "middle" }}>
                <KeyBadge>{keys}</KeyBadge>
              </td>
              <td
                style={{
                  paddingBottom: 8,
                  fontFamily: "sans-serif",
                  fontSize: 12,
                  color: "#ddd",
                  verticalAlign: "middle",
                }}
              >
                {action}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const { playback, simTime, bodies } = useSimStore();
  const [focusedBody, setFocusedBody] = useState<string | null>(null);
  const [hudVisible, setHudVisible] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [shortcutsVisible, setShortcutsVisible] = useState(false);
  const [helpHovered, setHelpHovered] = useState(false);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleFocusBody = useCallback((name: string | null) => {
    setFocusedBody(name);
    setHudVisible(true);
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    if (name !== null) {
      fadeTimerRef.current = setTimeout(() => {
        setHudVisible(false);
      }, 2000);
    }
  }, []);

  const handleManualControl = useCallback(() => {
    setAutoRotate(false);
  }, []);

  const handleSelectBody = useCallback((body: Body) => {
    // Trigger focus animation via the module-level ref set by KeyboardControls
    const focusFn = (window as unknown as Record<string, unknown>).__focusBodyById as ((id: string) => void) | undefined;
    if (focusFn) focusFn(body.id);
    setAutoRotate(true);
  }, []);

  // Toggle shortcuts panel on "?" keypress
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) return;
      if (e.key === "?") {
        setShortcutsVisible((v) => !v);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    const disconnect = connectBridge();
    return disconnect;
  }, []);

  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, []);

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <Canvas camera={{ position: [0, 300, 500], fov: 45 }}>
        <SceneContent
          onFocusBody={handleFocusBody}
          onSelectBody={handleSelectBody}
          autoRotate={autoRotate}
          onManualControl={handleManualControl}
        />
      </Canvas>

      {/* Status HUD — top left */}
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

      {/* Focused body label — bottom center, fades after 2s */}
      <div
        style={{
          position: "absolute",
          bottom: 32,
          left: "50%",
          transform: "translateX(-50%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
          fontSize: 18,
          fontWeight: 600,
          textShadow: "0 0 12px #000, 0 0 24px #000",
          pointerEvents: "none",
          letterSpacing: "0.08em",
          opacity: hudVisible && focusedBody ? 1 : 0,
          transition: "opacity 0.6s ease",
        }}
      >
        {focusedBody ?? ""}
      </div>

      {/* Shortcuts panel (rendered above button) */}
      <ShortcutsPanel
        visible={shortcutsVisible}
        onClose={() => setShortcutsVisible(false)}
      />

      {/* ? help button — bottom right */}
      <button
        onClick={() => setShortcutsVisible((v) => !v)}
        onMouseEnter={() => setHelpHovered(true)}
        onMouseLeave={() => setHelpHovered(false)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: helpHovered ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.12)",
          border: "1px solid rgba(255,255,255,0.25)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          color: "#ffffff",
          fontSize: 16,
          fontFamily: "monospace",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 101,
          transition: "background 0.15s ease",
          padding: 0,
          lineHeight: 1,
        }}
        aria-label="Toggle keyboard shortcuts"
      >
        ?
      </button>
    </div>
  );
}
