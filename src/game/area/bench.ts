export type AreaAim = "rect" | "square" | "wide" | "tall" | "cut" | "tri";

export type AreaPlay = {
  id: number;
  title: string;
  blurb: string;
  aim: AreaAim;
  maxW: number;
  maxH: number;
  startW: number;
  startH: number;
  target: number;
  blockW: number;
  blockH: number;
  solutionW: number;
  solutionH: number;
};

export const AREA_LAW: Record<AreaAim, string> = {
  rect: "Area of a rectangle is width times height. Every gold cell is one.",
  square: "A square is a rectangle whose sides are equal. Area is still the product.",
  wide: "Width times height is the area. This bench also asks the width to be the longer side.",
  tall: "Width times height is the area. This bench also asks the height to be the longer side.",
  cut: "What remains is the full block minus the cut. Both of those numbers are areas.",
  tri: "A right triangle is half the rectangle on the same legs. Area = ½ × base × height.",
};

function play(
  id: number,
  title: string,
  aim: AreaAim,
  blurb: string,
  maxW: number,
  maxH: number,
  startW: number,
  startH: number,
  target: number,
  solutionW: number,
  solutionH: number,
  blockW = maxW,
  blockH = maxH,
): AreaPlay {
  return {
    id,
    title,
    aim,
    blurb,
    maxW,
    maxH,
    startW,
    startH,
    target,
    blockW,
    blockH,
    solutionW,
    solutionH,
  };
}

export const AREA_PLAYS: AreaPlay[] = [
  play(1, "Six cells", "rect", "Grow the block until the gold counts as 6.", 6, 6, 1, 1, 6, 2, 3),
  play(2, "Eight cells", "rect", "Width times height. Land on 8.", 8, 4, 1, 1, 8, 2, 4),
  play(3, "Twelve", "rect", "A longer rectangle. The product is 12.", 6, 6, 2, 2, 12, 3, 4),
  play(4, "A prime area", "rect", "7 has only one pair of whole sides that fit this bench.", 8, 8, 2, 2, 7, 1, 7),
  play(5, "A square of 9", "square", "Equal sides, and the product is 9.", 6, 6, 2, 2, 9, 3, 3),
  play(6, "A square of 16", "square", "Equal sides again. The area is 16.", 6, 6, 2, 3, 16, 4, 4),
  play(7, "Wider than tall", "wide", "Area 12, and the width has to be the longer side.", 8, 6, 2, 2, 12, 4, 3),
  play(8, "Taller than wide", "tall", "Area 12, and the height has to be the longer side.", 6, 8, 4, 2, 12, 3, 4),
  play(9, "Wide eighteen", "wide", "Area 18. Keep it wider than it is tall.", 8, 6, 3, 3, 18, 6, 3),
  play(10, "Tall fifteen", "tall", "Area 15. The height is the longer side.", 6, 8, 5, 1, 15, 3, 5),
  play(11, "Leave 18", "cut", "The block is 6 by 4. Cut a rectangle out until 18 remains.", 6, 4, 1, 1, 18, 3, 2, 6, 4),
  play(12, "Leave 15", "cut", "A 5 by 5 block. The cut removes what you do not want counted.", 5, 5, 1, 1, 15, 5, 2, 5, 5),
  play(13, "Leave half", "cut", "An 8 by 3 block. Leave half of it.", 8, 3, 0, 0, 12, 4, 3, 8, 3),
  play(14, "Half of the box", "tri", "Set the legs so the triangle, not the box, has area 6.", 8, 6, 2, 2, 6, 4, 3),
  play(15, "Triangle of 10", "tri", "Half of base times height equals 10.", 8, 8, 2, 2, 10, 5, 4),
  play(16, "Triangle of 8", "tri", "The dashed box is the rectangle. The gold is half of it.", 8, 8, 2, 2, 8, 4, 4),
];

export function areaBounds(play: AreaPlay) {
  const cut = play.aim === "cut";
  return {
    minW: cut ? 0 : 1,
    minH: cut ? 0 : 1,
    maxW: cut ? play.blockW : play.maxW,
    maxH: cut ? play.blockH : play.maxH,
  };
}

export function snapAreaDimensions(play: AreaPlay, w: number, h: number) {
  const bounds = areaBounds(play);
  return {
    w: Math.max(bounds.minW, Math.min(bounds.maxW, Math.round(w))),
    h: Math.max(bounds.minH, Math.min(bounds.maxH, Math.round(h))),
  };
}

export function areaAmount(play: AreaPlay, w: number, h: number) {
  if (play.aim === "cut") return play.blockW * play.blockH - w * h;
  if (play.aim === "tri") return (w * h) / 2;
  return w * h;
}

export function formatAmount(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function areaFormula(play: AreaPlay, w: number, h: number) {
  const amount = formatAmount(areaAmount(play, w, h));
  if (play.aim === "cut") return `${play.blockW * play.blockH} − ${w * h} = ${amount}`;
  if (play.aim === "tri") return `½ × ${w} × ${h} = ${amount}`;
  return `${w} × ${h} = ${amount}`;
}

export function areaSolved(play: AreaPlay, w: number, h: number) {
  if (!Number.isInteger(w) || !Number.isInteger(h) || w < 0 || h < 0) return false;
  if (play.aim === "cut") {
    if (w > play.blockW || h > play.blockH) return false;
    return play.blockW * play.blockH - w * h === play.target;
  }
  if (w < 1 || h < 1 || w > play.maxW || h > play.maxH) return false;
  if (play.aim === "tri") return (w * h) / 2 === play.target;
  if (play.aim === "square") return w === h && w * h === play.target;
  if (play.aim === "wide") return w > h && w * h === play.target;
  if (play.aim === "tall") return h > w && w * h === play.target;
  return w * h === play.target;
}

export function auditAreaPlay(): string[] {
  const errors: string[] = [];
  if (AREA_PLAYS.length !== 16) errors.push("area play count");
  const aims = new Set(AREA_PLAYS.map((item) => item.aim));
  for (const aim of ["rect", "square", "wide", "tall", "cut", "tri"] as const) {
    if (!aims.has(aim)) errors.push(`missing ${aim}`);
  }
  AREA_PLAYS.forEach((item, index) => {
    if (item.id !== index + 1) errors.push(`id ${item.id}`);
    if (areaSolved(item, item.startW, item.startH)) errors.push(`start solved ${item.id}`);
    if (!areaSolved(item, item.solutionW, item.solutionH)) errors.push(`unsolved ${item.id}`);
    if (item.aim === "tri" && item.target * 2 !== item.solutionW * item.solutionH) errors.push(`half ${item.id}`);
    if (item.aim === "cut") {
      const full = item.blockW * item.blockH;
      if (full - item.solutionW * item.solutionH !== item.target) errors.push(`cut ${item.id}`);
      if (item.target < 0 || item.target > full) errors.push(`cut range ${item.id}`);
    }
    if (item.aim !== "cut" && (item.solutionW > item.maxW || item.solutionH > item.maxH)) errors.push(`max ${item.id}`);
  });
  return errors;
}
