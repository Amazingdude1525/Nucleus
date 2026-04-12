import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { X, Info, Atom, Waves, Eye, Zap, Loader2, ArrowRight } from "lucide-react";
import { type Element, categoryColors, categoryLabels, electronShells, elementSpectra } from "@/data/elements";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import BohrModel from "./BohrModel";
import ElectronCloud from "./ElectronCloud";
import EmissionSpectra from "./EmissionSpectra";
import HeisenbergCloud from "./HeisenbergCloud";

interface ElementDetailProps {
  element: Element;
  onClose?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

/**
 * Extended element data: melting/boiling points, electronegativity, 
 * ionization energy, density, state at STP
 */
const EXTENDED_DATA: Record<number, {
  meltingPoint?: number;
  boilingPoint?: number;
  electronegativity?: number;
  ionizationEnergy?: number;
  density?: number;
  state: "solid" | "liquid" | "gas";
  discoveredBy?: string;
  discoveredYear?: number;
  uses?: string;
}> = {
  1: { meltingPoint: -259, boilingPoint: -253, electronegativity: 2.20, ionizationEnergy: 1312, density: 0.00009, state: "gas", discoveredBy: "Henry Cavendish", discoveredYear: 1766, uses: "Rocket fuel, ammonia synthesis, fuel cells" },
  2: { meltingPoint: -272, boilingPoint: -269, electronegativity: 0, ionizationEnergy: 2372, density: 0.00018, state: "gas", discoveredBy: "Pierre Janssen", discoveredYear: 1868, uses: "Cryogenics, balloons, MRI cooling" },
  3: { meltingPoint: 181, boilingPoint: 1342, electronegativity: 0.98, ionizationEnergy: 520, density: 0.534, state: "solid", discoveredBy: "Johan August Arfwedson", discoveredYear: 1817, uses: "Batteries, psychiatric medication, alloys" },
  4: { meltingPoint: 1287, boilingPoint: 2469, electronegativity: 1.57, ionizationEnergy: 900, density: 1.85, state: "solid", discoveredBy: "Louis Nicolas Vauquelin", discoveredYear: 1798, uses: "Aerospace alloys, X-ray windows" },
  5: { meltingPoint: 2076, boilingPoint: 3927, electronegativity: 2.04, ionizationEnergy: 801, density: 2.34, state: "solid", discoveredBy: "Joseph Louis Gay-Lussac", discoveredYear: 1808, uses: "Borosilicate glass, semiconductors" },
  6: { meltingPoint: 3550, boilingPoint: 4027, electronegativity: 2.55, ionizationEnergy: 1086, density: 2.27, state: "solid", discoveredBy: "Ancient", discoveredYear: -3750, uses: "Steel, diamonds, carbon fiber, organic chemistry" },
  7: { meltingPoint: -210, boilingPoint: -196, electronegativity: 3.04, ionizationEnergy: 1402, density: 0.0013, state: "gas", discoveredBy: "Daniel Rutherford", discoveredYear: 1772, uses: "Fertilizers, explosives, food preservation" },
  8: { meltingPoint: -218, boilingPoint: -183, electronegativity: 3.44, ionizationEnergy: 1314, density: 0.0014, state: "gas", discoveredBy: "Joseph Priestley", discoveredYear: 1774, uses: "Respiration, steel production, welding" },
  9: { meltingPoint: -220, boilingPoint: -188, electronegativity: 3.98, ionizationEnergy: 1681, density: 0.0017, state: "gas", discoveredBy: "André-Marie Ampère", discoveredYear: 1810, uses: "Toothpaste (fluoride), Teflon, enriching uranium" },
  10: { meltingPoint: -249, boilingPoint: -246, electronegativity: 0, ionizationEnergy: 2081, density: 0.0009, state: "gas", discoveredBy: "William Ramsay", discoveredYear: 1898, uses: "Neon signs, lasers, cryogenics" },
  11: { meltingPoint: 98, boilingPoint: 883, electronegativity: 0.93, ionizationEnergy: 496, density: 0.97, state: "solid", discoveredBy: "Humphry Davy", discoveredYear: 1807, uses: "Table salt, street lights, chemical synthesis" },
  12: { meltingPoint: 650, boilingPoint: 1090, electronegativity: 1.31, ionizationEnergy: 738, density: 1.74, state: "solid", discoveredBy: "Joseph Black", discoveredYear: 1755, uses: "Alloys, fireworks (white light), medicine" },
  13: { meltingPoint: 660, boilingPoint: 2519, electronegativity: 1.61, ionizationEnergy: 578, density: 2.70, state: "solid", discoveredBy: "Hans Christian Ørsted", discoveredYear: 1825, uses: "Aircraft, cans, foil, construction" },
  14: { meltingPoint: 1414, boilingPoint: 3265, electronegativity: 1.90, ionizationEnergy: 786, density: 2.33, state: "solid", discoveredBy: "Jöns Jacob Berzelius", discoveredYear: 1824, uses: "Semiconductors, solar cells, glass" },
  17: { meltingPoint: -101, boilingPoint: -34, electronegativity: 3.16, ionizationEnergy: 1251, density: 0.0032, state: "gas", discoveredBy: "Carl Wilhelm Scheele", discoveredYear: 1774, uses: "Water treatment, PVC, bleach" },
  20: { meltingPoint: 842, boilingPoint: 1484, electronegativity: 1.00, ionizationEnergy: 590, density: 1.55, state: "solid", discoveredBy: "Humphry Davy", discoveredYear: 1808, uses: "Cement, bones & teeth, cheese making" },
  26: { meltingPoint: 1538, boilingPoint: 2862, electronegativity: 1.83, ionizationEnergy: 762, density: 7.87, state: "solid", discoveredBy: "Ancient", discoveredYear: -5000, uses: "Steel, construction, hemoglobin" },
  29: { meltingPoint: 1085, boilingPoint: 2562, electronegativity: 1.90, ionizationEnergy: 745, density: 8.96, state: "solid", discoveredBy: "Ancient", discoveredYear: -9000, uses: "Wiring, plumbing, coins, electronics" },
  30: { meltingPoint: 420, boilingPoint: 907, electronegativity: 1.65, ionizationEnergy: 906, density: 7.13, state: "solid", discoveredBy: "Andreas Sigismund Marggraf", discoveredYear: 1746, uses: "Galvanizing, batteries, alloys" },
  47: { meltingPoint: 962, boilingPoint: 2162, electronegativity: 1.93, ionizationEnergy: 731, density: 10.5, state: "solid", discoveredBy: "Ancient", discoveredYear: -5000, uses: "Jewelry, electronics, photography" },
  79: { meltingPoint: 1064, boilingPoint: 2856, electronegativity: 2.54, ionizationEnergy: 890, density: 19.3, state: "solid", discoveredBy: "Ancient", discoveredYear: -6000, uses: "Jewelry, electronics, dentistry, currency" },
};

export default function ElementDetail({ element, onClose, onPrev, onNext }: ElementDetailProps) {
  const [viewMode, setViewMode] = useState<"bohr" | "cloud">("bohr");
  const [heisenbergU, setHeisenbergU] = useState(0.5);
  
  // Wikipedia API State
  const [wikiImage, setWikiImage] = useState<string | null>(null);
  const [wikiDesc, setWikiDesc] = useState<string | null>(null);
  const [wikiLoading, setWikiLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchWiki = async () => {
      setWikiLoading(true);
      setWikiImage(null);
      setWikiDesc(null);
      try {
        const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${element.name}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        if (active) {
          if (data.thumbnail && data.thumbnail.source) {
            setWikiImage(data.thumbnail.source);
          }
          if (data.extract) {
            // Keep first 4 sentences for a more detailed dossier
            setWikiDesc(data.extract.split(". ").slice(0, 4).join(". ") + ".");
          }
        }
      } catch (err) {
        console.error("Wiki fetch failed", err);
      } finally {
        if (active) setWikiLoading(false);
      }
    };
    fetchWiki();
    return () => { active = false; };
  }, [element.name]);
  const glowColor = categoryColors[element.category];
  const extData = EXTENDED_DATA[element.number];
  const shells = electronShells[element.number];

