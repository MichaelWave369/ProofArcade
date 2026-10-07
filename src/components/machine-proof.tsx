import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { BenchFrame, LevelStrip, QuestionsChip } from "@/components/bench-frame";
import { RoundProof } from "@/components/round-proof";
import {
  magneticPoint,
  pointInside,
  usePointerDrag,
  useReducedMotionPreference,
  type DragBounds,
} from "@/components/use-pointer-drag";
import { noteClear } from "@/game/progress";
import {
  MACHINE_PLAYS,
  machineBenchInstruction,
  machineRuleMatches,
  reverseTrace,
  traceRule,
  type MachineBenchPlay,
  type MachineTrace,
} from "@/game/machine/bench";
import {
  MACHINE_LEVELS,
  applyRule,
  auditMachine,
  formatRule,
  type MachinePrompt,
  type Rule,
} from "@/game/machine/levels";

type MachineDrag =
  | { kind: "input"; value: number }
  | { kind: "rule"; index: number; rule: Rule };

function boundsOf(element: HTMLElement): DragBounds {
  const rect = element.getBoundingClientRect();
  return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
}

function MachineFigure({ prompt }: { prompt: MachinePrompt }) {
  const { scene } = prompt;
  const output = applyRule(scene.rule, scene.input);
  const ruleLabel = scene.mode === "out" ? formatRule(scene.rule) : "?";
  const outLabel = scene.mode === "out" ? "?" : String(output);
  return (
    <div className="mx-auto flex max-w-sm items-center justify-center gap-2" aria-hidden="true">
      <span className="grid size-14 place-items-center rounded-full border border-line bg-ink font-mono text-lg text-cream">
        {scene.input}
      </span>
      <span className="font-mono text-mist">→</span>
      <span className="grid h-16 min-w-24 place-items-center rounded-xl border border-gold bg-ink px-3 text-center font-mono text-sm text-gold">
        {ruleLabel}
      </span>
      <span className="font-mono text-mist">→</span>
      <span className="grid size-14 place-items-center rounded-full border border-mint bg-ink font-mono text-lg text-mint">
        {outLabel}
      </span>
    </div>
  );
}

function MachineQuestions({
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
      <RoundProof<MachinePrompt>
        active={active}
        onExit={onExit}
        track="machine"
        mark="ƒ"
        title="Machine"
        menuKicker="ALGEBRA"
        menuTitle="Feed the machine."
        menuBody="A rule changes the number that goes in. Name what comes out, or name the hidden rule. Keys 1 to 4. A miss costs a heart. Sixteen levels."
        levels={MACHINE_LEVELS}
        audit={auditMachine}
        renderScene={(prompt) => <MachineFigure prompt={prompt} />}
      />
      <QuestionsChip label="Bench" onClick={onBench} />
    </div>
  );
}

