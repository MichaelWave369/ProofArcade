export type MotionScene = {
  kind: "speed" | "distance" | "time";
  speed: number;
  time: number;
};

export type MotionPrompt = {
  kicker: string;
  ask: string;
  scene: MotionScene;
  choices: [string, string, string, string];
  answer: string;
  blurb: string;
};

export type MotionLevel = {
  id: number;
  title: string;
  prompts: MotionPrompt[];
};

const TITLES = [
  "How fast",
  "Steady pace",
  "Quicker",
  "Same clock",
  "Longer run",
  "Last speed",
  "How far",
  "Keep going",
  "Farther",
  "Short trip",
  "Long trip",
  "Last distance",
  "How long",
  "The clock",
  "Wait",
  "Last time",
];

export function motionDistance(scene: MotionScene): number {
  return scene.speed * scene.time;
}

export function motionAnswer(scene: MotionScene): number {
  if (scene.kind === "speed") return scene.speed;
  if (scene.kind === "time") return scene.time;
  return motionDistance(scene);
}

export function motionAsk(scene: MotionScene): string {
  if (scene.kind === "speed") return "How many meters each second?";
  if (scene.kind === "distance") return "How many meters does the trip cover?";
  return "How many seconds does the trip take?";
}

export function motionKicker(scene: MotionScene): string {
  if (scene.kind === "speed") return "Speed";
  if (scene.kind === "distance") return "Distance";
  return "Time";
}

export function motionBlurb(scene: MotionScene): string {
  const distance = motionDistance(scene);
  if (scene.kind === "speed") return `${distance} m in ${scene.time} s is ${scene.speed} m each second.`;
  if (scene.kind === "distance") return `${scene.speed} m each second for ${scene.time} s covers ${distance} m.`;
  return `${distance} m at ${scene.speed} m each second takes ${scene.time} s.`;
}

export function motionGivens(scene: MotionScene): [string, string] {
  const distance = motionDistance(scene);
  if (scene.kind === "speed") return [`${distance} m`, `${scene.time} s`];
  if (scene.kind === "distance") return [`${scene.speed} m/s`, `${scene.time} s`];
  return [`${distance} m`, `${scene.speed} m/s`];
}

function takeFour(answer: string, extra: number[]): [string, string, string, string] {
  const choices: string[] = [];
  for (const item of [answer, ...extra.map(String)]) {
    if (!choices.includes(item)) choices.push(item);
    if (choices.length === 4) return [choices[0], choices[1], choices[2], choices[3]];
  }
  throw new Error(`motion choices for ${answer}`);
}

function choicesFor(scene: MotionScene): [string, string, string, string] {
  const answer = motionAnswer(scene);
  const distance = motionDistance(scene);
  const pool = [
    answer + 1,
    answer - 1,
    answer + 2,
    scene.speed + scene.time,
    distance + scene.speed,
    scene.kind === "distance" ? scene.speed : distance,
    scene.kind === "time" ? scene.speed : scene.time,
  ];
  return takeFour(
    String(answer),
    pool.filter((n) => Number.isInteger(n) && n > 0 && n !== answer),
  );
}

function sceneAt(id: number, slot: number): MotionScene {
  if (id <= 6) return { kind: "speed", speed: 2 + id + slot, time: 2 + slot };
  if (id <= 12) return { kind: "distance", speed: 3 + (id - 7) + slot, time: 2 + (slot % 3) };
  return { kind: "time", speed: 2 + slot + (id % 3), time: 2 + (id - 13) + slot };
}

function promptAt(id: number, slot: number): MotionPrompt {
  const scene = sceneAt(id, slot);
  return {
    kicker: motionKicker(scene),
    ask: motionAsk(scene),
    scene,
    choices: choicesFor(scene),
    answer: String(motionAnswer(scene)),
    blurb: motionBlurb(scene),
  };
}

export const MOTION_LEVELS: MotionLevel[] = TITLES.map((title, index) => ({
  id: index + 1,
  title,
  prompts: [0, 1, 2].map((slot) => promptAt(index + 1, slot)),
}));

export function auditMotion(): string[] {
  const errors: string[] = [];
  if (MOTION_LEVELS.length !== 16) errors.push(`levels ${MOTION_LEVELS.length}`);
  MOTION_LEVELS.forEach((level, index) => {
    if (level.id !== index + 1) errors.push(`id ${level.id}`);
    if (level.prompts.length !== 3) errors.push(`prompts ${level.id}`);
    for (const prompt of level.prompts) {
      const scene = prompt.scene;
      if (!Number.isInteger(scene.speed) || scene.speed < 2) errors.push(`speed ${level.id}`);
      if (!Number.isInteger(scene.time) || scene.time < 2) errors.push(`time ${level.id}`);
      const answer = motionAnswer(scene);
      if (prompt.answer !== String(answer)) errors.push(`answer ${level.id}`);
      if (prompt.blurb !== motionBlurb(scene) || prompt.ask !== motionAsk(scene)) errors.push(`copy ${level.id}`);
      if (scene.kind === "distance" && motionDistance(scene) !== answer) errors.push(`distance ${level.id}`);
      if (scene.kind === "speed" && motionDistance(scene) !== scene.speed * scene.time) errors.push(`rate ${level.id}`);
      if (new Set(prompt.choices).size !== 4 || !prompt.choices.includes(prompt.answer)) errors.push(`choices ${level.id}`);
      for (const choice of prompt.choices) {
        if (choice !== prompt.answer && Number(choice) === answer) errors.push(`decoy ${level.id}`);
      }
    }
  });
  return errors;
}
