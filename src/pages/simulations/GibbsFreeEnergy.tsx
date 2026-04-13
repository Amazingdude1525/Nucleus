import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Flame, Snowflake, Zap, Info, ThermometerSun } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function GibbsFreeEnergy() {
  const navigate = useNavigate();
  const [deltaH, setDeltaH] = useState(-50); // kJ/mol
  const [deltaS, setDeltaS] = useState(100);  // J/(mol·K)
  const [temperature, setTemperature] = useState(298); // K
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ΔG = ΔH - TΔS (convert ΔS from J to kJ)
  const deltaG = useMemo(() => deltaH - (temperature * deltaS) / 1000, [deltaH, deltaS, temperature]);
  const isSpontaneous = deltaG < 0;
  
  // Classification
  const classification = useMemo(() => {
    if (deltaH < 0 && deltaS > 0) return { label: "Always Spontaneous", desc: "Exothermic + entropy increase. Spontaneous at ALL temperatures.", color: "#22cc55" };
    if (deltaH > 0 && deltaS < 0) return { label: "Never Spontaneous", desc: "Endothermic + entropy decrease. Non-spontaneous at ALL temperatures.", color: "#ff3344" };
    if (deltaH < 0 && deltaS < 0) return { label: "Low-T Spontaneous", desc: "Exothermic but entropy decreases. Spontaneous only at low T.", color: "#ffcc00" };
    return { label: "High-T Spontaneous", desc: "Endothermic but entropy increases. Spontaneous only at high T.", color: "#00bbff" };
  }, [deltaH, deltaS]);

  // Crossover temperature where ΔG = 0
  const crossoverT = useMemo(() => {
    if (deltaS === 0) return null;
    const t = (deltaH * 1000) / deltaS;
    return t > 0 ? t : null;
  }, [deltaH, deltaS]);

  // Canvas: draw ΔG vs T graph
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const w = rect.width;
    const h = rect.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#030303";
    ctx.fillRect(0, 0, w, h);

    const padL = 60, padR = 30, padT = 30, padB = 50;
    const gw = w - padL - padR;
    const gh = h - padT - padB;
    const tMin = 0, tMax = 1000;
    const gMin = -200, gMax = 200;

    // Grid
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1;
    for (let t = 0; t <= 1000; t += 100) {
      const x = padL + (t / tMax) * gw;
      ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, padT + gh); ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.font = "9px 'Inter', monospace";
      ctx.textAlign = "center";
      ctx.fillText(`${t}`, x, padT + gh + 15);
    }
    for (let g = gMin; g <= gMax; g += 50) {
      const y = padT + ((gMax - g) / (gMax - gMin)) * gh;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + gw, y); ctx.stroke();
    }

    // Zero line
    const zeroY = padT + (gMax / (gMax - gMin)) * gh;
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(padL, zeroY); ctx.lineTo(padL + gw, zeroY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.textAlign = "right";
    ctx.fillText("ΔG=0", padL - 8, zeroY + 3);

    // Axes labels
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.textAlign = "center";
    ctx.fillText("Temperature (K)", padL + gw / 2, h - 5);
    ctx.save();
    ctx.translate(15, padT + gh / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("ΔG (kJ/mol)", 0, 0);
    ctx.restore();

    // ΔG line
    ctx.beginPath();
    ctx.strokeStyle = isSpontaneous ? "#22cc55" : "#ff3344";
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 10;
    ctx.shadowColor = isSpontaneous ? "#22cc55" : "#ff3344";
    
    for (let t = tMin; t <= tMax; t += 2) {
      const g = deltaH - (t * deltaS) / 1000;
      const x = padL + (t / tMax) * gw;
      const y = padT + ((gMax - g) / (gMax - gMin)) * gh;
      const clampedY = Math.max(padT, Math.min(padT + gh, y));
      if (t === tMin) ctx.moveTo(x, clampedY);
      else ctx.lineTo(x, clampedY);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Fill spontaneous region
    ctx.beginPath();
    for (let t = tMin; t <= tMax; t += 2) {
      const g = deltaH - (t * deltaS) / 1000;
      const x = padL + (t / tMax) * gw;
      const y = padT + ((gMax - g) / (gMax - gMin)) * gh;
      if (g < 0 && y <= padT + gh) {
        if (t === tMin || deltaH - ((t - 2) * deltaS) / 1000 >= 0) ctx.moveTo(x, zeroY);
        ctx.lineTo(x, Math.max(padT, y));
      }
    }
    // close back to zero
    ctx.lineTo(padL + gw, zeroY);
    ctx.closePath();
    ctx.fillStyle = "rgba(34,204,85,0.08)";
    ctx.fill();

    // Current temperature marker
    const curX = padL + (temperature / tMax) * gw;
    const curG = deltaH - (temperature * deltaS) / 1000;
    const curY = padT + ((gMax - curG) / (gMax - gMin)) * gh;
    const clampCurY = Math.max(padT, Math.min(padT + gh, curY));

    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(curX, padT); ctx.lineTo(curX, padT + gh); ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.arc(curX, clampCurY, 7, 0, Math.PI * 2);
    ctx.fillStyle = isSpontaneous ? "#22cc55" : "#ff3344";
    ctx.shadowBlur = 20;
    ctx.shadowColor = isSpontaneous ? "#22cc55" : "#ff3344";
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.font = "bold 10px 'Inter', monospace";
    ctx.fillStyle = isSpontaneous ? "#22cc55" : "#ff3344";
    ctx.textAlign = "center";
    ctx.fillText(`ΔG = ${curG.toFixed(1)} kJ/mol`, curX, clampCurY - 15);

    // Crossover marker
    if (crossoverT && crossoverT > 0 && crossoverT < tMax) {
      const cX = padL + (crossoverT / tMax) * gw;
      ctx.beginPath();
      ctx.arc(cX, zeroY, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#ffcc00";
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#ffcc00";
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.font = "9px 'Inter', monospace";
      ctx.fillStyle = "#ffcc00";
      ctx.fillText(`T* = ${crossoverT.toFixed(0)} K`, cX, zeroY - 12);
    }
  }, [deltaH, deltaS, temperature, isSpontaneous, crossoverT]);

  return (
    <motion.div className="h-screen nucleus-bg flex flex-col relative overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5 bg-black/40 backdrop-blur-xl relative z-10 shrink-0">
        <button onClick={() => navigate(-1)} className="p-2 glass rounded-full hover:bg-white/10 text-muted-foreground transition"><ArrowLeft className="w-5 h-5"/></button>
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
          <Zap className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h1 className="text-base font-bold text-primary tracking-widest uppercase text-glow-cyan">Gibbs Free Energy Engine</h1>
          <p className="text-[10px] text-muted-foreground/50">Spontaneity • ΔG = ΔH − TΔS</p>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden min-h-0">
        <div className="w-80 border-r border-white/5 bg-black/30 p-5 flex flex-col gap-4 shrink-0 overflow-y-auto">
          {/* Spontaneity Indicator */}
          <AnimatePresence mode="wait">
            <motion.div
              key={isSpontaneous ? "sp" : "nsp"}
              className="rounded-xl border p-4 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                borderColor: (isSpontaneous ? "#22cc55" : "#ff3344") + "40",
                background: (isSpontaneous ? "#22cc55" : "#ff3344") + "08",
                boxShadow: `0 0 40px ${isSpontaneous ? "#22cc55" : "#ff3344"}15`,
              }}
            >
              <div className="text-lg font-black" style={{ color: isSpontaneous ? "#22cc55" : "#ff3344" }}>
                {isSpontaneous ? "SPONTANEOUS" : "NON-SPONTANEOUS"}
              </div>
              <div className="text-2xl font-mono font-bold mt-1" style={{ color: isSpontaneous ? "#22cc55" : "#ff3344" }}>
                ΔG = {deltaG.toFixed(2)} kJ/mol
              </div>
            </motion.div>
          </AnimatePresence>

          {/* ΔH Slider */}
          <div className="glass rounded-xl border border-white/5 p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                {deltaH < 0 ? <Flame className="w-3 h-3 text-red-400" /> : <Snowflake className="w-3 h-3 text-blue-400" />}
                Enthalpy (ΔH)
              </span>
              <span className="text-sm font-mono font-bold" style={{ color: deltaH < 0 ? "#ff4444" : "#4488ff" }}>
                {deltaH > 0 ? "+" : ""}{deltaH} kJ/mol
              </span>
            </div>
            <input type="range" min={-200} max={200} step={1} value={deltaH} onChange={(e) => setDeltaH(Number(e.target.value))}
              className="w-full rounded-full appearance-none cursor-pointer slider-teal text-[#10B981]"
            />
            <div className="flex justify-between text-[9px] text-muted-foreground/30 mt-1"><span>Exothermic</span><span>Endothermic</span></div>
          </div>

          {/* ΔS Slider */}
          <div className="glass rounded-xl border border-white/5 p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-muted-foreground">Entropy (ΔS)</span>
              <span className="text-sm font-mono font-bold text-[#cc44ff]">{deltaS > 0 ? "+" : ""}{deltaS} J/(mol·K)</span>
            </div>
            <input type="range" min={-300} max={300} step={1} value={deltaS} onChange={(e) => setDeltaS(Number(e.target.value))}
              className="w-full rounded-full appearance-none cursor-pointer slider-pink text-[#FF6496]"
            />
            <div className="flex justify-between text-[9px] text-muted-foreground/30 mt-1"><span>−ΔS (order)</span><span>+ΔS (disorder)</span></div>
          </div>

          {/* Temperature Slider */}
          <div className="glass rounded-xl border border-white/5 p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5"><ThermometerSun className="w-3 h-3 text-yellow-400" /> Temperature</span>
              <span className="text-sm font-mono font-bold text-[#ffcc00]">{temperature} K</span>
            </div>
            <input type="range" min={100} max={1000} step={1} value={temperature} onChange={(e) => setTemperature(Number(e.target.value))}
              className="w-full rounded-full appearance-none cursor-pointer slider-amber text-[#FCD34D]"
            />
            <div className="flex justify-between text-[9px] text-muted-foreground/30 mt-1"><span>100 K</span><span>298 K (STP)</span><span>1000 K</span></div>
          </div>

          {/* Classification */}
          <div className="glass rounded-xl border p-4" style={{ borderColor: classification.color + "20" }}>
            <div className="text-xs font-bold mb-1" style={{ color: classification.color }}>{classification.label}</div>
            <p className="text-[10px] text-muted-foreground/60">{classification.desc}</p>
            {crossoverT && <p className="text-[10px] font-mono mt-2" style={{ color: "#ffcc00" }}>Crossover at T* = {crossoverT.toFixed(0)} K ({(crossoverT - 273.15).toFixed(0)}°C)</p>}
          </div>

          <div className="glass rounded-xl border border-white/5 p-4 text-[11px] text-muted-foreground leading-relaxed">
            <div className="flex items-center gap-2 mb-2"><Info className="w-3.5 h-3.5 text-primary" /><span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40 font-semibold">Theory</span></div>
            <p><span className="font-mono font-bold text-primary">ΔG</span> = ΔH − TΔS</p>
            <p className="text-muted-foreground/40 text-[10px] mt-1">If ΔG &lt; 0 → <span className="text-green-400">Spontaneous</span>. If ΔG &gt; 0 → <span className="text-red-400">Non-spontaneous</span>.</p>
          </div>
        </div>

        <div className="flex-1 relative flex flex-col min-h-0">
          <canvas ref={canvasRef} className="w-full h-full" style={{ display: "block" }} />
        </div>
      </div>
    </motion.div>
  );
}
