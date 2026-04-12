import { ReactNode } from "react";
import { motion } from "framer-motion";

interface MagicBentoProps {
  className?: string;
  children: ReactNode;
  glowColor?: string;
}

export default function MagicBento({ className = "", children, glowColor = "#00F0FF" }: MagicBentoProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative rounded-3xl overflow-hidden group ${className}`}
      style={{
        background: "rgba(255, 255, 255, 0.02)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
      }}
    >
      {/* Background radial glow on hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${glowColor}20 0%, transparent 70%)`
        }}
      />
      
      {/* Border glow light sweep */}
      <div 
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          boxShadow: `inset 0 0 20px ${glowColor}15, 0 0 20px ${glowColor}10`
        }}
      />
      
      {/* Content wrapper */}
      <div className="relative z-10 w-full h-full p-6 flex flex-col">
        {children}
      </div>
    </motion.div>
  );
}
