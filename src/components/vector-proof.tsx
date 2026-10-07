import { useState } from "react";
import { QuestionsChip } from "@/components/bench-frame";
import { useArrive } from "@/components/use-arrive";
import { RoundProof } from "@/components/round-proof";
import { VectorDrift } from "@/components/vector-drift";
import { VECTOR_LEVELS, auditVector, type Pt, type VectorPrompt } from "@/game/vector/levels";
import { arriveDraw } from "@/game/render/stage";

function VectorFigure({ a, b }: { a: Pt; b: Pt }) {
  const travel = arriveDraw(useArrive(`${a[0]},${a[1]},${b[0]},${b[1]}`));
  const max = Math.max(2, Math.abs(a[0]), Math.abs(a[1]), Math.abs(b[0]), Math.abs(b[1]));
  const unit = 68 / max;
  const X = (n: number) => 90 + n * unit;
  const Y = (n: number) => 90 - n * unit;
  return (
    <div>
      <svg viewBox="0 0 180 180" className="mx-auto h-40 w-full max-w-xs" role="img" aria-label={`Vector A ${a[0]}, ${a[1]} and vector B ${b[0]}, ${b[1]}`}>
        <line x1="16" y1="90" x2="164" y2="90" className="text-line" stroke="currentColor" />
        <line x1="90" y1="16" x2="90" y2="164" className="text-line" stroke="currentColor" />
        <line x1="90" y1="90" x2={X(a[0])} y2={Y(a[1])} className="text-gold" stroke="currentColor" strokeWidth="3" />
        <circle cx={X(a[0])} cy={Y(a[1])} r="5" className="text-gold" fill="currentColor" />
        <line x1="90" y1="90" x2={X(b[0])} y2={Y(b[1])} className="text-mint" stroke="currentColor" strokeWidth="3" />
        <circle cx={X(b[0])} cy={Y(b[1])} r="5" className="text-mint" fill="currentColor" />
        {travel < 0.98 ? (
          <>
            <circle cx={X(a[0] * travel)} cy={Y(a[1] * travel)} r="3.5" className="text-cream" fill="currentColor" />
            <circle cx={X(b[0] * travel)} cy={Y(b[1] * travel)} r="3.5" className="text-cream" fill="currentColor" />
          </>
        ) : null}
      </svg>
      <p className="mt-1 text-center font-mono text-xs text-mist">
        <span className="text-gold">A ({a[0]}, {a[1]})</span>
        <span> · </span>
        <span className="text-mint">B ({b[0]}, {b[1]})</span>
      </p>
    </div>
  );
}

export function VectorProof({ active = true, onExit }: { active?: boolean; onExit?: () => void }) {
  const [mode, setMode] = useState<"drift" | "questions">("drift");
  if (mode === "questions") {
    return (
      <div className="relative h-dvh">
        <RoundProof<VectorPrompt>
          active={active}
          onExit={onExit}
          track="vectors"
          mark="→"
          title="Vectors"
          menuKicker="PHYSICS"
          menuTitle="Add the arrows."
          menuBody="Both arrows start at the origin. Add their runs, then their rises. Keys 1 to 4. A miss costs a heart. Sixteen levels."
          levels={VECTOR_LEVELS}
          audit={auditVector}
          renderScene={(prompt) => <VectorFigure a={prompt.scene.a} b={prompt.scene.b} />}
        />
        <QuestionsChip label="Bench" onClick={() => setMode("drift")} />
      </div>
    );
  }
  return <VectorDrift onExit={onExit} onQuestions={() => setMode("questions")} />;
}
