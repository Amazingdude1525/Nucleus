import { motion } from "framer-motion";
import type { Chemical } from "@/data/chemicals";

interface ChemicalCardProps {
  chemical: Chemical;
  onAdd: (chemical: Chemical) => void;
}

export default function ChemicalCard({ chemical, onAdd }: ChemicalCardProps) {
  return (
    <motion.button
      onClick={() => onAdd(chemical)}
      className="flex flex-col items-center cursor-pointer group relative pt-1"
      whileHover={{ scale: 1.08, y: -4 }}
      whileTap={{ scale: 0.93 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      style={{ width: 95, height: 135 }}
    >
      {/* Beaker Shape */}
      <div className="relative w-[52px] h-[58px] flex flex-col items-center">
        {/* Beaker rim */}
        <div 
          className="w-[42px] h-[4px] rounded-t-sm border-t-2 border-x-2 bg-white/5 shrink-0"
          style={{ 
            borderColor: `${chemical.color}55`,
          }} 
        />
        {/* Beaker lip/pouring spout */}
        <div 
          className="absolute -top-1 -right-0.5 w-3 h-2 rounded-tr-md border-t border-r"
          style={{ borderColor: `${chemical.color}55` }}
        />
        {/* Beaker body */}
        <div 
          className="relative w-[42px] flex-1 rounded-b-lg border-x-2 border-b-2 overflow-hidden transition-all duration-300"
          style={{ 
            borderColor: `${chemical.color}44`,
            background: `linear-gradient(180deg, transparent 15%, ${chemical.color}18 50%, ${chemical.color}30 100%)`,
          }}
        >
          {/* Liquid fill inside the beaker */}
          <div
            className="absolute bottom-0 left-0 right-0 transition-all duration-500 group-hover:opacity-100 opacity-80"
            style={{
              height: '65%',
              background: `linear-gradient(to top, ${chemical.color}90, ${chemical.color}50 60%, ${chemical.color}20)`,
              borderRadius: '0 0 6px 6px',
            }}
          />
          {/* Liquid surface meniscus */}
          <div
            className="absolute left-0 right-0"
            style={{
              bottom: '63%',
              height: '4px',
              background: `linear-gradient(to bottom, transparent, ${chemical.color}40)`,
              borderRadius: '50%',
            }}
          />
          {/* Scale lines on beaker */}
          {[25, 45, 65].map((pos) => (
            <div 
              key={pos} 
              className="absolute left-0.5 w-2 border-t" 
              style={{ 
                bottom: `${pos}%`, 
                borderColor: `${chemical.color}30`,
              }} 
            />
          ))}
          {/* Subtle glow on hover */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              boxShadow: `inset 0 0 15px ${chemical.color}33`,
            }}
          />
        </div>
      </div>

      {/* Formula label inside/on beaker */}
      <div
        className="absolute top-[14px] left-1/2 -translate-x-1/2 text-[10px] font-bold z-10 text-center leading-none whitespace-nowrap"
        style={{ 
          color: chemical.color,
          textShadow: `0 0 6px ${chemical.color}66`,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {chemical.formula.length > 10 ? chemical.formula.slice(0, 9) + "…" : chemical.formula}
      </div>

      {/* Full name — always visible, wrapped */}
      <div 
        className="text-[9px] text-center leading-tight font-medium text-muted-foreground/80 w-full mt-2 flex items-center justify-center shrink-0"
        style={{ fontFamily: "'Space Grotesk', sans-serif", height: 26 }}
      >
        <span className="line-clamp-2">{chemical.name}</span>
      </div>

      {/* Moles */}
      <div 
        className="text-[8px] text-muted-foreground/40 mt-1 shrink-0"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        {chemical.defaultMoles} mol · {chemical.volumeMl}mL
      </div>

      {/* Hover add hint */}
      <motion.span 
        className="text-[9px] text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-0"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        + Add
      </motion.span>

      {/* Hover glow ring */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          boxShadow: `0 0 20px ${chemical.color}22, 0 0 40px ${chemical.color}11`,
        }}
      />
    </motion.button>
  );
}
