import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { electronShells } from "@/data/elements";

interface BohrModelProps {
  atomicNumber: number;
}

export default function BohrModel({ atomicNumber }: BohrModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const shells = electronShells[atomicNumber] || [Math.min(atomicNumber, 2)];
  const nucleusCount = atomicNumber;
  // Neutrons: approximate using common isotope data
  const neutronCount = atomicNumber <= 1 ? 0 : Math.round(atomicNumber * 1.2);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Nucleus - cluster of protons (red) and neutrons (blue) */}
      {Array.from({ length: Math.min(nucleusCount + neutronCount, 30) }).map((_, i) => {
        const total = Math.min(nucleusCount + neutronCount, 30);
        const phi = Math.acos(1 - 2 * (i + 0.5) / total);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        const r = 0.3 + (total > 10 ? 0.1 : 0);
        const isProton = i < Math.min(nucleusCount, Math.ceil(total / 2));
        return (
          <mesh
            key={`n-${i}`}
            position={[
              r * Math.sin(phi) * Math.cos(theta),
              r * Math.sin(phi) * Math.sin(theta),
              r * Math.cos(phi),
            ]}
          >
            <sphereGeometry args={[0.1, 12, 12]} />
            <meshStandardMaterial
              color={isProton ? "#ff3333" : "#3388ff"}
              emissive={isProton ? "#ff1111" : "#1144ee"}
              emissiveIntensity={0.5}
              roughness={0.3}
              metalness={0.1}
            />
          </mesh>
        );
      })}

      {/* Nucleus core glow */}
      <pointLight position={[0, 0, 0]} color="#ff6644" intensity={0.6} distance={4} />

      {/* Electron shells */}
      {shells.map((electronCount, shellIdx) => {
        const radius = 1 + shellIdx * 0.8;
        // Tilt each shell slightly differently for visual depth
        const tiltX = Math.PI / 2 + shellIdx * 0.15;
        const tiltZ = shellIdx * 0.25;
        return (
          <group key={`shell-${shellIdx}`}>
            {/* Orbit ring — tilted per shell for 3D depth */}
            <mesh rotation={[tiltX, 0, tiltZ]}>
              <torusGeometry args={[radius, 0.008, 8, 128]} />
              <meshBasicMaterial color="#00F0FF" transparent opacity={0.2} />
            </mesh>

            {/* Electrons strictly on the same tilted ring */}
            {Array.from({ length: electronCount }).map((_, eIdx) => (
              <ElectronOnRing
                key={`e-${shellIdx}-${eIdx}`}
                radius={radius}
                speed={1.5 / (shellIdx + 1)}
                offset={(eIdx / electronCount) * Math.PI * 2}
                tiltX={tiltX}
                tiltZ={tiltZ}
              />
            ))}
          </group>
        );
      })}

      {/* Legend removed from 3D space - now rendered natively in ElementDetail */}

      {/* Soft ambient glow at nucleus */}
      <pointLight position={[0, 0, 0]} color="#00F0FF" intensity={0.4} distance={5} />
    </group>
  );
}

function ElectronOnRing({ radius, speed, offset, tiltX, tiltZ }: {
  radius: number;
  speed: number;
  offset: number;
  tiltX: number;
  tiltZ: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * speed * 2 + offset;

    const v = new THREE.Vector3(Math.cos(t) * radius, Math.sin(t) * radius, 0);
    v.applyEuler(new THREE.Euler(tiltX, 0, tiltZ));
    ref.current.position.copy(v);
  });

  return (
    <>
      <mesh ref={ref}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial
          color="#00F0FF"
          emissive="#00F0FF"
          emissiveIntensity={1.5}
          toneMapped={false}
        />
      </mesh>
    </>
  );
}
