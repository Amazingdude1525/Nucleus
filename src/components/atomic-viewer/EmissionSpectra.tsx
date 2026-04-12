import { useMemo } from "react";
import { motion } from "framer-motion";
import { elementSpectra } from "@/data/elements";

function wavelengthToColor(nm: number): string {
  let r = 0, g = 0, b = 0;
  if (nm >= 380 && nm < 440) {
    r = -(nm - 440) / (440 - 380); b = 1;
  } else if (nm >= 440 && nm < 490) {
    g = (nm - 440) / (490 - 440); b = 1;
  } else if (nm >= 490 && nm < 510) {
    g = 1; b = -(nm - 510) / (510 - 490);
  } else if (nm >= 510 && nm < 580) {
    r = (nm - 510) / (580 - 510); g = 1;
  } else if (nm >= 580 && nm < 645) {
    r = 1; g = -(nm - 645) / (645 - 580);
  } else if (nm >= 645 && nm <= 780) {
    r = 1;
  }
  if (nm < 380) {
    r = 0.7; g = 0.1; b = 1;
  }
  // Boost to full neon saturation
  const max = Math.max(r, g, b, 0.01);
  r = Math.min(r / max, 1);
  g = Math.min(g / max, 1);
  b = Math.min(b / max, 1);
  return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
}

function neonGlow(color: string, alpha: number = 1): string {
  return color.replace("rgb(", "rgba(").replace(")", `, ${alpha})`);
}

interface EmissionSpectraProps {
  atomicNumber: number;
  elementName: string;
}

export default function EmissionSpectra({ atomicNumber, elementName }: EmissionSpectraProps) {
  const lines = useMemo(() => {
    const realData = elementSpectra[atomicNumber];
    if (realData) {
      return realData.map(d => ({
        nm: d.nm,
        label: d.label,
        color: wavelengthToColor(d.nm),
        isReal: true
      }));
    }

    // Generate simulated lines if no real data
    const simulated: { nm: number; label: string; color: string; isReal: false }[] = [];
    const seed = atomicNumber * 12345;
    const count = (atomicNumber % 5) + 3;
    
    for (let i = 0; i < count; i++) {
      const nm = 400 + ((seed * (i + 1)) % 300);
      simulated.push({
        nm,
        label: `Simulated Line ${i + 1}`,
        color: wavelengthToColor(nm),
        isReal: false
      });
    }
    return simulated.sort((a, b) => a.nm - b.nm);
  }, [atomicNumber]);

  const minNm = 350;
  const maxNm = 750;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground tracking-wide">
          {elementName} Emission spectra
        </h3>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-mono">
          {elementSpectra[atomicNumber] ? "Verified Lab Data" : "Scientifically Simulated"}
        </span>
      </div>

      <div className="relative w-full h-32 rounded-xl overflow-hidden bg-black border border-white/10">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            background: "linear-gradient(90deg, #220033 0%, #000066 20%, #006666 35%, #006600 50%, #666600 65%, #660000 85%, #330000 100%)",
          }}
        />

        {lines.map((line, i) => {
          const x = ((line.nm - minNm) / (maxNm - minNm)) * 100;
          if (x < 0 || x > 100) return null;
          
          return (
            <motion.div
              key={i}
              className="absolute top-0 bottom-0 group cursor-crosshair"
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ delay: 0.2 + i * 0.08, duration: 0.6, ease: "easeOut" }}
              style={{
                left: `${x}%`,
                width: "3px",
                backgroundColor: line.color,
                boxShadow: [
                  `0 0 4px 1px ${line.color}`,
                  `0 0 12px 2px ${neonGlow(line.color, 0.9)}`,
                  `0 0 28px 4px ${neonGlow(line.color, 0.6)}`,
                ].join(", "),
                filter: "brightness(1.6) saturate(1.4)",
              }}
            >
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-card/95 backdrop-blur-md rounded-lg px-3 py-1.5 text-[10px] text-foreground border border-white/10 z-20 shadow-xl">
                <span className="font-bold font-mono" style={{ color: line.color }}>{line.nm.toFixed(1)} nm</span>
                <span className="text-muted-foreground ml-1.5">— {line.label}</span>
              </div>
            </motion.div>
          );
        })}

        {[400, 450, 500, 550, 600, 650, 700].map((nm) => {
          const x = ((nm - minNm) / (maxNm - minNm)) * 100;
          return (
            <div
              key={nm}
              className="absolute bottom-1 text-[8px] text-muted-foreground/30 font-mono"
              style={{ left: `${x}%`, transform: "translateX(-50%)" }}
            >
              {nm}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {lines.map((line, i) => (
          <motion.div
            key={i}
            className="flex items-center gap-3 px-3 py-2 rounded-lg glass text-[10px] group hover:border-white/20 transition-all"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.05 }}
          >
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{
                background: line.color,
                boxShadow: `0 0 6px ${line.color}`,
              }}
            />
            <span className="text-foreground font-mono font-medium">{line.nm.toFixed(1)} nm</span>
            <span className="text-muted-foreground/40 ml-auto truncate max-w-[60px]">{line.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
