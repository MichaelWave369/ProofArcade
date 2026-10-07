import {
  DOMAIN_LABEL,
  PROBLEMS,
  problemsFor,
  wavePlan,
  type Domain,
  type ProblemDef,
  type Special,
} from "./bank";

export const COLS = 8;
export const SQRT3 = Math.sqrt(3);
export const WORLD_W = COLS * 2;
export const WORLD_H = 20.5;
export const SHOOTER_X = COLS;
export const SHOOTER_Y = 18.75;
export const DANGER_Y = 16.55;
export const SPEED = 30;
export const MIN_ANGLE = -Math.PI + 0.26;
export const MAX_ANGLE = -0.26;

const STEP = 1 / 120;
const HIT_R = 1.9;

export type Orb = {
  id: number;
  canon: string;
  a: string;
  b?: string;
  domain: Domain;
  blurb: string;
  special?: Special;
  placedT: number;
};

export type CellRef = { r: number; c: number };

export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
  kind: "spark" | "glyph" | "ring";
  glyph?: string;
};

export type Floater = {
  x: number;
  y: number;
  text: string;
  life: number;
  max: number;
  color: string;
};

export type Falling = {
  orb: Orb;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
};

export type Drift = {
  orb: Orb;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
};

export type Shot = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  orb: Orb;
  age: number;
};

type Hit =
  | { kind: "bubble"; r: number; c: number; x: number; y: number }
  | { kind: "ceiling"; x: number; y: number }
  | { kind: "miss" };

export type CodexGroup = {
  canon: string;
  items: { a: string; b?: string; domain: Domain }[];
};

export type OrbView = {
  a: string;
  b?: string;
  domain: Domain;
  special?: Special;
  blurb: string;
  canon: string;
};

export type Hud = {
  phase: Game["phase"];
  blind: boolean;
  score: number;
  best: number;
  newBest: boolean;
  wave: number;
  levelScore: number;
  clearSeq: number;
  clearLevel: number;
  clearScore: number;
  combo: number;
  shotsLeft: number;
  shotsPerDrop: number;
  banner: string;
  mute: boolean;
  shake: boolean;
  current: OrbView;
  next: OrbView;
  codex: CodexGroup[];
  ready: boolean;
};

export type Game = {
  phase: "menu" | "play" | "pause" | "over";
  blind: boolean;
  wave: number;
  score: number;
  best: number;
  newBest: boolean;
  levelScore: number;
  clearSeq: number;
  clearLevel: number;
  clearScore: number;
  combo: number;
  comboTimer: number;
  shotsLeft: number;
  shotsPerDrop: number;
  parity: number;
  shift: number;
  grid: (Orb | null)[][];
  pool: ProblemDef[];
  canons: string[];
  current: Orb;
  next: Orb;
  angle: number;
  shot: Shot | null;
  falling: Falling[];
  particles: Particle[];
  floaters: Floater[];
  drift: Drift[];
  trauma: number;
  freeze: number;
  flash: number;
  cooldown: number;
  waveDelay: number;
  recoil: number;
  banner: string;
  bannerT: number;
  t: number;
  acc: number;
  uid: number;
  mute: boolean;
  shake: boolean;
  reduced: boolean;
  hoverCanon: string | null;
  preview: CellRef[];
  previewLand: { x: number; y: number } | null;
  aimPath: { x: number; y: number }[];
  boardSig: string;
  keys: { left: boolean; right: boolean };
};

type SfxName = "shoot" | "stick" | "pop" | "fall" | "drop" | "wave" | "over" | "ui";

let playSfx: (name: SfxName, pitch?: number) => void = () => {};

export function setSfx(fn: (name: SfxName, pitch?: number) => void) {
  playSfx = fn;
}

function blankOrb(): Orb {
  return {
    id: 0,
    canon: "4",
    a: "2²",
    domain: "arith",
    blurb: "Two squared.",
    placedT: -10,
  };
}

export function createGame(): Game {
  const current = blankOrb();
  const next = { ...blankOrb(), id: 1, a: "3²", canon: "9", blurb: "Three squared." };
  return {
    phase: "menu",
    blind: false,
    wave: 1,
    score: 0,
    best: 0,
    newBest: false,
    levelScore: 0,
    clearSeq: 0,
    clearLevel: 0,
    clearScore: 0,
    combo: 0,
    comboTimer: 0,
    shotsLeft: 8,
    shotsPerDrop: 8,
    parity: 0,
    shift: 0,
    grid: [],
    pool: problemsFor(1, ["4", "8", "9"]),
    canons: ["4", "8", "9"],
    current,
    next,
    angle: -Math.PI / 2,
    shot: null,
    falling: [],
    particles: [],
    floaters: [],
    drift: [],
    trauma: 0,
    freeze: 0,
    flash: 0,
    cooldown: 0,
    waveDelay: 0,
    recoil: 0,
    banner: "",
    bannerT: 0,
    t: 0,
    acc: 0,
    uid: 2,
    mute: false,
    shake: true,
    reduced: false,
    hoverCanon: null,
    preview: [],
    previewLand: null,
    aimPath: [],
    boardSig: "",
    keys: { left: false, right: false },
  };
}

