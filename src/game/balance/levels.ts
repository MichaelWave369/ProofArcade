export type Eq =
  | { form: "add"; a: number; x: number }
  | { form: "sub"; a: number; x: number }
  | { form: "mul"; a: number; x: number }
  | { form: "two"; a: number; b: number; x: number };

export type BalanceScene = {
  eq: Eq;
  left: string;
  right: number;
};

export type BalancePrompt = {
  kicker: string;
  ask: string;
  scene: BalanceScene;
  choices: [string, string, string, string];
  answer: string;
  blurb: string;
};

export type BalanceLevel = {
  id: number;
  title: string;
  prompts: BalancePrompt[];
};

const TITLES = [
  "Add to x",
  "Still adding",
  "Find x",
  "One step",
  "Subtract",
  "Missing start",
  "Add it back",
  "Undo the minus",
  "Times a number",
  "Divide back",
  "Shared factor",
  "Even split",
  "Two moves",
  "Then divide",
  "Both pans",
  "Last balance",
];

export function holds(eq: Eq, n: number): boolean {
  if (eq.form === "add") return n + eq.a === eq.x + eq.a;
  if (eq.form === "sub") return n - eq.a === eq.x - eq.a;
  if (eq.form === "mul") return eq.a * n === eq.a * eq.x;
  return eq.a * n + eq.b === eq.a * eq.x + eq.b;
}

export function equationSides(eq: Eq): { left: string; right: number } {
  if (eq.form === "add") return { left: `x + ${eq.a}`, right: eq.x + eq.a };
  if (eq.form === "sub") return { left: `x − ${eq.a}`, right: eq.x - eq.a };
  if (eq.form === "mul") return { left: `${eq.a}x`, right: eq.a * eq.x };
  const left = eq.b < 0 ? `${eq.a}x − ${-eq.b}` : eq.b > 0 ? `${eq.a}x + ${eq.b}` : `${eq.a}x`;
  return { left, right: eq.a * eq.x + eq.b };
}

function blurbFor(eq: Eq, left: string, right: number): string {
  if (eq.form === "add") return `${left} = ${right}. Subtract ${eq.a}. x = ${eq.x}.`;
  if (eq.form === "sub") return `${left} = ${right}. Add ${eq.a}. x = ${eq.x}.`;
  if (eq.form === "mul") return `${left} = ${right}. Divide by ${eq.a}. x = ${eq.x}.`;
  if (eq.b > 0) return `${left} = ${right}. Subtract ${eq.b}, then divide by ${eq.a}. x = ${eq.x}.`;
  if (eq.b < 0) return `${left} = ${right}. Add ${-eq.b}, then divide by ${eq.a}. x = ${eq.x}.`;
  return `${left} = ${right}. Divide by ${eq.a}. x = ${eq.x}.`;
}

function spec(id: number, slot: number): Eq {
  if (id <= 4) return { form: "add", a: 1 + id + slot, x: 2 + id + slot };
  if (id <= 8) {
    const a = 2 + slot;
    return { form: "sub", a, x: a + 3 + id };
  }
  if (id <= 12) {
    const a = 2 + ((id + slot) % 4);
    return { form: "mul", a, x: 2 + slot + (id % 3) };
  }
  const a = 2 + (slot % 3);
  const b = slot === 1 ? -1 : 1 + (id % 3);
  return { form: "two", a, b, x: 2 + slot };
}

function decoys(eq: Eq, right: number): number[] {
  const pool = [eq.x + 1, eq.x - 1, right, right + 1, right - 1];
  if (eq.form === "add") pool.push(right + eq.a, eq.a, eq.x + eq.a);
  if (eq.form === "sub") pool.push(right - eq.a, eq.a, eq.x + eq.a);
  if (eq.form === "mul") pool.push(eq.a, right - eq.a, eq.x * eq.a, right + eq.a);
  if (eq.form === "two") pool.push(eq.a * eq.x, eq.x + eq.b, eq.a, right - eq.b);
  const out: number[] = [];
  for (const n of pool) {
    if (!Number.isInteger(n) || n === eq.x || holds(eq, n)) continue;
    if (n < -9 || n > 80) continue;
    if (out.includes(n)) continue;
    out.push(n);
    if (out.length === 3) break;
  }
  return out;
}

function promptFor(id: number, slot: number): BalancePrompt {
  const eq = spec(id, slot);
  const { left, right } = equationSides(eq);
  const misses = decoys(eq, right);
  if (misses.length < 3) throw new Error(`balance decoys ${id} ${slot} ${left}`);
  const answer = String(eq.x);
  return {
    kicker: eq.form === "two" ? "Two steps" : "One step",
    ask: "The pans balance. What is x?",
    scene: { eq, left, right },
    choices: [answer, ...misses.map(String)] as [string, string, string, string],
    answer,
    blurb: blurbFor(eq, left, right),
  };
}

export const BALANCE_LEVELS: BalanceLevel[] = TITLES.map((title, index) => ({
  id: index + 1,
  title,
  prompts: [0, 1, 2].map((slot) => promptFor(index + 1, slot)),
}));

export function auditBalance(): string[] {
  const errors: string[] = [];
  if (BALANCE_LEVELS.length !== 16) errors.push(`levels ${BALANCE_LEVELS.length}`);
  for (const level of BALANCE_LEVELS) {
    if (level.prompts.length !== 3) errors.push(`prompts ${level.id}`);
    for (const prompt of level.prompts) {
      const { eq, left, right } = prompt.scene;
      const sides = equationSides(eq);
      if (sides.left !== left || sides.right !== right) errors.push(`sides ${level.id}`);
      if (eq.form === "sub" && right <= 0) errors.push(`sub right ${level.id}`);
      if ((eq.form === "mul" || eq.form === "two") && eq.a === 0) errors.push(`zero ${level.id}`);
      if (!holds(eq, eq.x)) errors.push(`holds ${level.id}`);
      if (prompt.answer !== String(eq.x)) errors.push(`answer ${level.id}`);
      if (!prompt.choices.includes(prompt.answer)) errors.push(`missing ${level.id}`);
      if (new Set(prompt.choices).size !== 4) errors.push(`dup ${level.id} ${prompt.choices.join(",")}`);
      for (const choice of prompt.choices) {
        const n = Number(choice);
        const ok = holds(eq, n);
        if (choice === prompt.answer && !ok) errors.push(`true miss ${level.id}`);
        if (choice !== prompt.answer && ok) errors.push(`false hit ${level.id} ${choice}`);
      }
    }
  }
  return errors;
}
