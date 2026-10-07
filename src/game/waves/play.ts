import { curveY, waveDisplacement, type Wave } from "../render/field.ts";

export type WaveKind = "match" | "cancel" | "construct" | "standing" | "identify";

export type WavePlay = {
  id: number;
  title: string;
  kind: WaveKind;
  blurb: string;
  /** Waves the bench adds that the player does not edit. */
  fixed: Wave[];
  start: Wave[];
  solution: Wave[];
  /** Which fields of each editable wave the player may move. */
  locks: Array<{ amp?: boolean; freq?: boolean; phase?: boolean; dir?: boolean }>;
};

export function waveLength(freq: number) {
  if (freq === 0) return 0;
  return 1 / freq;
}

export function freqFromLength(length: number) {
  if (length === 0) return 1;
  return 1 / length;
}

export type InterferenceMetrics = {
  sumRms: number;
  componentRms: number;
  ratio: number;
};

export function normalizedWaveTime(time: number) {
  const tau = Math.PI * 2;
  const wrapped = time % tau;
  return wrapped < 0 ? wrapped + tau : wrapped;
}

export function interferenceMetrics(
  waves: readonly Wave[],
  time: number,
  samples = 96,
): InterferenceMetrics {
  const count = Math.max(8, Math.floor(samples));
  let sumSq = 0;
  let componentSq = 0;

  for (let i = 0; i < count; i += 1) {
    const x = count === 1 ? 0 : i / (count - 1);
    const total = waveDisplacement(x, waves, time);
    sumSq += total * total;
    for (const wave of waves) {
      const single = waveDisplacement(x, [wave], time);
      componentSq += single * single;
    }
  }

  const sumRms = Math.sqrt(sumSq / count);
  const componentRms = Math.sqrt(componentSq / count);
  return {
    sumRms,
    componentRms,
    ratio: componentRms === 0 ? 0 : sumRms / componentRms,
  };
}

export function standingNodes(waves: readonly Wave[]): number[] {
  if (waves.length !== 2) return [];
  const [a, b] = waves;
  if (!a || !b) return [];
  if (dirOf(a) === dirOf(b)) return [];
  if (Math.abs(a.amp - b.amp) > 0.04) return [];
  if (Math.abs(a.freq - b.freq) > 0.05) return [];
  if (angDiff(a.phase, b.phase) > 0.3) return [];

  const freq = (a.freq + b.freq) / 2;
  const phase = (a.phase + b.phase) / 2;
  const nodes: number[] = [];
  for (let n = -32; n <= 64; n += 1) {
    const x = (n * Math.PI - phase) / (freq * Math.PI * 2);
    if (x < -1e-9 || x > 1 + 1e-9) continue;
    const clamped = Math.max(0, Math.min(1, x));
    if (!nodes.some((node) => Math.abs(node - clamped) < 1e-6)) nodes.push(clamped);
  }
  return nodes.sort((left, right) => left - right);
}

function w(amp: number, freq: number, phase: number, dir: 1 | -1 = 1): Wave {
  return { amp, freq, phase, dir };
}

