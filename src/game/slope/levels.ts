export type Pt = [number, number];

export type SlopeScene = {
  a: Pt;
  b: Pt;
  kind: "slope" | "point";
  hit?: Pt;
};

export type SlopePrompt = {
  kicker: string;
  ask: string;
  scene: SlopeScene;
  choices: [string, string, string, string];
  answer: string;
  blurb: string;
};

export type SlopeLevel = {
  id: number;
  title: string;
  prompts: SlopePrompt[];
};

const LINES: Pt[][] = [
  [[0, 0], [2, 2]],
  [[0, 0], [1, 2]],
  [[0, 1], [3, 1]],
  [[0, 0], [3, 1]],
  [[0, 0], [2, -2]],
  [[-2, 0], [2, 0]],
  [[0, 0], [4, 2]],
  [[1, 1], [3, 5]],
  [[0, 2], [0, -2]],
  [[-2, -1], [2, 1]],
  [[0, 0], [3, -1]],
  [[-1, 2], [2, -1]],
  [[-3, -3], [1, 1]],
  [[0, -2], [2, 2]],
  [[2, -2], [2, 2]],
  [[-2, 1], [2, 3]],
  [[0, 0], [1, -2]],
  [[-4, 2], [0, 0]],
  [[-1, -2], [3, 2]],
  [[0, 3], [3, 0]],
  [[-2, 2], [2, -2]],
  [[1, -1], [1, 3]],
  [[-3, 0], [3, 2]],
  [[0, 0], [4, -2]],
  [[-2, -2], [2, 0]],
  [[0, 1], [4, 3]],
  [[-4, 0], [-4, 3]],
  [[-1, 0], [3, 2]],
  [[0, -1], [2, 3]],
  [[-3, 1], [1, 1]],
  [[-2, 3], [2, -1]],
  [[1, 2], [4, 2]],
];

const POINT_LINES: Pt[][] = [
  [[0, 0], [4, 2]],
  [[0, 0], [2, 4]],
  [[-2, -2], [2, 2]],
  [[0, 1], [4, 1]],
  [[1, -2], [1, 2]],
  [[-2, 0], [2, 2]],
  [[0, 0], [3, 3]],
  [[-4, -2], [0, 0]],
  [[0, -1], [4, 1]],
  [[-2, 2], [2, -2]],
  [[2, -3], [2, 3]],
  [[-3, -1], [3, 1]],
  [[0, 2], [3, -1]],
  [[-4, 4], [0, 0]],
  [[-1, -1], [3, 1]],
  [[0, 0], [2, -4]],
];

