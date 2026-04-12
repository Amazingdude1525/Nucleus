import { motion } from "framer-motion";
import { type Element, categoryColors } from "@/data/elements";

interface ElementCardProps {
  element: Element;
  onClick: (el: Element) => void;
}

export default function ElementCard({ element, onClick }: ElementCardProps) {
  const glowColor = categoryColors[element.category];

  return (
    <motion.button
      onClick={() => onClick(element)}
      className="relative flex flex-col items-center justify-center p-1 rounded-lg cursor-pointer overflow-hidden group"
      style={{
        gridColumn: element.col,
        gridRow: element.row,
        perspective: "600px",
        background: "rgba(255,255,255,0.02)",
        border: `1px solid hsl(${glowColor} / 0.12)`,
      }}
      whileHover={{
        scale: 1.2,
        y: -6,
        zIndex: 30,
        transition: { type: "spring", stiffness: 400, damping: 18 },
      }}
      whileTap={{ scale: 0.92 }}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: element.number * 0.003, duration: 0.3 }}
    >
      {/* Neon glow background on hover */}
      <div
        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at center, hsl(${glowColor} / 0.15) 0%, transparent 70%)`,
          boxShadow: `0 0 20px hsl(${glowColor} / 0.5), 0 0 50px hsl(${glowColor} / 0.2), inset 0 0 15px hsl(${glowColor} / 0.1)`,
          border: `1px solid hsl(${glowColor} / 0.5)`,
        }}
      />

      {/* Subtle base glow always visible */}
      <div
        className="absolute inset-0 rounded-lg"
        style={{
          boxShadow: `inset 0 0 10px hsl(${glowColor} / 0.03)`,
        }}
      />

      {/* Atomic number */}
      <span
        className="text-[7px] leading-none self-start pl-0.5 mt-0.5 font-mono"
        style={{ color: `hsl(${glowColor} / 0.5)` }}
      >
        {element.number}
      </span>

      {/* Symbol */}
      <span
        className="text-sm md:text-base font-bold leading-none transition-all duration-200 relative z-10"
        style={{
          color: `hsl(${glowColor})`,
          textShadow: `0 0 8px hsl(${glowColor} / 0.4)`,
        }}
      >
        {element.symbol}
      </span>

      {/* Name */}
      <span
        className="text-[6px] leading-none truncate w-full text-center mt-0.5 transition-colors duration-200"
        style={{
          color: `hsl(${glowColor} / 0.35)`,
        }}
      >
        {element.name}
      </span>

      {/* Mass — visible on hover */}
      <span className="text-[5px] leading-none text-muted-foreground/0 group-hover:text-muted-foreground/50 transition-colors mt-0.5 font-mono">
        {element.mass}
      </span>
    </motion.button>
  );
}
