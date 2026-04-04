import { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { StarField } from "@astrophysics-playground/ui/three";
import { connectBridge } from "./ws/bridge";
import { useSimStore } from "./store";

export default function App() {
  const { bodies, playback, simTime } = useSimStore();

  useEffect(() => {
    const disconnect = connectBridge();
    return disconnect;
  }, []);

  return (
    <div style={{ height: "100vh", background: "#000" }}>
      <Canvas camera={{ position: [0, 0, 500], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <StarField count={8000} />
        {bodies.map((body) => (
          <mesh key={body.id} position={body.position}>
            <sphereGeometry args={[5, 16, 16]} />
            <meshStandardMaterial color="#4af" />
          </mesh>
        ))}
      </Canvas>
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          color: "#fff",
          fontFamily: "monospace",
          fontSize: 12,
        }}
      >
        <div>Status: {playback}</div>
        <div>T+{simTime.toFixed(1)}s</div>
        <div>Bodies: {bodies.length}</div>
      </div>
    </div>
  );
}