  // Calculate total electrons in each shell for display
  const shellInfo = useMemo(() => {
    if (!shells) return null;
    const shellNames = ["K", "L", "M", "N", "O", "P", "Q"];
    return shells.map((count, i) => ({
      name: shellNames[i] || `Shell ${i + 1}`,
      electrons: count,
    }));
  }, [shells]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      {/* Panel */}
      <motion.div
        className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl glass-strong border border-white/10"
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        style={{
          boxShadow: `0 0 40px hsl(${glowColor} / 0.15), 0 0 80px hsl(${glowColor} / 0.05)`,
        }}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between p-6 border-b border-white/5 relative overflow-hidden">
          {/* Subtle background glow from the element's color */}
          <div 
            className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] opacity-20 pointer-events-none"
            style={{ backgroundColor: `hsl(${glowColor})` }}
          />

          <div className="flex flex-col md:flex-row items-center md:items-start gap-5 z-10 w-full">
            <div className="flex gap-4">
              <div
                className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-bold glass relative overflow-hidden shrink-0"
                style={{
                  color: `hsl(${glowColor})`,
                  boxShadow: `0 0 30px hsl(${glowColor} / 0.2), inset 0 0 20px hsl(${glowColor} / 0.1)`,
                  border: `1px solid hsl(${glowColor} / 0.4)`
                }}
              >
                <span className="text-3xl font-black">{element.symbol}</span>
                <span className="text-[10px] font-mono opacity-60 absolute bottom-1">{element.number}</span>
              </div>
              {/* Real Physical Element Image removed from header to be placed next to Bohr model */}
            </div>

