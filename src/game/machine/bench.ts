import {
  MACHINE_LEVELS,
  applyRule,
  formatRule,
  type Rule,
} from "./levels.ts";

export type MachineStage = {
  label: string;
  before: number;
  after: number;
};

export type MachineTrace = {
  input: number;
  output: number;
  stages: MachineStage[];
};

export type MachineBenchPlay = {
  id: number;
  title: string;
  mode: "out" | "rule";
  input: number;
  output: number;
  rule: Rule;
  candidates: Rule[];
};

export function ruleStages(rule: Rule, input: number): MachineStage[] {
  if (rule.op === "add") {
    return [{ label: `+ ${rule.k}`, before: input, after: input + rule.k }];
  }
  if (rule.op === "sub") {
    return [{ label: `− ${rule.k}`, before: input, after: input - rule.k }];
  }
  if (rule.op === "mul") {
    return [{ label: `× ${rule.k}`, before: input, after: input * rule.k }];
  }

  const multiplied = input * rule.k;
  return [
    { label: `× ${rule.k}`, before: input, after: multiplied },
    {
      label: rule.b < 0 ? `− ${-rule.b}` : `+ ${rule.b}`,
      before: multiplied,
      after: multiplied + rule.b,
    },
  ];
}

export function traceRule(rule: Rule, input: number): MachineTrace {
  const stages = ruleStages(rule, input);
  return {
    input,
    output: stages.at(-1)?.after ?? input,
    stages,
  };
}

export function reverseTrace(rule: Rule, output: number): MachineTrace | null {
  if (rule.op === "add") {
    return {
      input: output - rule.k,
      output,
      stages: [{ label: `− ${rule.k}`, before: output, after: output - rule.k }],
    };
  }

  if (rule.op === "sub") {
    return {
      input: output + rule.k,
      output,
      stages: [{ label: `+ ${rule.k}`, before: output, after: output + rule.k }],
    };
  }

  if (rule.op === "mul") {
    if (rule.k === 0 || output % rule.k !== 0) return null;
    return {
      input: output / rule.k,
      output,
      stages: [{ label: `÷ ${rule.k}`, before: output, after: output / rule.k }],
    };
  }

  const shifted = output - rule.b;
  if (rule.k === 0 || shifted % rule.k !== 0) return null;
  const input = shifted / rule.k;
  return {
    input,
    output,
    stages: [
      {
        label: rule.b < 0 ? `+ ${-rule.b}` : `− ${rule.b}`,
        before: output,
        after: shifted,
      },
      { label: `÷ ${rule.k}`, before: shifted, after: input },
    ],
  };
}

export function machineRuleMatches(play: MachineBenchPlay, rule: Rule) {
  return applyRule(rule, play.input) === play.output;
}

export function machineBenchSolved(play: MachineBenchPlay, selectedRule?: Rule | null) {
  if (play.mode === "out") return true;
  return Boolean(selectedRule && machineRuleMatches(play, selectedRule));
}

export const MACHINE_PLAYS: MachineBenchPlay[] = MACHINE_LEVELS.map((level) => {
  const prompt = level.prompts[0];
  const { scene } = prompt;
  const output = applyRule(scene.rule, scene.input);
  return {
    id: level.id,
    title: level.title,
    mode: scene.mode,
    input: scene.input,
    output,
    rule: scene.rule,
    candidates: scene.mode === "rule" ? [...scene.rules] : [scene.rule],
  };
});

export function machineBenchInstruction(play: MachineBenchPlay) {
  if (play.mode === "out") {
    return `Feed ${play.input} through ${formatRule(play.rule)} and watch every stage produce the output.`;
  }
  return `${play.input} goes in and ${play.output} comes out. Drag the one rule that actually maps input to output into the machine.`;
}

export function auditMachineBench(): string[] {
  const errors: string[] = [];
  if (MACHINE_PLAYS.length !== 16) errors.push(`count ${MACHINE_PLAYS.length}`);

  for (const play of MACHINE_PLAYS) {
    const trace = traceRule(play.rule, play.input);
    if (trace.output !== play.output) errors.push(`trace ${play.id}`);
    if (applyRule(play.rule, play.input) !== play.output) errors.push(`apply ${play.id}`);

    const reverse = reverseTrace(play.rule, play.output);
    if (!reverse) {
      errors.push(`reverse ${play.id}`);
    } else if (reverse.input !== play.input) {
      errors.push(`reverse input ${play.id}`);
    }

    if (play.mode === "rule") {
      const matches = play.candidates.filter((rule) => machineRuleMatches(play, rule));
      if (matches.length !== 1) errors.push(`matches ${play.id} ${matches.length}`);
      if (formatRule(matches[0]) !== formatRule(play.rule)) errors.push(`rule ${play.id}`);
    }
  }

  return errors;
}
