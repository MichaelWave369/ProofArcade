import { useEffect, useRef, useState } from "react";
import { BenchFrame, LevelStrip } from "@/components/bench-frame";
import {
  FORGE_LEVELS,
  applyForge,
  beginForge,
  canSimplifyFrac,
  forgeComplete,
  formatFrac,
  formatGoal,
  sumFracs,
  type ForgeState,
  type Frac,
} from "@/game/fraction/forge";
import { noteClear } from "@/game/progress";

function Piece({
  piece,
  selected,
  locked,
  onClick,
}: {
  piece: Frac;
  selected: boolean;
  locked: boolean;
  onClick: () => void;
}) {
  const width = Math.max(18, Math.round((piece.n / piece.d) * 100));
  return (
    <button
      type="button"
      disabled={locked}
      onClick={onClick}
      style={{ width: `${width}%` }}
      className={`flex h-12 min-w-11 items-center justify-center rounded-lg border font-mono text-xs ${
        selected ? "border-gold bg-gold text-ink" : "border-gold/50 bg-gold/20 text-cream"
      } disabled:opacity-90`}
    >
      {formatFrac(piece)}
    </button>
  );
}

export function FractionForge({ onExit, onQuestions }: { onExit?: () => void; onQuestions?: () => void }) {
  const [levelId, setLevelId] = useState(1);
  const level = FORGE_LEVELS[levelId - 1] ?? FORGE_LEVELS[0];
  const [state, setState] = useState<ForgeState>(() => beginForge(level));
  const [picked, setPicked] = useState<number[]>([]);
  const [run, setRun] = useState(0);
  const scored = useRef(false);

  useEffect(() => {
    scored.current = false;
    setState(beginForge(level));
    setPicked([]);
  }, [level]);

  const done = forgeComplete(level, state);

  useEffect(() => {
    if (!done || scored.current) return;
    scored.current = true;
    const score = 130;
    setRun((total) => {
      const next = total + score;
      noteClear("fractions", level.id, score, next);
      return next;
    });
  }, [done, level.id]);

  function commit(next: ForgeState | null) {
    if (!next || done) return;
    setState(next);
    setPicked([]);
  }

  const one = picked.length === 1 ? picked[0] : -1;
  const canHalve = one >= 0 && state.board[one];
  const canReduce = canHalve && canSimplifyFrac(state.board[one]);
  const canJoin = picked.length >= 2;

  return (
    <BenchFrame kicker="FRACTION FORGE" title={level.title} meta={`${level.id}/16`} onExit={onExit} onQuestions={onQuestions}>
      <LevelStrip count={FORGE_LEVELS.length} current={level.id} onPick={setLevelId} />
      <p className="text-sm text-mist">{level.blurb}</p>
      <p className="mt-1 font-mono text-sm text-gold">{formatGoal(level.goal)}</p>
      <section className="mt-3">
        <p className="font-mono text-xs tracking-widest text-mist">TRAY</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {state.tray.length === 0 ? <p className="text-sm text-mist">Empty.</p> : null}
          {state.tray.map((piece, index) => (
            <Piece key={`tray-${index}-${formatFrac(piece)}`} piece={piece} selected={false} locked={done} onClick={() => commit(applyForge(state, { t: "place", index }))} />
          ))}
        </div>
      </section>
      <section className="mt-4">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-mono text-xs tracking-widest text-mist">BENCH</p>
          <p className="font-mono text-xs text-cream">sum {formatFrac(sumFracs(state.board))}</p>
        </div>
        <div className={`mt-2 flex min-h-16 flex-wrap items-center gap-1 rounded-2xl border p-2 ${done ? "border-gold" : "border-line"}`}>
          {state.board.length === 0 ? <p className="px-2 text-sm text-mist">Place a piece.</p> : null}
          {state.board.map((piece, index) => (
            <Piece
              key={`board-${index}-${formatFrac(piece)}`}
              piece={piece}
              selected={picked.includes(index)}
              locked={done}
              onClick={() => setPicked((current) => (current.includes(index) ? current.filter((item) => item !== index) : [...current, index]))}
            />
          ))}
        </div>
      </section>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!canHalve || done}
          onClick={() => commit(applyForge(state, { t: "halve", where: "board", index: one }))}
          className="min-h-11 rounded-full border border-line px-4 text-sm text-cream disabled:opacity-40"
        >
          Split
        </button>
        <button
          type="button"
          disabled={!canReduce || done}
          onClick={() => commit(applyForge(state, { t: "simplify", where: "board", index: one }))}
          className="min-h-11 rounded-full border border-line px-4 text-sm text-cream disabled:opacity-40"
        >
          Simplify
        </button>
        <button
          type="button"
          disabled={!canJoin || done}
          onClick={() => commit(applyForge(state, { t: "join", indices: picked }))}
          className="min-h-11 rounded-full border border-line px-4 text-sm text-cream disabled:opacity-40"
        >
          Join
        </button>
        <button
          type="button"
          onClick={() => {
            scored.current = done;
            setState(beginForge(level));
            setPicked([]);
          }}
          className="min-h-11 rounded-full border border-line px-4 text-sm text-cream"
        >
          Reset
        </button>
        {done && level.id < FORGE_LEVELS.length ? (
          <button type="button" onClick={() => setLevelId(level.id + 1)} className="min-h-11 rounded-full bg-gold px-4 text-sm font-extrabold text-ink">
            Next
          </button>
        ) : null}
      </div>
      <p className="mt-3 text-sm text-cream" aria-live="polite">
        {done ? "Locked. The pieces meet the goal and stay where they settled." : "Tap the tray to place. Tap the bench to pick pieces, then split, simplify, or join."}
      </p>
      <p className="mt-1 font-mono text-xs text-mist">Run {run}</p>
    </BenchFrame>
  );
}
