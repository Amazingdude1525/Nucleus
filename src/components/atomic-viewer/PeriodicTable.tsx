import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { elements, categoryLabels, categoryColors, type Element } from "@/data/elements";
import ElementCard from "./ElementCard";
import ElementDetail from "./ElementDetail";

export default function PeriodicTable() {
  const [selected, setSelected] = useState<Element | null>(null);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Category legend — neon colored */}
      <div className="flex flex-wrap gap-4 justify-center">
        {Object.entries(categoryLabels).map(([key, label]) => (
          <div key={key} className="flex items-center gap-2 group cursor-default">
            <div
              className="w-3 h-3 rounded-sm"
              style={{
                background: `hsl(${categoryColors[key as keyof typeof categoryColors]})`,
                boxShadow: `0 0 8px hsl(${categoryColors[key as keyof typeof categoryColors]} / 0.5)`,
              }}
            />
            <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors">
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Grid with dot-grid background */}
      <div className="relative">
        {/* Subtle grid-lines background */}
        <div className="absolute inset-0 grid-lines-bg rounded-2xl opacity-40" />

        <div
          className="relative grid gap-[3px] w-full mx-auto p-3"
          style={{
            gridTemplateColumns: "repeat(18, minmax(0, 1fr))",
            gridTemplateRows: "repeat(9, minmax(0, 1fr))",
            maxWidth: "1200px",
          }}
        >
          {/* Lanthanide/Actinide placeholder markers */}
          <div
            className="flex items-center justify-center text-[8px] text-muted-foreground/30 border border-dashed border-white/5 rounded"
            style={{ gridColumn: 3, gridRow: 6 }}
          >
            57-71
          </div>
          <div
            className="flex items-center justify-center text-[8px] text-muted-foreground/30 border border-dashed border-white/5 rounded"
            style={{ gridColumn: 3, gridRow: 7 }}
          >
            89-103
          </div>

          {elements.map((el) => (
            <ElementCard key={el.number} element={el} onClick={setSelected} />
          ))}
        </div>
      </div>

      {/* Element Detail Panel */}
      <AnimatePresence>
        {selected && (
          <ElementDetail element={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
