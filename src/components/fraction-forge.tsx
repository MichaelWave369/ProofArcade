import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { BenchFrame, LevelStrip } from "@/components/bench-frame";
import {
  magneticPoint,
  pointInside,
  usePointerDrag,
  useReducedMotionPreference,
  type DragBounds,
} from "@/components/use-pointer-drag";
import {
  FORGE_LEVELS,
  applyForge,
  beginForge,
  canSimplifyFrac,
  forgeComplete,
  formatFrac,
  formatGoal,
  sumFracs,
  type ForgeAction,
  type ForgeState,
  type Frac,
} from "@/game/fraction/forge";
import { noteClear } from "@/game/progress";

type PieceLocation = "tray" | "board";
type PieceDrag = { where: PieceLocation; index: number; piece: Frac };

function boundsOf(element: HTMLElement): DragBounds {
  const rect = element.getBoundingClientRect();
  return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
}

function sameDrag(a: PieceDrag | undefined, where: PieceLocation, index: number) {
  return Boolean(a && a.where === where && a.index === index);
}

function Piece({
  piece,
  where,
  index,
  selected,
  locked,
  dragging,
  onActivate,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}: {
  piece: Frac;
  where: PieceLocation;
  index: number;
  selected: boolean;
  locked: boolean;
  dragging: boolean;
  onActivate: () => void;
  onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerCancel: () => void;
}) {
  const width = Math.max(18, Math.round((piece.n / piece.d) * 100));
  return (
    <button
      type="button"
      disabled={locked}
      aria-pressed={where === "board" ? selected : undefined}
      aria-label={`${formatFrac(piece)} ${where === "tray" ? "tray piece" : "bench piece"}`}
      onClick={onActivate}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      style={{ width: `${width}%`, touchAction: "none" }}
      className={`forge-piece-enter motion-safe flex h-12 min-w-11 select-none items-center justify-center rounded-lg border font-mono text-xs transition-[width,transform,opacity,background-color,border-color] duration-200 ${
        selected ? "border-gold bg-gold text-ink" : "border-gold/50 bg-gold/20 text-cream"
      } ${dragging ? "scale-[1.02] opacity-25" : "opacity-100"} disabled:opacity-90`}
    >
      {formatFrac(piece)}
    </button>
  );
}

