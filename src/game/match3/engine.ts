import { SYMBOLS } from "./symbols.ts";

export const COLS = 7;
export const ROWS = 8;

export type Special = "row" | "col" | "burst" | "nova";

export type Tile = {
  id: number;
  kind: number;
  special: Special | null;
};

export type Grid = (Tile | null)[][];
export type Pos = { r: number; c: number };
export type Rng = () => number;

export type Beat =
  | {
      type: "clear";
      cells: Grid;
      clearedIds: number[];
      created: { id: number; special: Special }[];
      score: number;
      banner: string;
      chain: number;
    }
  | { type: "fall"; cells: Grid; banner?: string };

export type SwapResult = {
  ok: boolean;
  beats: Beat[];
  score: number;
  grid: Grid;
};

let seq = 1;

export function resetIds(start = 1) {
  seq = start;
}

function makeTile(kind: number, special: Special | null = null): Tile {
  return { id: seq++, kind, special };
}

export function cloneGrid(grid: Grid): Grid {
  return grid.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

function keyOf(r: number, c: number) {
  return `${r},${c}`;
}

function parseKey(key: string): Pos {
  const [r, c] = key.split(",").map(Number);
  return { r, c };
}

export function adjacent(a: Pos, b: Pos) {
  return Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;
}

function inBounds(grid: Grid, r: number, c: number) {
  return r >= 0 && c >= 0 && r < grid.length && c < grid[0].length;
}

function swapCells(grid: Grid, a: Pos, b: Pos) {
  const t = grid[a.r][a.c];
  grid[a.r][a.c] = grid[b.r][b.c];
  grid[b.r][b.c] = t;
}

type Run = { cells: Pos[]; orientation: "h" | "v"; kind: number };

function findRuns(grid: Grid): Run[] {
  const rows = grid.length;
  const cols = grid[0].length;
  const runs: Run[] = [];
  for (let r = 0; r < rows; r++) {
    let c = 0;
    while (c < cols) {
      const tile = grid[r][c];
      if (!tile) {
        c += 1;
        continue;
      }
      let end = c + 1;
      while (end < cols && grid[r][end]?.kind === tile.kind) end += 1;
      if (end - c >= 3) {
        const cells: Pos[] = [];
        for (let i = c; i < end; i++) cells.push({ r, c: i });
        runs.push({ cells, orientation: "h", kind: tile.kind });
      }
      c = end;
    }
  }
  for (let c = 0; c < cols; c++) {
    let r = 0;
    while (r < rows) {
      const tile = grid[r][c];
      if (!tile) {
        r += 1;
        continue;
      }
      let end = r + 1;
      while (end < rows && grid[end][c]?.kind === tile.kind) end += 1;
      if (end - r >= 3) {
        const cells: Pos[] = [];
        for (let i = r; i < end; i++) cells.push({ r: i, c });
        runs.push({ cells, orientation: "v", kind: tile.kind });
      }
      r = end;
    }
  }
  return runs;
}

export type MatchGroup = { cells: Pos[]; kind: number };

export function findGroups(grid: Grid): MatchGroup[] {
  const runs = findRuns(grid);
  const inRun = new Set<string>();
  for (const run of runs) for (const p of run.cells) inRun.add(keyOf(p.r, p.c));
  const seen = new Set<string>();
  const groups: MatchGroup[] = [];
  for (const key of inRun) {
    if (seen.has(key)) continue;
    const start = parseKey(key);
    const tile = grid[start.r][start.c];
    if (!tile) continue;
    const cells: Pos[] = [];
    const queue = [start];
    seen.add(key);
    while (queue.length) {
      const p = queue.pop()!;
      cells.push(p);
      const neighbors = [
        { r: p.r - 1, c: p.c },
        { r: p.r + 1, c: p.c },
        { r: p.r, c: p.c - 1 },
        { r: p.r, c: p.c + 1 },
      ];
      for (const n of neighbors) {
        const nk = keyOf(n.r, n.c);
        if (!inRun.has(nk) || seen.has(nk)) continue;
        const other = grid[n.r]?.[n.c];
        if (!other || other.kind !== tile.kind) continue;
        seen.add(nk);
        queue.push(n);
      }
    }
    groups.push({ cells, kind: tile.kind });
  }
  return groups;
}

function classify(group: MatchGroup, runs: Run[]): Special | null {
  const mine = runs.filter((run) => run.cells.every((p) => group.cells.some((g) => g.r === p.r && g.c === p.c)));
  let maxH = 0;
  let maxV = 0;
  for (const run of mine) {
    if (run.orientation === "h") maxH = Math.max(maxH, run.cells.length);
    else maxV = Math.max(maxV, run.cells.length);
  }
  if (Math.max(maxH, maxV) >= 5) return "nova";
  if (maxH >= 3 && maxV >= 3) return "burst";
  if (maxH >= 4) return "row";
  if (maxV >= 4) return "col";
  return null;
}

function longestRun(group: MatchGroup, runs: Run[]): Pos[] {
  const mine = runs.filter((run) => run.kind === group.kind && run.cells.every((p) => group.cells.some((g) => g.r === p.r && g.c === p.c)));
  mine.sort((a, b) => b.cells.length - a.cells.length);
  return mine[0]?.cells ?? group.cells;
}

function isDirect(grid: Grid, a: Pos, b: Pos) {
  const A = grid[a.r][a.c];
  const B = grid[b.r][b.c];
  if (!A?.special && !B?.special) return false;
  if (A?.special === "nova" || B?.special === "nova") return true;
  return Boolean(A?.special && B?.special);
}

function effectKeys(grid: Grid, pos: Pos, novaKind: number): string[] {
  const tile = grid[pos.r][pos.c];
  if (!tile?.special) return [];
  const keys: string[] = [];
  const rows = grid.length;
  const cols = grid[0].length;
  if (tile.special === "row") {
    for (let c = 0; c < cols; c++) if (grid[pos.r][c]) keys.push(keyOf(pos.r, c));
  } else if (tile.special === "col") {
    for (let r = 0; r < rows; r++) if (grid[r][pos.c]) keys.push(keyOf(r, pos.c));
  } else if (tile.special === "burst") {
    for (let r = pos.r - 1; r <= pos.r + 1; r++) {
      for (let c = pos.c - 1; c <= pos.c + 1; c++) {
        if (inBounds(grid, r, c) && grid[r][c]) keys.push(keyOf(r, c));
      }
    }
  } else {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c]?.kind === novaKind) keys.push(keyOf(r, c));
      }
    }
  }
  return keys;
}

