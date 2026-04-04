import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface StarFieldProps {
  count?: number;
}

export function StarField({ count = 5000 }: StarFieldProps) {
  const meshRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 2000;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 2000;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 2000;
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.01;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.5} color="#ffffff" />
    </points>
  );
}
