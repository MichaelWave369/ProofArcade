import {
  ORBIT_MODEL,
  circularSpeed,
  classifyOrbit,
  escapeSpeed,
  fly,
  tangentHeading,
  type Launch,
  type OrbitClass,
} from "./sim.ts";

export { ORBIT_MODEL };

export type OrbitAim = "aloft" | OrbitClass;

export type OrbitLock = {
  radius?: boolean;
  angle?: boolean;
  heading?: boolean;
  speed?: boolean;
};

export type OrbitPlay = {
  id: number;
  title: string;
  blurb: string;
  aim: OrbitAim;
  start: Launch;
  solution: Launch;
  locks: OrbitLock;
};

export function orbitEditable(locks: OrbitLock, key: keyof OrbitLock) {
  const named = (Object.keys(locks) as (keyof OrbitLock)[]).filter((name) => locks[name] !== undefined);
  if (named.length === 0) return true;
  return locks[key] === false;
}

function shot(radius: number, angle: number, speed: number, heading = tangentHeading(angle)): Launch {
  return { radius, angle, heading, speed };
}

const speedOnly: OrbitLock = { speed: false };
const headingOnly: OrbitLock = { heading: false };
const aimBoth: OrbitLock = { speed: false, heading: false };

export const ORBIT_PLAYS: OrbitPlay[] = [
  {
    id: 1,
    title: "Stay aloft",
    blurb: "Too slow and you fall into the mass. Give the craft enough speed to stay off it.",
    aim: "aloft",
    start: shot(1, 0.4, 0.55 * circularSpeed(1)),
    solution: shot(1, 0.4, circularSpeed(1)),
    locks: speedOnly,
  },
  {
    id: 2,
    title: "Hold a circle",
    blurb: "A circle keeps one distance. This start is already stretched. Ease the speed back.",
    aim: "circle",
    start: shot(1, 0.2, 1.2 * circularSpeed(1)),
    solution: shot(1, 0.2, circularSpeed(1)),
    locks: speedOnly,
  },
  {
    id: 3,
    title: "Far circle",
    blurb: "Same rule, farther out. Circular speed is lower when the radius is larger.",
    aim: "circle",
    start: shot(2, 1.1, 0.5 * circularSpeed(2)),
    solution: shot(2, 1.1, circularSpeed(2)),
    locks: speedOnly,
  },
  {
    id: 4,
    title: "Close circle",
    blurb: "Near the mass, standing still is not an option. Find the speed that holds the radius.",
    aim: "circle",
    start: shot(0.8, 0.2, 0.55 * circularSpeed(0.8)),
    solution: shot(0.8, 0.2, circularSpeed(0.8)),
    locks: speedOnly,
  },
  {
    id: 5,
    title: "Stretch the path",
    blurb: "A little under circular speed and the path becomes an ellipse. Do not fall in.",
    aim: "ellipse",
    start: shot(1, 0.4, circularSpeed(1)),
    solution: shot(1, 0.4, 0.82 * circularSpeed(1)),
    locks: speedOnly,
  },
  {
    id: 6,
    title: "A thinner ellipse",
    blurb: "Slower still, as long as the closest point stays above the mass.",
    aim: "ellipse",
    start: shot(1, 1.2, circularSpeed(1)),
    solution: shot(1, 1.2, 0.75 * circularSpeed(1)),
    locks: speedOnly,
  },
  {
    id: 7,
    title: "Ellipse farther out",
    blurb: "Drop below circular speed at this radius. The far point stays where you started.",
    aim: "ellipse",
    start: shot(1.6, 0.8, circularSpeed(1.6)),
    solution: shot(1.6, 0.8, 0.82 * circularSpeed(1.6)),
    locks: speedOnly,
  },
  {
    id: 8,
    title: "Fast ellipse",
    blurb: "Too much speed for a circle, not enough to leave. The path reaches farther and comes back.",
    aim: "ellipse",
    start: shot(1, 2.1, circularSpeed(1)),
    solution: shot(1, 2.1, 1.25 * circularSpeed(1)),
    locks: speedOnly,
  },
  {
    id: 9,
    title: "Leave",
    blurb: "Escape speed is higher than circular speed. The craft should not come back.",
    aim: "escape",
    start: shot(1, 0.4, circularSpeed(1)),
    solution: shot(1, 0.4, 1.08 * escapeSpeed(1)),
    locks: speedOnly,
  },
  {
    id: 10,
    title: "Leave from farther",
    blurb: "A wider start needs less speed to escape. Still more than the circle at that radius.",
    aim: "escape",
    start: shot(1.5, 2, circularSpeed(1.5)),
    solution: shot(1.5, 2, 1.08 * escapeSpeed(1.5)),
    locks: speedOnly,
  },
  {
    id: 11,
    title: "Just enough",
    blurb: "A small step past escape speed is enough. The trail should run outward and stay gone.",
    aim: "escape",
    start: shot(1, 0.7, circularSpeed(1)),
    solution: shot(1, 0.7, 1.05 * escapeSpeed(1)),
    locks: speedOnly,
  },
  {
    id: 12,
    title: "Point along the circle",
    blurb: "The same speed, pointed at the mass, falls in. Point it along the tangent.",
    aim: "circle",
    start: shot(1, 0.4, circularSpeed(1), 0.4),
    solution: shot(1, 0.4, circularSpeed(1)),
    locks: headingOnly,
  },
  {
    id: 13,
    title: "Aim the ellipse",
    blurb: "This speed can stretch into an ellipse, but only if the heading is tangent.",
    aim: "ellipse",
    start: shot(1, 0.4, 0.82 * circularSpeed(1), 0.4),
    solution: shot(1, 0.4, 0.82 * circularSpeed(1)),
    locks: aimBoth,
  },
  {
    id: 14,
    title: "Which way is out",
    blurb: "Escape speed pointed inward still hits the mass. Turn the heading.",
    aim: "escape",
    start: shot(1, 0.9, 1.08 * escapeSpeed(1), 0.9 + Math.PI),
    solution: shot(1, 0.9, 1.08 * escapeSpeed(1)),
    locks: headingOnly,
  },
  {
    id: 15,
    title: "Fall in",
    blurb: "Cut the speed until the path meets the mass. This one is supposed to hit.",
    aim: "surface",
    start: shot(1, 0.3, circularSpeed(1)),
    solution: shot(1, 0.3, 0.5 * circularSpeed(1)),
    locks: speedOnly,
  },
  {
    id: 16,
    title: "Your own ellipse",
    blurb: "Radius, angle, heading, and speed are open. Any ellipse counts. The numbers are not the grade.",
    aim: "ellipse",
    start: shot(1, 0.4, circularSpeed(1), 0.4),
    solution: shot(1.6, 0.8, 0.82 * circularSpeed(1.6)),
    locks: {},
  },
];