export function spawnDrift(g: Game) {
  g.drift = [];
  const samples = [0, 4, 8, 12, 16, 20, 24, 28];
  for (let i = 0; i < samples.length; i++) {
    const def = PROBLEMS[samples[i] % PROBLEMS.length];
    g.drift.push({
      orb: {
        id: ++g.uid,
        canon: def.canon,
        a: def.a,
        b: def.b,
        domain: def.domain,
        blurb: def.blurb,
        placedT: -10,
      },
      x: 1.4 + ((i * 1.7) % (WORLD_W - 2.8)),
      y: 2 + ((i * 2.3) % 12),
      vx: (i % 2 === 0 ? 0.35 : -0.28) * (0.6 + (i % 3) * 0.2),
      vy: 0.22 + (i % 4) * 0.06,
      rot: i * 0.4,
      vr: (i % 2 === 0 ? 0.3 : -0.25),
    });
  }
}

function shifted(g: Game, row: number): boolean {
  return ((row + g.parity) & 1) === 1;
}

export function rowLength(g: Game, row: number): number {
  return shifted(g, row) ? COLS - 1 : COLS;
}

export function centerOf(g: Game, row: number, col: number): { x: number; y: number } {
  const x = 1 + col * 2 + (shifted(g, row) ? 1 : 0);
  const y = 1 + row * SQRT3 + g.shift;
  return { x, y };
}

function neighbors(g: Game, row: number, col: number): CellRef[] {
  const deltas = shifted(g, row)
    ? [
        [0, -1],
        [0, 1],
        [-1, 0],
        [-1, 1],
        [1, 0],
        [1, 1],
      ]
    : [
        [0, -1],
        [0, 1],
        [-1, -1],
        [-1, 0],
        [1, -1],
        [1, 0],
      ];
  const out: CellRef[] = [];
  for (const [dr, dc] of deltas) {
    const r = row + dr;
    const c = col + dc;
    if (r < 0 || r >= g.grid.length) continue;
    if (c < 0 || c >= g.grid[r].length) continue;
    out.push({ r, c });
  }
  return out;
}

function resign(g: Game) {
  let s = "";
  for (const row of g.grid) {
    for (const o of row) s += o ? `${o.canon}${o.a}${o.b ?? ""}${o.special ?? ""}` : ".";
    s += "/";
  }
  g.boardSig = s;
}

function pickDef(pool: ProblemDef[], canon?: string): ProblemDef {
  const list = canon ? pool.filter((p) => p.canon === canon) : pool;
  const src = list.length ? list : pool;
  return src[Math.floor(Math.random() * src.length)];
}

function orbFrom(g: Game, def: ProblemDef, special?: Special): Orb {
  if (special === "wild") {
    return {
      id: ++g.uid,
      canon: "∀",
      a: "∀",
      b: "any",
      domain: "const",
      blurb: "Wildcard. Joins the biggest neighboring value and pops at three.",
      special,
      placedT: g.t,
    };
  }
  if (special === "burst") {
    return {
      id: ++g.uid,
      canon: "∇",
      a: "∇",
      b: "burst",
      domain: "geom",
      blurb: "Burst. Pops every bubble it touches.",
      special,
      placedT: g.t,
    };
  }
  if (special === "pulse") {
    return {
      id: ++g.uid,
      canon: "Δ",
      a: "Δp",
      b: "drop",
      domain: "phys",
      blurb: "Impulse. Clears the column beneath the impact.",
      special,
      placedT: g.t,
    };
  }
  return {
    id: ++g.uid,
    canon: def.canon,
    a: def.a,
    b: def.b,
    domain: def.domain,
    blurb: def.blurb,
    placedT: g.t,
  };
}

function canonsPresent(g: Game): string[] {
  const set = new Set<string>();
  for (const row of g.grid) {
    for (const o of row) {
      if (o && !o.special) set.add(o.canon);
    }
  }
  return [...set];
}

function makeOrb(g: Game, allowSpecial: boolean): Orb {
  if (allowSpecial && g.wave >= 2 && Math.random() < 0.1) {
    const roll = Math.random();
    const kind: Special = roll < 0.34 ? "wild" : roll < 0.67 ? "burst" : "pulse";
    return orbFrom(g, g.pool[0], kind);
  }
  const present = canonsPresent(g);
  let pool = g.pool;
  if (present.length && Math.random() < 0.84) {
    const filtered = g.pool.filter((p) => present.includes(p.canon));
    if (filtered.length) pool = filtered;
  }
  return orbFrom(g, pickDef(pool));
}

