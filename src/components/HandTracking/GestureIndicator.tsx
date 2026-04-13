import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type GestureType } from "@/hooks/useHandTracking";

// ─── Display config ──────────────────────────────────────────────────────────

const GESTURE_INFO: Record<
  GestureType,
  { emoji: string; label: string; color: string }
> = {
  point: { emoji: "☝️", label: "Cursor", color: "#00E5FF" },
  pinch: { emoji: "🤏", label: "Click!", color: "#22cc88" },
  fist: { emoji: "✊", label: "Zoom Out", color: "#ff6644" },
  peace: { emoji: "✌️", label: "Zoom In", color: "#9966ff" },
  open_palm: { emoji: "🖐️", label: "Paused", color: "#eab308" },
  none: { emoji: "🔍", label: "Detecting...", color: "#666" },
};

// ─── Props ───────────────────────────────────────────────────────────────────

interface GestureIndicatorProps {
  isActive: boolean;
  gesture: GestureType;
  handDetected: boolean;
  confidence: number;
}

/**
 * Small toast-like indicator showing the currently detected gesture.
 * Positioned at the top-center of the viewport.
 * Auto-hides after initial activation tutorial.
 */
export default function GestureIndicator({
  isActive,
  gesture,
  handDetected,
  confidence,
}: GestureIndicatorProps) {
  const [showInitial, setShowInitial] = useState(false);
  const [lastGesture, setLastGesture] = useState<GestureType>("none");

  // Show initial toast for 6 seconds when hand tracking first activates
  useEffect(() => {
    if (isActive && handDetected) {
      setShowInitial(true);
      const timer = setTimeout(() => setShowInitial(false), 6000);
      return () => clearTimeout(timer);
    }
    if (!isActive) setShowInitial(false);
  }, [isActive, handDetected]);

  // Track gesture changes for brief flash
  useEffect(() => {
    if (gesture !== lastGesture && gesture !== "none" && gesture !== "point") {
      setLastGesture(gesture);
    }
  }, [gesture, lastGesture]);

  if (!isActive) return null;

  const info = GESTURE_INFO[gesture];
  const shouldShow = showInitial || (gesture !== "none" && gesture !== "point");

  return (
    <AnimatePresence>
      {shouldShow && handDetected && (
        <motion.div
          key={`indicator-${gesture}`}
          className="fixed top-20 left-1/2 z-[9998] pointer-events-none"
          style={{ transform: "translateX(-50%)" }}
          initial={{ opacity: 0, y: -15, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl backdrop-blur-xl"
            style={{
              background: "rgba(6,8,16,0.85)",
              border: `1px solid ${info.color}30`,
              boxShadow: `0 0 20px ${info.color}15, 0 8px 32px rgba(0,0,0,0.4)`,
            }}
          >
            <span className="text-lg">{info.emoji}</span>
            <div className="flex flex-col">
              <span
                className="text-xs font-bold"
                style={{ color: info.color, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {info.label}
              </span>
              {confidence > 0 && (
                <span className="text-[8px] text-white/30 font-mono">
                  {Math.round(confidence * 100)}% confidence
                </span>
              )}
            </div>

            {/* Color dot */}
            <div
              className="w-2 h-2 rounded-full ml-1"
              style={{
                background: info.color,
                boxShadow: `0 0 6px ${info.color}80`,
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
