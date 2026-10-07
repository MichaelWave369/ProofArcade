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
import { noteClear } from "@/game/progress";
import {
  DRIFT_LEVELS,
  applyDrift,
  beginDrift,
  formatV,
  type DriftLevel,
  type DriftState,
  type V,
} from "@/game/vector/drift";

type VectorCardDrag = { index: number; card: V };

function boundsOf(element: HTMLElement): DragBounds {
  const rect = element.getBoundingClientRect();
  return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
}

function useFlight(pos: V) {
  const [shown, setShown] = useState(pos);
  const from = useRef(pos);
  useEffect(() => {
    if (prefersReducedMotion()) {
      from.current = pos;
      setShown(pos);
      return;
    }
    const start = from.current;
    const t0 = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      const u = Math.min(1, (now - t0) / 280);
      const eased = 1 - Math.pow(1 - u, 3);
      setShown({
        x: start.x + (pos.x - start.x) * eased,
        y: start.y + (pos.y - start.y) * eased,
      });
      if (u < 1) raf = requestAnimationFrame(loop);
      else from.current = pos;
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [pos.x, pos.y]);
  return shown;
}

function Field({
  level,
  state,
  ship,
  armed,
}: {
  level: DriftLevel;
  state: DriftState;
  ship: V;
  armed: boolean;
}) {
  const span = level.span;
  const size = 280;
  const mapX = (n: number) => ((n + span) / (span * 2)) * size;
  const mapY = (n: number) => size - ((n + span) / (span * 2)) * size;
  const trail = state.trail.map((point) => `${mapX(point.x)},${mapY(point.y)}`).join(" ");
  const previous = state.trail.length > 1 ? state.trail[state.trail.length - 2] : null;
  const ticks: number[] = [];
  for (let n = -span; n <= span; n += 1) ticks.push(n);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto aspect-square w-full max-w-md"
      role="img"
      aria-label={`Craft at ${formatV(state.pos)}, mark at ${formatV(state.target)}`}
    >
      <defs>
        <marker
          id="vector-drift-gold-arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" className="text-gold" />
        </marker>
        <marker
          id="vector-drift-cream-arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" className="text-cream" />
        </marker>
      </defs>

      {ticks.map((tick) => (
        <g key={tick} className="text-line" stroke="currentColor">
          <line x1={mapX(tick)} y1={0} x2={mapX(tick)} y2={size} />
          <line x1={0} y1={mapY(tick)} x2={size} y2={mapY(tick)} />
        </g>
      ))}
      <line
        x1={mapX(-span)}
        y1={mapY(0)}
        x2={mapX(span)}
        y2={mapY(0)}
        className="text-mist"
        stroke="currentColor"
      />
      <line
        x1={mapX(0)}
        y1={mapY(-span)}
        x2={mapX(0)}
        y2={mapY(span)}
        className="text-mist"
        stroke="currentColor"
      />

      {state.turn > 0 ? (
        <line
          x1={mapX(level.start.x)}
          y1={mapY(level.start.y)}
          x2={mapX(state.pos.x)}
          y2={mapY(state.pos.y)}
          className="text-cream"
          stroke="currentColor"
          strokeDasharray="5 4"
          strokeWidth="1.5"
          markerEnd="url(#vector-drift-cream-arrow)"
          opacity="0.68"
        />
      ) : null}

      <polyline
        points={trail}
        fill="none"
        className="text-gold"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {previous ? (
        <line
          key={`burn-${state.turn}`}
          pathLength={1}
          x1={mapX(previous.x)}
          y1={mapY(previous.y)}
          x2={mapX(state.pos.x)}
          y2={mapY(state.pos.y)}
          className="vector-burn-line text-gold"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          markerEnd="url(#vector-drift-gold-arrow)"
        />
      ) : null}

      <circle
        cx={mapX(state.target.x)}
        cy={mapY(state.target.y)}
        r={armed ? 10 : 8}
        className={armed ? "vector-target-armed text-mint" : "text-mint"}
        fill="none"
        stroke="currentColor"
        strokeWidth={armed ? 2.5 : 2}
      />
      <circle
        cx={mapX(ship.x)}
        cy={mapY(ship.y)}
        r={armed ? 6.5 : 5.5}
        className="text-gold"
        fill="currentColor"
      />
      <circle
        cx={mapX(ship.x)}
        cy={mapY(ship.y)}
        r="10"
        className="text-gold"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        opacity={armed ? 0.7 : 0.28}
      />
    </svg>
  );
}

