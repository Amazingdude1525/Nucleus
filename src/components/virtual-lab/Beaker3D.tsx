import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

interface Beaker3DProps {
  liquidLevel: number; // 0-1
  liquidColor: string;
  bubbles: boolean;
  heatGlow: boolean;
}

function BeakerGlass() {
  const geometry = useMemo(() => {
    // True laboratory beaker geometry: straight walls with a top pour lip
    const points: THREE.Vector2[] = [];
    const segments = 32;
    const radius = 0.95;
    const height = 3.0;

    // Bottom flat
    points.push(new THREE.Vector2(0.0, -height / 2));
    points.push(new THREE.Vector2(radius, -height / 2));

    // Straight vertical wall
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const y = -height / 2 + t * height;
      points.push(new THREE.Vector2(radius, y));
    }

    // Classic flared lip at the top
    points.push(new THREE.Vector2(radius + 0.08, height / 2));
    points.push(new THREE.Vector2(radius + 0.08, height / 2 + 0.04));
    points.push(new THREE.Vector2(radius + 0.02, height / 2 + 0.04));

    return new THREE.LatheGeometry(points, 64);
  }, []);

  return (
    <mesh geometry={geometry} position={[0, -0.2, 0]}>
      <meshPhysicalMaterial
        color="#ffffff"
        transparent
        opacity={0.4}
        roughness={0.02}
        metalness={0.1}
        side={THREE.DoubleSide}
        transmission={0.98}
        thickness={0.05}
        ior={1.45}
        envMapIntensity={1.0}
      />
    </mesh>
  );
}

function MeasurementLines() {
  const volumes = [100, 200, 300, 400, 500];
  const heightBase = -1.7; // matches the liquid base height
  const maxLiquidHeight = 2.8;

  return (
    <group position={[0, -0.2, 0]}>
      {volumes.map((ml, i) => {
        // level normalized to 0..1
        const level = ml / 500;
        const y = heightBase + level * maxLiquidHeight;
        return (
          <group key={i}>
            {/* Tick Mark */}
            <mesh position={[0.95, y, 0]} rotation={[0, 0, 0]}>
              <boxGeometry args={[0.2, 0.01, 0.01]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
            </mesh>
            {/* Volume Text */}
            <Text
              position={[1.2, y, 0]}
              fontSize={0.18}
              color="#ffffff"
              anchorX="left"
              anchorY="middle"
              outlineWidth={0.01}
              outlineColor="#000000"
            >
              {`${ml} ml`}
            </Text>
            {/* Minor Ticks */}
            {ml < 500 && (
              <mesh position={[0.95, y + 0.5 * (maxLiquidHeight / 5), 0]}>
                <boxGeometry args={[0.1, 0.005, 0.005]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

function BunsenBurner({ isLit }: { isLit: boolean }) {
  const flameRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (flameRef.current && isLit) {
      flameRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 8) * 0.15;
      flameRef.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * 6 + 1) * 0.1;
      flameRef.current.rotation.y = state.clock.elapsedTime * 2;
    }
  });

  return (
    <group position={[0, -2.0, 0]}>
      {/* Base plate */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.6, 0.65, 0.08, 32]} />
        <meshStandardMaterial color="#1a1a2a" metalness={0.9} roughness={0.3} />
      </mesh>
      {/* Burner tube */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.12, 0.15, 0.9, 24]} />
        <meshStandardMaterial color="#2a2a3a" metalness={0.8} roughness={0.4} />
      </mesh>
      {/* Air hole ring */}
      <mesh position={[0, 0.1, 0]}>
        <torusGeometry args={[0.15, 0.02, 8, 24]} />
        <meshStandardMaterial color="#333344" metalness={0.7} roughness={0.5} />
      </mesh>
      {/* Top rim */}
      <mesh position={[0, 0.8, 0]}>
        <torusGeometry args={[0.12, 0.015, 8, 24]} />
        <meshStandardMaterial color="#444455" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Flame (only when lit) */}
      {isLit && (
        <group position={[0, 0.85, 0]}>
          {/* Inner blue flame cone */}
          <mesh ref={flameRef}>
            <coneGeometry args={[0.08, 0.5, 16]} />
            <meshBasicMaterial color="#1166ff" transparent opacity={0.9} />
          </mesh>
          {/* Outer orange flame */}
          <mesh position={[0, 0.05, 0]} scale={[1.3, 1.2, 1.3]}>
            <coneGeometry args={[0.1, 0.6, 16]} />
            <meshBasicMaterial color="#ff6622" transparent opacity={0.4} />
          </mesh>
          {/* Flame glow light */}
          <pointLight color="#3388ff" intensity={3} distance={4} />
          <pointLight color="#ff4400" intensity={1.5} distance={3} position={[0, 0.3, 0]} />
        </group>
      )}
      {/* Base glow ring when lit */}
      {isLit && (
        <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.4, 0.65, 32]} />
          <meshBasicMaterial color="#ff6622" transparent opacity={0.15} />
        </mesh>
      )}
    </group>
  );
}

function DropAnimation({ dropColor, onComplete }: { dropColor: string; onComplete: () => void }) {
  const dropRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (dropRef.current) {
      dropRef.current.position.y -= delta * 6; // Gravity fall
      // Stretch effect during fall
      dropRef.current.scale.y = 1.5;
      
      if (dropRef.current.position.y < -0.5) {
        onComplete();
      }
    }
  });

  return (
    <mesh ref={dropRef} position={[0, 2.5, 0]}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshPhysicalMaterial color={dropColor} transmission={0.8} roughness={0} thickness={0.5} />
    </mesh>
  );
}

