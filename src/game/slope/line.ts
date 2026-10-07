import { formatSlope } from "./levels.ts";

export type V = { x: number; y: number };

export type LineAim = "slope" | "through" | "land";

export type LinePlay = {
  id: number;
  title: string;
  blurb: string;
  aim: LineAim;
  anchor: V;
  start: V;
  solution: V;
  slope?: string;
  through?: V;
  span: number;
};

export const LINE_LAW: Record<LineAim, string> = {
  slope: "Slope = rise ÷ run. The same ratio at any length is the same slope. A vertical line has undefined slope.",
  through: "The mint point is on the line when its rise and run from the anchor are the same ratio as B.",
  land: "The mark is one lattice point. Slope is whatever rise and run that point makes.",
};

function at(x: number, y: number): V {
  return { x, y };
}

function play(
  id: number,
  title: string,
  aim: LineAim,
  blurb: string,
  anchor: V,
  start: V,
  solution: V,
  span: number,
  extra: { slope?: string; through?: V } = {},
): LinePlay {
  return { id, title, aim, blurb, anchor, start, solution, span, ...extra };
}

export const LINE_PLAYS: LinePlay[] = [
  play(1, "Rise with the run", "slope", "From the origin, move B until the slope is 1.", at(0, 0), at(2, 0), at(2, 2), 4, { slope: "1" }),
  play(2, "Twice as steep", "slope", "Rise two for every one you run.", at(0, 0), at(1, 0), at(2, 4), 4, { slope: "2" }),
  play(3, "A shallow climb", "slope", "The rise is half the run.", at(0, 0), at(0, 2), at(4, 2), 4, { slope: "1/2" }),
  play(4, "No rise", "slope", "A horizontal line has slope 0. Keep B off the anchor.", at(0, 1), at(1, 3), at(3, 1), 4, { slope: "0" }),
  play(5, "Downhill", "slope", "The line falls as fast as it runs.", at(0, 0), at(2, 1), at(2, -2), 4, { slope: "-1" }),
  play(6, "Gentle drop", "slope", "Down one for every two across.", at(0, 0), at(2, 0), at(4, -2), 4, { slope: "-1/2" }),
  play(7, "Steep", "slope", "Three up for one across.", at(0, 0), at(2, 2), at(1, 3), 4, { slope: "3" }),
  play(8, "Steep drop", "slope", "Two down for each step right.", at(0, 0), at(1, 1), at(2, -4), 4, { slope: "-2" }),
  play(9, "No run", "slope", "A vertical line has undefined slope. Same x, different y.", at(1, 0), at(3, 1), at(1, 3), 4, { slope: "undefined" }),
  play(10, "Not the origin", "slope", "The anchor has moved. Slope is still rise over run.", at(1, 1), at(3, 1), at(3, 5), 5, { slope: "2" }),
  play(11, "Hit the mint point", "through", "Move B until the line passes through the mint point.", at(0, 0), at(2, 0), at(3, 3), 4, { through: at(2, 2) }),
  play(12, "Mint on the left", "through", "The line can reach the mint point from either side.", at(2, 0), at(3, 1), at(0, 1), 4, { through: at(-2, 2) }),
  play(13, "Land on the mark", "land", "B itself has to sit on the mark.", at(0, 0), at(1, 1), at(4, 2), 4),
  play(14, "Three over two", "slope", "Rise 3, run 2, from a shifted anchor.", at(-1, 0), at(1, 0), at(1, 3), 4, { slope: "3/2" }),
  play(15, "Down three, across two", "slope", "The drop is steeper than the run.", at(0, 1), at(2, 1), at(2, -2), 4, { slope: "-3/2" }),
  play(16, "Thread the mint point", "through", "The anchor is not the origin. The line still has to pass through mint.", at(-2, -1), at(-2, 2), at(0, 0), 4, { through: at(2, 1) }),
];

export function samePoint(a: V, b: V) {
  return a.x === b.x && a.y === b.y;
}

export function riseRun(anchor: V, point: V) {
  return { rise: point.y - anchor.y, run: point.x - anchor.x };
}

export function slopeText(anchor: V, point: V) {
  const { rise, run } = riseRun(anchor, point);
  if (rise === 0 && run === 0) return "—";
  return formatSlope(rise, run);
}

