export type Rule =
  | { op: "add"; k: number }
  | { op: "sub"; k: number }
  | { op: "mul"; k: number }
  | { op: "muladd"; k: number; b: number };

export type MachineScene = {
  mode: "out" | "rule";
  input: number;
  rule: Rule;
  rules: Rule[];
};

export type MachinePrompt = {
  kicker: string;
  ask: string;
  scene: MachineScene;
  choices: [string, string, string, string];
  answer: string;
  blurb: string;
};

export type MachineLevel = {
  id: number;
  title: string;
  prompts: MachinePrompt[];
};

const TITLES = [
  "Add a little",
  "Add more",
  "Bigger steps",
  "Still adding",
  "Take away",
  "Subtract",
  "Larger drop",
  "Quiet minus",
  "Times",
  "Times three",
  "Then shift",
  "Scale and slide",
  "Name the rule",
  "Which machine",
  "Hidden rule",
  "Last rule",
];

const RULE_JOBS: { input: number; rules: [Rule, Rule, Rule, Rule] }[] = [
  { input: 3, rules: [{ op: "add", k: 4 }, { op: "mul", k: 2 }, { op: "sub", k: 1 }, { op: "mul", k: 3 }] },
  { input: 4, rules: [{ op: "mul", k: 2 }, { op: "add", k: 2 }, { op: "add", k: 3 }, { op: "mul", k: 3 }] },
  { input: 6, rules: [{ op: "sub", k: 2 }, { op: "add", k: 2 }, { op: "mul", k: 2 }, { op: "sub", k: 1 }] },
  { input: 5, rules: [{ op: "muladd", k: 2, b: 1 }, { op: "mul", k: 2 }, { op: "add", k: 1 }, { op: "mul", k: 3 }] },
  { input: 2, rules: [{ op: "muladd", k: 3, b: 1 }, { op: "mul", k: 3 }, { op: "mul", k: 4 }, { op: "muladd", k: 2, b: 1 }] },
  { input: 7, rules: [{ op: "add", k: 3 }, { op: "mul", k: 2 }, { op: "sub", k: 3 }, { op: "add", k: 2 }] },
  { input: 4, rules: [{ op: "muladd", k: 3, b: -2 }, { op: "mul", k: 2 }, { op: "mul", k: 3 }, { op: "add", k: 5 }] },
  { input: 8, rules: [{ op: "muladd", k: 2, b: -6 }, { op: "mul", k: 2 }, { op: "sub", k: 2 }, { op: "add", k: 1 }] },
  { input: 9, rules: [{ op: "sub", k: 4 }, { op: "sub", k: 3 }, { op: "sub", k: 5 }, { op: "add", k: 4 }] },
  { input: 3, rules: [{ op: "muladd", k: 4, b: 1 }, { op: "mul", k: 4 }, { op: "mul", k: 5 }, { op: "add", k: 8 }] },
  { input: 6, rules: [{ op: "muladd", k: 2, b: -3 }, { op: "mul", k: 2 }, { op: "sub", k: 3 }, { op: "mul", k: 3 }] },
  { input: 10, rules: [{ op: "add", k: 6 }, { op: "mul", k: 2 }, { op: "sub", k: 4 }, { op: "add", k: 4 }] },
];

export function applyRule(rule: Rule, n: number): number {
  if (rule.op === "add") return n + rule.k;
  if (rule.op === "sub") return n - rule.k;
  if (rule.op === "mul") return n * rule.k;
  return n * rule.k + rule.b;
}

export function formatRule(rule: Rule): string {
  if (rule.op === "add") return `+ ${rule.k}`;
  if (rule.op === "sub") return `− ${rule.k}`;
  if (rule.op === "mul") return `× ${rule.k}`;
  const sign = rule.b < 0 ? `− ${-rule.b}` : `+ ${rule.b}`;
  return `× ${rule.k} ${sign}`;
}

