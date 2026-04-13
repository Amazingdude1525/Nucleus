import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Pause, Play, Maximize2, Minimize2, BookOpen } from "lucide-react";
import { type GestureType } from "@/hooks/useHandTracking";

// ─── Gesture display config ─────────────────────────────────────────────────

const GESTURE_DISPLAY: Record<GestureType, { emoji: string; label: string }> = {
  point: { emoji: "☝️", label: "Point" },
  pinch: { emoji: "🤏", label: "Click" },
  fist: { emoji: "✊", label: "Zoom Out" },
  peace: { emoji: "✌️", label: "Zoom In" },
  open_palm: { emoji: "🖐️", label: "Pause" },
  none: { emoji: "❌", label: "None" },
};

// ─── Props ───────────────────────────────────────────────────────────────────

interface CameraPreviewProps {
  isActive: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  stream: MediaStream | null;
  gesture: GestureType;
  confidence: number;
  handDetected: boolean;
  onDeactivate: () => void;
  onReopenTutorial: () => void;
}

/**
 * Floating, draggable camera preview panel showing the live feed.
 * Features: drag, resize toggle, status indicator, gesture badge, and controls.
 */
export default function CameraPreview({
  isActive,
  videoRef,
  stream,
  gesture,
  confidence,
  handDetected,
  onDeactivate,
  onReopenTutorial,
}: CameraPreviewProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: -1, y: -1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isLarge, setIsLarge] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  const width = isLarge ? 320 : 200;
  const height = isLarge ? 240 : 150;

  // ── Smart auto-placement on first activate ──
  useEffect(() => {
    if (isActive && !hasInitialized) {
      // Restore from localStorage or auto-place
      const saved = localStorage.getItem("nucleus-ht-camera-pos");
      if (saved) {
        try {
          const { x, y } = JSON.parse(saved);
          setPosition({ x: Math.min(x, window.innerWidth - width), y: Math.min(y, window.innerHeight - height) });
          setHasInitialized(true);
          return;
        } catch { /* fall through to auto-placement */ }
      }

      // Auto-place after DOM settles
      setTimeout(() => {
        // Default: bottom-right corner with padding
        const safeX = window.innerWidth - width - 24;
        const safeY = window.innerHeight - height - 24;
        setPosition({ x: safeX, y: safeY });
        setHasInitialized(true);
      }, 300);
    }

    if (!isActive) {
      setHasInitialized(false);
    }
  }, [isActive, hasInitialized, width, height]);

  // ── Save position to localStorage ──
  useEffect(() => {
    if (position.x >= 0 && position.y >= 0 && hasInitialized) {
      localStorage.setItem("nucleus-ht-camera-pos", JSON.stringify(position));
    }
  }, [position, hasInitialized]);

  // ── Mouse drag handlers ──
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  }, [position]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = Math.max(0, Math.min(window.innerWidth - width, e.clientX - dragOffset.x));
      const newY = Math.max(0, Math.min(window.innerHeight - height, e.clientY - dragOffset.y));
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset, width, height]);

  // ── Touch drag handlers (mobile) ──
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragOffset({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    });
  }, [position]);

  useEffect(() => {
    if (!isDragging) return;

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const newX = Math.max(0, Math.min(window.innerWidth - width, touch.clientX - dragOffset.x));
      const newY = Math.max(0, Math.min(window.innerHeight - height, touch.clientY - dragOffset.y));
      setPosition({ x: newX, y: newY });
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, dragOffset, width, height]);

  // ── Mirror video feed into internal canvas-like display ──
  // hasInitialized is needed because the video element doesn't exist in the DOM
  // until position is set (returns null when position.x < 0).
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (isActive && internalVideoRef.current && stream) {
      if (internalVideoRef.current.srcObject !== stream) {
        internalVideoRef.current.srcObject = stream;
        internalVideoRef.current.play().catch(() => {});
      }
    }
  }, [isActive, stream, hasInitialized]);

  // Status dot color
  const statusColor = handDetected ? "#22cc44" : isActive ? "#eab308" : "#ef4444";
  const statusLabel = handDetected ? "Tracking" : isActive ? "Searching..." : "Error";

  const gestureInfo = GESTURE_DISPLAY[gesture];

  if (!isActive || position.x < 0) return null;

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          ref={panelRef}
          className="fixed z-[9997] select-none"
          style={{
            left: position.x,
            top: position.y,
            width,
            height,
            cursor: isDragging ? "grabbing" : "grab",
          }}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{
            opacity: 1,
            scale: isDragging ? 1.05 : 1,
            y: 0,
          }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {/* Panel body */}
          <div
            className="w-full h-full rounded-xl overflow-hidden relative"
            style={{
              border: `2px solid ${handDetected ? "rgba(0,229,255,0.5)" : "rgba(255,255,255,0.1)"}`,
              boxShadow: handDetected
                ? "0 0 20px rgba(0,229,255,0.25), 0 8px 32px rgba(0,0,0,0.5)"
                : "0 8px 32px rgba(0,0,0,0.5)",
              background: "#000",
            }}
          >
            {/* Live video feed (mirrored) */}
            <video
              ref={internalVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: "scaleX(-1)" }}
            />

            {/* Paused overlay */}
            {isPaused && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
                <div className="text-white/60 text-xs font-mono tracking-widest uppercase">
                  PAUSED
                </div>
              </div>
            )}

            {/* Status indicator (top-left) */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10">
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  background: statusColor,
                  boxShadow: `0 0 6px ${statusColor}`,
                  animation: handDetected ? "none" : "pulse 1.5s infinite",
                }}
              />
              <span className="text-[8px] tracking-widest uppercase text-white/80 font-mono">
                {statusLabel}
              </span>
            </div>

            {/* Gesture badge (top-right) */}
            {handDetected && (
              <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10">
                <span className="text-xs">{gestureInfo.emoji}</span>
                <span className="text-[8px] tracking-wider uppercase text-white/80 font-mono">
                  {gestureInfo.label}
                </span>
              </div>
            )}

            {/* Confidence (bottom-left) */}
            {handDetected && (
              <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/60 border border-white/10">
                <span className="text-[8px] font-mono text-[#00E5FF]">
                  {Math.round(confidence * 100)}%
                </span>
              </div>
            )}

            {/* Controls (bottom-right) */}
            <div
              className="absolute bottom-2 right-2 flex items-center gap-1"
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              {/* Tutorial reopen */}
              <button
                onClick={onReopenTutorial}
                className="w-6 h-6 rounded-md bg-black/60 border border-white/10 flex items-center justify-center text-white/50 hover:text-white/90 hover:bg-white/10 transition-all"
                title="Reopen tutorial"
              >
                <BookOpen className="w-3 h-3" />
              </button>

              {/* Resize toggle */}
              <button
                onClick={() => setIsLarge(!isLarge)}
                className="w-6 h-6 rounded-md bg-black/60 border border-white/10 flex items-center justify-center text-white/50 hover:text-white/90 hover:bg-white/10 transition-all"
                title={isLarge ? "Minimize" : "Maximize"}
              >
                {isLarge ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
              </button>

              {/* Pause/Resume */}
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="w-6 h-6 rounded-md bg-black/60 border border-white/10 flex items-center justify-center text-white/50 hover:text-white/90 hover:bg-white/10 transition-all"
                title={isPaused ? "Resume" : "Pause"}
              >
                {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
              </button>

              {/* Close */}
              <button
                onClick={onDeactivate}
                className="w-6 h-6 rounded-md bg-red-500/20 border border-red-500/20 flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-500/30 transition-all"
                title="Deactivate hand tracking"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