function detonate(grid: Grid, seeds: Pos[], novaKind: Map<string, number>): Set<string> {
  const cleared = new Set<string>();
  const fired = new Set<string>();
  const queue = [...seeds];
  while (queue.length) {
    const pos = queue.pop()!;
    const k = keyOf(pos.r, pos.c);
    const tile = grid[pos.r]?.[pos.c];
    if (!tile || fired.has(k)) continue;
    cleared.add(k);
    if (!tile.special) continue;
    fired.add(k);
    const kind = novaKind.get(k) ?? tile.kind;
    for (const hit of effectKeys(grid, pos, kind)) {
      cleared.add(hit);
      const hp = parseKey(hit);
      const other = grid[hp.r][hp.c];
      if (other?.special && !fired.has(hit)) queue.push(hp);
    }
  }
  return cleared;
}

function specialPhrase(specials: Special[]) {
  if (specials.length === 0) return "";
  const label = (s: Special) =>
    s === "row" ? "a row clearer" : s === "col" ? "a column clearer" : s === "burst" ? "a burst" : "a nova";
  if (specials.length === 1) return ` Forged ${label(specials[0])}.`;
  return " Forged specials.";
}

function bannerFor(grid: Grid, cleared: Set<string>, created: Special[], chain: number) {
  const counts = new Map<number, number>();
  for (const key of cleared) {
    const p = parseKey(key);
    const tile = grid[p.r][p.c];
    if (!tile) continue;
    counts.set(tile.kind, (counts.get(tile.kind) ?? 0) + 1);
  }
  let bestKind = 0;
  let bestN = -1;
  for (const [kind, n] of counts) {
    if (n > bestN) {
      bestN = n;
      bestKind = kind;
    }
  }
  const symbol = SYMBOLS[bestKind] ?? SYMBOLS[0];
  const chainBit = chain > 1 ? `Chain ×${chain}. ` : "";
  return `${chainBit}${symbol.glyph} ${symbol.name} — ${symbol.blurb}${specialPhrase(created)}`;
}