function PipetteDrip({ activeColor, isDripping, stopDrip }: { activeColor: string, isDripping: boolean, stopDrip: () => void }) {
  const pipetteRef = useRef<THREE.Group>(null);
  const [drops, setDrops] = useState<{ id: number, color: string }[]>([]);
  
  useEffect(() => {
    if (isDripping) {
      // Release a drop
      setDrops([{ id: Date.now(), color: activeColor }]);
      
      // Squeeze animation effect
      if (pipetteRef.current) {
        pipetteRef.current.scale.set(1, 0.9, 1);
        setTimeout(() => {
          if (pipetteRef.current) pipetteRef.current.scale.set(1, 1, 1);
        }, 150);
      }
    }
  }, [isDripping, activeColor]);

  return (
    <group>
      {/* The Pipette Mesh */}
      <group ref={pipetteRef} position={[0, 3.5, 0]}>
        {/* Bulb */}
        <mesh position={[0, 1.2, 0]}>
          <cylinderGeometry args={[0.2, 0.25, 0.8, 32]} />
          <meshPhysicalMaterial color="#333333" roughness={0.7} />
        </mesh>
        {/* Glass Tube */}
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.1, 0.03, 1.8, 32]} />
          <meshPhysicalMaterial color="#ffffff" transmission={0.9} opacity={0.3} transparent />
        </mesh>
        {/* Inner Fluid inside Pipette */}
        {isDripping && (
          <mesh position={[0, 0.2, 0]}>
           <cylinderGeometry args={[0.08, 0.02, 1.7, 32]} />
           <meshBasicMaterial color={activeColor} transparent opacity={0.8} />
          </mesh>
        )}
      </group>
      {/* Falling drops */}
      {drops.map((drop) => (
        <DropAnimation 
          key={drop.id} 
          dropColor={drop.color} 
          onComplete={() => {
            setDrops([]);
            stopDrip();
          }} 
        />
      ))}
    </group>
  );
}

