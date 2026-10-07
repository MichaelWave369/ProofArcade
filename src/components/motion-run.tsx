import { useEffect, useMemo, useRef, useState } from "react";
import { BenchFrame, LevelStrip } from "@/components/bench-frame";
import { prefersReducedMotion } from "@/components/use-arrive";
import {
  TRIP_LAW,
  TRIP_PLAYS,
  snapTripControls,
  tripDistance,
  tripSolved,
  tripStateAt,
  validTripPairs,
  type TripPlay,
} from "@/game/motion/trip";
import { noteClear } from "@/game/progress";

const SIM_MS_PER_SECOND = 220;

function useCruise(speed: number, time: number, token: number) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (token === 0) {
      setElapsed(0);
      return;
    }

    if (prefersReducedMotion()) {
      setElapsed(time);
      return;
    }

    const started = performance.now();
    let raf = 0;

    const loop = (now: number) => {
      const simulated = (now - started) / SIM_MS_PER_SECOND;
      const next = Math.min(time, simulated);
      setElapsed(next);
      if (next < time) raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [token, time]);

  return tripStateAt(speed, time, elapsed);
}

function markerStep(track: number) {
  if (track <= 12) return 2;
  if (track <= 24) return 3;
  if (track <= 40) return 5;
  return 8;
}

function Track({
  play,
  speed,
  time,
  distance,
  elapsed,
  running,
  solved,
}: {
  play: TripPlay;
  speed: number;
  time: number;
  distance: number;
  elapsed: number;
  running: boolean;
  solved: boolean;
}) {
  const product = tripDistance(speed, time);
  const extent = Math.max(play.track, product + 2, play.flag + 2);
  const xOf = (meters: number) =>
    28 + (Math.max(0, Math.min(extent, meters)) / extent) * 264;
  const ghost = xOf(product);
  const craft = xOf(distance);
  const flag = xOf(play.flag);
  const step = markerStep(extent);
  const ticks: number[] = [];
  for (let n = 0; n <= extent; n += step) ticks.push(n);
  if (ticks[ticks.length - 1] !== Math.round(extent)) ticks.push(Math.round(extent));

  return (
    <svg
      viewBox="0 0 320 126"
      className="h-36 w-full"
      role="img"
      aria-label={`Craft at ${distance.toFixed(1)} meters after ${elapsed.toFixed(1)} seconds. Flag at ${play.flag} meters.`}
    >
      <line
        x1="28"
        y1="68"
        x2="292"
        y2="68"
        className="text-line"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <line
        x1="28"
        y1="68"
        x2={craft}
        y2="68"
        className={solved ? "text-mint" : "text-gold"}
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {ticks.map((tick) => {
        const x = xOf(tick);
        return (
          <g key={tick}>
            <line
              x1={x}
              y1="60"
              x2={x}
              y2="77"
              className="text-line"
              stroke="currentColor"
              strokeWidth="1"
            />
            <text
              x={x}
              y="94"
              textAnchor="middle"
              fontSize="9"
              className="fill-current font-mono text-mist"
            >
              {tick}
            </text>
          </g>
        );
      })}

      <line
        x1={flag}
        y1="32"
        x2={flag}
        y2="80"
        className="text-mint"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d={`M ${flag} 31 l 13 5 -13 5 z`}
        className="text-mint"
        fill="currentColor"
      />
      <text
        x={flag}
        y="20"
        textAnchor="middle"
        fontSize="10"
        className="fill-current font-mono text-mint"
      >
        {play.flag} m
      </text>

      <circle
        cx={ghost}
        cy="68"
        r="7"
        className="text-mist"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="3 2"
      />

      {running ? (
        <g className="motion-craft-running">
          <circle cx={craft} cy="68" r="9" className="text-gold" fill="currentColor" />
          <path
            d={`M ${craft - 9} 68 l -10 -5 3 5 -3 5 z`}
            className="text-gold-soft"
            fill="currentColor"
            opacity="0.8"
          />
        </g>
      ) : (
        <circle
          cx={craft}
          cy="68"
          r="8"
          className={solved ? "text-mint" : "text-gold"}
          fill="currentColor"
        />
      )}

      <text
        x="28"
        y="115"
        fontSize="10"
        className="fill-current font-mono text-mist"
      >
        speed {speed} m/s
      </text>
      <text
        x="292"
        y="115"
        textAnchor="end"
        fontSize="10"
        className="fill-current font-mono text-mist"
      >
        {elapsed.toFixed(1)} / {time} s
      </text>
    </svg>
  );
}

