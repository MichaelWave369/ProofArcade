import { useEffect, useRef, useState, type ReactNode } from "react";
import { Eye, EyeOff, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { LevelGrid } from "@/components/level-grid";
import { ArcadeExit } from "@/components/mode-switch";
import { CAMPAIGN_LEVELS, DOMAIN_GLASS, type Domain } from "@/game/bank";
import { drawGame, glassOf, layoutOf, screenToWorld } from "@/game/draw";
import {
  aimAt,
  createGame,
  domainLabel,
  runSelfCheck,
  setBlind,
  setSfx,
  shoot,
  snapshot,
  spawnDrift,
  startGame,
  step,
  toMenu,
  togglePause,
  type Game,
  type Hud,
  type OrbView,
} from "@/game/engine";
import { loadProgress, noteClear, noteScore, type TrackProgress } from "@/game/progress";
import { playSfx, resumeAudio, setMuted, unlockAudio } from "@/game/sfx";

const SAVE_KEY = "bubble-proof-v1";

type Save = { best: number; mute: boolean; shake: boolean; blind: boolean };

function loadSave(): Partial<Save> {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw) as Partial<Save>;
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
}

function writeSave(g: Game) {
  const payload: Save = { best: g.best, mute: g.mute, shake: g.shake, blind: g.blind };
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore quota */
  }
}

function expr(orb: Pick<OrbView, "a" | "b">) {
  return orb.b ? `${orb.a} ${orb.b}` : orb.a;
}

function OrbFace({ orb, size = 72 }: { orb: OrbView; size?: number }) {
  const glass = glassOf(orb);
  return (
    <div
      className="relative grid shrink-0 place-items-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 32% 28%, ${glass.hi}, ${glass.mid} 48%, ${glass.deep})`,
        boxShadow: "inset 0 -6px 12px rgba(0,0,0,0.35), 0 8px 18px rgba(0,0,0,0.28)",
      }}
    >
      <span
        className="pointer-events-none absolute rounded-full bg-cream/80"
        style={{ width: size * 0.28, height: size * 0.14, top: size * 0.16, left: size * 0.18 }}
      />
      <span className="relative z-10 rounded-md bg-ink/70 px-1 py-0.5 text-center font-mono leading-tight text-cream">
        <span className="block" style={{ fontSize: Math.max(10, size * 0.2) }}>
          {orb.a}
        </span>
        {orb.b ? (
          <span className="block text-gold-soft" style={{ fontSize: Math.max(9, size * 0.15) }}>
            {orb.b}
          </span>
        ) : null}
      </span>
    </div>
  );
}

