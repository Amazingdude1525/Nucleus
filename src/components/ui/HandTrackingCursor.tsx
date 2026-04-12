import { motion, AnimatePresence } from "framer-motion";
import { Hand } from "lucide-react";
import { useState, useEffect } from "react";

interface HandTrackingCursorProps {
  enabled: boolean;
  isPinching: boolean;
  cursorX: number;
  cursorY: number;
}

export default function HandTrackingCursor({ enabled, isPinching, cursorX, cursorY }: HandTrackingCursorProps) {
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (enabled) {
      setShowTutorial(true);
      const timer = setTimeout(() => setShowTutorial(false), 8000);
      return () => clearTimeout(timer);
    } else {
      setShowTutorial(false);
    }
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[9998] pointer-events-none"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="glass px-6 py-4 rounded-2xl flex items-center gap-4 border border-[#00E5FF]/30 shadow-[0_0_30px_rgba(0,229,255,0.2)]">
              <div className="relative w-12 h-12 flex items-center justify-center">
                {/* Clean Hand Icon instead of the ugly SVG */}
                <Hand className="w-8 h-8 text-[#00E5FF]" />
                <motion.div
                  className="absolute w-12 h-12 rounded-full border-2 border-[#00E5FF]"
                  animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold font-orbitron text-white">Spatial Control Active</span>
                <span className="text-xs text-[#00E5FF] font-space mt-0.5">Pinch fingers to grab/click</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="fixed pointer-events-none z-[9999] flex items-center justify-center mix-blend-difference"
        style={{ left: cursorX, top: cursorY, x: "-50%", y: "-50%" }}
      >
        <div 
          className={`rounded-full transition-all duration-150 ease-out flex items-center justify-center ${
            isPinching 
              ? 'w-6 h-6 bg-[#00E5FF] shadow-[0_0_20px_#00E5FF]' 
              : 'w-10 h-10 border-2 border-white/80'
          }`}
        >
          {isPinching && <div className="w-2 h-2 rounded-full bg-white animate-ping" />}
        </div>
      </motion.div>
    </>
  );
}
