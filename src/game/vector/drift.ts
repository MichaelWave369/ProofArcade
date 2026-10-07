export type V = { x: number; y: number };

export type DriftKind = "position" | "velocity" | "acceleration" | "momentum" | "intercept";

export type DriftLevel = {
  id: number;
  title: string;
  kind: DriftKind;
  blurb: string;
  law: string;
  start: V;
  /** Standing goal, or the target's position before the first burn. */
  target0: V;
  targetStep: V;
  mass: number;
  cards: V[];
  solution: number[];
  span: number;
};

export type DriftState = {
  pos: V;
  vel: V;
  acc: V;
  target: V;
  used: boolean[];
  trail: V[];
  applied: V;
  resultant: V;
  turn: number;
  met: boolean;
};

export function v(x: number, y: number): V {
  return { x, y };
}

export function addV(a: V, b: V): V {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function subV(a: V, b: V): V {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function sameV(a: V, b: V) {
  return a.x === b.x && a.y === b.y;
}

export function formatV(p: V) {
  return `(${p.x}, ${p.y})`;
}

const LAWS: Record<DriftKind, string> = {
  position: "A card adds straight to position. The resultant is the sum of the cards you have played.",
  velocity: "A card adds to velocity. Position then steps by that new velocity.",
  acceleration: "A card adds to acceleration. Velocity adds that acceleration. Position then adds velocity.",
  momentum: "A card is an impulse. Change in velocity = impulse ÷ mass. Position then steps by velocity.",
  intercept: "Thrust works like velocity. The target steps only when you miss it.",
};

function level(
  id: number,
  title: string,
  kind: DriftKind,
  blurb: string,
  start: V,
  target0: V,
  cards: V[],
  solution: number[],
  span: number,
  targetStep: V = v(0, 0),
  mass = 1,
): DriftLevel {
  return { id, title, kind, blurb, law: LAWS[kind], start, target0, targetStep, mass, cards, solution, span };
}

export const DRIFT_LEVELS: DriftLevel[] = [
  level(1, "Two steps east", "position", "Land on the mark. Order only changes the trail.", v(0, 0), v(3, 1), [v(2, 0), v(1, 1), v(0, 2), v(-1, 0)], [0, 1], 5),
  level(2, "North then east", "position", "Leave the decoys in the tray.", v(0, 0), v(1, 2), [v(0, 1), v(0, 1), v(1, 0), v(2, -1)], [0, 1, 2], 5),
  level(3, "One correction", "position", "You already have a head start.", v(1, 1), v(2, 0), [v(1, -1), v(2, 0), v(-1, 1), v(0, 2)], [0], 4),
  level(4, "Cancel the extra", "position", "A later card can give length back.", v(0, 0), v(1, 1), [v(2, 2), v(-1, -1), v(3, 0), v(0, -2)], [0, 1], 5),
  level(5, "Build speed", "velocity", "Two equal burns. The second step is longer.", v(0, 0), v(3, 0), [v(1, 0), v(1, 0), v(2, 0), v(0, 1)], [0, 1], 6),
  level(6, "Rise, then run", "velocity", "Velocity stays. It does not reset between cards.", v(0, 0), v(1, 2), [v(0, 1), v(1, 0), v(2, 0), v(0, -1)], [0, 1], 5),
  level(7, "Three burns", "velocity", "Count the steps. Earlier thrust is still in the velocity.", v(0, 0), v(4, 2), [v(1, 0), v(0, 1), v(1, 0), v(0, 2)], [0, 1, 2], 7),
  level(8, "Give speed back", "velocity", "A negative card subtracts from velocity before the step.", v(0, 0), v(5, 2), [v(2, 0), v(0, 1), v(-1, 0), v(0, -2)], [0, 1, 2], 8),
  level(9, "One push", "acceleration", "The card is acceleration for this burn, then it stays in the total.", v(0, 0), v(1, 0), [v(1, 0), v(0, 1), v(-1, 0), v(2, 0)], [0], 4),
  level(10, "Acceleration stacks", "acceleration", "The same burn twice is not the same as two velocity burns.", v(0, 0), v(4, 0), [v(1, 0), v(1, 0), v(0, 2), v(-1, 0)], [0, 1], 7),
  level(11, "Turn the push", "acceleration", "Add north, then add east. Both stay in the acceleration.", v(0, 0), v(1, 3), [v(0, 1), v(1, 0), v(0, -1), v(2, 0)], [0, 1], 6),
  level(12, "Mass 2", "momentum", "Impulse (2, 0) on mass 2 changes velocity by (1, 0).", v(0, 0), v(3, 0), [v(2, 0), v(2, 0), v(0, 2), v(4, 0)], [0, 1], 6, v(0, 0), 2),
  level(13, "Mass 3", "momentum", "Δv = impulse ÷ 3. The step still uses the new velocity.", v(0, 0), v(2, 1), [v(3, 0), v(0, 3), v(3, 3), v(0, -3)], [0, 1], 6, v(0, 0), 3),
  level(14, "Catch the buoy", "intercept", "It drifts east after every miss. Meet it on a burn.", v(0, 0), v(2, 0), [v(1, 0), v(1, 0), v(0, 1), v(-1, 0)], [0, 1], 6, v(1, 0)),
  level(15, "Climbing buoy", "intercept", "The buoy steps north only when you are not on it.", v(0, 0), v(0, 2), [v(0, 1), v(0, 1), v(1, 0), v(0, -1)], [0, 1], 6, v(0, 1)),
  level(16, "Crossing", "intercept", "East, then north. The buoy has moved by the time you arrive.", v(0, 0), v(1, 1), [v(1, 0), v(0, 1), v(1, 0), v(0, -1)], [0, 1], 6, v(1, 0)),
];

export function beginDrift(level: DriftLevel): DriftState {
  return {
    pos: { ...level.start },
    vel: v(0, 0),
    acc: v(0, 0),
    target: { ...level.target0 },
    used: level.cards.map(() => false),
    trail: [{ ...level.start }],
    applied: v(0, 0),
    resultant: v(0, 0),
    turn: 0,
    met: sameV(level.start, level.target0),
  };
}

function integrate(level: DriftLevel, state: DriftState, card: V): { pos: V; vel: V; acc: V } | null {
  if (level.kind === "position") {
    return { pos: addV(state.pos, card), vel: { ...card }, acc: v(0, 0) };
  }
  if (level.kind === "velocity" || level.kind === "intercept") {
    const vel = addV(state.vel, card);
    return { pos: addV(state.pos, vel), vel, acc: { ...state.acc } };
  }
  if (level.kind === "acceleration") {
    const acc = addV(state.acc, card);
    const vel = addV(state.vel, acc);
    return { pos: addV(state.pos, vel), vel, acc };
  }
  if (card.x % level.mass !== 0 || card.y % level.mass !== 0) return null;
  const dv = v(card.x / level.mass, card.y / level.mass);
  const vel = addV(state.vel, dv);
  return { pos: addV(state.pos, vel), vel, acc: dv };
}

export function applyDrift(level: DriftLevel, state: DriftState, index: number): DriftState | null {
  if (state.met) return null;
  if (index < 0 || index >= level.cards.length || state.used[index]) return null;
  const card = level.cards[index];
  const next = integrate(level, state, card);
  if (!next) return null;
  const met = sameV(next.pos, state.target);
  const target = met || level.kind !== "intercept" ? state.target : addV(state.target, level.targetStep);
  const used = state.used.slice();
  used[index] = true;
  return {
    pos: next.pos,
    vel: next.vel,
    acc: next.acc,
    target,
    used,
    trail: [...state.trail, next.pos],
    applied: { ...card },
    resultant: subV(next.pos, level.start),
    turn: state.turn + 1,
    met,
  };
}

export function replayDrift(level: DriftLevel): DriftState | null {
  let state = beginDrift(level);
  for (const index of level.solution) {
    const next = applyDrift(level, state, index);
    if (!next) return null;
    state = next;
  }
  return state;
}

export function auditDrift(): string[] {
  const errors: string[] = [];
  if (DRIFT_LEVELS.length !== 16) errors.push("drift count");
  const kinds = new Set(DRIFT_LEVELS.map((item) => item.kind));
  for (const kind of ["position", "velocity", "acceleration", "momentum", "intercept"] as const) {
    if (!kinds.has(kind)) errors.push(`missing ${kind}`);
  }
  DRIFT_LEVELS.forEach((item, index) => {
    if (item.id !== index + 1) errors.push(`id ${item.id}`);
    if (item.cards.length < 2) errors.push(`cards ${item.id}`);
    if (item.solution.length < 1) errors.push(`solution ${item.id}`);
    const end = replayDrift(item);
    if (!end?.met) errors.push(`unsolved ${item.id}`);
    if (item.kind === "momentum" && item.mass < 2) errors.push(`mass ${item.id}`);
    if (item.kind === "intercept" && item.targetStep.x === 0 && item.targetStep.y === 0) errors.push(`step ${item.id}`);
    if (item.kind !== "intercept" && (item.targetStep.x !== 0 || item.targetStep.y !== 0)) errors.push(`static ${item.id}`);
  });
  const velocity = replayDrift(DRIFT_LEVELS[4]);
  const accel = replayDrift(DRIFT_LEVELS[9]);
  if (!velocity || !accel || sameV(velocity.pos, accel.pos)) errors.push("accel differs from velocity");
  return errors;
}
