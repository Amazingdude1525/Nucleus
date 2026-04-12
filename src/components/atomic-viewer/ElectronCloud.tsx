import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ElectronCloudProps {
  atomicNumber: number;
}

const CLOUD_POINTS = 800;

export default function ElectronCloud({ atomicNumber }: ElectronCloudProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(CLOUD_POINTS * 3);
    const colors = new Float32Array(CLOUD_POINTS * 3);
    const shellRadii = [1, 1.8, 2.6, 3.4];
    const shells = Math.min(Math.ceil(atomicNumber / 8), 4);

    for (let i = 0; i < CLOUD_POINTS; i++) {
      const shell = Math.floor(Math.random() * shells);
      const r = shellRadii[shell] + (Math.random() - 0.5) * 0.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Color gradient from cyan core to purple outer
      const t = shell / Math.max(shells - 1, 1);
      colors[i * 3] = 0 + t * 0.4;
      colors[i * 3 + 1] = 0.94 - t * 0.5;
      colors[i * 3 + 2] = 1;
    }
    return { positions, colors };
  }, [atomicNumber]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
  });

  return (
    <group>
      {/* Nucleus glow */}
      <mesh>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial
          color="#00F0FF"
          emissive="#00F0FF"
          emissiveIntensity={0.8}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Cloud */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={positions} count={CLOUD_POINTS} itemSize={3} />
          <bufferAttribute attach="attributes-color" array={colors} count={CLOUD_POINTS} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          vertexColors
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      <pointLight position={[0, 0, 0]} color="#00F0FF" intensity={0.8} distance={6} />
    </group>
  );
}
