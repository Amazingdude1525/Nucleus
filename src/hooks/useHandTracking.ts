import { useEffect, useRef, useState, useCallback } from "react";
import { Hands, Results } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

interface HandTrackingState {
  enabled: boolean;
  isPinching: boolean;
  openness: number;
  rawCursorX: number;
  rawCursorY: number;
  cursorX: number;
  cursorY: number;
  cameraReady: boolean;
}

/**
 * Exponential moving average for smooth cursor tracking.
 * Lower alpha = smoother but more laggy. Higher = less smooth but responsive.
 * Applied ONLY to cursor position, NOT to pinch detection.
 */
const SMOOTHING_ALPHA = 0.35;

/**
 * Extra margin (in percent of viewport) to add beyond the hand's normalized
 * range so the cursor can comfortably reach edges.
 * We map the hand's [MARGIN, 1-MARGIN] range to the usable viewport.
 */
const HAND_MARGIN = 0.03; // 3% dead-zone trimmed from each side

/**
 * Navbar height in pixels — cursor cannot enter this zone.
 * Matches the h-14 (3.5rem = 56px) sticky navbar.
 */
const NAVBAR_HEIGHT = 56;

/**
 * Pinch detection thresholds with hysteresis to prevent flickering.
 * Distances are in screen-space pixels.
 */
const PINCH_GRAB_THRESHOLD = 40;    // Start pinch when thumb-index < 40px
const PINCH_RELEASE_THRESHOLD = 55; // Release pinch when thumb-index > 55px

