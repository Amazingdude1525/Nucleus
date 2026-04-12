import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

const titles: Record<string, string> = {
  "/virtual-lab": "Virtual Lab",
  "/discovery-hub": "Discovery Hub",
  "/assistant": "AI Assistant",
  "/creators": "Creators",
};

export default function ComingSoon() {
  const { pathname } = useLocation();
  const title = titles[pathname] || "Coming Soon";

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="px-4 py-1.5 rounded-full glass text-xs tracking-[0.3em] uppercase text-primary">
        Phase 2
      </div>
      <h2 className="text-3xl font-bold tracking-widest text-foreground">
        {title}
      </h2>
      <p className="text-muted-foreground text-sm max-w-md text-center">
        This module is under active development. Stay tuned for the next update.
      </p>
    </motion.div>
  );
}
