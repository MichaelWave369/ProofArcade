import { curveY, TRAIL_SAMPLES, type FieldParticle, type Wave } from "./field.ts";
import type { DrawBackend, LabReceipt } from "./quality.ts";

export type LabDraw = {
  time: number;
  waves: Wave[];
  particles: FieldParticle[];
  reducedMotion: boolean;
};

export type LabSurface = {
  backend: DrawBackend;
  receipt: LabReceipt;
  resize(cssWidth: number, cssHeight: number, dpr: number): void;
  draw(frame: LabDraw): void;
  destroy(): void;
};

const INK = [0.027, 0.031, 0.051] as const;
const MAX_MARKS = 280;
/** Five segments per full trail, four floats per segment. */
const LINE_FLOATS = MAX_MARKS * (TRAIL_SAMPLES / 2 - 1) * 4;

function pixelSize(cssWidth: number, cssHeight: number, dpr: number) {
  return {
    width: Math.max(1, Math.floor(cssWidth * dpr)),
    height: Math.max(1, Math.floor(cssHeight * dpr)),
  };
}

function applySize(canvas: HTMLCanvasElement, cssWidth: number, cssHeight: number, dpr: number) {
  const next = pixelSize(cssWidth, cssHeight, dpr);
  if (canvas.width !== next.width || canvas.height !== next.height) {
    canvas.width = next.width;
    canvas.height = next.height;
  }
  return next;
}

function waveAt(waves: Wave[], index: number): Wave {
  return waves[index] ?? { amp: 0, freq: 1, phase: 0 };
}