function Shots({ left, total }: { left: number; total: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${left} shots until the ceiling drops`}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={i < left ? "size-2 rounded-full bg-gold" : "size-2 rounded-full bg-line"}
        />
      ))}
    </div>
  );
}

function domainDot(domain: Domain) {
  return DOMAIN_GLASS[domain].mid;
}

export function BubbleProof({
  active = true,
  onExit,
}: {
  active?: boolean;
  onExit?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const layoutRef = useRef(layoutOf(360, 640));
  const activeRef = useRef(active);
  const [hud, setHud] = useState<Hud | null>(null);
  const [ready, setReady] = useState(false);
  const [track, setTrack] = useState<TrackProgress>({ best: 0, cleared: 0, scores: [], lastPlayed: 0 });
  const seenClear = useRef(0);
  const phase = hud?.phase ?? "menu";
  const live = phase === "play" || phase === "pause" || phase === "over";
  activeRef.current = active;

  useEffect(() => {
    const g = createGame();
    const saved = loadSave();
    if (typeof saved.best === "number") g.best = saved.best;
    if (typeof saved.mute === "boolean") g.mute = saved.mute;
    if (typeof saved.shake === "boolean") g.shake = saved.shake;
    if (typeof saved.blind === "boolean") g.blind = saved.blind;
    const prog = loadProgress();
    setTrack(prog.tracks.bubbles);
    if (prog.tracks.bubbles.best > g.best) g.best = prog.tracks.bubbles.best;
    g.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (g.reduced) g.shake = false;
    spawnDrift(g);
    if (activeRef.current) setMuted(g.mute);
    setSfx((name, pitch) => playSfx(name, pitch ?? 1));
    gameRef.current = g;
    runSelfCheck();
    setHud(snapshot(g));
    setReady(true);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let frame = 0;
    let last = performance.now();
    let sig = "";
    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      if (!activeRef.current) {
        g.keys.left = false;
        g.keys.right = false;
        last = now;
        return;
      }
      const dt = (now - last) / 1000;
      last = now;
      step(g, dt);
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.max(1, Math.floor(rect.width * dpr));
      const h = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      layoutRef.current = layoutOf(rect.width, rect.height);
      drawGame(ctx, g, rect.width, rect.height, dpr);
      const next = `${g.phase}|${g.score}|${g.best}|${g.wave}|${g.combo}|${g.shotsLeft}|${g.shotsPerDrop}|${g.banner}|${g.current.a}|${g.current.b ?? ""}|${g.current.special ?? ""}|${g.current.blurb}|${g.next.a}|${g.next.b ?? ""}|${g.next.special ?? ""}|${g.blind}|${g.mute}|${g.shake}|${g.newBest}|${g.boardSig}|${g.clearSeq}|${g.levelScore}`;
      if (next !== sig) {
        sig = next;
        writeSave(g);
        setHud(snapshot(g));
      }
    };
    frame = requestAnimationFrame(loop);

    const clearKeys = () => {
      g.keys.left = false;
      g.keys.right = false;
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (!activeRef.current) return;
      if (e.code === "KeyA" || e.code === "ArrowLeft") {
        g.keys.left = true;
        e.preventDefault();
      } else if (e.code === "KeyD" || e.code === "ArrowRight") {
        g.keys.right = true;
        e.preventDefault();
      } else if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
        if ((e.target as HTMLElement | null)?.closest("button")) return;
        e.preventDefault();
        if (e.repeat) return;
        unlockAudio();
        shoot(g);
      } else if (e.code === "Escape") {
        togglePause(g);
      } else if (e.code === "KeyM") {
        g.mute = !g.mute;
        setMuted(g.mute);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (!activeRef.current) return;
      if (e.code === "KeyA" || e.code === "ArrowLeft") g.keys.left = false;
      if (e.code === "KeyD" || e.code === "ArrowRight") g.keys.right = false;
    };
    const onVis = () => {
      if (document.visibilityState === "visible") resumeAudio();
      else clearKeys();
    };

    window.__aimTest = {
      getAngle: () => g.angle,
      setKeys: (codes: string[]) => {
        g.keys.left = codes.includes("KeyA") || codes.includes("ArrowLeft");
        g.keys.right = codes.includes("KeyD") || codes.includes("ArrowRight");
      },
      phase: () => g.phase,
      start: () => startGame(g, false),
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", clearKeys);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", clearKeys);
      document.removeEventListener("visibilitychange", onVis);
      delete window.__aimTest;
    };
  }, []);

  useEffect(() => {
    if (active && gameRef.current) setMuted(gameRef.current.mute);
  }, [active]);

  const aimFrom = (clientX: number, clientY: number, canvas: HTMLCanvasElement) => {
    const g = gameRef.current;
    if (!g) return;
    const rect = canvas.getBoundingClientRect();
    const world = screenToWorld(layoutRef.current, clientX - rect.left, clientY - rect.top);
    aimAt(g, world.x, world.y);
  };

  const hold = (dir: "left" | "right", down: boolean) => {
    const g = gameRef.current;
    if (!g) return;
    g.keys[dir] = down;
  };

  useEffect(() => {
    if (!hud || hud.clearSeq === 0 || hud.clearSeq === seenClear.current) return;
    seenClear.current = hud.clearSeq;
    setTrack(noteClear("bubbles", hud.clearLevel, hud.clearScore, hud.score));
  }, [hud]);

  useEffect(() => {
    if (hud?.phase !== "over") return;
    setTrack((prev) => {
      const next = noteScore("bubbles", hud.score);
      if (next.best === prev.best && next.cleared === prev.cleared) return prev;
      return next;
    });
  }, [hud?.phase, hud?.score]);

  const onPlay = (level?: number) => {
    const g = gameRef.current;
    if (!g) return;
    unlockAudio();
    startGame(g, g.blind, level ?? track.cleared + 1);
    writeSave(g);
    setHud(snapshot(g));
  };

  const onMenu = () => {
    const g = gameRef.current;
    if (!g) return;
    toMenu(g);
    setHud(snapshot(g));
  };

  const onPause = () => {
    const g = gameRef.current;
    if (!g) return;
    togglePause(g);
    setHud(snapshot(g));
  };

  const onMute = () => {
    const g = gameRef.current;
    if (!g) return;
    unlockAudio();
    g.mute = !g.mute;
    setMuted(g.mute);
    writeSave(g);
    setHud(snapshot(g));
  };

  const onShake = () => {
    const g = gameRef.current;
    if (!g || g.reduced) return;
    g.shake = !g.shake;
    writeSave(g);
    setHud(snapshot(g));
  };

  const onBlind = () => {
    const g = gameRef.current;
    if (!g) return;
    setBlind(g, !g.blind);
    writeSave(g);
    setHud(snapshot(g));
  };

  const fire = () => {
    const g = gameRef.current;
    if (!g) return;
    unlockAudio();
    shoot(g);
  };

  const current = hud?.current;
  const upcoming = hud?.next;

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-ink text-cream">
      <header className="flex shrink-0 flex-col gap-2 border-b border-line px-4 py-3">
        <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="relative grid size-9 shrink-0 place-items-center rounded-full border border-gold/50 bg-panel">
            <span className="size-4 rounded-full bg-gold" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-extrabold leading-none tracking-tight">Bubble Proof</h1>
            <p className="mt-1 font-mono text-xs text-mist">
              {live ? `Level ${hud?.wave ?? 1}${hud && hud.wave > CAMPAIGN_LEVELS ? " · apex" : ` / ${CAMPAIGN_LEVELS}`}` : "Match the value"}
              {hud && hud.combo >= 2 ? <span className="ml-2 text-gold">×{hud.combo}</span> : null}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {live && hud ? (
            <div className="hidden lg:block">
              <Shots left={hud.shotsLeft} total={hud.shotsPerDrop} />
            </div>
          ) : null}
          <div className={`text-right ${live ? "" : "max-sm:hidden"}`}>
            <div className="font-mono text-2xl leading-none font-semibold text-gold tabular-nums">
              {hud?.score ?? 0}
            </div>
            <div className="mt-1 font-mono text-xs text-mist tabular-nums">best {hud?.best ?? 0}</div>
          </div>
          {onExit ? <ArcadeExit onExit={onExit} /> : null}
          {phase === "play" || phase === "pause" ? (
            <button
              type="button"
              onClick={onPause}
              className="grid size-11 place-items-center rounded-full border border-line bg-panel text-cream"
              aria-label={phase === "pause" ? "Resume" : "Pause"}
            >
              {phase === "pause" ? <Play className="size-4" /> : <Pause className="size-4" />}
            </button>
          ) : null}
        </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {live && hud && !hud.blind ? (
          <aside className="hidden min-h-0 w-72 shrink-0 flex-col gap-4 overflow-y-auto border-r border-line bg-panel/80 p-4 lg:flex">
            <Codex hud={hud} onHover={(canon) => {
              const g = gameRef.current;
              if (g) g.hoverCanon = canon;
            }} />
          </aside>
        ) : null}

        <section className="relative min-w-0 flex-1">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full touch-none"
            aria-label="Bubble Proof board. Drag to aim and release to fire."
            onContextMenu={(e) => e.preventDefault()}
            onPointerDown={(e) => {
              if (!gameRef.current || gameRef.current.phase !== "play") return;
              e.currentTarget.setPointerCapture(e.pointerId);
              unlockAudio();
              aimFrom(e.clientX, e.clientY, e.currentTarget);
            }}
            onPointerMove={(e) => {
              if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
              aimFrom(e.clientX, e.clientY, e.currentTarget);
            }}
            onPointerUp={(e) => {
              if (!gameRef.current || gameRef.current.phase !== "play") return;
              aimFrom(e.clientX, e.clientY, e.currentTarget);
              if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
              shoot(gameRef.current);
            }}
          />

          {phase === "menu" ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4">
              <div className="pointer-events-auto max-h-full w-full max-w-md overflow-y-auto rounded-2xl border border-line bg-panel/90 p-6 shadow-2xl backdrop-blur-md">
                <p className="font-mono text-xs tracking-widest text-gold">EQUATION ORBS</p>
                <h2 className="mt-2 text-4xl font-extrabold tracking-tight">Solve it. Shatter it.</h2>
                <p className="mt-3 text-sm leading-relaxed text-mist">
                  Sixteen levels of equation orbs, then the ceiling keeps coming. Three that share a value pop — squared, rooted, or written as a law of motion.
                </p>
                <ul className="mt-4 space-y-2 text-sm leading-relaxed text-cream">
                  <li>Aim, then release. Arrows or A and D nudge the sight. Space fires.</li>
                  <li>2², √16, and 8÷2 are all 4. Same value, any form.</li>
                  <li>Clear the field before the ceiling crosses the limit. Loose bubbles fall.</li>
                </ul>
                <button
                  type="button"
                  onClick={onBlind}
                  aria-pressed={hud?.blind ?? false}
                  className="mt-5 flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-line bg-ink px-3 py-2 text-left"
                >
                  <span>
                    <span className="block text-sm font-bold">Blind solve</span>
                    <span className="block text-xs text-mist">Hide the formula book and the match preview.</span>
                  </span>
                  {hud?.blind ? <EyeOff className="size-4 shrink-0 text-gold" /> : <Eye className="size-4 shrink-0 text-mist" />}
                </button>
                <p className="mt-4 font-mono text-xs text-mist">
                  Cleared {track.cleared}
                  {track.cleared > CAMPAIGN_LEVELS ? "" : ` / ${CAMPAIGN_LEVELS}`}
                  {(hud?.best ?? 0) > 0 ? ` · best ${hud?.best}` : ""}
                </p>
                <button
                  type="button"
                  disabled={!ready}
                  onClick={() => onPlay()}
                  className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold text-base font-extrabold text-ink disabled:opacity-50"
                >
                  <Play className="size-4" />
                  {track.cleared > 0 ? `Continue · ${track.cleared + 1}` : "Play"}
                </button>
                <div className="mt-3">
                  <LevelGrid count={CAMPAIGN_LEVELS} cleared={track.cleared} scores={track.scores} onPlay={(n) => onPlay(n)} />
                </div>
                {track.cleared >= CAMPAIGN_LEVELS ? (
                  <p className="mt-2 text-xs text-mist">Apex levels keep going after {CAMPAIGN_LEVELS}.</p>
                ) : null}
              </div>
            </div>
          ) : null}

          {phase === "pause" && hud ? (
            <Overlay
              kicker="Paused"
              title="The proof can wait."
              body="Aim is still yours when you come back."
            >
              <button type="button" onClick={onPause} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold font-extrabold text-ink">
                <Play className="size-4" />
                Resume
              </button>
              <button type="button" onClick={onMenu} className="mt-2 min-h-11 w-full rounded-xl border border-line font-bold">
                Menu
              </button>
            </Overlay>
          ) : null}

          {phase === "over" && hud ? (
            <Overlay
              kicker={hud.newBest ? "New best" : "Field lost"}
              title="The lattice caught you."
              body={`Score ${hud.score} · level ${hud.wave}`}
            >
              <button type="button" onClick={() => onPlay(hud.wave)} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold font-extrabold text-ink">
                <RotateCcw className="size-4" />
                Play again
              </button>
              <button type="button" onClick={onMenu} className="mt-2 min-h-11 w-full rounded-xl border border-line font-bold">
                Menu
              </button>
            </Overlay>
          ) : null}
        </section>

        {live && hud && current && upcoming ? (
          <aside className="hidden min-h-0 w-80 shrink-0 flex-col gap-4 overflow-y-auto border-l border-line bg-panel/80 p-4 lg:flex">
            <ShotCard label="In the chamber" orb={current} blind={hud.blind} />
            <div className="flex items-center gap-3">
              <OrbFace orb={upcoming} size={56} />
              <div>
                <p className="font-mono text-xs tracking-widest text-mist">NEXT</p>
                <p className="font-mono text-lg text-cream">{expr(upcoming)}</p>
              </div>
            </div>
            <div>
              <p className="font-mono text-xs tracking-widest text-mist">UNTIL THE CEILING</p>
              <div className="mt-2">
                <Shots left={hud.shotsLeft} total={hud.shotsPerDrop} />
              </div>
            </div>
            <Toggles hud={hud} onBlind={onBlind} onMute={onMute} onShake={onShake} />
            <p className="text-xs leading-relaxed text-mist">
              Drag to aim, release to fire. A and D or the arrows nudge. Space fires. Esc pauses.
            </p>
          </aside>
        ) : null}
      </div>

      {live && hud && current ? (
        <footer className="shrink-0 border-t border-line bg-panel px-3 py-3 lg:hidden">
          {!hud.blind && hud.codex.length > 0 ? (
            <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
              {hud.codex.map((group) => (
                <span key={group.canon} className="shrink-0 rounded-full border border-line bg-ink px-2 py-1 font-mono text-xs">
                  <span className="text-gold">{group.canon}</span>
                  <span className="text-mist"> {group.items.map((item) => (item.b ? `${item.a} ${item.b}` : item.a)).join(" · ")}</span>
                </span>
              ))}
            </div>
          ) : null}
          {!hud.blind ? <p className="mb-2 truncate text-xs text-mist">{current.blurb}</p> : null}
          <div className="flex items-center gap-3">
            <OrbFace orb={current} size={58} />
            <div className="min-w-0 flex-1">
              <p className="font-mono text-xs text-mist">NOW</p>
              <p className="truncate font-mono text-lg leading-tight">{expr(current)}</p>
            </div>
            {upcoming ? (
              <div className="text-right">
                <p className="font-mono text-xs text-mist">NEXT</p>
                <p className="font-mono text-sm text-gold-soft">{expr(upcoming)}</p>
              </div>
            ) : null}
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <Shots left={hud.shotsLeft} total={hud.shotsPerDrop} />
            <span className="font-mono text-xs text-mist">ceiling</span>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            <HoldButton label="Left" onHold={(down) => hold("left", down)} />
            <button type="button" onClick={fire} className="min-h-11 rounded-xl bg-gold font-extrabold text-ink">
              Fire
            </button>
            <HoldButton label="Right" onHold={(down) => hold("right", down)} />
            <button type="button" onClick={onMute} className="grid min-h-11 place-items-center rounded-xl border border-line" aria-label={hud.mute ? "Unmute" : "Mute"}>
              {hud.mute ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            </button>
          </div>
        </footer>
      ) : null}
    </main>
  );
}

function ShotCard({ orb, label, blind }: { orb: OrbView; label: string; blind: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <OrbFace orb={orb} size={84} />
      <div className="min-w-0">
        <p className="font-mono text-xs tracking-widest text-mist">{label.toUpperCase()}</p>
        <p className="mt-1 font-mono text-xl leading-tight">{expr(orb)}</p>
        <p className="mt-1 text-xs text-gold-soft">{specialOrDomain(orb)}</p>
        {blind ? null : <p className="mt-2 text-sm leading-relaxed text-mist">{orb.blurb}</p>}
      </div>
    </div>
  );
}

function specialOrDomain(orb: OrbView) {
  if (orb.special === "wild") return "Wildcard";
  if (orb.special === "burst") return "Burst";
  if (orb.special === "pulse") return "Impulse";
  return domainLabel(orb.domain);
}

function Codex({
  hud,
  onHover,
}: {
  hud: Hud;
  onHover: (canon: string | null) => void;
}) {
  return (
    <div onMouseLeave={() => onHover(null)}>
      <p className="font-mono text-xs tracking-widest text-gold">FORMULA BOOK</p>
      <p className="mt-2 text-sm leading-relaxed text-mist">
        These values are on the field. Any spelling of the same number connects.
      </p>
      <div className="mt-4 space-y-3">
        {hud.codex.length === 0 ? <p className="text-sm text-mist">The field is clear.</p> : null}
        {hud.codex.map((group) => (
          <button
            key={group.canon}
            type="button"
            onMouseEnter={() => onHover(group.canon)}
            onFocus={() => onHover(group.canon)}
            onBlur={() => onHover(null)}
            className="block w-full rounded-xl border border-line bg-ink px-3 py-3 text-left"
          >
            <span className="font-mono text-2xl text-gold">{group.canon}</span>
            <span className="mt-2 flex flex-wrap gap-1">
              {group.items.map((item) => (
                <span
                  key={`${item.a}|${item.b ?? ""}`}
                  className="inline-flex items-center gap-1 rounded-full bg-panel-2 px-2 py-1 font-mono text-xs text-cream"
                >
                  <span className="size-2 rounded-full" style={{ background: domainDot(item.domain) }} />
                  {item.b ? `${item.a} ${item.b}` : item.a}
                </span>
              ))}
            </span>
          </button>
        ))}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-mist">
        Amber is arithmetic, teal geometry, rose physics, periwinkle trig, gold a constant. Color is the subject, not the answer.
      </p>
    </div>
  );
}

function Toggles({
  hud,
  onBlind,
  onMute,
  onShake,
}: {
  hud: Hud;
  onBlind: () => void;
  onMute: () => void;
  onShake: () => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <Toggle onClick={onBlind} pressed={hud.blind} label={hud.blind ? "Blind" : "Hints"} icon={hud.blind ? <EyeOff className="size-4" /> : <Eye className="size-4" />} />
      <Toggle onClick={onMute} pressed={hud.mute} label={hud.mute ? "Muted" : "Sound"} icon={hud.mute ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />} />
      <Toggle onClick={onShake} pressed={hud.shake} label={hud.shake ? "Shake" : "Steady"} icon={<span className="font-mono text-xs">~</span>} />
    </div>
  );
}

function Toggle({
  onClick,
  pressed,
  label,
  icon,
}: {
  onClick: () => void;
  pressed: boolean;
  label: string;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      className="flex min-h-11 flex-col items-center justify-center gap-1 rounded-xl border border-line bg-ink text-xs font-bold"
    >
      {icon}
      {label}
    </button>
  );
}

function HoldButton({ label, onHold }: { label: string; onHold: (down: boolean) => void }) {
  return (
    <button
      type="button"
      className="min-h-11 rounded-xl border border-line font-bold"
      onPointerDown={() => onHold(true)}
      onPointerUp={() => onHold(false)}
      onPointerCancel={() => onHold(false)}
      onPointerLeave={() => onHold(false)}
    >
      {label}
    </button>
  );
}

function Overlay({
  kicker,
  title,
  body,
  children,
}: {
  kicker: string;
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-ink/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-panel p-6">
        <p className="font-mono text-xs tracking-widest text-gold">{kicker}</p>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight">{title}</h2>
        <p className="mt-2 text-sm text-mist">{body}</p>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

declare global {
  interface Window {
    __aimTest?: {
      getAngle: () => number;
      setKeys: (codes: string[]) => void;
      phase: () => string;
      start: () => void;
    };
  }
}
