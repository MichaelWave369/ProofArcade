export type Field = "math" | "physics";

export type SymbolDef = {
  id: string;
  glyph: string;
  name: string;
  field: Field;
  blurb: string;
};

export const SYMBOLS: SymbolDef[] = [
  {
    id: "pi",
    glyph: "π",
    name: "Pi",
    field: "math",
    blurb: "Circle constant. Circumference divided by diameter.",
  },
  {
    id: "sigma",
    glyph: "Σ",
    name: "Sigma",
    field: "math",
    blurb: "Summation. Add every term in the run.",
  },
  {
    id: "integral",
    glyph: "∫",
    name: "Integral",
    field: "math",
    blurb: "Integral. Accumulated area under a curve.",
  },
  {
    id: "radical",
    glyph: "√",
    name: "Radical",
    field: "math",
    blurb: "Square root. The side whose square is this value.",
  },
  {
    id: "delta",
    glyph: "Δ",
    name: "Delta",
    field: "physics",
    blurb: "Change. Final value minus the initial one.",
  },
  {
    id: "lambda",
    glyph: "λ",
    name: "Lambda",
    field: "physics",
    blurb: "Wavelength. Crest to crest, or a decay constant.",
  },
  {
    id: "omega",
    glyph: "Ω",
    name: "Omega",
    field: "physics",
    blurb: "Ohms, angular speed, or a solid angle.",
  },
  {
    id: "theta",
    glyph: "θ",
    name: "Theta",
    field: "math",
    blurb: "An angle, often the one you are solving for.",
  },
  {
    id: "phi",
    glyph: "φ",
    name: "Phi",
    field: "math",
    blurb: "The golden ratio, about 1.618.",
  },
  {
    id: "mu",
    glyph: "μ",
    name: "Mu",
    field: "physics",
    blurb: "Friction, or the prefix for a millionth.",
  },
  {
    id: "rho",
    glyph: "ρ",
    name: "Rho",
    field: "physics",
    blurb: "Density. Mass packed into a volume.",
  },
  {
    id: "alpha",
    glyph: "α",
    name: "Alpha",
    field: "physics",
    blurb: "Angular acceleration, or a fine-structure constant.",
  },
  {
    id: "nabla",
    glyph: "∇",
    name: "Nabla",
    field: "math",
    blurb: "Del. The operator behind gradient, divergence, and curl.",
  },
];

export const STAGES = [
  { kinds: 4, moves: 24, target: 700, name: "Four glyphs" },
  { kinds: 4, moves: 22, target: 900, name: "Tighter proof" },
  { kinds: 5, moves: 22, target: 1100, name: "A fifth glyph" },
  { kinds: 5, moves: 20, target: 1400, name: "Fewer moves" },
  { kinds: 6, moves: 20, target: 1700, name: "Physics joins" },
  { kinds: 6, moves: 19, target: 2000, name: "Longer chains" },
  { kinds: 7, moves: 18, target: 2300, name: "First book" },
  { kinds: 8, moves: 18, target: 2700, name: "Theta" },
  { kinds: 9, moves: 17, target: 3100, name: "Phi" },
  { kinds: 10, moves: 17, target: 3500, name: "Mu" },
  { kinds: 11, moves: 16, target: 3900, name: "Rho" },
  { kinds: 11, moves: 16, target: 4300, name: "Density" },
  { kinds: 12, moves: 15, target: 4700, name: "Alpha" },
  { kinds: 12, moves: 15, target: 5100, name: "Spin" },
  { kinds: 13, moves: 15, target: 5600, name: "Nabla" },
  { kinds: 13, moves: 14, target: 6200, name: "Whole book" },
];

export const STAGE_COUNT = STAGES.length;

export function stageConfig(stage: number) {
  const safe = Math.max(1, Math.floor(stage));
  if (safe <= STAGES.length) {
    const row = STAGES[safe - 1];
    return { kindCount: row.kinds, moves: row.moves, target: row.target, name: row.name, total: STAGES.length };
  }
  const extra = safe - STAGES.length;
  const last = STAGES[STAGES.length - 1];
  return {
    kindCount: last.kinds,
    moves: Math.max(12, last.moves - extra),
    target: last.target + extra * 600,
    name: "Apex",
    total: STAGES.length,
  };
}
