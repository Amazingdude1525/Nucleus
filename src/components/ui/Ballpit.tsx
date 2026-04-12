import React, { useEffect, useRef } from "react";

interface BallpitProps {
  count?: number;
  gravity?: number;
  friction?: number;
  wallBounce?: number;
  followCursor?: boolean;
  colors?: string[];
}

export default function Ballpit({
  count = 70,
  gravity = 0.15,
  friction = 0.99,
  wallBounce = 0.9,
  followCursor = true,
  colors = ["#00F0FF", "#ff44aa", "#5227FF"],
}: BallpitProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { w, h };
    };

    let { w: width, h: height } = resize();

    const balls: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      mass: number;
    }[] = [];

    let mouse = { x: width / 2, y: height / 2, active: false };

    for (let i = 0; i < count; i++) {
      const radius = Math.random() * 14 + 8;
      balls.push({
        x: Math.random() * width,
        y: Math.random() * height * 0.5,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        radius,
        color: colors[Math.floor(Math.random() * colors.length)],
        mass: radius * 0.1,
      });
    }

    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };
    const handleMouseLeave = () => {
      mouse.active = false;
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseout", handleMouseLeave);

    const update = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < balls.length; i++) {
        const b = balls[i];

        // Gravity
        b.vy += gravity;

        // Cursor interaction — repel balls away from cursor
        if (followCursor && mouse.active) {
          const dx = mouse.x - b.x;
          const dy = mouse.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 250 && dist > 0.1) {
            const force = (250 - dist) / 250;
            // Push smoothly away
            b.vx -= (dx / dist) * force * 2.0;
            b.vy -= (dy / dist) * force * 2.0;
          }
        }

        // Ball-to-ball collision (simple)
        for (let j = i + 1; j < balls.length; j++) {
          const b2 = balls[j];
          const dx = b2.x - b.x;
          const dy = b2.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = b.radius + b2.radius;
          if (dist < minDist && dist > 0.1) {
            const overlap = (minDist - dist) / 2;
            const nx = dx / dist;
            const ny = dy / dist;

            // Separate
            b.x -= nx * overlap;
            b.y -= ny * overlap;
            b2.x += nx * overlap;
            b2.y += ny * overlap;

            // Bounce
            const dvx = b.vx - b2.vx;
            const dvy = b.vy - b2.vy;
            const dot = dvx * nx + dvy * ny;
            if (dot > 0) {
              b.vx -= dot * nx * 0.5;
              b.vy -= dot * ny * 0.5;
              b2.vx += dot * nx * 0.5;
              b2.vy += dot * ny * 0.5;
            }
          }
        }

        b.vx *= friction;
        b.vy *= friction;
        b.x += b.vx;
        b.y += b.vy;

        // Walls
        if (b.x - b.radius < 0) {
          b.x = b.radius;
          b.vx *= -wallBounce;
        } else if (b.x + b.radius > width) {
          b.x = width - b.radius;
          b.vx *= -wallBounce;
        }

        if (b.y - b.radius < 0) {
          b.y = b.radius;
          b.vy *= -wallBounce;
        } else if (b.y + b.radius > height) {
          b.y = height - b.radius;
          b.vy *= -wallBounce;
        }

        // Draw ball with glow
        ctx.save();
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.globalAlpha = 0.85;
        ctx.fill();
        ctx.closePath();

        // Inner highlight for 3D effect
        const grad = ctx.createRadialGradient(
          b.x - b.radius * 0.3,
          b.y - b.radius * 0.3,
          0,
          b.x,
          b.y,
          b.radius
        );
        grad.addColorStop(0, "rgba(255,255,255,0.3)");
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(update);
    };

    update();

    const handleResize = () => {
      const { w, h } = resize();
      width = w;
      height = h;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseout", handleMouseLeave);
    };
  }, [count, gravity, friction, wallBounce, followCursor, colors]);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />;
}
