import { useEffect, useRef, useState } from "react";
import { BenchFrame, LevelStrip, QuestionsChip } from "@/components/bench-frame";
import { RoundProof } from "@/components/round-proof";
import { prefersReducedMotion } from "@/components/use-arrive";
import { noteClear } from "@/game/progress";
import { detectCapabilities } from "@/game/render/capabilities";
import { curveY, createPool, stepPool, type Wave } from "@/game/render/field";
import { loadFidelity, present } from "@/game/render/quality";
import { openLabSurface, type LabSurface } from "@/game/render/surface";
import { WAVE_LEVELS, auditWave, type WavePrompt, type WaveScene } from "@/game/waves/levels";
import {
  WAVE_PLAYS,
  freqFromLength,
  interferenceMetrics,
  judgeWave,
  normalizedWaveTime,
  standingNodes,
  waveLength,
  type WavePlay,
} from "@/game/waves/play";

function bake(wave: Wave, time: number): Wave {
  const dir = wave.dir === -1 ? -1 : 1;
  return { amp: wave.amp, freq: wave.freq, phase: wave.phase + dir * time };
}

function fieldOpen(lock: WavePlay["locks"][number] | undefined, key: "amp" | "freq" | "phase" | "dir") {
  if (!lock || Object.keys(lock).length === 0) return true;
  return lock[key] === false;
}

function WaveFigure({ scene }: { scene: WaveScene }) {
  const wave = [{ amp: scene.amp, freq: scene.freq, phase: scene.phase }];
  const points: string[] = [];
  for (let i = 0; i <= 80; i++) {
    const x = i / 80;
    points.push(`${10 + x * 200},${10 + (1 - curveY(x, wave, 0)) * 88}`);
  }
  return (
    <div>
      <svg viewBox="0 0 220 108" className="mx-auto h-36 w-full max-w-xs" role="img" aria-label={`${scene.freq} full waves across the bench`}>
        <line x1="10" y1="54" x2="210" y2="54" className="text-line" stroke="currentColor" />
        <polyline points={points.join(" ")} className="text-gold" fill="none" stroke="currentColor" strokeWidth="2.5" />
      </svg>
      <p className="mt-1 text-center font-mono text-xs text-mist">Count the crests from the left edge to the right edge.</p>
    </div>
  );
}

function WaveQuestions({ active, onExit }: { active?: boolean; onExit?: () => void }) {
  return (
    <RoundProof<WavePrompt>
      active={active}
      onExit={onExit}
      track="waves"
      mark="∿"
      title="Wave Lab"
      menuKicker="PHYSICS"
      menuTitle="Count the crests."
      menuBody="The curve is one sine wave. Count how many full waves fit across the bench. Keys 1 to 4. A miss costs a heart. Sixteen levels."
      levels={WAVE_LEVELS}
      audit={auditWave}
      renderScene={(prompt) => <WaveFigure scene={prompt.scene} />}
    />
  );
}

function Ghost({ waves, time }: { waves: Wave[]; time: number }) {
  const shown = waves.map((wave) => bake(wave, time));
  const points: string[] = [];
  for (let i = 0; i <= 96; i++) {
    const x = i / 96;
    points.push(`${x * 100},${(1 - curveY(x, shown, 0)) * 100}`);
  }
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
      <polyline points={points.join(" ")} fill="none" stroke="#f4efe4" strokeOpacity="0.45" strokeDasharray="1.4 1.1" strokeWidth="0.7" />
    </svg>
  );
}


