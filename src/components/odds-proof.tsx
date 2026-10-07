import { useEffect, useRef, useState, type ReactNode } from "react";
import { Heart, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { LevelGrid } from "@/components/level-grid";
import { ArcadeExit } from "@/components/mode-switch";
import { ODDS_LEVELS, auditOdds, sumPairs, type Bead, type OddsModel } from "@/game/odds/levels";
import { loadProgress, noteClear, noteScore, type TrackProgress } from "@/game/progress";
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

function beadClass(bead: Bead, dim: boolean) {
  const tone = bead === "gold" ? "border-gold bg-gold" : bead === "mint" ? "border-mint bg-mint" : "border-mist bg-mist";
  return `size-6 rounded-full border ${tone} ${dim ? "opacity-30" : ""}`;
}

function Jar({ beads, gone = -1 }: { beads: Bead[]; gone?: number }) {
  return (
    <div className="mx-auto flex min-h-24 w-full max-w-xs flex-wrap content-center justify-center gap-2 rounded-2xl border border-line bg-ink px-3 py-3">
      {beads.map((bead, index) => (
        <span key={`${bead}-${index}`} className={beadClass(bead, index === gone)} />
      ))}
    </div>
  );
}

function Scene({ model }: { model: OddsModel }) {
  if (model.type === "bag" || model.type === "bag-not") return <Jar beads={model.beads} />;
  if (model.type === "after") return <Jar beads={model.beads} gone={model.beads.indexOf(model.take)} />;
  if (model.type === "compare") {
    return (
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="mb-1 text-center font-mono text-xs text-mist">Left</p>
          <Jar beads={model.left} />
        </div>
        <div>
          <p className="mb-1 text-center font-mono text-xs text-mist">Right</p>
          <Jar beads={model.right} />
        </div>
      </div>
    );
  }
  if (model.type === "die") {
    return (
      <div className="mx-auto grid w-full max-w-xs grid-cols-6 gap-1">
        {[1, 2, 3, 4, 5, 6].map((face) => {
          const on = model.faces.includes(face);
          return (
            <span
              key={face}
              className={`grid h-12 place-items-center rounded-lg border font-mono text-sm ${on ? "border-gold bg-gold text-ink" : "border-line bg-ink text-mist"}`}
            >
              {face}
            </span>
          );
        })}
      </div>
    );
  }
  if (model.type === "sum") {
    const pairs = sumPairs(model.total);
    return (
      <div className="mx-auto flex max-w-xs flex-wrap justify-center gap-2">
        {pairs.map((pair) => (
          <span key={pair} className="rounded-lg border border-gold/60 bg-ink px-2 py-2 font-mono text-sm text-gold">
            {pair}
          </span>
        ))}
      </div>
    );
  }
  if (model.type === "and") {
    return (
      <div className="flex items-center justify-center gap-3 font-mono text-3xl text-cream">
        <span>{model.a}</span>
        <span className="text-gold">×</span>
        <span>{model.b}</span>
      </div>
    );
  }
  const count = model.type === "fixed" ? 1 : model.n;
  return (
    <div className="flex flex-col items-center gap-2">
      {model.type === "fixed" && model.streak ? (
        <p className="font-mono text-sm tracking-widest text-mist">{Array.from({ length: model.streak }, () => "H").join(" ")}</p>
      ) : null}
      <div className="flex justify-center gap-2">
        {Array.from({ length: count }, (_, index) => (
          <span key={index} className="grid size-12 place-items-center rounded-full border border-gold bg-panel font-mono text-sm text-gold">
            ?
          </span>
        ))}
      </div>
    </div>
  );
}

export function OddsProof({ active = true, onExit }: { active?: boolean; onExit?: () => void }) {
  const [phase, setPhase] = useState<Phase>("menu");
  const [level, setLevel] = useState(1);
  const [promptIndex, setPromptIndex] = useState(0);
  const [choices, setChoices] = useState<string[]>([]);
  const [hearts, setHearts] = useState(HEARTS);
  const [score, setScore] = useState(0);
  const [levelScore, setLevelScore] = useState(0);
  const [blurb, setBlurb] = useState("Count the ways. Pick the chance.");
  const [bonus, setBonus] = useState(0);
  const [track, setTrack] = useState<TrackProgress>({ best: 0, cleared: 0, scores: [], lastPlayed: 0 });
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
    const prompt = ODDS_LEVELS[nextLevel - 1]?.prompts[index];
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
    const spec = ODDS_LEVELS[nextLevel - 1];
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
    const spec = ODDS_LEVELS[levelRef.current - 1];
    const clearBonus = missesRef.current === 0 ? 180 * spec.id : 80 * spec.id;
    const nextLevelScore = levelScoreRef.current + clearBonus;
    const nextRun = scoreRef.current + clearBonus;
    levelScoreRef.current = nextLevelScore;
    scoreRef.current = nextRun;
    setLevelScore(nextLevelScore);
    setScore(nextRun);
    setBonus(clearBonus);
    setTrack(noteClear("odds", spec.id, nextLevelScore, nextRun));
    playSfx("wave");
    if (spec.id >= ODDS_LEVELS.length) {
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
    const spec = ODDS_LEVELS[levelRef.current - 1];
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
        setTrack(noteScore("odds", scoreRef.current));
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
    setTrack(progress.tracks.odds);
    const errors = auditOdds();
    if (errors.length) console.error("Odds audit", errors);
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
  }, []);

  useEffect(() => {
    if (active) setMuted(muteRef.current);
  }, [active]);

  const spec = ODDS_LEVELS[level - 1] ?? ODDS_LEVELS[0];
  const prompt = spec.prompts[promptIndex] ?? spec.prompts[0];
  const continueLevel = Math.min(ODDS_LEVELS.length, track.cleared + 1);

  return (
    <main className="relative flex h-dvh flex-col overflow-hidden bg-ink text-cream">
      <header className="flex shrink-0 flex-col gap-2 border-b border-line px-3 py-2 sm:px-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-gold/50 bg-panel font-mono text-lg text-gold">P</span>
            <div className="min-w-0">
              <h1 className="truncate text-base font-extrabold leading-none tracking-tight sm:text-lg">Odds</h1>
              <p className="mt-1 font-mono text-xs text-mist">{phase === "menu" ? "Count the ways" : `Level ${level} / ${ODDS_LEVELS.length}`}</p>
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
            <p className="font-mono text-xs tracking-widest text-gold">CHANCE</p>
            <h2 className="mt-2 text-4xl font-extrabold tracking-tight">Count the ways.</h2>
            <p className="mt-3 text-sm leading-relaxed text-mist">
              Bags, coins, and dice. Pick the chance that matches what you see. Keys 1 to 4. A miss costs a heart. Sixteen levels.
            </p>
            <p className="mt-4 font-mono text-xs text-mist">
              Cleared {track.cleared} / {ODDS_LEVELS.length}
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
                count={ODDS_LEVELS.length}
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
            <div className="mt-3">
              <Scene model={prompt.model} />
            </div>
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
        <Overlay kicker="Paused" title="The draw can wait." body="Hearts and score stay put.">
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
              setTrack(noteScore("odds", scoreRef.current));
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
        <Overlay kicker={`Level ${level} clear`} title="The count holds." body={`Clear bonus ${bonus}. This level ${levelScore}. Run ${score}.`}>
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
        <Overlay kicker="Book closed" title="Every chance accounted for." body={`Score ${score}. Best ${Math.max(track.best, score)}. Replay any level from the menu.`}>
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
        <Overlay kicker={score >= track.best ? "Best run" : "Out of hearts"} title="That count was off." body={`Score ${score} · level ${level}. ${blurb}`}>
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
