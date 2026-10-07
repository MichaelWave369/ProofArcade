export type Frac = { n: number; d: number };

export type ForgeGoal = { kind: "sum"; target: Frac } | { kind: "pieces"; pieces: Frac[] };

export type ForgeAction =
  | { t: "place"; index: number }
  | { t: "halve"; where: "tray" | "board"; index: number }
  | { t: "simplify"; where: "tray" | "board"; index: number }
  | { t: "join"; indices: number[] };

export type ForgeLevel = {
  id: number;
  title: string;
  blurb: string;
  tray: Frac[];
  placed: Frac[];
  goal: ForgeGoal;
  script: ForgeAction[];
};

export type ForgeState = { tray: Frac[]; board: Frac[] };

export function frac(n: number, d: number): Frac {
  return { n, d };
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const next = x % y;
    x = y;
    y = next;
  }
  return x || 1;
}

export function simplifyFrac(piece: Frac): Frac {
  const g = gcd(piece.n, piece.d);
  return { n: piece.n / g, d: piece.d / g };
}

export function sameFrac(a: Frac, b: Frac) {
  return a.n * b.d === b.n * a.d;
}

export function canSimplifyFrac(piece: Frac) {
  return gcd(piece.n, piece.d) > 1;
}

function lcm(a: number, b: number) {
  return Math.abs(a * b) / gcd(a, b);
}

export function sumFracs(pieces: Frac[]): Frac {
  if (pieces.length === 0) return { n: 0, d: 1 };
  const d = pieces.reduce((acc, piece) => lcm(acc, piece.d), 1);
  const n = pieces.reduce((acc, piece) => acc + piece.n * (d / piece.d), 0);
  return simplifyFrac({ n, d });
}

export function formatFrac(piece: Frac) {
  return `${piece.n}/${piece.d}`;
}

export function formatGoal(goal: ForgeGoal) {
  if (goal.kind === "sum") return `Build ${formatFrac(goal.target)}`;
  return `Make ${goal.pieces.map(formatFrac).join(" + ")}`;
}

function clone(piece: Frac): Frac {
  return { n: piece.n, d: piece.d };
}

export function beginForge(level: ForgeLevel): ForgeState {
  return { tray: level.tray.map(clone), board: level.placed.map(clone) };
}

function halves(piece: Frac): [Frac, Frac] {
  return [
    { n: piece.n, d: piece.d * 2 },
    { n: piece.n, d: piece.d * 2 },
  ];
}

function replaceAt(list: Frac[], index: number, next: Frac[]): Frac[] | null {
  if (index < 0 || index >= list.length) return null;
  return [...list.slice(0, index), ...next, ...list.slice(index + 1)];
}

export function applyForge(state: ForgeState, action: ForgeAction): ForgeState | null {
  if (action.t === "place") {
    const piece = state.tray[action.index];
    if (!piece) return null;
    return {
      tray: state.tray.filter((_, index) => index !== action.index),
      board: [...state.board, clone(piece)],
    };
  }
  if (action.t === "join") {
    const picked = action.indices.filter((index) => index >= 0 && index < state.board.length);
    if (new Set(picked).size < 2) return null;
    const chosen = picked.map((index) => state.board[index]);
    const rest = state.board.filter((_, index) => !picked.includes(index));
    return { tray: state.tray, board: [...rest, sumFracs(chosen)] };
  }
  const pile = action.where === "board" ? state.board : state.tray;
  if (action.t === "halve") {
    const piece = pile[action.index];
    if (!piece) return null;
    const next = replaceAt(pile, action.index, halves(piece));
    if (!next) return null;
    return action.where === "board" ? { tray: state.tray, board: next } : { tray: next, board: state.board };
  }
  if (action.t === "simplify") {
    const piece = pile[action.index];
    if (!piece || !canSimplifyFrac(piece)) return null;
    const next = replaceAt(pile, action.index, [simplifyFrac(piece)]);
    if (!next) return null;
    return action.where === "board" ? { tray: state.tray, board: next } : { tray: next, board: state.board };
  }
  return null;
}

export function forgeComplete(level: ForgeLevel, state: ForgeState) {
  if (level.goal.kind === "sum") {
    if (state.board.length === 0) return false;
    return sameFrac(sumFracs(state.board), level.goal.target);
  }
  const have = state.board.map(formatFrac).sort();
  const need = level.goal.pieces.map(formatFrac).sort();
  return have.length === need.length && have.every((key, index) => key === need[index]);
}

export function replayForge(level: ForgeLevel): ForgeState | null {
  let state = beginForge(level);
  for (const action of level.script) {
    const next = applyForge(state, action);
    if (!next) return null;
    state = next;
  }
  return state;
}

function forge(
  id: number,
  title: string,
  blurb: string,
  tray: Frac[],
  goal: ForgeGoal,
  script: ForgeAction[],
  placed: Frac[] = [],
): ForgeLevel {
  return { id, title, blurb, tray, placed, goal, script };
}

