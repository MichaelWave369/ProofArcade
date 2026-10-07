export type TrackId =
  | "bubbles"
  | "symbols"
  | "equals"
  | "run"
  | "logic"
  | "odds"
  | "slope"
  | "fractions"
  | "primes"
  | "vectors"
  | "angles"
  | "machine"
  | "balance"
  | "area"
  | "motion"
  | "grid"
  | "waves"
  | "orbit";

export type TrackProgress = {
  best: number;
  cleared: number;
  scores: number[];
  lastPlayed: number;
};

export type ArcadeProgress = {
  tracks: Record<TrackId, TrackProgress>;
};

export type ProgressStore = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

const KEY = "proof-arcade-v3";
const PREVIOUS = "proof-arcade-v2";
export const TRACKS: TrackId[] = [
  "bubbles",
  "symbols",
  "equals",
  "run",
  "logic",
  "odds",
  "slope",
  "fractions",
  "primes",
  "vectors",
  "angles",
  "machine",
  "balance",
  "area",
  "motion",
  "grid",
  "waves",
  "orbit",
];

function emptyTrack(): TrackProgress {
  return { best: 0, cleared: 0, scores: [], lastPlayed: 0 };
}

export function emptyProgress(): ArcadeProgress {
  return {
    tracks: {
      bubbles: emptyTrack(),
      symbols: emptyTrack(),
      equals: emptyTrack(),
      run: emptyTrack(),
      logic: emptyTrack(),
      odds: emptyTrack(),
      slope: emptyTrack(),
      fractions: emptyTrack(),
      primes: emptyTrack(),
      vectors: emptyTrack(),
      angles: emptyTrack(),
      machine: emptyTrack(),
      balance: emptyTrack(),
      area: emptyTrack(),
      motion: emptyTrack(),
      grid: emptyTrack(),
      waves: emptyTrack(),
      orbit: emptyTrack(),
    },
  };
}

function browserStore(): ProgressStore | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage;
}

function sanitizeTrack(raw: unknown): TrackProgress {
  const data = raw && typeof raw === "object" ? (raw as Partial<TrackProgress>) : {};
  const scores = Array.isArray(data.scores)
    ? data.scores.map((n) => (typeof n === "number" && n > 0 ? Math.floor(n) : 0))
    : [];
  return {
    best: typeof data.best === "number" && data.best > 0 ? Math.floor(data.best) : 0,
    cleared: typeof data.cleared === "number" && data.cleared > 0 ? Math.floor(data.cleared) : 0,
    scores,
    lastPlayed: typeof data.lastPlayed === "number" && data.lastPlayed > 0 ? Math.floor(data.lastPlayed) : 0,
  };
}

function trackTouched(track: TrackProgress) {
  return track.best > 0 || track.cleared > 0 || track.lastPlayed > 0 || track.scores.some((score) => score > 0);
}

type StoredEnvelope = {
  tracks?: Partial<Record<string, unknown>>;
  waveRename?: boolean;
};

/**
 * The frequency cabinet used to live on the `orbit` id. That id is now the
 * gravity sandbox. Progress moves once, only when `waves` was never written.
 */
function migrateWaveRename(data: StoredEnvelope): { tracks: Partial<Record<string, unknown>>; migrated: boolean } {
  const tracks = { ...(data.tracks ?? {}) };
  if (data.waveRename === true) return { tracks, migrated: false };
  if (!Object.prototype.hasOwnProperty.call(tracks, "waves") && Object.prototype.hasOwnProperty.call(tracks, "orbit")) {
    const carried = sanitizeTrack(tracks.orbit);
    tracks.waves = carried;
    tracks.orbit = emptyTrack();
    if (!trackTouched(carried)) tracks.waves = emptyTrack();
  }
  return { tracks, migrated: true };
}

