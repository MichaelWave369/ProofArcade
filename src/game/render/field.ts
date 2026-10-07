export type Wave = {
  amp: number;
  freq: number;
  phase: number;
  /** +1 rides the clock. -1 runs against it. Draw code bakes this into phase. */
  dir?: 1 | -1;
};

export type FieldParticle = {
  x: number;
  y: number;
  vy: number;
  trail: number[];
};

export const TRAIL_SAMPLES = 12;

/** Vertical position of the summed waves. Matches the instrument shaders. */
export function curveY(x: number, waves: readonly Wave[], time: number): number {
  let sum = 0;
  for (const wave of waves) {
    sum += wave.amp * Math.sin(wave.freq * x * Math.PI * 2 + wave.phase + time);
  }
  return 0.5 + sum * 0.42;
}

export function createPool(count: number): FieldParticle[] {
  const pool: FieldParticle[] = [];
  const n = Math.max(0, Math.floor(count));
  for (let i = 0; i < n; i++) {
    pool.push({ x: n === 1 ? 0.5 : i / (n - 1), y: 0.5, vy: 0, trail: [] });
  }
  return pool;
}

/** Particles chase the real curve and leave a trail of where they have been. */
export function stepPool(pool: FieldParticle[], dt: number, waves: readonly Wave[], time: number) {
  const h = Math.min(Math.max(dt, 0), 0.05);
  if (h === 0) return;
  for (const particle of pool) {
    const target = curveY(particle.x, waves, time);
    const pull = (target - particle.y) * 14 - particle.vy * 5;
    particle.vy += pull * h;
    particle.y += particle.vy * h;
    particle.x += 0.07 * h;
    if (particle.x > 1) particle.x -= 1;
    particle.trail.push(particle.x, particle.y);
    if (particle.trail.length > TRAIL_SAMPLES) particle.trail.splice(0, particle.trail.length - TRAIL_SAMPLES);
  }
}
