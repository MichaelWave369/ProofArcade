import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { detectCapabilities } from "@/game/render/capabilities";
import { curveY, createPool, stepPool, type Wave } from "@/game/render/field";
import {
  FIDELITY_CHOICES,
  loadFidelity,
  present,
  qualifyBackend,
  qualifyVisit,
  saveFidelity,
  summarizeFrames,
  type DrawBackend,
  type FidelityChoice,
  type LabReceipt,
} from "@/game/render/quality";
import { openLabSurface, type LabSurface } from "@/game/render/surface";

const DEFAULT_WAVES: Wave[] = [
  { amp: 0.35, freq: 2, phase: 0 },
  { amp: 0.22, freq: 3, phase: 1 },
];

type Bench = {
  backend: DrawBackend;
  avgFps: number;
  p50Ms: number;
  p95Ms: number;
  frames: number;
  particles: number;
  width: number;
  height: number;
  dpr: number;
};

function drawingName(backend: DrawBackend) {
  if (backend === "webgpu") return "WebGPU";
  if (backend === "webgl2") return "WebGL2";
  return "page drawing";
}

function describe(backend: DrawBackend, choice: FidelityChoice, reduced: boolean) {
  let text = `This screen is using ${drawingName(backend)}.`;
  if (choice === "ULTRA" && backend !== "webgpu") text += " Ultra needs WebGPU, so this screen stepped down.";
  if (reduced) text += " Motion is reduced, so the curves stay put until a control changes.";
  return text;
}

function describeReceipt(receipt: LabReceipt) {
  const facts = `adapter ${receipt.adapter} · device ${receipt.device} · shader ${receipt.shader} · pipeline ${receipt.pipeline}`;
  const verdict = qualifyBackend(receipt);
  let meaning = "Init fail. The reported path does not match the facts.";
  if (verdict === "pass" && receipt.actual === "webgpu") {
    meaning = "Init pass. Adapter, device, shader, and pipelines all came from this visit.";
  } else if (verdict === "pass" && receipt.requested === "webgpu") {
    meaning = "Init pass. WebGPU did not finish, so the fallback is honest. Those facts were not filled in.";
  } else if (verdict === "pass") {
    meaning = "Init pass. This visit is using the drawing path it asked for.";
  }
  return `Requested ${drawingName(receipt.requested)}. Actual ${drawingName(receipt.actual)}. ${facts}. ${meaning}`;
}