function applyClear(
  grid: Grid,
  cleared: Set<string>,
  transforms: Map<string, Special>,
  chain: number,
): Beat {
  const next = cloneGrid(grid);
  const created: { id: number; special: Special }[] = [];
  const forged: Special[] = [];
  for (const [key, special] of transforms) {
    if (cleared.has(key)) continue;
    const p = parseKey(key);
    const tile = next[p.r][p.c];
    if (!tile) continue;
    tile.special = special;
    created.push({ id: tile.id, special });
    forged.push(special);
  }
  const clearedIds: number[] = [];
  for (const key of cleared) {
    const p = parseKey(key);
    const tile = next[p.r][p.c];
    if (!tile) continue;
    clearedIds.push(tile.id);
    next[p.r][p.c] = null;
  }
  const score = (clearedIds.length * 30 + created.length * 60) * chain;
  return {
    type: "clear",
    cells: next,
    clearedIds,
    created,
    score,
    banner: bannerFor(grid, cleared, forged, chain),
    chain,
  };
}

function gravity(grid: Grid): Grid {
  const rows = grid.length;
  const cols = grid[0].length;
  const next: Grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => null));
  for (let c = 0; c < cols; c++) {
    let write = rows - 1;
    for (let r = rows - 1; r >= 0; r--) {
      const tile = grid[r][c];
      if (!tile) continue;
      next[write][c] = tile;
      write -= 1;
    }
  }
  return next;
}

function refill(grid: Grid, rng: Rng, kindCount: number): Grid {
  const next = cloneGrid(grid);
  for (let r = 0; r < next.length; r++) {
    for (let c = 0; c < next[0].length; c++) {
      if (!next[r][c]) next[r][c] = makeTile(Math.floor(rng() * kindCount));
    }
  }
  return next;
}

function matchClear(grid: Grid, focus: Pos | null, chain: number): Beat | null {
  const groups = findGroups(grid);
  if (groups.length === 0) return null;
  const runs = findRuns(grid);
  const matched = new Set<string>();
  for (const group of groups) for (const p of group.cells) matched.add(keyOf(p.r, p.c));

  const seeds: Pos[] = [];
  for (const key of matched) {
    const p = parseKey(key);
    if (grid[p.r][p.c]?.special) seeds.push(p);
  }
  const detonated = detonate(grid, seeds, new Map());

  const transforms = new Map<string, Special>();
  for (const group of groups) {
    const special = classify(group, runs);
    if (!special) continue;
    const candidates = group.cells.filter((p) => {
      const k = keyOf(p.r, p.c);
      return !detonated.has(k) && !grid[p.r][p.c]?.special;
    });
    if (candidates.length === 0) continue;
    const focusHit = focus && candidates.find((p) => p.r === focus.r && p.c === focus.c);
    const run = longestRun(group, runs);
    const mid = run[Math.floor(run.length / 2)];
    const midHit = candidates.find((p) => p.r === mid.r && p.c === mid.c);
    const anchor = focusHit ?? midHit ?? candidates[Math.floor(candidates.length / 2)];
    transforms.set(keyOf(anchor.r, anchor.c), special);
  }

  const cleared = new Set<string>(detonated);
  for (const key of matched) {
    if (!transforms.has(key)) cleared.add(key);
  }
  return applyClear(grid, cleared, transforms, chain);
}

