/**
 * NUCLEUS Virtual Lab — Thermodynamic State Manager
 * Provides scientifically accurate enthalpy calculations, molarity tracking,
 * and reaction state management for the virtual chemistry lab.
 */

export interface Chemical {
  id: string;
  name: string;
  formula: string;
  color: string;
  type: "acid" | "base" | "salt" | "metal" | "water" | "oxide" | "indicator" | "organic" | "neutral";
  category: "WATER" | "ACIDS" | "BASES" | "SALTS" | "NEUTRALS" | "INDICATORS" | "ORGANICS" | "FAMOUS";
  volumeMl: number;
  molarMass: number;       // g/mol
  defaultMoles: number;    // mol added per click
  description: string;
  density?: number;        // g/mL (for liquids)
  specificHeat?: number;   // J/(g·°C)
  realImageUrl?: string;   // Real life image URL
}

export interface Reaction {
  reactants: [string, string] | [string, string, string];
  productName: string;
  productFormula: string;
  productColor: string;
  type: "neutralization" | "oxidation" | "displacement" | "decomposition" | "exothermic-dissolution" | "indicator-color-change" | "complexation" | "acid-carbonate";
  description: string;
  deltaH: number;          // kJ/mol (negative = exothermic)
  bubbles: boolean;
  gasEvolved?: string;
  precipitate?: boolean;
  smell?: string;          // Description of smell if any (H₂S, NH₃, etc.)
  observations?: string[]; // Physical observations ("White precipitate forms", "Effervescence observed", etc.)
  limitingReagentNote?: string;
}

export interface BeakerState {
  contents: { chemical: Chemical; moles: number; addedAt: number }[];
  totalVolumeMl: number;
  temperature: number;       // °C
  pH: number;
  liquidColor: string;
  bubbling: boolean;
  heatGlow: boolean;
  dissolvedPercent: number;  // 0-100
  molarity: Record<string, number>; // formula -> mol/L
}

// ============================================================
//  CHEMICAL DATABASE — categorized for bottom nav
// ============================================================

