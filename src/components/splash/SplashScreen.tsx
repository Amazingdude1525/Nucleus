import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ParticleField from "./ParticleField";

const QUOTE =
  "Computational chemistry is the bridge between the visible world and the invisible atom.";

const CHEM_SYMBOLS = ["⬡", "α", "β", "e⁻", "Δ", "λ", "σ", "π", "∞", "⬡", "φ", "Ω"];

/** Floating chemistry symbol background */
function FloatingSymbols() {
  const symbols = useMemo(() => {
    return Array.from({ length: 36 }, (_, i) => ({
      id: i,
      char: CHEM_SYMBOLS[i % CHEM_SYMBOLS.length],
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 16 + Math.random() * 32,
      duration: 18 + Math.random() * 30,
      delay: Math.random() * 10,
      drift: (Math.random() - 0.5) * 50,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      {symbols.map((s) => (
        <motion.span
          key={s.id}
          className="absolute select-none"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            fontSize: `${s.size}px`,
            color: "hsl(185 100% 50%)",
            opacity: 0,
          }}
          animate={{
            y: [0, -80, -160, -80, 0],
            x: [0, s.drift * 0.5, s.drift, s.drift * 0.5, 0],
            opacity: [0, 0.06, 0.12, 0.06, 0],
            rotate: [0, 15, -10, 5, 0],
          }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {s.char}
        </motion.span>
      ))}
    </div>
  );
}

/** Interactive dot grid background */
function DotGridBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none z-[0]">
      <div className="absolute inset-0 dot-grid-bg opacity-60" />
      {/* Radial gradient overlay to fade edges */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, #030303 75%)",
        }}
      />
    </div>
  );
}

/** Typing effect helper — char-by-char terminal style */
const TypewriterText = ({ text, delay = 0, speed = 0.04, onComplete }: { text: string, delay?: number, speed?: number, onComplete?: () => void }) => {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  
  useEffect(() => {
    let i = 0;
    let interval: any;
    const t = setTimeout(() => {
      interval = setInterval(() => {
        setDisplayed(text.substring(0, i + 1));
        i++;
        if (i === text.length) {
          clearInterval(interval);
          setDone(true);
          onComplete?.();
        }
      }, speed * 1000);
    }, delay * 1000);
    return () => {
      clearTimeout(t);
      if (interval) clearInterval(interval);
    };
  }, [text, delay, speed]);
  
  return (
    <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      {displayed}
      {!done && (
        <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }}>_</motion.span>
      )}
    </span>
  );
};

// Easter egg name mappings
const EASTER_EGGS: Record<string, string> = {
  "professorx": "Cerebro has nothing on this.",
  "professor x": "Cerebro has nothing on this.",
  "ironman": "JARVIS is jealous.",
  "iron man": "JARVIS is jealous.",
  "tony stark": "JARVIS is jealous.",
  "thor": "Even Asgard doesn't have this.",
  "hulk": "Big brain energy only here.",
  "bruce banner": "Big brain energy only here.",
  "spiderman": "With great power comes great chemistry.",
  "spider man": "With great power comes great chemistry.",
  "peter parker": "With great power comes great chemistry.",
  "blackwidow": "Stealth mode: activated.",
  "black widow": "Stealth mode: activated.",
  "natasha": "Stealth mode: activated.",
  "captainamerica": "70 years of sleep, time to catch up.",
  "captain america": "70 years of sleep, time to catch up.",
  "steve rogers": "70 years of sleep, time to catch up.",
  "batman": "No cape needed here.",
  "bruce wayne": "No cape needed here.",
  "superman": "Even kryptonite can't stop this.",
  "clark kent": "Even kryptonite can't stop this.",
  "sherlock": "Elementary, dear Watson.",
  "einstein": "Finally, a worthy successor.",
  "newton": "No apples were harmed.",
  "curie": "Radioactively brilliant. Welcome.",
  "marie curie": "Radioactively brilliant. Welcome.",
  "heisenberg": "We know exactly where you are.",
  "schrodinger": "You're both here and not here. Welcome.",
};

function getSubtitle(name: string): string {
  const lower = name.toLowerCase().trim();
  for (const [key, value] of Object.entries(EASTER_EGGS)) {
    if (lower === key || lower.includes(key)) {
      return value;
    }
  }
  return "Let's dive in →";
}

/** Shared radial gradient background — #060709 with three radial gradients */
function TransitionBackground() {
  return (
    <div className="absolute inset-0" style={{ background: "#060709" }}>
      <div className="absolute inset-0" style={{
        background: `
          radial-gradient(ellipse 80% 60% at 20% 40%, rgba(0,229,255,0.06) 0%, transparent 70%),
          radial-gradient(ellipse 60% 80% at 80% 30%, rgba(99,102,241,0.04) 0%, transparent 70%),
          radial-gradient(ellipse 70% 50% at 50% 80%, rgba(245,158,11,0.03) 0%, transparent 70%)
        `
      }} />
    </div>
  );
}

