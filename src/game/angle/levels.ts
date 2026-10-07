export type AngleKind = "complement" | "supplement" | "triangle" | "vertical";

export type AngleScene = {
  kind: AngleKind;
  a: number;
  b: number;
};

export type AnglePrompt = {
  kicker: string;
  ask: string;
  scene: AngleScene;
  choices: [string, string, string, string];
  answer: string;
  blurb: string;
};

export type AngleLevel = {
  id: number;
  title: string;
  prompts: AnglePrompt[];
};

const ROWS: AngleScene[][] = [
  [
    { kind: "complement", a: 30, b: 0 },
    { kind: "complement", a: 20, b: 0 },
    { kind: "complement", a: 45, b: 0 },
  ],
  [
    { kind: "complement", a: 10, b: 0 },
    { kind: "complement", a: 15, b: 0 },
    { kind: "complement", a: 40, b: 0 },
  ],
  [
    { kind: "complement", a: 25, b: 0 },
    { kind: "complement", a: 35, b: 0 },
    { kind: "complement", a: 55, b: 0 },
  ],
  [
    { kind: "complement", a: 12, b: 0 },
    { kind: "complement", a: 28, b: 0 },
    { kind: "complement", a: 63, b: 0 },
  ],
  [
    { kind: "supplement", a: 30, b: 0 },
    { kind: "supplement", a: 50, b: 0 },
    { kind: "supplement", a: 100, b: 0 },
  ],
  [
    { kind: "supplement", a: 20, b: 0 },
    { kind: "supplement", a: 70, b: 0 },
    { kind: "supplement", a: 110, b: 0 },
  ],
  [
    { kind: "supplement", a: 45, b: 0 },
    { kind: "supplement", a: 90, b: 0 },
    { kind: "supplement", a: 135, b: 0 },
  ],
  [
    { kind: "supplement", a: 15, b: 0 },
    { kind: "supplement", a: 60, b: 0 },
    { kind: "supplement", a: 125, b: 0 },
  ],
  [
    { kind: "triangle", a: 40, b: 60 },
    { kind: "triangle", a: 50, b: 50 },
    { kind: "triangle", a: 30, b: 60 },
  ],
  [
    { kind: "triangle", a: 45, b: 45 },
    { kind: "triangle", a: 70, b: 40 },
    { kind: "triangle", a: 20, b: 80 },
  ],
  [
    { kind: "triangle", a: 35, b: 65 },
    { kind: "triangle", a: 25, b: 55 },
    { kind: "triangle", a: 50, b: 60 },
  ],
  [
    { kind: "triangle", a: 90, b: 30 },
    { kind: "triangle", a: 15, b: 75 },
    { kind: "triangle", a: 40, b: 40 },
  ],
  [
    { kind: "vertical", a: 40, b: 0 },
    { kind: "vertical", a: 70, b: 0 },
    { kind: "vertical", a: 110, b: 0 },
  ],
  [
    { kind: "vertical", a: 25, b: 0 },
    { kind: "vertical", a: 85, b: 0 },
    { kind: "vertical", a: 150, b: 0 },
  ],
  [
    { kind: "complement", a: 18, b: 0 },
    { kind: "supplement", a: 75, b: 0 },
    { kind: "triangle", a: 30, b: 50 },
  ],
  [
    { kind: "vertical", a: 55, b: 0 },
    { kind: "supplement", a: 48, b: 0 },
    { kind: "triangle", a: 36, b: 72 },
  ],
];

const TITLES = [
  "Right split",
  "Still right",
  "Smaller slice",
  "Close to square",
  "Straight line",
  "Wide and narrow",
  "The other half",
  "Almost flat",
  "Close the triangle",
  "Isosceles",
  "Uneven",
  "Right corner",
  "Opposite",
  "Crossing",
  "Mixed bench",
  "Last angle",
];

const FALLBACK = [10, 20, 30, 40, 45, 50, 60, 70, 80, 100, 110, 120, 135, 150, 15, 25, 35];

export function angleValue(scene: AngleScene): number {
  if (scene.kind === "complement") return 90 - scene.a;
  if (scene.kind === "supplement") return 180 - scene.a;
  if (scene.kind === "vertical") return scene.a;
  return 180 - scene.a - scene.b;
}

