import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, LineChart, ToggleLeft, ToggleRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

// ─── Butane Dihedral Energy ───
function ButaneDihedral() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [angle, setAngle] = useState(180);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 400 * dpr;
    canvas.height = 200 * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, 400, 200);

    // OPLS torsion fit for butane C-C-C-C dihedral
    // V(φ) = V1(1+cos φ)/2 + V2(1-cos 2φ)/2 + V3(1+cos 3φ)/2
    const V1 = 1.411; // kcal/mol
    const V2 = -0.271;
    const V3 = 3.145;
    
    const energy = (phi: number) => {
      const rad = (phi * Math.PI) / 180;
      return (V1 * (1 + Math.cos(rad)) / 2) +
             (V2 * (1 - Math.cos(2 * rad)) / 2) +
             (V3 * (1 + Math.cos(3 * rad)) / 2);
    };

    // Find min/max for normalization
    let maxE = -Infinity, minE = Infinity;
    for (let i = 0; i <= 360; i++) {
      const e = energy(i);
      maxE = Math.max(maxE, e);
      minE = Math.min(minE, e);
    }

    // Axes
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 170);
    ctx.lineTo(380, 170);
    ctx.moveTo(40, 170);
    ctx.lineTo(40, 15);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.font = "9px 'Inter', monospace";
    ctx.fillText("φ (°)", 350, 185);
    ctx.fillText("V (kcal/mol)", 2, 12);
    ctx.fillText("0°", 38, 185);
    ctx.fillText("120°", 148, 185);
    ctx.fillText("180°", 205, 185);
    ctx.fillText("240°", 258, 185);
    ctx.fillText("360°", 365, 185);

    // Conformer labels
    ctx.fillStyle = "rgba(0,200,255,0.5)";
    ctx.font = "8px 'Inter'";
    ctx.fillText("eclipsed", 35, 30);
    ctx.fillText("gauche", 95, 100);
    ctx.fillText("anti", 195, 165);

    // Energy curve with gradient fill
    ctx.beginPath();
    ctx.strokeStyle = "#2DD4BF";
    ctx.lineWidth = 2;
    for (let i = 0; i <= 360; i++) {
      const e = energy(i);
      const x = 40 + (i / 360) * 340;
      const y = 170 - ((e - minE) / (maxE - minE)) * 145;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Fill under
    ctx.lineTo(380, 170);
    ctx.lineTo(40, 170);
    ctx.closePath();
    ctx.fillStyle = "rgba(45,212,191,0.06)";
    ctx.fill();

    // Current angle marker
    const curE = energy(angle);
    const markerX = 40 + (angle / 360) * 340;
    const markerY = 170 - ((curE - minE) / (maxE - minE)) * 145;
    
    ctx.beginPath();
    ctx.arc(markerX, markerY, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#006EFF";
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#006EFF";
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = "rgba(167,139,250,0.4)";
    ctx.beginPath();
    ctx.moveTo(markerX, markerY);
    ctx.lineTo(markerX, 170);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#006EFF";
    ctx.font = "9px 'Inter', monospace";
    ctx.fillText(`V = ${curE.toFixed(2)} kcal/mol`, markerX + 8, markerY - 5);

    // Newman projection indicator
    const nCx = 360, nCy = 40, nR = 18;
    ctx.beginPath();
    ctx.arc(nCx, nCy, nR, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 1;
    ctx.stroke();
    // Front C-H bonds
    for (let i = 0; i < 3; i++) {
      const a = (i * 120) * Math.PI / 180 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(nCx, nCy);
      ctx.lineTo(nCx + Math.cos(a) * (nR + 6), nCy + Math.sin(a) * (nR + 6));
      ctx.strokeStyle = "rgba(45,212,191,0.5)";
      ctx.stroke();
    }
    // Back C-H bonds (offset by dihedral angle)
    for (let i = 0; i < 3; i++) {
      const a = ((i * 120) + angle) * Math.PI / 180 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(nCx + Math.cos(a) * (nR - 4), nCy + Math.sin(a) * (nR - 4));
      ctx.lineTo(nCx + Math.cos(a) * (nR + 6), nCy + Math.sin(a) * (nR + 6));
      ctx.strokeStyle = "rgba(167,139,250,0.5)";
      ctx.stroke();
    }

  }, [angle]);

  // Label the current conformation
  const getConformation = (a: number) => {
    if (a <= 10 || a >= 350) return "Fully Eclipsed (0°/360°)";
    if (a >= 50 && a <= 70) return "Gauche+ (60°)";
    if (a >= 110 && a <= 130) return "Eclipsed (120°)";
    if (a >= 170 && a <= 190) return "Anti (180°)";
    if (a >= 230 && a <= 250) return "Eclipsed (240°)";
    if (a >= 290 && a <= 310) return "Gauche− (300°)";
    return `φ = ${a}°`;
  };

  return (
    <div className="glass rounded-xl border border-white/5 p-4">
      <h3 className="text-xs font-bold text-[#00c8ff] tracking-widest mb-3">BUTANE CONFORMATIONAL ENERGY</h3>
      <p className="text-[9px] text-muted-foreground/50 mb-2">C-C-C-C torsion angle energy landscape (OPLS parameters)</p>
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] text-muted-foreground">Dihedral angle φ</span>
        <span className="text-sm font-mono-data font-bold text-[#006EFF]">{angle}° — {getConformation(angle)}</span>
      </div>
      <input type="range" min={0} max={360} step={1} value={angle} onChange={(e) => setAngle(Number(e.target.value))}
        className="w-full rounded-full appearance-none cursor-pointer mb-3 slider-blue text-[#006EFF]"
      />
      <canvas ref={canvasRef} className="w-full rounded-lg" style={{ height: 200, background: "rgba(0,0,0,0.3)" }} />
    </div>
  );
}