const TITLES = [
  "First rise",
  "Steeper",
  "Flat",
  "Shallow",
  "Downhill",
  "Level",
  "Half",
  "Steep pair",
  "No run",
  "Through origin",
  "Gentle drop",
  "Falling",
  "Same ratio",
  "From below",
  "Vertical",
  "Last slope",
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

export function formatSlope(dy: number, dx: number): string {
  if (dx === 0) return "undefined";
  if (dy === 0) return "0";
  let n = dy / gcd(dy, dx);
  let d = dx / gcd(dy, dx);
  if (d < 0) {
    n = -n;
    d = -d;
  }
  if (d === 1) return String(n);
  return `${n}/${d}`;
}

function takeFour(answer: string, extra: string[]): [string, string, string, string] {
  const choices: string[] = [];
  for (const item of [answer, ...extra]) {
    if (!choices.includes(item)) choices.push(item);
    if (choices.length === 4) break;
  }
  if (choices.length < 4) throw new Error(`slope choices for ${answer}`);
  return [choices[0], choices[1], choices[2], choices[3]];
}

function slopeChoices(dy: number, dx: number): [string, string, string, string] {
  const answer = formatSlope(dy, dx);
  const extra = [
    dx !== 0 && dy !== 0 ? formatSlope(dx, dy) : "1",
    formatSlope(-dy, dx === 0 ? 1 : dx),
    "0",
    "1",
    "-1",
    "2",
    "-2",
    "1/2",
    "-1/2",
    "undefined",
    formatSlope(dy + 1, dx === 0 ? 1 : dx),
  ];
  return takeFour(answer, extra);
}

export function onLine(a: Pt, b: Pt, p: Pt): boolean {
  return (p[1] - a[1]) * (b[0] - a[0]) === (p[0] - a[0]) * (b[1] - a[1]);
}

function pointLabel(p: Pt): string {
  return `(${p[0]}, ${p[1]})`;
}

function findHit(a: Pt, b: Pt): Pt {
  const hits: Pt[] = [];
  for (let x = -4; x <= 4; x++) {
    for (let y = -4; y <= 4; y++) {
      const p: Pt = [x, y];
      if ((p[0] === a[0] && p[1] === a[1]) || (p[0] === b[0] && p[1] === b[1])) continue;
      if (onLine(a, b, p)) hits.push(p);
    }
  }
  const boxed = hits.filter((p) => {
    const minX = Math.min(a[0], b[0]);
    const maxX = Math.max(a[0], b[0]);
    const minY = Math.min(a[1], b[1]);
    const maxY = Math.max(a[1], b[1]);
    return p[0] >= minX && p[0] <= maxX && p[1] >= minY && p[1] <= maxY;
  });
  const hit = boxed[0] ?? hits[0];
  if (!hit) throw new Error(`no lattice point on ${a} ${b}`);
  return hit;
}

function findMisses(a: Pt, b: Pt, hit: Pt): Pt[] {
  const seeds: Pt[] = [
    [hit[0] + 1, hit[1]],
    [hit[0], hit[1] + 1],
    [hit[0] - 1, hit[1]],
    [hit[0], hit[1] - 1],
    [hit[0] + 1, hit[1] - 1],
    [a[0] + 1, a[1]],
    [b[0], b[1] + 1],
    [0, 0],
  ];
  const misses: Pt[] = [];
  for (const p of seeds) {
    if (p[0] < -4 || p[0] > 4 || p[1] < -4 || p[1] > 4) continue;
    if (onLine(a, b, p)) continue;
    if (misses.some((item) => item[0] === p[0] && item[1] === p[1])) continue;
    misses.push(p);
    if (misses.length === 3) break;
  }
  if (misses.length < 3) throw new Error(`misses ${a} ${b}`);
  return misses;
}

function slopePrompt(a: Pt, b: Pt): SlopePrompt {
  const dy = b[1] - a[1];
  const dx = b[0] - a[0];
  const answer = formatSlope(dy, dx);
  const blurb =
    dx === 0
      ? "The run is 0. Vertical lines have undefined slope."
      : dy === 0
        ? "The rise is 0, so the slope is 0."
        : `Rise ${dy}, run ${dx}. Slope ${answer}.`;
  return {
    kicker: "SLOPE",
    ask: "What is the slope of this line?",
    scene: { a, b, kind: "slope" },
    choices: slopeChoices(dy, dx),
    answer,
    blurb,
  };
}

function pointPrompt(a: Pt, b: Pt): SlopePrompt {
  const hit = findHit(a, b);
  const misses = findMisses(a, b, hit);
  const answer = pointLabel(hit);
  return {
    kicker: "ON THE LINE",
    ask: "Which point sits on this line?",
    scene: { a, b, kind: "point", hit },
    choices: [answer, pointLabel(misses[0]), pointLabel(misses[1]), pointLabel(misses[2])],
    answer,
    blurb: `${answer} keeps the same rise-over-run as the two dots. The others step off.`,
  };
}

export const SLOPE_LEVELS: SlopeLevel[] = TITLES.map((title, index) => ({
  id: index + 1,
  title,
  prompts: [
    slopePrompt(LINES[index * 2][0], LINES[index * 2][1]),
    slopePrompt(LINES[index * 2 + 1][0], LINES[index * 2 + 1][1]),
    pointPrompt(POINT_LINES[index][0], POINT_LINES[index][1]),
  ],
}));

export function auditSlope(): string[] {
  const errors: string[] = [];
  if (SLOPE_LEVELS.length !== 16) errors.push(`slope count ${SLOPE_LEVELS.length}`);
  if (LINES.length !== 32 || POINT_LINES.length !== 16) errors.push("slope tables");
  SLOPE_LEVELS.forEach((level, index) => {
    if (level.id !== index + 1) errors.push(`slope id ${level.id}`);
    if (level.prompts.length !== 3) errors.push(`slope prompts ${level.id}`);
    for (const prompt of level.prompts) {
      if (new Set(prompt.choices).size !== 4) errors.push(`level ${level.id} choices`);
      if (!prompt.choices.includes(prompt.answer)) errors.push(`level ${level.id} answer missing`);
      const { a, b } = prompt.scene;
      if (a[0] === b[0] && a[1] === b[1]) errors.push(`level ${level.id} degenerate`);
      if (prompt.scene.kind === "slope") {
        const expected = formatSlope(b[1] - a[1], b[0] - a[0]);
        if (prompt.answer !== expected) errors.push(`level ${level.id} slope ${prompt.answer} != ${expected}`);
      } else {
        const hit = prompt.scene.hit;
        if (!hit || !onLine(a, b, hit) || prompt.answer !== pointLabel(hit)) errors.push(`level ${level.id} hit`);
        for (const choice of prompt.choices) {
          if (choice === prompt.answer) continue;
          const match = choice.match(/^\((-?\d+), (-?\d+)\)$/);
          if (!match) {
            errors.push(`level ${level.id} label ${choice}`);
            continue;
          }
          const point: Pt = [Number(match[1]), Number(match[2])];
          if (onLine(a, b, point)) errors.push(`level ${level.id} miss is on line ${choice}`);
        }
      }
    }
  });
  return errors;
}
