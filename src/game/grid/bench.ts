import {
  GRID_LEVELS,
  midpoint,
  straightDistance,
  type Pt,
} from "./levels.ts";

export const GRID_MIN = -6;
export const GRID_MAX = 6;

export type GridBenchPlay =
  | {
      id: number;
      title: string;
      kind: "mid";
      a: Pt;
      b: Pt;
      target: Pt;
      start: Pt;
    }
  | {
      id: number;
      title: string;
      kind: "far";
      a: Pt;
      authoredB: Pt;
      targetDistance: number;
      start: Pt;
    };

export function sameGridPoint(a: Pt, b: Pt) {
  return a[0] === b[0] && a[1] === b[1];
}

export function snapGridPoint(x: number, y: number): Pt {
  return [
    Math.max(GRID_MIN, Math.min(GRID_MAX, Math.round(x))),
    Math.max(GRID_MIN, Math.min(GRID_MAX, Math.round(y))),
  ];
}

export function gridDelta(a: Pt, b: Pt) {
  return {
    run: b[0] - a[0],
    rise: b[1] - a[1],
  };
}

export function squaredDistance(a: Pt, b: Pt) {
  const { run, rise } = gridDelta(a, b);
  return run * run + rise * rise;
}

export function exactDistance(a: Pt, b: Pt): number | null {
  const square = squaredDistance(a, b);
  const root = Math.round(Math.sqrt(square));
  return root * root === square ? root : null;
}

export function gridBenchSolved(play: GridBenchPlay, point: Pt) {
  if (play.kind === "mid") return sameGridPoint(point, play.target);
  return squaredDistance(play.a, point) === play.targetDistance * play.targetDistance;
}

export function distanceExpression(a: Pt, b: Pt) {
  const { run, rise } = gridDelta(a, b);
  const square = squaredDistance(a, b);
  const exact = exactDistance(a, b);
  return {
    run,
    rise,
    square,
    exact,
    label: exact === null ? `√${square}` : String(exact),
  };
}

function unsolvedNeighbor(target: Pt, solved: (point: Pt) => boolean): Pt {
  const candidates: Pt[] = [
    [target[0] + 1, target[1]],
    [target[0] - 1, target[1]],
    [target[0], target[1] + 1],
    [target[0], target[1] - 1],
    [target[0] + 1, target[1] + 1],
    [target[0] - 1, target[1] - 1],
  ];

  for (const candidate of candidates) {
    const snapped = snapGridPoint(candidate[0], candidate[1]);
    if (!sameGridPoint(snapped, target) && !solved(snapped)) return snapped;
  }

  for (let x = GRID_MIN; x <= GRID_MAX; x += 1) {
    for (let y = GRID_MIN; y <= GRID_MAX; y += 1) {
      const candidate: Pt = [x, y];
      if (!solved(candidate)) return candidate;
    }
  }

  return target;
}

export const GRID_PLAYS: GridBenchPlay[] = GRID_LEVELS.map((level) => {
  const scene = level.prompts[0].scene;

  if (scene.kind === "mid") {
    const target = midpoint(scene.a, scene.b);
    if (!target) throw new Error(`grid direct midpoint ${level.id}`);
    const start = unsolvedNeighbor(target, (point) => sameGridPoint(point, target));
    return {
      id: level.id,
      title: level.title,
      kind: "mid",
      a: scene.a,
      b: scene.b,
      target,
      start,
    };
  }

  const targetDistance = straightDistance(scene.a, scene.b);
  if (targetDistance === null) throw new Error(`grid direct distance ${level.id}`);
  const start = unsolvedNeighbor(
    scene.b,
    (point) =>
      sameGridPoint(point, scene.a) ||
      squaredDistance(scene.a, point) === targetDistance * targetDistance,
  );
  return {
    id: level.id,
    title: level.title,
    kind: "far",
    a: scene.a,
    authoredB: scene.b,
    targetDistance,
    start,
  };
});

export function gridBenchInstruction(play: GridBenchPlay) {
  if (play.kind === "mid") {
    return "Drag the mint probe to the lattice point that splits the gold segment into two equal halves.";
  }
  return `Keep A fixed. Drag B to any lattice point exactly ${play.targetDistance} units away. The right triangle proves the distance.`;
}

export function auditGridBench(): string[] {
  const errors: string[] = [];
  if (GRID_PLAYS.length !== 16) errors.push(`count ${GRID_PLAYS.length}`);

  for (const play of GRID_PLAYS) {
    if (gridBenchSolved(play, play.start)) errors.push(`start solved ${play.id}`);

    if (play.kind === "mid") {
      if (!gridBenchSolved(play, play.target)) errors.push(`mid target ${play.id}`);
      const original = midpoint(play.a, play.b);
      if (!original || !sameGridPoint(original, play.target)) errors.push(`mid authored ${play.id}`);
    } else {
      if (!gridBenchSolved(play, play.authoredB)) errors.push(`far authored ${play.id}`);
      if (exactDistance(play.a, play.authoredB) !== play.targetDistance) {
        errors.push(`far target ${play.id}`);
      }
    }

    const low = snapGridPoint(-999, -999);
    const high = snapGridPoint(999, 999);
    if (!sameGridPoint(low, [GRID_MIN, GRID_MIN])) errors.push(`low ${play.id}`);
    if (!sameGridPoint(high, [GRID_MAX, GRID_MAX])) errors.push(`high ${play.id}`);
  }

  return errors;
}
