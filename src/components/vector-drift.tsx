import { useEffect, useRef, useState } from "react";
import { BenchFrame, LevelStrip } from "@/components/bench-frame";
import { prefersReducedMotion } from "@/components/use-arrive";
import { noteClear } from "@/game/progress";
import { DRIFT_LEVELS, applyDrift, beginDrift, formatV, type DriftLevel, type DriftState, type V } from "@/game/vector/drift";

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
      setShown({ x: start.x + (pos.x - start.x) * u, y: start.y + (pos.y - start.y) * u });
      if (u < 1) raf = requestAnimationFrame(loop);
      else from.current = pos;
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [pos.x, pos.y]);
  return shown;
}

function Field({ level, state, ship }: { level: DriftLevel; state: DriftState; ship: V }) {
  const span = level.span;
  const size = 280;
  const mapX = (n: number) => ((n + span) / (span * 2)) * size;
  const mapY = (n: number) => size - ((n + span) / (span * 2)) * size;
  const trail = state.trail.map((point) => `${mapX(point.x)},${mapY(point.y)}`).join(" ");
  const ticks: number[] = [];
  for (let n = -span; n <= span; n += 1) ticks.push(n);
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto aspect-square w-full max-w-md" role="img" aria-label={`Craft at ${formatV(state.pos)}, mark at ${formatV(state.target)}`}>
      {ticks.map((tick) => (
        <g key={tick} className="text-line" stroke="currentColor">
          <line x1={mapX(tick)} y1={0} x2={mapX(tick)} y2={size} />
          <line x1={0} y1={mapY(tick)} x2={size} y2={mapY(tick)} />
        </g>
      ))}
      <line x1={mapX(-span)} y1={mapY(0)} x2={mapX(span)} y2={mapY(0)} className="text-mist" stroke="currentColor" />
      <line x1={mapX(0)} y1={mapY(-span)} x2={mapX(0)} y2={mapY(span)} className="text-mist" stroke="currentColor" />
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
        />
      ) : null}
      <polyline points={trail} fill="none" className="text-gold" stroke="currentColor" strokeWidth="2.5" />
      <circle cx={mapX(state.target.x)} cy={mapY(state.target.y)} r="8" className="text-mint" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx={mapX(ship.x)} cy={mapY(ship.y)} r="5.5" className="text-gold" fill="currentColor" />
    </svg>
  );
}

export function VectorDrift({ onExit, onQuestions }: { onExit?: () => void; onQuestions?: () => void }) {
  const [levelId, setLevelId] = useState(1);
  const level = DRIFT_LEVELS[levelId - 1] ?? DRIFT_LEVELS[0];
  const [state, setState] = useState<DriftState>(() => beginDrift(level));
  const [run, setRun] = useState(0);
  const scored = useRef(false);
  const ship = useFlight(state.pos);

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
    <BenchFrame kicker="VECTOR DRIFT" title={level.title} meta={`${level.id}/16`} onExit={onExit} onQuestions={onQuestions}>
      <LevelStrip count={DRIFT_LEVELS.length} current={level.id} onPick={setLevelId} />
      <p className="text-sm text-mist">{level.blurb}</p>
      <p className="mt-1 font-mono text-xs text-gold">{kindLabel}</p>
      <div className="mt-3 overflow-hidden rounded-2xl border border-line bg-ink">
        <Field level={level} state={state} ship={ship} />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 font-mono text-xs sm:grid-cols-3">
        <Readout label="Position" value={formatV(state.pos)} />
        <Readout label="Applied" value={state.turn > 0 ? formatV(state.applied) : "none"} />
        <Readout label="Resultant" value={state.turn > 0 ? formatV(state.resultant) : "(0, 0)"} />
        <Readout label="Mark" value={formatV(state.target)} />
        {level.kind !== "position" ? <Readout label="Velocity" value={formatV(state.vel)} /> : null}
        {level.kind === "acceleration" || level.kind === "momentum" ? <Readout label="Acceleration" value={formatV(state.acc)} /> : null}
      </dl>
      <p className="mt-3 text-sm leading-relaxed text-cream">{level.law}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {level.cards.map((card, index) => {
          const used = state.used[index];
          const legal = !used && !state.met && applyDrift(level, state, index) !== null;
          return (
            <button
              key={`${level.id}-${index}`}
              type="button"
              disabled={!legal}
              onClick={() => play(index)}
              className="min-h-11 rounded-xl border border-line bg-panel px-3 font-mono text-sm text-cream disabled:opacity-40"
            >
              {formatV(card)}
              {used ? " · played" : ""}
            </button>
          );
        })}
      </div>
      {level.kind === "momentum" ? <p className="mt-2 text-xs text-mist">An impulse that does not divide the mass stays in the tray.</p> : null}
      <p className="mt-3 font-mono text-sm text-gold" aria-live="polite">
        {state.met ? "On the mark." : "The mark is the open circle. The dashed line is only the sum of cards you have already played."}
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
          <button type="button" onClick={() => setLevelId(level.id + 1)} className="min-h-11 rounded-full bg-gold px-4 text-sm font-extrabold text-ink">
            Next
          </button>
        ) : null}
        <p className="self-center font-mono text-xs text-mist">Run {run}</p>
      </div>
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
