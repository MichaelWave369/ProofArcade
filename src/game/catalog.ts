import { ANGLE_LEVELS } from "./angle/levels.ts";
import { AREA_LEVELS } from "./area/levels.ts";
import { BALANCE_LEVELS } from "./balance/levels.ts";
import { CAMPAIGN_LEVELS } from "./bank.ts";
import { EQUALS_LEVELS } from "./equals/levels.ts";
import { FRACTION_LEVELS } from "./fraction/levels.ts";
import { GRID_LEVELS } from "./grid/levels.ts";
import { LOGIC_LEVELS } from "./logic/levels.ts";
import { MACHINE_LEVELS } from "./machine/levels.ts";
import { MOTION_LEVELS } from "./motion/levels.ts";
import { STAGE_COUNT } from "./match3/symbols.ts";
import { ORBIT_PLAYS } from "./orbit/plays.ts";
import { ODDS_LEVELS } from "./odds/levels.ts";
import { PRIME_LEVELS } from "./prime/levels.ts";
import type { TrackId, TrackProgress } from "./progress.ts";
import { RUN_LEVELS } from "./run/levels.ts";
import { SLOPE_LEVELS } from "./slope/levels.ts";
import { VECTOR_LEVELS } from "./vector/levels.ts";
import { WAVE_PLAYS } from "./waves/play.ts";

export const SUBJECTS = [
  "NUMBER",
  "ALGEBRA",
  "GEOMETRY",
  "LOGIC",
  "PHYSICS",
  "PATTERNS",
  "PROBABILITY",
  "ADVANCED",
] as const;

export const BANDS = ["Explorer", "Builder", "Solver", "Researcher"] as const;

export type Subject = (typeof SUBJECTS)[number];
export type Band = (typeof BANDS)[number];

export type Cabinet = {
  id: TrackId;
  title: string;
  kicker: string;
  blurb: string;
  band: Band;
  subjects: Subject[];
  levels: number;
  flagship: boolean;
};