export const FORGE_LEVELS: ForgeLevel[] = [
  forge(1, "Two halves", "Place both halves. They fill one whole.", [frac(1, 2), frac(1, 2)], { kind: "sum", target: frac(1, 1) }, [
    { t: "place", index: 0 },
    { t: "place", index: 0 },
  ]),
  forge(
    2,
    "Half and quarters",
    "1/2 + 1/4 + 1/4 fills the whole. Leave the extra eighth.",
    [frac(1, 2), frac(1, 4), frac(1, 4), frac(1, 8)],
    { kind: "sum", target: frac(1, 1) },
    [
      { t: "place", index: 0 },
      { t: "place", index: 0 },
      { t: "place", index: 0 },
    ],
  ),
  forge(3, "Join the quarters", "Two quarters on the bench can snap into one half.", [frac(1, 4), frac(1, 4)], { kind: "pieces", pieces: [frac(1, 2)] }, [
    { t: "place", index: 0 },
    { t: "place", index: 0 },
    { t: "join", indices: [0, 1] },
  ]),
  forge(4, "2/4 is 1/2", "Same amount, coarser cut. Simplify the piece.", [], { kind: "pieces", pieces: [frac(1, 2)] }, [{ t: "simplify", where: "board", index: 0 }], [frac(2, 4)]),
  forge(5, "3/6 is 1/2", "Three sixths are one half. Reduce the name.", [], { kind: "pieces", pieces: [frac(1, 2)] }, [{ t: "simplify", where: "board", index: 0 }], [frac(3, 6)]),
  forge(6, "Three quarters", "A half plus a quarter. Leave the spare quarter.", [frac(1, 2), frac(1, 4), frac(1, 4)], { kind: "sum", target: frac(3, 4) }, [
    { t: "place", index: 0 },
    { t: "place", index: 0 },
  ]),
  forge(7, "Three thirds", "Each third is a piece. Together they are 1.", [frac(1, 3), frac(1, 3), frac(1, 3)], { kind: "sum", target: frac(1, 1) }, [
    { t: "place", index: 0 },
    { t: "place", index: 0 },
    { t: "place", index: 0 },
  ]),
  forge(
    8,
    "Four eighths",
    "Join them. Four eighths lock as one half.",
    [frac(1, 8), frac(1, 8), frac(1, 8), frac(1, 8)],
    { kind: "pieces", pieces: [frac(1, 2)] },
    [
      { t: "place", index: 0 },
      { t: "place", index: 0 },
      { t: "place", index: 0 },
      { t: "place", index: 0 },
      { t: "join", indices: [0, 1, 2, 3] },
    ],
  ),
  forge(9, "2/6 is 1/3", "Simplify. The bar does not change length.", [], { kind: "pieces", pieces: [frac(1, 3)] }, [{ t: "simplify", where: "board", index: 0 }], [frac(2, 6)]),
  forge(10, "4/6 is 2/3", "Reduce once. 4/6 and 2/3 cover the same gold.", [], { kind: "pieces", pieces: [frac(2, 3)] }, [{ t: "simplify", where: "board", index: 0 }], [frac(4, 6)]),
  forge(11, "Half, third, sixth", "1/2 + 1/3 + 1/6 = 1. Different cuts, one whole.", [frac(1, 2), frac(1, 3), frac(1, 6)], { kind: "sum", target: frac(1, 1) }, [
    { t: "place", index: 0 },
    { t: "place", index: 0 },
    { t: "place", index: 0 },
  ]),
  forge(12, "Split the whole", "Halve the bar into two 1/2 pieces.", [frac(1, 1)], { kind: "pieces", pieces: [frac(1, 2), frac(1, 2)] }, [
    { t: "place", index: 0 },
    { t: "halve", where: "board", index: 0 },
  ]),
  forge(13, "Into quarters", "Halve, then halve each half.", [frac(1, 1)], { kind: "pieces", pieces: [frac(1, 4), frac(1, 4), frac(1, 4), frac(1, 4)] }, [
    { t: "place", index: 0 },
    { t: "halve", where: "board", index: 0 },
    { t: "halve", where: "board", index: 1 },
    { t: "halve", where: "board", index: 0 },
  ]),
  forge(14, "Three sixths", "Place three 1/6 pieces. Their sum is 1/2.", [frac(1, 6), frac(1, 6), frac(1, 6), frac(1, 3)], { kind: "sum", target: frac(1, 2) }, [
    { t: "place", index: 0 },
    { t: "place", index: 0 },
    { t: "place", index: 0 },
  ]),
  forge(15, "6/8 is 3/4", "Simplify the eighths into quarters.", [], { kind: "pieces", pieces: [frac(3, 4)] }, [{ t: "simplify", where: "board", index: 0 }], [frac(6, 8)]),
  forge(16, "Last whole", "3/4 + 1/4 locks the bar.", [frac(3, 4), frac(1, 4)], { kind: "sum", target: frac(1, 1) }, [
    { t: "place", index: 0 },
    { t: "place", index: 0 },
  ]),
];

export function auditForge(): string[] {
  const errors: string[] = [];
  if (FORGE_LEVELS.length !== 16) errors.push("forge count");
  for (const level of FORGE_LEVELS) {
    const end = replayForge(level);
    if (!end || !forgeComplete(level, end)) errors.push(`unsolved ${level.id}`);
    if (level.id === 2 && end && sameFrac(sumFracs(end.board), frac(1, 1)) && end.tray.length !== 1) errors.push("spare eighth");
    if (level.id === 4 && end && formatFrac(end.board[0]) !== "1/2") errors.push("reduce 2/4");
    if (level.id === 5 && end && formatFrac(end.board[0]) !== "1/2") errors.push("reduce 3/6");
  }
  return errors;
}
