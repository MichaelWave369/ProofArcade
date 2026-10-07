import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { auditAngle } from "./angle/levels.ts";
import {
  ANGLE_PLAYS,
  angleBenchRange,
  angleBenchSolved,
  angleBenchValue,
  applyAngleHandle,
  auditAngleBench,
  pointerAngleDegrees,
} from "./angle/bench.ts";
import { auditArea } from "./area/levels.ts";
import {
  AREA_PLAYS,
  areaAmount,
  areaBounds,
  areaSolved,
  auditAreaPlay,
  snapAreaDimensions,
} from "./area/bench.ts";
import { auditBalance } from "./balance/levels.ts";
import {
  BALANCE_PLAYS,
  applyScale,
  auditScale,
  balanced,
} from "./balance/scale.ts";
import {
  BANDS,
  CABINETS,
  SUBJECTS,
  filterCabinets,
  formatLastPlayed,
  highestLevel,
  isUntouched,
  masteryPercent,
  proofsCleared,
} from "./catalog.ts";
import { auditFraction } from "./fraction/levels.ts";
import {
  FORGE_LEVELS,
  applyForge,
  auditForge,
  beginForge,
  forgeValueConserved,
  sameFrac,
  totalForgeValue,
} from "./fraction/forge.ts";
import { auditGrid } from "./grid/levels.ts";
import { auditLogic } from "./logic/levels.ts";
import { auditMachine } from "./machine/levels.ts";
import {
  MACHINE_PLAYS,
  auditMachineBench,
  machineRuleMatches,
  reverseTrace,
  ruleStages,
  traceRule,
} from "./machine/bench.ts";
import { auditMotion } from "./motion/levels.ts";
import {
  TRIP_PLAYS,
  auditTrip,
  snapTripControls,
  tripDistance,
  tripSolved,
  tripStateAt,
  validTripPairs,
} from "./motion/trip.ts";
import { auditOdds } from "./odds/levels.ts";
import { auditOrbit } from "./orbit/levels.ts";
import { ORBIT_PLAYS, auditOrbitPlay } from "./orbit/plays.ts";
import {
  conservationError,
  fly,
  orbitElements,
  specificAngularMomentum,
  specificEnergy,
  stepBody,
} from "./orbit/sim.ts";
import { auditPrime } from "./prime/levels.ts";
import { auditSlope } from "./slope/levels.ts";
import {
  LINE_PLAYS,
  auditLine,
  lineSolved,
  onLine,
  riseRun,
  samePoint,
  slopeText,
  snapPoint,
} from "./slope/line.ts";
import { auditVector } from "./vector/levels.ts";
import {
  DRIFT_LEVELS,
  applyDrift,
  auditDrift,
  beginDrift,
  sameV,
} from "./vector/drift.ts";
import { auditWave } from "./waves/levels.ts";
import {
  WAVE_PLAYS,
  auditWavePlay,
  interferenceMetrics,
  normalizedWaveTime,
  standingNodes,
} from "./waves/play.ts";
import {
  emptyProgress,
  loadProgress,
  noteClear,
  noteScore,
  noteVisit,
  type ProgressStore,
  type TrackId,
} from "./progress.ts";

function memory(seed: Record<string, string> = {}): ProgressStore & { data: Map<string, string> } {
  const data = new Map(Object.entries(seed));
  return {
    data,
    getItem(key) {
      return data.has(key) ? data.get(key)! : null;
    },
    setItem(key, value) {
      data.set(key, value);
    },
  };
}

