export type AreaScene =
  | { kind: "rect"; w: number; h: number }
  | { kind: "tri"; a: number; b: number }
  | { kind: "add"; w: number; h: number; w2: number; h2: number }
  | { kind: "cut"; w: number; h: number; w2: number; h2: number };

export type AreaPrompt = {
  kicker: string;
  ask: string;
  scene: AreaScene;
  choices: [string, string, string, string];
  answer: string;
  blurb: string;
};

export type AreaLevel = {
  id: number;
  title: string;
  prompts: AreaPrompt[];
};

const TRIS: [number, number][] = [
  [4, 3],
  [6, 3],
  [4, 5],
  [8, 3],
  [6, 5],
  [4, 7],
  [8, 5],
  [6, 7],
  [10, 3],
  [8, 7],
  [10, 5],
  [6, 9],
  [12, 3],
  [8, 9],
  [10, 7],
];

const TITLES = [
  "Count the block",
  "Wider",
  "Taller",
  "Same bricks",
  "Long room",
  "Last rectangle",
  "Half the box",
  "Right corner",
  "Triangle",
  "Steeper half",
  "Last triangle",
  "Two blocks",
  "Side by side",
  "Add them",
  "Cut out",
  "What's left",
];

export function areaOf(scene: AreaScene): number {
  if (scene.kind === "rect") return scene.w * scene.h;
  if (scene.kind === "tri") return (scene.a * scene.b) / 2;
  if (scene.kind === "add") return scene.w * scene.h + scene.w2 * scene.h2;
  return scene.w * scene.h - scene.w2 * scene.h2;
}

export function areaAsk(scene: AreaScene): string {
  if (scene.kind === "rect") return "How many unit squares fill the rectangle?";
  if (scene.kind === "tri") return "The right angle is the corner. How many unit squares is the triangle?";
  if (scene.kind === "add") return "Both gold blocks count. What is the total area?";
  return "The ink cut is empty. What area is left?";
}

export function areaKicker(scene: AreaScene): string {
  if (scene.kind === "rect") return "Rectangle";
  if (scene.kind === "tri") return "Triangle";
  if (scene.kind === "add") return "Two blocks";
  return "Cut out";
}

export function areaBlurb(scene: AreaScene): string {
  const area = areaOf(scene);
  if (scene.kind === "rect") return `${scene.w} × ${scene.h} = ${area}.`;
  if (scene.kind === "tri") return `Half of ${scene.a} × ${scene.b} is ${area}.`;
  if (scene.kind === "add") return `${scene.w} × ${scene.h} + ${scene.w2} × ${scene.h2} = ${area}.`;
  return `${scene.w} × ${scene.h} − ${scene.w2} × ${scene.h2} = ${area}.`;
}

export function areaCaption(scene: AreaScene): string {
  if (scene.kind === "rect") return `${scene.w} by ${scene.h}`;
  if (scene.kind === "tri") return `legs ${scene.a} and ${scene.b}`;
  if (scene.kind === "add") return `${scene.w} by ${scene.h}, plus ${scene.w2} by ${scene.h2}`;
  return `${scene.w} by ${scene.h}, cut ${scene.w2} by ${scene.h2}`;
}

function takeFour(answer: string, extra: number[]): [string, string, string, string] {
  const choices: string[] = [];
  for (const item of [answer, ...extra.map(String)]) {
    if (!choices.includes(item)) choices.push(item);
    if (choices.length === 4) return [choices[0], choices[1], choices[2], choices[3]];
  }
  throw new Error(`area choices for ${answer}`);
}

function choicesFor(scene: AreaScene): [string, string, string, string] {
  const answer = areaOf(scene);
  const pool = [answer + 1, answer - 1, answer + 2, answer + 3];
  if (scene.kind === "rect") pool.push(scene.w + scene.h, scene.w, scene.h, scene.w * scene.h + scene.w);
  if (scene.kind === "tri") pool.push(scene.a * scene.b, scene.a + scene.b, scene.a, scene.b);
  if (scene.kind === "add") pool.push(scene.w * scene.h, scene.w2 * scene.h2, scene.w + scene.h + scene.w2 + scene.h2);
  if (scene.kind === "cut") pool.push(scene.w * scene.h, scene.w2 * scene.h2, scene.w * scene.h + scene.w2 * scene.h2);
  return takeFour(
    String(answer),
    pool.filter((n) => Number.isInteger(n) && n > 0 && n !== answer),
  );
}

function sceneAt(id: number, slot: number): AreaScene {
  if (id <= 6) {
    return { kind: "rect", w: 2 + slot + ((id - 1) % 2), h: 2 + ((id + slot) % 4) };
  }
  if (id <= 11) {
    const pair = TRIS[(id - 7) * 3 + slot];
    return { kind: "tri", a: pair[0], b: pair[1] };
  }
  if (id <= 14) {
    return {
      kind: "add",
      w: 3 + slot,
      h: 2 + ((id + slot) % 3),
      w2: 2 + (slot % 2),
      h2: 2 + ((id - 12) % 2),
    };
  }
  return {
    kind: "cut",
    w: 6 + slot,
    h: 5 + (id === 16 ? 1 : 0),
    w2: 2 + slot,
    h2: 2,
  };
}

function promptAt(id: number, slot: number): AreaPrompt {
  const scene = sceneAt(id, slot);
  const answer = String(areaOf(scene));
  return {
    kicker: areaKicker(scene),
    ask: areaAsk(scene),
    scene,
    choices: choicesFor(scene),
    answer,
    blurb: areaBlurb(scene),
  };
}

export const AREA_LEVELS: AreaLevel[] = TITLES.map((title, index) => ({
  id: index + 1,
  title,
  prompts: [0, 1, 2].map((slot) => promptAt(index + 1, slot)),
}));

export function auditArea(): string[] {
  const errors: string[] = [];
  if (AREA_LEVELS.length !== 16) errors.push(`levels ${AREA_LEVELS.length}`);
  AREA_LEVELS.forEach((level, index) => {
    if (level.id !== index + 1) errors.push(`id ${level.id}`);
    if (level.prompts.length !== 3) errors.push(`prompts ${level.id}`);
    for (const prompt of level.prompts) {
      const scene = prompt.scene;
      const area = areaOf(scene);
      if (!Number.isInteger(area) || area <= 0) errors.push(`area ${level.id} ${area}`);
      if (prompt.answer !== String(area)) errors.push(`answer ${level.id} ${prompt.answer}`);
      if (prompt.blurb !== areaBlurb(scene)) errors.push(`blurb ${level.id}`);
      if (prompt.ask !== areaAsk(scene)) errors.push(`ask ${level.id}`);
      if (new Set(prompt.choices).size !== 4 || !prompt.choices.includes(prompt.answer)) {
        errors.push(`choices ${level.id}`);
      }
      for (const choice of prompt.choices) {
        if (choice !== prompt.answer && Number(choice) === area) errors.push(`decoy ${level.id} ${choice}`);
      }
      if (scene.kind === "rect" && (scene.w < 2 || scene.h < 2)) errors.push(`rect ${level.id}`);
      if (scene.kind === "tri" && (scene.a * scene.b) % 2 !== 0) errors.push(`tri ${level.id}`);
      if (scene.kind === "add" && (scene.w < 1 || scene.h < 1 || scene.w2 < 1 || scene.h2 < 1)) errors.push(`add ${level.id}`);
      if (scene.kind === "cut" && (scene.w2 >= scene.w || scene.h2 >= scene.h || scene.w2 < 1 || scene.h2 < 1)) {
        errors.push(`cut ${level.id}`);
      }
    }
  });
  return errors;
}
