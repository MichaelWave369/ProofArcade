import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { BenchFrame, LevelStrip, QuestionsChip } from "@/components/bench-frame";
import { RoundProof } from "@/components/round-proof";
import { noteClear } from "@/game/progress";
import {
  GRID_MAX,
  GRID_MIN,
  GRID_PLAYS,
  distanceExpression,
  gridBenchInstruction,
  gridBenchSolved,
  gridDelta,
  sameGridPoint,
  snapGridPoint,
  type GridBenchPlay,
} from "@/game/grid/bench";
import {
  GRID_LEVELS,
  auditGrid,
  gridCaption,
  pointLabel,
  type GridPrompt,
  type Pt,
} from "@/game/grid/levels";

const SIZE = 300;
const PAD = 24;
const SPAN = GRID_MAX - GRID_MIN;
const CELL = (SIZE - PAD * 2) / SPAN;

function mapX(n: number) {
  return PAD + (n - GRID_MIN) * CELL;
}

function mapY(n: number) {
  return SIZE - PAD - (n - GRID_MIN) * CELL;
}

function fromPointer(event: ReactPointerEvent<SVGCircleElement>): Pt {
  const svg = event.currentTarget.ownerSVGElement;
  if (!svg) return [0, 0];
  const rect = svg.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * SIZE;
  const y = ((event.clientY - rect.top) / rect.height) * SIZE;
  return snapGridPoint(
    GRID_MIN + (x - PAD) / CELL,
    GRID_MIN + (SIZE - PAD - y) / CELL,
  );
}

function GridFigure({ a, b }: { a: Pt; b: Pt }) {
  return (
    <svg
      viewBox="0 0 180 180"
      className="mx-auto h-40 w-full max-w-xs"
      role="img"
      aria-label={`Points ${a[0]}, ${a[1]} and ${b[0]}, ${b[1]}`}
    >
      <line x1="14" y1="90" x2="166" y2="90" className="text-line" stroke="currentColor" />
      <line x1="90" y1="14" x2="90" y2="166" className="text-line" stroke="currentColor" />
      <line
        x1={90 + a[0] * 12}
        y1={90 - a[1] * 12}
        x2={90 + b[0] * 12}
        y2={90 - b[1] * 12}
        className="text-gold"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx={90 + a[0] * 12} cy={90 - a[1] * 12} r="5" className="text-gold" fill="currentColor" />
      <circle cx={90 + b[0] * 12} cy={90 - b[1] * 12} r="5" className="text-mint" fill="currentColor" />
    </svg>
  );
}

function GridQuestions({
  active,
  onExit,
  onBench,
}: {
  active: boolean;
  onExit?: () => void;
  onBench: () => void;
}) {
  return (
    <div className="relative h-dvh">
      <RoundProof<GridPrompt>
        active={active}
        onExit={onExit}
        track="grid"
        mark="+"
        title="Grid"
        menuKicker="GEOMETRY"
        menuTitle="Two lattice points."
        menuBody="Name the halfway point, or the straight-line distance. Keys 1 to 4. A miss costs a heart. Sixteen levels."
        levels={GRID_LEVELS}
        audit={auditGrid}
        renderScene={(prompt) => (
          <div>
            <GridFigure a={prompt.scene.a} b={prompt.scene.b} />
            <p className="mt-1 text-center font-mono text-xs text-mist">
              <span className="text-gold">
                {prompt.scene.a[0]}, {prompt.scene.a[1]}
              </span>
              <span> to </span>
              <span className="text-mint">
                {prompt.scene.b[0]}, {prompt.scene.b[1]}
              </span>
            </p>
            <p className="sr-only">{gridCaption(prompt.scene)}</p>
          </div>
        )}
      />
      <QuestionsChip label="Bench" onClick={onBench} />
    </div>
  );
}

function GridLines() {
  const ticks = Array.from(
    { length: GRID_MAX - GRID_MIN + 1 },
    (_, index) => GRID_MIN + index,
  );

  return (
    <>
      {ticks.map((tick) => (
        <g key={tick} className="text-line" stroke="currentColor">
          <line
            x1={mapX(tick)}
            y1={PAD}
            x2={mapX(tick)}
            y2={SIZE - PAD}
            opacity={tick === 0 ? 0.9 : 0.42}
          />
          <line
            x1={PAD}
            y1={mapY(tick)}
            x2={SIZE - PAD}
            y2={mapY(tick)}
            opacity={tick === 0 ? 0.9 : 0.42}
          />
        </g>
      ))}
    </>
  );
}

