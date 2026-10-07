import { useEffect, useRef, useState, type ReactNode } from "react";
import { Heart, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { LevelGrid } from "@/components/level-grid";
import { ArcadeExit } from "@/components/mode-switch";
import { LOGIC_LEVELS, auditLogic, type LogicClaim } from "@/game/logic/levels";
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

export function ThereforeProof({ active = true, onExit }: { active?: boolean; onExit?: () => void }) {
  const [phase, setPhase] = useState<Phase>("menu");
  const [level, setLevel] = useState(1);
  const [claims, setClaims] = useState<LogicClaim[]>([]);
  const [index, setIndex] = useState(0);
  const [hearts, setHearts] = useState(HEARTS);
  const [score, setScore] = useState(0);
  const [levelScore, setLevelScore] = useState(0);
  const [blurb, setBlurb] = useState("Read the premises. Then say if the claim must follow.");
  const [bonus, setBonus] = useState(0);
  const [track, setTrack] = useState<TrackProgress>({ best: 0, cleared: 0, scores: [], lastPlayed: 0 });
  const [mute, setMute] = useState(false);
  const [picked, setPicked] = useState<boolean | null>(null);
  const [shake, setShake] = useState(false);
  const phaseRef = useRef(phase);
  const activeRef = useRef(active);
  const lockRef = useRef(false);
  const scoreRef = useRef(0);
  const levelScoreRef = useRef(0);
  const heartsRef = useRef(HEARTS);
  const levelRef = useRef(1);
  const indexRef = useRef(0);
  const claimsRef = useRef<LogicClaim[]>([]);
  const missesRef = useRef(0);
  const startedRef = useRef(0);
  const muteRef = useRef(false);
  const mounted = useRef(true);
  phaseRef.current = phase;
  activeRef.current = active;
  muteRef.current = mute;

  const begin = (nextLevel: number, keepScore: number) => {
    const spec = LOGIC_LEVELS[nextLevel - 1];
    if (!spec) {
      setPhase("done");
      phaseRef.current = "done";
      return;
    }
    const dealt = shuffle(spec.claims);
    claimsRef.current = dealt;
    setClaims(dealt);
    levelRef.current = nextLevel;
    setLevel(nextLevel);
    indexRef.current = 0;
    setIndex(0);
    heartsRef.current = HEARTS;
    setHearts(HEARTS);
    scoreRef.current = keepScore;
    setScore(keepScore);
    levelScoreRef.current = 0;
    setLevelScore(0);
    missesRef.current = 0;
    setBonus(0);
    setPicked(null);
    setBlurb(spec.move);
    startedRef.current = performance.now();
    lockRef.current = false;
    setPhase("play");
    phaseRef.current = "play";
  };

  const finishLevel = () => {
    lockRef.current = true;
    const spec = LOGIC_LEVELS[levelRef.current - 1];
    const clearBonus = missesRef.current === 0 ? 180 * spec.id : 80 * spec.id;
    const nextLevelScore = levelScoreRef.current + clearBonus;
    const nextRun = scoreRef.current + clearBonus;
    levelScoreRef.current = nextLevelScore;
    scoreRef.current = nextRun;
    setLevelScore(nextLevelScore);
    setScore(nextRun);
    setBonus(clearBonus);
    setTrack(noteClear("logic", spec.id, nextLevelScore, nextRun));
    playSfx("wave");
    if (spec.id >= LOGIC_LEVELS.length) {
      setPhase("done");
      phaseRef.current = "done";
      return;
    }
    setPhase("clear");
    phaseRef.current = "clear";
  };

  const judgeRef = useRef<(follows: boolean) => void>(() => {});
  judgeRef.current = (follows: boolean) => {
    if (lockRef.current || phaseRef.current !== "play") return;
    const claim = claimsRef.current[indexRef.current];
    const spec = LOGIC_LEVELS[levelRef.current - 1];
    if (!claim || !spec) return;
    unlockAudio();
    lockRef.current = true;
    setPicked(follows);
    const right = follows === claim.follows;
    if (right) {
      const elapsed = (performance.now() - startedRef.current) / 1000;
      const gained = 140 + Math.max(0, Math.round((8 - elapsed) * 8));
      levelScoreRef.current += gained;
      scoreRef.current += gained;
      setLevelScore(levelScoreRef.current);
      setScore(scoreRef.current);
      setBlurb(claim.blurb);
      playSfx("pop");
    } else {
      missesRef.current += 1;
      heartsRef.current -= 1;
      setHearts(heartsRef.current);
      setBlurb(claim.blurb);
      playSfx("over");
      setShake(true);
      window.setTimeout(() => {
        if (mounted.current) setShake(false);
      }, 180);
      if (heartsRef.current <= 0) {
        setTrack(noteScore("logic", scoreRef.current));
        window.setTimeout(() => {
          if (!mounted.current) return;
          setPhase("over");
          phaseRef.current = "over";
        }, 720);
        return;
      }
    }
    const nextIndex = indexRef.current + 1;
    window.setTimeout(() => {
      if (!mounted.current) return;
      if (phaseRef.current === "over" || phaseRef.current === "menu") return;
      if (nextIndex >= claimsRef.current.length) {
        finishLevel();
        return;
      }
      indexRef.current = nextIndex;
      setIndex(nextIndex);
      setPicked(null);
      setBlurb(spec.move);
      startedRef.current = performance.now();
      lockRef.current = false;
    }, 720);
  };

  useEffect(() => {
    mounted.current = true;
    const progress = loadProgress();
    setTrack(progress.tracks.logic);
    const errors = auditLogic();
    if (errors.length) console.error("Therefore audit", errors);
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
      if (e.code === "Digit1" || e.code === "Numpad1") judgeRef.current(true);
      if (e.code === "Digit2" || e.code === "Numpad2") judgeRef.current(false);
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

  const spec = LOGIC_LEVELS[level - 1] ?? LOGIC_LEVELS[0];
  const claim = claims[index];
  const continueLevel = Math.min(LOGIC_LEVELS.length, track.cleared + 1);

  return (
    <main className="relative flex h-dvh flex-col overflow-hidden bg-ink text-cream">
      <header className="flex shrink-0 flex-col gap-2 border-b border-line px-3 py-2 sm:px-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-gold/50 bg-panel font-mono text-lg text-gold">∴</span>
            <div className="min-w-0">
              <h1 className="truncate text-base font-extrabold leading-none tracking-tight sm:text-lg">Therefore</h1>
              <p className="mt-1 font-mono text-xs text-mist">
                {phase === "menu" ? "Does the claim follow?" : `Level ${level} / ${LOGIC_LEVELS.length}`}
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
            <p className="font-mono text-xs tracking-widest text-gold">LOGIC</p>
            <h2 className="mt-2 text-4xl font-extrabold tracking-tight">Say what follows.</h2>
            <p className="mt-3 text-sm leading-relaxed text-mist">
              Premises stay on the table. Each claim either must be true, or it does not. Keys 1 and 2. A miss costs a heart. Sixteen levels.
            </p>
            <p className="mt-4 font-mono text-xs text-mist">
              Cleared {track.cleared} / {LOGIC_LEVELS.length}
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
                count={LOGIC_LEVELS.length}
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
          <div className="mx-auto w-full max-w-lg px-3 pt-3">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="font-mono text-xs tracking-widest text-mist">
                  {spec.title} · {index + 1}/{claims.length || spec.claims.length}
                </p>
                <p className="mt-1 font-mono text-xs text-gold">{spec.move}</p>
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
          </div>
          <div className="mx-auto min-h-0 w-full max-w-lg flex-1 overflow-y-auto">
            <div className="flex min-h-full flex-col justify-center px-3 py-3">
            <div className="rounded-2xl border border-line bg-panel px-4 py-3">
              <p className="font-mono text-xs tracking-widest text-mist">GIVEN</p>
              <ul className="mt-2 space-y-1 text-sm leading-relaxed text-cream">
                {spec.premises.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            <div className="mt-3 rounded-2xl border border-gold/50 bg-ink px-4 py-4">
              <p className="font-mono text-xs tracking-widest text-gold">THEREFORE?</p>
              <p className="mt-2 text-xl font-extrabold leading-snug tracking-tight">{claim?.text}</p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={phase !== "play" || picked != null}
                onClick={() => judgeRef.current(true)}
                className={`flex min-h-16 flex-col items-center justify-center rounded-xl border px-2 ${
                  picked == null
                    ? "border-line bg-panel-2"
                    : claim?.follows
                      ? "border-gold bg-panel"
                      : picked
                        ? "border-danger bg-panel"
                        : "border-line bg-ink opacity-60"
                }`}
              >
                <span className="font-mono text-xs text-mist">1</span>
                <span className="text-base font-extrabold">Follows</span>
              </button>
              <button
                type="button"
                disabled={phase !== "play" || picked != null}
                onClick={() => judgeRef.current(false)}
                className={`flex min-h-16 flex-col items-center justify-center rounded-xl border px-2 ${
                  picked == null
                    ? "border-line bg-panel-2"
                    : claim && !claim.follows
                      ? "border-gold bg-panel"
                      : picked === false
                        ? "border-danger bg-panel"
                        : "border-line bg-ink opacity-60"
                }`}
              >
                <span className="font-mono text-xs text-mist">2</span>
                <span className="text-base font-extrabold">Doesn't</span>
              </button>
            </div>
            </div>
          </div>
          <p aria-live="polite" className="mx-auto min-h-12 w-full max-w-lg px-4 pb-3 text-center text-sm leading-relaxed text-mist">
            {blurb}
          </p>
        </div>
      )}

      {phase === "pause" ? (
        <Overlay kicker="Paused" title="The premises can wait." body="Hearts and score stay put.">
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
              setTrack(noteScore("logic", scoreRef.current));
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
        <Overlay kicker={`Level ${level} clear`} title="That followed." body={`Clear bonus ${bonus}. This level ${levelScore}. Run ${score}.`}>
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
        <Overlay kicker="Book closed" title="Every claim was judged." body={`Score ${score}. Best ${Math.max(track.best, score)}. Replay any level from the menu.`}>
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
        <Overlay kicker={score >= track.best ? "Best run" : "Out of hearts"} title="That did not follow." body={`Score ${score} · level ${level}. ${blurb}`}>
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
