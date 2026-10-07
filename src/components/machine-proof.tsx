import { RoundProof } from "@/components/round-proof";
import { MACHINE_LEVELS, applyRule, auditMachine, formatRule, type MachinePrompt } from "@/game/machine/levels";

function MachineFigure({ prompt }: { prompt: MachinePrompt }) {
  const { scene } = prompt;
  const output = applyRule(scene.rule, scene.input);
  const ruleLabel = scene.mode === "out" ? formatRule(scene.rule) : "?";
  const outLabel = scene.mode === "out" ? "?" : String(output);
  return (
    <div className="mx-auto flex max-w-sm items-center justify-center gap-2" aria-hidden="true">
      <span className="grid size-14 place-items-center rounded-full border border-line bg-ink font-mono text-lg text-cream">{scene.input}</span>
      <span className="font-mono text-mist">→</span>
      <span className="grid h-16 min-w-24 place-items-center rounded-xl border border-gold bg-ink px-3 text-center font-mono text-sm text-gold">{ruleLabel}</span>
      <span className="font-mono text-mist">→</span>
      <span className="grid size-14 place-items-center rounded-full border border-mint bg-ink font-mono text-lg text-mint">{outLabel}</span>
    </div>
  );
}

export function MachineProof({ active = true, onExit }: { active?: boolean; onExit?: () => void }) {
  return (
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
  );
}