export function FractionForge({
  onExit,
  onQuestions,
}: {
  onExit?: () => void;
  onQuestions?: () => void;
}) {
  const [levelId, setLevelId] = useState(1);
  const level = FORGE_LEVELS[levelId - 1] ?? FORGE_LEVELS[0];
  const [state, setState] = useState<ForgeState>(() => beginForge(level));
  const [picked, setPicked] = useState<number[]>([]);
  const [run, setRun] = useState(0);
  const [motionKey, setMotionKey] = useState(0);
  const scored = useRef(false);
  const trayRef = useRef<HTMLDivElement>(null);
  const benchRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotionPreference();
  const {
    drag,
    beginDrag,
    moveDrag,
    finishDrag,
    cancelDrag,
    consumeSuppressedClick,
  } = usePointerDrag<PieceDrag>();

  useEffect(() => {
    scored.current = false;
    setState(beginForge(level));
    setPicked([]);
    setMotionKey((value) => value + 1);
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

  function commit(action: ForgeAction) {
    if (done) return;
    const next = applyForge(state, action);
    if (!next) return;
    setState(next);
    setPicked([]);
    setMotionKey((value) => value + 1);
  }

  function finishPieceDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    finishDrag(
      event,
      (payload, pointer, size) => {
        const destination = payload.where === "tray" ? benchRef.current : trayRef.current;
        if (!destination) return { accepted: false };

        const bounds = boundsOf(destination);
        const accepted = pointInside(bounds, pointer.x, pointer.y, 14);
        if (!accepted) return { accepted: false, settleMs: 150 };

        return {
          accepted: true,
          target: magneticPoint(bounds, size, pointer.x, pointer.y),
          settleMs: 135,
          onAccepted: () =>
            commit(
              payload.where === "tray"
                ? { t: "place", index: payload.index }
                : { t: "return", index: payload.index },
            ),
        };
      },
      reducedMotion,
    );
  }

  function activatePiece(where: PieceLocation, index: number) {
    if (consumeSuppressedClick()) return;
    if (where === "tray") {
      commit({ t: "place", index });
      return;
    }
    setPicked((current) =>
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index],
    );
  }

  const one = picked.length === 1 ? picked[0] : -1;
  const canHalve = one >= 0 && state.board[one];
  const canReduce = canHalve && canSimplifyFrac(state.board[one]);
  const canJoin = picked.length >= 2;
  const targetZone = drag?.payload.where === "tray" ? "bench" : drag ? "tray" : null;

  return (
    <BenchFrame
      kicker="FRACTION FORGE"
      title={level.title}
      meta={`${level.id}/16`}
      onExit={onExit}
      onQuestions={onQuestions}
    >
      <LevelStrip count={FORGE_LEVELS.length} current={level.id} onPick={setLevelId} />
      <p className="text-sm text-mist">{level.blurb}</p>
      <p className="mt-1 font-mono text-sm text-gold">{formatGoal(level.goal)}</p>

      <section className="mt-3">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-mono text-xs tracking-widest text-mist">TRAY</p>
          {targetZone === "tray" ? (
            <p className="font-mono text-[10px] uppercase tracking-widest text-gold">
              release to return
            </p>
          ) : null}
        </div>
        <div
          ref={trayRef}
          className={`mt-2 flex min-h-14 flex-wrap gap-2 rounded-2xl border p-2 transition-[border-color,box-shadow] duration-150 ${
            targetZone === "tray"
              ? "border-gold/70 shadow-[0_0_22px_rgba(228,177,90,0.12)]"
              : "border-transparent"
          }`}
        >
          {state.tray.length === 0 ? <p className="text-sm text-mist">Empty.</p> : null}
          {state.tray.map((piece, index) => {
            const payload = { where: "tray" as const, index, piece };
            return (
              <Piece
                key={`tray-${index}-${formatFrac(piece)}-${motionKey}`}
                piece={piece}
                where="tray"
                index={index}
                selected={false}
                locked={done}
                dragging={sameDrag(drag?.payload, "tray", index)}
                onActivate={() => activatePiece("tray", index)}
                onPointerDown={(event) => beginDrag(event, payload)}
                onPointerMove={moveDrag}
                onPointerUp={finishPieceDrag}
                onPointerCancel={cancelDrag}
              />
            );
          })}
        </div>
      </section>

      <section className="mt-4">
        <div className="flex items-baseline justify-between gap-3">
          <div className="flex items-baseline gap-3">
            <p className="font-mono text-xs tracking-widest text-mist">BENCH</p>
            {targetZone === "bench" ? (
              <p className="font-mono text-[10px] uppercase tracking-widest text-gold">
                magnetic drop
              </p>
            ) : null}
          </div>
          <p className="font-mono text-xs text-cream">
            sum {formatFrac(sumFracs(state.board))}
          </p>
        </div>
        <div
          ref={benchRef}
          className={`mt-2 flex min-h-16 flex-wrap items-center gap-1 rounded-2xl border p-2 transition-[border-color,box-shadow] duration-150 ${
            done
              ? "forge-complete-settle border-gold shadow-[0_0_24px_rgba(228,177,90,0.14)]"
              : targetZone === "bench"
                ? "border-gold/70 shadow-[0_0_22px_rgba(228,177,90,0.12)]"
                : "border-line"
          }`}
        >
          {state.board.length === 0 ? (
            <p className="px-2 text-sm text-mist">Drag or place a piece.</p>
          ) : null}
          {state.board.map((piece, index) => {
            const payload = { where: "board" as const, index, piece };
            return (
              <Piece
                key={`board-${index}-${formatFrac(piece)}-${motionKey}`}
                piece={piece}
                where="board"
                index={index}
                selected={picked.includes(index)}
                locked={done}
                dragging={sameDrag(drag?.payload, "board", index)}
                onActivate={() => activatePiece("board", index)}
                onPointerDown={(event) => beginDrag(event, payload)}
                onPointerMove={moveDrag}
                onPointerUp={finishPieceDrag}
                onPointerCancel={cancelDrag}
              />
            );
          })}
        </div>
      </section>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!canHalve || done}
          onClick={() => commit({ t: "halve", where: "board", index: one })}
          className="min-h-11 rounded-full border border-line px-4 text-sm text-cream disabled:opacity-40"
        >
          Split
        </button>
        <button
          type="button"
          disabled={!canReduce || done}
          onClick={() => commit({ t: "simplify", where: "board", index: one })}
          className="min-h-11 rounded-full border border-line px-4 text-sm text-cream disabled:opacity-40"
        >
          Simplify
        </button>
        <button
          type="button"
          disabled={!canJoin || done}
          onClick={() => commit({ t: "join", indices: picked })}
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
            setMotionKey((value) => value + 1);
          }}
          className="min-h-11 rounded-full border border-line px-4 text-sm text-cream"
        >
          Reset
        </button>
        {done && level.id < FORGE_LEVELS.length ? (
          <button
            type="button"
            onClick={() => setLevelId(level.id + 1)}
            className="min-h-11 rounded-full bg-gold px-4 text-sm font-extrabold text-ink"
          >
            Next
          </button>
        ) : null}
      </div>

      <p className="mt-3 text-sm text-cream" aria-live="polite">
        {done
          ? "Locked. The pieces meet the goal and stay where they settled."
          : "Drag tray pieces onto the bench. Drag a bench piece back to the tray. Tap or use the keyboard for the original controls."}
      </p>
      <p className="mt-1 font-mono text-xs text-mist">Run {run}</p>

      {drag ? (
        <div
          aria-hidden="true"
          className={`forge-drag-ghost fixed z-[80] flex items-center justify-center rounded-lg border border-gold bg-gold/85 font-mono text-xs font-bold text-ink shadow-[0_14px_38px_rgba(0,0,0,0.4)] ${
            drag.phase === "dragging" ? "scale-[1.06]" : "scale-100"
          }`}
          style={{
            left: 0,
            top: 0,
            width: drag.size.width,
            height: drag.size.height,
            transform: `translate3d(${drag.current.left}px, ${drag.current.top}px, 0) scale(${drag.phase === "dragging" ? 1.06 : 1})`,
            transition:
              drag.phase === "dragging"
                ? "none"
                : "transform 150ms cubic-bezier(0.2, 0.8, 0.2, 1)",
          }}
        >
          {formatFrac(drag.payload.piece)}
        </div>
      ) : null}
    </BenchFrame>
  );
}