export const chemicals: Chemical[] = [
  // WATER
  { id: "h2o", name: "Distilled Water", formula: "H₂O", color: "#4488ff", type: "water", category: "WATER", volumeMl: 100, molarMass: 18.015, defaultMoles: 5.55, description: "Universal solvent, pH 7", density: 1.0, specificHeat: 4.184 },
  { id: "h2o_hot", name: "Hot Water (80°C)", formula: "H₂O", color: "#6699ff", type: "water", category: "WATER", volumeMl: 100, molarMass: 18.015, defaultMoles: 5.55, description: "Heated water for dissolving", density: 1.0, specificHeat: 4.184 },
  { id: "h2o_ice", name: "Ice (0°C)", formula: "H₂O(s)", color: "#aaddff", type: "water", category: "WATER", volumeMl: 80, molarMass: 18.015, defaultMoles: 4.44, description: "Solid water, absorbs heat on melting", density: 0.917, specificHeat: 2.09 },
  
  // ACIDS
  { id: "hcl", name: "Hydrochloric Acid", formula: "HCl", color: "#bbee00", type: "acid", category: "ACIDS", volumeMl: 50, molarMass: 36.461, defaultMoles: 0.5, description: "Strong monoprotic acid, pH ~1" },
  { id: "h2so4", name: "Sulfuric Acid", formula: "H₂SO₄", color: "#ffcc00", type: "acid", category: "ACIDS", volumeMl: 50, molarMass: 98.079, defaultMoles: 0.5, description: "Strong diprotic acid, pH ~0.3" },
  { id: "hno3", name: "Nitric Acid", formula: "HNO₃", color: "#ff9944", type: "acid", category: "ACIDS", volumeMl: 50, molarMass: 63.01, defaultMoles: 0.5, description: "Strong oxidizing acid" },
  { id: "ch3cooh", name: "Acetic Acid", formula: "CH₃COOH", color: "#ddffcc", type: "acid", category: "ACIDS", volumeMl: 50, molarMass: 60.052, defaultMoles: 0.5, description: "Weak acid, vinegar" },
  { id: "h3po4", name: "Phosphoric Acid", formula: "H₃PO₄", color: "#ccdd66", type: "acid", category: "ACIDS", volumeMl: 50, molarMass: 97.994, defaultMoles: 0.5, description: "Triprotic acid, used in cola" },
  { id: "h2co3", name: "Carbonic Acid", formula: "H₂CO₃", color: "#cceeaa", type: "acid", category: "ACIDS", volumeMl: 50, molarMass: 62.03, defaultMoles: 0.3, description: "Weak diprotic acid, in soda" },
  { id: "hf", name: "Hydrofluoric Acid", formula: "HF", color: "#aabb99", type: "acid", category: "ACIDS", volumeMl: 50, molarMass: 20.01, defaultMoles: 0.5, description: "Weak acid, etches glass" },
  { id: "oxalic", name: "Oxalic Acid", formula: "H₂C₂O₄", color: "#ddcc88", type: "acid", category: "ACIDS", volumeMl: 50, molarMass: 90.03, defaultMoles: 0.3, description: "Diprotic organic acid" },

  // BASES
  { id: "naoh", name: "Sodium Hydroxide", formula: "NaOH", color: "#00ccff", type: "base", category: "BASES", volumeMl: 50, molarMass: 39.997, defaultMoles: 0.5, description: "Strong base, pH ~14" },
  { id: "koh", name: "Potassium Hydroxide", formula: "KOH", color: "#22ddff", type: "base", category: "BASES", volumeMl: 50, molarMass: 56.106, defaultMoles: 0.5, description: "Strong caustic base" },
  { id: "nh3", name: "Ammonia Solution", formula: "NH₃(aq)", color: "#aaeeff", type: "base", category: "BASES", volumeMl: 50, molarMass: 17.031, defaultMoles: 0.5, description: "Weak base, pH ~11" },
  { id: "caoh2", name: "Calcium Hydroxide", formula: "Ca(OH)₂", color: "#eeffee", type: "base", category: "BASES", volumeMl: 50, molarMass: 74.09, defaultMoles: 0.3, description: "Slaked lime, slightly soluble" },
  { id: "ba_oh_2", name: "Barium Hydroxide", formula: "Ba(OH)₂", color: "#ccddee", type: "base", category: "BASES", volumeMl: 50, molarMass: 171.34, defaultMoles: 0.2, description: "Strong base, used in titrations" },
  { id: "na2co3", name: "Sodium Carbonate", formula: "Na₂CO₃", color: "#ddeeff", type: "base", category: "BASES", volumeMl: 40, molarMass: 105.99, defaultMoles: 0.3, description: "Washing soda, mild base" },

  // SALTS
  { id: "nacl", name: "Sodium Chloride", formula: "NaCl", color: "#ffffff", type: "salt", category: "SALTS", volumeMl: 20, molarMass: 58.44, defaultMoles: 0.3, description: "Common salt, neutral pH" },
  { id: "nahco3", name: "Sodium Bicarbonate", formula: "NaHCO₃", color: "#f0f0f0", type: "salt", category: "SALTS", volumeMl: 30, molarMass: 84.007, defaultMoles: 0.3, description: "Baking soda, slightly basic" },
  { id: "cuso4", name: "Copper Sulfate", formula: "CuSO₄", color: "#0066ff", type: "salt", category: "SALTS", volumeMl: 40, molarMass: 159.609, defaultMoles: 0.2, description: "Blue vitriol, acidic in solution" },
  { id: "fecl3", name: "Iron(III) Chloride", formula: "FeCl₃", color: "#cc8800", type: "salt", category: "SALTS", volumeMl: 30, molarMass: 162.2, defaultMoles: 0.2, description: "Yellow-brown, Lewis acid" },
  { id: "agno3", name: "Silver Nitrate", formula: "AgNO₃", color: "#e0e0ee", type: "salt", category: "SALTS", volumeMl: 30, molarMass: 169.87, defaultMoles: 0.2, description: "Light-sensitive, precipitant" },
  { id: "ki", name: "Potassium Iodide", formula: "KI", color: "#ffeeaa", type: "salt", category: "SALTS", volumeMl: 30, molarMass: 166.0, defaultMoles: 0.3, description: "Catalyst for H₂O₂ decomposition" },
  { id: "kmno4", name: "Potassium Permanganate", formula: "KMnO₄", color: "#9900cc", type: "salt", category: "SALTS", volumeMl: 30, molarMass: 158.03, defaultMoles: 0.1, description: "Strong oxidizer, deep purple" },
  { id: "na2so4", name: "Sodium Sulfate", formula: "Na₂SO₄", color: "#eeeeff", type: "salt", category: "SALTS", volumeMl: 30, molarMass: 142.04, defaultMoles: 0.3, description: "Neutral salt, desiccant" },
  { id: "cacl2", name: "Calcium Chloride", formula: "CaCl₂", color: "#f5f5ee", type: "salt", category: "SALTS", volumeMl: 25, molarMass: 110.98, defaultMoles: 0.3, description: "Exothermic dissolution in water" },
  { id: "pbno3", name: "Lead(II) Nitrate", formula: "Pb(NO₃)₂", color: "#f0f0e0", type: "salt", category: "SALTS", volumeMl: 30, molarMass: 331.2, defaultMoles: 0.15, description: "Toxic, used in precipitation" },

  // NEUTRALS / METALS
  { id: "na", name: "Sodium Metal", formula: "Na", color: "#ff8800", type: "metal", category: "NEUTRALS", volumeMl: 10, molarMass: 22.99, defaultMoles: 0.1, description: "Highly reactive alkali metal" },
  { id: "fe", name: "Iron Filings", formula: "Fe", color: "#888888", type: "metal", category: "NEUTRALS", volumeMl: 15, molarMass: 55.845, defaultMoles: 0.15, description: "Ferromagnetic transition metal" },
  { id: "zn", name: "Zinc Granules", formula: "Zn", color: "#aaaacc", type: "metal", category: "NEUTRALS", volumeMl: 15, molarMass: 65.38, defaultMoles: 0.15, description: "Reactive metal, bluish-white" },
  { id: "mg", name: "Magnesium Ribbon", formula: "Mg", color: "#cccccc", type: "metal", category: "NEUTRALS", volumeMl: 10, molarMass: 24.305, defaultMoles: 0.1, description: "Burns with bright white flame" },
  { id: "al", name: "Aluminium Foil", formula: "Al", color: "#bbbbcc", type: "metal", category: "NEUTRALS", volumeMl: 10, molarMass: 26.982, defaultMoles: 0.1, description: "Amphoteric metal" },
  { id: "cu", name: "Copper Turnings", formula: "Cu", color: "#cc6633", type: "metal", category: "NEUTRALS", volumeMl: 15, molarMass: 63.546, defaultMoles: 0.1, description: "Ductile transition metal" },
  { id: "h2o2", name: "Hydrogen Peroxide", formula: "H₂O₂", color: "#ddeeff", type: "neutral", category: "NEUTRALS", volumeMl: 50, molarMass: 34.015, defaultMoles: 1.0, description: "Oxidizer, decomposes with catalyst" },
  { id: "ca", name: "Calcium Metal", formula: "Ca", color: "#ccbbaa", type: "metal", category: "NEUTRALS", volumeMl: 10, molarMass: 40.078, defaultMoles: 0.1, description: "Alkaline earth metal" },

  // INDICATORS
  { id: "phenol", name: "Phenolphthalein", formula: "C₂₀H₁₄O₄", color: "#ff44aa", type: "indicator", category: "INDICATORS", volumeMl: 5, molarMass: 318.32, defaultMoles: 0.001, description: "Turns pink in base (pH > 8.2), colorless in acid." },
  { id: "methyl_orange", name: "Methyl Orange", formula: "C₁₄H₁₄N₃NaO₃S", color: "#ff6600", type: "indicator", category: "INDICATORS", volumeMl: 5, molarMass: 327.33, defaultMoles: 0.001, description: "Red in acid (pH < 3.1), yellow in base." },
  { id: "litmus", name: "Litmus Solution", formula: "Litmus", color: "#8844cc", type: "indicator", category: "INDICATORS", volumeMl: 5, molarMass: 300, defaultMoles: 0.001, description: "Red in acid, blue in base." },
  { id: "universal_ind", name: "Universal Indicator", formula: "UI", color: "#44cc44", type: "indicator", category: "INDICATORS", volumeMl: 5, molarMass: 300, defaultMoles: 0.001, description: "Shows full pH color spectrum." },
  { id: "bromothymol", name: "Bromothymol Blue", formula: "C₂₇H₂₈Br₂O₅S", color: "#0088ff", type: "indicator", category: "INDICATORS", volumeMl: 5, molarMass: 624.38, defaultMoles: 0.001, description: "Yellow in acid, blue in base (pH 6-7.6)." },

  // ORGANICS
  { id: "ethanol", name: "Ethanol", formula: "C₂H₅OH", color: "#eeddcc", type: "organic", category: "ORGANICS", volumeMl: 50, molarMass: 46.07, defaultMoles: 1.0, description: "Common alcohol solvent" },
  { id: "methanol", name: "Methanol", formula: "CH₃OH", color: "#ddeedd", type: "organic", category: "ORGANICS", volumeMl: 50, molarMass: 32.04, defaultMoles: 1.0, description: "Wood alcohol, toxic" },
  { id: "acetone", name: "Acetone", formula: "(CH₃)₂CO", color: "#f5eedd", type: "organic", category: "ORGANICS", volumeMl: 50, molarMass: 58.08, defaultMoles: 0.8, description: "Common laboratory solvent" },
  { id: "glucose", name: "Glucose", formula: "C₆H₁₂O₆", color: "#ffeecc", type: "organic", category: "ORGANICS", volumeMl: 20, molarMass: 180.16, defaultMoles: 0.2, description: "Simple sugar, energy source" },
  { id: "sucrose", name: "Sucrose", formula: "C₁₂H₂₂O₁₁", color: "#fff5dd", type: "organic", category: "ORGANICS", volumeMl: 20, molarMass: 342.3, defaultMoles: 0.1, description: "Table sugar" },
  { id: "benzene", name: "Benzene", formula: "C₆H₆", color: "#eeeedd", type: "organic", category: "ORGANICS", volumeMl: 50, molarMass: 78.11, defaultMoles: 0.5, description: "Aromatic hydrocarbon" },

  // FAMOUS EXPERIMENTS
  { id: "famous_brown_ring", name: "Brown Ring Test", formula: "HNO₃+Fe", color: "#5c3317", type: "neutral", category: "FAMOUS", volumeMl: 50, molarMass: 0, defaultMoles: 1.0, description: "Simulate Nitrates Test with Fe. Add to Beaker!" },
  { id: "famous_blue_lake", name: "Aluminum Blue Lake", formula: "Al+Litmus", color: "#4455ff", type: "neutral", category: "FAMOUS", volumeMl: 50, molarMass: 0, defaultMoles: 1.0, description: "Al(OH)3 absorbs blue litmus. Add to see!" },
  { id: "famous_salt_analysis", name: "Salt Analysis", formula: "AgNO₃+NaCl", color: "#f0f0ff", type: "neutral", category: "FAMOUS", volumeMl: 50, molarMass: 0, defaultMoles: 1.0, description: "Silver nitrate + NaCl yielding a white precipitate" },
  { id: "famous_elephant", name: "Elephant Toothpaste", formula: "H₂O₂+KI", color: "#ffeedd", type: "neutral", category: "FAMOUS", volumeMl: 50, molarMass: 0, defaultMoles: 1.0, description: "Simulates decomposition of hydrogen peroxide" },
  { id: "famous_volcano", name: "Baking Soda Volcano", formula: "NaHCO₃+Vinegar", color: "#ff6633", type: "neutral", category: "FAMOUS", volumeMl: 50, molarMass: 0, defaultMoles: 1.0, description: "Classic CO₂ eruption experiment" },
];