export const WAVE_PLAYS: WavePlay[] = [
  play(1, "Match the crest", "match", "Tune A until it sits on the ghost.", [], [w(0.2, 1, 0)], [w(0.4, 2, 0)]),
  play(2, "Three across", "match", "Frequency is how many full waves fit the bench.", [], [w(0.2, 1, 0)], [w(0.35, 3, 1)]),
  play(3, "Shift the phase", "match", "Same shape, slid along the bench.", [], [w(0.5, 1, 0)], [w(0.5, 1, 1.2)]),
  play(4, "Short waves", "match", "A shorter wavelength is a higher frequency. λ × f = 1 on this bench.", [], [w(0.3, 2, 0)], [w(0.3, 4, 0.6)]),
  play(5, "Cancel A", "cancel", "B should undo A. Same size, same frequency, opposite phase.", [w(0.4, 2, 0)], [w(0.1, 1, 0)], [w(0.4, 2, Math.PI)]),
  play(6, "Quiet the third", "cancel", "Opposite phase is half a turn: add π.", [w(0.3, 3, 0.4)], [w(0.3, 2, 0)], [w(0.3, 3, 0.4 + Math.PI)]),
  play(7, "Flat line", "cancel", "The cream sum should sit on the center line.", [w(0.45, 1, 1)], [w(0.2, 2, 0)], [w(0.45, 1, 1 + Math.PI)]),
  play(8, "Build the sum", "construct", "Put A and B on the same frequency and the same phase.", [], [w(0.28, 1, 0), w(0.28, 2, 1.5)], [w(0.28, 2, 0), w(0.28, 2, 0)]),
  play(9, "In step", "construct", "Constructive interference: crests land together, so the sum is taller than either wave.", [], [w(0.3, 3, 0), w(0.3, 3, 2)], [w(0.3, 3, 0.8), w(0.3, 3, 0.8)]),
  play(10, "Same wavelength", "construct", "Wavelength and frequency are one dial on this bench.", [], [w(0.25, 1, 1), w(0.32, 4, 0)], [w(0.25, 2, 0.4), w(0.32, 2, 0.4)]),
  play(11, "Stand still", "standing", "Send B backward. Equal size, equal wavelength, matched phase.", [w(0.3, 2, 0.2, 1)], [w(0.1, 1, 0, 1)], [w(0.3, 2, 0.2, -1)]),
  play(12, "Nodes", "standing", "Opposite travel makes a standing pattern: the envelope stays, the height breathes.", [w(0.34, 3, 0, 1)], [w(0.34, 3, 1, 1)], [w(0.34, 3, 0, -1)]),
  play(13, "Hold the phase", "standing", "If the phases disagree, the pattern slides. Match them.", [w(0.28, 2, 1, 1)], [w(0.28, 1, 0, 1)], [w(0.28, 2, 1, -1)]),
  play(14, "Read two", "identify", "How many full waves is that? Set the frequency. Amplitude and phase are already right.", [], [w(0.4, 1, 0.3)], [w(0.4, 2, 0.3)], [{ freq: false }]),
  play(15, "Read four", "identify", "Count crests, then set frequency. Wavelength will follow.", [], [w(0.32, 1, 0)], [w(0.32, 4, 0)], [{ freq: false }]),
  play(16, "Read five", "identify", "The ghost is the answer. Dial frequency until your curve hides it.", [], [w(0.36, 2, 0.5)], [w(0.36, 5, 0.5)], [{ freq: false }]),
];

function play(
  id: number,
  title: string,
  kind: WaveKind,
  blurb: string,
  fixed: Wave[],
  start: Wave[],
  solution: Wave[],
  locks?: WavePlay["locks"],
): WavePlay {
  return {
    id,
    title,
    kind,
    blurb,
    fixed,
    start,
    solution,
    locks: locks ?? start.map(() => ({})),
  };
}

function dirOf(wave: Wave): 1 | -1 {
  return wave.dir === -1 ? -1 : 1;
}

function angDiff(a: number, b: number) {
  return Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
}

export function maxCurveGap(left: readonly Wave[], right: readonly Wave[], times: number[] = [0, 0.7, 1.4]) {
  let gap = 0;
  for (const time of times) {
    for (let i = 0; i <= 32; i++) {
      const x = i / 32;
      gap = Math.max(gap, Math.abs(curveY(x, left, time) - curveY(x, right, time)));
    }
  }
  return gap;
}

function flatGap(waves: readonly Wave[]) {
  let gap = 0;
  for (const time of [0, 0.6, 1.3]) {
    for (let i = 0; i <= 32; i++) {
      gap = Math.max(gap, Math.abs(curveY(i / 32, waves, time) - 0.5));
    }
  }
  return gap;
}

