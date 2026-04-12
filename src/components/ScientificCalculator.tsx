import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, ArrowRightLeft, X, Bot, Hash } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

// ─── Energy conversion factors (relative to Hartree) ───
const toHartree: Record<string, number> = {
  hartree: 1,
  eV: 1 / 27.211386245988,
  "kcal/mol": 1 / 627.5094740631,
  "kJ/mol": 1 / 2625.4996394799,
  "cm⁻¹": 1 / 219474.6313632,
  K: 1 / 315775.02480407,
};
const fromHartree: Record<string, number> = {
  hartree: 1,
  eV: 27.211386245988,
  "kcal/mol": 627.5094740631,
  "kJ/mol": 2625.4996394799,
  "cm⁻¹": 219474.6313632,
  K: 315775.02480407,
};
const unitLabels: Record<string, string> = {
  hartree: "1 Hartree",
  eV: "27.2114 eV",
  "kcal/mol": "627.509 kcal/mol",
  "kJ/mol": "2625.50 kJ/mol",
  "cm⁻¹": "219474.6 cm⁻¹",
  K: "315775.0 K",
};

const units = ["hartree", "eV", "kcal/mol", "kJ/mol", "cm⁻¹", "K"];

// ─── Calculator buttons layout ───
const calcButtons = [
  ["(", ")", "π", "e", "C"],
  ["sin", "cos", "tan", "sin⁻¹", "cos⁻¹"],
  ["tan⁻¹", "log", "ln", "exp", "√"],
  ["x²", "xʸ", "n!", "±", "⌫"],
  ["7", "8", "9", "÷", "%"],
  ["4", "5", "6", "×", "1/x"],
  ["1", "2", "3", "−", ""],
  ["0", ".", "EE", "+", "="],
];

function factorial(n: number): number {
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  if (n > 170) return Infinity;
  let result = 1;
  for (let i = 2; i <= Math.floor(n); i++) result *= i;
  return result;
}