export default function Beaker3D({ liquidLevel, liquidColor, bubbles, heatGlow }: Beaker3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bubblesRef = useRef<THREE.Points>(null);
  const liquidRef = useRef<THREE.Mesh>(null);
  const surfaceRef = useRef<THREE.Mesh>(null);
  
  // Tracking additions for the pipette
  const [targetLevel, setTargetLevel] = useState(liquidLevel);
  const [currentLevel, setCurrentLevel] = useState(liquidLevel);
  const [isDripping, setIsDripping] = useState(false);

  useEffect(() => {
    if (liquidLevel > targetLevel) {
      setIsDripping(true);
      setTargetLevel(liquidLevel);
    } else if (liquidLevel === 0) {
      setCurrentLevel(0);
      setTargetLevel(0);
    }
  }, [liquidLevel, targetLevel]);

  // Bubble particles
  const bubbleCount = 60;
  const bubblePositions = useMemo(() => {
    const pos = new Float32Array(bubbleCount * 3);
    for (let i = 0; i < bubbleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 1.5;
      pos[i * 3 + 1] = Math.random() * 2 - 1;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Very micro-subtle spin
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.02;
    }
    
    // Smoothly raise liquid level after drops fall
    if (!isDripping && currentLevel < targetLevel) {
      setCurrentLevel(prev => Math.min(prev + delta * 2.0, targetLevel));
    }

    const maxLiquidHeight = 2.8;
    const baseHeight = -1.7; // Lowered because Beagle mesh starts lower
    const currentLiquidHeight = Math.max(0.01, currentLevel * maxLiquidHeight);

    // Animate bubbles
    if (bubblesRef.current && bubbles) {
      const positions = bubblesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < bubbleCount; i++) {
        positions[i * 3 + 1] += 0.02 + Math.random() * 0.02;
        // Float upwards randomly
        positions[i * 3] += Math.sin(state.clock.elapsedTime * 3 + i) * 0.005;
        if (positions[i * 3 + 1] > baseHeight + currentLiquidHeight) {
          positions[i * 3 + 1] = baseHeight;
          positions[i * 3] = (Math.random() - 0.5) * 1.2;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 1.2;
        }
      }
      bubblesRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Wobble liquid physics based on depth and time
    if (liquidRef.current) {
      liquidRef.current.position.y = baseHeight + currentLiquidHeight / 2;
      liquidRef.current.scale.y = currentLiquidHeight;
    }
    if (surfaceRef.current) {
      surfaceRef.current.position.y = baseHeight + currentLiquidHeight + Math.sin(state.clock.elapsedTime * 3) * 0.01;
      // Slosh rotation
      surfaceRef.current.rotation.x = -Math.PI / 2 + Math.sin(state.clock.elapsedTime * 2) * 0.015;
      surfaceRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  const color = new THREE.Color(liquidColor);

  return (
    <group ref={groupRef}>
      {/* Physics Pipette System that drops animated chemicals */}
      <PipetteDrip 
        activeColor={liquidColor} 
        isDripping={isDripping} 
        stopDrip={() => setIsDripping(false)} 
      />

      {/* The Beaker structure */}
      <BeakerGlass />

      <MeasurementLines />

      {/* Liquid Geometry */}
      {currentLevel > 0 && (
        <group position={[0, -0.2, 0]}>
          <mesh ref={liquidRef} position={[0, -1.5, 0]}>
            {/* Using a constant radius cylinder because the beaker is completely straight now */}
            <cylinderGeometry args={[0.93, 0.93, 1.0, 48]} />
            <meshPhysicalMaterial
              color={color}
              transparent
              opacity={0.7}
              roughness={0.05}
              metalness={0.0}
              emissive={color}
              emissiveIntensity={0.15}
              transmission={0.4}
              thickness={2}
            />
          </mesh>

          {/* Meniscus / Surface */}
          <mesh ref={surfaceRef} position={[0, -1.0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.93, 48]} />
            <meshPhysicalMaterial
              color={color}
              transparent
              opacity={0.5}
              roughness={0.05}
              emissive={color}
              emissiveIntensity={0.2}
            />
          </mesh>
        </group>
      )}

      {/* Bubbling effect during reactions */}
      {bubbles && currentLevel > 0 && (
        <group position={[0, -0.2, 0]}>
          <points ref={bubblesRef}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[bubblePositions, 3]}
                count={bubbleCount}
              />
            </bufferGeometry>
            <pointsMaterial color="#ffffff" size={0.05} transparent opacity={0.6} sizeAttenuation />
          </points>
        </group>
      )}

      {/* Bunsen Burner / Hot Plate Base — always visible */}
      <BunsenBurner isLit={heatGlow} />

      {/* Extra heat lighting during exothermic */}
      {heatGlow && (
        <>
          <pointLight position={[0, -1.5, 0]} color="#ff6600" intensity={4} distance={6} />
          <pointLight position={[0, 0.0, 0]} color="#ff4400" intensity={1} distance={4} />
        </>
      )}

      {/* Liquid Luminescence */}
      {currentLevel > 0 && !heatGlow && (
        <pointLight position={[0, -0.5, 0]} color={liquidColor} intensity={0.6} distance={4} />
      )}
      
      {/* Structural rim light */}
      <directionalLight position={[2, 2, 2]} intensity={0.2} color="#ffffff" />
    </group>
  );
}