function MotionDial({
  label,
  unit,
  value,
  min,
  max,
  locked,
  onChange,
}: {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  locked: boolean;
  onChange: (next: number) => void;
}) {
  const percent = max === min ? 0 : ((value - min) / (max - min)) * 100;

  return (
    <div className={`rounded-xl border border-line bg-panel px-3 py-3 ${locked ? "opacity-55" : ""}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-xs tracking-widest text-mist">{label}</span>
        <span className="font-mono text-sm text-cream">
          {value} {unit}
        </span>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          disabled={locked || value <= min}
          onClick={() => onChange(value - 1)}
          className="min-h-10 min-w-10 rounded-full border border-line text-lg text-cream disabled:opacity-40"
        >
          −
        </button>

        <div className="relative flex-1 py-3">
          <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-line" />
          <div
            aria-hidden="true"
            className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gold"
            style={{ width: `${percent}%` }}
          />
          <input
            type="range"
            min={min}
            max={max}
            step={1}
            value={value}
            disabled={locked}
            aria-label={label}
            onChange={(event) => onChange(Number(event.currentTarget.value))}
            className="motion-range relative z-10 w-full"
          />
        </div>

        <button
          type="button"
          aria-label={`Increase ${label}`}
          disabled={locked || value >= max}
          onClick={() => onChange(value + 1)}
          className="min-h-10 min-w-10 rounded-full border border-line text-lg text-cream disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  );
}

export function MotionRun({
  onExit,
  onQuestions,
}: {
  onExit?: () => void;
  onQuestions?: () => void;
}) {
  const [levelId, setLevelId] = useState(1);
  const level = TRIP_PLAYS[levelId - 1] ?? TRIP_PLAYS[0];
  const [speed, setSpeed] = useState(level.startSpeed);
  const [time, setTime] = useState(level.startTime);
  const [token, setToken] = useState(0);
  const [armed, setArmed] = useState(level.id);
  const [run, setRun] = useState(0);
  const scored = useRef(false);

  const product = tripDistance(speed, time);
  const cruise = useCruise(speed, time, token);
  const running = token > 0 && !cruise.done;
  const solved = armed === level.id && cruise.done && tripSolved(level, speed, time);
  const pairs = useMemo(() => validTripPairs(level), [level]);

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
    const next = snapTripControls(level, nextSpeed, nextTime);
    setSpeed(next.speed);
    setTime(next.time);
    setToken(0);
  }

  let status = "The dashed ghost is where this speed and time will stop. Launch to test it.";
  if (running) {
    status = `Constant speed: ${speed} m each simulated second. Distance now ${cruise.distance.toFixed(1)} m.`;
  } else if (token > 0 && solved) {
    status = "The craft stopped on the flag.";
  } else if (token > 0 && cruise.done && product < level.flag) {
    status = `Short of the flag. ${product} m is not ${level.flag} m.`;
  } else if (token > 0 && cruise.done && product > level.flag) {
    status = `Past the flag. ${product} m is not ${level.flag} m.`;
  }

  return (
    <BenchFrame
      kicker="MOTION"
      title={level.title}
      meta={`${level.id}/16`}
      onExit={onExit}
      onQuestions={onQuestions}
    >
      <LevelStrip count={TRIP_PLAYS.length} current={level.id} onPick={setLevelId} />
      <p className="text-sm text-mist">{level.blurb}</p>

      <div
        className={`mt-3 overflow-hidden rounded-2xl border bg-ink transition-[border-color,box-shadow] duration-150 ${
          solved
            ? "border-mint/60 shadow-[0_0_28px_rgba(143,208,176,0.10)]"
            : running
              ? "border-gold/65 shadow-[0_0_26px_rgba(228,177,90,0.10)]"
              : "border-line"
        }`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-line/70 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em]">
          <span className="text-mist">Constant-speed track</span>
          <span className={running ? "text-gold" : solved ? "text-mint" : "text-mist"}>
            {running ? "in motion" : solved ? "on target" : "ready"}
          </span>
        </div>
        <Track
          play={level}
          speed={speed}
          time={time}
          distance={token === 0 ? 0 : cruise.distance}
          elapsed={token === 0 ? 0 : cruise.elapsed}
          running={running}
          solved={solved}
        />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 font-mono text-xs">
        <Readout label="Speed" value={`${speed} m/s`} active={running} />
        <Readout
          label="Elapsed"
          value={`${(token === 0 ? 0 : cruise.elapsed).toFixed(1)} s`}
          active={running}
        />
        <Readout
          label="Distance"
          value={`${(token === 0 ? 0 : cruise.distance).toFixed(1)} m`}
          active={running}
        />
      </div>

      <p className="mt-3 text-center font-mono text-lg text-cream">
        {speed} m/s × {time} s = {product} m
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <MotionDial
          label="Speed"
          unit="m/s"
          value={speed}
          min={1}
          max={level.maxSpeed}
          locked={level.aim === "time" || running}
          onChange={(next) => retune(next, time)}
        />
        <MotionDial
          label="Time"
          unit="s"
          value={time}
          min={1}
          max={level.maxTime}
          locked={level.aim === "speed" || running}
          onChange={(next) => retune(speed, next)}
        />
      </div>

      {level.aim === "either" && pairs.length > 1 ? (
        <p className="mt-2 text-xs text-mist">
          This target has {pairs.length} legal whole-number speed/time pairs on this bench. Any one counts.
        </p>
      ) : null}

      <p className="mt-3 text-sm leading-relaxed text-cream">{TRIP_LAW}</p>
      <p className="mt-3 font-mono text-sm text-gold" aria-live="polite">
        {status}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={running}
          onClick={() => setToken((current) => current + 1)}
          className="min-h-11 rounded-full bg-gold px-4 text-sm font-extrabold text-ink disabled:opacity-45"
        >
          {running ? "Running" : token > 0 ? "Launch again" : "Launch"}
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
          <button
            type="button"
            onClick={() => setLevelId(level.id + 1)}
            className="min-h-11 rounded-full border border-gold px-4 text-sm font-extrabold text-gold"
          >
            Next
          </button>
        ) : null}
        <p className="self-center font-mono text-xs text-mist">Run {run}</p>
      </div>
    </BenchFrame>
  );
}

function Readout({
  label,
  value,
  active,
}: {
  label: string;
  value: string;
  active: boolean;
}) {
  return (
    <div
      className={`rounded-xl border bg-panel px-3 py-2 transition-[border-color] duration-150 ${
        active ? "border-gold/60" : "border-line"
      }`}
    >
      <dt className="text-mist">{label}</dt>
      <dd className="mt-1 text-cream">{value}</dd>
    </div>
  );
}
