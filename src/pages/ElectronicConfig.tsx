import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Zap } from "lucide-react";
import { elements } from "@/data/elements";

// Aufbau filling order
const AUFBAU_ORDER = [
  "1s", "2s", "2p", "3s", "3p", "4s", "3d", "4p", "5s", "4d",
  "5p", "6s", "4f", "5d", "6p", "7s", "5f", "6d", "7p",
];

const SUBSHELL_MAX: Record<string, number> = {
  s: 2, p: 6, d: 10, f: 14,
};

interface OrbitalFill {
  label: string;      // e.g. "1s"
  n: number;          // principal quantum number
  l: string;          // s, p, d, f
  maxElectrons: number;
  filled: number;
  boxes: { up: boolean; down: boolean }[];
}

const CONFIG_EXCEPTIONS: Record<number, Record<string, number>> = {
  // Period 4 anomalies — half-filled / fully-filled 3d stability
  24: { "4s": 1, "3d": 5 },   // Cr — half-filled 3d
  29: { "4s": 1, "3d": 10 },  // Cu — fully-filled 3d
  // Period 5 anomalies
  41: { "5s": 1, "4d": 4 },   // Nb
  42: { "5s": 1, "4d": 5 },   // Mo — half-filled 4d
  44: { "5s": 1, "4d": 7 },   // Ru
  45: { "5s": 1, "4d": 8 },   // Rh
  46: { "5s": 0, "4d": 10 },  // Pd — fully-filled 4d, no 5s electrons
  47: { "5s": 1, "4d": 10 },  // Ag — fully-filled 4d
  // Period 6 anomalies
  57: { "6s": 2, "5d": 1, "4f": 0 },  // La — 5d¹ before 4f
  58: { "6s": 2, "5d": 1, "4f": 1 },  // Ce — [Xe] 4f¹ 5d¹ 6s²
  64: { "6s": 2, "5d": 1, "4f": 7 },  // Gd — half-filled 4f
  78: { "6s": 1, "5d": 9 },   // Pt
  79: { "6s": 1, "5d": 10 },  // Au — fully-filled 5d
  // Period 7 anomalies (actinides)
  89: { "7s": 2, "6d": 1, "5f": 0 },  // Ac — 6d¹ before 5f
  90: { "7s": 2, "6d": 2, "5f": 0 },  // Th — 6d² before 5f
  91: { "7s": 2, "6d": 1, "5f": 2 },  // Pa
  92: { "7s": 2, "6d": 1, "5f": 3 },  // U
  93: { "7s": 2, "6d": 1, "5f": 4 },  // Np
  96: { "7s": 2, "6d": 1, "5f": 7 },  // Cm — half-filled 5f
};

function getElectronConfiguration(atomicNumber: number): OrbitalFill[] {
  let remaining = atomicNumber;
  const fills: OrbitalFill[] = [];
  const overrides = CONFIG_EXCEPTIONS[atomicNumber];

  for (const orbital of AUFBAU_ORDER) {
    if (remaining <= 0) break;
    const n = parseInt(orbital[0]);
    const l = orbital[1];
    const max = SUBSHELL_MAX[l];
    
    // Apply specific exceptions (like Cr and Cu half-filled/fully-filled stability anomalies)
    const filled = overrides && overrides[orbital] !== undefined 
      ? overrides[orbital] 
      : Math.min(remaining, max);
      
    if (filled === 0 && remaining > 0) {
      // If override forces 0 (like Pd 5s: 0), we still push it (or maybe not? standard is to omit or show 0. Let's omit Empty ones unless it's an anomaly)
      continue;
    }
    
    remaining -= filled;

    // Build box representation (each box = one orbital)
    const numOrbitals = max / 2;
    const boxes: { up: boolean; down: boolean }[] = [];

    // Fill with Hund's rule: first one electron in each, then pair
    let electronsLeft = filled;
    for (let i = 0; i < numOrbitals; i++) {
      boxes.push({ up: false, down: false });
    }
    // First pass: one up arrow each
    for (let i = 0; i < numOrbitals && electronsLeft > 0; i++) {
      boxes[i].up = true;
      electronsLeft--;
    }
    // Second pass: pair with down arrows
    for (let i = 0; i < numOrbitals && electronsLeft > 0; i++) {
      boxes[i].down = true;
      electronsLeft--;
    }

    fills.push({ label: orbital, n, l, maxElectrons: max, filled, boxes });
  }

  return fills;
}