function paintCanon(g: Game, orb: Orb, canon: string) {
  const def = pickDef(g.pool, canon);
  orb.canon = def.canon;
  orb.a = def.a;
  orb.b = def.b;
  orb.domain = def.domain;
  orb.blurb = def.blurb;
  orb.special = undefined;
}

function floodCanon(g: Game, sr: number, sc: number, canon: string): CellRef[] {
  const out: CellRef[] = [];
  const stack: CellRef[] = [{ r: sr, c: sc }];
  const seen = new Set<string>([`${sr},${sc}`]);
  while (stack.length) {
    const cur = stack.pop()!;
    const o = g.grid[cur.r][cur.c];
    if (!o || o.special || o.canon !== canon) continue;
    out.push(cur);
    for (const n of neighbors(g, cur.r, cur.c)) {
      const k = `${n.r},${n.c}`;
      if (seen.has(k)) continue;
      const nb = g.grid[n.r][n.c];
      if (!nb || nb.special || nb.canon !== canon) continue;
      seen.add(k);
      stack.push(n);
    }
  }
  return out;
}

function breakClusters(g: Game, onlyRow?: number) {
  const canons = [...new Set(g.pool.map((p) => p.canon))];
  for (let pass = 0; pass < 8; pass++) {
    let changed = false;
    for (let r = 0; r < g.grid.length; r++) {
      for (let c = 0; c < g.grid[r].length; c++) {
        const o = g.grid[r][c];
        if (!o || o.special) continue;
        if (onlyRow !== undefined && r !== onlyRow) continue;
        if (floodCanon(g, r, c, o.canon).length < 3) continue;
        let best = o.canon;
        let bestSize = Infinity;
        for (const can of canons) {
          if (can === o.canon) continue;
          const prevA = o.a;
          const prevB = o.b;
          const prevD = o.domain;
          const prevBlurb = o.blurb;
          const prevC = o.canon;
          paintCanon(g, o, can);
          const size = floodCanon(g, r, c, can).length;
          o.canon = prevC;
          o.a = prevA;
          o.b = prevB;
          o.domain = prevD;
          o.blurb = prevBlurb;
          if (size < bestSize) {
            bestSize = size;
            best = can;
          }
        }
        if (best !== o.canon) {
          paintCanon(g, o, best);
          changed = true;
        }
      }
    }
    if (!changed) break;
  }
}

function pushGeneratedRow(g: Game, fill: number) {
  const index = g.grid.length;
  const n = ((index + g.parity) & 1) === 1 ? COLS - 1 : COLS;
  const row: (Orb | null)[] = [];
  for (let c = 0; c < n; c++) {
    row.push(Math.random() < fill ? makeOrb(g, false) : null);
  }
  g.grid.push(row);
}

function deal(g: Game, wave: number) {
  const plan = wavePlan(wave);
  g.wave = wave;
  g.levelScore = 0;
  g.canons = plan.canons;
  g.pool = problemsFor(wave, plan.canons);
  g.shotsPerDrop = plan.shots;
  g.shotsLeft = plan.shots;
  g.parity = 0;
  g.shift = 0;
  g.grid = [];
  g.shot = null;
  g.falling = [];
  g.preview = [];
  g.previewLand = null;
  g.aimPath = [];
  for (let i = 0; i < plan.rows; i++) pushGeneratedRow(g, 1);
  breakClusters(g);
  g.current = makeOrb(g, false);
  g.next = makeOrb(g, true);
  resign(g);
}

export function startGame(g: Game, blind: boolean, level = 1) {
  g.blind = blind;
  g.phase = "play";
  g.score = 0;
  g.newBest = false;
  g.combo = 0;
  g.comboTimer = 0;
  g.waveDelay = 0;
  g.freeze = 0;
  g.angle = -Math.PI / 2;
  const start = Math.max(1, Math.floor(level));
  g.banner = `Level ${start}`;
  g.bannerT = 1.5;
  deal(g, start);
  playSfx("ui");
}

function dropCeiling(g: Game) {
  g.parity ^= 1;
  const n = (g.parity & 1) === 1 ? COLS - 1 : COLS;
  const row: (Orb | null)[] = [];
  for (let c = 0; c < n; c++) row.push(makeOrb(g, false));
  g.grid.unshift(row);
  breakClusters(g, 0);
  g.shift = -SQRT3;
  g.trauma = Math.min(1, g.trauma + 0.24);
  g.banner = "Ceiling drops";
  g.bannerT = 0.9;
  playSfx("drop");
}

