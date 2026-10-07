import { ArrowLeft } from "lucide-react";

export function ArcadeExit({ onExit }: { onExit: () => void }) {
  return (
    <button
      type="button"
      onClick={onExit}
      className="flex min-h-11 shrink-0 items-center gap-1 rounded-full border border-line bg-ink px-3 text-xs font-bold text-cream"
      aria-label="Back to Proof Arcade"
    >
      <ArrowLeft className="size-4" />
      <span className="hidden sm:inline">Arcade</span>
    </button>
  );
}