// ─── All 4 IMF Contributions ───
function IMFContributions() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [polarity, setPolarity] = useState(50);
  const [showElectro, setShowElectro] = useState(true);
  const [showInduction, setShowInduction] = useState(true);
  const [showLondon, setShowLondon] = useState(true);
  const [showHBond, setShowHBond] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 450 * dpr;
    canvas.height = 250 * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, 450, 250);

    const mL = 50, mB = 40, mR = 20, mT = 20;
    const pW = 450 - mL - mR, pH = 250 - mT - mB;
    const rMin = 2.5, rMax = 8.0;
    const polarScale = polarity / 50;

    const electrostatic = (r: number) => -15 * polarScale / (r * r);
    const induction = (r: number) => -3 * polarScale / Math.pow(r, 4);
    const london = (r: number) => -8 / Math.pow(r, 6);
    const hbond = (r: number) => r < 4.0 ? -12 * Math.exp(-((r - 2.8) ** 2) / 0.4) : 0;

    const components = [
      { fn: electrostatic, color: "#ff4488", label: "Electrostatic (1/r²)", on: showElectro },
      { fn: induction, color: "#22cc88", label: "Induction (1/r⁴)", on: showInduction },
      { fn: london, color: "#9966ff", label: "London (1/r⁶)", on: showLondon },
      { fn: hbond, color: "#ffcc00", label: "H-bonding", on: showHBond },
    ];

    // Axes
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(mL, mT);
    ctx.lineTo(mL, 250 - mB);
    ctx.lineTo(450 - mR, 250 - mB);
    ctx.stroke();

    const zeroY = mT + pH * 0.55;
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.beginPath();
    ctx.moveTo(mL, zeroY);
    ctx.lineTo(450 - mR, zeroY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.font = "9px 'Inter'";
    ctx.textAlign = "center";
    ctx.fillText("r (Å)", 250, 248);

    components.forEach((comp) => {
      if (!comp.on) return;
      ctx.beginPath();
      ctx.strokeStyle = comp.color;
      ctx.lineWidth = 2;
      for (let i = 0; i <= pW; i++) {
        const r = rMin + (i / pW) * (rMax - rMin);
        const e = comp.fn(r);
        const x = mL + i;
        const y = zeroY - e * 3;
        const yClamped = Math.max(mT, Math.min(250 - mB, y));
        if (i === 0) ctx.moveTo(x, yClamped); else ctx.lineTo(x, yClamped);
      }
      ctx.stroke();
    });

    // Legend
    let ly = mT + 8;
    components.forEach((comp) => {
      ctx.globalAlpha = comp.on ? 1 : 0.3;
      ctx.fillStyle = comp.color;
      ctx.fillRect(mL + 10, ly, 8, 3);
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "8px 'Inter'";
      ctx.textAlign = "left";
      ctx.fillText(comp.label, mL + 22, ly + 4);
      ly += 14;
      ctx.globalAlpha = 1;
    });

  }, [polarity, showElectro, showInduction, showLondon, showHBond]);

  return (
    <div className="glass rounded-xl border border-white/5 p-4">
      <h3 className="text-xs font-bold text-[#22ccaa] tracking-widest mb-3">ALL 4 IMF CONTRIBUTIONS</h3>
      <div className="flex flex-wrap gap-2 mb-3">
        {[
          { label: "Electrostatic", on: showElectro, set: setShowElectro, color: "#ff4488" },
          { label: "Induction", on: showInduction, set: setShowInduction, color: "#22cc88" },
          { label: "London", on: showLondon, set: setShowLondon, color: "#9966ff" },
          { label: "H-bond", on: showHBond, set: setShowHBond, color: "#ffcc00" },
        ].map((t) => (
          <button key={t.label} onClick={() => t.set(!t.on)}
            className={`px-2.5 py-1 rounded text-[9px] font-bold transition-all ${t.on ? "border" : "bg-white/[0.02] text-white/30 border border-white/5"}`}
            style={t.on ? { background: t.color + "20", color: t.color, borderColor: t.color + "40" } : {}}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] text-muted-foreground">Polarity</span>
        <span className="text-xs font-mono text-white/60">{polarity}%</span>
      </div>
      <input type="range" min={0} max={100} step={5} value={polarity}
        onChange={(e) => setPolarity(Number(e.target.value))}
        className="w-full rounded-full appearance-none cursor-pointer mb-3 slider-teal text-[#2DD4BF]"
      />
      <canvas ref={canvasRef} className="w-full rounded-lg" style={{ height: 250, background: "rgba(0,0,0,0.3)" }} />
    </div>
  );
}

// ─── London Dispersion Animator ───
function LondonAnimator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [molSize, setMolSize] = useState(50);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  const boilingPoints = [
    { name: "He", bp: 4, size: 10 },
    { name: "Ne", bp: 27, size: 20 },
    { name: "Ar", bp: 87, size: 35 },
    { name: "Kr", bp: 120, size: 50 },
    { name: "Xe", bp: 165, size: 65 },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    const W = 450, H = 250;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const atomR = 15 + molSize * 0.3;

    const draw = () => {
      timeRef.current += 0.03;
      const t = timeRef.current;
      ctx.clearRect(0, 0, W, H);

      const ax = 130, ay = 100, bx = 300, by = 100;

      // Random electron cloud for atom A
      const cloudShiftA = Math.sin(t * 2) * 8 * (molSize / 50);
      // Draw atom A cloud
      const gradA = ctx.createRadialGradient(ax + cloudShiftA, ay, 0, ax, ay, atomR + 10);
      gradA.addColorStop(0, "rgba(0,200,255,0.15)");
      gradA.addColorStop(1, "rgba(0,200,255,0)");
      ctx.fillStyle = gradA;
      ctx.beginPath();
      ctx.arc(ax, ay, atomR + 10, 0, Math.PI * 2);
      ctx.fill();

      // Atom A core
      ctx.beginPath();
      ctx.arc(ax, ay, atomR, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,200,255,0.08)";
      ctx.strokeStyle = "rgba(0,200,255,0.3)";
      ctx.lineWidth = 1.5;
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "bold 10px 'Inter'";
      ctx.textAlign = "center";
      ctx.fillText("A", ax, ay + 3);

      // Instantaneous dipole indicator on A
      if (Math.abs(cloudShiftA) > 2) {
        const dir = cloudShiftA > 0 ? 1 : -1;
        ctx.fillStyle = dir > 0 ? "rgba(255,68,136,0.4)" : "rgba(68,136,255,0.4)";
        ctx.font = "bold 12px 'Inter'";
        ctx.fillText(dir > 0 ? "δ+" : "δ−", ax - dir * 20, ay - atomR - 5);
        ctx.fillStyle = dir > 0 ? "rgba(68,136,255,0.4)" : "rgba(255,68,136,0.4)";
        ctx.fillText(dir > 0 ? "δ−" : "δ+", ax + dir * 20, ay - atomR - 5);
      }

      // Induced dipole on B (opposite)
      const cloudShiftB = -cloudShiftA * 0.7;
      const gradB = ctx.createRadialGradient(bx + cloudShiftB, by, 0, bx, by, atomR + 10);
      gradB.addColorStop(0, "rgba(153,102,255,0.15)");
      gradB.addColorStop(1, "rgba(153,102,255,0)");
      ctx.fillStyle = gradB;
      ctx.beginPath();
      ctx.arc(bx, by, atomR + 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(bx, by, atomR, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(153,102,255,0.08)";
      ctx.strokeStyle = "rgba(153,102,255,0.3)";
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fillText("B", bx, by + 3);

      // Attraction line
      if (Math.abs(cloudShiftA) > 3) {
        ctx.setLineDash([4, 3]);
        ctx.strokeStyle = "rgba(255,204,0,0.3)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ax + atomR + 5, ay);
        ctx.lineTo(bx - atomR - 5, by);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "rgba(255,204,0,0.4)";
        ctx.font = "9px 'Inter'";
        ctx.fillText("attraction", (ax + bx) / 2, ay - 20);
      }

      // Labels
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.font = "9px 'Inter'";
      ctx.textAlign = "center";
      ctx.fillText("instantaneous dipole", ax, ay + atomR + 20);
      ctx.fillText("induced dipole", bx, by + atomR + 20);

      // Boiling point trend
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.font = "bold 9px 'Inter'";
      ctx.textAlign = "left";
      ctx.fillText("Noble Gas Boiling Points:", 20, 195);
      boilingPoints.forEach((bp, i) => {
        const barW = (bp.bp / 170) * 120;
        ctx.fillStyle = bp.size <= molSize ? "#22cc88" : "rgba(34,204,136,0.15)";
        ctx.fillRect(20 + i * 85, 210, barW, 6);
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.font = "8px 'Inter'";
        ctx.fillText(`${bp.name} ${bp.bp}K`, 20 + i * 85, 230);
      });

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [molSize]);

  return (
    <div className="glass rounded-xl border border-white/5 p-4">
      <h3 className="text-xs font-bold text-[#9966ff] tracking-widest mb-3">LONDON DISPERSION ANIMATOR</h3>
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] text-muted-foreground">Molecular Size (Polarizability)</span>
        <span className="text-xs font-mono text-[#9966ff]">{molSize}%</span>
      </div>
      <input type="range" min={10} max={100} step={5} value={molSize}
        onChange={(e) => setMolSize(Number(e.target.value))}
        className="w-full rounded-full appearance-none cursor-pointer mb-3 slider-blue text-[#006EFF]"
      />
      <canvas ref={canvasRef} className="w-full rounded-lg" style={{ height: 250, background: "rgba(0,0,0,0.3)" }} />
    </div>
  );
}

// ─── H-Bond Geometry ───
function HBondGeometry() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bondAngle, setBondAngle] = useState(170);
  const [donor, setDonor] = useState<"O" | "N" | "F">("O");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    const W = 450, H = 220;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // Energy vs angle plot
    const mL = 50, mR = 20, mT = 20, mB = 40;
    const pW = (W - mL - mR) / 2 - 20;
    const pH = H - mT - mB;

    // Left half: molecular diagram
    const cx = (mL + pW) / 2 + 20, cy = H / 2;
    const aRad = (bondAngle * Math.PI) / 180;

    // D-H bond (donor)
    const dx = cx - 40, dy = cy;
    const hx = cx, hy = cy;
    // A (acceptor) at angle
    const dist = 60;
    const ax2 = hx + Math.cos(Math.PI - aRad) * dist;
    const ay2 = hy - Math.sin(Math.PI - aRad) * dist;

    // Draw bonds
    ctx.beginPath();
    ctx.moveTo(dx, dy);
    ctx.lineTo(hx, hy);
    ctx.strokeStyle = "rgba(0,200,255,0.6)";
    ctx.lineWidth = 3;
    ctx.stroke();

    // H-bond dashed
    ctx.beginPath();
    ctx.setLineDash([4, 3]);
    ctx.moveTo(hx, hy);
    ctx.lineTo(ax2, ay2);
    ctx.strokeStyle = "rgba(255,204,0,0.5)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);

    // Atoms
    const drawAtom = (x: number, y: number, label: string, color: string, r: number) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "white";
      ctx.font = "bold 9px 'Inter'";
      ctx.textAlign = "center";
      ctx.fillText(label, x, y + 3);
    };

    const donorColors: Record<string, string> = { O: "#ff4444", N: "#4488ff", F: "#22cc88" };
    drawAtom(dx, dy, donor, donorColors[donor], 12);
    drawAtom(hx, hy, "H", "#ffffff40", 8);
    drawAtom(ax2, ay2, donor === "O" ? "O" : "N", donorColors[donor === "O" ? "O" : "N"], 12);

    // Angle arc
    ctx.beginPath();
    ctx.arc(hx, hy, 25, -aRad, 0);
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "9px 'Inter'";
    ctx.fillText(`${bondAngle}°`, hx + 30, hy - 5);

    // Right half: energy vs angle
    const plotX = W / 2 + 20;
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(plotX, mT);
    ctx.lineTo(plotX, H - mB);
    ctx.lineTo(W - mR, H - mB);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.font = "8px 'Inter'";
    ctx.textAlign = "center";
    ctx.fillText("Angle (°)", (plotX + W - mR) / 2, H - 10);

    // Energy curve: max at 180°
    const plotWR = W - mR - plotX;
    ctx.beginPath();
    ctx.strokeStyle = "#ffcc00";
    ctx.lineWidth = 2;
    for (let a = 90; a <= 180; a++) {
      const x = plotX + ((a - 90) / 90) * plotWR;
      const frac = (a - 90) / 90;
      const e = frac * frac; // quadratic increase
      const y = H - mB - e * (pH * 0.8);
      if (a === 90) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Marker
    const markerFrac = (bondAngle - 90) / 90;
    const markX = plotX + markerFrac * plotWR;
    const markE = markerFrac * markerFrac;
    const markY = H - mB - markE * (pH * 0.8);
    ctx.beginPath();
    ctx.arc(markX, markY, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#ff4488";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#ff4488";
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.font = "8px 'Inter'";
    ctx.textAlign = "left";
    ctx.fillText("90°", plotX, H - mB + 12);
    ctx.textAlign = "right";
    ctx.fillText("180°", W - mR, H - mB + 12);

  }, [bondAngle, donor]);

  // Strength comparison
  const strengths: Record<string, number> = { F: 100, O: 80, N: 60 };

  return (
    <div className="glass rounded-xl border border-white/5 p-4">
      <h3 className="text-xs font-bold text-[#ffcc00] tracking-widest mb-3">H-BOND GEOMETRY</h3>
      <div className="flex gap-2 mb-3">
        {(["O", "N", "F"] as const).map((d) => (
          <button key={d} onClick={() => setDonor(d)}
            className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${donor === d ? "bg-white/10 text-white border border-white/20" : "bg-white/[0.03] text-white/30 border border-white/5"}`}>
            {d}−H···{d === "O" ? "O" : d === "N" ? "N" : "F"}
          </button>
        ))}
      </div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] text-muted-foreground">D-H···A Angle</span>
        <span className="text-xs font-mono text-[#ffcc00]">{bondAngle}°</span>
      </div>
      <input type="range" min={90} max={180} step={1} value={bondAngle}
        onChange={(e) => setBondAngle(Number(e.target.value))}
        className="w-full rounded-full appearance-none cursor-pointer mb-3 slider-amber text-[#FCD34D]"
      />
      <canvas ref={canvasRef} className="w-full rounded-lg" style={{ height: 220, background: "rgba(0,0,0,0.3)" }} />
      {/* Strength bars */}
      <div className="mt-3 space-y-1">
        {(["F", "O", "N"] as const).map((d) => (
          <div key={d} className="flex items-center gap-2 text-[9px]">
            <span className="w-16 text-white/40">{d}−H bond</span>
            <div className="flex-1 h-2 bg-white/[0.03] rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-[#ffcc00]" style={{ width: `${strengths[d]}%` }} />
            </div>
            <span className="text-white/30 w-8">{strengths[d]}%</span>
          </div>
        ))}
        <div className="flex items-center gap-2 text-[9px]">
          <span className="w-16 text-white/30">vdW</span>
          <div className="flex-1 h-2 bg-white/[0.03] rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-white/20" style={{ width: "15%" }} />
          </div>
          <span className="text-white/30 w-8">15%</span>
        </div>
      </div>
    </div>
  );
}

// ─── Force Field Decomposer ───
function ForceFieldDecomposer() {
  const [bondR, setBondR] = useState(1.54);
  const [angleTheta, setAngleTheta] = useState(109.5);
  const [dihedral, setDihedral] = useState(180);

  const r0 = 1.54, kr = 300;
  const theta0 = 109.5, kTheta = 50;
  const A = 3.145, nPhi = 3, delta = 0;

  const eBond = 0.5 * kr * Math.pow(bondR - r0, 2);
  const eAngle = 0.5 * kTheta * Math.pow((angleTheta - theta0) * Math.PI / 180, 2);
  const eTorsion = A * (1 + Math.cos(nPhi * (dihedral * Math.PI / 180) - delta));
  const eTotal = eBond + eAngle + eTorsion;

  // Mini canvas for each term
  const BondCanvas = () => {
    const ref = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
      const canvas = ref.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d")!;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = 180 * dpr; canvas.height = 80 * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, 180, 80);
      ctx.beginPath();
      ctx.strokeStyle = "#00c8ff";
      ctx.lineWidth = 1.5;
      for (let i = 0; i <= 160; i++) {
        const r = 1.0 + (i / 160) * 1.0;
        const e = 0.5 * kr * Math.pow(r - r0, 2);
        const x = 10 + i;
        const y = 70 - (e / 20) * 60;
        if (i === 0) ctx.moveTo(x, Math.max(5, y)); else ctx.lineTo(x, Math.max(5, y));
      }
      ctx.stroke();
      const mx = 10 + ((bondR - 1.0) / 1.0) * 160;
      const my = 70 - (eBond / 20) * 60;
      ctx.beginPath();
      ctx.arc(mx, Math.max(5, my), 3, 0, Math.PI * 2);
      ctx.fillStyle = "#ff4488";
      ctx.fill();
    }, []);
    return <canvas ref={ref} className="w-full rounded" style={{ height: 80, background: "rgba(0,0,0,0.2)" }} />;
  };

  return (
    <div className="glass rounded-xl border border-white/5 p-4">
      <h3 className="text-xs font-bold text-[#ff8844] tracking-widest mb-3">FORCE FIELD DECOMPOSER</h3>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <div className="flex justify-between text-[9px] text-white/40 mb-1">
            <span>Bond r</span><span className="font-mono-data text-[#00D4FF]">{bondR.toFixed(2)} Å</span>
          </div>
          <input type="range" min={1.0} max={2.0} step={0.01} value={bondR} onChange={(e) => setBondR(Number(e.target.value))}
            className="w-full rounded-full appearance-none cursor-pointer slider-cyan text-[#00D4FF]" />
          <div className="text-[8px] text-white/20 mt-1 font-mono">E = ½k(r−r₀)²</div>
          <div className="text-[10px] font-mono-data text-[#00D4FF]">{eBond.toFixed(3)} kcal/mol</div>
        </div>
        <div>
          <div className="flex justify-between text-[9px] text-white/40 mb-1">
            <span>Angle θ</span><span className="font-mono-data text-[#10B981]">{angleTheta.toFixed(1)}°</span>
          </div>
          <input type="range" min={90} max={130} step={0.5} value={angleTheta} onChange={(e) => setAngleTheta(Number(e.target.value))}
            className="w-full rounded-full appearance-none cursor-pointer slider-teal text-[#10B981]" />
          <div className="text-[8px] text-white/20 mt-1 font-mono">E = ½k(θ−θ₀)²</div>
          <div className="text-[10px] font-mono-data text-[#10B981]">{eAngle.toFixed(3)} kcal/mol</div>
        </div>
        <div>
          <div className="flex justify-between text-[9px] text-white/40 mb-1">
            <span>Dihedral φ</span><span className="font-mono-data text-[#006EFF]">{dihedral}°</span>
          </div>
          <input type="range" min={0} max={360} step={1} value={dihedral} onChange={(e) => setDihedral(Number(e.target.value))}
            className="w-full rounded-full appearance-none cursor-pointer slider-blue text-[#006EFF]" />
          <div className="text-[8px] text-white/20 mt-1 font-mono">E = A(1+cos(nφ−δ))</div>
          <div className="text-[10px] font-mono-data text-[#006EFF]">{eTorsion.toFixed(3)} kcal/mol</div>
        </div>
      </div>
      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center">
        <div className="text-[9px] text-white/30 uppercase tracking-wider">Total Force Field Energy</div>
        <div className="text-xl font-black font-mono text-[#ff8844] mt-1" style={{ textShadow: "0 0 10px rgba(255,136,68,0.3)" }}>
          E = {eTotal.toFixed(3)} kcal/mol
        </div>
        <div className="text-[8px] text-white/20 mt-1 font-mono">E_total = E_bond + E_angle + E_torsion</div>
      </div>
    </div>
  );
}

// ─── Born-Oppenheimer Approximation Toggle ───
function BornOppenheimer() {
  const [showSeparation, setShowSeparation] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 350 * dpr;
    canvas.height = 180 * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, 350, 180);

    if (!showSeparation) {
      // Combined motion — chaotic paths
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.font = "10px 'Inter'";
      ctx.fillText("Coupled Nuclear + Electronic Motion", 60, 15);

      // Draw tangled paths
      for (let p = 0; p < 3; p++) {
        ctx.beginPath();
        ctx.strokeStyle = `hsla(${p * 120}, 70%, 60%, 0.6)`;
        ctx.lineWidth = 1.5;
        let x = 50 + p * 80, y = 90;
        ctx.moveTo(x, y);
        for (let i = 0; i < 100; i++) {
          x += Math.sin(i * 0.3 + p) * 5 + (Math.random() - 0.5) * 8;
          y += Math.cos(i * 0.4 + p * 2) * 4 + (Math.random() - 0.5) * 6;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Nuclei (big) - Violet
      [{ x: 100, y: 90 }, { x: 230, y: 90 }].forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = "#006EFF";
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#006EFF";
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Electrons (small, scattered) - Amber
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.arc(80 + Math.random() * 180, 50 + Math.random() * 80, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#006EFF";
        ctx.shadowBlur = 8;
        ctx.shadowColor = "#006EFF";
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.fillStyle = "rgba(255,100,100,0.4)";
      ctx.font = "8px 'Inter'";
      ctx.fillText("❌ Intractable — must solve everything simultaneously", 30, 170);

    } else {
      // Separated motion
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.font = "10px 'Inter'";
      ctx.fillText("Born-Oppenheimer: Separated Motion", 60, 15);

      // Nuclear region (left)
      ctx.strokeStyle = "rgba(255,68,136,0.2)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(10, 30, 150, 100);
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(255,68,136,0.15)";
      ctx.font = "8px 'Inter'";
      ctx.fillText("NUCLEAR (slow)", 40, 45);

      // Nuclei in smooth potential curve
      ctx.beginPath();
      ctx.strokeStyle = "#ff4488";
      ctx.lineWidth = 1.5;
      for (let i = 0; i <= 130; i++) {
        const x = 20 + i;
        const r = (i - 65) / 30;
        const y = 90 - 30 * Math.exp(-r * r) + 10;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      [{ x: 55 }, { x: 115 }].forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x, 85, 8, 0, Math.PI * 2);
        ctx.fillStyle = "#006EFF";
        ctx.fill();
      });

      // Electronic region (right)
      ctx.strokeStyle = "rgba(0,200,255,0.2)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(180, 30, 160, 100);
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(0,200,255,0.15)";
      ctx.font = "8px 'Inter'";
      ctx.fillText("ELECTRONIC (fast)", 210, 45);

      // Electron orbitals (structured)
      for (let i = 0; i < 6; i++) {
        const cx = 260;
        const cy = 80;
        const a = 25 + i * 8;
        const b = 15 + i * 5;
        ctx.beginPath();
        ctx.ellipse(cx, cy, a, b, (i * Math.PI) / 6, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(185, 80%, 60%, ${0.4 - i * 0.05})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(240 + Math.random() * 40, 65 + Math.random() * 30, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#006EFF";
        ctx.shadowBlur = 6;
        ctx.shadowColor = "#006EFF";
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.fillStyle = "rgba(0,200,100,0.5)";
      ctx.font = "8px 'Inter'";
      ctx.fillText("✓ Solve electronic problem for fixed nuclei", 30, 145);
      ctx.fillText("✓ Nuclear PES from electronic energies", 30, 158);
      ctx.fillText("✓ Feasible with Hartree-Fock & DFT", 30, 171);
    }

  }, [showSeparation]);

  return (
    <div className="glass rounded-xl border border-white/5 p-4">
      <h3 className="text-xs font-bold text-[#9966ff] tracking-widest mb-3">BORN-OPPENHEIMER APPROX</h3>
      <button 
        onClick={() => setShowSeparation(!showSeparation)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-semibold mb-3 transition-all ${showSeparation ? 'bg-[#22cc88]/20 text-[#22cc88] border border-[#22cc88]/30' : 'bg-[#ff4488]/20 text-[#ff4488] border border-[#ff4488]/30'}`}
      >
        {showSeparation ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
        {showSeparation ? "BO Separation: ON" : "BO Separation: OFF"}
      </button>
      <canvas ref={canvasRef} className="w-full rounded-lg" style={{ height: 180, background: "rgba(0,0,0,0.3)" }} />
    </div>
  );
}

// ─── Main Page ───
export default function PESExplorer() {
  const navigate = useNavigate();

  return (
    <motion.div className="h-screen nucleus-bg flex flex-col relative overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5 bg-black/40 backdrop-blur-xl relative z-10 shrink-0">
        <button onClick={() => navigate(-1)} className="p-2 glass rounded-full hover:bg-white/10 text-muted-foreground transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 rounded-lg bg-[#006EFF]/10 flex items-center justify-center border border-[#006EFF]/20">
          <LineChart className="w-4 h-4 text-[#006EFF]" />
        </div>
        <div>
          <h1 className="text-base font-bold text-[#006EFF] tracking-widest text-glow-blue font-orbitron">
            POTENTIAL ENERGY
          </h1>
          <p className="text-[10px] text-muted-foreground/50 font-space">IMF · Force Fields · Conformers · H-Bonds · Born-Oppenheimer</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          <IMFContributions />
          <LondonAnimator />
          <HBondGeometry />
          <ForceFieldDecomposer />
          <ButaneDihedral />
          <BornOppenheimer />
        </div>
      </div>
    </motion.div>
  );
}