function openCanvas2d(canvas: HTMLCanvasElement, receipt: LabReceipt): LabSurface {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  let dpr = 1;
  return {
    backend: "canvas",
    receipt,
    resize(cssWidth, cssHeight, next) {
      dpr = next;
      applySize(canvas, cssWidth, cssHeight, next);
    },
    draw(frame) {
      const w = canvas.width;
      const h = canvas.height;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#07080d";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(228,177,90,0.18)";
      ctx.lineWidth = Math.max(1, dpr);
      ctx.beginPath();
      for (let i = 0; i <= 16; i++) {
        const x = (i / 16) * w;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let j = 0; j <= 9; j++) {
        const y = (j / 9) * h;
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();
      const plot = (color: string, width: number, sample: (x: number) => number) => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = width * dpr;
        for (let i = 0; i <= 160; i++) {
          const x = i / 160;
          const px = x * w;
          const py = (1 - sample(x)) * h;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      };
      plot("rgba(143,208,176,0.9)", 1.5, (x) => curveY(x, [waveAt(frame.waves, 0)], frame.time));
      plot("rgba(228,177,90,0.85)", 1.5, (x) => curveY(x, [waveAt(frame.waves, 1)], frame.time));
      plot("#f4efe4", 2.2, (x) => curveY(x, frame.waves, frame.time));
      ctx.lineWidth = dpr;
      ctx.strokeStyle = "rgba(228,177,90,0.4)";
      ctx.fillStyle = "#e4b15a";
      for (const particle of frame.particles) {
        ctx.beginPath();
        for (let i = 0; i < particle.trail.length; i += 2) {
          const px = particle.trail[i] * w;
          const py = (1 - particle.trail[i + 1]) * h;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(particle.x * w, (1 - particle.y) * h, 2.5 * dpr, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    destroy() {},
  };
}

const BG_VS = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const BG_FS = `#version 300 es
precision highp float;
in vec2 vUv;
uniform float uTime;
uniform float uAmp1;
uniform float uFreq1;
uniform float uPhase1;
uniform float uAmp2;
uniform float uFreq2;
uniform float uPhase2;
out vec4 outColor;
float tone(float x, float amp, float freq, float phase) {
  return amp * sin(freq * x * 6.28318530718 + phase + uTime);
}
void main() {
  float s1 = tone(vUv.x, uAmp1, uFreq1, uPhase1);
  float s2 = tone(vUv.x, uAmp2, uFreq2, uPhase2);
  float y1 = 0.5 + s1 * 0.42;
  float y2 = 0.5 + s2 * 0.42;
  float ys = 0.5 + (s1 + s2) * 0.42;
  float gx = min(fract(vUv.x * 16.0), 1.0 - fract(vUv.x * 16.0));
  float gy = min(fract(vUv.y * 9.0), 1.0 - fract(vUv.y * 9.0));
  float grid = 1.0 - smoothstep(0.0, 0.02, min(gx, gy));
  float d1 = abs(vUv.y - y1);
  float d2 = abs(vUv.y - y2);
  float ds = abs(vUv.y - ys);
  float w1 = 1.0 - smoothstep(0.0, 0.008, d1);
  float w2 = 1.0 - smoothstep(0.0, 0.008, d2);
  float ws = 1.0 - smoothstep(0.0, 0.012, ds);
  float glow = exp(-ds * ds * 900.0) * 0.28;
  vec3 col = vec3(0.027, 0.031, 0.051);
  col += vec3(0.894, 0.694, 0.353) * grid * 0.16;
  col += vec3(0.561, 0.816, 0.690) * (w1 + glow * 0.35);
  col += vec3(0.894, 0.694, 0.353) * w2;
  col += vec3(0.957, 0.937, 0.894) * (ws + glow);
  outColor = vec4(col, 1.0);
}`;

const MARK_VS = `#version 300 es
in vec2 aCorner;
in vec2 aCenter;
uniform float uSize;
void main() {
  vec2 p = vec2(aCenter.x * 2.0 - 1.0, aCenter.y * 2.0 - 1.0) + aCorner * uSize;
  gl_Position = vec4(p, 0.0, 1.0);
}`;

const MARK_FS = `#version 300 es
precision highp float;
out vec4 outColor;
void main() {
  outColor = vec4(0.894, 0.694, 0.353, 0.95);
}`;

const LINE_VS = `#version 300 es
in vec2 aPos;
void main() {
  gl_Position = vec4(aPos.x * 2.0 - 1.0, aPos.y * 2.0 - 1.0, 0.0, 1.0);
}`;

const LINE_FS = `#version 300 es
precision highp float;
out vec4 outColor;
void main() {
  outColor = vec4(0.894, 0.694, 0.353, 0.45);
}`;

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(log || "shader");
  }
  return shader;
}

function link(gl: WebGL2RenderingContext, vs: string, fs: string) {
  const program = gl.createProgram();
  if (!program) throw new Error("program");
  const v = compile(gl, gl.VERTEX_SHADER, vs);
  const f = compile(gl, gl.FRAGMENT_SHADER, fs);
  gl.attachShader(program, v);
  gl.attachShader(program, f);
  gl.linkProgram(program);
  gl.deleteShader(v);
  gl.deleteShader(f);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(log || "link");
  }
  return program;
}

function tryWebGL(canvas: HTMLCanvasElement, receipt: LabReceipt): LabSurface | null {
  let gl: WebGL2RenderingContext | null = null;
  try {
    gl = canvas.getContext("webgl2", { alpha: false, antialias: false, powerPreference: "high-performance" });
    if (!gl) return null;
    const bg = link(gl, BG_VS, BG_FS);
    const marks = link(gl, MARK_VS, MARK_FS);
    const lines = link(gl, LINE_VS, LINE_FS);
    const tri = gl.createBuffer();
    const corners = gl.createBuffer();
    const centers = gl.createBuffer();
    const trail = gl.createBuffer();
    if (!tri || !corners || !centers || !trail) {
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      return null;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, tri);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, corners);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const bgPos = gl.getAttribLocation(bg, "aPos");
    const cornerLoc = gl.getAttribLocation(marks, "aCorner");
    const centerLoc = gl.getAttribLocation(marks, "aCenter");
    const lineLoc = gl.getAttribLocation(lines, "aPos");
    const uniforms = {
      time: gl.getUniformLocation(bg, "uTime"),
      amp1: gl.getUniformLocation(bg, "uAmp1"),
      freq1: gl.getUniformLocation(bg, "uFreq1"),
      phase1: gl.getUniformLocation(bg, "uPhase1"),
      amp2: gl.getUniformLocation(bg, "uAmp2"),
      freq2: gl.getUniformLocation(bg, "uFreq2"),
      phase2: gl.getUniformLocation(bg, "uPhase2"),
      size: gl.getUniformLocation(marks, "uSize"),
    };
    let alive = true;
    const lineData = new Float32Array(LINE_FLOATS);
    const centerData = new Float32Array(MAX_MARKS * 2);
    return {
      backend: "webgl2",
      receipt,
      resize(cssWidth, cssHeight, dpr) {
        applySize(canvas, cssWidth, cssHeight, dpr);
        gl?.viewport(0, 0, canvas.width, canvas.height);
      },
      draw(frame) {
        if (!alive || !gl) return;
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.disable(gl.BLEND);
        gl.useProgram(bg);
        gl.bindBuffer(gl.ARRAY_BUFFER, tri);
        gl.enableVertexAttribArray(bgPos);
        gl.vertexAttribPointer(bgPos, 2, gl.FLOAT, false, 0, 0);
        const a = waveAt(frame.waves, 0);
        const b = waveAt(frame.waves, 1);
        gl.uniform1f(uniforms.time, frame.time);
        gl.uniform1f(uniforms.amp1, a.amp);
        gl.uniform1f(uniforms.freq1, a.freq);
        gl.uniform1f(uniforms.phase1, a.phase);
        gl.uniform1f(uniforms.amp2, b.amp);
        gl.uniform1f(uniforms.freq2, b.freq);
        gl.uniform1f(uniforms.phase2, b.phase);
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        const count = Math.min(frame.particles.length, MAX_MARKS);
        if (count === 0) return;
        let lineVerts = 0;
        for (let i = 0; i < count; i++) {
          const particle = frame.particles[i];
          centerData[i * 2] = particle.x;
          centerData[i * 2 + 1] = particle.y;
          for (let t = 2; t < particle.trail.length; t += 2) {
            if (lineVerts + 4 > lineData.length) break;
            lineData[lineVerts++] = particle.trail[t - 2];
            lineData[lineVerts++] = particle.trail[t - 1];
            lineData[lineVerts++] = particle.trail[t];
            lineData[lineVerts++] = particle.trail[t + 1];
          }
        }
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        if (lineVerts > 0) {
          gl.useProgram(lines);
          gl.bindBuffer(gl.ARRAY_BUFFER, trail);
          gl.bufferData(gl.ARRAY_BUFFER, lineData.subarray(0, lineVerts), gl.DYNAMIC_DRAW);
          gl.enableVertexAttribArray(lineLoc);
          gl.vertexAttribPointer(lineLoc, 2, gl.FLOAT, false, 0, 0);
          gl.drawArrays(gl.LINES, 0, lineVerts / 2);
        }
        gl.useProgram(marks);
        gl.uniform1f(uniforms.size, 0.012);
        gl.bindBuffer(gl.ARRAY_BUFFER, corners);
        gl.enableVertexAttribArray(cornerLoc);
        gl.vertexAttribPointer(cornerLoc, 2, gl.FLOAT, false, 0, 0);
        gl.vertexAttribDivisor(cornerLoc, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, centers);
        gl.bufferData(gl.ARRAY_BUFFER, centerData.subarray(0, count * 2), gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(centerLoc);
        gl.vertexAttribPointer(centerLoc, 2, gl.FLOAT, false, 0, 0);
        gl.vertexAttribDivisor(centerLoc, 1);
        gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, count);
        gl.vertexAttribDivisor(centerLoc, 0);
      },
      destroy() {
        alive = false;
        gl?.deleteProgram(bg);
        gl?.deleteProgram(marks);
        gl?.deleteProgram(lines);
        gl?.deleteBuffer(tri);
        gl?.deleteBuffer(corners);
        gl?.deleteBuffer(centers);
        gl?.deleteBuffer(trail);
        gl?.getExtension("WEBGL_lose_context")?.loseContext();
      },
    };
  } catch (error) {
    console.error("[proof-arcade] WebGL2 fell back", error);
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return null;
  }
}

const WGSL = `
struct Uni {
  time: f32,
  amp1: f32,
  freq1: f32,
  phase1: f32,
  amp2: f32,
  freq2: f32,
  phase2: f32,
  reduced: f32,
}
@group(0) @binding(0) var<uniform> u: Uni;

struct BgOut {
  @builtin(position) pos: vec4f,
  @location(0) uv: vec2f,
}

@vertex
fn vsBg(@builtin(vertex_index) index: u32) -> BgOut {
  var positions = array<vec2f, 3>(vec2f(-1.0, -1.0), vec2f(3.0, -1.0), vec2f(-1.0, 3.0));
  var out: BgOut;
  out.pos = vec4f(positions[index], 0.0, 1.0);
  out.uv = positions[index] * 0.5 + 0.5;
  return out;
}

fn tone(x: f32, amp: f32, freq: f32, phase: f32) -> f32 {
  return amp * sin(freq * x * 6.28318530718 + phase + u.time);
}

@fragment
fn fsBg(in: BgOut) -> @location(0) vec4f {
  let s1 = tone(in.uv.x, u.amp1, u.freq1, u.phase1);
  let s2 = tone(in.uv.x, u.amp2, u.freq2, u.phase2);
  let y1 = 0.5 + s1 * 0.42;
  let y2 = 0.5 + s2 * 0.42;
  let ys = 0.5 + (s1 + s2) * 0.42;
  let gx = min(fract(in.uv.x * 16.0), 1.0 - fract(in.uv.x * 16.0));
  let gy = min(fract(in.uv.y * 9.0), 1.0 - fract(in.uv.y * 9.0));
  let grid = 1.0 - smoothstep(0.0, 0.02, min(gx, gy));
  let ds = abs(in.uv.y - ys);
  let w1 = 1.0 - smoothstep(0.0, 0.008, abs(in.uv.y - y1));
  let w2 = 1.0 - smoothstep(0.0, 0.008, abs(in.uv.y - y2));
  let ws = 1.0 - smoothstep(0.0, 0.012, ds);
  let glow = exp(-ds * ds * 900.0) * 0.28;
  var col = vec3f(0.027, 0.031, 0.051);
  col += vec3f(0.894, 0.694, 0.353) * grid * 0.16;
  col += vec3f(0.561, 0.816, 0.690) * (w1 + glow * 0.35);
  col += vec3f(0.894, 0.694, 0.353) * w2;
  col += vec3f(0.957, 0.937, 0.894) * (ws + glow);
  return vec4f(col, 1.0);
}

@vertex
fn vsMark(@location(0) corner: vec2f, @location(1) center: vec2f) -> @builtin(position) vec4f {
  let p = vec2f(center.x * 2.0 - 1.0, center.y * 2.0 - 1.0) + corner * 0.012;
  return vec4f(p, 0.0, 1.0);
}

@fragment
fn fsMark() -> @location(0) vec4f {
  return vec4f(0.894, 0.694, 0.353, 0.95);
}

@vertex
fn vsLine(@location(0) p: vec2f) -> @builtin(position) vec4f {
  return vec4f(p.x * 2.0 - 1.0, p.y * 2.0 - 1.0, 0.0, 1.0);
}

@fragment
fn fsLine() -> @location(0) vec4f {
  return vec4f(0.894, 0.694, 0.353, 0.45);
}
`;

function within<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      () => {
        clearTimeout(timer);
        resolve(null);
      },
    );
  });
}