function askFor(scene: AngleScene): string {
  if (scene.kind === "complement") return "The right angle is split. What is the unmarked part?";
  if (scene.kind === "supplement") return "The line is straight. What is the unmarked angle?";
  if (scene.kind === "vertical") return "Opposite angles match. What is the unmarked angle?";
  return "A triangle sums to 180°. What is the unmarked angle?";
}

function blurbFor(scene: AngleScene, value: number): string {
  if (scene.kind === "complement") return `90 − ${scene.a} = ${value}. The two parts make a right angle.`;
  if (scene.kind === "supplement") return `180 − ${scene.a} = ${value}. Adjacent angles on a straight line.`;
  if (scene.kind === "vertical") return `Opposite angles are equal, so this one is also ${value}°.`;
  return `180 − ${scene.a} − ${scene.b} = ${value}. The three angles close the triangle.`;
}

export function angleCaption(scene: AngleScene): string {
  if (scene.kind === "complement") return `Marked ${scene.a}° inside a right angle`;
  if (scene.kind === "supplement") return `Marked ${scene.a}° on a straight line`;
  if (scene.kind === "vertical") return `Marked ${scene.a}°. The opposite angle is unmarked`;
  return `Marked ${scene.a}° and ${scene.b}°. The third angle is unmarked`;
}

function decoys(scene: AngleScene, value: number): number[] {
  const pool = [
    scene.a,
    scene.b,
    90 - scene.a,
    180 - scene.a,
    value + 10,
    value - 10,
    scene.a + scene.b,
    Math.abs(scene.a - scene.b),
    ...FALLBACK,
  ];
  const out: number[] = [];
  for (const n of pool) {
    if (!Number.isInteger(n) || n <= 0 || n >= 180 || n === value) continue;
    if (out.includes(n)) continue;
    out.push(n);
    if (out.length === 3) break;
  }
  return out;
}

function promptFor(scene: AngleScene): AnglePrompt {
  const value = angleValue(scene);
  const misses = decoys(scene, value);
  if (misses.length < 3) throw new Error(`angle decoys ${scene.kind} ${scene.a}`);
  const answer = String(value);
  return {
    kicker: scene.kind === "triangle" ? "180°" : scene.kind === "complement" ? "90°" : "Straight",
    ask: askFor(scene),
    scene,
    choices: [answer, ...misses.map(String)] as [string, string, string, string],
    answer,
    blurb: blurbFor(scene, value),
  };
}

export const ANGLE_LEVELS: AngleLevel[] = ROWS.map((row, index) => ({
  id: index + 1,
  title: TITLES[index] ?? `Angle ${index + 1}`,
  prompts: row.map(promptFor),
}));

export function auditAngle(): string[] {
  const errors: string[] = [];
  if (ANGLE_LEVELS.length !== 16) errors.push(`levels ${ANGLE_LEVELS.length}`);
  for (const level of ANGLE_LEVELS) {
    if (level.prompts.length !== 3) errors.push(`level ${level.id} prompts`);
    for (const prompt of level.prompts) {
      const scene = prompt.scene;
      const value = angleValue(scene);
      if (scene.kind === "complement" && (scene.a <= 0 || scene.a >= 90)) errors.push(`comp ${level.id}`);
      if (scene.kind === "supplement" && (scene.a <= 0 || scene.a >= 180)) errors.push(`supp ${level.id}`);
      if (scene.kind === "vertical" && (scene.a <= 0 || scene.a >= 180)) errors.push(`vert ${level.id}`);
      if (scene.kind === "triangle" && (scene.a <= 0 || scene.b <= 0 || scene.a + scene.b >= 180)) {
        errors.push(`tri ${level.id}`);
      }
      if (prompt.answer !== String(value)) errors.push(`answer ${level.id} ${prompt.answer}`);
      if (!prompt.choices.includes(prompt.answer)) errors.push(`missing ${level.id}`);
      if (new Set(prompt.choices).size !== 4) errors.push(`dup ${level.id} ${prompt.choices.join(",")}`);
      for (const choice of prompt.choices) {
        if (choice !== prompt.answer && Number(choice) === value) errors.push(`alias ${level.id} ${choice}`);
      }
    }
  }
  return errors;
}
