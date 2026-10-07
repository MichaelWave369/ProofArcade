import { useState } from "react";
import { BalanceLab } from "@/components/balance-lab";
import { QuestionsChip } from "@/components/bench-frame";
import { useArrive } from "@/components/use-arrive";
import { RoundProof } from "@/components/round-proof";
import { BALANCE_LEVELS, auditBalance, type BalancePrompt } from "@/game/balance/levels";
import { mix } from "@/game/render/stage";

function BalanceFigure({ left, right }: { left: string; right: number }) {
  const angle = mix(6, 0, useArrive(`${left}=${right}`));
  return (
    <svg viewBox="0 0 220 108" className="mx-auto h-36 w-full max-w-xs" role="img" aria-label={`${left} balances ${right}`}>
      <polygon points="110,78 100,96 120,96" className="text-gold" fill="currentColor" />
      <g transform={`rotate(${angle} 110 78)`}>
        <line x1="28" y1="34" x2="192" y2="34" className="text-gold" stroke="currentColor" strokeWidth="3" />
        <line x1="110" y1="34" x2="110" y2="78" className="text-gold" stroke="currentColor" strokeWidth="3" />
        <line x1="52" y1="34" x2="52" y2="52" className="text-line" stroke="currentColor" />
        <line x1="168" y1="34" x2="168" y2="52" className="text-line" stroke="currentColor" />
        <rect x="16" y="52" width="72" height="32" rx="8" className="text-gold" fill="none" stroke="currentColor" strokeWidth="2" />
        <rect x="132" y="52" width="72" height="32" rx="8" className="text-mint" fill="none" stroke="currentColor" strokeWidth="2" />
        <text x="52" y="73" textAnchor="middle" className="font-mono text-cream" fill="currentColor" fontSize="13">
          {left}
        </text>
        <text x="168" y="73" textAnchor="middle" className="font-mono text-mint" fill="currentColor" fontSize="13">
          {right}
        </text>
      </g>
    </svg>
  );
}

export function BalanceProof({ active = true, onExit }: { active?: boolean; onExit?: () => void }) {
  const [mode, setMode] = useState<"lab" | "questions">("lab");
  if (mode === "questions") {
    return (
      <div className="relative h-dvh">
        <RoundProof<BalancePrompt>
          active={active}
          onExit={onExit}
          track="balance"
          mark="x"
          title="Balance"
          menuKicker="ALGEBRA"
          menuTitle="Level the pans."
          menuBody="The left pan holds an expression in x. The right pan holds a number. They balance. Name x. Keys 1 to 4. A miss costs a heart. Sixteen levels."
          levels={BALANCE_LEVELS}
          audit={auditBalance}
          renderScene={(prompt) => <BalanceFigure left={prompt.scene.left} right={prompt.scene.right} />}
        />
        <QuestionsChip label="Bench" onClick={() => setMode("lab")} />
      </div>
    );
  }
  return <BalanceLab onExit={onExit} onQuestions={() => setMode("questions")} />;
}