async function tryWebGPU(canvas: HTMLCanvasElement, receipt: LabReceipt): Promise<LabSurface | null> {
  const gpu = navigator.gpu;
  if (!gpu) {
    receipt.adapter = "unavailable";
    receipt.device = "skipped";
    receipt.shader = "skipped";
    receipt.pipeline = "skipped";
    return null;
  }
  let device: GPUDevice | undefined;
  let uniform: GPUBuffer | undefined;
  let quad: GPUBuffer | undefined;
  let centers: GPUBuffer | undefined;
  let trail: GPUBuffer | undefined;
  let released = false;
  const release = () => {
    if (released) return;
    released = true;
    uniform?.destroy();
    quad?.destroy();
    centers?.destroy();
    trail?.destroy();
    device?.destroy();
  };
  try {
    const adapter = await within(gpu.requestAdapter(), 400);
    if (!adapter) {
      receipt.adapter = "unavailable";
      receipt.device = "skipped";
      receipt.shader = "skipped";
      receipt.pipeline = "skipped";
      return null;
    }
    receipt.adapter = "acquired";
    const requested = await within(adapter.requestDevice(), 400);
    if (!requested) {
      receipt.device = "unavailable";
      receipt.shader = "skipped";
      receipt.pipeline = "skipped";
      return null;
    }
    receipt.device = "acquired";
    device = requested;
    const format = gpu.getPreferredCanvasFormat();
    const shader = device.createShaderModule({ code: WGSL });
    const compiled = await shader.getCompilationInfo();
    if (compiled.messages.some((message) => message.type === "error")) {
      receipt.shader = "error";
      receipt.pipeline = "skipped";
      console.error("[proof-arcade] WebGPU shader fell back", compiled.messages);
      release();
      return null;
    }
    receipt.shader = "compiled";
    const bg = device.createRenderPipeline({
      layout: "auto",
      vertex: { module: shader, entryPoint: "vsBg" },
      fragment: { module: shader, entryPoint: "fsBg", targets: [{ format }] },
      primitive: { topology: "triangle-list" },
    });
    const blend: GPUBlendState = {
      color: { srcFactor: "src-alpha", dstFactor: "one-minus-src-alpha", operation: "add" },
      alpha: { srcFactor: "one", dstFactor: "one-minus-src-alpha", operation: "add" },
    };
    const marks = device.createRenderPipeline({
      layout: "auto",
      vertex: {
        module: shader,
        entryPoint: "vsMark",
        buffers: [
          { arrayStride: 8, attributes: [{ shaderLocation: 0, offset: 0, format: "float32x2" }] },
          { arrayStride: 8, stepMode: "instance", attributes: [{ shaderLocation: 1, offset: 0, format: "float32x2" }] },
        ],
      },
      fragment: { module: shader, entryPoint: "fsMark", targets: [{ format, blend }] },
      primitive: { topology: "triangle-list" },
    });
    const trails = device.createRenderPipeline({
      layout: "auto",
      vertex: {
        module: shader,
        entryPoint: "vsLine",
        buffers: [{ arrayStride: 8, attributes: [{ shaderLocation: 0, offset: 0, format: "float32x2" }] }],
      },
      fragment: { module: shader, entryPoint: "fsLine", targets: [{ format, blend }] },
      primitive: { topology: "line-list" },
    });
    receipt.pipeline = "created";
    uniform = device.createBuffer({ size: 32, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    const gpuUniform = uniform;
    const bind = device.createBindGroup({
      layout: bg.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: { buffer: gpuUniform } }],
    });
    quad = device.createBuffer({
      size: 48,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    const gpuQuad = quad;
    device.queue.writeBuffer(gpuQuad, 0, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]));
    centers = device.createBuffer({ size: MAX_MARKS * 8, usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST });
    trail = device.createBuffer({ size: LINE_FLOATS * 4, usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST });
    const gpuCenters = centers;
    const gpuTrail = trail;
    const gpuDevice = device;
    // Touch the canvas only after the shader and pipelines exist, so a compile
    // failure can still fall back to WebGL2 on a fresh canvas.
    const context = canvas.getContext("webgpu") as GPUCanvasContext | null;
    if (!context) {
      receipt.pipeline = "error";
      release();
      return null;
    }
    context.configure({ device: gpuDevice, format, alphaMode: "opaque" });
    const centerData = new Float32Array(MAX_MARKS * 2);
    const lineData = new Float32Array(LINE_FLOATS);
    let alive = true;
    receipt.actual = "webgpu";
    return {
      backend: "webgpu",
      receipt,
      resize(cssWidth, cssHeight, dpr) {
        applySize(canvas, cssWidth, cssHeight, dpr);
      },
      draw(frame) {
        if (!alive || canvas.width < 1 || canvas.height < 1) return;
        const a = waveAt(frame.waves, 0);
        const b = waveAt(frame.waves, 1);
        gpuDevice.queue.writeBuffer(
          gpuUniform,
          0,
          new Float32Array([frame.time, a.amp, a.freq, a.phase, b.amp, b.freq, b.phase, frame.reducedMotion ? 1 : 0]),
        );
        const count = Math.min(frame.particles.length, MAX_MARKS);
        let lineVerts = 0;
        for (let i = 0; i < count; i++) {
          const particle = frame.particles[i];
          centerData[i * 2] = particle.x;
          centerData[i * 2 + 1] = particle.y;
          for (let t = 2; t < particle.trail.length; t += 2) {
            if (lineVerts + 4 > lineData.length) break;
            lineData[lineVerts++] = particle.trail[t - 2];
            lineData[lineVerts++] = particle.trail[t - 1];
            lineData[lineVerts++] = particle.trail[t];
            lineData[lineVerts++] = particle.trail[t + 1];
          }
        }
        if (lineVerts > 0) gpuDevice.queue.writeBuffer(gpuTrail, 0, lineData.subarray(0, lineVerts));
        if (count > 0) gpuDevice.queue.writeBuffer(gpuCenters, 0, centerData.subarray(0, count * 2));
        const encoder = gpuDevice.createCommandEncoder();
        const view = context.getCurrentTexture().createView();
        const pass = encoder.beginRenderPass({
          colorAttachments: [
            {
              view,
              clearValue: { r: INK[0], g: INK[1], b: INK[2], a: 1 },
              loadOp: "clear",
              storeOp: "store",
            },
          ],
        });
        pass.setPipeline(bg);
        pass.setBindGroup(0, bind);
        pass.draw(3);
        if (lineVerts > 0) {
          pass.setPipeline(trails);
          pass.setVertexBuffer(0, gpuTrail);
          pass.draw(lineVerts / 2);
        }
        if (count > 0) {
          pass.setPipeline(marks);
          pass.setVertexBuffer(0, gpuQuad);
          pass.setVertexBuffer(1, gpuCenters);
          pass.draw(6, count);
        }
        pass.end();
        gpuDevice.queue.submit([encoder.finish()]);
      },
      destroy() {
        alive = false;
        release();
      },
    };
  } catch (error) {
    if (receipt.shader === "compiled") receipt.pipeline = "error";
    else receipt.shader = "error";
    console.error("[proof-arcade] WebGPU fell back", error);
    release();
    return null;
  }
}

