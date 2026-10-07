import { useEffect, useRef, useState, type ReactNode } from "react";
import { Heart, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { LevelGrid } from "@/components/level-grid";
import { ArcadeExit } from "@/components/mode-switch";
import { loadProgress, noteClear, noteScore, type TrackId, type TrackProgress } from "@/game/progress";
import { playSfx, resumeAudio, setMuted, unlockAudio } from "@/game/sfx";

const HEARTS = 3;

type Phase = "menu" | "play" | "pause" | "clear" | "done" | "over";

export type ChoicePrompt = {
  kicker: string;
  ask: string;
  choices: readonly [string, string, string, string];
  answer: string;
  blurb: string;
};

export type ChoiceLevel<T extends ChoicePrompt> = {
  id: number;
  title: string;
  prompts: T[];
};

function shuffle<T>(list: readonly T[]): T[] {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const swap = next[i];
    next[i] = next[j];
    next[j] = swap;
  }
  return next;
}

export function RoundProof<T extends ChoicePrompt>({
  active = true,
  onExit,
  track,
  mark,
  title,
  menuKicker,
  menuTitle,
  menuBody,
  levels,
  renderScene,
  audit,
}: {
  active?: boolean;
  onExit?: () => void;
  track: TrackId;
  mark: string;
  title: string;
  menuKicker: string;
  menuTitle: string;
  menuBody: string;
  levels: ChoiceLevel<T>[];
  renderScene: (prompt: T) => ReactNode;
  audit: () => string[];
}) {
  const [phase, setPhase] = useState<Phase>("menu");
  const [level, setLevel] = useState(1);
  const [promptIndex, setPromptIndex] = useState(0);
  const [choices, setChoices] = useState<string[]>([]);
  const [hearts, setHearts] = useState(HEARTS);
  const [score, setScore] = useState(0);
  const [levelScore, setLevelScore] = useState(0);
  const [blurb, setBlurb] = useState(menuBody);
  const [bonus, setBonus] = useState(0);
  const [saved, setSaved] = useState<TrackProgress>({ best: 0, cleared: 0, scores: [], lastPlayed: 0 });
  const [mute, setMute] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const phaseRef = useRef(phase);
  const activeRef = useRef(active);
  const lockRef = useRef(false);
  const scoreRef = useRef(0);
  const levelScoreRef = useRef(0);
  const heartsRef = useRef(HEARTS);
  const levelRef = useRef(1);
  const promptRef = useRef(0);
  const missesRef = useRef(0);
  const startedRef = useRef(0);
  const muteRef = useRef(false);
  const choicesRef = useRef<string[]>([]);
  const mounted = useRef(true);
  phaseRef.current = phase;
  activeRef.current = active;
  muteRef.current = mute;
  choicesRef.current = choices;

  const showPrompt = (nextLevel: number, index: number) => {
    const prompt = levels[nextLevel - 1]?.prompts[index];
    if (!prompt) return;
    const nextChoices = shuffle(prompt.choices);
    choicesRef.current = nextChoices;
    setChoices(nextChoices);
    setPicked(null);
    setPromptIndex(index);
    promptRef.current = index;
    startedRef.current = performance.now();
    lockRef.current = false;
  };

  const begin = (nextLevel: number, keepScore: number) => {
    const spec = levels[nextLevel - 1];
    if (!spec) {
      setPhase("done");
      phaseRef.current = "done";
      return;
    }
    levelRef.current = nextLevel;
    setLevel(nextLevel);
    heartsRef.current = HEARTS;
    setHearts(HEARTS);
    scoreRef.current = keepScore;
    setScore(keepScore);
    levelScoreRef.current = 0;
    setLevelScore(0);
    missesRef.current = 0;
    setBonus(0);
    setBlurb(spec.prompts[0].ask);
    setPhase("play");
    phaseRef.current = "play";
    showPrompt(nextLevel, 0);
  };

  const finishLevel = () => {
    lockRef.current = true;
    const spec = levels[levelRef.current - 1];
    const clearBonus = missesRef.current === 0 ? 180 * spec.id : 80 * spec.id;
    const nextLevelScore = levelScoreRef.current + clearBonus;
    const nextRun = scoreRef.current + clearBonus;
    levelScoreRef.current = nextLevelScore;
    scoreRef.current = nextRun;
    setLevelScore(nextLevelScore);
    setScore(nextRun);
    setBonus(clearBonus);
    setSaved(noteClear(track, spec.id, nextLevelScore, nextRun));
    playSfx("wave");
    if (spec.id >= levels.length) {
      setPhase("done");
      phaseRef.current = "done";
      return;
    }
    setPhase("clear");
    phaseRef.current = "clear";
  };

  const chooseRef = useRef<(choice: string) => void>(() => {});
  chooseRef.current = (choice: string) => {
    if (lockRef.current || phaseRef.current !== "play") return;
    const spec = levels[levelRef.current - 1];
    const prompt = spec?.prompts[promptRef.current];
    if (!prompt) return;
    unlockAudio();
    lockRef.current = true;
    setPicked(choice);
    const elapsed = (performance.now() - startedRef.current) / 1000;
    if (choice === prompt.answer) {
      const gained = 150 + Math.max(0, Math.round((8 - elapsed) * 8));
      levelScoreRef.current += gained;
      scoreRef.current += gained;
      setLevelScore(levelScoreRef.current);
      setScore(scoreRef.current);
      setBlurb(prompt.blurb);
      playSfx("pop");
    } else {
      missesRef.current += 1;
      heartsRef.current -= 1;
      setHearts(heartsRef.current);
      setBlurb(prompt.blurb);
      playSfx("over");
      setShake(true);
      window.setTimeout(() => {
        if (mounted.current) setShake(false);
      }, 180);
      if (heartsRef.current <= 0) {
        setSaved(noteScore(track, scoreRef.current));
        window.setTimeout(() => {
          if (!mounted.current) return;
          setPhase("over");
          phaseRef.current = "over";
        }, 720);
        return;
      }
    }
    const nextIndex = promptRef.current + 1;
    window.setTimeout(() => {
      if (!mounted.current) return;
      if (phaseRef.current === "over" || phaseRef.current === "menu") return;
      if (nextIndex >= spec.prompts.length) {
        finishLevel();
        return;
      }
      setBlurb(spec.prompts[nextIndex].ask);
      showPrompt(levelRef.current, nextIndex);
    }, 720);
  };

  useEffect(() => {
    mounted.current = true;
    const progress = loadProgress();
    setSaved(progress.tracks[track]);
    const errors = audit();
    if (errors.length) console.error(`${title} audit`, errors);
    const onVis = () => {
      if (document.visibilityState === "visible") resumeAudio();
    };
    const onKey = (e: KeyboardEvent) => {
      if (!activeRef.current) return;
      if (e.code === "Escape") {
        if (phaseRef.current === "play" && !lockRef.current) {
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
        return;
      }
      if (phaseRef.current !== "play") return;
      const digit = e.code.startsWith("Digit") ? Number(e.code.slice(5)) : e.code.startsWith("Numpad") ? Number(e.code.slice(6)) : 0;
      if (digit >= 1 && digit <= choicesRef.current.length) chooseRef.current(choicesRef.current[digit - 1]);
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("keydown", onKey);
    return () => {
      mounted.current = false;
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("keydown", onKey);
    };
  }, [audit, title, track]);

  useEffect(() => {
    if (active) setMuted(muteRef.current);
  }, [active]);

  const spec = levels[level - 1] ?? levels[0];
  const prompt = spec.prompts[promptIndex] ?? spec.prompts[0];
  const continueLevel = Math.min(levels.length, saved.cleared + 1);

  return (
    <main className="relative flex h-dvh flex-col overflow-hidden bg-ink text-cream">
      <header className="flex shrink-0 flex-col gap-2 border-b border-line px-3 py-2 sm:px-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-gold/50 bg-panel font-mono text-lg text-gold">{mark}</span>
            <div className="min-w-0">
              <h1 className="truncate text-base font-extrabold leading-none tracking-tight sm:text-lg">{title}</h1>
              <p className="mt-1 font-mono text-xs text-mist">{phase === "menu" ? menuKicker : `Level ${level} / ${levels.length}`}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`text-right ${phase === "menu" ? "max-sm:hidden" : ""}`}>
              <div className="font-mono text-xl leading-none font-semibold text-gold tabular-nums">{score}</div>
              <div className="mt-1 font-mono text-xs text-mist tabular-nums">best {Math.max(saved.best, score)}</div>
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
                  if (phase === "play" && lockRef.current) return;
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
            <p className="font-mono text-xs tracking-widest text-gold">{menuKicker}</p>
            <h2 className="mt-2 text-4xl font-extrabold tracking-tight">{menuTitle}</h2>
            <p className="mt-3 text-sm leading-relaxed text-mist">{menuBody}</p>
            <p className="mt-4 font-mono text-xs text-mist">
              Cleared {saved.cleared} / {levels.length}
              {saved.best > 0 ? ` · best ${saved.best}` : ""}
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
              {saved.cleared > 0 ? `Continue · ${continueLevel}` : "Play"}
            </button>
            <div className="mt-3">
              <LevelGrid
                count={levels.length}
                cleared={saved.cleared}
                scores={saved.scores}
                onPlay={(n) => {
                  unlockAudio();
                  begin(n, 0);
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className={`flex min-h-0 flex-1 flex-col ${shake ? "lattice-shake" : ""}`}>
          <div className="mx-auto flex w-full max-w-lg items-end justify-between gap-3 px-3 pt-3">
            <p className="font-mono text-xs tracking-widest text-mist">
              {spec.title} · {promptIndex + 1}/{spec.prompts.length}
            </p>
            <div className="text-right">
              <p className="font-mono text-xs text-mist">this level {levelScore}</p>
              <div className="mt-1 flex justify-end gap-1" aria-label={`${hearts} hearts left`}>
                {Array.from({ length: HEARTS }, (_, i) => (
                  <Heart key={i} className={i < hearts ? "size-4 text-danger" : "size-4 text-line"} fill={i < hearts ? "currentColor" : "none"} />
                ))}
              </div>
            </div>
          </div>
          <div className="mx-auto min-h-0 w-full max-w-lg flex-1 overflow-y-auto">
            <div className="flex min-h-full flex-col justify-center px-3 py-3">
              <p className="text-center font-mono text-xs tracking-widest text-gold">{prompt.kicker}</p>
              <div className="mt-3">{renderScene(prompt)}</div>
              <p className="mt-3 text-center text-lg font-extrabold leading-snug tracking-tight">{prompt.ask}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {choices.map((choice, choiceIndex) => {
                  const correct = choice === prompt.answer;
                  const shown = picked != null;
                  return (
                    <button
                      key={choice}
                      type="button"
                      disabled={phase !== "play" || shown}
                      onClick={() => chooseRef.current(choice)}
                      className={`flex min-h-16 flex-col items-center justify-center rounded-xl border px-2 ${
                        !shown ? "border-line bg-panel-2" : correct ? "border-gold bg-panel" : picked === choice ? "border-danger bg-panel" : "border-line bg-ink opacity-60"
                      }`}
                    >
                      <span className="font-mono text-xs text-mist">{choiceIndex + 1}</span>
                      <span className="font-mono text-lg text-cream">{choice}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <p aria-live="polite" className="mx-auto min-h-12 w-full max-w-lg px-4 pb-3 text-center text-sm leading-relaxed text-mist">
            {blurb}
          </p>
        </div>
      )}

      {phase === "pause" ? (
        <Overlay kicker="Paused" title="The board can wait." body="Hearts and score stay put.">
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
              setSaved(noteScore(track, scoreRef.current));
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
        <Overlay kicker={`Level ${level} clear`} title="That one holds." body={`Clear bonus ${bonus}. This level ${levelScore}. Run ${score}.`}>
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
        <Overlay kicker="Book closed" title="The run is finished." body={`Score ${score}. Best ${Math.max(saved.best, score)}. Replay any level from the menu.`}>
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
        <Overlay kicker={score >= saved.best ? "Best run" : "Out of hearts"} title="Not that one." body={`Score ${score} · level ${level}. ${blurb}`}>
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
