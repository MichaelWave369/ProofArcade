import { useMemo, useState } from "react";
import {
  BANDS,
  CABINETS,
  SUBJECTS,
  filterCabinets,
  formatLastPlayed,
  highestLevel,
  isUntouched,
  masteryPercent,
  proofsCleared,
  type Band,
  type Cabinet,
  type Subject,
} from "@/game/catalog";
import type { ArcadeProgress, TrackId } from "@/game/progress";

function Preview({ id }: { id: TrackId }) {
  if (id === "bubbles") {
    return (
      <div className="flex h-full items-end justify-center gap-3 pb-3" aria-hidden="true">
        {[
          ["2²", "0ms"],
          ["√16", "180ms"],
          ["8÷2", "320ms"],
        ].map(([label, delay]) => (
          <span
            key={label}
            className="cabinet-bob grid size-14 place-items-center rounded-full border border-gold/60 bg-panel font-mono text-xs text-cream shadow-[inset_0_-8px_12px_rgba(0,0,0,0.35)]"
            style={{ animationDelay: delay }}
          >
            {label}
          </span>
        ))}
      </div>
    );
  }
  if (id === "symbols") {
    return (
      <div className="flex h-full items-center justify-center gap-4 font-mono text-3xl" aria-hidden="true">
        <span className="cabinet-drift text-gold" style={{ animationDelay: "0ms" }}>
          π
        </span>
        <span className="cabinet-drift text-gold" style={{ animationDelay: "160ms" }}>
          Σ
        </span>
        <span className="cabinet-drift text-mint" style={{ animationDelay: "320ms" }}>
          λ
        </span>
      </div>
    );
  }
  if (id === "equals") {
    return (
      <div className="flex h-full items-center justify-center gap-2 px-4" aria-hidden="true">
        <span className="rounded-lg border border-line bg-ink px-2 py-2 font-mono text-sm text-mist">3²</span>
        <span className="cabinet-pulse rounded-lg border border-gold bg-ink px-2 py-2 font-mono text-sm text-gold">√16</span>
        <span className="font-mono text-xs text-mist">= 4</span>
      </div>
    );
  }
  if (id === "logic") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-1 px-4 font-mono" aria-hidden="true">
        <span className="text-xs text-mist">if rain, then wet</span>
        <span className="text-lg text-gold">∴ wet</span>
      </div>
    );
  }
  if (id === "odds") {
    return (
      <div className="flex h-full items-center justify-center gap-2" aria-hidden="true">
        <span className="size-8 rounded-full border border-gold bg-gold" />
        <span className="size-8 rounded-full border border-gold bg-gold" />
        <span className="size-8 rounded-full border border-mist bg-mist" />
      </div>
    );
  }
  if (id === "slope") {
    return (
      <div className="flex h-full flex-col items-center justify-center font-mono" aria-hidden="true">
        <span className="text-xs text-mist">rise 2 / run 1</span>
        <span className="text-lg text-gold">2</span>
      </div>
    );
  }
  if (id === "fractions") {
    return (
      <div className="flex h-full items-center justify-center px-8" aria-hidden="true">
        <span className="flex h-6 w-full overflow-hidden rounded-md border border-line">
          <span className="w-1/2 bg-gold" />
          <span className="w-1/4 border-l border-line bg-gold" />
          <span className="w-1/4 border-l border-line bg-ink" />
        </span>
      </div>
    );
  }
  if (id === "primes") {
    return (
      <div className="flex h-full items-center justify-center gap-3 font-mono text-xl" aria-hidden="true">
        <span className="text-gold">2</span>
        <span className="text-gold">3</span>
        <span className="text-mist">4</span>
        <span className="text-gold">5</span>
      </div>
    );
  }
  if (id === "vectors") {
    return (
      <div className="flex h-full items-center justify-center gap-3 font-mono" aria-hidden="true">
        <span className="text-gold">(2, 1)</span>
        <span className="text-mist">+</span>
        <span className="text-mint">(1, 2)</span>
      </div>
    );
  }
  if (id === "angles") {
    return (
      <div className="flex h-full items-center justify-center gap-3 font-mono" aria-hidden="true">
        <span className="text-gold">35°</span>
        <span className="text-mist">+</span>
        <span className="text-mint">55°</span>
      </div>
    );
  }
  if (id === "machine") {
    return (
      <div className="flex h-full items-center justify-center gap-2 font-mono" aria-hidden="true">
        <span className="grid size-10 place-items-center rounded-full border border-line text-cream">4</span>
        <span className="text-gold">× 2</span>
        <span className="grid size-10 place-items-center rounded-full border border-mint text-mint">8</span>
      </div>
    );
  }
  if (id === "balance") {
    return (
      <div className="flex h-full items-center justify-center gap-3 font-mono" aria-hidden="true">
        <span className="text-gold">x + 3</span>
        <span className="text-mist">=</span>
        <span className="text-mint">10</span>
      </div>
    );
  }
  if (id === "area") {
    return (
      <div className="flex h-full items-end justify-center gap-2 pb-6" aria-hidden="true">
        <span className="h-10 w-14 border border-gold bg-gold/40" />
        <span className="h-6 w-8 border border-gold bg-gold/40" />
      </div>
    );
  }
  if (id === "motion") {
    return (
      <div className="flex h-full items-center justify-center gap-3 font-mono" aria-hidden="true">
        <span className="text-cream">12 m</span>
        <span className="text-mist">·</span>
        <span className="text-gold">4 m/s</span>
      </div>
    );
  }
  if (id === "grid") {
    return (
      <div className="flex h-full items-center justify-center gap-3 font-mono" aria-hidden="true">
        <span className="text-gold">(0, 0)</span>
        <span className="text-mist">to</span>
        <span className="text-mint">(4, 2)</span>
      </div>
    );
  }
  if (id === "waves") {
    return (
      <svg viewBox="0 0 120 48" className="h-full w-full" aria-hidden="true">
        <path d="M4 28 C 14 8, 26 8, 34 28 S 54 48, 64 28 S 84 8, 94 28 S 114 48, 124 28" className="text-gold" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  if (id === "orbit") {
    return (
      <svg viewBox="0 0 120 48" className="h-full w-full" aria-hidden="true">
        <circle cx="60" cy="24" r="3" className="text-gold" fill="currentColor" />
        <ellipse cx="60" cy="24" rx="28" ry="12" className="text-mint" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }
  return (
    <div className="flex h-full items-center justify-center gap-2 font-mono text-lg text-cream" aria-hidden="true">
      <span>1</span>
      <span>1</span>
      <span>2</span>
      <span>3</span>
      <span>5</span>
      <span className="cabinet-pulse text-gold">?</span>
    </div>
  );
}

function CabinetCard({
  cabinet,
  progress,
  onPlay,
}: {
  cabinet: Cabinet;
  progress: ArcadeProgress;
  onPlay: (id: TrackId) => void;
}) {
  const track = progress.tracks[cabinet.id];
  const mastery = masteryPercent(track.cleared, cabinet.levels);
  const level = highestLevel(track.cleared, cabinet.levels);
  const fresh = isUntouched(track);
  return (
    <button
      type="button"
      onClick={() => onPlay(cabinet.id)}
      className="group flex min-h-44 flex-col overflow-hidden rounded-2xl border border-line bg-panel text-left transition-transform duration-150 ease-out active:scale-[0.96]"
      aria-label={`${cabinet.title}, ${cabinet.band}, best ${track.best}, level ${level} of ${cabinet.levels}, mastery ${mastery} percent${fresh ? ", new" : ""}`}
    >
      <div className="relative h-28 border-b border-line bg-ink">
        <div className="lab-grid absolute inset-0" />
        <Preview id={cabinet.id} />
        {fresh ? (
          <span className="absolute top-2 right-2 rounded-full border border-gold/70 bg-ink px-2 py-1 font-mono text-xs tracking-widest text-gold">
            NEW
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-xs tracking-widest text-gold">{cabinet.kicker}</p>
            <h2 className="mt-1 text-xl font-extrabold tracking-tight">{cabinet.title}</h2>
          </div>
          <span className="rounded-full border border-line px-2 py-1 font-mono text-xs text-mist">{cabinet.band}</span>
        </div>
        <p className="text-sm leading-relaxed text-mist">{cabinet.blurb}</p>
        <div className="flex flex-wrap gap-1">
          {cabinet.subjects.map((subject) => (
            <span key={subject} className="rounded-full bg-ink px-2 py-1 font-mono text-xs tracking-wide text-cream">
              {subject}
            </span>
          ))}
        </div>
        <div>
          <div className="mb-1 flex justify-between font-mono text-xs text-mist">
            <span>mastery {mastery}%</span>
            <span>
              level {level}/{cabinet.levels}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-ink" aria-hidden="true">
            <div className="h-full bg-gold" style={{ width: `${mastery}%` }} />
          </div>
        </div>
        <div className="mt-auto flex justify-between font-mono text-xs text-mist">
          <span>best {track.best > 0 ? track.best : "—"}</span>
          <span>played {formatLastPlayed(track.lastPlayed)}</span>
        </div>
      </div>
    </button>
  );
}

export function Lobby({ progress, onPlay, onLab }: { progress: ArcadeProgress; onPlay: (id: TrackId) => void; onLab: () => void }) {
  const [subject, setSubject] = useState<Subject | "ALL">("ALL");
  const [band, setBand] = useState<Band | "ALL">("ALL");
  const visible = useMemo(() => filterCabinets(subject, band), [subject, band]);
  const cleared = proofsCleared(progress.tracks);

  return (
    <main className="relative flex h-dvh flex-col overflow-hidden bg-ink text-cream">
      <div className="pointer-events-none absolute inset-0 lab-grid opacity-60" aria-hidden="true" />
      <header className="lobby-header relative z-10 shrink-0 border-b border-line px-4 py-4 sm:px-6">
        <p className="lobby-kicker font-mono text-xs tracking-widest text-gold">LABORATORY FLOOR</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <h1 className="lobby-title text-4xl font-extrabold tracking-tight sm:text-5xl">Proof Arcade</h1>
          <p className="font-mono text-xs text-mist">
            {CABINETS.length} stations · {cleared} proofs cleared
          </p>
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <p className="lobby-motto max-w-xl text-sm leading-relaxed text-mist">Same object. Different spelling. Pick a station and play.</p>
          <button type="button" onClick={onLab} className="inline-flex min-h-11 items-center font-mono text-xs tracking-widest text-gold">
            Instrument lab
          </button>
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter by subject">
          <FilterChip pressed={subject === "ALL"} onClick={() => setSubject("ALL")}>
            ALL
          </FilterChip>
          {SUBJECTS.map((item) => (
            <FilterChip key={item} pressed={subject === item} onClick={() => setSubject(item)}>
              {item}
            </FilterChip>
          ))}
        </div>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter by difficulty">
          <FilterChip pressed={band === "ALL"} onClick={() => setBand("ALL")}>
            Any band
          </FilterChip>
          {BANDS.map((item) => (
            <FilterChip key={item} pressed={band === item} onClick={() => setBand(item)}>
              {item}
            </FilterChip>
          ))}
        </div>
      </header>
      <div className="relative z-10 min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <p className="sr-only" aria-live="polite">
          {visible.length} stations shown
        </p>
        {visible.length === 0 ? (
          <div className="mx-auto max-w-md rounded-2xl border border-line bg-panel p-6 text-center">
            <p className="font-mono text-xs tracking-widest text-gold">EMPTY BENCH</p>
            <h2 className="mt-2 text-2xl font-extrabold">Nothing on this bench yet.</h2>
            <p className="mt-2 text-sm text-mist">No station wears both of those labels. Every subject is on the floor. Clear a filter to see it.</p>
            <button
              type="button"
              onClick={() => {
                setSubject("ALL");
                setBand("ALL");
              }}
              className="mt-4 min-h-11 rounded-full bg-gold px-4 text-sm font-extrabold text-ink"
            >
              Show every station
            </button>
          </div>
        ) : (
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-3 sm:grid-cols-2">
            {visible.map((cabinet) => (
              <CabinetCard key={cabinet.id} cabinet={cabinet} progress={progress} onPlay={onPlay} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function FilterChip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={
        pressed
          ? "min-h-11 shrink-0 rounded-full bg-gold px-3 text-xs font-extrabold text-ink"
          : "min-h-11 shrink-0 rounded-full border border-line bg-panel px-3 text-xs font-bold text-mist"
      }
    >
      {children}
    </button>
  );
}