function TraceRail({
  trace,
  reverse,
  targetOutput,
}: {
  trace: MachineTrace | null;
  reverse: MachineTrace | null;
  targetOutput: number;
}) {
  if (!trace) {
    return (
      <div className="rounded-2xl border border-line bg-panel p-4 text-center font-mono text-sm text-mist">
        Feed the machine to expose the transformation.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-line bg-panel p-4">
        <span className="machine-token-enter grid size-12 place-items-center rounded-full border border-cream/40 bg-ink font-mono text-base text-cream">
          {trace.input}
        </span>
        {trace.stages.map((stage, index) => (
          <div key={`${stage.label}-${index}`} className="contents">
            <span className="text-mist" aria-hidden="true">→</span>
            <div
              className="machine-stage-enter min-w-24 rounded-xl border border-gold/60 bg-ink px-3 py-2 text-center"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <p className="font-mono text-xs text-gold">{stage.label}</p>
              <p className="mt-1 font-mono text-sm text-cream">
                {stage.before} → {stage.after}
              </p>
            </div>
          </div>
        ))}
        <span className="text-mist" aria-hidden="true">→</span>
        <span className={`machine-token-enter grid size-12 place-items-center rounded-full border bg-ink font-mono text-base ${
          trace.output === targetOutput
            ? "border-mint text-mint"
            : "border-danger text-danger"
        }`}>
          {trace.output}
        </span>
      </div>

      {reverse ? (
        <div className="rounded-xl border border-line bg-ink px-3 py-2">
          <p className="font-mono text-[10px] uppercase tracking-widest text-mist">
            Reverse proof
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-xs text-cream">
            <span className="text-mint">{targetOutput}</span>
            {reverse.stages.map((stage, index) => (
              <span key={`${stage.label}-${index}`} className="contents">
                <span className="text-mist">→</span>
                <span className="rounded-full border border-line px-2 py-1">
                  {stage.label}
                </span>
                <span className="text-cream">{stage.after}</span>
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MachineBench({
  onExit,
  onQuestions,
}: {
  onExit?: () => void;
  onQuestions: () => void;
}) {
  const [levelId, setLevelId] = useState(1);
  const play = MACHINE_PLAYS[levelId - 1] ?? MACHINE_PLAYS[0];
  const [trace, setTrace] = useState<MachineTrace | null>(null);
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);
  const [run, setRun] = useState(0);
  const scored = useRef(false);
  const gateRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotionPreference();
  const {
    drag,
    beginDrag,
    moveDrag,
    finishDrag,
    cancelDrag,
    consumeSuppressedClick,
  } = usePointerDrag<MachineDrag>();

  useEffect(() => {
    scored.current = false;
    setTrace(null);
    setSelectedRule(null);
  }, [play]);

  const correctRule =
    play.mode === "out"
      ? play.rule
      : selectedRule && machineRuleMatches(play, selectedRule)
        ? selectedRule
        : null;
  const solved = trace !== null && Boolean(correctRule);
  const reverse =
    selectedRule && trace
      ? reverseTrace(selectedRule, play.output)
      : play.mode === "out" && trace
        ? reverseTrace(play.rule, play.output)
        : null;

  useEffect(() => {
    if (!solved || scored.current) return;
    scored.current = true;
    const score = 120;
    setRun((total) => {
      const next = total + score;
      noteClear("machine", play.id, score, next);
      return next;
    });
  }, [solved, play.id]);

  function runInput() {
    const next = traceRule(play.rule, play.input);
    setTrace(next);
    setSelectedRule(play.rule);
  }

  function tryRule(rule: Rule) {
    setSelectedRule(rule);
    setTrace(traceRule(rule, play.input));
  }

  function accept(payload: MachineDrag) {
    if (payload.kind === "input") runInput();
    else tryRule(payload.rule);
  }

  function finishDrop(event: ReactPointerEvent<HTMLButtonElement>) {
    finishDrag(
      event,
      (payload, pointer, size) => {
        const gate = gateRef.current;
        if (!gate) return { accepted: false, settleMs: 140 };
        const bounds = boundsOf(gate);
        if (!pointInside(bounds, pointer.x, pointer.y, 16)) {
          return { accepted: false, settleMs: 145 };
        }
        return {
          accepted: true,
          target: magneticPoint(bounds, size, pointer.x, pointer.y, 6),
          settleMs: 120,
          onAccepted: () => accept(payload),
        };
      },
      reducedMotion,
    );
  }

  return (
    <BenchFrame
      kicker="MACHINE"
      title={play.title}
      meta={`${play.id}/16`}
      onExit={onExit}
      onQuestions={onQuestions}
    >
      <LevelStrip count={MACHINE_PLAYS.length} current={play.id} onPick={setLevelId} />

      <p className="text-sm text-mist">{machineBenchInstruction(play)}</p>
      <p className="mt-1 font-mono text-xs text-gold">
        {play.mode === "out"
          ? `Known rule · ${formatRule(play.rule)}`
          : `Observed pair · ${play.input} → ${play.output}`}
      </p>

      <div
        ref={gateRef}
        className={`mt-3 rounded-2xl border bg-ink p-4 transition-[border-color,box-shadow,transform] duration-150 ${
          drag
            ? "scale-[1.005] border-gold/75 shadow-[0_0_28px_rgba(228,177,90,0.12)]"
            : solved
              ? "border-mint/60 shadow-[0_0_26px_rgba(143,208,176,0.10)]"
              : "border-line"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-mist">
            Function gate
          </p>
          <p className={`font-mono text-[10px] uppercase tracking-[0.18em] ${
            drag ? "text-gold" : solved ? "text-mint" : "text-mist"
          }`}>
            {drag ? "release to run" : solved ? "proof closed" : "waiting"}
          </p>
        </div>

        <div className="mt-3">
          <TraceRail trace={trace} reverse={reverse} targetOutput={play.output} />
        </div>
      </div>

      {play.mode === "out" ? (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => {
              if (consumeSuppressedClick()) return;
              runInput();
            }}
            onPointerDown={(event) =>
              beginDrag(event, { kind: "input", value: play.input })
            }
            onPointerMove={moveDrag}
            onPointerUp={finishDrop}
            onPointerCancel={cancelDrag}
            style={{ touchAction: "none" }}
            className={`machine-feed-token motion-safe mx-auto grid min-h-14 min-w-28 select-none place-items-center rounded-full border px-5 font-mono text-base transition-[transform,opacity,border-color] duration-150 ${
              drag?.payload.kind === "input"
                ? "scale-[1.04] border-gold text-gold opacity-25"
                : "border-cream/40 text-cream"
            }`}
          >
            Feed {play.input}
          </button>
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {play.candidates.map((rule, index) => {
            const selected =
              selectedRule && formatRule(selectedRule) === formatRule(rule);
            const right = machineRuleMatches(play, rule);
            return (
              <button
                key={`${formatRule(rule)}-${index}`}
                type="button"
                onClick={() => {
                  if (consumeSuppressedClick()) return;
                  tryRule(rule);
                }}
                onPointerDown={(event) =>
                  beginDrag(event, { kind: "rule", index, rule })
                }
                onPointerMove={moveDrag}
                onPointerUp={finishDrop}
                onPointerCancel={cancelDrag}
                style={{ touchAction: "none" }}
                className={`motion-safe min-h-14 select-none rounded-xl border px-3 font-mono text-sm transition-[transform,opacity,border-color,background-color] duration-150 ${
                  drag?.payload.kind === "rule" &&
                  drag.payload.index === index
                    ? "scale-[1.03] border-gold bg-gold/15 text-gold opacity-25"
                    : selected
                      ? right
                        ? "border-mint bg-mint/10 text-mint"
                        : "border-danger bg-danger/10 text-danger"
                      : "border-line bg-panel text-cream"
                }`}
              >
                {formatRule(rule)}
              </button>
            );
          })}
        </div>
      )}

      <p className="mt-3 font-mono text-sm text-gold" aria-live="polite">
        {trace === null
          ? play.mode === "out"
            ? "Drag the input into the function gate, or tap it."
            : "Drag a candidate rule into the function gate, or tap one."
          : solved
            ? "Forward and reverse agree. The machine is proved."
            : `${play.input} became ${trace.output}, not ${play.output}. The reverse check does not recover the observed input.`}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            scored.current = solved;
            setTrace(null);
            setSelectedRule(null);
          }}
          className="min-h-11 rounded-full border border-line px-4 text-sm text-cream"
        >
          Reset
        </button>
        {solved && play.id < MACHINE_PLAYS.length ? (
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

      {drag ? (
        <div
          aria-hidden="true"
          className="machine-drag-ghost fixed z-[80] flex items-center justify-center rounded-xl border border-gold bg-panel-2 px-4 font-mono text-sm font-bold text-gold shadow-[0_16px_42px_rgba(0,0,0,0.45)]"
          style={{
            left: 0,
            top: 0,
            width: drag.size.width,
            height: drag.size.height,
            transform: `translate3d(${drag.current.left}px, ${drag.current.top}px, 0) scale(${drag.phase === "dragging" ? 1.05 : 1})`,
            transition:
              drag.phase === "dragging"
                ? "none"
                : "transform 130ms cubic-bezier(0.2, 0.8, 0.2, 1)",
          }}
        >
          {drag.payload.kind === "input"
            ? drag.payload.value
            : formatRule(drag.payload.rule)}
        </div>
      ) : null}
    </BenchFrame>
  );
}

export function MachineProof({
  active = true,
  onExit,
}: {
  active?: boolean;
  onExit?: () => void;
}) {
  const [mode, setMode] = useState<"bench" | "questions">("bench");

  if (mode === "questions") {
    return (
      <MachineQuestions
        active={active}
        onExit={onExit}
        onBench={() => setMode("bench")}
      />
    );
  }

  return (
    <MachineBench
      onExit={onExit}
      onQuestions={() => setMode("questions")}
    />
  );
}
