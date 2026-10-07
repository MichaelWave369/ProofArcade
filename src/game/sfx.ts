type SfxName = "shoot" | "stick" | "pop" | "fall" | "drop" | "wave" | "over" | "ui";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;

export function unlockAudio() {
  const w = window as Window & { webkitAudioContext?: typeof AudioContext };
  const AC = window.AudioContext ?? w.webkitAudioContext;
  if (!AC) return;
  if (!ctx) {
    ctx = new AC({ latencyHint: "interactive" });
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.22;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
}

export function setMuted(next: boolean) {
  muted = next;
  if (master && ctx) master.gain.setTargetAtTime(next ? 0 : 0.22, ctx.currentTime, 0.02);
}

export function resumeAudio() {
  if (ctx?.state === "suspended") void ctx.resume();
}

function envGain(when: number, peak: number, dur: number, delay = 0) {
  if (!ctx || !master) return null;
  const gain = ctx.createGain();
  const t0 = ctx.currentTime + delay;
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  gain.connect(master);
  return { gain, t0 };
}

function tone(freq: number, dur: number, type: OscillatorType, peak: number, delay = 0) {
  if (!ctx) return;
  const routed = envGain(0, peak, dur, delay);
  if (!routed) return;
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, routed.t0);
  osc.connect(routed.gain);
  osc.start(routed.t0);
  osc.stop(routed.t0 + dur + 0.02);
  osc.onended = () => {
    osc.disconnect();
    routed.gain.disconnect();
  };
}

function noise(dur: number, peak: number, delay = 0) {
  if (!ctx) return;
  const routed = envGain(0, peak, dur, delay);
  if (!routed) return;
  const frames = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 900;
  src.connect(filter);
  filter.connect(routed.gain);
  src.start(routed.t0);
  src.stop(routed.t0 + dur);
  src.onended = () => {
    src.disconnect();
    filter.disconnect();
    routed.gain.disconnect();
  };
}

export function playSfx(name: SfxName, pitch = 1) {
  if (!ctx || muted) return;
  const wobble = 0.96 + Math.random() * 0.08;
  if (name === "shoot") {
    tone(620 * wobble, 0.07, "triangle", 0.18);
    noise(0.04, 0.05);
  } else if (name === "stick") {
    tone(180 * wobble, 0.08, "sine", 0.16);
    tone(90, 0.1, "sine", 0.1);
  } else if (name === "pop") {
    const p = Math.max(1, pitch);
    const base = 520 * wobble * (1 + (p - 1) * 0.08);
    tone(base, 0.12, "sine", 0.2);
    tone(base * 1.5, 0.14, "triangle", 0.08, 0.02);
    noise(0.05, 0.04);
  } else if (name === "fall") {
    tone(240 * wobble, 0.16, "sine", 0.08);
    tone(140, 0.22, "triangle", 0.06, 0.03);
  } else if (name === "drop") {
    tone(110, 0.2, "sine", 0.18);
    tone(70, 0.28, "triangle", 0.1, 0.02);
  } else if (name === "wave") {
    tone(523, 0.12, "triangle", 0.12);
    tone(659, 0.14, "triangle", 0.1, 0.08);
    tone(784, 0.18, "sine", 0.12, 0.16);
  } else if (name === "over") {
    tone(392, 0.16, "sine", 0.12);
    tone(311, 0.2, "sine", 0.1, 0.1);
    tone(233, 0.32, "triangle", 0.1, 0.2);
  } else {
    tone(740 * wobble, 0.05, "sine", 0.08);
  }
}
