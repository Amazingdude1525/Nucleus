import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { Grid3x3, Box, Hand, Camera as CameraIcon } from "lucide-react";
import { useHandTrackingContext } from "@/components/HandTracking";

type LatticeType = "sc" | "bcc" | "fcc";

const LATTICE_INFO: Record<LatticeType, {
  name: string;
  atoms: number;
  coordinationNumber: number;
  packingEfficiency: number;
  atomsPerCell: number;
  relationship: string;
  examples: string;
}> = {
  sc: {
    name: "Simple Cubic",
    atoms: 1,
    coordinationNumber: 6,
    packingEfficiency: 52.4,
    atomsPerCell: 1,
    relationship: "a = 2r",
    examples: "Polonium (Po)",
  },
  bcc: {
    name: "Body-Centered Cubic",
    atoms: 2,
    coordinationNumber: 8,
    packingEfficiency: 68.0,
    atomsPerCell: 2,
    relationship: "a = 4r/√3",
    examples: "Fe, Cr, W, Na, K",
  },
  fcc: {
    name: "Face-Centered Cubic",
    atoms: 4,
    coordinationNumber: 12,
    packingEfficiency: 74.0,
    atomsPerCell: 4,
    relationship: "a = 2√2·r",
    examples: "Cu, Al, Ag, Au, Ni",
  },
};

function generateLatticePositions(type: LatticeType, size: number = 1): THREE.Vector3[] {
  const positions: THREE.Vector3[] = [];
  const a = size;

  // Corner atoms (all lattice types)
  for (let x = 0; x <= 1; x++) {
    for (let y = 0; y <= 1; y++) {
      for (let z = 0; z <= 1; z++) {
        positions.push(new THREE.Vector3(x * a, y * a, z * a));
      }
    }
  }

  if (type === "bcc") {
    // Body center
    positions.push(new THREE.Vector3(0.5 * a, 0.5 * a, 0.5 * a));
  }

  if (type === "fcc") {
    // Face centers
    positions.push(new THREE.Vector3(0.5 * a, 0.5 * a, 0));
    positions.push(new THREE.Vector3(0.5 * a, 0.5 * a, a));
    positions.push(new THREE.Vector3(0.5 * a, 0, 0.5 * a));
    positions.push(new THREE.Vector3(0.5 * a, a, 0.5 * a));
    positions.push(new THREE.Vector3(0, 0.5 * a, 0.5 * a));
    positions.push(new THREE.Vector3(a, 0.5 * a, 0.5 * a));
  }

  // Center the cell
  const offset = new THREE.Vector3(-0.5 * a, -0.5 * a, -0.5 * a);
  return positions.map((p) => p.add(offset));
}

