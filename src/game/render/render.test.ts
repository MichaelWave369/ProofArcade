import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { performanceTier, readCapabilities } from "./capabilities.ts";
import { curveY, createPool, stepPool } from "./field.ts";
import { createClock, createSpring, dampingRatio, kick, stepSpring } from "./motion.ts";
import {
  FIDELITY_CHOICES,
  FIDELITY_KEY,
  cappedDpr,
  loadFidelity,
  particleBudget,
  present,
  resolveBackend,
  resolveMode,
  saveFidelity,
  summarizeFrames,
  qualifyVisit,
  qualifyBackend,
  type FidelityStore,
  type LabReceipt,
} from "./quality.ts";
import { ARRIVE_KICK, ARRIVE_SPRING, DOOR_SPRING, arriveDraw, doorPose } from "./stage.ts";

function memory(seed: Record<string, string> = {}): FidelityStore & { data: Map<string, string> } {
  const data = new Map(Object.entries(seed));
  return {
    data,
    getItem(key) {
      return data.get(key) ?? null;
    },
    setItem(key, value) {
      data.set(key, value);
    },
  };
}

function caps(probe: Parameters<typeof readCapabilities>[0] = {}) {
  return readCapabilities(probe);
}

describe("renderer capabilities", () => {
  it("does not treat a sharp screen as a fast machine", () => {
    const sharp = performanceTier({ cores: 2, memoryGb: 8, devicePixelRatio: 3, coarsePointer: true });
    const plain = performanceTier({ cores: 2, memoryGb: 8 });
    assert.equal(sharp, "low");
    assert.equal(plain, "low");
  });

  it("marks software renderers and small devices as low", () => {
    assert.equal(performanceTier({ cores: 16, memoryGb: 16, swiftShader: true }), "low");
    assert.equal(performanceTier({ cores: 8, memoryGb: 2 }), "low");
    assert.equal(performanceTier({ cores: 4, memoryGb: 4 }), "mid");
    assert.equal(performanceTier({ cores: 8, memoryGb: 8 }), "high");
    assert.equal(performanceTier({ cores: 8, memoryGb: null }), "high");
  });

  it("reads an explicit probe without a browser", () => {
    const read = caps({ webgpu: true, webgl2: false, reducedMotion: true, devicePixelRatio: 2.5, coarsePointer: true, cores: 8, memoryGb: 8 });
    assert.equal(read.webgpu, true);
    assert.equal(read.webgl2, false);
    assert.equal(read.reducedMotion, true);
    assert.equal(read.coarsePointer, true);
    assert.equal(read.devicePixelRatio, 2.5);
    assert.equal(read.tier, "high");
  });
});

