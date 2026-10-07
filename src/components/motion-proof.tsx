import { useState } from "react";
import { QuestionsChip } from "@/components/bench-frame";
import { MotionRun } from "@/components/motion-run";
import { RoundProof } from "@/components/round-proof";
import { MOTION_LEVELS, auditMotion, motionGivens, type MotionPrompt } from "@/game/motion/levels";

function MotionFigure({ prompt }: { prompt: MotionPrompt }) {
  const [left, right] = motionGivens(prompt.scene);
  const unknown = prompt.scene.kind === "speed" ? "m/s" : prompt.scene.kind === "distance" ? "m" : "s";
  return (
    <div>
      <svg viewBox="0 0 220 72" className="mx-auto h-24 w-full max-w-xs" role="img" aria-label={`Trip givens ${left} and ${right}`}>
        <line x1="24" y1="36" x2="196" y2="36" className="text-line" stroke="currentColor" strokeWidth="3" />
        <circle cx="36" cy="36" r="7" className="text-cream" fill="currentColor" />
        <circle cx="184" cy="36" r="7" className="text-gold" fill="currentColor" />
        <text x="110" y="22" textAnchor="middle" fontSize="12" className="fill-current font-mono text-gold">
          {unknown}
        </text>
      </svg>
      <p className="text-center font-mono text-sm text-cream">
        <span>{left}</span>
        <span className="text-mist"> · </span>
        <span>{right}</span>
        <span className="text-mist"> · </span>
        <span className="text-gold">?</span>
      </p>
    </div>
  );
}

export function MotionProof({ active = true, onExit }: { active?: boolean; onExit?: () => void }) {
  const [mode, setMode] = useState<"run" | "questions">("run");
  if (mode === "questions") {
    return (
      <div className="relative h-dvh">
        <RoundProof<MotionPrompt>
          active={active}
          onExit={onExit}
          track="motion"
          mark="v"
          title="Motion"
          menuKicker="PHYSICS"
          menuTitle="Read the trip."
          menuBody="Distance, speed, and time stay in step. Two are given. Name the third. Keys 1 to 4. A miss costs a heart. Sixteen levels."
          levels={MOTION_LEVELS}
          audit={auditMotion}
          renderScene={(prompt) => <MotionFigure prompt={prompt} />}
        />
        <QuestionsChip label="Bench" onClick={() => setMode("run")} />
      </div>
    );
  }
  return <MotionRun onExit={onExit} onQuestions={() => setMode("questions")} />;
}