export function VectorDrift({
  onExit,
  onQuestions,
}: {
  onExit?: () => void;
  onQuestions?: () => void;
}) {
  const [levelId, setLevelId] = useState(1);
  const level = DRIFT_LEVELS[levelId - 1] ?? DRIFT_LEVELS[0];
  const [state, setState] = useState<DriftState>(() => beginDrift(level));
  const [run, setRun] = useState(0);
  const scored = useRef(false);
  const fieldRef = useRef<HTMLDivElement>(null);
  const ship = useFlight(state.pos);
  const reducedMotion = useReducedMotionPreference();
  const {
    drag,
    beginDrag,
    moveDrag,
    finishDrag,
    cancelDrag,
    consumeSuppressedClick,
  } = usePointerDrag<VectorCardDrag>();

  useEffect(() => {
    scored.current = false;
    setState(beginDrift(level));
  }, [level]);

  useEffect(() => {
    if (!state.met || scored.current) return;
    scored.current = true;
    const score = 120 + state.used.filter((used) => !used).length * 10;
    setRun((total) => {
      const next = total + score;
      noteClear("vectors", level.id, score, next);
      return next;
    });
  }, [state.met, state.used, level.id]);

  function play(index: number) {
    const next = applyDrift(level, state, index);
    if (next) setState(next);
  }

  function finishCardDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    finishDrag(
      event,
      (payload, pointer, size) => {
        const field = fieldRef.current;
        const next = applyDrift(level, state, payload.index);
        if (!field || !next) return { accepted: false, settleMs: 130 };

        const bounds = boundsOf(field);
        if (!pointInside(bounds, pointer.x, pointer.y, 12)) {
          return { accepted: false, settleMs: 145 };
        }

        return {
          accepted: true,
          target: magneticPoint(bounds, size, pointer.x, pointer.y, 12),
          settleMs: 115,
          onAccepted: () => setState(next),
        };
      },
      reducedMotion,
    );
  }

  const kindLabel =
    level.kind === "position"
      ? "Position"
      : level.kind === "velocity"
        ? "Velocity"
        : level.kind === "acceleration"
          ? "Acceleration"
          : level.kind === "momentum"
            ? `Momentum · mass ${level.mass}`
            : "Intercept";

  return (
    <BenchFrame
      kicker="VECTOR DRIFT"
      title={level.title}
      meta={`${level.id}/16`}
      onExit={onExit}
      onQuestions={onQuestions}
    >
      <LevelStrip count={DRIFT_LEVELS.length} current={level.id} onPick={setLevelId} />
      <p className="text-sm text-mist">{level.blurb}</p>
      <p className="mt-1 font-mono text-xs text-gold">{kindLabel}</p>

      <div
        ref={fieldRef}
        className={`mt-3 overflow-hidden rounded-2xl border bg-ink transition-[border-color,box-shadow,transform] duration-150 ${
          drag
            ? "scale-[1.005] border-gold/75 shadow-[0_0_30px_rgba(228,177,90,0.12)]"
            : state.met
              ? "border-mint/60 shadow-[0_0_26px_rgba(143,208,176,0.10)]"
              : "border-line"
        }`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-line/70 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em]">
          <span className="text-mist">Navigation field</span>
          <span className={drag ? "text-gold" : "text-mist"}>
            {drag ? "release vector to burn" : "drag a card here"}
          </span>
        </div>
        <Field level={level} state={state} ship={ship} armed={Boolean(drag)} />
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-2 font-mono text-xs sm:grid-cols-3">
        <Readout label="Position" value={formatV(state.pos)} />
        <Readout label="Applied" value={state.turn > 0 ? formatV(state.applied) : "none"} />
        <Readout
          label="Resultant"
          value={state.turn > 0 ? formatV(state.resultant) : "(0, 0)"}
        />
        <Readout label="Mark" value={formatV(state.target)} />
        {level.kind !== "position" ? (
          <Readout label="Velocity" value={formatV(state.vel)} />
        ) : null}
        {level.kind === "acceleration" || level.kind === "momentum" ? (
          <Readout label="Acceleration" value={formatV(state.acc)} />
        ) : null}
      </dl>

      <p className="mt-3 text-sm leading-relaxed text-cream">{level.law}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {level.cards.map((card, index) => {
          const used = state.used[index];
          const legal = !used && !state.met && applyDrift(level, state, index) !== null;
          const dragging = drag?.payload.index === index;
          return (
            <button
              key={`${level.id}-${index}`}
              type="button"
              disabled={!legal}
              aria-label={`Apply vector ${formatV(card)}`}
              onClick={() => {
                if (consumeSuppressedClick()) return;
                play(index);
              }}
              onPointerDown={(event) => beginDrag(event, { index, card })}
              onPointerMove={moveDrag}
              onPointerUp={finishCardDrag}
              onPointerCancel={cancelDrag}
              style={{ touchAction: "none" }}
              className={`motion-safe min-h-12 select-none rounded-xl border px-3 font-mono text-sm transition-[transform,opacity,border-color,background-color] duration-150 ${
                dragging
                  ? "scale-[1.02] border-gold bg-gold/20 text-gold opacity-25"
                  : "border-line bg-panel text-cream"
              } disabled:opacity-40`}
            >
              <span className="mr-2 text-gold" aria-hidden="true">
                →
              </span>
              {formatV(card)}
              {used ? " · played" : ""}
            </button>
          );
        })}
      </div>

      {level.kind === "momentum" ? (
        <p className="mt-2 text-xs text-mist">
          An impulse that does not divide the mass stays in the tray.
        </p>
      ) : null}

      <p className="mt-3 font-mono text-sm text-gold" aria-live="polite">
        {state.met
          ? "On the mark."
          : "Drag a legal vector into the field or tap it. The bright arrow is the latest motion; the dashed arrow is the total displacement from the start."}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            scored.current = state.met;
            setState(beginDrift(level));
          }}
          className="min-h-11 rounded-full border border-line px-4 text-sm text-cream"
        >
          Reset
        </button>
        {state.met && level.id < DRIFT_LEVELS.length ? (
          <button
            type="button"
            onClick={() => setLevelId(level.id + 1)}
            className="min-h-11 rounded-full bg-gold px-4 text-sm font-extrabold text-ink"
          >
            Next
          </button>
        ) : null}
        <p className="self-center font-mono text-xs text-mist">Run {run}</p>
      </div>

      {drag ? (
        <div
          aria-hidden="true"
          className={`vector-drag-ghost fixed z-[80] flex items-center justify-center rounded-xl border border-gold bg-panel-2 px-4 font-mono text-sm font-bold text-gold shadow-[0_16px_42px_rgba(0,0,0,0.45)] ${
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
                : "transform 130ms cubic-bezier(0.2, 0.8, 0.2, 1)",
          }}
        >
          <span className="mr-2" aria-hidden="true">
            →
          </span>
          {formatV(drag.payload.card)}
        </div>
      ) : null}
    </BenchFrame>
  );
}

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-panel px-3 py-2">
      <dt className="text-mist">{label}</dt>
      <dd className="text-cream">{value}</dd>
    </div>
  );
}
