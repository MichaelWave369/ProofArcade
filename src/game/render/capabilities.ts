export type PerformanceTier = "low" | "mid" | "high";

export type RendererCapabilities = {
  webgpu: boolean;
  webgl2: boolean;
  reducedMotion: boolean;
  devicePixelRatio: number;
  coarsePointer: boolean;
  tier: PerformanceTier;
  cores: number;
  memoryGb: number | null;
  swiftShader: boolean;
};

export type CapabilityProbe = {
  webgpu?: boolean;
  webgl2?: boolean;
  reducedMotion?: boolean;
  devicePixelRatio?: number;
  coarsePointer?: boolean;
  cores?: number;
  memoryGb?: number | null;
  swiftShader?: boolean;
};

export function performanceTier(probe: CapabilityProbe): PerformanceTier {
  const cores = probe.cores ?? 4;
  const memory = probe.memoryGb ?? null;
  if (probe.swiftShader) return "low";
  if (memory !== null && memory <= 2) return "low";
  if (cores <= 2) return "low";
  if (cores >= 8 && (memory === null || memory >= 8)) return "high";
  return "mid";
}

export function readCapabilities(probe: CapabilityProbe = {}): RendererCapabilities {
  const dpr = probe.devicePixelRatio;
  return {
    webgpu: probe.webgpu === true,
    webgl2: probe.webgl2 === true,
    reducedMotion: probe.reducedMotion === true,
    devicePixelRatio: typeof dpr === "number" && dpr > 0 ? dpr : 1,
    coarsePointer: probe.coarsePointer === true,
    tier: performanceTier(probe),
    cores: probe.cores && probe.cores > 0 ? probe.cores : 4,
    memoryGb: probe.memoryGb ?? null,
    swiftShader: probe.swiftShader === true,
  };
}

type DebugGl = WebGL2RenderingContext & {
  getExtension(name: "WEBGL_debug_renderer_info"): { UNMASKED_RENDERER_WEBGL: number } | null;
};

export function detectCapabilities(): RendererCapabilities {
  if (typeof window === "undefined") return readCapabilities({});
  let webgl2 = false;
  let swiftShader = false;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    if (gl) {
      webgl2 = true;
      const debug = (gl as DebugGl).getExtension("WEBGL_debug_renderer_info");
      const renderer = debug ? String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) ?? "") : "";
      swiftShader = /swiftshader|llvmpipe|softpipe/i.test(renderer);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    }
  } catch {
    webgl2 = false;
  }
  const nav = navigator as Navigator & { deviceMemory?: number };
  const motion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  const coarse = window.matchMedia?.("(pointer: coarse)");
  return readCapabilities({
    webgpu: "gpu" in navigator,
    webgl2,
    reducedMotion: motion?.matches === true,
    devicePixelRatio: window.devicePixelRatio,
    coarsePointer: coarse?.matches === true,
    cores: navigator.hardwareConcurrency,
    memoryGb: typeof nav.deviceMemory === "number" ? nav.deviceMemory : null,
    swiftShader,
  });
}
