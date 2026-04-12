import React, { useEffect, useRef } from 'react';

interface MatrixRainProps {
  color?: string;
  speed?: number;
}

export default function MatrixRain({ color = '#00F0FF', speed = 1 }: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Chemistry-themed characters for the NUCLEUS app
    const chemChars = 'HHeOCNFClBrArNeKrXeRnSiPSAlMgNaCaFeTiCuZnAgAuPtPbUΔλσπΩφψαβγ∞Σ∫∂⬡⚗☢∇≈±ΨΘ'.split('');
    const fontSize = 14;

    // Per-column state for variable speeds
    let columns: number;
    let drops: number[] = [];
    let speeds: number[] = [];
    let brightnesses: number[] = [];

    const initColumns = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);

      columns = Math.floor(w / fontSize);
      drops = [];
      speeds = [];
      brightnesses = [];
      for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * -100; // stagger start
        speeds[i] = 0.3 + Math.random() * 0.7; // variable speed per column
        brightnesses[i] = 0.4 + Math.random() * 0.6;
      }
    };

    initColumns();

    let animId: number;
    let lastTime = 0;
    const interval = 33 / speed; // ~30fps base, adjusted by speed

    const draw = (timestamp: number) => {
      const delta = timestamp - lastTime;
      if (delta >= interval) {
        lastTime = timestamp;

        const w = canvas.offsetWidth;
        const h = canvas.offsetHeight;

        // Fade effect — slightly transparent black overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
        ctx.fillRect(0, 0, w, h);

        ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;

        for (let i = 0; i < columns; i++) {
          const text = chemChars[Math.floor(Math.random() * chemChars.length)];
          const x = i * fontSize;
          const y = drops[i] * fontSize;

          // Leading bright character
          const alpha = brightnesses[i];
          ctx.fillStyle = color;
          ctx.globalAlpha = alpha;
          ctx.fillText(text, x, y);

          // Subtle glow on the leading character
          ctx.shadowColor = color;
          ctx.shadowBlur = 8;
          ctx.fillText(text, x, y);
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;

          // Advance drops at variable speed
          drops[i] += speeds[i];

          // Reset when off-screen
          if (drops[i] * fontSize > h && Math.random() > 0.975) {
            drops[i] = 0;
            speeds[i] = 0.3 + Math.random() * 0.7;
            brightnesses[i] = 0.4 + Math.random() * 0.6;
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    const handleResize = () => {
      initColumns();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [color, speed]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0, opacity: 0.25, mixBlendMode: 'screen' }}
    />
  );
}
