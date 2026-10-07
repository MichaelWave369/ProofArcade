import { useEffect, useMemo, useRef, useState } from "react";
import { prefersReducedMotion } from "@/components/use-arrive";
import {
  DT,
  STEPS,
  SURFACE,
  acceleration,
  bodyFrom,
  orbitElements,
  specificAngularMomentum,
  specificEnergy,
  stepBody,
  type Body,
  type Launch,
} from "@/game/orbit/sim";

const SCALE = 36;
const SIM_RATES = [1, 4, 12] as const;

function toX(x: number) {
  return 160 + x * SCALE;
}

function toY(y: number) {
  return 160 - y * SCALE;
}

function pointsOf(samples: readonly Body[]) {
  return samples.map((body) => `${toX(body.x)},${toY(body.y)}`).join(" ");
}

function drift(now: number, reference: number) {
  return Math.abs(now - reference) / Math.max(Math.abs(reference), 1e-9);
}

function percent(value: number) {
  return `${(value * 100).toExponential(1)}%`;
}

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-panel px-3 py-2">
      <dt className="text-mist">{label}</dt>
      <dd className="mt-1 text-cream">{value}</dd>
    </div>
  );
}

function Sky({
  body,
  trail,
  prediction,
  reveal,
  vectors,
}: {
  body: Body;
  trail: Body[];
  prediction: Body[];
  reveal: boolean;
  vectors: boolean;
}) {
  const gravity = acceleration(body.x, body.y);
  const velocityScale = 24;
  const gravityScale = 18;

  return (
    <svg
      viewBox="0 0 320 320"
      className="h-72 w-full"
      role="img"
      aria-label={`Craft at x ${body.x.toFixed(2)}, y ${body.y.toFixed(2)} around one fixed mass`}
    >
      <defs>
        <marker id="orbit-v" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" className="text-gold" fill="currentColor" />
        </marker>
        <marker id="orbit-g" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" className="text-mint" fill="currentColor" />
        </marker>
      </defs>

      <circle cx="160" cy="160" r={SURFACE * SCALE} className="text-gold" fill="currentColor" />
      {[1, 2].map((radius) => (
        <circle
          key={radius}
          cx="160"
          cy="160"
          r={radius * SCALE}
          className="text-line"
          fill="none"
          stroke="currentColor"
        />
      ))}
      <circle cx="160" cy="160" r={3 * SCALE} className="text-line" fill="none" stroke="currentColor" strokeDasharray="3 4" opacity="0.55" />

      {reveal && prediction.length > 1 ? (
        <polyline
          points={pointsOf(prediction)}
          fill="none"
          className="text-mint"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeDasharray="4 4"
          opacity="0.42"
        />
      ) : null}

      {trail.length > 1 ? (
        <polyline
          points={pointsOf(trail)}
          fill="none"
          className="text-gold"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}

      {vectors ? (
        <>
          <line
            x1={toX(body.x)}
            y1={toY(body.y)}
            x2={toX(body.x) + body.vx * velocityScale}
            y2={toY(body.y) - body.vy * velocityScale}
            className="text-gold"
            stroke="currentColor"
            strokeWidth="2"
            markerEnd="url(#orbit-v)"
          />
          <line
            x1={toX(body.x)}
            y1={toY(body.y)}
            x2={toX(body.x) + gravity.ax * gravityScale}
            y2={toY(body.y) - gravity.ay * gravityScale}
            className="text-mint"
            stroke="currentColor"
            strokeWidth="1.7"
            markerEnd="url(#orbit-g)"
          />
        </>
      ) : null}

      <circle cx={toX(body.x)} cy={toY(body.y)} r="5.5" className="text-cream" fill="currentColor" />
      <circle cx={toX(body.x)} cy={toY(body.y)} r="10" className="text-cream" fill="none" stroke="currentColor" opacity="0.3" />

      <text x="12" y="20" className="fill-current font-mono text-[9px] text-gold">velocity</text>
      <text x="12" y="34" className="fill-current font-mono text-[9px] text-mint">gravity</text>
    </svg>
  );
}

export function OrbitLiveSky({
  launch,
  prediction,
  runToken,
  active,
}: {
  launch: Launch;
  prediction: Body[];
  runToken: number;
  active: boolean;
}) {
  const startBody = useMemo(() => bodyFrom(launch), [launch.radius, launch.angle, launch.heading, launch.speed]);
  const [body, setBody] = useState(startBody);
  const [trail, setTrail] = useState<Body[]>([startBody]);
  const [simTime, setSimTime] = useState(0);
  const [simRate, setSimRate] = useState<(typeof SIM_RATES)[number]>(4);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [vectors, setVectors] = useState(true);
  const bodyRef = useRef(startBody);
  const trailRef = useRef<Body[]>([startBody]);
  const timeRef = useRef(0);
  const stepsRef = useRef(0);
  const reduced = prefersReducedMotion();

  useEffect(() => {
    const start = bodyFrom(launch);
    bodyRef.current = start;
    trailRef.current = [start];
    timeRef.current = 0;
    stepsRef.current = 0;
    setBody(start);
    setTrail([start]);
    setSimTime(0);
    setPaused(false);

    if (runToken === 0) {
      setRunning(false);
      return;
    }

    if (reduced) {
      const end = prediction[prediction.length - 1] ?? start;
      bodyRef.current = end;
      trailRef.current = prediction.length > 0 ? prediction : [start];
      setBody(end);
      setTrail(trailRef.current);
      setRunning(false);
      return;
    }

    setRunning(true);
  }, [runToken, launch.radius, launch.angle, launch.heading, launch.speed, prediction, reduced]);

  useEffect(() => {
    if (!active || !running || paused) return;
    let raf = 0;
    let last = performance.now();
    let accumulator = 0;

    const loop = (now: number) => {
      const realDt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      accumulator += realDt * simRate;
      let steps = Math.min(180, Math.floor(accumulator / DT));

      if (steps <= 0) {
        raf = requestAnimationFrame(loop);
        return;
      }

      accumulator -= steps * DT;
      let current = bodyRef.current;
      let ended = false;

      while (steps > 0 && !ended) {
        current = stepBody(current);
        stepsRef.current += 1;
        timeRef.current += DT;

        if (stepsRef.current % 6 === 0) {
          trailRef.current = [...trailRef.current, { ...current }];
        }

        const radius = Math.hypot(current.x, current.y);
        if (radius < SURFACE || radius > 14 || stepsRef.current >= STEPS) {
          if (stepsRef.current % 6 !== 0) trailRef.current = [...trailRef.current, { ...current }];
          ended = true;
        }
        steps -= 1;
      }

      bodyRef.current = current;
      setBody({ ...current });
      setTrail(trailRef.current);
      setSimTime(timeRef.current);

      if (ended) {
        setRunning(false);
        return;
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, running, paused, simRate]);

  const reference = orbitElements(startBody);
  const current = orbitElements(body);
  const energyError = drift(specificEnergy(body), reference.energy);
  const hError = drift(specificAngularMomentum(body), reference.angularMomentum);
  const reveal = runToken > 0 && (simTime >= 1.1 || paused || !running || reduced);

  return (
    <>
      <div className="mt-3 overflow-hidden rounded-2xl border border-line bg-ink">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/70 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em]">
          <span className="text-mist">Velocity-Verlet flight bench</span>
          <span className={running ? "text-gold" : paused ? "text-mint" : "text-mist"}>
            {running ? (paused ? "paused" : `${simRate}× simulation`) : runToken > 0 ? "run complete" : "ready"}
          </span>
        </div>
        <Sky body={body} trail={trail} prediction={prediction} reveal={reveal} vectors={vectors} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-xs sm:grid-cols-4">
        <Readout label="sim time" value={simTime.toFixed(2)} />
        <Readout label="radius" value={Math.hypot(body.x, body.y).toFixed(3)} />
        <Readout label="energy ε" value={current.energy.toFixed(5)} />
        <Readout label="angular h" value={current.angularMomentum.toFixed(5)} />
        <Readout label="eccentricity" value={current.eccentricity.toFixed(4)} />
        <Readout label="semi-major a" value={current.semiMajorAxis === null ? "unbound" : current.semiMajorAxis.toFixed(4)} />
        <Readout label="energy drift" value={percent(energyError)} />
        <Readout label="h drift" value={percent(hError)} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-panel px-3 py-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-mist">Sim speed</span>
        {SIM_RATES.map((rate) => (
          <button
            key={rate}
            type="button"
            onClick={() => setSimRate(rate)}
            className={`min-h-9 rounded-full border px-3 font-mono text-xs ${simRate === rate ? "border-gold bg-gold text-ink" : "border-line text-cream"}`}
          >
            {rate}×
          </button>
        ))}
        {running ? (
          <button type="button" onClick={() => setPaused((value) => !value)} className="min-h-9 rounded-full border border-line px-3 text-xs text-cream">
            {paused ? "Resume" : "Pause"}
          </button>
        ) : null}
        <button type="button" onClick={() => setVectors((shown) => !shown)} className="min-h-9 rounded-full border border-line px-3 text-xs text-cream">
          {vectors ? "Hide vectors" : "Show vectors"}
        </button>
      </div>

      <p className="mt-2 font-mono text-xs text-mist">
        {reveal
          ? "Dashed mint is the delayed prediction. Solid gold is the path integrated live."
          : runToken > 0
            ? "Future prediction stays hidden during the opening part of the run."
            : "No future orbit is drawn before launch."}
      </p>
    </>
  );
}