function mountCanvas(parent: HTMLElement) {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.display = "block";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  parent.replaceChildren(canvas);
  return canvas;
}

export async function openLabSurface(parent: HTMLElement, prefer: DrawBackend): Promise<LabSurface> {
  const receipt: LabReceipt = {
    requested: prefer,
    actual: "canvas",
    adapter: prefer === "webgpu" ? "unavailable" : "skipped",
    device: prefer === "webgpu" ? "unavailable" : "skipped",
    shader: "skipped",
    pipeline: "skipped",
  };
  if (prefer === "webgpu") {
    const gpu = await tryWebGPU(mountCanvas(parent), receipt);
    if (gpu) return gpu;
    console.info("[proof-arcade] WebGPU unavailable, using WebGL2");
  }
  if (prefer !== "canvas") {
    const gl = tryWebGL(mountCanvas(parent), receipt);
    if (gl) {
      receipt.actual = "webgl2";
      return gl;
    }
    console.info("[proof-arcade] WebGL2 unavailable, using page drawing");
  }
  try {
    receipt.actual = "canvas";
    return openCanvas2d(mountCanvas(parent), receipt);
  } catch (error) {
    console.error("[proof-arcade] page drawing unavailable", error);
    receipt.actual = "canvas";
    return { backend: "canvas", receipt, resize() {}, draw() {}, destroy() {} };
  }
}