const SUBSHELL_COLORS: Record<string, string> = {
  s: "#00F0FF",
  p: "#44ff88",
  d: "#ff8844",
  f: "#cc44ff",
};

export default function ElectronicConfiguration() {
  const [selectedZ, setSelectedZ] = useState(26); // Iron by default
  const [searchText, setSearchText] = useState("");

  const selectedElement = useMemo(
    () => elements.find((e) => e.number === selectedZ),
    [selectedZ]
  );

  const config = useMemo(() => getElectronConfiguration(selectedZ), [selectedZ]);
  const isAnomaly = selectedZ in CONFIG_EXCEPTIONS;

  const configString = useMemo(
    () => config.map((o) => `${o.label}${toSuperscript(o.filled)}`).join(" "),
    [config]
  );

  const filteredElements = useMemo(() => {
    if (!searchText.trim()) return elements;
    const q = searchText.toLowerCase();
    return elements.filter(
      (e) => e.name.toLowerCase().includes(q) || e.symbol.toLowerCase().includes(q) || String(e.number) === q
    );
  }, [searchText]);

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
            <Zap className="w-5 h-5" />
            Electronic Configuration
          </h1>
          <p className="text-[10px] text-muted-foreground">
            Aufbau principle • Hund's rule • Pauli exclusion • Orbital box diagrams
          </p>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left — Element selector */}
        <div className="w-64 shrink-0 border-r border-white/5 p-4 flex flex-col gap-3 overflow-y-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40" />
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search element..."
              className="w-full pl-9 pr-3 py-2 rounded-lg glass border border-white/10 text-sm text-foreground bg-transparent focus:outline-none focus:border-primary/40 placeholder:text-muted-foreground/30"
            />
          </div>

          <div className="space-y-1">
            {filteredElements.map((el) => (
              <motion.button
                key={el.number}
                onClick={() => setSelectedZ(el.number)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2 transition-all ${
                  selectedZ === el.number
                    ? "glass border border-primary/30 text-primary"
                    : "border border-transparent text-muted-foreground hover:bg-white/5"
                }`}
                whileTap={{ scale: 0.97 }}
              >
                <span className="w-6 text-muted-foreground/50 font-mono text-right">{el.number}</span>
                <span className="font-bold w-6">{el.symbol}</span>
                <span className="text-muted-foreground/60 truncate flex-1">{el.name}</span>
                {el.number in CONFIG_EXCEPTIONS && (
                  <span className="text-[9px] text-amber-400/80" title="Anomalous configuration">⚡</span>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Center — Configuration Display */}
        <div className="flex-1 p-6 overflow-y-auto">
          {selectedElement && (
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Element header */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl glass flex items-center justify-center text-2xl font-bold text-primary shadow-[0_0_20px_hsl(185_100%_50%/0.2)]">
                  {selectedElement.symbol}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{selectedElement.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    Z = {selectedElement.number} • {selectedElement.electronConfig}
                  </p>
                </div>
              </div>

              {/* Anomaly banner */}
              {isAnomaly && (
                <motion.div
                  className="glass rounded-xl border border-amber-500/20 p-4 flex items-start gap-3"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ boxShadow: "0 0 20px rgba(245,158,11,0.1)" }}
                >
                  <span className="text-lg">⚡</span>
                  <div>
                    <div className="text-xs font-bold text-amber-400 mb-1">Aufbau Anomaly</div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      <strong className="text-amber-400/90">{selectedElement.name}</strong> does not follow the standard Aufbau filling order.
                      {selectedZ === 24 && " Chromium prefers a half-filled 3d⁵ subshell (extra exchange energy stabilization), so one 4s electron is promoted: [Ar] 3d⁵ 4s¹ instead of [Ar] 3d⁴ 4s²."}
                      {selectedZ === 29 && " Copper prefers a fully-filled 3d¹⁰ subshell for extra stability, so one 4s electron is promoted: [Ar] 3d¹⁰ 4s¹ instead of [Ar] 3d⁹ 4s²."}
                      {selectedZ === 46 && " Palladium has no electrons in 5s at all — all 46 electrons fill up to 4d¹⁰: [Kr] 4d¹⁰."}
                      {selectedZ === 42 && " Molybdenum, like Cr, prefers a half-filled 4d⁵ subshell: [Kr] 4d⁵ 5s¹."}
                      {selectedZ === 47 && " Silver prefers a fully-filled 4d¹⁰ subshell: [Kr] 4d¹⁰ 5s¹."}
                      {selectedZ === 79 && " Gold prefers a fully-filled 5d¹⁰ subshell: [Xe] 4f¹⁴ 5d¹⁰ 6s¹."}
                      {selectedZ === 78 && " Platinum promotes one 6s electron to 5d: [Xe] 4f¹⁴ 5d⁹ 6s¹."}
                      {![24,29,42,46,47,78,79].includes(selectedZ) && " This element deviates from the predicted Aufbau order due to subshell stability effects (exchange energy / electron-electron repulsion)."}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Full configuration string */}
              <div className="glass rounded-xl border border-white/10 p-4">
                <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40 font-semibold mb-2">
                  Electron Configuration
                </div>
                <div className="text-sm font-mono text-foreground leading-relaxed break-all">
                  {configString}
                </div>
              </div>

              {/* Aufbau orbital filling diagram */}
              <div className="glass rounded-xl border border-white/10 p-4">
                <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40 font-semibold mb-4">
                  Orbital Box Diagram (Aufbau Order)
                </div>

                <div className="space-y-3">
                  <AnimatePresence>
                    {config.map((orbital, idx) => (
                      <motion.div
                        key={orbital.label}
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        {/* Label */}
                        <div
                          className="w-10 text-right text-sm font-bold font-mono shrink-0"
                          style={{ color: SUBSHELL_COLORS[orbital.l] }}
                        >
                          {orbital.label}
                        </div>

                        {/* Orbital boxes */}
                        <div className="flex items-center gap-1.5">
                          {orbital.boxes.map((box, bi) => (
                            <div
                              key={bi}
                              className="w-9 h-10 rounded border flex items-center justify-center gap-0.5"
                              style={{
                                borderColor: `${SUBSHELL_COLORS[orbital.l]}44`,
                                background: (box.up || box.down) ? `${SUBSHELL_COLORS[orbital.l]}0a` : "transparent",
                              }}
                            >
                              {box.up && (
                                <motion.span
                                  className="text-base"
                                  style={{ color: SUBSHELL_COLORS[orbital.l] }}
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                >
                                  ↑
                                </motion.span>
                              )}
                              {box.down && (
                                <motion.span
                                  className="text-base"
                                  style={{ color: SUBSHELL_COLORS[orbital.l], opacity: 0.7 }}
                                  initial={{ opacity: 0, y: -5 }}
                                  animate={{ opacity: 0.7, y: 0 }}
                                >
                                  ↓
                                </motion.span>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Fill count */}
                        <div className="text-[10px] text-muted-foreground/40 font-mono ml-2">
                          {orbital.filled}/{orbital.maxElectrons}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Subshell color legend */}
              <div className="flex gap-6 text-xs">
                {Object.entries(SUBSHELL_COLORS).map(([sub, color]) => (
                  <div key={sub} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{ background: color, boxShadow: `0 0 6px ${color}66` }}
                    />
                    <span className="text-muted-foreground font-mono">{sub}</span>
                    <span className="text-muted-foreground/40">
                      (max {SUBSHELL_MAX[sub]}e⁻)
                    </span>
                  </div>
                ))}
              </div>

              {/* Aufbau arrow diagram */}
              <div className="glass rounded-xl border border-white/10 p-4">
                <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40 font-semibold mb-3">
                  Aufbau Filling Order
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {AUFBAU_ORDER.map((orb, i) => {
                    const isFilled = i < config.length;
                    const isPartial = i === config.length - 1 && config[i]?.filled < config[i]?.maxElectrons;
                    return (
                      <div key={orb} className="flex items-center gap-1">
                        <span
                          className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                            isFilled
                              ? isPartial
                                ? "bg-primary/20 text-primary border border-primary/30"
                                : "bg-primary/10 text-primary/80"
                              : "text-muted-foreground/20"
                          }`}
                        >
                          {orb}
                        </span>
                        {i < AUFBAU_ORDER.length - 1 && (
                          <span className="text-muted-foreground/15 text-[10px]">→</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function toSuperscript(n: number): string {
  const superscripts: Record<string, string> = {
    "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
    "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
  };
  return String(n).split("").map((c) => superscripts[c] || c).join("");
}
