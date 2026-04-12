import { NavLink } from "@/components/NavLink";
import { motion } from "framer-motion";
import {
  Atom,
  FlaskConical,
  Microscope,
  Grid3x3,
  Zap,
  Bot,
  Users,
  LayoutDashboard,
  Beaker,
  Activity,
  Waves,
  Box,
  ThermometerSun,
  Wind,
  ChevronDown,
  LineChart,
  Layers,
  GitBranch,
  Gauge,
  Flame,
  SquareFunction
} from "lucide-react";
import { Link } from "react-router-dom";

// Module colour coding:
// Quantum/Atomic → cyan (#00E5FF)
// Thermo/Sims   → pink (#FF6496)
// PES            → blue (#006EFF)
// Neutral        → text-secondary

const navItems = [
  { title: "Dashboard",      url: "/dashboard",      icon: LayoutDashboard, color: "rgba(255,255,255,0.5)" },
  { title: "Atomic Viewer",  url: "/atomic-viewer",  icon: Atom,            color: "#00E5FF" },
  { title: "Virtual Lab",    url: "/virtual-lab",     icon: FlaskConical,    color: "rgba(255,255,255,0.5)" },
  { title: "Molecules",      url: "/molecule",        icon: Microscope,      color: "rgba(255,255,255,0.5)" },
  { title: "Crystal Lattice", url: "/crystal",        icon: Grid3x3,         color: "rgba(255,255,255,0.5)" },
  { title: "Electron Config", url: "/config",         icon: Zap,             color: "rgba(255,255,255,0.5)" },
  { title: "AI",             url: "/ai",              icon: Bot,             color: "rgba(255,255,255,0.5)" },
];