// ============================================================
//  REACTION DATABASE — with ΔH values, limiting reagent info
// ============================================================

export const reactions: Reaction[] = [
  // ── ACID-BASE NEUTRALIZATIONS ──
  {
    reactants: ["hcl", "naoh"],
    productName: "Sodium Chloride + Water",
    productFormula: "NaCl + H₂O",
    productColor: "#88ddff",
    type: "neutralization",
    description: "HCl + NaOH → NaCl + H₂O",
    deltaH: -57.3,
    bubbles: false,
    observations: ["Solution warms up noticeably", "If phenolphthalein present: pink → colorless at endpoint"],
    limitingReagentNote: "1:1 molar ratio — limiting reagent is whichever has fewer moles",
  },
  {
    reactants: ["h2so4", "naoh"],
    productName: "Sodium Sulfate + Water",
    productFormula: "Na₂SO₄ + 2H₂O",
    productColor: "#aaddff",
    type: "neutralization",
    description: "H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O",
    deltaH: -114.0,
    bubbles: false,
    observations: ["Strong exothermic neutralization", "Requires 2:1 NaOH:H₂SO₄ for complete neutralization"],
    limitingReagentNote: "1:2 molar ratio (H₂SO₄:NaOH)",
  },
  {
    reactants: ["hcl", "nahco3"],
    productName: "Sodium Chloride + CO₂ + Water",
    productFormula: "NaCl + CO₂↑ + H₂O",
    productColor: "#ccffee",
    type: "acid-carbonate",
    description: "HCl + NaHCO₃ → NaCl + CO₂↑ + H₂O",
    deltaH: -12.0,
    bubbles: true,
    gasEvolved: "CO₂",
    observations: ["Vigorous effervescence observed", "CO₂ gas evolves with fizzing sound", "Solution froths if excess added"],
    limitingReagentNote: "1:1 molar ratio",
  },
  {
    reactants: ["ch3cooh", "naoh"],
    productName: "Sodium Acetate + Water",
    productFormula: "CH₃COONa + H₂O",
    productColor: "#ddeeff",
    type: "neutralization",
    description: "CH₃COOH + NaOH → CH₃COONa + H₂O",
    deltaH: -55.2,
    bubbles: false,
    observations: ["Weak acid partial neutralization", "Solution warms moderately"],
    limitingReagentNote: "1:1 molar ratio",
  },
  {
    reactants: ["hno3", "naoh"],
    productName: "Sodium Nitrate + Water",
    productFormula: "NaNO₃ + H₂O",
    productColor: "#ccddff",
    type: "neutralization",
    description: "HNO₃ + NaOH → NaNO₃ + H₂O",
    deltaH: -57.0,
    bubbles: false,
    observations: ["Strong acid-strong base neutralization"],
    limitingReagentNote: "1:1 molar ratio",
  },
  {
    reactants: ["h2so4", "nahco3"],
    productName: "Sodium Sulfate + CO₂ + Water",
    productFormula: "Na₂SO₄ + 2CO₂↑ + 2H₂O",
    productColor: "#cceeee",
    type: "acid-carbonate",
    description: "H₂SO₄ + 2NaHCO₃ → Na₂SO₄ + 2CO₂↑ + 2H₂O",
    deltaH: -18.0,
    bubbles: true,
    gasEvolved: "CO₂",
    observations: ["Effervescence from CO₂", "Double the gas compared to HCl+NaHCO₃"],
  },
  {
    reactants: ["hcl", "na2co3"],
    productName: "Sodium Chloride + CO₂ + Water",
    productFormula: "2NaCl + CO₂↑ + H₂O",
    productColor: "#ccddee",
    type: "acid-carbonate",
    description: "2HCl + Na₂CO₃ → 2NaCl + CO₂↑ + H₂O",
    deltaH: -25.0,
    bubbles: true,
    gasEvolved: "CO₂",
    observations: ["Brisk effervescence"],
  },

  // ── METAL DISPLACEMENT ──
  {
    reactants: ["na", "h2o"],
    productName: "Sodium Hydroxide + Hydrogen",
    productFormula: "2NaOH + H₂↑",
    productColor: "#ffaa44",
    type: "displacement",
    description: "2Na + 2H₂O → 2NaOH + H₂↑ (Violent Alkali Metal Reaction)",
    deltaH: -184.0,
    bubbles: true,
    gasEvolved: "H₂",
    observations: ["Sodium skates on water surface", "Vigorous fizzing & hissing", "May catch fire with lilac/orange flame", "Solution becomes strongly alkaline"],
  },
  {
    reactants: ["cuso4", "fe"],
    productName: "Iron(II) Sulfate + Copper",
    productFormula: "FeSO₄ + Cu↓",
    productColor: "#44aa66",
    type: "displacement",
    description: "CuSO₄ + Fe → FeSO₄ + Cu↓",
    deltaH: -152.0,
    bubbles: false,
    precipitate: true,
    observations: ["Reddish copper deposits on iron surface", "Blue color fades to green"],
  },
  {
    reactants: ["zn", "hcl"],
    productName: "Zinc Chloride + Hydrogen",
    productFormula: "ZnCl₂ + H₂↑",
    productColor: "#ccddee",
    type: "displacement",
    description: "Zn + 2HCl → ZnCl₂ + H₂↑",
    deltaH: -153.0,
    bubbles: true,
    gasEvolved: "H₂",
    observations: ["Zinc granules dissolve gradually", "Steady stream of H₂ bubbles", "Solution warms slightly"],
  },
  {
    reactants: ["mg", "hcl"],
    productName: "Magnesium Chloride + Hydrogen",
    productFormula: "MgCl₂ + H₂↑",
    productColor: "#ddeeee",
    type: "displacement",
    description: "Mg + 2HCl → MgCl₂ + H₂↑",
    deltaH: -462.0,
    bubbles: true,
    gasEvolved: "H₂",
    observations: ["Very vigorous reaction", "Magnesium dissolves rapidly", "Solution heats up significantly"],
  },
  {
    reactants: ["fe", "h2so4"],
    productName: "Iron(II) Sulfate + Hydrogen",
    productFormula: "FeSO₄ + H₂↑",
    productColor: "#aabbaa",
    type: "displacement",
    description: "Fe + H₂SO₄ → FeSO₄ + H₂↑",
    deltaH: -97.0,
    bubbles: true,
    gasEvolved: "H₂",
    observations: ["Slow dissolution of iron", "Green-tinted solution"],
  },
  {
    reactants: ["zn", "cuso4"],
    productName: "Zinc Sulfate + Copper",
    productFormula: "ZnSO₄ + Cu↓",
    productColor: "#eeeedd",
    type: "displacement",
    description: "Zn + CuSO₄ → ZnSO₄ + Cu↓",
    deltaH: -218.0,
    bubbles: false,
    precipitate: true,
    observations: ["Copper deposits on zinc surface", "Blue solution turns colorless"],
  },

  // ── H₂O₂ DECOMPOSITION (Elephant Toothpaste base) ──
  {
    reactants: ["h2o2", "ki"],
    productName: "Oxygen + Water (Catalyzed)",
    productFormula: "O₂↑ + H₂O",
    productColor: "#ffd700",
    type: "decomposition",
    description: "2H₂O₂ → 2H₂O + O₂↑ (KI catalyst — Elephant Toothpaste)",
    deltaH: -98.0,
    bubbles: true,
    gasEvolved: "O₂",
    observations: ["Rapid foaming and bubbling", "Steam generated", "Solution turns yellow-brown from iodine", "Exothermic — container heats up"],
    limitingReagentNote: "KI is a catalyst — not consumed. H₂O₂ is the limiting reagent.",
  },

  // ── PRECIPITATION ──
  {
    reactants: ["cuso4", "naoh"],
    productName: "Copper(II) Hydroxide precipitate",
    productFormula: "Cu(OH)₂↓ + Na₂SO₄",
    productColor: "#2288cc",
    type: "displacement",
    description: "CuSO₄ + 2NaOH → Cu(OH)₂↓ + Na₂SO₄",
    deltaH: -50.0,
    bubbles: false,
    precipitate: true,
    observations: ["Pale blue gelatinous precipitate forms", "Solution turns cloudy blue"],
    limitingReagentNote: "1:2 molar ratio (CuSO₄:NaOH)",
  },
  {
    reactants: ["agno3", "nacl"],
    productName: "Silver Chloride (white ppt)",
    productFormula: "AgCl↓ + NaNO₃",
    productColor: "#f0f0ff",
    type: "displacement",
    description: "AgNO₃ + NaCl → AgCl↓ + NaNO₃ (Halide Test)",
    deltaH: -65.5,
    bubbles: false,
    precipitate: true,
    observations: ["Curdy white precipitate forms instantly", "Precipitate is insoluble in water", "Turns purple on exposure to light (photosensitive)"],
  },
  {
    reactants: ["pbno3", "ki"],
    productName: "Lead(II) Iodide (yellow ppt)",
    productFormula: "PbI₂↓ + 2KNO₃",
    productColor: "#ffdd00",
    type: "displacement",
    description: "Pb(NO₃)₂ + 2KI → PbI₂↓ + 2KNO₃ (Golden Rain)",
    deltaH: -45.0,
    bubbles: false,
    precipitate: true,
    observations: ["Bright yellow precipitate forms", "Classic 'golden rain' experiment when heated and cooled"],
  },
  {
    reactants: ["fecl3", "naoh"],
    productName: "Iron(III) Hydroxide ppt",
    productFormula: "Fe(OH)₃↓ + 3NaCl",
    productColor: "#884400",
    type: "displacement",
    description: "FeCl₃ + 3NaOH → Fe(OH)₃↓ + 3NaCl",
    deltaH: -48.0,
    bubbles: false,
    precipitate: true,
    observations: ["Rusty brown precipitate forms", "Gelatinous texture"],
  },

  // ── COMPLEXATION / SPECIAL ──
  {
    reactants: ["hno3", "fe"],
    productName: "Brown Ring Test",
    productFormula: "[Fe(H₂O)₅(NO)]²⁺",
    productColor: "#5c3317",
    type: "complexation",
    description: "Famous Brown Ring Test for Nitrates! Formation of the nitrosyliron complex.",
    deltaH: -40.0,
    bubbles: false,
  },

  // ── INDICATOR COLOR CHANGES ──
  {
    reactants: ["phenol", "naoh"],
    productName: "Phenolphthalein Basic Pink",
    productFormula: "In²⁻ (Pink)",
    productColor: "#ff00aa",
    type: "indicator-color-change",
    description: "NaOH base deprotonates Phenolphthalein → intense pink!",
    deltaH: -5.0,
    bubbles: false,
    observations: ["Solution turns deep magenta/pink", "Color change is instantaneous", "Classic titration endpoint indicator"],
  },
  {
    reactants: ["litmus", "hcl"],
    productName: "Litmus Red",
    productFormula: "HLit (Red)",
    productColor: "#ff2222",
    type: "indicator-color-change",
    description: "Strong acid turns litmus solution bright red.",
    deltaH: -2.0,
    bubbles: false,
  },
  {
    reactants: ["litmus", "naoh"],
    productName: "Litmus Blue",
    productFormula: "Lit⁻ (Blue)",
    productColor: "#2244ff",
    type: "indicator-color-change",
    description: "Strong base turns litmus solution deep blue.",
    deltaH: -2.0,
    bubbles: false,
  },
  {
    reactants: ["methyl_orange", "hcl"],
    productName: "Methyl Orange Red",
    productFormula: "HIn (Red)",
    productColor: "#ff3333",
    type: "indicator-color-change",
    description: "Acid turns methyl orange from yellow to red.",
    deltaH: -1.5,
    bubbles: false,
  },

  // ── ALUMINIUM REACTIONS ──
  {
    reactants: ["al", "hcl"],
    productName: "Aluminium Chloride + Hydrogen",
    productFormula: "2AlCl₃ + 3H₂↑",
    productColor: "#ccddee",
    type: "displacement",
    description: "2Al + 6HCl → 2AlCl₃ + 3H₂↑",
    deltaH: -530.0,
    bubbles: true,
    gasEvolved: "H₂",
    observations: ["Aluminium dissolves slowly at first", "Reaction speeds up as protective oxide layer dissolves", "Vigorous H₂ evolution"],
  },
  {
    reactants: ["al", "nh3"],
    productName: "Aluminum Blue Lake Test",
    productFormula: "Al(OH)₃ + Litmus",
    productColor: "#4455ff",
    type: "complexation",
    description: "Famous Aluminum Blue Lake Test: Gelatinous precipitate absorbs blue litmus.",
    deltaH: -60.0,
    bubbles: false,
    precipitate: true,
  },

  // ── EXOTHERMIC DISSOLUTION ──
  {
    reactants: ["cacl2", "h2o"],
    productName: "Calcium Chloride (dissolved)",
    productFormula: "Ca²⁺(aq) + 2Cl⁻(aq)",
    productColor: "#ddeeff",
    type: "exothermic-dissolution",
    description: "CaCl₂ dissolves exothermically in water",
    deltaH: -82.0,
    bubbles: false,
    observations: ["Solution heats up significantly", "Used in hot packs"],
  },

  // ── KMnO₄ Reactions ──
  {
    reactants: ["kmno4", "h2o2"],
    productName: "Manganese Dioxide + Oxygen",
    productFormula: "MnO₂ + O₂↑ + KOH",
    productColor: "#664400",
    type: "oxidation",
    description: "2KMnO₄ + 3H₂O₂ → 2MnO₂ + 2KOH + 3O₂↑ + 2H₂O",
    deltaH: -120.0,
    bubbles: true,
    gasEvolved: "O₂",
    observations: ["Purple color fades to brown", "Vigorous bubbling of O₂", "Brown MnO₂ precipitate"],
  },

  // ── FAMOUS EXPERIMENT AUTO-TRIGGERS ──
  {
    reactants: ["famous_brown_ring", "h2o"],
    productName: "Brown Ring Complex",
    productFormula: "[Fe(H₂O)₅(NO)]²⁺",
    productColor: "#5c3317",
    type: "complexation",
    description: "Famous Brown Ring Test for Nitrates!",
    deltaH: -40.0,
    bubbles: false,
  },
  {
    reactants: ["famous_blue_lake", "h2o"],
    productName: "Aluminum Blue Lake Test",
    productFormula: "Al(OH)₃ + Litmus",
    productColor: "#4455ff",
    type: "complexation",
    description: "Famous Aluminum Blue Lake Test.",
    deltaH: -60.0,
    bubbles: false,
    precipitate: true,
  },
  {
    reactants: ["famous_salt_analysis", "h2o"],
    productName: "Silver Chloride (white ppt)",
    productFormula: "AgCl↓",
    productColor: "#f0f0ff",
    type: "displacement",
    description: "Salt Analysis: Halide Test — White precipitate.",
    deltaH: -65.5,
    bubbles: false,
    precipitate: true,
  },
  {
    reactants: ["famous_elephant", "h2o"],
    productName: "Elephant Toothpaste",
    productFormula: "2H₂O + O₂↑",
    productColor: "#ffeedd",
    type: "decomposition",
    description: "Rapid explosive decomposition of hydrogen peroxide!",
    deltaH: -200.0,
    bubbles: true,
    gasEvolved: "O₂",
    observations: ["Massive foam eruption", "Steamy cloud rises", "Solution becomes very hot"],
  },
  {
    reactants: ["famous_volcano", "h2o"],
    productName: "CO₂ Eruption",
    productFormula: "NaCl + CO₂↑ + H₂O",
    productColor: "#ff6633",
    type: "acid-carbonate",
    description: "Classic baking soda volcano — vinegar + baking soda = CO₂ eruption!",
    deltaH: -12.0,
    bubbles: true,
    gasEvolved: "CO₂",
    observations: ["Dramatic foaming eruption", "CO₂ gas causes 'lava' overflow"],
  },
];

