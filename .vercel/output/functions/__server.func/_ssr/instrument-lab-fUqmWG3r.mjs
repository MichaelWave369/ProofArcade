import { i as __toESM } from "../_runtime.mjs";
import { q as require_react, x as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/instrument-lab-fUqmWG3r.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function performanceTier(probe) {
	const cores = probe.cores ?? 4;
	const memory = probe.memoryGb ?? null;
	if (probe.swiftShader) return "low";
	if (memory !== null && memory <= 2) return "low";
	if (cores <= 2) return "low";
	if (cores >= 8 && (memory === null || memory >= 8)) return "high";
	return "mid";
}
function readCapabilities(probe = {}) {
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
		swiftShader: probe.swiftShader === true
	};
}
function detectCapabilities() {
	if (typeof window === "undefined") return readCapabilities({});
	let webgl2 = false;
	let swiftShader = false;
	try {
		const gl = document.createElement("canvas").getContext("webgl2");
		if (gl) {
			webgl2 = true;
			const debug = gl.getExtension("WEBGL_debug_renderer_info");
			const renderer = debug ? String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) ?? "") : "";
			swiftShader = /swiftshader|llvmpipe|softpipe/i.test(renderer);
			gl.getExtension("WEBGL_lose_context")?.loseContext();
		}
	} catch {
		webgl2 = false;
	}
	const nav = navigator;
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
		swiftShader
	});
}
/** Vertical position of the summed waves. Matches the instrument shaders. */
function curveY(x, waves, time) {
	let sum = 0;
	for (const wave of waves) sum += wave.amp * Math.sin(wave.freq * x * Math.PI * 2 + wave.phase + time);
	return .5 + sum * .42;
}
function createPool(count) {
	const pool = [];
	const n = Math.max(0, Math.floor(count));
	for (let i = 0; i < n; i++) pool.push({
		x: n === 1 ? .5 : i / (n - 1),
		y: .5,
		vy: 0,
		trail: []
	});
	return pool;
}
/** Particles chase the real curve and leave a trail of where they have been. */
function stepPool(pool, dt, waves, time) {
	const h = Math.min(Math.max(dt, 0), .05);
	if (h === 0) return;
	for (const particle of pool) {
		const pull = (curveY(particle.x, waves, time) - particle.y) * 14 - particle.vy * 5;
		particle.vy += pull * h;
		particle.y += particle.vy * h;
		particle.x += .07 * h;
		if (particle.x > 1) particle.x -= 1;
		particle.trail.push(particle.x, particle.y);
		if (particle.trail.length > 12) particle.trail.splice(0, particle.trail.length - 12);
	}
}
var FIDELITY_CHOICES = [
	"AUTO",
	"LOW",
	"MEDIUM",
	"HIGH",
	"ULTRA"
];
var FIDELITY_KEY = "proof-arcade-fidelity";
function browserStore() {
	if (typeof localStorage === "undefined") return null;
	return localStorage;
}
function loadFidelity(store = browserStore()) {
	const raw = store?.getItem(FIDELITY_KEY);
	if (raw === "AUTO" || raw === "LOW" || raw === "MEDIUM" || raw === "HIGH" || raw === "ULTRA") return raw;
	return "AUTO";
}
function saveFidelity(choice, store = browserStore()) {
	try {
		store?.setItem(FIDELITY_KEY, choice);
	} catch {}
}
function resolveMode(choice, caps) {
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
function resolveBackend(mode, caps) {
	if (mode === "ULTRA" && caps.webgpu) return "webgpu";
	if (mode !== "SAFE" && (caps.webgl2 || caps.webgpu)) return caps.webgl2 ? "webgl2" : "webgpu";
	return "canvas";
}
function particleBudget(mode, reducedMotion) {
	if (reducedMotion) return mode === "SAFE" ? 0 : 12;
	if (mode === "SAFE") return 24;
	if (mode === "STANDARD") return 72;
	if (mode === "ENHANCED") return 160;
	return 280;
}
function cappedDpr(reported, mode, coarsePointer) {
	return Math.min(Number.isFinite(reported) && reported > 0 ? reported : 1, mode === "SAFE" ? 1 : mode === "STANDARD" ? 1.25 : coarsePointer ? 1.5 : 2);
}
function present(choice, caps) {
	const mode = resolveMode(choice, caps);
	return {
		choice,
		mode,
		backend: resolveBackend(mode, caps),
		particles: particleBudget(mode, caps.reducedMotion),
		dpr: cappedDpr(caps.devicePixelRatio, mode, caps.coarsePointer)
	};
}
function qualifyVisit(sample) {
	if (sample.avgFps >= 50 && sample.p95Ms <= 34) return "clear";
	return "miss";
}
/** Init verdict. A WebGL2 or canvas result passes only when the WebGPU facts are not invented. */
function qualifyBackend(receipt) {
	const facts = receipt.adapter === "acquired" && receipt.device === "acquired" && receipt.shader === "compiled" && receipt.pipeline === "created";
	if (receipt.actual === "webgpu") return facts ? "pass" : "fail";
	if (facts) return "fail";
	if (receipt.actual === "webgl2" || receipt.actual === "canvas") return "pass";
	return "fail";
}
function summarizeFrames(dts) {
	if (dts.length === 0) return {
		avgFps: 0,
		p50Ms: 0,
		p95Ms: 0,
		frames: 0
	};
	const sorted = [...dts].sort((a, b) => a - b);
	const total = dts.reduce((sum, dt) => sum + dt, 0);
	const pick = (q) => sorted[Math.min(sorted.length - 1, Math.max(0, Math.floor(q * (sorted.length - 1))))] * 1e3;
	return {
		avgFps: total > 0 ? dts.length / total : 0,
		p50Ms: pick(.5),
		p95Ms: pick(.95),
		frames: dts.length
	};
}
var INK = [
	.027,
	.031,
	.051
];
var MAX_MARKS = 280;
/** Five segments per full trail, four floats per segment. */
var LINE_FLOATS = MAX_MARKS * 5 * 4;
function pixelSize(cssWidth, cssHeight, dpr) {
	return {
		width: Math.max(1, Math.floor(cssWidth * dpr)),
		height: Math.max(1, Math.floor(cssHeight * dpr))
	};
}
function applySize(canvas, cssWidth, cssHeight, dpr) {
	const next = pixelSize(cssWidth, cssHeight, dpr);
	if (canvas.width !== next.width || canvas.height !== next.height) {
		canvas.width = next.width;
		canvas.height = next.height;
	}
	return next;
}
function waveAt(waves, index) {
	return waves[index] ?? {
		amp: 0,
		freq: 1,
		phase: 0
	};
}
function openCanvas2d(canvas, receipt) {
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
				const x = i / 16 * w;
				ctx.moveTo(x, 0);
				ctx.lineTo(x, h);
			}
			for (let j = 0; j <= 9; j++) {
				const y = j / 9 * h;
				ctx.moveTo(0, y);
				ctx.lineTo(w, y);
			}
			ctx.stroke();
			const plot = (color, width, sample) => {
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
		destroy() {}
	};
}
var BG_VS = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;
var BG_FS = `#version 300 es
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
var MARK_VS = `#version 300 es
in vec2 aCorner;
in vec2 aCenter;
uniform float uSize;
void main() {
  vec2 p = vec2(aCenter.x * 2.0 - 1.0, aCenter.y * 2.0 - 1.0) + aCorner * uSize;
  gl_Position = vec4(p, 0.0, 1.0);
}`;
var MARK_FS = `#version 300 es
precision highp float;
out vec4 outColor;
void main() {
  outColor = vec4(0.894, 0.694, 0.353, 0.95);
}`;
var LINE_VS = `#version 300 es
in vec2 aPos;
void main() {
  gl_Position = vec4(aPos.x * 2.0 - 1.0, aPos.y * 2.0 - 1.0, 0.0, 1.0);
}`;
var LINE_FS = `#version 300 es
precision highp float;
out vec4 outColor;
void main() {
  outColor = vec4(0.894, 0.694, 0.353, 0.45);
}`;
function compile(gl, type, source) {
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
function link(gl, vs, fs) {
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
function tryWebGL(canvas, receipt) {
	let gl = null;
	try {
		gl = canvas.getContext("webgl2", {
			alpha: false,
			antialias: false,
			powerPreference: "high-performance"
		});
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
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			-1,
			-1,
			3,
			-1,
			-1,
			3
		]), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, corners);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			-1,
			-1,
			1,
			-1,
			-1,
			1,
			-1,
			1,
			1,
			-1,
			1,
			1
		]), gl.STATIC_DRAW);
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
			size: gl.getUniformLocation(marks, "uSize")
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
				gl.uniform1f(uniforms.size, .012);
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
			}
		};
	} catch (error) {
		console.error("[proof-arcade] WebGL2 fell back", error);
		gl?.getExtension("WEBGL_lose_context")?.loseContext();
		return null;
	}
}
var WGSL = `
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
function within(promise, ms) {
	return new Promise((resolve) => {
		const timer = setTimeout(() => resolve(null), ms);
		promise.then((value) => {
			clearTimeout(timer);
			resolve(value);
		}, () => {
			clearTimeout(timer);
			resolve(null);
		});
	});
}
async function tryWebGPU(canvas, receipt) {
	const gpu = navigator.gpu;
	if (!gpu) {
		receipt.adapter = "unavailable";
		receipt.device = "skipped";
		receipt.shader = "skipped";
		receipt.pipeline = "skipped";
		return null;
	}
	let device;
	let uniform;
	let quad;
	let centers;
	let trail;
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
			vertex: {
				module: shader,
				entryPoint: "vsBg"
			},
			fragment: {
				module: shader,
				entryPoint: "fsBg",
				targets: [{ format }]
			},
			primitive: { topology: "triangle-list" }
		});
		const blend = {
			color: {
				srcFactor: "src-alpha",
				dstFactor: "one-minus-src-alpha",
				operation: "add"
			},
			alpha: {
				srcFactor: "one",
				dstFactor: "one-minus-src-alpha",
				operation: "add"
			}
		};
		const marks = device.createRenderPipeline({
			layout: "auto",
			vertex: {
				module: shader,
				entryPoint: "vsMark",
				buffers: [{
					arrayStride: 8,
					attributes: [{
						shaderLocation: 0,
						offset: 0,
						format: "float32x2"
					}]
				}, {
					arrayStride: 8,
					stepMode: "instance",
					attributes: [{
						shaderLocation: 1,
						offset: 0,
						format: "float32x2"
					}]
				}]
			},
			fragment: {
				module: shader,
				entryPoint: "fsMark",
				targets: [{
					format,
					blend
				}]
			},
			primitive: { topology: "triangle-list" }
		});
		const trails = device.createRenderPipeline({
			layout: "auto",
			vertex: {
				module: shader,
				entryPoint: "vsLine",
				buffers: [{
					arrayStride: 8,
					attributes: [{
						shaderLocation: 0,
						offset: 0,
						format: "float32x2"
					}]
				}]
			},
			fragment: {
				module: shader,
				entryPoint: "fsLine",
				targets: [{
					format,
					blend
				}]
			},
			primitive: { topology: "line-list" }
		});
		receipt.pipeline = "created";
		uniform = device.createBuffer({
			size: 32,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
		});
		const gpuUniform = uniform;
		const bind = device.createBindGroup({
			layout: bg.getBindGroupLayout(0),
			entries: [{
				binding: 0,
				resource: { buffer: gpuUniform }
			}]
		});
		quad = device.createBuffer({
			size: 48,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
		});
		const gpuQuad = quad;
		device.queue.writeBuffer(gpuQuad, 0, new Float32Array([
			-1,
			-1,
			1,
			-1,
			-1,
			1,
			-1,
			1,
			1,
			-1,
			1,
			1
		]));
		centers = device.createBuffer({
			size: MAX_MARKS * 8,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
		});
		trail = device.createBuffer({
			size: LINE_FLOATS * 4,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
		});
		const gpuCenters = centers;
		const gpuTrail = trail;
		const gpuDevice = device;
		const context = canvas.getContext("webgpu");
		if (!context) {
			receipt.pipeline = "error";
			release();
			return null;
		}
		context.configure({
			device: gpuDevice,
			format,
			alphaMode: "opaque"
		});
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
				gpuDevice.queue.writeBuffer(gpuUniform, 0, new Float32Array([
					frame.time,
					a.amp,
					a.freq,
					a.phase,
					b.amp,
					b.freq,
					b.phase,
					frame.reducedMotion ? 1 : 0
				]));
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
				const pass = encoder.beginRenderPass({ colorAttachments: [{
					view,
					clearValue: {
						r: INK[0],
						g: INK[1],
						b: INK[2],
						a: 1
					},
					loadOp: "clear",
					storeOp: "store"
				}] });
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
			}
		};
	} catch (error) {
		if (receipt.shader === "compiled") receipt.pipeline = "error";
		else receipt.shader = "error";
		console.error("[proof-arcade] WebGPU fell back", error);
		release();
		return null;
	}
}
function mountCanvas(parent) {
	const canvas = document.createElement("canvas");
	canvas.setAttribute("aria-hidden", "true");
	canvas.style.display = "block";
	canvas.style.width = "100%";
	canvas.style.height = "100%";
	parent.replaceChildren(canvas);
	return canvas;
}
async function openLabSurface(parent, prefer) {
	const receipt = {
		requested: prefer,
		actual: "canvas",
		adapter: prefer === "webgpu" ? "unavailable" : "skipped",
		device: prefer === "webgpu" ? "unavailable" : "skipped",
		shader: "skipped",
		pipeline: "skipped"
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
		return {
			backend: "canvas",
			receipt,
			resize() {},
			draw() {},
			destroy() {}
		};
	}
}
var DEFAULT_WAVES = [{
	amp: .35,
	freq: 2,
	phase: 0
}, {
	amp: .22,
	freq: 3,
	phase: 1
}];
function drawingName(backend) {
	if (backend === "webgpu") return "WebGPU";
	if (backend === "webgl2") return "WebGL2";
	return "page drawing";
}
function describe(backend, choice, reduced) {
	let text = `This screen is using ${drawingName(backend)}.`;
	if (choice === "ULTRA" && backend !== "webgpu") text += " Ultra needs WebGPU, so this screen stepped down.";
	if (reduced) text += " Motion is reduced, so the curves stay put until a control changes.";
	return text;
}
function describeReceipt(receipt) {
	const facts = `adapter ${receipt.adapter} · device ${receipt.device} · shader ${receipt.shader} · pipeline ${receipt.pipeline}`;
	const verdict = qualifyBackend(receipt);
	let meaning = "Init fail. The reported path does not match the facts.";
	if (verdict === "pass" && receipt.actual === "webgpu") meaning = "Init pass. Adapter, device, shader, and pipelines all came from this visit.";
	else if (verdict === "pass" && receipt.requested === "webgpu") meaning = "Init pass. WebGPU did not finish, so the fallback is honest. Those facts were not filled in.";
	else if (verdict === "pass") meaning = "Init pass. This visit is using the drawing path it asked for.";
	return `Requested ${drawingName(receipt.requested)}. Actual ${drawingName(receipt.actual)}. ${facts}. ${meaning}`;
}
function InstrumentLab({ onExit }) {
	const hostRef = (0, import_react.useRef)(null);
	const wavesRef = (0, import_react.useRef)(DEFAULT_WAVES.map((wave) => ({ ...wave })));
	const sampleRef = (0, import_react.useRef)(null);
	const [waves, setWaves] = (0, import_react.useState)(() => wavesRef.current.map((wave) => ({ ...wave })));
	const [choice, setChoice] = (0, import_react.useState)("AUTO");
	const [ready, setReady] = (0, import_react.useState)(false);
	const [status, setStatus] = (0, import_react.useState)("Choosing a drawing mode for this device.");
	const [receipt, setReceipt] = (0, import_react.useState)(null);
	const [measuring, setMeasuring] = (0, import_react.useState)(false);
	const [bench, setBench] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		setChoice(loadFidelity());
		setReady(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!ready) return;
		const host = hostRef.current;
		if (!host) return;
		let cancelled = false;
		let raf = 0;
		let surface = null;
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
		const loop = (now) => {
			raf = requestAnimationFrame(loop);
			if (!surface || document.hidden) {
				const sample = sampleRef.current;
				if (sample) sample.until += Math.max(0, now - last);
				last = now;
				return;
			}
			const dt = Math.min(.05, Math.max(0, (now - last) / 1e3));
			last = now;
			const current = wavesRef.current;
			if (caps.reducedMotion) for (const particle of pool) {
				particle.y = curveY(particle.x, current, time);
				particle.vy = 0;
				particle.trail = [];
			}
			else {
				time += dt;
				stepPool(pool, dt, current, time);
			}
			surface.draw({
				time,
				waves: current,
				particles: pool,
				reducedMotion: caps.reducedMotion
			});
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
				dpr: view.dpr
			});
		};
		openLabSurface(host, view.backend).then((opened) => {
			if (cancelled) {
				opened.destroy();
				return;
			}
			surface = opened;
			setReceipt(opened.receipt);
			setStatus(describe(opened.backend, choice, caps.reducedMotion));
			sampleRef.current = {
				dts: [],
				until: performance.now() + 3e3
			};
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
	function pick(next) {
		saveFidelity(next);
		setChoice(next);
	}
	function tune(index, key, value) {
		const next = wavesRef.current.map((wave, waveIndex) => waveIndex === index ? {
			...wave,
			[key]: value
		} : wave);
		wavesRef.current = next;
		setWaves(next);
	}
	function measure() {
		setBench(null);
		setMeasuring(true);
		sampleRef.current = {
			dts: [],
			until: performance.now() + 3e3
		};
	}
	const caption = `Wave bench. Wave A amplitude ${waves[0].amp.toFixed(2)}, frequency ${waves[0].freq.toFixed(1)}, phase ${waves[0].phase.toFixed(2)}. Wave B amplitude ${waves[1].amp.toFixed(2)}, frequency ${waves[1].freq.toFixed(1)}, phase ${waves[1].phase.toFixed(2)}. The cream curve is their sum.`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative flex h-dvh flex-col overflow-hidden bg-ink text-cream",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex shrink-0 items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs tracking-widest text-gold",
					children: "INSTRUMENT LAB"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-extrabold tracking-tight",
					children: "Wave bench"
				})] }), onExit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onExit,
					className: "inline-flex min-h-11 items-center font-mono text-xs tracking-widest text-gold",
					children: "Floor"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "inline-flex min-h-11 items-center font-mono text-xs tracking-widest text-gold",
					children: "Floor"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative h-1/2 min-h-40 shrink-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					ref: hostRef,
					className: "absolute inset-0",
					role: "img",
					"aria-label": caption
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "min-h-0 flex-1 overflow-y-auto border-t border-line bg-ink px-4 py-3 sm:px-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm leading-relaxed text-mist",
						"aria-live": "polite",
						children: status
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 font-mono text-xs leading-relaxed text-cream",
						"aria-live": "polite",
						children: receipt ? describeReceipt(receipt) : "Reading the drawing path from this device."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 font-mono text-xs text-cream",
						children: "sum = A sin(2π fA x + φA) + B sin(2π fB x + φB)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex gap-2 overflow-x-auto pb-1",
						role: "group",
						"aria-label": "Drawing fidelity",
						children: FIDELITY_CHOICES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-pressed": choice === item,
							onClick: () => pick(item),
							className: choice === item ? "min-h-11 shrink-0 rounded-full bg-gold px-3 text-xs font-extrabold text-ink" : "min-h-11 shrink-0 rounded-full border border-line bg-panel px-3 text-xs font-bold text-mist",
							children: item
						}, item))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 grid gap-4 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WaveControls, {
							title: "Wave A",
							tone: "text-mint",
							wave: waves[0],
							onChange: (key, value) => tune(0, key, value)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WaveControls, {
							title: "Wave B",
							tone: "text-gold",
							wave: waves[1],
							onChange: (key, value) => tune(1, key, value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-mist",
						children: "Peaks that meet grow. Peaks that oppose cancel. The cream curve is that sum."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: measure,
							disabled: measuring,
							className: "min-h-11 rounded-full bg-gold px-4 text-sm font-extrabold text-ink disabled:opacity-60",
							children: measuring ? "Measuring…" : "Measure this device"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-mist",
							children: "The check stays on this device. Nothing is sent."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 font-mono text-xs leading-relaxed text-cream",
						"aria-live": "polite",
						children: measuring && !bench ? "Measuring…" : bench ? `${drawingName(bench.backend)} · ${bench.avgFps.toFixed(1)} fps average · p50 ${bench.p50Ms.toFixed(2)} ms · p95 ${bench.p95Ms.toFixed(2)} ms · ${bench.frames} frames · ${bench.particles} particles · ${bench.width}×${bench.height} px · dpr ${bench.dpr}. ${qualifyVisit(bench) === "clear" ? "This visit cleared the bench: at least 50 fps average and a p95 under 34 ms." : "This visit missed the bench. Drop fidelity if the picture stutters. A clear visit is at least 50 fps average and a p95 under 34 ms."}` : "Not measured on this visit. A clear visit is at least 50 fps average and a p95 under 34 ms."
					})
				]
			})
		]
	});
}
function WaveControls({ title, tone, wave, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
		className: "min-w-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
				className: `font-mono text-xs tracking-widest ${tone}`,
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
				label: "Amplitude",
				min: 0,
				max: .55,
				step: .01,
				value: wave.amp,
				digits: 2,
				onChange: (value) => onChange("amp", value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
				label: "Frequency",
				min: 1,
				max: 6,
				step: 1,
				value: wave.freq,
				digits: 0,
				onChange: (value) => onChange("freq", value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
				label: "Phase",
				min: 0,
				max: 6.28,
				step: .01,
				value: wave.phase,
				digits: 2,
				onChange: (value) => onChange("phase", value)
			})
		]
	});
}
function Slider({ label, min, max, step, value, digits, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "mt-2 flex min-h-11 items-center gap-3 text-xs",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "w-24 shrink-0 font-mono tracking-widest text-mist",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "range",
				min,
				max,
				step,
				value,
				onChange: (event) => onChange(Number(event.target.value)),
				className: "h-11 min-w-0 flex-1 accent-gold"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "w-12 text-right font-mono text-cream",
				children: value.toFixed(digits)
			})
		]
	});
}
//#endregion
export { loadFidelity as a, stepPool as c, detectCapabilities as i, createPool as n, openLabSurface as o, curveY as r, present as s, InstrumentLab as t };
