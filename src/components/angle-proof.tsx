import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { BenchFrame, LevelStrip, QuestionsChip } from "@/components/bench-frame";
import { RoundProof } from "@/components/round-proof";
import { noteClear } from "@/game/progress";
import {
  ANGLE_PLAYS,
  angleBenchInstruction,
  angleBenchRange,
  angleBenchSolved,
  angleBenchValue,
  applyAngleHandle,
  pointerAngleDegrees,
  type AngleBenchPlay,
  type AngleBenchState,
} from "@/game/angle/bench";
import {
  ANGLE_LEVELS,
  angleCaption,
  auditAngle,
  type AnglePrompt,
  type AngleScene,
} from "@/game/angle/levels";

function at(x: number, y: number, deg: number, r: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: x + r * Math.cos(rad), y: y - r * Math.sin(rad) };
}

function wedge(x: number, y: number, start: number, end: number, r: number) {
  const a = at(x, y, start, r);
  const b = at(x, y, end, r);
  const span = ((end - start) % 360 + 360) % 360;
  const large = span > 180 ? 1 : 0;
  return `M ${x} ${y} L ${a.x} ${a.y} A ${r} ${r} 0 ${large} 0 ${b.x} ${b.y} Z`;
}

function Label({
  x,
  y,
  text,
  tone,
}: {
  x: number;
  y: number;
  text: string;
  tone: string;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize="12"
      className={`font-mono ${tone}`}
      fill="currentColor"
    >
      {text}
    </text>
  );
}

function meet(
  ax: number,
  ay: number,
  aDeg: number,
  bx: number,
  by: number,
  bDeg: number,
) {
  const ar = (aDeg * Math.PI) / 180;
  const br = (bDeg * Math.PI) / 180;
  const adx = Math.cos(ar);
  const ady = -Math.sin(ar);
  const bdx = Math.cos(br);
  const bdy = -Math.sin(br);
  const det = adx * bdy - ady * bdx;
  if (Math.abs(det) < 1e-6) return { x: (ax + bx) / 2, y: ay - 70 };
  const t = ((bx - ax) * bdy - (by - ay) * bdx) / det;
  return { x: ax + t * adx, y: ay + t * ady };
}

function AngleQuestions({
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
      <RoundProof<AnglePrompt>
        active={active}
        onExit={onExit}
        track="angles"
        mark="∠"
        title="Angles"
        menuKicker="GEOMETRY"
        menuTitle="Read the corner."
        menuBody="A right angle, a straight line, a triangle, or a crossing. The mark is given. Name the blank. Keys 1 to 4. A miss costs a heart. Sixteen levels."
        levels={ANGLE_LEVELS}
        audit={auditAngle}
        renderScene={(prompt) => (
          <div>
            <StaticAngleFigure scene={prompt.scene} />
            <p className="mt-1 text-center font-mono text-xs text-mist">
              {angleCaption(prompt.scene)}
            </p>
          </div>
        )}
      />
      <QuestionsChip label="Bench" onClick={onBench} />
    </div>
  );
}

