import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { auditAngle } from "./angle/levels.ts";
import { auditArea } from "./area/levels.ts";
import { auditAreaPlay } from "./area/bench.ts";
import { auditBalance } from "./balance/levels.ts";
import { auditScale } from "./balance/scale.ts";
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
import { auditMotion } from "./motion/levels.ts";
import { auditTrip } from "./motion/trip.ts";
import { auditOdds } from "./odds/levels.ts";
import { auditOrbit } from "./orbit/levels.ts";
import { auditOrbitPlay } from "./orbit/plays.ts";
import { auditPrime } from "./prime/levels.ts";
import { auditSlope } from "./slope/levels.ts";
import { auditLine } from "./slope/line.ts";
import { auditVector } from "./vector/levels.ts";
import {
  DRIFT_LEVELS,
  applyDrift,
  auditDrift,
  beginDrift,
  sameV,
} from "./vector/drift.ts";
import { auditWave } from "./waves/levels.ts";
import { auditWavePlay } from "./waves/play.ts";
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
    assert.deepEqual(auditMachine(), []);
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
