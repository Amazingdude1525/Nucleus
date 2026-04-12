import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Clock, AlertCircle, ArrowRightLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Cubes from "@/components/ui/Cubes";

// ─── Timeline Data ───
const TIMELINE = [
  { year: 1926, title: "Schrödinger Equation", desc: "Erwin Schrödinger formulates the wave equation governing quantum systems — the foundation of all computational chemistry.", color: "#00c8ff" },
  { year: 1927, title: "Heitler-London", desc: "First quantum mechanical treatment of the chemical bond in H₂. Birth of valence bond theory.", color: "#22cc88" },
  { year: 1928, title: "Hartree Method", desc: "Douglas Hartree proposes the self-consistent field (SCF) approach for multi-electron atoms.", color: "#ff8844" },
  { year: 1930, title: "Fock's Exchange", desc: "Vladimir Fock incorporates Pauli's exclusion principle via antisymmetrized determinants → Hartree-Fock method.", color: "#ff44aa" },
  { year: 1951, title: "Roothaan-Hall", desc: "Clemens Roothaan and George Hall formulate HF as a matrix eigenvalue problem, enabling computational implementation.", color: "#9966ff" },
  { year: 1957, title: "Boys & Gaussian Basis Sets", desc: "S.F. Boys introduces Gaussian-type orbitals (GTOs) to dramatically speed up two-electron integral computation.", color: "#00c8ff" },
  { year: 1964, title: "Density Functional Theory", desc: "Hohenberg-Kohn theorems prove that ground-state energy is a functional of electron density — DFT is born.", color: "#22cc88" },
  { year: 1965, title: "Kohn-Sham DFT", desc: "Kohn and Sham introduce auxiliary one-electron orbitals, making DFT practical for molecules.", color: "#ff8844" },
  { year: 1971, title: "Force Fields", desc: "Allinger's MM1 molecular mechanics force field enables simulation of large organic molecules.", color: "#ffcc00" },
  { year: 1977, title: "Car-Parrinello MD", desc: "Roberto Car and Michele Parrinello unify DFT with molecular dynamics — ab initio MD.", color: "#ff44aa" },
  { year: 1998, title: "Nobel Prize: DFT + CI", desc: "Walter Kohn (DFT) and John Pople (ab initio methods) share Nobel Prize in Chemistry.", color: "#00c8ff" },
  { year: 2013, title: "Nobel Prize: Multi-scale", desc: "Karplus, Levitt, and Warshel win Nobel for development of multiscale models for complex chemical systems (QM/MM).", color: "#22cc88" },
  { year: 2024, title: "AI + Quantum Chemistry", desc: "Machine learning potentials, neural network wavefunctions (FermiNet, PauliNet), and AlphaFold revolutionize computational chemistry.", color: "#9966ff" },
];

