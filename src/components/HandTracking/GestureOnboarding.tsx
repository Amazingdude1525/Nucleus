import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Gesture card data ──────────────────────────────────────────────────────

interface GestureCard {
  title: string;
  description: string;
  emoji: string;
  animationClass: string;
}

const GESTURE_CARDS: GestureCard[] = [
  {
    title: "Point to Move",
    description: "Raise your index finger to move the cursor across the screen",
    emoji: "☝️",
    animationClass: "gesture-anim-point",
  },
  {
    title: "Pinch to Click",
    description: "Bring thumb and index finger together to click anything",
    emoji: "🤏",
    animationClass: "gesture-anim-pinch",
  },
  {
    title: "Zoom In & Out",
    description: "✌️ Peace sign to zoom in • ✊ Fist to zoom out on 3D viewers",
    emoji: "✌️",
    animationClass: "gesture-anim-peace",
  },
  {
    title: "Open Palm to Pause",
    description: "Show open palm to pause hand control temporarily",
    emoji: "🖐️",
    animationClass: "gesture-anim-palm",
  },
];

// ─── Props ───────────────────────────────────────────────────────────────────

interface GestureOnboardingProps {
  visible: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onDontShowAgain: (checked: boolean) => void;
}

/**
 * Gesture onboarding modal — teaches the user the 4 core gestures
 * before activating the camera. Auto-advances every 2.5s.
 */
export default function GestureOnboarding({
  visible,
  onComplete,
  onSkip,
  onDontShowAgain,
}: GestureOnboardingProps) {
  const [activeCard, setActiveCard] = useState(0);
  const [dontShow, setDontShow] = useState(false);

  // Auto-advance every 2.5s
  useEffect(() => {
    if (!visible) {
      setActiveCard(0);
      return;
    }

    const timer = setInterval(() => {
      setActiveCard((prev) => {
        if (prev < GESTURE_CARDS.length - 1) return prev + 1;
        return prev; // Stay on last card
      });
    }, 2500);

    return () => clearInterval(timer);
  }, [visible]);

  const handleNext = useCallback(() => {
    if (activeCard < GESTURE_CARDS.length - 1) {
      setActiveCard((prev) => prev + 1);
    }
  }, [activeCard]);

  const handleDontShow = useCallback(
    (checked: boolean) => {
      setDontShow(checked);
      onDontShowAgain(checked);
    },
    [onDontShowAgain]
  );

  const isLastCard = activeCard === GESTURE_CARDS.length - 1;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />

          {/* Modal card */}
          <motion.div
            className="relative z-10 w-full max-w-md mx-4 rounded-3xl overflow-hidden"
            style={{
              background: "linear-gradient(145deg, rgba(10,12,20,0.98), rgba(6,8,16,0.98))",
              border: "1px solid rgba(0,229,255,0.15)",
              boxShadow:
                "0 0 80px rgba(0,229,255,0.08), 0 0 0 1px rgba(255,255,255,0.03), 0 40px 80px rgba(0,0,0,0.6)",
            }}
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  className="text-4xl mb-3"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  🤚
                </motion.div>
                <h2
                  className="text-xl font-bold text-white mb-1"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                >
                  Before we begin...
                </h2>
                <p className="text-xs text-white/40" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Learn these {GESTURE_CARDS.length} gestures to control Nucleus hands-free
                </p>
              </div>

              {/* Progress dots */}
              <div className="flex justify-center gap-2 mb-6">
                {GESTURE_CARDS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveCard(i)}
                    className="transition-all duration-300"
                    style={{
                      width: i === activeCard ? 24 : 8,
                      height: 8,
                      borderRadius: 4,
                      background:
                        i === activeCard
                          ? "linear-gradient(90deg, #00E5FF, #006EFF)"
                          : i < activeCard
                          ? "rgba(0,229,255,0.3)"
                          : "rgba(255,255,255,0.1)",
                    }}
                  />
                ))}
              </div>

              {/* Gesture card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCard}
                  className="rounded-2xl p-6 text-center"
                  style={{
                    background: "rgba(0,229,255,0.04)",
                    border: "1px solid rgba(0,229,255,0.1)",
                  }}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* Animated gesture icon */}
                  <div className="relative w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                    <motion.div
                      className="text-5xl"
                      animate={{
                        scale: [1, 1.15, 1],
                        rotate: activeCard === 0 ? [0, 5, -5, 0] : 0,
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      {GESTURE_CARDS[activeCard].emoji}
                    </motion.div>

                    {/* Ripple ring for pinch */}
                    {activeCard === 1 && (
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-[#00E5FF]/40"
                        animate={{
                          scale: [1, 1.8, 2.2],
                          opacity: [0.6, 0.2, 0],
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}

                    {/* Gentle pulse for palm */}
                    {activeCard === 3 && (
                      <motion.div
                        className="absolute inset-2 rounded-full"
                        style={{ background: "rgba(0,229,255,0.08)" }}
                        animate={{
                          scale: [1, 1.15, 1],
                          opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </div>

                  <h3
                    className="text-base font-bold text-white mb-2"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {GESTURE_CARDS[activeCard].title}
                  </h3>
                  <p className="text-xs text-white/50 leading-relaxed">
                    {GESTURE_CARDS[activeCard].description}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Actions */}
              <div className="mt-6 flex flex-col items-center gap-3">
                {isLastCard ? (
                  <motion.button
                    onClick={onComplete}
                    className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wider uppercase"
                    style={{
                      background: "linear-gradient(135deg, #00E5FF, #006EFF)",
                      color: "#fff",
                      boxShadow: "0 0 30px rgba(0,229,255,0.3)",
                      fontFamily: "'Orbitron', sans-serif",
                    }}
                    whileHover={{ scale: 1.02, boxShadow: "0 0 50px rgba(0,229,255,0.5)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Got it — Activate Camera
                  </motion.button>
                ) : (
                  <motion.button
                    onClick={handleNext}
                    className="w-full py-3 rounded-xl font-semibold text-sm"
                    style={{
                      background: "rgba(0,229,255,0.1)",
                      border: "1px solid rgba(0,229,255,0.2)",
                      color: "#00E5FF",
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                    whileHover={{ background: "rgba(0,229,255,0.15)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Next →
                  </motion.button>
                )}

                <button
                  onClick={onSkip}
                  className="text-xs text-white/30 hover:text-white/60 transition-colors"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Skip Tutorial
                </button>

                {/* Don't show again */}
                <label className="flex items-center gap-2 mt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dontShow}
                    onChange={(e) => handleDontShow(e.target.checked)}
                    className="rounded accent-[#00E5FF] w-3.5 h-3.5"
                  />
                  <span className="text-[10px] text-white/25">Don't show again</span>
                </label>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