function WaveOverlay({
  waves,
  time,
  standing,
}: {
  waves: Wave[];
  time: number;
  standing: boolean;
}) {
  const nodes = standing ? standingNodes(waves) : [];
  const metrics = interferenceMetrics(waves, time);

  return (
    <>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        {nodes.map((node) => (
          <g key={node} className="wave-node-pulse text-mint">
            <line
              x1={node * 100}
              y1="7"
              x2={node * 100}
              y2="93"
              stroke="currentColor"
              strokeWidth="0.45"
              strokeDasharray="1.1 1.4"
            />
            <circle cx={node * 100} cy="50" r="1.4" fill="currentColor" />
          </g>
        ))}
      </svg>
      <div className="pointer-events-none absolute bottom-2 left-2 rounded-lg border border-line/80 bg-ink/80 px-2 py-1 font-mono text-[10px] text-mist backdrop-blur-sm">
        <span className="text-cream">sum RMS {metrics.sumRms.toFixed(3)}</span>
        <span className="mx-2 text-line">·</span>
        components {metrics.componentRms.toFixed(3)}
        {standing && nodes.length > 0 ? (
          <>
            <span className="mx-2 text-line">·</span>
            <span className="text-mint">{nodes.length} fixed nodes</span>
          </>
        ) : null}
      </div>
    </>
  );
}

function Slider({
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
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <label className={`mt-2 flex min-h-11 items-center gap-3 text-xs ${disabled ? "opacity-40" : ""}`}>
      <span className="w-24 shrink-0 font-mono tracking-widest text-mist">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        className="wave-range h-11 min-w-0 flex-1"
      />
      <span className="w-14 text-right font-mono text-cream">{value.toFixed(digits)}</span>
    </label>
  );
}

export function WaveProof({ active = true, onExit }: { active?: boolean; onExit?: () => void }) {
  const [mode, setMode] = useState<"play" | "questions">("play");
  if (mode === "questions") {
    return (
      <div className="relative h-dvh">
        <WaveQuestions active={active} onExit={onExit} />
        <QuestionsChip label="Bench" onClick={() => setMode("play")} />
      </div>
    );
  }
  return <WaveBench active={active} onExit={onExit} onQuestions={() => setMode("questions")} />;
}

