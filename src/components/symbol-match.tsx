import { useEffect, useRef, useState, type ReactNode } from "react";
import { Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { ArcadeExit } from "@/components/mode-switch";
import { LevelGrid } from "@/components/level-grid";
import {
  COLS,
  ROWS,
  adjacent,
  createBoard,
  findHint,
  selfCheck,
  trySwap,
  type Grid,
  type Pos,
  type Special,
} from "@/game/match3/engine";
import { SYMBOLS, stageConfig } from "@/game/match3/symbols";
import { loadProgress, noteClear, noteScore, type TrackProgress } from "@/game/progress";
import { playSfx, resumeAudio, setMuted, unlockAudio } from "@/game/sfx";

const SAVE_KEY = "symbol-match-v1";
const GAP = 6;

type Phase = "menu" | "play" | "pause" | "stage" | "over";

type Piece = {
  id: number;
  kind: number;
  special: Special | null;
  r: number;
  c: number;
  dy: number;
  clearing: boolean;
};

type Save = { best: number; bestStage: number; mute: boolean };

function loadSave(): Save {
  const empty = { best: 0, bestStage: 1, mute: false };
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return empty;
    const data = JSON.parse(raw) as Partial<Save>;
    return {
      best: typeof data.best === "number" ? data.best : 0,
      bestStage: typeof data.bestStage === "number" ? data.bestStage : 1,
      mute: Boolean(data.mute),
    };
  } catch {
    return empty;
  }
}

function writeSave(save: Save) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch {
    /* ignore quota */
  }
}

function piecesFrom(grid: Grid): Piece[] {
  const out: Piece[] = [];
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      const tile = grid[r][c];
      if (!tile) continue;
      out.push({ id: tile.id, kind: tile.kind, special: tile.special, r, c, dy: 0, clearing: false });
    }
  }
  return out;
}

function fieldClass(kind: number) {
  return SYMBOLS[kind]?.field === "physics" ? "text-mint" : "text-gold";
}

function samePos(a: Pos | null, b: Pos) {
  return a?.r === b.r && a.c === b.c;
}

