import { motion, AnimatePresence } from "framer-motion";
import { type GestureType } from "@/hooks/useHandTracking";

// ─── Props ───────────────────────────────────────────────────────────────────

interface GestureCursorProps {
  isActive: boolean;
  gesture: GestureType;
  cursorPosition: { x: number; y: number };
  isPinching: boolean;
  handDetected: boolean;
}

/**
 * Custom floating cursor dot that follows hand position.
 * Rendered via React portal at document.body level with z-index 9999.
 * Uses CSS transform for movement (no layout reflow).
 * pointer-events: none — does not interfere with normal mouse cursor.
 */
export default function GestureCursor({
  isActive,
  gesture,
  cursorPosition,
  isPinching,
  handDetected,
}: GestureCursorProps) {
  if (!isActive) return null;

  const isPaused = gesture === "open_palm";
  const isPoint = gesture === "point";

  return (
    <AnimatePresence>
      {handDetected ? (
        <motion.div
          key="gesture-cursor"
          className="fixed top-0 left-0 z-[9999] pointer-events-none"
          style={{
            transform: `translate3d(${cursorPosition.x}px, ${cursorPosition.y}px, 0) translate(-50%, -50%)`,
            transition: "transform 40ms linear",
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0, transition: { duration: 0.5 } }}
        >
          {/* Outer ring */}
          <motion.div
            className="relative flex items-center justify-center"
            animate={{
              width: isPinching ? 32 : 20,
              height: isPinching ? 32 : 20,
            }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            {/* Main cursor dot */}
            <motion.div
              className="rounded-full absolute inset-0"
              style={{
                background: isPaused
                  ? "rgba(255,200,0,0.85)"
                  : isPinching
                  ? "rgba(0,229,255,1)"
                  : "rgba(0,229,255,0.85)",
                boxShadow: isPinching
                  ? "0 0 20px rgba(0,229,255,0.7), 0 0 40px rgba(0,229,255,0.3)"
                  : "0 0 12px rgba(0,229,255,0.4)",
                filter: "blur(0.5px)",
              }}
              animate={{
                scale: isPinching ? [1, 1.1, 1] : 1,
              }}
              transition={{
                duration: 0.2,
                repeat: isPinching ? Infinity : 0,
                repeatType: "reverse",
              }}
            />

            {/* Pinch ripple effect */}
            {isPinching && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-[#00E5FF]"
                initial={{ scale: 1, opacity: 1 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                key={`ripple-${Date.now()}`}
              />
            )}

            {/* Pause icon overlay */}
            {isPaused && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex gap-[2px]">
                  <div className="w-[2px] h-[8px] bg-black/60 rounded-full" />
                  <div className="w-[2px] h-[8px] bg-black/60 rounded-full" />
                </div>
              </div>
            )}
          </motion.div>

          {/* Subtle trailing ring for point gesture */}
          {isPoint && !isPinching && (
            <motion.div
              className="absolute rounded-full border border-[#00E5FF]/20"
              style={{
                width: 32,
                height: 32,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.1, 0.3],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </motion.div>
      ) : isActive ? (
        // Hand not detected — fading cursor
        <motion.div
          key="cursor-fading"
          className="fixed top-0 left-0 z-[9999] pointer-events-none"
          style={{
            transform: `translate3d(${cursorPosition.x}px, ${cursorPosition.y}px, 0) translate(-50%, -50%)`,
          }}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="w-5 h-5 rounded-full"
            style={{
              background: "rgba(0,229,255,0.3)",
              boxShadow: "0 0 8px rgba(0,229,255,0.2)",
            }}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