describe("save migration", () => {
  it("seeds v3 from the original bubble and symbol saves and leaves them in place", () => {
    const store = memory({
      "bubble-proof-v1": JSON.stringify({ best: 1200, mute: true }),
      "symbol-match-v1": JSON.stringify({ best: 840, bestStage: 5, mute: false }),
    });
    const progress = loadProgress(store);
    assert.equal(progress.tracks.bubbles.best, 1200);
    assert.equal(progress.tracks.symbols.best, 840);
    assert.equal(progress.tracks.symbols.cleared, 4);
    assert.equal(progress.tracks.equals.best, 0);
    assert.equal(store.getItem("bubble-proof-v1"), JSON.stringify({ best: 1200, mute: true }));
    assert.ok(store.getItem("proof-arcade-v3"));
    assert.equal(store.getItem("proof-arcade-v2"), null);
  });

  it("migrates v2 scores without deleting v2 or inventing a last-played time", () => {
    const v2 = {
      tracks: {
        bubbles: { best: 90, cleared: 3, scores: [10, 20, 30] },
        symbols: { best: 40, cleared: 1, scores: [40] },
        equals: { best: 0, cleared: 0, scores: [] },
        run: { best: 15, cleared: 2, scores: [8, 7] },
      },
    };
    const store = memory({ "proof-arcade-v2": JSON.stringify(v2) });
    const progress = loadProgress(store);
    assert.deepEqual(progress.tracks.bubbles.scores, [10, 20, 30]);
    assert.equal(progress.tracks.run.cleared, 2);
    assert.equal(progress.tracks.bubbles.lastPlayed, 0);
    assert.equal(store.getItem("proof-arcade-v2"), JSON.stringify(v2));
    const again = loadProgress(store);
    assert.equal(again.tracks.bubbles.best, 90);
  });

  it("prefers an existing v3 save over older keys", () => {
    const store = memory({
      "proof-arcade-v3": JSON.stringify({
        tracks: {
          bubbles: { best: 5, cleared: 1, scores: [5], lastPlayed: 50 },
          symbols: { best: 0, cleared: 0, scores: [], lastPlayed: 0 },
          equals: { best: 0, cleared: 0, scores: [], lastPlayed: 0 },
          run: { best: 0, cleared: 0, scores: [], lastPlayed: 0 },
        },
      }),
      "proof-arcade-v2": JSON.stringify({
        tracks: { bubbles: { best: 999, cleared: 9, scores: [999] } },
      }),
      "bubble-proof-v1": JSON.stringify({ best: 4000 }),
    });
    const progress = loadProgress(store);
    assert.equal(progress.tracks.bubbles.best, 5);
    assert.equal(progress.tracks.bubbles.lastPlayed, 50);
    assert.equal(progress.tracks.orbit.best, 0);
  });

  it("moves an old orbit frequency save onto waves once, then leaves a new orbit score alone", () => {
    const store = memory({
      "proof-arcade-v3": JSON.stringify({
        tracks: {
          orbit: { best: 40, cleared: 2, scores: [10, 30], lastPlayed: 9 },
        },
      }),
    });
    const progress = loadProgress(store);
    assert.equal(progress.tracks.waves.best, 40);
    assert.equal(progress.tracks.waves.cleared, 2);
    assert.deepEqual(progress.tracks.waves.scores, [10, 30]);
    assert.equal(progress.tracks.orbit.best, 0);
    noteScore("orbit", 70, store, 11);
    const again = loadProgress(store);
    assert.equal(again.tracks.orbit.best, 70);
    assert.equal(again.tracks.waves.best, 40);
    assert.equal(again.tracks.orbit.cleared, 0);
  });

  it("ignores corrupt saves and still writes a usable v3", () => {
    const store = memory({ "proof-arcade-v3": "{", "proof-arcade-v2": "nope" });
    const progress = loadProgress(store);
    assert.deepEqual(progress, emptyProgress());
    assert.notEqual(store.getItem("proof-arcade-v3"), "{");
  });
});