function UnitCell({ type, showEdges, tracking }: { type: LatticeType; showEdges: boolean; tracking: { active: boolean; rawX: number; rawY: number; openness: number } }) {
  const groupRef = useRef<THREE.Group>(null);
  const positions = useMemo(() => generateLatticePositions(type), [type]);
  const info = LATTICE_INFO[type];

  // We keep local smoothed values for 3D lerping
  const targetScale = useRef(1);
  const currentScale = useRef(1);

  useFrame((state) => {
    if (groupRef.current) {
      if (tracking.active && typeof tracking.rawX === 'number' && typeof tracking.openness === 'number') {
        // Control rotation via hand position
        const targetRotY = (tracking.rawX - 0.5) * 4;
        const targetRotX = (tracking.rawY - 0.5) * 4;
        
        groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.1;
        groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.1;
        
        // Use openness for zoom: fist(0) → zoom out, peace(1) → zoom in
        targetScale.current = 0.6 + Math.max(0, Math.min(1, tracking.openness)) * 1.4;
        currentScale.current += (targetScale.current - currentScale.current) * 0.1;
        
        groupRef.current.scale.set(currentScale.current, currentScale.current, currentScale.current);
      } else {
        // Default auto-rotation
        groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
        groupRef.current.rotation.x += (0 - groupRef.current.rotation.x) * 0.05;
        
        currentScale.current += (1 - currentScale.current) * 0.1;
        groupRef.current.scale.set(currentScale.current, currentScale.current, currentScale.current);
      }
    }
  });

  // Determine atom radii based on packing
  const atomRadius = type === "sc" ? 0.15 : type === "bcc" ? 0.135 : 0.12;
  const isCorner = (i: number) => i < 8;

  return (
    <group ref={groupRef}>
      {/* Atoms */}
      {positions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[atomRadius, 24, 24]} />
          <meshStandardMaterial
            color={isCorner(i) ? "#00F0FF" : "#ff6644"}
            emissive={isCorner(i) ? "#00F0FF" : "#ff6644"}
            emissiveIntensity={0.4}
            metalness={0.3}
            roughness={0.4}
            transparent
            opacity={0.85}
          />
        </mesh>
      ))}

      {/* Unit cell edges */}
      {showEdges && (
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(1, 1, 1)]} />
          <lineBasicMaterial color="#00F0FF" transparent opacity={0.15} />
        </lineSegments>
      )}

      {/* Axis indicators */}
      <group>
        {[
          { dir: [0.7, 0, 0], color: "#ff4444", label: "a" },
          { dir: [0, 0.7, 0], color: "#44ff44", label: "b" },
          { dir: [0, 0, 0.7], color: "#4444ff", label: "c" },
        ].map(({ dir, color, label }) => (
          <group key={label}>
            <mesh position={[dir[0] * 0.5 - 0.5, dir[1] * 0.5 - 0.5, dir[2] * 0.5 - 0.5]}>
              <cylinderGeometry args={[0.008, 0.008, 0.7, 8]} />
              <meshBasicMaterial color={color} transparent opacity={0.4} />
            </mesh>
          </group>
        ))}
      </group>

      <pointLight position={[0, 0, 0]} color="#00F0FF" intensity={0.3} distance={3} />
    </group>
  );
}

