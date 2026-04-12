import React, { useEffect, useRef } from "react";

interface DotGridProps {
  dotSize?: number;
  gap?: number;
  baseColor?: string;
  activeColor?: string;
  proximity?: number;
  shockRadius?: number;
  shockStrength?: number;
  resistance?: number;
  returnDuration?: number; // kept for interface compatibility
}

export default function DotGrid({
  dotSize = 5,
  gap = 15,
  baseColor = "#271E37",
  activeColor = "#5227FF",
  proximity = 120, // distance for color glow
  shockRadius = 150, // distance for physics repulsion
  shockStrength = 0.2, // force multiplier
  resistance = 0.9, // friction
}: DotGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dots: { x: number; y: number; bx: number; by: number; a: number; vx: number; vy: number }[] = [];
    let mouse = { x: -1000, y: -1000 };

    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 0, g: 0, b: 0 };
    };

    const c1 = hexToRgb(baseColor);
    const c2 = hexToRgb(activeColor);

    const dpr = window.devicePixelRatio || 1;

    const initDots = () => {
      // Use the actual parent/window dimensions
      width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.parentElement?.clientHeight || window.innerHeight;

      // Safety bounds
      if (width === 0) width = window.innerWidth;
      if (height === 0) height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      dots = [];
      
      for (let x = 0; x < width + gap; x += gap) {
        for (let y = 0; y < height + gap; y += gap) {
          dots.push({ x, y, bx: x, by: y, a: 0, vx: 0, vy: 0 });
        }
      }
    };

    initDots();

    const handleResize = () => {
       initDots();
    };

    const handleMouse = (e: MouseEvent) => {
      // Get position relative to canvas, accounting for scroll and offset
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    
    // Track mouse globally so it works over cards sitting on top of the grid
    window.addEventListener("mousemove", handleMouse);
    window.addEventListener("resize", handleResize);

    let animationId: number;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        const dx = mouse.x - d.x; // difference from current position
        const dy = mouse.y - d.y;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq);

        // Repulsion physics calculation
        if (dist < shockRadius && dist > 0.1) {
           const force = (shockRadius - dist) / shockRadius;
           const invDist = 1 / dist;
           d.vx -= dx * invDist * force * shockStrength;
           d.vy -= dy * invDist * force * shockStrength;
        }

        // Spring back to base position
        const homeDx = d.bx - d.x;
        const homeDy = d.by - d.y;
        d.vx += homeDx * 0.04; // spring constant
        d.vy += homeDy * 0.04;

        // Apply friction
        d.vx *= resistance;
        d.vy *= resistance;

        // Apply velocity
        d.x += d.vx;
        d.y += d.vy;

        // Glow logic (dist from mouse to base position)
        const mouseBaseDx = mouse.x - d.bx;
        const mouseBaseDy = mouse.y - d.by;
        const mouseBaseDist = Math.sqrt(mouseBaseDx * mouseBaseDx + mouseBaseDy * mouseBaseDy);

        if (mouseBaseDist < proximity) {
          const t = 1 - mouseBaseDist / proximity;
          d.a += (t - d.a) * 0.15;
        } else {
          d.a += (0 - d.a) * 0.05;
        }

        const r = Math.round(c1.r + (c2.r - c1.r) * d.a);
        const g = Math.round(c1.g + (c2.g - c1.g) * d.a);
        const b = Math.round(c1.b + (c2.b - c1.b) * d.a);

        // Add glow effect for active dots
        if (d.a > 0.3) {
          ctx.shadowBlur = 8 * d.a;
          ctx.shadowColor = `rgb(${c2.r},${c2.g},${c2.b})`;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.beginPath();
        // Scale dot size for pop effect
        ctx.arc(d.x, d.y, dotSize * (0.5 + 0.5 * d.a), 0, Math.PI * 2);
        ctx.fill();
      }

      // Reset shadow after loop
      ctx.shadowBlur = 0;

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("resize", handleResize);
    };
  }, [dotSize, gap, baseColor, activeColor, proximity, shockRadius, shockStrength, resistance]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        width: "100%", 
        height: "100%", 
        background: "transparent", 
        pointerEvents: "none",
        position: "absolute",
        top: 0,
        left: 0,
      }} 
    />
  );
}
