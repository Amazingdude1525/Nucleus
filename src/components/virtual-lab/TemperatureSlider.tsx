import { motion } from "framer-motion";

interface TemperatureSliderProps {
  temperature: number;
  minTemp?: number;
  maxTemp?: number;
  deltaH?: number;
}

export default function TemperatureSlider({
  temperature,
  minTemp = 0,
  maxTemp = 150,
  deltaH = 0,
}: TemperatureSliderProps) {
  const range = maxTemp - minTemp;
  const fillPercent = Math.min(Math.max(((temperature - minTemp) / range) * 100, 0), 100);

  // Color based on temperature — cool blue → amber → hot red
  const getColor = (temp: number) => {
    if (temp < 20) return "#44aaff";
    if (temp < 30) return "#00D4FF";
    if (temp < 50) return "#88ee44";
    if (temp < 70) return "#F59E0B";
    if (temp < 90) return "#ff6622";
    return "#ff2222";
  };

  const color = getColor(temperature);

  return (
    <div className="flex flex-col items-center h-full py-4 px-3">
      {/* Title */}
      <div 
        className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60 font-semibold mb-2"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        Temp
      </div>

      {/* LIVE indicator with amber pulsing */}
      <div className="flex items-center gap-1.5 mb-2">
        <motion.div
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: "#F59E0B" }}
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.7, 1, 0.7],
            boxShadow: [
              "0 0 0px rgba(245,158,11,0)",
              "0 0 8px rgba(245,158,11,0.8)",
              "0 0 0px rgba(245,158,11,0)"
            ],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <span 
          className="text-[8px] font-bold"
          style={{ color: "#F59E0B", fontFamily: "'Space Grotesk', sans-serif" }}
        >
          LIVE
        </span>
      </div>

      {/* Temperature digital readout */}
      <motion.div
        className="text-lg font-bold mb-0.5"
        style={{ 
          color, 
          fontFamily: "'JetBrains Mono', monospace",
        }}
        animate={{ color }}
        transition={{ duration: 0.5 }}
      >
        {temperature.toFixed(1)}°
      </motion.div>
      <div 
        className="text-[9px] text-muted-foreground/40 mb-4"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        °C
      </div>

      {/* Thermometer track — gradient from cool blue (bottom) → amber → hot red (top) */}
      <div className="relative flex-1 w-5 flex flex-col items-center">
        <div 
          className="relative w-3 flex-1 rounded-full border border-white/10 overflow-hidden"
          style={{ 
            background: "linear-gradient(to top, rgba(68,170,255,0.15), rgba(245,158,11,0.15), rgba(239,68,68,0.15))" 
          }}
        >
          {/* Fill from bottom */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 rounded-full"
            style={{ backgroundColor: color }}
            animate={{
              height: `${fillPercent}%`,
              backgroundColor: color,
              boxShadow: `0 0 8px ${color}66, 0 0 20px ${color}33`,
            }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          />
        </div>

        {/* Scale markers */}
        {[0, 25, 50, 75, 100, 125, 150].map((temp) => {
          const y = 100 - ((temp - minTemp) / range) * 100;
          if (y < 0 || y > 100) return null;
          return (
            <div
              key={temp}
              className="absolute right-6 text-muted-foreground/30"
              style={{ 
                top: `${y}%`, 
                transform: "translateY(-50%)",
                fontSize: "7px",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {temp}°
            </div>
          );
        })}

        {/* Bulb at bottom */}
        <div
          className="w-5 h-5 rounded-full mt-0.5 border border-white/10"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}66, 0 0 25px ${color}33`,
          }}
        />
      </div>

      {/* ΔH display */}
      {deltaH !== 0 && (
        <motion.div
          className="mt-3 text-center"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div 
            className="text-[8px] text-muted-foreground/40 uppercase tracking-wider"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            ΔH
          </div>
          <div
            className="text-[11px] font-bold"
            style={{ 
              color: deltaH < 0 ? "#ff6644" : "#44aaff",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {deltaH > 0 ? "+" : ""}{deltaH.toFixed(1)}
          </div>
          <div 
            className="text-[7px] text-muted-foreground/30"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            kJ/mol
          </div>
        </motion.div>
      )}
    </div>
  );
}
