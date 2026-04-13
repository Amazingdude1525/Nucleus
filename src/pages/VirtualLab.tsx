import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { RotateCcw, FlaskConical, Atom, Flame, Snowflake, Hand, Camera as CameraIcon, Crosshair, Search, Sparkles, ArrowRight, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import {
  chemicals,
  findReaction,
  calculateTemperatureChange,
  estimatePH,
  calculateMolarity,
  getChemicalsByCategory,
  CATEGORIES,
  createInitialBeakerState,
  type Chemical,
  type ChemCategory,
} from "@/data/chemicals";
import ParticleField from "@/components/splash/ParticleField";
import ChemicalCard from "@/components/virtual-lab/ChemicalCard";
import Beaker3D from "@/components/virtual-lab/Beaker3D";
import ReactionLog, { type LogEntry } from "@/components/virtual-lab/ReactionLog";
import DashboardPanel from "@/components/virtual-lab/DashboardPanel";
import TemperatureSlider from "@/components/virtual-lab/TemperatureSlider";
import { useHandTrackingContext } from "@/components/HandTracking";

const CATEGORY_ICONS: Record<ChemCategory, string> = {
  WATER: "💧",
  ACIDS: "🧪",
  BASES: "⚗️",
  SALTS: "🧂",
  NEUTRALS: "⚙️",
  INDICATORS: "🎨",
  ORGANICS: "🔬",
  FAMOUS: "💡",
};

const LAB_QUOTES = [
  "You are about to perform reactions that shape the universe.",
  "Nothing in life is to be feared, it is only to be understood. — Marie Curie",
  "The good thing about science is that it's true whether or not you believe in it.",
];

// Removed complex AnimatedHandGesture in favor of a cleaner UI icon

export default function VirtualLab() {
  const { isActive: enabled, showOnboarding, deactivate: disableTracking } = useHandTrackingContext();

  const [hasEntered, setHasEntered] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ChemCategory>("WATER");
  const [beakerContents, setBeakerContents] = useState<{ chemical: Chemical; moles: number; addedAt: number }[]>([]);
  const [liquidLevel, setLiquidLevel] = useState(0);
  const [liquidColor, setLiquidColor] = useState("#4488ff");
  const [showBubbles, setShowBubbles] = useState(false);
  const [heatGlow, setHeatGlow] = useState(false);
  const [manualBurnerOn, setManualBurnerOn] = useState(false);
  const [temperature, setTemperature] = useState(25.0);
  const [lastDeltaH, setLastDeltaH] = useState(0);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [logId, setLogId] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [smellAlert, setSmellAlert] = useState<string | null>(null);
  const [observations, setObservations] = useState<string[]>([]);

  // Pick a random quote
  const labQuote = useMemo(() => LAB_QUOTES[Math.floor(Math.random() * LAB_QUOTES.length)], []);



  const totalVolumeMl = useMemo(
    () => beakerContents.reduce((sum, c) => sum + c.chemical.volumeMl, 0),
    [beakerContents]
  );

  // Sync liquid level with actual volume — 500mL beaker capacity
  const MAX_BEAKER_ML = 500;
  useEffect(() => {
    const level = Math.min(totalVolumeMl / MAX_BEAKER_ML, 1);
    setLiquidLevel(level);
  }, [totalVolumeMl]);

  const pH = useMemo(
    () => estimatePH(beakerContents.map((c) => ({ chemical: c.chemical, moles: c.moles }))),
    [beakerContents]
  );

  const molarity = useMemo(
    () => calculateMolarity(
      beakerContents.map((c) => ({ chemical: c.chemical, moles: c.moles })),
      totalVolumeMl
    ),
    [beakerContents, totalVolumeMl]
  );

  const categoryChemicals = useMemo(() => {
    const chems = getChemicalsByCategory(activeCategory);
    if (!searchQuery.trim()) return chems;
    const q = searchQuery.toLowerCase();
    return chems.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.formula.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
    );
  }, [activeCategory, searchQuery]);

  const addLog = useCallback(
    (message: string, type: LogEntry["type"]) => {
      setLogId((prev) => {
        const newId = prev + 1;
        setLogEntries((entries) => [
          { id: newId, message, type, timestamp: new Date() },
          ...entries,
        ]);
        return newId;
      });
    },
    []
  );

  const handleAddChemical = useCallback(
    (chem: Chemical) => {
      let newContents = [...beakerContents];
      
      // Auto-inject water if a FAMOUS test is added to an empty beaker
      if (beakerContents.length === 0 && chem.category === "FAMOUS") {
        const h2o = getChemicalsByCategory("WATER").find(c => c.id === "h2o")!;
        newContents.push({ chemical: h2o, moles: h2o.defaultMoles, addedAt: Date.now() });
        addLog(`Auto-added ${h2o.formula} base for ${chem.name}`, "info");
      }

      const newEntry = { chemical: chem, moles: chem.defaultMoles, addedAt: Date.now() };
      newContents.push(newEntry);
      setBeakerContents(newContents);

      // Thermal equilibrium calculation before any reaction
      const addedVolume = chem.volumeMl;
      const addedTemp = chem.id === "h2o_ice" ? 0 : chem.id === "h2o_hot" ? 80 : 25;
      
      setTemperature((prev) => {
        if (totalVolumeMl === 0) return addedTemp;
        const equilibriumTemp = ((prev * totalVolumeMl) + (addedTemp * addedVolume)) / (totalVolumeMl + addedVolume);
        return equilibriumTemp;
      });

      // Update liquid color (blend toward new chemical's color)
      setLiquidColor(chem.color);

      addLog(`Added ${chem.defaultMoles} mol ${chem.formula} (${chem.volumeMl}mL) at ${addedTemp}°C`, "add");

      // Check for reaction with previously added chemicals
      for (const existing of beakerContents) {
        const reaction = findReaction(existing.chemical.id, chem.id);
        if (reaction) {
          setTimeout(() => {
            setLiquidColor(reaction.productColor);
            setShowBubbles(reaction.bubbles);

            // THERMODYNAMIC CALCULATION
            const limitingMoles = Math.min(existing.moles, chem.defaultMoles);
            const newVolume = totalVolumeMl + chem.volumeMl;
            const deltaT = calculateTemperatureChange(reaction.deltaH, limitingMoles, newVolume);

            setTemperature((prev) => {
              const newTemp = Math.max(0, Math.min(prev + deltaT, 200));
              return newTemp;
            });
            setLastDeltaH(reaction.deltaH);

            if (reaction.deltaH < 0) {
              setHeatGlow(true);
              addLog(
                `🔥 Exothermic: ΔH = ${reaction.deltaH.toFixed(1)} kJ/mol → ΔT ≈ +${deltaT.toFixed(1)}°C`,
                "info"
              );
            } else if (reaction.deltaH > 0) {
              addLog(
                `❄️ Endothermic: ΔH = +${reaction.deltaH.toFixed(1)} kJ/mol → ΔT ≈ ${deltaT.toFixed(1)}°C`,
                "info"
              );
            }

            // Reaction log entry with full info: reagents → products → ΔH → state
            const state = reaction.deltaH < 0 ? "Exothermic" : reaction.deltaH > 0 ? "Endothermic" : "Isothermal";
            addLog(
              `⚗️ ${existing.chemical.formula} + ${chem.formula} → ${reaction.productFormula} | ΔH=${reaction.deltaH.toFixed(1)} kJ/mol | ${state}`,
              "reaction"
            );
            
            if (reaction.limitingReagentNote) {
              addLog(`📊 Limiting reagent: ${reaction.limitingReagentNote}`, "info");
            }

            if (reaction.gasEvolved) {
              addLog(`Gas evolved: ${reaction.gasEvolved}↑ — bubbles observed`, "info");
            }

            // Smell alert
            if (reaction.smell) {
              setSmellAlert(reaction.smell);
              setTimeout(() => setSmellAlert(null), 6000);
            }

            // Physical observations
            if (reaction.observations && reaction.observations.length > 0) {
              setObservations(reaction.observations);
              reaction.observations.forEach((obs) => {
                addLog(`🔍 ${obs}`, "info");
              });
              setTimeout(() => setObservations([]), 10000);
            }
          }, 600);

          // Clear transient effects after a while
          setTimeout(() => {
            setShowBubbles(false);
            setHeatGlow(false);
          }, 8000);

          break;
        }
      }
    },
    [beakerContents, totalVolumeMl, addLog]
  );

  // Real-time temperature increase when burner is active
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (manualBurnerOn || heatGlow) {
      interval = setInterval(() => {
        setTemperature((prev) => {
           if (prev >= 100) return 100; // Cap at boiling for water
           return prev + 0.2; // Real-time +2°C/sec
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [manualBurnerOn, heatGlow]);

  const handleReset = () => {
    setBeakerContents([]);
    setLiquidLevel(0);
    setLiquidColor("#4488ff");
    setShowBubbles(false);
    setHeatGlow(false);
    setManualBurnerOn(false);
    setTemperature(25.0);
    setLastDeltaH(0);
    setSmellAlert(null);
    setObservations([]);
    addLog("Beaker cleared — ready for new experiment", "info");
  };

  /* ─── Entrance / Quote Screen ─── */
  if (!hasEntered) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-3.5rem)] relative overflow-hidden bg-[#030303]">
        {/* Cinematic Background Image Layer */}
        <div className="absolute inset-0 z-0">
           <img 
             src="/virtual_lab_intro_hero_1776016629161.png" 
             alt="Lab Intro" 
             className="w-full h-full object-cover opacity-30 brightness-[0.5] transition-all duration-1000"
           />
           <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030303]/40 to-[#030303]" />
           <div className="absolute inset-0 bg-black/40" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 text-center max-w-2xl px-8 flex flex-col items-center gap-10"
        >
          {/* Scientific Badge Container */}
          <motion.div 
            className="w-36 h-36 rounded-[2.5rem] glass border border-white/10 flex items-center justify-center relative group"
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
             <FlaskConical className="w-16 h-16 text-primary drop-shadow-[0_0_25px_rgba(0,229,255,0.7)]" />
             <div className="absolute inset-0 rounded-[2.5rem] bg-primary/5 blur-3xl group-hover:bg-primary/20 transition-all duration-500" />
          </motion.div>

          {/* Typography block */}
          <div className="space-y-5">
            <h1 className="text-4xl md:text-6xl font-black font-orbitron text-white leading-tight uppercase tracking-widest">
              Synthesis <span className="text-primary text-shadow-cyan">CORE</span>
            </h1>
            <div className="w-24 h-1 bg-primary/30 mx-auto rounded-full" />
            <p className="text-base md:text-lg text-white/60 font-space leading-relaxed italic max-w-lg mx-auto opacity-80">
              "{labQuote}"
            </p>
          </div>

          <motion.button
            onClick={() => setHasEntered(true)}
            className="group px-14 py-4.5 bg-primary text-black font-black font-orbitron tracking-[0.4em] rounded-2xl relative overflow-hidden shadow-[0_0_60px_rgba(0,229,255,0.4)] transition-all"
            whileHover={{ scale: 1.05, boxShadow: "0 0 80px rgba(0,229,255,0.7)" }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10">INITIALIZE LAB</span>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-black/20 group-hover:h-full transition-all duration-500" />
          </motion.button>
        </motion.div>
      </div>
    );
  }

  /* ─── Main Lab UI ─── */
  return (
    <motion.div
      className="flex flex-col h-[calc(100vh-3.5rem)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Main content area — 4-column layout: Left Panel | Reaction Log | Beaker | Temperature */}
      <div className="flex flex-1 min-h-0">

        {/* LEFT COLUMN — Dashboard Panel */}
        <div className="w-[300px] shrink-0 border-r border-white/5 flex flex-col overflow-y-auto p-4 gap-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg glass flex items-center justify-center">
              <FlaskConical className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <h1 
                className="text-base font-bold tracking-widest text-primary text-glow-cyan"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                VIRTUAL LAB
              </h1>
              <p className="text-[9px] text-muted-foreground/50" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Thermodynamic Chemistry Engine
              </p>
            </div>
          </div>

          {/* Burner Control */}
          <div className="glass rounded-xl border border-white/5 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                <Flame className={`w-3.5 h-3.5 ${heatGlow || manualBurnerOn ? 'text-orange-400' : 'text-white/40'}`} /> Bunsen Burner
              </span>
              <button 
                onClick={() => setManualBurnerOn(!manualBurnerOn)}
                className={`text-[9px] font-mono px-2 py-1 rounded cursor-pointer transition-colors ${heatGlow || manualBurnerOn ? 'text-orange-400 bg-orange-400/20 border border-orange-400/30' : 'text-muted-foreground border border-white/10 bg-white/5 hover:bg-white/10'}`}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {heatGlow || manualBurnerOn ? '● ON' : '○ OFF'}
              </button>
            </div>
            <p className="text-[9px] text-muted-foreground/40" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Manual override or active during auto-exothermic reactions</p>
          </div>

          {/* Dashboard */}
          <DashboardPanel
            contents={beakerContents.map((c) => ({ chemical: c.chemical, moles: c.moles }))}
            totalVolumeMl={totalVolumeMl}
            temperature={temperature}
            pH={pH}
            molarity={molarity}
          />

          {/* Reaction indicator */}
          <AnimatePresence>
            {heatGlow && (
              <motion.div
                className="glass rounded-xl border border-[#ff4400]/30 px-4 py-3 text-xs font-semibold"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                style={{ boxShadow: "0 0 30px #ff440044", color: "#ff8844" }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="w-4 h-4" />
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Exothermic Reaction</span>
                </div>
                <div className="text-[10px] text-muted-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  ΔH = {lastDeltaH.toFixed(1)} kJ/mol
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Smell Alert */}
          <AnimatePresence>
            {smellAlert && (
              <motion.div
                className="glass rounded-xl border border-yellow-500/30 px-4 py-3 text-xs font-semibold"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                style={{ boxShadow: "0 0 30px rgba(234,179,8,0.15)", color: "#eab308" }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>⚠️ Smell Warning</span>
                </div>
                <div className="text-[10px] text-yellow-400/70 leading-relaxed">
                  {smellAlert}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Physical Observations */}
          <AnimatePresence>
            {observations.length > 0 && (
              <motion.div
                className="glass rounded-xl border border-[#22ccaa]/20 px-4 py-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                style={{ boxShadow: "0 0 20px rgba(34,204,170,0.1)" }}
              >
                <div className="text-[9px] uppercase tracking-[0.2em] text-[#22ccaa] font-semibold mb-2">
                  🔍 Physical Observations
                </div>
                <div className="space-y-1.5">
                  {observations.map((obs, i) => (
                    <motion.div
                      key={i}
                      className="text-[10px] text-muted-foreground/70 flex items-start gap-1.5 leading-relaxed"
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.15 }}
                    >
                      <span className="text-[#22ccaa] mt-0.5 shrink-0">•</span>
                      {obs}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* REACTION LOG — narrow vertical strip beside left panel */}
        <div className="w-[300px] shrink-0 border-r border-white/5 flex flex-col p-4 overflow-hidden">
          <ReactionLog entries={logEntries.slice(0, 7)} />
        </div>

        {/* CENTER — 3D Beaker Workbench */}
        <div className="flex-1 flex flex-col min-h-0 relative">
          {/* Beaker area — shorter, ensuring tools visible */}
          <div className="flex-1 relative min-h-0 flex items-center justify-center">
            {/* Professional Lab Matrix Workstation */}
            <div
              className="absolute inset-0 overflow-hidden bg-[#efede5] shadow-[inset_0_0_60px_rgba(0,180,255,0.05)]"
            >
              {/* The Matrix Pattern (Light Fade) */}
              <div className="absolute inset-0 opacity-20" style={{ 
                backgroundImage: `radial-gradient(#00c8ff 0.8px, transparent 0.8px)`,
                backgroundSize: '24px 24px' 
              }} />
              
              {/* Proper Vignette Effect */}
              <div 
                className="absolute inset-0 pointer-events-none z-[1]" 
                style={{
                  background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0, 0, 0, 0.4) 110%)'
                }}
              />
            </div>

            {/* Canvas overlay layout */}



            {/* 3D Canvas */}
            <div className="absolute inset-0 z-[2]">
              <Canvas camera={{ position: [0, 0.8, 6.5], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[3, 4, 3]} intensity={0.7} />
                <pointLight position={[-3, 2, -2]} intensity={0.3} color="#00F0FF" />
                <directionalLight position={[0, 5, 5]} intensity={0.3} />
                <Beaker3D
                  liquidLevel={liquidLevel}
                  liquidColor={liquidColor}
                  bubbles={showBubbles}
                  heatGlow={heatGlow || manualBurnerOn}
                />
                <OrbitControls
                  enablePan={false}
                  minDistance={2.5}
                  maxDistance={8}
                  minPolarAngle={0.3}
                  maxPolarAngle={Math.PI / 1.8}
                />
              </Canvas>
            </div>

            {/* Top Right Controls — properly spaced, not clipped */}
            <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
              <motion.button
                onClick={enabled ? disableTracking : showOnboarding}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl glass border text-xs font-medium transition-all ${
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
              
              <motion.button
                onClick={() => setManualBurnerOn(!manualBurnerOn)}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl glass border text-xs font-medium transition-all ${
                  manualBurnerOn
                    ? "text-[#ff6600] border-[#ff6600]/50 bg-[#ff6600]/10 shadow-[0_0_15px_rgba(255,102,0,0.3)]"
                    : "border-white/5 text-muted-foreground hover:text-white hover:border-white/20"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Flame className="w-4 h-4" />
                {manualBurnerOn ? "Burner On" : "Burner Off"}
              </motion.button>
              
              <motion.button
                onClick={handleReset}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl glass border border-white/5 text-muted-foreground hover:text-primary hover:border-primary/30 transition-all text-xs font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RotateCcw className="w-4 h-4" />
                Reset Beaker
              </motion.button>
            </div>
          </div>
        </div>

        {/* RIGHT — Temperature Slider */}
        <div className="w-20 shrink-0 border-l border-white/5 glass">
          <TemperatureSlider
            temperature={temperature}
            deltaH={lastDeltaH}
          />
        </div>
      </div>


      {/* Bottom Navigation — Chemical Categories + Cards */}
      <div className="shrink-0 border-t border-white/5" style={{ background: "rgba(0,0,0,0.7)" }}>
        
        {/* Category tabs + integrated search */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-white/5 relative z-10 bg-black/20">
          {/* Category buttons */}
          <div className="flex items-center gap-1 flex-1 overflow-x-auto scrollbar-thin">
            {CATEGORIES.map((cat) => (
              <motion.button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold tracking-wider uppercase transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? "text-primary border border-primary/30"
                    : "text-muted-foreground/50 hover:text-muted-foreground hover:bg-white/5 border border-transparent"
                }`}
                style={
                  activeCategory === cat
                    ? {
                        background: "rgba(0, 240, 255, 0.06)",
                        boxShadow: "0 0 20px hsl(185 100% 50% / 0.15)",
                        fontFamily: "'Space Grotesk', sans-serif",
                      }
                    : { fontFamily: "'Space Grotesk', sans-serif" }
                }
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-sm">{CATEGORY_ICONS[cat]}</span>
                <span>{cat === "FAMOUS" ? "FAMOUS" : cat}</span>
              </motion.button>
            ))}
          </div>

          {/* Inline search */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-white/10 ml-2 shrink-0 w-56 focus-within:border-[#00F0FF]/40 focus-within:shadow-[0_0_15px_#00F0FF15] transition-all">
            <Search className="w-3.5 h-3.5 text-[#00F0FF]/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="bg-transparent border-none outline-none text-xs text-white placeholder:text-white/25 w-full"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            />
          </div>
        </div>

        {/* Chemical cards — horizontal scroll */}
        <div className="flex items-end gap-4 px-6 py-3 overflow-x-auto scrollbar-thin" style={{ minHeight: 110 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory + searchQuery}
              className="flex items-end gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {categoryChemicals.length > 0 ? (
                categoryChemicals.map((chem) => (
                  <ChemicalCard key={chem.id} chemical={chem} onAdd={handleAddChemical} />
                ))
              ) : (
                <div className="text-xs text-muted-foreground/40 italic px-4 py-6">
                  No chemicals match "{searchQuery}" in {activeCategory}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>


    </motion.div>
  );
}
