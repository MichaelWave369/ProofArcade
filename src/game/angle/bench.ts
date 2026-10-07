import { ANGLE_LEVELS, angleValue, type AngleKind, type AngleScene } from "./levels.ts";

export type AngleBenchState = {
  a: number;
  b: number;
};

export type AngleBenchPlay = {
  id: number;
  title: string;
  kind: AngleKind;
  scene: AngleScene;
  target: number;
  start: AngleBenchState;
  solution: AngleBenchState;
};

function limits(kind: AngleKind, a: number) {
  if (kind === "complement") return { min: 1, max: 89 };
  if (kind === "triangle") return { min: 1, max: Math.max(1, 179 - a) };
  return { min: 1, max: 179 };
}

export function snapAngle(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

export function pointerAngleDegrees(cx: number, cy: number, x: number, y: number) {
  const raw = (Math.atan2(cy - y, x - cx) * 180) / Math.PI;
  const normalized = raw < 0 ? raw + 360 : raw;
  return normalized;
}

export function angleBenchValue(kind: AngleKind, state: AngleBenchState) {
  if (kind === "complement") return 90 - state.a;
  if (kind === "supplement") return 180 - state.a;
  if (kind === "vertical") return state.a;
  return 180 - state.a - state.b;
}

export function angleBenchSolved(play: AngleBenchPlay, state: AngleBenchState) {
  return angleBenchValue(play.kind, state) === play.target;
}

export function angleBenchRange(play: AngleBenchPlay) {
  if (play.kind === "triangle") return limits(play.kind, play.solution.a);
  return limits(play.kind, play.solution.a);
}

export function applyAngleHandle(
  play: AngleBenchPlay,
  state: AngleBenchState,
  value: number,
): AngleBenchState {
  const range = angleBenchRange(play);
  if (play.kind === "triangle") {
    return {
      a: play.solution.a,
      b: snapAngle(value, range.min, range.max),
    };
  }
  return {
    a: snapAngle(value, range.min, range.max),
    b: state.b,
  };
}

function offsetStart(scene: AngleScene): AngleBenchState {
  if (scene.kind === "triangle") {
    const range = limits(scene.kind, scene.a);
    const direction = scene.b + 14 <= range.max ? 14 : -14;
    return {
      a: scene.a,
      b: snapAngle(scene.b + direction, range.min, range.max),
    };
  }

  const range = limits(scene.kind, scene.a);
  const direction = scene.a + 16 <= range.max ? 16 : -16;
  return {
    a: snapAngle(scene.a + direction, range.min, range.max),
    b: scene.b,
  };
}

export const ANGLE_PLAYS: AngleBenchPlay[] = ANGLE_LEVELS.map((level) => {
  const scene = level.prompts[0].scene;
  const solution = { a: scene.a, b: scene.b };
  return {
    id: level.id,
    title: level.title,
    kind: scene.kind,
    scene,
    target: angleValue(scene),
    start: offsetStart(scene),
    solution,
  };
});

export function angleBenchInstruction(play: AngleBenchPlay) {
  if (play.kind === "complement") {
    return `Rotate the split ray until the mint remainder is ${play.target}°. The two parts must still make 90°.`;
  }
  if (play.kind === "supplement") {
    return `Rotate the split ray until the mint angle is ${play.target}°. Together the two adjacent angles stay at 180°.`;
  }
  if (play.kind === "vertical") {
    return `Rotate the crossing line until the opposite mint angle is ${play.target}°. Vertical angles remain equal.`;
  }
  return `The gold base angle stays at ${play.solution.a}°. Rotate the mint base ray until the third angle is ${play.target}°.`;
}

export function auditAngleBench(): string[] {
  const errors: string[] = [];
  if (ANGLE_PLAYS.length !== 16) errors.push(`count ${ANGLE_PLAYS.length}`);

  for (const play of ANGLE_PLAYS) {
    if (!angleBenchSolved(play, play.solution)) errors.push(`solution ${play.id}`);
    if (angleBenchSolved(play, play.start)) errors.push(`start solved ${play.id}`);

    const range = angleBenchRange(play);
    const control = play.kind === "triangle" ? play.solution.b : play.solution.a;
    if (control < range.min || control > range.max) errors.push(`range ${play.id}`);

    const low = applyAngleHandle(play, play.start, -999);
    const high = applyAngleHandle(play, play.start, 999);
    const lowControl = play.kind === "triangle" ? low.b : low.a;
    const highControl = play.kind === "triangle" ? high.b : high.a;
    if (lowControl !== range.min) errors.push(`low ${play.id}`);
    if (highControl !== range.max) errors.push(`high ${play.id}`);
  }

  return errors;
}