describe("fidelity", () => {
  it("never offers ultra without webgpu, or a gpu mode without a gpu", () => {
    for (const choice of FIDELITY_CHOICES) {
      const withGl = resolveMode(choice, caps({ webgpu: false, webgl2: true, cores: 8, memoryGb: 8 }));
      assert.notEqual(withGl, "ULTRA");
      assert.equal(resolveMode(choice, caps({ webgpu: false, webgl2: false, cores: 8, memoryGb: 16 })), "SAFE");
    }
    assert.equal(resolveMode("ULTRA", caps({ webgpu: true, webgl2: true, cores: 4 })), "ULTRA");
    assert.equal(resolveMode("ULTRA", caps({ webgpu: false, webgl2: true, cores: 8, memoryGb: 8 })), "ENHANCED");
    assert.equal(resolveMode("LOW", caps({ webgpu: true, webgl2: true, cores: 8, memoryGb: 8 })), "SAFE");
    assert.equal(resolveMode("MEDIUM", caps({ webgpu: false, webgl2: true, cores: 8, memoryGb: 8 })), "STANDARD");
    assert.equal(resolveMode("HIGH", caps({ webgpu: true, webgl2: false, cores: 2 })), "ENHANCED");
  });

  it("keeps automatic mode quiet when motion is reduced or the machine is small", () => {
    const fast = { webgpu: true, webgl2: true, cores: 8, memoryGb: 8 };
    assert.equal(resolveMode("AUTO", caps({ ...fast, reducedMotion: true })), "SAFE");
    assert.equal(resolveMode("AUTO", caps({ ...fast, cores: 2 })), "SAFE");
    assert.equal(resolveMode("AUTO", caps(fast)), "ULTRA");
    assert.equal(resolveMode("AUTO", caps({ webgpu: false, webgl2: true, cores: 8, memoryGb: 8 })), "ENHANCED");
    assert.equal(resolveMode("AUTO", caps({ webgpu: false, webgl2: true, cores: 4, memoryGb: 4 })), "STANDARD");
  });

  it("saves the choice apart from arcade progress", () => {
    const store = memory({ "proof-arcade-v3": "{\"tracks\":{}}" });
    assert.equal(loadFidelity(store), "AUTO");
    saveFidelity("HIGH", store);
    assert.equal(loadFidelity(store), "HIGH");
    assert.equal(store.getItem("proof-arcade-v3"), "{\"tracks\":{}}");
    assert.equal(FIDELITY_KEY, "proof-arcade-fidelity");
    assert.notEqual(FIDELITY_KEY, "proof-arcade-v3");
    store.setItem(FIDELITY_KEY, "nope");
    assert.equal(loadFidelity(store), "AUTO");
    assert.equal(loadFidelity(null), "AUTO");
  });

  it("caps particles and pixel ratio", () => {
    assert.equal(particleBudget("SAFE", true), 0);
    assert.equal(particleBudget("SAFE", false), 24);
    assert.equal(particleBudget("ULTRA", true), 12);
    assert.equal(particleBudget("ENHANCED", false), 160);
    assert.equal(cappedDpr(3, "SAFE", false), 1);
    assert.equal(cappedDpr(3, "STANDARD", false), 1.25);
    assert.equal(cappedDpr(3, "ENHANCED", true), 1.5);
    assert.equal(cappedDpr(3, "ULTRA", false), 2);
    assert.equal(cappedDpr(1.25, "ULTRA", false), 1.25);
    const shown = present("HIGH", caps({ webgl2: true, cores: 4, devicePixelRatio: 3, coarsePointer: true }));
    assert.equal(shown.mode, "ENHANCED");
    assert.equal(shown.backend, "webgl2");
    assert.equal(shown.dpr, 1.5);
    assert.equal(resolveBackend("ULTRA", caps({ webgpu: true, webgl2: true })), "webgpu");
    assert.equal(resolveBackend("STANDARD", caps({ webgpu: true, webgl2: false })), "webgpu");
    assert.equal(resolveBackend("SAFE", caps({ webgpu: true, webgl2: true })), "canvas");
  });

  it("summarizes frame times without inventing a rate for an empty run", () => {
    assert.deepEqual(summarizeFrames([]), { avgFps: 0, p50Ms: 0, p95Ms: 0, frames: 0 });
    const summary = summarizeFrames([1 / 60, 1 / 30, 1 / 120]);
    assert.equal(summary.frames, 3);
    assert.ok(Math.abs(summary.avgFps - 3 / (1 / 60 + 1 / 30 + 1 / 120)) < 1e-9);
    assert.ok(summary.p50Ms > 0);
    assert.ok(summary.p95Ms >= summary.p50Ms);
    assert.equal(qualifyVisit({ avgFps: 59, p95Ms: 17 }), "clear");
    assert.equal(qualifyVisit({ avgFps: 49, p95Ms: 17 }), "miss");
    assert.equal(qualifyVisit({ avgFps: 60, p95Ms: 40 }), "miss");
  });

  it("passes a real WebGPU init and an honest fallback, and fails a fabricated one", () => {
    const webgpu: LabReceipt = {
      requested: "webgpu",
      actual: "webgpu",
      adapter: "acquired",
      device: "acquired",
      shader: "compiled",
      pipeline: "created",
    };
    const fallback: LabReceipt = {
      requested: "webgpu",
      actual: "webgl2",
      adapter: "unavailable",
      device: "skipped",
      shader: "skipped",
      pipeline: "skipped",
    };
    const invented: LabReceipt = { ...webgpu, actual: "webgl2" };
    const partial: LabReceipt = { ...webgpu, shader: "error", pipeline: "skipped" };
    assert.equal(qualifyBackend(webgpu), "pass");
    assert.equal(qualifyBackend(fallback), "pass");
    assert.equal(qualifyBackend(invented), "fail");
    assert.equal(qualifyBackend({ ...partial, actual: "webgpu" }), "fail");
    assert.equal(
      qualifyBackend({ requested: "webgl2", actual: "canvas", adapter: "skipped", device: "skipped", shader: "skipped", pipeline: "skipped" }),
      "pass",
    );
  });
});

