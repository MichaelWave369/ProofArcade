export type Bead = "gold" | "mint" | "mist";

export type OddsModel =
  | { type: "bag"; beads: Bead[]; color: Bead }
  | { type: "bag-not"; beads: Bead[]; color: Bead }
  | { type: "after"; beads: Bead[]; take: Bead; color: Bead }
  | { type: "coins-all"; n: number }
  | { type: "coins-at-least"; n: number }
  | { type: "coins-exact"; n: number; heads: number }
  | { type: "die"; faces: number[] }
  | { type: "sum"; total: number }
  | { type: "and"; a: string; b: string }
  | { type: "fixed"; p: string; streak?: number }
  | { type: "compare"; left: Bead[]; right: Bead[]; color: Bead };

export type OddsPrompt = {
  kicker: string;
  ask: string;
  model: OddsModel;
  choices: [string, string, string, string];
  answer: string;
  blurb: string;
};

export type OddsLevel = {
  id: number;
  title: string;
  prompts: OddsPrompt[];
};

const G = "gold" as const;
const M = "mint" as const;
const S = "mist" as const;

export const ODDS_LEVELS: OddsLevel[] = [
  {
    id: 1,
    title: "One coin",
    prompts: [
      {
        kicker: "FAIR COIN",
        ask: "Chance this toss is heads.",
        model: { type: "coins-all", n: 1 },
        choices: ["1/2", "1/3", "1/4", "2/3"],
        answer: "1/2",
        blurb: "Two faces, one of them heads. 1 out of 2.",
      },
      {
        kicker: "FAIR COIN",
        ask: "Chance this toss is tails.",
        model: { type: "coins-all", n: 1 },
        choices: ["1/2", "0", "1/4", "1"],
        answer: "1/2",
        blurb: "Tails is the other face. Still 1 out of 2.",
      },
      {
        kicker: "AFTER A STREAK",
        ask: "Five heads already. Chance the next toss is heads.",
        model: { type: "fixed", p: "1/2", streak: 5 },
        choices: ["1/2", "1/32", "5/6", "0"],
        answer: "1/2",
        blurb: "A fair coin has no memory. The streak does not spend the next toss.",
      },
    ],
  },
  {
    id: 2,
    title: "Two coins",
    prompts: [
      {
        kicker: "TWO COINS",
        ask: "Chance both land heads.",
        model: { type: "coins-all", n: 2 },
        choices: ["1/4", "1/2", "1/3", "3/4"],
        answer: "1/4",
        blurb: "HH, HT, TH, TT. One of the four is HH.",
      },
      {
        kicker: "TWO COINS",
        ask: "Chance of exactly one head.",
        model: { type: "coins-exact", n: 2, heads: 1 },
        choices: ["1/2", "1/4", "1/3", "3/4"],
        answer: "1/2",
        blurb: "HT and TH. Two of the four outcomes.",
      },
      {
        kicker: "TWO COINS",
        ask: "Chance of at least one head.",
        model: { type: "coins-at-least", n: 2 },
        choices: ["3/4", "1/2", "1/4", "1"],
        answer: "3/4",
        blurb: "Only TT fails. Three of four outcomes work.",
      },
    ],
  },
  {
    id: 3,
    title: "Three coins",
    prompts: [
      {
        kicker: "THREE COINS",
        ask: "Chance all three are heads.",
        model: { type: "coins-all", n: 3 },
        choices: ["1/8", "1/6", "1/4", "3/8"],
        answer: "1/8",
        blurb: "Each coin halves the chance. 1/2 × 1/2 × 1/2 = 1/8.",
      },
      {
        kicker: "THREE COINS",
        ask: "Chance of exactly one head.",
        model: { type: "coins-exact", n: 3, heads: 1 },
        choices: ["3/8", "1/8", "1/2", "1/3"],
        answer: "3/8",
        blurb: "The single head can sit on any of the three coins. 3 out of 8.",
      },
      {
        kicker: "THREE COINS",
        ask: "Chance of at least one head.",
        model: { type: "coins-at-least", n: 3 },
        choices: ["7/8", "1/2", "3/8", "1/8"],
        answer: "7/8",
        blurb: "The only miss is TTT. 1 − 1/8 = 7/8.",
      },
    ],
  },
  {
    id: 4,
    title: "One die",
    prompts: [
      {
        kicker: "FAIR DIE",
        ask: "Chance the face is 6.",
        model: { type: "die", faces: [6] },
        choices: ["1/6", "1/3", "1/2", "1/5"],
        answer: "1/6",
        blurb: "Six faces, one of them a six.",
      },
      {
        kicker: "FAIR DIE",
        ask: "Chance the face is odd.",
        model: { type: "die", faces: [1, 3, 5] },
        choices: ["1/2", "1/3", "1/6", "2/3"],
        answer: "1/2",
        blurb: "1, 3, and 5. Three faces out of six.",
      },
      {
        kicker: "FAIR DIE",
        ask: "Chance the face is greater than 4.",
        model: { type: "die", faces: [5, 6] },
        choices: ["1/3", "1/6", "1/2", "2/5"],
        answer: "1/3",
        blurb: "Only 5 and 6. 2/6 = 1/3.",
      },
    ],
  },
  {
    id: 5,
    title: "The whole die",
    prompts: [
      {
        kicker: "FAIR DIE",
        ask: "Chance the face is 4 or less.",
        model: { type: "die", faces: [1, 2, 3, 4] },
        choices: ["2/3", "1/2", "1/4", "4/5"],
        answer: "2/3",
        blurb: "Four faces out of six. 4/6 = 2/3.",
      },
      {
        kicker: "FAIR DIE",
        ask: "Chance the face is 1.",
        model: { type: "die", faces: [1] },
        choices: ["1/6", "1/5", "1/2", "0"],
        answer: "1/6",
        blurb: "One face, same as a six.",
      },
      {
        kicker: "FAIR DIE",
        ask: "Chance the face is anything from 1 to 6.",
        model: { type: "die", faces: [1, 2, 3, 4, 5, 6] },
        choices: ["1", "5/6", "1/6", "0"],
        answer: "1",
        blurb: "Every face counts. That chance is certain.",
      },
    ],
  },
  {
    id: 6,
    title: "Even bag",
    prompts: [
      {
        kicker: "ONE DRAW",
        ask: "Chance the bead is gold.",
        model: { type: "bag", beads: [G, G, M, M], color: G },
        choices: ["1/2", "1/4", "2/3", "1/3"],
        answer: "1/2",
        blurb: "Two gold out of four beads.",
      },
      {
        kicker: "ONE DRAW",
        ask: "Chance the bead is mint.",
        model: { type: "bag", beads: [G, G, M, M], color: M },
        choices: ["1/2", "1/4", "3/4", "1"],
        answer: "1/2",
        blurb: "Mint matches gold here. Two out of four.",
      },
      {
        kicker: "ONE DRAW",
        ask: "Chance the bead is not gold.",
        model: { type: "bag-not", beads: [G, G, M, M], color: G },
        choices: ["1/2", "1/4", "0", "3/4"],
        answer: "1/2",
        blurb: "Not gold means the two mint beads. Still half.",
      },
    ],
  },
  {
    id: 7,
    title: "Heavy gold",
    prompts: [
      {
        kicker: "ONE DRAW",
        ask: "Chance the bead is gold.",
        model: { type: "bag", beads: [G, G, G, M], color: G },
        choices: ["3/4", "1/4", "1/2", "2/3"],
        answer: "3/4",
        blurb: "Three gold out of four.",
      },
      {
        kicker: "ONE DRAW",
        ask: "Chance the bead is mint.",
        model: { type: "bag", beads: [G, G, G, M], color: M },
        choices: ["1/4", "3/4", "1/2", "1/3"],
        answer: "1/4",
        blurb: "One mint bead in the bag.",
      },
      {
        kicker: "ONE DRAW",
        ask: "Chance the bead is not gold.",
        model: { type: "bag-not", beads: [G, G, G, M], color: G },
        choices: ["1/4", "3/4", "1/2", "0"],
        answer: "1/4",
        blurb: "The complement of 3/4 is 1/4.",
      },
    ],
  },
  {
    id: 8,
    title: "Three colors",
    prompts: [
      {
        kicker: "ONE DRAW",
        ask: "Chance the bead is gold.",
        model: { type: "bag", beads: [G, G, M, M, S, S], color: G },
        choices: ["1/3", "1/2", "1/6", "2/5"],
        answer: "1/3",
        blurb: "Two gold out of six. 2/6 = 1/3.",
      },
      {
        kicker: "ONE DRAW",
        ask: "Chance the bead is mist.",
        model: { type: "bag", beads: [G, G, M, M, S, S], color: S },
        choices: ["1/3", "1/2", "1/6", "2/3"],
        answer: "1/3",
        blurb: "Mist has the same count as gold.",
      },
      {
        kicker: "ONE DRAW",
        ask: "Chance the bead is not mist.",
        model: { type: "bag-not", beads: [G, G, M, M, S, S], color: S },
        choices: ["2/3", "1/3", "1/2", "5/6"],
        answer: "2/3",
        blurb: "Gold and mint together are four of six.",
      },
    ],
  },
  {
    id: 9,
    title: "Almost gold",
    prompts: [
      {
        kicker: "ONE DRAW",
        ask: "Chance the bead is gold.",
        model: { type: "bag", beads: [G, G, G, G, G, M], color: G },
        choices: ["5/6", "1/6", "4/5", "2/3"],
        answer: "5/6",
        blurb: "Five gold beads out of six.",
      },
      {
        kicker: "ONE DRAW",
        ask: "Chance the bead is mint.",
        model: { type: "bag", beads: [G, G, G, G, G, M], color: M },
        choices: ["1/6", "5/6", "1/5", "1/2"],
        answer: "1/6",
        blurb: "A single mint bead.",
      },
      {
        kicker: "ONE DRAW",
        ask: "Chance the bead is not gold.",
        model: { type: "bag-not", beads: [G, G, G, G, G, M], color: G },
        choices: ["1/6", "5/6", "1/5", "0"],
        answer: "1/6",
        blurb: "Not gold is only that mint bead.",
      },
    ],
  },
  {
    id: 10,
    title: "Set one aside",
    prompts: [
      {
        kicker: "FIRST DRAW",
        ask: "Chance the first bead is gold.",
        model: { type: "bag", beads: [G, G, M], color: G },
        choices: ["2/3", "1/2", "1/3", "3/4"],
        answer: "2/3",
        blurb: "Before anything leaves, two of the three beads are gold.",
      },
      {
        kicker: "GOLD SET ASIDE",
        ask: "A gold bead is already out. Chance the next is gold.",
        model: { type: "after", beads: [G, G, M], take: G, color: G },
        choices: ["1/2", "2/3", "1/3", "0"],
        answer: "1/2",
        blurb: "One gold remains, and one mint. The bag is now even.",
      },
      {
        kicker: "GOLD SET ASIDE",
        ask: "A gold bead is already out. Chance the next is mint.",
        model: { type: "after", beads: [G, G, M], take: G, color: M },
        choices: ["1/2", "1/3", "2/3", "1"],
        answer: "1/2",
        blurb: "The mint bead is one of the two that remain.",
      },
    ],
  },
  {
    id: 11,
    title: "What remains",
    prompts: [
      {
        kicker: "ONE DRAW",
        ask: "Chance the bead is mint.",
        model: { type: "bag", beads: [G, G, G, M, M], color: M },
        choices: ["2/5", "3/5", "1/2", "1/5"],
        answer: "2/5",
        blurb: "Two mint beads out of five.",
      },
      {
        kicker: "MINT SET ASIDE",
        ask: "A mint bead is out. Chance the next is gold.",
        model: { type: "after", beads: [G, G, G, M, M], take: M, color: G },
        choices: ["3/4", "3/5", "1/2", "2/5"],
        answer: "3/4",
        blurb: "Three gold and one mint remain. 3 out of 4.",
      },
      {
        kicker: "GOLD SET ASIDE",
        ask: "A gold bead is out. Chance the next is gold.",
        model: { type: "after", beads: [G, G, G, M, M], take: G, color: G },
        choices: ["1/2", "3/5", "2/3", "3/4"],
        answer: "1/2",
        blurb: "Two gold and two mint remain.",
      },
    ],
  },
  {
    id: 12,
    title: "Which bag",
    prompts: [
      {
        kicker: "GOLD IS MORE LIKELY IN",
        ask: "Left is two gold. Right is one gold and three mist.",
        model: { type: "compare", left: [G, G], right: [G, S, S, S], color: G },
        choices: ["Left", "Right", "Same", "Neither"],
        answer: "Left",
        blurb: "Left is certain. Right is 1 out of 4.",
      },
      {
        kicker: "GOLD IS MORE LIKELY IN",
        ask: "Both bags are one gold and one mint.",
        model: { type: "compare", left: [G, M], right: [G, M], color: G },
        choices: ["Left", "Right", "Same", "Neither"],
        answer: "Same",
        blurb: "Both are 1 out of 2. Same is the match, not neither.",
      },
      {
        kicker: "GOLD IS MORE LIKELY IN",
        ask: "Left is three gold and one mint. Right is two and two.",
        model: { type: "compare", left: [G, G, G, M], right: [G, G, M, M], color: G },
        choices: ["Left", "Right", "Same", "Neither"],
        answer: "Left",
        blurb: "3/4 against 1/2. Left is the heavier gold.",
      },
    ],
  },
  {
    id: 13,
    title: "Both have to happen",
    prompts: [
      {
        kicker: "COIN AND DIE",
        ask: "Chance of heads and a 6, together.",
        model: { type: "and", a: "1/2", b: "1/6" },
        choices: ["1/12", "1/6", "1/8", "2/3"],
        answer: "1/12",
        blurb: "Independent chances multiply. 1/2 × 1/6 = 1/12.",
      },
      {
        kicker: "TWO COINS",
        ask: "Chance the first is heads and the second is heads.",
        model: { type: "and", a: "1/2", b: "1/2" },
        choices: ["1/4", "1/2", "1/3", "3/4"],
        answer: "1/4",
        blurb: "Same result as listing HH among four outcomes.",
      },
      {
        kicker: "TWO DICE",
        ask: "Chance both dice show 6.",
        model: { type: "and", a: "1/6", b: "1/6" },
        choices: ["1/36", "1/12", "1/6", "1/18"],
        answer: "1/36",
        blurb: "1/6 × 1/6. One pair out of thirty-six.",
      },
    ],
  },
  {
    id: 14,
    title: "Two dice",
    prompts: [
      {
        kicker: "SUM OF TWO DICE",
        ask: "Chance the faces add to 2.",
        model: { type: "sum", total: 2 },
        choices: ["1/36", "1/18", "1/6", "2/36"],
        answer: "1/36",
        blurb: "Only 1+1. One way out of 36.",
      },
      {
        kicker: "SUM OF TWO DICE",
        ask: "Chance the faces add to 7.",
        model: { type: "sum", total: 7 },
        choices: ["1/6", "1/12", "1/7", "5/36"],
        answer: "1/6",
        blurb: "Six ways: 1+6 through 6+1. 6/36 = 1/6.",
      },
      {
        kicker: "SUM OF TWO DICE",
        ask: "Chance the faces add to 12.",
        model: { type: "sum", total: 12 },
        choices: ["1/36", "1/12", "1/6", "2/36"],
        answer: "1/36",
        blurb: "Only 6+6. As rare as snake eyes.",
      },
    ],
  },
  {
    id: 15,
    title: "Mixed bench",
    prompts: [
      {
        kicker: "TWO COINS",
        ask: "Chance of at least one head.",
        model: { type: "coins-at-least", n: 2 },
        choices: ["3/4", "1/2", "1/4", "1/8"],
        answer: "3/4",
        blurb: "HH, HT, TH. Leave out TT.",
      },
      {
        kicker: "FAIR DIE",
        ask: "Chance the face is even.",
        model: { type: "die", faces: [2, 4, 6] },
        choices: ["1/2", "1/3", "1/6", "2/3"],
        answer: "1/2",
        blurb: "2, 4, and 6. Half the die.",
      },
      {
        kicker: "ONE DRAW",
        ask: "Chance the bead is gold.",
        model: { type: "bag", beads: [G, G, M, S], color: G },
        choices: ["1/2", "1/4", "1/3", "3/4"],
        answer: "1/2",
        blurb: "Two gold out of four, with mint and mist sharing the rest.",
      },
    ],
  },
  {
    id: 16,
    title: "Last draw",
    prompts: [
      {
        kicker: "GOLD SET ASIDE",
        ask: "One gold is out. Chance the next is gold.",
        model: { type: "after", beads: [G, G, G, G, M], take: G, color: G },
        choices: ["3/4", "4/5", "1/2", "2/3"],
        answer: "3/4",
        blurb: "Three gold and one mint remain.",
      },
      {
        kicker: "GOLD IS MORE LIKELY IN",
        ask: "Left is one gold and three mist. Right is four mist.",
        model: { type: "compare", left: [G, S, S, S], right: [S, S, S, S], color: G },
        choices: ["Left", "Right", "Same", "Neither"],
        answer: "Left",
        blurb: "Right cannot draw gold. Left still can, one time in four.",
      },
      {
        kicker: "SUM OF TWO DICE",
        ask: "Chance the faces add to 8.",
        model: { type: "sum", total: 8 },
        choices: ["5/36", "1/6", "4/36", "1/8"],
        answer: "5/36",
        blurb: "2+6, 3+5, 4+4, 5+3, 6+2. Five ways, not six.",
      },
    ],
  },
];

