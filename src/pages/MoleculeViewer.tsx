import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, RotateCcw, Loader2, ExternalLink, Atom, Hand, Camera as CameraIcon } from "lucide-react";
import { useHandTrackingContext } from "@/components/HandTracking";

// We'll render the molecule using a simple 3D ball-and-stick approach
// based on parsed SDF data, rather than importing 3Dmol.js

interface AtomData {
  x: number;
  y: number;
  z: number;
  element: string;
}

interface BondData {
  from: number;
  to: number;
  order: number;
}

interface MoleculeData {
  name: string;
  formula: string;
  weight: number;
  atoms: AtomData[];
  bonds: BondData[];
  iupacName?: string;
  cid?: number;
}

const ELEMENT_COLORS: Record<string, string> = {
  C: "#555555", H: "#ffffff", O: "#ff3333", N: "#3344ff",
  S: "#ffcc00", P: "#ff8800", Cl: "#33ff33", F: "#88ff88",
  Br: "#aa2200", I: "#6600cc", Na: "#aa44ff", K: "#8844dd",
  Ca: "#44aa44", Fe: "#ff6600", Cu: "#cc6633", Zn: "#8888aa",
};

const ELEMENT_RADII: Record<string, number> = {
  C: 0.3, H: 0.2, O: 0.28, N: 0.28, S: 0.35, P: 0.32,
  Cl: 0.33, F: 0.25, Br: 0.38, I: 0.42, Na: 0.35, K: 0.4,
};

function parseSDF(sdf: string): { atoms: AtomData[]; bonds: BondData[] } | null {
  const lines = sdf.split("\n");
  if (lines.length < 4) return null;

  // Counts line is line 3 (0-indexed)
  const countsLine = lines[3].trim();
  const atomCount = parseInt(countsLine.substring(0, 3).trim());
  const bondCount = parseInt(countsLine.substring(3, 6).trim());

  if (isNaN(atomCount) || isNaN(bondCount)) return null;

  const atoms: AtomData[] = [];
  const bonds: BondData[] = [];

  for (let i = 0; i < atomCount; i++) {
    const line = lines[4 + i];
    if (!line) continue;
    const x = parseFloat(line.substring(0, 10).trim());
    const y = parseFloat(line.substring(10, 20).trim());
    const z = parseFloat(line.substring(20, 30).trim());
    const element = line.substring(31, 34).trim();
    atoms.push({ x, y, z, element });
  }

  for (let i = 0; i < bondCount; i++) {
    const line = lines[4 + atomCount + i];
    if (!line) continue;
    const from = parseInt(line.substring(0, 3).trim()) - 1;
    const to = parseInt(line.substring(3, 6).trim()) - 1;
    const order = parseInt(line.substring(6, 9).trim());
    bonds.push({ from, to, order });
  }

  return { atoms, bonds };
}

