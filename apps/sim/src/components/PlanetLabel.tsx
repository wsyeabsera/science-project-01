import { Html } from "@react-three/drei";

interface PlanetLabelProps {
  name: string;
  position: [number, number, number];
  radius: number; // Three.js radius (already scaled by PLANET_SCALE)
  visible: boolean;
}

export function PlanetLabel({ name, position, radius, visible }: PlanetLabelProps) {
  if (!visible) return null;
  return (
    <Html
      position={[position[0], position[1] + radius + 3, position[2]]}
      center
      distanceFactor={80}
      occlude={false}
    >
      <div
        style={{
          color: "#ffffff",
          fontSize: "12px",
          fontFamily: "sans-serif",
          whiteSpace: "nowrap",
          textShadow: "0 0 4px #000, 0 0 8px #000",
          pointerEvents: "none",
          userSelect: "none",
          letterSpacing: "0.05em",
        }}
      >
        {name}
      </div>
    </Html>
  );
}
