import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, GitBranch } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function StateVsPath() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [path, setPath] = useState<1 | 2>(1);

  // State A & B
  const PA = 5, VA = 2, PB = 1, VB = 10; // atm, L
  const nRT = PA * VA; // ideal gas, n·R·T constant for simplicity
  // ΔU (state function) — same for both paths
  const deltaU = 0; // isothermal ideal gas: ΔU = 0

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    const W = 500, H = 380;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const marginL = 60, marginB = 50, marginR = 40, marginT = 30;
    const plotW = W - marginL - marginR;
    const plotH = H - marginT - marginB;

    const toX = (v: number) => marginL + ((v - 0) / 12) * plotW;
    const toY = (p: number) => marginT + plotH - ((p - 0) / 6) * plotH;

    // Axes
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(marginL, marginT);
    ctx.lineTo(marginL, H - marginB);
    ctx.lineTo(W - marginR, H - marginB);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.font = "11px 'Inter'";
    ctx.textAlign = "center";
    ctx.fillText("V (L)", W / 2, H - 10);
    ctx.save();
    ctx.translate(18, H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("P (atm)", 0, 0);
    ctx.restore();

    // Grid
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    for (let v = 2; v <= 10; v += 2) {
      ctx.beginPath();
      ctx.moveTo(toX(v), marginT);
      ctx.lineTo(toX(v), H - marginB);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.font = "9px 'Inter'";
      ctx.textAlign = "center";
      ctx.fillText(String(v), toX(v), H - marginB + 15);
    }
    for (let p = 1; p <= 5; p++) {
      ctx.beginPath();
      ctx.moveTo(marginL, toY(p));
      ctx.lineTo(W - marginR, toY(p));
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.textAlign = "right";
      ctx.fillText(String(p), marginL - 8, toY(p) + 3);
    }

    // Points A and B
    const drawPoint = (v: number, p: number, label: string, color: string) => {
      const x = toX(v), y = toY(p);
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.shadowBlur = 12;
      ctx.shadowColor = color;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.font = "bold 12px 'Inter'";
      ctx.fillStyle = color;
      ctx.textAlign = "left";
      ctx.fillText(label, x + 10, y - 8);
      ctx.font = "9px 'Inter'";
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.fillText(`(${v}L, ${p}atm)`, x + 10, y + 6);
    };

    // Path 1: Isothermal curve (PV = const = 10)
    if (path === 1) {
      ctx.beginPath();
      ctx.strokeStyle = "#00c8ff";
      ctx.lineWidth = 2.5;
      for (let v = VA; v <= VB; v += 0.1) {
        const p = nRT / v;
        const x = toX(v), y = toY(p);
        if (v === VA) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Fill area under path 1
      ctx.lineTo(toX(VB), toY(0));
      ctx.lineTo(toX(VA), toY(0));
      ctx.closePath();
      ctx.fillStyle = "rgba(0,200,255,0.08)";
      ctx.fill();

      ctx.fillStyle = "#00c8ff";
      ctx.font = "10px 'Inter'";
      ctx.textAlign = "center";
      ctx.fillText("Path 1: Isothermal", toX(6), toY(2.2));
    }

    // Path 2: Step — first isobaric (V changes at P=PA), then isochoric (P changes at V=VB)
    if (path === 2) {
      // Isobaric leg: A(VA,PA) → (VB, PA)
      ctx.beginPath();
      ctx.strokeStyle = "#ff4488";
      ctx.lineWidth = 2.5;
      ctx.moveTo(toX(VA), toY(PA));
      ctx.lineTo(toX(VB), toY(PA));
      ctx.stroke();

      // Isochoric leg: (VB, PA) → B(VB, PB)
      ctx.beginPath();
      ctx.moveTo(toX(VB), toY(PA));
      ctx.lineTo(toX(VB), toY(PB));
      ctx.stroke();

      // Fill area under path 2
      ctx.beginPath();
      ctx.moveTo(toX(VA), toY(PA));
      ctx.lineTo(toX(VB), toY(PA));
      ctx.lineTo(toX(VB), toY(0));
      ctx.lineTo(toX(VA), toY(0));
      ctx.closePath();
      ctx.fillStyle = "rgba(255,68,136,0.08)";
      ctx.fill();

      ctx.fillStyle = "#ff4488";
      ctx.font = "10px 'Inter'";
      ctx.textAlign = "center";
      ctx.fillText("Path 2: Isobaric + Isochoric", toX(6), toY(5.5));
    }

    drawPoint(VA, PA, "A", "#ffcc00");
    drawPoint(VB, PB, "B", "#22cc88");

  }, [path]);

  // Calculate work for each path
  const wPath1 = -nRT * Math.log(VB / VA); // isothermal: w = -nRT ln(Vf/Vi), in L·atm
  const wPath2 = -PA * (VB - VA); // isobaric only (isochoric has no PdV work)
  const wPath1kJ = (wPath1 * 101.325).toFixed(1); // convert L·atm to J
  const wPath2kJ = (wPath2 * 101.325).toFixed(1);
  const q1 = (deltaU - wPath1 * 101.325).toFixed(1);
  const q2 = (deltaU - wPath2 * 101.325).toFixed(1);

  return (
    <motion.div className="h-screen nucleus-bg flex flex-col relative overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5 bg-black/40 backdrop-blur-xl relative z-10 shrink-0">
        <button onClick={() => navigate(-1)} className="p-2 glass rounded-full hover:bg-white/10 text-muted-foreground transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 rounded-lg bg-[#44ddff]/10 flex items-center justify-center border border-[#44ddff]/20">
          <GitBranch className="w-4 h-4 text-[#44ddff]" />
        </div>
        <div>
          <h1 className="text-base font-bold text-[#44ddff] tracking-widest uppercase" style={{ textShadow: "0 0 20px rgba(68,221,255,0.3)" }}>
            STATE vs PATH FUNCTIONS
          </h1>
          <p className="text-[10px] text-muted-foreground/50">PV diagram · Work depends on path, ΔU does not</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Canvas */}
          <div className="lg:col-span-2 glass rounded-2xl border border-white/5 p-4">
            <div className="flex gap-2 mb-4">
              <button onClick={() => setPath(1)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${path === 1 ? "bg-[#00c8ff]/20 text-[#00c8ff] border border-[#00c8ff]/30" : "bg-white/[0.03] text-white/40 border border-white/5"}`}>
                Path 1 — Isothermal
              </button>
              <button onClick={() => setPath(2)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${path === 2 ? "bg-[#ff4488]/20 text-[#ff4488] border border-[#ff4488]/30" : "bg-white/[0.03] text-white/40 border border-white/5"}`}>
                Path 2 — Step
              </button>
            </div>
            <canvas ref={canvasRef} className="w-full rounded-xl" style={{ height: 380, background: "rgba(0,0,0,0.4)" }} />
          </div>

          {/* Values panel */}
          <div className="glass rounded-2xl border border-white/5 p-5 space-y-4">
            <h3 className="text-xs font-bold text-white/60 tracking-widest uppercase">Thermodynamic Values</h3>
            
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">State Function</div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">ΔU (internal energy)</span>
                <span className="font-mono font-bold text-[#ffcc00]">{deltaU} J</span>
              </div>
              <div className="text-[9px] text-green-400/60 mt-1">✓ Same for ALL paths A→B</div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Path Function — Work (w)</div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#00c8ff]/70">Path 1</span>
                <span className="font-mono font-bold text-[#00c8ff]">{wPath1kJ} J</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#ff4488]/70">Path 2</span>
                <span className="font-mono font-bold text-[#ff4488]">{wPath2kJ} J</span>
              </div>
              <div className="text-[9px] text-red-400/60 mt-1">✗ Different — area under curve differs</div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Path Function — Heat (q = ΔU − w)</div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#00c8ff]/70">Path 1</span>
                <span className="font-mono font-bold text-[#00c8ff]">{q1} J</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#ff4488]/70">Path 2</span>
                <span className="font-mono font-bold text-[#ff4488]">{q2} J</span>
              </div>
            </div>

            <div className="text-[9px] text-white/20 p-2 rounded-lg bg-white/[0.02] border border-white/5 leading-relaxed">
              <strong className="text-white/40">Key insight:</strong> ΔU is path-independent (state function). Work w = −∫PdV depends on the path taken between the same two states.
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