function outJob(id: number, slot: number): { rule: Rule; input: number } {
  if (id <= 4) return { rule: { op: "add", k: id + slot }, input: 2 + id + slot };
  if (id <= 8) {
    const k = 1 + slot + (id - 5);
    return { rule: { op: "sub", k }, input: k + 4 + slot };
  }
  if (id <= 10) {
    const k = id === 9 ? 2 + slot : 3;
    return { rule: { op: "mul", k }, input: 2 + slot + (id === 10 ? 1 : 0) };
  }
  const k = id === 11 ? 2 : 3;
  const b = slot - 1;
  const input = 2 + slot;
  if (b === 0) return { rule: { op: "mul", k }, input };
  return { rule: { op: "muladd", k, b }, input };
}

function takeFour(answer: string, extra: string[]): [string, string, string, string] {
  const choices: string[] = [];
  for (const item of [answer, ...extra]) {
    if (!choices.includes(item)) choices.push(item);
    if (choices.length === 4) return [choices[0], choices[1], choices[2], choices[3]];
  }
  throw new Error(`machine choices for ${answer}`);
}

function outChoices(answer: number, input: number, rule: Rule): [string, string, string, string] {
  const shift = rule.op === "muladd" ? rule.b : rule.op === "add" || rule.op === "sub" || rule.op === "mul" ? rule.k : 0;
  const extra = [answer + 1, answer - 1, answer + 2, input, input + shift, answer + shift, input * 2, 0].map(String);
  return takeFour(String(answer), extra);
}

function outBlurb(rule: Rule, input: number, output: number): string {
  return `${input} ${formatRule(rule)} comes out ${output}.`;
}

function makeOut(id: number, slot: number): MachinePrompt {
  const job = outJob(id, slot);
  const output = applyRule(job.rule, job.input);
  const answer = String(output);
  return {
    kicker: "In → out",
    ask: "What number comes out?",
    scene: { mode: "out", input: job.input, rule: job.rule, rules: [job.rule] },
    choices: outChoices(output, job.input, job.rule),
    answer,
    blurb: outBlurb(job.rule, job.input, output),
  };
}

function makeRule(job: { input: number; rules: [Rule, Rule, Rule, Rule] }): MachinePrompt {
  const rule = job.rules[0];
  const output = applyRule(rule, job.input);
  const answer = formatRule(rule);
  return {
    kicker: "Hidden rule",
    ask: "Which rule did the machine use?",
    scene: { mode: "rule", input: job.input, rule, rules: job.rules },
    choices: job.rules.map(formatRule) as [string, string, string, string],
    answer,
    blurb: `${job.input} goes in and ${output} comes out. The rule is ${answer}.`,
  };
}

export const MACHINE_LEVELS: MachineLevel[] = TITLES.map((title, index) => {
  const id = index + 1;
  const prompts =
    id <= 12
      ? [0, 1, 2].map((slot) => makeOut(id, slot))
      : [0, 1, 2].map((slot) => makeRule(RULE_JOBS[(id - 13) * 3 + slot]));
  return { id, title, prompts };
});

export function auditMachine(): string[] {
  const errors: string[] = [];
  if (MACHINE_LEVELS.length !== 16) errors.push(`levels ${MACHINE_LEVELS.length}`);
  for (const level of MACHINE_LEVELS) {
    if (level.prompts.length !== 3) errors.push(`prompts ${level.id}`);
    for (const prompt of level.prompts) {
      const { scene } = prompt;
      const output = applyRule(scene.rule, scene.input);
      if (new Set(prompt.choices).size !== 4) errors.push(`dup ${level.id} ${prompt.choices.join("|")}`);
      if (!prompt.choices.includes(prompt.answer)) errors.push(`missing ${level.id}`);
      if (scene.mode === "out") {
        if (prompt.answer !== String(output)) errors.push(`out ${level.id} ${prompt.answer} != ${output}`);
        for (const choice of prompt.choices) {
          if (choice !== prompt.answer && Number(choice) === output) errors.push(`alias ${level.id}`);
        }
      } else {
        if (prompt.answer !== formatRule(scene.rule)) errors.push(`rule label ${level.id}`);
        const hits = scene.rules.filter((rule) => applyRule(rule, scene.input) === output);
        if (hits.length !== 1) errors.push(`rule hits ${level.id} ${hits.length}`);
        if (scene.rules.map(formatRule).join("|") !== prompt.choices.join("|")) errors.push(`rule choices ${level.id}`);
      }
    }
  }
  return errors;
}
