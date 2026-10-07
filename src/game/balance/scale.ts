import { BALANCE_LEVELS, type Eq } from "./levels.ts";

export type Pan = { a: number; b: number };

export type ScaleState = { left: Pan; right: Pan };

export type ScaleOp = { kind: "add"; n: number } | { kind: "div"; n: number } | { kind: "mul"; n: number };

export type BalancePlay = {
  id: number;
  title: string;
  prompt: string;
  x: number;
  start: ScaleState;
  ops: ScaleOp[];
  solution: ScaleOp[];
};

export function valueAt(pan: Pan, x: number) {
  return pan.a * x + pan.b;
}

export function balanced(state: ScaleState, x: number) {
  return valueAt(state.left, x) === valueAt(state.right, x);
}

export function formatPan(pan: Pan): string {
  const { a, b } = pan;
  if (a === 0 && b === 0) return "0";
  const bits: string[] = [];
  if (a !== 0) {
    if (a === 1) bits.push("x");
    else if (a === -1) bits.push("-x");
    else bits.push(`${a}x`);
  }
  if (b !== 0) {
    if (bits.length === 0) bits.push(String(b));
    else if (b > 0) bits.push(`+ ${b}`);
    else bits.push(`- ${-b}`);
  }
  return bits.join(" ");
}

export function formatOp(op: ScaleOp): string {
  if (op.kind === "add") {
    if (op.n < 0) return `Subtract ${-op.n} from both pans`;
    return `Add ${op.n} to both pans`;
  }
  if (op.kind === "div") return `Divide both pans by ${op.n}`;
  return `Multiply both pans by ${op.n}`;
}

export function applyScale(state: ScaleState, op: ScaleOp): ScaleState | null {
  if (op.kind === "add") {
    return {
      left: { a: state.left.a, b: state.left.b + op.n },
      right: { a: state.right.a, b: state.right.b + op.n },
    };
  }
  if (op.n === 0) return null;
  if (op.kind === "mul") {
    return {
      left: { a: state.left.a * op.n, b: state.left.b * op.n },
      right: { a: state.right.a * op.n, b: state.right.b * op.n },
    };
  }
  const fields = [state.left.a, state.left.b, state.right.a, state.right.b];
  if (fields.some((value) => value % op.n !== 0)) return null;
  return {
    left: { a: state.left.a / op.n, b: state.left.b / op.n },
    right: { a: state.right.a / op.n, b: state.right.b / op.n },
  };
}

export function scaleSolved(state: ScaleState, x: number) {
  return state.left.a === 1 && state.left.b === 0 && state.right.a === 0 && state.right.b === x;
}

function pansFor(eq: Eq): ScaleState {
  if (eq.form === "add") return { left: { a: 1, b: eq.a }, right: { a: 0, b: eq.x + eq.a } };
  if (eq.form === "sub") return { left: { a: 1, b: -eq.a }, right: { a: 0, b: eq.x - eq.a } };
  if (eq.form === "mul") return { left: { a: eq.a, b: 0 }, right: { a: 0, b: eq.a * eq.x } };
  return { left: { a: eq.a, b: eq.b }, right: { a: 0, b: eq.a * eq.x + eq.b } };
}

function solutionFor(eq: Eq): ScaleOp[] {
  if (eq.form === "add") return [{ kind: "add", n: -eq.a }];
  if (eq.form === "sub") return [{ kind: "add", n: eq.a }];
  if (eq.form === "mul") return [{ kind: "div", n: eq.a }];
  const ops: ScaleOp[] = [];
  if (eq.b !== 0) ops.push({ kind: "add", n: -eq.b });
  ops.push({ kind: "div", n: eq.a });
  return ops;
}

function sameOp(a: ScaleOp, b: ScaleOp) {
  return a.kind === b.kind && a.n === b.n;
}

function withDecoys(solution: ScaleOp[]): ScaleOp[] {
  const ops = solution.slice();
  const extras: ScaleOp[] = [
    { kind: "add", n: 1 },
    { kind: "mul", n: 2 },
  ];
  for (const extra of extras) {
    if (!ops.some((op) => sameOp(op, extra))) ops.push(extra);
  }
  return ops;
}

export const BALANCE_PLAYS: BalancePlay[] = BALANCE_LEVELS.map((level) => {
  const eq = level.prompts[0].scene.eq;
  const solution = solutionFor(eq);
  return {
    id: level.id,
    title: level.title,
    prompt: level.prompts[0].scene.left,
    x: eq.x,
    start: pansFor(eq),
    ops: withDecoys(solution),
    solution,
  };
});

export function replayScale(play: BalancePlay): ScaleState | null {
  let state = play.start;
  for (const op of play.solution) {
    const next = applyScale(state, op);
    if (!next) return null;
    state = next;
  }
  return state;
}

export function auditScale(): string[] {
  const errors: string[] = [];
  if (BALANCE_PLAYS.length !== 16) errors.push("play count");
  for (const play of BALANCE_PLAYS) {
    if (!balanced(play.start, play.x)) errors.push(`open ${play.id}`);
    let state = play.start;
    for (const op of play.solution) {
      const next = applyScale(state, op);
      if (!next || !balanced(next, play.x)) {
        errors.push(`step ${play.id}`);
        state = next ?? state;
        break;
      }
      state = next;
    }
    if (!scaleSolved(state, play.x)) errors.push(`solved ${play.id}`);
    const titled = `${formatPan(play.start.left)} = ${formatPan(play.start.right)}`;
    if (!titled.includes("x") && play.start.left.a === 0) errors.push(`shown ${play.id}`);
  }
  return errors;
}
