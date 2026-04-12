import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, SquareFunction } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Side = "top" | "right" | "bottom" | "left";

const sides: Record<Side, { label: string; variable: string; relation: string; derivation: string; from: string; natural: string }> = {
  top: {
    label: "T — S (top side)",
    variable: "Temperature & Entropy",
    relation: "(∂T/∂V)_S = −(∂P/∂S)_V",
    derivation: "From dU = TdS − PdV\n∂²U/∂S∂V = ∂²U/∂V∂S\n⇒ (∂T/∂V)_S = −(∂P/∂S)_V",
    from: "Internal Energy U",
    natural: "dU = TdS − PdV",
  },
  right: {
    label: "P — T (right side)",
    variable: "Pressure & Temperature",
    relation: "(∂V/∂T)_P = −(∂S/∂P)_T",
    derivation: "From dG = −SdT + VdP\n∂²G/∂T∂P = ∂²G/∂P∂T\n⇒ −(∂S/∂P)_T = (∂V/∂T)_P",
    from: "Gibbs Free Energy G",
    natural: "dG = −SdT + VdP",
  },
  bottom: {
    label: "V — P (bottom side)",
    variable: "Volume & Pressure",
    relation: "(∂T/∂P)_S = (∂V/∂S)_P",
    derivation: "From dH = TdS + VdP\n∂²H/∂S∂P = ∂²H/∂P∂S\n⇒ (∂T/∂P)_S = (∂V/∂S)_P",
    from: "Enthalpy H",
    natural: "dH = TdS + VdP",
  },
  left: {
    label: "S — V (left side)",
    variable: "Entropy & Volume",
    relation: "(∂P/∂T)_V = (∂S/∂V)_T",
    derivation: "From dA = −SdT − PdV\n∂²A/∂T∂V = ∂²A/∂V∂T\n⇒ −(∂P/∂T)_V = −(∂S/∂V)_T\n⇒ (∂P/∂T)_V = (∂S/∂V)_T",
    from: "Helmholtz Free Energy A",
    natural: "dA = −SdT − PdV",
  },
};

const cornerColors: Record<string, string> = {
  U: "#ff4488",
  H: "#ff8844",
  G: "#22cc88",
  A: "#9966ff",
};