            <div className="text-center md:text-left mt-2 md:mt-0 flex-1">
              <h2 className="text-3xl font-black text-foreground tracking-wide">{element.name}</h2>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-md glass uppercase tracking-widest" style={{ color: `hsl(${glowColor})`, border: `1px solid hsl(${glowColor} / 0.3)` }}>
                  {categoryLabels[element.category]}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-md glass font-mono">
                  {element.mass} u
                </span>
                {extData && (
                  <span className="text-xs px-2.5 py-1 rounded-md glass text-muted-foreground flex items-center gap-1">
                    {extData.state === "solid" ? "🧊 Solid" : extData.state === "liquid" ? "💧 Liquid" : "💨 Gas"}
                  </span>
                )}
              </div>
              <p className="text-sm text-primary font-mono mt-3 opacity-90">{element.electronConfig}</p>
            </div>
            
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2.5 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white transition-all z-20 glass"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="3d" className="p-6">
          <TabsList className="glass border border-white/5 bg-white/[0.03]">
            <TabsTrigger value="3d" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary flex items-center gap-1.5">
              <Atom className="w-3.5 h-3.5" />
              3D Atomic View
            </TabsTrigger>
            <TabsTrigger value="heisenberg" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              Heisenberg Mode
            </TabsTrigger>
            <TabsTrigger value="spectra" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary flex items-center gap-1.5">
              <Waves className="w-3.5 h-3.5" />
              Emission Spectra
            </TabsTrigger>
            <TabsTrigger value="data" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              Properties
            </TabsTrigger>
          </TabsList>

