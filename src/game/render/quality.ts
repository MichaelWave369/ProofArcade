import type { RendererCapabilities } from "./capabilities.ts";

export type RenderMode = "SAFE" | "STANDARD" | "ENHANCED" | "ULTRA";
export type FidelityChoice = "AUTO" | "LOW" | "MEDIUM" | "HIGH" | "ULTRA";
export type DrawBackend = "webgpu" | "webgl2" | "canvas";

export const FIDELITY_CHOICES: FidelityChoice[] = ["AUTO", "LOW", "MEDIUM", "HIGH", "ULTRA"];

export const FIDELITY_KEY = "proof-arcade-fidelity";

export type FidelityStore = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export type Presentation = {
  choice: FidelityChoice;
  mode: RenderMode;
  backend: DrawBackend;
  particles: number;
  dpr: number;
};

function browserStore(): FidelityStore | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage;
}

export function loadFidelity(store: FidelityStore | null = browserStore()): FidelityChoice {
  const raw = store?.getItem(FIDELITY_KEY);
  if (raw === "AUTO" || raw === "LOW" || raw === "MEDIUM" || raw === "HIGH" || raw === "ULTRA") return raw;
  return "AUTO";
}

export function saveFidelity(choice: FidelityChoice, store: FidelityStore | null = browserStore()) {
  try {
    store?.setItem(FIDELITY_KEY, choice);
  } catch {
    /* ignore quota */
  }
}

export function resolveMode(choice: FidelityChoice, caps: RendererCapabilities): RenderMode {
  if (!caps.webgl2 && !caps.webgpu) return "SAFE";
  if (choice === "LOW") return "SAFE";
  if (choice === "MEDIUM") return caps.webgl2 || caps.webgpu ? "STANDARD" : "SAFE";
  if (choice === "HIGH") return caps.webgl2 || caps.webgpu ? "ENHANCED" : "SAFE";
  if (choice === "ULTRA") {
    if (caps.webgpu) return "ULTRA";
    if (caps.webgl2) return "ENHANCED";
    return "SAFE";
  }
  if (caps.reducedMotion || caps.tier === "low") return "SAFE";
  if (caps.tier === "high" && caps.webgpu) return "ULTRA";
  if (caps.tier === "high" && caps.webgl2) return "ENHANCED";
  if (caps.webgl2 || caps.webgpu) return "STANDARD";
  return "SAFE";
}

export function resolveBackend(mode: RenderMode, caps: RendererCapabilities): DrawBackend {
  if (mode === "ULTRA" && caps.webgpu) return "webgpu";
  if (mode !== "SAFE" && (caps.webgl2 || caps.webgpu)) return caps.webgl2 ? "webgl2" : "webgpu";
  return "canvas";
}

export function particleBudget(mode: RenderMode, reducedMotion: boolean): number {
  if (reducedMotion) return mode === "SAFE" ? 0 : 12;
  if (mode === "SAFE") return 24;
  if (mode === "STANDARD") return 72;
  if (mode === "ENHANCED") return 160;
  return 280;
}

export function cappedDpr(reported: number, mode: RenderMode, coarsePointer: boolean): number {
  const raw = Number.isFinite(reported) && reported > 0 ? reported : 1;
  const cap = mode === "SAFE" ? 1 : mode === "STANDARD" ? 1.25 : coarsePointer ? 1.5 : 2;
  return Math.min(raw, cap);
}

export function present(choice: FidelityChoice, caps: RendererCapabilities): Presentation {
  const mode = resolveMode(choice, caps);
  return {
    choice,
    mode,
    backend: resolveBackend(mode, caps),
    particles: particleBudget(mode, caps.reducedMotion),
    dpr: cappedDpr(caps.devicePixelRatio, mode, caps.coarsePointer),
  };
}

export function qualifyVisit(sample: { avgFps: number; p95Ms: number }): "clear" | "miss" {
  if (sample.avgFps >= 50 && sample.p95Ms <= 34) return "clear";
  return "miss";
}

export type LabReceipt = {
  requested: DrawBackend;
  actual: DrawBackend;
  adapter: "acquired" | "unavailable" | "skipped";
  device: "acquired" | "unavailable" | "skipped";
  shader: "compiled" | "error" | "skipped";
  pipeline: "created" | "error" | "skipped";
};

/** Init verdict. A WebGL2 or canvas result passes only when the WebGPU facts are not invented. */
export function qualifyBackend(receipt: LabReceipt): "pass" | "fail" {
  const facts =
    receipt.adapter === "acquired" &&
    receipt.device === "acquired" &&
    receipt.shader === "compiled" &&
    receipt.pipeline === "created";
  if (receipt.actual === "webgpu") return facts ? "pass" : "fail";
  if (facts) return "fail";
  if (receipt.actual === "webgl2" || receipt.actual === "canvas") return "pass";
  return "fail";
}

export function summarizeFrames(dts: number[]): { avgFps: number; p50Ms: number; p95Ms: number; frames: number } {
  if (dts.length === 0) return { avgFps: 0, p50Ms: 0, p95Ms: 0, frames: 0 };
  const sorted = [...dts].sort((a, b) => a - b);
  const total = dts.reduce((sum, dt) => sum + dt, 0);
  const pick = (q: number) => sorted[Math.min(sorted.length - 1, Math.max(0, Math.floor(q * (sorted.length - 1))))] * 1000;
  return {
    avgFps: total > 0 ? dts.length / total : 0,
    p50Ms: pick(0.5),
    p95Ms: pick(0.95),
    frames: dts.length,
  };
}
