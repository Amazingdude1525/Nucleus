import { motion, AnimatePresence } from "framer-motion";
import type { Chemical } from "@/data/chemicals";

interface DashboardPanelProps {
  contents: { chemical: Chemical; moles: number }[];
  totalVolumeMl: number;
  temperature: number;
  pH: number;
  molarity: Record<string, number>;
}

export default function DashboardPanel({
  contents,
  totalVolumeMl,
  temperature,
  pH,
  molarity,
}: DashboardPanelProps) {
  const getPHColor = (ph: number) => {
    if (ph < 3) return "#ff3333";
    if (ph < 5) return "#ff8844";
    if (ph < 6.5) return "#ffcc00";
    if (ph <= 7.5) return "#44ee88";
    if (ph < 9) return "#44aaff";
    if (ph < 12) return "#6644ff";
    return "#aa22ff";
  };

  return (
    <motion.div
      className="glass rounded-xl border border-white/10 px-4 py-3 w-full shadow-2xl"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60 font-semibold">
          Beaker Analysis
        </span>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse-amber" />
          <span className="text-[8px] text-[#F59E0B]/80 font-bold">LIVE</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center p-2 rounded-lg bg-white/[0.03] border border-white/5">
          <div className="text-[10px] text-muted-foreground/50 mb-0.5">Volume</div>
          <div className="text-sm font-bold font-mono text-foreground">
            {totalVolumeMl.toFixed(0)}
          </div>
          <div className="text-[8px] text-muted-foreground/30">mL</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-white/[0.03] border border-white/5">
          <div className="text-[10px] text-muted-foreground/50 mb-0.5">Temp</div>
          <div className="text-sm font-bold font-mono-data" style={{ color: temperature > 30 ? "#F59E0B" : "#00D4FF" }}>
            {temperature.toFixed(1)}
          </div>
          <div className="text-[8px] text-muted-foreground/30">°C</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-white/[0.03] border border-white/5">
          <div className="text-[10px] text-muted-foreground/50 mb-0.5">pH</div>
          <div className="text-sm font-bold font-mono" style={{ color: getPHColor(pH) }}>
            {pH.toFixed(1)}
          </div>
          <div className="text-[8px] text-muted-foreground/30">
            {pH < 6.5 ? "Acidic" : pH > 7.5 ? "Basic" : "Neutral"}
          </div>
        </div>
      </div>

      {/* Reactants table */}
      {contents.length > 0 && (
        <div className="border-t border-white/5 pt-2">
          <div className="grid grid-cols-[1fr_60px_60px] gap-1 text-[9px] text-muted-foreground/40 uppercase tracking-wider mb-1.5 px-1">
            <span>Reactant</span>
            <span className="text-right">Qty (mol)</span>
            <span className="text-right">Molarity</span>
          </div>
          <AnimatePresence>
            {contents.map((item, i) => (
              <motion.div
                key={`${item.chemical.id}-${i}`}
                className="grid grid-cols-[1fr_60px_60px] gap-1 text-[11px] py-1 px-1 rounded hover:bg-white/[0.03] transition-colors"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      background: item.chemical.color,
                      boxShadow: `0 0 4px ${item.chemical.color}66`,
                    }}
                  />
                  <span className="text-foreground font-medium truncate">
                    {item.chemical.formula}
                  </span>
                </div>
                <span className="text-right text-muted-foreground font-mono">
                  {item.moles.toFixed(3)}
                </span>
                <span className="text-right text-muted-foreground font-mono">
                  {molarity[item.chemical.formula]
                    ? `${molarity[item.chemical.formula].toFixed(2)}M`
                    : "—"
                  }
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {contents.length === 0 && (
        <p className="text-[10px] text-muted-foreground/30 italic text-center py-2">
          Empty beaker — add chemicals below
        </p>
      )}
    </motion.div>
  );
}
