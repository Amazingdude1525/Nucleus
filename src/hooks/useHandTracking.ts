import { useEffect, useRef, useState, useCallback } from "react";
import { HandLandmarker, FilesetResolver, type NormalizedLandmark } from "@mediapipe/tasks-vision";

// ─── Types ───────────────────────────────────────────────────────────────────

/** Detectable hand gestures */
export type GestureType = "point" | "pinch" | "fist" | "peace" | "open_palm" | "none";

export interface HandTrackingState {
  isActive: boolean;
  isLoading: boolean;
  landmarks: NormalizedLandmark[] | null;
  gesture: GestureType;
  cursorPosition: { x: number; y: number };
  isPinching: boolean;
  confidence: number;
  error: string | null;
  handDetected: boolean;
  fps: number;
}

export interface UseHandTrackingReturn extends HandTrackingState {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  activate: () => Promise<void>;
  deactivate: () => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

const WASM_CDN = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";

/** Size of circular buffer for smoothing */
const SMOOTH_BUFFER_SIZE = 4;

/** Minimum pixel movement to register (dead zone) */
const DEAD_ZONE_PX = 1;

/** Pinch distance threshold (normalized coordinates) */
const PINCH_THRESHOLD = 0.06;

/** Pinch cooldown in ms to prevent rapid firing */
const PINCH_COOLDOWN_MS = 200;

/** Frames required to confirm a gesture change (debounce) */
const GESTURE_DEBOUNCE_FRAMES = 3;

/** FPS threshold to trigger quality downgrade */
const MIN_FPS_THRESHOLD = 20;

// ─── Smoothing helpers removed in favor of exponential average ─────────────────

// ─── Gesture detection helpers ──────────────────────────────────────────────

function isFingerExtended(
  landmarks: NormalizedLandmark[],
  tipIdx: number,
  pipIdx: number
): boolean {
  return landmarks[tipIdx].y < landmarks[pipIdx].y;
}

function getDistance(a: NormalizedLandmark, b: NormalizedLandmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = (a.z || 0) - (b.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function detectGesture(landmarks: NormalizedLandmark[]): GestureType {
  if (!landmarks || landmarks.length < 21) return "none";

  const indexExtended = isFingerExtended(landmarks, 8, 6);
  const middleExtended = isFingerExtended(landmarks, 12, 10);
  const ringExtended = isFingerExtended(landmarks, 16, 14);
  const pinkyExtended = isFingerExtended(landmarks, 20, 18);

  // Thumb check — uses X axis since thumb moves laterally
  const thumbTip = landmarks[4];
  const thumbIp = landmarks[3];
  const thumbExtended = thumbTip.x < thumbIp.x; // Works for right hand (mirrored)

  const thumbIndexDist = getDistance(landmarks[4], landmarks[8]);

  // PINCH: thumb and index tips very close
  if (thumbIndexDist < PINCH_THRESHOLD) {
    return "pinch";
  }

  // OPEN PALM: all 5 fingers extended
  if (indexExtended && middleExtended && ringExtended && pinkyExtended && thumbExtended) {
    return "open_palm";
  }

  // FIST: all fingertips below their PIP joints
  if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
    return "fist";
  }

  // PEACE: index + middle extended, others folded
  if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
    return "peace";
  }

  // POINT: index extended, others folded
  if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
    return "point";
  }

  return "none";
}

// ─── The Hook ───────────────────────────────────────────────────────────────

/**
 * Core hand tracking hook using MediaPipe HandLandmarker (tasks-vision).
 *
 * Provides gesture detection, smooth cursor mapping, and synthetic click events.
 * Lazily initializes — only loads the model when activate() is called.
 *
 * @returns Hand tracking state and controls
 */
