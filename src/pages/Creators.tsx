import { useMemo } from "react";
import { motion } from "framer-motion";
import { Users, Crown, Code2, FlaskConical, Atom, Cpu, Palette, Linkedin, Github, Mail, MessageSquare } from "lucide-react";
import Ballpit from "@/components/ui/Ballpit";

interface TeamMember {
  name: string;
  role: string;
  regId: string;
  icon: React.ElementType;
  gradient: string;
  glowColor: string;
  neonHex: string;
  isLead?: boolean;
  socials?: {
    linkedin?: string;
    github?: string;
    email?: string;
  };
}

const team: TeamMember[] = [
  {
    name: "Prateek Das",
    role: "System Architect & Full-Stack Developer",
    regId: "25BCE10599",
    icon: Crown,
    gradient: "from-[#00c8ff] to-[#0060ff]",
    glowColor: "hsl(200 100% 50% / 0.3)",
    neonHex: "#00c8ff",
    isLead: true,
    socials: {
      linkedin: "https://www.linkedin.com/in/prateek-das-a45215252/",
      github: "https://github.com/Amazingdude1525",
      email: "mailto:prateekdas5255@gmail.com",
    }
  },
  {
    name: "Anushka Chatterjee",
    role: "Contributor",
    regId: "25BCE11276",
    icon: Atom,
    gradient: "from-[#ff8844] to-[#ff4400]",
    glowColor: "hsl(25 100% 55% / 0.25)",
    neonHex: "#ff8844",
  },
  {
    name: "Raghav Bansal",
    role: "Contributor",
    regId: "25BCE11321",
    icon: Cpu,
    gradient: "from-[#ff4488] to-[#cc0044]",
    glowColor: "hsl(340 100% 55% / 0.25)",
    neonHex: "#ff4488",
  },
  {
    name: "Ankur Mishra",
    role: "Contributor",
    regId: "25BCE11174",
    icon: Code2,
    gradient: "from-[#44ff88] to-[#00cc66]",
    glowColor: "hsl(150 100% 50% / 0.25)",
    neonHex: "#44ff88",
  },
  {
    name: "Kushagra Saini",
    role: "Contributor",
    regId: "25BSA10006",
    icon: FlaskConical,
    gradient: "from-[#cc44ff] to-[#8800cc]",
    glowColor: "hsl(280 100% 60% / 0.25)",
    neonHex: "#cc44ff",
  },
];

import ElectricBorder from "@/components/ui/ElectricBorder";