export default function MoleculeViewer() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [molecule, setMolecule] = useState<MoleculeData | null>(null);
  const [rotation, setRotation] = useState({ x: -20, y: 30 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Hand Tracking from global context
  const { isActive: enabled, cursorPosition, showOnboarding, deactivate: disableTracking, gesture } = useHandTrackingContext();

  // Hand-controlled 3D View Manipulation
  useEffect(() => {
    if (enabled && gesture === 'point') {
      const normX = cursorPosition.x / window.innerWidth;
      const normY = cursorPosition.y / window.innerHeight;
      setRotation(prev => ({
        x: prev.x + (normY - 0.5) * 8,
        y: prev.y + (normX - 0.5) * -8
      }));
    }
    if (enabled && gesture === 'peace') {
      setZoom(prev => Math.min(3, prev + 0.02));
    }
    if (enabled && gesture === 'fist') {
      setZoom(prev => Math.max(0.3, prev - 0.02));
    }
  }, [enabled, cursorPosition, gesture]);

  const fetchMolecule = useCallback(async (name: string) => {
    if (!name.trim()) return;
    setLoading(true);
    setError(null);

    try {
      // Step 1: Search for CID
      const searchRes = await fetch(
        `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name)}/cids/JSON`
      );
      if (!searchRes.ok) throw new Error("Molecule not found in PubChem database");
      const searchData = await searchRes.json();
      const cid = searchData.IdentifierList.CID[0];

      // Step 2: Fetch properties
      const propRes = await fetch(
        `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/property/MolecularFormula,MolecularWeight,IUPACName/JSON`
      );
      const propData = await propRes.json();
      const props = propData.PropertyTable.Properties[0];

      // Step 3: Fetch SDF 3D structure
      const sdfRes = await fetch(
        `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/SDF?record_type=3d`
      );
      if (!sdfRes.ok) {
        // Fallback to 2D
        const sdf2dRes = await fetch(
          `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/SDF?record_type=2d`
        );
        const sdf2d = await sdf2dRes.text();
        const parsed = parseSDF(sdf2d);
        if (!parsed) throw new Error("Failed to parse molecular structure");
        setMolecule({
          name: name,
          formula: props.MolecularFormula,
          weight: props.MolecularWeight,
          atoms: parsed.atoms,
          bonds: parsed.bonds,
          iupacName: props.IUPACName,
          cid,
        });
      } else {
        const sdf = await sdfRes.text();
        const parsed = parseSDF(sdf);
        if (!parsed) throw new Error("Failed to parse molecular structure");
        setMolecule({
          name: name,
          formula: props.MolecularFormula,
          weight: props.MolecularWeight,
          atoms: parsed.atoms,
          bonds: parsed.bonds,
          iupacName: props.IUPACName,
          cid,
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch molecule");
      setMolecule(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMolecule(search);
  };

  // Mouse drag rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setRotation((prev) => ({
      x: prev.x + (e.clientY - dragStart.y) * 0.5,
      y: prev.y + (e.clientX - dragStart.x) * 0.5,
    }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  const handleMouseUp = () => setIsDragging(false);

  // Scroll zoom
  const handleWheel = (e: React.WheelEvent) => {
    setZoom((prev) => Math.max(0.3, Math.min(3, prev - e.deltaY * 0.001)));
  };

  // Project 3D to 2D
  const project = (atom: AtomData) => {
    const scale = 40 * zoom;
    const radX = (rotation.x * Math.PI) / 180;
    const radY = (rotation.y * Math.PI) / 180;

    // Rotate around Y
    let x = atom.x * Math.cos(radY) + atom.z * Math.sin(radY);
    let z = -atom.x * Math.sin(radY) + atom.z * Math.cos(radY);
    // Rotate around X
    let y = atom.y * Math.cos(radX) - z * Math.sin(radX);
    z = atom.y * Math.sin(radX) + z * Math.cos(radX);

    return { x: x * scale, y: -y * scale, z };
  };

  // Load an example on mount
  useEffect(() => {
    fetchMolecule("caffeine");
  }, [fetchMolecule]);

  const EXAMPLES = ["Water", "Caffeine", "Aspirin", "Ethanol", "Glucose", "Benzene", "Penicillin", "Dopamine"];

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
            <Atom className="w-5 h-5" />
            Molecule Viewer
          </h1>
          <p className="text-[10px] text-muted-foreground">
            Search any molecule • Powered by PubChem PUG REST API
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
        {/* Left — Search & Info */}
        <div className="w-72 shrink-0 border-r border-white/5 p-4 flex flex-col gap-4 overflow-y-auto">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="e.g. Caffeine, Aspirin..."
                className="w-full pl-9 pr-3 py-2 rounded-lg glass border border-white/10 text-sm text-foreground bg-transparent focus:outline-none focus:border-primary/40 placeholder:text-muted-foreground/30 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-2 rounded-lg glass border border-primary/30 text-primary text-xs hover:bg-primary/10 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Go"}
            </button>
          </form>

          {/* Quick examples */}
          <div>
            <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40 font-semibold mb-2">
              Quick Search
            </div>
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => { setSearch(ex); fetchMolecule(ex); }}
                  className="px-2.5 py-1 rounded-md glass border border-white/5 text-[10px] text-muted-foreground hover:text-primary hover:border-primary/20 transition-all"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
              {error}
            </div>
          )}

          {/* Molecule info */}
          {molecule && (
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="glass rounded-xl border border-white/10 p-4 space-y-3">
                <h3 className="text-base font-bold text-foreground capitalize">{molecule.name}</h3>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Formula</span>
                    <span className="text-foreground font-mono">{molecule.formula}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Weight</span>
                    <span className="text-foreground font-mono">{molecule.weight} g/mol</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Atoms</span>
                    <span className="text-foreground font-mono">{molecule.atoms.length}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Bonds</span>
                    <span className="text-foreground font-mono">{molecule.bonds.length}</span>
                  </div>
                  {molecule.iupacName && (
                    <div className="pt-2 border-t border-white/5">
                      <div className="text-[9px] text-muted-foreground/40 uppercase tracking-wider mb-1">IUPAC Name</div>
                      <div className="text-[11px] text-muted-foreground leading-relaxed">{molecule.iupacName}</div>
                    </div>
                  )}
                </div>

                {molecule.cid && (
                  <a
                    href={`https://pubchem.ncbi.nlm.nih.gov/compound/${molecule.cid}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-[10px] text-primary/70 hover:text-primary transition-colors mt-2"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View on PubChem (CID: {molecule.cid})
                  </a>
                )}
              </div>

              {/* Atom color legend */}
              <div className="glass rounded-xl border border-white/10 p-3">
                <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40 font-semibold mb-2">
                  Atom Colors
                </div>
                <div className="flex flex-wrap gap-2">
                  {[...new Set(molecule.atoms.map((a) => a.element))].map((el) => (
                    <div key={el} className="flex items-center gap-1.5">
                      <div
                        className="w-3 h-3 rounded-full border border-white/10"
                        style={{ background: ELEMENT_COLORS[el] || "#888" }}
                      />
                      <span className="text-[10px] text-muted-foreground">{el}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Center — 3D Viewer */}
        <div
          ref={containerRef}
          className="flex-1 relative min-h-0 cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <span className="text-xs text-muted-foreground">Fetching from PubChem...</span>
              </div>
            </div>
          )}

          {molecule && !loading && (
            <svg className="w-full h-full" viewBox="-300 -300 600 600">
              {/* Bonds */}
              {molecule.bonds.map((bond, i) => {
                const a1 = molecule.atoms[bond.from];
                const a2 = molecule.atoms[bond.to];
                if (!a1 || !a2) return null;
                const p1 = project(a1);
                const p2 = project(a2);
                const bonds = [];
                for (let o = 0; o < bond.order; o++) {
                  const offset = (o - (bond.order - 1) / 2) * 3;
                  const dx = p2.x - p1.x;
                  const dy = p2.y - p1.y;
                  const len = Math.sqrt(dx * dx + dy * dy) || 1;
                  const nx = -dy / len * offset;
                  const ny = dx / len * offset;
                  bonds.push(
                    <line
                      key={`${i}-${o}`}
                      x1={p1.x + nx}
                      y1={p1.y + ny}
                      x2={p2.x + nx}
                      y2={p2.y + ny}
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth={2}
                    />
                  );
                }
                return <g key={i}>{bonds}</g>;
              })}

              {/* Atoms — sorted by z for depth */}
              {molecule.atoms
                .map((atom, i) => ({ atom, i, proj: project(atom) }))
                .sort((a, b) => a.proj.z - b.proj.z)
                .map(({ atom, i, proj }) => {
                  const baseR = ELEMENT_RADII[atom.element] || 0.3;
                  const r = baseR * 35 * zoom * (1 + proj.z * 0.01);
                  const color = ELEMENT_COLORS[atom.element] || "#888888";
                  return (
                    <g key={i}>
                      <circle
                        cx={proj.x}
                        cy={proj.y}
                        r={Math.max(r, 4)}
                        fill={color}
                        stroke="rgba(255,255,255,0.15)"
                        strokeWidth={0.5}
                        filter="url(#atomGlow)"
                      />
                      {r > 8 && (
                        <text
                          x={proj.x}
                          y={proj.y}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="white"
                          fontSize={Math.min(r * 0.8, 12)}
                          fontWeight="bold"
                          fontFamily="Inter, sans-serif"
                          style={{ pointerEvents: "none" }}
                        >
                          {atom.element}
                        </text>
                      )}
                    </g>
                  );
                })}

              <defs>
                <filter id="atomGlow">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
            </svg>
          )}

          {!molecule && !loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-3">
                <Atom className="w-12 h-12 text-primary/20 mx-auto" />
                <p className="text-sm text-muted-foreground/40">
                  Search for a molecule to view its 3D structure
                </p>
              </div>
            </div>
          )}

          {/* Controls hint */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground/30">
            Drag to rotate • Scroll to zoom • ✌️ Zoom in • ✊ Zoom out
          </div>
        </div>
      </div>

    </motion.div>
  );
}
