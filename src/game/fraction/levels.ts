export type FractionScene =
  | { kind: "shade"; parts: number; filled: number }
  | { kind: "compare"; left: [number, number]; right: [number, number] };

export type FractionPrompt = {
  kicker: string;
  ask: string;
  scene: FractionScene;
  choices: [string, string, string, string];
  answer: string;
  blurb: string;
};

export type FractionLevel = {
  id: number;
  title: string;
  prompts: FractionPrompt[];
};

type Shade = { t: "shade"; parts: number; filled: number };
type Compare = { t: "compare"; left: [number, number]; right: [number, number] };
type Spec = Shade | Compare;

const LEVELS: { title: string; prompts: Spec[] }[] = [
  {
    title: "Halves",
    prompts: [
      { t: "shade", parts: 2, filled: 1 },
      { t: "shade", parts: 4, filled: 2 },
      { t: "compare", left: [1, 2], right: [2, 4] },
    ],
  },
  {
    title: "Quarters",
    prompts: [
      { t: "shade", parts: 4, filled: 1 },
      { t: "shade", parts: 4, filled: 3 },
      { t: "compare", left: [1, 4], right: [3, 4] },
    ],
  },
  {
    title: "Thirds",
    prompts: [
      { t: "shade", parts: 3, filled: 1 },
      { t: "shade", parts: 3, filled: 2 },
      { t: "compare", left: [2, 3], right: [1, 3] },
    ],
  },
  {
    title: "Same bar",
    prompts: [
      { t: "shade", parts: 6, filled: 3 },
      { t: "shade", parts: 6, filled: 2 },
      { t: "compare", left: [3, 6], right: [1, 2] },
    ],
  },
  {
    title: "Fifths",
    prompts: [
      { t: "shade", parts: 5, filled: 1 },
      { t: "shade", parts: 5, filled: 2 },
      { t: "compare", left: [2, 5], right: [1, 2] },
    ],
  },
  {
    title: "Eighths",
    prompts: [
      { t: "shade", parts: 8, filled: 2 },
      { t: "shade", parts: 8, filled: 6 },
      { t: "compare", left: [2, 8], right: [1, 4] },
    ],
  },
  {
    title: "Sixths",
    prompts: [
      { t: "shade", parts: 6, filled: 1 },
      { t: "shade", parts: 6, filled: 5 },
      { t: "compare", left: [5, 6], right: [2, 3] },
    ],
  },
  {
    title: "Equal cuts",
    prompts: [
      { t: "shade", parts: 8, filled: 4 },
      { t: "shade", parts: 10, filled: 5 },
      { t: "compare", left: [4, 8], right: [5, 10] },
    ],
  },
  {
    title: "Sevenths",
    prompts: [
      { t: "shade", parts: 7, filled: 3 },
      { t: "shade", parts: 7, filled: 4 },
      { t: "compare", left: [3, 7], right: [4, 7] },
    ],
  },
  {
    title: "Ninths",
    prompts: [
      { t: "shade", parts: 9, filled: 3 },
      { t: "shade", parts: 9, filled: 6 },
      { t: "compare", left: [3, 9], right: [1, 3] },
    ],
  },
  {
    title: "Past half",
    prompts: [
      { t: "shade", parts: 8, filled: 3 },
      { t: "shade", parts: 8, filled: 5 },
      { t: "compare", left: [3, 8], right: [1, 2] },
    ],
  },
  {
    title: "Tenths",
    prompts: [
      { t: "shade", parts: 10, filled: 4 },
      { t: "shade", parts: 10, filled: 6 },
      { t: "compare", left: [4, 10], right: [6, 10] },
    ],
  },
  {
    title: "Twelfths",
    prompts: [
      { t: "shade", parts: 12, filled: 3 },
      { t: "shade", parts: 12, filled: 8 },
      { t: "compare", left: [8, 12], right: [2, 3] },
    ],
  },
  {
    title: "Close call",
    prompts: [
      { t: "shade", parts: 4, filled: 3 },
      { t: "shade", parts: 10, filled: 7 },
      { t: "compare", left: [3, 4], right: [7, 10] },
    ],
  },
  {
    title: "Different cuts",
    prompts: [
      { t: "shade", parts: 10, filled: 4 },
      { t: "shade", parts: 9, filled: 6 },
      { t: "compare", left: [4, 10], right: [6, 9] },
    ],
  },
  {
    title: "Same gold",
    prompts: [
      { t: "shade", parts: 12, filled: 8 },
      { t: "shade", parts: 9, filled: 6 },
      { t: "compare", left: [8, 12], right: [6, 9] },
    ],
  },
];

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const next = x % y;
    x = y;
    y = next;
  }
  return x || 1;
}

