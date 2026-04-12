import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Wind, Info, Thermometer } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Particle { x: number; y: number; vx: number; vy: number; ax: number; ay: number; }

export default function IdealVsRealGas() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<"ideal" | "real">("ideal");
  const [temperature, setTemperature] = useState(300);
  const [particleCount, setParticleCount] = useState(80);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);

  const BOX_PAD = 40;
  const PARTICLE_R = 4;

  const initParticles = useCallback((count: number, w: number, h: number) => {
    const bw = w - BOX_PAD * 2;
    const bh = h - BOX_PAD * 2;
    const speed = Math.sqrt(temperature) * 0.15;
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      particles.push({
        x: BOX_PAD + Math.random() * bw,
        y: BOX_PAD + Math.random() * bh,
        vx: Math.cos(angle) * speed * (0.5 + Math.random()),
        vy: Math.sin(angle) * speed * (0.5 + Math.random()),
        ax: 0, ay: 0,
      });
    }
    particlesRef.current = particles;
  }, [temperature]);

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
    const bx1 = BOX_PAD, by1 = BOX_PAD, bx2 = w - BOX_PAD, by2 = h - BOX_PAD;

    if (particlesRef.current.length !== particleCount) {
      initParticles(particleCount, w, h);
    }

    // VdW parameters
    const SIGMA = 12;
    const EPSILON_VDW = 0.5;
    const CUTOFF = SIGMA * 2.5;

    const draw = () => {
      const particles = particlesRef.current;
      const speedScale = Math.sqrt(temperature) * 0.15;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#050508";
      ctx.fillRect(0, 0, w, h);

      // Box walls
      ctx.strokeStyle = mode === "real" ? "rgba(255,150,50,0.3)" : "rgba(0,240,255,0.2)";
      ctx.lineWidth = 2;
      ctx.strokeRect(bx1, by1, bx2 - bx1, by2 - by1);

      // Corner brackets
      const br = 15;
      ctx.strokeStyle = mode === "real" ? "#ff8844" : "#00F0FF";
      ctx.lineWidth = 2.5;
      [[bx1, by1, 1, 1], [bx2, by1, -1, 1], [bx1, by2, 1, -1], [bx2, by2, -1, -1]].forEach(([cx, cy, dx, dy]) => {
        ctx.beginPath();
        ctx.moveTo(cx as number, (cy as number) + (dy as number) * br);
        ctx.lineTo(cx as number, cy as number);
        ctx.lineTo((cx as number) + (dx as number) * br, cy as number);
        ctx.stroke();
      });

      // Reset accelerations
      particles.forEach(p => { p.ax = 0; p.ay = 0; });

      // Van der Waals forces (real gas only)
      if (mode === "real") {
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[j].x - particles[i].x;
            const dy = particles[j].y - particles[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < CUTOFF && dist > 2) {
              const sr6 = Math.pow(SIGMA / dist, 6);
              const force = 24 * EPSILON_VDW * (2 * sr6 * sr6 - sr6) / dist;
              const fx = force * dx / dist;
              const fy = force * dy / dist;
              particles[i].ax += fx;
              particles[i].ay += fy;
              particles[j].ax -= fx;
              particles[j].ay -= fy;

              // Draw interaction lines
              if (dist < SIGMA * 1.5) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(255,140,50,${Math.max(0, 0.15 - dist / (SIGMA * 10))})`;
                ctx.lineWidth = 1;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
              }
            }
          }
        }
      }

      // Update & draw particles
      particles.forEach(p => {
        p.vx += p.ax * 0.5;
        p.vy += p.ay * 0.5;

        // Thermostat — scale velocities toward target
        const currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (currentSpeed > 0.01) {
          const targetSpeed = speedScale * (0.7 + Math.random() * 0.6);
          const scale = 1 + (targetSpeed / currentSpeed - 1) * 0.01;
          p.vx *= scale;
          p.vy *= scale;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Bounce off walls
        if (p.x < bx1 + PARTICLE_R) { p.x = bx1 + PARTICLE_R; p.vx = Math.abs(p.vx); }
        if (p.x > bx2 - PARTICLE_R) { p.x = bx2 - PARTICLE_R; p.vx = -Math.abs(p.vx); }
        if (p.y < by1 + PARTICLE_R) { p.y = by1 + PARTICLE_R; p.vy = Math.abs(p.vy); }
        if (p.y > by2 - PARTICLE_R) { p.y = by2 - PARTICLE_R; p.vy = -Math.abs(p.vy); }

        // Draw particle
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const hue = mode === "ideal" ? 185 : 25 + speed * 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, PARTICLE_R, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${hue} 100% ${50 + speed * 3}%)`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `hsl(${hue} 100% 50%)`;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Labels
      ctx.font = "bold 10px 'Inter', sans-serif";
      ctx.fillStyle = mode === "real" ? "rgba(255,140,50,0.5)" : "rgba(0,240,255,0.5)";
      ctx.textAlign = "left";
      ctx.fillText(mode === "ideal" ? "IDEAL GAS — Perfect Elastic Collisions" : "REAL GAS — Van der Waals Interactions", bx1 + 10, by1 - 10);
      ctx.font = "9px 'Inter', monospace";
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.fillText(`N = ${particles.length}  |  T = ${temperature} K`, bx2 - 200, by1 - 10);

      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [mode, temperature, particleCount, initParticles]);

  // Reinit on count change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      initParticles(particleCount, rect.width, rect.height);
    }
  }, [particleCount, initParticles]);

  return (
    <motion.div className="h-screen nucleus-bg flex flex-col relative overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5 bg-black/40 backdrop-blur-xl relative z-10 shrink-0">
        <button onClick={() => navigate(-1)} className="p-2 glass rounded-full hover:bg-white/10 text-muted-foreground transition"><ArrowLeft className="w-5 h-5"/></button>
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20"><Wind className="w-4 h-4 text-primary" /></div>
        <div>
          <h1 className="text-base font-bold text-primary tracking-widest uppercase text-glow-cyan">Ideal vs Real Gas Chamber</h1>
          <p className="text-[10px] text-muted-foreground/50">Van der Waals • Kinetic Theory • PV = nRT</p>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden min-h-0">
        <div className="w-72 border-r border-white/5 bg-black/30 p-5 flex flex-col gap-4 shrink-0 overflow-y-auto">
          {/* Mode toggle */}
          <div className="glass rounded-xl border border-white/5 p-1 flex">
            <button onClick={() => setMode("ideal")} className={`flex-1 py-2.5 rounded-lg text-xs font-bold tracking-wider transition-all ${mode === "ideal" ? "bg-primary/15 text-primary border border-primary/30 shadow-[0_0_15px_rgba(0,240,255,0.2)]" : "text-muted-foreground/50"}`}>
              IDEAL GAS
            </button>
            <button onClick={() => setMode("real")} className={`flex-1 py-2.5 rounded-lg text-xs font-bold tracking-wider transition-all ${mode === "real" ? "bg-[#ff8844]/15 text-[#ff8844] border border-[#ff8844]/30 shadow-[0_0_15px_rgba(255,140,50,0.2)]" : "text-muted-foreground/50"}`}>
              REAL GAS
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={mode} className="glass rounded-xl border p-4" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ borderColor: (mode === "ideal" ? "#00F0FF" : "#ff8844") + "20" }}>
              <div className="text-xs font-bold mb-1" style={{ color: mode === "ideal" ? "#00F0FF" : "#ff8844" }}>
                {mode === "ideal" ? "Ideal Gas Model" : "Van der Waals Model"}
              </div>
              <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
                {mode === "ideal" ? "Particles have no volume and no intermolecular forces. Perfect elastic collisions only. PV = nRT." : "Particles experience London dispersion forces (attraction at medium range, Pauli repulsion at close range). At low T, particles clump together."}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="glass rounded-xl border border-white/5 p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5"><Thermometer className="w-3 h-3 text-yellow-400" /> Temperature</span>
              <span className="text-sm font-mono font-bold text-[#ffcc00]">{temperature} K</span>
            </div>
            <input type="range" min={50} max={800} step={10} value={temperature} onChange={(e) => setTemperature(Number(e.target.value))}
              className="w-full rounded-full appearance-none cursor-pointer slider-amber text-[#FCD34D]" />
            <div className="flex justify-between text-[9px] text-muted-foreground/30 mt-1"><span>50 K</span><span>800 K</span></div>
          </div>

          <div className="glass rounded-xl border border-white/5 p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-muted-foreground">Particles</span>
              <span className="text-sm font-mono font-bold text-primary">{particleCount}</span>
            </div>
            <input type="range" min={20} max={200} step={10} value={particleCount} onChange={(e) => setParticleCount(Number(e.target.value))}
              className="w-full rounded-full appearance-none cursor-pointer slider-cyan text-[#00D4FF]" />
          </div>

          <div className="glass rounded-xl border border-white/5 p-4 text-[11px] text-muted-foreground leading-relaxed">
            <div className="flex items-center gap-2 mb-2"><Info className="w-3.5 h-3.5 text-primary" /><span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40 font-semibold">Observe</span></div>
            <p>Switch to <strong className="text-[#ff8844]">Real Gas</strong> and <strong className="text-blue-400">lower the temperature</strong> to ~100K. Watch particles slow down and begin to clump — demonstrating <span className="text-primary">condensation</span>.</p>
          </div>
        </div>

        <div className="flex-1 relative"><canvas ref={canvasRef} className="w-full h-full" style={{ display: "block" }} /></div>
      </div>
    </motion.div>
  );
}
