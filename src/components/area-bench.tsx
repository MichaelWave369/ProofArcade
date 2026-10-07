import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { BenchFrame, LevelStrip } from "@/components/bench-frame";
import {
  AREA_LAW,
  AREA_PLAYS,
  areaAmount,
  areaBounds,
  areaFormula,
  areaSolved,
  formatAmount,
  snapAreaDimensions,
  type AreaPlay,
} from "@/game/area/bench";
import { noteClear } from "@/game/progress";

const CELL = 34;
const PAD = 18;
const HANDLE_R = 11;

type HandleKind = "width" | "height" | "corner";

function viewSize(play: AreaPlay) {
  const cols = play.aim === "cut" ? play.blockW : play.maxW;
  const rows = play.aim === "cut" ? play.blockH : play.maxH;
  return {
    cols,
    rows,
    width: cols * CELL + PAD * 2,
    height: rows * CELL + PAD * 2,
  };
}

function pointerUnits(
  event: ReactPointerEvent<SVGCircleElement>,
  play: AreaPlay,
): { w: number; h: number } {
  const svg = event.currentTarget.ownerSVGElement;
  if (!svg) return { w: 0, h: 0 };
  const rect = svg.getBoundingClientRect();
  const { cols, rows } = viewSize(play);
  const x = ((event.clientX - rect.left) / rect.width) * (cols * CELL + PAD * 2);
  const y = ((event.clientY - rect.top) / rect.height) * (rows * CELL + PAD * 2);
  const w = (x - PAD) / CELL;
  const h = (y - PAD) / CELL;
  return { w, h };
}