function listPops(g: Game, r: number, c: number): CellRef[] {
  const orb = g.grid[r][c];
  if (!orb) return [];
  if (orb.special === "burst") {
    const out: CellRef[] = [{ r, c }];
    for (const n of neighbors(g, r, c)) if (g.grid[n.r][n.c]) out.push(n);
    return out;
  }
  if (orb.special === "pulse") {
    const origin = centerOf(g, r, c);
    const out: CellRef[] = [];
    for (let rr = 0; rr < g.grid.length; rr++) {
      for (let cc = 0; cc < g.grid[rr].length; cc++) {
        if (!g.grid[rr][cc]) continue;
        const p = centerOf(g, rr, cc);
        if (Math.abs(p.x - origin.x) <= 1.15 && p.y >= origin.y - 0.25) out.push({ r: rr, c: cc });
      }
    }
    return out;
  }
  let canon = orb.canon;
  if (orb.special === "wild") {
    const counts = new Map<string, number>();
    for (const n of neighbors(g, r, c)) {
      const o = g.grid[n.r][n.c];
      if (!o || o.special) continue;
      counts.set(o.canon, (counts.get(o.canon) ?? 0) + 1);
    }
    let best = "";
    let bestN = 0;
    for (const [k, v] of counts) {
      if (v > bestN) {
        best = k;
        bestN = v;
      }
    }
    if (!best) return [];
    canon = best;
  }
  const out: CellRef[] = [];
  const stack: CellRef[] = [{ r, c }];
  const seen = new Set<string>([`${r},${c}`]);
  while (stack.length) {
    const cur = stack.pop()!;
    const o = g.grid[cur.r][cur.c];
    if (!o) continue;
    if (o.special !== "wild" && o.canon !== canon) continue;
    out.push(cur);
    for (const n of neighbors(g, cur.r, cur.c)) {
      const k = `${n.r},${n.c}`;
      if (seen.has(k)) continue;
      const nb = g.grid[n.r][n.c];
      if (!nb) continue;
      if (nb.special === "wild" || nb.canon === canon) {
        seen.add(k);
        stack.push(n);
      }
    }
  }
  return out.length >= 3 ? out : [];
}

function listUnanchored(g: Game): CellRef[] {
  const seen = new Set<string>();
  const stack: CellRef[] = [];
  if (g.grid[0]) {
    for (let c = 0; c < g.grid[0].length; c++) {
      if (g.grid[0][c]) {
        stack.push({ r: 0, c });
        seen.add(`0,${c}`);
      }
    }
  }
  while (stack.length) {
    const cur = stack.pop()!;
    for (const n of neighbors(g, cur.r, cur.c)) {
      const k = `${n.r},${n.c}`;
      if (seen.has(k) || !g.grid[n.r][n.c]) continue;
      seen.add(k);
      stack.push(n);
    }
  }
  const out: CellRef[] = [];
  for (let r = 0; r < g.grid.length; r++) {
    for (let c = 0; c < g.grid[r].length; c++) {
      if (g.grid[r][c] && !seen.has(`${r},${c}`)) out.push({ r, c });
    }
  }
  return out;
}

function boardEmpty(g: Game): boolean {
  for (const row of g.grid) for (const cell of row) if (cell) return false;
  return true;
}

function crossed(g: Game): boolean {
  for (let r = 0; r < g.grid.length; r++) {
    for (let c = 0; c < g.grid[r].length; c++) {
      if (!g.grid[r][c]) continue;
      if (centerOf(g, r, c).y + 0.92 >= DANGER_Y) return true;
    }
  }
  return false;
}

function bumpBest(g: Game) {
  if (g.score > g.best) {
    g.best = g.score;
    g.newBest = true;
  }
}

function lose(g: Game) {
  g.phase = "over";
  g.shot = null;
  g.banner = "The lattice caught you";
  g.bannerT = 2;
  bumpBest(g);
  playSfx("over");
}

function spawnPop(g: Game, x: number, y: number, color: string, glyph: string) {
  const sparks = g.reduced ? 4 : 9;
  g.particles.push({
    kind: "ring",
    x,
    y,
    vx: 0,
    vy: 0,
    life: 0.42,
    max: 0.42,
    size: 0.35,
    color,
  });
  g.particles.push({
    kind: "glyph",
    x,
    y,
    vx: (Math.random() - 0.5) * 0.7,
    vy: -1.5,
    life: 0.75,
    max: 0.75,
    size: 0.42,
    color: "#f4efe4",
    glyph,
  });
  for (let i = 0; i < sparks; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = 1.2 + Math.random() * 3.2;
    g.particles.push({
      kind: "spark",
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s - 0.4,
      life: 0.32 + Math.random() * 0.28,
      max: 0.6,
      size: 0.07 + Math.random() * 0.1,
      color,
    });
  }
  if (g.particles.length > 340) g.particles.splice(0, g.particles.length - 340);
}

function removeCell(g: Game, r: number, c: number, mode: "pop" | "fall") {
  const orb = g.grid[r][c];
  if (!orb) return;
  const p = centerOf(g, r, c);
  g.grid[r][c] = null;
  if (mode === "pop") {
    spawnPop(g, p.x, p.y, "#e4b15a", orb.a);
  } else {
    g.falling.push({
      orb,
      x: p.x,
      y: p.y,
      vx: (Math.random() - 0.5) * 1.4,
      vy: 0.2 + Math.random() * 0.4,
      rot: 0,
      vr: (Math.random() - 0.5) * 2.4,
    });
  }
}

