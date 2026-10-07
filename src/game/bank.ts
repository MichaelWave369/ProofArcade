export type Domain = "arith" | "geom" | "phys" | "trig" | "const";
export type Special = "wild" | "burst" | "pulse";

export type ProblemDef = {
  canon: string;
  a: string;
  b?: string;
  domain: Domain;
  blurb: string;
  minWave: number;
};

export const PROBLEMS: ProblemDef[] = [
  { canon: "4", a: "2²", domain: "arith", blurb: "Two squared.", minWave: 1 },
  { canon: "4", a: "√16", domain: "arith", blurb: "Square root of 16.", minWave: 1 },
  { canon: "4", a: "8÷2", domain: "arith", blurb: "Eight divided by two.", minWave: 1 },
  { canon: "4", a: "6-2", domain: "arith", blurb: "Six minus two.", minWave: 1 },
  { canon: "4", a: "4·cos", b: "0°", domain: "trig", blurb: "4 × cos 0°. Cosine of 0° is 1.", minWave: 5 },

  { canon: "5", a: "3+2", domain: "arith", blurb: "Three plus two.", minWave: 3 },
  { canon: "5", a: "√25", domain: "arith", blurb: "Square root of 25.", minWave: 3 },
  { canon: "5", a: "10÷2", domain: "arith", blurb: "Ten divided by two.", minWave: 3 },
  { canon: "5", a: "3-4-5", b: "hyp", domain: "geom", blurb: "A 3-4-5 right triangle. The hypotenuse is 5.", minWave: 3 },

  { canon: "6", a: "2×3", domain: "arith", blurb: "Two times three.", minWave: 2 },
  { canon: "6", a: "√36", domain: "arith", blurb: "Square root of 36.", minWave: 2 },
  { canon: "6", a: "9-3", domain: "arith", blurb: "Nine minus three.", minWave: 2 },
  { canon: "6", a: "12÷2", domain: "arith", blurb: "Twelve divided by two.", minWave: 2 },

  { canon: "8", a: "2³", domain: "arith", blurb: "Two cubed.", minWave: 1 },
  { canon: "8", a: "√64", domain: "arith", blurb: "Square root of 64.", minWave: 1 },
  { canon: "8", a: "4×2", domain: "arith", blurb: "Four times two.", minWave: 1 },
  { canon: "8", a: "F=ma", b: "2·4", domain: "phys", blurb: "Force = mass × acceleration. m = 2, a = 4.", minWave: 2 },
  { canon: "8", a: "16·cos", b: "60°", domain: "trig", blurb: "16 × cos 60°. Cosine of 60° is 1/2.", minWave: 5 },

  { canon: "9", a: "3²", domain: "arith", blurb: "Three squared.", minWave: 1 },
  { canon: "9", a: "√81", domain: "arith", blurb: "Square root of 81.", minWave: 1 },
  { canon: "9", a: "18÷2", domain: "arith", blurb: "Eighteen divided by two.", minWave: 1 },
  { canon: "9", a: "6+3", domain: "arith", blurb: "Six plus three.", minWave: 1 },
  { canon: "9", a: "9·sin", b: "90°", domain: "trig", blurb: "9 × sin 90°. Sine of 90° is 1.", minWave: 5 },

  { canon: "10", a: "5×2", domain: "arith", blurb: "Five times two.", minWave: 4 },
  { canon: "10", a: "√100", domain: "arith", blurb: "Square root of 100.", minWave: 4 },
  { canon: "10", a: "p=mv", b: "2·5", domain: "phys", blurb: "Momentum = mass × velocity. m = 2, v = 5.", minWave: 4 },
  { canon: "10", a: "10·tan", b: "45°", domain: "trig", blurb: "10 × tan 45°. Tangent of 45° is 1.", minWave: 5 },

  { canon: "12", a: "3×4", domain: "arith", blurb: "Three times four.", minWave: 2 },
  { canon: "12", a: "√144", domain: "arith", blurb: "Square root of 144.", minWave: 2 },
  { canon: "12", a: "½bh", b: "6·4", domain: "geom", blurb: "Triangle area = ½ × base × height. b = 6, h = 4.", minWave: 2 },
  { canon: "12", a: "W=Fd", b: "3·4", domain: "phys", blurb: "Work = force × distance. F = 3, d = 4.", minWave: 3 },

  { canon: "15", a: "5×3", domain: "arith", blurb: "Five times three.", minWave: 4 },
  { canon: "15", a: "45÷3", domain: "arith", blurb: "Forty-five divided by three.", minWave: 4 },
  { canon: "15", a: "10+5", domain: "arith", blurb: "Ten plus five.", minWave: 4 },
  { canon: "15", a: "√225", domain: "arith", blurb: "Square root of 225.", minWave: 4 },

  { canon: "16", a: "4²", domain: "arith", blurb: "Four squared.", minWave: 3 },
  { canon: "16", a: "2⁴", domain: "arith", blurb: "Two to the fourth.", minWave: 3 },
  { canon: "16", a: "s²", b: "s=4", domain: "geom", blurb: "Area of a square. Side = 4.", minWave: 3 },
  { canon: "16", a: "4s", b: "s=4", domain: "geom", blurb: "Perimeter of a square. Side = 4.", minWave: 3 },
  { canon: "16", a: "½mv²", b: "2·4²", domain: "phys", blurb: "Kinetic energy ½mv². m = 2, v = 4.", minWave: 3 },

  { canon: "18", a: "9×2", domain: "arith", blurb: "Nine times two.", minWave: 4 },
  { canon: "18", a: "6×3", domain: "arith", blurb: "Six times three.", minWave: 4 },
  { canon: "18", a: "36÷2", domain: "arith", blurb: "Thirty-six divided by two.", minWave: 4 },
  { canon: "18", a: "F=ma", b: "3·6", domain: "phys", blurb: "Force = mass × acceleration. m = 3, a = 6.", minWave: 4 },

  { canon: "20", a: "4×5", domain: "arith", blurb: "Four times five.", minWave: 5 },
  { canon: "20", a: "√400", domain: "arith", blurb: "Square root of 400.", minWave: 5 },
  { canon: "20", a: "100÷5", domain: "arith", blurb: "One hundred divided by five.", minWave: 5 },
  { canon: "20", a: "2×10", domain: "arith", blurb: "Two times ten.", minWave: 5 },

  { canon: "25", a: "5²", domain: "arith", blurb: "Five squared.", minWave: 5 },
  { canon: "25", a: "√625", domain: "arith", blurb: "Square root of 625.", minWave: 5 },
  { canon: "25", a: "s²", b: "s=5", domain: "geom", blurb: "Area of a square. Side = 5.", minWave: 5 },
  { canon: "25", a: "50÷2", domain: "arith", blurb: "Fifty divided by two.", minWave: 5 },

  { canon: "36", a: "6²", domain: "arith", blurb: "Six squared.", minWave: 6 },
  { canon: "36", a: "9×4", domain: "arith", blurb: "Nine times four.", minWave: 6 },
  { canon: "36", a: "3×12", domain: "arith", blurb: "Three times twelve.", minWave: 6 },
  { canon: "36", a: "√1296", domain: "arith", blurb: "Square root of 1296.", minWave: 6 },

  { canon: "φ", a: "φ", domain: "const", blurb: "Phi, the golden ratio.", minWave: 6 },
  { canon: "φ", a: "1+√5", b: "÷ 2", domain: "const", blurb: "(1 + √5) / 2, the golden ratio.", minWave: 6 },
  { canon: "φ", a: "1.618", domain: "const", blurb: "Phi, about 1.618.", minWave: 6 },

  { canon: "4π", a: "πr²", b: "r=2", domain: "geom", blurb: "Circle area πr² with radius 2, which is 4π.", minWave: 6 },
  { canon: "4π", a: "2πr", b: "r=2", domain: "geom", blurb: "Circumference 2πr with radius 2, which is 4π.", minWave: 6 },
  { canon: "4π", a: "πd", b: "d=4", domain: "geom", blurb: "Circumference πd with diameter 4, which is 4π.", minWave: 6 },

  { canon: "7", a: "3+4", domain: "arith", blurb: "Three plus four.", minWave: 4 },
  { canon: "7", a: "√49", domain: "arith", blurb: "Square root of 49.", minWave: 4 },
  { canon: "7", a: "14÷2", domain: "arith", blurb: "Fourteen divided by two.", minWave: 4 },
  { canon: "7", a: "10−3", domain: "arith", blurb: "Ten minus three.", minWave: 4 },

  { canon: "1", a: "sin", b: "90°", domain: "trig", blurb: "Sine of 90° is 1.", minWave: 7 },
  { canon: "1", a: "cos", b: "0°", domain: "trig", blurb: "Cosine of 0° is 1.", minWave: 7 },
  { canon: "1", a: "tan", b: "45°", domain: "trig", blurb: "Tangent of 45° is 1.", minWave: 7 },
  { canon: "1", a: "7÷7", domain: "arith", blurb: "Seven divided by seven.", minWave: 7 },

  { canon: "24", a: "6×4", domain: "arith", blurb: "Six times four.", minWave: 5 },
  { canon: "24", a: "8×3", domain: "arith", blurb: "Eight times three.", minWave: 5 },
  { canon: "24", a: "48÷2", domain: "arith", blurb: "Forty-eight divided by two.", minWave: 5 },
  { canon: "24", a: "½bh", b: "8·6", domain: "geom", blurb: "Triangle area ½bh. Base 8, height 6.", minWave: 5 },

  { canon: "27", a: "3³", domain: "arith", blurb: "Three cubed.", minWave: 7 },
  { canon: "27", a: "9×3", domain: "arith", blurb: "Nine times three.", minWave: 7 },
  { canon: "27", a: "√729", domain: "arith", blurb: "Square root of 729.", minWave: 7 },
  { canon: "27", a: "F=ma", b: "9·3", domain: "phys", blurb: "Force = mass × acceleration. m = 9, a = 3.", minWave: 7 },

  { canon: "30", a: "5×6", domain: "arith", blurb: "Five times six.", minWave: 9 },
  { canon: "30", a: "60÷2", domain: "arith", blurb: "Sixty divided by two.", minWave: 9 },
  { canon: "30", a: "10×3", domain: "arith", blurb: "Ten times three.", minWave: 9 },
  { canon: "30", a: "p=mv", b: "5·6", domain: "phys", blurb: "Momentum = mass × velocity. m = 5, v = 6.", minWave: 9 },

  { canon: "32", a: "2⁵", domain: "arith", blurb: "Two to the fifth.", minWave: 8 },
  { canon: "32", a: "4×8", domain: "arith", blurb: "Four times eight.", minWave: 8 },
  { canon: "32", a: "√1024", domain: "arith", blurb: "Square root of 1024.", minWave: 8 },
  { canon: "32", a: "16×2", domain: "arith", blurb: "Sixteen times two.", minWave: 8 },

  { canon: "½", a: "1÷2", domain: "arith", blurb: "One divided by two.", minWave: 8 },
  { canon: "½", a: "sin", b: "30°", domain: "trig", blurb: "Sine of 30° is 1/2.", minWave: 8 },
  { canon: "½", a: "cos", b: "60°", domain: "trig", blurb: "Cosine of 60° is 1/2.", minWave: 8 },
  { canon: "½", a: "3÷6", domain: "arith", blurb: "Three divided by six.", minWave: 8 },

  { canon: "48", a: "6×8", domain: "arith", blurb: "Six times eight.", minWave: 10 },
  { canon: "48", a: "12×4", domain: "arith", blurb: "Twelve times four.", minWave: 10 },
  { canon: "48", a: "96÷2", domain: "arith", blurb: "Ninety-six divided by two.", minWave: 10 },
  { canon: "48", a: "W=Fd", b: "12·4", domain: "phys", blurb: "Work = force × distance. F = 12, d = 4.", minWave: 10 },

  { canon: "49", a: "7²", domain: "arith", blurb: "Seven squared.", minWave: 12 },
  { canon: "49", a: "√2401", domain: "arith", blurb: "Square root of 2401.", minWave: 12 },
  { canon: "49", a: "98÷2", domain: "arith", blurb: "Ninety-eight divided by two.", minWave: 12 },
  { canon: "49", a: "7×7", domain: "arith", blurb: "Seven times seven.", minWave: 12 },

  { canon: "64", a: "8²", domain: "arith", blurb: "Eight squared.", minWave: 12 },
  { canon: "64", a: "4³", domain: "arith", blurb: "Four cubed.", minWave: 12 },
  { canon: "64", a: "2⁶", domain: "arith", blurb: "Two to the sixth.", minWave: 12 },
  { canon: "64", a: "√4096", domain: "arith", blurb: "Square root of 4096.", minWave: 12 },

  { canon: "2π", a: "2πr", b: "r=1", domain: "geom", blurb: "Circumference 2πr with radius 1.", minWave: 11 },
  { canon: "2π", a: "πd", b: "d=2", domain: "geom", blurb: "Circumference πd with diameter 2.", minWave: 11 },
  { canon: "2π", a: "2π", domain: "const", blurb: "One full turn, in radians.", minWave: 11 },
];

