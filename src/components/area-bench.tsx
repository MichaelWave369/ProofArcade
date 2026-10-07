import { useEffect, useRef, useState } from "react";
import { BenchFrame, LevelStrip } from "@/components/bench-frame";
import { AREA_LAW, AREA_PLAYS, areaAmount, areaFormula, areaSolved, formatAmount, type AreaPlay } from "@/game/area/bench";
import { noteClear } from "@/game/progress";

function Cells({ play, w, h }: { play: AreaPlay; w: number; h: number }) {
  if (play.aim === "tri") {
    const cell = 22;
    const left = 8;
    const top = 8;
    const vbW = play.maxW * cell + 16;
    const vbH = play.maxH * cell + 16;
    const bottom = top + play.maxH * cell;
    const base = w * cell;
    const rise = h * cell;
    return (
      <svg viewBox={`0 0 ${vbW} ${vbH}`} className="mx-auto w-full max-w-md" role="img" aria-label={`Right triangle with legs ${w} and ${h}`}>
        <rect x={left} y={top} width={play.maxW * cell} height={play.maxH * cell} className="text-line" fill="none" stroke="currentColor" />
        <rect x={left} y={bottom - rise} width={base} height={rise} className="text-mint" fill="none" stroke="currentColor" strokeDasharray="4 3" />
        <polygon points={`${left},${bottom} ${left + base},${bottom} ${left},${bottom - rise}`} className="text-gold/40" fill="currentColor" />
        <polygon points={`${left},${bottom} ${left + base},${bottom} ${left},${bottom - rise}`} className="text-gold" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }

  const cols = play.aim === "cut" ? play.blockW : play.maxW;
  const rows = play.aim === "cut" ? play.blockH : play.maxH;
  return (
    <div
      className="mx-auto grid w-fit gap-1"
      style={{ gridTemplateColumns: `repeat(${cols}, 1.5rem)` }}
      role="img"
      aria-label={play.aim === "cut" ? `Block ${play.blockW} by ${play.blockH}, cut ${w} by ${h}` : `Rectangle ${w} by ${h}`}
    >
      {Array.from({ length: cols * rows }, (_, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const insideCut = play.aim === "cut" && col < w && row < h;
        const gold = play.aim === "cut" ? col < play.blockW && row < play.blockH && !insideCut : col < w && row < h;
        return <span key={index} className={`size-6 rounded-sm ${gold ? "bg-gold" : "bg-panel"} ${insideCut ? "border border-line" : ""}`} />;
      })}
    </div>
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

export function AreaBench({ onExit, onQuestions }: { onExit?: () => void; onQuestions?: () => void }) {
  const [levelId, setLevelId] = useState(1);
  const level = AREA_PLAYS[levelId - 1] ?? AREA_PLAYS[0];
  const [w, setW] = useState(level.startW);
  const [h, setH] = useState(level.startH);
  const [armed, setArmed] = useState(level.id);
  const [run, setRun] = useState(0);
  const scored = useRef(false);
  const solved = armed === level.id && areaSolved(level, w, h);
  const cut = level.aim === "cut";
  const minSide = cut ? 0 : 1;
  const maxW = cut ? level.blockW : level.maxW;
  const maxH = cut ? level.blockH : level.maxH;

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

  const widthLabel = cut ? "Cut width" : level.aim === "tri" ? "Base" : "Width";
  const heightLabel = cut ? "Cut height" : level.aim === "tri" ? "Height" : "Height";

  return (
    <BenchFrame kicker="AREA" title={level.title} meta={`${level.id}/16`} onExit={onExit} onQuestions={onQuestions}>
      <LevelStrip count={AREA_PLAYS.length} current={level.id} onPick={setLevelId} />
      <p className="text-sm text-mist">{level.blurb}</p>
      <p className="mt-1 font-mono text-xs text-gold">
        Target {formatAmount(level.target)} · now {formatAmount(areaAmount(level, w, h))}
      </p>
      <div className="mt-4 rounded-2xl border border-line bg-ink p-4">
        <Cells play={level} w={w} h={h} />
      </div>
      <p className="mt-3 text-center font-mono text-lg text-cream">{areaFormula(level, w, h)}</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Stepper label={widthLabel} value={w} min={minSide} max={maxW} onChange={setW} />
        <Stepper label={heightLabel} value={h} min={minSide} max={maxH} onChange={setH} />
      </div>
      <p className="mt-3 text-sm leading-relaxed text-cream">{AREA_LAW[level.aim]}</p>
      <p className="mt-3 font-mono text-sm text-gold" aria-live="polite">
        {solved ? "The figure on the bench is the area you were asked for." : "Change a side. The count updates from the figure, not from a list."}
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
          <button type="button" onClick={() => setLevelId(level.id + 1)} className="min-h-11 rounded-full bg-gold px-4 text-sm font-extrabold text-ink">
            Next
          </button>
        ) : null}
        <p className="self-center font-mono text-xs text-mist">Run {run}</p>
      </div>
    </BenchFrame>
  );
}