function beadCount(beads: Bead[], color: Bead): number {
  return beads.filter((bead) => bead === color).length;
}

function binom(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let value = 1;
  for (let i = 1; i <= k; i++) value = (value * (n - k + i)) / i;
  return value;
}

export function sumPairs(total: number): string[] {
  const pairs: string[] = [];
  for (let a = 1; a <= 6; a++) {
    const b = total - a;
    if (b >= 1 && b <= 6) pairs.push(`${a}+${b}`);
  }
  return pairs;
}

export function parseChance(label: string): number | null {
  const text = label.trim();
  if (text === "0") return 0;
  if (text === "1") return 1;
  const match = text.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (!match) return null;
  const den = Number(match[2]);
  if (den === 0) return null;
  return Number(match[1]) / den;
}

export function chanceOf(model: OddsModel): number {
  switch (model.type) {
    case "bag":
      return model.beads.length ? beadCount(model.beads, model.color) / model.beads.length : Number.NaN;
    case "bag-not":
      return model.beads.length ? 1 - beadCount(model.beads, model.color) / model.beads.length : Number.NaN;
    case "after": {
      const index = model.beads.indexOf(model.take);
      if (index < 0) return Number.NaN;
      const rest = model.beads.filter((_, beadIndex) => beadIndex !== index);
      return rest.length ? beadCount(rest, model.color) / rest.length : Number.NaN;
    }
    case "coins-all":
      return model.n > 0 ? 1 / 2 ** model.n : Number.NaN;
    case "coins-at-least":
      return model.n > 0 ? 1 - 1 / 2 ** model.n : Number.NaN;
    case "coins-exact":
      return model.n > 0 ? binom(model.n, model.heads) / 2 ** model.n : Number.NaN;
    case "die":
      return model.faces.length / 6;
    case "sum":
      return sumPairs(model.total).length / 36;
    case "and": {
      const left = parseChance(model.a);
      const right = parseChance(model.b);
      if (left == null || right == null) return Number.NaN;
      return left * right;
    }
    case "fixed": {
      const value = parseChance(model.p);
      return value == null ? Number.NaN : value;
    }
    case "compare":
      return Number.NaN;
  }
}