function CoordinateLabel({
  point,
  tone,
  offsetY = -14,
}: {
  point: Pt;
  tone: string;
  offsetY?: number;
}) {
  return (
    <text
      x={mapX(point[0])}
      y={mapY(point[1]) + offsetY}
      textAnchor="middle"
      fontSize="9"
      className={`fill-current font-mono ${tone}`}
    >
      {pointLabel(point)}
    </text>
  );
}

function DragPoint({
  point,
  solved,
  label,
  onChange,
}: {
  point: Pt;
  solved: boolean;
  label: string;
  onChange: (point: Pt) => void;
}) {
  function move(event: ReactPointerEvent<SVGCircleElement>) {
    onChange(fromPointer(event));
  }

  return (
    <>
      <circle
        cx={mapX(point[0])}
        cy={mapY(point[1])}
        r="17"
        fill="transparent"
        stroke="transparent"
        role="button"
        tabIndex={0}
        aria-label={label}
        className="grid-handle-hit"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          move(event);
        }}
        onPointerMove={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) move(event);
        }}
        onPointerUp={(event) => {
          if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
          move(event);
          event.currentTarget.releasePointerCapture(event.pointerId);
        }}
      />
      <circle
        cx={mapX(point[0])}
        cy={mapY(point[1])}
        r="7"
        className={solved ? "grid-handle-success text-mint" : "text-mint"}
        fill="currentColor"
        pointerEvents="none"
      />
      <circle
        cx={mapX(point[0])}
        cy={mapY(point[1])}
        r="11"
        className="text-mint"
        fill="none"
        stroke="currentColor"
        opacity="0.35"
        pointerEvents="none"
      />
    </>
  );
}

