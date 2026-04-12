import { useState, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Activity, Atom, Info, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Physical constants
const HBAR = 1.0546e-34;  // J·s
const M_E = 9.109e-31;     // electron mass (kg)
const EV = 1.602e-19;      // J per eV

export default function QuantumBox() {
  const [L, setL] = useState(10);   // Box length in Å
  const [n, setN] = useState(1);    // Quantum number
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Computed energy levels
  const energyEV = useMemo(() => {
    const Lm = L * 1e-10; // convert Å → m
    const E = (n * n * Math.PI * Math.PI * HBAR * HBAR) / (2 * M_E * Lm * Lm);
    return E / EV; // convert J → eV
  }, [L, n]);

  // Number of nodes = n - 1
  const nodes = n - 1;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const width = rect.width;
    const height = rect.height;

    let animationId: number;
    let time = 0;

    const draw = () => {
      time += 0.04;
      ctx.clearRect(0, 0, width, height);

      const padL = 60;
      const padR = 40;
      const drawWidth = width - padL - padR;
      const region1Y = height * 0.28;  // Wavefunction center
      const region2Y = height * 0.72;  // Probability center

      // ─── Background Gradient ───
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, "rgba(3,3,3,0.95)");
      bgGrad.addColorStop(1, "rgba(3,3,3,0.98)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // ─── Grid Lines ───
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 1;
      for (let gx = padL; gx <= padL + drawWidth; gx += 40) {
        ctx.beginPath();
        ctx.moveTo(gx, 20);
        ctx.lineTo(gx, height - 20);
        ctx.stroke();
      }
      for (let gy = 20; gy < height; gy += 40) {
        ctx.beginPath();
        ctx.moveTo(padL - 10, gy);
        ctx.lineTo(padL + drawWidth + 10, gy);
        ctx.stroke();
      }

      // ─── Box Walls ───
      // Left wall
      const wallGrad1 = ctx.createLinearGradient(padL - 8, 0, padL + 8, 0);
      wallGrad1.addColorStop(0, "rgba(0,240,255,0)");
      wallGrad1.addColorStop(0.5, "rgba(0,240,255,0.6)");
      wallGrad1.addColorStop(1, "rgba(0,240,255,0)");
      ctx.fillStyle = wallGrad1;
      ctx.fillRect(padL - 4, 30, 8, height - 60);

      // Right wall
      const wallGrad2 = ctx.createLinearGradient(padL + drawWidth - 8, 0, padL + drawWidth + 8, 0);
      wallGrad2.addColorStop(0, "rgba(0,240,255,0)");
      wallGrad2.addColorStop(0.5, "rgba(0,240,255,0.6)");
      wallGrad2.addColorStop(1, "rgba(0,240,255,0)");
      ctx.fillStyle = wallGrad2;
      ctx.fillRect(padL + drawWidth - 4, 30, 8, height - 60);

      // ─── Horizontal axis lines ───
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(padL, region1Y);
      ctx.lineTo(padL + drawWidth, region1Y);
      ctx.moveTo(padL, region2Y);
      ctx.lineTo(padL + drawWidth, region2Y);
      ctx.stroke();
      ctx.setLineDash([]);

      // ─── Section Labels ───
      ctx.font = "bold 10px 'Inter', sans-serif";
      ctx.fillStyle = "rgba(0,240,255,0.5)";
      ctx.textAlign = "left";
      ctx.fillText("ψ(x, t) — WAVE FUNCTION", padL, 24);
      ctx.fillStyle = "rgba(204,68,255,0.5)";
      ctx.fillText("|ψ(x)|² — PROBABILITY DENSITY", padL, height * 0.5 + 12);

      // ─── DIVIDER ───
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padL - 20, height * 0.5);
      ctx.lineTo(padL + drawWidth + 20, height * 0.5);
      ctx.stroke();

      // ─── Draw Wavefunction ψ(x,t) ───
      const amplitude = height * 0.16;
      const A = Math.sqrt(2 / L); // normalization

      // Glow under the curve
      ctx.beginPath();
      ctx.moveTo(padL, region1Y);
      for (let x = 0; x <= drawWidth; x++) {
        const px = (x / drawWidth) * L;
        const psi = A * Math.sin((n * Math.PI * px) / L) * Math.cos(time);
        const plotY = region1Y - psi * amplitude * (L / 2);
        ctx.lineTo(padL + x, plotY);
      }
      ctx.lineTo(padL + drawWidth, region1Y);
      ctx.closePath();
      const waveGrad = ctx.createLinearGradient(0, region1Y - amplitude, 0, region1Y + amplitude);
      waveGrad.addColorStop(0, "rgba(0,240,255,0.12)");
      waveGrad.addColorStop(0.5, "rgba(0,240,255,0.02)");
      waveGrad.addColorStop(1, "rgba(0,240,255,0.12)");
      ctx.fillStyle = waveGrad;
      ctx.fill();

      // Main wavefunction line
      ctx.beginPath();
      ctx.strokeStyle = "#00F0FF";
      ctx.lineWidth = 3;
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#00F0FF";
      for (let x = 0; x <= drawWidth; x++) {
        const px = (x / drawWidth) * L;
        const psi = A * Math.sin((n * Math.PI * px) / L) * Math.cos(time);
        const plotY = region1Y - psi * amplitude * (L / 2);
        if (x === 0) ctx.moveTo(padL + x, plotY);
        else ctx.lineTo(padL + x, plotY);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // ─── Draw Probability Density |ψ|² ───
      const probAmplitude = height * 0.2;

      // Fill area
      ctx.beginPath();
      ctx.moveTo(padL, region2Y);
      for (let x = 0; x <= drawWidth; x++) {
        const px = (x / drawWidth) * L;
        const psiBase = A * Math.sin((n * Math.PI * px) / L);
        const psiSq = psiBase * psiBase;
        const plotY = region2Y - psiSq * probAmplitude * (L / 1.5);
        ctx.lineTo(padL + x, plotY);
      }
      ctx.lineTo(padL + drawWidth, region2Y);
      ctx.closePath();
      const probGrad = ctx.createLinearGradient(0, region2Y - probAmplitude, 0, region2Y);
      probGrad.addColorStop(0, "rgba(204,68,255,0.3)");
      probGrad.addColorStop(1, "rgba(204,68,255,0.02)");
      ctx.fillStyle = probGrad;
      ctx.fill();

      // Probability outline
      ctx.beginPath();
      ctx.strokeStyle = "#cc44ff";
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#cc44ff";
      for (let x = 0; x <= drawWidth; x++) {
        const px = (x / drawWidth) * L;
        const psiBase = A * Math.sin((n * Math.PI * px) / L);
        const psiSq = psiBase * psiBase;
        const plotY = region2Y - psiSq * probAmplitude * (L / 1.5);
        if (x === 0) ctx.moveTo(padL + x, plotY);
        else ctx.lineTo(padL + x, plotY);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // ─── Highlight Nodes ───
      for (let i = 1; i < n; i++) {
        const nodeX = padL + (drawWidth * i) / n;
        
        // Node ring on wavefunction
        ctx.beginPath();
        ctx.arc(nodeX, region1Y, 6, 0, Math.PI * 2);
        ctx.strokeStyle = "#ff4444";
        ctx.lineWidth = 2;
        ctx.shadowBlur = 12;
        ctx.shadowColor = "#ff4444";
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Node dot on probability
        ctx.beginPath();
        ctx.arc(nodeX, region2Y, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#ff4444";
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#ff4444";
        ctx.fill();
        ctx.shadowBlur = 0;

        // Vertical dashed line connecting nodes
        ctx.strokeStyle = "rgba(255,68,68,0.15)";
        ctx.setLineDash([3, 5]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(nodeX, region1Y - amplitude);
        ctx.lineTo(nodeX, region2Y);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // ─── Axis tick labels ───
      ctx.font = "9px 'Inter', monospace";
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.textAlign = "center";
      ctx.fillText("0", padL, region2Y + 18);
      ctx.fillText(`${L} Å`, padL + drawWidth, region2Y + 18);
      ctx.fillText(`L/2`, padL + drawWidth / 2, region2Y + 18);

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationId);
  }, [L, n]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <motion.div 
      className="h-screen nucleus-bg flex flex-col relative overflow-hidden" 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5 bg-black/40 backdrop-blur-xl relative z-10 w-full shrink-0">
        <button onClick={() => navigate(-1)} className="p-2 glass rounded-full hover:bg-white/10 text-muted-foreground transition">
          <ArrowLeft className="w-5 h-5"/>
        </button>
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
          <Activity className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h1 className="text-base font-bold text-primary tracking-widest uppercase text-glow-cyan">
            Particle in a 1D Box
          </h1>
          <p className="text-[10px] text-muted-foreground/50">
            Schrödinger Equation Visualizer • Quantum Mechanics
          </p>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Left Controls Panel */}
        <div className="w-80 border-r border-white/5 bg-black/30 backdrop-blur-sm p-6 flex flex-col gap-6 shrink-0 overflow-y-auto">
          
          {/* Parameters Section */}
          <div>
            <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40 font-semibold mb-4">
              Quantum Parameters
            </div>
            
            {/* Box Length */}
            <div className="glass rounded-xl border border-white/5 p-4 mb-3">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-muted-foreground">Box Length (L)</span>
                <span className="text-sm text-primary font-mono font-bold">{L} Å</span>
              </div>
              <input 
                type="range" 
                min={2} max={25} step={0.5} value={L}
                onChange={(e) => setL(Number(e.target.value))}
                className="w-full rounded-full appearance-none cursor-pointer slider-teal text-[#10B981]"
              />
              <div className="flex justify-between text-[9px] text-muted-foreground/30 mt-1">
                <span>2 Å</span>
                <span>25 Å</span>
              </div>
            </div>

            {/* Quantum Number */}
            <div className="glass rounded-xl border border-white/5 p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-muted-foreground">Quantum State (n)</span>
                <span className="text-sm font-mono font-bold" style={{ color: "#cc44ff" }}>{n}</span>
              </div>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((val) => (
                  <button
                    key={val}
                    onClick={() => setN(val)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                      n === val
                        ? "bg-[#cc44ff]/20 text-[#cc44ff] border border-[#cc44ff]/30 shadow-[0_0_12px_rgba(204,68,255,0.2)]"
                        : "glass border border-white/5 text-muted-foreground/50 hover:text-muted-foreground hover:border-white/10"
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Computed Values */}
          <div className="glass rounded-xl border border-white/5 p-4 space-y-3">
            <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40 font-semibold">
              Computed Values
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-muted-foreground">Energy Eₙ</span>
                <span className="text-xs font-mono text-primary font-bold">{energyEV.toFixed(4)} eV</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-muted-foreground">Nodes</span>
                <span className="text-xs font-mono text-red-400 font-bold">{nodes}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-muted-foreground">Antinodes</span>
                <span className="text-xs font-mono text-green-400 font-bold">{n}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-muted-foreground">λ = 2L/n</span>
                <span className="text-xs font-mono text-foreground">{((2 * L) / n).toFixed(2)} Å</span>
              </div>
            </div>
          </div>

          {/* Energy Level Diagram */}
          <div className="glass rounded-xl border border-white/5 p-4">
            <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40 font-semibold mb-3">
              Energy Levels
            </div>
            <div className="flex flex-col-reverse gap-1">
              {[1, 2, 3, 4, 5].map((level) => {
                const isActive = level === n;
                const eRatio = (level * level) / (5 * 5); // normalized to n=5
                return (
                  <button
                    key={level}
                    onClick={() => setN(level)}
                    className="flex items-center gap-2 group cursor-pointer"
                  >
                    <span className="text-[9px] font-mono text-muted-foreground/40 w-6 text-right">n={level}</span>
                    <div className="flex-1 relative h-4">
                      <motion.div 
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{ 
                          width: `${20 + eRatio * 80}%`,
                          background: isActive 
                            ? "linear-gradient(90deg, #00F0FF, #cc44ff)" 
                            : "rgba(255,255,255,0.08)",
                          boxShadow: isActive ? "0 0 15px rgba(0,240,255,0.4)" : "none"
                        }}
                        animate={{ width: `${20 + eRatio * 80}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <span className={`text-[9px] font-mono ${isActive ? "text-primary" : "text-muted-foreground/30"}`}>
                      E{level}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Formula Reference */}
          <div className="glass rounded-xl border border-white/5 p-4 text-xs text-muted-foreground leading-relaxed">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-3.5 h-3.5 text-primary" />
              <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40 font-semibold">Theory</span>
            </div>
            <div className="space-y-2 text-[11px]">
              <p>
                <span className="text-primary font-mono font-bold">ψₙ(x)</span> = √(2/L) · sin(nπx/L)
              </p>
              <p>
                <span className="text-[#cc44ff] font-mono font-bold">Eₙ</span> = n²π²ℏ² / (2mL²)
              </p>
              <p className="text-muted-foreground/50 text-[10px] mt-2">
                <span className="text-red-400">●</span> Red dots = nodes (zero probability). Higher n → more nodes, higher energy.
              </p>
            </div>
          </div>
        </div>

        {/* Right — Canvas Visualization */}
        <div className="flex-1 relative flex flex-col min-h-0">
          <canvas 
            ref={canvasRef} 
            className="w-full h-full"
            style={{ display: "block" }}
          />
        </div>
      </div>
    </motion.div>
  );
}
