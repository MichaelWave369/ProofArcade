import { useRef, useState } from "react";
import { BenchFrame, LevelStrip } from "@/components/bench-frame";
import { OrbitLiveSky } from "@/components/orbit-live-sky";
import { noteClear } from "@/game/progress";
import {
  ORBIT_MODEL,
  ORBIT_PLAYS,
  judgeOrbitSamples,
  orbitEditable,
  type OrbitPlay,
} from "@/game/orbit/plays";
import { fly, type Body, type Launch } from "@/game/orbit/sim";

function Dial({
  label,
  min,
  max,
  step,
  value,
  digits,
  disabled,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  digits: number;
  disabled: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <label className={`flex min-h-11 items-center gap-3 text-xs ${disabled ? "opacity-45" : ""}`}>
      <span className="w-28 shrink-0 font-mono tracking-widest text-mist">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
        className="orbit-range h-11 min-w-0 flex-1"
      />
      <span className="w-14 text-right font-mono text-cream">{value.toFixed(digits)}</span>
    </label>
  );
}

export function OrbitProof({
  active = true,
  onExit,
}: {
  active?: boolean;
  onExit?: () => void;
}) {
  const [levelId, setLevelId] = useState(1);
  const play = ORBIT_PLAYS[levelId - 1] ?? ORBIT_PLAYS[0];
  const [launch, setLaunch] = useState<Launch>({ ...play.start });
  const [flight, setFlight] = useState<Body[]>([]);
  const [runToken, setRunToken] = useState(0);
  const [note, setNote] = useState(
    "The future path stays hidden until the launch has actually begun.",
  );
  const [run, setRun] = useState(0);
  const scored = useRef(false);

  function open(next: OrbitPlay) {
    scored.current = false;
    setLaunch({ ...next.start });
    setFlight([]);
    setRunToken(0);
    setNote(
      "Set the open controls, then launch. Grading and the delayed future ghost share one prediction run.",
    );
  }

  function pick(id: number) {
    const next = ORBIT_PLAYS[id - 1];
    if (!next) return;
    setLevelId(id);
    open(next);
  }

  function setField(key: keyof Launch, value: number) {
    if (!orbitEditable(play.locks, key)) return;
    setLaunch((current) => ({ ...current, [key]: value }));
    setFlight([]);
    setRunToken(0);
    setNote("Launch state changed. The previous run was cleared.");
  }

  function commit() {
    const samples = fly(launch);
    const judgement = judgeOrbitSamples(play, samples);
    setFlight(samples);
    setRunToken((token) => token + 1);
    setNote(judgement.detail);

    if (!judgement.ok || scored.current) return;
    scored.current = true;
    const score = 160;
    setRun((total) => {
      const next = total + score;
      noteClear("orbit", play.id, score, next);
      return next;
    });
  }

  const guide = flight.length > 0 ? judgeOrbitSamples(play, flight).kind : "unlaunched";

  return (
    <BenchFrame
      kicker="ORBIT"
      title={play.title}
      meta={`${play.id}/16`}
      onExit={onExit}
    >
      <LevelStrip
        count={ORBIT_PLAYS.length}
        current={play.id}
        onPick={(id) => {
          if (id === play.id) open(play);
          else pick(id);
        }}
      />

      <p className="text-sm text-mist">{play.blurb}</p>
      <p className="mt-1 font-mono text-xs text-gold">
        Aim:{" "}
        {play.aim === "aloft"
          ? "stay off the mass"
          : play.aim === "surface"
            ? "meet the mass"
            : play.aim}
      </p>

      <OrbitLiveSky
        launch={launch}
        prediction={flight}
        runToken={runToken}
        active={active}
      />

      <div className="mt-3 grid gap-1">
        <Dial
          label="Radius"
          min={0.5}
          max={2.4}
          step={0.01}
          value={launch.radius}
          digits={2}
          disabled={!orbitEditable(play.locks, "radius")}
          onChange={(value) => setField("radius", value)}
        />
        <Dial
          label="Angle rad"
          min={0}
          max={6.28}
          step={0.01}
          value={launch.angle}
          digits={2}
          disabled={!orbitEditable(play.locks, "angle")}
          onChange={(value) => setField("angle", value)}
        />
        <Dial
          label="Heading rad"
          min={-3.14}
          max={6.28}
          step={0.01}
          value={launch.heading}
          digits={2}
          disabled={!orbitEditable(play.locks, "heading")}
          onChange={(value) => setField("heading", value)}
        />
        <Dial
          label="Speed"
          min={0.2}
          max={2.2}
          step={0.01}
          value={launch.speed}
          digits={2}
          disabled={!orbitEditable(play.locks, "speed")}
          onChange={(value) => setField("speed", value)}
        />
      </div>

      <p className="mt-3 text-sm leading-relaxed text-cream" aria-live="polite">
        {note}
      </p>
      <p className="mt-1 font-mono text-xs text-mist">
        Guide reads: {guide}. {ORBIT_MODEL}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={commit}
          className="min-h-11 rounded-full bg-gold px-4 text-sm font-extrabold text-ink"
        >
          {runToken > 0 ? "Relaunch" : "Launch"}
        </button>
        <button
          type="button"
          onClick={() => open(play)}
          className="min-h-11 rounded-full border border-line px-4 text-sm text-cream"
        >
          Reset
        </button>
        {scored.current && play.id < ORBIT_PLAYS.length ? (
          <button
            type="button"
            onClick={() => pick(play.id + 1)}
            className="min-h-11 rounded-full border border-line px-4 text-sm text-cream"
          >
            Next
          </button>
        ) : null}
        <p className="font-mono text-xs text-mist">Run {run}</p>
      </div>
    </BenchFrame>
  );
}
