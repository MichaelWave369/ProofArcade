/** Fixed central mass. Inverse-square, no drag, no third body. */
export const MU = 1;
export const SURFACE = 0.22;
export const DT = 0.008;
export const STEPS = 2400;

export const ORBIT_MODEL =
  "Simplified: one fixed mass, inverse-square gravity, no drag, and no other bodies. The trail is the stepper, not a painted guess.";

export type Body = { x: number; y: number; vx: number; vy: number };

export type Launch = {
  radius: number;
  angle: number;
  heading: number;
  speed: number;
};

export type OrbitClass = "surface" | "circle" | "ellipse" | "escape";

export function acceleration(x: number, y: number, mu = MU) {
  const r = Math.hypot(x, y);
  const soft = Math.max(r, 1e-4);
  const inv = mu / (soft * soft * soft);
  return { ax: -x * inv, ay: -y * inv };
}

export function specificEnergy(body: Body, mu = MU) {
  const r = Math.max(Math.hypot(body.x, body.y), 1e-4);
  return (body.vx * body.vx + body.vy * body.vy) / 2 - mu / r;
}

export function circularSpeed(radius: number, mu = MU) {
  return Math.sqrt(mu / radius);
}

export function escapeSpeed(radius: number, mu = MU) {
  return Math.sqrt((2 * mu) / radius);
}

export function tangentHeading(angle: number, retro = false) {
  return angle + (retro ? -Math.PI / 2 : Math.PI / 2);
}

export function bodyFrom(launch: Launch): Body {
  return {
    x: launch.radius * Math.cos(launch.angle),
    y: launch.radius * Math.sin(launch.angle),
    vx: launch.speed * Math.cos(launch.heading),
    vy: launch.speed * Math.sin(launch.heading),
  };
}

export function stepBody(body: Body, dt = DT, mu = MU): Body {
  const a1 = acceleration(body.x, body.y, mu);
  const x = body.x + body.vx * dt + 0.5 * a1.ax * dt * dt;
  const y = body.y + body.vy * dt + 0.5 * a1.ay * dt * dt;
  const a2 = acceleration(x, y, mu);
  return {
    x,
    y,
    vx: body.vx + 0.5 * (a1.ax + a2.ax) * dt,
    vy: body.vy + 0.5 * (a1.ay + a2.ay) * dt,
  };
}

export function fly(launch: Launch, steps = STEPS, dt = DT): Body[] {
  let body = bodyFrom(launch);
  const out: Body[] = [{ ...body }];
  for (let i = 0; i < steps; i++) {
    body = stepBody(body, dt);
    if (i % 6 === 0) out.push(body);
    const r = Math.hypot(body.x, body.y);
    if (r < SURFACE || r > 14) {
      out.push(body);
      break;
    }
  }
  return out;
}

export function classifyOrbit(samples: Body[]): OrbitClass {
  if (samples.length === 0) return "surface";
  let minR = Infinity;
  let maxR = 0;
  let sum = 0;
  for (const sample of samples) {
    const r = Math.hypot(sample.x, sample.y);
    if (r < SURFACE) return "surface";
    minR = Math.min(minR, r);
    maxR = Math.max(maxR, r);
    sum += r;
  }
  const last = samples[samples.length - 1];
  if (specificEnergy(last) >= -0.015 && maxR > 3.2) return "escape";
  const mean = sum / samples.length;
  const spread = mean > 0 ? (maxR - minR) / mean : 1;
  if (spread < 0.2) return "circle";
  return "ellipse";
}

export function pathGap(a: Body[], b: Body[]) {
  const n = Math.min(a.length, b.length);
  if (n === 0) return Infinity;
  let sum = 0;
  for (let i = 0; i < n; i++) sum += Math.hypot(a[i].x - b[i].x, a[i].y - b[i].y);
  return sum / n;
}

export function launchNear(a: Launch, b: Launch) {
  return (
    Math.abs(a.radius - b.radius) < 0.051 &&
    Math.abs(a.speed - b.speed) < 0.051 &&
    Math.abs(Math.atan2(Math.sin(a.angle - b.angle), Math.cos(a.angle - b.angle))) < 0.09 &&
    Math.abs(Math.atan2(Math.sin(a.heading - b.heading), Math.cos(a.heading - b.heading))) < 0.09
  );
}