// ─── Chemistry Unit Converter ───
function UnitConverter() {
  const [value, setValue] = useState(1.0);
  const [unit, setUnit] = useState("hartree");

  // Conversion factors FROM [unit] TO hartree
  const toHartree: Record<string, number> = {
    hartree: 1,
    eV: 1 / 27.21138,
    "kcal/mol": 1 / 627.5095,
    "kJ/mol": 1 / 2625.500,
    "cm⁻¹": 1 / 219474.6,
    K: 1 / 315775.0,
  };

  const units = Object.keys(toHartree);
  const hartreeValue = value * toHartree[unit];

  const conversions = useMemo(() => {
    return units.map((u) => ({
      unit: u,
      value: hartreeValue / toHartree[u],
    }));
  }, [hartreeValue, units]);

  return (
    <div className="glass rounded-xl border border-white/5 p-5">
      <h3 className="text-xs font-bold text-primary tracking-widest mb-4 flex items-center gap-2">
        <ArrowRightLeft className="w-4 h-4" /> CHEMISTRY UNIT CONVERTER
      </h3>
      
      <div className="flex gap-3 mb-5">
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
          className="flex-1 px-4 py-2.5 rounded-xl glass border border-white/10 text-sm font-mono text-white bg-black/30 focus:outline-none focus:border-primary/50"
        />
        <select 
          value={unit} 
          onChange={(e) => setUnit(e.target.value)}
          className="px-3 py-2.5 rounded-xl glass border border-white/10 text-sm text-white bg-black/30 focus:outline-none focus:border-primary/50"
        >
          {units.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2.5">
        {conversions.filter(c => c.unit !== unit).map((c) => (
          <motion.div 
            key={c.unit}
            className="flex justify-between items-center px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/5"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span className="text-[11px] text-muted-foreground/60 font-medium">{c.unit}</span>
            <span className="text-sm font-mono text-primary font-semibold">
              {Math.abs(c.value) < 0.001 || Math.abs(c.value) > 1e6 
                ? c.value.toExponential(4) 
                : c.value.toFixed(4)}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Error & Precision Demo ───
function ErrorDemo() {
  const [basisSet, setBasisSet] = useState(3); // STO-3G=1, 6-31G=2, 6-311G*=3, cc-pVDZ=4, cc-pVTZ=5, cc-pVQZ=6
  const [timestep, setTimestep] = useState(1.0); // fs

  // Simulated errors (conceptual, not exact)
  const basisLabels = ["STO-3G", "6-31G", "6-311G*", "cc-pVDZ", "cc-pVTZ", "cc-pVQZ"];
  const basisErrors = [45, 22, 12, 8, 3, 0.8]; // mHartree error relative to CBS
  const basisCost = [1, 5, 20, 40, 200, 1000]; // relative computational cost

  const currentBasisError = basisErrors[basisSet - 1] || 0;
  const currentBasisLabel = basisLabels[basisSet - 1] || "";
  const currentBasisCost = basisCost[basisSet - 1] || 0;

  // Timestep error in MD (quadratic in dt)
  const dtError = 0.5 * timestep * timestep; // approximate energy drift per step

  return (
    <div className="glass rounded-xl border border-white/5 p-5">
      <h3 className="text-xs font-bold text-[#ff8844] tracking-widest mb-4 flex items-center gap-2">
        <AlertCircle className="w-4 h-4" /> ERROR & PRECISION
      </h3>

      {/* Basis Set Truncation */}
      <div className="mb-6">
        <div className="text-[10px] text-muted-foreground/50 mb-1 uppercase tracking-wider">Basis Set Truncation Error</div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-muted-foreground">{currentBasisLabel}</span>
          <span className="text-xl font-orbitron font-bold text-[#ff8844]">{currentBasisError} mHartree</span>
        </div>
        <input type="range" min={1} max={6} step={1} value={basisSet} onChange={(e) => setBasisSet(Number(e.target.value))}
          className="w-full rounded-full appearance-none cursor-pointer slider-cyan text-[#00E5FF]"
        />
        
        {/* Visual error bars */}
        <div className="flex items-end gap-2 h-16">
          {basisErrors.map((err, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <motion.div 
                className="w-full rounded-t relative"
                style={{ backgroundColor: i === basisSet - 1 ? "#ff8844" : "rgba(255,136,68,0.2)" }}
                animate={{ height: `${(err / 50) * 50}px` }}
              >
                {/* Error bar whiskers */}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3/4 h-0.5 bg-white/20" />
              </motion.div>
              <span className="text-[7px] text-muted-foreground/40">{basisLabels[i].substring(0, 5)}</span>
            </div>
          ))}
        </div>
        <div className="text-[9px] text-muted-foreground/40 mt-2">
          Cost: ~{currentBasisCost}× relative to STO-3G
        </div>
      </div>

      {/* Timestep Error */}
      <div>
        <div className="text-[10px] text-muted-foreground/50 mb-1 uppercase tracking-wider">Finite Timestep Error (MD)</div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-muted-foreground">Δt = {timestep.toFixed(1)} fs</span>
          <span className="text-xl font-orbitron font-bold text-[#9966ff]">~{dtError.toFixed(2)} kJ/mol drift</span>
        </div>
        <input type="range" min={0.1} max={5.0} step={0.1} value={timestep} onChange={(e) => setTimestep(Number(e.target.value))}
          className="w-full rounded-full appearance-none cursor-pointer mb-3 slider-cyan text-[#00E5FF]"
        />
        <div className="flex justify-between text-[9px] text-muted-foreground/40 mt-1">
          <span>Conservative (0.5 fs)</span>
          <span>Aggressive (5.0 fs)</span>
        </div>
        <div className="mt-3 glass rounded-lg border border-[#9966ff]/20 p-2 text-[9px] text-muted-foreground/50">
          Energy error scales as O(Δt²) in Verlet integrator. Typical production: Δt = 1–2 fs with bond constraints.
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───
export default function CompChemIntro() {
  const navigate = useNavigate();

  return (
    <motion.div className="h-screen bg-[#030303] flex flex-col relative overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5 bg-black/40 backdrop-blur-xl relative z-10 shrink-0">
        <button onClick={() => navigate(-1)} className="p-2 glass rounded-full hover:bg-white/10 text-muted-foreground transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
          <BookOpen className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h1 className="text-base font-bold text-primary tracking-widest uppercase text-glow-cyan">
            COMPUTATIONAL CHEMISTRY
          </h1>
          <p className="text-[10px] text-muted-foreground/50">Timeline · Error Analysis · Unit Converter</p>
        </div>
      </div>

      <div className="absolute inset-0 z-0 opacity-40"><Cubes /></div>`n      <div className="flex-1 overflow-y-auto relative z-10">
        {/* Timeline Section */}
        <div className="max-w-4xl mx-auto px-8 py-10">
          <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground/40 mb-8 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Historical Timeline (1926 → Present)
            <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
          </h2>

          <div className="relative">
            {/* Spine line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-[#00c8ff]/30 via-[#ff44aa]/20 to-[#22cc88]/30" />

            {TIMELINE.map((entry, i) => (
              <motion.div
                key={entry.year}
                className="relative flex items-start gap-6 mb-12 group hover:scale-[1.02] transition-transform duration-500"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                {/* Dot on spine */}
                <div className="relative z-10 shrink-0">
                  <div className="w-3 h-3 rounded-full border-2 mt-1.5" 
                    style={{ borderColor: entry.color, backgroundColor: `${entry.color}22` }}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 glass rounded-2xl border border-white/5 px-6 py-5 group-hover:border-[#00E5FF]/30 transition-all duration-500 shadow-[0_0_0_transparent] hover:shadow-[0_0_30px_rgba(0,229,255,0.15)]">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="text-xl font-orbitron font-bold" style={{ color: entry.color }}>{entry.year}</span>
                    <span className="text-base font-semibold text-white tracking-wide uppercase">{entry.title}</span>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed font-space mt-1">{entry.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Interactive Panels */}
        <div className="max-w-7xl mx-auto px-8 pb-16">
          <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground/40 mb-8 flex items-center gap-2">
            Interactive Tools
            <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UnitConverter />
            <ErrorDemo />
            <SignificantFiguresDemo />
            <PrecisionAccuracyDemo />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