describe("score writes", () => {
  it("keeps the best score and stamps last played", () => {
    const store = memory();
    const first = noteScore("equals", 40, store, 1_000);
    assert.equal(first.best, 40);
    assert.equal(first.lastPlayed, 1_000);
    const second = noteScore("equals", 12, store, 2_000);
    assert.equal(second.best, 40);
    assert.equal(second.lastPlayed, 2_000);
  });

  it("records a clear without dropping a higher per-level score", () => {
    const store = memory();
    noteClear("run", 2, 18, 30, store, 100);
    const next = noteClear("run", 2, 10, 22, store, 200);
    assert.equal(next.cleared, 2);
    assert.deepEqual(next.scores, [0, 18]);
    assert.equal(next.best, 30);
    assert.equal(next.lastPlayed, 200);
  });

  it("notes a visit without changing the score", () => {
    const store = memory();
    noteScore("bubbles", 8, store, 10);
    const visit = noteVisit("bubbles", store, 80);
    assert.equal(visit.best, 8);
    assert.equal(visit.lastPlayed, 80);
  });
});

describe("cabinet catalog", () => {
  it("lists eighteen distinct stations with real level counts", () => {
    const ids = CABINETS.map((cabinet) => cabinet.id);
    assert.deepEqual(ids, [
      "bubbles",
      "symbols",
      "equals",
      "run",
      "logic",
      "odds",
      "slope",
      "fractions",
      "primes",
      "vectors",
      "angles",
      "machine",
      "balance",
      "area",
      "motion",
      "grid",
      "waves",
      "orbit",
    ]);
    assert.equal(new Set(ids).size, ids.length);
    for (const cabinet of CABINETS) {
      assert.ok(cabinet.levels >= 16, cabinet.id);
      assert.ok(BANDS.includes(cabinet.band));
      assert.ok(cabinet.subjects.length > 0);
      for (const subject of cabinet.subjects) assert.ok(SUBJECTS.includes(subject));
    }
    assert.equal(CABINETS.find((cabinet) => cabinet.flagship)?.title, "Bubble Proof");
  });

  it("filters by subject and band without inventing stations", () => {
    assert.deepEqual(
      filterCabinets("PHYSICS", "ALL").map((cabinet) => cabinet.id),
      ["bubbles", "symbols", "vectors", "motion", "waves", "orbit"],
    );
    assert.deepEqual(
      filterCabinets("ALL", "Explorer").map((cabinet) => cabinet.id),
      ["run", "fractions"],
    );
    assert.deepEqual(filterCabinets("LOGIC", "Solver"), []);
    assert.deepEqual(
      filterCabinets("LOGIC", "Researcher").map((cabinet) => cabinet.id),
      ["logic"],
    );
    assert.deepEqual(
      filterCabinets("PROBABILITY", "ALL").map((cabinet) => cabinet.id),
      ["odds"],
    );
    assert.deepEqual(
      filterCabinets("ADVANCED", "ALL").map((cabinet) => cabinet.id),
      ["slope", "primes", "grid"],
    );
    assert.equal(filterCabinets("ALGEBRA", "Solver")[0]?.id, "bubbles");
  });

  it("computes mastery, highest level, and the new-station mark", () => {
    assert.equal(masteryPercent(4, 16), 25);
    assert.equal(masteryPercent(20, 16), 100);
    assert.equal(masteryPercent(0, 16), 0);
    assert.equal(highestLevel(20, 16), 16);
    const fresh = emptyProgress().tracks.bubbles;
    assert.equal(isUntouched(fresh), true);
    assert.equal(isUntouched({ ...fresh, best: 1 }), false);
    const tracks = emptyProgress().tracks;
    tracks.bubbles.cleared = 4;
    tracks.run.cleared = 2;
    assert.equal(proofsCleared(tracks), 6);
  });

  it("formats last played from the local calendar", () => {
    const now = new Date(2026, 9, 6, 15, 0, 0).getTime();
    assert.equal(formatLastPlayed(0, now), "Never");
    assert.equal(formatLastPlayed(new Date(2026, 9, 6, 1, 0, 0).getTime(), now), "Today");
    assert.equal(formatLastPlayed(new Date(2026, 9, 5, 23, 0, 0).getTime(), now), "Yesterday");
  });
});

