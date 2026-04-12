import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Box, Info, Atom, AlertTriangle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LennardJones() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Separation distance r in Å (conceptual)
  const [r, setR] = useState(4.0); // Start away from equilibrium
  const isDragging = useRef(false);

  // Lennard-Jones parameters for Argon
  const epsilon = 0.01; // eV (well depth)
  const sigma = 3.4;     // Å (collision diameter)
  const rMin = sigma * Math.pow(2, 1 / 6); // equilibrium distance ≈ 3.816 Å

  // Calculate LJ potential
  const potential = useMemo(() => {
    if (r < 2.5) return Infinity;
    const sr6 = Math.pow(sigma / r, 6);
    return 4 * epsilon * (sr6 * sr6 - sr6);
  }, [r]);

  // Determine interaction state
  const state = useMemo(() => {
    if (r < rMin * 0.92) return "repulsive";
    if (r > rMin * 0.97 && r < rMin * 1.03) return "equilibrium";
    return "attractive";
  }, [r, rMin]);

  const stateColors = {
    repulsive: "#ff3344",
    equilibrium: "#22cc55",
    attractive: "#00bbff",
  };

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
    const width = rect.width;
    const height = rect.height;

    let animationId: number;
    let glow = 0;

    const draw = () => {
      glow += 0.03;
      ctx.clearRect(0, 0, width, height);

      // Background
      ctx.fillStyle = "#030303";
      ctx.fillRect(0, 0, width, height);

      // ─── LAYOUT ───
      const atomAreaH = height * 0.4;
      const graphAreaY = height * 0.45;
      const graphH = height * 0.5;
      const graphPadL = 80;
      const graphPadR = 40;
      const graphPadB = 40;
      const graphW = width - graphPadL - graphPadR;
      const graphBottom = graphAreaY + graphH - graphPadB;

      // ─── TOP: ATOM VISUALIZATION ───
      const atomCenterY = atomAreaH * 0.5;
      const atomScale = width * 0.08; // radius of atom visualization

      // Map r (2..10 Å) to pixel separation
      const rNorm = (r - 2) / 8; // 0..1
      const pixelSep = 60 + rNorm * (width - 200);
      const atom1X = width / 2 - pixelSep / 2;
      const atom2X = width / 2 + pixelSep / 2;

      // Connection line
      ctx.strokeStyle = `rgba(255,255,255,0.08)`;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(atom1X, atomCenterY);
      ctx.lineTo(atom2X, atomCenterY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Distance label
      ctx.font = "11px 'Inter', monospace";
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.textAlign = "center";
      ctx.fillText(`r = ${r.toFixed(2)} Å`, (atom1X + atom2X) / 2, atomCenterY + atomScale + 30);

      // Atom 1 (fixed)
      const drawAtom = (x: number, y: number, color: string, label: string, isGlowing: boolean) => {
        // Outer glow
        const glowR = atomScale * 1.6 + (isGlowing ? Math.sin(glow * 2) * 4 : 0);
        const outerGrad = ctx.createRadialGradient(x, y, atomScale * 0.5, x, y, glowR);
        outerGrad.addColorStop(0, color + "30");
        outerGrad.addColorStop(1, color + "00");
        ctx.fillStyle = outerGrad;
        ctx.beginPath();
        ctx.arc(x, y, glowR, 0, Math.PI * 2);
        ctx.fill();

        // Main sphere gradient
        const grad = ctx.createRadialGradient(x - atomScale * 0.25, y - atomScale * 0.25, 0, x, y, atomScale);
        grad.addColorStop(0, color + "ee");
        grad.addColorStop(0.7, color + "88");
        grad.addColorStop(1, color + "44");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, atomScale, 0, Math.PI * 2);
        ctx.fill();

        // Specular highlight
        const specGrad = ctx.createRadialGradient(x - atomScale * 0.3, y - atomScale * 0.35, 0, x, y, atomScale);
        specGrad.addColorStop(0, "rgba(255,255,255,0.35)");
        specGrad.addColorStop(0.5, "rgba(255,255,255,0.05)");
        specGrad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = specGrad;
        ctx.beginPath();
        ctx.arc(x, y, atomScale, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.font = "bold 14px 'Inter', sans-serif";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, x, y);
      };

      drawAtom(atom1X, atomCenterY, "#6688cc", "Ar", false);
      drawAtom(atom2X, atomCenterY, stateColors[state], "Ar", true);

      // ─── DIVIDER ───
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(40, graphAreaY - 10);
      ctx.lineTo(width - 40, graphAreaY - 10);
      ctx.stroke();

      // ─── BOTTOM: LJ POTENTIAL GRAPH ───

      // Graph background
      const graphBg = ctx.createLinearGradient(0, graphAreaY, 0, graphAreaY + graphH);
      graphBg.addColorStop(0, "rgba(255,255,255,0.01)");
      graphBg.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = graphBg;
      ctx.fillRect(graphPadL, graphAreaY, graphW, graphH - graphPadB);

      // Grid
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 1;
      for (let gx = graphPadL; gx <= graphPadL + graphW; gx += 50) {
        ctx.beginPath();
        ctx.moveTo(gx, graphAreaY);
        ctx.lineTo(gx, graphBottom);
        ctx.stroke();
      }
      for (let gy = graphAreaY; gy <= graphBottom; gy += 30) {
        ctx.beginPath();
        ctx.moveTo(graphPadL, gy);
        ctx.lineTo(graphPadL + graphW, gy);
        ctx.stroke();
      }

      // Axes
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(graphPadL, graphAreaY);
      ctx.lineTo(graphPadL, graphBottom);
      ctx.lineTo(graphPadL + graphW, graphBottom);
      ctx.stroke();

      // Zero line (V=0)
      const zeroY = graphBottom - graphH * 0.35; // Position where V=0
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(graphPadL, zeroY);
      ctx.lineTo(graphPadL + graphW, zeroY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = "9px 'Inter', monospace";
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.textAlign = "right";
      ctx.fillText("V = 0", graphPadL - 8, zeroY + 3);

      // Axis labels
      ctx.font = "9px 'Inter', monospace";
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.textAlign = "center";
      ctx.fillText("r (Å)", graphPadL + graphW / 2, graphBottom + 30);
      ctx.save();
      ctx.translate(graphPadL - 50, graphAreaY + (graphH - graphPadB) / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText("V(r) (eV)", 0, 0);
      ctx.restore();

      // r axis ticks
      for (let rTick = 3; rTick <= 9; rTick++) {
        const tickX = graphPadL + ((rTick - 2.5) / 7.5) * graphW;
        ctx.fillStyle = "rgba(255,255,255,0.2)";
        ctx.textAlign = "center";
        ctx.fillText(`${rTick}`, tickX, graphBottom + 15);
      }

      // ─── Draw LJ Curve ───
      ctx.beginPath();
      let started = false;
      const rRange = { min: 2.8, max: 10 };

      // First pass: filled area
      ctx.beginPath();
      for (let px = 0; px <= graphW; px++) {
        const rVal = rRange.min + (px / graphW) * (rRange.max - rRange.min);
        const sr6 = Math.pow(sigma / rVal, 6);
        const v = 4 * epsilon * (sr6 * sr6 - sr6);
        
        // Scale V to pixels: epsilon maps to ~40% of graph height
        const vScaled = v / (epsilon * 2) * (graphH * 0.3);
        const plotY = zeroY - vScaled;
        
        if (plotY < graphAreaY + 5) continue; // clip extreme repulsive
        if (!started) {
          ctx.moveTo(graphPadL + px, plotY);
          started = true;
        } else {
          ctx.lineTo(graphPadL + px, plotY);
        }
      }
      // Fill under curve
      const lastX = graphPadL + graphW;
      ctx.lineTo(lastX, zeroY);
      ctx.lineTo(graphPadL, zeroY);
      ctx.closePath();
      const areaGrad = ctx.createLinearGradient(0, graphAreaY, 0, graphBottom);
      areaGrad.addColorStop(0, "rgba(0,240,255,0.08)");
      areaGrad.addColorStop(0.5, "rgba(0,240,255,0.03)");
      areaGrad.addColorStop(1, "rgba(0,240,255,0)");
      ctx.fillStyle = areaGrad;
      ctx.fill();

      // Stroke the curve
      ctx.beginPath();
      started = false;
      for (let px = 0; px <= graphW; px++) {
        const rVal = rRange.min + (px / graphW) * (rRange.max - rRange.min);
        const sr6 = Math.pow(sigma / rVal, 6);
        const v = 4 * epsilon * (sr6 * sr6 - sr6);
        const vScaled = v / (epsilon * 2) * (graphH * 0.3);
        const plotY = zeroY - vScaled;
        if (plotY < graphAreaY + 5) continue;
        if (!started) {
          ctx.moveTo(graphPadL + px, plotY);
          started = true;
        } else {
          ctx.lineTo(graphPadL + px, plotY);
        }
      }
      ctx.strokeStyle = "rgba(0,240,255,0.7)";
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 8;
      ctx.shadowColor = "#00F0FF";
      ctx.stroke();
      ctx.shadowBlur = 0;

      // ─── Current position marker on graph ───
      if (r >= rRange.min && r <= rRange.max) {
        const curX = graphPadL + ((r - rRange.min) / (rRange.max - rRange.min)) * graphW;
        const sr6Cur = Math.pow(sigma / r, 6);
        const vCur = 4 * epsilon * (sr6Cur * sr6Cur - sr6Cur);
        const vScaledCur = vCur / (epsilon * 2) * (graphH * 0.3);
        const curY = zeroY - vScaledCur;

        // Vertical line from point to axis
        ctx.strokeStyle = stateColors[state] + "40";
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(curX, curY);
        ctx.lineTo(curX, graphBottom);
        ctx.stroke();
        ctx.setLineDash([]);

        // Glow ring
        ctx.beginPath();
        ctx.arc(curX, curY, 10 + Math.sin(glow * 3) * 2, 0, Math.PI * 2);
        ctx.strokeStyle = stateColors[state] + "60";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Main dot
        ctx.beginPath();
        ctx.arc(curX, curY, 6, 0, Math.PI * 2);
        ctx.fillStyle = stateColors[state];
        ctx.shadowBlur = 20;
        ctx.shadowColor = stateColors[state];
        ctx.fill();
        ctx.shadowBlur = 0;

        // Value label
        ctx.font = "bold 10px 'Inter', monospace";
        ctx.fillStyle = stateColors[state];
        ctx.textAlign = "center";
        ctx.fillText(`V = ${(vCur * 1000).toFixed(2)} meV`, curX, curY - 18);
      }

      // ─── Equilibrium marker ───
      const eqX = graphPadL + ((rMin - rRange.min) / (rRange.max - rRange.min)) * graphW;
      ctx.strokeStyle = "rgba(34,204,85,0.2)";
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      ctx.moveTo(eqX, graphAreaY);
      ctx.lineTo(eqX, graphBottom);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = "8px 'Inter', monospace";
      ctx.fillStyle = "rgba(34,204,85,0.4)";
      ctx.textAlign = "center";
      ctx.fillText("rₘᵢₙ", eqX, graphBottom + 15);

      // ─── Graph title ───
      ctx.font = "bold 10px 'Inter', sans-serif";
      ctx.fillStyle = "rgba(0,240,255,0.5)";
      ctx.textAlign = "left";
      ctx.fillText("LENNARD-JONES POTENTIAL ENERGY SURFACE", graphPadL, graphAreaY - 16);

      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [r, state]);

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

  // Mouse/touch handling for dragging atom
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const atomAreaH = rect.height * 0.4;
    const atomCenterY = atomAreaH * 0.5;
    const rNorm = (r - 2) / 8;
    const pixelSep = 60 + rNorm * (rect.width - 200);
    const atom2X = rect.width / 2 + pixelSep / 2;
    
    const dist = Math.sqrt(Math.pow(x - atom2X, 2) + Math.pow(y - atomCenterY, 2));
    if (dist < 80) {
      isDragging.current = true;
      canvas.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    
    // Map pixel position back to r
    const atom1X = rect.width / 2;
    const sepPx = x - (atom1X - 30);
    const newR = 2 + ((sepPx - 60) / (rect.width - 200)) * 8;
    setR(Math.max(2.8, Math.min(10, newR)));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDragging.current = false;
    const canvas = canvasRef.current;
    if (canvas) canvas.releasePointerCapture(e.pointerId);
  };

  // Screen flash overlay color
  const flashColor = state === "repulsive" 
    ? "rgba(255,0,0,0.06)" 
    : state === "equilibrium" 
    ? "rgba(0,255,100,0.03)" 
    : "transparent";

  return (
    <motion.div 
      className="h-screen flex flex-col relative overflow-hidden transition-colors duration-500" 
      style={{ backgroundColor: flashColor !== "transparent" ? flashColor : "#030303" }}
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5 bg-black/40 backdrop-blur-xl relative z-10 w-full shrink-0">
        <button onClick={() => navigate(-1)} className="p-2 glass rounded-full hover:bg-white/10 text-muted-foreground transition">
          <ArrowLeft className="w-5 h-5"/>
        </button>
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
          <Box className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h1 className="text-base font-bold text-primary tracking-widest uppercase text-glow-cyan">
            Lennard-Jones PES
          </h1>
          <p className="text-[10px] text-muted-foreground/50">
            Intermolecular Potential • Thermodynamic Sandbox
          </p>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Left Controls Panel */}
        <div className="w-80 border-r border-white/5 bg-black/30 backdrop-blur-sm p-6 flex flex-col gap-5 shrink-0 overflow-y-auto">
          
          {/* Interaction State Indicator */}
          <AnimatePresence mode="wait">
            <motion.div
              key={state}
              className="glass rounded-xl border p-4 flex items-center gap-3"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              style={{ 
                borderColor: stateColors[state] + "30",
                boxShadow: `0 0 25px ${stateColors[state]}15`
              }}
            >
              {state === "repulsive" && <AlertTriangle className="w-5 h-5 shrink-0" style={{ color: stateColors[state] }} />}
              {state === "equilibrium" && <CheckCircle className="w-5 h-5 shrink-0" style={{ color: stateColors[state] }} />}
              {state === "attractive" && <Atom className="w-5 h-5 shrink-0" style={{ color: stateColors[state] }} />}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider" style={{ color: stateColors[state] }}>
                  {state === "repulsive" ? "Repulsive Zone" : state === "equilibrium" ? "Equilibrium" : "Attractive Zone"}
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {state === "repulsive" && "Pauli exclusion / electron cloud overlap — strong repulsion"}
                  {state === "equilibrium" && "Minimum energy — stable van der Waals bond distance"}
                  {state === "attractive" && "London dispersion forces — weak attraction pulling atoms together"}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Distance Slider */}
          <div className="glass rounded-xl border border-white/5 p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs text-muted-foreground">Separation (r)</span>
              <span className="text-sm font-mono font-bold" style={{ color: stateColors[state] }}>
                {r.toFixed(2)} Å
              </span>
            </div>
            <input 
              type="range" 
              min={2.8} max={10.0} step={0.02} value={r} onChange={(e) => setR(Number(e.target.value))}
              className="w-full rounded-full appearance-none cursor-pointer slider-cyan text-[#00D4FF]"
            />
            <div className="flex justify-between text-[9px] text-muted-foreground/30 mt-1">
              <span>2.8 Å</span>
              <span className="text-green-400/50">rₘᵢₙ = {rMin.toFixed(2)}</span>
              <span>10 Å</span>
            </div>
          </div>

          {/* Computed Values */}
          <div className="glass rounded-xl border border-white/5 p-4 space-y-3">
            <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40 font-semibold">
              Argon (Ar–Ar) Parameters
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-muted-foreground">ε (well depth)</span>
                <span className="text-xs font-mono text-primary font-bold">{(epsilon * 1000).toFixed(1)} meV</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-muted-foreground">σ (collision dia.)</span>
                <span className="text-xs font-mono text-foreground">{sigma} Å</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-muted-foreground">rₘᵢₙ (equilibrium)</span>
                <span className="text-xs font-mono text-green-400">{rMin.toFixed(3)} Å</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-white/5">
                <span className="text-[10px] text-muted-foreground">V(r) current</span>
                <span className="text-xs font-mono font-bold" style={{ color: stateColors[state] }}>
                  {potential !== Infinity ? `${(potential * 1000).toFixed(3)} meV` : "∞"}
                </span>
              </div>
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
                <span className="text-primary font-mono font-bold">V(r)</span> = 4ε [(σ/r)¹² − (σ/r)⁶]
              </p>
              <p className="text-muted-foreground/50 text-[10px] mt-2">
                The <span className="text-primary">r⁻¹²</span> term models Pauli repulsion at short range. 
                The <span className="text-[#00bbff]">r⁻⁶</span> term models London dispersion (van der Waals) attraction.
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="glass rounded-xl border border-white/5 p-4">
            <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40 font-semibold mb-2">
              How to Use
            </div>
            <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
              <strong className="text-white/80">Drag</strong> the right Argon atom to change separation distance, or use the slider. 
              Watch the potential energy curve track your position in real-time. 
              The screen flashes <span className="text-red-400">red</span> for repulsion 
              and glows <span className="text-green-400">green</span> at equilibrium.
            </p>
          </div>
        </div>

        {/* Right — Canvas Visualization */}
        <div className="flex-1 relative flex flex-col min-h-0">
          <canvas 
            ref={canvasRef} 
            className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
            style={{ display: "block" }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          />
        </div>
      </div>
    </motion.div>
  );
}
