import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Atom, FlaskConical, Network, Cpu, Zap, Users, Sparkles, ArrowRight,
  Activity, Box, Waves, ThermometerSun, Wind, LineChart,
  Layers, GitBranch, Gauge, Flame, SquareFunction,
  BookOpen, Clock, Microscope, Ruler, ChevronRight, ChevronDown, X
} from "lucide-react";
import MagicBento from "@/components/ui/MagicBento";
import DotGrid from "@/components/ui/DotGrid";

// ─── Timeline Data ───
const timelineEvents = [
  { year: "1925", title: "Heisenberg", desc: "Matrix mechanics formulation of quantum mechanics" },
  { year: "1926", title: "Schrödinger", desc: "Wave equation — foundation of quantum chemistry" },
  { year: "1953", title: "Monte Carlo", desc: "Metropolis et al. — first computational sampling method" },
  { year: "1956", title: "First MD", desc: "Alder & Wainwright — molecular dynamics of hard spheres" },
  { year: "1964", title: "Liquid Ar MD", desc: "Rahman — first realistic MD simulation of liquid Argon" },
  { year: "1977", title: "Protein MD", desc: "McCammon, Gelin & Karplus — first protein MD simulation" },
  { year: "1998", title: "Nobel DFT", desc: "Kohn & Pople — Nobel Prize for DFT and computational methods" },
  { year: "2013", title: "Nobel QM/MM", desc: "Karplus, Levitt & Warshel — multiscale QM/MM modeling" },
];

// ─── Methods Data ───
const qmMethods = [
  { name: "Ab Initio", pros: "High accuracy, no empirical parameters", cons: "Very expensive for large systems", best: "Small molecules, benchmarks" },
  { name: "DFT", pros: "Good accuracy/cost ratio", cons: "Approximate exchange-correlation", best: "Medium-sized molecules, materials" },
  { name: "Semiempirical", pros: "Fast, parameterized", cons: "Limited transferability", best: "Large organic molecules, screening" },
];
const classicalMethods = [
  { name: "Molecular Mechanics", pros: "Very fast, simple", cons: "No electronic structure", best: "Conformational analysis, docking" },
  { name: "Molecular Dynamics", pros: "Time evolution, thermodynamics", cons: "Force field dependent", best: "Proteins, materials at finite T" },
  { name: "Monte Carlo", pros: "Efficient sampling, equilibrium", cons: "No real dynamics", best: "Phase equilibria, free energies" },
];

// ─── Length/Time Scale Data ───
const scaleRegions = [
  { label: "QM",       range: "1–10 Å / fs",     color: "#00E5FF", left: 0,  width: 25 },
  { label: "DFT/Semi", range: "10–100 Å / ps",   color: "#006EFF", left: 25, width: 25 },
  { label: "MD/MM",   range: "nm–μm / ns–μs",    color: "#006EFF", left: 50, width: 25 },
  { label: "Continuum", range: "μm–m / ms–s",    color: "#FF6496", left: 75, width: 25 },
];