function MemberCard({ member, index }: { member: TeamMember; index: number }) {
  const Icon = member.icon;

  return (
    <motion.div
      className={`relative ${member.isLead ? "col-span-full max-w-lg mx-auto w-full" : ""}`}
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.4 + index * 0.15, ease: "easeOut" }}
    >
      <ElectricBorder color={member.neonHex} thickness={2} speed={1.5} chaos={0.1}>
        <div
          className="relative p-6 rounded-2xl overflow-hidden group cursor-default"
          style={{
            background: "rgba(255, 255, 255, 0.02)",
            boxShadow: `0 0 40px ${member.glowColor}`,
          }}
        >
          {/* Electric border glow on hover */}
          <div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              boxShadow: `inset 0 0 30px ${member.neonHex}10, 0 0 30px ${member.neonHex}20`,
            }}
          />

          {/* Top accent line with neon glow */}
          <div
            className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${member.gradient}`}
            style={{ boxShadow: `0 0 12px ${member.neonHex}60` }}
          />

          <div className="relative z-10 flex items-center gap-4">
            {/* Icon badge */}
            <motion.div
              className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br ${member.gradient} shrink-0`}
              style={{
                boxShadow: `0 4px 25px ${member.glowColor}, 0 0 15px ${member.neonHex}30`,
              }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Icon className="w-6 h-6 text-white" />
            </motion.div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3
                  className="text-lg font-bold truncate"
                  style={{
                    color: member.neonHex,
                    textShadow: `0 0 10px ${member.neonHex}50`,
                  }}
                >
                  {member.name}
                </h3>
                {member.isLead && (
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-[0.15em] uppercase shrink-0"
                    style={{
                      background: `${member.neonHex}15`,
                      border: `1px solid ${member.neonHex}30`,
                      color: member.neonHex,
                      boxShadow: `0 0 10px ${member.neonHex}20`,
                    }}
                  >
                    LEAD
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{member.role}</p>
              <p className="text-[10px] text-muted-foreground/30 font-mono mt-1.5 tracking-wider">
                {member.regId}
              </p>
              
              {member.socials && (
                <div className="flex items-center gap-3 mt-3">
                  {member.socials.linkedin && (
                    <a href={member.socials.linkedin} target="_blank" rel="noreferrer" className="text-white/40 hover:text-[#00c8ff] transition-colors"><Linkedin className="w-4 h-4" /></a>
                  )}
                  {member.socials.github && (
                    <a href={member.socials.github} target="_blank" rel="noreferrer" className="text-white/40 hover:text-[#00c8ff] transition-colors"><Github className="w-4 h-4" /></a>
                  )}
                  {member.socials.email && (
                    <a href={member.socials.email} className="text-white/40 hover:text-[#00c8ff] transition-colors"><Mail className="w-4 h-4" /></a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </ElectricBorder>
    </motion.div>
  );
}

export default function Creators() {
  return (
    <motion.div
      className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Feedback Button */}
      <motion.a
        href="mailto:prateekdas5255@gmail.com?subject=NUCLEUS%20Feedback"
        className="absolute top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors backdrop-blur-md"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <MessageSquare className="w-4 h-4 text-[#00c8ff]" />
        <span className="text-xs font-semibold text-white/80">Feedback</span>
      </motion.a>

      {/* ──── FULL-SCREEN BALLPIT OVERLAY — Falls from top over everything ──── */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <Ballpit
          count={250}
          gravity={0.4}
          friction={0.99}
          wallBounce={0.8}
          followCursor={true}
          colors={["#00c8ff", "#cc44ff", "#44ff88", "#5227FF", "#ff4488", "#ff8844"]}
        />
      </div>

      {/* Background ambient effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(0,200,255,0.06) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(204,68,255,0.04) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Main scrollable content — z-10 so it's behind the ball overlay */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center space-y-4 mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 
            className="text-5xl md:text-6xl font-black tracking-tight text-white mb-2"
            style={{
              textShadow: "0 0 40px rgba(0,200,255,0.2)",
            }}
          >
            MEET THE CREATORS<motion.span 
              style={{ color: "#00c8ff" }}
              animate={{ textShadow: ["0 0 10px rgba(0,200,255,0.5)", "0 0 30px rgba(0,200,255,0.8)", "0 0 10px rgba(0,200,255,0.5)"] }}
              transition={{ duration: 2, repeat: Infinity }}
            >.</motion.span>
          </h1>
          <p className="text-sm text-muted-foreground/50 max-w-2xl mx-auto leading-relaxed">
            Architecting the definitive engine for spatial chemistry and computational intelligence.
          </p>
        </motion.div>

        {/* Team grid in 1-2-2 format */}
        <div className="flex flex-col gap-6 max-w-4xl w-full items-center">
          {/* Row 1: Lead (1 card) */}
          <div className="w-full max-w-2xl">
            <MemberCard member={team[0]} index={0} />
          </div>

          {/* Row 2: Contributors 1 & 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <MemberCard member={team[1]} index={1} />
            <MemberCard member={team[2]} index={2} />
          </div>

          {/* Row 3: Contributors 3 & 4 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <MemberCard member={team[3]} index={3} />
            <MemberCard member={team[4]} index={4} />
          </div>
        </div>

        {/* Footer */}
        <motion.div
          className="mt-14 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <div
            className="inline-block px-6 py-2 rounded-full"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <p className="text-[10px] text-muted-foreground/40 tracking-[0.3em] uppercase font-light">
              NUCLEUS • QUANTUM SPATIAL ENGINE • FORGING THE FUTURE AT THE ATOMIC LEVEL
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