// ============================================================
//  THERMODYNAMIC ENGINE
// ============================================================

const AMBIENT_TEMP = 25.0;  // °C
const WATER_SPECIFIC_HEAT = 4.184; // J/(g·°C)

export function createInitialBeakerState(): BeakerState {
  return {
    contents: [],
    totalVolumeMl: 0,
    temperature: AMBIENT_TEMP,
    pH: 7.0,
    liquidColor: "#4488ff",
    bubbling: false,
    heatGlow: false,
    dissolvedPercent: 100,
    molarity: {},
  };
}

export function findReaction(id1: string, id2: string): Reaction | undefined {
  return reactions.find(
    (r) =>
      (r.reactants[0] === id1 && r.reactants[1] === id2) ||
      (r.reactants[0] === id2 && r.reactants[1] === id1)
  );
}

export function calculateTemperatureChange(
  deltaH_kJperMol: number,
  moles: number,
  totalVolumeMl: number
): number {
  if (totalVolumeMl <= 0) return 0;
  // q = |ΔH| × n × 1000 (convert kJ to J)
  const q_joules = Math.abs(deltaH_kJperMol) * moles * 1000;
  // Assume density ≈ 1 g/mL for dilute aqueous solutions
  const mass_grams = totalVolumeMl;
  // ΔT = q / (m × c)
  const deltaT = q_joules / (mass_grams * WATER_SPECIFIC_HEAT);
  return deltaH_kJperMol < 0 ? deltaT : -deltaT;
}