function landingCell(g: Game, x: number, y: number, hit: CellRef | "ceiling"): CellRef | null {
  const cand: { r: number; c: number; d: number }[] = [];
  const consider = (r: number, c: number) => {
    if (r < 0 || r >= g.grid.length) return;
    if (c < 0 || c >= g.grid[r].length) return;
    if (g.grid[r][c]) return;
    const p = centerOf(g, r, c);
    const dx = p.x - x;
    const dy = p.y - y;
    cand.push({ r, c, d: dx * dx + dy * dy });
  };
  if (hit === "ceiling") {
    if (g.grid[0]) for (let c = 0; c < g.grid[0].length; c++) consider(0, c);
    if (!cand.length && g.grid[1]) for (let c = 0; c < g.grid[1].length; c++) consider(1, c);
  } else {
    for (const n of neighbors(g, hit.r, hit.c)) consider(n.r, n.c);
    if (!cand.length) {
      const seen = new Set<string>();
      for (const n of neighbors(g, hit.r, hit.c)) {
        for (const n2 of neighbors(g, n.r, n.c)) {
          const k = `${n2.r},${n2.c}`;
          if (seen.has(k)) continue;
          seen.add(k);
          consider(n2.r, n2.c);
        }
      }
    }
  }
  if (!cand.length) return null;
  cand.sort((a, b) => a.d - b.d);
  if (cand[0].d > 10) return null;
  return { r: cand[0].r, c: cand[0].c };
}

function previewClears(g: Game, r: number, c: number): CellRef[] {
  const prev = g.grid[r][c];
  g.grid[r][c] = g.current;
  const pops = listPops(g, r, c);
  if (!pops.length) {
    g.grid[r][c] = prev;
    return [];
  }
  const saved: { r: number; c: number; orb: Orb | null }[] = [];
  for (const p of pops) {
    saved.push({ r: p.r, c: p.c, orb: g.grid[p.r][p.c] });
    g.grid[p.r][p.c] = null;
  }
  const falls = listUnanchored(g);
  for (const s of saved) g.grid[s.r][s.c] = s.orb;
  g.grid[r][c] = prev;
  return [...pops, ...falls];
}

function moveBody(
  g: Game,
  b: { x: number; y: number; vx: number; vy: number },
  dt: number,
): Hit | null {
  const speed = Math.hypot(b.vx, b.vy) || 1;
  const steps = Math.max(1, Math.ceil((speed * dt) / 0.16));
  const h = dt / steps;
  for (let i = 0; i < steps; i++) {
    b.x += b.vx * h;
    b.y += b.vy * h;
    if (b.x < 1) {
      b.x = 1;
      b.vx = Math.abs(b.vx);
    } else if (b.x > WORLD_W - 1) {
      b.x = WORLD_W - 1;
      b.vx = -Math.abs(b.vx);
    }
    if (b.y <= 1 && b.vy < 0) {
      b.y = 1;
      return { kind: "ceiling", x: b.x, y: b.y };
    }
    for (let r = 0; r < g.grid.length; r++) {
      const row = g.grid[r];
      for (let c = 0; c < row.length; c++) {
        if (!row[c]) continue;
        const p = centerOf(g, r, c);
        if (Math.abs(p.y - b.y) > 2.5) continue;
        const dx = b.x - p.x;
        const dy = b.y - p.y;
        if (dx * dx + dy * dy <= HIT_R * HIT_R) return { kind: "bubble", r, c, x: b.x, y: b.y };
      }
    }
    if (b.y > WORLD_H + 3) return { kind: "miss" };
  }
  return null;
}

