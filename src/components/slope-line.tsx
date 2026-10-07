import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { BenchFrame, LevelStrip } from "@/components/bench-frame";
import { noteClear } from "@/game/progress";
import {
  LINE_LAW,
  LINE_PLAYS,
  boardSegment,
  lineSolved,
  riseRun,
  samePoint,
  slopeText,
  snapPoint,
  type LinePlay,
  type V,
} from "@/game/slope/line";

const SIZE = 280;

function mapX(n: number, span: number) {
  return ((n + span) / (span * 2)) * SIZE;
}

function mapY(n: number, span: number) {
  return SIZE - ((n + span) / (span * 2)) * SIZE;
}

function fromPointer(event: ReactPointerEvent<SVGCircleElement>, span: number): V {
  const svg = event.currentTarget.ownerSVGElement;
  if (!svg) return { x: 0, y: 0 };
  const rect = svg.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * SIZE;
  const y = ((event.clientY - rect.top) / rect.height) * SIZE;
  return snapPoint(
    {
      x: (x / SIZE) * span * 2 - span,
      y: span - (y / SIZE) * span * 2,
    },
    span,
  );
}

function Field({
  play,
  point,
  onPoint,
  solved,
}: {
  play: LinePlay;
  point: V;
  onPoint: (next: V) => void;
  solved: boolean;
}) {
  const span = play.span;
  const ticks: number[] = [];
  for (let n = -span; n <= span; n += 1) ticks.push(n);

  const { rise, run } = riseRun(play.anchor, point);
  const line = boardSegment(play.anchor, point, span);
  const slope = slopeText(play.anchor, point);
  const label =
    play.aim === "through" && play.through
      ? `Point B at ${point.x}, ${point.y}. Slope ${slope}. Mint point at ${play.through.x}, ${play.through.y}.`
      : `Point B at ${point.x}, ${point.y}. Slope ${slope}.`;

  const elbow = { x: point.x, y: play.anchor.y };
  const midpointRun = {
    x: (play.anchor.x + point.x) / 2,
    y: play.anchor.y,
  };
  const midpointRise = {
    x: point.x,
    y: (play.anchor.y + point.y) / 2,
  };

  function nudge(dx: number, dy: number) {
    onPoint(snapPoint({ x: point.x + dx, y: point.y + dy }, span));
  }

  function moveFromPointer(event: ReactPointerEvent<SVGCircleElement>) {
    onPoint(fromPointer(event, span));
  }

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="mx-auto aspect-square w-full max-w-md touch-none"
      role="application"
      tabIndex={0}
      aria-label={label}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") nudge(1, 0);
        else if (event.key === "ArrowLeft") nudge(-1, 0);
        else if (event.key === "ArrowUp") nudge(0, 1);
        else if (event.key === "ArrowDown") nudge(0, -1);
        else return;
        event.preventDefault();
      }}
    >
      {ticks.map((tick) => (
        <g key={tick} className="text-line" stroke="currentColor">
          <line x1={mapX(tick, span)} y1={0} x2={mapX(tick, span)} y2={SIZE} />
          <line x1={0} y1={mapY(tick, span)} x2={SIZE} y2={mapY(tick, span)} />
        </g>
      ))}

      <line
        x1={mapX(-span, span)}
        y1={mapY(0, span)}
        x2={mapX(span, span)}
        y2={mapY(0, span)}
        className="text-mist"
        stroke="currentColor"
      />
      <line
        x1={mapX(0, span)}
        y1={mapY(-span, span)}
        x2={mapX(0, span)}
        y2={mapY(span, span)}
        className="text-mist"
        stroke="currentColor"
      />

      {line ? (
        <line
          x1={mapX(line.a.x, span)}
          y1={mapY(line.a.y, span)}
          x2={mapX(line.b.x, span)}
          y2={mapY(line.b.y, span)}
          className="text-gold"
          stroke="currentColor"
          strokeWidth="2.5"
        />
      ) : null}

      {!samePoint(point, play.anchor) ? (
        <>
          <line
            x1={mapX(play.anchor.x, span)}
            y1={mapY(play.anchor.y, span)}
            x2={mapX(elbow.x, span)}
            y2={mapY(elbow.y, span)}
            className="text-mint"
            stroke="currentColor"
            strokeDasharray="4 3"
            strokeWidth="2"
          />
          <line
            x1={mapX(elbow.x, span)}
            y1={mapY(elbow.y, span)}
            x2={mapX(point.x, span)}
            y2={mapY(point.y, span)}
            className="text-mint"
            stroke="currentColor"
            strokeDasharray="4 3"
            strokeWidth="2"
          />

          <g className="slope-measure-label">
            <rect
              x={mapX(midpointRun.x, span) - 15}
              y={mapY(midpointRun.y, span) - 20}
              width="30"
              height="15"
              rx="7"
              className="text-panel-2"
              fill="currentColor"
              stroke="currentColor"
            />
            <text
              x={mapX(midpointRun.x, span)}
              y={mapY(midpointRun.y, span) - 9}
              textAnchor="middle"
              className="text-cream"
              fill="currentColor"
              fontSize="10"
              fontFamily="IBM Plex Mono, monospace"
            >
              {run}
            </text>
          </g>

          <g className="slope-measure-label">
            <rect
              x={mapX(midpointRise.x, span) + 6}
              y={mapY(midpointRise.y, span) - 8}
              width="30"
              height="15"
              rx="7"
              className="text-panel-2"
              fill="currentColor"
              stroke="currentColor"
            />
            <text
              x={mapX(midpointRise.x, span) + 21}
              y={mapY(midpointRise.y, span) + 3}
              textAnchor="middle"
              className="text-cream"
              fill="currentColor"
              fontSize="10"
              fontFamily="IBM Plex Mono, monospace"
            >
              {rise}
            </text>
          </g>
        </>
      ) : null}

      {play.aim === "through" && play.through ? (
        <circle
          cx={mapX(play.through.x, span)}
          cy={mapY(play.through.y, span)}
          r="7"
          className="text-mint"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      ) : null}

      {play.aim === "land" ? (
        <circle
          cx={mapX(play.solution.x, span)}
          cy={mapY(play.solution.y, span)}
          r="8"
          className="text-mint"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      ) : null}

      <circle
        cx={mapX(play.anchor.x, span)}
        cy={mapY(play.anchor.y, span)}
        r="6"
        className="text-gold"
        fill="currentColor"
      />

      {!samePoint(point, play.anchor) ? (
        <g className={solved ? "slope-success-pulse" : ""} aria-hidden="true">
          <rect
            x={mapX(point.x, span) - 24}
            y={mapY(point.y, span) - 34}
            width="48"
            height="18"
            rx="9"
            className={solved ? "text-mint" : "text-panel-2"}
            fill="currentColor"
            opacity={solved ? 0.95 : 0.92}
          />
          <text
            x={mapX(point.x, span)}
            y={mapY(point.y, span) - 21}
            textAnchor="middle"
            className={solved ? "text-ink" : "text-cream"}
            fill="currentColor"
            fontSize="10"
            fontFamily="IBM Plex Mono, monospace"
          >
            {slope}
          </text>
        </g>
      ) : null}

      <circle
        cx={mapX(point.x, span)}
        cy={mapY(point.y, span)}
        r="15"
        fill="transparent"
        stroke="transparent"
        tabIndex={0}
        role="button"
        aria-label={`Drag point B. Current position ${point.x}, ${point.y}.`}
        className="slope-point-hit cursor-grab focus:cursor-grabbing"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          moveFromPointer(event);
        }}
        onPointerMove={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) moveFromPointer(event);
        }}
        onPointerUp={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            moveFromPointer(event);
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
        }}
      />
      <circle
        cx={mapX(point.x, span)}
        cy={mapY(point.y, span)}
        r="7"
        className={solved ? "text-mint" : "text-cream"}
        fill="currentColor"
        pointerEvents="none"
      />
      <circle
        cx={mapX(point.x, span)}
        cy={mapY(point.y, span)}
        r="11"
        className={solved ? "text-mint" : "text-cream"}
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.45"
        pointerEvents="none"
      />

      <title>{`rise ${rise}, run ${run}, slope ${slope}`}</title>
    </svg>
  );
}