export type OrbitJudgement = { ok: boolean; kind: OrbitClass; detail: string };

export function judgeOrbitSamples(
  play: OrbitPlay,
  samples: ReturnType<typeof fly>,
): OrbitJudgement {
  const kind = classifyOrbit(samples);
  if (play.aim === "aloft") {
    const ok = kind !== "surface";
    return { ok, kind, detail: ok ? `Aloft. The path is a ${kind}.` : "That launch hits the mass." };
  }
  if (play.aim === "surface") {
    const ok = kind === "surface";
    return { ok, kind, detail: ok ? "The launch falls into the mass." : `The path is a ${kind}. It misses the mass.` };
  }
  const ok = kind === play.aim;
  return { ok, kind, detail: ok ? `The path is a ${kind}.` : `The path is a ${kind}, not a ${play.aim}.` };
}

export function judgeOrbit(play: OrbitPlay, launch: Launch): OrbitJudgement {
  return judgeOrbitSamples(play, fly(launch));
}

export function auditOrbitPlay(): string[] {
  const errors: string[] = [];
  if (ORBIT_PLAYS.length !== 16) errors.push("count");
  const aims = new Set(ORBIT_PLAYS.map((play) => play.aim));
  for (const aim of ["aloft", "circle", "ellipse", "escape", "surface"] as const) {
    if (!aims.has(aim)) errors.push(`missing ${aim}`);
  }
  const fields = ["radius", "angle", "heading", "speed"] as const;
  for (const play of ORBIT_PLAYS) {
    if (play.id < 1) errors.push(`id ${play.id}`);
    const won = judgeOrbit(play, play.solution);
    if (!won.ok) errors.push(`solution ${play.id} ${won.detail}`);
    const lost = judgeOrbit(play, play.start);
    if (lost.ok) errors.push(`start already won ${play.id} ${lost.detail}`);
    for (const field of fields) {
      if (!orbitEditable(play.locks, field) && Math.abs(play.start[field] - play.solution[field]) > 1e-9) {
        errors.push(`lock ${play.id} ${field}`);
      }
    }
  }
  return errors;
}
