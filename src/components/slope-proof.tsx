import { useState } from "react";
import { QuestionsChip } from "@/components/bench-frame";
import { SlopeLine } from "@/components/slope-line";
import { useArrive } from "@/components/use-arrive";
import { RoundProof } from "@/components/round-proof";
import { SLOPE_LEVELS, auditSlope, type Pt, type SlopePrompt } from "@/game/slope/levels";
import { arriveDraw, mix } from "@/game/render/stage";

function mapX(n: number) {
  return 90 + n * 16;
}

function mapY(n: number) {
  return 90 - n * 16;
}

function SlopeFigure({ a, b }: { a: Pt; b: Pt }) {
  const travel = arriveDraw(useArrive(`${a[0]},${a[1]},${b[0]},${b[1]}`));
  const beadX = mix(mapX(a[0]), mapX(b[0]), travel);
  const beadY = mix(mapY(a[1]), mapY(b[1]), travel);
  return (
    <div>
      <svg viewBox="0 0 180 180" className="mx-auto h-40 w-full max-w-xs" role="img" aria-label={`Line from ${a[0]}, ${a[1]} to ${b[0]}, ${b[1]}`}>
        <line x1="14" y1="90" x2="166" y2="90" className="text-line" stroke="currentColor" />
        <line x1="90" y1="14" x2="90" y2="166" className="text-line" stroke="currentColor" />
        <line x1={mapX(a[0])} y1={mapY(a[1])} x2={mapX(b[0])} y2={mapY(b[1])} className="text-gold" stroke="currentColor" strokeWidth="3" />
        <circle cx={mapX(a[0])} cy={mapY(a[1])} r="5" className="text-gold" fill="currentColor" />
        <circle cx={mapX(b[0])} cy={mapY(b[1])} r="5" className="text-cream" fill="currentColor" />
        {travel < 0.98 ? <circle cx={beadX} cy={beadY} r="3.5" className="text-gold-soft" fill="currentColor" /> : null}
      </svg>
      <p className="mt-1 text-center font-mono text-xs text-mist">
        ({a[0]}, {a[1]}) to ({b[0]}, {b[1]})
      </p>
    </div>
  );
}

export function SlopeProof({ active = true, onExit }: { active?: boolean; onExit?: () => void }) {
  const [mode, setMode] = useState<"line" | "questions">("line");
  if (mode === "questions") {
    return (
      <div className="relative h-dvh">
        <RoundProof<SlopePrompt>
          active={active}
          onExit={onExit}
          track="slope"
          mark="Δ"
          title="Slope"
          menuKicker="ADVANCED"
          menuTitle="Read the line."
          menuBody="Two dots mark a line. Name the slope, or name the point that stays on it. Keys 1 to 4. A miss costs a heart. Sixteen levels."
          levels={SLOPE_LEVELS}
          audit={auditSlope}
          renderScene={(prompt) => <SlopeFigure a={prompt.scene.a} b={prompt.scene.b} />}
        />
        <QuestionsChip label="Bench" onClick={() => setMode("line")} />
      </div>
    );
  }
  return <SlopeLine onExit={onExit} onQuestions={() => setMode("questions")} />;
}
