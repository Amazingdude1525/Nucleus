import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Waves, Info, Scale } from "lucide-react";
import { useNavigate } from "react-router-dom";

const H = 6.626e-34; // Planck's constant (J·s)
const C = 3e8;        // Speed of light (m/s)

interface ObjectPreset {
  name: string;
  mass: number;     // kg
  velocity: number; // m/s
  emoji: string;
  color: string;
}

const PRESETS: ObjectPreset[] = [
  { name: "Electron", mass: 9.109e-31, velocity: 2.2e6, emoji: "⚛️", color: "#00F0FF" },
  { name: "Proton", mass: 1.673e-27, velocity: 1e5, emoji: "🔵", color: "#5566ff" },
  { name: "Alpha Particle", mass: 6.646e-27, velocity: 1.5e7, emoji: "🟡", color: "#ffcc00" },
  { name: "Bullet (5g)", mass: 0.005, velocity: 700, emoji: "🔫", color: "#ff4444" },
  { name: "Baseball (145g)", mass: 0.145, velocity: 40, emoji: "⚾", color: "#ff8844" },
  { name: "Tennis Ball", mass: 0.058, velocity: 60, emoji: "🎾", color: "#44ff88" },
  { name: "Car (1500kg)", mass: 1500, velocity: 30, emoji: "🚗", color: "#cc44ff" },
  { name: "Earth", mass: 5.972e24, velocity: 29800, emoji: "🌍", color: "#4488ff" },
];

function formatSI(value: number): string {
  if (value === 0) return "0";
  const exp = Math.floor(Math.log10(Math.abs(value)));
  if (exp >= -2 && exp <= 3) return value.toPrecision(4);
  const mantissa = value / Math.pow(10, exp);
  return `${mantissa.toFixed(3)} × 10^${exp}`;
}

function getWavelengthContext(lambda: number): string {
  if (lambda > 1e-1) return "Larger than a human — completely classical, no wave behavior.";
  if (lambda > 1e-6) return "Infrared / microwave range — still no observable quantum effects.";
  if (lambda > 1e-9) return "Nanometer scale — approaching molecular sizes, but still classical.";
  if (lambda > 1e-10) return "Sub-nanometer — comparable to atomic radii! Diffraction possible.";
  if (lambda > 1e-12) return "Picometer range — smaller than atoms. Quantum effects dominate.";
  if (lambda > 1e-15) return "Femtometer — nuclear scale. Deep quantum regime.";
  return "Sub-femtometer — smaller than a proton. Inconceivably tiny wavelength.";
}