function MidpointBench({
  play,
  point,
  solved,
  onChange,
}: {
  play: Extract<GridBenchPlay, { kind: "mid" }>;
  point: Pt;
  solved: boolean;
  onChange: (point: Pt) => void;
}) {
  const left = gridDelta(play.a, point);
  const right = gridDelta(point, play.b);
  const equalVectors =
    left.run === right.run && left.rise === right.rise;

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="mx-auto aspect-square w-full max-w-lg touch-none"
      role="application"
      aria-label={`Segment from ${pointLabel(play.a)} to ${pointLabel(play.b)}. Probe at ${pointLabel(point)}.`}
      tabIndex={0}
      onKeyDown={(event) => {
        const [x, y] = point;
        if (event.key === "ArrowRight") onChange(snapGridPoint(x + 1, y));
        else if (event.key === "ArrowLeft") onChange(snapGridPoint(x - 1, y));
        else if (event.key === "ArrowUp") onChange(snapGridPoint(x, y + 1));
        else if (event.key === "ArrowDown") onChange(snapGridPoint(x, y - 1));
        else return;
        event.preventDefault();
      }}
    >
      <GridLines />
      <line
        x1={mapX(play.a[0])}
        y1={mapY(play.a[1])}
        x2={mapX(play.b[0])}
        y2={mapY(play.b[1])}
        className="text-gold"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <line
        x1={mapX(play.a[0])}
        y1={mapY(play.a[1])}
        x2={mapX(point[0])}
        y2={mapY(point[1])}
        className={equalVectors ? "text-mint" : "text-cream"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />
      <line
        x1={mapX(point[0])}
        y1={mapY(point[1])}
        x2={mapX(play.b[0])}
        y2={mapY(play.b[1])}
        className={equalVectors ? "text-mint" : "text-cream"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />

      <circle cx={mapX(play.a[0])} cy={mapY(play.a[1])} r="6" className="text-gold" fill="currentColor" />
      <circle cx={mapX(play.b[0])} cy={mapY(play.b[1])} r="6" className="text-gold" fill="currentColor" />
      <CoordinateLabel point={play.a} tone="text-gold" />
      <CoordinateLabel point={play.b} tone="text-gold" />

      <DragPoint
        point={point}
        solved={solved}
        label={`Drag midpoint probe. Current ${pointLabel(point)}.`}
        onChange={onChange}
      />
      <CoordinateLabel point={point} tone="text-mint" offsetY={18} />

      <text x="12" y="18" className="fill-current font-mono text-[9px] text-mist">
        A→M ({left.run}, {left.rise})
      </text>
      <text x="12" y="31" className="fill-current font-mono text-[9px] text-mist">
        M→B ({right.run}, {right.rise})
      </text>
    </svg>
  );
}

function DistanceBench({
  play,
  point,
  solved,
  onChange,
}: {
  play: Extract<GridBenchPlay, { kind: "far" }>;
  point: Pt;
  solved: boolean;
  onChange: (point: Pt) => void;
}) {
  const relation = distanceExpression(play.a, point);
  const elbow: Pt = [point[0], play.a[1]];

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="mx-auto aspect-square w-full max-w-lg touch-none"
      role="application"
      aria-label={`A at ${pointLabel(play.a)}, B at ${pointLabel(point)}, distance ${relation.label}`}
      tabIndex={0}
      onKeyDown={(event) => {
        const [x, y] = point;
        if (event.key === "ArrowRight") onChange(snapGridPoint(x + 1, y));
        else if (event.key === "ArrowLeft") onChange(snapGridPoint(x - 1, y));
        else if (event.key === "ArrowUp") onChange(snapGridPoint(x, y + 1));
        else if (event.key === "ArrowDown") onChange(snapGridPoint(x, y - 1));
        else return;
        event.preventDefault();
      }}
    >
      <GridLines />

      <circle
        cx={mapX(play.a[0])}
        cy={mapY(play.a[1])}
        r={play.targetDistance * CELL}
        className="text-mint"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeDasharray="4 4"
        opacity="0.3"
      />

      <line
        x1={mapX(play.a[0])}
        y1={mapY(play.a[1])}
        x2={mapX(point[0])}
        y2={mapY(point[1])}
        className={solved ? "text-mint" : "text-gold"}
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <line
        x1={mapX(play.a[0])}
        y1={mapY(play.a[1])}
        x2={mapX(elbow[0])}
        y2={mapY(elbow[1])}
        className="text-cream"
        stroke="currentColor"
        strokeDasharray="4 3"
      />
      <line
        x1={mapX(elbow[0])}
        y1={mapY(elbow[1])}
        x2={mapX(point[0])}
        y2={mapY(point[1])}
        className="text-cream"
        stroke="currentColor"
        strokeDasharray="4 3"
      />

      <circle cx={mapX(play.a[0])} cy={mapY(play.a[1])} r="6" className="text-gold" fill="currentColor" />
      <CoordinateLabel point={play.a} tone="text-gold" />

      <DragPoint
        point={point}
        solved={solved}
        label={`Drag point B. Current ${pointLabel(point)}. Distance ${relation.label}.`}
        onChange={(next) => {
          if (!sameGridPoint(next, play.a)) onChange(next);
        }}
      />
      <CoordinateLabel point={point} tone="text-mint" offsetY={18} />

      <text x="12" y="18" className="fill-current font-mono text-[9px] text-mist">
        run {relation.run}
      </text>
      <text x="12" y="31" className="fill-current font-mono text-[9px] text-mist">
        rise {relation.rise}
      </text>
      <text x="12" y="44" className="fill-current font-mono text-[9px] text-cream">
        {relation.run}² + {relation.rise}² = {relation.square}
      </text>
      <text x="12" y="57" className="fill-current font-mono text-[9px] text-mint">
        distance {relation.label}
      </text>
    </svg>
  );
}

