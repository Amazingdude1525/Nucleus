import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";

type SystemType = "open" | "closed" | "isolated";

const systemInfo: Record<SystemType, { label: string; desc: string; example: string; heat: boolean; matter: boolean }> = {
  open: { label: "Open System", desc: "Exchanges both energy and matter with surroundings", example: "Boiling water in an open pot", heat: true, matter: true },
  closed: { label: "Closed System", desc: "Exchanges energy but NOT matter with surroundings", example: "Sealed pressure cooker", heat: true, matter: false },
  isolated: { label: "Isolated System", desc: "Exchanges neither energy nor matter", example: "Perfect thermos flask (ideal)", heat: false, matter: false },
};

export default function SystemTypes() {
  const navigate = useNavigate();
  const [type, setType] = useState<SystemType>("open");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    const W = 500, H = 400;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const info = systemInfo[type];

    const draw = () => {
      timeRef.current += 0.02;
      const t = timeRef.current;
      ctx.clearRect(0, 0, W, H);

      // Draw system boundary
      const bx = 150, by = 80, bw = 200, bh = 240;
      
      // Boundary wall
      ctx.strokeStyle = type === "isolated" ? "#ff4488" : type === "closed" ? "#ffcc00" : "#00c8ff";
      ctx.lineWidth = type === "isolated" ? 4 : 2;
      ctx.setLineDash(type === "open" ? [8, 4] : []);
      ctx.strokeRect(bx, by, bw, bh);
      ctx.setLineDash([]);

      // Fill system
      ctx.fillStyle = "rgba(0,200,255,0.03)";
      ctx.fillRect(bx, by, bw, bh);

      // "System" label
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.font = "bold 14px 'Inter'";
      ctx.textAlign = "center";
      ctx.fillText("SYSTEM", bx + bw / 2, by + bh / 2);
      ctx.font = "10px 'Inter'";
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.fillText("Surroundings", 75, 40);
      ctx.fillText("Surroundings", 425, 40);

      // Heat arrows (red)
      if (info.heat) {
        const arrowY = by + 60;
        for (let i = 0; i < 3; i++) {
          const offset = Math.sin(t * 2 + i * 1.5) * 15;
          const ax = bx + bw + 10 + offset;
          ctx.beginPath();
          ctx.moveTo(bx + bw + 40, arrowY + i * 30);
          ctx.lineTo(ax, arrowY + i * 30);
          ctx.strokeStyle = `rgba(255,68,68,${0.7 - i * 0.15})`;
          ctx.lineWidth = 2;
          ctx.stroke();
          // Arrow head
          ctx.beginPath();
          ctx.moveTo(ax, arrowY + i * 30 - 4);
          ctx.lineTo(ax - 6, arrowY + i * 30);
          ctx.lineTo(ax, arrowY + i * 30 + 4);
          ctx.fillStyle = `rgba(255,68,68,${0.7 - i * 0.15})`;
          ctx.fill();
        }
        ctx.fillStyle = "#ff4444";
        ctx.font = "bold 10px 'Inter'";
        ctx.textAlign = "left";
        ctx.fillText("Heat (q)", bx + bw + 45, arrowY + 15);
      } else {
        // Blocked heat
        ctx.fillStyle = "rgba(255,68,68,0.2)";
        ctx.font = "10px 'Inter'";
        ctx.textAlign = "left";
        ctx.fillText("✗ No heat", bx + bw + 15, by + 90);
      }

      // Matter arrows (blue)
      if (info.matter) {
        const arrowY = by + 160;
        for (let i = 0; i < 3; i++) {
          const offset = Math.sin(t * 2.5 + i * 1.2) * 15;
          const ax = bx - 10 - offset;
          ctx.beginPath();
          ctx.moveTo(bx - 40, arrowY + i * 25);
          ctx.lineTo(ax, arrowY + i * 25);
          ctx.strokeStyle = `rgba(68,136,255,${0.7 - i * 0.15})`;
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(ax, arrowY + i * 25 - 4);
          ctx.lineTo(ax + 6, arrowY + i * 25);
          ctx.lineTo(ax, arrowY + i * 25 + 4);
          ctx.fillStyle = `rgba(68,136,255,${0.7 - i * 0.15})`;
          ctx.fill();
        }
        ctx.fillStyle = "#4488ff";
        ctx.font = "bold 10px 'Inter'";
        ctx.textAlign = "right";
        ctx.fillText("Matter", bx - 45, arrowY + 15);
      } else {
        ctx.fillStyle = "rgba(68,136,255,0.2)";
        ctx.font = "10px 'Inter'";
        ctx.textAlign = "right";
        ctx.fillText("✗ No matter", bx - 15, by + 200);
      }

      ctx.textAlign = "start";
      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [type]);

  const info = systemInfo[type];

  return (
    <motion.div className="h-screen nucleus-bg flex flex-col relative overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5 bg-black/40 backdrop-blur-xl relative z-10 shrink-0">
        <button onClick={() => navigate(-1)} className="p-2 glass rounded-full hover:bg-white/10 text-muted-foreground transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 rounded-lg bg-[#ff8844]/10 flex items-center justify-center border border-[#ff8844]/20">
          <Layers className="w-4 h-4 text-[#ff8844]" />
        </div>
        <div>
          <h1 className="text-base font-bold text-[#ff8844] tracking-widest uppercase" style={{ textShadow: "0 0 20px rgba(255,136,68,0.3)" }}>
            SYSTEM TYPES
          </h1>
          <p className="text-[10px] text-muted-foreground/50">Open · Closed · Isolated — energy & matter exchange</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          {/* Toggle */}
          <div className="flex gap-2 mb-6 justify-center">
            {(["open", "closed", "isolated"] as SystemType[]).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  type === t 
                    ? "bg-[#00c8ff]/20 text-[#00c8ff] border border-[#00c8ff]/30 shadow-[0_0_20px_rgba(0,200,255,0.15)]" 
                    : "bg-white/[0.03] text-white/40 border border-white/5 hover:text-white/60 hover:bg-white/[0.06]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Canvas */}
          <div className="glass rounded-2xl border border-white/5 p-4 mb-6">
            <canvas ref={canvasRef} className="w-full rounded-xl" style={{ height: 400, background: "rgba(0,0,0,0.4)" }} />
          </div>

          {/* Info panel */}
          <AnimatePresence mode="wait">
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass rounded-2xl border border-white/5 p-6"
            >
              <h2 className="text-lg font-bold text-white mb-2">{info.label}</h2>
              <p className="text-sm text-white/60 mb-3">{info.desc}</p>
              <div className="flex gap-4 text-xs">
                <span className={info.heat ? "text-red-400" : "text-white/20"}>
                  {info.heat ? "✓" : "✗"} Heat exchange
                </span>
                <span className={info.matter ? "text-blue-400" : "text-white/20"}>
                  {info.matter ? "✓" : "✗"} Matter exchange
                </span>
              </div>
              <div className="mt-3 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5">
                <span className="text-[10px] text-white/30 uppercase tracking-wider">Real-world example</span>
                <p className="text-sm text-white/70 mt-1">{info.example}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
