import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FirstLawCalc() {
  const navigate = useNavigate();
  const [q, setQ] = useState(100);
  const [w, setW] = useState(-40);
  const [preset, setPreset] = useState<"custom" | "isothermal" | "adiabatic">("custom");

  const deltaU = q + w;

  const applyPreset = (p: "isothermal" | "adiabatic" | "custom") => {
    setPreset(p);
    if (p === "isothermal") { setQ(200); setW(-200); } // ΔU = 0 for ideal gas
    else if (p === "adiabatic") { setQ(0); setW(-150); } // q = 0
  };

  return (
    <motion.div className="h-screen nucleus-bg flex flex-col relative overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5 bg-black/40 backdrop-blur-xl relative z-10 shrink-0">
        <button onClick={() => navigate(-1)} className="p-2 glass rounded-full hover:bg-white/10 text-muted-foreground transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 rounded-lg bg-[#ff6644]/10 flex items-center justify-center border border-[#ff6644]/20">
          <Flame className="w-4 h-4 text-[#ff6644]" />
        </div>
        <div>
          <h1 className="text-base font-bold text-[#ff6644] tracking-widest uppercase" style={{ textShadow: "0 0 20px rgba(255,102,68,0.3)" }}>
            FIRST LAW CALCULATOR
          </h1>
          <p className="text-[10px] text-muted-foreground/50">ΔU = q + w · Sign conventions · Process presets</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-6">
            {/* Presets */}
            <div className="glass rounded-2xl border border-white/5 p-5">
              <h3 className="text-xs font-bold text-white/60 tracking-widest uppercase mb-3">Process Presets</h3>
              <div className="flex gap-2">
                {[
                  { key: "custom" as const, label: "Custom" },
                  { key: "isothermal" as const, label: "Isothermal" },
                  { key: "adiabatic" as const, label: "Adiabatic" },
                ].map((p) => (
                  <button key={p.key} onClick={() => applyPreset(p.key)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      preset === p.key ? "bg-[#ff6644]/20 text-[#ff6644] border border-[#ff6644]/30" : "bg-white/[0.03] text-white/40 border border-white/5"
                    }`}>
                    {p.label}
                  </button>
                ))}
              </div>
              {preset === "isothermal" && (
                <p className="text-[9px] text-white/30 mt-2">Isothermal ideal gas: ΔT = 0 → ΔU = 0, so q = −w</p>
              )}
              {preset === "adiabatic" && (
                <p className="text-[9px] text-white/30 mt-2">Adiabatic: q = 0 → ΔU = w (all work converts to internal energy)</p>
              )}
            </div>

            {/* Sliders */}
            <div className="glass rounded-2xl border border-white/5 p-5 space-y-5">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-white/60">Heat (q)</span>
                  <span className="text-sm font-mono font-bold text-red-400">{q > 0 ? "+" : ""}{q} J</span>
                </div>
                <input type="range" min={-500} max={500} step={10} value={q}
                  onChange={(e) => { setQ(Number(e.target.value)); setPreset("custom"); }}
                  className="w-full rounded-full appearance-none cursor-pointer slider-amber text-[#FCD34D]"
                />
                <div className="flex justify-between text-[8px] text-white/20 mt-1">
                  <span>q &lt; 0: heat released</span>
                  <span>q &gt; 0: heat absorbed</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-white/60">Work (w)</span>
                  <span className="text-sm font-mono font-bold text-blue-400">{w > 0 ? "+" : ""}{w} J</span>
                </div>
                <input type="range" min={-500} max={500} step={10} value={w}
                  onChange={(e) => { setW(Number(e.target.value)); setPreset("custom"); }}
                  className="w-full rounded-full appearance-none cursor-pointer slider-teal text-[#10B981]"
                />
                <div className="flex justify-between text-[8px] text-white/20 mt-1">
                  <span>w &lt; 0: work done BY system</span>
                  <span>w &gt; 0: work done ON system</span>
                </div>
              </div>
            </div>
          </div>

          {/* Result + Diagram */}
          <div className="space-y-6">
            {/* ΔU Result */}
            <div className="glass rounded-2xl border border-white/5 p-6 text-center">
              <div className="text-[10px] text-white/30 uppercase tracking-widest mb-2">Internal Energy Change</div>
              <div className="text-4xl font-black font-mono mb-2" 
                style={{ color: deltaU >= 0 ? "#22cc88" : "#ff4488", textShadow: `0 0 20px ${deltaU >= 0 ? "rgba(34,204,136,0.3)" : "rgba(255,68,136,0.3)"}` }}>
                ΔU = {deltaU > 0 ? "+" : ""}{deltaU} J
              </div>
              <div className="text-xs text-white/40">
                {deltaU > 0 ? "System internal energy increases" : deltaU < 0 ? "System internal energy decreases" : "No change in internal energy"}
              </div>
            </div>

            {/* Sign Convention Diagram */}
            <div className="glass rounded-2xl border border-white/5 p-5">
              <h3 className="text-xs font-bold text-white/60 tracking-widest uppercase mb-4">Sign Convention (IUPAC)</h3>
              <div className="relative">
                <svg viewBox="0 0 300 200" className="w-full">
                  {/* System box */}
                  <rect x="90" y="50" width="120" height="100" rx="12" fill="rgba(0,200,255,0.05)" stroke="rgba(0,200,255,0.3)" strokeWidth="1.5" />
                  <text x="150" y="105" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="12" fontWeight="bold">SYSTEM</text>
                  
                  {/* Heat arrows */}
                  <line x1="30" y1="75" x2="85" y2="75" stroke={q > 0 ? "#ff4444" : "rgba(255,68,68,0.2)"} strokeWidth="2" markerEnd="url(#arrowRed)" />
                  <text x="55" y="65" textAnchor="middle" fill={q > 0 ? "#ff4444" : "rgba(255,68,68,0.2)"} fontSize="9">q &gt; 0</text>
                  
                  <line x1="215" y1="75" x2="270" y2="75" stroke={q < 0 ? "#ff4444" : "rgba(255,68,68,0.2)"} strokeWidth="2" markerEnd="url(#arrowRed)" />
                  <text x="245" y="65" textAnchor="middle" fill={q < 0 ? "#ff4444" : "rgba(255,68,68,0.2)"} fontSize="9">q &lt; 0</text>
                  
                  {/* Work arrows */}
                  <line x1="30" y1="125" x2="85" y2="125" stroke={w > 0 ? "#4488ff" : "rgba(68,136,255,0.2)"} strokeWidth="2" markerEnd="url(#arrowBlue)" />
                  <text x="55" y="145" textAnchor="middle" fill={w > 0 ? "#4488ff" : "rgba(68,136,255,0.2)"} fontSize="9">w &gt; 0</text>
                  
                  <line x1="215" y1="125" x2="270" y2="125" stroke={w < 0 ? "#4488ff" : "rgba(68,136,255,0.2)"} strokeWidth="2" markerEnd="url(#arrowBlue)" />
                  <text x="245" y="145" textAnchor="middle" fill={w < 0 ? "#4488ff" : "rgba(68,136,255,0.2)"} fontSize="9">w &lt; 0</text>

                  {/* Equation */}
                  <text x="150" y="185" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="14" fontWeight="bold" fontFamily="monospace">
                    ΔU = q + w
                  </text>

                  <defs>
                    <marker id="arrowRed" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                      <polygon points="0 0, 8 3, 0 6" fill="#ff4444" />
                    </marker>
                    <marker id="arrowBlue" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                      <polygon points="0 0, 8 3, 0 6" fill="#4488ff" />
                    </marker>
                  </defs>
                </svg>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2 text-[9px]">
                <div className="text-red-400/60">→ Into system: q positive</div>
                <div className="text-red-400/60">→ Out of system: q negative</div>
                <div className="text-blue-400/60">→ On system: w positive</div>
                <div className="text-blue-400/60">→ By system: w negative</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