function GridBench({
  onExit,
  onQuestions,
}: {
  onExit?: () => void;
  onQuestions: () => void;
}) {
  const [levelId, setLevelId] = useState(1);
  const play = GRID_PLAYS[levelId - 1] ?? GRID_PLAYS[0];
  const [point, setPoint] = useState<Pt>(play.start);
  const [run, setRun] = useState(0);
  const scored = useRef(false);
  const solved = gridBenchSolved(play, point);

  useEffect(() => {
    scored.current = false;
    setPoint(play.start);
  }, [play]);

  useEffect(() => {
    if (!solved || scored.current) return;
    scored.current = true;
    const score = 120;
    setRun((total) => {
      const next = total + score;
      noteClear("grid", play.id, score, next);
      return next;
    });
  }, [solved, play.id]);

  const relation =
    play.kind === "far" ? distanceExpression(play.a, point) : null;

  return (
    <BenchFrame
      kicker="GRID"
      title={play.title}
      meta={`${play.id}/16`}
      onExit={onExit}
      onQuestions={onQuestions}
    >
      <LevelStrip count={GRID_PLAYS.length} current={play.id} onPick={setLevelId} />

      <p className="text-sm text-mist">{gridBenchInstruction(play)}</p>
      <p className="mt-1 font-mono text-xs text-gold">
        {play.kind === "mid"
          ? `Endpoints · ${pointLabel(play.a)} → ${pointLabel(play.b)}`
          : `Target distance · ${play.targetDistance}`}
      </p>

      <div
        className={`mt-3 overflow-hidden rounded-2xl border bg-ink transition-[border-color,box-shadow] duration-150 ${
          solved
            ? "border-mint/60 shadow-[0_0_28px_rgba(143,208,176,0.10)]"
            : "border-line"
        }`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-line/70 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em]">
          <span className="text-mist">Lattice bench</span>
          <span className={solved ? "text-mint" : "text-gold"}>
            {solved ? "relation locked" : "drag the mint point"}
          </span>
        </div>

        {play.kind === "mid" ? (
          <MidpointBench play={play} point={point} solved={solved} onChange={setPoint} />
        ) : (
          <DistanceBench play={play} point={point} solved={solved} onChange={setPoint} />
        )}
      </div>

      {play.kind === "mid" ? (
        <div className="mt-3 rounded-xl border border-line bg-panel px-3 py-3">
          <p className="font-mono text-sm text-cream">
            midpoint = (({play.a[0]} + {play.b[0]}) / 2, ({play.a[1]} + {play.b[1]}) / 2)
          </p>
          <p className="mt-1 font-mono text-xs text-mist">
            probe {pointLabel(point)}
          </p>
        </div>
      ) : relation ? (
        <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-xs sm:grid-cols-4">
          <Readout label="Run" value={String(relation.run)} />
          <Readout label="Rise" value={String(relation.rise)} />
          <Readout label="Run² + rise²" value={String(relation.square)} />
          <Readout label="Distance" value={relation.label} />
        </div>
      ) : null}

      <p className="mt-3 font-mono text-sm text-gold" aria-live="polite">
        {solved
          ? play.kind === "mid"
            ? "Both half-vectors match. The probe is the midpoint."
            : "The squared run/rise relation matches the target distance exactly."
          : play.kind === "mid"
            ? "Move the probe until A→M and M→B have the same run and rise."
            : `Move B until run² + rise² equals ${play.targetDistance * play.targetDistance}.`}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            scored.current = solved;
            setPoint(play.start);
          }}
          className="min-h-11 rounded-full border border-line px-4 text-sm text-cream"
        >
          Reset
        </button>
        {solved && play.id < GRID_PLAYS.length ? (
          <button
            type="button"
            onClick={() => setLevelId(play.id + 1)}
            className="min-h-11 rounded-full bg-gold px-4 text-sm font-extrabold text-ink"
          >
            Next
          </button>
        ) : null}
        <p className="self-center font-mono text-xs text-mist">Run {run}</p>
      </div>
    </BenchFrame>
  );
}

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-panel px-3 py-2">
      <dt className="text-mist">{label}</dt>
      <dd className="mt-1 text-cream">{value}</dd>
    </div>
  );
}

export function GridProof({
  active = true,
  onExit,
}: {
  active?: boolean;
  onExit?: () => void;
}) {
  const [mode, setMode] = useState<"bench" | "questions">("bench");

  if (mode === "questions") {
    return (
      <GridQuestions
        active={active}
        onExit={onExit}
        onBench={() => setMode("bench")}
      />
    );
  }

  return <GridBench onExit={onExit} onQuestions={() => setMode("questions")} />;
}