function StaticAngleFigure({ scene }: { scene: AngleScene }) {
  if (scene.kind === "triangle") {
    const A = { x: 28, y: 118 };
    const B = { x: 154, y: 118 };
    const C = meet(A.x, A.y, scene.a, B.x, B.y, 180 - scene.b);
    return (
      <svg
        viewBox="0 0 180 140"
        className="mx-auto h-40 w-full max-w-xs"
        role="img"
        aria-label={angleCaption(scene)}
      >
        <polygon
          points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`}
          className="text-line"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <Label x={A.x + 18} y={A.y - 12} text={`${scene.a}°`} tone="text-gold" />
        <Label x={B.x - 18} y={B.y - 12} text={`${scene.b}°`} tone="text-gold" />
        <Label x={C.x} y={C.y - 14} text="?" tone="text-mint" />
      </svg>
    );
  }

  const total = scene.kind === "complement" ? 90 : 180;
  const o = { x: 90, y: 96 };
  const ray = at(o.x, o.y, scene.a, 72);
  return (
    <svg
      viewBox="0 0 180 140"
      className="mx-auto h-40 w-full max-w-xs"
      role="img"
      aria-label={angleCaption(scene)}
    >
      {scene.kind === "vertical" ? (
        <>
          <line x1="12" y1={o.y} x2="168" y2={o.y} className="text-cream" stroke="currentColor" strokeWidth="2" />
          <line
            x1={at(o.x, o.y, scene.a + 180, 72).x}
            y1={at(o.x, o.y, scene.a + 180, 72).y}
            x2={ray.x}
            y2={ray.y}
            className="text-gold"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path d={wedge(o.x, o.y, 0, scene.a, 26)} className="text-gold/30" fill="currentColor" />
          <path d={wedge(o.x, o.y, 180, 180 + scene.a, 26)} className="text-mint/30" fill="currentColor" />
        </>
      ) : (
        <>
          <line x1={scene.kind === "complement" ? o.x : 12} y1={o.y} x2="168" y2={o.y} className="text-cream" stroke="currentColor" strokeWidth="2" />
          {scene.kind === "complement" ? (
            <line x1={o.x} y1={o.y} x2={o.x} y2="18" className="text-cream" stroke="currentColor" strokeWidth="2" />
          ) : null}
          <line x1={o.x} y1={o.y} x2={ray.x} y2={ray.y} className="text-gold" stroke="currentColor" strokeWidth="2" />
          <path d={wedge(o.x, o.y, 0, scene.a, 26)} className="text-gold/30" fill="currentColor" />
          <path d={wedge(o.x, o.y, scene.a, total, 26)} className="text-mint/30" fill="currentColor" />
        </>
      )}
      <Label x={at(o.x, o.y, scene.a / 2, 40).x} y={at(o.x, o.y, scene.a / 2, 40).y} text={`${scene.a}°`} tone="text-gold" />
      <Label
        x={at(o.x, o.y, scene.kind === "vertical" ? 180 + scene.a / 2 : (scene.a + total) / 2, 40).x}
        y={at(o.x, o.y, scene.kind === "vertical" ? 180 + scene.a / 2 : (scene.a + total) / 2, 40).y}
        text="?"
        tone="text-mint"
      />
    </svg>
  );
}

function DirectAngleFigure({
  play,
  state,
  solved,
  onControl,
}: {
  play: AngleBenchPlay;
  state: AngleBenchState;
  solved: boolean;
  onControl: (value: number) => void;
}) {
  const range = angleBenchRange(play);
  const control = play.kind === "triangle" ? state.b : state.a;

  function nudge(amount: number) {
    onControl(control + amount);
  }

  if (play.kind === "triangle") {
    const A = { x: 30, y: 145 };
    const B = { x: 210, y: 145 };
    const C = meet(A.x, A.y, state.a, B.x, B.y, 180 - state.b);
    const handle = at(B.x, B.y, 180 - state.b, 72);
    const third = angleBenchValue(play.kind, state);

    function move(event: ReactPointerEvent<SVGCircleElement>) {
      const svg = event.currentTarget.ownerSVGElement;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 240;
      const y = ((event.clientY - rect.top) / rect.height) * 180;
      const heading = pointerAngleDegrees(B.x, B.y, x, y);
      onControl(180 - heading);
    }

    return (
      <svg
        viewBox="0 0 240 180"
        className="mx-auto aspect-[4/3] w-full max-w-lg touch-none"
        role="application"
        tabIndex={0}
        aria-label={`Triangle angles ${state.a} degrees, ${state.b} degrees, and ${third} degrees`}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowUp") nudge(1);
          else if (event.key === "ArrowLeft" || event.key === "ArrowDown") nudge(-1);
          else return;
          event.preventDefault();
        }}
      >
        <polygon
          points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`}
          className={solved ? "text-mint" : "text-line"}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <path d={wedge(A.x, A.y, 0, state.a, 25)} className="text-gold/30" fill="currentColor" />
        <path d={wedge(B.x, B.y, 180 - state.b, 180, 25)} className="text-mint/30" fill="currentColor" />
        <Label x={A.x + 24} y={A.y - 14} text={`${state.a}°`} tone="text-gold" />
        <Label x={B.x - 24} y={B.y - 14} text={`${state.b}°`} tone="text-mint" />
        <Label x={C.x} y={Math.max(14, C.y - 15)} text={`${third}°`} tone={solved ? "text-mint" : "text-cream"} />
        <circle
          cx={handle.x}
          cy={handle.y}
          r="18"
          fill="transparent"
          stroke="transparent"
          role="button"
          tabIndex={0}
          aria-label={`Drag the mint base ray. Current base angle ${state.b} degrees.`}
          className="angle-handle-hit"
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
        <circle cx={handle.x} cy={handle.y} r="8" className={solved ? "angle-handle-success text-mint" : "text-mint"} fill="currentColor" pointerEvents="none" />
      </svg>
    );
  }

  const total = play.kind === "complement" ? 90 : 180;
  const o = { x: 120, y: 128 };
  const ray = at(o.x, o.y, state.a, 92);
  const back = at(o.x, o.y, state.a + 180, 92);
  const unknown = angleBenchValue(play.kind, state);

  function move(event: ReactPointerEvent<SVGCircleElement>) {
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 240;
    const y = ((event.clientY - rect.top) / rect.height) * 180;
    onControl(pointerAngleDegrees(o.x, o.y, x, y));
  }

  const handle = ray;

  return (
    <svg
      viewBox="0 0 240 180"
      className="mx-auto aspect-[4/3] w-full max-w-lg touch-none"
      role="application"
      tabIndex={0}
      aria-label={
        play.kind === "vertical"
          ? `Vertical opposite angles are both ${state.a} degrees`
          : `Gold angle ${state.a} degrees, mint angle ${unknown} degrees, total ${total} degrees`
      }
      onKeyDown={(event) => {
        if (event.key === "ArrowRight" || event.key === "ArrowUp") nudge(1);
        else if (event.key === "ArrowLeft" || event.key === "ArrowDown") nudge(-1);
        else return;
        event.preventDefault();
      }}
    >
      {play.kind === "vertical" ? (
        <>
          <line x1="20" y1={o.y} x2="220" y2={o.y} className="text-cream" stroke="currentColor" strokeWidth="2.4" />
          <line x1={back.x} y1={back.y} x2={ray.x} y2={ray.y} className="text-gold" stroke="currentColor" strokeWidth="2.4" />
          <path d={wedge(o.x, o.y, 0, state.a, 34)} className="text-gold/30" fill="currentColor" />
          <path d={wedge(o.x, o.y, 180, 180 + state.a, 34)} className="text-mint/30" fill="currentColor" />
          <Label x={at(o.x, o.y, state.a / 2, 50).x} y={at(o.x, o.y, state.a / 2, 50).y} text={`${state.a}°`} tone="text-gold" />
          <Label x={at(o.x, o.y, 180 + state.a / 2, 50).x} y={at(o.x, o.y, 180 + state.a / 2, 50).y} text={`${unknown}°`} tone="text-mint" />
        </>
      ) : (
        <>
          <line x1={play.kind === "complement" ? o.x : 20} y1={o.y} x2="220" y2={o.y} className="text-cream" stroke="currentColor" strokeWidth="2.4" />
          {play.kind === "complement" ? (
            <>
              <line x1={o.x} y1={o.y} x2={o.x} y2="24" className="text-cream" stroke="currentColor" strokeWidth="2.4" />
              <path d={`M ${o.x + 15} ${o.y} L ${o.x + 15} ${o.y - 15} L ${o.x} ${o.y - 15}`} className="text-line" fill="none" stroke="currentColor" />
            </>
          ) : null}
          <line x1={o.x} y1={o.y} x2={ray.x} y2={ray.y} className="text-gold" stroke="currentColor" strokeWidth="2.6" />
          <path d={wedge(o.x, o.y, 0, state.a, 34)} className="text-gold/30" fill="currentColor" />
          <path d={wedge(o.x, o.y, state.a, total, 34)} className="text-mint/30" fill="currentColor" />
          <Label x={at(o.x, o.y, state.a / 2, 50).x} y={at(o.x, o.y, state.a / 2, 50).y} text={`${state.a}°`} tone="text-gold" />
          <Label x={at(o.x, o.y, (state.a + total) / 2, 50).x} y={at(o.x, o.y, (state.a + total) / 2, 50).y} text={`${unknown}°`} tone="text-mint" />
        </>
      )}

      <circle
        cx={handle.x}
        cy={handle.y}
        r="18"
        fill="transparent"
        stroke="transparent"
        role="button"
        tabIndex={0}
        aria-label={`Drag the gold ray. Current angle ${state.a} degrees.`}
        className="angle-handle-hit"
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
      <circle cx={handle.x} cy={handle.y} r="8" className={solved ? "angle-handle-success text-mint" : "text-gold"} fill="currentColor" pointerEvents="none" />
    </svg>
  );
}

