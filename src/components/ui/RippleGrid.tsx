import React, { useEffect, useRef } from "react";

interface RippleGridProps {
  enableRainbow?: boolean;
  gridColor?: string;
  rippleIntensity?: number;
  gridSize?: number;
  gridThickness?: number;
  mouseInteraction?: boolean;
  mouseInteractionRadius?: number;
  opacity?: number;
}

export default function RippleGrid({
  enableRainbow = false,
  gridColor = "#00c8ff",
  rippleIntensity = 0.05,
  gridSize = 30, // Default to sane grid logic
  gridThickness = 1,
  mouseInteraction = true,
  mouseInteractionRadius = 1.2,
  opacity = 0.6,
}: RippleGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let mouseX = -1000;
    let mouseY = -1000;
    
    // Smooth trailing mouse coordinates
    let currentMouseX = -1000;
    let currentMouseY = -1000;

    const handleResize = () => {
      // Fit to full window to guarantee background coverage correctly
      const parent = containerRef.current?.parentElement || document.body;
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    if (mouseInteraction) {
      window.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("mouseleave", handleMouseLeave);
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = opacity;

      // Interpolate mouse for smooth lag simulation
      currentMouseX += (mouseX - currentMouseX) * 0.1;
      currentMouseY += (mouseY - currentMouseY) * 0.1;

      const width = canvas.width;
      const height = canvas.height;
      const hoverRadius = mouseInteractionRadius * 200; // Base interaction radius

      ctx.beginPath();
      // Draw standard grid
      ctx.strokeStyle = gridColor;

      for (let x = 0; x <= width; x += gridSize) {
        for (let y = 0; y <= height; y += gridSize) {
          let dist = Math.sqrt(
            Math.pow(currentMouseX - x, 2) + Math.pow(currentMouseY - y, 2)
          );

          let thickness = gridThickness;
          
          if (mouseInteraction && dist < hoverRadius) {
            // Ripple wave function across the grid
            const normalizedDist = dist / hoverRadius;
            const wave = Math.sin((1 - normalizedDist) * Math.PI) * rippleIntensity * 50;
            thickness = Math.max(gridThickness, gridThickness + wave);
          }

          // Render cross dot or grid intersection
          ctx.beginPath();
          ctx.fillStyle = gridColor;
          // React Bits grid is mostly scaling dots
          ctx.arc(x, y, thickness, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (mouseInteraction) {
        window.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mouseleave", handleMouseLeave);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    gridColor,
    rippleIntensity,
    gridSize,
    gridThickness,
    mouseInteraction,
    mouseInteractionRadius,
    opacity,
  ]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden w-full h-full" style={{ pointerEvents: "inherit" }}>
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}