export function SlopeLine({
  onExit,
  onQuestions,
}: {
  onExit?: () => void;
  onQuestions?: () => void;
}) {
  const [levelId, setLevelId] = useState(1);
  const level = LINE_PLAYS[levelId - 1] ?? LINE_PLAYS[0];
  const [point, setPoint] = useState<V>(level.start);
  const [armed, setArmed] = useState(level.id);
  const [run, setRun] = useState(0);
  const scored = useRef(false);
  const solved = armed === level.id && lineSolved(level, point);
  const { rise, run: runDelta } = riseRun(level.anchor, point);

  useEffect(() => {
    scored.current = false;
    setPoint(level.start);
    setArmed(level.id);
  }, [level]);

  useEffect(() => {
    if (!solved || scored.current) return;
    scored.current = true;
    const score = 100;
    setRun((total) => {
      const next = total + score;
      noteClear("slope", level.id, score, next);
      return next;
    });
  }, [solved, level.id]);

  function move(next: V) {
    setPoint(snapPoint(next, level.span));
  }

  const needed =
    level.aim === "slope"
      ? level.slope ?? ""
      : level.aim === "land"
        ? `(${level.solution.x}, ${level.solution.y})`
        : "the mint point";

  return (
    <BenchFrame
      kicker="SLOPE"
      title={level.title}
      meta={`${level.id}/16`}
      onExit={onExit}
      onQuestions={onQuestions}
    >
      <LevelStrip count={LINE_PLAYS.length} current={level.id} onPick={setLevelId} />
      <p className="text-sm text-mist">{level.blurb}</p>
      <p className="mt-1 font-mono text-xs text-gold">Needed · {needed}</p>

      <div className="mt-3 grid items-start gap-3 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <div
          className={`overflow-hidden rounded-2xl border bg-ink transition-[border-color,box-shadow] duration-150 ${
            solved
              ? "border-mint/60 shadow-[0_0_28px_rgba(143,208,176,0.10)]"
              : "border-line"
          }`}
        >
          <div className="flex items-center justify-between border-b border-line/70 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em]">
            <span className="text-mist">Coordinate bench</span>
            <span className={solved ? "text-mint" : "text-gold"}>
              {solved ? "relation locked" : "grab point B"}
            </span>
          </div>
          <Field play={level} point={point} onPoint={move} solved={solved} />
        </div>

        <div>
          <div className="mx-auto grid w-full max-w-xs grid-cols-3 gap-2" aria-label="Move point B">
            <span />
            <Step label="North" onClick={() => move({ x: point.x, y: point.y + 1 })} />
            <span />
            <Step label="West" onClick={() => move({ x: point.x - 1, y: point.y })} />
            <span />
            <Step label="East" onClick={() => move({ x: point.x + 1, y: point.y })} />
            <span />
            <Step label="South" onClick={() => move({ x: point.x, y: point.y - 1 })} />
            <span />
          </div>

          <dl className="mt-3 grid grid-cols-2 gap-2 font-mono text-xs">
            <Readout label="Anchor" value={`(${level.anchor.x}, ${level.anchor.y})`} />
            <Readout label="B" value={`(${point.x}, ${point.y})`} />
            <Readout label="Rise, run" value={`${rise}, ${runDelta}`} />
            <Readout label="Slope" value={slopeText(level.anchor, point)} />
          </dl>

          <p className="mt-3 text-sm leading-relaxed text-cream">{LINE_LAW[level.aim]}</p>

          <p className="mt-3 font-mono text-sm text-gold" aria-live="polite">
            {samePoint(point, level.anchor)
              ? "B is on the anchor. A line needs two different points."
              : solved
                ? level.aim === "through"
                  ? "The line passes through the mint point."
                  : level.aim === "land"
                    ? "B is on the mark."
                    : "That slope is the one this bench asked for."
                : "Grab B and drag it across the lattice. Rise, run, and slope update from the geometry itself."}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                scored.current = solved;
                setPoint(level.start);
              }}
              className="min-h-11 rounded-full border border-line px-4 text-sm text-cream"
            >
              Reset
            </button>
            {solved && level.id < LINE_PLAYS.length ? (
              <button
                type="button"
                onClick={() => setLevelId(level.id + 1)}
                className="min-h-11 rounded-full bg-gold px-4 text-sm font-extrabold text-ink"
              >
                Next
              </button>
            ) : null}
            <p className="self-center font-mono text-xs text-mist">Run {run}</p>
          </div>
        </div>
      </div>
    </BenchFrame>
  );
}

function Step({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-11 rounded-xl border border-line bg-panel text-sm text-cream"
    >
      {label}
    </button>
  );
}

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-panel px-3 py-2">
      <dt className="text-mist">{label}</dt>
      <dd className="text-cream">{value}</dd>
    </div>
  );
}