function directClear(grid: Grid, a: Pos, b: Pos, chain: number): Beat | null {
  if (!isDirect(grid, a, b)) return null;
  const A = grid[a.r][a.c];
  const B = grid[b.r][b.c];
  if (!A || !B) return null;
  if (A.special === "nova" && B.special === "nova") {
    const all = new Set<string>();
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[0].length; c++) if (grid[r][c]) all.add(keyOf(r, c));
    }
    return applyClear(grid, all, new Map(), chain);
  }
  const seeds: Pos[] = [];
  const novaKind = new Map<string, number>();
  if (A.special) seeds.push(a);
  if (B.special) seeds.push(b);
  if (A.special === "nova") novaKind.set(keyOf(a.r, a.c), B.kind);
  if (B.special === "nova") novaKind.set(keyOf(b.r, b.c), A.kind);
  const cleared = detonate(grid, seeds, novaKind);
  cleared.add(keyOf(a.r, a.c));
  cleared.add(keyOf(b.r, b.c));
  return applyClear(grid, cleared, new Map(), chain);
}

function settle(grid: Grid, rng: Rng, kindCount: number) {
  let cells = cloneGrid(grid);
  for (let pass = 0; pass < 12; pass++) {
    if (findGroups(cells).length === 0) break;
    const groups = findGroups(cells);
    for (const group of groups) {
      const p = group.cells[0];
      const current = cells[p.r][p.c]?.kind ?? 0;
      let kind = current;
      for (let t = 0; t < 6; t++) {
        kind = Math.floor(rng() * kindCount);
        if (kind !== current) break;
      }
      cells[p.r][p.c] = makeTile(kind === current ? (kind + 1) % kindCount : kind);
    }
  }
  return cells;
}

export function wouldScore(grid: Grid, a: Pos, b: Pos) {
  if (!adjacent(a, b)) return false;
  if (!grid[a.r]?.[a.c] || !grid[b.r]?.[b.c]) return false;
  swapCells(grid, a, b);
  const ok = isDirect(grid, a, b) || findGroups(grid).length > 0;
  swapCells(grid, a, b);
  return ok;
}

export function hasMove(grid: Grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (c + 1 < cols && wouldScore(grid, { r, c }, { r, c: c + 1 })) return true;
      if (r + 1 < rows && wouldScore(grid, { r, c }, { r: r + 1, c })) return true;
    }
  }
  return false;
}

export function findHint(grid: Grid): [Pos, Pos] | null {
  const rows = grid.length;
  const cols = grid[0].length;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const right = { r, c: c + 1 };
      const down = { r: r + 1, c };
      if (c + 1 < cols && wouldScore(grid, { r, c }, right)) return [{ r, c }, right];
      if (r + 1 < rows && wouldScore(grid, { r, c }, down)) return [{ r, c }, down];
    }
  }
  return null;
}

export function createBoard(kindCount: number, rng: Rng, rows = ROWS, cols = COLS): Grid {
  const count = Math.max(3, kindCount);
  for (let attempt = 0; attempt < 50; attempt++) {
    let grid: Grid = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => makeTile(Math.floor(rng() * count))),
    );
    grid = settle(grid, rng, count);
    if (findGroups(grid).length === 0 && hasMove(grid)) return grid;
  }
  const grid: Grid = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => makeTile((r + c * 2) % count)),
  );
  return findGroups(grid).length === 0 && hasMove(grid) ? grid : settle(grid, rng, count);
}

export function resolveBoard(grid: Grid, rng: Rng, kindCount: number, focus: Pos | null = null): { beats: Beat[]; score: number; grid: Grid } {
  const beats: Beat[] = [];
  let cells = cloneGrid(grid);
  let score = 0;
  let chain = 0;
  for (let guard = 0; guard < 30; guard++) {
    const clear = matchClear(cells, chain === 0 ? focus : null, chain + 1);
    if (!clear || clear.type !== "clear" || clear.clearedIds.length === 0) break;
    chain += 1;
    beats.push(clear);
    score += clear.score;
    const fallen = refill(gravity(clear.cells), rng, kindCount);
    beats.push({ type: "fall", cells: fallen });
    cells = fallen;
  }
  if (findGroups(cells).length > 0) {
    cells = settle(cells, rng, kindCount);
    beats.push({ type: "fall", cells, banner: "The lattice settled." });
  }
  if (!hasMove(cells)) {
    cells = createBoard(kindCount, rng, cells.length, cells[0].length);
    beats.push({ type: "fall", cells, banner: "No moves left. The lattice reshuffled." });
  }
  return { beats, score, grid: cells };
}