export const CABINETS: Cabinet[] = [
  {
    id: "bubbles",
    title: "Bubble Proof",
    kicker: "Flagship",
    blurb: "Aim an equation. Pop every orb that shares its value.",
    band: "Solver",
    subjects: ["ALGEBRA", "GEOMETRY", "PHYSICS"],
    levels: CAMPAIGN_LEVELS,
    flagship: true,
  },
  {
    id: "symbols",
    title: "Symbol Match",
    kicker: "Lattice",
    blurb: "Swap glyphs until the proof target falls.",
    band: "Builder",
    subjects: ["PATTERNS", "PHYSICS"],
    levels: STAGE_COUNT,
    flagship: false,
  },
  {
    id: "equals",
    title: "Equals",
    kicker: "Same value",
    blurb: "Different spellings of one number. Leave the lookalikes.",
    band: "Builder",
    subjects: ["ALGEBRA", "NUMBER"],
    levels: EQUALS_LEVELS.length,
    flagship: false,
  },
  {
    id: "run",
    title: "Sequence",
    kicker: "Next term",
    blurb: "Read the rule, then name the missing term.",
    band: "Explorer",
    subjects: ["PATTERNS", "NUMBER"],
    levels: RUN_LEVELS.length,
    flagship: false,
  },
  {
    id: "logic",
    title: "Therefore",
    kicker: "Logic",
    blurb: "Read the premises. Say whether the claim must follow.",
    band: "Researcher",
    subjects: ["LOGIC"],
    levels: LOGIC_LEVELS.length,
    flagship: false,
  },
  {
    id: "odds",
    title: "Odds",
    kicker: "Chance",
    blurb: "Count the beads, coins, and faces. Pick the matching chance.",
    band: "Builder",
    subjects: ["PROBABILITY", "NUMBER"],
    levels: ODDS_LEVELS.length,
    flagship: false,
  },
  {
    id: "slope",
    title: "Slope",
    kicker: "Rise over run",
    blurb: "Move the free point. Rise, run, and slope change together until the line is the one you were asked for.",
    band: "Researcher",
    subjects: ["ADVANCED", "ALGEBRA"],
    levels: SLOPE_LEVELS.length,
    flagship: false,
  },
  {
    id: "fractions",
    title: "Fraction Forge",
    kicker: "Build the bar",
    blurb: "Place, split, and join pieces until the bar is the amount you were asked for.",
    band: "Explorer",
    subjects: ["NUMBER"],
    levels: FRACTION_LEVELS.length,
    flagship: false,
  },
  {
    id: "primes",
    title: "Primes",
    kicker: "Sieve",
    blurb: "Pop every prime. Leave 1, the squares, and the products.",
    band: "Solver",
    subjects: ["NUMBER", "ADVANCED"],
    levels: PRIME_LEVELS.length,
    flagship: false,
  },
  {
    id: "vectors",
    title: "Vector Drift",
    kicker: "Play the cards",
    blurb: "Burn a vector card. Watch position, the card you played, and the resultant.",
    band: "Solver",
    subjects: ["PHYSICS", "GEOMETRY"],
    levels: VECTOR_LEVELS.length,
    flagship: false,
  },
  {
    id: "angles",
    title: "Angles",
    kicker: "The corner",
    blurb: "A right angle, a straight line, or a triangle. Name the blank degree.",
    band: "Researcher",
    subjects: ["GEOMETRY"],
    levels: ANGLE_LEVELS.length,
    flagship: false,
  },
  {
    id: "machine",
    title: "Machine",
    kicker: "In, then out",
    blurb: "A rule changes the number. Name the output, or name the rule.",
    band: "Builder",
    subjects: ["ALGEBRA", "PATTERNS"],
    levels: MACHINE_LEVELS.length,
    flagship: false,
  },
  {
    id: "balance",
    title: "Balance Lab",
    kicker: "Both pans",
    blurb: "Subtract or divide on both pans. Keep the beam level until x stands alone.",
    band: "Solver",
    subjects: ["ALGEBRA"],
    levels: BALANCE_LEVELS.length,
    flagship: false,
  },
  {
    id: "area",
    title: "Area",
    kicker: "Unit squares",
    blurb: "Grow, square, or cut the block. The area on the bench is the product you just made.",
    band: "Builder",
    subjects: ["GEOMETRY"],
    levels: AREA_LEVELS.length,
    flagship: false,
  },
  {
    id: "motion",
    title: "Motion",
    kicker: "Distance, speed, time",
    blurb: "Set speed and time, then launch. The craft stops where the product says it must.",
    band: "Solver",
    subjects: ["PHYSICS"],
    levels: MOTION_LEVELS.length,
    flagship: false,
  },
  {
    id: "grid",
    title: "Grid",
    kicker: "Lattice",
    blurb: "Two points on the grid. Name the halfway point, or how far apart they sit.",
    band: "Researcher",
    subjects: ["GEOMETRY", "ADVANCED"],
    levels: GRID_LEVELS.length,
    flagship: false,
  },
  {
    id: "waves",
    title: "Wave Lab",
    kicker: "On the bench",
    blurb: "Tune amplitude, frequency, and phase until the curve does what the bench asks.",
    band: "Builder",
    subjects: ["PHYSICS", "PATTERNS"],
    levels: WAVE_PLAYS.length,
    flagship: false,
  },
  {
    id: "orbit",
    title: "Orbit",
    kicker: "One mass",
    blurb: "Launch by position, direction, and speed. One fixed mass. Inverse-square. No drag.",
    band: "Researcher",
    subjects: ["PHYSICS"],
    levels: ORBIT_PLAYS.length,
    flagship: false,
  },
];

export function cabinetById(id: TrackId): Cabinet {
  const found = CABINETS.find((cabinet) => cabinet.id === id);
  if (!found) throw new Error(`Unknown cabinet ${id}`);
  return found;
}

export function masteryPercent(cleared: number, levels: number): number {
  if (levels <= 0) return 0;
  const done = Math.max(0, Math.min(Math.floor(cleared), levels));
  return Math.round((done / levels) * 100);
}

export function highestLevel(cleared: number, levels: number): number {
  return Math.max(0, Math.min(Math.floor(cleared), levels));
}

export function isUntouched(track: TrackProgress): boolean {
  return track.best <= 0 && track.cleared <= 0 && track.lastPlayed <= 0 && track.scores.every((score) => score <= 0);
}

export function filterCabinets(subject: Subject | "ALL", band: Band | "ALL", cabinets: Cabinet[] = CABINETS): Cabinet[] {
  return cabinets.filter((cabinet) => {
    const subjectOk = subject === "ALL" || cabinet.subjects.includes(subject);
    const bandOk = band === "ALL" || cabinet.band === band;
    return subjectOk && bandOk;
  });
}

export function formatLastPlayed(ts: number, now = Date.now()): string {
  if (!ts || ts <= 0) return "Never";
  const day = 86_400_000;
  const start = (value: number) => {
    const date = new Date(value);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  };
  const diff = Math.round((start(now) - start(ts)) / day);
  if (diff <= 0) return "Today";
  if (diff === 1) return "Yesterday";
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function proofsCleared(tracks: Record<TrackId, TrackProgress>, cabinets: Cabinet[] = CABINETS): number {
  return cabinets.reduce((sum, cabinet) => sum + highestLevel(tracks[cabinet.id].cleared, cabinet.levels), 0);
}