function resolveShot(g: Game, cell: CellRef | null, x: number, y: number) {
  const shot = g.shot;
  if (!shot) return;
  const orb = shot.orb;
  g.shot = null;
  g.cooldown = 0.06;
  if (!cell) {
    g.falling.push({ orb, x, y, vx: shot.vx * 0.1, vy: 0.4, rot: 0, vr: 1 });
    playSfx("stick");
  } else {
    orb.placedT = g.t;
    g.grid[cell.r][cell.c] = orb;
    const pops = listPops(g, cell.r, cell.c);
    if (pops.length) {
      g.combo = g.comboTimer > 0 ? g.combo + 1 : 1;
      g.comboTimer = 2.55;
      let sx = 0;
      let sy = 0;
      const canon = orb.special ? pops.map((p) => g.grid[p.r][p.c]?.canon).find((c) => c && c !== orb.canon) ?? orb.canon : orb.canon;
      for (const p of pops) {
        const pos = centerOf(g, p.r, p.c);
        sx += pos.x;
        sy += pos.y;
        removeCell(g, p.r, p.c, "pop");
      }
      const falls = listUnanchored(g);
      for (const f of falls) removeCell(g, f.r, f.c, "fall");
      const pts = pops.length * 20 * g.combo + falls.length * 45 * g.combo;
      g.score += pts;
      g.levelScore += pts;
      bumpBest(g);
      g.freeze = pops.length + falls.length >= 7 ? 0.075 : 0.042;
      g.trauma = Math.min(1, g.trauma + Math.min(0.62, 0.18 + pops.length * 0.04));
      g.flash = Math.min(0.22, 0.08 + pops.length * 0.012);
      const cx = sx / pops.length;
      const cy = sy / pops.length;
      g.floaters.push({
        x: cx,
        y: cy,
        text: `= ${canon}`,
        life: 0.9,
        max: 0.9,
        color: "#f3d7a1",
      });
      g.floaters.push({
        x: cx + 0.15,
        y: cy + 0.7,
        text: `+${pts}`,
        life: 0.85,
        max: 0.85,
        color: "#f4efe4",
      });
      if (g.combo >= 2) {
        g.floaters.push({
          x: cx,
          y: cy - 0.8,
          text: `×${g.combo}`,
          life: 0.7,
          max: 0.7,
          color: "#e4b15a",
        });
      }
      playSfx("pop", g.combo);
      if (falls.length) playSfx("fall");
    } else {
      playSfx("stick");
      g.trauma = Math.min(1, g.trauma + 0.05);
    }
  }
  g.shotsLeft -= 1;
  if (boardEmpty(g)) {
    const bonus = 500 * g.wave;
    g.score += bonus;
    g.levelScore += bonus;
    g.clearSeq += 1;
    g.clearLevel = g.wave;
    g.clearScore = g.levelScore;
    bumpBest(g);
    g.waveDelay = 1.2;
    g.banner = `Field clear  +${bonus}`;
    g.bannerT = 1.2;
    g.floaters.push({
      x: SHOOTER_X,
      y: 8,
      text: `+${bonus}`,
      life: 1.1,
      max: 1.1,
      color: "#f3d7a1",
    });
    playSfx("wave");
  } else if (g.shotsLeft <= 0 && g.phase === "play") {
    g.shotsLeft = g.shotsPerDrop;
    dropCeiling(g);
  }
  if (g.phase === "play" && crossed(g)) lose(g);
  resign(g);
}

function updatePreview(g: Game) {
  if (g.phase !== "play" || g.shot || g.waveDelay > 0 || g.grid.length === 0) {
    g.aimPath = [];
    g.preview = [];
    g.previewLand = null;
    return;
  }
  const b = {
    x: SHOOTER_X,
    y: SHOOTER_Y,
    vx: Math.cos(g.angle) * SPEED,
    vy: Math.sin(g.angle) * SPEED,
  };
  const path: { x: number; y: number }[] = [{ x: b.x, y: b.y }];
  let hit: Hit | null = null;
  for (let i = 0; i < 240 && !hit; i++) {
    hit = moveBody(g, b, 0.016);
    if (i % 2 === 0) path.push({ x: b.x, y: b.y });
  }
  g.aimPath = path;
  if (!hit || hit.kind === "miss") {
    g.preview = [];
    g.previewLand = null;
    return;
  }
  const cell = landingCell(g, hit.x, hit.y, hit.kind === "ceiling" ? "ceiling" : { r: hit.r, c: hit.c });
  if (!cell) {
    g.preview = [];
    g.previewLand = null;
    return;
  }
  g.previewLand = centerOf(g, cell.r, cell.c);
  g.preview = g.blind ? [] : previewClears(g, cell.r, cell.c);
}

