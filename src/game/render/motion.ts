export type Spring = {
  value: number;
  velocity: number;
  target: number;
  stiffness: number;
  damping: number;
  mass: number;
};

export type SpringClock = {
  leftover: number;
};

const FIXED = 1 / 120;
const MAX_FRAME = 0.05;

export function createSpring(value: number, options?: Partial<Pick<Spring, "target" | "stiffness" | "damping" | "mass" | "velocity">>): Spring {
  return {
    value,
    velocity: options?.velocity ?? 0,
    target: options?.target ?? value,
    stiffness: options?.stiffness ?? 80,
    damping: options?.damping ?? 14,
    mass: options?.mass && options.mass > 0 ? options.mass : 1,
  };
}

export function createClock(): SpringClock {
  return { leftover: 0 };
}

export function dampingRatio(spring: Spring): number {
  return spring.damping / (2 * Math.sqrt(spring.stiffness * spring.mass));
}

function integrate(spring: Spring, h: number) {
  const force = -spring.stiffness * (spring.value - spring.target) - spring.damping * spring.velocity;
  spring.velocity += (force / spring.mass) * h;
  spring.value += spring.velocity * h;
}

function consume(dt: number, clock: SpringClock, step: (h: number) => void) {
  clock.leftover += Math.min(Math.max(dt, 0), MAX_FRAME);
  let guard = 0;
  while (clock.leftover >= FIXED && guard < 8) {
    step(FIXED);
    clock.leftover -= FIXED;
    guard += 1;
  }
}

/** Fixed-step spring. Same elapsed time lands near the same place at 30 Hz and 144 Hz. */
export function stepSpring(spring: Spring, dt: number, clock: SpringClock = createClock()) {
  consume(dt, clock, (h) => integrate(spring, h));
}

export function kick(spring: Spring, velocity: number) {
  spring.velocity += velocity;
}

export type Spring2 = {
  x: Spring;
  y: Spring;
};

export function createSpring2(x: number, y: number, options?: Partial<Pick<Spring, "stiffness" | "damping" | "mass">>): Spring2 {
  return { x: createSpring(x, options), y: createSpring(y, options) };
}

export function stepSpring2(body: Spring2, dt: number, clock: SpringClock = createClock()) {
  consume(dt, clock, (h) => {
    integrate(body.x, h);
    integrate(body.y, h);
  });
}