function relationText(play: AngleBenchPlay, state: AngleBenchState) {
  const unknown = angleBenchValue(play.kind, state);
  if (play.kind === "complement") return `${state.a}° + ${unknown}° = 90°`;
  if (play.kind === "supplement") return `${state.a}° + ${unknown}° = 180°`;
  if (play.kind === "vertical") return `${state.a}° = opposite ${unknown}°`;
  return `${state.a}° + ${state.b}° + ${unknown}° = 180°`;
}

function AngleBench({
  onExit,
  onQuestions,
}: {
  onExit?: () => void;
  onQuestions: () => void;
}) {
  const [levelId, setLevelId] = useState(1);
  const play = ANGLE_PLAYS[levelId - 1] ?? ANGLE_PLAYS[0];
  const [state, setState] = useState<AngleBenchState>(play.start);
  const [run, setRun] = useState(0);
  const scored = useRef(false);
  const solved = angleBenchSolved(play, state);
  const range = angleBenchRange(play);
  const control = play.kind === "triangle" ? state.b : state.a;

  useEffect(() => {
    scored.current = false;
    setState({ ...play.start });
  }, [play]);

  useEffect(() => {
    if (!solved || scored.current) return;
    scored.current = true;
    const score = 120;
    setRun((total) => {
      const next = total + score;
      noteClear("angles", play.id, score, next);
      return next;
    });
  }, [solved, play.id]);

  function change(value: number) {
    setState((current) => applyAngleHandle(play, current, value));
  }

  return (
    <BenchFrame
      kicker="ANGLES"
      title={play.title}
      meta={`${play.id}/16`}
      onExit={onExit}
      onQuestions={onQuestions}
    >
      <LevelStrip count={ANGLE_PLAYS.length} current={play.id} onPick={setLevelId} />
      <p className="text-sm text-mist">{angleBenchInstruction(play)}</p>
      <p className="mt-1 font-mono text-xs text-gold">
        Target mint angle · {play.target}°
      </p>

      <div
        className={`mt-3 overflow-hidden rounded-2xl border bg-ink p-2 transition-[border-color,box-shadow] duration-150 ${
          solved
            ? "border-mint/60 shadow-[0_0_28px_rgba(143,208,176,0.10)]"
            : "border-line"
        }`}
      >
        <div className="flex items-center justify-between gap-3 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em]">
          <span className="text-mist">Angle bench</span>
          <span className={solved ? "text-mint" : "text-gold"}>
            {solved ? "relation locked" : "drag the marked handle"}
          </span>
        </div>
        <DirectAngleFigure play={play} state={state} solved={solved} onControl={change} />
      </div>

      <p className="mt-3 text-center font-mono text-lg text-cream">
        {relationText(play, state)}
      </p>

      <div className="mt-3 rounded-xl border border-line bg-panel px-3 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={control <= range.min}
            onClick={() => change(control - 1)}
            className="min-h-10 min-w-10 rounded-full border border-line text-lg text-cream disabled:opacity-40"
            aria-label="Decrease angle"
          >
            −
          </button>
          <input
            type="range"
            min={range.min}
            max={range.max}
            step={1}
            value={control}
            onChange={(event) => change(Number(event.currentTarget.value))}
            className="angle-range h-10 min-w-0 flex-1"
            aria-label={play.kind === "triangle" ? "Triangle base angle" : "Ray angle"}
          />
          <button
            type="button"
            disabled={control >= range.max}
            onClick={() => change(control + 1)}
            className="min-h-10 min-w-10 rounded-full border border-line text-lg text-cream disabled:opacity-40"
            aria-label="Increase angle"
          >
            +
          </button>
        </div>
      </div>

      <p className="mt-3 font-mono text-sm text-gold" aria-live="polite">
        {solved
          ? "The relationship closes exactly."
          : play.kind === "vertical"
            ? "Rotate the crossing line. Opposite angles remain equal at every position."
            : "Move the ray. The measured relationship updates from the geometry itself."}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            scored.current = solved;
            setState({ ...play.start });
          }}
          className="min-h-11 rounded-full border border-line px-4 text-sm text-cream"
        >
          Reset
        </button>
        {solved && play.id < ANGLE_PLAYS.length ? (
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

export function AngleProof({
  active = true,
  onExit,
}: {
  active?: boolean;
  onExit?: () => void;
}) {
  const [mode, setMode] = useState<"bench" | "questions">("bench");

  if (mode === "questions") {
    return (
      <AngleQuestions
        active={active}
        onExit={onExit}
        onBench={() => setMode("bench")}
      />
    );
  }

  return <AngleBench onExit={onExit} onQuestions={() => setMode("questions")} />;
}
