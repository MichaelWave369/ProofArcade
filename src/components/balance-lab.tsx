import { useEffect, useRef, useState } from "react";
import { BenchFrame, LevelStrip } from "@/components/bench-frame";
import { prefersReducedMotion } from "@/components/use-arrive";
import { BALANCE_PLAYS, applyScale, balanced, formatOp, formatPan, scaleSolved, type BalancePlay, type ScaleState } from "@/game/balance/scale";
import { noteClear } from "@/game/progress";

function useNod(token: number) {
  const [angle, setAngle] = useState(0);
  useEffect(() => {
    if (token === 0 || prefersReducedMotion()) {
      setAngle(0);
      return;
    }
    const started = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      const u = (now - started) / 480;
      if (u >= 1) {
        setAngle(0);
        return;
      }
      setAngle(Math.sin(u * Math.PI * 2) * (1 - u) * 3.2);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [token]);
  return angle;
}

function Beam({ state, angle }: { state: ScaleState; angle: number }) {
  const left = formatPan(state.left);
  const right = formatPan(state.right);
  return (
    <svg viewBox="0 0 320 150" className="mx-auto h-40 w-full max-w-md" role="img" aria-label={`${left} on the left pan, ${right} on the right pan`}>
      <polygon points="160,108 146,132 174,132" className="text-gold" fill="currentColor" />
      <g transform={`rotate(${angle} 160 108)`}>
        <line x1="36" y1="48" x2="284" y2="48" className="text-gold" stroke="currentColor" strokeWidth="4" />
        <line x1="160" y1="48" x2="160" y2="108" className="text-gold" stroke="currentColor" strokeWidth="4" />
        <line x1="78" y1="48" x2="78" y2="72" className="text-line" stroke="currentColor" />
        <line x1="242" y1="48" x2="242" y2="72" className="text-line" stroke="currentColor" />
        <rect x="28" y="72" width="100" height="40" rx="10" className="text-gold" fill="none" stroke="currentColor" strokeWidth="2" />
        <rect x="192" y="72" width="100" height="40" rx="10" className="text-mint" fill="none" stroke="currentColor" strokeWidth="2" />
        <text x="78" y="98" textAnchor="middle" className="text-cream" fill="currentColor" fontSize="16" fontFamily="IBM Plex Mono, monospace">
          {left}
        </text>
        <text x="242" y="98" textAnchor="middle" className="text-mint" fill="currentColor" fontSize="16" fontFamily="IBM Plex Mono, monospace">
          {right}
        </text>
      </g>
    </svg>
  );
}

export function BalanceLab({ onExit, onQuestions }: { onExit?: () => void; onQuestions?: () => void }) {
  const [levelId, setLevelId] = useState(1);
  const play = BALANCE_PLAYS[levelId - 1] ?? BALANCE_PLAYS[0];
  const [state, setState] = useState<ScaleState>(play.start);
  const [nod, setNod] = useState(0);
  const [run, setRun] = useState(0);
  const scored = useRef(false);
  const angle = useNod(nod);

  useEffect(() => {
    scored.current = false;
    setState(play.start);
    setNod(0);
  }, [play]);

  function act(index: number) {
    if (scaleSolved(state, play.x)) return;
    const op = play.ops[index];
    const next = applyScale(state, op);
    if (!next) return;
    setState(next);
    setNod((count) => count + 1);
    if (!scaleSolved(next, play.x) || scored.current) return;
    scored.current = true;
    const score = 140;
    setRun((total) => {
      const sum = total + score;
      noteClear("balance", play.id, score, sum);
      return sum;
    });
  }

  const solved = scaleSolved(state, play.x);
  const still = balanced(state, play.x);

  return (
    <BenchFrame kicker="BALANCE LAB" title={play.title} meta={`${play.id}/16`} onExit={onExit} onQuestions={onQuestions}>
      <LevelStrip count={BALANCE_PLAYS.length} current={play.id} onPick={setLevelId} />
      <p className="font-mono text-sm text-cream">{play.prompt}</p>
      <p className="mt-1 text-sm text-mist">Do the same thing to both pans. The beam nods, then settles, because equality is still true.</p>
      <div className="mt-3 rounded-2xl border border-line bg-ink">
        <Beam state={state} angle={angle} />
      </div>
      <p className="mt-3 font-mono text-sm text-gold" aria-live="polite">
        {solved ? "x stands alone. The right pan is what it equals." : still ? "Still balanced. x is not alone yet." : "The pans disagree. That move is not available."}
      </p>
      <div className="mt-3 grid gap-2">
        {play.ops.map((op, index) => {
          const legal = !solved && applyScale(state, op) !== null;
          return (
            <button
              key={`${play.id}-${formatOp(op)}`}
              type="button"
              disabled={!legal}
              onClick={() => act(index)}
              className="min-h-11 rounded-xl border border-line bg-panel px-4 text-left text-sm text-cream disabled:opacity-40"
            >
              {formatOp(op)}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            scored.current = solved;
            setState(play.start);
          }}
          className="min-h-11 rounded-full border border-line px-4 text-sm text-cream"
        >
          Reset
        </button>
        {solved && play.id < BALANCE_PLAYS.length ? (
          <button type="button" onClick={() => setLevelId(play.id + 1)} className="min-h-11 rounded-full bg-gold px-4 text-sm font-extrabold text-ink">
            Next
          </button>
        ) : null}
        <p className="font-mono text-xs text-mist">Run {run}</p>
      </div>
    </BenchFrame>
  );
}