          {/* 3D Atomic View Tab */}
          <TabsContent value="3d" className="mt-4">
            {/* View toggle */}
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-xs ${viewMode === "bohr" ? "text-primary" : "text-muted-foreground"}`}>Bohr Model</span>
              <Switch
                checked={viewMode === "cloud"}
                onCheckedChange={(checked) => setViewMode(checked ? "cloud" : "bohr")}
              />
              <span className={`text-xs ${viewMode === "cloud" ? "text-primary" : "text-muted-foreground"}`}>Probability Cloud</span>
            </div>

            {/* 3D Canvas and Wiki Image layout */}
            <div className="flex flex-col md:flex-row gap-4 h-[350px]">
              
              {/* Left Side: Wikipedia Real-life image container */}
              <div 
                className="w-full md:w-64 h-full rounded-xl overflow-hidden glass border border-white/5 flex flex-col shrink-0"
                style={{ boxShadow: `0 0 20px hsl(${glowColor} / 0.1)` }}
              >
                <div className="p-3 border-b border-white/5 bg-white/[0.02]">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: `hsl(${glowColor})` }}>
                    <Eye className="w-3.5 h-3.5" />
                    Real-Life Sample
                  </h4>
                </div>
                <div className="flex-1 relative bg-black/40 flex flex-col items-center justify-center p-4">
                  {wikiLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground/50" />
                  ) : wikiImage ? (
                    <motion.div 
                      className="w-full aspect-square rounded-lg overflow-hidden relative"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      style={{ boxShadow: `0 0 30px hsl(${glowColor} / 0.2)` }}
                    >
                      <img src={wikiImage} alt={element.name} className="w-full h-full object-cover" />
                    </motion.div>
                  ) : (
                    <div className="text-center p-4">
                      <Atom className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                      <p className="text-[10px] text-muted-foreground/50">No photographic sample available</p>
                    </div>
                  )}
                </div>
                {wikiDesc && (
                  <div className="p-4 bg-white/[0.03] backdrop-blur-md border-t border-white/10 relative group-hover:bg-white/[0.05] transition-colors max-h-[160px] overflow-y-auto custom-scrollbar">
                    <div className="flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full mt-1 shrink-0" style={{ backgroundColor: `hsl(${glowColor})`, boxShadow: `0 0 8px hsl(${glowColor})` }} />
                      <p className="text-[11px] text-muted-foreground/90 leading-[1.6] font-medium tracking-wide">
                        {wikiDesc}
                      </p>
                    </div>
                    <a 
                      href={`https://en.wikipedia.org/wiki/${element.name}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-[#00c8ff] hover:text-white transition-colors group/link"
                    >
                      <span>Detailed Scientific Dossier</span>
                      <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                    </a>
                  </div>
                )}
              </div>

              {/* Right Side: 3D Viewer */}
              <div className="flex-1 h-full rounded-xl overflow-hidden glass border border-white/5 relative">
                {/* Native UI Legend overlay */}
                {viewMode === "bohr" && (
                  <div className="absolute top-4 left-4 z-10 glass bg-black/40 backdrop-blur-md rounded-xl px-4 py-3 border border-white/10 text-[11px] space-y-2 min-w-[110px] shadow-lg pointer-events-none">
                    <div className="text-[9px] text-muted-foreground/80 uppercase tracking-widest font-semibold mb-1">
                      Legend
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ff3333] shadow-[0_0_6px_#ff3333,0_0_12px_#ff333366]" />
                      <span className="text-white font-medium">Proton</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#3388ff] shadow-[0_0_6px_#3388ff,0_0_12px_#3388ff66]" />
                      <span className="text-white font-medium">Neutron</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] shadow-[0_0_6px_#00F0FF,0_0_12px_#00F0FF66]" />
                      <span className="text-white font-medium">Electron</span>
                    </div>
                  </div>
                )}

                <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
                  <ambientLight intensity={0.3} />
                  <pointLight position={[5, 5, 5]} intensity={0.5} />
                  {viewMode === "bohr" ? (
                    <BohrModel atomicNumber={element.number} />
                  ) : (
                    <ElectronCloud atomicNumber={element.number} />
                  )}
                  <OrbitControls enableZoom enablePan={false} autoRotate={viewMode === "cloud"} autoRotateSpeed={1} />
                </Canvas>
              </div>
            </div>

            <p className="text-xs text-muted-foreground/50 mt-2 text-center">
              Drag to rotate • Scroll to zoom • {viewMode === "bohr" ? "Bohr model visualization" : "Electron probability density cloud"}
            </p>
          </TabsContent>

          {/* Heisenberg Uncertainty Principle Tab */}
          <TabsContent value="heisenberg" className="mt-4">
            <div className="flex flex-col gap-4">
              {/* Explanation */}
              <div className="glass rounded-xl border border-white/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">Heisenberg Uncertainty Principle</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="text-primary font-mono font-bold">Δx · Δp ≥ ℏ/2</span> — You cannot simultaneously 
                  know both the exact position (Δx) and momentum (Δp) of a particle. Slide the control below to see 
                  the tradeoff in real-time.
                </p>
              </div>

              {/* Slider */}
              <div className="glass rounded-xl border border-white/5 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-center">
                    <div className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">Position Certain</div>
                    <div className="text-xs text-primary font-mono mt-0.5">Small Δx</div>
                    <div className="text-[10px] text-muted-foreground/40">Fast jitter (large Δp)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">Momentum Certain</div>
                    <div className="text-xs text-primary font-mono mt-0.5">Small Δp</div>
                    <div className="text-[10px] text-muted-foreground/40">Wide spread (large Δx)</div>
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={heisenbergU * 100}
                  onChange={(e) => setHeisenbergU(Number(e.target.value) / 100)}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(90deg, hsl(0 100% 60%), hsl(185 100% 50%), hsl(260 100% 65%))`,
                  }}
                />
                <div className="flex justify-between mt-2 text-[10px] font-mono">
                  <span className="text-red-400">Δx = {(0.3 + heisenbergU * 3.5).toFixed(2)} pm</span>
                  <span className="text-purple-400">Δp = {(0.02 + (1 - heisenbergU) * 0.25).toFixed(3)} × 10⁻²⁴ kg·m/s</span>
                </div>
              </div>

              {/* 3D Canvas */}
              <div className="w-full h-[320px] rounded-xl overflow-hidden glass border border-white/5">
                <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
                  <ambientLight intensity={0.3} />
                  <pointLight position={[5, 5, 5]} intensity={0.5} />
                  <HeisenbergCloud atomicNumber={element.number} uncertainty={heisenbergU} />
                  <OrbitControls enableZoom enablePan={false} />
                </Canvas>
              </div>

              <p className="text-xs text-muted-foreground/50 text-center">
                Move the slider to observe how measuring position more precisely increases momentum uncertainty, and vice versa.
              </p>
            </div>
          </TabsContent>

          {/* Emission Spectra Tab */}
          <TabsContent value="spectra" className="mt-4">
            <EmissionSpectra atomicNumber={element.number} elementName={element.name} />
            <p className="text-xs text-muted-foreground/50 mt-4 text-center">
              Hover over spectral lines for wavelength details. {elementSpectra[element.number] ? `Real lab data for ${element.name}.` : `Scientifically simulated fingerprint for ${element.name}.`}
            </p>
          </TabsContent>

          {/* Properties/Data Tab */}
          <TabsContent value="data" className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Basic properties */}
              <div className="glass rounded-xl border border-white/5 p-4 space-y-3">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Atom className="w-3.5 h-3.5 text-primary" />
                  Fundamental Properties
                </h3>
                <div className="space-y-2">
                  <PropRow label="Atomic Number" value={String(element.number)} />
                  <PropRow label="Atomic Mass" value={`${element.mass} u`} />
                  <PropRow label="Period" value={String(element.period)} />
                  <PropRow label="Group" value={element.group ? String(element.group) : "—"} />
                  <PropRow label="Category" value={categoryLabels[element.category]} color={`hsl(${glowColor})`} />
                  <PropRow label="Electron Config" value={element.electronConfig} mono />
                </div>
              </div>

              {/* Extended properties */}
              <div className="glass rounded-xl border border-white/5 p-4 space-y-3">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  Physical & Chemical
                </h3>
                <div className="space-y-2">
                  {extData ? (
                    <>
                      <PropRow label="Melting Point" value={extData.meltingPoint !== undefined ? `${extData.meltingPoint}°C` : "—"} />
                      <PropRow label="Boiling Point" value={extData.boilingPoint !== undefined ? `${extData.boilingPoint}°C` : "—"} />
                      <PropRow label="Electronegativity" value={extData.electronegativity ? String(extData.electronegativity) : "—"} />
                      <PropRow label="1st Ionization" value={extData.ionizationEnergy ? `${extData.ionizationEnergy} kJ/mol` : "—"} />
                      <PropRow label="Density" value={extData.density ? `${extData.density} g/cm³` : "—"} />
                      <PropRow label="State (STP)" value={extData.state.charAt(0).toUpperCase() + extData.state.slice(1)} />
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground/50 italic">Extended data not available for this element.</p>
                  )}
                </div>
              </div>

              {/* Shell distribution */}
              {shellInfo && (
                <div className="glass rounded-xl border border-white/5 p-4 space-y-3">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    🐚 Electron Shell Distribution
                  </h3>
                  <div className="flex items-end gap-2 h-20">
                    {shellInfo.map((shell, i) => (
                      <div key={i} className="flex flex-col items-center gap-1 flex-1">
                        <div
                          className="w-full rounded-t-md transition-all"
                          style={{
                            height: `${(shell.electrons / 32) * 100}%`,
                            minHeight: "4px",
                            background: `hsl(${185 + i * 30} 100% 50%)`,
                            boxShadow: `0 0 8px hsl(${185 + i * 30} 100% 50% / 0.4)`,
                          }}
                        />
                        <span className="text-[10px] font-bold text-foreground">{shell.electrons}</span>
                        <span className="text-[8px] text-muted-foreground/50">{shell.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Discovery & Uses */}
              {extData && (
                <div className="glass rounded-xl border border-white/5 p-4 space-y-3">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    📖 History & Uses
                  </h3>
                  <div className="space-y-2">
                    {extData.discoveredBy && (
                      <PropRow label="Discovered by" value={extData.discoveredBy} />
                    )}
                    {extData.discoveredYear && (
                      <PropRow label="Year" value={extData.discoveredYear < 0 ? `~${Math.abs(extData.discoveredYear)} BC` : String(extData.discoveredYear)} />
                    )}
                    {extData.uses && (
                      <div className="mt-2">
                        <div className="text-[10px] text-muted-foreground/50 mb-1">Common Uses</div>
                        <p className="text-xs text-foreground/80 leading-relaxed">{extData.uses}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}

/** Simple property row */
function PropRow({ label, value, mono, color }: { label: string; value: string; mono?: boolean; color?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] text-muted-foreground/50">{label}</span>
      <span
        className={`text-xs font-medium ${mono ? "font-mono" : ""}`}
        style={color ? { color } : undefined}
      >
        {value}
      </span>
    </div>
  );
}
