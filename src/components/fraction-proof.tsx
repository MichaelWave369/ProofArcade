import { useState } from "react";
import { QuestionsChip } from "@/components/bench-frame";
import { FractionForge } from "@/components/fraction-forge";
import { useArrive } from "@/components/use-arrive";
import { RoundProof } from "@/components/round-proof";
import { FRACTION_LEVELS, auditFraction, type FractionPrompt } from "@/game/fraction/levels";
import { arriveDraw } from "@/game/render/stage";

function Sheen({ token }: { token: string }) {
  const travel = arriveDraw(useArrive(token));
  if (travel >= 0.98) return null;
  return <span className="pointer-events-none absolute inset-y-0 w-6 bg-gold-soft/50" style={{ left: `${travel * 100}%` }} aria-hidden="true" />;
}

function Bar({ parts, filled, label, token }: { parts: number; filled: number; label: string; token: string }) {
  return (
    <div>
      <p className="mb-1 text-center font-mono text-xs text-mist">{label}</p>
      <div className="relative flex h-8 overflow-hidden rounded-lg border border-line">
        {Array.from({ length: parts }, (_, index) => (
          <span key={index} className={`min-w-0 flex-1 ${index < filled ? "bg-gold" : "bg-ink"} ${index > 0 ? "border-l border-line" : ""}`} />
        ))}
        <Sheen token={token} />
      </div>
    </div>
  );
}

function FractionFigure({ prompt }: { prompt: FractionPrompt }) {
  if (prompt.scene.kind === "shade") {
    return (
      <Bar
        parts={prompt.scene.parts}
        filled={prompt.scene.filled}
        label={`${prompt.scene.filled} gold of ${prompt.scene.parts}`}
        token={`shade-${prompt.scene.parts}-${prompt.scene.filled}`}
      />
    );
  }
  return (
    <div className="grid gap-3">
      <Bar parts={prompt.scene.left[1]} filled={prompt.scene.left[0]} label="Left" token={`L-${prompt.scene.left.join("/")}`} />
      <Bar parts={prompt.scene.right[1]} filled={prompt.scene.right[0]} label="Right" token={`R-${prompt.scene.right.join("/")}`} />
    </div>
  );
}

export function FractionProof({ active = true, onExit }: { active?: boolean; onExit?: () => void }) {
  const [mode, setMode] = useState<"forge" | "questions">("forge");
  if (mode === "questions") {
    return (
      <div className="relative h-dvh">
        <RoundProof<FractionPrompt>
          active={active}
          onExit={onExit}
          track="fractions"
          mark="½"
          title="Fractions"
          menuKicker="NUMBER"
          menuTitle="How much is gold?"
          menuBody="Read the bar, or say which bar holds more gold. Same amount can wear different cuts. Keys 1 to 4. Sixteen levels."
          levels={FRACTION_LEVELS}
          audit={auditFraction}
          renderScene={(prompt) => <FractionFigure prompt={prompt} />}
        />
        <QuestionsChip label="Bench" onClick={() => setMode("forge")} />
      </div>
    );
  }
  return <FractionForge onExit={onExit} onQuestions={() => setMode("questions")} />;
}
