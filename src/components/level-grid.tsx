export function LevelGrid({
  count,
  cleared,
  scores,
  onPlay,
}: {
  count: number;
  cleared: number;
  scores: number[];
  onPlay: (level: number) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-2" aria-label="Levels">
      {Array.from({ length: count }, (_, i) => {
        const level = i + 1;
        const locked = level > cleared + 1;
        const score = scores[i] ?? 0;
        return (
          <button
            key={level}
            type="button"
            disabled={locked}
            onClick={() => onPlay(level)}
            aria-label={locked ? `Level ${level} locked` : `Play level ${level}${score ? `, best ${score}` : ""}`}
            className={
              locked
                ? "flex min-h-14 flex-col items-center justify-center rounded-xl border border-line bg-ink font-mono text-mist opacity-40"
                : score > 0
                  ? "flex min-h-14 flex-col items-center justify-center rounded-xl border border-gold/70 bg-ink font-mono"
                  : "flex min-h-14 flex-col items-center justify-center rounded-xl border border-line bg-ink font-mono"
            }
          >
            <span className="text-base font-bold text-cream">{level}</span>
            <span className="text-xs text-mist">{locked ? "locked" : score > 0 ? score : "open"}</span>
          </button>
        );
      })}
    </div>
  );
}