function standingError(forward: Wave, back: Wave) {
  let gap = 0;
  for (const time of [0.4, 1.1]) {
    for (let i = 0; i <= 24; i++) {
      const x = i / 24;
      const sum =
        forward.amp * Math.sin(forward.freq * x * Math.PI * 2 + forward.phase + time) +
        back.amp * Math.sin(back.freq * x * Math.PI * 2 + back.phase - time);
      const analytic = 2 * forward.amp * Math.sin(forward.freq * x * Math.PI * 2 + forward.phase) * Math.cos(time);
      gap = Math.max(gap, Math.abs(sum - analytic));
    }
  }
  return gap;
}

export type WaveJudgement = { ok: boolean; score: number; detail: string };

export function judgeWave(level: WavePlay, player: readonly Wave[]): WaveJudgement {
  const fail = (detail: string): WaveJudgement => ({ ok: false, score: 0, detail });
  if (player.length !== level.solution.length) return fail("The bench is missing a wave.");
  if (level.kind === "match" || level.kind === "identify") {
    const gap = maxCurveGap(player, level.solution);
    const freq = player[0]?.freq ?? 0;
    if (level.kind === "identify" && Math.abs(freq - level.solution[0].freq) > 0.05) {
      return fail(`Frequency is ${freq.toFixed(2)}. Keep counting crests.`);
    }
    if (gap > 0.03) return fail("Not on the ghost yet.");
    return { ok: true, score: 140, detail: level.kind === "identify" ? `Frequency ${level.solution[0].freq}.` : "The curves match." };
  }
  if (level.kind === "cancel") {
    const gap = flatGap([...level.fixed, ...player]);
    if (gap > 0.035) return fail("The sum still swings. Match size and frequency, then oppose the phase.");
    return { ok: true, score: 150, detail: "The waves cancel. The sum stays on the axis." };
  }
  if (level.kind === "construct") {
    const [a, b] = player;
    if (!a || !b) return fail("Two waves.");
    if (Math.abs(a.freq - b.freq) > 0.05) return fail("Frequencies still disagree.");
    if (angDiff(a.phase, b.phase) > 0.28) return fail("Phases are still apart.");
    if (a.amp < 0.18 || b.amp < 0.18) return fail("Both waves need height.");
    const peak = Math.max(...[0, 1, 2, 3].map((i) => Math.abs(curveY(i / 8, player, 0) - 0.5)));
    const alone = Math.abs(curveY(0.25 / a.freq, [a], 0) - 0.5);
    if (peak < alone + 0.04) return fail("The sum is not taller than one wave.");
    return { ok: true, score: 160, detail: "Crests meet. The sum is taller than either wave." };
  }
  const partner = player[0];
  const source = level.fixed[0];
  if (!partner || !source) return fail("Need the opposing wave.");
  if (dirOf(partner) === dirOf(source)) return fail("One wave has to travel backward.");
  if (Math.abs(partner.amp - source.amp) > 0.04) return fail("Amplitudes differ.");
  if (Math.abs(partner.freq - source.freq) > 0.05) return fail("Wavelengths differ.");
  if (angDiff(partner.phase, source.phase) > 0.3) return fail("Phases still disagree, so the pattern slides.");
  const forward = dirOf(source) === 1 ? source : partner;
  const back = dirOf(source) === 1 ? partner : source;
  if (standingError(forward, back) > 0.08) return fail("That is not a standing pattern yet.");
  return { ok: true, score: 170, detail: "Opposite travel, matched phase. The envelope stays put." };
}

export function auditWavePlay(): string[] {
  const errors: string[] = [];
  if (WAVE_PLAYS.length !== 16) errors.push("count");
  const kinds = new Set(WAVE_PLAYS.map((item) => item.kind));
  for (const kind of ["match", "cancel", "construct", "standing", "identify"] as const) {
    if (!kinds.has(kind)) errors.push(`missing ${kind}`);
  }
  for (const level of WAVE_PLAYS) {
    const won = judgeWave(level, level.solution);
    if (!won.ok) errors.push(`solution ${level.id} ${won.detail}`);
    const lost = judgeWave(level, level.start);
    if (lost.ok) errors.push(`start already won ${level.id}`);
    if (level.kind === "identify" && level.locks[0]?.freq !== false) errors.push(`lock ${level.id}`);
  }
  return errors;
}
