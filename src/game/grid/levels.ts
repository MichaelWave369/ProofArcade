export type Pt = [number, number];

export type GridScene = {
  kind: "mid" | "far";
  a: Pt;
  b: Pt;
};

export type GridPrompt = {
  kicker: string;
  ask: string;
  scene: GridScene;
  choices: [string, string, string, string];
  answer: string;
  blurb: string;
};

export type GridLevel = {
  id: number;
  title: string;
  prompts: GridPrompt[];
};

const MIDS: Pt[][] = [
  [[0, 0], [4, 2]],
  [[0, 0], [2, 4]],
  [[-2, -2], [2, 2]],
  [[-4, 0], [2, 2]],
  [[0, 2], [4, -2]],
  [[-2, 4], [2, 0]],
  [[-4, -2], [0, 4]],
  [[-3, -1], [1, 3]],
  [[0, -4], [4, 0]],
  [[-2, -4], [4, 2]],
  [[-4, 4], [4, -2]],
  [[-2, 1], [4, 3]],
  [[-4, -4], [2, 0]],
  [[0, 0], [0, 4]],
  [[-6, 0], [2, 4]],
  [[-2, -6], [4, 2]],
  [[1, -3], [5, 1]],
  [[-5, -1], [3, 5]],
  [[-6, 2], [0, 6]],
  [[-4, -6], [2, 4]],
  [[0, 6], [6, 0]],
  [[-6, -2], [4, 6]],
  [[2, -4], [6, 2]],
  [[-3, 5], [3, -1]],
];

const FARS: Pt[][] = [
  [[0, 0], [3, 4]],
  [[-2, -1], [1, 3]],
  [[-3, 0], [0, 4]],
  [[1, -2], [4, 2]],
  [[-4, -4], [-1, 0]],
  [[0, 1], [3, 5]],
  [[-1, -3], [2, 1]],
  [[2, 2], [5, 6]],
  [[-6, -4], [0, 4]],
  [[-4, -3], [2, 5]],
  [[-2, -6], [4, 2]],
  [[-6, -6], [0, 2]],
  [[-4, -3], [4, 3]],
  [[-2, -4], [6, 2]],
  [[-6, -1], [2, 5]],
  [[-6, -5], [2, 1]],
  [[-6, -6], [-1, 6]],
  [[-4, -6], [1, 6]],
  [[0, -6], [5, 6]],
  [[-6, -6], [6, -1]],
  [[-6, -6], [3, 6]],
  [[-5, -6], [4, 6]],
  [[-6, -6], [6, 3]],
  [[-6, -3], [6, 6]],
];

const TITLES = [
  "Halfway",
  "Center",
  "Between",
  "Meet",
  "Middle",
  "Split",
  "Still between",
  "Last middle",
  "How far",
  "The span",
  "Longer",
  "Diagonal",
  "Across",
  "Farther",
  "The reach",
  "Last distance",
];

export function midpoint(a: Pt, b: Pt): Pt | null {
  if ((a[0] + b[0]) % 2 !== 0 || (a[1] + b[1]) % 2 !== 0) return null;
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}

export function straightDistance(a: Pt, b: Pt): number | null {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const square = dx * dx + dy * dy;
  const root = Math.round(Math.sqrt(square));
  return root * root === square ? root : null;
}

export function pointLabel(p: Pt): string {
  return `(${p[0]}, ${p[1]})`;
}

export function gridAsk(scene: GridScene): string {
  if (scene.kind === "mid") return "What point sits halfway between them?";
  return "How far apart are the two points, in a straight line?";
}

export function gridKicker(scene: GridScene): string {
  return scene.kind === "mid" ? "Halfway" : "Distance";
}

export function gridBlurb(scene: GridScene): string {
  if (scene.kind === "mid") {
    const mid = midpoint(scene.a, scene.b);
    return `Average the runs, then the rises: ${mid ? pointLabel(mid) : "?"}.`;
  }
  const dx = scene.b[0] - scene.a[0];
  const dy = scene.b[1] - scene.a[1];
  const dist = straightDistance(scene.a, scene.b);
  return `Run ${dx}, rise ${dy}. ${dx}² + ${dy}² = ${dist}². Distance ${dist}.`;
}

export function gridCaption(scene: GridScene): string {
  return `${pointLabel(scene.a)} to ${pointLabel(scene.b)}`;
}

function takeFour(answer: string, extra: string[]): [string, string, string, string] {
  const choices: string[] = [];
  for (const item of [answer, ...extra]) {
    if (!choices.includes(item)) choices.push(item);
    if (choices.length === 4) return [choices[0], choices[1], choices[2], choices[3]];
  }
  throw new Error(`grid choices for ${answer}`);
}