function Handle({
  x,
  y,
  label,
  solved,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: {
  x: number;
  y: number;
  label: string;
  solved: boolean;
  onPointerDown: (event: ReactPointerEvent<SVGCircleElement>) => void;
  onPointerMove: (event: ReactPointerEvent<SVGCircleElement>) => void;
  onPointerUp: (event: ReactPointerEvent<SVGCircleElement>) => void;
}) {
  return (
    <>
      <circle
        cx={x}
        cy={y}
        r={HANDLE_R + 7}
        fill="transparent"
        stroke="transparent"
        role="button"
        tabIndex={0}
        aria-label={label}
        className="area-handle-hit"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      />
      <circle
        cx={x}
        cy={y}
        r={HANDLE_R}
        className={solved ? "area-handle-success text-mint" : "text-gold"}
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
        pointerEvents="none"
      />
      <circle
        cx={x}
        cy={y}
        r={HANDLE_R - 5}
        className="text-ink"
        fill="currentColor"
        pointerEvents="none"
      />
    </>
  );
}

function AreaFigure({
  play,
  w,
  h,
  solved,
  onChange,
}: {
  play: AreaPlay;
  w: number;
  h: number;
  solved: boolean;
  onChange: (nextW: number, nextH: number) => void;
}) {
  const { cols, rows, width, height } = viewSize(play);
  const cut = play.aim === "cut";
  const tri = play.aim === "tri";
  const bounds = areaBounds(play);

  const safe = snapAreaDimensions(play, w, h);
  const rightX = PAD + safe.w * CELL;
  const bottomY = PAD + safe.h * CELL;

  function move(kind: HandleKind, event: ReactPointerEvent<SVGCircleElement>) {
    const raw = pointerUnits(event, play);
    const next = snapAreaDimensions(
      play,
      kind === "height" ? safe.w : raw.w,
      kind === "width" ? safe.h : raw.h,
    );
    onChange(next.w, next.h);
  }

  function capture(kind: HandleKind, event: ReactPointerEvent<SVGCircleElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    move(kind, event);
  }

  function moveCaptured(kind: HandleKind, event: ReactPointerEvent<SVGCircleElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) move(kind, event);
  }

  function release(kind: HandleKind, event: ReactPointerEvent<SVGCircleElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    move(kind, event);
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  const cellNodes = Array.from({ length: cols * rows }, (_, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const active = cut
      ? !(col < safe.w && row < safe.h)
      : tri
        ? false
        : col < safe.w && row < safe.h;
    const removed = cut && col < safe.w && row < safe.h;

    return (
      <rect
        key={index}
        x={PAD + col * CELL + 2}
        y={PAD + row * CELL + 2}
        width={CELL - 4}
        height={CELL - 4}
        rx="4"
        className={active ? "area-cell-active text-gold" : removed ? "text-panel-2" : "text-panel"}
        fill="currentColor"
        opacity={active ? 0.95 : 1}
        stroke={removed ? "currentColor" : "none"}
      />
    );
  });

  const rectW = safe.w * CELL;
  const rectH = safe.h * CELL;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto w-full max-w-md touch-none"
      role="application"
      aria-label={
        cut
          ? `Block ${play.blockW} by ${play.blockH}, cut ${safe.w} by ${safe.h}`
          : tri
            ? `Right triangle with base ${safe.w} and height ${safe.h}`
            : `Rectangle ${safe.w} by ${safe.h}`
      }
    >
      <rect
        x={PAD}
        y={PAD}
        width={cols * CELL}
        height={rows * CELL}
        className="text-line"
        fill="none"
        stroke="currentColor"
      />

      {tri ? (
        <>
          <g opacity="0.48">
            {Array.from({ length: cols + 1 }, (_, i) => (
              <line
                key={`vx-${i}`}
                x1={PAD + i * CELL}
                y1={PAD}
                x2={PAD + i * CELL}
                y2={PAD + rows * CELL}
                className="text-line"
                stroke="currentColor"
              />
            ))}
            {Array.from({ length: rows + 1 }, (_, i) => (
              <line
                key={`hy-${i}`}
                x1={PAD}
                y1={PAD + i * CELL}
                x2={PAD + cols * CELL}
                y2={PAD + i * CELL}
                className="text-line"
                stroke="currentColor"
              />
            ))}
          </g>
          <rect
            x={PAD}
            y={PAD}
            width={rectW}
            height={rectH}
            className="text-mint"
            fill="none"
            stroke="currentColor"
            strokeDasharray="5 4"
          />
          <polygon
            points={`${PAD},${PAD + rectH} ${PAD + rectW},${PAD + rectH} ${PAD},${PAD}`}
            className="area-triangle-fill text-gold"
            fill="currentColor"
            opacity="0.38"
          />
          <polygon
            points={`${PAD},${PAD + rectH} ${PAD + rectW},${PAD + rectH} ${PAD},${PAD}`}
            className="text-gold"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
          />
        </>
      ) : (
        cellNodes
      )}

      {!cut && !tri ? (
        <rect
          x={PAD}
          y={PAD}
          width={rectW}
          height={rectH}
          className={solved ? "text-mint" : "text-gold-soft"}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
        />
      ) : null}

      {cut ? (
        <rect
          x={PAD}
          y={PAD}
          width={rectW}
          height={rectH}
          className="text-mint"
          fill="none"
          stroke="currentColor"
          strokeDasharray="5 4"
          strokeWidth="2.2"
        />
      ) : null}

      <g className="area-dimension-labels" pointerEvents="none">
        <rect
          x={PAD + Math.max(0, rectW / 2 - 16)}
          y={PAD + Math.max(0, rectH) + 7}
          width="32"
          height="16"
          rx="8"
          className="text-panel-2"
          fill="currentColor"
        />
        <text
          x={PAD + rectW / 2}
          y={PAD + rectH + 19}
          textAnchor="middle"
          className="text-cream"
          fill="currentColor"
          fontSize="10"
          fontFamily="IBM Plex Mono, monospace"
        >
          {safe.w}
        </text>
        <rect
          x={PAD + Math.max(0, rectW) + 7}
          y={PAD + Math.max(0, rectH / 2 - 8)}
          width="32"
          height="16"
          rx="8"
          className="text-panel-2"
          fill="currentColor"
        />
        <text
          x={PAD + rectW + 23}
          y={PAD + rectH / 2 + 4}
          textAnchor="middle"
          className="text-cream"
          fill="currentColor"
          fontSize="10"
          fontFamily="IBM Plex Mono, monospace"
        >
          {safe.h}
        </text>
      </g>

      <Handle
        x={rightX}
        y={PAD + rectH / 2}
        label={`Drag ${tri ? "base" : cut ? "cut width" : "width"} handle. Current ${safe.w}.`}
        solved={solved}
        onPointerDown={(event) => capture("width", event)}
        onPointerMove={(event) => moveCaptured("width", event)}
        onPointerUp={(event) => release("width", event)}
      />

      <Handle
        x={PAD + rectW / 2}
        y={bottomY}
        label={`Drag ${cut ? "cut height" : "height"} handle. Current ${safe.h}.`}
        solved={solved}
        onPointerDown={(event) => capture("height", event)}
        onPointerMove={(event) => moveCaptured("height", event)}
        onPointerUp={(event) => release("height", event)}
      />

      <Handle
        x={rightX}
        y={bottomY}
        label={`Drag corner to change both dimensions. Current ${safe.w} by ${safe.h}.`}
        solved={solved}
        onPointerDown={(event) => capture("corner", event)}
        onPointerMove={(event) => moveCaptured("corner", event)}
        onPointerUp={(event) => release("corner", event)}
      />

      <title>
        {cut
          ? `Full area ${play.blockW * play.blockH}; cut ${safe.w * safe.h}; remaining ${areaAmount(play, safe.w, safe.h)}`
          : `Width ${safe.w}, height ${safe.h}, area ${areaAmount(play, safe.w, safe.h)}`}
      </title>
    </svg>
  );
}

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-panel px-3 py-2">
      <span className="font-mono text-xs tracking-widest text-mist">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          className="min-h-11 min-w-11 rounded-full border border-line text-lg text-cream disabled:opacity-40"
        >
          −
        </button>
        <span className="w-8 text-center font-mono text-cream">{value}</span>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          className="min-h-11 min-w-11 rounded-full border border-line text-lg text-cream disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  );
}