function parseStored(raw: string | null): { progress: ArcadeProgress; migrated: boolean } | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as StoredEnvelope | null;
    if (!data || typeof data !== "object") return null;
    const moved = migrateWaveRename(data);
    const progress = emptyProgress();
    for (const id of TRACKS) progress.tracks[id] = sanitizeTrack(moved.tracks[id]);
    return { progress, migrated: moved.migrated };
  } catch {
    return null;
  }
}

function readLegacy(store: ProgressStore): ArcadeProgress {
  const progress = emptyProgress();
  try {
    const bubble = JSON.parse(store.getItem("bubble-proof-v1") || "null") as { best?: number } | null;
    if (bubble && typeof bubble.best === "number") progress.tracks.bubbles.best = Math.max(0, Math.floor(bubble.best));
  } catch {
    /* ignore */
  }
  try {
    const symbol = JSON.parse(store.getItem("symbol-match-v1") || "null") as { best?: number; bestStage?: number } | null;
    if (symbol && typeof symbol.best === "number") progress.tracks.symbols.best = Math.max(0, Math.floor(symbol.best));
    if (symbol && typeof symbol.bestStage === "number") {
      progress.tracks.symbols.cleared = Math.max(0, Math.floor(symbol.bestStage) - 1);
    }
  } catch {
    /* ignore */
  }
  return progress;
}

function write(store: ProgressStore, progress: ArcadeProgress) {
  try {
    store.setItem(KEY, JSON.stringify({ waveRename: true, tracks: progress.tracks }));
  } catch {
    /* ignore quota */
  }
}

function copyTrack(track: TrackProgress): TrackProgress {
  return { best: track.best, cleared: track.cleared, scores: [...track.scores], lastPlayed: track.lastPlayed };
}

/** Read v3, else migrate v2, else seed from the original per-game saves. Old keys stay. */
export function loadProgress(store: ProgressStore | null = browserStore()): ArcadeProgress {
  if (!store) return emptyProgress();
  const current = parseStored(store.getItem(KEY));
  if (current) {
    if (current.migrated) write(store, current.progress);
    return current.progress;
  }
  const previous = parseStored(store.getItem(PREVIOUS));
  const seeded = previous?.progress ?? readLegacy(store);
  write(store, seeded);
  return seeded;
}

export function noteScore(
  id: TrackId,
  score: number,
  store: ProgressStore | null = browserStore(),
  now = Date.now(),
): TrackProgress {
  if (!store) return emptyTrack();
  const progress = loadProgress(store);
  const track = progress.tracks[id];
  const next = Math.max(0, Math.floor(score));
  if (next > track.best) track.best = next;
  track.lastPlayed = Math.max(0, Math.floor(now));
  write(store, progress);
  return copyTrack(track);
}

export function noteClear(
  id: TrackId,
  level: number,
  levelScore: number,
  runScore: number,
  store: ProgressStore | null = browserStore(),
  now = Date.now(),
): TrackProgress {
  if (!store) return emptyTrack();
  const progress = loadProgress(store);
  const track = progress.tracks[id];
  const safeLevel = Math.max(1, Math.floor(level));
  const safeLevelScore = Math.max(0, Math.floor(levelScore));
  const safeRun = Math.max(0, Math.floor(runScore));
  track.cleared = Math.max(track.cleared, safeLevel);
  track.best = Math.max(track.best, safeRun, safeLevelScore);
  while (track.scores.length < safeLevel) track.scores.push(0);
  track.scores[safeLevel - 1] = Math.max(track.scores[safeLevel - 1] ?? 0, safeLevelScore);
  track.lastPlayed = Math.max(0, Math.floor(now));
  write(store, progress);
  return copyTrack(track);
}

export function noteVisit(id: TrackId, store: ProgressStore | null = browserStore(), now = Date.now()): TrackProgress {
  if (!store) return emptyTrack();
  const progress = loadProgress(store);
  const track = progress.tracks[id];
  track.lastPlayed = Math.max(track.lastPlayed, Math.max(0, Math.floor(now)));
  write(store, progress);
  return copyTrack(track);
}