export type WavePlan = { canons: string[]; rows: number; shots: number };

const WAVES: WavePlan[] = [
  { canons: ["4", "8", "9"], rows: 5, shots: 8 },
  { canons: ["6", "9", "12"], rows: 5, shots: 7 },
  { canons: ["5", "8", "12", "16"], rows: 6, shots: 7 },
  { canons: ["7", "9", "16"], rows: 6, shots: 7 },
  { canons: ["8", "10", "18", "24"], rows: 6, shots: 6 },
  { canons: ["12", "15", "20", "25"], rows: 6, shots: 6 },
  { canons: ["9", "16", "27", "1"], rows: 7, shots: 6 },
  { canons: ["6", "24", "32", "½"], rows: 7, shots: 6 },
  { canons: ["18", "20", "30", "36"], rows: 7, shots: 5 },
  { canons: ["15", "25", "48", "φ"], rows: 7, shots: 5 },
  { canons: ["4", "16", "2π", "4π"], rows: 7, shots: 5 },
  { canons: ["27", "36", "49", "64"], rows: 8, shots: 5 },
  { canons: ["8", "24", "φ", "½", "1"], rows: 8, shots: 5 },
  { canons: ["12", "32", "48", "4π"], rows: 8, shots: 4 },
  { canons: ["7", "25", "49", "64", "φ"], rows: 8, shots: 4 },
  { canons: ["9", "16", "36", "2π", "4π", "φ"], rows: 8, shots: 4 },
];