export default function MaxwellRelations() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Side | null>(null);

  return (
    <motion.div className="h-screen nucleus-bg flex flex-col relative overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5 bg-black/40 backdrop-blur-xl relative z-10 shrink-0">
        <button onClick={() => navigate(-1)} className="p-2 glass rounded-full hover:bg-white/10 text-muted-foreground transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 rounded-lg bg-[#cc66ff]/10 flex items-center justify-center border border-[#cc66ff]/20">
          <SquareFunction className="w-4 h-4 text-[#cc66ff]" />
        </div>
        <div>
          <h1 className="text-base font-bold text-[#cc66ff] tracking-widest uppercase" style={{ textShadow: "0 0 20px rgba(204,102,255,0.3)" }}>
            MAXWELL'S RELATIONS
          </h1>
          <p className="text-[10px] text-muted-foreground/50">Thermodynamic square · Click any side for the Maxwell relation</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Thermodynamic Square */}
          <div className="glass rounded-2xl border border-white/5 p-8 flex flex-col items-center">
            <h3 className="text-xs font-bold text-white/50 tracking-widest uppercase mb-8">Thermodynamic Square</h3>
            <div className="relative w-64 h-64">
              {/* Square border */}
              <svg viewBox="0 0 200 200" className="w-full h-full absolute inset-0">
                <rect x="30" y="30" width="140" height="140" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              </svg>

              {/* Corners — U, H, G, A */}
              {[
                { label: "U", x: "left-0 top-0", pos: "-translate-x-1/2 -translate-y-1/2", absPos: { left: "15%", top: "15%" } },
                { label: "H", x: "right-0 top-0", pos: "translate-x-1/2 -translate-y-1/2", absPos: { right: "15%", top: "15%" } },
                { label: "G", x: "right-0 bottom-0", pos: "translate-x-1/2 translate-y-1/2", absPos: { right: "15%", bottom: "15%" } },
                { label: "A", x: "left-0 bottom-0", pos: "-translate-x-1/2 translate-y-1/2", absPos: { left: "15%", bottom: "15%" } },
              ].map((corner) => (
                <div key={corner.label} className="absolute w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black"
                  style={{
                    ...corner.absPos,
                    background: `${cornerColors[corner.label]}20`,
                    border: `1px solid ${cornerColors[corner.label]}40`,
                    color: cornerColors[corner.label],
                    boxShadow: `0 0 15px ${cornerColors[corner.label]}20`,
                  }}>
                  {corner.label}
                </div>
              ))}

              {/* Side labels — T, S, P, V */}
              {[
                { label: "T", side: "top" as Side, style: { top: "15%", left: "50%", transform: "translateX(-50%) translateY(-50%)" } },
                { label: "P", side: "right" as Side, style: { top: "50%", right: "15%", transform: "translateX(50%) translateY(-50%)" } },
                { label: "V", side: "bottom" as Side, style: { bottom: "15%", left: "50%", transform: "translateX(-50%) translateY(50%)" } },
                { label: "S", side: "left" as Side, style: { top: "50%", left: "15%", transform: "translateX(-50%) translateY(-50%)" } },
              ].map((s) => (
                <button
                  key={s.label}
                  onClick={() => setSelected(selected === s.side ? null : s.side)}
                  className={`absolute w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    selected === s.side
                      ? "bg-[#00c8ff]/30 text-[#00c8ff] border border-[#00c8ff]/50 shadow-[0_0_20px_rgba(0,200,255,0.3)] scale-125"
                      : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white hover:scale-110"
                  }`}
                  style={s.style}
                >
                  {s.label}
                </button>
              ))}

              {/* Diagonal arrows (Good Physicists Have Studied Under Very Fine Teachers) */}
              <svg viewBox="0 0 200 200" className="w-full h-full absolute inset-0 pointer-events-none">
                <line x1="45" y1="45" x2="155" y2="155" stroke="rgba(255,255,255,0.07)" strokeWidth="1" strokeDasharray="4 3" />
                <line x1="155" y1="45" x2="45" y2="155" stroke="rgba(255,255,255,0.07)" strokeWidth="1" strokeDasharray="4 3" />
              </svg>
            </div>

            <p className="text-[9px] text-white/20 mt-6 text-center max-w-xs">
              Click any side variable (T, S, P, V) to see the corresponding Maxwell relation and its derivation.
            </p>
          </div>

          {/* Derivation panel */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div
                  key={selected}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass rounded-2xl border border-white/5 p-6 space-y-4"
                >
                  <div className="text-[10px] text-white/30 uppercase tracking-widest">{sides[selected].label}</div>
                  <div className="text-lg font-mono font-bold text-[#00c8ff]" style={{ textShadow: "0 0 10px rgba(0,200,255,0.3)" }}>
                    {sides[selected].relation}
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Derived from: {sides[selected].from}</div>
                    <div className="text-xs font-mono text-white/60">{sides[selected].natural}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="text-[9px] text-white/30 uppercase tracking-wider mb-2">Derivation</div>
                    <pre className="text-xs font-mono text-white/50 whitespace-pre-wrap leading-relaxed">
                      {sides[selected].derivation}
                    </pre>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass rounded-2xl border border-white/5 p-8 text-center"
                >
                  <SquareFunction className="w-12 h-12 text-white/10 mx-auto mb-4" />
                  <p className="text-sm text-white/30">Select a side of the thermodynamic square to view the Maxwell relation</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* All relations summary */}
            <div className="glass rounded-2xl border border-white/5 p-5">
              <h4 className="text-[10px] font-bold text-white/40 tracking-widest uppercase mb-3">All Four Maxwell Relations</h4>
              <div className="space-y-2">
                {(Object.keys(sides) as Side[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelected(s)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-all ${
                      selected === s ? "bg-[#00c8ff]/10 text-[#00c8ff] border border-[#00c8ff]/20" : "bg-white/[0.02] text-white/40 border border-transparent hover:text-white/60 hover:bg-white/[0.04]"
                    }`}
                  >
                    {sides[s].relation}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
