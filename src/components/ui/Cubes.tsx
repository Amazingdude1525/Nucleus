import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Edges } from "@react-three/drei";
import * as THREE from "three";

function FloatingCube({ position, delay }: { position: [number, number, number], delay: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime() + delay;
    meshRef.current.position.y = position[1] + Math.sin(t * 1.5) * 0.5;
    meshRef.current.rotation.x = Math.sin(t * 0.5) * 0.5;
    meshRef.current.rotation.y += 0.01;
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#000000" transparent opacity={0.8} />
      <Edges scale={1.05} color="#00f0ff" opacity={0.5} transparent />
    </mesh>
  );
}

export default function Cubes() {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-40">
      <Canvas camera={{ position: [0, 0, 10], fov: 40 }}>
        <fog attach="fog" args={["#000", 5, 20]} />
        <FloatingCube position={[-4, 2, 0]} delay={0} />
        <FloatingCube position={[4, -2, -2]} delay={1} />
        <FloatingCube position={[-2, -3, -5]} delay={2} />
        <FloatingCube position={[3, 3, -8]} delay={3} />
        <FloatingCube position={[0, 0, -4]} delay={4} />
      </Canvas>
    </div>
  );
}
