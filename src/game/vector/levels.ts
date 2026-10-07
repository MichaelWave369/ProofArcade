export type Pt = [number, number];

export type VectorScene = { a: Pt; b: Pt };

export type VectorPrompt = {
  kicker: string;
  ask: string;
  scene: VectorScene;
  choices: [string, string, string, string];
  answer: string;
  blurb: string;
};

export type VectorLevel = {
  id: number;
  title: string;
  prompts: VectorPrompt[];
};

const PAIRS: [Pt, Pt][] = [
  [[1, 0], [0, 1]],
  [[2, 0], [0, 2]],
  [[1, 1], [1, 0]],
  [[2, 1], [1, 2]],
  [[3, 0], [0, 1]],
  [[1, 2], [2, 1]],
  [[-1, 0], [0, 1]],
  [[2, 0], [-1, 0]],
  [[-2, 1], [1, 1]],
  [[0, 2], [0, -1]],
  [[3, 1], [-1, 2]],
  [[-1, -1], [2, 0]],
  [[2, -1], [1, 2]],
  [[-2, 0], [-1, 2]],
  [[4, 1], [-2, 1]],
  [[1, -2], [2, 1]],
  [[-3, 1], [1, 1]],
  [[2, 2], [-1, 1]],
  [[0, -2], [3, 1]],
  [[-1, 2], [-1, -1]],
  [[3, -1], [0, 2]],
  [[-2, -1], [4, 1]],
  [[1, 3], [2, -1]],
  [[-4, 0], [1, 2]],
  [[2, -2], [2, 1]],
  [[-1, 3], [3, -1]],
  [[5, 0], [-2, 1]],
  [[0, 3], [2, -2]],
  [[-3, -2], [1, 2]],
  [[4, -1], [-1, -1]],
  [[2, 3], [-2, 1]],
  [[-2, 2], [3, -1]],
  [[1, 1], [-1, 2]],
  [[3, 2], [1, -3]],
  [[-4, 1], [2, 2]],
  [[0, -3], [-1, 2]],
  [[2, 0], [3, 2]],
  [[-1, -2], [-2, 1]],
  [[4, 2], [-3, -1]],
  [[1, -3], [0, 2]],
  [[-2, 3], [2, 0]],
  [[3, -2], [-1, 2]],
  [[5, -1], [-3, 0]],
  [[-3, 2], [2, 2]],
  [[1, 4], [2, -2]],
  [[-2, -2], [3, 1]],
  [[4, 0], [0, -3]],
  [[-1, 1], [4, 2]],
];

const TITLES = [
  "Unit steps",
  "Longer",
  "Along the floor",
  "Both ways",
  "East and north",
  "Crossed",
  "Turn around",
  "Cancel one",
  "Shared rise",
  "Up then down",
  "Mixed signs",
  "Out of the west",
  "Drop then rise",
  "West and north",
  "Give some back",
  "Resultant",
];

function label(p: Pt): string {
  return `(${p[0]}, ${p[1]})`;
}

function choicesFor(a: Pt, b: Pt): [string, string, string, string] {
  const answer = label([a[0] + b[0], a[1] + b[1]]);
  const pool = [
    answer,
    label([a[0] - b[0], a[1] - b[1]]),
    label([a[0] + b[1], a[1] + b[0]]),
    label(a),
    label(b),
    label([a[0] + b[0], a[1] - b[1]]),
    label([-(a[0] + b[0]), a[1] + b[1]]),
    label([a[0] + b[0] + 1, a[1] + b[1]]),
    label([a[1], b[0]]),
  ];
  const choices: string[] = [];
  for (const item of pool) {
    if (!choices.includes(item)) choices.push(item);
    if (choices.length === 4) break;
  }
  if (choices.length < 4 || choices[0] !== answer) throw new Error(`vector choices ${answer}`);
  return [choices[0], choices[1], choices[2], choices[3]];
}

function promptFor(a: Pt, b: Pt): VectorPrompt {
  const sum: Pt = [a[0] + b[0], a[1] + b[1]];
  return {
    kicker: "A + B",
    ask: "What is the sum of the two vectors?",
    scene: { a, b },
    choices: choicesFor(a, b),
    answer: label(sum),
    blurb: `Add the runs, then the rises. ${label(a)} + ${label(b)} = ${label(sum)}.`,
  };
}

export const VECTOR_LEVELS: VectorLevel[] = TITLES.map((title, index) => ({
  id: index + 1,
  title,
  prompts: [0, 1, 2].map((offset) => {
    const pair = PAIRS[index * 3 + offset];
    return promptFor(pair[0], pair[1]);
  }),
}));

function parsePoint(labelText: string): Pt | null {
  const match = labelText.match(/^\((-?\d+), (-?\d+)\)$/);
  if (!match) return null;
  return [Number(match[1]), Number(match[2])];
}

export function auditVector(): string[] {
  const errors: string[] = [];
  if (VECTOR_LEVELS.length !== 16 || PAIRS.length !== 48) errors.push("vector count");
  VECTOR_LEVELS.forEach((level, index) => {
    if (level.id !== index + 1 || level.prompts.length !== 3) errors.push(`vector level ${level.id}`);
    for (const prompt of level.prompts) {
      if (new Set(prompt.choices).size !== 4 || !prompt.choices.includes(prompt.answer)) {
        errors.push(`level ${level.id} choices`);
      }
      const { a, b } = prompt.scene;
      if ((a[0] === 0 && a[1] === 0) || (b[0] === 0 && b[1] === 0)) errors.push(`level ${level.id} zero`);
      const sum = label([a[0] + b[0], a[1] + b[1]]);
      if (prompt.answer !== sum) errors.push(`level ${level.id} sum`);
      for (const choice of prompt.choices) {
        if (!parsePoint(choice)) errors.push(`level ${level.id} label ${choice}`);
      }
    }
  });
  return errors;
}
