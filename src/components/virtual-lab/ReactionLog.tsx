import { motion, AnimatePresence } from "framer-motion";

export interface LogEntry {
  id: number;
  message: string;
  type: "add" | "reaction" | "info";
  timestamp: Date;
}

interface ReactionLogProps {
  entries: LogEntry[];
}

export default function ReactionLog({ entries }: ReactionLogProps) {
  const typeColor = {
    add: "text-primary",
    reaction: "text-[#ff8800]",
    info: "text-muted-foreground",
  };

  const typeIcon = {
    add: "＋",
    reaction: "⚗",
    info: "ℹ",
  };

  const typeBg = {
    add: "transparent",
    reaction: "bg-[#ff8800]/5",
    info: "transparent",
  };

  return (
    <div className="glass rounded-xl border border-white/5 p-3 h-full flex flex-col">
      <h3 
        className="text-[10px] font-semibold text-foreground tracking-wider uppercase mb-2 flex items-center gap-1.5"
        style={{ fontFamily: "'Orbitron', sans-serif" }}
      >
        <span className="text-primary">⚗</span> Reaction Log
      </h3>
      <div className="flex-1 overflow-y-auto space-y-1 min-h-0 scrollbar-thin">
        <AnimatePresence initial={false}>
          {entries.length === 0 && (
            <p className="text-[9px] text-muted-foreground/50 italic" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Add chemicals to the beaker to begin...
            </p>
          )}
          {entries.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-start gap-1.5 text-[10px] py-1 border-b border-white/5 ${typeBg[entry.type]}`}
            >
              <span className={`${typeColor[entry.type]} shrink-0 text-[9px]`}>
                {typeIcon[entry.type]}
              </span>
              <span 
                className="text-muted-foreground leading-relaxed flex-1 break-words"
                style={{ fontFamily: entry.type === "reaction" ? "'JetBrains Mono', monospace" : "'Space Grotesk', sans-serif", fontSize: entry.type === "reaction" ? "9px" : "10px" }}
              >
                {entry.message}
              </span>
              <span 
                className="text-muted-foreground/25 shrink-0 text-[7px] mt-0.5"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {entry.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