export function formatFrac(num: number, den: number): string {
  if (num === 0) return "0";
  const g = gcd(num, den);
  const n = num / g;
  const d = den / g;
  if (d === 1) return String(n);
  return `${n}/${d}`;
}

function raw(num: number, den: number): string {
  return `${num}/${den}`;
}

function shadeChoices(filled: number, parts: number): [string, string, string, string] {
  const answer = formatFrac(filled, parts);
  const pool = [
    answer,
    raw(filled, parts),
    raw(Math.max(filled - 1, 0), parts),
    raw(Math.min(filled + 1, parts), parts),
    parts > filled && filled > 0 ? raw(parts, filled) : "1",
    raw(filled, parts + 1),
    "1/2",
    "1",
    "0",
    "3/5",
    "2/7",
  ];
  const answerValue = filled / parts;
  const choices: string[] = [];
  for (const item of pool) {
    if (choices.includes(item)) continue;
    if (item !== answer && sameValue(item, answerValue)) continue;
    choices.push(item);
    if (choices.length === 4) break;
  }
  if (choices.length < 4 || choices[0] !== answer) throw new Error(`shade choices ${filled}/${parts}`);
  return [choices[0], choices[1], choices[2], choices[3]];
}

function sameValue(label: string, value: number): boolean {
  const parsed = parseFrac(label);
  return parsed != null && Math.abs(parsed - value) < 1e-9;
}

export function parseFrac(label: string): number | null {
  if (label === "0") return 0;
  if (label === "1") return 1;
  const match = label.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (!match) return null;
  const den = Number(match[2]);
  if (den === 0) return null;
  return Number(match[1]) / den;
}

function compareCall(left: [number, number], right: [number, number]): "Left" | "Right" | "Same" {
  const delta = left[0] * right[1] - right[0] * left[1];
  if (delta === 0) return "Same";
  return delta > 0 ? "Left" : "Right";
}

function build(spec: Spec): FractionPrompt {
  if (spec.t === "shade") {
    const answer = formatFrac(spec.filled, spec.parts);
    return {
      kicker: "LOWEST TERMS",
      ask: "What fraction of the bar is gold?",
      scene: { kind: "shade", parts: spec.parts, filled: spec.filled },
      choices: shadeChoices(spec.filled, spec.parts),
      answer,
      blurb: `${spec.filled} of ${spec.parts} gold. Lowest terms: ${answer}.`,
    };
  }
  const answer = compareCall(spec.left, spec.right);
  const left = formatFrac(spec.left[0], spec.left[1]);
  const right = formatFrac(spec.right[0], spec.right[1]);
  const blurb =
    answer === "Same"
      ? `Both are ${left}. Same amount of gold, different cuts.`
      : `Left is ${left}. Right is ${right}. ${answer} has more gold.`;
  return {
    kicker: "MORE GOLD",
    ask: "Which bar has more gold?",
    scene: { kind: "compare", left: spec.left, right: spec.right },
    choices: ["Left", "Right", "Same", "Neither"],
    answer,
    blurb,
  };
}

export const FRACTION_LEVELS: FractionLevel[] = LEVELS.map((level, index) => ({
  id: index + 1,
  title: level.title,
  prompts: level.prompts.map(build),
}));

export function auditFraction(): string[] {
  const errors: string[] = [];
  if (FRACTION_LEVELS.length !== 16) errors.push("fraction count");
  FRACTION_LEVELS.forEach((level, index) => {
    if (level.id !== index + 1 || level.prompts.length !== 3) errors.push(`fraction level ${level.id}`);
    for (const prompt of level.prompts) {
      if (new Set(prompt.choices).size !== 4 || !prompt.choices.includes(prompt.answer)) {
        errors.push(`level ${level.id} choices`);
      }
      if (prompt.scene.kind === "shade") {
        const { filled, parts } = prompt.scene;
        if (filled < 0 || filled > parts || parts < 2 || parts > 12) errors.push(`level ${level.id} bar`);
        if (prompt.answer !== formatFrac(filled, parts)) errors.push(`level ${level.id} shade`);
        for (const choice of prompt.choices) {
          const value = parseFrac(choice);
          if (choice !== prompt.answer && value != null && Math.abs(value - filled / parts) < 1e-9) {
            errors.push(`level ${level.id} equivalent decoy ${choice}`);
          }
        }
      } else {
        const call = compareCall(prompt.scene.left, prompt.scene.right);
        if (prompt.answer !== call) errors.push(`level ${level.id} compare ${call}`);
      }
    }
  });
  return errors;
}