export function useHandTracking(providedVideoRef?: React.RefObject<HTMLVideoElement>) {
  const [state, setState] = useState<HandTrackingState>({
    enabled: false,
    isPinching: false,
    openness: 0,
    rawCursorX: 0.5,
    rawCursorY: 0.5,
    cursorX: 0,
    cursorY: 0,
    cameraReady: false,
  });

  const fallbackVideoRef = useRef<HTMLVideoElement | null>(null);
  const videoRef = providedVideoRef || fallbackVideoRef;
  const handsRef = useRef<Hands | null>(null);
  const cameraRef = useRef<Camera | null>(null);

  // Smoothing refs for cursor position
  const smoothX = useRef(0);
  const smoothY = useRef(0);

  // Pinch state ref — current pinch state for hysteresis
  const isPinchingRef = useRef(false);

  // Trigger elements on pinch
  const [pinchClickEvent, setPinchClickEvent] = useState<{ x: number; y: number; timestamp: number } | null>(null);
  const wasPinching = useRef(false);

  const enableTracking = useCallback(() => {
    setState((s) => ({ ...s, enabled: true }));
  }, []);

  const disableTracking = useCallback(() => {
    setState((s) => ({ ...s, enabled: false, cameraReady: false }));
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }
  }, []);

  const onResults = useCallback((results: Results) => {
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      return;
    }

    // Use the first detected hand
    const landmarks = results.multiHandLandmarks[0];
    
    // Index finger tip (8)
    const indexTip = landmarks[8];
    // Thumb tip (4)
    const thumbTip = landmarks[4];

    // Calculate distance in screen-space pixels for pinch detection
    // Convert normalized coords to screen pixels first
    const thumbScreenX = (1 - thumbTip.x) * window.innerWidth;
    const thumbScreenY = thumbTip.y * window.innerHeight;
    const indexScreenX = (1 - indexTip.x) * window.innerWidth;
    const indexScreenY = indexTip.y * window.innerHeight;
    
    const dx = indexScreenX - thumbScreenX;
    const dy = indexScreenY - thumbScreenY;
    const distancePx = Math.sqrt(dx * dx + dy * dy);

    // Hysteresis-based pinch detection — NO smoothing applied, keep responsive
    let isPinchingNow = isPinchingRef.current;
    if (isPinchingRef.current) {
      // Currently pinching — release only when distance exceeds release threshold
      if (distancePx > PINCH_RELEASE_THRESHOLD) {
        isPinchingNow = false;
      }
    } else {
      // Not pinching — grab only when distance goes below grab threshold
      if (distancePx < PINCH_GRAB_THRESHOLD) {
        isPinchingNow = true;
      }
    }
    isPinchingRef.current = isPinchingNow;

    // Map normalized hand coordinates to viewport.
    // X → full width. Y → only the usable area BELOW the navbar.
    const remapAxis = (val: number, size: number, offset = 0): number => {
      const clamped = Math.max(HAND_MARGIN, Math.min(1 - HAND_MARGIN, val));
      return offset + ((clamped - HAND_MARGIN) / (1 - 2 * HAND_MARGIN)) * size;
    };

    // Calculate "Openness" (distance between Wrist[0] and Middle Finger Tip[12])
    const wrist = landmarks[0];
    const middleTip = landmarks[12];
    const distanceY = Math.sqrt(
      Math.pow(middleTip.x - wrist.x, 2) + 
      Math.pow(middleTip.y - wrist.y, 2)
    );
    let currentOpenness = (distanceY - 0.2) * 2.5; 
    currentOpenness = Math.max(0, Math.min(1, currentOpenness)); // Clamp 0 to 1

    const rawXNormalized = 1 - indexTip.x;
    const rawYNormalized = indexTip.y;

    // Note: X is inverted because of mirrored camera
    const rawX = remapAxis(rawXNormalized, window.innerWidth);
    // Y maps [0..1] → [NAVBAR_HEIGHT..viewportHeight], keeping cursor off the navbar
    const usableHeight = window.innerHeight - NAVBAR_HEIGHT;
    const rawY = remapAxis(rawYNormalized, usableHeight, NAVBAR_HEIGHT);

    // Apply exponential moving average smoothing to CURSOR POSITION ONLY
    smoothX.current = smoothX.current + SMOOTHING_ALPHA * (rawX - smoothX.current);
    smoothY.current = smoothY.current + SMOOTHING_ALPHA * (rawY - smoothY.current);

    setState((s) => ({
      ...s,
      isPinching: isPinchingNow,
      openness: currentOpenness,
      rawCursorX: rawXNormalized,
      rawCursorY: rawYNormalized,
      cursorX: smoothX.current,
      cursorY: smoothY.current,
      cameraReady: true,
    }));

    if (isPinchingNow && !wasPinching.current) {
      // Trigger a click event
      setPinchClickEvent({ x: smoothX.current, y: smoothY.current, timestamp: Date.now() });
    }
    wasPinching.current = isPinchingNow;

  }, []);

  useEffect(() => {
    if (!state.enabled) return;

    if (!videoRef.current && !providedVideoRef) {
      const video = document.createElement("video");
      video.style.display = "none";
      document.body.appendChild(video);
      fallbackVideoRef.current = video;
    }

    handsRef.current = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });

    handsRef.current.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.85,
      minTrackingConfidence: 0.8,
    });

    handsRef.current.onResults(onResults);

    cameraRef.current = new Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current && handsRef.current) {
          await handsRef.current.send({ image: videoRef.current });
        }
      },
      width: 640,
      height: 480,
    });

    cameraRef.current.start();

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
      if (handsRef.current) {
        handsRef.current.close();
        handsRef.current = null;
      }
    };
  }, [state.enabled, onResults]);

  // Handle synthetic clicks when a pinch is detected
  useEffect(() => {
    if (!pinchClickEvent) return;

    // Simulate clicking element at coordinates
    const element = document.elementFromPoint(pinchClickEvent.x, pinchClickEvent.y);
    if (element) {
      // Find closest clickable element
      const clickable = element.closest('button, a, [role="button"], input, .cursor-pointer') || element;
      
      const eventInit = {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: pinchClickEvent.x,
        clientY: pinchClickEvent.y,
        buttons: 1
      };
      
      // Dispatch standard mouse events first
      clickable.dispatchEvent(new MouseEvent('mousedown', eventInit));
      clickable.dispatchEvent(new MouseEvent('mouseup', eventInit));
      
      // Attempt synthetic exact click
      if (typeof (clickable as HTMLElement).click === 'function') {
        (clickable as HTMLElement).click();
      } else {
        clickable.dispatchEvent(new MouseEvent('click', eventInit));
      }
    }
  }, [pinchClickEvent]);

  return {
    ...state,
    enableTracking,
    disableTracking,
  };
}
