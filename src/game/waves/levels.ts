import { curveY } from "../render/field.ts";

export type WaveScene = {
  freq: number;
  amp: number;
  phase: number;
};

export type WavePrompt = {
  kicker: string;
  ask: string;
  scene: WaveScene;
  choices: [string, string, string, string];
  answer: string;
  blurb: string;
};

export type WaveLevel = {
  id: number;
  title: string;
  prompts: WavePrompt[];
};

const PATTERN = [1, 2, 3, 2, 4, 1, 5, 3, 4, 2, 5, 1];
const FREQS = Array.from({ length: 48 }, (_, index) => PATTERN[index % PATTERN.length]);

const TITLES = [
  "Slow crests",
  "A little faster",
  "Three across",
  "Four",
  "Five",
  "Back to one",
  "Mixed",
  "Faster again",
  "Count again",
  "The long waves",
  "Short waves",
  "Pairs",
  "Odd counts",
  "Even counts",
  "Almost full",
  "The bench",
];

function choicesFor(freq: number): [string, string, string, string] {
  const picks = [freq];
  for (const delta of [1, -1, 2, -2, 3, -3]) {
    const next = freq + delta;
    if (next >= 1 && next <= 8 && !picks.includes(next)) picks.push(next);
    if (picks.length === 4) break;
  }
  return [String(picks[0]), String(picks[1]), String(picks[2]), String(picks[3])];
}

function promptFor(freq: number): WavePrompt {
  const scene = { freq, amp: 0.48, phase: 0 };
  return {
    kicker: "Frequency",
    ask: "How many full waves fit across the bench?",
    scene,
    choices: choicesFor(freq),
    answer: String(freq),
    blurb: freq === 1 ? "1 full wave fits across the bench." : `${freq} full waves fit across the bench.`,
  };
}

/** The old frequency cabinet. Kept as the question fallback for Wave Lab. */
export const WAVE_LEVELS: WaveLevel[] = TITLES.map((title, index) => ({
  id: index + 1,
  title,
  prompts: [0, 1, 2].map((slot) => promptFor(FREQS[index * 3 + slot])),
}));

export function auditWave(): string[] {
  const errors: string[] = [];
  if (WAVE_LEVELS.length !== 16) errors.push(`levels ${WAVE_LEVELS.length}`);
  WAVE_LEVELS.forEach((level, levelIndex) => {
    if (level.prompts.length !== 3) errors.push(`level ${level.id} prompts`);
    level.prompts.forEach((prompt, promptIndex) => {
      const where = `${levelIndex + 1}.${promptIndex + 1}`;
      const freq = prompt.scene.freq;
      if (!Number.isInteger(freq) || freq < 1 || freq > 6) errors.push(`${where} freq`);
      if (prompt.answer !== String(freq)) errors.push(`${where} answer`);
      if (new Set(prompt.choices).size !== 4) errors.push(`${where} choices`);
      if (prompt.choices.filter((choice) => choice === prompt.answer).length !== 1) errors.push(`${where} once`);
      const crest = 0.25 / freq;
      const y = curveY(crest, [{ amp: prompt.scene.amp, freq, phase: prompt.scene.phase }], 0);
      const expected = 0.5 + prompt.scene.amp * 0.42;
      if (Math.abs(y - expected) > 1e-9) errors.push(`${where} crest`);
      if (!prompt.blurb.includes(String(freq))) errors.push(`${where} blurb`);
    });
  });
  return errors;
}
