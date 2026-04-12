import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Gauge } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Van der Waals constants
const gasData: Record<string, { a: number; b: number; label: string; color: string }> = {
  N2: { a: 1.390, b: 0.03913, label: "N₂ (Nitrogen)", color: "#00c8ff" },
  CO2: { a: 3.592, b: 0.04267, label: "CO₂ (Carbon dioxide)", color: "#ff4488" },
  H2: { a: 0.2476, b: 0.02661, label: "H₂ (Hydrogen)", color: "#22cc88" },
};

const temps = [
  { T: 200, color: "#4488ff", label: "200 K" },
  { T: 500, color: "#ffcc00", label: "500 K" },
  { T: 1000, color: "#ff4444", label: "1000 K" },
];

const R = 0.08314; // L·bar/(mol·K)

export default function CompressibilityFactor() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gas, setGas] = useState<"N2" | "CO2" | "H2">("N2");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    const W = 560, H = 400;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const mL = 70, mB = 50, mR = 40, mT = 30;
    const pW = W - mL - mR, pH = H - mT - mB;

    const Pmax = 500; // bar
    const Zmin = 0.2, Zmax = 2.0;

    const toX = (p: number) => mL + (p / Pmax) * pW;
    const toY = (z: number) => mT + pH - ((z - Zmin) / (Zmax - Zmin)) * pH;

    // Axes
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(mL, mT);
    ctx.lineTo(mL, H - mB);
    ctx.lineTo(W - mR, H - mB);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.font = "11px 'Inter'";
    ctx.textAlign = "center";
    ctx.fillText("P (bar)", W / 2, H - 10);
    ctx.save();
    ctx.translate(18, H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Z = PV/nRT", 0, 0);
    ctx.restore();

    // Z=1 dashed line
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(mL, toY(1));
    ctx.lineTo(W - mR, toY(1));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "10px 'Inter'";
    ctx.textAlign = "right";
    ctx.fillText("Ideal (Z=1)", W - mR - 5, toY(1) - 5);

    // Grid labels
    for (let p = 0; p <= 500; p += 100) {
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.font = "9px 'Inter'";
      ctx.textAlign = "center";
      ctx.fillText(String(p), toX(p), H - mB + 15);
    }
    for (let z = 0.4; z <= 1.8; z += 0.2) {
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.textAlign = "right";
      ctx.fillText(z.toFixed(1), mL - 8, toY(z) + 3);
      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      ctx.beginPath();
      ctx.moveTo(mL, toY(z));
      ctx.lineTo(W - mR, toY(z));
      ctx.stroke();
    }

    const { a, b } = gasData[gas];

    // Plot Z vs P for each temperature
    temps.forEach(({ T, color, label }) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      let first = true;
      for (let P = 1; P <= Pmax; P += 2) {
        // Solve for V iteratively from van der Waals: (P + a/V²)(V - b) = RT
        let V = R * T / P; // initial guess (ideal)
        for (let iter = 0; iter < 20; iter++) {
          V = (R * T / (P + a / (V * V))) + b;
          if (V < b * 1.01) V = b * 1.01;
        }
        const Z = (P * V) / (R * T);
        if (Z < Zmin || Z > Zmax) { first = true; continue; }
        const x = toX(P), y = toY(Z);
        if (first) { ctx.moveTo(x, y); first = false; } else ctx.lineTo(x, y);
      }
      ctx.stroke();
    });

    // Legend
    let ly = mT + 15;
    temps.forEach(({ color, label }) => {
      ctx.fillStyle = color;
      ctx.fillRect(mL + 15, ly, 12, 3);
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "10px 'Inter'";
      ctx.textAlign = "left";
      ctx.fillText(label, mL + 32, ly + 4);
      ly += 18;
    });

    // Gas label
    ctx.fillStyle = gasData[gas].color;
    ctx.font = "bold 13px 'Inter'";
    ctx.textAlign = "right";
    ctx.fillText(gasData[gas].label, W - mR - 10, mT + 20);

  }, [gas]);

  return (
    <motion.div className="h-screen nucleus-bg flex flex-col relative overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5 bg-black/40 backdrop-blur-xl relative z-10 shrink-0">
        <button onClick={() => navigate(-1)} className="p-2 glass rounded-full hover:bg-white/10 text-muted-foreground transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 rounded-lg bg-[#22ccaa]/10 flex items-center justify-center border border-[#22ccaa]/20">
          <Gauge className="w-4 h-4 text-[#22ccaa]" />
        </div>
        <div>
          <h1 className="text-base font-bold text-[#22ccaa] tracking-widest uppercase" style={{ textShadow: "0 0 20px rgba(34,204,170,0.3)" }}>
            COMPRESSIBILITY FACTOR Z
          </h1>
          <p className="text-[10px] text-muted-foreground/50">Z = PV/nRT vs Pressure · Van der Waals equation</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          {/* Gas selector */}
          <div className="flex gap-2 mb-6 justify-center">
            {(Object.keys(gasData) as (keyof typeof gasData)[]).map((g) => (
              <button key={g} onClick={() => setGas(g as "N2" | "CO2" | "H2")}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  gas === g ? `bg-white/10 border border-white/20 shadow-lg` : "bg-white/[0.03] text-white/40 border border-white/5 hover:text-white/60"
                }`}
                style={gas === g ? { color: gasData[g].color, borderColor: gasData[g].color + "50" } : {}}
              >
                {gasData[g].label}
              </button>
            ))}
          </div>

          <div className="glass rounded-2xl border border-white/5 p-4">
            <canvas ref={canvasRef} className="w-full rounded-xl" style={{ height: 400, background: "rgba(0,0,0,0.4)" }} />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="glass rounded-xl border border-white/5 p-3 text-center">
              <div className="text-[9px] text-white/30 uppercase tracking-wider">Z &lt; 1</div>
              <div className="text-xs text-white/60 mt-1">Attractive forces dominate</div>
              <div className="text-[9px] text-white/30 mt-1">Gas more compressible than ideal</div>
            </div>
            <div className="glass rounded-xl border border-white/5 p-3 text-center">
              <div className="text-[9px] text-white/30 uppercase tracking-wider">Z = 1</div>
              <div className="text-xs text-[#ffcc00] mt-1 font-semibold">Ideal Gas</div>
              <div className="text-[9px] text-white/30 mt-1">PV = nRT exactly</div>
            </div>
            <div className="glass rounded-xl border border-white/5 p-3 text-center">
              <div className="text-[9px] text-white/30 uppercase tracking-wider">Z &gt; 1</div>
              <div className="text-xs text-white/60 mt-1">Repulsive forces dominate</div>
              <div className="text-[9px] text-white/30 mt-1">Gas less compressible than ideal</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