export default function CrystalLattice() {
  const [latticeType, setLatticeType] = useState<LatticeType>("sc");
  const [showEdges, setShowEdges] = useState(true);
  const info = LATTICE_INFO[latticeType];

  // Hand Tracking from global context
  const { isActive: enabled, cursorPosition, showOnboarding, deactivate: disableTracking, gesture } = useHandTrackingContext();

  // Derive raw normalized values for UnitCell
  const rawCursorX = cursorPosition.x / window.innerWidth;
  const rawCursorY = cursorPosition.y / window.innerHeight;

  return (
    <motion.div
      className="flex flex-col h-[calc(100vh-3.5rem)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/5">
        <div>
          <h1 className="text-lg font-bold tracking-widest text-primary text-glow-cyan flex items-center gap-2">
            <Grid3x3 className="w-5 h-5" />
            Crystal Lattice Viewer
          </h1>
          <p className="text-[10px] text-muted-foreground">
            3D unit cells • Packing efficiency • Coordination analysis
          </p>
        </div>
        
        {/* Hand Tracking Toggle */}
        <motion.button
          onClick={enabled ? disableTracking : showOnboarding}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl glass border text-xs font-medium transition-all ${
            enabled 
              ? "text-primary border-primary/50 bg-primary/10 shadow-[0_0_15px_hsl(185_100%_50%/0.3)]" 
              : "border-white/5 text-muted-foreground hover:text-white hover:border-white/20"
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {enabled ? <CameraIcon className="w-4 h-4 text-primary" /> : <Hand className="w-4 h-4" />}
          {enabled ? "Tracking Active" : "Track My Hand"}
        </motion.button>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left — Controls & Info */}
        <div className="w-72 shrink-0 border-r border-white/5 p-4 flex flex-col gap-4 overflow-y-auto">
          {/* Lattice selector */}
          <div>
            <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40 font-semibold mb-2">
              Unit Cell Type
            </div>
            <div className="space-y-2">
              {(Object.keys(LATTICE_INFO) as LatticeType[]).map((type) => (
                <motion.button
                  key={type}
                  onClick={() => setLatticeType(type)}
                  className={`w-full text-left p-3 rounded-xl glass border transition-all ${
                    latticeType === type
                      ? "border-primary/30 bg-primary/5 shadow-[0_0_15px_hsl(185_100%_50%/0.1)]"
                      : "border-white/5 hover:border-white/10"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-sm font-semibold text-foreground">
                    {LATTICE_INFO[type].name}
                  </div>
                  <div className="text-[10px] text-muted-foreground/50 mt-0.5">
                    {type.toUpperCase()} • Z = {LATTICE_INFO[type].atomsPerCell}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Show edges toggle */}
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={showEdges}
              onChange={(e) => setShowEdges(e.target.checked)}
              className="accent-[hsl(185,100%,50%)]"
            />
            Show cell edges
          </label>

          {/* Crystal data */}
          <div className="glass rounded-xl border border-white/10 p-4 space-y-3">
            <h3 className="text-sm font-bold text-foreground">{info.name}</h3>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Atoms per cell (Z)</span>
                <span className="text-foreground font-mono font-bold">{info.atomsPerCell}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Coord. Number</span>
                <span className="text-foreground font-mono font-bold">{info.coordinationNumber}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Packing Efficiency</span>
                <span className="text-primary font-mono font-bold">{info.packingEfficiency}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">a–r relationship</span>
                <span className="text-foreground font-mono text-[11px]">{info.relationship}</span>
              </div>
            </div>

            {/* Packing efficiency bar */}
            <div className="pt-2 border-t border-white/5">
              <div className="text-[9px] text-muted-foreground/40 uppercase tracking-wider mb-1.5">
                Packing Efficiency
              </div>
              <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full rounded-full nucleus-gradient"
                  initial={{ width: 0 }}
                  animate={{ width: `${info.packingEfficiency}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  style={{
                    boxShadow: "0 0 10px hsl(185 100% 50% / 0.3)",
                  }}
                />
              </div>
              <div className="text-[10px] text-muted-foreground/40 mt-1">
                {(100 - info.packingEfficiency).toFixed(1)}% void space
              </div>
            </div>

            <div className="pt-2 border-t border-white/5">
              <div className="text-[9px] text-muted-foreground/40 uppercase tracking-wider mb-1">
                Examples
              </div>
              <div className="text-[11px] text-muted-foreground">{info.examples}</div>
            </div>
          </div>

          {/* Color legend */}
          <div className="glass rounded-xl border border-white/10 p-3">
            <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40 font-semibold mb-2">
              Legend
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-[10px]">
                <div className="w-3 h-3 rounded-full bg-[#00F0FF] shadow-[0_0_6px_#00F0FF66]" />
                <span className="text-muted-foreground">Corner atoms</span>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <div className="w-3 h-3 rounded-full bg-[#ff6644] shadow-[0_0_6px_#ff664466]" />
                <span className="text-muted-foreground">Body/Face center atoms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center — 3D Viewer */}
        <div className="flex-1 relative min-h-0">
          <Canvas camera={{ position: [2, 1.5, 2], fov: 45 }}>
            <ambientLight intensity={0.3} />
            <pointLight position={[5, 5, 5]} intensity={0.5} />
            <pointLight position={[-3, 2, -2]} intensity={0.3} color="#00F0FF" />
            <UnitCell 
              type={latticeType} 
              showEdges={showEdges} 
              tracking={{ active: enabled, rawX: rawCursorX, rawY: rawCursorY, openness: gesture === 'peace' ? 1 : gesture === 'fist' ? 0 : 0.5 }}
            />
            <OrbitControls enablePan={false} minDistance={1.5} maxDistance={6} />
          </Canvas>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground/30">
            Drag to rotate • Scroll to zoom • Auto-rotating
          </div>
        </div>
      </div>

    </motion.div>
  );
}
