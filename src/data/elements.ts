export type ElementCategory =
  | "alkali-metal"
  | "alkaline-earth"
  | "transition-metal"
  | "post-transition-metal"
  | "metalloid"
  | "nonmetal"
  | "halogen"
  | "noble-gas"
  | "lanthanide"
  | "actinide";

export interface Element {
  number: number;
  symbol: string;
  name: string;
  mass: number;
  category: ElementCategory;
  group: number | null;
  period: number;
  electronConfig: string;
  col: number; // 1-18 grid column
  row: number; // 1-9 grid row (8-9 for lanthanides/actinides)
}

export const categoryColors: Record<ElementCategory, string> = {
  "alkali-metal": "185 100% 55%",        // electric cyan
  "alkaline-earth": "45 100% 60%",       // bright gold
  "transition-metal": "210 100% 65%",    // vivid blue
  "post-transition-metal": "160 100% 50%", // neon teal
  "metalloid": "280 100% 65%",           // electric purple
  "nonmetal": "130 100% 55%",            // neon green
  "halogen": "340 100% 65%",             // hot pink
  "noble-gas": "260 100% 70%",           // bright violet
  "lanthanide": "25 100% 60%",           // neon orange
  "actinide": "0 100% 60%",              // bright red
};

export const categoryLabels: Record<ElementCategory, string> = {
  "alkali-metal": "Alkali Metal",
  "alkaline-earth": "Alkaline Earth",
  "transition-metal": "Transition Metal",
  "post-transition-metal": "Post-Transition",
  "metalloid": "Metalloid",
  "nonmetal": "Nonmetal",
  "halogen": "Halogen",
  "noble-gas": "Noble Gas",
  "lanthanide": "Lanthanide",
  "actinide": "Actinide",
};