export function InstrumentLab({ onExit }: { onExit?: () => void }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const wavesRef = useRef<Wave[]>(DEFAULT_WAVES.map((wave) => ({ ...wave })));
  const sampleRef = useRef<{ dts: number[]; until: number } | null>(null);
  const [waves, setWaves] = useState<Wave[]>(() => wavesRef.current.map((wave) => ({ ...wave })));
  const [choice, setChoice] = useState<FidelityChoice>("AUTO");
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("Choosing a drawing mode for this device.");
  const [receipt, setReceipt] = useState<LabReceipt | null>(null);
  const [measuring, setMeasuring] = useState(false);
  const [bench, setBench] = useState<Bench | null>(null);

  useEffect(() => {
    setChoice(loadFidelity());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;
    let raf = 0;
    let surface: LabSurface | null = null;
    const caps = detectCapabilities();
    const view = present(choice, caps);
    const pool = createPool(view.particles);
    let time = 0;
    let last = performance.now();
    setMeasuring(true);
    setBench(null);
    setReceipt(null);
    sampleRef.current = null;

    const resize = () => {
      if (!surface) return;
      const rect = host.getBoundingClientRect();
      surface.resize(Math.max(rect.width, 1), Math.max(rect.height, 1), view.dpr);
    };
    const observer = new ResizeObserver(resize);

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!surface || document.hidden) {
        const sample = sampleRef.current;
        if (sample) sample.until += Math.max(0, now - last);
        last = now;
        return;
      }
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      const current = wavesRef.current;
      if (caps.reducedMotion) {
        for (const particle of pool) {
          particle.y = curveY(particle.x, current, time);
          particle.vy = 0;
          particle.trail = [];
        }
      } else {
        time += dt;
        stepPool(pool, dt, current, time);
      }
      surface.draw({ time, waves: current, particles: pool, reducedMotion: caps.reducedMotion });
      const sample = sampleRef.current;
      if (!sample) return;
      sample.dts.push(dt);
      if (now < sample.until) return;
      const canvas = host.querySelector("canvas");
      const summary = summarizeFrames(sample.dts);
      sampleRef.current = null;
      setMeasuring(false);
      setBench({
        backend: surface.backend,
        avgFps: summary.avgFps,
        p50Ms: summary.p50Ms,
        p95Ms: summary.p95Ms,
        frames: summary.frames,
        particles: pool.length,
        width: canvas?.width ?? 0,
        height: canvas?.height ?? 0,
        dpr: view.dpr,
      });
    };

    void openLabSurface(host, view.backend).then((opened) => {
      if (cancelled) {
        opened.destroy();
        return;
      }
      surface = opened;
      setReceipt(opened.receipt);
      setStatus(describe(opened.backend, choice, caps.reducedMotion));
      sampleRef.current = { dts: [], until: performance.now() + 3000 };
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
      sampleRef.current = null;
    };
  }, [choice, ready]);

  function pick(next: FidelityChoice) {
    saveFidelity(next);
    setChoice(next);
  }

  function tune(index: number, key: "amp" | "freq" | "phase", value: number) {
    const next = wavesRef.current.map((wave, waveIndex) => (waveIndex === index ? { ...wave, [key]: value } : wave));
    wavesRef.current = next;
    setWaves(next);
  }

  function measure() {
    setBench(null);
    setMeasuring(true);
    sampleRef.current = { dts: [], until: performance.now() + 3000 };
  }

  const caption = `Wave bench. Wave A amplitude ${waves[0].amp.toFixed(2)}, frequency ${waves[0].freq.toFixed(1)}, phase ${waves[0].phase.toFixed(2)}. Wave B amplitude ${waves[1].amp.toFixed(2)}, frequency ${waves[1].freq.toFixed(1)}, phase ${waves[1].phase.toFixed(2)}. The cream curve is their sum.`;

  return (
    <main className="relative flex h-dvh flex-col overflow-hidden bg-ink text-cream">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-6">
        <div>
          <p className="font-mono text-xs tracking-widest text-gold">INSTRUMENT LAB</p>
          <h1 className="text-2xl font-extrabold tracking-tight">Wave bench</h1>
        </div>
        {onExit ? (
          <button type="button" onClick={onExit} className="inline-flex min-h-11 items-center font-mono text-xs tracking-widest text-gold">
            Floor
          </button>
        ) : (
          <Link to="/" className="inline-flex min-h-11 items-center font-mono text-xs tracking-widest text-gold">
            Floor
          </Link>
        )}
      </header>
      <div className="relative h-1/2 min-h-40 shrink-0">
        <div ref={hostRef} className="absolute inset-0" role="img" aria-label={caption} />
      </div>
      <section className="min-h-0 flex-1 overflow-y-auto border-t border-line bg-ink px-4 py-3 sm:px-6">
        <p className="text-sm leading-relaxed text-mist" aria-live="polite">
          {status}
        </p>
        <p className="mt-1 font-mono text-xs leading-relaxed text-cream" aria-live="polite">
          {receipt ? describeReceipt(receipt) : "Reading the drawing path from this device."}
        </p>
        <p className="mt-1 font-mono text-xs text-cream">sum = A sin(2π fA x + φA) + B sin(2π fB x + φB)</p>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Drawing fidelity">
          {FIDELITY_CHOICES.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={choice === item}
              onClick={() => pick(item)}
              className={
                choice === item
                  ? "min-h-11 shrink-0 rounded-full bg-gold px-3 text-xs font-extrabold text-ink"
                  : "min-h-11 shrink-0 rounded-full border border-line bg-panel px-3 text-xs font-bold text-mist"
              }
            >
              {item}
            </button>
          ))}
        </div>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <WaveControls title="Wave A" tone="text-mint" wave={waves[0]} onChange={(key, value) => tune(0, key, value)} />
          <WaveControls title="Wave B" tone="text-gold" wave={waves[1]} onChange={(key, value) => tune(1, key, value)} />
        </div>
        <p className="mt-3 text-sm text-mist">Peaks that meet grow. Peaks that oppose cancel. The cream curve is that sum.</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={measure}
            disabled={measuring}
            className="min-h-11 rounded-full bg-gold px-4 text-sm font-extrabold text-ink disabled:opacity-60"
          >
            {measuring ? "Measuring…" : "Measure this device"}
          </button>
          <p className="text-xs text-mist">The check stays on this device. Nothing is sent.</p>
        </div>
        <p className="mt-2 font-mono text-xs leading-relaxed text-cream" aria-live="polite">
          {measuring && !bench
            ? "Measuring…"
            : bench
              ? `${drawingName(bench.backend)} · ${bench.avgFps.toFixed(1)} fps average · p50 ${bench.p50Ms.toFixed(2)} ms · p95 ${bench.p95Ms.toFixed(2)} ms · ${bench.frames} frames · ${bench.particles} particles · ${bench.width}×${bench.height} px · dpr ${bench.dpr}. ${
                  qualifyVisit(bench) === "clear"
                    ? "This visit cleared the bench: at least 50 fps average and a p95 under 34 ms."
                    : "This visit missed the bench. Drop fidelity if the picture stutters. A clear visit is at least 50 fps average and a p95 under 34 ms."
                }`
              : "Not measured on this visit. A clear visit is at least 50 fps average and a p95 under 34 ms."}
        </p>
      </section>
    </main>
  );
}

function WaveControls({
  title,
  tone,
  wave,
  onChange,
}: {
  title: string;
  tone: string;
  wave: Wave;
  onChange: (key: "amp" | "freq" | "phase", value: number) => void;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className={`font-mono text-xs tracking-widest ${tone}`}>{title}</legend>
      <Slider label="Amplitude" min={0} max={0.55} step={0.01} value={wave.amp} digits={2} onChange={(value) => onChange("amp", value)} />
      <Slider label="Frequency" min={1} max={6} step={1} value={wave.freq} digits={0} onChange={(value) => onChange("freq", value)} />
      <Slider label="Phase" min={0} max={6.28} step={0.01} value={wave.phase} digits={2} onChange={(value) => onChange("phase", value)} />
    </fieldset>
  );
}

function Slider({
  label,
  min,
  max,
  step,
  value,
  digits,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  digits: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="mt-2 flex min-h-11 items-center gap-3 text-xs">
      <span className="w-24 shrink-0 font-mono tracking-widest text-mist">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-11 min-w-0 flex-1 accent-gold"
      />
      <span className="w-12 text-right font-mono text-cream">{value.toFixed(digits)}</span>
    </label>
  );
}