export function trySwap(grid: Grid, a: Pos, b: Pos, rng: Rng, kindCount: number): SwapResult {
  if (!adjacent(a, b) || !grid[a.r]?.[a.c] || !grid[b.r]?.[b.c]) {
    return { ok: false, beats: [], score: 0, grid };
  }
  const next = cloneGrid(grid);
  swapCells(next, a, b);
  const direct = directClear(next, a, b, 1);
  if (!direct && findGroups(next).length === 0) {
    return { ok: false, beats: [], score: 0, grid };
  }
  if (direct && direct.type === "clear") {
    const beats: Beat[] = [direct];
    let score = direct.score;
    let cells = refill(gravity(direct.cells), rng, kindCount);
    beats.push({ type: "fall", cells });
    const rest = resolveBoard(cells, rng, kindCount, null);
    const extra = rest.beats;
    beats.push(...extra);
    score += rest.score;
    cells = rest.grid;
    if (!hasMove(cells)) {
      cells = createBoard(kindCount, rng, cells.length, cells[0].length);
      beats.push({ type: "fall", cells, banner: "No moves left. The lattice reshuffled." });
    }
    return { ok: true, beats, score, grid: cells };
  }
  const resolved = resolveBoard(next, rng, kindCount, b);
  if (resolved.beats.length === 0) return { ok: false, beats: [], score: 0, grid };
  return { ok: true, beats: resolved.beats, score: resolved.score, grid: resolved.grid };
}

function safeGrid(kindCount = 5): Grid {
  return Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => makeTile((r * 3 + c) % kindCount)),
  );
}

function paint(grid: Grid, r: number, c: number, kind: number, special: Special | null = null) {
  grid[r][c] = makeTile(kind, special);
}

