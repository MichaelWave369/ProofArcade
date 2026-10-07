import { useEffect, useRef, useState, type ReactNode } from "react";
import { Heart, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { LevelGrid } from "@/components/level-grid";
import { ArcadeExit } from "@/components/mode-switch";
import { EQUALS_LEVELS, auditEquals, type EqualsCard } from "@/game/equals/levels";
import { loadProgress, noteClear, noteScore, type TrackProgress } from "@/game/progress";
import { playSfx, resumeAudio, setMuted, unlockAudio } from "@/game/sfx";

const HEARTS = 3;

type Phase = "menu" | "play" | "pause" | "clear" | "done" | "over";

type LiveCard = EqualsCard & { id: number; gone: boolean; bad: boolean };

function shuffle<T>(list: T[]): T[] {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const swap = next[i];
    next[i] = next[j];
    next[j] = swap;
  }
  return next;
}

export function EqualsProof({ active = true, onExit }: { active?: boolean; onExit?: () => void }) {
  const [phase, setPhase] = useState<Phase>("menu");
  const [level, setLevel] = useState(1);
  const [cards, setCards] = useState<LiveCard[]>([]);
  const [hearts, setHearts] = useState(HEARTS);
  const [score, setScore] = useState(0);
  const [levelScore, setLevelScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [blurb, setBlurb] = useState("Pop every card that equals the target.");
  const [bonus, setBonus] = useState(0);
  const [track, setTrack] = useState<TrackProgress>({ best: 0, cleared: 0, scores: [], lastPlayed: 0 });
  const [mute, setMute] = useState(false);
  const [shake, setShake] = useState(false);
  const phaseRef = useRef(phase);
  const activeRef = useRef(active);
  const lockRef = useRef(false);
  const scoreRef = useRef(0);
  const levelScoreRef = useRef(0);
  const heartsRef = useRef(HEARTS);
  const comboRef = useRef(0);
  const cardsRef = useRef<LiveCard[]>([]);
  const levelRef = useRef(1);
  const startedRef = useRef(0);
  const muteRef = useRef(false);
  const mounted = useRef(true);
  phaseRef.current = phase;
  activeRef.current = active;
  muteRef.current = mute;

  const syncCards = (next: LiveCard[]) => {
    cardsRef.current = next;
    setCards(next);
  };

  const begin = (nextLevel: number, keepScore: number) => {
    const spec = EQUALS_LEVELS[nextLevel - 1];
    if (!spec) {
      setPhase("done");
      phaseRef.current = "done";
      return;
    }
    const dealt = shuffle(spec.cards).map((card, index) => ({ ...card, id: index + 1, gone: false, bad: false }));
    levelRef.current = nextLevel;
    setLevel(nextLevel);
    syncCards(dealt);
    heartsRef.current = HEARTS;
    setHearts(HEARTS);
    scoreRef.current = keepScore;
    setScore(keepScore);
    levelScoreRef.current = 0;
    setLevelScore(0);
    comboRef.current = 0;
    setCombo(0);
    setBonus(0);
    setBlurb(spec.blurb);
    startedRef.current = performance.now();
    lockRef.current = false;
    setPhase("play");
    phaseRef.current = "play";
  };

  const finishLevel = () => {
    lockRef.current = true;
    const spec = EQUALS_LEVELS[levelRef.current - 1];
    const elapsed = (performance.now() - startedRef.current) / 1000;
    const timeBonus = Math.max(0, Math.round((spec.par - elapsed) * 12));
    const clearBonus = 120 * spec.id;
    const gained = timeBonus + clearBonus;
    const nextLevelScore = levelScoreRef.current + gained;
    const nextRun = scoreRef.current + gained;
    levelScoreRef.current = nextLevelScore;
    scoreRef.current = nextRun;
    setLevelScore(nextLevelScore);
    setScore(nextRun);
    setBonus(gained);
    setTrack(noteClear("equals", spec.id, nextLevelScore, nextRun));
    playSfx("wave");
    if (spec.id >= EQUALS_LEVELS.length) {
      setPhase("done");
      phaseRef.current = "done";
      return;
    }
    setPhase("clear");
    phaseRef.current = "clear";
  };

  const pop = (id: number) => {
    if (lockRef.current || phaseRef.current !== "play") return;
    const card = cardsRef.current.find((item) => item.id === id);
    if (!card || card.gone) return;
    unlockAudio();
    if (card.match) {
      comboRef.current += 1;
      const gained = 100 * comboRef.current;
      levelScoreRef.current += gained;
      scoreRef.current += gained;
      setCombo(comboRef.current);
      setLevelScore(levelScoreRef.current);
      setScore(scoreRef.current);
      const next = cardsRef.current.map((item) => (item.id === id ? { ...item, gone: true } : item));
      syncCards(next);
      setBlurb(card.blurb);
      playSfx("pop", 1 + Math.min(0.35, (comboRef.current - 1) * 0.08));
      if (next.every((item) => !item.match || item.gone)) finishLevel();
      return;
    }
    comboRef.current = 0;
    setCombo(0);
    heartsRef.current -= 1;
    setHearts(heartsRef.current);
    syncCards(cardsRef.current.map((item) => (item.id === id ? { ...item, bad: true } : item)));
    setBlurb(card.blurb);
    playSfx("over");
    setShake(true);
    window.setTimeout(() => {
      if (mounted.current) setShake(false);
    }, 180);
    if (heartsRef.current <= 0) {
      lockRef.current = true;
      setTrack(noteScore("equals", scoreRef.current));
      setPhase("over");
      phaseRef.current = "over";
    }
  };

  useEffect(() => {
    mounted.current = true;
    const progress = loadProgress();
    setTrack(progress.tracks.equals);
    const errors = auditEquals();
    if (errors.length) console.error("Equals audit", errors);
    const onVis = () => {
      if (document.visibilityState === "visible") resumeAudio();
    };
    const onKey = (e: KeyboardEvent) => {
      if (!activeRef.current) return;
      if (e.code === "Escape") {
        if (phaseRef.current === "play") {
          setPhase("pause");
          phaseRef.current = "pause";
        } else if (phaseRef.current === "pause") {
          setPhase("play");
          phaseRef.current = "play";
        }
        return;
      }
      if (e.code === "KeyM") {
        const next = !muteRef.current;
        muteRef.current = next;
        setMute(next);
        setMuted(next);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("keydown", onKey);
    return () => {
      mounted.current = false;
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (active) setMuted(muteRef.current);
  }, [active]);

  const spec = EQUALS_LEVELS[level - 1] ?? EQUALS_LEVELS[0];
  const continueLevel = Math.min(EQUALS_LEVELS.length, track.cleared + 1);

  return (
    <main className="relative flex h-dvh flex-col overflow-hidden bg-ink text-cream">
      <header className="flex shrink-0 flex-col gap-2 border-b border-line px-3 py-2 sm:px-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-gold/50 bg-panel font-mono text-lg text-gold">=</span>
            <div className="min-w-0">
              <h1 className="truncate text-base font-extrabold leading-none tracking-tight sm:text-lg">Equals</h1>
              <p className="mt-1 font-mono text-xs text-mist">
                {phase === "menu" ? "Same value, any form" : `Level ${level} / ${EQUALS_LEVELS.length}`}
                {combo >= 2 && phase === "play" ? <span className="ml-2 text-gold">×{combo}</span> : null}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`text-right ${phase === "menu" ? "max-sm:hidden" : ""}`}>
              <div className="font-mono text-xl leading-none font-semibold text-gold tabular-nums">{score}</div>
              <div className="mt-1 font-mono text-xs text-mist tabular-nums">best {Math.max(track.best, score)}</div>
            </div>
            {onExit ? <ArcadeExit onExit={onExit} /> : null}
            <button
              type="button"
              onClick={() => {
                unlockAudio();
                const next = !mute;
                setMute(next);
                muteRef.current = next;
                setMuted(next);
              }}
              className="grid size-11 place-items-center rounded-full border border-line bg-panel"
              aria-label={mute ? "Unmute" : "Mute"}
            >
              {mute ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            </button>
            {phase === "play" || phase === "pause" ? (
              <button
                type="button"
                onClick={() => {
                  const next = phase === "pause" ? "play" : "pause";
                  setPhase(next);
                  phaseRef.current = next;
                }}
                className="grid size-11 place-items-center rounded-full border border-line bg-panel"
                aria-label={phase === "pause" ? "Resume" : "Pause"}
              >
                {phase === "pause" ? <Play className="size-4" /> : <Pause className="size-4" />}
              </button>
            ) : null}
          </div>
        </div>
      </header>

      {phase === "menu" ? (
        <div className="flex flex-1 items-center justify-center overflow-y-auto p-4">
          <div className="w-full max-w-md rounded-2xl border border-line bg-panel/90 p-6 shadow-2xl">
            <p className="font-mono text-xs tracking-widest text-gold">SAME VALUE</p>
            <h2 className="mt-2 text-4xl font-extrabold tracking-tight">Pop the equals.</h2>
            <p className="mt-3 text-sm leading-relaxed text-mist">
              A target sits at the top. Tap every card that really equals it. A wrong card costs a heart. Sixteen levels, and the best score sticks.
            </p>
            <p className="mt-4 font-mono text-xs text-mist">
              Cleared {track.cleared} / {EQUALS_LEVELS.length}
              {track.best > 0 ? ` · best ${track.best}` : ""}
            </p>
            <button
              type="button"
              onClick={() => {
                unlockAudio();
                begin(continueLevel, 0);
              }}
              className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold text-base font-extrabold text-ink"
            >
              <Play className="size-4" />
              {track.cleared > 0 ? `Continue · ${continueLevel}` : "Play"}
            </button>
            <div className="mt-3">
              <LevelGrid
                count={EQUALS_LEVELS.length}
                cleared={track.cleared}
                scores={track.scores}
                onPlay={(n) => {
                  unlockAudio();
                  begin(n, 0);
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="mx-auto w-full max-w-lg px-3 pt-3">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="font-mono text-xs tracking-widest text-mist">TARGET</p>
                <p className="font-mono text-4xl leading-none text-gold">{spec.target}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-xs text-mist">this level {levelScore}</p>
                <div className="mt-1 flex justify-end gap-1" aria-label={`${hearts} hearts left`}>
                  {Array.from({ length: HEARTS }, (_, i) => (
                    <Heart key={i} className={i < hearts ? "size-4 text-danger" : "size-4 text-line"} fill={i < hearts ? "currentColor" : "none"} />
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-2 text-sm text-mist">
              {spec.title}. {spec.blurb}
            </p>
          </div>
          <div className={`mx-auto min-h-0 w-full max-w-lg flex-1 overflow-y-auto px-3 py-3 ${shake ? "lattice-shake" : ""}`}>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {cards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  disabled={card.gone || phase !== "play"}
                  onClick={() => pop(card.id)}
                  className={`flex min-h-16 flex-col items-center justify-center rounded-xl border px-2 py-2 font-mono ${
                    card.gone ? "border-line bg-ink opacity-30" : card.bad ? "border-danger bg-panel-2" : "border-line bg-panel-2"
                  }`}
                >
                  <span className="text-lg leading-tight text-cream">{card.a}</span>
                  {card.b ? <span className="text-xs text-gold-soft">{card.b}</span> : null}
                </button>
              ))}
            </div>
          </div>
          <p aria-live="polite" className="mx-auto min-h-12 w-full max-w-lg px-4 pb-3 text-center text-sm leading-relaxed text-mist">
            {blurb}
          </p>
        </div>
      )}

      {phase === "pause" ? (
        <Overlay kicker="Paused" title="The cards can wait." body="Hearts and score stay put.">
          <button
            type="button"
            onClick={() => {
              setPhase("play");
              phaseRef.current = "play";
            }}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold font-extrabold text-ink"
          >
            <Play className="size-4" />
            Resume
          </button>
          <button
            type="button"
            onClick={() => {
              setTrack(noteScore("equals", scoreRef.current));
              setPhase("menu");
              phaseRef.current = "menu";
            }}
            className="mt-2 min-h-11 w-full rounded-xl border border-line font-bold"
          >
            Menu
          </button>
        </Overlay>
      ) : null}

      {phase === "clear" ? (
        <Overlay kicker={`Level ${level} clear`} title="Those were equal." body={`Clear bonus ${bonus}. This level ${levelScore}. Run ${score}.`}>
          <button
            type="button"
            onClick={() => begin(level + 1, scoreRef.current)}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold font-extrabold text-ink"
          >
            <Play className="size-4" />
            Next level
          </button>
        </Overlay>
      ) : null}

      {phase === "done" ? (
        <Overlay kicker="Book closed" title="Every value accounted for." body={`Score ${score}. Best ${Math.max(track.best, score)}. Replay any level from the menu.`}>
          <button
            type="button"
            onClick={() => {
              setPhase("menu");
              phaseRef.current = "menu";
            }}
            className="min-h-12 w-full rounded-xl bg-gold font-extrabold text-ink"
          >
            Level select
          </button>
        </Overlay>
      ) : null}

      {phase === "over" ? (
        <Overlay kicker={score >= track.best ? "Best run" : "Out of hearts"} title="That one was not equal." body={`Score ${score} · level ${level}. ${blurb}`}>
          <button
            type="button"
            onClick={() => begin(level, 0)}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold font-extrabold text-ink"
          >
            <RotateCcw className="size-4" />
            Retry level
          </button>
          <button
            type="button"
            onClick={() => {
              setPhase("menu");
              phaseRef.current = "menu";
            }}
            className="mt-2 min-h-11 w-full rounded-xl border border-line font-bold"
          >
            Menu
          </button>
        </Overlay>
      ) : null}
    </main>
  );
}

function Overlay({ kicker, title, body, children }: { kicker: string; title: string; body: string; children: ReactNode }) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-ink/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-panel p-6">
        <p className="font-mono text-xs tracking-widest text-gold">{kicker}</p>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight">{title}</h2>
        <p className="mt-2 text-sm text-mist">{body}</p>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