function physics(g: Game, dt: number) {
  if (g.phase === "play" && !g.shot) {
    const rate = 1.45;
    if (g.keys.left) g.angle -= rate * dt;
    if (g.keys.right) g.angle += rate * dt;
    if (g.angle < MIN_ANGLE) g.angle = MIN_ANGLE;
    if (g.angle > MAX_ANGLE) g.angle = MAX_ANGLE;
  }
  if (g.cooldown > 0) g.cooldown = Math.max(0, g.cooldown - dt);
  if (g.comboTimer > 0) {
    g.comboTimer -= dt;
    if (g.comboTimer <= 0) {
      g.comboTimer = 0;
      g.combo = 0;
    }
  }
  if (g.shift !== 0) {
    g.shift += (0 - g.shift) * (1 - Math.exp(-9 * dt));
    if (Math.abs(g.shift) < 0.012) g.shift = 0;
  }
  if (g.waveDelay > 0) {
    g.waveDelay -= dt;
    if (g.waveDelay <= 0) {
      g.waveDelay = 0;
      if (g.phase === "play") {
        deal(g, g.wave + 1);
        g.banner = `Level ${g.wave}`;
        g.bannerT = 1.3;
      }
    }
  }
  if (g.shot && g.phase === "play") {
    g.shot.age += dt;
    const hit = g.shot.age > 3.2 ? ({ kind: "miss" } as Hit) : moveBody(g, g.shot, dt);
    if (hit) {
      const x = g.shot.x;
      const y = g.shot.y;
      const cell =
        hit.kind === "miss"
          ? null
          : landingCell(g, hit.x, hit.y, hit.kind === "ceiling" ? "ceiling" : { r: hit.r, c: hit.c });
      resolveShot(g, cell, x, y);
    }
  }
  const grav = 28;
  for (let i = g.falling.length - 1; i >= 0; i--) {
    const f = g.falling[i];
    f.vy += grav * dt;
    f.x += f.vx * dt;
    f.y += f.vy * dt;
    f.rot += f.vr * dt;
    if (f.x < 1) {
      f.x = 1;
      f.vx = Math.abs(f.vx) * 0.8;
    } else if (f.x > WORLD_W - 1) {
      f.x = WORLD_W - 1;
      f.vx = -Math.abs(f.vx) * 0.8;
    }
    if (f.y > SHOOTER_Y + 0.3) {
      spawnPop(g, f.x, Math.min(f.y, SHOOTER_Y), "#f4efe4", f.orb.a);
      g.falling.splice(i, 1);
    }
  }
  if (g.falling.length > 1) {
    for (let i = 0; i < g.falling.length; i++) {
      for (let j = i + 1; j < g.falling.length; j++) {
        const a = g.falling[i];
        const b = g.falling[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > 0.0001 && d2 < 3.6) {
          const d = Math.sqrt(d2);
          const overlap = (1.9 - d) / 2;
          const nx = dx / d;
          const ny = dy / d;
          a.x -= nx * overlap;
          a.y -= ny * overlap;
          b.x += nx * overlap;
          b.y += ny * overlap;
          const push = 1.2;
          a.vx -= nx * push;
          a.vy -= ny * push;
          b.vx += nx * push;
          b.vy += ny * push;
        }
      }
    }
  }
  if (g.phase === "menu" || g.phase === "over") {
    for (const d of g.drift) {
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      d.rot += d.vr * dt;
      if (d.x < 1.2 || d.x > WORLD_W - 1.2) d.vx *= -1;
      if (d.y < 1.4 || d.y > 15.5) d.vy *= -1;
    }
  }
}

function present(g: Game, dt: number) {
  if (g.recoil > 0) g.recoil = Math.max(0, g.recoil - dt * 3.2);
  if (g.flash > 0) g.flash = Math.max(0, g.flash - dt * 0.7);
  for (let i = g.particles.length - 1; i >= 0; i--) {
    const p = g.particles[i];
    p.life -= dt;
    if (p.kind !== "ring") {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += (p.kind === "glyph" ? 0.35 : 2.2) * dt;
    }
    if (p.life <= 0) g.particles.splice(i, 1);
  }
  for (let i = g.floaters.length - 1; i >= 0; i--) {
    const f = g.floaters[i];
    f.life -= dt;
    f.y -= dt * 0.85;
    if (f.life <= 0) g.floaters.splice(i, 1);
  }
}

export function step(g: Game, dtIn: number) {
  const dt = Math.min(0.05, Math.max(0, dtIn));
  g.t += dt;
  if (g.bannerT > 0) g.bannerT = Math.max(0, g.bannerT - dt);
  const shakeOn = g.shake && !g.reduced;
  g.trauma = Math.max(0, g.trauma - dt * (shakeOn ? 1.65 : 4));
  if (g.phase === "pause") {
    present(g, dt);
    return;
  }
  if (g.freeze > 0) {
    g.freeze = Math.max(0, g.freeze - dt);
    present(g, dt * 0.15);
    return;
  }
  present(g, dt);
  g.acc += dt;
  let n = 0;
  while (g.acc >= STEP && n++ < 6) {
    physics(g, STEP);
    g.acc -= STEP;
    if (g.freeze > 0) break;
  }
  if (g.phase === "play") updatePreview(g);
}

export function aimAt(g: Game, x: number, y: number) {
  if (g.phase !== "play" || g.shot) return;
  const dx = x - SHOOTER_X;
  const dy = y - SHOOTER_Y;
  if (dx * dx + dy * dy < 0.2) return;
  let a = Math.atan2(dy, dx);
  if (a > 0) a = a < Math.PI / 2 ? MAX_ANGLE : MIN_ANGLE;
  else a = Math.max(MIN_ANGLE, Math.min(MAX_ANGLE, a));
  g.angle = a;
}

export function nudge(g: Game, dir: -1 | 1) {
  if (g.phase !== "play" || g.shot) return;
  g.angle = Math.max(MIN_ANGLE, Math.min(MAX_ANGLE, g.angle + dir * 0.07));
}

export function shoot(g: Game): boolean {
  if (g.phase !== "play" || g.shot || g.freeze > 0 || g.waveDelay > 0 || g.cooldown > 0) return false;
  if (!g.grid.length) return false;
  g.shot = {
    x: SHOOTER_X,
    y: SHOOTER_Y,
    vx: Math.cos(g.angle) * SPEED,
    vy: Math.sin(g.angle) * SPEED,
    orb: g.current,
    age: 0,
  };
  g.current = g.next;
  g.next = makeOrb(g, true);
  g.recoil = 1;
  g.preview = [];
  g.previewLand = null;
  playSfx("shoot");
  return true;
}

