import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { Search, ChevronLeft, ChevronRight, Share2, Hexagon, Hand, Camera as CameraIcon, Sun, CircleDot, Layers } from "lucide-react";
import { periodicTable, type ElementData } from "@/data/elements";
import PeriodicTable from "@/components/atomic-viewer/PeriodicTable";
import ElementDetail from "@/components/atomic-viewer/ElementDetail";
import { useHandTrackingContext } from "@/components/HandTracking";

// ─── Blackbody Radiation Tab ───
function BlackbodyRadiation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [temperature, setTemperature] = useState(5500);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    const W = 600, H = 350;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const mL = 60, mB = 50, mR = 30, mT = 30;
    const pW = W - mL - mR, pH = H - mT - mB;
    const T = temperature;

    // Planck function: B(λ, T) = (2hc²/λ⁵) / (exp(hc/λkT) - 1)
    const h = 6.626e-34, c = 3e8, k = 1.381e-23;
    const lambdaMin = 100e-9, lambdaMax = 3000e-9;
    const wienPeak = 2.898e-3 / T; // Wien's displacement law

    // Compute and find max
    const N = 300;
    const planckValues: number[] = [];
    let maxVal = 0;
    for (let i = 0; i < N; i++) {
      const lam = lambdaMin + (i / N) * (lambdaMax - lambdaMin);
      const exponent = (h * c) / (lam * k * T);
      const val = exponent > 500 ? 0 : (2 * h * c * c / Math.pow(lam, 5)) / (Math.exp(exponent) - 1);
      planckValues.push(val);
      if (val > maxVal) maxVal = val;
    }

    // Rayleigh-Jeans: B_RJ = (2ckT/λ⁴)
    const rjValues: number[] = [];
    for (let i = 0; i < N; i++) {
      const lam = lambdaMin + (i / N) * (lambdaMax - lambdaMin);
      rjValues.push((2 * c * k * T) / Math.pow(lam, 4));
    }

    const toX = (i: number) => mL + (i / N) * pW;
    const toY = (v: number) => mT + pH - (v / (maxVal * 1.1)) * pH;

    // Axes
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(mL, mT);
    ctx.lineTo(mL, H - mB);
    ctx.lineTo(W - mR, H - mB);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.font = "10px 'Inter'";
    ctx.textAlign = "center";
    ctx.fillText("Wavelength λ (nm)", W / 2, H - 10);
    ctx.save();
    ctx.translate(15, H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Spectral Radiance", 0, 0);
    ctx.restore();

    // Wavelength labels
    for (let nm = 500; nm <= 2500; nm += 500) {
      const i = ((nm * 1e-9 - lambdaMin) / (lambdaMax - lambdaMin)) * N;
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.font = "9px 'Inter'";
      ctx.textAlign = "center";
      ctx.fillText(`${nm}`, toX(i), H - mB + 15);
    }

    // Visible spectrum bar
    const vis380 = ((380e-9 - lambdaMin) / (lambdaMax - lambdaMin)) * N;
    const vis780 = ((780e-9 - lambdaMin) / (lambdaMax - lambdaMin)) * N;
    const gradient = ctx.createLinearGradient(toX(vis380), 0, toX(vis780), 0);
    gradient.addColorStop(0, "rgba(128,0,255,0.2)");
    gradient.addColorStop(0.15, "rgba(0,0,255,0.2)");
    gradient.addColorStop(0.3, "rgba(0,255,255,0.2)");
    gradient.addColorStop(0.45, "rgba(0,255,0,0.2)");
    gradient.addColorStop(0.6, "rgba(255,255,0,0.2)");
    gradient.addColorStop(0.75, "rgba(255,128,0,0.2)");
    gradient.addColorStop(1, "rgba(255,0,0,0.2)");
    ctx.fillStyle = gradient;
    ctx.fillRect(toX(vis380), mT, toX(vis780) - toX(vis380), pH);

    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.font = "8px 'Inter'";
    ctx.fillText("visible", (toX(vis380) + toX(vis780)) / 2, mT + 12);

    // Rayleigh-Jeans (dashed)
    ctx.beginPath();
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = "rgba(245,158,11,0.7)";
    ctx.lineWidth = 1.5;
    for (let i = 0; i < N; i++) {
      const y = toY(rjValues[i]);
      if (y < mT) continue;
      if (i === 0 || toY(rjValues[i - 1]) < mT) ctx.moveTo(toX(i), Math.max(y, mT));
      else ctx.lineTo(toX(i), Math.max(y, mT));
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(245,158,11,0.6)";
    ctx.font = "9px 'Inter'";
    ctx.textAlign = "left";
    ctx.fillText("Rayleigh-Jeans (UV catastrophe)", mL + 10, mT + 25);

    // Planck curve with gradient stroke and glow fill
    ctx.beginPath();
    const planckGradient = ctx.createLinearGradient(mL, 0, W - mR, 0);
    planckGradient.addColorStop(0, "#ff2222"); // Deep red
    planckGradient.addColorStop(0.3, "#ffaa00"); // Orange/Yellow
    planckGradient.addColorStop(0.7, "#ffffff"); // White
    planckGradient.addColorStop(1, "#88ccff"); // Blue-white
    
    ctx.strokeStyle = planckGradient;
    ctx.lineWidth = 2.5;
    for (let i = 0; i < N; i++) {
      const x = toX(i), y = toY(planckValues[i]);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.lineTo(toX(N - 1), toY(0));
    ctx.lineTo(toX(0), toY(0));
    ctx.closePath();
    ctx.fillStyle = "rgba(124,58,237,0.08)";
    ctx.fill();

    // Wien's peak marker
    const peakI = ((wienPeak - lambdaMin) / (lambdaMax - lambdaMin)) * N;
    if (peakI > 0 && peakI < N) {
      const peakX = toX(peakI);
      const peakY = toY(planckValues[Math.floor(peakI)] || 0);
      ctx.beginPath();
      ctx.arc(peakX, peakY, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#ffcc00";
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#ffcc00";
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = "rgba(255,204,0,0.3)";
      ctx.beginPath();
      ctx.moveTo(peakX, peakY);
      ctx.lineTo(peakX, H - mB);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#ffcc00";
      ctx.font = "9px 'Inter'";
      ctx.textAlign = "left";
      ctx.fillText(`λ_max = ${(wienPeak * 1e9).toFixed(0)} nm`, peakX + 8, peakY - 5);
    }

    ctx.fillStyle = "#00c8ff";
    ctx.font = "10px 'Inter'";
    ctx.textAlign = "left";
    ctx.fillText("Planck's Law", mL + 10, mT + 40);

  }, [temperature]);

  // Approximate body color from temperature
  const getBodyColor = (T: number) => {
    if (T < 2000) return "#ff3300";
    if (T < 3500) return "#ff6633";
    if (T < 5000) return "#ffaa44";
    if (T < 6500) return "#ffffee";
    if (T < 8000) return "#ccddff";
    return "#99bbff";
  };

  return (
    <div className="space-y-4">
      <div className="glass rounded-xl border border-white/5 p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-bold text-[#ffcc00] tracking-widest">BLACKBODY RADIATION</h3>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full border border-white/10" style={{ background: getBodyColor(temperature), boxShadow: `0 0 15px ${getBodyColor(temperature)}60` }} />
            <span className="text-sm font-mono font-bold text-[#ffcc00]">{temperature} K</span>
          </div>
        </div>
        <input type="range" min={1000} max={10000} step={100} value={temperature}
          onChange={(e) => setTemperature(Number(e.target.value))}
          className="w-full rounded-full appearance-none cursor-pointer mb-3 slider-cyan text-[#00E5FF]"
        />
        <canvas ref={canvasRef} className="w-full rounded-lg" style={{ height: 350, background: "rgba(0,0,0,0.4)" }} />
        <div className="mt-2 text-[9px] text-white/30 text-center">
          Wien's Law: λ_max = b/T where b = 2.898 × 10⁻³ m·K
        </div>
      </div>
    </div>
  );
}

// ─── Radial Distribution Tab ───
function RadialDistribution() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [n, setN] = useState(1);
  const [l, setL] = useState(0);

  // Hydrogen-like radial wave functions R(r) — simplified
  const radialWaveFunction = useCallback((rBohr: number, n: number, l: number): number => {
    const r = rBohr;
    if (n === 1 && l === 0) return 2 * Math.exp(-r);
    if (n === 2 && l === 0) return (1 / (2 * Math.sqrt(2))) * (2 - r) * Math.exp(-r / 2);
    if (n === 2 && l === 1) return (1 / (2 * Math.sqrt(6))) * r * Math.exp(-r / 2);
    if (n === 3 && l === 0) return (2 / (81 * Math.sqrt(3))) * (27 - 18 * r + 2 * r * r) * Math.exp(-r / 3);
    if (n === 3 && l === 1) return (8 / (27 * Math.sqrt(6))) * (6 - r) * r * Math.exp(-r / 3) / 9;
    if (n === 3 && l === 2) return (4 / (81 * Math.sqrt(30))) * r * r * Math.exp(-r / 3);
    if (n === 4 && l === 0) return (1 / 768) * (192 - 144 * r + 24 * r * r - r * r * r) * Math.exp(-r / 4);
    if (n === 4 && l === 1) return (1 / 256) * Math.sqrt(5 / 3) * (80 - 20 * r + r * r) * r * Math.exp(-r / 4) / 4;
    if (n === 4 && l === 2) return (1 / 768) * Math.sqrt(1 / 5) * (12 - r) * r * r * Math.exp(-r / 4);
    if (n === 4 && l === 3) return (1 / 768) * Math.sqrt(1 / 35) * r * r * r * Math.exp(-r / 4);
    return 0;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    const W = 600, H = 300;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const mL = 60, mB = 45, mR = 30, mT = 25;
    const pW = W - mL - mR, pH = H - mT - mB;
    const rMax = n * n * 4 + 5;

    // Compute r²|R(r)|²
    const N = 400;
    const values: number[] = [];
    let maxVal = 0;
    for (let i = 0; i <= N; i++) {
      const r = (i / N) * rMax;
      const R = radialWaveFunction(r, n, l);
      const prob = r * r * R * R;
      values.push(prob);
      if (prob > maxVal) maxVal = prob;
    }

    const toX = (i: number) => mL + (i / N) * pW;
    const toY = (v: number) => mT + pH - (maxVal > 0 ? (v / (maxVal * 1.1)) * pH : 0);

    // Axes
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(mL, mT);
    ctx.lineTo(mL, H - mB);
    ctx.lineTo(W - mR, H - mB);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.font = "10px 'Inter'";
    ctx.textAlign = "center";
    ctx.fillText("r (Bohr radii, a₀)", W / 2, H - 8);
    ctx.save();
    ctx.translate(15, H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("r²|R(r)|²", 0, 0);
    ctx.restore();

    // Grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.beginPath();
    for(let i=1; i<4; i++) {
      const gy = mT + pH - (i/4)*pH;
      ctx.moveTo(mL, gy);
      ctx.lineTo(W-mR, gy);
    }
    for(let i=1; i<10; i++) {
      const gx = mL + (i/10)*pW;
      ctx.moveTo(gx, H-mB);
      ctx.lineTo(gx, mT);
    }
    ctx.stroke();

    // Plot
    ctx.beginPath();
    ctx.strokeStyle = "#00E5FF";
    ctx.lineWidth = 2.5;
    for (let i = 0; i <= N; i++) {
      const x = toX(i), y = toY(values[i]);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.lineTo(toX(N), toY(0));
    ctx.lineTo(toX(0), toY(0));
    ctx.closePath();
    
    // Violet to transparent gradient fill
    const fillGradient = ctx.createLinearGradient(0, mT, 0, H - mB);
    fillGradient.addColorStop(0, "rgba(124,58,237,0.3)");
    fillGradient.addColorStop(1, "rgba(124,58,237,0.01)");
    ctx.fillStyle = fillGradient;
    ctx.fill();

    // Find nodes (r²|R|² = 0, excluding r=0)
    const nodes = n - l - 1;
    ctx.fillStyle = "#ff4488";
    ctx.font = "9px 'Inter'";
    let nodeCount = 0;
    for (let i = 2; i < N - 1; i++) {
      if (values[i] < values[i - 1] && values[i] < values[i + 1] && values[i] < maxVal * 0.01) {
        const x = toX(i);
        ctx.beginPath();
        ctx.arc(x, toY(values[i]), 4, 0, Math.PI * 2);
        ctx.fill();
        nodeCount++;
        ctx.fillStyle = "rgba(255,68,136,0.6)";
        ctx.fillText(`node`, x - 8, toY(values[i]) - 8);
        ctx.fillStyle = "#ff4488";
      }
    }

    // Orbital label
    const orbitalNames = ["s", "p", "d", "f"];
    ctx.fillStyle = "#9966ff";
    ctx.font = "bold 14px 'Inter'";
    ctx.textAlign = "left";
    ctx.fillText(`${n}${orbitalNames[l]}`, mL + 15, mT + 18);
    ctx.font = "10px 'Inter'";
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fillText(`Radial nodes = n−l−1 = ${nodes}`, mL + 15, mT + 34);

  }, [n, l, radialWaveFunction]);

  return (
    <div className="space-y-4">
      <div className="glass rounded-xl border border-white/5 p-4">
        <h3 className="text-xs font-bold text-[#9966ff] tracking-widest mb-3">RADIAL PROBABILITY DISTRIBUTION</h3>
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <div className="flex justify-between text-[10px] text-white/50 mb-1">
              <span>Principal quantum number n</span>
              <span className="font-mono-data font-bold text-[#00E5FF]">{n}</span>
            </div>
            <input type="range" min={1} max={4} step={1} value={n}
              onChange={(e) => { const newN = Number(e.target.value); setN(newN); if (l >= newN) setL(newN - 1); }}
              className="w-full rounded-full appearance-none cursor-pointer slider-cyan text-[#00E5FF]"
            />
          </div>
          <div>
            <div className="flex justify-between text-[10px] text-white/50 mb-1">
              <span>Angular momentum l</span>
              <span className="font-mono-data font-bold text-[#00E5FF]">{l} ({["s", "p", "d", "f"][l]})</span>
            </div>
            <input type="range" min={0} max={n - 1} step={1} value={l}
              onChange={(e) => setL(Number(e.target.value))}
              className="w-full rounded-full appearance-none cursor-pointer slider-cyan text-[#00E5FF]"
            />
          </div>
        </div>
        <canvas ref={canvasRef} className="w-full rounded-lg" style={{ height: 300, background: "rgba(0,0,0,0.4)" }} />
        <div className="mt-2 p-2 rounded-lg bg-white/[0.02] border border-white/5 text-center">
          <span className="text-[10px] font-mono text-white/40">
            P(r) = r²|R(r)|² — Probability of finding electron at distance r
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Rutherford → Bohr Stepper ───
function RutherfordBohrStepper() {
  const [step, setStep] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    const W = 500, H = 350;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cx = W / 2, cy = H / 2;

    const draw = () => {
      timeRef.current += 0.025;
      const t = timeRef.current;
      ctx.clearRect(0, 0, W, H);

      if (step === 1) {
        // Rutherford spiral-in flaw
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.font = "bold 12px 'Inter'";
        ctx.textAlign = "center";
        ctx.fillText("Rutherford Model — The Spiral-In Problem", cx, 25);

        // Nucleus
        ctx.beginPath();
        ctx.arc(cx, cy, 12, 0, Math.PI * 2);
        ctx.fillStyle = "#ff4488";
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#ff4488";
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "white";
        ctx.font = "8px 'Inter'";
        ctx.fillText("+", cx, cy + 3);

        // Spiraling electron trail
        const spirals = 6;
        ctx.beginPath();
        ctx.strokeStyle = "rgba(245,158,11,0.4)";
        ctx.lineWidth = 1;
        for (let i = 0; i < 500; i++) {
          const angle = (i / 500) * spirals * Math.PI * 2 + t;
          const radius = 130 - (i / 500) * 115;
          const x = cx + Math.cos(angle) * radius;
          const y = cy + Math.sin(angle) * radius;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Electron at current position
        const eAngle = (t * 3) % (Math.PI * 2);
        const eRadius = 130 - ((t * 10) % 115);
        const ex = cx + Math.cos(eAngle) * Math.max(eRadius, 12);
        const ey = cy + Math.sin(eAngle) * Math.max(eRadius, 12);
        ctx.beginPath();
        ctx.arc(ex, ey, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#00E5FF";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#00E5FF";
        ctx.fill();
        ctx.shadowBlur = 0;

        // Radiation squiggles
        for (let i = 0; i < 3; i++) {
          const rAngle = eAngle + i * 0.8;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255,204,0,${0.3 - i * 0.08})`;
          ctx.lineWidth = 1;
          const startR = Math.max(eRadius, 12) + 10;
          for (let j = 0; j < 20; j++) {
            const rr = startR + j * 3;
            const ra = rAngle + Math.sin(j * 0.8) * 0.15;
            const rx = cx + Math.cos(ra) * rr;
            const ry = cy + Math.sin(ra) * rr;
            if (j === 0) ctx.moveTo(rx, ry); else ctx.lineTo(rx, ry);
          }
          ctx.stroke();
        }

        ctx.fillStyle = "rgba(255,100,100,0.5)";
        ctx.font = "10px 'Inter'";
        ctx.fillText("❌ Classical: electron radiates energy & spirals into nucleus", cx, H - 20);
        ctx.fillText("Atom should collapse in ~10⁻¹¹ seconds!", cx, H - 5);

      } else if (step === 2) {
        // Bohr quantized orbits
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.font = "bold 12px 'Inter'";
        ctx.textAlign = "center";
        ctx.fillText("Bohr Model — Quantized Orbits", cx, 25);

        // Nucleus
        ctx.beginPath();
        ctx.arc(cx, cy, 10, 0, Math.PI * 2);
        ctx.fillStyle = "#ff4488";
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#ff4488";
        ctx.fill();
        ctx.shadowBlur = 0;

        // Quantized orbits
        const radii = [40, 70, 110, 140];
        const labels = ["n=1", "n=2", "n=3", "n=4"];
        radii.forEach((r, i) => {
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0,200,255,${0.3 - i * 0.05})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Electron on orbit
          const angle = t * (2 - i * 0.3) + i * Math.PI / 3;
          const ex = cx + Math.cos(angle) * r;
          const ey = cy + Math.sin(angle) * r;
          ctx.beginPath();
          ctx.arc(ex, ey, 4, 0, Math.PI * 2);
          ctx.fillStyle = "#00c8ff";
          ctx.shadowBlur = 8;
          ctx.shadowColor = "#00c8ff";
          ctx.fill();
          ctx.shadowBlur = 0;

          ctx.fillStyle = "rgba(255,255,255,0.25)";
          ctx.font = "8px 'Inter'";
          ctx.fillText(labels[i], cx + r + 8, cy - 3);
        });

        ctx.fillStyle = "rgba(34,204,136,0.5)";
        ctx.font = "10px 'Inter'";
        ctx.fillText("✓ Electrons only in allowed orbits (angular momentum = nℏ)", cx, H - 20);
        ctx.fillText("✓ No radiation while in stationary orbit", cx, H - 5);

      } else {
        // Energy level diagram
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.font = "bold 12px 'Inter'";
        ctx.textAlign = "center";
        ctx.fillText("Bohr Energy Levels & Transitions", cx, 25);

        const levels = [
          { n: 1, E: -13.6, y: 280 },
          { n: 2, E: -3.4, y: 200 },
          { n: 3, E: -1.51, y: 150 },
          { n: 4, E: -0.85, y: 120 },
          { n: 5, E: -0.54, y: 100 },
        ];

        const lineX1 = 120, lineX2 = 350;

        levels.forEach((lev) => {
          ctx.strokeStyle = "rgba(0,200,255,0.4)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(lineX1, lev.y);
          ctx.lineTo(lineX2, lev.y);
          ctx.stroke();

          ctx.fillStyle = "rgba(255,255,255,0.5)";
          ctx.font = "10px 'Inter'";
          ctx.textAlign = "right";
          ctx.fillText(`n=${lev.n}`, lineX1 - 10, lev.y + 4);
          ctx.textAlign = "left";
          ctx.fillText(`${lev.E.toFixed(2)} eV`, lineX2 + 10, lev.y + 4);
        });

        // Animated transition arrows
        const transitions = [
          { from: 2, to: 1, color: "#ff4488", label: "Lyman (UV)" },
          { from: 3, to: 2, color: "#00c8ff", label: "Balmer (vis)" },
          { from: 4, to: 3, color: "#22cc88", label: "Paschen (IR)" },
        ];

        const activeTransition = Math.floor(t / 2) % 3;
        const tr = transitions[activeTransition];
        const fromLevel = levels.find((lv) => lv.n === tr.from)!;
        const toLevel = levels.find((lv) => lv.n === tr.to)!;

        const arrowX = lineX1 + 60 + activeTransition * 60;
        const progress = ((t / 2) % 1);
        const arrowY = fromLevel.y + (toLevel.y - fromLevel.y) * Math.min(progress * 1.5, 1);

        ctx.beginPath();
        ctx.setLineDash([4, 3]);
        ctx.strokeStyle = tr.color + "80";
        ctx.lineWidth = 2;
        ctx.moveTo(arrowX, fromLevel.y);
        ctx.lineTo(arrowX, toLevel.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Photon squiggle
        const photonX = arrowX + 30;
        ctx.beginPath();
        ctx.strokeStyle = tr.color;
        ctx.lineWidth = 1.5;
        for (let j = 0; j < 20; j++) {
          const py = arrowY + j * 2 - 20;
          const px = photonX + Math.sin(j * 1.2 + t * 5) * 5;
          if (j === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();

        ctx.fillStyle = tr.color;
        ctx.font = "9px 'Inter'";
        ctx.textAlign = "left";
        ctx.fillText(tr.label, arrowX + 45, (fromLevel.y + toLevel.y) / 2 + 3);

        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.font = "10px 'Inter'";
        ctx.textAlign = "center";
        ctx.fillText("E_n = −13.6/n² eV    |    ΔE = hν = hc/λ", cx, H - 10);
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [step]);

  return (
    <div className="space-y-4">
      <div className="glass rounded-xl border border-white/5 p-4">
        <h3 className="text-xs font-bold text-[#ff8844] tracking-widest mb-3">RUTHERFORD → BOHR STEPPER</h3>
        <div className="flex gap-2 mb-3">
          <button onClick={() => setStep(1)}
            className={`flex-1 px-3 py-2 rounded-lg text-[10px] font-bold transition-all ${
              step === 1 ? "bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/25 shadow-[0_0_15px_rgba(0,229,255,0.15)]" : "bg-white/[0.03] text-white/40 border border-white/5 hover:bg-white/5"
            }`}>
            ① Rutherford Flaw
          </button>
          <button onClick={() => setStep(2)}
            className={`flex-1 px-3 py-2 rounded-lg text-[10px] font-bold transition-all ${
              step === 2 ? "bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/25 shadow-[0_0_15px_rgba(0,229,255,0.15)]" : "bg-white/[0.03] text-white/40 border border-white/5 hover:bg-white/5"
            }`}>
            ② Bohr Fix
          </button>
          <button onClick={() => setStep(3)}
            className={`flex-1 px-3 py-2 rounded-lg text-[10px] font-bold transition-all ${
              step === 3 ? "bg-[#10B981]/20 text-[#34d399] border border-[#10B981]/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]" : "bg-white/[0.03] text-white/40 border border-white/5 hover:bg-white/5"
            }`}>
            ③ Energy Levels
          </button>
        </div>
        <canvas ref={canvasRef} className="w-full rounded-lg" style={{ height: 350, background: "rgba(0,0,0,0.4)" }} />
      </div>
    </div>
  );
}

// ─── Main Atomic Viewer Page ───
export default function AtomicViewer() {
  const [selectedElement, setSelectedElement] = useState<ElementData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "3d">("table");
  const [activeTab, setActiveTab] = useState<"periodic" | "blackbody" | "radial" | "rutherford">("periodic");

  const { isActive: enabled, showOnboarding, deactivate: disableTracking } = useHandTrackingContext();

  // Find currently active element index
  const currentIndex = useMemo(() => {
    if (!selectedElement) return -1;
    return periodicTable.findIndex((e) => e.atomicNumber === selectedElement.atomicNumber);
  }, [selectedElement]);

  const handleNext = () => {
    if (currentIndex >= 0 && currentIndex < periodicTable.length - 1) {
      setSelectedElement(periodicTable[currentIndex + 1]);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setSelectedElement(periodicTable[currentIndex - 1]);
    }
  };

  const handleElementSelect = (el: ElementData) => {
    setSelectedElement(el);
    setViewMode("3d");
  };

  const tabs = [
    { key: "periodic" as const, label: "Periodic Table", icon: Hexagon },
    { key: "blackbody" as const, label: "Blackbody", icon: Sun },
    { key: "radial" as const, label: "Radial Dist.", icon: CircleDot },
    { key: "rutherford" as const, label: "Rutherford→Bohr", icon: Layers },
  ];

  return (
    <motion.div
      className="flex flex-col h-[calc(100vh-3.5rem)] relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Search Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-background/50 backdrop-blur-sm z-10">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-lg glass flex items-center justify-center">
            <Hexagon className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-widest text-[#00E5FF] text-glow-cyan font-orbitron">
              ATOMIC VIEWER
            </h1>
            <p className="text-[10px] text-muted-foreground/50">
              Quantum Explorer & Periodic Trends
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Tab switcher */}
          <div className="hidden md:flex items-center gap-0.5 bg-white/[0.03] rounded-xl p-0.5 border border-white/5">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); if (tab.key !== "periodic") setViewMode("table"); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all font-space ${
                  activeTab === tab.key
                    ? "bg-[#00E5FF]/12 text-[#00E5FF] border border-[#00E5FF]/25 shadow-[0_0_12px_rgba(0,229,255,0.15)]"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                <tab.icon className="w-3 h-3" />
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "periodic" && (
            <motion.button
              onClick={enabled ? disableTracking : showOnboarding}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl glass border text-xs font-medium transition-all ${
                enabled 
                  ? "text-primary border-primary/50 bg-primary/10 shadow-[0_0_15px_hsl(185_100%_50%/0.3)]" 
                  : "border-white/5 text-muted-foreground hover:text-white hover:border-white/20"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {enabled ? <CameraIcon className="w-4 h-4 text-primary" /> : <Hand className="w-4 h-4" />}
              {enabled ? "Tracking Active" : "Track My Hand"}
            </motion.button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Hand Tracking Visualizer — handled by global provider portals now */}

        <AnimatePresence mode="wait">
          {activeTab === "periodic" ? (
            viewMode === "table" ? (
              <motion.div
                key="table"
                className="flex-1 relative overflow-hidden"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.4 }}
              >
                <div className="absolute inset-0 overflow-auto scrollbar-thin">
                  <PeriodicTable 
                    onSelect={handleElementSelect} 
                    searchQuery={searchQuery} 
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="details"
                className="flex-1 relative bg-background"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                <button 
                  onClick={() => setViewMode("table")}
                  className="absolute top-6 left-6 z-20 px-4 py-2 rounded-full glass border border-white/5 flex items-center gap-2 text-xs hover:bg-white/5 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back to Table
                </button>
                
                {selectedElement && (
                  <ElementDetail 
                    element={selectedElement} 
                    onPrev={currentIndex > 0 ? handlePrev : undefined}
                    onNext={currentIndex < periodicTable.length - 1 ? handleNext : undefined}
                  />
                )}
              </motion.div>
            )
          ) : activeTab === "blackbody" ? (
            <motion.div
              key="blackbody"
              className="flex-1 overflow-y-auto p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="max-w-3xl mx-auto">
                <BlackbodyRadiation />
              </div>
            </motion.div>
          ) : activeTab === "radial" ? (
            <motion.div
              key="radial"
              className="flex-1 overflow-y-auto p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="max-w-3xl mx-auto">
                <RadialDistribution />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="rutherford"
              className="flex-1 overflow-y-auto p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="max-w-3xl mx-auto">
                <RutherfordBohrStepper />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </motion.div>
  );
}