export function selfCheck(): string[] {
  const errors: string[] = [];
  const eq = (cond: boolean, msg: string) => {
    if (!cond) errors.push(msg);
  };
  try {
    resetIds();
    const plain = safeGrid();
    eq(findGroups(plain).length === 0, "safe grid should not start matched");

    const three = safeGrid();
    paint(three, 0, 0, 4);
    paint(three, 0, 1, 4);
    paint(three, 0, 2, 4);
    const g3 = findGroups(three);
    eq(g3.length === 1 && g3[0].cells.length === 3, `horizontal 3 is one group, got ${g3.map((g) => g.cells.length).join(",")}`);
    const resolved3 = resolveBoard(three, cycleRng([0, 1, 2, 3]), 5);
    const clear3 = resolved3.beats.find((b) => b.type === "clear");
    eq(clear3?.type === "clear" && clear3.clearedIds.length === 3, "horizontal 3 clears 3");
    eq(clear3?.type === "clear" && clear3.created.length === 0, "horizontal 3 forges nothing");
    eq(resolved3.beats.filter((b) => b.type === "clear").length === 1, "horizontal 3 does not cascade on this rng");
    eq(resolved3.score === 90, `3-match scores 90, got ${resolved3.score}`);

    const four = safeGrid();
    for (let c = 0; c < 4; c++) paint(four, 0, c, 3);
    const resolved4 = resolveBoard(four, cycleRng([0, 1, 2, 4]), 5);
    const clear4 = resolved4.beats.find((b) => b.type === "clear");
    eq(clear4?.type === "clear" && clear4.created.length === 1 && clear4.created[0].special === "row", "4-match forges a row");
    eq(clear4?.type === "clear" && clear4.clearedIds.length === 3, "4-match clears the other 3");
    eq(
      clear4?.type === "clear" && clear4.cells.flat().some((t) => t?.special === "row" && clear4.created.some((c) => c.id === t.id)),
      "forged row tile stays on the board",
    );

    const five = safeGrid();
    for (let c = 0; c < 5; c++) paint(five, 2, c, 2);
    const clear5 = resolveBoard(five, () => 0.2, 5).beats.find((b) => b.type === "clear");
    eq(clear5?.type === "clear" && clear5.created.some((s) => s.special === "nova"), "5-match forges a nova");

    const rowB = safeGrid();
    paint(rowB, 4, 2, 4, "row");
    paint(rowB, 4, 3, 4);
    paint(rowB, 4, 4, 4);
    const detonated = resolveBoard(rowB, cycleRng([0, 1, 2]), 5).beats.find((b) => b.type === "clear");
    eq(detonated?.type === "clear" && detonated.clearedIds.length >= 7, `row special should clear its row, got ${detonated?.type === "clear" ? detonated.clearedIds.length : "none"}`);

    const ell = safeGrid();
    paint(ell, 0, 2, 4);
    paint(ell, 1, 2, 4);
    paint(ell, 2, 0, 4);
    paint(ell, 2, 1, 4);
    paint(ell, 2, 2, 4);
    const clearL = resolveBoard(ell, () => 0.2, 5).beats.find((b) => b.type === "clear");
    eq(clearL?.type === "clear" && clearL.created.some((s) => s.special === "burst"), "L forges a burst");

    const vert = safeGrid();
    paint(vert, 4, 3, 1);
    paint(vert, 5, 3, 0);
    paint(vert, 6, 3, 0);
    paint(vert, 7, 3, 0);
    paint(vert, 7, 2, 1);
    paint(vert, 7, 4, 1);
    const beforeAbove = vert[4][3]!.id;
    const casc = resolveBoard(vert, () => 0.4, 5);
    const clears = casc.beats.filter((b) => b.type === "clear");
    eq(clears.length >= 2, `cascade should clear twice, got ${clears.length}`);
    const landed = casc.grid[7][3];
    eq(landed?.id === beforeAbove || clears.length >= 2, "cascade ran");

    const rejected = safeGrid();
    const snapshot = JSON.stringify(rejected);
    const bad = trySwap(rejected, { r: 0, c: 0 }, { r: 0, c: 1 }, () => 0.3, 5);
    if (bad.ok) {
      eq(bad.beats.some((b) => b.type === "clear"), "accepted swap must clear");
    } else {
      eq(JSON.stringify(rejected) === snapshot, "rejected swap must not mutate the grid");
    }
    const far = trySwap(rejected, { r: 0, c: 0 }, { r: 2, c: 2 }, () => 0.3, 5);
    eq(!far.ok, "diagonal swap is illegal");

    const novaBoard = safeGrid();
    paint(novaBoard, 3, 3, 0, "nova");
    paint(novaBoard, 3, 4, 2);
    const novaSwap = trySwap(novaBoard, { r: 3, c: 3 }, { r: 3, c: 4 }, () => 0.15, 5);
    eq(novaSwap.ok, "nova swap should score");
    const leftovers = novaSwap.grid.flat().filter((t) => t?.kind === 2);
    eq(leftovers.length === 0 || novaSwap.score > 0, "nova swap scores");
    const kind2 = novaSwap.grid.flat().some((t) => t?.kind === 2);
    eq(!kind2, "nova swap clears the partner glyph");

    const rng = mulberry32(7);
    for (let i = 0; i < 25; i++) {
      const board = createBoard(5, rng);
      eq(findGroups(board).length === 0, `board ${i} spawned with a match`);
      eq(hasMove(board), `board ${i} spawned with no move`);
      eq(board.length === ROWS && board[0].length === COLS, "board size");
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  } finally {
    resetIds();
  }
  return errors;
}

function cycleRng(kinds: number[]): Rng {
  let i = 0;
  return () => {
    const kind = kinds[i % kinds.length];
    i += 1;
    return (kind + 0.01) / 5;
  };
}

function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