function WaveBench({ active, onExit, onQuestions }: { active: boolean; onExit?: () => void; onQuestions: () => void }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const playRef = useRef<WavePlay>(WAVE_PLAYS[0]);
  const wavesRef = useRef<Wave[]>(WAVE_PLAYS[0].start.map((wave) => ({ ...wave })));
  const timeRef = useRef(0);
  const [levelId, setLevelId] = useState(1);
  const [waves, setWaves] = useState<Wave[]>(() => wavesRef.current.map((wave) => ({ ...wave })));
  const [clock, setClock] = useState(0);
  const [run, setRun] = useState(0);
  const [locked, setLocked] = useState(false);
  const [paused, setPaused] = useState(false);
  const [backend, setBackend] = useState("pending");
  const pausedRef = useRef(false);
  const holdRef = useRef<number | null>(null);
  const level = WAVE_PLAYS[levelId - 1] ?? WAVE_PLAYS[0];
  playRef.current = level;

  useEffect(() => {
    const next = level.start.map((wave) => ({ ...wave }));
    wavesRef.current = next;
    setWaves(next);
    setLocked(false);
    pausedRef.current = false;
    setPaused(false);
    timeRef.current = 0;
    setClock(0);
  }, [level]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !active) return;
    let cancelled = false;
    let raf = 0;
    let surface: LabSurface | null = null;
    const caps = detectCapabilities();
    const view = present(loadFidelity(), caps);
    const pool = createPool(Math.min(view.particles, 96));
    let last = performance.now();
    const resize = () => {
      if (!surface) return;
      const rect = host.getBoundingClientRect();
      surface.resize(Math.max(rect.width, 1), Math.max(rect.height, 1), view.dpr);
    };
    const observer = new ResizeObserver(resize);
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!surface || document.hidden) {
        last = now;
        return;
      }
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      if (!caps.reducedMotion && !pausedRef.current) timeRef.current += dt;
      const time = timeRef.current;
      const shown = [...playRef.current.fixed, ...wavesRef.current].slice(0, 2).map((wave) => bake(wave, time));
      if (caps.reducedMotion || pausedRef.current) {
        for (const particle of pool) {
          particle.y = curveY(particle.x, shown, 0);
          particle.vy = 0;
          if (caps.reducedMotion) particle.trail = [];
        }
      } else {
        stepPool(pool, dt, shown, 0);
      }
      surface.draw({ time: 0, waves: shown, particles: pool, reducedMotion: caps.reducedMotion });
      if (
        Math.floor(now / 80) !== Math.floor((now - dt * 1000) / 80) ||
        pausedRef.current
      ) {
        setClock(time);
      }
    };
    void openLabSurface(host, view.backend).then((opened) => {
      if (cancelled) {
        opened.destroy();
        return;
      }
      surface = opened;
      setBackend(opened.backend);
      resize();
      observer.observe(host);
      raf = requestAnimationFrame(loop);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      surface?.destroy();
      host.replaceChildren();
    };
  }, [active]);

  function setPause(next: boolean) {
    pausedRef.current = next;
    setPaused(next);
  }

  function scrubTime(value: number) {
    const next = normalizedWaveTime(value);
    timeRef.current = next;
    setClock(next);
    setPause(true);
  }

  function tune(index: number, patch: Partial<Wave>) {
    const next = wavesRef.current.map((wave, waveIndex) => (waveIndex === index ? { ...wave, ...patch } : { ...wave }));
    wavesRef.current = next;
    setWaves(next);
    if (prefersReducedMotion()) {
      timeRef.current += 0.45;
      setClock(timeRef.current);
    }
  }

  const judgement = judgeWave(level, waves);
  const ghost = level.kind === "match" || level.kind === "identify";
  const rawFieldWaves = [...level.fixed, ...waves].slice(0, 2);
  const phaseClock = normalizedWaveTime(clock);

  function clearHold() {
    if (holdRef.current !== null) window.clearTimeout(holdRef.current);
    holdRef.current = null;
  }

  function beginHold() {
    if (!judgement.ok || locked) return;
    clearHold();
    holdRef.current = window.setTimeout(() => {
      setLocked(true);
      setRun((total) => {
        const next = total + judgement.score;
        noteClear("waves", level.id, judgement.score, next);
        return next;
      });
    }, 560);
  }

  return (
    <BenchFrame kicker="WAVE LAB" title={level.title} meta={`${level.id}/16`} onExit={onExit} onQuestions={onQuestions}>
      <LevelStrip count={WAVE_PLAYS.length} current={level.id} onPick={setLevelId} />
      <p className="text-sm text-mist">{level.blurb}</p>
      <div className="relative mt-3 h-52 overflow-hidden rounded-2xl border border-line sm:h-64">
        <div ref={hostRef} className="absolute inset-0" />
        {ghost ? <Ghost waves={level.solution} time={clock} /> : null}
        <WaveOverlay
          waves={rawFieldWaves}
          time={clock}
          standing={level.kind === "standing"}
        />
        {level.kind === "cancel" ? <div className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-dashed border-cream/40" /> : null}
        <div className="pointer-events-none absolute right-2 top-2 rounded-full border border-line/80 bg-ink/80 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-mist backdrop-blur-sm">
          {backend}
        </div>
      </div>
      <p className="mt-2 font-mono text-xs text-mist">Mint is the first wave. Gold is the second. Cream is their sum. Medium markers stay at fixed horizontal positions and move only with local displacement.</p>
      {level.fixed.length > 0 ? <p className="mt-1 text-xs text-mist">A wave on this bench is fixed. You edit only the open controls.</p> : null}
      <div className="mt-3 rounded-xl border border-line bg-panel px-3 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPause(!paused)}
            className="min-h-10 rounded-full border border-line px-4 text-sm text-cream"
          >
            {paused ? "Play" : "Pause"}
          </button>
          <button
            type="button"
            onClick={() => scrubTime(0)}
            className="min-h-10 rounded-full border border-line px-4 text-sm text-cream"
          >
            Zero clock
          </button>
          <p className="font-mono text-xs text-mist">
            phase time <span className="text-cream">{phaseClock.toFixed(2)}</span> rad
          </p>
        </div>
        <label className="mt-2 flex items-center gap-3">
          <span className="w-20 shrink-0 font-mono text-[10px] uppercase tracking-widest text-mist">
            Time scrub
          </span>
          <input
            type="range"
            min={0}
            max={Math.PI * 2}
            step={0.02}
            value={phaseClock}
            onChange={(event) => scrubTime(Number(event.currentTarget.value))}
            className="wave-time-range h-10 min-w-0 flex-1"
          />
        </label>
        <p className="mt-1 text-[11px] text-mist">
          Scrubbing pauses the normalized phase clock so interference and standing nodes can be inspected frame by frame.
        </p>
      </div>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        {waves.map((wave, index) => {
          const lock = level.locks[index];
          const name = level.fixed.length > 0 ? "Your wave" : index === 0 ? "Wave A" : "Wave B";
          const tone = level.fixed.length > 0 || index > 0 ? "text-gold" : "text-mint";
          return (
            <fieldset key={`${level.id}-${index}`} className="min-w-0">
              <legend className={`font-mono text-xs tracking-widest ${tone}`}>{name}</legend>
              <Slider label="Amplitude" min={0} max={0.55} step={0.01} value={wave.amp} digits={2} disabled={!fieldOpen(lock, "amp") || locked} onChange={(value) => tune(index, { amp: value })} />
              <Slider label="Frequency" min={1} max={6} step={level.kind === "identify" ? 1 : 0.05} value={wave.freq} digits={2} disabled={!fieldOpen(lock, "freq") || locked} onChange={(value) => tune(index, { freq: value })} />
              <Slider
                label="Wavelength"
                min={1 / 6}
                max={1}
                step={0.01}
                value={Math.min(1, Math.max(1 / 6, waveLength(wave.freq)))}
                digits={2}
                disabled={!fieldOpen(lock, "freq") || locked}
                onChange={(value) => tune(index, { freq: freqFromLength(value) })}
              />
              <Slider label="Phase" min={0} max={6.28} step={0.02} value={wave.phase} digits={2} disabled={!fieldOpen(lock, "phase") || locked} onChange={(value) => tune(index, { phase: value })} />
              {level.kind === "standing" ? (
                <button
                  type="button"
                  disabled={!fieldOpen(lock, "dir") || locked}
                  onClick={() => tune(index, { dir: wave.dir === -1 ? 1 : -1 })}
                  className="mt-2 min-h-11 rounded-full border border-line px-4 text-sm text-cream disabled:opacity-40"
                >
                  {wave.dir === -1 ? "Traveling backward" : "Traveling forward"}
                </button>
              ) : null}
            </fieldset>
          );
        })}
      </div>
      <p className="mt-3 text-sm text-cream" aria-live="polite">
        {locked ? "Locked." : judgement.detail}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={!judgement.ok || locked}
          onPointerDown={beginHold}
          onPointerUp={clearHold}
          onPointerLeave={clearHold}
          onKeyDown={(event) => {
            if (event.key === " " || event.key === "Enter") {
              event.preventDefault();
              beginHold();
            }
          }}
          onKeyUp={clearHold}
          className="min-h-11 rounded-full bg-gold px-4 text-sm font-extrabold text-ink disabled:opacity-40"
        >
          {locked ? "Held" : "Hold to lock"}
        </button>
        {locked && level.id < WAVE_PLAYS.length ? (
          <button type="button" onClick={() => setLevelId(level.id + 1)} className="min-h-11 rounded-full border border-line px-4 text-sm text-cream">
            Next
          </button>
        ) : null}
        <p className="font-mono text-xs text-mist">Run {run}</p>
      </div>
    </BenchFrame>
  );
}
