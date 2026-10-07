import type { ReactNode } from "react";
import { ArcadeExit } from "@/components/mode-switch";

export function BenchFrame({
  kicker,
  title,
  meta,
  onExit,
  onQuestions,
  chip = "Questions",
  children,
}: {
  kicker: string;
  title: string;
  meta?: string;
  onExit?: () => void;
  onQuestions?: () => void;
  chip?: string;
  children: ReactNode;
}) {
  return (
    <main className="relative flex h-dvh flex-col overflow-hidden bg-ink text-cream">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="font-mono text-xs tracking-widest text-gold">{kicker}</p>
          <h1 className="truncate text-xl font-extrabold tracking-tight sm:text-2xl">{title}</h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {meta ? <p className="font-mono text-xs text-mist">{meta}</p> : null}
          {onExit ? <ArcadeExit onExit={onExit} /> : null}
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 pb-24 sm:px-6">{children}</div>
      {onQuestions ? (
        <button
          type="button"
          onClick={onQuestions}
          className="absolute right-4 bottom-4 z-10 min-h-11 rounded-full border border-line bg-ink/95 px-4 font-mono text-xs tracking-widest text-gold"
        >
          {chip}
        </button>
      ) : null}
    </main>
  );
}

export function LevelStrip({ count, current, onPick }: { count: number; current: number; onPick: (id: number) => void }) {
  return (
    <div className="flex gap-1 overflow-x-auto pb-2" role="tablist" aria-label="Levels">
      {Array.from({ length: count }, (_, index) => {
        const id = index + 1;
        const on = id === current;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onPick(id)}
            className={
              on
                ? "min-h-11 min-w-11 shrink-0 rounded-full bg-gold text-sm font-extrabold text-ink"
                : "min-h-11 min-w-11 shrink-0 rounded-full border border-line bg-panel text-sm text-mist"
            }
          >
            {id}
          </button>
        );
      })}
    </div>
  );
}

export function QuestionsChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute right-4 bottom-4 z-20 min-h-11 rounded-full border border-line bg-ink/95 px-4 font-mono text-xs tracking-widest text-gold"
    >
      {label}
    </button>
  );
}