export const CAMPAIGN_LEVELS = WAVES.length;

export function wavePlan(wave: number): WavePlan {
  const i = Math.min(Math.max(wave, 1), WAVES.length) - 1;
  const extra = Math.max(0, wave - WAVES.length);
  const base = WAVES[i];
  return {
    canons: base.canons,
    rows: Math.min(8, base.rows + Math.floor(extra / 2)),
    shots: Math.max(4, base.shots - Math.floor(extra / 2)),
  };
}

export function problemsFor(wave: number, canons: string[]): ProblemDef[] {
  const list = PROBLEMS.filter((p) => canons.includes(p.canon) && p.minWave <= wave);
  if (list.length > 0) return list;
  return PROBLEMS.filter((p) => canons.includes(p.canon));
}

export type Glass = { hi: string; mid: string; deep: string; rim: string };

export const DOMAIN_GLASS: Record<Domain, Glass> = {
  arith: { hi: "#ffe7b8", mid: "#e2a13a", deep: "#7a4512", rim: "#ffe1a8" },
  geom: { hi: "#d9fff4", mid: "#2fbfae", deep: "#0c5c56", rim: "#c8fff4" },
  phys: { hi: "#ffd5dc", mid: "#e25b78", deep: "#7c243c", rim: "#ffc6d0" },
  trig: { hi: "#e4e4ff", mid: "#7d8cf0", deep: "#2c348a", rim: "#d9dcff" },
  const: { hi: "#fff3cc", mid: "#e6c15a", deep: "#6d5216", rim: "#fff0c2" },
};

export const SPECIAL_GLASS: Record<Special, Glass> = {
  wild: { hi: "#ffffff", mid: "#d7d5e2", deep: "#4c4a5c", rim: "#ffffff" },
  burst: { hi: "#fff1c2", mid: "#ffb703", deep: "#8a5a00", rim: "#ffe7a3" },
  pulse: { hi: "#ffd9d2", mid: "#ff6b57", deep: "#7a2418", rim: "#ffcfc6" },
};

export const DOMAIN_LABEL: Record<Domain, string> = {
  arith: "Arithmetic",
  geom: "Geometry",
  phys: "Physics",
  trig: "Trigonometry",
  const: "Constant",
};
