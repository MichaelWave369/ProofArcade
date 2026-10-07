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
import { prefersReducedMotion } from "@/components/use-arrive";
import {
  BALANCE_PLAYS,
  applyScale,
  balanced,
  formatOp,
  formatPan,
  scaleSolved,
  type ScaleOp,
  type ScaleState,
} from "@/game/balance/scale";
import { noteClear } from "@/game/progress";

type OperationDrag = { index: number; op: ScaleOp };

function boundsOf(element: HTMLElement): DragBounds {
  const rect = element.getBoundingClientRect();
  return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
}

function shortOp(op: ScaleOp): string {
  if (op.kind === "add") return op.n < 0 ? `−${-op.n}` : `+${op.n}`;
  if (op.kind === "div") return `÷${op.n}`;
  return `×${op.n}`;
}

function useNod(token: number) {
  const [angle, setAngle] = useState(0);
  useEffect(() => {
    if (token === 0 || prefersReducedMotion()) {
      setAngle(0);
      return;
    }
    const started = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      const u = (now - started) / 480;
      if (u >= 1) {
        setAngle(0);
        return;
      }
      setAngle(Math.sin(u * Math.PI * 2) * (1 - u) * 3.2);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [token]);
  return angle;
}

function Beam({
  state,
  angle,
  armed,
  solved,
}: {
  state: ScaleState;
  angle: number;
  armed: boolean;
  solved: boolean;
}) {
  const left = formatPan(state.left);
  const right = formatPan(state.right);
  const panStroke = solved ? "text-mint" : armed ? "text-gold-soft" : "text-gold";

  return (
    <svg
      viewBox="0 0 320 150"
      className="mx-auto h-40 w-full max-w-md"
      role="img"
      aria-label={`${left} on the left pan, ${right} on the right pan`}
    >
      <polygon points="160,108 146,132 174,132" className="text-gold" fill="currentColor" />
      <g transform={`rotate(${angle} 160 108)`}>
        <line
          x1="36"
          y1="48"
          x2="284"
          y2="48"
          className="text-gold"
          stroke="currentColor"
          strokeWidth="4"
        />
        <line
          x1="160"
          y1="48"
          x2="160"
          y2="108"
          className="text-gold"
          stroke="currentColor"
          strokeWidth="4"
        />
        <line x1="78" y1="48" x2="78" y2="72" className="text-line" stroke="currentColor" />
        <line x1="242" y1="48" x2="242" y2="72" className="text-line" stroke="currentColor" />
        <rect
          x="28"
          y="72"
          width="100"
          height="40"
          rx="10"
          className={panStroke}
          fill="none"
          stroke="currentColor"
          strokeWidth={armed ? 2.8 : 2}
        />
        <rect
          x="192"
          y="72"
          width="100"
          height="40"
          rx="10"
          className={solved ? "text-mint" : armed ? "text-gold-soft" : "text-mint"}
          fill="none"
          stroke="currentColor"
          strokeWidth={armed ? 2.8 : 2}
        />
        <text
          x="78"
          y="98"
          textAnchor="middle"
          className="text-cream"
          fill="currentColor"
          fontSize="16"
          fontFamily="IBM Plex Mono, monospace"
        >
          {left}
        </text>
        <text
          x="242"
          y="98"
          textAnchor="middle"
          className="text-mint"
          fill="currentColor"
          fontSize="16"
          fontFamily="IBM Plex Mono, monospace"
        >
          {right}
        </text>
      </g>
    </svg>
  );
}

export function BalanceLab({
  onExit,
  onQuestions,
}: {
  onExit?: () => void;
  onQuestions?: () => void;
}) {
  const [levelId, setLevelId] = useState(1);
  const play = BALANCE_PLAYS[levelId - 1] ?? BALANCE_PLAYS[0];
  const [state, setState] = useState<ScaleState>(play.start);
  const [nod, setNod] = useState(0);
  const [run, setRun] = useState(0);
  const [effect, setEffect] = useState<{ label: string; token: number } | null>(null);
  const scored = useRef(false);
  const gateRef = useRef<HTMLDivElement>(null);
  const angle = useNod(nod);
  const reducedMotion = useReducedMotionPreference();
  const {
    drag,
    beginDrag,
    moveDrag,
    finishDrag,
    cancelDrag,
    consumeSuppressedClick,
  } = usePointerDrag<OperationDrag>();

  useEffect(() => {
    scored.current = false;
    setState(play.start);
    setNod(0);
    setEffect(null);
  }, [play]);

  function commit(index: number) {
    if (scaleSolved(state, play.x)) return;
    const op = play.ops[index];
    const next = applyScale(state, op);
    if (!next) return;

    setEffect({ label: shortOp(op), token: Date.now() });
    setState(next);
    setNod((count) => count + 1);

    if (!scaleSolved(next, play.x) || scored.current) return;
    scored.current = true;
    const score = 140;
    setRun((total) => {
      const sum = total + score;
      noteClear("balance", play.id, score, sum);
      return sum;
    });
  }

  function finishOperationDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    finishDrag(
      event,
      (payload, pointer, size) => {
        const gate = gateRef.current;
        const next = applyScale(state, payload.op);
        if (!gate || !next || scaleSolved(state, play.x)) {
          return { accepted: false, settleMs: 130 };
        }

        const bounds = boundsOf(gate);
        if (!pointInside(bounds, pointer.x, pointer.y, 18)) {
          return { accepted: false, settleMs: 145 };
        }

        return {
          accepted: true,
          target: magneticPoint(bounds, size, pointer.x, pointer.y, 4),
          settleMs: 115,
          onAccepted: () => commit(payload.index),
        };
      },
      reducedMotion,
    );
  }

  const solved = scaleSolved(state, play.x);
  const still = balanced(state, play.x);

  return (
    <BenchFrame
      kicker="BALANCE LAB"
      title={play.title}
      meta={`${play.id}/16`}
      onExit={onExit}
      onQuestions={onQuestions}
    >
      <LevelStrip count={BALANCE_PLAYS.length} current={play.id} onPick={setLevelId} />
      <p className="font-mono text-sm text-cream">{play.prompt}</p>
      <p className="mt-1 text-sm text-mist">
        Apply one operation to both pans. Equality survives only because the transformation is mirrored.
      </p>

      <div
        className={`relative mt-3 overflow-hidden rounded-2xl border bg-ink transition-[border-color,box-shadow] duration-150 ${
          solved
            ? "border-mint/60 shadow-[0_0_26px_rgba(143,208,176,0.10)]"
            : drag
              ? "border-gold/70 shadow-[0_0_28px_rgba(228,177,90,0.12)]"
              : "border-line"
        }`}
      >
        <div className="absolute inset-x-0 top-2 z-10 flex justify-center px-3">
          <div
            ref={gateRef}
            className={`balance-both-gate min-w-36 rounded-full border px-4 py-2 text-center font-mono text-[10px] font-bold uppercase tracking-[0.18em] transition-[border-color,background-color,box-shadow,transform] duration-150 ${
              drag
                ? "scale-[1.03] border-gold bg-gold/15 text-gold shadow-[0_0_22px_rgba(228,177,90,0.14)]"
                : "border-line bg-panel/90 text-mist"
            }`}
          >
            {drag ? "release: both pans" : "both pans"}
          </div>
        </div>

        <div className="pt-8">
          <Beam state={state} angle={angle} armed={Boolean(drag)} solved={solved} />
        </div>

        {effect ? (
          <>
            <div
              key={`left-${effect.token}`}
              aria-hidden="true"
              className="balance-op-left pointer-events-none absolute left-1/2 top-9 z-20 rounded-full border border-gold bg-gold px-2 py-1 font-mono text-xs font-bold text-ink"
            >
              {effect.label}
            </div>
            <div
              key={`right-${effect.token}`}
              aria-hidden="true"
              className="balance-op-right pointer-events-none absolute left-1/2 top-9 z-20 rounded-full border border-mint bg-mint px-2 py-1 font-mono text-xs font-bold text-ink"
            >
              {effect.label}
            </div>
          </>
        ) : null}
      </div>

      <p className="mt-3 font-mono text-sm text-gold" aria-live="polite">
        {solved
          ? "x stands alone. The right pan is what it equals."
          : still
            ? drag
              ? "Drop the operation into BOTH PANS."
              : "Still balanced. x is not alone yet."
            : "The pans disagree. That move is not available."}
      </p>

      <div className="mt-3 grid gap-2">
        {play.ops.map((op, index) => {
          const legal = !solved && applyScale(state, op) !== null;
          const dragging = drag?.payload.index === index;
          return (
            <button
              key={`${play.id}-${formatOp(op)}`}
              type="button"
              disabled={!legal}
              aria-label={formatOp(op)}
              onClick={() => {
                if (consumeSuppressedClick()) return;
                commit(index);
              }}
              onPointerDown={(event) => beginDrag(event, { index, op })}
              onPointerMove={moveDrag}
              onPointerUp={finishOperationDrag}
              onPointerCancel={cancelDrag}
              style={{ touchAction: "none" }}
              className={`motion-safe min-h-12 select-none rounded-xl border px-4 text-left text-sm transition-[transform,opacity,border-color,background-color] duration-150 ${
                dragging
                  ? "scale-[1.015] border-gold bg-gold/15 text-gold opacity-25"
                  : "border-line bg-panel text-cream"
              } disabled:opacity-40`}
            >
              <span className="mr-3 inline-flex min-w-9 justify-center rounded-full border border-gold/40 bg-gold/10 px-2 py-1 font-mono text-xs text-gold">
                {shortOp(op)}
              </span>
              {formatOp(op)}
            </button>
          );
        })}
      </div>

      <p className="mt-2 text-xs text-mist">
        Drag an operation into BOTH PANS, or tap it for the keyboard-friendly path. The algebra engine applies the same legal operation to each side atomically.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            scored.current = solved;
            setState(play.start);
            setEffect(null);
          }}
          className="min-h-11 rounded-full border border-line px-4 text-sm text-cream"
        >
          Reset
        </button>
        {solved && play.id < BALANCE_PLAYS.length ? (
          <button
            type="button"
            onClick={() => setLevelId(play.id + 1)}
            className="min-h-11 rounded-full bg-gold px-4 text-sm font-extrabold text-ink"
          >
            Next
          </button>
        ) : null}
        <p className="font-mono text-xs text-mist">Run {run}</p>
      </div>

      {drag ? (
        <div
          aria-hidden="true"
          className={`balance-drag-ghost fixed z-[80] flex items-center justify-center rounded-xl border border-gold bg-panel-2 px-4 font-mono text-sm font-bold text-gold shadow-[0_16px_42px_rgba(0,0,0,0.45)] ${
            drag.phase === "dragging" ? "scale-[1.05]" : "scale-100"
          }`}
          style={{
            left: 0,
            top: 0,
            width: drag.size.width,
            height: drag.size.height,
            transform: `translate3d(${drag.current.left}px, ${drag.current.top}px, 0) scale(${drag.phase === "dragging" ? 1.05 : 1})`,
            transition:
              drag.phase === "dragging"
                ? "none"
                : "transform 130ms cubic-bezier(0.2, 0.8, 0.2, 1)",
          }}
        >
          <span className="mr-2">{shortOp(drag.payload.op)}</span>
          BOTH
        </div>
      ) : null}
    </BenchFrame>
  );
}