// Periodic Table data for all 118 elements with grid positions
export const elements: Element[] = [
  // Period 1
  { number: 1, symbol: "H", name: "Hydrogen", mass: 1.008, category: "nonmetal", group: 1, period: 1, electronConfig: "1s¹", col: 1, row: 1 },
  { number: 2, symbol: "He", name: "Helium", mass: 4.003, category: "noble-gas", group: 18, period: 1, electronConfig: "1s²", col: 18, row: 1 },
  // Period 2
  { number: 3, symbol: "Li", name: "Lithium", mass: 6.941, category: "alkali-metal", group: 1, period: 2, electronConfig: "[He] 2s¹", col: 1, row: 2 },
  { number: 4, symbol: "Be", name: "Beryllium", mass: 9.012, category: "alkaline-earth", group: 2, period: 2, electronConfig: "[He] 2s²", col: 2, row: 2 },
  { number: 5, symbol: "B", name: "Boron", mass: 10.81, category: "metalloid", group: 13, period: 2, electronConfig: "[He] 2s² 2p¹", col: 13, row: 2 },
  { number: 6, symbol: "C", name: "Carbon", mass: 12.01, category: "nonmetal", group: 14, period: 2, electronConfig: "[He] 2s² 2p²", col: 14, row: 2 },
  { number: 7, symbol: "N", name: "Nitrogen", mass: 14.01, category: "nonmetal", group: 15, period: 2, electronConfig: "[He] 2s² 2p³", col: 15, row: 2 },
  { number: 8, symbol: "O", name: "Oxygen", mass: 16.00, category: "nonmetal", group: 16, period: 2, electronConfig: "[He] 2s² 2p⁴", col: 16, row: 2 },
  { number: 9, symbol: "F", name: "Fluorine", mass: 19.00, category: "halogen", group: 17, period: 2, electronConfig: "[He] 2s² 2p⁵", col: 17, row: 2 },
  { number: 10, symbol: "Ne", name: "Neon", mass: 20.18, category: "noble-gas", group: 18, period: 2, electronConfig: "[He] 2s² 2p⁶", col: 18, row: 2 },
  // Period 3
  { number: 11, symbol: "Na", name: "Sodium", mass: 22.99, category: "alkali-metal", group: 1, period: 3, electronConfig: "[Ne] 3s¹", col: 1, row: 3 },
  { number: 12, symbol: "Mg", name: "Magnesium", mass: 24.31, category: "alkaline-earth", group: 2, period: 3, electronConfig: "[Ne] 3s²", col: 2, row: 3 },
  { number: 13, symbol: "Al", name: "Aluminium", mass: 26.98, category: "post-transition-metal", group: 13, period: 3, electronConfig: "[Ne] 3s² 3p¹", col: 13, row: 3 },
  { number: 14, symbol: "Si", name: "Silicon", mass: 28.09, category: "metalloid", group: 14, period: 3, electronConfig: "[Ne] 3s² 3p²", col: 14, row: 3 },
  { number: 15, symbol: "P", name: "Phosphorus", mass: 30.97, category: "nonmetal", group: 15, period: 3, electronConfig: "[Ne] 3s² 3p³", col: 15, row: 3 },
  { number: 16, symbol: "S", name: "Sulfur", mass: 32.07, category: "nonmetal", group: 16, period: 3, electronConfig: "[Ne] 3s² 3p⁴", col: 16, row: 3 },
  { number: 17, symbol: "Cl", name: "Chlorine", mass: 35.45, category: "halogen", group: 17, period: 3, electronConfig: "[Ne] 3s² 3p⁵", col: 17, row: 3 },
  { number: 18, symbol: "Ar", name: "Argon", mass: 39.95, category: "noble-gas", group: 18, period: 3, electronConfig: "[Ne] 3s² 3p⁶", col: 18, row: 3 },
  // Period 4
  { number: 19, symbol: "K", name: "Potassium", mass: 39.10, category: "alkali-metal", group: 1, period: 4, electronConfig: "[Ar] 4s¹", col: 1, row: 4 },
  { number: 20, symbol: "Ca", name: "Calcium", mass: 40.08, category: "alkaline-earth", group: 2, period: 4, electronConfig: "[Ar] 4s²", col: 2, row: 4 },
  { number: 21, symbol: "Sc", name: "Scandium", mass: 44.96, category: "transition-metal", group: 3, period: 4, electronConfig: "[Ar] 3d¹ 4s²", col: 3, row: 4 },
  { number: 22, symbol: "Ti", name: "Titanium", mass: 47.87, category: "transition-metal", group: 4, period: 4, electronConfig: "[Ar] 3d² 4s²", col: 4, row: 4 },
  { number: 23, symbol: "V", name: "Vanadium", mass: 50.94, category: "transition-metal", group: 5, period: 4, electronConfig: "[Ar] 3d³ 4s²", col: 5, row: 4 },
  { number: 24, symbol: "Cr", name: "Chromium", mass: 52.00, category: "transition-metal", group: 6, period: 4, electronConfig: "[Ar] 3d⁵ 4s¹", col: 6, row: 4 },
  { number: 25, symbol: "Mn", name: "Manganese", mass: 54.94, category: "transition-metal", group: 7, period: 4, electronConfig: "[Ar] 3d⁵ 4s²", col: 7, row: 4 },
  { number: 26, symbol: "Fe", name: "Iron", mass: 55.85, category: "transition-metal", group: 8, period: 4, electronConfig: "[Ar] 3d⁶ 4s²", col: 8, row: 4 },
  { number: 27, symbol: "Co", name: "Cobalt", mass: 58.93, category: "transition-metal", group: 9, period: 4, electronConfig: "[Ar] 3d⁷ 4s²", col: 9, row: 4 },
  { number: 28, symbol: "Ni", name: "Nickel", mass: 58.69, category: "transition-metal", group: 10, period: 4, electronConfig: "[Ar] 3d⁸ 4s²", col: 10, row: 4 },
  { number: 29, symbol: "Cu", name: "Copper", mass: 63.55, category: "transition-metal", group: 11, period: 4, electronConfig: "[Ar] 3d¹⁰ 4s¹", col: 11, row: 4 },
  { number: 30, symbol: "Zn", name: "Zinc", mass: 65.38, category: "transition-metal", group: 12, period: 4, electronConfig: "[Ar] 3d¹⁰ 4s²", col: 12, row: 4 },
  { number: 31, symbol: "Ga", name: "Gallium", mass: 69.72, category: "post-transition-metal", group: 13, period: 4, electronConfig: "[Ar] 3d¹⁰ 4s² 4p¹", col: 13, row: 4 },
  { number: 32, symbol: "Ge", name: "Germanium", mass: 72.63, category: "metalloid", group: 14, period: 4, electronConfig: "[Ar] 3d¹⁰ 4s² 4p²", col: 14, row: 4 },
  { number: 33, symbol: "As", name: "Arsenic", mass: 74.92, category: "metalloid", group: 15, period: 4, electronConfig: "[Ar] 3d¹⁰ 4s² 4p³", col: 15, row: 4 },
  { number: 34, symbol: "Se", name: "Selenium", mass: 78.97, category: "nonmetal", group: 16, period: 4, electronConfig: "[Ar] 3d¹⁰ 4s² 4p⁴", col: 16, row: 4 },
  { number: 35, symbol: "Br", name: "Bromine", mass: 79.90, category: "halogen", group: 17, period: 4, electronConfig: "[Ar] 3d¹⁰ 4s² 4p⁵", col: 17, row: 4 },
  { number: 36, symbol: "Kr", name: "Krypton", mass: 83.80, category: "noble-gas", group: 18, period: 4, electronConfig: "[Ar] 3d¹⁰ 4s² 4p⁶", col: 18, row: 4 },
  // Period 5
  { number: 37, symbol: "Rb", name: "Rubidium", mass: 85.47, category: "alkali-metal", group: 1, period: 5, electronConfig: "[Kr] 5s¹", col: 1, row: 5 },
  { number: 38, symbol: "Sr", name: "Strontium", mass: 87.62, category: "alkaline-earth", group: 2, period: 5, electronConfig: "[Kr] 5s²", col: 2, row: 5 },
  { number: 39, symbol: "Y", name: "Yttrium", mass: 88.91, category: "transition-metal", group: 3, period: 5, electronConfig: "[Kr] 4d¹ 5s²", col: 3, row: 5 },
  { number: 40, symbol: "Zr", name: "Zirconium", mass: 91.22, category: "transition-metal", group: 4, period: 5, electronConfig: "[Kr] 4d² 5s²", col: 4, row: 5 },
  { number: 41, symbol: "Nb", name: "Niobium", mass: 92.91, category: "transition-metal", group: 5, period: 5, electronConfig: "[Kr] 4d⁴ 5s¹", col: 5, row: 5 },
  { number: 42, symbol: "Mo", name: "Molybdenum", mass: 95.95, category: "transition-metal", group: 6, period: 5, electronConfig: "[Kr] 4d⁵ 5s¹", col: 6, row: 5 },
  { number: 43, symbol: "Tc", name: "Technetium", mass: 98, category: "transition-metal", group: 7, period: 5, electronConfig: "[Kr] 4d⁵ 5s²", col: 7, row: 5 },
  { number: 44, symbol: "Ru", name: "Ruthenium", mass: 101.1, category: "transition-metal", group: 8, period: 5, electronConfig: "[Kr] 4d⁷ 5s¹", col: 8, row: 5 },
  { number: 45, symbol: "Rh", name: "Rhodium", mass: 102.9, category: "transition-metal", group: 9, period: 5, electronConfig: "[Kr] 4d⁸ 5s¹", col: 9, row: 5 },
  { number: 46, symbol: "Pd", name: "Palladium", mass: 106.4, category: "transition-metal", group: 10, period: 5, electronConfig: "[Kr] 4d¹⁰", col: 10, row: 5 },
  { number: 47, symbol: "Ag", name: "Silver", mass: 107.9, category: "transition-metal", group: 11, period: 5, electronConfig: "[Kr] 4d¹⁰ 5s¹", col: 11, row: 5 },
  { number: 48, symbol: "Cd", name: "Cadmium", mass: 112.4, category: "transition-metal", group: 12, period: 5, electronConfig: "[Kr] 4d¹⁰ 5s²", col: 12, row: 5 },
  { number: 49, symbol: "In", name: "Indium", mass: 114.8, category: "post-transition-metal", group: 13, period: 5, electronConfig: "[Kr] 4d¹⁰ 5s² 5p¹", col: 13, row: 5 },
  { number: 50, symbol: "Sn", name: "Tin", mass: 118.7, category: "post-transition-metal", group: 14, period: 5, electronConfig: "[Kr] 4d¹⁰ 5s² 5p²", col: 14, row: 5 },
  { number: 51, symbol: "Sb", name: "Antimony", mass: 121.8, category: "metalloid", group: 15, period: 5, electronConfig: "[Kr] 4d¹⁰ 5s² 5p³", col: 15, row: 5 },
  { number: 52, symbol: "Te", name: "Tellurium", mass: 127.6, category: "metalloid", group: 16, period: 5, electronConfig: "[Kr] 4d¹⁰ 5s² 5p⁴", col: 16, row: 5 },
  { number: 53, symbol: "I", name: "Iodine", mass: 126.9, category: "halogen", group: 17, period: 5, electronConfig: "[Kr] 4d¹⁰ 5s² 5p⁵", col: 17, row: 5 },
  { number: 54, symbol: "Xe", name: "Xenon", mass: 131.3, category: "noble-gas", group: 18, period: 5, electronConfig: "[Kr] 4d¹⁰ 5s² 5p⁶", col: 18, row: 5 },
  // Period 6
  { number: 55, symbol: "Cs", name: "Caesium", mass: 132.9, category: "alkali-metal", group: 1, period: 6, electronConfig: "[Xe] 6s¹", col: 1, row: 6 },
  { number: 56, symbol: "Ba", name: "Barium", mass: 137.3, category: "alkaline-earth", group: 2, period: 6, electronConfig: "[Xe] 6s²", col: 2, row: 6 },
  // Lanthanides (57-71) → row 8
  { number: 57, symbol: "La", name: "Lanthanum", mass: 138.9, category: "lanthanide", group: null, period: 6, electronConfig: "[Xe] 5d¹ 6s²", col: 3, row: 8 },
  { number: 58, symbol: "Ce", name: "Cerium", mass: 140.1, category: "lanthanide", group: null, period: 6, electronConfig: "[Xe] 4f¹ 5d¹ 6s²", col: 4, row: 8 },
  { number: 59, symbol: "Pr", name: "Praseodymium", mass: 140.9, category: "lanthanide", group: null, period: 6, electronConfig: "[Xe] 4f³ 6s²", col: 5, row: 8 },
  { number: 60, symbol: "Nd", name: "Neodymium", mass: 144.2, category: "lanthanide", group: null, period: 6, electronConfig: "[Xe] 4f⁴ 6s²", col: 6, row: 8 },
  { number: 61, symbol: "Pm", name: "Promethium", mass: 145, category: "lanthanide", group: null, period: 6, electronConfig: "[Xe] 4f⁵ 6s²", col: 7, row: 8 },
  { number: 62, symbol: "Sm", name: "Samarium", mass: 150.4, category: "lanthanide", group: null, period: 6, electronConfig: "[Xe] 4f⁶ 6s²", col: 8, row: 8 },
  { number: 63, symbol: "Eu", name: "Europium", mass: 152.0, category: "lanthanide", group: null, period: 6, electronConfig: "[Xe] 4f⁷ 6s²", col: 9, row: 8 },
  { number: 64, symbol: "Gd", name: "Gadolinium", mass: 157.3, category: "lanthanide", group: null, period: 6, electronConfig: "[Xe] 4f⁷ 5d¹ 6s²", col: 10, row: 8 },
  { number: 65, symbol: "Tb", name: "Terbium", mass: 158.9, category: "lanthanide", group: null, period: 6, electronConfig: "[Xe] 4f⁹ 6s²", col: 11, row: 8 },
  { number: 66, symbol: "Dy", name: "Dysprosium", mass: 162.5, category: "lanthanide", group: null, period: 6, electronConfig: "[Xe] 4f¹⁰ 6s²", col: 12, row: 8 },
  { number: 67, symbol: "Ho", name: "Holmium", mass: 164.9, category: "lanthanide", group: null, period: 6, electronConfig: "[Xe] 4f¹¹ 6s²", col: 13, row: 8 },
  { number: 68, symbol: "Er", name: "Erbium", mass: 167.3, category: "lanthanide", group: null, period: 6, electronConfig: "[Xe] 4f¹² 6s²", col: 14, row: 8 },
  { number: 69, symbol: "Tm", name: "Thulium", mass: 168.9, category: "lanthanide", group: null, period: 6, electronConfig: "[Xe] 4f¹³ 6s²", col: 15, row: 8 },
  { number: 70, symbol: "Yb", name: "Ytterbium", mass: 173.0, category: "lanthanide", group: null, period: 6, electronConfig: "[Xe] 4f¹⁴ 6s²", col: 16, row: 8 },
  { number: 71, symbol: "Lu", name: "Lutetium", mass: 175.0, category: "lanthanide", group: null, period: 6, electronConfig: "[Xe] 4f¹⁴ 5d¹ 6s²", col: 17, row: 8 },
  // Continue period 6
  { number: 72, symbol: "Hf", name: "Hafnium", mass: 178.5, category: "transition-metal", group: 4, period: 6, electronConfig: "[Xe] 4f¹⁴ 5d² 6s²", col: 4, row: 6 },
  { number: 73, symbol: "Ta", name: "Tantalum", mass: 180.9, category: "transition-metal", group: 5, period: 6, electronConfig: "[Xe] 4f¹⁴ 5d³ 6s²", col: 5, row: 6 },
  { number: 74, symbol: "W", name: "Tungsten", mass: 183.8, category: "transition-metal", group: 6, period: 6, electronConfig: "[Xe] 4f¹⁴ 5d⁴ 6s²", col: 6, row: 6 },
  { number: 75, symbol: "Re", name: "Rhenium", mass: 186.2, category: "transition-metal", group: 7, period: 6, electronConfig: "[Xe] 4f¹⁴ 5d⁵ 6s²", col: 7, row: 6 },
  { number: 76, symbol: "Os", name: "Osmium", mass: 190.2, category: "transition-metal", group: 8, period: 6, electronConfig: "[Xe] 4f¹⁴ 5d⁶ 6s²", col: 8, row: 6 },
  { number: 77, symbol: "Ir", name: "Iridium", mass: 192.2, category: "transition-metal", group: 9, period: 6, electronConfig: "[Xe] 4f¹⁴ 5d⁷ 6s²", col: 9, row: 6 },
  { number: 78, symbol: "Pt", name: "Platinum", mass: 195.1, category: "transition-metal", group: 10, period: 6, electronConfig: "[Xe] 4f¹⁴ 5d⁹ 6s¹", col: 10, row: 6 },
  { number: 79, symbol: "Au", name: "Gold", mass: 197.0, category: "transition-metal", group: 11, period: 6, electronConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s¹", col: 11, row: 6 },
  { number: 80, symbol: "Hg", name: "Mercury", mass: 200.6, category: "transition-metal", group: 12, period: 6, electronConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s²", col: 12, row: 6 },
  { number: 81, symbol: "Tl", name: "Thallium", mass: 204.4, category: "post-transition-metal", group: 13, period: 6, electronConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p¹", col: 13, row: 6 },
  { number: 82, symbol: "Pb", name: "Lead", mass: 207.2, category: "post-transition-metal", group: 14, period: 6, electronConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²", col: 14, row: 6 },
  { number: 83, symbol: "Bi", name: "Bismuth", mass: 209.0, category: "post-transition-metal", group: 15, period: 6, electronConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p³", col: 15, row: 6 },
  { number: 84, symbol: "Po", name: "Polonium", mass: 209, category: "metalloid", group: 16, period: 6, electronConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁴", col: 16, row: 6 },
  { number: 85, symbol: "At", name: "Astatine", mass: 210, category: "halogen", group: 17, period: 6, electronConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁵", col: 17, row: 6 },
  { number: 86, symbol: "Rn", name: "Radon", mass: 222, category: "noble-gas", group: 18, period: 6, electronConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶", col: 18, row: 6 },
  // Period 7
  { number: 87, symbol: "Fr", name: "Francium", mass: 223, category: "alkali-metal", group: 1, period: 7, electronConfig: "[Rn] 7s¹", col: 1, row: 7 },
  { number: 88, symbol: "Ra", name: "Radium", mass: 226, category: "alkaline-earth", group: 2, period: 7, electronConfig: "[Rn] 7s²", col: 2, row: 7 },
  // Actinides (89-103) → row 9
  { number: 89, symbol: "Ac", name: "Actinium", mass: 227, category: "actinide", group: null, period: 7, electronConfig: "[Rn] 6d¹ 7s²", col: 3, row: 9 },
  { number: 90, symbol: "Th", name: "Thorium", mass: 232.0, category: "actinide", group: null, period: 7, electronConfig: "[Rn] 6d² 7s²", col: 4, row: 9 },
  { number: 91, symbol: "Pa", name: "Protactinium", mass: 231.0, category: "actinide", group: null, period: 7, electronConfig: "[Rn] 5f² 6d¹ 7s²", col: 5, row: 9 },
  { number: 92, symbol: "U", name: "Uranium", mass: 238.0, category: "actinide", group: null, period: 7, electronConfig: "[Rn] 5f³ 6d¹ 7s²", col: 6, row: 9 },
  { number: 93, symbol: "Np", name: "Neptunium", mass: 237, category: "actinide", group: null, period: 7, electronConfig: "[Rn] 5f⁴ 6d¹ 7s²", col: 7, row: 9 },
  { number: 94, symbol: "Pu", name: "Plutonium", mass: 244, category: "actinide", group: null, period: 7, electronConfig: "[Rn] 5f⁶ 7s²", col: 8, row: 9 },
  { number: 95, symbol: "Am", name: "Americium", mass: 243, category: "actinide", group: null, period: 7, electronConfig: "[Rn] 5f⁷ 7s²", col: 9, row: 9 },
  { number: 96, symbol: "Cm", name: "Curium", mass: 247, category: "actinide", group: null, period: 7, electronConfig: "[Rn] 5f⁷ 6d¹ 7s²", col: 10, row: 9 },
  { number: 97, symbol: "Bk", name: "Berkelium", mass: 247, category: "actinide", group: null, period: 7, electronConfig: "[Rn] 5f⁹ 7s²", col: 11, row: 9 },
  { number: 98, symbol: "Cf", name: "Californium", mass: 251, category: "actinide", group: null, period: 7, electronConfig: "[Rn] 5f¹⁰ 7s²", col: 12, row: 9 },
  { number: 99, symbol: "Es", name: "Einsteinium", mass: 252, category: "actinide", group: null, period: 7, electronConfig: "[Rn] 5f¹¹ 7s²", col: 13, row: 9 },
  { number: 100, symbol: "Fm", name: "Fermium", mass: 257, category: "actinide", group: null, period: 7, electronConfig: "[Rn] 5f¹² 7s²", col: 14, row: 9 },
  { number: 101, symbol: "Md", name: "Mendelevium", mass: 258, category: "actinide", group: null, period: 7, electronConfig: "[Rn] 5f¹³ 7s²", col: 15, row: 9 },
  { number: 102, symbol: "No", name: "Nobelium", mass: 259, category: "actinide", group: null, period: 7, electronConfig: "[Rn] 5f¹⁴ 7s²", col: 16, row: 9 },
  { number: 103, symbol: "Lr", name: "Lawrencium", mass: 266, category: "actinide", group: null, period: 7, electronConfig: "[Rn] 5f¹⁴ 7s² 7p¹", col: 17, row: 9 },
  // Continue period 7
  { number: 104, symbol: "Rf", name: "Rutherfordium", mass: 267, category: "transition-metal", group: 4, period: 7, electronConfig: "[Rn] 5f¹⁴ 6d² 7s²", col: 4, row: 7 },
  { number: 105, symbol: "Db", name: "Dubnium", mass: 268, category: "transition-metal", group: 5, period: 7, electronConfig: "[Rn] 5f¹⁴ 6d³ 7s²", col: 5, row: 7 },
  { number: 106, symbol: "Sg", name: "Seaborgium", mass: 271, category: "transition-metal", group: 6, period: 7, electronConfig: "[Rn] 5f¹⁴ 6d⁴ 7s²", col: 6, row: 7 },
  { number: 107, symbol: "Bh", name: "Bohrium", mass: 270, category: "transition-metal", group: 7, period: 7, electronConfig: "[Rn] 5f¹⁴ 6d⁵ 7s²", col: 7, row: 7 },
  { number: 108, symbol: "Hs", name: "Hassium", mass: 277, category: "transition-metal", group: 8, period: 7, electronConfig: "[Rn] 5f¹⁴ 6d⁶ 7s²", col: 8, row: 7 },
  { number: 109, symbol: "Mt", name: "Meitnerium", mass: 278, category: "transition-metal", group: 9, period: 7, electronConfig: "[Rn] 5f¹⁴ 6d⁷ 7s²", col: 9, row: 7 },
  { number: 110, symbol: "Ds", name: "Darmstadtium", mass: 281, category: "transition-metal", group: 10, period: 7, electronConfig: "[Rn] 5f¹⁴ 6d⁸ 7s²", col: 10, row: 7 },
  { number: 111, symbol: "Rg", name: "Roentgenium", mass: 282, category: "transition-metal", group: 11, period: 7, electronConfig: "[Rn] 5f¹⁴ 6d⁹ 7s²", col: 11, row: 7 },
  { number: 112, symbol: "Cn", name: "Copernicium", mass: 285, category: "transition-metal", group: 12, period: 7, electronConfig: "[Rn] 5f¹⁴ 6d¹⁰ 7s²", col: 12, row: 7 },
  { number: 113, symbol: "Nh", name: "Nihonium", mass: 286, category: "post-transition-metal", group: 13, period: 7, electronConfig: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p¹", col: 13, row: 7 },
  { number: 114, symbol: "Fl", name: "Flerovium", mass: 289, category: "post-transition-metal", group: 14, period: 7, electronConfig: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p²", col: 14, row: 7 },
  { number: 115, symbol: "Mc", name: "Moscovium", mass: 290, category: "post-transition-metal", group: 15, period: 7, electronConfig: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p³", col: 15, row: 7 },
  { number: 116, symbol: "Lv", name: "Livermorium", mass: 293, category: "post-transition-metal", group: 16, period: 7, electronConfig: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁴", col: 16, row: 7 },
  { number: 117, symbol: "Ts", name: "Tennessine", mass: 294, category: "halogen", group: 17, period: 7, electronConfig: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁵", col: 17, row: 7 },
  { number: 118, symbol: "Og", name: "Oganesson", mass: 294, category: "noble-gas", group: 18, period: 7, electronConfig: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶", col: 18, row: 7 },
];

// Electron shell configuration for Bohr model visualization
export const electronShells: Record<number, number[]> = {
  1: [1], 2: [2], 3: [2,1], 4: [2,2], 5: [2,3], 6: [2,4], 7: [2,5], 8: [2,6], 9: [2,7], 10: [2,8],
  11: [2,8,1], 12: [2,8,2], 13: [2,8,3], 14: [2,8,4], 15: [2,8,5], 16: [2,8,6], 17: [2,8,7], 18: [2,8,8],
  19: [2,8,8,1], 20: [2,8,8,2], 21: [2,8,9,2], 22: [2,8,10,2], 23: [2,8,11,2], 24: [2,8,13,1], 25: [2,8,13,2],
  26: [2,8,14,2], 27: [2,8,15,2], 28: [2,8,16,2], 29: [2,8,18,1], 30: [2,8,18,2], 31: [2,8,18,3], 32: [2,8,18,4],
  33: [2,8,18,5], 34: [2,8,18,6], 35: [2,8,18,7], 36: [2,8,18,8],
};

// Hydrogen emission spectra wavelengths (nm)
export const hydrogenSpectra = {
  lyman: [121.6, 102.6, 97.3, 95.0, 93.8, 93.1],
  balmer: [656.3, 486.1, 434.0, 410.2, 397.0],
};

// Real spectral data for key elements (nm)
export const elementSpectra: Record<number, { nm: number; label: string }[]> = {
  1: [ // Hydrogen
    { nm: 656.3, label: "H-alpha" },
    { nm: 486.1, label: "H-beta" },
    { nm: 434.0, label: "H-gamma" },
    { nm: 410.2, label: "H-delta" },
    { nm: 397.0, label: "Balmer-ε" }
  ],
  2: [ // Helium
    { nm: 667.8, label: "He-Red" },
    { nm: 587.6, label: "He-Yellow" },
    { nm: 501.6, label: "He-Cyan" },
    { nm: 447.1, label: "He-Blue" },
    { nm: 402.6, label: "He-Violet" },
    { nm: 388.9, label: "He-UV" }
  ],
  10: [ // Neon
    { nm: 640.2, label: "Ne-Red" },
    { nm: 614.3, label: "Ne-Orange" },
    { nm: 585.2, label: "Ne-Yellow" },
    { nm: 540.1, label: "Ne-Green" },
    { nm: 534.1, label: "Ne-Green" },
    { nm: 588.2, label: "Ne-Yellow" }
  ],
  11: [ // Sodium
    { nm: 589.0, label: "Na D2 Line" },
    { nm: 589.6, label: "Na D1 Line" },
    { nm: 330.2, label: "Na UV" },
    { nm: 819.5, label: "Na NIR" }
  ],
  80: [ // Mercury
    { nm: 615.0, label: "Hg-Red" },
    { nm: 546.1, label: "Hg-Green" },
    { nm: 435.8, label: "Hg-Blue" },
    { nm: 404.7, label: "Hg-Violet" },
    { nm: 365.0, label: "Hg-UV" }
  ]
};

// Compatibility aliases for AtomicViewer module
export type ElementData = Element & { atomicNumber: number };
export const periodicTable: ElementData[] = elements.map((el) => ({
  ...el,
  atomicNumber: el.number,
}));

