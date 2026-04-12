import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 8000;
const AMBIENT_COUNT = 500;
const SNAP_SPEED = 0.08;
const MOUSE_RADIUS = 2.0;
const MOUSE_FORCE = 0.35;

/** Sample pixel positions from canvas-rendered text, return normalized 3D coords */
function sampleTextPoints(
  text: string,
  count: number,
  aspect: number
): Float32Array {
  const canvas = document.createElement("canvas");
  const w = 1280;
  const h = 320;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 200px 'Outfit', Arial, Helvetica, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, w / 2, h / 2);

  const imageData = ctx.getImageData(0, 0, w, h).data;
  const candidates: [number, number][] = [];
  const step = 1; // finer sampling for denser particles
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      if (imageData[(y * w + x) * 4] > 128) {
        candidates.push([x, y]);
      }
    }
  }

  const points = new Float32Array(count * 3);
  const scaleX = 10 * aspect * 0.45;
  const scaleY = 2.5;
  for (let i = 0; i < count; i++) {
    if (candidates.length > 0) {
      const idx = Math.floor(Math.random() * candidates.length);
      const [px, py] = candidates[idx];
      points[i * 3] = ((px / w) - 0.5) * scaleX;
      points[i * 3 + 1] = -((py / h) - 0.5) * scaleY;
      points[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
    } else {
      points[i * 3] = (Math.random() - 0.5) * 10;
      points[i * 3 + 1] = (Math.random() - 0.5) * 6;
      points[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
  }
  return points;
}

function Particles({ text, offsetY = 0 }: { text: string; offsetY?: number }) {
  const meshRef = useRef<THREE.Points>(null);
  const mouseRef = useRef(new THREE.Vector2(9999, 9999));
  const { viewport } = useThree();
  const [targets, setTargets] = useState<Float32Array | null>(null);

  // Sample text points once
  useEffect(() => {
    const aspect = viewport.width / viewport.height;
    const t = sampleTextPoints(text, PARTICLE_COUNT, aspect);
    if (offsetY !== 0) {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        t[i * 3 + 1] += offsetY;
      }
    }
    setTargets(t);
  }, [viewport.width, viewport.height]);

  // Start positions: random scatter
  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
      velocities[i * 3] = 0;
      velocities[i * 3 + 1] = 0;
      velocities[i * 3 + 2] = 0;
    }
    return { positions, velocities };
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  useFrame((state) => {
    if (!meshRef.current || !targets) return;
    const posAttr = meshRef.current.geometry.getAttribute("position");
    const arr = posAttr.array as Float32Array;

    const mouseX = mouseRef.current.x * viewport.width * 0.5;
    const mouseY = mouseRef.current.y * viewport.height * 0.5;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const tx = targets[i3];
      const ty = targets[i3 + 1];
      const tz = targets[i3 + 2];

      // Spring toward target
      velocities[i3] += (tx - arr[i3]) * SNAP_SPEED;
      velocities[i3 + 1] += (ty - arr[i3 + 1]) * SNAP_SPEED;
      velocities[i3 + 2] += (tz - arr[i3 + 2]) * SNAP_SPEED;

      // Mouse repulsion
      const dx = arr[i3] - mouseX;
      const dy = arr[i3 + 1] - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_RADIUS && dist > 0.01) {
        const force = (MOUSE_RADIUS - dist) * MOUSE_FORCE;
        velocities[i3] += (dx / dist) * force;
        velocities[i3 + 1] += (dy / dist) * force;
      }

      // Damping
      velocities[i3] *= 0.85;
      velocities[i3 + 1] *= 0.85;
      velocities[i3 + 2] *= 0.85;

      arr[i3] += velocities[i3];
      arr[i3 + 1] += velocities[i3 + 1];
      arr[i3 + 2] += velocities[i3 + 2];
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={PARTICLE_COUNT}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        color="#00c8ff"
        transparent
        opacity={0.95}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/** Ambient floating particles for atmosphere */
function AmbientParticles() {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(AMBIENT_COUNT * 3);
    for (let i = 0; i < AMBIENT_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 24;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < AMBIENT_COUNT; i++) {
      const i3 = i * 3;
      arr[i3 + 1] += Math.sin(t * 0.3 + i) * 0.002;
      arr[i3] += Math.cos(t * 0.2 + i * 0.5) * 0.001;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={AMBIENT_COUNT}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        color="#00F0FF"
        transparent
        opacity={0.25}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

interface ParticleFieldProps {
  text?: string;
  ambientOnly?: boolean;
  offsetY?: number;
}

export default function ParticleField({ text = "NUCLEUS", ambientOnly = false, offsetY = 0 }: ParticleFieldProps) {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 60 }}
        style={{ background: "transparent" }}
        gl={{ antialias: true, alpha: true }}
      >
        <AmbientParticles />
        {!ambientOnly && <Particles text={text} offsetY={offsetY} />}
      </Canvas>
    </div>
  );
}
