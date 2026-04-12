import React, { useEffect, useRef } from "react";

interface GridScanProps {
  sensitivity?: number;
  lineThickness?: number;
  linesColor?: string;
  gridScale?: number;
  scanColor?: string;
  scanOpacity?: number;
  enablePost?: boolean;
  bloomIntensity?: number;
  chromaticAberration?: number;
  noiseIntensity?: number;
}

export default function GridScan({
  sensitivity = 0.55,
  lineThickness = 1,
  linesColor = "#392e4e",
  gridScale = 0.1,
  scanColor = "#FF9FFC",
  scanOpacity = 0.4,
}: GridScanProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;

    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 0, g: 0, b: 0 };
    };

    const cLine = hexToRgb(linesColor);
    const cScan = hexToRgb(scanColor);

    let mouseX = width / 2;
    let mouseY = height / 2;
    let scanY = 0;
    let animationId: number;

    const handleMouse = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      const targetX = e.clientX - r.left;
      const targetY = e.clientY - r.top;
      // Add slight delay/smoothing based on sensitivity
      mouseX += (targetX - mouseX) * sensitivity;
      mouseY += (targetY - mouseY) * sensitivity;
    };
    canvas.addEventListener("mousemove", handleMouse);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Grid logic
      const gridSize = Math.max(30, width * gridScale);
      
      ctx.lineWidth = lineThickness;
      ctx.strokeStyle = `rgba(${cLine.r}, ${cLine.g}, ${cLine.b}, 0.5)`;

      // Draw grid
      ctx.beginPath();
      // Translate slightly based on mouse for parallax effect
      const offsetX = (mouseX - width / 2) * 0.05;
      const offsetY = (mouseY - height / 2) * 0.05;

      for (let x = (offsetX % gridSize) - gridSize; x < width + gridSize; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = (offsetY % gridSize) - gridSize; y < height + gridSize; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Scan line
      scanY += 2;
      if (scanY > height + 200) scanY = -200;

      // Draw scan glow
      const grad = ctx.createLinearGradient(0, scanY - 100, 0, scanY);
      grad.addColorStop(0, `rgba(${cScan.r}, ${cScan.g}, ${cScan.b}, 0)`);
      grad.addColorStop(0.9, `rgba(${cScan.r}, ${cScan.g}, ${cScan.b}, ${scanOpacity})`);
      grad.addColorStop(1, `rgba(${cScan.r}, ${cScan.g}, ${cScan.b}, 0)`);

      ctx.fillStyle = grad;
      ctx.fillRect(0, scanY - 100, width, 100);

      // Interaction glow at mouse
      const mouseGrad = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 150);
      mouseGrad.addColorStop(0, `rgba(${cScan.r}, ${cScan.g}, ${cScan.b}, 0.15)`);
      mouseGrad.addColorStop(1, `rgba(${cScan.r}, ${cScan.g}, ${cScan.b}, 0)`);
      ctx.fillStyle = mouseGrad;
      ctx.fillRect(0, 0, width, height);

      animationId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("resize", handleResize);
    };
  }, [sensitivity, lineThickness, linesColor, gridScale, scanColor, scanOpacity]);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100%", background: "transparent", pointerEvents: "none" }} />;
}
