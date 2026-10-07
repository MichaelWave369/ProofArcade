import { useEffect, useRef, useState, type ReactNode } from "react";
import { Heart, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { LevelGrid } from "@/components/level-grid";
import { ArcadeExit } from "@/components/mode-switch";
import { loadProgress, noteClear, noteScore, type TrackProgress } from "@/game/progress";
import { RUN_LEVELS, auditRun } from "@/game/run/levels";
import { playSfx, resumeAudio, setMuted, unlockAudio } from "@/game/sfx";

const HEARTS = 3;

type Phase = "menu" | "play" | "pause" | "clear" | "done" | "over";

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

export function SequenceProof({ active = true, onExit }: { active?: boolean; onExit?: () => void }) {
  const [phase, setPhase] = useState<Phase>("menu");
  const [level, setLevel] = useState(1);
  const [promptIndex, setPromptIndex] = useState(0);
  const [choices, setChoices] = useState<string[]>([]);
  const [hearts, setHearts] = useState(HEARTS);
  const [score, setScore] = useState(0);
  const [levelScore, setLevelScore] = useState(0);
  const [corrects, setCorrects] = useState(0);
  const [blurb, setBlurb] = useState("Fill the blank. Three prompts, three hearts.");
  const [bonus, setBonus] = useState(0);
  const [track, setTrack] = useState<TrackProgress>({ best: 0, cleared: 0, scores: [], lastPlayed: 0 });
  const [mute, setMute] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const phaseRef = useRef(phase);
  const activeRef = useRef(active);
  const lockRef = useRef(false);
  const scoreRef = useRef(0);
  const levelScoreRef = useRef(0);
  const heartsRef = useRef(HEARTS);
  const levelRef = useRef(1);
  const promptRef = useRef(0);
  const correctsRef = useRef(0);
  const startedRef = useRef(0);
  const muteRef = useRef(false);
  const choicesRef = useRef<string[]>([]);
  const mounted = useRef(true);
  phaseRef.current = phase;
  activeRef.current = active;
  muteRef.current = mute;
  choicesRef.current = choices;

  const showPrompt = (nextLevel: number, index: number) => {
    const prompt = RUN_LEVELS[nextLevel - 1]?.prompts[index];
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
    const spec = RUN_LEVELS[nextLevel - 1];
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
    correctsRef.current = 0;
    setCorrects(0);
    setBonus(0);
    setBlurb(spec.prompts[0].rule);
    setPhase("play");
    phaseRef.current = "play";
    showPrompt(nextLevel, 0);
  };

  const finishLevel = () => {
    lockRef.current = true;
    const spec = RUN_LEVELS[levelRef.current - 1];
    const clearBonus = correctsRef.current === spec.prompts.length ? 200 * spec.id : 80 * spec.id;
    const nextLevelScore = levelScoreRef.current + clearBonus;
    const nextRun = scoreRef.current + clearBonus;
    levelScoreRef.current = nextLevelScore;
    scoreRef.current = nextRun;
    setLevelScore(nextLevelScore);
    setScore(nextRun);
    setBonus(clearBonus);
    setTrack(noteClear("run", spec.id, nextLevelScore, nextRun));
    playSfx("wave");
    if (spec.id >= RUN_LEVELS.length) {
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
    const spec = RUN_LEVELS[levelRef.current - 1];
    const prompt = spec?.prompts[promptRef.current];
    if (!prompt) return;
    unlockAudio();
    lockRef.current = true;
    setPicked(choice);
    const elapsed = (performance.now() - startedRef.current) / 1000;
    if (choice === prompt.answer) {
      const gained = 160 + Math.max(0, Math.round((8 - elapsed) * 10));
      levelScoreRef.current += gained;
      scoreRef.current += gained;
      correctsRef.current += 1;
      setLevelScore(levelScoreRef.current);
      setScore(scoreRef.current);
      setCorrects(correctsRef.current);
      setBlurb(prompt.blurb);
      playSfx("pop");
    } else {
      heartsRef.current -= 1;
      setHearts(heartsRef.current);
      setBlurb(`${prompt.blurb} You picked ${choice}.`);
      playSfx("over");
      if (heartsRef.current <= 0) {
        setTrack(noteScore("run", scoreRef.current));
        window.setTimeout(() => {
          if (!mounted.current) return;
          setPhase("over");
          phaseRef.current = "over";
        }, 700);
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
      setBlurb(spec.prompts[nextIndex].rule);
      showPrompt(levelRef.current, nextIndex);
    }, 700);
  };

  useEffect(() => {
    mounted.current = true;
    const progress = loadProgress();
    setTrack(progress.tracks.run);
    const errors = auditRun();
    if (errors.length) console.error("Sequence audit", errors);
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
          startedRef.current = performance.now();
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
      if (phaseRef.current !== "play" || lockRef.current) return;
      const index = ["Digit1", "Digit2", "Digit3", "Digit4"].indexOf(e.code);
      if (index < 0) return;
      const choice = choicesRef.current[index];
      if (!choice) return;
      e.preventDefault();
      chooseRef.current(choice);
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

  const spec = RUN_LEVELS[level - 1] ?? RUN_LEVELS[0];
  const prompt = spec.prompts[promptIndex] ?? spec.prompts[0];
  const continueLevel = Math.min(RUN_LEVELS.length, track.cleared + 1);

  return (
    <main className="relative flex h-dvh flex-col overflow-hidden bg-ink text-cream">
      <header className="flex shrink-0 flex-col gap-2 border-b border-line px-3 py-2 sm:px-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-gold/50 bg-panel font-mono text-sm font-extrabold text-gold">+1</span>
            <div className="min-w-0">
              <h1 className="truncate text-base font-extrabold leading-none tracking-tight sm:text-lg">Sequence</h1>
              <p className="mt-1 font-mono text-xs text-mist">
                {phase === "menu" ? "Name the missing term" : `Level ${level} / ${RUN_LEVELS.length}`}
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
                  if (phase === "play" && lockRef.current) return;
                  const next = phase === "pause" ? "play" : "pause";
                  setPhase(next);
                  phaseRef.current = next;
                  if (next === "play") startedRef.current = performance.now();
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
            <p className="font-mono text-xs tracking-widest text-gold">NEXT TERM</p>
            <h2 className="mt-2 text-4xl font-extrabold tracking-tight">Finish the run.</h2>
            <p className="mt-3 text-sm leading-relaxed text-mist">
              Squares, primes, motion, factorials. Each level is three blanks. A wrong term costs a heart. Faster answers score more. Keys 1 to 4 pick an answer.
            </p>
            <p className="mt-4 font-mono text-xs text-mist">
              Cleared {track.cleared} / {RUN_LEVELS.length}
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
                count={RUN_LEVELS.length}
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
          <div className="mx-auto w-full max-w-lg px-4 pt-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-xs tracking-widest text-gold">{prompt.rule}</p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-mist">
                  {promptIndex + 1}/3 · {levelScore}
                </span>
                <span className="flex gap-1" aria-label={`${hearts} hearts left`}>
                  {Array.from({ length: HEARTS }, (_, i) => (
                    <Heart key={i} className={i < hearts ? "size-4 text-danger" : "size-4 text-line"} fill={i < hearts ? "currentColor" : "none"} />
                  ))}
                </span>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {prompt.terms.map((term, index) =>
                term === null ? (
                  <span
                    key={`blank-${index}`}
                    className="grid h-14 min-w-16 place-items-center rounded-xl border border-dashed border-gold bg-ink px-3 font-mono text-xl text-gold"
                  >
                    {picked ?? "?"}
                  </span>
                ) : (
                  <span key={`${term}-${index}`} className="grid h-14 min-w-14 place-items-center rounded-xl border border-line bg-panel-2 px-3 font-mono text-xl">
                    {term}
                  </span>
                ),
              )}
            </div>
          </div>
          <div className="mx-auto mt-auto grid w-full max-w-lg grid-cols-2 gap-2 px-4 pt-6 pb-4">
            {choices.map((choice, index) => {
              const right = picked !== null && choice === prompt.answer;
              const wrong = picked === choice && choice !== prompt.answer;
              return (
                <button
                  key={choice}
                  type="button"
                  disabled={phase !== "play" || picked !== null}
                  onClick={() => chooseRef.current(choice)}
                  className={`flex min-h-14 flex-col items-center justify-center rounded-xl border font-mono text-lg font-bold ${
                    right ? "border-gold bg-gold text-ink" : wrong ? "border-danger text-danger" : "border-line bg-panel-2 text-cream"
                  }`}
                >
                  <span className="text-xs opacity-70">{index + 1}</span>
                  {choice}
                </button>
              );
            })}
          </div>
          <p aria-live="polite" className="mx-auto min-h-12 w-full max-w-lg px-4 pb-4 text-center text-sm leading-relaxed text-mist">
            {blurb}
          </p>
        </div>
      )}

      {phase === "pause" ? (
        <Overlay kicker="Paused" title="The sequence holds." body="The blank is still yours.">
          <button
            type="button"
            onClick={() => {
              setPhase("play");
              phaseRef.current = "play";
              startedRef.current = performance.now();
            }}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold font-extrabold text-ink"
          >
            <Play className="size-4" />
            Resume
          </button>
          <button
            type="button"
            onClick={() => {
              setTrack(noteScore("run", scoreRef.current));
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
        <Overlay
          kicker={`Level ${level} clear`}
          title={corrects === 3 ? "Clean run." : "The pattern held."}
          body={`Bonus ${bonus}. This level ${levelScore}. Run ${score}.`}
        >
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
        <Overlay kicker="Book closed" title="Every term named." body={`Score ${score}. Best ${Math.max(track.best, score)}.`}>
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
        <Overlay kicker={score >= track.best ? "Best run" : "Hearts gone"} title="The run broke." body={`Score ${score} · level ${level}. ${blurb}`}>
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
