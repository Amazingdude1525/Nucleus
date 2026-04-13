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
 * Uses pure CSS transform for GPU-accelerated movement (no framer-motion)
 * to avoid transform property conflicts.
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
  const visible = handDetected;
  const size = isPinching ? 32 : 20;

  // Color logic
  const dotColor = isPaused
    ? "rgba(255,200,0,0.9)"
    : isPinching
    ? "rgba(0,229,255,1)"
    : "rgba(0,229,255,0.9)";

  const glowShadow = isPinching
    ? "0 0 20px rgba(0,229,255,0.8), 0 0 40px rgba(0,229,255,0.4), 0 0 60px rgba(0,229,255,0.15)"
    : isPaused
    ? "0 0 14px rgba(255,200,0,0.5), 0 0 30px rgba(255,200,0,0.2)"
    : "0 0 14px rgba(0,229,255,0.6), 0 0 30px rgba(0,229,255,0.2)";

  return (
    <div
      className="fixed top-0 left-0 z-[9999] pointer-events-none"
      style={{
        transform: `translate3d(${cursorPosition.x}px, ${cursorPosition.y}px, 0) translate(-50%, -50%)`,
        transition: "transform 40ms linear, opacity 0.3s ease",
        willChange: "transform",
        opacity: visible ? 1 : 0,
      }}
    >
      {/* Laser halo — soft outer glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: size + 24,
          height: size + 24,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: isPaused
            ? "radial-gradient(circle, rgba(255,200,0,0.08) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(0,229,255,0.08) 0%, transparent 70%)",
          transition: "width 200ms ease, height 200ms ease",
        }}
      />

      {/* Outer ring container */}
      <div
        className="relative flex items-center justify-center"
        style={{
          width: size,
          height: size,
          transition: "width 150ms ease-out, height 150ms ease-out",
        }}
      >
        {/* Main cursor dot */}
        <div
          className="rounded-full absolute inset-0"
          style={{
            background: dotColor,
            boxShadow: glowShadow,
            filter: "blur(0.5px)",
            animation: isPinching ? "nucleus-cursor-pulse 0.2s infinite alternate" : "none",
            transition: "background 0.15s ease, box-shadow 0.15s ease",
          }}
        />

        {/* Pinch ripple effect — CSS keyframe */}
        {isPinching && (
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: "2px solid #00E5FF",
              animation: "nucleus-cursor-ripple 0.5s ease-out forwards",
            }}
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
      </div>

      {/* Subtle trailing ring for point gesture */}
      {isPoint && !isPinching && (
        <div
          className="absolute rounded-full border border-[#00E5FF]/20"
          style={{
            width: 32,
            height: 32,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            animation: "nucleus-cursor-ring 2s infinite ease-in-out",
          }}
        />
      )}
    </div>
  );
}
