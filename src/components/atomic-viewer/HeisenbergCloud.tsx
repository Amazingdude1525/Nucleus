import { useRef, useMemo, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface HeisenbergCloudProps {
  atomicNumber: number;
  /** Uncertainty slider: 0 = position-certain, 1 = momentum-certain */
  uncertainty: number;
}

/**
 * Heisenberg Uncertainty Principle Visualizer
 * 
 * When uncertainty→0 (position-certain): particles cluster tightly → small Δx, large Δp (fast jitter)
 * When uncertainty→1 (momentum-certain): particles spread widely → large Δx, small Δp (slow, smooth)
 * 
 * Demonstrates: Δx · Δp ≥ ℏ/2
 */
const POINT_COUNT = 1200;
const HBAR = 1.0545718e-34; // For display purposes

export default function HeisenbergCloud({ atomicNumber, uncertainty }: HeisenbergCloudProps) {
  const pointsRef = useRef<THREE.Points>(null);

  // Clamp between 0.05 and 0.95 to avoid singularities  
  const u = Math.max(0.05, Math.min(0.95, uncertainty));

  // Δx (position spread) — increases with uncertainty
  const deltaX = 0.3 + u * 3.5;
  // Δp (momentum/velocity jitter) — decreases with uncertainty (inverse relationship)
  const deltaP = 0.02 + (1 - u) * 0.25;

  const basePositions = useMemo(() => {
    const pos = new Float32Array(POINT_COUNT * 3);
    const shells = Math.min(Math.ceil(atomicNumber / 8), 4);
    for (let i = 0; i < POINT_COUNT; i++) {
      const shell = Math.floor(Math.random() * shells);
      const shellR = 1 + shell * 0.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = shellR * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = shellR * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = shellR * Math.cos(phi);
    }
    return pos;
  }, [atomicNumber]);

  const colors = useMemo(() => {
    const c = new Float32Array(POINT_COUNT * 3);
    for (let i = 0; i < POINT_COUNT; i++) {
      // Cyan → Magenta gradient based on position
      const t = i / POINT_COUNT;
      c[i * 3] = 0 + t * 0.8;     // R
      c[i * 3 + 1] = 0.94 - t * 0.3; // G
      c[i * 3 + 2] = 1;              // B
    }
    return c;
  }, []);

  const currentPositions = useMemo(() => new Float32Array(POINT_COUNT * 3), []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.elapsedTime;
    const posArr = pointsRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < POINT_COUNT; i++) {
      const i3 = i * 3;
      const bx = basePositions[i3];
      const by = basePositions[i3 + 1];
      const bz = basePositions[i3 + 2];

      // Scale position by deltaX (spread)
      const spreadFactor = deltaX / 2;
      // Add momentum jitter by deltaP
      const jitterX = Math.sin(t * (3 + i * 0.02) * deltaP * 30) * deltaP * 15;
      const jitterY = Math.cos(t * (2.7 + i * 0.017) * deltaP * 30) * deltaP * 15;
      const jitterZ = Math.sin(t * (3.3 + i * 0.023) * deltaP * 30 + i) * deltaP * 15;

      posArr[i3] = bx * spreadFactor + jitterX;
      posArr[i3 + 1] = by * spreadFactor + jitterY;
      posArr[i3 + 2] = bz * spreadFactor + jitterZ;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.rotation.y = t * 0.08;
  });

  return (
    <group>
      {/* Nucleus */}
      <mesh>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color="#ff3333"
          emissive="#ff2222"
          emissiveIntensity={0.6}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Cloud */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={basePositions.slice()}
            count={POINT_COUNT}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            array={colors}
            count={POINT_COUNT}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          vertexColors
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      <pointLight position={[0, 0, 0]} color="#00F0FF" intensity={0.6} distance={6} />
    </group>
  );
}