export default function ScientificCalculator() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"calc" | "convert" | "sigfig">("calc");
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState("");
  const [sigFigInput, setSigFigInput] = useState("");
  const [converterValues, setConverterValues] = useState<Record<string, string>>({
    hartree: "", eV: "", "kcal/mol": "", "kJ/mol": "", "cm⁻¹": "", K: "",
  });

  const evaluate = useCallback((expr: string) => {
    try {
      let sanitized = expr
        .replace(/π/g, `(${Math.PI})`)
        .replace(/e(?![xX])/g, `(${Math.E})`)
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/−/g, "-")
        .replace(/sin\(/g, "Math.sin(")
        .replace(/cos\(/g, "Math.cos(")
        .replace(/tan\(/g, "Math.tan(")
        .replace(/sec\(/g, "(1/Math.cos(")
        .replace(/csc\(/g, "(1/Math.sin(")
        .replace(/cot\(/g, "(1/Math.tan(")
        .replace(/log\(/g, "Math.log10(")
        .replace(/ln\(/g, "Math.log(")
        .replace(/sin⁻¹\(/g, "Math.asin(")
        .replace(/cos⁻¹\(/g, "Math.acos(")
        .replace(/tan⁻¹\(/g, "Math.atan(")
        .replace(/√\(/g, "Math.sqrt(")
        .replace(/exp\(/g, "Math.exp(")
        .replace(/(\d+)!/g, (_, n) => `${factorial(Number(n))}`);

      // Close any sec/csc/cot extra parens
      const openCount = (sanitized.match(/\(/g) || []).length;
      const closeCount = (sanitized.match(/\)/g) || []).length;
      for (let i = 0; i < openCount - closeCount; i++) sanitized += ")";

      const res = new Function(`return (${sanitized})`)();
      return typeof res === "number" ? (Number.isFinite(res) ? String(res) : "Error") : "Error";
    } catch {
      return "Error";
    }
  }, []);

  const handleCalcButton = (btn: string) => {
    if (btn === "") return;
    if (btn === "C") {
      setExpression("");
      setResult("");
      return;
    }
    if (btn === "⌫") {
      setExpression((p) => p.slice(0, -1));
      return;
    }
    if (btn === "=") {
      const r = evaluate(expression);
      setResult(r);
      return;
    }
    if (btn === "±") {
      setExpression((p) => p.startsWith("-") ? p.slice(1) : "-" + p);
      return;
    }
    if (btn === "x²") {
      setExpression((p) => `(${p})**2`);
      return;
    }
    if (btn === "xʸ") {
      setExpression((p) => p + "**");
      return;
    }
    if (btn === "1/x") {
      setExpression((p) => `1/(${p})`);
      return;
    }
    if (btn === "n!") {
      setExpression((p) => p + "!");
      return;
    }
    if (btn === "EE") {
      setExpression((p) => p + "e");
      return;
    }
    if (["sin", "cos", "tan", "sin⁻¹", "cos⁻¹", "tan⁻¹", "log", "ln", "√", "exp"].includes(btn)) {
      setExpression((p) => p + btn + "(");
      return;
    }
    setExpression((p) => p + btn);
  };

  const handleConvert = (unit: string, value: string) => {
    const newValues: Record<string, string> = {};
    const num = parseFloat(value);
    if (value === "" || isNaN(num)) {
      units.forEach((u) => (newValues[u] = u === unit ? value : ""));
    } else {
      const hartreeVal = num * toHartree[unit];
      units.forEach((u) => {
        newValues[u] = u === unit ? value : (hartreeVal * fromHartree[u]).toExponential(6);
      });
    }
    setConverterValues(newValues);
  };

  const getSigFigs = (numStr: string): { count: number; explanation: string } => {
    const str = numStr.trim().toLowerCase();
    if (!str || str === "-" || str === ".") return { count: 0, explanation: "Enter a number" };
    
    let base = str;
    let sciNote = "";
    if (str.includes("e")) {
      const parts = str.split("e");
      base = parts[0];
      sciNote = " (x 10^" + parts[1] + " ignored)";
    }
    
    base = base.replace(/^-/, "");
    if (isNaN(Number(base)) && base !== ".") return { count: 0, explanation: "Invalid number" };

    const hasDecimal = base.includes(".");
    const digitsStr = base.replace(".", "");
    
    if (hasDecimal) {
      const sigDigits = digitsStr.replace(/^0+/, "");
      return { 
        count: sigDigits.length, 
        explanation: `Leading zeros are ignored. Decimal implies trailing zeros count.${sciNote}` 
      };
    } else {
      const sigDigits = digitsStr.replace(/^0+/, "").replace(/0+$/, "");
      return { 
        count: sigDigits.length, 
        explanation: `No decimal point, so trailing and leading zeros are ignored.${sciNote}` 
      };
    }
  };

  const location = useLocation();

  return (
    <>
      {/* Floating Global Action Buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3">
        {/* Only show AI button if we aren't already on the AI page */}
        {location.pathname !== "/ai" && (
          <Link to="/ai">
            <motion.div
              className="flex items-center justify-center w-12 h-12 rounded-full cursor-pointer relative group"
              style={{
                background: "rgba(6,7,9,0.85)",
                backdropFilter: "blur(20px) saturate(1.4)",
                border: "1px solid rgba(255,68,170,0.3)",
                boxShadow: "0 0 15px rgba(255,68,170,0.15), inset 0 0 0 1px rgba(255,68,170,0.05)",
              }}
              whileHover={{ scale: 1.06, boxShadow: "0 0 25px rgba(255,68,170,0.3)" }}
              whileTap={{ scale: 0.95 }}
              title="Ask AI"
            >
              <Bot className="w-5 h-5 text-[#ff44aa]" />
            </motion.div>
          </Link>
        )}

        {/* Toggle Pill — premium cyan glassmorphism */}
        <motion.button
          className="flex items-center justify-center w-12 h-12 rounded-full outline-none"
          style={{
            background: "rgba(6,7,9,0.85)",
            backdropFilter: "blur(20px) saturate(1.4)",
            border: "1px solid rgba(0,229,255,0.3)",
            boxShadow: "0 0 15px rgba(0,229,255,0.25), 0 0 40px rgba(0,229,255,0.1), inset 0 0 0 1px rgba(0,229,255,0.05)",
          }}
          onClick={() => setOpen(!open)}
          whileHover={{ scale: 1.06, boxShadow: "0 0 25px rgba(0,229,255,0.45), 0 0 60px rgba(0,229,255,0.2)" }}
          whileTap={{ scale: 0.95 }}
          title={open ? "Close Tools" : "Tools"}
        >
          {open ? <X className="w-5 h-5 text-[#00E5FF]" /> : <Calculator className="w-5 h-5 text-[#00E5FF]" />}
        </motion.button>
      </div>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed bottom-20 right-6 z-50 w-[340px] rounded-2xl border border-white/10 overflow-hidden"
            style={{
              background: "rgba(5,8,22,0.85)",
              backdropFilter: "blur(30px) saturate(1.5)",
              boxShadow: "0 0 60px rgba(0,200,255,0.08), 0 25px 60px rgba(0,0,0,0.5)",
            }}
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Tab Headers */}
            <div className="flex border-b border-white/5">
              <button
                onClick={() => setTab("calc")}
                className={`flex-1 py-2.5 text-[9px] font-bold tracking-widest uppercase flex items-center justify-center gap-1.5 transition-all font-space ${
                  tab === "calc" ? "text-[#00E5FF] bg-[#00E5FF]/8 border-b-2 border-[#00E5FF]" : "text-white/40 hover:text-white/60"
                }`}
              >
                <Calculator className="w-3 h-3" /> Calc
              </button>
              <button
                onClick={() => setTab("convert")}
                className={`flex-1 py-2.5 text-[9px] font-bold tracking-widest uppercase flex items-center justify-center gap-1.5 transition-all font-space ${
                  tab === "convert" ? "text-[#00E5FF] bg-[#00E5FF]/8 border-b-2 border-[#00E5FF]" : "text-white/40 hover:text-white/60"
                }`}
              >
                <ArrowRightLeft className="w-3 h-3" /> Units
              </button>
              <button
                onClick={() => setTab("sigfig")}
                className={`flex-1 py-2.5 text-[9px] font-bold tracking-widest uppercase flex items-center justify-center gap-1.5 transition-all font-space ${
                  tab === "sigfig" ? "text-[#00E5FF] bg-[#00E5FF]/8 border-b-2 border-[#00E5FF]" : "text-white/40 hover:text-white/60"
                }`}
              >
                <Hash className="w-3 h-3" /> Sig Figs
              </button>
            </div>

            {tab === "calc" ? (
              <div className="p-3">
                {/* Display */}
                <div className="mb-3 p-3 rounded-xl bg-black/40 border border-white/5 min-h-[60px] flex flex-col justify-end">
                  <div className="text-right text-xs text-white/50 font-mono-data break-all leading-relaxed">
                    {expression || "0"}
                  </div>
                  {result && (
                    <div className="text-right text-lg font-bold font-mono-data text-[#00E5FF] mt-1" style={{ textShadow: "0 0 10px rgba(0,229,255,0.4)" }}>
                      {result}
                    </div>
                  )}
                </div>

                {/* Buttons Grid */}
                <div className="grid grid-cols-5 gap-1">
                  {calcButtons.flat().map((btn, i) => {
                    if (btn === "") return <div key={i} />;
                    const isOp = ["÷", "×", "−", "+", "="].includes(btn);
                    const isFunc = ["sin", "cos", "tan", "sec", "csc", "cot", "log", "ln", "√", "exp", "n!", "x²", "xʸ", "1/x", "EE", "±", "⌫"].includes(btn);
                    const isClear = btn === "C";
                    return (
                      <button
                        key={i}
                        onClick={() => handleCalcButton(btn)}
                        className={`py-2 rounded-lg text-[10px] font-semibold transition-all active:scale-95 font-space ${
                          btn === "=" ? "bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30 hover:bg-[#00E5FF]/35" :
                          isClear ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20" :
                          isOp ? "bg-[#00E5FF]/10 text-[#00E5FF] hover:bg-[#00E5FF]/20" :
                          isFunc ? "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white" :
                          "bg-white/[0.03] text-white/90 hover:bg-white/10"
                        }`}
                      >
                        {btn}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : tab === "convert" ? (
              <div className="p-3 space-y-2 max-h-[420px] overflow-y-auto scrollbar-thin">
                <p className="text-[9px] text-white/30 mb-2 text-center tracking-wider">
                  TYPE IN ANY FIELD — ALL CONVERT LIVE
                </p>
                {units.map((unit) => (
                  <div key={unit} className="group">
                    <label className="text-[10px] font-semibold text-white/60 mb-0.5 block">{unit}</label>
                    <input
                      type="text"
                      value={converterValues[unit]}
                      onChange={(e) => handleConvert(unit, e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/5 text-sm font-mono-data text-white/90 focus:outline-none focus:border-[#00E5FF]/40 focus:ring-1 focus:ring-[#00E5FF]/20 transition-all placeholder:text-white/15"
                    />
                    <span className="text-[8px] text-white/20 mt-0.5 block">
                      1 Hartree = {unitLabels[unit]}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 flex flex-col gap-4">
                <div>
                  <label className="text-[10px] font-semibold text-white/60 mb-1.5 block uppercase tracking-widest">
                    Enter any number
                  </label>
                  <input
                    type="text"
                    value={sigFigInput}
                    onChange={(e) => setSigFigInput(e.target.value)}
                    placeholder="e.g. 0.00450 or 400."
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-lg font-mono-data text-white focus:outline-none focus:border-[#00E5FF]/50 focus:shadow-[0_0_20px_rgba(0,229,255,0.15)] transition-all placeholder:text-white/20"
                  />
                </div>
                
                {sigFigInput.trim() !== "" && (
                  <motion.div 
                    className="p-4 rounded-xl bg-[#00E5FF]/5 border border-[#00E5FF]/20 flex flex-col items-center justify-center gap-2"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="text-[10px] text-[#00E5FF] uppercase tracking-[0.2em] font-semibold">
                      Significant Figures
                    </div>
                    <div className="text-4xl font-bold font-mono text-white text-glow-cyan">
                      {getSigFigs(sigFigInput).count}
                    </div>
                    <div className="text-xs text-white/50 text-center mt-1 leading-relaxed">
                      {getSigFigs(sigFigInput).explanation}
                    </div>
                  </motion.div>
                )}
                
                <div className="text-[9px] text-white/30 text-center leading-relaxed mt-2 border-t border-white/5 pt-4">
                  Standard scientific rules apply. Scientific notation (e.g., 1.50e-3) is supported.
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