export function SymbolMatch({
  active = true,
  onExit,
}: {
  active?: boolean;
  onExit?: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("menu");
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [stage, setStage] = useState(1);
  const [moves, setMoves] = useState(stageConfig(1).moves);
  const [stageScore, setStageScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [best, setBest] = useState(0);
  const [track, setTrack] = useState<TrackProgress>({ best: 0, cleared: 0, scores: [], lastPlayed: 0 });
  const [mute, setMute] = useState(false);
  const [banner, setBanner] = useState("Three of a glyph. Chains pay more.");
  const [combo, setCombo] = useState(1);
  const [bonus, setBonus] = useState(0);
  const [selected, setSelected] = useState<Pos | null>(null);
  const [cursor, setCursor] = useState<Pos>({ r: 0, c: 0 });
  const [hint, setHint] = useState<[Pos, Pos] | null>(null);
  const [learn, setLearn] = useState<number | null>(null);
  const [tile, setTile] = useState(48);
  const [busy, setBusy] = useState(false);
  const [floatText, setFloatText] = useState<{ id: number; text: string } | null>(null);
  const [shake, setShake] = useState(false);
  const [hintEpoch, setHintEpoch] = useState(0);
  const [keysOn, setKeysOn] = useState(false);

  const activeRef = useRef(active);
  const phaseRef = useRef(phase);
  const gridRef = useRef<Grid | null>(null);
  const piecesRef = useRef<Piece[]>([]);
  const lockRef = useRef(false);
  const mounted = useRef(true);
  const reducedRef = useRef(false);
  const tileRef = useRef(tile);
  const boardRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<Pos | null>(null);
  const cursorRef = useRef(cursor);
  const movesRef = useRef(moves);
  const stageRef = useRef(stage);
  const stageScoreRef = useRef(0);
  const totalRef = useRef(0);
  const bestRef = useRef(0);
  const bestStageRef = useRef(1);
  const muteRef = useRef(false);
  const fallGen = useRef(0);
  const floatId = useRef(0);
  const apiRef = useRef({
    start: () => {},
    swap: (_r1: number, _c1: number, _r2: number, _c2: number) => {},
  });

  activeRef.current = active;
  phaseRef.current = phase;
  tileRef.current = tile;
  selectedRef.current = selected;
  cursorRef.current = cursor;
  movesRef.current = moves;
  stageRef.current = stage;
  muteRef.current = mute;

  const setPiecesSync = (next: Piece[]) => {
    piecesRef.current = next;
    setPieces(next);
  };

  const wait = (ms: number) =>
    new Promise((resolve) => {
      window.setTimeout(resolve, reducedRef.current ? Math.min(32, ms) : ms);
    });

  const rememberBest = (score: number, reached: number) => {
    if (score < bestRef.current) return;
    bestRef.current = score;
    bestStageRef.current = reached;
    setBest(score);
    writeSave({ best: score, bestStage: reached, mute: muteRef.current });
  };

  const deal = (nextStage: number, keepTotal: number) => {
    const cfg = stageConfig(nextStage);
    const board = createBoard(cfg.kindCount, Math.random);
    gridRef.current = board;
    setPiecesSync(piecesFrom(board));
    stageRef.current = nextStage;
    setStage(nextStage);
    movesRef.current = cfg.moves;
    setMoves(cfg.moves);
    stageScoreRef.current = 0;
    setStageScore(0);
    totalRef.current = keepTotal;
    setTotal(keepTotal);
    setCombo(1);
    setSelected(null);
    setHint(null);
    setLearn(null);
    setBanner(nextStage === 1 ? "Drag a glyph onto a neighbor." : `Level ${nextStage} · ${cfg.name}.`);
    setPhase("play");
    phaseRef.current = "play";
    setHintEpoch((n) => n + 1);
  };

  const finishSwap = async (a: Pos, b: Pos) => {
    if (lockRef.current || phaseRef.current !== "play") return;
    const grid = gridRef.current;
    if (!grid) return;
    lockRef.current = true;
    setBusy(true);
    setHint(null);
    setSelected(null);
    try {
      const swapVisual = () => {
        setPiecesSync(
          piecesRef.current.map((p) => {
            if (p.r === a.r && p.c === a.c) return { ...p, r: b.r, c: b.c };
            if (p.r === b.r && p.c === b.c) return { ...p, r: a.r, c: a.c };
            return p;
          }),
        );
      };
      swapVisual();
      await wait(120);
      if (!mounted.current) return;
      const cfg = stageConfig(stageRef.current);
      const result = trySwap(grid, a, b, Math.random, cfg.kindCount);
      if (!result.ok) {
        swapVisual();
        playSfx("ui");
        setBanner("That swap doesn't line three up.");
        await wait(120);
        return;
      }
      playSfx("pop");
      movesRef.current -= 1;
      setMoves(movesRef.current);
      for (const beat of result.beats) {
        if (!mounted.current) return;
        if (beat.type === "clear") {
          const created = new Map(beat.created.map((item) => [item.id, item.special]));
          const doomed = new Set(beat.clearedIds);
          setPiecesSync(
            piecesRef.current.map((p) => ({
              ...p,
              special: created.get(p.id) ?? p.special,
              clearing: doomed.has(p.id),
            })),
          );
          stageScoreRef.current += beat.score;
          totalRef.current += beat.score;
          setStageScore(stageScoreRef.current);
          setTotal(totalRef.current);
          setCombo(beat.chain);
          setBanner(beat.banner);
          floatId.current += 1;
          setFloatText({ id: floatId.current, text: `+${beat.score}` });
          if (beat.chain > 1 && !reducedRef.current) {
            setShake(true);
            window.setTimeout(() => setShake(false), 180);
          }
          playSfx("pop", 1 + Math.min(0.4, (beat.chain - 1) * 0.08));
          await wait(170);
        } else {
          const prev = new Map(piecesRef.current.map((p) => [p.id, p]));
          const next: Piece[] = [];
          for (let r = 0; r < beat.cells.length; r++) {
            for (let c = 0; c < beat.cells[0].length; c++) {
              const cell = beat.cells[r][c];
              if (!cell) continue;
              const old = prev.get(cell.id);
              next.push({
                id: cell.id,
                kind: cell.kind,
                special: cell.special,
                r,
                c,
                dy: old || reducedRef.current ? 0 : -(r + 1),
                clearing: false,
              });
            }
          }
          const gen = ++fallGen.current;
          setPiecesSync(next);
          if (!reducedRef.current) {
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                if (!mounted.current || gen !== fallGen.current) return;
                setPiecesSync(piecesRef.current.map((p) => (p.dy ? { ...p, dy: 0 } : p)));
              });
            });
          }
          if (beat.banner) setBanner(beat.banner);
          playSfx("fall");
          await wait(210);
        }
      }
      gridRef.current = result.grid;
      setPiecesSync(piecesFrom(result.grid));
      rememberBest(totalRef.current, stageRef.current);
      const goal = stageConfig(stageRef.current).target;
      if (stageScoreRef.current >= goal) {
        const extra = movesRef.current * 40;
        const levelPoints = stageScoreRef.current + extra;
        const nextTotal = totalRef.current + extra;
        totalRef.current = nextTotal;
        setTotal(nextTotal);
        setBonus(extra);
        setTrack(noteClear("symbols", stageRef.current, levelPoints, nextTotal));
        rememberBest(nextTotal, stageRef.current);
        setPhase("stage");
        phaseRef.current = "stage";
        playSfx("wave");
        setBanner("Stage clear.");
      } else if (movesRef.current <= 0) {
        setTrack(noteScore("symbols", totalRef.current));
        setPhase("over");
        phaseRef.current = "over";
        playSfx("over");
        setBanner("Out of moves.");
      }
    } finally {
      lockRef.current = false;
      if (mounted.current) {
        setBusy(false);
        setHintEpoch((n) => n + 1);
      }
    }
  };

  apiRef.current.start = () => {
    unlockAudio();
    deal(1, 0);
  };
  apiRef.current.swap = (r1, c1, r2, c2) => {
    void finishSwap({ r: r1, c: c1 }, { r: r2, c: c2 });
  };

  useEffect(() => {
    mounted.current = true;
    const save = loadSave();
    setBest(save.best);
    setMute(save.mute);
    bestRef.current = save.best;
    bestStageRef.current = save.bestStage;
    muteRef.current = save.mute;
    const prog = loadProgress();
    setTrack(prog.tracks.symbols);
    if (prog.tracks.symbols.best > save.best) {
      setBest(prog.tracks.symbols.best);
      bestRef.current = prog.tracks.symbols.best;
    }
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const errors = selfCheck();
    if (errors.length) console.error("Symbol Match self-check", errors);

    const onKey = (e: KeyboardEvent) => {
      if (!activeRef.current) return;
      if (e.code === "KeyM") {
        const next = !muteRef.current;
        muteRef.current = next;
        setMute(next);
        setMuted(next);
        writeSave({ best: bestRef.current, bestStage: bestStageRef.current, mute: next });
        return;
      }
      if (e.code === "Escape") {
        if (phaseRef.current === "play" && !lockRef.current) {
          setPhase("pause");
          phaseRef.current = "pause";
        } else if (phaseRef.current === "pause") {
          setPhase("play");
          phaseRef.current = "play";
        }
        return;
      }
      if (phaseRef.current !== "play" || lockRef.current) return;
      setKeysOn(true);
      const cur = cursorRef.current;
      let next = cur;
      if (e.code === "ArrowLeft" || e.code === "KeyA") next = { r: cur.r, c: Math.max(0, cur.c - 1) };
      else if (e.code === "ArrowRight" || e.code === "KeyD") next = { r: cur.r, c: Math.min(COLS - 1, cur.c + 1) };
      else if (e.code === "ArrowUp" || e.code === "KeyW") next = { r: Math.max(0, cur.r - 1), c: cur.c };
      else if (e.code === "ArrowDown" || e.code === "KeyS") next = { r: Math.min(ROWS - 1, cur.r + 1), c: cur.c };
      else if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        const picked = selectedRef.current;
        if (picked && adjacent(picked, cur) && !samePos(picked, cur)) {
          apiRef.current.swap(picked.r, picked.c, cur.r, cur.c);
        } else {
          setSelected(samePos(picked, cur) ? null : cur);
        }
        return;
      } else return;
      e.preventDefault();
      setCursor(next);
      cursorRef.current = next;
    };
    window.addEventListener("keydown", onKey);
    const onVis = () => {
      if (document.visibilityState === "visible") resumeAudio();
    };
    document.addEventListener("visibilitychange", onVis);
    window.__matchTest = {
      start: () => apiRef.current.start(),
      swap: (r1, c1, r2, c2) => apiRef.current.swap(r1, c1, r2, c2),
      phase: () => phaseRef.current,
      score: () => totalRef.current,
      moves: () => movesRef.current,
      stage: () => stageRef.current,
      busy: () => lockRef.current,
      grid: () => gridRef.current?.map((row) => row.map((cell) => (cell ? cell.kind : -1))) ?? [],
      hint: () => (gridRef.current ? findHint(gridRef.current) : null),
    };
    return () => {
      mounted.current = false;
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVis);
      delete window.__matchTest;
    };
  }, []);

  useEffect(() => {
    if (active) setMuted(muteRef.current);
  }, [active]);

  useEffect(() => {
    if (!active || phase !== "play" || busy) return;
    const id = window.setTimeout(() => {
      const grid = gridRef.current;
      if (!grid || lockRef.current) return;
      setHint(findHint(grid));
    }, 7000);
    return () => window.clearTimeout(id);
  }, [active, phase, busy, hintEpoch]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w < 48 || h < 48) return;
      const byW = Math.floor((w - GAP * (COLS - 1)) / COLS);
      const byH = Math.floor((h - GAP * (ROWS - 1)) / ROWS);
      setTile(Math.max(34, Math.min(64, byW, byH)));
    };
    measure();
    const obs = new ResizeObserver(measure);
    obs.observe(el);
    return () => obs.disconnect();
  }, [phase, active]);

  const cfg = stageConfig(stage);
  const stride = tile + GAP;
  const boardW = COLS * tile + GAP * (COLS - 1);
  const boardH = ROWS * tile + GAP * (ROWS - 1);

  const posFrom = (clientX: number, clientY: number): Pos | null => {
    const el = boardRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    if (x < 0 || y < 0 || x >= rect.width || y >= rect.height) return null;
    return {
      r: Math.min(ROWS - 1, Math.max(0, Math.floor(y / stride))),
      c: Math.min(COLS - 1, Math.max(0, Math.floor(x / stride))),
    };
  };

  const drag = useRef<{ r: number; c: number; x: number; y: number; used: boolean } | null>(null);

  const onMute = () => {
    unlockAudio();
    const next = !mute;
    setMute(next);
    muteRef.current = next;
    setMuted(next);
    writeSave({ best: bestRef.current, bestStage: bestStageRef.current, mute: next });
  };

  const progress = Math.min(100, Math.round((stageScore / cfg.target) * 100));

  return (
    <main className="relative flex h-dvh flex-col overflow-hidden bg-ink text-cream">
      <header className="flex shrink-0 flex-col gap-2 border-b border-line px-3 py-2 sm:px-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-gold/50 bg-panel font-mono text-lg text-gold">
              Σ
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-base font-extrabold leading-none tracking-tight sm:text-lg">Symbol Match</h1>
              <p className="mt-1 font-mono text-xs text-mist">
                {phase === "menu" ? "Math and physics glyphs" : `Level ${stage}${stage > cfg.total ? " · apex" : ` / ${cfg.total}`}`}
                {combo >= 2 && phase === "play" ? <span className="ml-2 text-gold">×{combo}</span> : null}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`text-right ${phase === "menu" ? "max-sm:hidden" : ""}`}>
              <div className="font-mono text-xl leading-none font-semibold text-gold tabular-nums">{total}</div>
              <div className="mt-1 font-mono text-xs text-mist tabular-nums">best {best}</div>
            </div>
            {onExit ? <ArcadeExit onExit={onExit} /> : null}
            <button
              type="button"
              onClick={onMute}
              className="grid size-11 place-items-center rounded-full border border-line bg-panel"
              aria-label={mute ? "Unmute" : "Mute"}
            >
              {mute ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            </button>
            {phase === "play" || phase === "pause" ? (
              <button
                type="button"
                onClick={() => {
                  const next = phase === "pause" ? "play" : "pause";
                  if (next === "pause" && lockRef.current) return;
                  setPhase(next);
                  phaseRef.current = next;
                }}
                className="grid size-11 place-items-center rounded-full border border-line bg-panel"
                aria-label={phase === "pause" ? "Resume" : "Pause"}
              >
                {phase === "pause" ? <Play className="size-4" /> : <Pause className="size-4" />}
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-72 shrink-0 flex-col gap-3 overflow-y-auto border-r border-line bg-panel/80 p-4 lg:flex">
          <Codex kindCount={cfg.kindCount} learn={learn} onLearn={setLearn} />
        </aside>

        <section className="relative flex min-w-0 flex-1 flex-col">
          {phase === "menu" ? (
            <div className="flex flex-1 items-center justify-center p-4">
              <div className="max-h-full w-full max-w-md overflow-y-auto rounded-2xl border border-line bg-panel/90 p-6 shadow-2xl">
                <p className="font-mono text-xs tracking-widest text-gold">GLYPH LATTICE</p>
                <h2 className="mt-2 text-4xl font-extrabold tracking-tight">Match the symbols.</h2>
                <p className="mt-3 text-sm leading-relaxed text-mist">
                  Sixteen levels of real math and physics glyphs. Line up three, and the lattice tells you what you just cleared.
                </p>
                <div className="mt-4 flex justify-center gap-3 font-mono text-3xl">
                  {SYMBOLS.slice(0, 5).map((symbol) => (
                    <span key={symbol.id} className={symbol.field === "physics" ? "text-mint" : "text-gold"}>
                      {symbol.glyph}
                    </span>
                  ))}
                </div>
                <ul className="mt-4 space-y-2 text-sm leading-relaxed">
                  <li>Drag a glyph onto a neighbor, or tap two that touch. Arrows move, Space picks up and drops.</li>
                  <li>Four in a line forges a row or column clearer. Five forges a nova. An L or a T forges a burst.</li>
                  <li>Swap a nova into a glyph to wipe that glyph. Chains multiply. Hit the proof target before moves run out.</li>
                </ul>
                <p className="mt-4 font-mono text-xs text-mist">
                  Cleared {track.cleared}
                  {track.cleared > cfg.total ? "" : ` / ${cfg.total}`}
                  {Math.max(best, track.best) > 0 ? ` · best ${Math.max(best, track.best)}` : ""}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    unlockAudio();
                    deal(Math.max(1, track.cleared + 1), 0);
                  }}
                  className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold text-base font-extrabold text-ink"
                >
                  <Play className="size-4" />
                  {track.cleared > 0 ? `Continue · ${track.cleared + 1}` : "Play"}
                </button>
                <div className="mt-3">
                  <LevelGrid
                    count={cfg.total}
                    cleared={track.cleared}
                    scores={track.scores}
                    onPlay={(n) => {
                      unlockAudio();
                      deal(n, 0);
                    }}
                  />
                </div>
                {track.cleared >= cfg.total ? <p className="mt-2 text-xs text-mist">Apex levels continue after {cfg.total}.</p> : null}
              </div>
            </div>
          ) : (
            <>
              <div className="mx-auto w-full max-w-md px-3 pt-2">
                <div className="flex items-baseline justify-between gap-3 font-mono text-xs text-mist">
                  <span>
                    Proof {stageScore} / {cfg.target}
                  </span>
                  <span className={moves <= 3 ? "text-danger" : ""}>{moves} moves</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-line" aria-hidden>
                  <div className="h-full bg-gold" style={{ width: `${progress}%` }} />
                </div>
                <div className="mt-2 flex gap-2 overflow-x-auto pb-1 lg:hidden">
                  {SYMBOLS.slice(0, cfg.kindCount).map((symbol, index) => (
                    <button
                      key={symbol.id}
                      type="button"
                      onClick={() => setLearn((cur) => (cur === index ? null : index))}
                      className={
                        learn === index
                          ? "min-h-11 shrink-0 rounded-full border border-gold bg-ink px-3 font-mono text-lg text-gold"
                          : "min-h-11 shrink-0 rounded-full border border-line bg-ink px-3 font-mono text-lg"
                      }
                      aria-label={symbol.name}
                      aria-pressed={learn === index}
                    >
                      <span className={fieldClass(index)}>{symbol.glyph}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div ref={wrapRef} className="flex min-h-0 flex-1 items-center justify-center px-2">
                <div className="relative">
                  {floatText ? (
                    <div className="pointer-events-none absolute -top-7 right-0 left-0 z-20 flex justify-center">
                      <span key={floatText.id} className="score-float font-mono text-lg text-gold">
                        {floatText.text}
                      </span>
                    </div>
                  ) : null}
                  <div
                    ref={boardRef}
                    role="grid"
                    tabIndex={0}
                    aria-label="Symbol match board. Drag a glyph onto a neighbor to swap."
                    aria-busy={busy}
                    className={`relative touch-none overflow-hidden rounded-2xl select-none ${shake ? "lattice-shake" : ""}`}
                    style={{ width: boardW, height: boardH }}
                    onPointerDown={(e) => {
                      if (phaseRef.current !== "play" || lockRef.current) return;
                      const pos = posFrom(e.clientX, e.clientY);
                      if (!pos) return;
                      unlockAudio();
                      e.currentTarget.setPointerCapture(e.pointerId);
                      drag.current = { r: pos.r, c: pos.c, x: e.clientX, y: e.clientY, used: false };
                      setHint(null);
                    }}
                    onPointerMove={(e) => {
                      const origin = drag.current;
                      if (!origin || origin.used || lockRef.current) return;
                      const dx = e.clientX - origin.x;
                      const dy = e.clientY - origin.y;
                      if (Math.hypot(dx, dy) < Math.max(18, tileRef.current * 0.38)) return;
                      const target =
                        Math.abs(dx) > Math.abs(dy)
                          ? { r: origin.r, c: origin.c + Math.sign(dx) }
                          : { r: origin.r + Math.sign(dy), c: origin.c };
                      if (target.r < 0 || target.c < 0 || target.r >= ROWS || target.c >= COLS) return;
                      origin.used = true;
                      void finishSwap({ r: origin.r, c: origin.c }, target);
                    }}
                    onPointerUp={() => {
                      const origin = drag.current;
                      drag.current = null;
                      if (!origin || origin.used || lockRef.current || phaseRef.current !== "play") return;
                      const pos = { r: origin.r, c: origin.c };
                      const picked = selectedRef.current;
                      if (picked && adjacent(picked, pos) && !samePos(picked, pos)) {
                        setSelected(null);
                        void finishSwap(picked, pos);
                        return;
                      }
                      setSelected(samePos(picked, pos) ? null : pos);
                      setCursor(pos);
                    }}
                    onPointerCancel={() => {
                      drag.current = null;
                    }}
                  >
                    {pieces.map((piece) => {
                      const symbol = SYMBOLS[piece.kind];
                      const hinted = hint?.some((p) => p.r === piece.r && p.c === piece.c) ?? false;
                      const isSel = samePos(selected, piece);
                      const isCur = keysOn && cursor.r === piece.r && cursor.c === piece.c;
                      const dim = learn !== null && learn !== piece.kind;
                      return (
                        <div
                          key={piece.id}
                          role="gridcell"
                          aria-selected={isSel}
                          aria-label={`${symbol?.name ?? "Glyph"}${piece.special ? `, ${piece.special}` : ""}`}
                          className={`absolute left-0 top-0 grid place-items-center rounded-xl border bg-panel-2 transition-[transform,opacity] duration-200 ease-out motion-reduce:transition-none ${
                            isSel || hinted ? "border-gold" : "border-line"
                          } ${isCur && !isSel ? "ring-1 ring-mist" : ""}`}
                          style={{
                            width: tile,
                            height: tile,
                            transform: `translate(${piece.c * stride}px, ${(piece.r + piece.dy) * stride}px) scale(${piece.clearing ? 0.2 : 1})`,
                            opacity: piece.clearing ? 0 : dim ? 0.35 : 1,
                            zIndex: isSel ? 2 : 1,
                            fontSize: Math.max(18, Math.floor(tile * 0.46)),
                          }}
                        >
                          <span className={`font-mono leading-none ${fieldClass(piece.kind)}`}>{symbol?.glyph}</span>
                          {piece.special === "row" ? <span className="absolute bottom-1.5 left-1/2 h-1 w-2/3 -translate-x-1/2 rounded-full bg-gold" /> : null}
                          {piece.special === "col" ? <span className="absolute top-1/2 right-1.5 h-2/3 w-1 -translate-y-1/2 rounded-full bg-gold" /> : null}
                          {piece.special === "burst" ? <span className="absolute inset-1 rounded-lg border border-dashed border-gold" /> : null}
                          {piece.special === "nova" ? <span className="absolute inset-1 rounded-full border-2 border-gold" /> : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <p aria-live="polite" className="mx-auto min-h-12 max-w-md px-4 pb-3 text-center text-sm leading-relaxed text-mist">
                {learn !== null && SYMBOLS[learn] ? (
                  <span>
                    <span className={fieldClass(learn)}>{SYMBOLS[learn].glyph} {SYMBOLS[learn].name}. </span>
                    {SYMBOLS[learn].blurb}
                  </span>
                ) : (
                  banner
                )}
              </p>
            </>
          )}

          {phase === "pause" ? (
            <Overlay kicker="Paused" title="The lattice can wait." body="Your moves are still on the board.">
              <button
                type="button"
                onClick={() => {
                  setPhase("play");
                  phaseRef.current = "play";
                }}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold font-extrabold text-ink"
              >
                <Play className="size-4" />
                Resume
              </button>
              <button
                type="button"
                onClick={() => {
                  setPhase("menu");
                  phaseRef.current = "menu";
                }}
                className="mt-2 min-h-11 w-full rounded-xl border border-line font-bold"
              >
                Menu
              </button>
            </Overlay>
          ) : null}

          {phase === "stage" ? (
            <Overlay kicker={`Level ${stage} clear`} title="The proof holds." body={`Bonus ${bonus} for moves left. Total ${total}.`}>
              <button
                type="button"
                onClick={() => deal(stage + 1, totalRef.current)}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold font-extrabold text-ink"
              >
                <Play className="size-4" />
                Next stage
              </button>
            </Overlay>
          ) : null}

          {phase === "over" ? (
            <Overlay kicker={total >= best ? "Best run" : "Out of moves"} title="The lattice closed." body={`Score ${total} · level ${stage}`}>
              <button
                type="button"
                onClick={() => deal(1, 0)}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold font-extrabold text-ink"
              >
                <RotateCcw className="size-4" />
                Play again
              </button>
              <button
                type="button"
                onClick={() => {
                  setPhase("menu");
                  phaseRef.current = "menu";
                }}
                className="mt-2 min-h-11 w-full rounded-xl border border-line font-bold"
              >
                Menu
              </button>
            </Overlay>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function Codex({
  kindCount,
  learn,
  onLearn,
}: {
  kindCount: number;
  learn: number | null;
  onLearn: (kind: number | null) => void;
}) {
  return (
    <div>
      <p className="font-mono text-xs tracking-widest text-gold">SYMBOL BOOK</p>
      <p className="mt-2 text-sm leading-relaxed text-mist">Gold is math. Mint is physics. Tap a glyph to light it on the board.</p>
      <div className="mt-4 space-y-2">
        {SYMBOLS.map((symbol, index) => {
          const locked = index >= kindCount;
          return (
            <button
              key={symbol.id}
              type="button"
              disabled={locked}
              onClick={() => onLearn(learn === index ? null : index)}
              className="flex min-h-11 w-full items-start gap-3 rounded-xl border border-line bg-ink px-3 py-2 text-left disabled:opacity-40"
            >
              <span className={`font-mono text-2xl leading-none ${fieldClass(index)}`}>{symbol.glyph}</span>
              <span>
                <span className="block text-sm font-bold">
                  {symbol.name}
                  <span className="ml-2 font-mono text-xs font-normal text-mist">{symbol.field === "math" ? "Math" : "Physics"}</span>
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-mist">{locked ? "Arrives on a later level." : symbol.blurb}</span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-mist">
        A bar clears that row or column. A dashed box bursts a 3×3. A ring is a nova — swap it into any glyph to clear every copy.
      </p>
    </div>
  );
}

function Overlay({
  kicker,
  title,
  body,
  children,
}: {
  kicker: string;
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-ink/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-panel p-6">
        <p className="font-mono text-xs tracking-widest text-gold">{kicker}</p>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight">{title}</h2>
        <p className="mt-2 text-sm text-mist">{body}</p>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

declare global {
  interface Window {
    __matchTest?: {
      start: () => void;
      swap: (r1: number, c1: number, r2: number, c2: number) => void;
      phase: () => string;
      score: () => number;
      moves: () => number;
      stage: () => number;
      busy: () => boolean;
      grid: () => number[][];
      hint: () => [Pos, Pos] | null;
    };
  }
}