/** Full screen transition moment before dashboard */
function TransitionMoment({ name, onFinish }: { name: string, onFinish: () => void }) {
  const subtitle = getSubtitle(name);
  const typingText = "Initializing NUCLEUS_X...";
  const typingSpeed = 0.04; // 40ms per char
  const typingDuration = typingText.length * typingSpeed; // ~0.92s
  
  const [showExit, setShowExit] = useState(false);
  const [typingDone, setTypingDone] = useState(false);
  
  // Timeline:
  // 0.0s: "Hi, [Name]." fades in (0.5s duration, translateY 14->0)
  // 0.3s: subtitle fades in
  // 1.5s total from start: typing begins (so delay from mount = ~0.8s after subtitle shows)
  // After typing completes (~1.5 + typingDuration = ~2.4s): 0.4s pause
  // Then exit animation (0.3s fade out) then route
  
  // Typing starts at 1.5s from mount
  const typingStartDelay = 1.5;
  
  const handleTypingComplete = useCallback(() => {
    setTypingDone(true);
    // 0.4s pause after typing completes, then start exit
    setTimeout(() => {
      setShowExit(true);
    }, 400);
  }, []);
  
  useEffect(() => {
    if (showExit) {
      // 0.3s for exit animation, then route
      const t = setTimeout(onFinish, 350);
      return () => clearTimeout(t);
    }
  }, [showExit, onFinish]);

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
      animate={showExit ? { opacity: 0 } : { opacity: 1 }}
      transition={showExit ? { duration: 0.3, ease: "easeIn" } : { duration: 0.1 }}
    >
      <TransitionBackground />
      
      <div className="relative z-10 flex flex-col items-center text-center space-y-4">
        {/* Line 1: "Hi, [Name]." */}
        <motion.h1 
          className="text-4xl md:text-6xl font-bold text-white"
          style={{ 
            fontFamily: "'Orbitron', sans-serif",
            textShadow: "0 0 28px rgba(0,229,255,0.5)" 
          }}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          Hi, {name}.
        </motion.h1>
        
        {/* Line 2: Subtitle (0.3s after first line) */}
        <motion.p 
          className="text-lg md:text-xl"
          style={{ 
            fontFamily: "'Space Grotesk', sans-serif",
            color: "rgba(255,255,255,0.6)" 
          }}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
        >
          {subtitle}
        </motion.p>

        {/* Line 3: Terminal typing "Initializing NUCLEUS_X..." */}
        <motion.div 
          className="text-sm md:text-base pt-8"
          style={{ color: "#00E5FF" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: typingStartDelay - 0.2 }}
        >
          <TypewriterText 
            text={typingText} 
            delay={typingStartDelay} 
            speed={typingSpeed} 
            onComplete={handleTypingComplete}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

/** Name entry overlay after user clicks Enter */
function NameEntry({ onComplete }: { onComplete: (name: string) => void }) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) {
      localStorage.setItem("nucleus-user-name", trimmed);
    }
    onComplete(trimmed || "Photon");
  };

  const handleSkip = () => {
    onComplete("Photon");
  };

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Dark backdrop */}
      <div className="absolute inset-0 bg-[#030303]/95 backdrop-blur-xl" />

      <motion.div
        className="relative z-10 flex flex-col items-center gap-8 px-8"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.7 }}
      >
        {/* Glow orb */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{
            background: "radial-gradient(circle, rgba(0,240,255,0.15) 0%, transparent 70%)",
            boxShadow: "0 0 60px rgba(0,240,255,0.2), 0 0 120px rgba(0,240,255,0.05)",
          }}
        >
          <span className="text-3xl">⚗️</span>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-[0.15em] text-primary text-glow-cyan">
            Welcome to NUCLEUS
          </h2>
          <p className="text-sm text-muted-foreground/60 max-w-sm">
            Enter your name to personalize your chemistry lab experience
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 w-full max-w-xs">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name..."
            autoFocus
            className="w-full px-5 py-3.5 rounded-xl text-center text-lg font-medium tracking-wide bg-white/[0.03] border border-white/10 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40 transition-all"
            style={{
              boxShadow: "0 0 30px rgba(0,240,255,0.05), inset 0 0 20px rgba(0,0,0,0.3)",
            }}
          />

          <motion.button
            type="submit"
            className="w-full px-6 py-3 rounded-xl border text-primary text-sm tracking-[0.2em] uppercase font-medium transition-all relative overflow-hidden group"
            style={{
              background: "rgba(0, 240, 255, 0.05)",
              borderColor: "rgba(0, 240, 255, 0.25)",
              boxShadow: "0 0 20px rgba(0,240,255,0.1)",
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"
              style={{
                boxShadow: "0 0 30px hsl(185 100% 50% / 0.3), inset 0 0 30px hsl(185 100% 50% / 0.05)",
              }}
            />
            <span className="relative z-10">Enter Lab</span>
          </motion.button>

          <button
            type="button"
            onClick={handleSkip}
            className="text-xs text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors tracking-wider"
          >
            Skip for now →
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function SplashScreen() {
  const [phase, setPhase] = useState<"splash" | "name" | "transition" | "exit">("splash");
  const [userName, setUserName] = useState("Photon");
  const navigate = useNavigate();

  const handleEnter = () => {
    setPhase("name");
  };

  const handleNameComplete = (name: string) => {
    localStorage.setItem("nucleus-user-name", name);
    setUserName(name);
    setPhase("transition");
  };

  return (
    <AnimatePresence>
      {phase === "splash" && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[100] flex flex-col bg-[#030303] overflow-hidden"
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* Dot grid background */}
          <DotGridBackground />

          {/* Floating chemistry symbols */}
          <FloatingSymbols />

          {/* Realistic Hero Image Layer */}
          <div className="absolute inset-0 z-[1] overflow-hidden">
            <motion.img 
              src="/splash_lab_hero_1776016562414.png" 
              alt="Lab Visualization" 
              className="w-full h-full object-cover scale-110"
              initial={{ opacity: 0, scale: 1.2 }}
              animate={{ opacity: 0.45, scale: 1.05 }}
              transition={{ duration: 3, ease: "easeOut" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303] opacity-80" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#030303_90%)]" />
          </div>

          {/* Three.js particle text — fixed height, centered vertically */}
          <div className="relative z-[2] flex-1 flex items-center justify-center pointer-events-none" style={{ maxHeight: "55vh" }}>
            <div className="absolute inset-0">
               <ParticleField />
            </div>
          </div>

          {/* Content section — pinned to bottom, never overlaps with particles */}
          <div className="relative z-10 flex flex-col items-center gap-6 px-6 pb-12 pt-2 shrink-0">
            {/* Tagline */}
            <motion.p
              className="text-xs md:text-sm tracking-[0.5em] uppercase text-muted-foreground/70 font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              Computational Chemistry Ecosystem
            </motion.p>

            {/* Quote */}
            <motion.blockquote
              className="text-sm md:text-base italic text-muted-foreground/50 leading-relaxed max-w-xl text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6, duration: 1 }}
            >
              <span className="text-primary/40">"</span>
              {QUOTE}
              <span className="text-primary/40">"</span>
            </motion.blockquote>

            {/* Glowing divider */}
            <motion.div
              className="w-32 h-px relative"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 2.2, duration: 0.8, ease: "easeOut" }}
            >
              <div className="absolute inset-0 nucleus-gradient opacity-80" />
              <div
                className="absolute inset-0"
                style={{
                  boxShadow:
                    "0 0 15px hsl(185 100% 50% / 0.5), 0 0 40px hsl(185 100% 50% / 0.2)",
                }}
              />
            </motion.div>

            {/* Enter button */}
            <motion.button
              onClick={handleEnter}
              className="px-10 py-3.5 rounded-xl border text-primary text-sm tracking-[0.25em] uppercase font-medium transition-all duration-300 relative overflow-hidden group"
              style={{
                background: "rgba(0, 240, 255, 0.03)",
                borderColor: "rgba(0, 240, 255, 0.2)",
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.6, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"
                style={{
                  boxShadow:
                    "0 0 20px hsl(185 100% 50% / 0.3), 0 0 60px hsl(185 100% 50% / 0.1), inset 0 0 30px hsl(185 100% 50% / 0.05)",
                }}
              />
              <span className="relative z-10">Enter the Ecosystem</span>
            </motion.button>
          </div>

          {/* Bottom gradient fade */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#030303] to-transparent z-[5] pointer-events-none" />
        </motion.div>
      )}

      {phase === "name" && (
        <NameEntry key="name-entry" onComplete={handleNameComplete} />
      )}

      {phase === "transition" && (
        <TransitionMoment key="transition" name={userName} onFinish={() => {
          setPhase("exit");
          setTimeout(() => navigate("/dashboard"), 300);
        }} />
      )}

      {phase === "exit" && (
        <motion.div
          key="exit-fade"
          className="fixed inset-0 z-50 bg-[#030303]"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      )}
    </AnimatePresence>
  );
}
