import { ReactNode } from "react";
import { motion } from "framer-motion";

interface ElectricBorderProps {
  children: ReactNode;
  color?: string;
  speed?: number;
  chaos?: number;
  thickness?: number;
  style?: React.CSSProperties;
}

export default function ElectricBorder({
  children,
  color = "#7df9ff",
  speed = 1,
  chaos = 0.12,
  thickness = 2,
  style,
}: ElectricBorderProps) {
  return (
    <div
      className="relative overflow-hidden group"
      style={{
        padding: thickness,
        borderRadius: style?.borderRadius || 16,
        ...style,
      }}
    >
      {/* Animated glowing conic gradient border */}
      <motion.div
        className="absolute inset-[auto] w-[300%] h-[300%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          background: `conic-gradient(from 0deg, transparent 60%, ${color} 90%, transparent 100%)`,
          filter: `blur(${chaos * 20}px)`,
          opacity: 0.8,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 4 / speed, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Content wrapper masking the inside */}
      <div 
        className="relative z-10 w-full h-full bg-[#030303]" 
        style={{ borderRadius: (style?.borderRadius as number || 16) - thickness }}
      >
        {children}
      </div>
    </div>
  );
}