export default function DeBroglieScaler() {
  const navigate = useNavigate();
  const [leftIdx, setLeftIdx] = useState(0);  // electron
  const [rightIdx, setRightIdx] = useState(4); // baseball
  const [customMassExp, setCustomMassExp] = useState(-31);
  const [customVel, setCustomVel] = useState(6);

  const left = PRESETS[leftIdx];
  const right = PRESETS[rightIdx];

  const lambdaLeft = useMemo(() => H / (left.mass * left.velocity), [left]);
  const lambdaRight = useMemo(() => H / (right.mass * right.velocity), [right]);
  const ratio = lambdaLeft / lambdaRight;

  const renderPanel = (preset: ObjectPreset, lambda: number, side: "left" | "right") => {
    const waveWidth = Math.min(Math.max(Math.log10(lambda) + 40, 5), 100);
    
    return (
      <div className="flex-1 flex flex-col gap-4">
        <div className="text-center">
          <span className="text-4xl mb-2 block">{preset.emoji}</span>
          <h3 className="text-lg font-bold" style={{ color: preset.color }}>{preset.name}</h3>
        </div>

        <div className="glass rounded-xl border border-white/5 p-4 space-y-3">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Mass</span>
            <span className="font-mono" style={{ color: preset.color }}>{formatSI(preset.mass)} kg</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Velocity</span>
            <span className="font-mono" style={{ color: preset.color }}>{formatSI(preset.velocity)} m/s</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Momentum (p)</span>
            <span className="font-mono text-foreground">{formatSI(preset.mass * preset.velocity)} kg·m/s</span>
          </div>
          <div className="pt-2 border-t border-white/5">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground font-bold">λ (de Broglie)</span>
              <span className="font-mono font-bold" style={{ color: preset.color }}>{formatSI(lambda)} m</span>
            </div>
          </div>
        </div>

        {/* Wave visualization */}
        <div className="glass rounded-xl border border-white/5 p-4 h-28 flex items-center justify-center overflow-hidden relative">
          <svg width="100%" height="60" viewBox="0 0 300 60" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`grad-${side}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={preset.color} stopOpacity="0.8" />
                <stop offset="100%" stopColor={preset.color} stopOpacity="0.2" />
              </linearGradient>
            </defs>
            {/* Generate sine wave — more cycles for shorter wavelengths */}
            <path
              d={Array.from({ length: 301 }, (_, i) => {
                const x = i;
                const freq = Math.min(Math.max(-Math.log10(lambda) * 2, 1), 80);
                const y = 30 + 20 * Math.sin((i / 300) * freq * Math.PI * 2);
                return `${i === 0 ? "M" : "L"} ${x} ${y}`;
              }).join(" ")}
              stroke={`url(#grad-${side})`}
              strokeWidth="2.5"
              fill="none"
            />
          </svg>
          <div className="absolute bottom-2 right-3 text-[9px] font-mono text-muted-foreground/40">
            {lambda > 1e-9 ? "macroscopic (flat)" : lambda > 1e-12 ? "molecular scale" : "subatomic"}
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground/60 leading-relaxed text-center">
          {getWavelengthContext(lambda)}
        </p>
      </div>
    );
  };

  return (
    <motion.div className="h-screen nucleus-bg flex flex-col relative overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5 bg-black/40 backdrop-blur-xl relative z-10 shrink-0">
        <button onClick={() => navigate(-1)} className="p-2 glass rounded-full hover:bg-white/10 text-muted-foreground transition"><ArrowLeft className="w-5 h-5"/></button>
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
          <Waves className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h1 className="text-base font-bold text-primary tracking-widest uppercase text-glow-cyan">De Broglie Wavelength Scaler</h1>
          <p className="text-[10px] text-muted-foreground/50">Wave-Particle Duality • λ = h/mv</p>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Controls */}
        <div className="w-72 border-r border-white/5 bg-black/30 p-5 flex flex-col gap-4 shrink-0 overflow-y-auto">
          <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40 font-semibold">Left Panel</div>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p, i) => (
              <button key={i} onClick={() => setLeftIdx(i)} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all ${leftIdx === i ? "border text-white" : "glass border border-white/5 text-muted-foreground/50 hover:text-white"}`} style={leftIdx === i ? { borderColor: p.color + "60", background: p.color + "15", color: p.color } : {}}>
                {p.emoji} {p.name}
              </button>
            ))}
          </div>

          <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40 font-semibold mt-2">Right Panel</div>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p, i) => (
              <button key={i} onClick={() => setRightIdx(i)} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all ${rightIdx === i ? "border text-white" : "glass border border-white/5 text-muted-foreground/50 hover:text-white"}`} style={rightIdx === i ? { borderColor: p.color + "60", background: p.color + "15", color: p.color } : {}}>
                {p.emoji} {p.name}
              </button>
            ))}
          </div>

          {/* Ratio indicator */}
          <motion.div className="glass rounded-xl border border-primary/20 p-4 mt-auto" style={{ boxShadow: "0 0 25px rgba(0,240,255,0.1)" }}>
            <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40 font-semibold mb-2">Wavelength Ratio</div>
            <div className="text-2xl font-black text-primary font-mono text-glow-cyan">{ratio.toExponential(2)}×</div>
            <p className="text-[10px] text-muted-foreground/50 mt-2">{left.name}'s wavelength is {ratio > 1 ? formatSI(ratio) : `1/${formatSI(1/ratio)}`}× that of {right.name}</p>
          </motion.div>

          <div className="glass rounded-xl border border-white/5 p-4 text-[11px] text-muted-foreground leading-relaxed">
            <div className="flex items-center gap-2 mb-2"><Info className="w-3.5 h-3.5 text-primary" /><span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40 font-semibold">Theory</span></div>
            <p><span className="text-primary font-mono font-bold">λ</span> = h / (m·v)</p>
            <p className="text-muted-foreground/40 text-[10px] mt-2">As mass increases, wavelength shrinks exponentially — explaining why quantum effects vanish at macroscopic scales.</p>
          </div>
        </div>

        {/* Split comparison */}
        <div className="flex-1 flex min-h-0 p-6 gap-6 overflow-auto">
          {renderPanel(left, lambdaLeft, "left")}
          
          {/* Divider */}
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="w-px flex-1 bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
            <div className="glass rounded-full p-2 border border-primary/20">
              <Scale className="w-4 h-4 text-primary" />
            </div>
            <span className="text-[9px] text-muted-foreground/30 tracking-wider uppercase">vs</span>
            <div className="w-px flex-1 bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
          </div>

          {renderPanel(right, lambdaRight, "right")}
        </div>
      </div>
    </motion.div>
  );
}