export function onLine(anchor: V, point: V, target: V) {
  const run = point.x - anchor.x;
  const rise = point.y - anchor.y;
  const tx = target.x - anchor.x;
  const ty = target.y - anchor.y;
  if (run === 0 && rise === 0) return false;
  return run * ty - rise * tx === 0;
}

export function inSpan(point: V, span: number) {
  return point.x >= -span && point.x <= span && point.y >= -span && point.y <= span;
}

export function clampPoint(point: V, span: number): V {
  return {
    x: Math.max(-span, Math.min(span, point.x)),
    y: Math.max(-span, Math.min(span, point.y)),
  };
}

export function snapPoint(point: V, span: number): V {
  return clampPoint(
    {
      x: Math.round(point.x),
      y: Math.round(point.y),
    },
    span,
  );
}

export function lineSolved(play: LinePlay, point: V) {
  if (!inSpan(point, play.span)) return false;
  if (samePoint(point, play.anchor)) return false;
  if (play.aim === "land") return samePoint(point, play.solution);
  if (play.aim === "through") return play.through ? onLine(play.anchor, point, play.through) : false;
  return slopeText(play.anchor, point) === play.slope;
}

/** The infinite line through the anchor and B, clipped to the lattice square. */
export function boardSegment(anchor: V, point: V, span: number): { a: V; b: V } | null {
  const dx = point.x - anchor.x;
  const dy = point.y - anchor.y;
  if (dx === 0 && dy === 0) return null;
  const hits: V[] = [];
  const consider = (t: number) => {
    const x = anchor.x + dx * t;
    const y = anchor.y + dy * t;
    if (x >= -span - 1e-6 && x <= span + 1e-6 && y >= -span - 1e-6 && y <= span + 1e-6) hits.push({ x, y });
  };
  if (dx !== 0) {
    consider((-span - anchor.x) / dx);
    consider((span - anchor.x) / dx);
  }
  if (dy !== 0) {
    consider((-span - anchor.y) / dy);
    consider((span - anchor.y) / dy);
  }
  if (hits.length < 2) return { a: anchor, b: point };
  let best = -1;
  let pair: [V, V] = [hits[0], hits[1]];
  for (let i = 0; i < hits.length; i++) {
    for (let j = i + 1; j < hits.length; j++) {
      const dist = Math.hypot(hits[i].x - hits[j].x, hits[i].y - hits[j].y);
      if (dist > best) {
        best = dist;
        pair = [hits[i], hits[j]];
      }
    }
  }
  return { a: pair[0], b: pair[1] };
}

export function auditLine(): string[] {
  const errors: string[] = [];
  if (LINE_PLAYS.length !== 16) errors.push("line count");
  const aims = new Set(LINE_PLAYS.map((item) => item.aim));
  for (const aim of ["slope", "through", "land"] as const) {
    if (!aims.has(aim)) errors.push(`missing ${aim}`);
  }
  LINE_PLAYS.forEach((item, index) => {
    if (item.id !== index + 1) errors.push(`id ${item.id}`);
    if (!inSpan(item.anchor, item.span) || !inSpan(item.start, item.span) || !inSpan(item.solution, item.span)) {
      errors.push(`span ${item.id}`);
    }
    if (lineSolved(item, item.start)) errors.push(`start solved ${item.id}`);
    if (!lineSolved(item, item.solution)) errors.push(`unsolved ${item.id}`);
    if (item.aim === "slope") {
      if (!item.slope) errors.push(`slope text ${item.id}`);
      if (slopeText(item.anchor, item.solution) !== item.slope) errors.push(`slope mismatch ${item.id}`);
    }
    if (item.aim === "through") {
      if (!item.through || samePoint(item.through, item.anchor) || !inSpan(item.through, item.span)) errors.push(`through ${item.id}`);
      else if (!onLine(item.anchor, item.solution, item.through)) errors.push(`through off ${item.id}`);
    }
    if (item.aim === "land" && !samePoint(item.solution, item.solution)) errors.push(`land ${item.id}`);
    const segment = boardSegment(item.anchor, item.solution, item.span);
    if (!segment) errors.push(`segment ${item.id}`);
  });
  return errors;
}