describe("springs", () => {
  it("settles to the same place at 30 Hz and 144 Hz", () => {
    const slow = createSpring(0, { target: 1 });
    const fast = createSpring(0, { target: 1 });
    const slowClock = createClock();
    const fastClock = createClock();
    for (let step = 0; step < 60; step++) stepSpring(slow, 1 / 30, slowClock);
    for (let step = 0; step < 288; step++) stepSpring(fast, 1 / 144, fastClock);
    assert.ok(Math.abs(slow.value - 1) < 0.02, `30 Hz landed on ${slow.value}`);
    assert.ok(Math.abs(fast.value - 1) < 0.02, `144 Hz landed on ${fast.value}`);
    assert.ok(Math.abs(slow.value - fast.value) < 0.02);
  });

  it("overshoots when underdamped and does not ring when overdamped", () => {
    const loose = createSpring(0, { target: 1, stiffness: 200, damping: 4, mass: 1 });
    assert.ok(dampingRatio(loose) < 1);
    const looseClock = createClock();
    let peak = 0;
    for (let step = 0; step < 240; step++) {
      stepSpring(loose, 1 / 120, looseClock);
      peak = Math.max(peak, loose.value);
    }
    assert.ok(peak > 1.05, `underdamped peak ${peak}`);

    const heavy = createSpring(0, { target: 1, stiffness: 20, damping: 40, mass: 1 });
    assert.ok(dampingRatio(heavy) > 1);
    const heavyClock = createClock();
    let heavyPeak = 0;
    for (let step = 0; step < 240; step++) {
      stepSpring(heavy, 1 / 120, heavyClock);
      heavyPeak = Math.max(heavyPeak, heavy.value);
    }
    assert.ok(heavyPeak <= 1.02, `overdamped peak ${heavyPeak}`);
  });

  it("ignores a non-positive step and adds a kick to velocity", () => {
    const spring = createSpring(0.25, { target: 1, velocity: 4 });
    const clock = createClock();
    stepSpring(spring, 0, clock);
    stepSpring(spring, -1, clock);
    assert.equal(spring.value, 0.25);
    assert.equal(spring.velocity, 4);
    kick(spring, -1.5);
    assert.equal(spring.velocity, 2.5);
  });
});

describe("wave field", () => {
  it("matches the shader curve and pulls particles toward it", () => {
    const waves = [{ amp: 1, freq: 1, phase: 0 }];
    assert.ok(Math.abs(curveY(0.25, waves, 0) - 0.92) < 1e-9);
    const pool = createPool(1);
    const origin = pool[0].y;
    stepPool(pool, 1 / 60, [{ amp: 1, freq: 1, phase: Math.PI / 2 }], 0);
    assert.ok(pool[0].y < origin);
    assert.ok(pool[0].x > 0.5);
    assert.ok(pool[0].trail.length >= 2);
    const held = pool[0].y;
    stepPool(pool, 0, waves, 0);
    stepPool(pool, -0.5, waves, 0);
    assert.equal(pool[0].y, held);
    assert.equal(createPool(0).length, 0);
    assert.equal(createPool(-4).length, 0);
  });
});

describe("stage door", () => {
  it("fades the floor out and the station in", () => {
    assert.deepEqual(doorPose(0), { lobbyOpacity: 1, lobbyScale: 1, stationOpacity: 0, stationY: 22 });
    assert.equal(doorPose(1).lobbyOpacity, 0);
    assert.equal(doorPose(1).stationOpacity, 1);
    assert.equal(doorPose(1).stationY, 0);
    assert.equal(arriveDraw(-0.4), 0);
    assert.equal(arriveDraw(0.4), 0.4);
    assert.equal(arriveDraw(2), 1);
  });

  it("settles the door and lets an arrival overshoot", () => {
    const door = createSpring(0, { target: 1, ...DOOR_SPRING });
    const clock = createClock();
    for (let step = 0; step < 120; step++) stepSpring(door, 1 / 60, clock);
    assert.ok(Math.abs(door.value - 1) < 0.02);

    const arrive = createSpring(0, { target: 1, ...ARRIVE_SPRING });
    kick(arrive, ARRIVE_KICK);
    const arriveClock = createClock();
    let low = 0;
    let high = 0;
    for (let step = 0; step < 180; step++) {
      stepSpring(arrive, 1 / 120, arriveClock);
      low = Math.min(low, arrive.value);
      high = Math.max(high, arrive.value);
    }
    assert.ok(low < 0, `anticipation ${low}`);
    assert.ok(high > 1.02, `overshoot ${high}`);
    assert.ok(Math.abs(arrive.value - 1) < 0.05);
  });

  it("judges a measured visit against a stated bar", () => {
    assert.equal(qualifyVisit({ avgFps: 60, p95Ms: 16.8 }), "clear");
    assert.equal(qualifyVisit({ avgFps: 49, p95Ms: 16 }), "miss");
    assert.equal(qualifyVisit({ avgFps: 60, p95Ms: 40 }), "miss");
    assert.equal(qualifyVisit({ avgFps: 0, p95Ms: 0 }), "miss");
  });
});