function compareCall(model: Extract<OddsModel, { type: "compare" }>): "Left" | "Right" | "Same" | null {
  if (!model.left.length || !model.right.length) return null;
  const left = beadCount(model.left, model.color) / model.left.length;
  const right = beadCount(model.right, model.color) / model.right.length;
  if (Math.abs(left - right) < 1e-9) return "Same";
  return left > right ? "Left" : "Right";
}

export function auditOdds(): string[] {
  const errors: string[] = [];
  if (ODDS_LEVELS.length !== 16) errors.push(`odds count ${ODDS_LEVELS.length}`);
  ODDS_LEVELS.forEach((level, index) => {
    if (level.id !== index + 1) errors.push(`odds id ${level.id}`);
    if (level.prompts.length < 3) errors.push(`level ${level.id} prompts`);
    for (const prompt of level.prompts) {
      if (new Set(prompt.choices).size !== 4) errors.push(`level ${level.id} choices`);
      if (!prompt.choices.includes(prompt.answer)) errors.push(`level ${level.id} answer missing`);
      if (!prompt.blurb || !prompt.ask) errors.push(`level ${level.id} copy`);
      const model = prompt.model;
      if (model.type === "compare") {
        if (compareCall(model) !== prompt.answer) errors.push(`level ${level.id} compare ${prompt.ask}`);
        continue;
      }
      if (model.type === "die") {
        const faces = new Set(model.faces);
        if (faces.size !== model.faces.length || model.faces.some((face) => face < 1 || face > 6)) {
          errors.push(`level ${level.id} die`);
        }
      }
      if (model.type === "coins-exact" && (model.heads < 0 || model.heads > model.n)) {
        errors.push(`level ${level.id} heads`);
      }
      if ((model.type === "coins-all" || model.type === "coins-at-least" || model.type === "coins-exact") && (model.n < 1 || model.n > 4)) {
        errors.push(`level ${level.id} coins`);
      }
      const expected = chanceOf(model);
      const stated = parseChance(prompt.answer);
      if (stated == null || Math.abs(expected - stated) > 1e-9) {
        errors.push(`level ${level.id} ${prompt.ask} got ${expected} vs ${prompt.answer}`);
      }
    }
  });
  return errors;
}