export function estimatePH(contents: { chemical: Chemical; moles: number }[]): number {
  let acidMoles = 0;
  let baseMoles = 0;
  let totalVolL = 0;

  for (const { chemical, moles } of contents) {
    totalVolL += chemical.volumeMl / 1000;
    if (chemical.type === "acid") {
      acidMoles += moles;
    } else if (chemical.type === "base") {
      baseMoles += moles;
    }
  }

  if (totalVolL === 0) return 7;

  const netAcid = acidMoles - baseMoles;
  if (Math.abs(netAcid) < 0.001) return 7;

  if (netAcid > 0) {
    const concentration = netAcid / totalVolL;
    return Math.max(0, -Math.log10(Math.min(concentration, 10)));
  } else {
    const concentration = Math.abs(netAcid) / totalVolL;
    const pOH = Math.max(0, -Math.log10(Math.min(concentration, 10)));
    return Math.min(14, 14 - pOH);
  }
}

export function calculateMolarity(
  contents: { chemical: Chemical; moles: number }[],
  totalVolumeMl: number
): Record<string, number> {
  const molarity: Record<string, number> = {};
  const totalVolL = totalVolumeMl / 1000;
  if (totalVolL <= 0) return molarity;

  for (const { chemical, moles } of contents) {
    molarity[chemical.formula] = (molarity[chemical.formula] || 0) + moles / totalVolL;
  }
  return molarity;
}

export function getChemicalsByCategory(category: string): Chemical[] {
  return chemicals.filter((c) => c.category === category);
}

export const CATEGORIES = ["WATER", "ACIDS", "BASES", "SALTS", "NEUTRALS", "INDICATORS", "ORGANICS", "FAMOUS"] as const;
export type ChemCategory = typeof CATEGORIES[number];
