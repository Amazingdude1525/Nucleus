import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useHandTracking, type GestureType, type UseHandTrackingReturn } from "@/hooks/useHandTracking";
import GestureCursor from "./GestureCursor";
import CameraPreview from "./CameraPreview";
import GestureOnboarding from "./GestureOnboarding";
import GestureIndicator from "./GestureIndicator";

// ─── Context type ────────────────────────────────────────────────────────────

interface HandTrackingContextValue {
  isActive: boolean;
  isLoading: boolean;
  gesture: GestureType;
  cursorPosition: { x: number; y: number };
  isPinching: boolean;
  confidence: number;
  handDetected: boolean;
  stream: MediaStream | null;
  activate: () => Promise<void>;
  deactivate: () => void;
  showOnboarding: () => void;
}

const HandTrackingContext = createContext<HandTrackingContextValue | null>(null);

/**
 * Hook to access hand tracking state from any component.
 * Must be used within a HandTrackingProvider.
 */
export function useHandTrackingContext(): HandTrackingContextValue {
  const ctx = useContext(HandTrackingContext);
  if (!ctx) {
    throw new Error("useHandTrackingContext must be used within HandTrackingProvider");
  }
  return ctx;
}

// ─── Provider ────────────────────────────────────────────────────────────────

interface HandTrackingProviderProps {
  children: React.ReactNode;
}

/**
 * Wraps the entire app to provide hand tracking context.
 * Renders GestureCursor and CameraPreview as portals (always mounted, shown only when active).
 * Listens for Alt+H keyboard shortcut to toggle hand tracking.
 */
export default function HandTrackingProvider({ children }: HandTrackingProviderProps) {
  const tracking: UseHandTrackingReturn = useHandTracking();
  const [onboardingVisible, setOnboardingVisible] = useState(false);

  // Check localStorage for "don't show again" preference
  const shouldSkipOnboarding = useCallback(() => {
    return localStorage.getItem("nucleus-ht-skip-onboarding") === "true";
  }, []);

  /** Show the gesture onboarding modal */
  const showOnboarding = useCallback(() => {
    if (shouldSkipOnboarding()) {
      // Skip straight to activation
      tracking.activate();
    } else {
      setOnboardingVisible(true);
    }
  }, [shouldSkipOnboarding, tracking]);

  /** Handle onboarding completion — activate camera */
  const handleOnboardingComplete = useCallback(async () => {
    setOnboardingVisible(false);
    await tracking.activate();
  }, [tracking]);

  /** Handle onboarding skip */
  const handleOnboardingSkip = useCallback(async () => {
    setOnboardingVisible(false);
    await tracking.activate();
  }, [tracking]);

  /** Handle "don't show again" */
  const handleDontShowAgain = useCallback((checked: boolean) => {
    if (checked) {
      localStorage.setItem("nucleus-ht-skip-onboarding", "true");
    } else {
      localStorage.removeItem("nucleus-ht-skip-onboarding");
    }
  }, []);

  // ── Alt+H keyboard shortcut ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === "h" || e.key === "H")) {
        e.preventDefault();
        if (tracking.isActive) {
          tracking.deactivate();
        } else {
          showOnboarding();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [tracking.isActive, tracking.deactivate, showOnboarding]);

  const contextValue: HandTrackingContextValue = {
    isActive: tracking.isActive,
    isLoading: tracking.isLoading,
    gesture: tracking.gesture,
    cursorPosition: tracking.cursorPosition,
    isPinching: tracking.isPinching,
    confidence: tracking.confidence,
    handDetected: tracking.handDetected,
    stream: tracking.stream,
    activate: tracking.activate,
    deactivate: tracking.deactivate,
    showOnboarding,
  };

  return (
    <HandTrackingContext.Provider value={contextValue}>
      {children}

      {/* Portal-rendered overlays */}
      {typeof document !== "undefined" &&
        createPortal(
          <>
            {/* Gesture Cursor — always mounted, visibility controlled internally */}
            <GestureCursor
              isActive={tracking.isActive}
              gesture={tracking.gesture}
              cursorPosition={tracking.cursorPosition}
              isPinching={tracking.isPinching}
              handDetected={tracking.handDetected}
            />

            {/* Small toast showing current gesture */}
            <GestureIndicator
              isActive={tracking.isActive}
              gesture={tracking.gesture}
              handDetected={tracking.handDetected}
              confidence={tracking.confidence}
            />

            {/* Camera Preview Panel */}
            <CameraPreview
              isActive={tracking.isActive}
              videoRef={tracking.videoRef}
              stream={tracking.stream}
              gesture={tracking.gesture}
              confidence={tracking.confidence}
              handDetected={tracking.handDetected}
              onDeactivate={tracking.deactivate}
              onReopenTutorial={() => setOnboardingVisible(true)}
            />

            {/* Onboarding Modal */}
            <GestureOnboarding
              visible={onboardingVisible}
              onComplete={handleOnboardingComplete}
              onSkip={handleOnboardingSkip}
              onDontShowAgain={handleDontShowAgain}
            />
          </>,
          document.body
        )}
    </HandTrackingContext.Provider>
  );
}
