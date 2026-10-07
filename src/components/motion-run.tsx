import { useEffect, useRef, useState } from "react";
import { BenchFrame, LevelStrip } from "@/components/bench-frame";
import { prefersReducedMotion } from "@/components/use-arrive";
import { TRIP_LAW, TRIP_PLAYS, tripDistance, tripSolved, type TripPlay } from "@/game/motion/trip";
import { noteClear } from "@/game/progress";

function useCruise(distance: number, token: number) {
  const [pos, setPos] = useState(0);
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (token === 0) {
      setPos(0);
      setDone(false);
      return;
    }
    if (prefersReducedMotion()) {
      setPos(distance);
      setDone(true);
      return;
    }
    const started = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      const u = Math.min(1, (now - started) / 800);
      setPos(distance * u);
      if (u < 1) raf = requestAnimationFrame(loop);
      else {
        setPos(distance);
        setDone(true);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [token, distance]);
  return { pos, done };
}

function Track({ play, speed, time, pos }: { play: TripPlay; speed: number; time: number; pos: number }) {
  const product = tripDistance(speed, time);
  const xOf = (meters: number) => 28 + (Math.max(0, Math.min(play.track, meters)) / play.track) * 264;
  const ghost = xOf(product);
  const craft = xOf(pos);
  const flag = xOf(play.flag);
  return (
    <svg viewBox="0 0 320 96" className="h-28 w-full" role="img" aria-label={`Craft at ${pos.toFixed(1)} meters, flag at ${play.flag} meters`}>
      <line x1="28" y1="58" x2="292" y2="58" className="text-line" stroke="currentColor" strokeWidth="3" />
      <line x1={flag} y1="36" x2={flag} y2="70" className="text-mint" stroke="currentColor" strokeWidth="2" />
      <circle cx={flag} cy="32" r="4" className="text-mint" fill="currentColor" />
      <circle cx={ghost} cy="58" r="5" className="text-mist" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx={craft} cy="58" r="7" className="text-gold" fill="currentColor" />
      <text x="28" y="86" fontSize="11" className="fill-current font-mono text-mist">
        0
      </text>
      <text x={flag} y="18" textAnchor="middle" fontSize="11" className="fill-current font-mono text-mint">
        {play.flag} m
      </text>
      <text x="292" y="86" textAnchor="end" fontSize="11" className="fill-current font-mono text-mist">
        {play.track}
      </text>
    </svg>
  );
}

function Stepper({
  label,
  value,
  max,
  locked,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  locked: boolean;
  onChange: (next: number) => void;
}) {
  return (
    <div className={`flex items-center justify-between gap-3 rounded-xl border border-line bg-panel px-3 py-2 ${locked ? "opacity-50" : ""}`}>
      <span className="font-mono text-xs tracking-widest text-mist">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          disabled={locked || value <= 1}
          onClick={() => onChange(value - 1)}
          className="min-h-11 min-w-11 rounded-full border border-line text-lg text-cream disabled:opacity-40"
        >
          −
        </button>
        <span className="w-8 text-center font-mono text-cream">{value}</span>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          disabled={locked || value >= max}
          onClick={() => onChange(value + 1)}
          className="min-h-11 min-w-11 rounded-full border border-line text-lg text-cream disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  );
}

export function MotionRun({ onExit, onQuestions }: { onExit?: () => void; onQuestions?: () => void }) {
  const [levelId, setLevelId] = useState(1);
  const level = TRIP_PLAYS[levelId - 1] ?? TRIP_PLAYS[0];
  const [speed, setSpeed] = useState(level.startSpeed);
  const [time, setTime] = useState(level.startTime);
  const [token, setToken] = useState(0);
  const [armed, setArmed] = useState(level.id);
  const [run, setRun] = useState(0);
  const scored = useRef(false);
  const product = tripDistance(speed, time);
  const { pos, done } = useCruise(token === 0 ? 0 : product, token);
  const solved = armed === level.id && done && tripSolved(level, speed, time);

  useEffect(() => {
    scored.current = false;
    setSpeed(level.startSpeed);
    setTime(level.startTime);
    setToken(0);
    setArmed(level.id);
  }, [level]);

  useEffect(() => {
    if (!solved || scored.current) return;
    scored.current = true;
    const score = 100;
    setRun((total) => {
      const next = total + score;
      noteClear("motion", level.id, score, next);
      return next;
    });
  }, [solved, level.id]);

  function retune(nextSpeed: number, nextTime: number) {
    setSpeed(nextSpeed);
    setTime(nextTime);
    setToken(0);
  }

  let status = "The ghost is where this speed and time would stop. Launch to run it.";
  if (token > 0 && !done) status = "The craft is covering the product.";
  else if (done && solved) status = "The craft stopped on the flag.";
  else if (done && product < level.flag) status = `Short of the flag. ${product} m is not ${level.flag} m.`;
  else if (done && product > level.flag) status = `Past the flag. ${product} m is not ${level.flag} m.`;

  return (
    <BenchFrame kicker="MOTION" title={level.title} meta={`${level.id}/16`} onExit={onExit} onQuestions={onQuestions}>
      <LevelStrip count={TRIP_PLAYS.length} current={level.id} onPick={setLevelId} />
      <p className="text-sm text-mist">{level.blurb}</p>
      <div className="mt-3 overflow-hidden rounded-2xl border border-line bg-ink">
        <Track play={level} speed={speed} time={time} pos={token === 0 ? 0 : pos} />
      </div>
      <p className="mt-3 text-center font-mono text-lg text-cream">
        {speed} m/s × {time} s = {product} m
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Stepper
          label="Speed"
          value={speed}
          max={level.maxSpeed}
          locked={level.aim === "time"}
          onChange={(next) => retune(next, time)}
        />
        <Stepper
          label="Time"
          value={time}
          max={level.maxTime}
          locked={level.aim === "speed"}
          onChange={(next) => retune(speed, next)}
        />
      </div>
      <p className="mt-3 text-sm leading-relaxed text-cream">{TRIP_LAW}</p>
      <p className="mt-3 font-mono text-sm text-gold" aria-live="polite">
        {status}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setToken((current) => current + 1)}
          className="min-h-11 rounded-full bg-gold px-4 text-sm font-extrabold text-ink"
        >
          Launch
        </button>
        <button
          type="button"
          onClick={() => {
            scored.current = solved;
            retune(level.startSpeed, level.startTime);
          }}
          className="min-h-11 rounded-full border border-line px-4 text-sm text-cream"
        >
          Reset
        </button>
        {solved && level.id < TRIP_PLAYS.length ? (
          <button type="button" onClick={() => setLevelId(level.id + 1)} className="min-h-11 rounded-full border border-gold px-4 text-sm font-extrabold text-gold">
            Next
          </button>
        ) : null}
        <p className="self-center font-mono text-xs text-mist">Run {run}</p>
      </div>
    </BenchFrame>
  );
}