describe("new stations", () => {
  it("audits every therefore claim and every odds chance", () => {
    assert.deepEqual(auditLogic(), []);
    assert.deepEqual(auditOdds(), []);
    assert.deepEqual(auditSlope(), []);
    assert.deepEqual(auditLine(), []);
    assert.deepEqual(auditFraction(), []);
    assert.deepEqual(auditPrime(), []);
    assert.deepEqual(auditVector(), []);
    assert.deepEqual(auditAngle(), []);
    assert.deepEqual(auditAngleBench(), []);
    assert.deepEqual(auditMachine(), []);
    assert.deepEqual(auditMachineBench(), []);
    assert.deepEqual(auditBalance(), []);
    assert.deepEqual(auditArea(), []);
    assert.deepEqual(auditAreaPlay(), []);
    assert.deepEqual(auditMotion(), []);
    assert.deepEqual(auditTrip(), []);
    assert.deepEqual(auditGrid(), []);
    assert.deepEqual(auditOrbit(), []);
    assert.deepEqual(auditDrift(), []);
    assert.deepEqual(auditScale(), []);
    assert.deepEqual(auditForge(), []);
    assert.deepEqual(auditWave(), []);
    assert.deepEqual(auditWavePlay(), []);
    assert.deepEqual(auditOrbitPlay(), []);
  });
});


  it("conserves exact fraction value through every Forge action and direct return", () => {
    for (const level of FORGE_LEVELS) {
      let state = beginForge(level);
      const initial = totalForgeValue(state);
      for (const action of level.script) {
        const next = applyForge(state, action);
        assert.ok(next, `forge level ${level.id} rejected authored action ${action.t}`);
        assert.equal(forgeValueConserved(state, next), true, `forge level ${level.id} changed value on ${action.t}`);
        assert.equal(sameFrac(totalForgeValue(next), initial), true, `forge level ${level.id} leaked value`);
        state = next;
      }
    }

    const start = beginForge(FORGE_LEVELS[0]);
    const placed = applyForge(start, { t: "place", index: 0 });
    assert.ok(placed);
    const returned = applyForge(placed, { t: "return", index: 0 });
    assert.ok(returned);
    assert.equal(forgeValueConserved(start, returned), true);
    assert.equal(sameFrac(totalForgeValue(start), totalForgeValue(returned)), true);
  });


  it("applies direct Vector Drift cards atomically without mutating prior state", () => {
    for (const level of DRIFT_LEVELS) {
      const start = beginDrift(level);
      const before = structuredClone(start);
      for (let index = 0; index < level.cards.length; index += 1) {
        const next = applyDrift(level, start, index);
        if (!next) continue;
        assert.deepEqual(start, before, `vector level ${level.id} mutated the prior state`);
        assert.equal(next.used[index], true, `vector level ${level.id} did not consume card ${index}`);
        assert.equal(next.turn, start.turn + 1);
        assert.equal(next.trail.length, start.trail.length + 1);
        assert.equal(sameV(next.applied, level.cards[index]), true);
      }
    }
  });


  it("keeps every legal direct Balance Lab operation symmetric and balanced", () => {
    for (const play of BALANCE_PLAYS) {
      for (const op of play.ops) {
        const before = structuredClone(play.start);
        const next = applyScale(play.start, op);
        if (!next) continue;
        assert.deepEqual(play.start, before, `balance level ${play.id} mutated its start state`);
        assert.equal(balanced(play.start, play.x), true);
        assert.equal(balanced(next, play.x), true, `balance level ${play.id} broke equality on ${op.kind} ${op.n}`);

        if (op.kind === "add") {
          assert.equal(next.left.a, play.start.left.a);
          assert.equal(next.right.a, play.start.right.a);
          assert.equal(next.left.b - play.start.left.b, op.n);
          assert.equal(next.right.b - play.start.right.b, op.n);
        } else if (op.kind === "mul") {
          assert.equal(next.left.a, play.start.left.a * op.n);
          assert.equal(next.left.b, play.start.left.b * op.n);
          assert.equal(next.right.a, play.start.right.a * op.n);
          assert.equal(next.right.b, play.start.right.b * op.n);
        } else {
          assert.equal(next.left.a * op.n, play.start.left.a);
          assert.equal(next.left.b * op.n, play.start.left.b);
          assert.equal(next.right.a * op.n, play.start.right.a);
          assert.equal(next.right.b * op.n, play.start.right.b);
        }
      }
    }
  });


  it("snaps direct Slope manipulation to the lattice without changing line truth", () => {
    assert.deepEqual(snapPoint({ x: 2.49, y: -1.51 }, 4), { x: 2, y: -2 });
    assert.deepEqual(snapPoint({ x: 9.8, y: -9.8 }, 4), { x: 4, y: -4 });

    for (const play of LINE_PLAYS) {
      const snappedSolution = snapPoint(play.solution, play.span);
      assert.equal(samePoint(snappedSolution, play.solution), true, `slope level ${play.id} solution left lattice`);
      assert.equal(lineSolved(play, snappedSolution), true, `slope level ${play.id} snapped solution failed`);

      const delta = riseRun(play.anchor, play.solution);
      if (play.aim === "slope") {
        assert.equal(slopeText(play.anchor, play.solution), play.slope);
        if (delta.run !== 0 || delta.rise !== 0) {
          const doubled = snapPoint(
            {
              x: play.anchor.x + delta.run * 2,
              y: play.anchor.y + delta.rise * 2,
            },
            play.span,
          );
          if (!samePoint(doubled, play.anchor) && Math.abs(doubled.x) <= play.span && Math.abs(doubled.y) <= play.span) {
            const doubledDelta = riseRun(play.anchor, doubled);
            if (doubledDelta.run === delta.run * 2 && doubledDelta.rise === delta.rise * 2) {
              assert.equal(slopeText(play.anchor, doubled), slopeText(play.anchor, play.solution));
            }
          }
        }
      }

      if (play.aim === "through" && play.through) {
        assert.equal(onLine(play.anchor, play.solution, play.through), true);
      }
    }
  });


  it("snaps direct Area handles to legal integer dimensions without changing area truth", () => {
    for (const play of AREA_PLAYS) {
      const bounds = areaBounds(play);
      const snappedSolution = snapAreaDimensions(play, play.solutionW, play.solutionH);

      assert.deepEqual(
        snappedSolution,
        { w: play.solutionW, h: play.solutionH },
        `area level ${play.id} solution left the integer lattice`,
      );
      assert.equal(
        areaSolved(play, snappedSolution.w, snappedSolution.h),
        true,
        `area level ${play.id} snapped solution failed`,
      );
      assert.equal(
        areaAmount(play, snappedSolution.w, snappedSolution.h),
        play.target,
        `area level ${play.id} changed target amount`,
      );

      const high = snapAreaDimensions(play, 999.4, 999.4);
      assert.equal(high.w, bounds.maxW);
      assert.equal(high.h, bounds.maxH);

      const low = snapAreaDimensions(play, -999.4, -999.4);
      assert.equal(low.w, bounds.minW);
      assert.equal(low.h, bounds.minH);
      assert.equal(Number.isInteger(low.w), true);
      assert.equal(Number.isInteger(low.h), true);
    }
  });


  it("keeps direct Motion controls discrete and the launch path faithful to d = vt", () => {
    for (const play of TRIP_PLAYS) {
      const snapped = snapTripControls(play, play.solutionSpeed, play.solutionTime);
      assert.deepEqual(
        snapped,
        { speed: play.solutionSpeed, time: play.solutionTime },
        `motion level ${play.id} altered its authored solution`,
      );
      assert.equal(tripSolved(play, snapped.speed, snapped.time), true);

      const pairs = validTripPairs(play);
      assert.ok(pairs.length >= 1, `motion level ${play.id} has no legal pair`);
      for (const pair of pairs) {
        assert.equal(tripSolved(play, pair.speed, pair.time), true);
        assert.equal(tripDistance(pair.speed, pair.time), play.flag);
      }

      const quarter = tripStateAt(snapped.speed, snapped.time, snapped.time / 4);
      const half = tripStateAt(snapped.speed, snapped.time, snapped.time / 2);
      const finish = tripStateAt(snapped.speed, snapped.time, snapped.time + 100);

      assert.equal(quarter.distance, snapped.speed * quarter.elapsed);
      assert.equal(half.distance, snapped.speed * half.elapsed);
      assert.equal(half.distance, quarter.distance * 2);
      assert.equal(finish.elapsed, snapped.time);
      assert.equal(finish.distance, play.flag);
      assert.equal(finish.done, true);

      const high = snapTripControls(play, 999.7, 999.7);
      assert.ok(high.speed >= 1 && high.speed <= play.maxSpeed);
      assert.ok(high.time >= 1 && high.time <= play.maxTime);
      assert.equal(Number.isInteger(high.speed), true);
      assert.equal(Number.isInteger(high.time), true);
      if (play.aim === "speed") assert.equal(high.time, play.time);
      if (play.aim === "time") assert.equal(high.speed, play.speed);
    }

    assert.ok(validTripPairs(TRIP_PLAYS[0]).length > 1, "open Motion level should accept multiple factor pairs");
  });


  it("keeps Wave Lab diagnostics tied to the actual wave model", () => {
    assert.ok(Math.abs(normalizedWaveTime(Math.PI * 2 + 0.4) - 0.4) < 1e-9);

    const cancel = WAVE_PLAYS.find((play) => play.kind === "cancel");
    assert.ok(cancel);
    const cancelMetrics = interferenceMetrics([...cancel.fixed, ...cancel.solution], 0.7);
    assert.ok(cancelMetrics.sumRms < 0.01, `cancel RMS ${cancelMetrics.sumRms}`);

    const standing = WAVE_PLAYS.find((play) => play.kind === "standing");
    assert.ok(standing);
    const standingWaves = [...standing.fixed, ...standing.solution];
    const nodes = standingNodes(standingWaves);
    assert.ok(nodes.length >= 2, "standing solution should expose fixed nodes");
    for (const x of nodes) {
      for (const time of [0, 0.7, 1.4]) {
        const metrics = interferenceMetrics(standingWaves, time, 64);
        assert.ok(Number.isFinite(metrics.ratio));
        const displacement = standingWaves.reduce((sum, wave) => {
          const dir = wave.dir === -1 ? -1 : 1;
          return sum + wave.amp * Math.sin(wave.freq * x * Math.PI * 2 + wave.phase + dir * time);
        }, 0);
        assert.ok(Math.abs(displacement) < 0.02, `node drifted at x=${x}, t=${time}: ${displacement}`);
      }
    }
  });


  it("keeps Orbit integration conservative enough for the live instrument", () => {
    for (const play of ORBIT_PLAYS) {
      const samples = fly(play.solution);
      const drift = conservationError(samples);

      assert.ok(
        drift.maxEnergyRelative < 0.01,
        `orbit level ${play.id} energy drift ${drift.maxEnergyRelative}`,
      );
      assert.ok(
        drift.maxAngularMomentumRelative < 1e-6,
        `orbit level ${play.id} angular momentum drift ${drift.maxAngularMomentumRelative}`,
      );

      const initial = samples[0];
      assert.ok(initial);
      const elements = orbitElements(initial);
      assert.equal(Number.isFinite(elements.energy), true);
      assert.equal(Number.isFinite(elements.angularMomentum), true);
      assert.equal(Number.isFinite(elements.eccentricity), true);

      const next = stepBody(initial);
      assert.ok(
        Math.abs(specificAngularMomentum(next) - specificAngularMomentum(initial)) < 1e-8,
        `orbit level ${play.id} single-step angular momentum changed`,
      );
      assert.ok(
        Math.abs(specificEnergy(next) - specificEnergy(initial)) < 5e-4,
        `orbit level ${play.id} single-step energy changed too much`,
      );
    }
  });


  it("keeps direct Angle manipulation on valid geometric relationships", () => {
    assert.ok(Math.abs(pointerAngleDegrees(0, 0, 1, 0) - 0) < 1e-9);
    assert.ok(Math.abs(pointerAngleDegrees(0, 0, 0, -1) - 90) < 1e-9);
    assert.ok(Math.abs(pointerAngleDegrees(0, 0, -1, 0) - 180) < 1e-9);

    for (const play of ANGLE_PLAYS) {
      assert.equal(angleBenchSolved(play, play.solution), true, `angle level ${play.id} solution failed`);
      assert.equal(angleBenchSolved(play, play.start), false, `angle level ${play.id} starts solved`);
      assert.equal(
        angleBenchValue(play.kind, play.solution),
        play.target,
        `angle level ${play.id} target changed`,
      );

      const range = angleBenchRange(play);
      const low = applyAngleHandle(play, play.start, -999);
      const high = applyAngleHandle(play, play.start, 999);
      const lowControl = play.kind === "triangle" ? low.b : low.a;
      const highControl = play.kind === "triangle" ? high.b : high.a;
      assert.equal(lowControl, range.min);
      assert.equal(highControl, range.max);

      if (play.kind === "complement") {
        assert.equal(play.solution.a + angleBenchValue(play.kind, play.solution), 90);
      } else if (play.kind === "supplement") {
        assert.equal(play.solution.a + angleBenchValue(play.kind, play.solution), 180);
      } else if (play.kind === "vertical") {
        assert.equal(play.solution.a, angleBenchValue(play.kind, play.solution));
      } else {
        assert.equal(
          play.solution.a + play.solution.b + angleBenchValue(play.kind, play.solution),
          180,
        );
      }
    }
  });


  it("keeps direct Machine runs faithful forward and backward", () => {
    for (const play of MACHINE_PLAYS) {
      const trace = traceRule(play.rule, play.input);
      assert.equal(trace.input, play.input);
      assert.equal(trace.output, play.output);

      const stages = ruleStages(play.rule, play.input);
      assert.deepEqual(stages, trace.stages);
      assert.ok(stages.length >= 1 && stages.length <= 2);
      for (let index = 1; index < stages.length; index += 1) {
        assert.equal(stages[index - 1].after, stages[index].before);
      }

      const reverse = reverseTrace(play.rule, play.output);
      assert.ok(reverse, `machine level ${play.id} has no exact reverse trace`);
      assert.equal(reverse.input, play.input, `machine level ${play.id} reverse missed input`);

      if (play.mode === "rule") {
        const matches = play.candidates.filter((rule) => machineRuleMatches(play, rule));
        assert.equal(matches.length, 1, `machine level ${play.id} has ambiguous candidates`);
        assert.deepEqual(matches[0], play.rule);
      }
    }
  });

describe("shipped identity", () => {
  it("brands the document and share card as Proof Arcade, not a template name", () => {
    const site = JSON.parse(readFileSync(new URL("../lib/og/site.json", import.meta.url), "utf8")) as {
      title?: string;
      type?: string;
      card?: string;
      description?: string;
    };
    const root = readFileSync(new URL("../routes/__root.tsx", import.meta.url), "utf8");
    assert.equal(site.title, "Proof Arcade");
    assert.equal(site.type, "x:game");
    assert.equal(site.card, "custom");
    assert.match(site.description ?? "", /Bubble Proof/);
    assert.doesNotMatch(site.title ?? "", /Grok App|My App|Hello World/);
    assert.match(root, /const APP_NAME = "Proof Arcade"/);
    assert.doesNotMatch(root, /title: "Grok App"|title: "My App"/);
    const ids: TrackId[] = [
      "bubbles",
      "symbols",
      "equals",
      "run",
      "logic",
      "odds",
      "slope",
      "fractions",
      "primes",
      "vectors",
      "angles",
      "machine",
      "balance",
      "area",
      "motion",
      "grid",
      "waves",
      "orbit",
    ];
    assert.equal(ids.length, CABINETS.length);
  });
});