export default function Navbar() {
  return (
    <motion.header
      className="sticky top-0 z-40 w-full border-b"
      style={{
        background: "rgba(6,7,9,0.85)",
        backdropFilter: "blur(24px) saturate(1.4)",
        WebkitBackdropFilter: "blur(24px) saturate(1.4)",
        borderColor: "rgba(255,255,255,0.05)",
      }}
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="flex h-14 items-center justify-between px-6">
        {/* NUCLEUS wordmark — Orbitron, cyan glow */}
        <NavLink
          to="/dashboard"
          className="text-lg font-black tracking-[0.25em] uppercase relative group font-orbitron"
          style={{
            color: "#00E5FF",
            textShadow: "0 0 28px rgba(0,229,255,0.45)",
          }}
        >
          <span className="relative z-10">NUCLEUS</span>
          <motion.span
            className="absolute inset-0 blur-md rounded-lg"
            style={{
              background: "linear-gradient(90deg, rgba(0,229,255,0.1), rgba(0,110,255,0.06), rgba(0,229,255,0.1))",
            }}
            animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </NavLink>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-0.5 font-space">
          {navItems.map((item) => (
            <NavLink
              key={item.url}
              to={item.url}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 border border-transparent"
              style={{ color: "rgba(255,255,255,0.5)" }}
              activeClassName="nav-active"
            >
              <item.icon className="h-3.5 w-3.5" style={{ color: item.color }} />
              <span>{item.title}</span>
            </NavLink>
          ))}

          {/* Simulations Dropdown */}
          <div className="relative group ml-1">
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 border border-transparent"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              <Activity className="h-3.5 w-3.5" style={{ color: "#FF6496" }} />
              <span>Simulations</span>
              <ChevronDown className="h-3 w-3 opacity-50 group-hover:rotate-180 transition-transform" />
            </button>
            <div className="absolute top-full right-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              {/* Dropdown panel — pink accent rail */}
              <div className="w-60 rounded-xl overflow-hidden p-1.5 flex flex-col gap-0.5 shadow-2xl relative"
                style={{
                  background: "linear-gradient(180deg, rgba(0,229,255,0.04) 0%, rgba(6,7,9,0.96) 30%)",
                  backdropFilter: "blur(30px)",
                  borderLeft: "2px solid rgba(255,100,150,0.3)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderLeftWidth: "2px",
                  borderLeftColor: "rgba(255,100,150,0.3)",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(0,229,255,0.08)",
                }}
              >
                {/* Quantum sims — cyan dot */}
                {[
                  { to: "/simulations/quantum-box",    icon: Activity, label: "Particle in a Box",     dot: "#00E5FF" },
                  { to: "/simulations/de-broglie",     icon: Waves,    label: "De Broglie Wavelength",  dot: "#00E5FF" },
                  { to: "/simulations/lennard-jones",  icon: Box,      label: "Intermolecular Potential", dot: "#00E5FF" },
                ].map((item) => (
                  <Link key={item.to} to={item.to}
                    className="relative z-10 flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/[0.06] transition-colors text-xs font-space"
                    style={{ color: "rgba(255,255,255,0.55)" }}>
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: item.dot, boxShadow: `0 0 6px ${item.dot}` }} />
                    <item.icon className="w-3.5 h-3.5" style={{ color: "#00E5FF" }} />
                    {item.label}
                  </Link>
                ))}

                <div className="my-1 mx-2 h-px" style={{ background: "linear-gradient(90deg, rgba(255,100,150,0.25), transparent)" }} />

                {/* Thermo sims — pink dot */}
                {[
                  { to: "/simulations/gibbs-free-energy", icon: ThermometerSun, label: "Gibbs Free Energy" },
                  { to: "/simulations/ideal-vs-real-gas", icon: Wind,           label: "Ideal vs Real Gas" },
                  { to: "/simulations/system-types",      icon: Layers,         label: "System Types" },
                  { to: "/simulations/state-vs-path",     icon: GitBranch,      label: "State vs Path Functions" },
                  { to: "/simulations/compressibility",   icon: Gauge,          label: "Compressibility Factor Z" },
                  { to: "/simulations/first-law",         icon: Flame,          label: "First Law Calculator" },
                  { to: "/simulations/maxwell-relations", icon: SquareFunction, label: "Maxwell's Relations" },
                ].map((item) => (
                  <Link key={item.to} to={item.to}
                    className="relative z-10 flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/[0.06] transition-colors text-xs font-space"
                    style={{ color: "rgba(255,255,255,0.55)" }}>
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#FF6496", boxShadow: "0 0 6px #FF6496" }} />
                    <item.icon className="w-3.5 h-3.5" style={{ color: "#FF6496" }} />
                    {item.label}
                  </Link>
                ))}

                <div className="my-1 mx-2 h-px" style={{ background: "linear-gradient(90deg, rgba(0,110,255,0.25), transparent)" }} />

                {/* PES — blue dot */}
                <Link to="/pes"
                  className="relative z-10 flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/[0.06] transition-colors text-xs font-space"
                  style={{ color: "rgba(255,255,255,0.55)" }}>
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#006EFF", boxShadow: "0 0 6px #006EFF" }} />
                  <LineChart className="w-3.5 h-3.5" style={{ color: "#006EFF" }} />
                  Potential Energy
                </Link>
              </div>
            </div>
          </div>

          <NavLink
            to="/creators"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 border border-transparent"
            style={{ color: "rgba(255,255,255,0.5)" }}
            activeClassName="nav-active"
          >
            <Users className="h-3.5 w-3.5" style={{ color: "rgba(255,255,255,0.5)" }} />
            <span>Creators</span>
          </NavLink>
        </nav>

        {/* Mobile nav */}
        <div className="md:hidden flex items-center gap-1 overflow-x-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.url}
              to={item.url}
              className="p-2 rounded-md shrink-0 transition-colors"
              style={{ color: "rgba(255,255,255,0.4)" }}
              activeClassName="text-[#00E5FF]"
            >
              <item.icon className="h-4 w-4" />
            </NavLink>
          ))}
        </div>
      </div>
    </motion.header>
  );
}