function MethodCard({ method, color }: { method: typeof qmMethods[0]; color: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div 
      onClick={() => setExpanded(!expanded)}
      className="cursor-pointer rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all p-2.5 relative"
      style={{ borderLeft: `2px solid ${color}50` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold" style={{ color }}>{method.name}</span>
        <ChevronDown className={`w-3 h-3 text-white/30 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 space-y-1 text-[9px]">
              <p className="text-green-400/80">✓ {method.pros}</p>
              <p className="text-red-400/80">✗ {method.cons}</p>
              <p style={{ color: color + 'cc' }}>★ Best for: {method.best}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Dashboard() {
  const userName = localStorage.getItem("nucleus-user-name") || "Buddy";

  return (
    <motion.div 
      className="flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto relative nucleus-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background — DotGrid with cyan ripple */}
      <div className="fixed inset-0 z-0 w-screen h-screen" style={{ top: 0 }}>
        <DotGrid
          dotSize={3}
          gap={22}
          baseColor="#1c1c38"
          activeColor="#00E5FF"
          proximity={200}
          shockRadius={300}
          shockStrength={5}
          resistance={0.92}
        />
      </div>

      <div className="relative z-10 max-w-7xl w-full mx-auto p-8 pt-10 pb-24 flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-2">
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <div className="mb-2 font-mono-data text-xs tracking-[0.4em] uppercase opacity-60" style={{ color: "#00E5FF" }}>
              Welcome back, {userName}
            </div>
            <h1 
              className="text-5xl md:text-6xl font-black tracking-tight text-white mb-2 font-orbitron"
              style={{ textShadow: "0 0 40px rgba(0,229,255,0.2)" }}
            >
              NUCLEUS<motion.span 
                style={{ color: "#00E5FF" }}
                animate={{ textShadow: ["0 0 10px rgba(0,229,255,0.5)", "0 0 30px rgba(0,229,255,0.8)", "0 0 10px rgba(0,229,255,0.5)"] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >.</motion.span>
            </h1>
            <p className="text-muted-foreground/60 max-w-lg text-sm leading-relaxed font-space">
              The unified environment for computational chemistry. Explore quantum models, run thermodynamic simulations, and accelerate your research.
            </p>
          </motion.div>
          
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3 }}>
            <Link to="/virtual-lab" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all font-space"
              style={{ background: "linear-gradient(135deg, #00E5FF, #006EFF)", color: "#fff", boxShadow: "0 0 30px rgba(0,229,255,0.3), 0 0 60px rgba(0,110,255,0.15)" }}>
              Enter Lab <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        {/* BENTO GRID — 3 columns, dynamic rows */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 auto-rows-[240px]">
          
          {/* Virtual Lab (span 2) */}
          <Link to="/virtual-lab" className="md:col-span-2 block group">
            <MagicBento glowColor="#00c8ff" className="h-full relative overflow-hidden">
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#050b14] from-30% via-[#0a1628]/80 to-transparent z-10" />
                <img 
                  src="/virtual_lab.png" 
                  alt="Virtual Lab" 
                  className="w-full h-full object-cover opacity-80 mix-blend-screen group-hover:scale-110 transition-transform duration-1000 ease-out"
                />
              </div>
              <div className="flex-1 flex flex-col justify-end relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-[#00c8ff]/10 text-[#00c8ff] flex items-center justify-center mb-3 border border-[#00c8ff]/20 shadow-[0_0_20px_rgba(0,200,255,0.15)] group-hover:bg-[#00c8ff]/20 transition-all">
                  <FlaskConical className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-bold mb-1.5 drop-shadow-lg text-white">Virtual Lab</h2>
                <p className="text-white/70 text-sm w-4/5 drop-shadow-md">Mix chemicals, track ΔH, measure pH, observe famous reactions in real-time.</p>
              </div>
            </MagicBento>
          </Link>

          {/* AI Assistant */}
          <Link to="/ai" className="block group">
            <MagicBento glowColor="#ff44aa" className="h-full relative overflow-hidden">
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#050b14] from-40% via-black/60 to-transparent z-10" />
                <img 
                  src="/ai_bot.png" 
                  alt="AI Assistant" 
                  className="w-full h-full object-cover opacity-80 mix-blend-screen group-hover:scale-110 transition-transform duration-1000 ease-out"
                />
              </div>
              <div className="flex-1 flex flex-col justify-end relative z-10 w-4/5">
                <div className="w-12 h-12 rounded-xl bg-[#ff44aa]/10 text-[#ff44aa] flex items-center justify-center mb-2 border border-[#ff44aa]/20 shadow-[0_0_15px_rgba(255,68,170,0.15)] group-hover:bg-[#ff44aa]/20 transition-all">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold mb-1 drop-shadow-md text-white">AI Assistant</h2>
                <p className="text-white/70 text-xs drop-shadow leading-relaxed">Ask chemistry questions, get step-by-step guidance.</p>
              </div>
            </MagicBento>
          </Link>

          {/* Atomic Viewer */}
          <Link to="/atomic-viewer" className="block group">
            <MagicBento glowColor="#44ff88" className="h-full relative overflow-hidden">
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(5,11,20,0.9)_20%,rgba(0,0,0,0.4)_100%)] z-10" />
                <img 
                  src="/atomic.png" 
                  alt="Atomic Viewer" 
                  className="w-full h-full object-cover opacity-80 mix-blend-screen group-hover:scale-110 transition-transform duration-1000 ease-out"
                />
              </div>
              <div className="flex-1 flex flex-col justify-center items-center text-center relative z-10">
                <Atom className="w-10 h-10 text-[#44ff88] mb-2 drop-shadow-lg" />
                <h3 className="font-bold text-lg drop-shadow text-white font-orbitron">Atomic Viewer</h3>
                <p className="text-xs text-white/70 mt-1 font-space">Elements · Bohr models</p>
              </div>
            </MagicBento>
          </Link>

          {/* Molecule Viewer */}
          <Link to="/molecule" className="block group">
            <MagicBento glowColor="#ff8844" className="h-full relative overflow-hidden">
               <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(5,11,20,0.95)_10%,rgba(0,0,0,0.2)_100%)] z-10" />
                <img 
                  src="/molecule.png" 
                  alt="Molecule Viewer" 
                  className="w-full h-full object-cover opacity-80 mix-blend-screen group-hover:scale-110 transition-transform duration-1000 ease-out"
                />
              </div>
              <div className="flex-1 flex flex-col justify-center items-center text-center relative z-10">
                <Network className="w-10 h-10 text-[#ff8844] mb-2 drop-shadow-[0_0_15px_#ff884455]" />
                <h3 className="font-bold text-lg drop-shadow text-white font-orbitron">Molecules</h3>
                <p className="text-xs text-white/70 mt-1 font-space">3D structures from PubChem</p>
              </div>
            </MagicBento>
          </Link>

          {/* Crystal */}
          <Link to="/crystal" className="block group">
            <MagicBento glowColor="#ffcc00" className="h-full relative overflow-hidden">
               <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(5,11,20,0.95)_15%,rgba(0,0,0,0.3)_100%)] z-10" />
                <img 
                  src="/crystal.png" 
                  alt="Crystal Lattice" 
                  className="w-full h-full object-cover opacity-80 mix-blend-screen group-hover:scale-110 transition-transform duration-1000 ease-out"
                />
              </div>
              <div className="flex-1 flex flex-col justify-center items-center text-center relative z-10">
                <Cpu className="w-10 h-10 text-[#ffcc00] mb-2 drop-shadow-[0_0_15px_#ffcc0066]" />
                <h3 className="font-bold text-lg drop-shadow text-white font-orbitron">Crystal Lattice</h3>
                <p className="text-xs text-white/70 mt-1 font-space">SC, BCC, FCC unit cells</p>
              </div>
            </MagicBento>
          </Link>
        </div>

        {/* ──── SIMULATIONS SECTION ──── */}
        <div className="pt-2">
          <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground/40 mb-6 flex items-center gap-2 font-orbitron">
            <div className="w-6 h-px bg-gradient-to-r from-transparent to-[#00E5FF]/40" />
            Discovery Hub — Simulations
            <div className="flex-1 h-px bg-gradient-to-r from-[#00E5FF]/40 to-transparent" />
          </h2>
        </div>

        {/* SIMULATIONS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 auto-rows-[200px]">
          {/* Quantum Box */}
          <Link to="/simulations/quantum-box" className="block group">
            <MagicBento glowColor="#00bbff" className="h-full relative overflow-hidden">
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(5,11,20,0.9)_20%,rgba(0,0,0,0.4)_100%)] z-10" />
                <img src="/quantum_box.png" alt="Quantum Box" className="w-full h-full object-cover opacity-80 mix-blend-screen group-hover:scale-110 transition-transform duration-1000 ease-out" />
              </div>
              <div className="flex-1 flex flex-col justify-center items-center text-center relative z-10">
                <Activity className="w-9 h-9 text-[#00bbff] mb-2" />
                <h3 className="font-bold">Particle in a Box</h3>
                <p className="text-[10px] text-muted-foreground mt-1 text-white/50">1D Quantum well · Energy states</p>
              </div>
            </MagicBento>
          </Link>

          {/* De Broglie */}
          <Link to="/simulations/de-broglie" className="block group">
            <MagicBento glowColor="#9966ff" className="h-full relative overflow-hidden">
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(5,11,20,0.9)_20%,rgba(0,0,0,0.4)_100%)] z-10" />
                <img src="/de_broglie.png" alt="De Broglie" className="w-full h-full object-cover opacity-80 mix-blend-screen group-hover:scale-110 transition-transform duration-1000 ease-out" />
              </div>
              <div className="flex-1 flex flex-col justify-center items-center text-center relative z-10">
                <Waves className="w-9 h-9 text-[#9966ff] mb-2" />
                <h3 className="font-bold">De Broglie Wavelength</h3>
                <p className="text-[10px] text-muted-foreground mt-1 text-white/50">Macro vs quantum wavelength comparison</p>
              </div>
            </MagicBento>
          </Link>

          {/* Lennard-Jones */}
          <Link to="/simulations/lennard-jones" className="block group">
            <MagicBento glowColor="#22cc88" className="h-full relative overflow-hidden">
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(5,11,20,0.9)_20%,rgba(0,0,0,0.4)_100%)] z-10" />
                <img src="/lennard_jones.png" alt="Lennard-Jones" className="w-full h-full object-cover opacity-80 mix-blend-screen group-hover:scale-110 transition-transform duration-1000 ease-out" />
              </div>
              <div className="flex-1 flex flex-col justify-center items-center text-center relative z-10">
                <Box className="w-9 h-9 text-[#22cc88] mb-2" />
                <h3 className="font-bold">Intermolecular Potential</h3>
                <p className="text-[10px] text-muted-foreground mt-1 text-white/50">Drag atoms · Lennard-Jones states</p>
              </div>
            </MagicBento>
          </Link>

          {/* Gibbs Free Energy */}
          <Link to="/simulations/gibbs-free-energy" className="block group">
            <MagicBento glowColor="#ff6622" className="h-full relative overflow-hidden">
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(5,11,20,0.9)_20%,rgba(0,0,0,0.4)_100%)] z-10" />
                <img src="/gibbs.png" alt="Gibbs" className="w-full h-full object-cover opacity-80 mix-blend-screen group-hover:scale-110 transition-transform duration-1000 ease-out" />
              </div>
              <div className="flex-1 flex flex-col justify-center items-center text-center relative z-10">
                <ThermometerSun className="w-9 h-9 text-[#ff6622] mb-2" />
                <h3 className="font-bold">Gibbs Free Energy</h3>
                <p className="text-[10px] text-muted-foreground mt-1 text-white/50">ΔG spontaneity engine · ΔH−TΔS</p>
              </div>
            </MagicBento>
          </Link>

          {/* Ideal vs Real Gas */}
          <Link to="/simulations/ideal-vs-real-gas" className="block group">
            <MagicBento glowColor="#ff4488" className="h-full relative overflow-hidden">
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(5,11,20,0.9)_20%,rgba(0,0,0,0.4)_100%)] z-10" />
                <img src="/ideal_gas.png" alt="Gas Laws" className="w-full h-full object-cover opacity-80 mix-blend-screen group-hover:scale-110 transition-transform duration-1000 ease-out" />
              </div>
              <div className="flex-1 flex flex-col justify-center items-center text-center relative z-10">
                <Wind className="w-9 h-9 text-[#ff4488] mb-2" />
                <h3 className="font-bold">Ideal vs Real Gas</h3>
                <p className="text-[10px] text-muted-foreground mt-1 text-white/50">Van der Waals · Particle chamber</p>
              </div>
            </MagicBento>
          </Link>
        </div>

        {/* ──── NEW THERMO SIMULATIONS ──── */}
        <div className="pt-2">
          <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground/40 mb-6 flex items-center gap-2 font-orbitron">
            <div className="w-6 h-px bg-gradient-to-r from-transparent to-[#FF6496]/40" />
            Thermodynamics & Advanced
            <div className="flex-1 h-px bg-gradient-to-r from-[#FF6496]/40 to-transparent" />
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 auto-rows-[200px]">
          {/* System Types */}
          <Link to="/simulations/system-types" className="block group">
            <MagicBento glowColor="#FF6496" className="h-full relative overflow-hidden">
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#050b14] from-30% via-[#0a0810]/80 to-transparent z-10" />
                <img src="/system_types.png" alt="System Types" className="w-full h-full object-cover opacity-80 mix-blend-screen group-hover:scale-110 transition-transform duration-1000 ease-out" />
              </div>
              <div className="flex-1 flex flex-col justify-center items-center text-center relative z-10">
                <Layers className="w-9 h-9 text-[#FF6496] mb-2 drop-shadow-lg" />
                <h3 className="font-bold">System Types</h3>
                <p className="text-[10px] text-muted-foreground mt-1 text-white/50">Open / Closed / Isolated toggle</p>
              </div>
            </MagicBento>
          </Link>

          {/* State vs Path */}
          <Link to="/simulations/state-vs-path" className="block group">
            <MagicBento glowColor="#FF6496" className="h-full relative overflow-hidden">
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#050814] from-30% via-[#0a0820]/80 to-transparent z-10" />
                <img src="/state_path.png" alt="State vs Path" className="w-full h-full object-cover opacity-80 mix-blend-screen group-hover:scale-110 transition-transform duration-1000 ease-out" />
              </div>
              <div className="flex-1 flex flex-col justify-center items-center text-center relative z-10">
                <GitBranch className="w-9 h-9 text-[#FF6496] mb-2 drop-shadow-lg" />
                <h3 className="font-bold">State vs Path Functions</h3>
                <p className="text-[10px] text-muted-foreground mt-1 text-white/50">PV diagram · Work as area</p>
              </div>
            </MagicBento>
          </Link>

          {/* Compressibility Factor Z */}
          <Link to="/simulations/compressibility" className="block group">
            <MagicBento glowColor="#10B981" className="h-full relative overflow-hidden">
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#050b10] from-30% via-[#081510]/80 to-transparent z-10" />
                <img src="/compressibility.png" alt="Compressibility" className="w-full h-full object-cover opacity-75 mix-blend-screen group-hover:scale-110 transition-transform duration-1000 ease-out" />
              </div>
              <div className="flex-1 flex flex-col justify-center items-center text-center relative z-10">
                <Gauge className="w-9 h-9 text-[#10B981] mb-2 drop-shadow-lg" />
                <h3 className="font-bold">Compressibility Factor Z</h3>
                <p className="text-[10px] text-muted-foreground mt-1 text-white/50">Z = PV/nRT at multiple T</p>
              </div>
            </MagicBento>
          </Link>

          {/* First Law Calculator */}
          <Link to="/simulations/first-law" className="block group">
            <MagicBento glowColor="#FF6496" className="h-full relative overflow-hidden">
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#0d0500] from-30% via-[#0a0810]/80 to-transparent z-10" />
                <img src="/first_law.png" alt="First Law" className="w-full h-full object-cover opacity-80 mix-blend-screen group-hover:scale-110 transition-transform duration-1000 ease-out" />
              </div>
              <div className="flex-1 flex flex-col justify-center items-center text-center relative z-10">
                <Flame className="w-9 h-9 text-[#FF6496] mb-2 drop-shadow-lg" />
                <h3 className="font-bold">First Law Calculator</h3>
                <p className="text-[10px] text-muted-foreground mt-1 text-white/50">ΔU = q + w · Sign conventions</p>
              </div>
            </MagicBento>
          </Link>

          {/* Maxwell's Relations */}
          <Link to="/simulations/maxwell-relations" className="block group">
            <MagicBento glowColor="#FF6496" className="h-full relative overflow-hidden">
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#08051a] from-30% via-[#0a0820]/80 to-transparent z-10" />
                <img src="/maxwell_relations.png" alt="Maxwell" className="w-full h-full object-cover opacity-80 mix-blend-screen group-hover:scale-110 transition-transform duration-1000 ease-out" />
              </div>
              <div className="flex-1 flex flex-col justify-center items-center text-center relative z-10">
                <SquareFunction className="w-9 h-9 text-[#FF6496] mb-2 drop-shadow-lg" />
                <h3 className="font-bold">Maxwell's Relations</h3>
                <p className="text-[10px] text-muted-foreground mt-1 text-white/50">Thermodynamic square · 4 relations</p>
              </div>
            </MagicBento>
          </Link>

          {/* PES Explorer */}
          <Link to="/pes" className="block group">
            <MagicBento glowColor="#22ccaa" className="h-full relative overflow-hidden">
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(5,11,20,0.9)_20%,rgba(0,0,0,0.4)_100%)] z-10" />
                <img src="/pes_explorer.png" alt="PES Explorer" className="w-full h-full object-cover opacity-80 mix-blend-screen group-hover:scale-110 transition-transform duration-1000 ease-out" />
              </div>
              <div className="flex-1 flex flex-col justify-center items-center text-center relative z-10">
                <LineChart className="w-9 h-9 text-[#22ccaa] mb-2" />
                <h3 className="font-bold font-orbitron">Potential Energy</h3>
                <p className="text-[10px] text-muted-foreground mt-1 text-white/50 font-space">IMF · Force fields · Conformers</p>
              </div>
            </MagicBento>
          </Link>
        </div>

        {/* ──── KNOW MORE — COMPUTATIONAL CHEMISTRY ──── */}
        <div className="pt-4">
          <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground/40 mb-6 flex items-center gap-2 font-orbitron">
            <div className="w-6 h-px bg-gradient-to-r from-transparent to-[#00E5FF]/40" />
            Know More — Computational Chemistry
            <div className="flex-1 h-px bg-gradient-to-r from-[#00E5FF]/40 to-transparent" />
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 — What is Computational Chemistry */}
          <motion.div
            className="card-neutral rounded-2xl p-6 group relative overflow-hidden"
            whileHover={{ y: -2 }}
          >
            {/* Hexagonal chemistry motif overlay */}
            <div className="absolute inset-0 hex-pattern-overlay opacity-100 pointer-events-none rounded-2xl" />
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#00E5FF]/6 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-[#00E5FF]/12 transition-all duration-700" />
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/15 text-[#00E5FF] flex items-center justify-center mb-4 border border-[#00E5FF]/25">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2 font-orbitron">What is Computational Chemistry?</h3>
              <p className="text-xs text-white/55 leading-relaxed font-space">
                Computational chemistry uses mathematical models and computer simulations to solve chemical problems. It bridges the gap between theory and experiment — predicting molecular properties, reaction mechanisms, and material behavior at atomic resolution.
              </p>
              <p className="text-xs text-white/40 leading-relaxed mt-2 font-space">
                From drug design to materials science, it provides insights that complement and guide real-world experiments, enabling scientists to explore chemical space faster and cheaper than ever before.
              </p>
            </div>
          </motion.div>

          {/* Card 2 — History & Evolution — Timeline */}
          <motion.div
            className="card-neutral rounded-2xl p-6 group relative overflow-hidden"
            whileHover={{ y: -2 }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6496]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-[#FF6496]/10 transition-all duration-700" />
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-[#FF6496]/12 text-[#FF6496] flex items-center justify-center mb-4 border border-[#FF6496]/20">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-3 font-orbitron">History & Evolution</h3>
              <div className="overflow-x-auto scrollbar-thin pb-2 -mx-2 px-2">
                <div className="flex gap-3 min-w-max">
                  {timelineEvents.map((ev, i) => (
                    <div key={i} className="flex flex-col items-center min-w-[90px] relative">
                      {/* Year in Orbitron */}
                      <div className="text-[10px] font-bold text-[#FF6496] mb-1 font-orbitron">{ev.year}</div>
                      {/* Glowing amber pulse dot */}
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FF6496] mb-1 relative z-10 animate-pulse-amber" />
                      {i < timelineEvents.length - 1 && (
                        <div className="absolute top-[27px] left-[calc(50%+5px)] w-[calc(100%-10px)] h-px bg-gradient-to-r from-[#FF6496]/40 to-[#FF6496]/10" />
                      )}
                      <div className="text-[9px] font-semibold text-white/70 text-center">{ev.title}</div>
                      <div className="text-[7px] text-white/30 text-center mt-0.5 max-w-[80px] leading-tight">{ev.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 3 — Methods at a Glance */}
          <motion.div
            className="card-neutral rounded-2xl p-6 group relative overflow-hidden"
            whileHover={{ y: -2 }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E5FF]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-[#00E5FF]/10 transition-all duration-700" />
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/12 text-[#00E5FF] flex items-center justify-center mb-4 border border-[#00E5FF]/20">
                <Microscope className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-3 font-orbitron">Methods at a Glance</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  {/* Violet for QM */}
                  <div className="text-[9px] font-bold tracking-widest uppercase mb-2" style={{ color: "#00E5FF" }}>Quantum (QM)</div>
                  <div className="space-y-1.5">
                    {qmMethods.map((m) => <MethodCard key={m.name} method={m} color="#00E5FF" />)}
                  </div>
                </div>
                <div>
                  {/* Amber for Classical */}
                  <div className="text-[9px] font-bold tracking-widest uppercase mb-2" style={{ color: "#006EFF" }}>Classical</div>
                  <div className="space-y-1.5">
                    {classicalMethods.map((m) => <MethodCard key={m.name} method={m} color="#006EFF" />)}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 4 — Length & Time Scales */}
          <motion.div
            className="card-neutral rounded-2xl p-6 group relative overflow-hidden"
            whileHover={{ y: -2 }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#006EFF]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-[#006EFF]/10 transition-all duration-700" />
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-[#006EFF]/12 text-[#006EFF] flex items-center justify-center mb-4 border border-[#006EFF]/20">
                <Ruler className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-3 font-orbitron">Length & Time Scales</h3>
              
              {/* Length scale bar — each region distinct color */}
              <div className="mb-4">
                <div className="text-[8px] text-white/30 mb-1.5 tracking-wider uppercase font-mono">Length: Å → Meters</div>
                <div className="relative h-7 rounded-lg overflow-hidden bg-white/[0.03] border border-white/5">
                  {scaleRegions.map((r) => (
                    <div key={r.label} className="absolute top-0 h-full flex items-center justify-center transition-all"
                      style={{ left: `${r.left}%`, width: `${r.width}%`, background: `${r.color}20`, borderRight: '1px solid rgba(255,255,255,0.04)' }}>
                      <span className="text-[8px] font-bold" style={{ color: r.color, textShadow: `0 0 8px ${r.color}80` }}>{r.label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[7px] text-white/20 mt-1 px-1 font-mono">
                  <span>1 Å</span><span>1 nm</span><span>1 μm</span><span>1 m</span>
                </div>
              </div>

              {/* Time scale bar */}
              <div>
                <div className="text-[8px] text-white/30 mb-1.5 tracking-wider uppercase font-mono">Time: fs → Seconds</div>
                <div className="relative h-7 rounded-lg overflow-hidden bg-white/[0.03] border border-white/5">
                  {scaleRegions.map((r) => (
                    <div key={r.label + "-t"} className="absolute top-0 h-full flex items-center justify-center"
                      style={{ left: `${r.left}%`, width: `${r.width}%`, background: `${r.color}20`, borderRight: '1px solid rgba(255,255,255,0.04)' }}>
                      <span className="text-[7px] font-mono font-bold" style={{ color: r.color }}>{r.range.split('/')[1]?.trim()}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[7px] text-white/20 mt-1 px-1 font-mono">
                  <span>1 fs</span><span>1 ps</span><span>1 μs</span><span>1 s</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Beautiful Creators Arrow Link Footer */}
        <div className="flex justify-center pt-24 pb-12">
          <Link 
            to="/creators" 
            className="group flex flex-col items-center gap-6"
          >
            <motion.div 
              className="flex items-center gap-4 text-muted-foreground/40 group-hover:text-[#00E5FF] transition-colors duration-500"
              initial={{ opacity: 0.5 }}
              whileHover={{ opacity: 1 }}
            >
              <div className="w-12 h-px bg-white/5 group-hover:bg-[#00E5FF]/30 transition-colors" />
              <span className="text-[10px] uppercase tracking-[0.6em] font-space">Meet the Creators</span>
              <div className="w-12 h-px bg-white/5 group-hover:bg-[#00E5FF]/30 transition-colors" />
            </motion.div>
            
            <motion.div 
              className="w-16 h-16 rounded-full border border-white/5 bg-white/[0.01] flex items-center justify-center relative overflow-hidden"
              whileHover={{ scale: 1.15, borderColor: "rgba(0,229,255,0.4)", boxShadow: "0 0 40px rgba(0,229,255,0.15)" }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <ArrowRight className="w-7 h-7 text-muted-foreground group-hover:text-[#00E5FF] group-hover:translate-x-1.5 transition-all duration-500" />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#00E5FF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <motion.div 
                className="absolute inset-0 rounded-full border-t border-[#00E5FF]/40 opacity-0 group-hover:opacity-100"
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