export function useHandTracking(): UseHandTrackingReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const animFrameRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  // Smoothing and timing refs
  const lastCursorRef = useRef({ x: 0, y: 0 });
  const lastPinchTimeRef = useRef(0);
  const gestureCounterRef = useRef<{ gesture: GestureType; count: number }>({
    gesture: "none",
    count: 0,
  });
  const confirmedGestureRef = useRef<GestureType>("none");

  // FPS tracking
  const fpsFramesRef = useRef(0);
  const fpsLastTimeRef = useRef(performance.now());
  const currentFpsRef = useRef(30);
  const lowResRef = useRef(false);

  // Tab visibility
  const wasActiveBeforeHiddenRef = useRef(false);
  const isPausedRef = useRef(false);

  const [state, setState] = useState<HandTrackingState>({
    isActive: false,
    isLoading: false,
    landmarks: null,
    gesture: "none",
    cursorPosition: { x: 0, y: 0 },
    isPinching: false,
    confidence: 0,
    error: null,
    handDetected: false,
    fps: 0,
    stream: null as MediaStream | null,
  });

  // ─── Synthetic click dispatch ──────────────────────────────────────────

  const dispatchSyntheticClick = useCallback((x: number, y: number) => {
    const element = document.elementFromPoint(x, y);
    if (!element) return;

    // Skip clicks on text inputs, textareas, code editors
    const tag = (element as HTMLElement).tagName?.toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "code") return;
    if ((element as HTMLElement).contentEditable === "true") return;

    const clickable =
      element.closest('button, a, [role="button"], [data-clickable], .cursor-pointer, label, select, [tabindex]') ||
      element;

    const eventInit: MouseEventInit = {
      view: window,
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y,
      buttons: 1,
    };

    clickable.dispatchEvent(new MouseEvent("mousedown", eventInit));
    clickable.dispatchEvent(new MouseEvent("mouseup", eventInit));

    if (typeof (clickable as HTMLElement).click === "function") {
      (clickable as HTMLElement).click();
    } else {
      clickable.dispatchEvent(new MouseEvent("click", eventInit));
    }
  }, []);

  // ─── Detection loop ────────────────────────────────────────────────────

  const detectLoop = useCallback(() => {
    if (!handLandmarkerRef.current || !videoRef.current || isPausedRef.current) {
      animFrameRef.current = requestAnimationFrame(detectLoop);
      return;
    }

    const video = videoRef.current;
    if (video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(detectLoop);
      return;
    }

    try {
      const startTime = performance.now();
      const results = handLandmarkerRef.current.detectForVideo(video, startTime);

      // One-time log on first detection
      if (results.landmarks && results.landmarks.length > 0 && !fpsFramesRef.current) {
        console.log("[Nucleus HT] ✅ Hand detected! Landmarks:", results.landmarks[0].length);
      }

      // FPS calculation
      fpsFramesRef.current++;
      if (startTime - fpsLastTimeRef.current >= 1000) {
        currentFpsRef.current = fpsFramesRef.current;
        fpsFramesRef.current = 0;
        fpsLastTimeRef.current = startTime;

        // Auto-downgrade resolution if FPS drops
        if (currentFpsRef.current < MIN_FPS_THRESHOLD && !lowResRef.current && streamRef.current) {
          lowResRef.current = true;
          const track = streamRef.current.getVideoTracks()[0];
          if (track) {
            track.applyConstraints({ width: 640, height: 480 }).catch(() => {});
          }
        }
      }

      if (results.landmarks && results.landmarks.length > 0) {
        const landmarks = results.landmarks[0];
        const rawGesture = detectGesture(landmarks);

        // ── Gesture debounce: require N consecutive frames ──
        if (rawGesture === gestureCounterRef.current.gesture) {
          gestureCounterRef.current.count++;
        } else {
          gestureCounterRef.current = { gesture: rawGesture, count: 1 };
        }

        let confirmedGesture = confirmedGestureRef.current;
        if (gestureCounterRef.current.count >= GESTURE_DEBOUNCE_FRAMES) {
          confirmedGesture = rawGesture;
          confirmedGestureRef.current = confirmedGesture;
        }

        // ── Cursor smoothing & mapping ──
        const indexTip = landmarks[8];
        
        // Mirror the X coordinate for natural interaction
        const rawMirroredX = 1 - indexTip.x;
        
        // Optional: slight amplification so user doesn't need to reach edges of camera
        const amplify = (val: number) => Math.max(0, Math.min(1, (val - 0.15) * 1.42));
        
        const targetX = amplify(rawMirroredX) * window.innerWidth;
        const targetY = amplify(indexTip.y) * window.innerHeight;

        // Fast exponential smoothing (ALPHA = 0.6 means 60% new frame, 40% old frame)
        const ALPHA = 0.6;
        
        // Initialize cursor immediately if it's currently at 0,0
        if (lastCursorRef.current.x === 0 && lastCursorRef.current.y === 0) {
          lastCursorRef.current = { x: targetX, y: targetY };
        }

        const finalX = lastCursorRef.current.x * (1 - ALPHA) + targetX * ALPHA;
        const finalY = lastCursorRef.current.y * (1 - ALPHA) + targetY * ALPHA;
        
        lastCursorRef.current = { x: finalX, y: finalY };

        // ── Pinch detection with cooldown ──
        const isPinching = confirmedGesture === "pinch";
        const now = performance.now();

        if (isPinching && now - lastPinchTimeRef.current > PINCH_COOLDOWN_MS) {
          lastPinchTimeRef.current = now;
          dispatchSyntheticClick(finalX, finalY);
        }

        // Confidence from detection
        const worldLandmarks = results.worldLandmarks;
        const conf = worldLandmarks && worldLandmarks.length > 0 ? 0.92 : 0.75;

        setState((prev) => ({
          ...prev,
          landmarks,
          gesture: confirmedGesture,
          cursorPosition: { x: finalX, y: finalY },
          isPinching,
          confidence: conf,
          handDetected: true,
          fps: currentFpsRef.current,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          landmarks: null,
          handDetected: false,
          confidence: 0,
          fps: currentFpsRef.current,
        }));
      }
    } catch {
      // Detection can fail on some frames — just skip
    }

    animFrameRef.current = requestAnimationFrame(detectLoop);
  }, [dispatchSyntheticClick]);

  // ─── Activate ──────────────────────────────────────────────────────────

  /**
   * Activate hand tracking — loads the model, requests camera, starts detection.
   * Shows onboarding first if needed.
   */
  const activate = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));

    try {
      // Check browser compatibility
      const isFirefox = navigator.userAgent.toLowerCase().includes("firefox");
      if (isFirefox) {
        console.warn("Hand tracking works best on Chrome/Edge. Firefox may have reduced performance.");
      }

      // 1. Initialize HandLandmarker (Auto fallback to CPU if GPU fails)
      if (!handLandmarkerRef.current) {
        const vision = await FilesetResolver.forVisionTasks(WASM_CDN);

        const options = {
          runningMode: "VIDEO" as const,
          numHands: 1,
          minHandDetectionConfidence: 0.7,
          minHandPresenceConfidence: 0.7,
          minTrackingConfidence: 0.7,
        };

        try {
          handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
            ...options,
            baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
          });
        } catch (gpuErr) {
          console.warn("[Nucleus HT] GPU delegate failed. Falling back to CPU.", gpuErr);
          handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
            ...options,
            baseOptions: { modelAssetPath: MODEL_URL, delegate: "CPU" },
          });
        }
      }

      // 2. Request camera
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Check resolution
      const track = stream.getVideoTracks()[0];
      const settings = track.getSettings();
      if (settings.height && settings.height < 480) {
        console.warn("Camera resolution below 480p — tracking accuracy may be reduced.");
      }

      // 3. Attach to off-screen video element
      // IMPORTANT: Do NOT use display:none — browsers won't decode frames for hidden elements
      if (!videoRef.current) {
        const vid = document.createElement("video");
        vid.style.position = "fixed";
        vid.style.top = "-9999px";
        vid.style.left = "-9999px";
        vid.style.width = "1px";
        vid.style.height = "1px";
        vid.style.opacity = "0.01";
        vid.style.pointerEvents = "none";
        vid.setAttribute("playsinline", "");
        vid.setAttribute("autoplay", "");
        vid.muted = true;
        document.body.appendChild(vid);
        (videoRef as React.MutableRefObject<HTMLVideoElement>).current = vid;
      }

      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();
      console.log("[Nucleus HT] Camera active, video playing. Resolution:", video.videoWidth, "x", video.videoHeight);

      // Reset smoothing
      lowResRef.current = false;
      isPausedRef.current = false;

      setState((s) => ({
        ...s,
        isActive: true,
        isLoading: false,
        error: null,
        stream: stream,
      }));

      // 4. Start detection loop
      animFrameRef.current = requestAnimationFrame(detectLoop);
    } catch (err: unknown) {
      let errorMsg = "Failed to initialize hand tracking.";

      if (err instanceof DOMException) {
        if (err.name === "NotAllowedError") {
          errorMsg = "Camera permission denied. Please enable camera access in browser settings.";
        } else if (err.name === "NotFoundError") {
          errorMsg = "No camera found. Please connect a camera and try again.";
        } else if (err.name === "NotReadableError") {
          errorMsg = "Camera is in use by another application. Please close other apps using the camera.";
        }
      } else if (err instanceof Error && err.message.includes("fetch")) {
        errorMsg = "Failed to load hand tracking model. Check your internet connection.";
      }

      setState((s) => ({
        ...s,
        isActive: false,
        isLoading: false,
        error: errorMsg,
      }));
    }
  }, [detectLoop]);

  // ─── Deactivate ────────────────────────────────────────────────────────

  /** Stop hand tracking and release camera. */
  const deactivate = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    isPausedRef.current = false;

    setState({
      isActive: false,
      isLoading: false,
      landmarks: null,
      gesture: "none",
      cursorPosition: { x: 0, y: 0 },
      isPinching: false,
      confidence: 0,
      error: null,
      handDetected: false,
      fps: 0,
      stream: null,
    });
  }, []);

  // ─── Tab visibility handler ────────────────────────────────────────────

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && state.isActive) {
        wasActiveBeforeHiddenRef.current = true;
        isPausedRef.current = true;
      } else if (!document.hidden && wasActiveBeforeHiddenRef.current) {
        wasActiveBeforeHiddenRef.current = false;
        isPausedRef.current = false;
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [state.isActive]);

  // ─── Cleanup on unmount ────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (handLandmarkerRef.current) {
        handLandmarkerRef.current.close();
        handLandmarkerRef.current = null;
      }
    };
  }, []);

  return {
    ...state,
    videoRef,
    canvasRef,
    activate,
    deactivate,
  };
}