function inRange(p: Pt): boolean {
  return p.every((n) => Number.isInteger(n) && n >= -6 && n <= 6);
}

function midChoices(a: Pt, b: Pt, mid: Pt): [string, string, string, string] {
  const decoys: Pt[] = [
    [mid[1], mid[0]],
    [a[0], b[1]],
    [b[0], a[1]],
    [mid[0] + 1, mid[1]],
    [mid[0], mid[1] + 1],
    [mid[0] - 1, mid[1]],
    [mid[0], mid[1] - 1],
    a,
    b,
    [a[0] + b[0], a[1] + b[1]],
  ];
  return takeFour(
    pointLabel(mid),
    decoys.filter((p) => p[0] !== mid[0] || p[1] !== mid[1]).map(pointLabel),
  );
}

function farChoices(a: Pt, b: Pt, dist: number): [string, string, string, string] {
  const dx = Math.abs(a[0] - b[0]);
  const dy = Math.abs(a[1] - b[1]);
  const pool = [dx + dy, dx, dy, dist + 1, dist - 1, Math.max(dx, dy), dist + dx, dist + 2];
  return takeFour(
    String(dist),
    pool.filter((n) => Number.isInteger(n) && n > 0 && n !== dist).map(String),
  );
}

function promptAt(id: number, slot: number): GridPrompt {
  const kind = id <= 8 ? "mid" : "far";
  const pair = (kind === "mid" ? MIDS : FARS)[(id - (kind === "mid" ? 1 : 9)) * 3 + slot];
  const scene: GridScene = { kind, a: pair[0], b: pair[1] };
  if (kind === "mid") {
    const mid = midpoint(scene.a, scene.b);
    if (!mid) throw new Error(`mid ${id}`);
    return {
      kicker: gridKicker(scene),
      ask: gridAsk(scene),
      scene,
      choices: midChoices(scene.a, scene.b, mid),
      answer: pointLabel(mid),
      blurb: gridBlurb(scene),
    };
  }
  const dist = straightDistance(scene.a, scene.b);
  if (dist === null) throw new Error(`far ${id}`);
  return {
    kicker: gridKicker(scene),
    ask: gridAsk(scene),
    scene,
    choices: farChoices(scene.a, scene.b, dist),
    answer: String(dist),
    blurb: gridBlurb(scene),
  };
}

export const GRID_LEVELS: GridLevel[] = TITLES.map((title, index) => ({
  id: index + 1,
  title,
  prompts: [0, 1, 2].map((slot) => promptAt(index + 1, slot)),
}));

function parsePoint(label: string): Pt | null {
  const match = label.match(/^\((-?\d+), (-?\d+)\)$/);
  if (!match) return null;
  return [Number(match[1]), Number(match[2])];
}

export function auditGrid(): string[] {
  const errors: string[] = [];
  if (GRID_LEVELS.length !== 16) errors.push(`levels ${GRID_LEVELS.length}`);
  if (MIDS.length !== 24 || FARS.length !== 24) errors.push("pair count");
  GRID_LEVELS.forEach((level, index) => {
    if (level.id !== index + 1) errors.push(`id ${level.id}`);
    if (level.prompts.length !== 3) errors.push(`prompts ${level.id}`);
    for (const prompt of level.prompts) {
      const { a, b, kind } = prompt.scene;
      if (!inRange(a) || !inRange(b)) errors.push(`range ${level.id}`);
      if (a[0] === b[0] && a[1] === b[1]) errors.push(`same ${level.id}`);
      if (prompt.ask !== gridAsk(prompt.scene) || prompt.blurb !== gridBlurb(prompt.scene)) errors.push(`copy ${level.id}`);
      if (new Set(prompt.choices).size !== 4 || !prompt.choices.includes(prompt.answer)) errors.push(`choices ${level.id}`);
      if (kind === "mid") {
        const mid = midpoint(a, b);
        if (!mid || prompt.answer !== pointLabel(mid)) errors.push(`mid ${level.id} ${prompt.answer}`);
        for (const choice of prompt.choices) {
          const parsed = parsePoint(choice);
          if (!parsed) errors.push(`label ${level.id} ${choice}`);
          else if (choice !== prompt.answer && parsed[0] === mid?.[0] && parsed[1] === mid?.[1]) errors.push(`decoy mid ${level.id}`);
        }
      } else {
        const dist = straightDistance(a, b);
        if (dist === null || prompt.answer !== String(dist)) errors.push(`far ${level.id}`);
        for (const choice of prompt.choices) {
          if (!/^\d+$/.test(choice)) errors.push(`dist label ${level.id}`);
          if (choice !== prompt.answer && Number(choice) === dist) errors.push(`decoy far ${level.id}`);
        }
      }
    }
  });
  return errors;
}