export function toMenu(g: Game) {
  g.phase = "menu";
  g.shot = null;
  g.falling = [];
  g.particles = [];
  g.floaters = [];
  g.preview = [];
  g.previewLand = null;
  g.aimPath = [];
  g.banner = "";
  g.bannerT = 0;
  g.waveDelay = 0;
  g.freeze = 0;
  if (!g.drift.length) spawnDrift(g);
}

export function togglePause(g: Game) {
  if (g.phase === "play") g.phase = "pause";
  else if (g.phase === "pause") g.phase = "play";
}

export function setBlind(g: Game, blind: boolean) {
  g.blind = blind;
  if (blind) g.preview = [];
}

export function viewOf(orb: Orb): OrbView {
  return {
    a: orb.a,
    b: orb.b,
    domain: orb.domain,
    special: orb.special,
    blurb: orb.blurb,
    canon: orb.canon,
  };
}

export function codexOf(g: Game): CodexGroup[] {
  if (g.blind || g.phase === "menu") return [];
  const map = new Map<string, CodexGroup["items"]>();
  for (const row of g.grid) {
    for (const o of row) {
      if (!o || o.special) continue;
      const list = map.get(o.canon) ?? [];
      const key = `${o.a}|${o.b ?? ""}`;
      if (!list.some((item) => `${item.a}|${item.b ?? ""}` === key)) {
        list.push({ a: o.a, b: o.b, domain: o.domain });
      }
      map.set(o.canon, list);
    }
  }
  return [...map.entries()]
    .sort((a, b) => {
      const na = Number(a[0]);
      const nb = Number(b[0]);
      const aNum = !Number.isNaN(na) && a[0] !== "φ" && !a[0].includes("π");
      const bNum = !Number.isNaN(nb) && b[0] !== "φ" && !b[0].includes("π");
      if (aNum && bNum) return na - nb;
      if (aNum) return -1;
      if (bNum) return 1;
      return a[0].localeCompare(b[0]);
    })
    .map(([canon, items]) => ({ canon, items }));
}

export function snapshot(g: Game, ready = true): Hud {
  return {
    phase: g.phase,
    blind: g.blind,
    score: g.score,
    best: g.best,
    newBest: g.newBest,
    wave: g.wave,
    levelScore: g.levelScore,
    clearSeq: g.clearSeq,
    clearLevel: g.clearLevel,
    clearScore: g.clearScore,
    combo: g.combo,
    shotsLeft: g.shotsLeft,
    shotsPerDrop: g.shotsPerDrop,
    banner: g.bannerT > 0 ? g.banner : "",
    mute: g.mute,
    shake: g.shake,
    current: viewOf(g.current),
    next: viewOf(g.next),
    codex: codexOf(g),
    ready,
  };
}

export function domainLabel(domain: Domain): string {
  return DOMAIN_LABEL[domain];
}

export function runSelfCheck(): void {
  const g = createGame();
  startGame(g, false);
  const checkDists = (label: string) => {
    for (let r = 0; r < g.grid.length; r++) {
      if (g.grid[r].length !== rowLength(g, r)) {
        throw new Error(`${label} row ${r} length ${g.grid[r].length} != ${rowLength(g, r)}`);
      }
      for (let c = 0; c < g.grid[r].length; c++) {
        const p = centerOf(g, r, c);
        for (const n of neighbors(g, r, c)) {
          const q = centerOf(g, n.r, n.c);
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (Math.abs(d - 2) > 1e-6) throw new Error(`${label} dist ${d} ${r},${c}->${n.r},${n.c}`);
        }
      }
    }
  };
  checkDists("deal");
  dropCeiling(g);
  dropCeiling(g);
  checkDists("after drops");
  for (const row of g.grid) for (let c = 0; c < row.length; c++) row[c] = null;
  const mk = (canon: string, a: string): Orb => ({
    id: ++g.uid,
    canon,
    a,
    domain: "arith",
    blurb: "",
    placedT: 0,
  });
  g.grid[0][0] = mk("4", "2²");
  g.grid[0][1] = mk("4", "√16");
  g.grid[0][2] = mk("4", "8÷2");
  g.grid[0][3] = mk("9", "3²");
  const pops = listPops(g, 0, 2);
  if (pops.length !== 3) throw new Error(`expected 3-match, got ${pops.length}`);
  const isolated = listPops(g, 0, 3);
  if (isolated.length !== 0) throw new Error("singleton should not pop");
  g.angle = MIN_ANGLE;
  if (Math.cos(g.angle) >= -0.2) throw new Error("min angle should point left");
  g.angle = MAX_ANGLE;
  if (Math.cos(g.angle) <= 0.2) throw new Error("max angle should point right");
}