export function AreaBench({
  onExit,
  onQuestions,
}: {
  onExit?: () => void;
  onQuestions?: () => void;
}) {
  const [levelId, setLevelId] = useState(1);
  const level = AREA_PLAYS[levelId - 1] ?? AREA_PLAYS[0];
  const [w, setW] = useState(level.startW);
  const [h, setH] = useState(level.startH);
  const [armed, setArmed] = useState(level.id);
  const [run, setRun] = useState(0);
  const scored = useRef(false);
  const solved = armed === level.id && areaSolved(level, w, h);
  const bounds = areaBounds(level);

  useEffect(() => {
    scored.current = false;
    setW(level.startW);
    setH(level.startH);
    setArmed(level.id);
  }, [level]);

  useEffect(() => {
    if (!solved || scored.current) return;
    scored.current = true;
    const score = 100;
    setRun((total) => {
      const next = total + score;
      noteClear("area", level.id, score, next);
      return next;
    });
  }, [solved, level.id]);

  function change(nextW: number, nextH: number) {
    const next = snapAreaDimensions(level, nextW, nextH);
    setW(next.w);
    setH(next.h);
  }

  const cut = level.aim === "cut";
  const widthLabel = cut ? "Cut width" : level.aim === "tri" ? "Base" : "Width";
  const heightLabel = cut ? "Cut height" : "Height";

  return (
    <BenchFrame
      kicker="AREA"
      title={level.title}
      meta={`${level.id}/16`}
      onExit={onExit}
      onQuestions={onQuestions}
    >
      <LevelStrip count={AREA_PLAYS.length} current={level.id} onPick={setLevelId} />
      <p className="text-sm text-mist">{level.blurb}</p>
      <p className="mt-1 font-mono text-xs text-gold">
        Target {formatAmount(level.target)} · now {formatAmount(areaAmount(level, w, h))}
      </p>

      <div
        className={`mt-4 rounded-2xl border bg-ink p-3 transition-[border-color,box-shadow] duration-150 ${
          solved
            ? "border-mint/60 shadow-[0_0_28px_rgba(143,208,176,0.10)]"
            : "border-line"
        }`}
      >
        <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em]">
          <span className="text-mist">Area bench</span>
          <span className={solved ? "text-mint" : "text-gold"}>
            {solved ? "area locked" : "drag the gold handles"}
          </span>
        </div>
        <AreaFigure play={level} w={w} h={h} solved={solved} onChange={change} />
      </div>

      <p className="mt-3 text-center font-mono text-lg text-cream">
        {areaFormula(level, w, h)}
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Stepper
          label={widthLabel}
          value={w}
          min={bounds.minW}
          max={bounds.maxW}
          onChange={(next) => change(next, h)}
        />
        <Stepper
          label={heightLabel}
          value={h}
          min={bounds.minH}
          max={bounds.maxH}
          onChange={(next) => change(w, next)}
        />
      </div>

      <p className="mt-3 text-sm leading-relaxed text-cream">{AREA_LAW[level.aim]}</p>

      <p className="mt-3 font-mono text-sm text-gold" aria-live="polite">
        {solved
          ? "The figure on the bench is the area you were asked for."
          : cut
            ? "Drag the cut handles. Gold unit cells are what remains."
            : level.aim === "tri"
              ? "Drag base and height. The gold triangle remains exactly half of its dashed rectangle."
              : "Drag an edge or the corner. Unit cells appear and disappear with the dimensions."}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            scored.current = solved;
            setW(level.startW);
            setH(level.startH);
          }}
          className="min-h-11 rounded-full border border-line px-4 text-sm text-cream"
        >
          Reset
        </button>
        {solved && level.id < AREA_PLAYS.length ? (
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
    </BenchFrame>
  );
}
