import { i as __toESM } from "../_runtime.mjs";
import { q as require_react, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as loadFidelity, c as stepPool, i as detectCapabilities, n as createPool, o as openLabSurface, r as curveY, s as present$1, t as InstrumentLab } from "./instrument-lab-fUqmWG3r.mjs";
import { a as Play, c as Eye, i as RotateCcw, l as EyeOff, n as Volume2, o as Pause, s as Heart, t as VolumeX, u as ArrowLeft } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-C6U-N7yZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LevelGrid({ count, cleared, scores, onPlay }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-4 gap-2",
		"aria-label": "Levels",
		children: Array.from({ length: count }, (_, i) => {
			const level = i + 1;
			const locked = level > cleared + 1;
			const score = scores[i] ?? 0;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				disabled: locked,
				onClick: () => onPlay(level),
				"aria-label": locked ? `Level ${level} locked` : `Play level ${level}${score ? `, best ${score}` : ""}`,
				className: locked ? "flex min-h-14 flex-col items-center justify-center rounded-xl border border-line bg-ink font-mono text-mist opacity-40" : score > 0 ? "flex min-h-14 flex-col items-center justify-center rounded-xl border border-gold/70 bg-ink font-mono" : "flex min-h-14 flex-col items-center justify-center rounded-xl border border-line bg-ink font-mono",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-base font-bold text-cream",
					children: level
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs text-mist",
					children: locked ? "locked" : score > 0 ? score : "open"
				})]
			}, level);
		})
	});
}
function ArcadeExit({ onExit }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: onExit,
		className: "flex min-h-11 shrink-0 items-center gap-1 rounded-full border border-line bg-ink px-3 text-xs font-bold text-cream",
		"aria-label": "Back to Proof Arcade",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "hidden sm:inline",
			children: "Arcade"
		})]
	});
}
var KEY = "proof-arcade-v3";
var PREVIOUS = "proof-arcade-v2";
var TRACKS = [
	"bubbles",
	"symbols",
	"equals",
	"run",
	"logic",
	"odds",
	"slope",
	"fractions",
	"primes",
	"vectors",
	"angles",
	"machine",
	"balance",
	"area",
	"motion",
	"grid",
	"waves",
	"orbit"
];
function emptyTrack() {
	return {
		best: 0,
		cleared: 0,
		scores: [],
		lastPlayed: 0
	};
}
function emptyProgress() {
	return { tracks: {
		bubbles: emptyTrack(),
		symbols: emptyTrack(),
		equals: emptyTrack(),
		run: emptyTrack(),
		logic: emptyTrack(),
		odds: emptyTrack(),
		slope: emptyTrack(),
		fractions: emptyTrack(),
		primes: emptyTrack(),
		vectors: emptyTrack(),
		angles: emptyTrack(),
		machine: emptyTrack(),
		balance: emptyTrack(),
		area: emptyTrack(),
		motion: emptyTrack(),
		grid: emptyTrack(),
		waves: emptyTrack(),
		orbit: emptyTrack()
	} };
}
function browserStore() {
	if (typeof localStorage === "undefined") return null;
	return localStorage;
}
function sanitizeTrack(raw) {
	const data = raw && typeof raw === "object" ? raw : {};
	const scores = Array.isArray(data.scores) ? data.scores.map((n) => typeof n === "number" && n > 0 ? Math.floor(n) : 0) : [];
	return {
		best: typeof data.best === "number" && data.best > 0 ? Math.floor(data.best) : 0,
		cleared: typeof data.cleared === "number" && data.cleared > 0 ? Math.floor(data.cleared) : 0,
		scores,
		lastPlayed: typeof data.lastPlayed === "number" && data.lastPlayed > 0 ? Math.floor(data.lastPlayed) : 0
	};
}
function trackTouched(track) {
	return track.best > 0 || track.cleared > 0 || track.lastPlayed > 0 || track.scores.some((score) => score > 0);
}
/**
* The frequency cabinet used to live on the `orbit` id. That id is now the
* gravity sandbox. Progress moves once, only when `waves` was never written.
*/
function migrateWaveRename(data) {
	const tracks = { ...data.tracks ?? {} };
	if (data.waveRename === true) return {
		tracks,
		migrated: false
	};
	if (!Object.prototype.hasOwnProperty.call(tracks, "waves") && Object.prototype.hasOwnProperty.call(tracks, "orbit")) {
		const carried = sanitizeTrack(tracks.orbit);
		tracks.waves = carried;
		tracks.orbit = emptyTrack();
		if (!trackTouched(carried)) tracks.waves = emptyTrack();
	}
	return {
		tracks,
		migrated: true
	};
}
function parseStored(raw) {
	if (!raw) return null;
	try {
		const data = JSON.parse(raw);
		if (!data || typeof data !== "object") return null;
		const moved = migrateWaveRename(data);
		const progress = emptyProgress();
		for (const id of TRACKS) progress.tracks[id] = sanitizeTrack(moved.tracks[id]);
		return {
			progress,
			migrated: moved.migrated
		};
	} catch {
		return null;
	}
}
function readLegacy(store) {
	const progress = emptyProgress();
	try {
		const bubble = JSON.parse(store.getItem("bubble-proof-v1") || "null");
		if (bubble && typeof bubble.best === "number") progress.tracks.bubbles.best = Math.max(0, Math.floor(bubble.best));
	} catch {}
	try {
		const symbol = JSON.parse(store.getItem("symbol-match-v1") || "null");
		if (symbol && typeof symbol.best === "number") progress.tracks.symbols.best = Math.max(0, Math.floor(symbol.best));
		if (symbol && typeof symbol.bestStage === "number") progress.tracks.symbols.cleared = Math.max(0, Math.floor(symbol.bestStage) - 1);
	} catch {}
	return progress;
}
function write(store, progress) {
	try {
		store.setItem(KEY, JSON.stringify({
			waveRename: true,
			tracks: progress.tracks
		}));
	} catch {}
}
function copyTrack(track) {
	return {
		best: track.best,
		cleared: track.cleared,
		scores: [...track.scores],
		lastPlayed: track.lastPlayed
	};
}
/** Read v3, else migrate v2, else seed from the original per-game saves. Old keys stay. */
function loadProgress(store = browserStore()) {
	if (!store) return emptyProgress();
	const current = parseStored(store.getItem(KEY));
	if (current) {
		if (current.migrated) write(store, current.progress);
		return current.progress;
	}
	const seeded = parseStored(store.getItem(PREVIOUS))?.progress ?? readLegacy(store);
	write(store, seeded);
	return seeded;
}
function noteScore(id, score, store = browserStore(), now = Date.now()) {
	if (!store) return emptyTrack();
	const progress = loadProgress(store);
	const track = progress.tracks[id];
	const next = Math.max(0, Math.floor(score));
	if (next > track.best) track.best = next;
	track.lastPlayed = Math.max(0, Math.floor(now));
	write(store, progress);
	return copyTrack(track);
}
function noteClear(id, level, levelScore, runScore, store = browserStore(), now = Date.now()) {
	if (!store) return emptyTrack();
	const progress = loadProgress(store);
	const track = progress.tracks[id];
	const safeLevel = Math.max(1, Math.floor(level));
	const safeLevelScore = Math.max(0, Math.floor(levelScore));
	const safeRun = Math.max(0, Math.floor(runScore));
	track.cleared = Math.max(track.cleared, safeLevel);
	track.best = Math.max(track.best, safeRun, safeLevelScore);
	while (track.scores.length < safeLevel) track.scores.push(0);
	track.scores[safeLevel - 1] = Math.max(track.scores[safeLevel - 1] ?? 0, safeLevelScore);
	track.lastPlayed = Math.max(0, Math.floor(now));
	write(store, progress);
	return copyTrack(track);
}
function noteVisit(id, store = browserStore(), now = Date.now()) {
	if (!store) return emptyTrack();
	const progress = loadProgress(store);
	const track = progress.tracks[id];
	track.lastPlayed = Math.max(track.lastPlayed, Math.max(0, Math.floor(now)));
	write(store, progress);
	return copyTrack(track);
}
var ctx = null;
var master = null;
var muted = false;
function unlockAudio() {
	const w = window;
	const AC = window.AudioContext ?? w.webkitAudioContext;
	if (!AC) return;
	if (!ctx) {
		ctx = new AC({ latencyHint: "interactive" });
		master = ctx.createGain();
		master.gain.value = muted ? 0 : .22;
		master.connect(ctx.destination);
	}
	if (ctx.state === "suspended") ctx.resume();
}
function setMuted(next) {
	muted = next;
	if (master && ctx) master.gain.setTargetAtTime(next ? 0 : .22, ctx.currentTime, .02);
}
function resumeAudio() {
	if (ctx?.state === "suspended") ctx.resume();
}
function envGain(when, peak, dur, delay = 0) {
	if (!ctx || !master) return null;
	const gain = ctx.createGain();
	const t0 = ctx.currentTime + delay;
	gain.gain.setValueAtTime(1e-4, t0);
	gain.gain.exponentialRampToValueAtTime(Math.max(2e-4, peak), t0 + .012);
	gain.gain.exponentialRampToValueAtTime(1e-4, t0 + dur);
	gain.connect(master);
	return {
		gain,
		t0
	};
}
function tone(freq, dur, type, peak, delay = 0) {
	if (!ctx) return;
	const routed = envGain(0, peak, dur, delay);
	if (!routed) return;
	const osc = ctx.createOscillator();
	osc.type = type;
	osc.frequency.setValueAtTime(freq, routed.t0);
	osc.connect(routed.gain);
	osc.start(routed.t0);
	osc.stop(routed.t0 + dur + .02);
	osc.onended = () => {
		osc.disconnect();
		routed.gain.disconnect();
	};
}
function noise(dur, peak, delay = 0) {
	if (!ctx) return;
	const routed = envGain(0, peak, dur, delay);
	if (!routed) return;
	const frames = Math.max(1, Math.floor(ctx.sampleRate * dur));
	const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
	const data = buffer.getChannelData(0);
	for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
	const src = ctx.createBufferSource();
	src.buffer = buffer;
	const filter = ctx.createBiquadFilter();
	filter.type = "highpass";
	filter.frequency.value = 900;
	src.connect(filter);
	filter.connect(routed.gain);
	src.start(routed.t0);
	src.stop(routed.t0 + dur);
	src.onended = () => {
		src.disconnect();
		filter.disconnect();
		routed.gain.disconnect();
	};
}
function playSfx$1(name, pitch = 1) {
	if (!ctx || muted) return;
	const wobble = .96 + Math.random() * .08;
	if (name === "shoot") {
		tone(620 * wobble, .07, "triangle", .18);
		noise(.04, .05);
	} else if (name === "stick") {
		tone(180 * wobble, .08, "sine", .16);
		tone(90, .1, "sine", .1);
	} else if (name === "pop") {
		const p = Math.max(1, pitch);
		const base = 520 * wobble * (1 + (p - 1) * .08);
		tone(base, .12, "sine", .2);
		tone(base * 1.5, .14, "triangle", .08, .02);
		noise(.05, .04);
	} else if (name === "fall") {
		tone(240 * wobble, .16, "sine", .08);
		tone(140, .22, "triangle", .06, .03);
	} else if (name === "drop") {
		tone(110, .2, "sine", .18);
		tone(70, .28, "triangle", .1, .02);
	} else if (name === "wave") {
		tone(523, .12, "triangle", .12);
		tone(659, .14, "triangle", .1, .08);
		tone(784, .18, "sine", .12, .16);
	} else if (name === "over") {
		tone(392, .16, "sine", .12);
		tone(311, .2, "sine", .1, .1);
		tone(233, .32, "triangle", .1, .2);
	} else tone(740 * wobble, .05, "sine", .08);
}
var HEARTS$5 = 3;
function shuffle$5(list) {
	const next = [...list];
	for (let i = next.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		const swap = next[i];
		next[i] = next[j];
		next[j] = swap;
	}
	return next;
}
function RoundProof({ active = true, onExit, track, mark, title, menuKicker, menuTitle, menuBody, levels, renderScene, audit }) {
	const [phase, setPhase] = (0, import_react.useState)("menu");
	const [level, setLevel] = (0, import_react.useState)(1);
	const [promptIndex, setPromptIndex] = (0, import_react.useState)(0);
	const [choices, setChoices] = (0, import_react.useState)([]);
	const [hearts, setHearts] = (0, import_react.useState)(HEARTS$5);
	const [score, setScore] = (0, import_react.useState)(0);
	const [levelScore, setLevelScore] = (0, import_react.useState)(0);
	const [blurb, setBlurb] = (0, import_react.useState)(menuBody);
	const [bonus, setBonus] = (0, import_react.useState)(0);
	const [saved, setSaved] = (0, import_react.useState)({
		best: 0,
		cleared: 0,
		scores: [],
		lastPlayed: 0
	});
	const [mute, setMute] = (0, import_react.useState)(false);
	const [picked, setPicked] = (0, import_react.useState)(null);
	const [shake, setShake] = (0, import_react.useState)(false);
	const phaseRef = (0, import_react.useRef)(phase);
	const activeRef = (0, import_react.useRef)(active);
	const lockRef = (0, import_react.useRef)(false);
	const scoreRef = (0, import_react.useRef)(0);
	const levelScoreRef = (0, import_react.useRef)(0);
	const heartsRef = (0, import_react.useRef)(HEARTS$5);
	const levelRef = (0, import_react.useRef)(1);
	const promptRef = (0, import_react.useRef)(0);
	const missesRef = (0, import_react.useRef)(0);
	const startedRef = (0, import_react.useRef)(0);
	const muteRef = (0, import_react.useRef)(false);
	const choicesRef = (0, import_react.useRef)([]);
	const mounted = (0, import_react.useRef)(true);
	phaseRef.current = phase;
	activeRef.current = active;
	muteRef.current = mute;
	choicesRef.current = choices;
	const showPrompt = (nextLevel, index) => {
		const prompt = levels[nextLevel - 1]?.prompts[index];
		if (!prompt) return;
		const nextChoices = shuffle$5(prompt.choices);
		choicesRef.current = nextChoices;
		setChoices(nextChoices);
		setPicked(null);
		setPromptIndex(index);
		promptRef.current = index;
		startedRef.current = performance.now();
		lockRef.current = false;
	};
	const begin = (nextLevel, keepScore) => {
		const spec = levels[nextLevel - 1];
		if (!spec) {
			setPhase("done");
			phaseRef.current = "done";
			return;
		}
		levelRef.current = nextLevel;
		setLevel(nextLevel);
		heartsRef.current = HEARTS$5;
		setHearts(HEARTS$5);
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
		playSfx$1("wave");
		if (spec.id >= levels.length) {
			setPhase("done");
			phaseRef.current = "done";
			return;
		}
		setPhase("clear");
		phaseRef.current = "clear";
	};
	const chooseRef = (0, import_react.useRef)(() => {});
	chooseRef.current = (choice) => {
		if (lockRef.current || phaseRef.current !== "play") return;
		const spec = levels[levelRef.current - 1];
		const prompt = spec?.prompts[promptRef.current];
		if (!prompt) return;
		unlockAudio();
		lockRef.current = true;
		setPicked(choice);
		const elapsed = (performance.now() - startedRef.current) / 1e3;
		if (choice === prompt.answer) {
			const gained = 150 + Math.max(0, Math.round((8 - elapsed) * 8));
			levelScoreRef.current += gained;
			scoreRef.current += gained;
			setLevelScore(levelScoreRef.current);
			setScore(scoreRef.current);
			setBlurb(prompt.blurb);
			playSfx$1("pop");
		} else {
			missesRef.current += 1;
			heartsRef.current -= 1;
			setHearts(heartsRef.current);
			setBlurb(prompt.blurb);
			playSfx$1("over");
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
	(0, import_react.useEffect)(() => {
		mounted.current = true;
		const progress = loadProgress();
		setSaved(progress.tracks[track]);
		const errors = audit();
		if (errors.length) console.error(`${title} audit`, errors);
		const onVis = () => {
			if (document.visibilityState === "visible") resumeAudio();
		};
		const onKey = (e) => {
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
	}, [
		audit,
		title,
		track
	]);
	(0, import_react.useEffect)(() => {
		if (active) setMuted(muteRef.current);
	}, [active]);
	const spec = levels[level - 1] ?? levels[0];
	const prompt = spec.prompts[promptIndex] ?? spec.prompts[0];
	const continueLevel = Math.min(levels.length, saved.cleared + 1);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative flex h-dvh flex-col overflow-hidden bg-ink text-cream",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "flex shrink-0 flex-col gap-2 border-b border-line px-3 py-2 sm:px-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-9 shrink-0 place-items-center rounded-lg border border-gold/50 bg-panel font-mono text-lg text-gold",
							children: mark
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "truncate text-base font-extrabold leading-none tracking-tight sm:text-lg",
								children: title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 font-mono text-xs text-mist",
								children: phase === "menu" ? menuKicker : `Level ${level} / ${levels.length}`
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: `text-right ${phase === "menu" ? "max-sm:hidden" : ""}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-mono text-xl leading-none font-semibold text-gold tabular-nums",
									children: score
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-1 font-mono text-xs text-mist tabular-nums",
									children: ["best ", Math.max(saved.best, score)]
								})]
							}),
							onExit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArcadeExit, { onExit }) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									unlockAudio();
									const next = !mute;
									setMute(next);
									muteRef.current = next;
									setMuted(next);
								},
								className: "grid size-11 place-items-center rounded-full border border-line bg-panel",
								"aria-label": mute ? "Unmute" : "Mute",
								children: mute ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" })
							}),
							phase === "play" || phase === "pause" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									if (phase === "play" && lockRef.current) return;
									const next = phase === "pause" ? "play" : "pause";
									setPhase(next);
									phaseRef.current = next;
								},
								className: "grid size-11 place-items-center rounded-full border border-line bg-panel",
								"aria-label": phase === "pause" ? "Resume" : "Pause",
								children: phase === "pause" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" })
							}) : null
						]
					})]
				})
			}),
			phase === "menu" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-1 items-center justify-center overflow-y-auto p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-md rounded-2xl border border-line bg-panel/90 p-6 shadow-2xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs tracking-widest text-gold",
							children: menuKicker
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-2 text-4xl font-extrabold tracking-tight",
							children: menuTitle
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm leading-relaxed text-mist",
							children: menuBody
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-4 font-mono text-xs text-mist",
							children: [
								"Cleared ",
								saved.cleared,
								" / ",
								levels.length,
								saved.best > 0 ? ` · best ${saved.best}` : ""
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
								unlockAudio();
								begin(continueLevel, 0);
							},
							className: "mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold text-base font-extrabold text-ink",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), saved.cleared > 0 ? `Continue · ${continueLevel}` : "Play"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LevelGrid, {
								count: levels.length,
								cleared: saved.cleared,
								scores: saved.scores,
								onPlay: (n) => {
									unlockAudio();
									begin(n, 0);
								}
							})
						})
					]
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: `flex min-h-0 flex-1 flex-col ${shake ? "lattice-shake" : ""}`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto flex w-full max-w-lg items-end justify-between gap-3 px-3 pt-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-mono text-xs tracking-widest text-mist",
							children: [
								spec.title,
								" · ",
								promptIndex + 1,
								"/",
								spec.prompts.length
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-right",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-mono text-xs text-mist",
								children: ["this level ", levelScore]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 flex justify-end gap-1",
								"aria-label": `${hearts} hearts left`,
								children: Array.from({ length: HEARTS$5 }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, {
									className: i < hearts ? "size-4 text-danger" : "size-4 text-line",
									fill: i < hearts ? "currentColor" : "none"
								}, i))
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mx-auto min-h-0 w-full max-w-lg flex-1 overflow-y-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex min-h-full flex-col justify-center px-3 py-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-center font-mono text-xs tracking-widest text-gold",
									children: prompt.kicker
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-3",
									children: renderScene(prompt)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-center text-lg font-extrabold leading-snug tracking-tight",
									children: prompt.ask
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-3 grid grid-cols-2 gap-2",
									children: choices.map((choice, choiceIndex) => {
										const correct = choice === prompt.answer;
										const shown = picked != null;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											disabled: phase !== "play" || shown,
											onClick: () => chooseRef.current(choice),
											className: `flex min-h-16 flex-col items-center justify-center rounded-xl border px-2 ${!shown ? "border-line bg-panel-2" : correct ? "border-gold bg-panel" : picked === choice ? "border-danger bg-panel" : "border-line bg-ink opacity-60"}`,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-mono text-xs text-mist",
												children: choiceIndex + 1
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-mono text-lg text-cream",
												children: choice
											})]
										}, choice);
									})
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"aria-live": "polite",
						className: "mx-auto min-h-12 w-full max-w-lg px-4 pb-3 text-center text-sm leading-relaxed text-mist",
						children: blurb
					})
				]
			}),
			phase === "pause" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Overlay$7, {
				kicker: "Paused",
				title: "The board can wait.",
				body: "Hearts and score stay put.",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => {
						setPhase("play");
						phaseRef.current = "play";
					},
					className: "flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold font-extrabold text-ink",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), "Resume"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						setSaved(noteScore(track, scoreRef.current));
						setPhase("menu");
						phaseRef.current = "menu";
					},
					className: "mt-2 min-h-11 w-full rounded-xl border border-line font-bold",
					children: "Menu"
				})]
			}) : null,
			phase === "clear" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overlay$7, {
				kicker: `Level ${level} clear`,
				title: "That one holds.",
				body: `Clear bonus ${bonus}. This level ${levelScore}. Run ${score}.`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => begin(level + 1, scoreRef.current),
					className: "flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold font-extrabold text-ink",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), "Next level"]
				})
			}) : null,
			phase === "done" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overlay$7, {
				kicker: "Book closed",
				title: "The run is finished.",
				body: `Score ${score}. Best ${Math.max(saved.best, score)}. Replay any level from the menu.`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						setPhase("menu");
						phaseRef.current = "menu";
					},
					className: "min-h-12 w-full rounded-xl bg-gold font-extrabold text-ink",
					children: "Level select"
				})
			}) : null,
			phase === "over" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Overlay$7, {
				kicker: score >= saved.best ? "Best run" : "Out of hearts",
				title: "Not that one.",
				body: `Score ${score} · level ${level}. ${blurb}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => begin(level, 0),
					className: "flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold font-extrabold text-ink",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" }), "Retry level"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						setPhase("menu");
						phaseRef.current = "menu";
					},
					className: "mt-2 min-h-11 w-full rounded-xl border border-line font-bold",
					children: "Menu"
				})]
			}) : null
		]
	});
}
function Overlay$7({ kicker, title, body, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-30 flex items-center justify-center bg-ink/55 p-4 backdrop-blur-sm",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm rounded-2xl border border-line bg-panel p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs tracking-widest text-gold",
					children: kicker
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-2 text-3xl font-extrabold tracking-tight",
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-mist",
					children: body
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5",
					children
				})
			]
		})
	});
}
var ROWS$1 = [
	[
		{
			kind: "complement",
			a: 30,
			b: 0
		},
		{
			kind: "complement",
			a: 20,
			b: 0
		},
		{
			kind: "complement",
			a: 45,
			b: 0
		}
	],
	[
		{
			kind: "complement",
			a: 10,
			b: 0
		},
		{
			kind: "complement",
			a: 15,
			b: 0
		},
		{
			kind: "complement",
			a: 40,
			b: 0
		}
	],
	[
		{
			kind: "complement",
			a: 25,
			b: 0
		},
		{
			kind: "complement",
			a: 35,
			b: 0
		},
		{
			kind: "complement",
			a: 55,
			b: 0
		}
	],
	[
		{
			kind: "complement",
			a: 12,
			b: 0
		},
		{
			kind: "complement",
			a: 28,
			b: 0
		},
		{
			kind: "complement",
			a: 63,
			b: 0
		}
	],
	[
		{
			kind: "supplement",
			a: 30,
			b: 0
		},
		{
			kind: "supplement",
			a: 50,
			b: 0
		},
		{
			kind: "supplement",
			a: 100,
			b: 0
		}
	],
	[
		{
			kind: "supplement",
			a: 20,
			b: 0
		},
		{
			kind: "supplement",
			a: 70,
			b: 0
		},
		{
			kind: "supplement",
			a: 110,
			b: 0
		}
	],
	[
		{
			kind: "supplement",
			a: 45,
			b: 0
		},
		{
			kind: "supplement",
			a: 90,
			b: 0
		},
		{
			kind: "supplement",
			a: 135,
			b: 0
		}
	],
	[
		{
			kind: "supplement",
			a: 15,
			b: 0
		},
		{
			kind: "supplement",
			a: 60,
			b: 0
		},
		{
			kind: "supplement",
			a: 125,
			b: 0
		}
	],
	[
		{
			kind: "triangle",
			a: 40,
			b: 60
		},
		{
			kind: "triangle",
			a: 50,
			b: 50
		},
		{
			kind: "triangle",
			a: 30,
			b: 60
		}
	],
	[
		{
			kind: "triangle",
			a: 45,
			b: 45
		},
		{
			kind: "triangle",
			a: 70,
			b: 40
		},
		{
			kind: "triangle",
			a: 20,
			b: 80
		}
	],
	[
		{
			kind: "triangle",
			a: 35,
			b: 65
		},
		{
			kind: "triangle",
			a: 25,
			b: 55
		},
		{
			kind: "triangle",
			a: 50,
			b: 60
		}
	],
	[
		{
			kind: "triangle",
			a: 90,
			b: 30
		},
		{
			kind: "triangle",
			a: 15,
			b: 75
		},
		{
			kind: "triangle",
			a: 40,
			b: 40
		}
	],
	[
		{
			kind: "vertical",
			a: 40,
			b: 0
		},
		{
			kind: "vertical",
			a: 70,
			b: 0
		},
		{
			kind: "vertical",
			a: 110,
			b: 0
		}
	],
	[
		{
			kind: "vertical",
			a: 25,
			b: 0
		},
		{
			kind: "vertical",
			a: 85,
			b: 0
		},
		{
			kind: "vertical",
			a: 150,
			b: 0
		}
	],
	[
		{
			kind: "complement",
			a: 18,
			b: 0
		},
		{
			kind: "supplement",
			a: 75,
			b: 0
		},
		{
			kind: "triangle",
			a: 30,
			b: 50
		}
	],
	[
		{
			kind: "vertical",
			a: 55,
			b: 0
		},
		{
			kind: "supplement",
			a: 48,
			b: 0
		},
		{
			kind: "triangle",
			a: 36,
			b: 72
		}
	]
];
var TITLES$8 = [
	"Right split",
	"Still right",
	"Smaller slice",
	"Close to square",
	"Straight line",
	"Wide and narrow",
	"The other half",
	"Almost flat",
	"Close the triangle",
	"Isosceles",
	"Uneven",
	"Right corner",
	"Opposite",
	"Crossing",
	"Mixed bench",
	"Last angle"
];
var FALLBACK = [
	10,
	20,
	30,
	40,
	45,
	50,
	60,
	70,
	80,
	100,
	110,
	120,
	135,
	150,
	15,
	25,
	35
];
function angleValue(scene) {
	if (scene.kind === "complement") return 90 - scene.a;
	if (scene.kind === "supplement") return 180 - scene.a;
	if (scene.kind === "vertical") return scene.a;
	return 180 - scene.a - scene.b;
}
function askFor(scene) {
	if (scene.kind === "complement") return "The right angle is split. What is the unmarked part?";
	if (scene.kind === "supplement") return "The line is straight. What is the unmarked angle?";
	if (scene.kind === "vertical") return "Opposite angles match. What is the unmarked angle?";
	return "A triangle sums to 180°. What is the unmarked angle?";
}
function blurbFor$1(scene, value) {
	if (scene.kind === "complement") return `90 − ${scene.a} = ${value}. The two parts make a right angle.`;
	if (scene.kind === "supplement") return `180 − ${scene.a} = ${value}. Adjacent angles on a straight line.`;
	if (scene.kind === "vertical") return `Opposite angles are equal, so this one is also ${value}°.`;
	return `180 − ${scene.a} − ${scene.b} = ${value}. The three angles close the triangle.`;
}
function angleCaption(scene) {
	if (scene.kind === "complement") return `Marked ${scene.a}° inside a right angle`;
	if (scene.kind === "supplement") return `Marked ${scene.a}° on a straight line`;
	if (scene.kind === "vertical") return `Marked ${scene.a}°. The opposite angle is unmarked`;
	return `Marked ${scene.a}° and ${scene.b}°. The third angle is unmarked`;
}
function decoys$1(scene, value) {
	const pool = [
		scene.a,
		scene.b,
		90 - scene.a,
		180 - scene.a,
		value + 10,
		value - 10,
		scene.a + scene.b,
		Math.abs(scene.a - scene.b),
		...FALLBACK
	];
	const out = [];
	for (const n of pool) {
		if (!Number.isInteger(n) || n <= 0 || n >= 180 || n === value) continue;
		if (out.includes(n)) continue;
		out.push(n);
		if (out.length === 3) break;
	}
	return out;
}
function promptFor$3(scene) {
	const value = angleValue(scene);
	const misses = decoys$1(scene, value);
	if (misses.length < 3) throw new Error(`angle decoys ${scene.kind} ${scene.a}`);
	const answer = String(value);
	return {
		kicker: scene.kind === "triangle" ? "180°" : scene.kind === "complement" ? "90°" : "Straight",
		ask: askFor(scene),
		scene,
		choices: [answer, ...misses.map(String)],
		answer,
		blurb: blurbFor$1(scene, value)
	};
}
var ANGLE_LEVELS = ROWS$1.map((row, index) => ({
	id: index + 1,
	title: TITLES$8[index] ?? `Angle ${index + 1}`,
	prompts: row.map(promptFor$3)
}));
function auditAngle() {
	const errors = [];
	if (ANGLE_LEVELS.length !== 16) errors.push(`levels ${ANGLE_LEVELS.length}`);
	for (const level of ANGLE_LEVELS) {
		if (level.prompts.length !== 3) errors.push(`level ${level.id} prompts`);
		for (const prompt of level.prompts) {
			const scene = prompt.scene;
			const value = angleValue(scene);
			if (scene.kind === "complement" && (scene.a <= 0 || scene.a >= 90)) errors.push(`comp ${level.id}`);
			if (scene.kind === "supplement" && (scene.a <= 0 || scene.a >= 180)) errors.push(`supp ${level.id}`);
			if (scene.kind === "vertical" && (scene.a <= 0 || scene.a >= 180)) errors.push(`vert ${level.id}`);
			if (scene.kind === "triangle" && (scene.a <= 0 || scene.b <= 0 || scene.a + scene.b >= 180)) errors.push(`tri ${level.id}`);
			if (prompt.answer !== String(value)) errors.push(`answer ${level.id} ${prompt.answer}`);
			if (!prompt.choices.includes(prompt.answer)) errors.push(`missing ${level.id}`);
			if (new Set(prompt.choices).size !== 4) errors.push(`dup ${level.id} ${prompt.choices.join(",")}`);
			for (const choice of prompt.choices) if (choice !== prompt.answer && Number(choice) === value) errors.push(`alias ${level.id} ${choice}`);
		}
	}
	return errors;
}
function at$1(x, y, deg, r) {
	const rad = deg * Math.PI / 180;
	return {
		x: x + r * Math.cos(rad),
		y: y - r * Math.sin(rad)
	};
}
function wedge(x, y, start, end, r) {
	const a = at$1(x, y, start, r);
	const b = at$1(x, y, end, r);
	const large = end - start > 180 ? 1 : 0;
	return `M ${x} ${y} L ${a.x} ${a.y} A ${r} ${r} 0 ${large} 0 ${b.x} ${b.y} Z`;
}
function Label({ x, y, text, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
		x,
		y,
		textAnchor: "middle",
		dominantBaseline: "middle",
		fontSize: "13",
		className: `font-mono ${tone}`,
		fill: "currentColor",
		children: text
	});
}
function AngleFigure({ scene }) {
	if (scene.kind === "complement") {
		const o = {
			x: 36,
			y: 112
		};
		const ray = at$1(o.x, o.y, scene.a, 100);
		const known = at$1(o.x, o.y, scene.a / 2, 46);
		const unknown = at$1(o.x, o.y, (scene.a + 90) / 2, 46);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: "0 0 180 140",
			className: "mx-auto h-40 w-full max-w-xs",
			role: "img",
			"aria-label": angleCaption(scene),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: wedge(o.x, o.y, 0, scene.a, 28),
					className: "text-gold/30",
					fill: "currentColor"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: wedge(o.x, o.y, scene.a, 90, 28),
					className: "text-mint/30",
					fill: "currentColor"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: o.x,
					y1: o.y,
					x2: 156,
					y2: o.y,
					className: "text-cream",
					stroke: "currentColor",
					strokeWidth: "2"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: o.x,
					y1: o.y,
					x2: o.x,
					y2: 16,
					className: "text-cream",
					stroke: "currentColor",
					strokeWidth: "2"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: o.x,
					y1: o.y,
					x2: ray.x,
					y2: ray.y,
					className: "text-gold",
					stroke: "currentColor",
					strokeWidth: "2"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: `M ${o.x + 14} ${o.y} L ${o.x + 14} ${o.y - 14} L ${o.x} ${o.y - 14}`,
					className: "text-line",
					fill: "none",
					stroke: "currentColor"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					x: known.x,
					y: known.y,
					text: `${scene.a}°`,
					tone: "text-gold"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					x: unknown.x,
					y: unknown.y,
					text: "?",
					tone: "text-mint"
				})
			]
		});
	}
	if (scene.kind === "supplement") {
		const o = {
			x: 90,
			y: 96
		};
		const ray = at$1(o.x, o.y, scene.a, 78);
		const known = at$1(o.x, o.y, scene.a / 2, 40);
		const unknown = at$1(o.x, o.y, (scene.a + 180) / 2, 40);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: "0 0 180 140",
			className: "mx-auto h-40 w-full max-w-xs",
			role: "img",
			"aria-label": angleCaption(scene),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: wedge(o.x, o.y, 0, scene.a, 30),
					className: "text-gold/30",
					fill: "currentColor"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: wedge(o.x, o.y, scene.a, 180, 30),
					className: "text-mint/30",
					fill: "currentColor"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: 12,
					y1: o.y,
					x2: 168,
					y2: o.y,
					className: "text-cream",
					stroke: "currentColor",
					strokeWidth: "2"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: o.x,
					y1: o.y,
					x2: ray.x,
					y2: ray.y,
					className: "text-gold",
					stroke: "currentColor",
					strokeWidth: "2"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					x: known.x,
					y: known.y,
					text: `${scene.a}°`,
					tone: "text-gold"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					x: unknown.x,
					y: unknown.y,
					text: "?",
					tone: "text-mint"
				})
			]
		});
	}
	if (scene.kind === "vertical") {
		const o = {
			x: 90,
			y: 72
		};
		const arm = at$1(o.x, o.y, scene.a, 70);
		const back = at$1(o.x, o.y, scene.a + 180, 70);
		const known = at$1(o.x, o.y, scene.a / 2, 36);
		const unknown = at$1(o.x, o.y, 180 + scene.a / 2, 36);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: "0 0 180 140",
			className: "mx-auto h-40 w-full max-w-xs",
			role: "img",
			"aria-label": angleCaption(scene),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: wedge(o.x, o.y, 0, scene.a, 26),
					className: "text-gold/30",
					fill: "currentColor"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: wedge(o.x, o.y, 180, 180 + scene.a, 26),
					className: "text-mint/30",
					fill: "currentColor"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: 18,
					y1: o.y,
					x2: 162,
					y2: o.y,
					className: "text-cream",
					stroke: "currentColor",
					strokeWidth: "2"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: back.x,
					y1: back.y,
					x2: arm.x,
					y2: arm.y,
					className: "text-gold",
					stroke: "currentColor",
					strokeWidth: "2"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					x: known.x,
					y: known.y,
					text: `${scene.a}°`,
					tone: "text-gold"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					x: unknown.x,
					y: unknown.y,
					text: "?",
					tone: "text-mint"
				})
			]
		});
	}
	const A = {
		x: 28,
		y: 118
	};
	const B = {
		x: 154,
		y: 118
	};
	const C = meet(A.x, A.y, scene.a, B.x, B.y, 180 - scene.b);
	const pts = [
		A,
		B,
		C
	];
	const minX = Math.min(...pts.map((p) => p.x)) - 28;
	const maxX = Math.max(...pts.map((p) => p.x)) + 28;
	const minY = Math.min(...pts.map((p) => p.y)) - 28;
	const maxY = Math.max(...pts.map((p) => p.y)) + 28;
	const outward = (from, amount) => {
		const cx = (A.x + B.x + C.x) / 3;
		const cy = (A.y + B.y + C.y) / 3;
		const dx = from.x - cx;
		const dy = from.y - cy;
		const len = Math.hypot(dx, dy) || 1;
		return {
			x: from.x + dx / len * amount,
			y: from.y + dy / len * amount
		};
	};
	const la = outward(A, 18);
	const lb = outward(B, 18);
	const lc = outward(C, 16);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: `${minX} ${minY} ${maxX - minX} ${maxY - minY}`,
		className: "mx-auto h-40 w-full max-w-xs",
		role: "img",
		"aria-label": angleCaption(scene),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
				points: `${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`,
				className: "text-line",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "2"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				x: la.x,
				y: la.y,
				text: `${scene.a}°`,
				tone: "text-gold"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				x: lb.x,
				y: lb.y,
				text: `${scene.b}°`,
				tone: "text-gold"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				x: lc.x,
				y: lc.y,
				text: "?",
				tone: "text-mint"
			})
		]
	});
}
function meet(ax, ay, aDeg, bx, by, bDeg) {
	const ar = aDeg * Math.PI / 180;
	const br = bDeg * Math.PI / 180;
	const adx = Math.cos(ar);
	const ady = -Math.sin(ar);
	const bdx = Math.cos(br);
	const bdy = -Math.sin(br);
	const det = adx * bdy - ady * bdx;
	if (Math.abs(det) < 1e-6) return {
		x: (ax + bx) / 2,
		y: ay - 70
	};
	const t = ((bx - ax) * bdy - (by - ay) * bdx) / det;
	return {
		x: ax + t * adx,
		y: ay + t * ady
	};
}
function AngleProof({ active = true, onExit }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoundProof, {
		active,
		onExit,
		track: "angles",
		mark: "∠",
		title: "Angles",
		menuKicker: "GEOMETRY",
		menuTitle: "Read the corner.",
		menuBody: "A right angle, a straight line, a triangle, or a crossing. The mark is given. Name the blank. Keys 1 to 4. A miss costs a heart. Sixteen levels.",
		levels: ANGLE_LEVELS,
		audit: auditAngle,
		renderScene: (prompt) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AngleFigure, { scene: prompt.scene }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-center font-mono text-xs text-mist",
			children: angleCaption(prompt.scene)
		})] })
	});
}
function BenchFrame({ kicker, title, meta, onExit, onQuestions, chip = "Questions", children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative flex h-dvh flex-col overflow-hidden bg-ink text-cream",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex shrink-0 items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs tracking-widest text-gold",
						children: kicker
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "truncate text-xl font-extrabold tracking-tight sm:text-2xl",
						children: title
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex shrink-0 items-center gap-2",
					children: [meta ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs text-mist",
						children: meta
					}) : null, onExit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArcadeExit, { onExit }) : null]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-h-0 flex-1 overflow-y-auto px-4 py-3 pb-24 sm:px-6",
				children
			}),
			onQuestions ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onQuestions,
				className: "absolute right-4 bottom-4 z-10 min-h-11 rounded-full border border-line bg-ink/95 px-4 font-mono text-xs tracking-widest text-gold",
				children: chip
			}) : null
		]
	});
}
function LevelStrip({ count, current, onPick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex gap-1 overflow-x-auto pb-2",
		role: "tablist",
		"aria-label": "Levels",
		children: Array.from({ length: count }, (_, index) => {
			const id = index + 1;
			const on = id === current;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				role: "tab",
				"aria-selected": on,
				onClick: () => onPick(id),
				className: on ? "min-h-11 min-w-11 shrink-0 rounded-full bg-gold text-sm font-extrabold text-ink" : "min-h-11 min-w-11 shrink-0 rounded-full border border-line bg-panel text-sm text-mist",
				children: id
			}, id);
		})
	});
}
function QuestionsChip({ label, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: "absolute right-4 bottom-4 z-20 min-h-11 rounded-full border border-line bg-ink/95 px-4 font-mono text-xs tracking-widest text-gold",
		children: label
	});
}
var AREA_LAW = {
	rect: "Area of a rectangle is width times height. Every gold cell is one.",
	square: "A square is a rectangle whose sides are equal. Area is still the product.",
	wide: "Width times height is the area. This bench also asks the width to be the longer side.",
	tall: "Width times height is the area. This bench also asks the height to be the longer side.",
	cut: "What remains is the full block minus the cut. Both of those numbers are areas.",
	tri: "A right triangle is half the rectangle on the same legs. Area = ½ × base × height."
};
function play$3(id, title, aim, blurb, maxW, maxH, startW, startH, target, solutionW, solutionH, blockW = maxW, blockH = maxH) {
	return {
		id,
		title,
		aim,
		blurb,
		maxW,
		maxH,
		startW,
		startH,
		target,
		blockW,
		blockH,
		solutionW,
		solutionH
	};
}
var AREA_PLAYS = [
	play$3(1, "Six cells", "rect", "Grow the block until the gold counts as 6.", 6, 6, 1, 1, 6, 2, 3),
	play$3(2, "Eight cells", "rect", "Width times height. Land on 8.", 8, 4, 1, 1, 8, 2, 4),
	play$3(3, "Twelve", "rect", "A longer rectangle. The product is 12.", 6, 6, 2, 2, 12, 3, 4),
	play$3(4, "A prime area", "rect", "7 has only one pair of whole sides that fit this bench.", 8, 8, 2, 2, 7, 1, 7),
	play$3(5, "A square of 9", "square", "Equal sides, and the product is 9.", 6, 6, 2, 2, 9, 3, 3),
	play$3(6, "A square of 16", "square", "Equal sides again. The area is 16.", 6, 6, 2, 3, 16, 4, 4),
	play$3(7, "Wider than tall", "wide", "Area 12, and the width has to be the longer side.", 8, 6, 2, 2, 12, 4, 3),
	play$3(8, "Taller than wide", "tall", "Area 12, and the height has to be the longer side.", 6, 8, 4, 2, 12, 3, 4),
	play$3(9, "Wide eighteen", "wide", "Area 18. Keep it wider than it is tall.", 8, 6, 3, 3, 18, 6, 3),
	play$3(10, "Tall fifteen", "tall", "Area 15. The height is the longer side.", 6, 8, 5, 1, 15, 3, 5),
	play$3(11, "Leave 18", "cut", "The block is 6 by 4. Cut a rectangle out until 18 remains.", 6, 4, 1, 1, 18, 3, 2, 6, 4),
	play$3(12, "Leave 15", "cut", "A 5 by 5 block. The cut removes what you do not want counted.", 5, 5, 1, 1, 15, 5, 2, 5, 5),
	play$3(13, "Leave half", "cut", "An 8 by 3 block. Leave half of it.", 8, 3, 0, 0, 12, 4, 3, 8, 3),
	play$3(14, "Half of the box", "tri", "Set the legs so the triangle, not the box, has area 6.", 8, 6, 2, 2, 6, 4, 3),
	play$3(15, "Triangle of 10", "tri", "Half of base times height equals 10.", 8, 8, 2, 2, 10, 5, 4),
	play$3(16, "Triangle of 8", "tri", "The dashed box is the rectangle. The gold is half of it.", 8, 8, 2, 2, 8, 4, 4)
];
function areaAmount(play, w, h) {
	if (play.aim === "cut") return play.blockW * play.blockH - w * h;
	if (play.aim === "tri") return w * h / 2;
	return w * h;
}
function formatAmount(value) {
	return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
function areaFormula(play, w, h) {
	const amount = formatAmount(areaAmount(play, w, h));
	if (play.aim === "cut") return `${play.blockW * play.blockH} − ${w * h} = ${amount}`;
	if (play.aim === "tri") return `½ × ${w} × ${h} = ${amount}`;
	return `${w} × ${h} = ${amount}`;
}
function areaSolved(play, w, h) {
	if (!Number.isInteger(w) || !Number.isInteger(h) || w < 0 || h < 0) return false;
	if (play.aim === "cut") {
		if (w > play.blockW || h > play.blockH) return false;
		return play.blockW * play.blockH - w * h === play.target;
	}
	if (w < 1 || h < 1 || w > play.maxW || h > play.maxH) return false;
	if (play.aim === "tri") return w * h / 2 === play.target;
	if (play.aim === "square") return w === h && w * h === play.target;
	if (play.aim === "wide") return w > h && w * h === play.target;
	if (play.aim === "tall") return h > w && w * h === play.target;
	return w * h === play.target;
}
function Cells({ play, w, h }) {
	if (play.aim === "tri") {
		const cell = 22;
		const left = 8;
		const top = 8;
		const vbW = play.maxW * cell + 16;
		const vbH = play.maxH * cell + 16;
		const bottom = top + play.maxH * cell;
		const base = w * cell;
		const rise = h * cell;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: `0 0 ${vbW} ${vbH}`,
			className: "mx-auto w-full max-w-md",
			role: "img",
			"aria-label": `Right triangle with legs ${w} and ${h}`,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: left,
					y: top,
					width: play.maxW * cell,
					height: play.maxH * cell,
					className: "text-line",
					fill: "none",
					stroke: "currentColor"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: left,
					y: bottom - rise,
					width: base,
					height: rise,
					className: "text-mint",
					fill: "none",
					stroke: "currentColor",
					strokeDasharray: "4 3"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
					points: `${left},${bottom} ${left + base},${bottom} ${left},${bottom - rise}`,
					className: "text-gold/40",
					fill: "currentColor"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
					points: `${left},${bottom} ${left + base},${bottom} ${left},${bottom - rise}`,
					className: "text-gold",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "2"
				})
			]
		});
	}
	const cols = play.aim === "cut" ? play.blockW : play.maxW;
	const rows = play.aim === "cut" ? play.blockH : play.maxH;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mx-auto grid w-fit gap-1",
		style: { gridTemplateColumns: `repeat(${cols}, 1.5rem)` },
		role: "img",
		"aria-label": play.aim === "cut" ? `Block ${play.blockW} by ${play.blockH}, cut ${w} by ${h}` : `Rectangle ${w} by ${h}`,
		children: Array.from({ length: cols * rows }, (_, index) => {
			const col = index % cols;
			const row = Math.floor(index / cols);
			const insideCut = play.aim === "cut" && col < w && row < h;
			const gold = play.aim === "cut" ? col < play.blockW && row < play.blockH && !insideCut : col < w && row < h;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `size-6 rounded-sm ${gold ? "bg-gold" : "bg-panel"} ${insideCut ? "border border-line" : ""}` }, index);
		})
	});
}
function Stepper$1({ label, value, min, max, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between gap-3 rounded-xl border border-line bg-panel px-3 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-mono text-xs tracking-widest text-mist",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": `Decrease ${label}`,
					disabled: value <= min,
					onClick: () => onChange(value - 1),
					className: "min-h-11 min-w-11 rounded-full border border-line text-lg text-cream disabled:opacity-40",
					children: "−"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "w-8 text-center font-mono text-cream",
					children: value
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": `Increase ${label}`,
					disabled: value >= max,
					onClick: () => onChange(value + 1),
					className: "min-h-11 min-w-11 rounded-full border border-line text-lg text-cream disabled:opacity-40",
					children: "+"
				})
			]
		})]
	});
}
function AreaBench({ onExit, onQuestions }) {
	const [levelId, setLevelId] = (0, import_react.useState)(1);
	const level = AREA_PLAYS[levelId - 1] ?? AREA_PLAYS[0];
	const [w, setW] = (0, import_react.useState)(level.startW);
	const [h, setH] = (0, import_react.useState)(level.startH);
	const [armed, setArmed] = (0, import_react.useState)(level.id);
	const [run, setRun] = (0, import_react.useState)(0);
	const scored = (0, import_react.useRef)(false);
	const solved = armed === level.id && areaSolved(level, w, h);
	const cut = level.aim === "cut";
	const minSide = cut ? 0 : 1;
	const maxW = cut ? level.blockW : level.maxW;
	const maxH = cut ? level.blockH : level.maxH;
	(0, import_react.useEffect)(() => {
		scored.current = false;
		setW(level.startW);
		setH(level.startH);
		setArmed(level.id);
	}, [level]);
	(0, import_react.useEffect)(() => {
		if (!solved || scored.current) return;
		scored.current = true;
		const score = 100;
		setRun((total) => {
			const next = total + score;
			noteClear("area", level.id, score, next);
			return next;
		});
	}, [solved, level.id]);
	const widthLabel = cut ? "Cut width" : level.aim === "tri" ? "Base" : "Width";
	const heightLabel = cut ? "Cut height" : level.aim === "tri" ? "Height" : "Height";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BenchFrame, {
		kicker: "AREA",
		title: level.title,
		meta: `${level.id}/16`,
		onExit,
		onQuestions,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LevelStrip, {
				count: AREA_PLAYS.length,
				current: level.id,
				onPick: setLevelId
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-mist",
				children: level.blurb
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 font-mono text-xs text-gold",
				children: [
					"Target ",
					formatAmount(level.target),
					" · now ",
					formatAmount(areaAmount(level, w, h))
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 rounded-2xl border border-line bg-ink p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cells, {
					play: level,
					w,
					h
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-center font-mono text-lg text-cream",
				children: areaFormula(level, w, h)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid gap-2 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stepper$1, {
					label: widthLabel,
					value: w,
					min: minSide,
					max: maxW,
					onChange: setW
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stepper$1, {
					label: heightLabel,
					value: h,
					min: minSide,
					max: maxH,
					onChange: setH
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm leading-relaxed text-cream",
				children: AREA_LAW[level.aim]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 font-mono text-sm text-gold",
				"aria-live": "polite",
				children: solved ? "The figure on the bench is the area you were asked for." : "Change a side. The count updates from the figure, not from a list."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => {
							scored.current = solved;
							setW(level.startW);
							setH(level.startH);
						},
						className: "min-h-11 rounded-full border border-line px-4 text-sm text-cream",
						children: "Reset"
					}),
					solved && level.id < AREA_PLAYS.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setLevelId(level.id + 1),
						className: "min-h-11 rounded-full bg-gold px-4 text-sm font-extrabold text-ink",
						children: "Next"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "self-center font-mono text-xs text-mist",
						children: ["Run ", run]
					})
				]
			})
		]
	});
}
var TRIS = [
	[4, 3],
	[6, 3],
	[4, 5],
	[8, 3],
	[6, 5],
	[4, 7],
	[8, 5],
	[6, 7],
	[10, 3],
	[8, 7],
	[10, 5],
	[6, 9],
	[12, 3],
	[8, 9],
	[10, 7]
];
var TITLES$7 = [
	"Count the block",
	"Wider",
	"Taller",
	"Same bricks",
	"Long room",
	"Last rectangle",
	"Half the box",
	"Right corner",
	"Triangle",
	"Steeper half",
	"Last triangle",
	"Two blocks",
	"Side by side",
	"Add them",
	"Cut out",
	"What's left"
];
function areaOf(scene) {
	if (scene.kind === "rect") return scene.w * scene.h;
	if (scene.kind === "tri") return scene.a * scene.b / 2;
	if (scene.kind === "add") return scene.w * scene.h + scene.w2 * scene.h2;
	return scene.w * scene.h - scene.w2 * scene.h2;
}
function areaAsk(scene) {
	if (scene.kind === "rect") return "How many unit squares fill the rectangle?";
	if (scene.kind === "tri") return "The right angle is the corner. How many unit squares is the triangle?";
	if (scene.kind === "add") return "Both gold blocks count. What is the total area?";
	return "The ink cut is empty. What area is left?";
}
function areaKicker(scene) {
	if (scene.kind === "rect") return "Rectangle";
	if (scene.kind === "tri") return "Triangle";
	if (scene.kind === "add") return "Two blocks";
	return "Cut out";
}
function areaBlurb(scene) {
	const area = areaOf(scene);
	if (scene.kind === "rect") return `${scene.w} × ${scene.h} = ${area}.`;
	if (scene.kind === "tri") return `Half of ${scene.a} × ${scene.b} is ${area}.`;
	if (scene.kind === "add") return `${scene.w} × ${scene.h} + ${scene.w2} × ${scene.h2} = ${area}.`;
	return `${scene.w} × ${scene.h} − ${scene.w2} × ${scene.h2} = ${area}.`;
}
function areaCaption(scene) {
	if (scene.kind === "rect") return `${scene.w} by ${scene.h}`;
	if (scene.kind === "tri") return `legs ${scene.a} and ${scene.b}`;
	if (scene.kind === "add") return `${scene.w} by ${scene.h}, plus ${scene.w2} by ${scene.h2}`;
	return `${scene.w} by ${scene.h}, cut ${scene.w2} by ${scene.h2}`;
}
function takeFour$4(answer, extra) {
	const choices = [];
	for (const item of [answer, ...extra.map(String)]) {
		if (!choices.includes(item)) choices.push(item);
		if (choices.length === 4) return [
			choices[0],
			choices[1],
			choices[2],
			choices[3]
		];
	}
	throw new Error(`area choices for ${answer}`);
}
function choicesFor$3(scene) {
	const answer = areaOf(scene);
	const pool = [
		answer + 1,
		answer - 1,
		answer + 2,
		answer + 3
	];
	if (scene.kind === "rect") pool.push(scene.w + scene.h, scene.w, scene.h, scene.w * scene.h + scene.w);
	if (scene.kind === "tri") pool.push(scene.a * scene.b, scene.a + scene.b, scene.a, scene.b);
	if (scene.kind === "add") pool.push(scene.w * scene.h, scene.w2 * scene.h2, scene.w + scene.h + scene.w2 + scene.h2);
	if (scene.kind === "cut") pool.push(scene.w * scene.h, scene.w2 * scene.h2, scene.w * scene.h + scene.w2 * scene.h2);
	return takeFour$4(String(answer), pool.filter((n) => Number.isInteger(n) && n > 0 && n !== answer));
}
function sceneAt$1(id, slot) {
	if (id <= 6) return {
		kind: "rect",
		w: 2 + slot + (id - 1) % 2,
		h: 2 + (id + slot) % 4
	};
	if (id <= 11) {
		const pair = TRIS[(id - 7) * 3 + slot];
		return {
			kind: "tri",
			a: pair[0],
			b: pair[1]
		};
	}
	if (id <= 14) return {
		kind: "add",
		w: 3 + slot,
		h: 2 + (id + slot) % 3,
		w2: 2 + slot % 2,
		h2: 2 + (id - 12) % 2
	};
	return {
		kind: "cut",
		w: 6 + slot,
		h: 5 + (id === 16 ? 1 : 0),
		w2: 2 + slot,
		h2: 2
	};
}
function promptAt$2(id, slot) {
	const scene = sceneAt$1(id, slot);
	const answer = String(areaOf(scene));
	return {
		kicker: areaKicker(scene),
		ask: areaAsk(scene),
		scene,
		choices: choicesFor$3(scene),
		answer,
		blurb: areaBlurb(scene)
	};
}
var AREA_LEVELS = TITLES$7.map((title, index) => ({
	id: index + 1,
	title,
	prompts: [
		0,
		1,
		2
	].map((slot) => promptAt$2(index + 1, slot))
}));
function auditArea() {
	const errors = [];
	if (AREA_LEVELS.length !== 16) errors.push(`levels ${AREA_LEVELS.length}`);
	AREA_LEVELS.forEach((level, index) => {
		if (level.id !== index + 1) errors.push(`id ${level.id}`);
		if (level.prompts.length !== 3) errors.push(`prompts ${level.id}`);
		for (const prompt of level.prompts) {
			const scene = prompt.scene;
			const area = areaOf(scene);
			if (!Number.isInteger(area) || area <= 0) errors.push(`area ${level.id} ${area}`);
			if (prompt.answer !== String(area)) errors.push(`answer ${level.id} ${prompt.answer}`);
			if (prompt.blurb !== areaBlurb(scene)) errors.push(`blurb ${level.id}`);
			if (prompt.ask !== areaAsk(scene)) errors.push(`ask ${level.id}`);
			if (new Set(prompt.choices).size !== 4 || !prompt.choices.includes(prompt.answer)) errors.push(`choices ${level.id}`);
			for (const choice of prompt.choices) if (choice !== prompt.answer && Number(choice) === area) errors.push(`decoy ${level.id} ${choice}`);
			if (scene.kind === "rect" && (scene.w < 2 || scene.h < 2)) errors.push(`rect ${level.id}`);
			if (scene.kind === "tri" && scene.a * scene.b % 2 !== 0) errors.push(`tri ${level.id}`);
			if (scene.kind === "add" && (scene.w < 1 || scene.h < 1 || scene.w2 < 1 || scene.h2 < 1)) errors.push(`add ${level.id}`);
			if (scene.kind === "cut" && (scene.w2 >= scene.w || scene.h2 >= scene.h || scene.w2 < 1 || scene.h2 < 1)) errors.push(`cut ${level.id}`);
		}
	});
	return errors;
}
function cellSize(span) {
	return span > 10 ? 12 : 16;
}
function GoldBlock({ w, h, x, y, cell }) {
	const lines = [];
	for (let i = 0; i <= w; i++) lines.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
		x1: x + i * cell,
		y1: y,
		x2: x + i * cell,
		y2: y + h * cell,
		className: "text-line",
		stroke: "currentColor"
	}, `v${i}`));
	for (let j = 0; j <= h; j++) lines.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
		x1: x,
		y1: y + j * cell,
		x2: x + w * cell,
		y2: y + j * cell,
		className: "text-line",
		stroke: "currentColor"
	}, `h${j}`));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
		x,
		y,
		width: w * cell,
		height: h * cell,
		className: "text-gold/30",
		fill: "currentColor"
	}), lines] });
}
function SideLabel({ x, y, value, anchor }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
		x,
		y,
		textAnchor: anchor,
		fontSize: "12",
		className: "fill-current font-mono text-cream",
		children: value
	});
}
function AreaFigure({ scene }) {
	if (scene.kind === "rect") {
		const cell = cellSize(Math.max(scene.w, scene.h));
		const width = 28 + scene.w * cell + 28;
		const height = 20 + scene.h * cell + 28;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: `0 0 ${width} ${height}`,
			className: "mx-auto h-40 w-full max-w-xs",
			role: "img",
			"aria-label": `Rectangle ${scene.w} by ${scene.h}`,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoldBlock, {
					w: scene.w,
					h: scene.h,
					x: 28,
					y: 12,
					cell
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SideLabel, {
					x: 28 + scene.w * cell / 2,
					y: height - 8,
					value: scene.w,
					anchor: "middle"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SideLabel, {
					x: 10,
					y: 12 + scene.h * cell / 2,
					value: scene.h,
					anchor: "middle"
				})
			]
		});
	}
	if (scene.kind === "tri") {
		const cell = cellSize(Math.max(scene.a, scene.b));
		const width = 28 + scene.a * cell + 28;
		const height = 20 + scene.b * cell + 28;
		const x = 28;
		const y = 12;
		const points = `${x},${y + scene.b * cell} ${x + scene.a * cell},${y + scene.b * cell} ${x},${y}`;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: `0 0 ${width} ${height}`,
			className: "mx-auto h-40 w-full max-w-xs",
			role: "img",
			"aria-label": `Right triangle legs ${scene.a} and ${scene.b}`,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
					points,
					className: "text-gold/30",
					fill: "currentColor"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
					points,
					className: "text-gold",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "2"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SideLabel, {
					x: x + scene.a * cell / 2,
					y: height - 8,
					value: scene.a,
					anchor: "middle"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SideLabel, {
					x: 10,
					y: y + scene.b * cell / 2,
					value: scene.b,
					anchor: "middle"
				})
			]
		});
	}
	if (scene.kind === "add") {
		const cell = cellSize(Math.max(scene.w, scene.h, scene.w2, scene.h2));
		const gap = 16;
		const tall = Math.max(scene.h, scene.h2);
		const width = 28 + scene.w * cell + gap + scene.w2 * cell + 28;
		const height = 20 + tall * cell + 28;
		const x2 = 28 + scene.w * cell + gap;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: `0 0 ${width} ${height}`,
			className: "mx-auto h-40 w-full max-w-xs",
			role: "img",
			"aria-label": `Two blocks, ${scene.w} by ${scene.h} and ${scene.w2} by ${scene.h2}`,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoldBlock, {
					w: scene.w,
					h: scene.h,
					x: 28,
					y: 12 + (tall - scene.h) * cell,
					cell
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoldBlock, {
					w: scene.w2,
					h: scene.h2,
					x: x2,
					y: 12 + (tall - scene.h2) * cell,
					cell
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SideLabel, {
					x: 28 + scene.w * cell / 2,
					y: height - 8,
					value: scene.w,
					anchor: "middle"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SideLabel, {
					x: x2 + scene.w2 * cell / 2,
					y: height - 8,
					value: scene.w2,
					anchor: "middle"
				})
			]
		});
	}
	const cell = cellSize(Math.max(scene.w, scene.h));
	const width = 28 + scene.w * cell + 28;
	const height = 20 + scene.h * cell + 28;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: `0 0 ${width} ${height}`,
		className: "mx-auto h-40 w-full max-w-xs",
		role: "img",
		"aria-label": `Rectangle ${scene.w} by ${scene.h} with a ${scene.w2} by ${scene.h2} cut`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoldBlock, {
				w: scene.w,
				h: scene.h,
				x: 28,
				y: 12,
				cell
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: 28,
				y: 12,
				width: scene.w2 * cell,
				height: scene.h2 * cell,
				className: "text-ink",
				fill: "currentColor"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: 28,
				y: 12,
				width: scene.w2 * cell,
				height: scene.h2 * cell,
				className: "text-line",
				fill: "none",
				stroke: "currentColor"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SideLabel, {
				x: 28 + scene.w * cell / 2,
				y: height - 8,
				value: scene.w,
				anchor: "middle"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SideLabel, {
				x: 10,
				y: 12 + scene.h * cell / 2,
				value: scene.h,
				anchor: "middle"
			})
		]
	});
}
function AreaProof({ active = true, onExit }) {
	const [mode, setMode] = (0, import_react.useState)("bench");
	if (mode === "questions") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative h-dvh",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoundProof, {
			active,
			onExit,
			track: "area",
			mark: "□",
			title: "Area",
			menuKicker: "GEOMETRY",
			menuTitle: "Count the gold.",
			menuBody: "Rectangles, triangles, and blocks with a piece missing. The unit square is 1. Keys 1 to 4. A miss costs a heart. Sixteen levels.",
			levels: AREA_LEVELS,
			audit: auditArea,
			renderScene: (prompt) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AreaFigure, { scene: prompt.scene }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-center font-mono text-xs text-mist",
				children: areaCaption(prompt.scene)
			})] })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuestionsChip, {
			label: "Bench",
			onClick: () => setMode("bench")
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AreaBench, {
		onExit,
		onQuestions: () => setMode("questions")
	});
}
var DOOR_SPRING = {
	stiffness: 260,
	damping: 28,
	mass: 1
};
var ARRIVE_SPRING = {
	stiffness: 170,
	damping: 12,
	mass: 1
};
var ARRIVE_KICK = -2.2;
function clamp01(n) {
	if (!Number.isFinite(n)) return 0;
	return Math.min(1, Math.max(0, n));
}
/** Draw position for a traveling mark. Negative anticipation stays at the start. */
function arriveDraw(t) {
	if (!Number.isFinite(t)) return 0;
	return Math.min(1, Math.max(0, t));
}
function mix(from, to, t) {
	return from + (to - from) * t;
}
function doorPose(t) {
	const u = clamp01(t);
	return {
		lobbyOpacity: clamp01(1 - t),
		lobbyScale: 1 + u * .035,
		stationOpacity: u,
		stationY: (1 - t) * 22
	};
}
var FIXED = 1 / 120;
var MAX_FRAME = .05;
function createSpring(value, options) {
	return {
		value,
		velocity: options?.velocity ?? 0,
		target: options?.target ?? value,
		stiffness: options?.stiffness ?? 80,
		damping: options?.damping ?? 14,
		mass: options?.mass && options.mass > 0 ? options.mass : 1
	};
}
function createClock() {
	return { leftover: 0 };
}
function integrate$1(spring, h) {
	const force = -spring.stiffness * (spring.value - spring.target) - spring.damping * spring.velocity;
	spring.velocity += force / spring.mass * h;
	spring.value += spring.velocity * h;
}
function consume(dt, clock, step) {
	clock.leftover += Math.min(Math.max(dt, 0), MAX_FRAME);
	let guard = 0;
	while (clock.leftover >= FIXED && guard < 8) {
		step(FIXED);
		clock.leftover -= FIXED;
		guard += 1;
	}
}
/** Fixed-step spring. Same elapsed time lands near the same place at 30 Hz and 144 Hz. */
function stepSpring(spring, dt, clock = createClock()) {
	consume(dt, clock, (h) => integrate$1(spring, h));
}
function kick(spring, velocity) {
	spring.velocity += velocity;
}
function prefersReducedMotion() {
	if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches === true;
}
/** 0 while a mark is traveling, 1 when it has arrived. Reduced motion snaps to 1. */
function useArrive(token) {
	const [value, setValue] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		if (prefersReducedMotion()) {
			setValue(1);
			return;
		}
		const spring = createSpring(0, {
			target: 1,
			...ARRIVE_SPRING
		});
		kick(spring, ARRIVE_KICK);
		const clock = createClock();
		let raf = 0;
		let last = performance.now();
		let frames = 0;
		const loop = (now) => {
			const dt = Math.min(.05, Math.max(0, (now - last) / 1e3));
			last = now;
			stepSpring(spring, dt, clock);
			frames += 1;
			if (Math.abs(spring.value - 1) < .012 && Math.abs(spring.velocity) < .08 || frames > 180) {
				setValue(1);
				return;
			}
			setValue(spring.value);
			raf = requestAnimationFrame(loop);
		};
		raf = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(raf);
	}, [token]);
	return value;
}
function useDoor(open) {
	const [value, setValue] = (0, import_react.useState)(open ? 1 : 0);
	const valueRef = (0, import_react.useRef)(value);
	valueRef.current = value;
	(0, import_react.useEffect)(() => {
		const target = open ? 1 : 0;
		if (prefersReducedMotion()) {
			setValue(target);
			return;
		}
		const spring = createSpring(valueRef.current, {
			target,
			...DOOR_SPRING
		});
		const clock = createClock();
		let raf = 0;
		let last = performance.now();
		const loop = (now) => {
			const dt = Math.min(.05, Math.max(0, (now - last) / 1e3));
			last = now;
			stepSpring(spring, dt, clock);
			if (Math.abs(spring.value - target) < .01 && Math.abs(spring.velocity) < .08) {
				setValue(target);
				return;
			}
			setValue(spring.value);
			raf = requestAnimationFrame(loop);
		};
		raf = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(raf);
	}, [open]);
	return value;
}
var TITLES$6 = [
	"Add to x",
	"Still adding",
	"Find x",
	"One step",
	"Subtract",
	"Missing start",
	"Add it back",
	"Undo the minus",
	"Times a number",
	"Divide back",
	"Shared factor",
	"Even split",
	"Two moves",
	"Then divide",
	"Both pans",
	"Last balance"
];
function holds(eq, n) {
	if (eq.form === "add") return n + eq.a === eq.x + eq.a;
	if (eq.form === "sub") return n - eq.a === eq.x - eq.a;
	if (eq.form === "mul") return eq.a * n === eq.a * eq.x;
	return eq.a * n + eq.b === eq.a * eq.x + eq.b;
}
function equationSides(eq) {
	if (eq.form === "add") return {
		left: `x + ${eq.a}`,
		right: eq.x + eq.a
	};
	if (eq.form === "sub") return {
		left: `x − ${eq.a}`,
		right: eq.x - eq.a
	};
	if (eq.form === "mul") return {
		left: `${eq.a}x`,
		right: eq.a * eq.x
	};
	return {
		left: eq.b < 0 ? `${eq.a}x − ${-eq.b}` : eq.b > 0 ? `${eq.a}x + ${eq.b}` : `${eq.a}x`,
		right: eq.a * eq.x + eq.b
	};
}
function blurbFor(eq, left, right) {
	if (eq.form === "add") return `${left} = ${right}. Subtract ${eq.a}. x = ${eq.x}.`;
	if (eq.form === "sub") return `${left} = ${right}. Add ${eq.a}. x = ${eq.x}.`;
	if (eq.form === "mul") return `${left} = ${right}. Divide by ${eq.a}. x = ${eq.x}.`;
	if (eq.b > 0) return `${left} = ${right}. Subtract ${eq.b}, then divide by ${eq.a}. x = ${eq.x}.`;
	if (eq.b < 0) return `${left} = ${right}. Add ${-eq.b}, then divide by ${eq.a}. x = ${eq.x}.`;
	return `${left} = ${right}. Divide by ${eq.a}. x = ${eq.x}.`;
}
function spec(id, slot) {
	if (id <= 4) return {
		form: "add",
		a: 1 + id + slot,
		x: 2 + id + slot
	};
	if (id <= 8) {
		const a = 2 + slot;
		return {
			form: "sub",
			a,
			x: a + 3 + id
		};
	}
	if (id <= 12) return {
		form: "mul",
		a: 2 + (id + slot) % 4,
		x: 2 + slot + id % 3
	};
	return {
		form: "two",
		a: 2 + slot % 3,
		b: slot === 1 ? -1 : 1 + id % 3,
		x: 2 + slot
	};
}
function decoys(eq, right) {
	const pool = [
		eq.x + 1,
		eq.x - 1,
		right,
		right + 1,
		right - 1
	];
	if (eq.form === "add") pool.push(right + eq.a, eq.a, eq.x + eq.a);
	if (eq.form === "sub") pool.push(right - eq.a, eq.a, eq.x + eq.a);
	if (eq.form === "mul") pool.push(eq.a, right - eq.a, eq.x * eq.a, right + eq.a);
	if (eq.form === "two") pool.push(eq.a * eq.x, eq.x + eq.b, eq.a, right - eq.b);
	const out = [];
	for (const n of pool) {
		if (!Number.isInteger(n) || n === eq.x || holds(eq, n)) continue;
		if (n < -9 || n > 80) continue;
		if (out.includes(n)) continue;
		out.push(n);
		if (out.length === 3) break;
	}
	return out;
}
function promptFor$2(id, slot) {
	const eq = spec(id, slot);
	const { left, right } = equationSides(eq);
	const misses = decoys(eq, right);
	if (misses.length < 3) throw new Error(`balance decoys ${id} ${slot} ${left}`);
	const answer = String(eq.x);
	return {
		kicker: eq.form === "two" ? "Two steps" : "One step",
		ask: "The pans balance. What is x?",
		scene: {
			eq,
			left,
			right
		},
		choices: [answer, ...misses.map(String)],
		answer,
		blurb: blurbFor(eq, left, right)
	};
}
var BALANCE_LEVELS = TITLES$6.map((title, index) => ({
	id: index + 1,
	title,
	prompts: [
		0,
		1,
		2
	].map((slot) => promptFor$2(index + 1, slot))
}));
function auditBalance() {
	const errors = [];
	if (BALANCE_LEVELS.length !== 16) errors.push(`levels ${BALANCE_LEVELS.length}`);
	for (const level of BALANCE_LEVELS) {
		if (level.prompts.length !== 3) errors.push(`prompts ${level.id}`);
		for (const prompt of level.prompts) {
			const { eq, left, right } = prompt.scene;
			const sides = equationSides(eq);
			if (sides.left !== left || sides.right !== right) errors.push(`sides ${level.id}`);
			if (eq.form === "sub" && right <= 0) errors.push(`sub right ${level.id}`);
			if ((eq.form === "mul" || eq.form === "two") && eq.a === 0) errors.push(`zero ${level.id}`);
			if (!holds(eq, eq.x)) errors.push(`holds ${level.id}`);
			if (prompt.answer !== String(eq.x)) errors.push(`answer ${level.id}`);
			if (!prompt.choices.includes(prompt.answer)) errors.push(`missing ${level.id}`);
			if (new Set(prompt.choices).size !== 4) errors.push(`dup ${level.id} ${prompt.choices.join(",")}`);
			for (const choice of prompt.choices) {
				const ok = holds(eq, Number(choice));
				if (choice === prompt.answer && !ok) errors.push(`true miss ${level.id}`);
				if (choice !== prompt.answer && ok) errors.push(`false hit ${level.id} ${choice}`);
			}
		}
	}
	return errors;
}
function valueAt(pan, x) {
	return pan.a * x + pan.b;
}
function balanced(state, x) {
	return valueAt(state.left, x) === valueAt(state.right, x);
}
function formatPan(pan) {
	const { a, b } = pan;
	if (a === 0 && b === 0) return "0";
	const bits = [];
	if (a !== 0) {
		if (a === 1) bits.push("x");
		else if (a === -1) bits.push("-x");
		else bits.push(`${a}x`);
	}
	if (b !== 0) {
		if (bits.length === 0) bits.push(String(b));
		else if (b > 0) bits.push(`+ ${b}`);
		else bits.push(`- ${-b}`);
	}
	return bits.join(" ");
}
function formatOp(op) {
	if (op.kind === "add") {
		if (op.n < 0) return `Subtract ${-op.n} from both pans`;
		return `Add ${op.n} to both pans`;
	}
	if (op.kind === "div") return `Divide both pans by ${op.n}`;
	return `Multiply both pans by ${op.n}`;
}
function applyScale(state, op) {
	if (op.kind === "add") return {
		left: {
			a: state.left.a,
			b: state.left.b + op.n
		},
		right: {
			a: state.right.a,
			b: state.right.b + op.n
		}
	};
	if (op.n === 0) return null;
	if (op.kind === "mul") return {
		left: {
			a: state.left.a * op.n,
			b: state.left.b * op.n
		},
		right: {
			a: state.right.a * op.n,
			b: state.right.b * op.n
		}
	};
	if ([
		state.left.a,
		state.left.b,
		state.right.a,
		state.right.b
	].some((value) => value % op.n !== 0)) return null;
	return {
		left: {
			a: state.left.a / op.n,
			b: state.left.b / op.n
		},
		right: {
			a: state.right.a / op.n,
			b: state.right.b / op.n
		}
	};
}
function scaleSolved(state, x) {
	return state.left.a === 1 && state.left.b === 0 && state.right.a === 0 && state.right.b === x;
}
function pansFor(eq) {
	if (eq.form === "add") return {
		left: {
			a: 1,
			b: eq.a
		},
		right: {
			a: 0,
			b: eq.x + eq.a
		}
	};
	if (eq.form === "sub") return {
		left: {
			a: 1,
			b: -eq.a
		},
		right: {
			a: 0,
			b: eq.x - eq.a
		}
	};
	if (eq.form === "mul") return {
		left: {
			a: eq.a,
			b: 0
		},
		right: {
			a: 0,
			b: eq.a * eq.x
		}
	};
	return {
		left: {
			a: eq.a,
			b: eq.b
		},
		right: {
			a: 0,
			b: eq.a * eq.x + eq.b
		}
	};
}
function solutionFor(eq) {
	if (eq.form === "add") return [{
		kind: "add",
		n: -eq.a
	}];
	if (eq.form === "sub") return [{
		kind: "add",
		n: eq.a
	}];
	if (eq.form === "mul") return [{
		kind: "div",
		n: eq.a
	}];
	const ops = [];
	if (eq.b !== 0) ops.push({
		kind: "add",
		n: -eq.b
	});
	ops.push({
		kind: "div",
		n: eq.a
	});
	return ops;
}
function sameOp(a, b) {
	return a.kind === b.kind && a.n === b.n;
}
function withDecoys(solution) {
	const ops = solution.slice();
	for (const extra of [{
		kind: "add",
		n: 1
	}, {
		kind: "mul",
		n: 2
	}]) if (!ops.some((op) => sameOp(op, extra))) ops.push(extra);
	return ops;
}
var BALANCE_PLAYS = BALANCE_LEVELS.map((level) => {
	const eq = level.prompts[0].scene.eq;
	const solution = solutionFor(eq);
	return {
		id: level.id,
		title: level.title,
		prompt: level.prompts[0].scene.left,
		x: eq.x,
		start: pansFor(eq),
		ops: withDecoys(solution),
		solution
	};
});
function useNod(token) {
	const [angle, setAngle] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		if (token === 0 || prefersReducedMotion()) {
			setAngle(0);
			return;
		}
		const started = performance.now();
		let raf = 0;
		const loop = (now) => {
			const u = (now - started) / 480;
			if (u >= 1) {
				setAngle(0);
				return;
			}
			setAngle(Math.sin(u * Math.PI * 2) * (1 - u) * 3.2);
			raf = requestAnimationFrame(loop);
		};
		raf = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(raf);
	}, [token]);
	return angle;
}
function Beam({ state, angle }) {
	const left = formatPan(state.left);
	const right = formatPan(state.right);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 320 150",
		className: "mx-auto h-40 w-full max-w-md",
		role: "img",
		"aria-label": `${left} on the left pan, ${right} on the right pan`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
			points: "160,108 146,132 174,132",
			className: "text-gold",
			fill: "currentColor"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
			transform: `rotate(${angle} 160 108)`,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: "36",
					y1: "48",
					x2: "284",
					y2: "48",
					className: "text-gold",
					stroke: "currentColor",
					strokeWidth: "4"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: "160",
					y1: "48",
					x2: "160",
					y2: "108",
					className: "text-gold",
					stroke: "currentColor",
					strokeWidth: "4"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: "78",
					y1: "48",
					x2: "78",
					y2: "72",
					className: "text-line",
					stroke: "currentColor"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: "242",
					y1: "48",
					x2: "242",
					y2: "72",
					className: "text-line",
					stroke: "currentColor"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "28",
					y: "72",
					width: "100",
					height: "40",
					rx: "10",
					className: "text-gold",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "2"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "192",
					y: "72",
					width: "100",
					height: "40",
					rx: "10",
					className: "text-mint",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "2"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					x: "78",
					y: "98",
					textAnchor: "middle",
					className: "text-cream",
					fill: "currentColor",
					fontSize: "16",
					fontFamily: "IBM Plex Mono, monospace",
					children: left
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					x: "242",
					y: "98",
					textAnchor: "middle",
					className: "text-mint",
					fill: "currentColor",
					fontSize: "16",
					fontFamily: "IBM Plex Mono, monospace",
					children: right
				})
			]
		})]
	});
}
function BalanceLab({ onExit, onQuestions }) {
	const [levelId, setLevelId] = (0, import_react.useState)(1);
	const play = BALANCE_PLAYS[levelId - 1] ?? BALANCE_PLAYS[0];
	const [state, setState] = (0, import_react.useState)(play.start);
	const [nod, setNod] = (0, import_react.useState)(0);
	const [run, setRun] = (0, import_react.useState)(0);
	const scored = (0, import_react.useRef)(false);
	const angle = useNod(nod);
	(0, import_react.useEffect)(() => {
		scored.current = false;
		setState(play.start);
		setNod(0);
	}, [play]);
	function act(index) {
		if (scaleSolved(state, play.x)) return;
		const op = play.ops[index];
		const next = applyScale(state, op);
		if (!next) return;
		setState(next);
		setNod((count) => count + 1);
		if (!scaleSolved(next, play.x) || scored.current) return;
		scored.current = true;
		const score = 140;
		setRun((total) => {
			const sum = total + score;
			noteClear("balance", play.id, score, sum);
			return sum;
		});
	}
	const solved = scaleSolved(state, play.x);
	const still = balanced(state, play.x);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BenchFrame, {
		kicker: "BALANCE LAB",
		title: play.title,
		meta: `${play.id}/16`,
		onExit,
		onQuestions,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LevelStrip, {
				count: BALANCE_PLAYS.length,
				current: play.id,
				onPick: setLevelId
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-sm text-cream",
				children: play.prompt
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-mist",
				children: "Do the same thing to both pans. The beam nods, then settles, because equality is still true."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 rounded-2xl border border-line bg-ink",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Beam, {
					state,
					angle
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 font-mono text-sm text-gold",
				"aria-live": "polite",
				children: solved ? "x stands alone. The right pan is what it equals." : still ? "Still balanced. x is not alone yet." : "The pans disagree. That move is not available."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 grid gap-2",
				children: play.ops.map((op, index) => {
					const legal = !solved && applyScale(state, op) !== null;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: !legal,
						onClick: () => act(index),
						className: "min-h-11 rounded-xl border border-line bg-panel px-4 text-left text-sm text-cream disabled:opacity-40",
						children: formatOp(op)
					}, `${play.id}-${formatOp(op)}`);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => {
							scored.current = solved;
							setState(play.start);
						},
						className: "min-h-11 rounded-full border border-line px-4 text-sm text-cream",
						children: "Reset"
					}),
					solved && play.id < BALANCE_PLAYS.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setLevelId(play.id + 1),
						className: "min-h-11 rounded-full bg-gold px-4 text-sm font-extrabold text-ink",
						children: "Next"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-xs text-mist",
						children: ["Run ", run]
					})
				]
			})
		]
	});
}
function BalanceFigure({ left, right }) {
	const angle = mix(6, 0, useArrive(`${left}=${right}`));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 220 108",
		className: "mx-auto h-36 w-full max-w-xs",
		role: "img",
		"aria-label": `${left} balances ${right}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
			points: "110,78 100,96 120,96",
			className: "text-gold",
			fill: "currentColor"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
			transform: `rotate(${angle} 110 78)`,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: "28",
					y1: "34",
					x2: "192",
					y2: "34",
					className: "text-gold",
					stroke: "currentColor",
					strokeWidth: "3"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: "110",
					y1: "34",
					x2: "110",
					y2: "78",
					className: "text-gold",
					stroke: "currentColor",
					strokeWidth: "3"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: "52",
					y1: "34",
					x2: "52",
					y2: "52",
					className: "text-line",
					stroke: "currentColor"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: "168",
					y1: "34",
					x2: "168",
					y2: "52",
					className: "text-line",
					stroke: "currentColor"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "16",
					y: "52",
					width: "72",
					height: "32",
					rx: "8",
					className: "text-gold",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "2"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "132",
					y: "52",
					width: "72",
					height: "32",
					rx: "8",
					className: "text-mint",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "2"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					x: "52",
					y: "73",
					textAnchor: "middle",
					className: "font-mono text-cream",
					fill: "currentColor",
					fontSize: "13",
					children: left
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					x: "168",
					y: "73",
					textAnchor: "middle",
					className: "font-mono text-mint",
					fill: "currentColor",
					fontSize: "13",
					children: right
				})
			]
		})]
	});
}
function BalanceProof({ active = true, onExit }) {
	const [mode, setMode] = (0, import_react.useState)("lab");
	if (mode === "questions") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative h-dvh",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoundProof, {
			active,
			onExit,
			track: "balance",
			mark: "x",
			title: "Balance",
			menuKicker: "ALGEBRA",
			menuTitle: "Level the pans.",
			menuBody: "The left pan holds an expression in x. The right pan holds a number. They balance. Name x. Keys 1 to 4. A miss costs a heart. Sixteen levels.",
			levels: BALANCE_LEVELS,
			audit: auditBalance,
			renderScene: (prompt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BalanceFigure, {
				left: prompt.scene.left,
				right: prompt.scene.right
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuestionsChip, {
			label: "Bench",
			onClick: () => setMode("lab")
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BalanceLab, {
		onExit,
		onQuestions: () => setMode("questions")
	});
}
var PROBLEMS = [
	{
		canon: "4",
		a: "2²",
		domain: "arith",
		blurb: "Two squared.",
		minWave: 1
	},
	{
		canon: "4",
		a: "√16",
		domain: "arith",
		blurb: "Square root of 16.",
		minWave: 1
	},
	{
		canon: "4",
		a: "8÷2",
		domain: "arith",
		blurb: "Eight divided by two.",
		minWave: 1
	},
	{
		canon: "4",
		a: "6-2",
		domain: "arith",
		blurb: "Six minus two.",
		minWave: 1
	},
	{
		canon: "4",
		a: "4·cos",
		b: "0°",
		domain: "trig",
		blurb: "4 × cos 0°. Cosine of 0° is 1.",
		minWave: 5
	},
	{
		canon: "5",
		a: "3+2",
		domain: "arith",
		blurb: "Three plus two.",
		minWave: 3
	},
	{
		canon: "5",
		a: "√25",
		domain: "arith",
		blurb: "Square root of 25.",
		minWave: 3
	},
	{
		canon: "5",
		a: "10÷2",
		domain: "arith",
		blurb: "Ten divided by two.",
		minWave: 3
	},
	{
		canon: "5",
		a: "3-4-5",
		b: "hyp",
		domain: "geom",
		blurb: "A 3-4-5 right triangle. The hypotenuse is 5.",
		minWave: 3
	},
	{
		canon: "6",
		a: "2×3",
		domain: "arith",
		blurb: "Two times three.",
		minWave: 2
	},
	{
		canon: "6",
		a: "√36",
		domain: "arith",
		blurb: "Square root of 36.",
		minWave: 2
	},
	{
		canon: "6",
		a: "9-3",
		domain: "arith",
		blurb: "Nine minus three.",
		minWave: 2
	},
	{
		canon: "6",
		a: "12÷2",
		domain: "arith",
		blurb: "Twelve divided by two.",
		minWave: 2
	},
	{
		canon: "8",
		a: "2³",
		domain: "arith",
		blurb: "Two cubed.",
		minWave: 1
	},
	{
		canon: "8",
		a: "√64",
		domain: "arith",
		blurb: "Square root of 64.",
		minWave: 1
	},
	{
		canon: "8",
		a: "4×2",
		domain: "arith",
		blurb: "Four times two.",
		minWave: 1
	},
	{
		canon: "8",
		a: "F=ma",
		b: "2·4",
		domain: "phys",
		blurb: "Force = mass × acceleration. m = 2, a = 4.",
		minWave: 2
	},
	{
		canon: "8",
		a: "16·cos",
		b: "60°",
		domain: "trig",
		blurb: "16 × cos 60°. Cosine of 60° is 1/2.",
		minWave: 5
	},
	{
		canon: "9",
		a: "3²",
		domain: "arith",
		blurb: "Three squared.",
		minWave: 1
	},
	{
		canon: "9",
		a: "√81",
		domain: "arith",
		blurb: "Square root of 81.",
		minWave: 1
	},
	{
		canon: "9",
		a: "18÷2",
		domain: "arith",
		blurb: "Eighteen divided by two.",
		minWave: 1
	},
	{
		canon: "9",
		a: "6+3",
		domain: "arith",
		blurb: "Six plus three.",
		minWave: 1
	},
	{
		canon: "9",
		a: "9·sin",
		b: "90°",
		domain: "trig",
		blurb: "9 × sin 90°. Sine of 90° is 1.",
		minWave: 5
	},
	{
		canon: "10",
		a: "5×2",
		domain: "arith",
		blurb: "Five times two.",
		minWave: 4
	},
	{
		canon: "10",
		a: "√100",
		domain: "arith",
		blurb: "Square root of 100.",
		minWave: 4
	},
	{
		canon: "10",
		a: "p=mv",
		b: "2·5",
		domain: "phys",
		blurb: "Momentum = mass × velocity. m = 2, v = 5.",
		minWave: 4
	},
	{
		canon: "10",
		a: "10·tan",
		b: "45°",
		domain: "trig",
		blurb: "10 × tan 45°. Tangent of 45° is 1.",
		minWave: 5
	},
	{
		canon: "12",
		a: "3×4",
		domain: "arith",
		blurb: "Three times four.",
		minWave: 2
	},
	{
		canon: "12",
		a: "√144",
		domain: "arith",
		blurb: "Square root of 144.",
		minWave: 2
	},
	{
		canon: "12",
		a: "½bh",
		b: "6·4",
		domain: "geom",
		blurb: "Triangle area = ½ × base × height. b = 6, h = 4.",
		minWave: 2
	},
	{
		canon: "12",
		a: "W=Fd",
		b: "3·4",
		domain: "phys",
		blurb: "Work = force × distance. F = 3, d = 4.",
		minWave: 3
	},
	{
		canon: "15",
		a: "5×3",
		domain: "arith",
		blurb: "Five times three.",
		minWave: 4
	},
	{
		canon: "15",
		a: "45÷3",
		domain: "arith",
		blurb: "Forty-five divided by three.",
		minWave: 4
	},
	{
		canon: "15",
		a: "10+5",
		domain: "arith",
		blurb: "Ten plus five.",
		minWave: 4
	},
	{
		canon: "15",
		a: "√225",
		domain: "arith",
		blurb: "Square root of 225.",
		minWave: 4
	},
	{
		canon: "16",
		a: "4²",
		domain: "arith",
		blurb: "Four squared.",
		minWave: 3
	},
	{
		canon: "16",
		a: "2⁴",
		domain: "arith",
		blurb: "Two to the fourth.",
		minWave: 3
	},
	{
		canon: "16",
		a: "s²",
		b: "s=4",
		domain: "geom",
		blurb: "Area of a square. Side = 4.",
		minWave: 3
	},
	{
		canon: "16",
		a: "4s",
		b: "s=4",
		domain: "geom",
		blurb: "Perimeter of a square. Side = 4.",
		minWave: 3
	},
	{
		canon: "16",
		a: "½mv²",
		b: "2·4²",
		domain: "phys",
		blurb: "Kinetic energy ½mv². m = 2, v = 4.",
		minWave: 3
	},
	{
		canon: "18",
		a: "9×2",
		domain: "arith",
		blurb: "Nine times two.",
		minWave: 4
	},
	{
		canon: "18",
		a: "6×3",
		domain: "arith",
		blurb: "Six times three.",
		minWave: 4
	},
	{
		canon: "18",
		a: "36÷2",
		domain: "arith",
		blurb: "Thirty-six divided by two.",
		minWave: 4
	},
	{
		canon: "18",
		a: "F=ma",
		b: "3·6",
		domain: "phys",
		blurb: "Force = mass × acceleration. m = 3, a = 6.",
		minWave: 4
	},
	{
		canon: "20",
		a: "4×5",
		domain: "arith",
		blurb: "Four times five.",
		minWave: 5
	},
	{
		canon: "20",
		a: "√400",
		domain: "arith",
		blurb: "Square root of 400.",
		minWave: 5
	},
	{
		canon: "20",
		a: "100÷5",
		domain: "arith",
		blurb: "One hundred divided by five.",
		minWave: 5
	},
	{
		canon: "20",
		a: "2×10",
		domain: "arith",
		blurb: "Two times ten.",
		minWave: 5
	},
	{
		canon: "25",
		a: "5²",
		domain: "arith",
		blurb: "Five squared.",
		minWave: 5
	},
	{
		canon: "25",
		a: "√625",
		domain: "arith",
		blurb: "Square root of 625.",
		minWave: 5
	},
	{
		canon: "25",
		a: "s²",
		b: "s=5",
		domain: "geom",
		blurb: "Area of a square. Side = 5.",
		minWave: 5
	},
	{
		canon: "25",
		a: "50÷2",
		domain: "arith",
		blurb: "Fifty divided by two.",
		minWave: 5
	},
	{
		canon: "36",
		a: "6²",
		domain: "arith",
		blurb: "Six squared.",
		minWave: 6
	},
	{
		canon: "36",
		a: "9×4",
		domain: "arith",
		blurb: "Nine times four.",
		minWave: 6
	},
	{
		canon: "36",
		a: "3×12",
		domain: "arith",
		blurb: "Three times twelve.",
		minWave: 6
	},
	{
		canon: "36",
		a: "√1296",
		domain: "arith",
		blurb: "Square root of 1296.",
		minWave: 6
	},
	{
		canon: "φ",
		a: "φ",
		domain: "const",
		blurb: "Phi, the golden ratio.",
		minWave: 6
	},
	{
		canon: "φ",
		a: "1+√5",
		b: "÷ 2",
		domain: "const",
		blurb: "(1 + √5) / 2, the golden ratio.",
		minWave: 6
	},
	{
		canon: "φ",
		a: "1.618",
		domain: "const",
		blurb: "Phi, about 1.618.",
		minWave: 6
	},
	{
		canon: "4π",
		a: "πr²",
		b: "r=2",
		domain: "geom",
		blurb: "Circle area πr² with radius 2, which is 4π.",
		minWave: 6
	},
	{
		canon: "4π",
		a: "2πr",
		b: "r=2",
		domain: "geom",
		blurb: "Circumference 2πr with radius 2, which is 4π.",
		minWave: 6
	},
	{
		canon: "4π",
		a: "πd",
		b: "d=4",
		domain: "geom",
		blurb: "Circumference πd with diameter 4, which is 4π.",
		minWave: 6
	},
	{
		canon: "7",
		a: "3+4",
		domain: "arith",
		blurb: "Three plus four.",
		minWave: 4
	},
	{
		canon: "7",
		a: "√49",
		domain: "arith",
		blurb: "Square root of 49.",
		minWave: 4
	},
	{
		canon: "7",
		a: "14÷2",
		domain: "arith",
		blurb: "Fourteen divided by two.",
		minWave: 4
	},
	{
		canon: "7",
		a: "10−3",
		domain: "arith",
		blurb: "Ten minus three.",
		minWave: 4
	},
	{
		canon: "1",
		a: "sin",
		b: "90°",
		domain: "trig",
		blurb: "Sine of 90° is 1.",
		minWave: 7
	},
	{
		canon: "1",
		a: "cos",
		b: "0°",
		domain: "trig",
		blurb: "Cosine of 0° is 1.",
		minWave: 7
	},
	{
		canon: "1",
		a: "tan",
		b: "45°",
		domain: "trig",
		blurb: "Tangent of 45° is 1.",
		minWave: 7
	},
	{
		canon: "1",
		a: "7÷7",
		domain: "arith",
		blurb: "Seven divided by seven.",
		minWave: 7
	},
	{
		canon: "24",
		a: "6×4",
		domain: "arith",
		blurb: "Six times four.",
		minWave: 5
	},
	{
		canon: "24",
		a: "8×3",
		domain: "arith",
		blurb: "Eight times three.",
		minWave: 5
	},
	{
		canon: "24",
		a: "48÷2",
		domain: "arith",
		blurb: "Forty-eight divided by two.",
		minWave: 5
	},
	{
		canon: "24",
		a: "½bh",
		b: "8·6",
		domain: "geom",
		blurb: "Triangle area ½bh. Base 8, height 6.",
		minWave: 5
	},
	{
		canon: "27",
		a: "3³",
		domain: "arith",
		blurb: "Three cubed.",
		minWave: 7
	},
	{
		canon: "27",
		a: "9×3",
		domain: "arith",
		blurb: "Nine times three.",
		minWave: 7
	},
	{
		canon: "27",
		a: "√729",
		domain: "arith",
		blurb: "Square root of 729.",
		minWave: 7
	},
	{
		canon: "27",
		a: "F=ma",
		b: "9·3",
		domain: "phys",
		blurb: "Force = mass × acceleration. m = 9, a = 3.",
		minWave: 7
	},
	{
		canon: "30",
		a: "5×6",
		domain: "arith",
		blurb: "Five times six.",
		minWave: 9
	},
	{
		canon: "30",
		a: "60÷2",
		domain: "arith",
		blurb: "Sixty divided by two.",
		minWave: 9
	},
	{
		canon: "30",
		a: "10×3",
		domain: "arith",
		blurb: "Ten times three.",
		minWave: 9
	},
	{
		canon: "30",
		a: "p=mv",
		b: "5·6",
		domain: "phys",
		blurb: "Momentum = mass × velocity. m = 5, v = 6.",
		minWave: 9
	},
	{
		canon: "32",
		a: "2⁵",
		domain: "arith",
		blurb: "Two to the fifth.",
		minWave: 8
	},
	{
		canon: "32",
		a: "4×8",
		domain: "arith",
		blurb: "Four times eight.",
		minWave: 8
	},
	{
		canon: "32",
		a: "√1024",
		domain: "arith",
		blurb: "Square root of 1024.",
		minWave: 8
	},
	{
		canon: "32",
		a: "16×2",
		domain: "arith",
		blurb: "Sixteen times two.",
		minWave: 8
	},
	{
		canon: "½",
		a: "1÷2",
		domain: "arith",
		blurb: "One divided by two.",
		minWave: 8
	},
	{
		canon: "½",
		a: "sin",
		b: "30°",
		domain: "trig",
		blurb: "Sine of 30° is 1/2.",
		minWave: 8
	},
	{
		canon: "½",
		a: "cos",
		b: "60°",
		domain: "trig",
		blurb: "Cosine of 60° is 1/2.",
		minWave: 8
	},
	{
		canon: "½",
		a: "3÷6",
		domain: "arith",
		blurb: "Three divided by six.",
		minWave: 8
	},
	{
		canon: "48",
		a: "6×8",
		domain: "arith",
		blurb: "Six times eight.",
		minWave: 10
	},
	{
		canon: "48",
		a: "12×4",
		domain: "arith",
		blurb: "Twelve times four.",
		minWave: 10
	},
	{
		canon: "48",
		a: "96÷2",
		domain: "arith",
		blurb: "Ninety-six divided by two.",
		minWave: 10
	},
	{
		canon: "48",
		a: "W=Fd",
		b: "12·4",
		domain: "phys",
		blurb: "Work = force × distance. F = 12, d = 4.",
		minWave: 10
	},
	{
		canon: "49",
		a: "7²",
		domain: "arith",
		blurb: "Seven squared.",
		minWave: 12
	},
	{
		canon: "49",
		a: "√2401",
		domain: "arith",
		blurb: "Square root of 2401.",
		minWave: 12
	},
	{
		canon: "49",
		a: "98÷2",
		domain: "arith",
		blurb: "Ninety-eight divided by two.",
		minWave: 12
	},
	{
		canon: "49",
		a: "7×7",
		domain: "arith",
		blurb: "Seven times seven.",
		minWave: 12
	},
	{
		canon: "64",
		a: "8²",
		domain: "arith",
		blurb: "Eight squared.",
		minWave: 12
	},
	{
		canon: "64",
		a: "4³",
		domain: "arith",
		blurb: "Four cubed.",
		minWave: 12
	},
	{
		canon: "64",
		a: "2⁶",
		domain: "arith",
		blurb: "Two to the sixth.",
		minWave: 12
	},
	{
		canon: "64",
		a: "√4096",
		domain: "arith",
		blurb: "Square root of 4096.",
		minWave: 12
	},
	{
		canon: "2π",
		a: "2πr",
		b: "r=1",
		domain: "geom",
		blurb: "Circumference 2πr with radius 1.",
		minWave: 11
	},
	{
		canon: "2π",
		a: "πd",
		b: "d=2",
		domain: "geom",
		blurb: "Circumference πd with diameter 2.",
		minWave: 11
	},
	{
		canon: "2π",
		a: "2π",
		domain: "const",
		blurb: "One full turn, in radians.",
		minWave: 11
	}
];
var WAVES = [
	{
		canons: [
			"4",
			"8",
			"9"
		],
		rows: 5,
		shots: 8
	},
	{
		canons: [
			"6",
			"9",
			"12"
		],
		rows: 5,
		shots: 7
	},
	{
		canons: [
			"5",
			"8",
			"12",
			"16"
		],
		rows: 6,
		shots: 7
	},
	{
		canons: [
			"7",
			"9",
			"16"
		],
		rows: 6,
		shots: 7
	},
	{
		canons: [
			"8",
			"10",
			"18",
			"24"
		],
		rows: 6,
		shots: 6
	},
	{
		canons: [
			"12",
			"15",
			"20",
			"25"
		],
		rows: 6,
		shots: 6
	},
	{
		canons: [
			"9",
			"16",
			"27",
			"1"
		],
		rows: 7,
		shots: 6
	},
	{
		canons: [
			"6",
			"24",
			"32",
			"½"
		],
		rows: 7,
		shots: 6
	},
	{
		canons: [
			"18",
			"20",
			"30",
			"36"
		],
		rows: 7,
		shots: 5
	},
	{
		canons: [
			"15",
			"25",
			"48",
			"φ"
		],
		rows: 7,
		shots: 5
	},
	{
		canons: [
			"4",
			"16",
			"2π",
			"4π"
		],
		rows: 7,
		shots: 5
	},
	{
		canons: [
			"27",
			"36",
			"49",
			"64"
		],
		rows: 8,
		shots: 5
	},
	{
		canons: [
			"8",
			"24",
			"φ",
			"½",
			"1"
		],
		rows: 8,
		shots: 5
	},
	{
		canons: [
			"12",
			"32",
			"48",
			"4π"
		],
		rows: 8,
		shots: 4
	},
	{
		canons: [
			"7",
			"25",
			"49",
			"64",
			"φ"
		],
		rows: 8,
		shots: 4
	},
	{
		canons: [
			"9",
			"16",
			"36",
			"2π",
			"4π",
			"φ"
		],
		rows: 8,
		shots: 4
	}
];
var CAMPAIGN_LEVELS = WAVES.length;
function wavePlan(wave) {
	const i = Math.min(Math.max(wave, 1), WAVES.length) - 1;
	const extra = Math.max(0, wave - WAVES.length);
	const base = WAVES[i];
	return {
		canons: base.canons,
		rows: Math.min(8, base.rows + Math.floor(extra / 2)),
		shots: Math.max(4, base.shots - Math.floor(extra / 2))
	};
}
function problemsFor(wave, canons) {
	const list = PROBLEMS.filter((p) => canons.includes(p.canon) && p.minWave <= wave);
	if (list.length > 0) return list;
	return PROBLEMS.filter((p) => canons.includes(p.canon));
}
var DOMAIN_GLASS = {
	arith: {
		hi: "#ffe7b8",
		mid: "#e2a13a",
		deep: "#7a4512",
		rim: "#ffe1a8"
	},
	geom: {
		hi: "#d9fff4",
		mid: "#2fbfae",
		deep: "#0c5c56",
		rim: "#c8fff4"
	},
	phys: {
		hi: "#ffd5dc",
		mid: "#e25b78",
		deep: "#7c243c",
		rim: "#ffc6d0"
	},
	trig: {
		hi: "#e4e4ff",
		mid: "#7d8cf0",
		deep: "#2c348a",
		rim: "#d9dcff"
	},
	const: {
		hi: "#fff3cc",
		mid: "#e6c15a",
		deep: "#6d5216",
		rim: "#fff0c2"
	}
};
var SPECIAL_GLASS = {
	wild: {
		hi: "#ffffff",
		mid: "#d7d5e2",
		deep: "#4c4a5c",
		rim: "#ffffff"
	},
	burst: {
		hi: "#fff1c2",
		mid: "#ffb703",
		deep: "#8a5a00",
		rim: "#ffe7a3"
	},
	pulse: {
		hi: "#ffd9d2",
		mid: "#ff6b57",
		deep: "#7a2418",
		rim: "#ffcfc6"
	}
};
var DOMAIN_LABEL = {
	arith: "Arithmetic",
	geom: "Geometry",
	phys: "Physics",
	trig: "Trigonometry",
	const: "Constant"
};
var SQRT3 = Math.sqrt(3);
var WORLD_H = 20.5;
var SHOOTER_Y = 18.75;
var DANGER_Y = 16.55;
var MIN_ANGLE = -Math.PI + .26;
var MAX_ANGLE = -.26;
var STEP = 1 / 120;
var HIT_R = 1.9;
var playSfx = () => {};
function setSfx(fn) {
	playSfx = fn;
}
function blankOrb() {
	return {
		id: 0,
		canon: "4",
		a: "2²",
		domain: "arith",
		blurb: "Two squared.",
		placedT: -10
	};
}
function createGame() {
	const current = blankOrb();
	const next = {
		...blankOrb(),
		id: 1,
		a: "3²",
		canon: "9",
		blurb: "Three squared."
	};
	return {
		phase: "menu",
		blind: false,
		wave: 1,
		score: 0,
		best: 0,
		newBest: false,
		levelScore: 0,
		clearSeq: 0,
		clearLevel: 0,
		clearScore: 0,
		combo: 0,
		comboTimer: 0,
		shotsLeft: 8,
		shotsPerDrop: 8,
		parity: 0,
		shift: 0,
		grid: [],
		pool: problemsFor(1, [
			"4",
			"8",
			"9"
		]),
		canons: [
			"4",
			"8",
			"9"
		],
		current,
		next,
		angle: -Math.PI / 2,
		shot: null,
		falling: [],
		particles: [],
		floaters: [],
		drift: [],
		trauma: 0,
		freeze: 0,
		flash: 0,
		cooldown: 0,
		waveDelay: 0,
		recoil: 0,
		banner: "",
		bannerT: 0,
		t: 0,
		acc: 0,
		uid: 2,
		mute: false,
		shake: true,
		reduced: false,
		hoverCanon: null,
		preview: [],
		previewLand: null,
		aimPath: [],
		boardSig: "",
		keys: {
			left: false,
			right: false
		}
	};
}
function spawnDrift(g) {
	g.drift = [];
	const samples = [
		0,
		4,
		8,
		12,
		16,
		20,
		24,
		28
	];
	for (let i = 0; i < samples.length; i++) {
		const def = PROBLEMS[samples[i] % PROBLEMS.length];
		g.drift.push({
			orb: {
				id: ++g.uid,
				canon: def.canon,
				a: def.a,
				b: def.b,
				domain: def.domain,
				blurb: def.blurb,
				placedT: -10
			},
			x: 1.4 + i * 1.7 % 13.2,
			y: 2 + i * 2.3 % 12,
			vx: (i % 2 === 0 ? .35 : -.28) * (.6 + i % 3 * .2),
			vy: .22 + i % 4 * .06,
			rot: i * .4,
			vr: i % 2 === 0 ? .3 : -.25
		});
	}
}
function shifted(g, row) {
	return (row + g.parity & 1) === 1;
}
function rowLength(g, row) {
	return shifted(g, row) ? 7 : 8;
}
function centerOf(g, row, col) {
	return {
		x: 1 + col * 2 + (shifted(g, row) ? 1 : 0),
		y: 1 + row * SQRT3 + g.shift
	};
}
function neighbors(g, row, col) {
	const deltas = shifted(g, row) ? [
		[0, -1],
		[0, 1],
		[-1, 0],
		[-1, 1],
		[1, 0],
		[1, 1]
	] : [
		[0, -1],
		[0, 1],
		[-1, -1],
		[-1, 0],
		[1, -1],
		[1, 0]
	];
	const out = [];
	for (const [dr, dc] of deltas) {
		const r = row + dr;
		const c = col + dc;
		if (r < 0 || r >= g.grid.length) continue;
		if (c < 0 || c >= g.grid[r].length) continue;
		out.push({
			r,
			c
		});
	}
	return out;
}
function resign(g) {
	let s = "";
	for (const row of g.grid) {
		for (const o of row) s += o ? `${o.canon}${o.a}${o.b ?? ""}${o.special ?? ""}` : ".";
		s += "/";
	}
	g.boardSig = s;
}
function pickDef(pool, canon) {
	const list = canon ? pool.filter((p) => p.canon === canon) : pool;
	const src = list.length ? list : pool;
	return src[Math.floor(Math.random() * src.length)];
}
function orbFrom(g, def, special) {
	if (special === "wild") return {
		id: ++g.uid,
		canon: "∀",
		a: "∀",
		b: "any",
		domain: "const",
		blurb: "Wildcard. Joins the biggest neighboring value and pops at three.",
		special,
		placedT: g.t
	};
	if (special === "burst") return {
		id: ++g.uid,
		canon: "∇",
		a: "∇",
		b: "burst",
		domain: "geom",
		blurb: "Burst. Pops every bubble it touches.",
		special,
		placedT: g.t
	};
	if (special === "pulse") return {
		id: ++g.uid,
		canon: "Δ",
		a: "Δp",
		b: "drop",
		domain: "phys",
		blurb: "Impulse. Clears the column beneath the impact.",
		special,
		placedT: g.t
	};
	return {
		id: ++g.uid,
		canon: def.canon,
		a: def.a,
		b: def.b,
		domain: def.domain,
		blurb: def.blurb,
		placedT: g.t
	};
}
function canonsPresent(g) {
	const set = /* @__PURE__ */ new Set();
	for (const row of g.grid) for (const o of row) if (o && !o.special) set.add(o.canon);
	return [...set];
}
function makeOrb(g, allowSpecial) {
	if (allowSpecial && g.wave >= 2 && Math.random() < .1) {
		const roll = Math.random();
		const kind = roll < .34 ? "wild" : roll < .67 ? "burst" : "pulse";
		return orbFrom(g, g.pool[0], kind);
	}
	const present = canonsPresent(g);
	let pool = g.pool;
	if (present.length && Math.random() < .84) {
		const filtered = g.pool.filter((p) => present.includes(p.canon));
		if (filtered.length) pool = filtered;
	}
	return orbFrom(g, pickDef(pool));
}
function paintCanon(g, orb, canon) {
	const def = pickDef(g.pool, canon);
	orb.canon = def.canon;
	orb.a = def.a;
	orb.b = def.b;
	orb.domain = def.domain;
	orb.blurb = def.blurb;
	orb.special = void 0;
}
function floodCanon(g, sr, sc, canon) {
	const out = [];
	const stack = [{
		r: sr,
		c: sc
	}];
	const seen = /* @__PURE__ */ new Set([`${sr},${sc}`]);
	while (stack.length) {
		const cur = stack.pop();
		const o = g.grid[cur.r][cur.c];
		if (!o || o.special || o.canon !== canon) continue;
		out.push(cur);
		for (const n of neighbors(g, cur.r, cur.c)) {
			const k = `${n.r},${n.c}`;
			if (seen.has(k)) continue;
			const nb = g.grid[n.r][n.c];
			if (!nb || nb.special || nb.canon !== canon) continue;
			seen.add(k);
			stack.push(n);
		}
	}
	return out;
}
function breakClusters(g, onlyRow) {
	const canons = [...new Set(g.pool.map((p) => p.canon))];
	for (let pass = 0; pass < 8; pass++) {
		let changed = false;
		for (let r = 0; r < g.grid.length; r++) for (let c = 0; c < g.grid[r].length; c++) {
			const o = g.grid[r][c];
			if (!o || o.special) continue;
			if (onlyRow !== void 0 && r !== onlyRow) continue;
			if (floodCanon(g, r, c, o.canon).length < 3) continue;
			let best = o.canon;
			let bestSize = Infinity;
			for (const can of canons) {
				if (can === o.canon) continue;
				const prevA = o.a;
				const prevB = o.b;
				const prevD = o.domain;
				const prevBlurb = o.blurb;
				const prevC = o.canon;
				paintCanon(g, o, can);
				const size = floodCanon(g, r, c, can).length;
				o.canon = prevC;
				o.a = prevA;
				o.b = prevB;
				o.domain = prevD;
				o.blurb = prevBlurb;
				if (size < bestSize) {
					bestSize = size;
					best = can;
				}
			}
			if (best !== o.canon) {
				paintCanon(g, o, best);
				changed = true;
			}
		}
		if (!changed) break;
	}
}
function pushGeneratedRow(g, fill) {
	const n = (g.grid.length + g.parity & 1) === 1 ? 7 : 8;
	const row = [];
	for (let c = 0; c < n; c++) row.push(Math.random() < fill ? makeOrb(g, false) : null);
	g.grid.push(row);
}
function deal(g, wave) {
	const plan = wavePlan(wave);
	g.wave = wave;
	g.levelScore = 0;
	g.canons = plan.canons;
	g.pool = problemsFor(wave, plan.canons);
	g.shotsPerDrop = plan.shots;
	g.shotsLeft = plan.shots;
	g.parity = 0;
	g.shift = 0;
	g.grid = [];
	g.shot = null;
	g.falling = [];
	g.preview = [];
	g.previewLand = null;
	g.aimPath = [];
	for (let i = 0; i < plan.rows; i++) pushGeneratedRow(g, 1);
	breakClusters(g);
	g.current = makeOrb(g, false);
	g.next = makeOrb(g, true);
	resign(g);
}
function startGame(g, blind, level = 1) {
	g.blind = blind;
	g.phase = "play";
	g.score = 0;
	g.newBest = false;
	g.combo = 0;
	g.comboTimer = 0;
	g.waveDelay = 0;
	g.freeze = 0;
	g.angle = -Math.PI / 2;
	const start = Math.max(1, Math.floor(level));
	g.banner = `Level ${start}`;
	g.bannerT = 1.5;
	deal(g, start);
	playSfx("ui");
}
function dropCeiling(g) {
	g.parity ^= 1;
	const n = (g.parity & 1) === 1 ? 7 : 8;
	const row = [];
	for (let c = 0; c < n; c++) row.push(makeOrb(g, false));
	g.grid.unshift(row);
	breakClusters(g, 0);
	g.shift = -SQRT3;
	g.trauma = Math.min(1, g.trauma + .24);
	g.banner = "Ceiling drops";
	g.bannerT = .9;
	playSfx("drop");
}
function listPops(g, r, c) {
	const orb = g.grid[r][c];
	if (!orb) return [];
	if (orb.special === "burst") {
		const out = [{
			r,
			c
		}];
		for (const n of neighbors(g, r, c)) if (g.grid[n.r][n.c]) out.push(n);
		return out;
	}
	if (orb.special === "pulse") {
		const origin = centerOf(g, r, c);
		const out = [];
		for (let rr = 0; rr < g.grid.length; rr++) for (let cc = 0; cc < g.grid[rr].length; cc++) {
			if (!g.grid[rr][cc]) continue;
			const p = centerOf(g, rr, cc);
			if (Math.abs(p.x - origin.x) <= 1.15 && p.y >= origin.y - .25) out.push({
				r: rr,
				c: cc
			});
		}
		return out;
	}
	let canon = orb.canon;
	if (orb.special === "wild") {
		const counts = /* @__PURE__ */ new Map();
		for (const n of neighbors(g, r, c)) {
			const o = g.grid[n.r][n.c];
			if (!o || o.special) continue;
			counts.set(o.canon, (counts.get(o.canon) ?? 0) + 1);
		}
		let best = "";
		let bestN = 0;
		for (const [k, v] of counts) if (v > bestN) {
			best = k;
			bestN = v;
		}
		if (!best) return [];
		canon = best;
	}
	const out = [];
	const stack = [{
		r,
		c
	}];
	const seen = /* @__PURE__ */ new Set([`${r},${c}`]);
	while (stack.length) {
		const cur = stack.pop();
		const o = g.grid[cur.r][cur.c];
		if (!o) continue;
		if (o.special !== "wild" && o.canon !== canon) continue;
		out.push(cur);
		for (const n of neighbors(g, cur.r, cur.c)) {
			const k = `${n.r},${n.c}`;
			if (seen.has(k)) continue;
			const nb = g.grid[n.r][n.c];
			if (!nb) continue;
			if (nb.special === "wild" || nb.canon === canon) {
				seen.add(k);
				stack.push(n);
			}
		}
	}
	return out.length >= 3 ? out : [];
}
function listUnanchored(g) {
	const seen = /* @__PURE__ */ new Set();
	const stack = [];
	if (g.grid[0]) {
		for (let c = 0; c < g.grid[0].length; c++) if (g.grid[0][c]) {
			stack.push({
				r: 0,
				c
			});
			seen.add(`0,${c}`);
		}
	}
	while (stack.length) {
		const cur = stack.pop();
		for (const n of neighbors(g, cur.r, cur.c)) {
			const k = `${n.r},${n.c}`;
			if (seen.has(k) || !g.grid[n.r][n.c]) continue;
			seen.add(k);
			stack.push(n);
		}
	}
	const out = [];
	for (let r = 0; r < g.grid.length; r++) for (let c = 0; c < g.grid[r].length; c++) if (g.grid[r][c] && !seen.has(`${r},${c}`)) out.push({
		r,
		c
	});
	return out;
}
function boardEmpty(g) {
	for (const row of g.grid) for (const cell of row) if (cell) return false;
	return true;
}
function crossed(g) {
	for (let r = 0; r < g.grid.length; r++) for (let c = 0; c < g.grid[r].length; c++) {
		if (!g.grid[r][c]) continue;
		if (centerOf(g, r, c).y + .92 >= 16.55) return true;
	}
	return false;
}
function bumpBest(g) {
	if (g.score > g.best) {
		g.best = g.score;
		g.newBest = true;
	}
}
function lose(g) {
	g.phase = "over";
	g.shot = null;
	g.banner = "The lattice caught you";
	g.bannerT = 2;
	bumpBest(g);
	playSfx("over");
}
function spawnPop(g, x, y, color, glyph) {
	const sparks = g.reduced ? 4 : 9;
	g.particles.push({
		kind: "ring",
		x,
		y,
		vx: 0,
		vy: 0,
		life: .42,
		max: .42,
		size: .35,
		color
	});
	g.particles.push({
		kind: "glyph",
		x,
		y,
		vx: (Math.random() - .5) * .7,
		vy: -1.5,
		life: .75,
		max: .75,
		size: .42,
		color: "#f4efe4",
		glyph
	});
	for (let i = 0; i < sparks; i++) {
		const a = Math.random() * Math.PI * 2;
		const s = 1.2 + Math.random() * 3.2;
		g.particles.push({
			kind: "spark",
			x,
			y,
			vx: Math.cos(a) * s,
			vy: Math.sin(a) * s - .4,
			life: .32 + Math.random() * .28,
			max: .6,
			size: .07 + Math.random() * .1,
			color
		});
	}
	if (g.particles.length > 340) g.particles.splice(0, g.particles.length - 340);
}
function removeCell(g, r, c, mode) {
	const orb = g.grid[r][c];
	if (!orb) return;
	const p = centerOf(g, r, c);
	g.grid[r][c] = null;
	if (mode === "pop") spawnPop(g, p.x, p.y, "#e4b15a", orb.a);
	else g.falling.push({
		orb,
		x: p.x,
		y: p.y,
		vx: (Math.random() - .5) * 1.4,
		vy: .2 + Math.random() * .4,
		rot: 0,
		vr: (Math.random() - .5) * 2.4
	});
}
function landingCell(g, x, y, hit) {
	const cand = [];
	const consider = (r, c) => {
		if (r < 0 || r >= g.grid.length) return;
		if (c < 0 || c >= g.grid[r].length) return;
		if (g.grid[r][c]) return;
		const p = centerOf(g, r, c);
		const dx = p.x - x;
		const dy = p.y - y;
		cand.push({
			r,
			c,
			d: dx * dx + dy * dy
		});
	};
	if (hit === "ceiling") {
		if (g.grid[0]) for (let c = 0; c < g.grid[0].length; c++) consider(0, c);
		if (!cand.length && g.grid[1]) for (let c = 0; c < g.grid[1].length; c++) consider(1, c);
	} else {
		for (const n of neighbors(g, hit.r, hit.c)) consider(n.r, n.c);
		if (!cand.length) {
			const seen = /* @__PURE__ */ new Set();
			for (const n of neighbors(g, hit.r, hit.c)) for (const n2 of neighbors(g, n.r, n.c)) {
				const k = `${n2.r},${n2.c}`;
				if (seen.has(k)) continue;
				seen.add(k);
				consider(n2.r, n2.c);
			}
		}
	}
	if (!cand.length) return null;
	cand.sort((a, b) => a.d - b.d);
	if (cand[0].d > 10) return null;
	return {
		r: cand[0].r,
		c: cand[0].c
	};
}
function previewClears(g, r, c) {
	const prev = g.grid[r][c];
	g.grid[r][c] = g.current;
	const pops = listPops(g, r, c);
	if (!pops.length) {
		g.grid[r][c] = prev;
		return [];
	}
	const saved = [];
	for (const p of pops) {
		saved.push({
			r: p.r,
			c: p.c,
			orb: g.grid[p.r][p.c]
		});
		g.grid[p.r][p.c] = null;
	}
	const falls = listUnanchored(g);
	for (const s of saved) g.grid[s.r][s.c] = s.orb;
	g.grid[r][c] = prev;
	return [...pops, ...falls];
}
function moveBody(g, b, dt) {
	const speed = Math.hypot(b.vx, b.vy) || 1;
	const steps = Math.max(1, Math.ceil(speed * dt / .16));
	const h = dt / steps;
	for (let i = 0; i < steps; i++) {
		b.x += b.vx * h;
		b.y += b.vy * h;
		if (b.x < 1) {
			b.x = 1;
			b.vx = Math.abs(b.vx);
		} else if (b.x > 15) {
			b.x = 15;
			b.vx = -Math.abs(b.vx);
		}
		if (b.y <= 1 && b.vy < 0) {
			b.y = 1;
			return {
				kind: "ceiling",
				x: b.x,
				y: b.y
			};
		}
		for (let r = 0; r < g.grid.length; r++) {
			const row = g.grid[r];
			for (let c = 0; c < row.length; c++) {
				if (!row[c]) continue;
				const p = centerOf(g, r, c);
				if (Math.abs(p.y - b.y) > 2.5) continue;
				const dx = b.x - p.x;
				const dy = b.y - p.y;
				if (dx * dx + dy * dy <= HIT_R * HIT_R) return {
					kind: "bubble",
					r,
					c,
					x: b.x,
					y: b.y
				};
			}
		}
		if (b.y > 23.5) return { kind: "miss" };
	}
	return null;
}
function resolveShot(g, cell, x, y) {
	const shot = g.shot;
	if (!shot) return;
	const orb = shot.orb;
	g.shot = null;
	g.cooldown = .06;
	if (!cell) {
		g.falling.push({
			orb,
			x,
			y,
			vx: shot.vx * .1,
			vy: .4,
			rot: 0,
			vr: 1
		});
		playSfx("stick");
	} else {
		orb.placedT = g.t;
		g.grid[cell.r][cell.c] = orb;
		const pops = listPops(g, cell.r, cell.c);
		if (pops.length) {
			g.combo = g.comboTimer > 0 ? g.combo + 1 : 1;
			g.comboTimer = 2.55;
			let sx = 0;
			let sy = 0;
			const canon = orb.special ? pops.map((p) => g.grid[p.r][p.c]?.canon).find((c) => c && c !== orb.canon) ?? orb.canon : orb.canon;
			for (const p of pops) {
				const pos = centerOf(g, p.r, p.c);
				sx += pos.x;
				sy += pos.y;
				removeCell(g, p.r, p.c, "pop");
			}
			const falls = listUnanchored(g);
			for (const f of falls) removeCell(g, f.r, f.c, "fall");
			const pts = pops.length * 20 * g.combo + falls.length * 45 * g.combo;
			g.score += pts;
			g.levelScore += pts;
			bumpBest(g);
			g.freeze = pops.length + falls.length >= 7 ? .075 : .042;
			g.trauma = Math.min(1, g.trauma + Math.min(.62, .18 + pops.length * .04));
			g.flash = Math.min(.22, .08 + pops.length * .012);
			const cx = sx / pops.length;
			const cy = sy / pops.length;
			g.floaters.push({
				x: cx,
				y: cy,
				text: `= ${canon}`,
				life: .9,
				max: .9,
				color: "#f3d7a1"
			});
			g.floaters.push({
				x: cx + .15,
				y: cy + .7,
				text: `+${pts}`,
				life: .85,
				max: .85,
				color: "#f4efe4"
			});
			if (g.combo >= 2) g.floaters.push({
				x: cx,
				y: cy - .8,
				text: `×${g.combo}`,
				life: .7,
				max: .7,
				color: "#e4b15a"
			});
			playSfx("pop", g.combo);
			if (falls.length) playSfx("fall");
		} else {
			playSfx("stick");
			g.trauma = Math.min(1, g.trauma + .05);
		}
	}
	g.shotsLeft -= 1;
	if (boardEmpty(g)) {
		const bonus = 500 * g.wave;
		g.score += bonus;
		g.levelScore += bonus;
		g.clearSeq += 1;
		g.clearLevel = g.wave;
		g.clearScore = g.levelScore;
		bumpBest(g);
		g.waveDelay = 1.2;
		g.banner = `Field clear  +${bonus}`;
		g.bannerT = 1.2;
		g.floaters.push({
			x: 8,
			y: 8,
			text: `+${bonus}`,
			life: 1.1,
			max: 1.1,
			color: "#f3d7a1"
		});
		playSfx("wave");
	} else if (g.shotsLeft <= 0 && g.phase === "play") {
		g.shotsLeft = g.shotsPerDrop;
		dropCeiling(g);
	}
	if (g.phase === "play" && crossed(g)) lose(g);
	resign(g);
}
function updatePreview(g) {
	if (g.phase !== "play" || g.shot || g.waveDelay > 0 || g.grid.length === 0) {
		g.aimPath = [];
		g.preview = [];
		g.previewLand = null;
		return;
	}
	const b = {
		x: 8,
		y: SHOOTER_Y,
		vx: Math.cos(g.angle) * 30,
		vy: Math.sin(g.angle) * 30
	};
	const path = [{
		x: b.x,
		y: b.y
	}];
	let hit = null;
	for (let i = 0; i < 240 && !hit; i++) {
		hit = moveBody(g, b, .016);
		if (i % 2 === 0) path.push({
			x: b.x,
			y: b.y
		});
	}
	g.aimPath = path;
	if (!hit || hit.kind === "miss") {
		g.preview = [];
		g.previewLand = null;
		return;
	}
	const cell = landingCell(g, hit.x, hit.y, hit.kind === "ceiling" ? "ceiling" : {
		r: hit.r,
		c: hit.c
	});
	if (!cell) {
		g.preview = [];
		g.previewLand = null;
		return;
	}
	g.previewLand = centerOf(g, cell.r, cell.c);
	g.preview = g.blind ? [] : previewClears(g, cell.r, cell.c);
}
function physics(g, dt) {
	if (g.phase === "play" && !g.shot) {
		const rate = 1.45;
		if (g.keys.left) g.angle -= rate * dt;
		if (g.keys.right) g.angle += rate * dt;
		if (g.angle < MIN_ANGLE) g.angle = MIN_ANGLE;
		if (g.angle > -.26) g.angle = MAX_ANGLE;
	}
	if (g.cooldown > 0) g.cooldown = Math.max(0, g.cooldown - dt);
	if (g.comboTimer > 0) {
		g.comboTimer -= dt;
		if (g.comboTimer <= 0) {
			g.comboTimer = 0;
			g.combo = 0;
		}
	}
	if (g.shift !== 0) {
		g.shift += (0 - g.shift) * (1 - Math.exp(-9 * dt));
		if (Math.abs(g.shift) < .012) g.shift = 0;
	}
	if (g.waveDelay > 0) {
		g.waveDelay -= dt;
		if (g.waveDelay <= 0) {
			g.waveDelay = 0;
			if (g.phase === "play") {
				deal(g, g.wave + 1);
				g.banner = `Level ${g.wave}`;
				g.bannerT = 1.3;
			}
		}
	}
	if (g.shot && g.phase === "play") {
		g.shot.age += dt;
		const hit = g.shot.age > 3.2 ? { kind: "miss" } : moveBody(g, g.shot, dt);
		if (hit) {
			const x = g.shot.x;
			const y = g.shot.y;
			resolveShot(g, hit.kind === "miss" ? null : landingCell(g, hit.x, hit.y, hit.kind === "ceiling" ? "ceiling" : {
				r: hit.r,
				c: hit.c
			}), x, y);
		}
	}
	const grav = 28;
	for (let i = g.falling.length - 1; i >= 0; i--) {
		const f = g.falling[i];
		f.vy += grav * dt;
		f.x += f.vx * dt;
		f.y += f.vy * dt;
		f.rot += f.vr * dt;
		if (f.x < 1) {
			f.x = 1;
			f.vx = Math.abs(f.vx) * .8;
		} else if (f.x > 15) {
			f.x = 15;
			f.vx = -Math.abs(f.vx) * .8;
		}
		if (f.y > 19.05) {
			spawnPop(g, f.x, Math.min(f.y, SHOOTER_Y), "#f4efe4", f.orb.a);
			g.falling.splice(i, 1);
		}
	}
	if (g.falling.length > 1) for (let i = 0; i < g.falling.length; i++) for (let j = i + 1; j < g.falling.length; j++) {
		const a = g.falling[i];
		const b = g.falling[j];
		const dx = b.x - a.x;
		const dy = b.y - a.y;
		const d2 = dx * dx + dy * dy;
		if (d2 > 1e-4 && d2 < 3.6) {
			const d = Math.sqrt(d2);
			const overlap = (1.9 - d) / 2;
			const nx = dx / d;
			const ny = dy / d;
			a.x -= nx * overlap;
			a.y -= ny * overlap;
			b.x += nx * overlap;
			b.y += ny * overlap;
			const push = 1.2;
			a.vx -= nx * push;
			a.vy -= ny * push;
			b.vx += nx * push;
			b.vy += ny * push;
		}
	}
	if (g.phase === "menu" || g.phase === "over") for (const d of g.drift) {
		d.x += d.vx * dt;
		d.y += d.vy * dt;
		d.rot += d.vr * dt;
		if (d.x < 1.2 || d.x > 14.8) d.vx *= -1;
		if (d.y < 1.4 || d.y > 15.5) d.vy *= -1;
	}
}
function present(g, dt) {
	if (g.recoil > 0) g.recoil = Math.max(0, g.recoil - dt * 3.2);
	if (g.flash > 0) g.flash = Math.max(0, g.flash - dt * .7);
	for (let i = g.particles.length - 1; i >= 0; i--) {
		const p = g.particles[i];
		p.life -= dt;
		if (p.kind !== "ring") {
			p.x += p.vx * dt;
			p.y += p.vy * dt;
			p.vy += (p.kind === "glyph" ? .35 : 2.2) * dt;
		}
		if (p.life <= 0) g.particles.splice(i, 1);
	}
	for (let i = g.floaters.length - 1; i >= 0; i--) {
		const f = g.floaters[i];
		f.life -= dt;
		f.y -= dt * .85;
		if (f.life <= 0) g.floaters.splice(i, 1);
	}
}
function step(g, dtIn) {
	const dt = Math.min(.05, Math.max(0, dtIn));
	g.t += dt;
	if (g.bannerT > 0) g.bannerT = Math.max(0, g.bannerT - dt);
	const shakeOn = g.shake && !g.reduced;
	g.trauma = Math.max(0, g.trauma - dt * (shakeOn ? 1.65 : 4));
	if (g.phase === "pause") {
		present(g, dt);
		return;
	}
	if (g.freeze > 0) {
		g.freeze = Math.max(0, g.freeze - dt);
		present(g, dt * .15);
		return;
	}
	present(g, dt);
	g.acc += dt;
	let n = 0;
	while (g.acc >= STEP && n++ < 6) {
		physics(g, STEP);
		g.acc -= STEP;
		if (g.freeze > 0) break;
	}
	if (g.phase === "play") updatePreview(g);
}
function aimAt(g, x, y) {
	if (g.phase !== "play" || g.shot) return;
	const dx = x - 8;
	const dy = y - SHOOTER_Y;
	if (dx * dx + dy * dy < .2) return;
	let a = Math.atan2(dy, dx);
	if (a > 0) a = a < Math.PI / 2 ? MAX_ANGLE : MIN_ANGLE;
	else a = Math.max(MIN_ANGLE, Math.min(MAX_ANGLE, a));
	g.angle = a;
}
function shoot(g) {
	if (g.phase !== "play" || g.shot || g.freeze > 0 || g.waveDelay > 0 || g.cooldown > 0) return false;
	if (!g.grid.length) return false;
	g.shot = {
		x: 8,
		y: SHOOTER_Y,
		vx: Math.cos(g.angle) * 30,
		vy: Math.sin(g.angle) * 30,
		orb: g.current,
		age: 0
	};
	g.current = g.next;
	g.next = makeOrb(g, true);
	g.recoil = 1;
	g.preview = [];
	g.previewLand = null;
	playSfx("shoot");
	return true;
}
function toMenu(g) {
	g.phase = "menu";
	g.shot = null;
	g.falling = [];
	g.particles = [];
	g.floaters = [];
	g.preview = [];
	g.previewLand = null;
	g.aimPath = [];
	g.banner = "";
	g.bannerT = 0;
	g.waveDelay = 0;
	g.freeze = 0;
	if (!g.drift.length) spawnDrift(g);
}
function togglePause(g) {
	if (g.phase === "play") g.phase = "pause";
	else if (g.phase === "pause") g.phase = "play";
}
function setBlind(g, blind) {
	g.blind = blind;
	if (blind) g.preview = [];
}
function viewOf(orb) {
	return {
		a: orb.a,
		b: orb.b,
		domain: orb.domain,
		special: orb.special,
		blurb: orb.blurb,
		canon: orb.canon
	};
}
function codexOf(g) {
	if (g.blind || g.phase === "menu") return [];
	const map = /* @__PURE__ */ new Map();
	for (const row of g.grid) for (const o of row) {
		if (!o || o.special) continue;
		const list = map.get(o.canon) ?? [];
		const key = `${o.a}|${o.b ?? ""}`;
		if (!list.some((item) => `${item.a}|${item.b ?? ""}` === key)) list.push({
			a: o.a,
			b: o.b,
			domain: o.domain
		});
		map.set(o.canon, list);
	}
	return [...map.entries()].sort((a, b) => {
		const na = Number(a[0]);
		const nb = Number(b[0]);
		const aNum = !Number.isNaN(na) && a[0] !== "φ" && !a[0].includes("π");
		const bNum = !Number.isNaN(nb) && b[0] !== "φ" && !b[0].includes("π");
		if (aNum && bNum) return na - nb;
		if (aNum) return -1;
		if (bNum) return 1;
		return a[0].localeCompare(b[0]);
	}).map(([canon, items]) => ({
		canon,
		items
	}));
}
function snapshot(g, ready = true) {
	return {
		phase: g.phase,
		blind: g.blind,
		score: g.score,
		best: g.best,
		newBest: g.newBest,
		wave: g.wave,
		levelScore: g.levelScore,
		clearSeq: g.clearSeq,
		clearLevel: g.clearLevel,
		clearScore: g.clearScore,
		combo: g.combo,
		shotsLeft: g.shotsLeft,
		shotsPerDrop: g.shotsPerDrop,
		banner: g.bannerT > 0 ? g.banner : "",
		mute: g.mute,
		shake: g.shake,
		current: viewOf(g.current),
		next: viewOf(g.next),
		codex: codexOf(g),
		ready
	};
}
function domainLabel(domain) {
	return DOMAIN_LABEL[domain];
}
function runSelfCheck() {
	const g = createGame();
	startGame(g, false);
	const checkDists = (label) => {
		for (let r = 0; r < g.grid.length; r++) {
			if (g.grid[r].length !== rowLength(g, r)) throw new Error(`${label} row ${r} length ${g.grid[r].length} != ${rowLength(g, r)}`);
			for (let c = 0; c < g.grid[r].length; c++) {
				const p = centerOf(g, r, c);
				for (const n of neighbors(g, r, c)) {
					const q = centerOf(g, n.r, n.c);
					const d = Math.hypot(p.x - q.x, p.y - q.y);
					if (Math.abs(d - 2) > 1e-6) throw new Error(`${label} dist ${d} ${r},${c}->${n.r},${n.c}`);
				}
			}
		}
	};
	checkDists("deal");
	dropCeiling(g);
	dropCeiling(g);
	checkDists("after drops");
	for (const row of g.grid) for (let c = 0; c < row.length; c++) row[c] = null;
	const mk = (canon, a) => ({
		id: ++g.uid,
		canon,
		a,
		domain: "arith",
		blurb: "",
		placedT: 0
	});
	g.grid[0][0] = mk("4", "2²");
	g.grid[0][1] = mk("4", "√16");
	g.grid[0][2] = mk("4", "8÷2");
	g.grid[0][3] = mk("9", "3²");
	const pops = listPops(g, 0, 2);
	if (pops.length !== 3) throw new Error(`expected 3-match, got ${pops.length}`);
	if (listPops(g, 0, 3).length !== 0) throw new Error("singleton should not pop");
	g.angle = MIN_ANGLE;
	if (Math.cos(g.angle) >= -.2) throw new Error("min angle should point left");
	g.angle = MAX_ANGLE;
	if (Math.cos(g.angle) <= .2) throw new Error("max angle should point right");
}
function layoutOf(w, h) {
	const scale = Math.min((w - 28) / 16, (h - 28) / WORLD_H);
	return {
		scale: Math.max(1, scale),
		ox: (w - 16 * scale) / 2,
		oy: (h - WORLD_H * scale) / 2,
		w,
		h
	};
}
function screenToWorld(layout, sx, sy) {
	return {
		x: (sx - layout.ox) / layout.scale,
		y: (sy - layout.oy) / layout.scale
	};
}
function glassOf(orb) {
	if (orb.special) return SPECIAL_GLASS[orb.special];
	return DOMAIN_GLASS[orb.domain];
}
function worldX(layout, x) {
	return layout.ox + x * layout.scale;
}
function worldY(layout, y) {
	return layout.oy + y * layout.scale;
}
function roundRect(ctx, x, y, w, h, r) {
	const rad = Math.min(r, w / 2, h / 2);
	ctx.beginPath();
	ctx.moveTo(x + rad, y);
	ctx.arcTo(x + w, y, x + w, y + h, rad);
	ctx.arcTo(x + w, y + h, x, y + h, rad);
	ctx.arcTo(x, y + h, x, y, rad);
	ctx.arcTo(x, y, x + w, y, rad);
	ctx.closePath();
}
function popIn(t, placed) {
	const u = (t - placed) / .2;
	if (u >= 1 || u <= 0) return 1;
	const c1 = 1.70158;
	const c3 = 2.70158;
	const x = u - 1;
	return .62 + .38 * (1 + c3 * x * x * x + c1 * x * x);
}
function drawOrb(ctx, x, y, radius, orb, alpha = 1) {
	if (radius < 2) return;
	const glass = glassOf(orb);
	ctx.save();
	ctx.globalAlpha *= alpha;
	ctx.translate(x, y);
	ctx.beginPath();
	ctx.arc(0, radius * .18, radius * .92, 0, Math.PI * 2);
	ctx.fillStyle = "rgba(0,0,0,0.28)";
	ctx.fill();
	const body = ctx.createRadialGradient(-radius * .32, -radius * .38, radius * .12, 0, 0, radius);
	body.addColorStop(0, glass.hi);
	body.addColorStop(.42, glass.mid);
	body.addColorStop(1, glass.deep);
	ctx.beginPath();
	ctx.arc(0, 0, radius * .96, 0, Math.PI * 2);
	ctx.fillStyle = body;
	ctx.fill();
	ctx.beginPath();
	ctx.ellipse(-radius * .08, radius * .22, radius * .46, radius * .28, -.5, 0, Math.PI * 2);
	ctx.fillStyle = "rgba(255,255,255,0.08)";
	ctx.fill();
	ctx.beginPath();
	ctx.ellipse(-radius * .28, -radius * .34, radius * .26, radius * .15, -.7, 0, Math.PI * 2);
	ctx.fillStyle = "rgba(255,255,255,0.78)";
	ctx.fill();
	ctx.beginPath();
	ctx.arc(0, 0, radius * .96, 0, Math.PI * 2);
	ctx.strokeStyle = glass.rim;
	ctx.lineWidth = Math.max(1.25, radius * .055);
	ctx.stroke();
	const maxW = radius * 1.45;
	const lines = orb.b ? [orb.a, orb.b] : [orb.a];
	let size = orb.b ? radius * .4 : radius * .48;
	const fontFor = (px) => `600 ${Math.max(8, px)}px "IBM Plex Mono", ui-monospace, monospace`;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	for (let guard = 0; guard < 12; guard++) {
		ctx.font = fontFor(size);
		if (Math.max(...lines.map((line) => ctx.measureText(line).width)) <= maxW || size <= 8) break;
		size -= 1;
	}
	const lineH = size * 1.05;
	const blockH = lineH * lines.length;
	const pillW = Math.min(radius * 1.7, maxW + radius * .28);
	const pillH = blockH + radius * .18;
	ctx.fillStyle = "rgba(7,8,13,0.62)";
	roundRect(ctx, -pillW / 2, -pillH / 2, pillW, pillH, radius * .16);
	ctx.fill();
	lines.forEach((line, i) => {
		ctx.fillStyle = i === 0 ? "#f4efe4" : "#f3d7a1";
		ctx.fillText(line, 0, -blockH / 2 + lineH * .5 + i * lineH);
	});
	ctx.restore();
}
function drawLattice(ctx, w, h, t) {
	ctx.save();
	ctx.translate(w * .5, h * .42);
	ctx.rotate(t * .04);
	ctx.strokeStyle = "rgba(228,177,90,0.09)";
	ctx.lineWidth = 1;
	const R = Math.max(w, h) * .55;
	for (let ring = 1; ring <= 5; ring++) {
		ctx.beginPath();
		for (let i = 0; i <= 6; i++) {
			const a = Math.PI / 3 * i - Math.PI / 6;
			const x = Math.cos(a) * R * (ring / 5);
			const y = Math.sin(a) * R * (ring / 5);
			if (i === 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		}
		ctx.stroke();
	}
	ctx.beginPath();
	ctx.arc(0, 0, R * .72, 0, Math.PI * 2);
	ctx.stroke();
	const phi = 1.618;
	ctx.beginPath();
	let a = 0;
	for (let i = 0; i < 80; i++) {
		const rad = 8 + i * 3.1;
		const x = Math.cos(a) * rad;
		const y = Math.sin(a) * rad;
		if (i === 0) ctx.moveTo(x, y);
		else ctx.lineTo(x, y);
		a += .28 * phi;
	}
	ctx.strokeStyle = "rgba(143,208,176,0.08)";
	ctx.stroke();
	ctx.restore();
}
function drawGame(ctx, g, cssW, cssH, dpr) {
	const layout = layoutOf(cssW, cssH);
	const amp = g.shake && !g.reduced ? g.trauma * g.trauma : 0;
	const ox = Math.sin(g.t * 43) * 8 * amp;
	const oy = Math.cos(g.t * 31) * 6 * amp;
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	ctx.clearRect(0, 0, cssW, cssH);
	const bg = ctx.createLinearGradient(0, 0, 0, cssH);
	bg.addColorStop(0, "#10131c");
	bg.addColorStop(.45, "#07080d");
	bg.addColorStop(1, "#0c0b10");
	ctx.fillStyle = bg;
	ctx.fillRect(0, 0, cssW, cssH);
	for (let i = 0; i < 28; i++) {
		const sx = i * 97 % 100 / 100 * cssW;
		const sy = i * 53 % 100 / 100 * cssH;
		ctx.fillStyle = `rgba(244,239,228,${.04 + (.35 + .65 * (.5 + .5 * Math.sin(g.t * .8 + i))) * .12})`;
		ctx.beginPath();
		ctx.arc(sx, sy, i % 5 === 0 ? 1.6 : 1, 0, Math.PI * 2);
		ctx.fill();
	}
	drawLattice(ctx, cssW, cssH, g.t);
	ctx.save();
	ctx.translate(ox, oy);
	const R = layout.scale;
	const dangerSy = worldY(layout, DANGER_Y);
	let nearest = Infinity;
	if (g.phase !== "menu") for (let r = 0; r < g.grid.length; r++) for (let c = 0; c < g.grid[r].length; c++) {
		if (!g.grid[r][c]) continue;
		nearest = Math.min(nearest, DANGER_Y - (centerOf(g, r, c).y + .92));
	}
	const hot = nearest < 1.7;
	ctx.save();
	ctx.setLineDash([6, 8]);
	ctx.strokeStyle = hot ? `rgba(224,122,106,${.55 + .25 * Math.sin(g.t * 6)})` : "rgba(224,122,106,0.28)";
	ctx.lineWidth = 1.25;
	ctx.beginPath();
	ctx.moveTo(worldX(layout, .2), dangerSy);
	ctx.lineTo(worldX(layout, 15.8), dangerSy);
	ctx.stroke();
	ctx.restore();
	ctx.fillStyle = hot ? "rgba(224,122,106,0.8)" : "rgba(163,156,144,0.55)";
	ctx.font = `600 ${Math.max(9, R * .28)}px Syne, sans-serif`;
	ctx.textAlign = "left";
	ctx.textBaseline = "bottom";
	ctx.fillText("LIMIT", worldX(layout, .25), dangerSy - 4);
	if (g.grid.length) {
		const ceilY = worldY(layout, centerOf(g, 0, 0).y - 1.15);
		const x0 = worldX(layout, .15);
		const x1 = worldX(layout, 15.85);
		ctx.strokeStyle = "rgba(228,177,90,0.85)";
		ctx.lineWidth = Math.max(2, R * .08);
		ctx.beginPath();
		ctx.moveTo(x0, ceilY);
		ctx.lineTo(x1, ceilY);
		ctx.stroke();
		ctx.fillStyle = "#e4b15a";
		const ticks = 8;
		for (let i = 0; i <= ticks; i++) {
			const x = x0 + (x1 - x0) * i / ticks;
			ctx.beginPath();
			ctx.arc(x, ceilY, Math.max(1.5, R * .06), 0, Math.PI * 2);
			ctx.fill();
		}
	}
	if ((g.phase === "menu" || g.phase === "over") && !g.shot) for (const d of g.drift) {
		ctx.save();
		ctx.translate(worldX(layout, d.x), worldY(layout, d.y));
		ctx.rotate(d.rot * .15);
		drawOrb(ctx, 0, 0, R * .92, d.orb, .9);
		ctx.restore();
	}
	const showAim = g.phase === "play" && !g.shot && g.waveDelay <= 0;
	if (showAim && g.aimPath.length > 1) {
		ctx.fillStyle = glassOf(g.current).rim;
		for (let i = 0; i < g.aimPath.length; i += 2) {
			const p = g.aimPath[i];
			ctx.globalAlpha = .15 + i / g.aimPath.length * .45;
			ctx.beginPath();
			ctx.arc(worldX(layout, p.x), worldY(layout, p.y), Math.max(1.5, R * .07), 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.globalAlpha = 1;
	}
	const previewSet = new Set(g.preview.map((p) => `${p.r},${p.c}`));
	for (let r = 0; r < g.grid.length; r++) for (let c = 0; c < g.grid[r].length; c++) {
		const orb = g.grid[r][c];
		if (!orb) continue;
		const p = centerOf(g, r, c);
		const grow = popIn(g.t, orb.placedT);
		const sx = worldX(layout, p.x);
		const sy = worldY(layout, p.y);
		drawOrb(ctx, sx, sy, R * .96 * grow, orb, 1);
		const hovered = g.hoverCanon && orb.canon === g.hoverCanon && !orb.special;
		const marked = previewSet.has(`${r},${c}`);
		if (hovered || marked) {
			ctx.beginPath();
			ctx.arc(sx, sy, R * (marked ? 1.05 + Math.sin(g.t * 8) * .04 : 1.04), 0, Math.PI * 2);
			ctx.strokeStyle = marked ? "rgba(244,239,228,0.9)" : "rgba(228,177,90,0.95)";
			ctx.lineWidth = marked ? 2.5 : 2;
			ctx.stroke();
		}
	}
	if (showAim && g.previewLand) drawOrb(ctx, worldX(layout, g.previewLand.x), worldY(layout, g.previewLand.y), R * .96, g.current, g.preview.length ? .72 : .4);
	for (const f of g.falling) {
		ctx.save();
		ctx.translate(worldX(layout, f.x), worldY(layout, f.y));
		ctx.rotate(f.rot);
		drawOrb(ctx, 0, 0, R * .96, f.orb, 1);
		ctx.restore();
	}
	if (g.shot) {
		const ang = Math.atan2(g.shot.vy, g.shot.vx);
		const stretch = g.reduced ? 1 : 1.16;
		const squash = g.reduced ? 1 : .88;
		ctx.save();
		ctx.translate(worldX(layout, g.shot.x), worldY(layout, g.shot.y));
		ctx.rotate(ang);
		ctx.scale(stretch, squash);
		ctx.rotate(-ang);
		drawOrb(ctx, 0, 0, R * .96, g.shot.orb, 1);
		ctx.restore();
	}
	if (g.phase === "play" || g.phase === "pause") {
		const bob = Math.sin(g.t * 2.5) * R * .04;
		const recoil = g.reduced ? 0 : g.recoil * R * .12;
		const sx = worldX(layout, 8);
		const sy = worldY(layout, SHOOTER_Y) + bob + recoil;
		const vane = 1.55 * R;
		ctx.strokeStyle = "rgba(228,177,90,0.9)";
		ctx.lineWidth = Math.max(2, R * .07);
		ctx.beginPath();
		ctx.moveTo(sx, sy);
		ctx.lineTo(sx + Math.cos(g.angle) * vane, sy + Math.sin(g.angle) * vane);
		ctx.stroke();
		ctx.fillStyle = "#e4b15a";
		ctx.beginPath();
		ctx.arc(sx + Math.cos(g.angle) * vane, sy + Math.sin(g.angle) * vane, Math.max(2.5, R * .08), 0, Math.PI * 2);
		ctx.fill();
		ctx.strokeStyle = "rgba(228,177,90,0.35)";
		ctx.lineWidth = 1.5;
		ctx.beginPath();
		ctx.arc(sx, sy + R * .15, R * 1.15, Math.PI * 1.08, Math.PI * 1.92);
		ctx.stroke();
		if (!g.shot) drawOrb(ctx, sx, sy, R * .98, g.current, 1);
	}
	for (const p of g.particles) {
		const alpha = Math.max(0, p.life / p.max);
		const sx = worldX(layout, p.x);
		const sy = worldY(layout, p.y);
		if (p.kind === "ring") {
			const rad = R * (.4 + (1 - alpha) * 1.6);
			ctx.beginPath();
			ctx.arc(sx, sy, rad, 0, Math.PI * 2);
			ctx.strokeStyle = `rgba(243,215,161,${alpha * .7})`;
			ctx.lineWidth = 2;
			ctx.stroke();
		} else if (p.kind === "glyph" && p.glyph) {
			ctx.globalAlpha = alpha;
			ctx.fillStyle = p.color;
			ctx.font = `600 ${Math.max(11, R * .42)}px "IBM Plex Mono", ui-monospace, monospace`;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText(p.glyph, sx, sy);
			ctx.globalAlpha = 1;
		} else {
			ctx.globalAlpha = alpha;
			ctx.fillStyle = p.color;
			ctx.beginPath();
			ctx.arc(sx, sy, Math.max(1, p.size * R), 0, Math.PI * 2);
			ctx.fill();
			ctx.globalAlpha = 1;
		}
	}
	for (const f of g.floaters) {
		ctx.globalAlpha = Math.max(0, f.life / f.max);
		ctx.fillStyle = f.color;
		ctx.font = `700 ${Math.max(14, R * .55)}px Syne, sans-serif`;
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(f.text, worldX(layout, f.x), worldY(layout, f.y));
		ctx.globalAlpha = 1;
	}
	if (g.bannerT > 0 && g.banner && g.phase !== "over") {
		ctx.globalAlpha = Math.min(1, g.bannerT * 2);
		ctx.fillStyle = "#f4efe4";
		ctx.font = `800 ${Math.max(22, R * .85)}px Syne, sans-serif`;
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(g.banner, cssW / 2 + ox, layout.oy + R * 1.3);
		ctx.globalAlpha = 1;
	}
	ctx.restore();
	if (g.flash > 0 && !g.reduced) {
		ctx.fillStyle = `rgba(244,239,228,${g.flash})`;
		ctx.fillRect(0, 0, cssW, cssH);
	}
	const vignette = ctx.createRadialGradient(cssW / 2, cssH / 2, Math.min(cssW, cssH) * .35, cssW / 2, cssH / 2, Math.max(cssW, cssH) * .72);
	vignette.addColorStop(0, "rgba(0,0,0,0)");
	vignette.addColorStop(1, "rgba(0,0,0,0.38)");
	ctx.fillStyle = vignette;
	ctx.fillRect(0, 0, cssW, cssH);
}
var SAVE_KEY$1 = "bubble-proof-v1";
function loadSave$1() {
	try {
		const raw = localStorage.getItem(SAVE_KEY$1);
		if (!raw) return {};
		const data = JSON.parse(raw);
		return data && typeof data === "object" ? data : {};
	} catch {
		return {};
	}
}
function writeSave$1(g) {
	const payload = {
		best: g.best,
		mute: g.mute,
		shake: g.shake,
		blind: g.blind
	};
	try {
		localStorage.setItem(SAVE_KEY$1, JSON.stringify(payload));
	} catch {}
}
function expr(orb) {
	return orb.b ? `${orb.a} ${orb.b}` : orb.a;
}
function OrbFace({ orb, size = 72 }) {
	const glass = glassOf(orb);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative grid shrink-0 place-items-center rounded-full",
		style: {
			width: size,
			height: size,
			background: `radial-gradient(circle at 32% 28%, ${glass.hi}, ${glass.mid} 48%, ${glass.deep})`,
			boxShadow: "inset 0 -6px 12px rgba(0,0,0,0.35), 0 8px 18px rgba(0,0,0,0.28)"
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "pointer-events-none absolute rounded-full bg-cream/80",
			style: {
				width: size * .28,
				height: size * .14,
				top: size * .16,
				left: size * .18
			}
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "relative z-10 rounded-md bg-ink/70 px-1 py-0.5 text-center font-mono leading-tight text-cream",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block",
				style: { fontSize: Math.max(10, size * .2) },
				children: orb.a
			}), orb.b ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block text-gold-soft",
				style: { fontSize: Math.max(9, size * .15) },
				children: orb.b
			}) : null]
		})]
	});
}
function Shots({ left, total }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex items-center gap-1",
		"aria-label": `${left} shots until the ceiling drops`,
		children: Array.from({ length: total }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: i < left ? "size-2 rounded-full bg-gold" : "size-2 rounded-full bg-line" }, i))
	});
}
function domainDot(domain) {
	return DOMAIN_GLASS[domain].mid;
}
function BubbleProof({ active = true, onExit }) {
	const canvasRef = (0, import_react.useRef)(null);
	const gameRef = (0, import_react.useRef)(null);
	const layoutRef = (0, import_react.useRef)(layoutOf(360, 640));
	const activeRef = (0, import_react.useRef)(active);
	const [hud, setHud] = (0, import_react.useState)(null);
	const [ready, setReady] = (0, import_react.useState)(false);
	const [track, setTrack] = (0, import_react.useState)({
		best: 0,
		cleared: 0,
		scores: [],
		lastPlayed: 0
	});
	const seenClear = (0, import_react.useRef)(0);
	const phase = hud?.phase ?? "menu";
	const live = phase === "play" || phase === "pause" || phase === "over";
	activeRef.current = active;
	(0, import_react.useEffect)(() => {
		const g = createGame();
		const saved = loadSave$1();
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
		setSfx((name, pitch) => playSfx$1(name, pitch ?? 1));
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
		const loop = (now) => {
			frame = requestAnimationFrame(loop);
			if (!activeRef.current) {
				g.keys.left = false;
				g.keys.right = false;
				last = now;
				return;
			}
			const dt = (now - last) / 1e3;
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
				writeSave$1(g);
				setHud(snapshot(g));
			}
		};
		frame = requestAnimationFrame(loop);
		const clearKeys = () => {
			g.keys.left = false;
			g.keys.right = false;
		};
		const onKeyDown = (e) => {
			if (!activeRef.current) return;
			if (e.code === "KeyA" || e.code === "ArrowLeft") {
				g.keys.left = true;
				e.preventDefault();
			} else if (e.code === "KeyD" || e.code === "ArrowRight") {
				g.keys.right = true;
				e.preventDefault();
			} else if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
				if (e.target?.closest("button")) return;
				e.preventDefault();
				if (e.repeat) return;
				unlockAudio();
				shoot(g);
			} else if (e.code === "Escape") togglePause(g);
			else if (e.code === "KeyM") {
				g.mute = !g.mute;
				setMuted(g.mute);
			}
		};
		const onKeyUp = (e) => {
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
			setKeys: (codes) => {
				g.keys.left = codes.includes("KeyA") || codes.includes("ArrowLeft");
				g.keys.right = codes.includes("KeyD") || codes.includes("ArrowRight");
			},
			phase: () => g.phase,
			start: () => startGame(g, false)
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
	(0, import_react.useEffect)(() => {
		if (active && gameRef.current) setMuted(gameRef.current.mute);
	}, [active]);
	const aimFrom = (clientX, clientY, canvas) => {
		const g = gameRef.current;
		if (!g) return;
		const rect = canvas.getBoundingClientRect();
		const world = screenToWorld(layoutRef.current, clientX - rect.left, clientY - rect.top);
		aimAt(g, world.x, world.y);
	};
	const hold = (dir, down) => {
		const g = gameRef.current;
		if (!g) return;
		g.keys[dir] = down;
	};
	(0, import_react.useEffect)(() => {
		if (!hud || hud.clearSeq === 0 || hud.clearSeq === seenClear.current) return;
		seenClear.current = hud.clearSeq;
		setTrack(noteClear("bubbles", hud.clearLevel, hud.clearScore, hud.score));
	}, [hud]);
	(0, import_react.useEffect)(() => {
		if (hud?.phase !== "over") return;
		setTrack((prev) => {
			const next = noteScore("bubbles", hud.score);
			if (next.best === prev.best && next.cleared === prev.cleared) return prev;
			return next;
		});
	}, [hud?.phase, hud?.score]);
	const onPlay = (level) => {
		const g = gameRef.current;
		if (!g) return;
		unlockAudio();
		startGame(g, g.blind, level ?? track.cleared + 1);
		writeSave$1(g);
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
		writeSave$1(g);
		setHud(snapshot(g));
	};
	const onShake = () => {
		const g = gameRef.current;
		if (!g || g.reduced) return;
		g.shake = !g.shake;
		writeSave$1(g);
		setHud(snapshot(g));
	};
	const onBlind = () => {
		const g = gameRef.current;
		if (!g) return;
		setBlind(g, !g.blind);
		writeSave$1(g);
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex h-dvh flex-col overflow-hidden bg-ink text-cream",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "flex shrink-0 flex-col gap-2 border-b border-line px-4 py-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "relative grid size-9 shrink-0 place-items-center rounded-full border border-gold/50 bg-panel",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-4 rounded-full bg-gold" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "truncate text-lg font-extrabold leading-none tracking-tight",
								children: "Bubble Proof"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 font-mono text-xs text-mist",
								children: [live ? `Level ${hud?.wave ?? 1}${hud && hud.wave > CAMPAIGN_LEVELS ? " · apex" : ` / ${CAMPAIGN_LEVELS}`}` : "Match the value", hud && hud.combo >= 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "ml-2 text-gold",
									children: ["×", hud.combo]
								}) : null]
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [
							live && hud ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "hidden lg:block",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shots, {
									left: hud.shotsLeft,
									total: hud.shotsPerDrop
								})
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: `text-right ${live ? "" : "max-sm:hidden"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-mono text-2xl leading-none font-semibold text-gold tabular-nums",
									children: hud?.score ?? 0
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-1 font-mono text-xs text-mist tabular-nums",
									children: ["best ", hud?.best ?? 0]
								})]
							}),
							onExit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArcadeExit, { onExit }) : null,
							phase === "play" || phase === "pause" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: onPause,
								className: "grid size-11 place-items-center rounded-full border border-line bg-panel text-cream",
								"aria-label": phase === "pause" ? "Resume" : "Pause",
								children: phase === "pause" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" })
							}) : null
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-0 flex-1",
				children: [
					live && hud && !hud.blind ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
						className: "hidden min-h-0 w-72 shrink-0 flex-col gap-4 overflow-y-auto border-r border-line bg-panel/80 p-4 lg:flex",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Codex$1, {
							hud,
							onHover: (canon) => {
								const g = gameRef.current;
								if (g) g.hoverCanon = canon;
							}
						})
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "relative min-w-0 flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
								ref: canvasRef,
								className: "absolute inset-0 h-full w-full touch-none",
								"aria-label": "Bubble Proof board. Drag to aim and release to fire.",
								onContextMenu: (e) => e.preventDefault(),
								onPointerDown: (e) => {
									if (!gameRef.current || gameRef.current.phase !== "play") return;
									e.currentTarget.setPointerCapture(e.pointerId);
									unlockAudio();
									aimFrom(e.clientX, e.clientY, e.currentTarget);
								},
								onPointerMove: (e) => {
									if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
									aimFrom(e.clientX, e.clientY, e.currentTarget);
								},
								onPointerUp: (e) => {
									if (!gameRef.current || gameRef.current.phase !== "play") return;
									aimFrom(e.clientX, e.clientY, e.currentTarget);
									if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
									shoot(gameRef.current);
								}
							}),
							phase === "menu" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "pointer-events-none absolute inset-0 flex items-center justify-center p-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "pointer-events-auto max-h-full w-full max-w-md overflow-y-auto rounded-2xl border border-line bg-panel/90 p-6 shadow-2xl backdrop-blur-md",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-mono text-xs tracking-widest text-gold",
											children: "EQUATION ORBS"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
											className: "mt-2 text-4xl font-extrabold tracking-tight",
											children: "Solve it. Shatter it."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-3 text-sm leading-relaxed text-mist",
											children: "Sixteen levels of equation orbs, then the ceiling keeps coming. Three that share a value pop — squared, rooted, or written as a law of motion."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
											className: "mt-4 space-y-2 text-sm leading-relaxed text-cream",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Aim, then release. Arrows or A and D nudge the sight. Space fires." }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "2², √16, and 8÷2 are all 4. Same value, any form." }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Clear the field before the ceiling crosses the limit. Loose bubbles fall." })
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: onBlind,
											"aria-pressed": hud?.blind ?? false,
											className: "mt-5 flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-line bg-ink px-3 py-2 text-left",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "block text-sm font-bold",
												children: "Blind solve"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "block text-xs text-mist",
												children: "Hide the formula book and the match preview."
											})] }), hud?.blind ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "size-4 shrink-0 text-gold" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4 shrink-0 text-mist" })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-4 font-mono text-xs text-mist",
											children: [
												"Cleared ",
												track.cleared,
												track.cleared > CAMPAIGN_LEVELS ? "" : ` / ${CAMPAIGN_LEVELS}`,
												(hud?.best ?? 0) > 0 ? ` · best ${hud?.best}` : ""
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											disabled: !ready,
											onClick: () => onPlay(),
											className: "mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold text-base font-extrabold text-ink disabled:opacity-50",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), track.cleared > 0 ? `Continue · ${track.cleared + 1}` : "Play"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-3",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LevelGrid, {
												count: CAMPAIGN_LEVELS,
												cleared: track.cleared,
												scores: track.scores,
												onPlay: (n) => onPlay(n)
											})
										}),
										track.cleared >= CAMPAIGN_LEVELS ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-2 text-xs text-mist",
											children: [
												"Apex levels keep going after ",
												CAMPAIGN_LEVELS,
												"."
											]
										}) : null
									]
								})
							}) : null,
							phase === "pause" && hud ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Overlay$6, {
								kicker: "Paused",
								title: "The proof can wait.",
								body: "Aim is still yours when you come back.",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: onPause,
									className: "flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold font-extrabold text-ink",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), "Resume"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: onMenu,
									className: "mt-2 min-h-11 w-full rounded-xl border border-line font-bold",
									children: "Menu"
								})]
							}) : null,
							phase === "over" && hud ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Overlay$6, {
								kicker: hud.newBest ? "New best" : "Field lost",
								title: "The lattice caught you.",
								body: `Score ${hud.score} · level ${hud.wave}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => onPlay(hud.wave),
									className: "flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold font-extrabold text-ink",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" }), "Play again"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: onMenu,
									className: "mt-2 min-h-11 w-full rounded-xl border border-line font-bold",
									children: "Menu"
								})]
							}) : null
						]
					}),
					live && hud && current && upcoming ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
						className: "hidden min-h-0 w-80 shrink-0 flex-col gap-4 overflow-y-auto border-l border-line bg-panel/80 p-4 lg:flex",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShotCard, {
								label: "In the chamber",
								orb: current,
								blind: hud.blind
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrbFace, {
									orb: upcoming,
									size: 56
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-mono text-xs tracking-widest text-mist",
									children: "NEXT"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-mono text-lg text-cream",
									children: expr(upcoming)
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-xs tracking-widest text-mist",
								children: "UNTIL THE CEILING"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shots, {
									left: hud.shotsLeft,
									total: hud.shotsPerDrop
								})
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggles, {
								hud,
								onBlind,
								onMute,
								onShake
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs leading-relaxed text-mist",
								children: "Drag to aim, release to fire. A and D or the arrows nudge. Space fires. Esc pauses."
							})
						]
					}) : null
				]
			}),
			live && hud && current ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "shrink-0 border-t border-line bg-panel px-3 py-3 lg:hidden",
				children: [
					!hud.blind && hud.codex.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-2 flex gap-2 overflow-x-auto pb-1",
						children: hud.codex.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "shrink-0 rounded-full border border-line bg-ink px-2 py-1 font-mono text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-gold",
								children: group.canon
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-mist",
								children: [" ", group.items.map((item) => item.b ? `${item.a} ${item.b}` : item.a).join(" · ")]
							})]
						}, group.canon))
					}) : null,
					!hud.blind ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-2 truncate text-xs text-mist",
						children: current.blurb
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrbFace, {
								orb: current,
								size: 58
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-mono text-xs text-mist",
									children: "NOW"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate font-mono text-lg leading-tight",
									children: expr(current)
								})]
							}),
							upcoming ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-right",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-mono text-xs text-mist",
									children: "NEXT"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-mono text-sm text-gold-soft",
									children: expr(upcoming)
								})]
							}) : null
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shots, {
							left: hud.shotsLeft,
							total: hud.shotsPerDrop
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-xs text-mist",
							children: "ceiling"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 grid grid-cols-4 gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HoldButton, {
								label: "Left",
								onHold: (down) => hold("left", down)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: fire,
								className: "min-h-11 rounded-xl bg-gold font-extrabold text-ink",
								children: "Fire"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HoldButton, {
								label: "Right",
								onHold: (down) => hold("right", down)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: onMute,
								className: "grid min-h-11 place-items-center rounded-xl border border-line",
								"aria-label": hud.mute ? "Unmute" : "Mute",
								children: hud.mute ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" })
							})
						]
					})
				]
			}) : null
		]
	});
}
function ShotCard({ orb, label, blind }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-start gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrbFace, {
			orb,
			size: 84
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs tracking-widest text-mist",
					children: label.toUpperCase()
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 font-mono text-xl leading-tight",
					children: expr(orb)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-gold-soft",
					children: specialOrDomain(orb)
				}),
				blind ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm leading-relaxed text-mist",
					children: orb.blurb
				})
			]
		})]
	});
}
function specialOrDomain(orb) {
	if (orb.special === "wild") return "Wildcard";
	if (orb.special === "burst") return "Burst";
	if (orb.special === "pulse") return "Impulse";
	return domainLabel(orb.domain);
}
function Codex$1({ hud, onHover }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		onMouseLeave: () => onHover(null),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-xs tracking-widest text-gold",
				children: "FORMULA BOOK"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-relaxed text-mist",
				children: "These values are on the field. Any spelling of the same number connects."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 space-y-3",
				children: [hud.codex.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-mist",
					children: "The field is clear."
				}) : null, hud.codex.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onMouseEnter: () => onHover(group.canon),
					onFocus: () => onHover(group.canon),
					onBlur: () => onHover(null),
					className: "block w-full rounded-xl border border-line bg-ink px-3 py-3 text-left",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-2xl text-gold",
						children: group.canon
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-2 flex flex-wrap gap-1",
						children: group.items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1 rounded-full bg-panel-2 px-2 py-1 font-mono text-xs text-cream",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "size-2 rounded-full",
								style: { background: domainDot(item.domain) }
							}), item.b ? `${item.a} ${item.b}` : item.a]
						}, `${item.a}|${item.b ?? ""}`))
					})]
				}, group.canon))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-xs leading-relaxed text-mist",
				children: "Amber is arithmetic, teal geometry, rose physics, periwinkle trig, gold a constant. Color is the subject, not the answer."
			})
		]
	});
}
function Toggles({ hud, onBlind, onMute, onShake }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid grid-cols-3 gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
				onClick: onBlind,
				pressed: hud.blind,
				label: hud.blind ? "Blind" : "Hints",
				icon: hud.blind ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
				onClick: onMute,
				pressed: hud.mute,
				label: hud.mute ? "Muted" : "Sound",
				icon: hud.mute ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
				onClick: onShake,
				pressed: hud.shake,
				label: hud.shake ? "Shake" : "Steady",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-xs",
					children: "~"
				})
			})
		]
	});
}
function Toggle({ onClick, pressed, label, icon }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		"aria-pressed": pressed,
		className: "flex min-h-11 flex-col items-center justify-center gap-1 rounded-xl border border-line bg-ink text-xs font-bold",
		children: [icon, label]
	});
}
function HoldButton({ label, onHold }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		className: "min-h-11 rounded-xl border border-line font-bold",
		onPointerDown: () => onHold(true),
		onPointerUp: () => onHold(false),
		onPointerCancel: () => onHold(false),
		onPointerLeave: () => onHold(false),
		children: label
	});
}
function Overlay$6({ kicker, title, body, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 flex items-center justify-center bg-ink/55 p-4 backdrop-blur-sm",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm rounded-2xl border border-line bg-panel p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs tracking-widest text-gold",
					children: kicker
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-2 text-3xl font-extrabold tracking-tight",
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-mist",
					children: body
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5",
					children
				})
			]
		})
	});
}
var EQUALS_LEVELS = [
	{
		id: 1,
		title: "Four",
		target: "4",
		blurb: "Pop every card that equals 4. Leave the rest.",
		par: 20,
		cards: [
			{
				a: "2²",
				match: true,
				blurb: "Two squared is 4."
			},
			{
				a: "√16",
				match: true,
				blurb: "The square root of 16 is 4."
			},
			{
				a: "8÷2",
				match: true,
				blurb: "Eight divided by two is 4."
			},
			{
				a: "6−2",
				match: true,
				blurb: "Six minus two is 4."
			},
			{
				a: "3²",
				match: false,
				blurb: "Three squared is 9."
			},
			{
				a: "2×3",
				match: false,
				blurb: "Two times three is 6."
			}
		]
	},
	{
		id: 2,
		title: "Eight",
		target: "8",
		blurb: "Same value, different spelling. Force counts too.",
		par: 22,
		cards: [
			{
				a: "2³",
				match: true,
				blurb: "Two cubed is 8."
			},
			{
				a: "√64",
				match: true,
				blurb: "The square root of 64 is 8."
			},
			{
				a: "4×2",
				match: true,
				blurb: "Four times two is 8."
			},
			{
				a: "F=ma",
				b: "2·4",
				match: true,
				blurb: "Force is mass times acceleration. 2 × 4 = 8."
			},
			{
				a: "3²",
				match: false,
				blurb: "Three squared is 9."
			},
			{
				a: "4²",
				match: false,
				blurb: "Four squared is 16."
			},
			{
				a: "2×3",
				match: false,
				blurb: "Two times three is 6."
			}
		]
	},
	{
		id: 3,
		title: "Nine",
		target: "9",
		blurb: "Squares and sums can hide the same number.",
		par: 22,
		cards: [
			{
				a: "3²",
				match: true,
				blurb: "Three squared is 9."
			},
			{
				a: "√81",
				match: true,
				blurb: "The square root of 81 is 9."
			},
			{
				a: "6+3",
				match: true,
				blurb: "Six plus three is 9."
			},
			{
				a: "18÷2",
				match: true,
				blurb: "Eighteen divided by two is 9."
			},
			{
				a: "2³",
				match: false,
				blurb: "Two cubed is 8."
			},
			{
				a: "4²",
				match: false,
				blurb: "Four squared is 16."
			},
			{
				a: "5×2",
				match: false,
				blurb: "Five times two is 10."
			}
		]
	},
	{
		id: 4,
		title: "Twelve",
		target: "12",
		blurb: "A triangle's area can match a product.",
		par: 26,
		cards: [
			{
				a: "3×4",
				match: true,
				blurb: "Three times four is 12."
			},
			{
				a: "√144",
				match: true,
				blurb: "The square root of 144 is 12."
			},
			{
				a: "½bh",
				b: "6·4",
				match: true,
				blurb: "Triangle area is half base times height. ½ × 6 × 4 = 12."
			},
			{
				a: "24÷2",
				match: true,
				blurb: "Twenty-four divided by two is 12."
			},
			{
				a: "4²",
				match: false,
				blurb: "Four squared is 16."
			},
			{
				a: "3³",
				match: false,
				blurb: "Three cubed is 27."
			},
			{
				a: "5×3",
				match: false,
				blurb: "Five times three is 15."
			},
			{
				a: "2³",
				match: false,
				blurb: "Two cubed is 8."
			}
		]
	},
	{
		id: 5,
		title: "Sixteen",
		target: "16",
		blurb: "Kinetic energy can land on the same number as a square.",
		par: 28,
		cards: [
			{
				a: "4²",
				match: true,
				blurb: "Four squared is 16."
			},
			{
				a: "2⁴",
				match: true,
				blurb: "Two to the fourth is 16."
			},
			{
				a: "s²",
				b: "s=4",
				match: true,
				blurb: "A square of side 4 has area 16."
			},
			{
				a: "½mv²",
				b: "2·4²",
				match: true,
				blurb: "Kinetic energy ½mv² with m = 2 and v = 4 is 16."
			},
			{
				a: "4×5",
				match: false,
				blurb: "Four times five is 20."
			},
			{
				a: "3²",
				match: false,
				blurb: "Three squared is 9."
			},
			{
				a: "√81",
				match: false,
				blurb: "The square root of 81 is 9."
			},
			{
				a: "5²",
				match: false,
				blurb: "Five squared is 25."
			}
		]
	},
	{
		id: 6,
		title: "Six",
		target: "6",
		blurb: "Watch the near misses. 8 and 5 are not 6.",
		par: 24,
		cards: [
			{
				a: "2×3",
				match: true,
				blurb: "Two times three is 6."
			},
			{
				a: "√36",
				match: true,
				blurb: "The square root of 36 is 6."
			},
			{
				a: "9−3",
				match: true,
				blurb: "Nine minus three is 6."
			},
			{
				a: "12÷2",
				match: true,
				blurb: "Twelve divided by two is 6."
			},
			{
				a: "2³",
				match: false,
				blurb: "Two cubed is 8."
			},
			{
				a: "3+2",
				match: false,
				blurb: "Three plus two is 5."
			},
			{
				a: "4×4",
				match: false,
				blurb: "Four times four is 16."
			},
			{
				a: "5+2",
				match: false,
				blurb: "Five plus two is 7."
			}
		]
	},
	{
		id: 7,
		title: "Ten",
		target: "10",
		blurb: "Momentum is mass times velocity.",
		par: 26,
		cards: [
			{
				a: "5×2",
				match: true,
				blurb: "Five times two is 10."
			},
			{
				a: "√100",
				match: true,
				blurb: "The square root of 100 is 10."
			},
			{
				a: "p=mv",
				b: "2·5",
				match: true,
				blurb: "Momentum p = mv. 2 × 5 = 10."
			},
			{
				a: "15−5",
				match: true,
				blurb: "Fifteen minus five is 10."
			},
			{
				a: "3²",
				match: false,
				blurb: "Three squared is 9."
			},
			{
				a: "4×4",
				match: false,
				blurb: "Four times four is 16."
			},
			{
				a: "2³",
				match: false,
				blurb: "Two cubed is 8."
			},
			{
				a: "6×3",
				match: false,
				blurb: "Six times three is 18."
			}
		]
	},
	{
		id: 8,
		title: "Twenty-five",
		target: "25",
		blurb: "A square of side 5 covers 25.",
		par: 24,
		cards: [
			{
				a: "5²",
				match: true,
				blurb: "Five squared is 25."
			},
			{
				a: "√625",
				match: true,
				blurb: "The square root of 625 is 25."
			},
			{
				a: "s²",
				b: "s=5",
				match: true,
				blurb: "A square of side 5 has area 25."
			},
			{
				a: "100÷4",
				match: true,
				blurb: "One hundred divided by four is 25."
			},
			{
				a: "4²",
				match: false,
				blurb: "Four squared is 16."
			},
			{
				a: "6²",
				match: false,
				blurb: "Six squared is 36."
			},
			{
				a: "3³",
				match: false,
				blurb: "Three cubed is 27."
			},
			{
				a: "2×10",
				match: false,
				blurb: "Two times ten is 20."
			}
		]
	},
	{
		id: 9,
		title: "One half",
		target: "½",
		blurb: "Sine and cosine can equal a plain fraction.",
		par: 30,
		cards: [
			{
				a: "1÷2",
				match: true,
				blurb: "One divided by two is one half."
			},
			{
				a: "sin",
				b: "30°",
				match: true,
				blurb: "Sine of 30° is 1/2."
			},
			{
				a: "cos",
				b: "60°",
				match: true,
				blurb: "Cosine of 60° is 1/2."
			},
			{
				a: "3÷6",
				match: true,
				blurb: "Three divided by six is one half."
			},
			{
				a: "sin",
				b: "90°",
				match: false,
				blurb: "Sine of 90° is 1."
			},
			{
				a: "cos",
				b: "0°",
				match: false,
				blurb: "Cosine of 0° is 1."
			},
			{
				a: "tan",
				b: "45°",
				match: false,
				blurb: "Tangent of 45° is 1."
			},
			{
				a: "2÷2",
				match: false,
				blurb: "Two divided by two is 1."
			}
		]
	},
	{
		id: 10,
		title: "Thirty-six",
		target: "36",
		blurb: "Six squared, and three ways to build it.",
		par: 26,
		cards: [
			{
				a: "6²",
				match: true,
				blurb: "Six squared is 36."
			},
			{
				a: "9×4",
				match: true,
				blurb: "Nine times four is 36."
			},
			{
				a: "3×12",
				match: true,
				blurb: "Three times twelve is 36."
			},
			{
				a: "√1296",
				match: true,
				blurb: "The square root of 1296 is 36."
			},
			{
				a: "5²",
				match: false,
				blurb: "Five squared is 25."
			},
			{
				a: "7²",
				match: false,
				blurb: "Seven squared is 49."
			},
			{
				a: "8×4",
				match: false,
				blurb: "Eight times four is 32."
			},
			{
				a: "4³",
				match: false,
				blurb: "Four cubed is 64."
			}
		]
	},
	{
		id: 11,
		title: "Phi",
		target: "φ",
		blurb: "The golden ratio. Close is not the same.",
		par: 28,
		cards: [
			{
				a: "φ",
				match: true,
				blurb: "Phi, about 1.618."
			},
			{
				a: "1+√5",
				b: "÷ 2",
				match: true,
				blurb: "(1 + √5) / 2 is phi."
			},
			{
				a: "1.618",
				match: true,
				blurb: "Phi, written as a decimal."
			},
			{
				a: "π",
				match: false,
				blurb: "Pi is about 3.14, not phi."
			},
			{
				a: "√2",
				match: false,
				blurb: "The square root of 2 is about 1.414."
			},
			{
				a: "e",
				match: false,
				blurb: "Euler's number is about 2.718."
			},
			{
				a: "8÷5",
				match: false,
				blurb: "Eight fifths is 1.6, near phi but not it."
			},
			{
				a: "22÷7",
				match: false,
				blurb: "Twenty-two sevenths is about 3.14, a stand-in for pi."
			}
		]
	},
	{
		id: 12,
		title: "Four pi",
		target: "4π",
		blurb: "Area and circumference can share a value.",
		par: 32,
		cards: [
			{
				a: "πr²",
				b: "r=2",
				match: true,
				blurb: "Circle area πr² with radius 2 is 4π."
			},
			{
				a: "2πr",
				b: "r=2",
				match: true,
				blurb: "Circumference 2πr with radius 2 is 4π."
			},
			{
				a: "πd",
				b: "d=4",
				match: true,
				blurb: "Circumference πd with diameter 4 is 4π."
			},
			{
				a: "4π",
				match: true,
				blurb: "Four times pi."
			},
			{
				a: "πr²",
				b: "r=1",
				match: false,
				blurb: "Area with radius 1 is π, not 4π."
			},
			{
				a: "2πr",
				b: "r=1",
				match: false,
				blurb: "A unit circle's circumference is 2π."
			},
			{
				a: "πd",
				b: "d=8",
				match: false,
				blurb: "Diameter 8 gives 8π."
			},
			{
				a: "πr²",
				b: "r=4",
				match: false,
				blurb: "Radius 4 gives area 16π."
			}
		]
	},
	{
		id: 13,
		title: "Twenty-four",
		target: "24",
		blurb: "Work and area again. Read the givens.",
		par: 30,
		cards: [
			{
				a: "6×4",
				match: true,
				blurb: "Six times four is 24."
			},
			{
				a: "8×3",
				match: true,
				blurb: "Eight times three is 24."
			},
			{
				a: "48÷2",
				match: true,
				blurb: "Forty-eight divided by two is 24."
			},
			{
				a: "½bh",
				b: "8·6",
				match: true,
				blurb: "½ × 8 × 6 = 24."
			},
			{
				a: "4²",
				match: false,
				blurb: "Four squared is 16."
			},
			{
				a: "5²",
				match: false,
				blurb: "Five squared is 25."
			},
			{
				a: "3³",
				match: false,
				blurb: "Three cubed is 27."
			},
			{
				a: "7×3",
				match: false,
				blurb: "Seven times three is 21."
			},
			{
				a: "20+5",
				match: false,
				blurb: "Twenty plus five is 25."
			}
		]
	},
	{
		id: 14,
		title: "Twenty-seven",
		target: "27",
		blurb: "A cube, a product, and a force.",
		par: 28,
		cards: [
			{
				a: "3³",
				match: true,
				blurb: "Three cubed is 27."
			},
			{
				a: "9×3",
				match: true,
				blurb: "Nine times three is 27."
			},
			{
				a: "√729",
				match: true,
				blurb: "The square root of 729 is 27."
			},
			{
				a: "F=ma",
				b: "9·3",
				match: true,
				blurb: "Force 9 × 3 = 27."
			},
			{
				a: "3²",
				match: false,
				blurb: "Three squared is 9."
			},
			{
				a: "2⁵",
				match: false,
				blurb: "Two to the fifth is 32."
			},
			{
				a: "5²",
				match: false,
				blurb: "Five squared is 25."
			},
			{
				a: "6×4",
				match: false,
				blurb: "Six times four is 24."
			}
		]
	},
	{
		id: 15,
		title: "One",
		target: "1",
		blurb: "The quiet identities. Zero is not one.",
		par: 30,
		cards: [
			{
				a: "sin",
				b: "90°",
				match: true,
				blurb: "Sine of 90° is 1."
			},
			{
				a: "cos",
				b: "0°",
				match: true,
				blurb: "Cosine of 0° is 1."
			},
			{
				a: "tan",
				b: "45°",
				match: true,
				blurb: "Tangent of 45° is 1."
			},
			{
				a: "7÷7",
				match: true,
				blurb: "Seven divided by seven is 1."
			},
			{
				a: "1²",
				match: true,
				blurb: "One squared is 1."
			},
			{
				a: "sin",
				b: "0°",
				match: false,
				blurb: "Sine of 0° is 0."
			},
			{
				a: "cos",
				b: "90°",
				match: false,
				blurb: "Cosine of 90° is 0."
			},
			{
				a: "2²",
				match: false,
				blurb: "Two squared is 4."
			},
			{
				a: "1÷2",
				match: false,
				blurb: "One half, not one."
			}
		]
	},
	{
		id: 16,
		title: "Sixty-four",
		target: "64",
		blurb: "Last page. Cube, square, and a sixth power.",
		par: 28,
		cards: [
			{
				a: "8²",
				match: true,
				blurb: "Eight squared is 64."
			},
			{
				a: "4³",
				match: true,
				blurb: "Four cubed is 64."
			},
			{
				a: "2⁶",
				match: true,
				blurb: "Two to the sixth is 64."
			},
			{
				a: "√4096",
				match: true,
				blurb: "The square root of 4096 is 64."
			},
			{
				a: "6²",
				match: false,
				blurb: "Six squared is 36."
			},
			{
				a: "7²",
				match: false,
				blurb: "Seven squared is 49."
			},
			{
				a: "9×7",
				match: false,
				blurb: "Nine times seven is 63."
			},
			{
				a: "4²",
				match: false,
				blurb: "Four squared is 16."
			},
			{
				a: "3³",
				match: false,
				blurb: "Three cubed is 27."
			}
		]
	}
];
function auditEquals() {
	const errors = [];
	EQUALS_LEVELS.forEach((level, index) => {
		if (level.id !== index + 1) errors.push(`equals id ${level.id}`);
		const matches = level.cards.filter((card) => card.match).length;
		const decoys = level.cards.length - matches;
		if (matches < 3) errors.push(`level ${level.id} matches ${matches}`);
		if (decoys < 2) errors.push(`level ${level.id} decoys ${decoys}`);
		const seen = /* @__PURE__ */ new Set();
		for (const card of level.cards) {
			const key = `${card.a}|${card.b ?? ""}`;
			if (seen.has(key)) errors.push(`level ${level.id} duplicate ${key}`);
			seen.add(key);
			if (!card.blurb) errors.push(`level ${level.id} missing blurb`);
		}
	});
	return errors;
}
var HEARTS$4 = 3;
function shuffle$4(list) {
	const next = [...list];
	for (let i = next.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		const swap = next[i];
		next[i] = next[j];
		next[j] = swap;
	}
	return next;
}
function EqualsProof({ active = true, onExit }) {
	const [phase, setPhase] = (0, import_react.useState)("menu");
	const [level, setLevel] = (0, import_react.useState)(1);
	const [cards, setCards] = (0, import_react.useState)([]);
	const [hearts, setHearts] = (0, import_react.useState)(HEARTS$4);
	const [score, setScore] = (0, import_react.useState)(0);
	const [levelScore, setLevelScore] = (0, import_react.useState)(0);
	const [combo, setCombo] = (0, import_react.useState)(0);
	const [blurb, setBlurb] = (0, import_react.useState)("Pop every card that equals the target.");
	const [bonus, setBonus] = (0, import_react.useState)(0);
	const [track, setTrack] = (0, import_react.useState)({
		best: 0,
		cleared: 0,
		scores: [],
		lastPlayed: 0
	});
	const [mute, setMute] = (0, import_react.useState)(false);
	const [shake, setShake] = (0, import_react.useState)(false);
	const phaseRef = (0, import_react.useRef)(phase);
	const activeRef = (0, import_react.useRef)(active);
	const lockRef = (0, import_react.useRef)(false);
	const scoreRef = (0, import_react.useRef)(0);
	const levelScoreRef = (0, import_react.useRef)(0);
	const heartsRef = (0, import_react.useRef)(HEARTS$4);
	const comboRef = (0, import_react.useRef)(0);
	const cardsRef = (0, import_react.useRef)([]);
	const levelRef = (0, import_react.useRef)(1);
	const startedRef = (0, import_react.useRef)(0);
	const muteRef = (0, import_react.useRef)(false);
	const mounted = (0, import_react.useRef)(true);
	phaseRef.current = phase;
	activeRef.current = active;
	muteRef.current = mute;
	const syncCards = (next) => {
		cardsRef.current = next;
		setCards(next);
	};
	const begin = (nextLevel, keepScore) => {
		const spec = EQUALS_LEVELS[nextLevel - 1];
		if (!spec) {
			setPhase("done");
			phaseRef.current = "done";
			return;
		}
		const dealt = shuffle$4(spec.cards).map((card, index) => ({
			...card,
			id: index + 1,
			gone: false,
			bad: false
		}));
		levelRef.current = nextLevel;
		setLevel(nextLevel);
		syncCards(dealt);
		heartsRef.current = HEARTS$4;
		setHearts(HEARTS$4);
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
		const elapsed = (performance.now() - startedRef.current) / 1e3;
		const gained = Math.max(0, Math.round((spec.par - elapsed) * 12)) + 120 * spec.id;
		const nextLevelScore = levelScoreRef.current + gained;
		const nextRun = scoreRef.current + gained;
		levelScoreRef.current = nextLevelScore;
		scoreRef.current = nextRun;
		setLevelScore(nextLevelScore);
		setScore(nextRun);
		setBonus(gained);
		setTrack(noteClear("equals", spec.id, nextLevelScore, nextRun));
		playSfx$1("wave");
		if (spec.id >= EQUALS_LEVELS.length) {
			setPhase("done");
			phaseRef.current = "done";
			return;
		}
		setPhase("clear");
		phaseRef.current = "clear";
	};
	const pop = (id) => {
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
			const next = cardsRef.current.map((item) => item.id === id ? {
				...item,
				gone: true
			} : item);
			syncCards(next);
			setBlurb(card.blurb);
			playSfx$1("pop", 1 + Math.min(.35, (comboRef.current - 1) * .08));
			if (next.every((item) => !item.match || item.gone)) finishLevel();
			return;
		}
		comboRef.current = 0;
		setCombo(0);
		heartsRef.current -= 1;
		setHearts(heartsRef.current);
		syncCards(cardsRef.current.map((item) => item.id === id ? {
			...item,
			bad: true
		} : item));
		setBlurb(card.blurb);
		playSfx$1("over");
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
	(0, import_react.useEffect)(() => {
		mounted.current = true;
		const progress = loadProgress();
		setTrack(progress.tracks.equals);
		const errors = auditEquals();
		if (errors.length) console.error("Equals audit", errors);
		const onVis = () => {
			if (document.visibilityState === "visible") resumeAudio();
		};
		const onKey = (e) => {
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
	(0, import_react.useEffect)(() => {
		if (active) setMuted(muteRef.current);
	}, [active]);
	const spec = EQUALS_LEVELS[level - 1] ?? EQUALS_LEVELS[0];
	const continueLevel = Math.min(EQUALS_LEVELS.length, track.cleared + 1);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative flex h-dvh flex-col overflow-hidden bg-ink text-cream",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "flex shrink-0 flex-col gap-2 border-b border-line px-3 py-2 sm:px-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-9 shrink-0 place-items-center rounded-lg border border-gold/50 bg-panel font-mono text-lg text-gold",
							children: "="
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "truncate text-base font-extrabold leading-none tracking-tight sm:text-lg",
								children: "Equals"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 font-mono text-xs text-mist",
								children: [phase === "menu" ? "Same value, any form" : `Level ${level} / ${EQUALS_LEVELS.length}`, combo >= 2 && phase === "play" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "ml-2 text-gold",
									children: ["×", combo]
								}) : null]
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: `text-right ${phase === "menu" ? "max-sm:hidden" : ""}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-mono text-xl leading-none font-semibold text-gold tabular-nums",
									children: score
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-1 font-mono text-xs text-mist tabular-nums",
									children: ["best ", Math.max(track.best, score)]
								})]
							}),
							onExit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArcadeExit, { onExit }) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									unlockAudio();
									const next = !mute;
									setMute(next);
									muteRef.current = next;
									setMuted(next);
								},
								className: "grid size-11 place-items-center rounded-full border border-line bg-panel",
								"aria-label": mute ? "Unmute" : "Mute",
								children: mute ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" })
							}),
							phase === "play" || phase === "pause" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									const next = phase === "pause" ? "play" : "pause";
									setPhase(next);
									phaseRef.current = next;
								},
								className: "grid size-11 place-items-center rounded-full border border-line bg-panel",
								"aria-label": phase === "pause" ? "Resume" : "Pause",
								children: phase === "pause" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" })
							}) : null
						]
					})]
				})
			}),
			phase === "menu" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-1 items-center justify-center overflow-y-auto p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-md rounded-2xl border border-line bg-panel/90 p-6 shadow-2xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs tracking-widest text-gold",
							children: "SAME VALUE"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-2 text-4xl font-extrabold tracking-tight",
							children: "Pop the equals."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm leading-relaxed text-mist",
							children: "A target sits at the top. Tap every card that really equals it. A wrong card costs a heart. Sixteen levels, and the best score sticks."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-4 font-mono text-xs text-mist",
							children: [
								"Cleared ",
								track.cleared,
								" / ",
								EQUALS_LEVELS.length,
								track.best > 0 ? ` · best ${track.best}` : ""
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
								unlockAudio();
								begin(continueLevel, 0);
							},
							className: "mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold text-base font-extrabold text-ink",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), track.cleared > 0 ? `Continue · ${continueLevel}` : "Play"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LevelGrid, {
								count: EQUALS_LEVELS.length,
								cleared: track.cleared,
								scores: track.scores,
								onPlay: (n) => {
									unlockAudio();
									begin(n, 0);
								}
							})
						})
					]
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-0 flex-1 flex-col",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto w-full max-w-lg px-3 pt-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-end justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-xs tracking-widest text-mist",
								children: "TARGET"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-4xl leading-none text-gold",
								children: spec.target
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-right",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "font-mono text-xs text-mist",
									children: ["this level ", levelScore]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1 flex justify-end gap-1",
									"aria-label": `${hearts} hearts left`,
									children: Array.from({ length: HEARTS$4 }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, {
										className: i < hearts ? "size-4 text-danger" : "size-4 text-line",
										fill: i < hearts ? "currentColor" : "none"
									}, i))
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-sm text-mist",
							children: [
								spec.title,
								". ",
								spec.blurb
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: `mx-auto min-h-0 w-full max-w-lg flex-1 overflow-y-auto px-3 py-3 ${shake ? "lattice-shake" : ""}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-2 gap-2 sm:grid-cols-3",
							children: cards.map((card) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								disabled: card.gone || phase !== "play",
								onClick: () => pop(card.id),
								className: `flex min-h-16 flex-col items-center justify-center rounded-xl border px-2 py-2 font-mono ${card.gone ? "border-line bg-ink opacity-30" : card.bad ? "border-danger bg-panel-2" : "border-line bg-panel-2"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-lg leading-tight text-cream",
									children: card.a
								}), card.b ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-gold-soft",
									children: card.b
								}) : null]
							}, card.id))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"aria-live": "polite",
						className: "mx-auto min-h-12 w-full max-w-lg px-4 pb-3 text-center text-sm leading-relaxed text-mist",
						children: blurb
					})
				]
			}),
			phase === "pause" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Overlay$5, {
				kicker: "Paused",
				title: "The cards can wait.",
				body: "Hearts and score stay put.",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => {
						setPhase("play");
						phaseRef.current = "play";
					},
					className: "flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold font-extrabold text-ink",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), "Resume"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						setTrack(noteScore("equals", scoreRef.current));
						setPhase("menu");
						phaseRef.current = "menu";
					},
					className: "mt-2 min-h-11 w-full rounded-xl border border-line font-bold",
					children: "Menu"
				})]
			}) : null,
			phase === "clear" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overlay$5, {
				kicker: `Level ${level} clear`,
				title: "Those were equal.",
				body: `Clear bonus ${bonus}. This level ${levelScore}. Run ${score}.`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => begin(level + 1, scoreRef.current),
					className: "flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold font-extrabold text-ink",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), "Next level"]
				})
			}) : null,
			phase === "done" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overlay$5, {
				kicker: "Book closed",
				title: "Every value accounted for.",
				body: `Score ${score}. Best ${Math.max(track.best, score)}. Replay any level from the menu.`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						setPhase("menu");
						phaseRef.current = "menu";
					},
					className: "min-h-12 w-full rounded-xl bg-gold font-extrabold text-ink",
					children: "Level select"
				})
			}) : null,
			phase === "over" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Overlay$5, {
				kicker: score >= track.best ? "Best run" : "Out of hearts",
				title: "That one was not equal.",
				body: `Score ${score} · level ${level}. ${blurb}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => begin(level, 0),
					className: "flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold font-extrabold text-ink",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" }), "Retry level"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						setPhase("menu");
						phaseRef.current = "menu";
					},
					className: "mt-2 min-h-11 w-full rounded-xl border border-line font-bold",
					children: "Menu"
				})]
			}) : null
		]
	});
}
function Overlay$5({ kicker, title, body, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-30 flex items-center justify-center bg-ink/55 p-4 backdrop-blur-sm",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm rounded-2xl border border-line bg-panel p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs tracking-widest text-gold",
					children: kicker
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-2 text-3xl font-extrabold tracking-tight",
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-mist",
					children: body
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5",
					children
				})
			]
		})
	});
}
function frac(n, d) {
	return {
		n,
		d
	};
}
function gcd$2(a, b) {
	let x = Math.abs(a);
	let y = Math.abs(b);
	while (y) {
		const next = x % y;
		x = y;
		y = next;
	}
	return x || 1;
}
function simplifyFrac(piece) {
	const g = gcd$2(piece.n, piece.d);
	return {
		n: piece.n / g,
		d: piece.d / g
	};
}
function sameFrac(a, b) {
	return a.n * b.d === b.n * a.d;
}
function canSimplifyFrac(piece) {
	return gcd$2(piece.n, piece.d) > 1;
}
function lcm(a, b) {
	return Math.abs(a * b) / gcd$2(a, b);
}
function sumFracs(pieces) {
	if (pieces.length === 0) return {
		n: 0,
		d: 1
	};
	const d = pieces.reduce((acc, piece) => lcm(acc, piece.d), 1);
	return simplifyFrac({
		n: pieces.reduce((acc, piece) => acc + piece.n * (d / piece.d), 0),
		d
	});
}
function formatFrac$1(piece) {
	return `${piece.n}/${piece.d}`;
}
function formatGoal(goal) {
	if (goal.kind === "sum") return `Build ${formatFrac$1(goal.target)}`;
	return `Make ${goal.pieces.map(formatFrac$1).join(" + ")}`;
}
function clone(piece) {
	return {
		n: piece.n,
		d: piece.d
	};
}
function beginForge(level) {
	return {
		tray: level.tray.map(clone),
		board: level.placed.map(clone)
	};
}
function halves(piece) {
	return [{
		n: piece.n,
		d: piece.d * 2
	}, {
		n: piece.n,
		d: piece.d * 2
	}];
}
function replaceAt(list, index, next) {
	if (index < 0 || index >= list.length) return null;
	return [
		...list.slice(0, index),
		...next,
		...list.slice(index + 1)
	];
}
function applyForge(state, action) {
	if (action.t === "place") {
		const piece = state.tray[action.index];
		if (!piece) return null;
		return {
			tray: state.tray.filter((_, index) => index !== action.index),
			board: [...state.board, clone(piece)]
		};
	}
	if (action.t === "join") {
		const picked = action.indices.filter((index) => index >= 0 && index < state.board.length);
		if (new Set(picked).size < 2) return null;
		const chosen = picked.map((index) => state.board[index]);
		const rest = state.board.filter((_, index) => !picked.includes(index));
		return {
			tray: state.tray,
			board: [...rest, sumFracs(chosen)]
		};
	}
	const pile = action.where === "board" ? state.board : state.tray;
	if (action.t === "halve") {
		const piece = pile[action.index];
		if (!piece) return null;
		const next = replaceAt(pile, action.index, halves(piece));
		if (!next) return null;
		return action.where === "board" ? {
			tray: state.tray,
			board: next
		} : {
			tray: next,
			board: state.board
		};
	}
	if (action.t === "simplify") {
		const piece = pile[action.index];
		if (!piece || !canSimplifyFrac(piece)) return null;
		const next = replaceAt(pile, action.index, [simplifyFrac(piece)]);
		if (!next) return null;
		return action.where === "board" ? {
			tray: state.tray,
			board: next
		} : {
			tray: next,
			board: state.board
		};
	}
	return null;
}
function forgeComplete(level, state) {
	if (level.goal.kind === "sum") {
		if (state.board.length === 0) return false;
		return sameFrac(sumFracs(state.board), level.goal.target);
	}
	const have = state.board.map(formatFrac$1).sort();
	const need = level.goal.pieces.map(formatFrac$1).sort();
	return have.length === need.length && have.every((key, index) => key === need[index]);
}
function forge(id, title, blurb, tray, goal, script, placed = []) {
	return {
		id,
		title,
		blurb,
		tray,
		placed,
		goal,
		script
	};
}
var FORGE_LEVELS = [
	forge(1, "Two halves", "Place both halves. They fill one whole.", [frac(1, 2), frac(1, 2)], {
		kind: "sum",
		target: frac(1, 1)
	}, [{
		t: "place",
		index: 0
	}, {
		t: "place",
		index: 0
	}]),
	forge(2, "Half and quarters", "1/2 + 1/4 + 1/4 fills the whole. Leave the extra eighth.", [
		frac(1, 2),
		frac(1, 4),
		frac(1, 4),
		frac(1, 8)
	], {
		kind: "sum",
		target: frac(1, 1)
	}, [
		{
			t: "place",
			index: 0
		},
		{
			t: "place",
			index: 0
		},
		{
			t: "place",
			index: 0
		}
	]),
	forge(3, "Join the quarters", "Two quarters on the bench can snap into one half.", [frac(1, 4), frac(1, 4)], {
		kind: "pieces",
		pieces: [frac(1, 2)]
	}, [
		{
			t: "place",
			index: 0
		},
		{
			t: "place",
			index: 0
		},
		{
			t: "join",
			indices: [0, 1]
		}
	]),
	forge(4, "2/4 is 1/2", "Same amount, coarser cut. Simplify the piece.", [], {
		kind: "pieces",
		pieces: [frac(1, 2)]
	}, [{
		t: "simplify",
		where: "board",
		index: 0
	}], [frac(2, 4)]),
	forge(5, "3/6 is 1/2", "Three sixths are one half. Reduce the name.", [], {
		kind: "pieces",
		pieces: [frac(1, 2)]
	}, [{
		t: "simplify",
		where: "board",
		index: 0
	}], [frac(3, 6)]),
	forge(6, "Three quarters", "A half plus a quarter. Leave the spare quarter.", [
		frac(1, 2),
		frac(1, 4),
		frac(1, 4)
	], {
		kind: "sum",
		target: frac(3, 4)
	}, [{
		t: "place",
		index: 0
	}, {
		t: "place",
		index: 0
	}]),
	forge(7, "Three thirds", "Each third is a piece. Together they are 1.", [
		frac(1, 3),
		frac(1, 3),
		frac(1, 3)
	], {
		kind: "sum",
		target: frac(1, 1)
	}, [
		{
			t: "place",
			index: 0
		},
		{
			t: "place",
			index: 0
		},
		{
			t: "place",
			index: 0
		}
	]),
	forge(8, "Four eighths", "Join them. Four eighths lock as one half.", [
		frac(1, 8),
		frac(1, 8),
		frac(1, 8),
		frac(1, 8)
	], {
		kind: "pieces",
		pieces: [frac(1, 2)]
	}, [
		{
			t: "place",
			index: 0
		},
		{
			t: "place",
			index: 0
		},
		{
			t: "place",
			index: 0
		},
		{
			t: "place",
			index: 0
		},
		{
			t: "join",
			indices: [
				0,
				1,
				2,
				3
			]
		}
	]),
	forge(9, "2/6 is 1/3", "Simplify. The bar does not change length.", [], {
		kind: "pieces",
		pieces: [frac(1, 3)]
	}, [{
		t: "simplify",
		where: "board",
		index: 0
	}], [frac(2, 6)]),
	forge(10, "4/6 is 2/3", "Reduce once. 4/6 and 2/3 cover the same gold.", [], {
		kind: "pieces",
		pieces: [frac(2, 3)]
	}, [{
		t: "simplify",
		where: "board",
		index: 0
	}], [frac(4, 6)]),
	forge(11, "Half, third, sixth", "1/2 + 1/3 + 1/6 = 1. Different cuts, one whole.", [
		frac(1, 2),
		frac(1, 3),
		frac(1, 6)
	], {
		kind: "sum",
		target: frac(1, 1)
	}, [
		{
			t: "place",
			index: 0
		},
		{
			t: "place",
			index: 0
		},
		{
			t: "place",
			index: 0
		}
	]),
	forge(12, "Split the whole", "Halve the bar into two 1/2 pieces.", [frac(1, 1)], {
		kind: "pieces",
		pieces: [frac(1, 2), frac(1, 2)]
	}, [{
		t: "place",
		index: 0
	}, {
		t: "halve",
		where: "board",
		index: 0
	}]),
	forge(13, "Into quarters", "Halve, then halve each half.", [frac(1, 1)], {
		kind: "pieces",
		pieces: [
			frac(1, 4),
			frac(1, 4),
			frac(1, 4),
			frac(1, 4)
		]
	}, [
		{
			t: "place",
			index: 0
		},
		{
			t: "halve",
			where: "board",
			index: 0
		},
		{
			t: "halve",
			where: "board",
			index: 1
		},
		{
			t: "halve",
			where: "board",
			index: 0
		}
	]),
	forge(14, "Three sixths", "Place three 1/6 pieces. Their sum is 1/2.", [
		frac(1, 6),
		frac(1, 6),
		frac(1, 6),
		frac(1, 3)
	], {
		kind: "sum",
		target: frac(1, 2)
	}, [
		{
			t: "place",
			index: 0
		},
		{
			t: "place",
			index: 0
		},
		{
			t: "place",
			index: 0
		}
	]),
	forge(15, "6/8 is 3/4", "Simplify the eighths into quarters.", [], {
		kind: "pieces",
		pieces: [frac(3, 4)]
	}, [{
		t: "simplify",
		where: "board",
		index: 0
	}], [frac(6, 8)]),
	forge(16, "Last whole", "3/4 + 1/4 locks the bar.", [frac(3, 4), frac(1, 4)], {
		kind: "sum",
		target: frac(1, 1)
	}, [{
		t: "place",
		index: 0
	}, {
		t: "place",
		index: 0
	}])
];
function Piece({ piece, selected, locked, onClick }) {
	const width = Math.max(18, Math.round(piece.n / piece.d * 100));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		disabled: locked,
		onClick,
		style: { width: `${width}%` },
		className: `flex h-12 min-w-11 items-center justify-center rounded-lg border font-mono text-xs ${selected ? "border-gold bg-gold text-ink" : "border-gold/50 bg-gold/20 text-cream"} disabled:opacity-90`,
		children: formatFrac$1(piece)
	});
}
function FractionForge({ onExit, onQuestions }) {
	const [levelId, setLevelId] = (0, import_react.useState)(1);
	const level = FORGE_LEVELS[levelId - 1] ?? FORGE_LEVELS[0];
	const [state, setState] = (0, import_react.useState)(() => beginForge(level));
	const [picked, setPicked] = (0, import_react.useState)([]);
	const [run, setRun] = (0, import_react.useState)(0);
	const scored = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		scored.current = false;
		setState(beginForge(level));
		setPicked([]);
	}, [level]);
	const done = forgeComplete(level, state);
	(0, import_react.useEffect)(() => {
		if (!done || scored.current) return;
		scored.current = true;
		const score = 130;
		setRun((total) => {
			const next = total + score;
			noteClear("fractions", level.id, score, next);
			return next;
		});
	}, [done, level.id]);
	function commit(next) {
		if (!next || done) return;
		setState(next);
		setPicked([]);
	}
	const one = picked.length === 1 ? picked[0] : -1;
	const canHalve = one >= 0 && state.board[one];
	const canReduce = canHalve && canSimplifyFrac(state.board[one]);
	const canJoin = picked.length >= 2;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BenchFrame, {
		kicker: "FRACTION FORGE",
		title: level.title,
		meta: `${level.id}/16`,
		onExit,
		onQuestions,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LevelStrip, {
				count: FORGE_LEVELS.length,
				current: level.id,
				onPick: setLevelId
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-mist",
				children: level.blurb
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 font-mono text-sm text-gold",
				children: formatGoal(level.goal)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs tracking-widest text-mist",
					children: "TRAY"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex flex-wrap gap-2",
					children: [state.tray.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-mist",
						children: "Empty."
					}) : null, state.tray.map((piece, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Piece, {
						piece,
						selected: false,
						locked: done,
						onClick: () => commit(applyForge(state, {
							t: "place",
							index
						}))
					}, `tray-${index}-${formatFrac$1(piece)}`))]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-baseline justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs tracking-widest text-mist",
						children: "BENCH"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-xs text-cream",
						children: ["sum ", formatFrac$1(sumFracs(state.board))]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `mt-2 flex min-h-16 flex-wrap items-center gap-1 rounded-2xl border p-2 ${done ? "border-gold" : "border-line"}`,
					children: [state.board.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-2 text-sm text-mist",
						children: "Place a piece."
					}) : null, state.board.map((piece, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Piece, {
						piece,
						selected: picked.includes(index),
						locked: done,
						onClick: () => setPicked((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index])
					}, `board-${index}-${formatFrac$1(piece)}`))]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: !canHalve || done,
						onClick: () => commit(applyForge(state, {
							t: "halve",
							where: "board",
							index: one
						})),
						className: "min-h-11 rounded-full border border-line px-4 text-sm text-cream disabled:opacity-40",
						children: "Split"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: !canReduce || done,
						onClick: () => commit(applyForge(state, {
							t: "simplify",
							where: "board",
							index: one
						})),
						className: "min-h-11 rounded-full border border-line px-4 text-sm text-cream disabled:opacity-40",
						children: "Simplify"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: !canJoin || done,
						onClick: () => commit(applyForge(state, {
							t: "join",
							indices: picked
						})),
						className: "min-h-11 rounded-full border border-line px-4 text-sm text-cream disabled:opacity-40",
						children: "Join"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => {
							scored.current = done;
							setState(beginForge(level));
							setPicked([]);
						},
						className: "min-h-11 rounded-full border border-line px-4 text-sm text-cream",
						children: "Reset"
					}),
					done && level.id < FORGE_LEVELS.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setLevelId(level.id + 1),
						className: "min-h-11 rounded-full bg-gold px-4 text-sm font-extrabold text-ink",
						children: "Next"
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-cream",
				"aria-live": "polite",
				children: done ? "Locked. The pieces meet the goal and stay where they settled." : "Tap the tray to place. Tap the bench to pick pieces, then split, simplify, or join."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 font-mono text-xs text-mist",
				children: ["Run ", run]
			})
		]
	});
}
var LEVELS = [
	{
		title: "Halves",
		prompts: [
			{
				t: "shade",
				parts: 2,
				filled: 1
			},
			{
				t: "shade",
				parts: 4,
				filled: 2
			},
			{
				t: "compare",
				left: [1, 2],
				right: [2, 4]
			}
		]
	},
	{
		title: "Quarters",
		prompts: [
			{
				t: "shade",
				parts: 4,
				filled: 1
			},
			{
				t: "shade",
				parts: 4,
				filled: 3
			},
			{
				t: "compare",
				left: [1, 4],
				right: [3, 4]
			}
		]
	},
	{
		title: "Thirds",
		prompts: [
			{
				t: "shade",
				parts: 3,
				filled: 1
			},
			{
				t: "shade",
				parts: 3,
				filled: 2
			},
			{
				t: "compare",
				left: [2, 3],
				right: [1, 3]
			}
		]
	},
	{
		title: "Same bar",
		prompts: [
			{
				t: "shade",
				parts: 6,
				filled: 3
			},
			{
				t: "shade",
				parts: 6,
				filled: 2
			},
			{
				t: "compare",
				left: [3, 6],
				right: [1, 2]
			}
		]
	},
	{
		title: "Fifths",
		prompts: [
			{
				t: "shade",
				parts: 5,
				filled: 1
			},
			{
				t: "shade",
				parts: 5,
				filled: 2
			},
			{
				t: "compare",
				left: [2, 5],
				right: [1, 2]
			}
		]
	},
	{
		title: "Eighths",
		prompts: [
			{
				t: "shade",
				parts: 8,
				filled: 2
			},
			{
				t: "shade",
				parts: 8,
				filled: 6
			},
			{
				t: "compare",
				left: [2, 8],
				right: [1, 4]
			}
		]
	},
	{
		title: "Sixths",
		prompts: [
			{
				t: "shade",
				parts: 6,
				filled: 1
			},
			{
				t: "shade",
				parts: 6,
				filled: 5
			},
			{
				t: "compare",
				left: [5, 6],
				right: [2, 3]
			}
		]
	},
	{
		title: "Equal cuts",
		prompts: [
			{
				t: "shade",
				parts: 8,
				filled: 4
			},
			{
				t: "shade",
				parts: 10,
				filled: 5
			},
			{
				t: "compare",
				left: [4, 8],
				right: [5, 10]
			}
		]
	},
	{
		title: "Sevenths",
		prompts: [
			{
				t: "shade",
				parts: 7,
				filled: 3
			},
			{
				t: "shade",
				parts: 7,
				filled: 4
			},
			{
				t: "compare",
				left: [3, 7],
				right: [4, 7]
			}
		]
	},
	{
		title: "Ninths",
		prompts: [
			{
				t: "shade",
				parts: 9,
				filled: 3
			},
			{
				t: "shade",
				parts: 9,
				filled: 6
			},
			{
				t: "compare",
				left: [3, 9],
				right: [1, 3]
			}
		]
	},
	{
		title: "Past half",
		prompts: [
			{
				t: "shade",
				parts: 8,
				filled: 3
			},
			{
				t: "shade",
				parts: 8,
				filled: 5
			},
			{
				t: "compare",
				left: [3, 8],
				right: [1, 2]
			}
		]
	},
	{
		title: "Tenths",
		prompts: [
			{
				t: "shade",
				parts: 10,
				filled: 4
			},
			{
				t: "shade",
				parts: 10,
				filled: 6
			},
			{
				t: "compare",
				left: [4, 10],
				right: [6, 10]
			}
		]
	},
	{
		title: "Twelfths",
		prompts: [
			{
				t: "shade",
				parts: 12,
				filled: 3
			},
			{
				t: "shade",
				parts: 12,
				filled: 8
			},
			{
				t: "compare",
				left: [8, 12],
				right: [2, 3]
			}
		]
	},
	{
		title: "Close call",
		prompts: [
			{
				t: "shade",
				parts: 4,
				filled: 3
			},
			{
				t: "shade",
				parts: 10,
				filled: 7
			},
			{
				t: "compare",
				left: [3, 4],
				right: [7, 10]
			}
		]
	},
	{
		title: "Different cuts",
		prompts: [
			{
				t: "shade",
				parts: 10,
				filled: 4
			},
			{
				t: "shade",
				parts: 9,
				filled: 6
			},
			{
				t: "compare",
				left: [4, 10],
				right: [6, 9]
			}
		]
	},
	{
		title: "Same gold",
		prompts: [
			{
				t: "shade",
				parts: 12,
				filled: 8
			},
			{
				t: "shade",
				parts: 9,
				filled: 6
			},
			{
				t: "compare",
				left: [8, 12],
				right: [6, 9]
			}
		]
	}
];
function gcd$1(a, b) {
	let x = Math.abs(a);
	let y = Math.abs(b);
	while (y) {
		const next = x % y;
		x = y;
		y = next;
	}
	return x || 1;
}
function formatFrac(num, den) {
	if (num === 0) return "0";
	const g = gcd$1(num, den);
	const n = num / g;
	const d = den / g;
	if (d === 1) return String(n);
	return `${n}/${d}`;
}
function raw(num, den) {
	return `${num}/${den}`;
}
function shadeChoices(filled, parts) {
	const answer = formatFrac(filled, parts);
	const pool = [
		answer,
		raw(filled, parts),
		raw(Math.max(filled - 1, 0), parts),
		raw(Math.min(filled + 1, parts), parts),
		parts > filled && filled > 0 ? raw(parts, filled) : "1",
		raw(filled, parts + 1),
		"1/2",
		"1",
		"0",
		"3/5",
		"2/7"
	];
	const answerValue = filled / parts;
	const choices = [];
	for (const item of pool) {
		if (choices.includes(item)) continue;
		if (item !== answer && sameValue(item, answerValue)) continue;
		choices.push(item);
		if (choices.length === 4) break;
	}
	if (choices.length < 4 || choices[0] !== answer) throw new Error(`shade choices ${filled}/${parts}`);
	return [
		choices[0],
		choices[1],
		choices[2],
		choices[3]
	];
}
function sameValue(label, value) {
	const parsed = parseFrac(label);
	return parsed != null && Math.abs(parsed - value) < 1e-9;
}
function parseFrac(label) {
	if (label === "0") return 0;
	if (label === "1") return 1;
	const match = label.match(/^(\d+)\s*\/\s*(\d+)$/);
	if (!match) return null;
	const den = Number(match[2]);
	if (den === 0) return null;
	return Number(match[1]) / den;
}
function compareCall$1(left, right) {
	const delta = left[0] * right[1] - right[0] * left[1];
	if (delta === 0) return "Same";
	return delta > 0 ? "Left" : "Right";
}
function build(spec) {
	if (spec.t === "shade") {
		const answer = formatFrac(spec.filled, spec.parts);
		return {
			kicker: "LOWEST TERMS",
			ask: "What fraction of the bar is gold?",
			scene: {
				kind: "shade",
				parts: spec.parts,
				filled: spec.filled
			},
			choices: shadeChoices(spec.filled, spec.parts),
			answer,
			blurb: `${spec.filled} of ${spec.parts} gold. Lowest terms: ${answer}.`
		};
	}
	const answer = compareCall$1(spec.left, spec.right);
	const left = formatFrac(spec.left[0], spec.left[1]);
	const right = formatFrac(spec.right[0], spec.right[1]);
	const blurb = answer === "Same" ? `Both are ${left}. Same amount of gold, different cuts.` : `Left is ${left}. Right is ${right}. ${answer} has more gold.`;
	return {
		kicker: "MORE GOLD",
		ask: "Which bar has more gold?",
		scene: {
			kind: "compare",
			left: spec.left,
			right: spec.right
		},
		choices: [
			"Left",
			"Right",
			"Same",
			"Neither"
		],
		answer,
		blurb
	};
}
var FRACTION_LEVELS = LEVELS.map((level, index) => ({
	id: index + 1,
	title: level.title,
	prompts: level.prompts.map(build)
}));
function auditFraction() {
	const errors = [];
	if (FRACTION_LEVELS.length !== 16) errors.push("fraction count");
	FRACTION_LEVELS.forEach((level, index) => {
		if (level.id !== index + 1 || level.prompts.length !== 3) errors.push(`fraction level ${level.id}`);
		for (const prompt of level.prompts) {
			if (new Set(prompt.choices).size !== 4 || !prompt.choices.includes(prompt.answer)) errors.push(`level ${level.id} choices`);
			if (prompt.scene.kind === "shade") {
				const { filled, parts } = prompt.scene;
				if (filled < 0 || filled > parts || parts < 2 || parts > 12) errors.push(`level ${level.id} bar`);
				if (prompt.answer !== formatFrac(filled, parts)) errors.push(`level ${level.id} shade`);
				for (const choice of prompt.choices) {
					const value = parseFrac(choice);
					if (choice !== prompt.answer && value != null && Math.abs(value - filled / parts) < 1e-9) errors.push(`level ${level.id} equivalent decoy ${choice}`);
				}
			} else {
				const call = compareCall$1(prompt.scene.left, prompt.scene.right);
				if (prompt.answer !== call) errors.push(`level ${level.id} compare ${call}`);
			}
		}
	});
	return errors;
}
function Sheen({ token }) {
	const travel = arriveDraw(useArrive(token));
	if (travel >= .98) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "pointer-events-none absolute inset-y-0 w-6 bg-gold-soft/50",
		style: { left: `${travel * 100}%` },
		"aria-hidden": "true"
	});
}
function Bar({ parts, filled, label, token }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mb-1 text-center font-mono text-xs text-mist",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex h-8 overflow-hidden rounded-lg border border-line",
		children: [Array.from({ length: parts }, (_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `min-w-0 flex-1 ${index < filled ? "bg-gold" : "bg-ink"} ${index > 0 ? "border-l border-line" : ""}` }, index)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheen, { token })]
	})] });
}
function FractionFigure({ prompt }) {
	if (prompt.scene.kind === "shade") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
		parts: prompt.scene.parts,
		filled: prompt.scene.filled,
		label: `${prompt.scene.filled} gold of ${prompt.scene.parts}`,
		token: `shade-${prompt.scene.parts}-${prompt.scene.filled}`
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
			parts: prompt.scene.left[1],
			filled: prompt.scene.left[0],
			label: "Left",
			token: `L-${prompt.scene.left.join("/")}`
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
			parts: prompt.scene.right[1],
			filled: prompt.scene.right[0],
			label: "Right",
			token: `R-${prompt.scene.right.join("/")}`
		})]
	});
}
function FractionProof({ active = true, onExit }) {
	const [mode, setMode] = (0, import_react.useState)("forge");
	if (mode === "questions") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative h-dvh",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoundProof, {
			active,
			onExit,
			track: "fractions",
			mark: "½",
			title: "Fractions",
			menuKicker: "NUMBER",
			menuTitle: "How much is gold?",
			menuBody: "Read the bar, or say which bar holds more gold. Same amount can wear different cuts. Keys 1 to 4. Sixteen levels.",
			levels: FRACTION_LEVELS,
			audit: auditFraction,
			renderScene: (prompt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FractionFigure, { prompt })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuestionsChip, {
			label: "Bench",
			onClick: () => setMode("forge")
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FractionForge, {
		onExit,
		onQuestions: () => setMode("questions")
	});
}
var MIDS = [
	[[0, 0], [4, 2]],
	[[0, 0], [2, 4]],
	[[-2, -2], [2, 2]],
	[[-4, 0], [2, 2]],
	[[0, 2], [4, -2]],
	[[-2, 4], [2, 0]],
	[[-4, -2], [0, 4]],
	[[-3, -1], [1, 3]],
	[[0, -4], [4, 0]],
	[[-2, -4], [4, 2]],
	[[-4, 4], [4, -2]],
	[[-2, 1], [4, 3]],
	[[-4, -4], [2, 0]],
	[[0, 0], [0, 4]],
	[[-6, 0], [2, 4]],
	[[-2, -6], [4, 2]],
	[[1, -3], [5, 1]],
	[[-5, -1], [3, 5]],
	[[-6, 2], [0, 6]],
	[[-4, -6], [2, 4]],
	[[0, 6], [6, 0]],
	[[-6, -2], [4, 6]],
	[[2, -4], [6, 2]],
	[[-3, 5], [3, -1]]
];
var FARS = [
	[[0, 0], [3, 4]],
	[[-2, -1], [1, 3]],
	[[-3, 0], [0, 4]],
	[[1, -2], [4, 2]],
	[[-4, -4], [-1, 0]],
	[[0, 1], [3, 5]],
	[[-1, -3], [2, 1]],
	[[2, 2], [5, 6]],
	[[-6, -4], [0, 4]],
	[[-4, -3], [2, 5]],
	[[-2, -6], [4, 2]],
	[[-6, -6], [0, 2]],
	[[-4, -3], [4, 3]],
	[[-2, -4], [6, 2]],
	[[-6, -1], [2, 5]],
	[[-6, -5], [2, 1]],
	[[-6, -6], [-1, 6]],
	[[-4, -6], [1, 6]],
	[[0, -6], [5, 6]],
	[[-6, -6], [6, -1]],
	[[-6, -6], [3, 6]],
	[[-5, -6], [4, 6]],
	[[-6, -6], [6, 3]],
	[[-6, -3], [6, 6]]
];
var TITLES$5 = [
	"Halfway",
	"Center",
	"Between",
	"Meet",
	"Middle",
	"Split",
	"Still between",
	"Last middle",
	"How far",
	"The span",
	"Longer",
	"Diagonal",
	"Across",
	"Farther",
	"The reach",
	"Last distance"
];
function midpoint(a, b) {
	if ((a[0] + b[0]) % 2 !== 0 || (a[1] + b[1]) % 2 !== 0) return null;
	return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}
function straightDistance(a, b) {
	const dx = a[0] - b[0];
	const dy = a[1] - b[1];
	const square = dx * dx + dy * dy;
	const root = Math.round(Math.sqrt(square));
	return root * root === square ? root : null;
}
function pointLabel$1(p) {
	return `(${p[0]}, ${p[1]})`;
}
function gridAsk(scene) {
	if (scene.kind === "mid") return "What point sits halfway between them?";
	return "How far apart are the two points, in a straight line?";
}
function gridKicker(scene) {
	return scene.kind === "mid" ? "Halfway" : "Distance";
}
function gridBlurb(scene) {
	if (scene.kind === "mid") {
		const mid = midpoint(scene.a, scene.b);
		return `Average the runs, then the rises: ${mid ? pointLabel$1(mid) : "?"}.`;
	}
	const dx = scene.b[0] - scene.a[0];
	const dy = scene.b[1] - scene.a[1];
	const dist = straightDistance(scene.a, scene.b);
	return `Run ${dx}, rise ${dy}. ${dx}² + ${dy}² = ${dist}². Distance ${dist}.`;
}
function gridCaption(scene) {
	return `${pointLabel$1(scene.a)} to ${pointLabel$1(scene.b)}`;
}
function takeFour$3(answer, extra) {
	const choices = [];
	for (const item of [answer, ...extra]) {
		if (!choices.includes(item)) choices.push(item);
		if (choices.length === 4) return [
			choices[0],
			choices[1],
			choices[2],
			choices[3]
		];
	}
	throw new Error(`grid choices for ${answer}`);
}
function inRange(p) {
	return p.every((n) => Number.isInteger(n) && n >= -6 && n <= 6);
}
function midChoices(a, b, mid) {
	const decoys = [
		[mid[1], mid[0]],
		[a[0], b[1]],
		[b[0], a[1]],
		[mid[0] + 1, mid[1]],
		[mid[0], mid[1] + 1],
		[mid[0] - 1, mid[1]],
		[mid[0], mid[1] - 1],
		a,
		b,
		[a[0] + b[0], a[1] + b[1]]
	];
	return takeFour$3(pointLabel$1(mid), decoys.filter((p) => p[0] !== mid[0] || p[1] !== mid[1]).map(pointLabel$1));
}
function farChoices(a, b, dist) {
	const dx = Math.abs(a[0] - b[0]);
	const dy = Math.abs(a[1] - b[1]);
	const pool = [
		dx + dy,
		dx,
		dy,
		dist + 1,
		dist - 1,
		Math.max(dx, dy),
		dist + dx,
		dist + 2
	];
	return takeFour$3(String(dist), pool.filter((n) => Number.isInteger(n) && n > 0 && n !== dist).map(String));
}
function promptAt$1(id, slot) {
	const kind = id <= 8 ? "mid" : "far";
	const pair = (kind === "mid" ? MIDS : FARS)[(id - (kind === "mid" ? 1 : 9)) * 3 + slot];
	const scene = {
		kind,
		a: pair[0],
		b: pair[1]
	};
	if (kind === "mid") {
		const mid = midpoint(scene.a, scene.b);
		if (!mid) throw new Error(`mid ${id}`);
		return {
			kicker: gridKicker(scene),
			ask: gridAsk(scene),
			scene,
			choices: midChoices(scene.a, scene.b, mid),
			answer: pointLabel$1(mid),
			blurb: gridBlurb(scene)
		};
	}
	const dist = straightDistance(scene.a, scene.b);
	if (dist === null) throw new Error(`far ${id}`);
	return {
		kicker: gridKicker(scene),
		ask: gridAsk(scene),
		scene,
		choices: farChoices(scene.a, scene.b, dist),
		answer: String(dist),
		blurb: gridBlurb(scene)
	};
}
var GRID_LEVELS = TITLES$5.map((title, index) => ({
	id: index + 1,
	title,
	prompts: [
		0,
		1,
		2
	].map((slot) => promptAt$1(index + 1, slot))
}));
function parsePoint$1(label) {
	const match = label.match(/^\((-?\d+), (-?\d+)\)$/);
	if (!match) return null;
	return [Number(match[1]), Number(match[2])];
}
function auditGrid() {
	const errors = [];
	if (GRID_LEVELS.length !== 16) errors.push(`levels ${GRID_LEVELS.length}`);
	if (MIDS.length !== 24 || FARS.length !== 24) errors.push("pair count");
	GRID_LEVELS.forEach((level, index) => {
		if (level.id !== index + 1) errors.push(`id ${level.id}`);
		if (level.prompts.length !== 3) errors.push(`prompts ${level.id}`);
		for (const prompt of level.prompts) {
			const { a, b, kind } = prompt.scene;
			if (!inRange(a) || !inRange(b)) errors.push(`range ${level.id}`);
			if (a[0] === b[0] && a[1] === b[1]) errors.push(`same ${level.id}`);
			if (prompt.ask !== gridAsk(prompt.scene) || prompt.blurb !== gridBlurb(prompt.scene)) errors.push(`copy ${level.id}`);
			if (new Set(prompt.choices).size !== 4 || !prompt.choices.includes(prompt.answer)) errors.push(`choices ${level.id}`);
			if (kind === "mid") {
				const mid = midpoint(a, b);
				if (!mid || prompt.answer !== pointLabel$1(mid)) errors.push(`mid ${level.id} ${prompt.answer}`);
				for (const choice of prompt.choices) {
					const parsed = parsePoint$1(choice);
					if (!parsed) errors.push(`label ${level.id} ${choice}`);
					else if (choice !== prompt.answer && parsed[0] === mid?.[0] && parsed[1] === mid?.[1]) errors.push(`decoy mid ${level.id}`);
				}
			} else {
				const dist = straightDistance(a, b);
				if (dist === null || prompt.answer !== String(dist)) errors.push(`far ${level.id}`);
				for (const choice of prompt.choices) {
					if (!/^\d+$/.test(choice)) errors.push(`dist label ${level.id}`);
					if (choice !== prompt.answer && Number(choice) === dist) errors.push(`decoy far ${level.id}`);
				}
			}
		}
	});
	return errors;
}
function mapX$2(n) {
	return 90 + n * 12;
}
function mapY$2(n) {
	return 90 - n * 12;
}
function GridFigure({ a, b }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 180 180",
		className: "mx-auto h-40 w-full max-w-xs",
		role: "img",
		"aria-label": `Points ${a[0]}, ${a[1]} and ${b[0]}, ${b[1]}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: "14",
				y1: "90",
				x2: "166",
				y2: "90",
				className: "text-line",
				stroke: "currentColor"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: "90",
				y1: "14",
				x2: "90",
				y2: "166",
				className: "text-line",
				stroke: "currentColor"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: mapX$2(a[0]),
				y1: mapY$2(a[1]),
				x2: mapX$2(b[0]),
				y2: mapY$2(b[1]),
				className: "text-gold",
				stroke: "currentColor",
				strokeWidth: "2"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: mapX$2(a[0]),
				cy: mapY$2(a[1]),
				r: "5",
				className: "text-gold",
				fill: "currentColor"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: mapX$2(b[0]),
				cy: mapY$2(b[1]),
				r: "5",
				className: "text-mint",
				fill: "currentColor"
			})
		]
	});
}
function GridProof({ active = true, onExit }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoundProof, {
		active,
		onExit,
		track: "grid",
		mark: "+",
		title: "Grid",
		menuKicker: "GEOMETRY",
		menuTitle: "Two lattice points.",
		menuBody: "Name the halfway point, or the straight-line distance. Keys 1 to 4. A miss costs a heart. Sixteen levels.",
		levels: GRID_LEVELS,
		audit: auditGrid,
		renderScene: (prompt) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GridFigure, {
				a: prompt.scene.a,
				b: prompt.scene.b
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-center font-mono text-xs text-mist",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-gold",
						children: [
							prompt.scene.a[0],
							", ",
							prompt.scene.a[1]
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: " to " }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-mint",
						children: [
							prompt.scene.b[0],
							", ",
							prompt.scene.b[1]
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "sr-only",
				children: gridCaption(prompt.scene)
			})
		] })
	});
}
var LOGIC_LEVELS = [
	{
		id: 1,
		title: "The rule fires",
		move: "If it is true, the result is true",
		premises: ["If it rains, the path is wet.", "It is raining."],
		claims: [
			{
				text: "The path is wet.",
				follows: true,
				blurb: "The rule said rain makes the path wet, and it is raining."
			},
			{
				text: "The path is dry.",
				follows: false,
				blurb: "Dry would contradict the rule once rain is given."
			},
			{
				text: "It is not raining.",
				follows: false,
				blurb: "The second line says it is raining."
			},
			{
				text: "Rain is enough to make this path wet.",
				follows: true,
				blurb: "That is what the first line already says."
			}
		]
	},
	{
		id: 2,
		title: "Dark lamp",
		move: "If the result failed, the cause failed",
		premises: ["If the switch is on, the lamp is lit.", "The lamp is dark."],
		claims: [
			{
				text: "The switch is off.",
				follows: true,
				blurb: "A lit lamp is required when the switch is on. The lamp is dark, so the switch is not on."
			},
			{
				text: "The switch is on.",
				follows: false,
				blurb: "An on switch would force a lit lamp."
			},
			{
				text: "The lamp is lit.",
				follows: false,
				blurb: "The second line says the lamp is dark."
			},
			{
				text: "The switch cannot be on.",
				follows: true,
				blurb: "Same denial, said the other way. On is impossible here."
			}
		]
	},
	{
		id: 3,
		title: "One of the two",
		move: "Knock out one option",
		premises: ["The card is a heart or a spade.", "The card is not a heart."],
		claims: [
			{
				text: "The card is a spade.",
				follows: true,
				blurb: "Heart is gone, so the remaining option stands."
			},
			{
				text: "The card is a diamond.",
				follows: false,
				blurb: "Diamond was never one of the two options."
			},
			{
				text: "The card could still be a heart.",
				follows: false,
				blurb: "The second line already ruled hearts out."
			},
			{
				text: "The card is not a heart.",
				follows: true,
				blurb: "That line was given. It still follows."
			}
		]
	},
	{
		id: 4,
		title: "Both lines",
		move: "Each given fact still holds",
		premises: ["The number is even.", "The number is greater than 10."],
		claims: [
			{
				text: "The number is even.",
				follows: true,
				blurb: "Given outright."
			},
			{
				text: "The number is greater than 10.",
				follows: true,
				blurb: "Also given. Both can be true together."
			},
			{
				text: "The number is 12.",
				follows: false,
				blurb: "12 fits, but 14 and 16 fit too. Nothing forces 12."
			},
			{
				text: "The number is odd.",
				follows: false,
				blurb: "Odd contradicts even."
			}
		]
	},
	{
		id: 5,
		title: "Wet path",
		move: "The result does not prove the cause",
		premises: ["If it rains, the path is wet.", "The path is wet."],
		claims: [
			{
				text: "It must be raining.",
				follows: false,
				blurb: "A hose, a spill, or dew can wet a path. The rule only runs one direction."
			},
			{
				text: "It must be dry weather.",
				follows: false,
				blurb: "Rain is still possible. Wet does not forbid it."
			},
			{
				text: "The path is wet.",
				follows: true,
				blurb: "That was given."
			},
			{
				text: "Rain would wet the path.",
				follows: true,
				blurb: "The first line still stands, whether or not this wetness came from rain."
			}
		]
	},
	{
		id: 6,
		title: "Open gate",
		move: "Denying the cause proves nothing about the result",
		premises: ["If the gate is locked, the bell rings.", "The gate is not locked."],
		claims: [
			{
				text: "The bell is silent.",
				follows: false,
				blurb: "The rule does not say the bell rings only for a locked gate."
			},
			{
				text: "The bell must be ringing.",
				follows: false,
				blurb: "Unlocked does not force the bell either way."
			},
			{
				text: "The gate is unlocked.",
				follows: true,
				blurb: "Restating the second line."
			},
			{
				text: "These lines do not settle the bell.",
				follows: true,
				blurb: "Locked would settle it. Unlocked leaves it open."
			}
		]
	},
	{
		id: 7,
		title: "Multiples of four",
		move: "A general rule applies to the case in front of you",
		premises: ["Every multiple of 4 is even.", "12 is a multiple of 4."],
		claims: [
			{
				text: "12 is even.",
				follows: true,
				blurb: "12 is a multiple of 4, and every such multiple is even."
			},
			{
				text: "Every even number is a multiple of 4.",
				follows: false,
				blurb: "That is the rule backwards. 2 is even and not a multiple of 4, and nothing here forbids that."
			},
			{
				text: "10 is a multiple of 4.",
				follows: false,
				blurb: "10 was never claimed."
			},
			{
				text: "12 is a multiple of 4.",
				follows: true,
				blurb: "Given on the second line."
			}
		]
	},
	{
		id: 8,
		title: "Some, not all",
		move: "Some means at least one",
		premises: ["Some primes are odd.", "2 is prime."],
		claims: [
			{
				text: "At least one prime is odd.",
				follows: true,
				blurb: "That is what some means."
			},
			{
				text: "There exists an odd prime.",
				follows: true,
				blurb: "Same fact, different words."
			},
			{
				text: "2 is odd.",
				follows: false,
				blurb: "Being prime was not tied to being odd for this case."
			},
			{
				text: "Every prime is odd.",
				follows: false,
				blurb: "Some does not mean every."
			}
		]
	},
	{
		id: 9,
		title: "The chain",
		move: "Follow the links",
		premises: [
			"If the key turns, the bolt slides.",
			"If the bolt slides, the door opens.",
			"The key turns."
		],
		claims: [
			{
				text: "The bolt slides.",
				follows: true,
				blurb: "The key turned, so the first rule fires."
			},
			{
				text: "The door opens.",
				follows: true,
				blurb: "Bolt slides, so the second rule fires too."
			},
			{
				text: "The door stays shut.",
				follows: false,
				blurb: "Shut contradicts the chain."
			},
			{
				text: "The key did not turn.",
				follows: false,
				blurb: "The third line says it did."
			}
		]
	},
	{
		id: 10,
		title: "Squares",
		move: "Flip a rule by denying both ends",
		premises: ["If a shape is a square, then it has four equal sides."],
		claims: [
			{
				text: "If a shape does not have four equal sides, it is not a square.",
				follows: true,
				blurb: "The flipped form of the same rule. Unequal sides cannot hide a square."
			},
			{
				text: "If a shape has four equal sides, it is a square.",
				follows: false,
				blurb: "A rhombus can have four equal sides and still not be a square. The rule never said that."
			},
			{
				text: "If a shape is not a square, it lacks four equal sides.",
				follows: false,
				blurb: "A rhombus can have four equal sides and still not be a square. Not-a-square does not force unequal sides."
			},
			{
				text: "A square has four equal sides.",
				follows: true,
				blurb: "Drop the 'if' and the result remains."
			}
		]
	},
	{
		id: 11,
		title: "Not both",
		move: "Taking one drops the other",
		premises: ["You cannot have both the cake and the coin.", "You have the cake."],
		claims: [
			{
				text: "You do not have the coin.",
				follows: true,
				blurb: "Both together are forbidden, and the cake is already taken."
			},
			{
				text: "You have the coin.",
				follows: false,
				blurb: "That would be both."
			},
			{
				text: "You have neither.",
				follows: false,
				blurb: "You have the cake, so neither is false."
			},
			{
				text: "You have the cake.",
				follows: true,
				blurb: "Given."
			}
		]
	},
	{
		id: 12,
		title: "At least one",
		move: "Inclusive or leaves the other open",
		premises: ["At least one is true: the quiz was passed, or the essay was passed.", "The quiz was passed."],
		claims: [
			{
				text: "The essay was failed.",
				follows: false,
				blurb: "At least one allows both. Passing the quiz does not kill the essay."
			},
			{
				text: "The quiz was passed.",
				follows: true,
				blurb: "Given."
			},
			{
				text: "Both were failed.",
				follows: false,
				blurb: "The quiz was passed, so both failed is impossible."
			},
			{
				text: "These lines do not decide the essay.",
				follows: true,
				blurb: "Passing the quiz leaves the essay open. At least one allows both."
			}
		]
	},
	{
		id: 13,
		title: "Needed, not enough",
		move: "A requirement runs when the result is seen",
		premises: ["The torch lights only if it has a battery.", "The torch is lit."],
		claims: [
			{
				text: "The torch has a battery.",
				follows: true,
				blurb: "Lit is impossible without a battery, and it is lit."
			},
			{
				text: "Any torch with a battery is lit.",
				follows: false,
				blurb: "A battery is required, not a guarantee. The switch can still be off."
			},
			{
				text: "The torch is dark.",
				follows: false,
				blurb: "The second line says it is lit."
			},
			{
				text: "No battery would mean no light.",
				follows: true,
				blurb: "That is the requirement, said from the other side."
			}
		]
	},
	{
		id: 14,
		title: "Squares and rectangles",
		move: "The wider set does not collapse",
		premises: ["All squares are rectangles.", "This tile is a square."],
		claims: [
			{
				text: "This tile is a rectangle.",
				follows: true,
				blurb: "It is a square, and every square is a rectangle."
			},
			{
				text: "Every rectangle is a square.",
				follows: false,
				blurb: "The rule does not run backwards."
			},
			{
				text: "This tile is not a rectangle.",
				follows: false,
				blurb: "That contradicts the first claim that does follow."
			},
			{
				text: "This tile is a square.",
				follows: true,
				blurb: "Given."
			}
		]
	},
	{
		id: 15,
		title: "Divisible",
		move: "Apply the rule you were given, not its reverse",
		premises: ["If a whole number is divisible by 6, then it is divisible by 3.", "18 is divisible by 6."],
		claims: [
			{
				text: "18 is divisible by 3.",
				follows: true,
				blurb: "18 meets the condition, so the result follows."
			},
			{
				text: "If a whole number is divisible by 3, then it is divisible by 6.",
				follows: false,
				blurb: "9 is the classic counterexample, and these lines never claim the reverse."
			},
			{
				text: "9 is divisible by 6.",
				follows: false,
				blurb: "9 is not mentioned, and the rule does not push upward."
			},
			{
				text: "18 is divisible by 6.",
				follows: true,
				blurb: "Given."
			}
		]
	},
	{
		id: 16,
		title: "Mixed bench",
		move: "Use only what was written",
		premises: [
			"If the sample is pure gold, then it conducts.",
			"The sample conducts.",
			"If the sample is iron, then it is not pure gold."
		],
		claims: [
			{
				text: "The sample must be pure gold.",
				follows: false,
				blurb: "Conducting is the result, not proof of the cause. Other metals conduct."
			},
			{
				text: "The sample conducts.",
				follows: true,
				blurb: "Given."
			},
			{
				text: "If this sample is iron, it is not pure gold.",
				follows: true,
				blurb: "The third line says exactly that."
			},
			{
				text: "The sample must be iron.",
				follows: false,
				blurb: "Iron is one story that fits. It is not forced."
			},
			{
				text: "A pure gold sample would conduct.",
				follows: true,
				blurb: "The first line still holds."
			}
		]
	}
];
function auditLogic() {
	const errors = [];
	if (LOGIC_LEVELS.length !== 16) errors.push(`logic count ${LOGIC_LEVELS.length}`);
	LOGIC_LEVELS.forEach((level, index) => {
		if (level.id !== index + 1) errors.push(`logic id ${level.id}`);
		if (level.premises.length < 1) errors.push(`level ${level.id} premises`);
		if (level.claims.length < 4) errors.push(`level ${level.id} claims ${level.claims.length}`);
		const follows = level.claims.filter((claim) => claim.follows).length;
		const denied = level.claims.length - follows;
		if (follows < 2) errors.push(`level ${level.id} follows ${follows}`);
		if (denied < 2) errors.push(`level ${level.id} denied ${denied}`);
		const seen = /* @__PURE__ */ new Set();
		for (const claim of level.claims) {
			if (seen.has(claim.text)) errors.push(`level ${level.id} duplicate claim`);
			seen.add(claim.text);
			if (!claim.blurb || !claim.text) errors.push(`level ${level.id} empty claim`);
		}
		if (!level.move || !level.title) errors.push(`level ${level.id} title`);
	});
	return errors;
}
var TITLES$4 = [
	"Add a little",
	"Add more",
	"Bigger steps",
	"Still adding",
	"Take away",
	"Subtract",
	"Larger drop",
	"Quiet minus",
	"Times",
	"Times three",
	"Then shift",
	"Scale and slide",
	"Name the rule",
	"Which machine",
	"Hidden rule",
	"Last rule"
];
var RULE_JOBS = [
	{
		input: 3,
		rules: [
			{
				op: "add",
				k: 4
			},
			{
				op: "mul",
				k: 2
			},
			{
				op: "sub",
				k: 1
			},
			{
				op: "mul",
				k: 3
			}
		]
	},
	{
		input: 4,
		rules: [
			{
				op: "mul",
				k: 2
			},
			{
				op: "add",
				k: 2
			},
			{
				op: "add",
				k: 3
			},
			{
				op: "mul",
				k: 3
			}
		]
	},
	{
		input: 6,
		rules: [
			{
				op: "sub",
				k: 2
			},
			{
				op: "add",
				k: 2
			},
			{
				op: "mul",
				k: 2
			},
			{
				op: "sub",
				k: 1
			}
		]
	},
	{
		input: 5,
		rules: [
			{
				op: "muladd",
				k: 2,
				b: 1
			},
			{
				op: "mul",
				k: 2
			},
			{
				op: "add",
				k: 1
			},
			{
				op: "mul",
				k: 3
			}
		]
	},
	{
		input: 2,
		rules: [
			{
				op: "muladd",
				k: 3,
				b: 1
			},
			{
				op: "mul",
				k: 3
			},
			{
				op: "mul",
				k: 4
			},
			{
				op: "muladd",
				k: 2,
				b: 1
			}
		]
	},
	{
		input: 7,
		rules: [
			{
				op: "add",
				k: 3
			},
			{
				op: "mul",
				k: 2
			},
			{
				op: "sub",
				k: 3
			},
			{
				op: "add",
				k: 2
			}
		]
	},
	{
		input: 4,
		rules: [
			{
				op: "muladd",
				k: 3,
				b: -2
			},
			{
				op: "mul",
				k: 2
			},
			{
				op: "mul",
				k: 3
			},
			{
				op: "add",
				k: 5
			}
		]
	},
	{
		input: 8,
		rules: [
			{
				op: "muladd",
				k: 2,
				b: -6
			},
			{
				op: "mul",
				k: 2
			},
			{
				op: "sub",
				k: 2
			},
			{
				op: "add",
				k: 1
			}
		]
	},
	{
		input: 9,
		rules: [
			{
				op: "sub",
				k: 4
			},
			{
				op: "sub",
				k: 3
			},
			{
				op: "sub",
				k: 5
			},
			{
				op: "add",
				k: 4
			}
		]
	},
	{
		input: 3,
		rules: [
			{
				op: "muladd",
				k: 4,
				b: 1
			},
			{
				op: "mul",
				k: 4
			},
			{
				op: "mul",
				k: 5
			},
			{
				op: "add",
				k: 8
			}
		]
	},
	{
		input: 6,
		rules: [
			{
				op: "muladd",
				k: 2,
				b: -3
			},
			{
				op: "mul",
				k: 2
			},
			{
				op: "sub",
				k: 3
			},
			{
				op: "mul",
				k: 3
			}
		]
	},
	{
		input: 10,
		rules: [
			{
				op: "add",
				k: 6
			},
			{
				op: "mul",
				k: 2
			},
			{
				op: "sub",
				k: 4
			},
			{
				op: "add",
				k: 4
			}
		]
	}
];
function applyRule(rule, n) {
	if (rule.op === "add") return n + rule.k;
	if (rule.op === "sub") return n - rule.k;
	if (rule.op === "mul") return n * rule.k;
	return n * rule.k + rule.b;
}
function formatRule(rule) {
	if (rule.op === "add") return `+ ${rule.k}`;
	if (rule.op === "sub") return `− ${rule.k}`;
	if (rule.op === "mul") return `× ${rule.k}`;
	const sign = rule.b < 0 ? `− ${-rule.b}` : `+ ${rule.b}`;
	return `× ${rule.k} ${sign}`;
}
function outJob(id, slot) {
	if (id <= 4) return {
		rule: {
			op: "add",
			k: id + slot
		},
		input: 2 + id + slot
	};
	if (id <= 8) {
		const k = 1 + slot + (id - 5);
		return {
			rule: {
				op: "sub",
				k
			},
			input: k + 4 + slot
		};
	}
	if (id <= 10) return {
		rule: {
			op: "mul",
			k: id === 9 ? 2 + slot : 3
		},
		input: 2 + slot + (id === 10 ? 1 : 0)
	};
	const k = id === 11 ? 2 : 3;
	const b = slot - 1;
	const input = 2 + slot;
	if (b === 0) return {
		rule: {
			op: "mul",
			k
		},
		input
	};
	return {
		rule: {
			op: "muladd",
			k,
			b
		},
		input
	};
}
function takeFour$2(answer, extra) {
	const choices = [];
	for (const item of [answer, ...extra]) {
		if (!choices.includes(item)) choices.push(item);
		if (choices.length === 4) return [
			choices[0],
			choices[1],
			choices[2],
			choices[3]
		];
	}
	throw new Error(`machine choices for ${answer}`);
}
function outChoices(answer, input, rule) {
	const shift = rule.op === "muladd" ? rule.b : rule.op === "add" || rule.op === "sub" || rule.op === "mul" ? rule.k : 0;
	const extra = [
		answer + 1,
		answer - 1,
		answer + 2,
		input,
		input + shift,
		answer + shift,
		input * 2,
		0
	].map(String);
	return takeFour$2(String(answer), extra);
}
function outBlurb(rule, input, output) {
	return `${input} ${formatRule(rule)} comes out ${output}.`;
}
function makeOut(id, slot) {
	const job = outJob(id, slot);
	const output = applyRule(job.rule, job.input);
	const answer = String(output);
	return {
		kicker: "In → out",
		ask: "What number comes out?",
		scene: {
			mode: "out",
			input: job.input,
			rule: job.rule,
			rules: [job.rule]
		},
		choices: outChoices(output, job.input, job.rule),
		answer,
		blurb: outBlurb(job.rule, job.input, output)
	};
}
function makeRule(job) {
	const rule = job.rules[0];
	const output = applyRule(rule, job.input);
	const answer = formatRule(rule);
	return {
		kicker: "Hidden rule",
		ask: "Which rule did the machine use?",
		scene: {
			mode: "rule",
			input: job.input,
			rule,
			rules: job.rules
		},
		choices: job.rules.map(formatRule),
		answer,
		blurb: `${job.input} goes in and ${output} comes out. The rule is ${answer}.`
	};
}
var MACHINE_LEVELS = TITLES$4.map((title, index) => {
	const id = index + 1;
	return {
		id,
		title,
		prompts: id <= 12 ? [
			0,
			1,
			2
		].map((slot) => makeOut(id, slot)) : [
			0,
			1,
			2
		].map((slot) => makeRule(RULE_JOBS[(id - 13) * 3 + slot]))
	};
});
function auditMachine() {
	const errors = [];
	if (MACHINE_LEVELS.length !== 16) errors.push(`levels ${MACHINE_LEVELS.length}`);
	for (const level of MACHINE_LEVELS) {
		if (level.prompts.length !== 3) errors.push(`prompts ${level.id}`);
		for (const prompt of level.prompts) {
			const { scene } = prompt;
			const output = applyRule(scene.rule, scene.input);
			if (new Set(prompt.choices).size !== 4) errors.push(`dup ${level.id} ${prompt.choices.join("|")}`);
			if (!prompt.choices.includes(prompt.answer)) errors.push(`missing ${level.id}`);
			if (scene.mode === "out") {
				if (prompt.answer !== String(output)) errors.push(`out ${level.id} ${prompt.answer} != ${output}`);
				for (const choice of prompt.choices) if (choice !== prompt.answer && Number(choice) === output) errors.push(`alias ${level.id}`);
			} else {
				if (prompt.answer !== formatRule(scene.rule)) errors.push(`rule label ${level.id}`);
				const hits = scene.rules.filter((rule) => applyRule(rule, scene.input) === output);
				if (hits.length !== 1) errors.push(`rule hits ${level.id} ${hits.length}`);
				if (scene.rules.map(formatRule).join("|") !== prompt.choices.join("|")) errors.push(`rule choices ${level.id}`);
			}
		}
	}
	return errors;
}
var TITLES$3 = [
	"How fast",
	"Steady pace",
	"Quicker",
	"Same clock",
	"Longer run",
	"Last speed",
	"How far",
	"Keep going",
	"Farther",
	"Short trip",
	"Long trip",
	"Last distance",
	"How long",
	"The clock",
	"Wait",
	"Last time"
];
function motionDistance(scene) {
	return scene.speed * scene.time;
}
function motionAnswer(scene) {
	if (scene.kind === "speed") return scene.speed;
	if (scene.kind === "time") return scene.time;
	return motionDistance(scene);
}
function motionAsk(scene) {
	if (scene.kind === "speed") return "How many meters each second?";
	if (scene.kind === "distance") return "How many meters does the trip cover?";
	return "How many seconds does the trip take?";
}
function motionKicker(scene) {
	if (scene.kind === "speed") return "Speed";
	if (scene.kind === "distance") return "Distance";
	return "Time";
}
function motionBlurb(scene) {
	const distance = motionDistance(scene);
	if (scene.kind === "speed") return `${distance} m in ${scene.time} s is ${scene.speed} m each second.`;
	if (scene.kind === "distance") return `${scene.speed} m each second for ${scene.time} s covers ${distance} m.`;
	return `${distance} m at ${scene.speed} m each second takes ${scene.time} s.`;
}
function motionGivens(scene) {
	const distance = motionDistance(scene);
	if (scene.kind === "speed") return [`${distance} m`, `${scene.time} s`];
	if (scene.kind === "distance") return [`${scene.speed} m/s`, `${scene.time} s`];
	return [`${distance} m`, `${scene.speed} m/s`];
}
function takeFour$1(answer, extra) {
	const choices = [];
	for (const item of [answer, ...extra.map(String)]) {
		if (!choices.includes(item)) choices.push(item);
		if (choices.length === 4) return [
			choices[0],
			choices[1],
			choices[2],
			choices[3]
		];
	}
	throw new Error(`motion choices for ${answer}`);
}
function choicesFor$2(scene) {
	const answer = motionAnswer(scene);
	const distance = motionDistance(scene);
	const pool = [
		answer + 1,
		answer - 1,
		answer + 2,
		scene.speed + scene.time,
		distance + scene.speed,
		scene.kind === "distance" ? scene.speed : distance,
		scene.kind === "time" ? scene.speed : scene.time
	];
	return takeFour$1(String(answer), pool.filter((n) => Number.isInteger(n) && n > 0 && n !== answer));
}
function sceneAt(id, slot) {
	if (id <= 6) return {
		kind: "speed",
		speed: 2 + id + slot,
		time: 2 + slot
	};
	if (id <= 12) return {
		kind: "distance",
		speed: 3 + (id - 7) + slot,
		time: 2 + slot % 3
	};
	return {
		kind: "time",
		speed: 2 + slot + id % 3,
		time: 2 + (id - 13) + slot
	};
}
function promptAt(id, slot) {
	const scene = sceneAt(id, slot);
	return {
		kicker: motionKicker(scene),
		ask: motionAsk(scene),
		scene,
		choices: choicesFor$2(scene),
		answer: String(motionAnswer(scene)),
		blurb: motionBlurb(scene)
	};
}
var MOTION_LEVELS = TITLES$3.map((title, index) => ({
	id: index + 1,
	title,
	prompts: [
		0,
		1,
		2
	].map((slot) => promptAt(index + 1, slot))
}));
function auditMotion() {
	const errors = [];
	if (MOTION_LEVELS.length !== 16) errors.push(`levels ${MOTION_LEVELS.length}`);
	MOTION_LEVELS.forEach((level, index) => {
		if (level.id !== index + 1) errors.push(`id ${level.id}`);
		if (level.prompts.length !== 3) errors.push(`prompts ${level.id}`);
		for (const prompt of level.prompts) {
			const scene = prompt.scene;
			if (!Number.isInteger(scene.speed) || scene.speed < 2) errors.push(`speed ${level.id}`);
			if (!Number.isInteger(scene.time) || scene.time < 2) errors.push(`time ${level.id}`);
			const answer = motionAnswer(scene);
			if (prompt.answer !== String(answer)) errors.push(`answer ${level.id}`);
			if (prompt.blurb !== motionBlurb(scene) || prompt.ask !== motionAsk(scene)) errors.push(`copy ${level.id}`);
			if (scene.kind === "distance" && motionDistance(scene) !== answer) errors.push(`distance ${level.id}`);
			if (scene.kind === "speed" && motionDistance(scene) !== scene.speed * scene.time) errors.push(`rate ${level.id}`);
			if (new Set(prompt.choices).size !== 4 || !prompt.choices.includes(prompt.answer)) errors.push(`choices ${level.id}`);
			for (const choice of prompt.choices) if (choice !== prompt.answer && Number(choice) === answer) errors.push(`decoy ${level.id}`);
		}
	});
	return errors;
}
var SYMBOLS = [
	{
		id: "pi",
		glyph: "π",
		name: "Pi",
		field: "math",
		blurb: "Circle constant. Circumference divided by diameter."
	},
	{
		id: "sigma",
		glyph: "Σ",
		name: "Sigma",
		field: "math",
		blurb: "Summation. Add every term in the run."
	},
	{
		id: "integral",
		glyph: "∫",
		name: "Integral",
		field: "math",
		blurb: "Integral. Accumulated area under a curve."
	},
	{
		id: "radical",
		glyph: "√",
		name: "Radical",
		field: "math",
		blurb: "Square root. The side whose square is this value."
	},
	{
		id: "delta",
		glyph: "Δ",
		name: "Delta",
		field: "physics",
		blurb: "Change. Final value minus the initial one."
	},
	{
		id: "lambda",
		glyph: "λ",
		name: "Lambda",
		field: "physics",
		blurb: "Wavelength. Crest to crest, or a decay constant."
	},
	{
		id: "omega",
		glyph: "Ω",
		name: "Omega",
		field: "physics",
		blurb: "Ohms, angular speed, or a solid angle."
	},
	{
		id: "theta",
		glyph: "θ",
		name: "Theta",
		field: "math",
		blurb: "An angle, often the one you are solving for."
	},
	{
		id: "phi",
		glyph: "φ",
		name: "Phi",
		field: "math",
		blurb: "The golden ratio, about 1.618."
	},
	{
		id: "mu",
		glyph: "μ",
		name: "Mu",
		field: "physics",
		blurb: "Friction, or the prefix for a millionth."
	},
	{
		id: "rho",
		glyph: "ρ",
		name: "Rho",
		field: "physics",
		blurb: "Density. Mass packed into a volume."
	},
	{
		id: "alpha",
		glyph: "α",
		name: "Alpha",
		field: "physics",
		blurb: "Angular acceleration, or a fine-structure constant."
	},
	{
		id: "nabla",
		glyph: "∇",
		name: "Nabla",
		field: "math",
		blurb: "Del. The operator behind gradient, divergence, and curl."
	}
];
var STAGES = [
	{
		kinds: 4,
		moves: 24,
		target: 700,
		name: "Four glyphs"
	},
	{
		kinds: 4,
		moves: 22,
		target: 900,
		name: "Tighter proof"
	},
	{
		kinds: 5,
		moves: 22,
		target: 1100,
		name: "A fifth glyph"
	},
	{
		kinds: 5,
		moves: 20,
		target: 1400,
		name: "Fewer moves"
	},
	{
		kinds: 6,
		moves: 20,
		target: 1700,
		name: "Physics joins"
	},
	{
		kinds: 6,
		moves: 19,
		target: 2e3,
		name: "Longer chains"
	},
	{
		kinds: 7,
		moves: 18,
		target: 2300,
		name: "First book"
	},
	{
		kinds: 8,
		moves: 18,
		target: 2700,
		name: "Theta"
	},
	{
		kinds: 9,
		moves: 17,
		target: 3100,
		name: "Phi"
	},
	{
		kinds: 10,
		moves: 17,
		target: 3500,
		name: "Mu"
	},
	{
		kinds: 11,
		moves: 16,
		target: 3900,
		name: "Rho"
	},
	{
		kinds: 11,
		moves: 16,
		target: 4300,
		name: "Density"
	},
	{
		kinds: 12,
		moves: 15,
		target: 4700,
		name: "Alpha"
	},
	{
		kinds: 12,
		moves: 15,
		target: 5100,
		name: "Spin"
	},
	{
		kinds: 13,
		moves: 15,
		target: 5600,
		name: "Nabla"
	},
	{
		kinds: 13,
		moves: 14,
		target: 6200,
		name: "Whole book"
	}
];
var STAGE_COUNT = STAGES.length;
function stageConfig(stage) {
	const safe = Math.max(1, Math.floor(stage));
	if (safe <= STAGES.length) {
		const row = STAGES[safe - 1];
		return {
			kindCount: row.kinds,
			moves: row.moves,
			target: row.target,
			name: row.name,
			total: STAGES.length
		};
	}
	const extra = safe - STAGES.length;
	const last = STAGES[STAGES.length - 1];
	return {
		kindCount: last.kinds,
		moves: Math.max(12, last.moves - extra),
		target: last.target + extra * 600,
		name: "Apex",
		total: STAGES.length
	};
}
var DT = .008;
var STEPS = 2400;
var ORBIT_MODEL = "Simplified: one fixed mass, inverse-square gravity, no drag, and no other bodies. The trail is the stepper, not a painted guess.";
function acceleration(x, y, mu = 1) {
	const soft = Math.max(Math.hypot(x, y), 1e-4);
	const inv = mu / (soft * soft * soft);
	return {
		ax: -x * inv,
		ay: -y * inv
	};
}
function specificEnergy(body, mu = 1) {
	const r = Math.max(Math.hypot(body.x, body.y), 1e-4);
	return (body.vx * body.vx + body.vy * body.vy) / 2 - mu / r;
}
function circularSpeed(radius, mu = 1) {
	return Math.sqrt(mu / radius);
}
function escapeSpeed(radius, mu = 1) {
	return Math.sqrt(2 * mu / radius);
}
function tangentHeading(angle, retro = false) {
	return angle + (retro ? -Math.PI / 2 : Math.PI / 2);
}
function bodyFrom(launch) {
	return {
		x: launch.radius * Math.cos(launch.angle),
		y: launch.radius * Math.sin(launch.angle),
		vx: launch.speed * Math.cos(launch.heading),
		vy: launch.speed * Math.sin(launch.heading)
	};
}
function stepBody(body, dt = DT, mu = 1) {
	const a1 = acceleration(body.x, body.y, mu);
	const x = body.x + body.vx * dt + .5 * a1.ax * dt * dt;
	const y = body.y + body.vy * dt + .5 * a1.ay * dt * dt;
	const a2 = acceleration(x, y, mu);
	return {
		x,
		y,
		vx: body.vx + .5 * (a1.ax + a2.ax) * dt,
		vy: body.vy + .5 * (a1.ay + a2.ay) * dt
	};
}
function fly(launch, steps = STEPS, dt = DT) {
	let body = bodyFrom(launch);
	const out = [{ ...body }];
	for (let i = 0; i < steps; i++) {
		body = stepBody(body, dt);
		if (i % 6 === 0) out.push(body);
		const r = Math.hypot(body.x, body.y);
		if (r < .22 || r > 14) {
			out.push(body);
			break;
		}
	}
	return out;
}
function classifyOrbit(samples) {
	if (samples.length === 0) return "surface";
	let minR = Infinity;
	let maxR = 0;
	let sum = 0;
	for (const sample of samples) {
		const r = Math.hypot(sample.x, sample.y);
		if (r < .22) return "surface";
		minR = Math.min(minR, r);
		maxR = Math.max(maxR, r);
		sum += r;
	}
	const last = samples[samples.length - 1];
	if (specificEnergy(last) >= -.015 && maxR > 3.2) return "escape";
	const mean = sum / samples.length;
	if ((mean > 0 ? (maxR - minR) / mean : 1) < .2) return "circle";
	return "ellipse";
}
function orbitEditable(locks, key) {
	if (Object.keys(locks).filter((name) => locks[name] !== void 0).length === 0) return true;
	return locks[key] === false;
}
function shot(radius, angle, speed, heading = tangentHeading(angle)) {
	return {
		radius,
		angle,
		heading,
		speed
	};
}
var speedOnly = { speed: false };
var headingOnly = { heading: false };
var ORBIT_PLAYS = [
	{
		id: 1,
		title: "Stay aloft",
		blurb: "Too slow and you fall into the mass. Give the craft enough speed to stay off it.",
		aim: "aloft",
		start: shot(1, .4, .55 * circularSpeed(1)),
		solution: shot(1, .4, circularSpeed(1)),
		locks: speedOnly
	},
	{
		id: 2,
		title: "Hold a circle",
		blurb: "A circle keeps one distance. This start is already stretched. Ease the speed back.",
		aim: "circle",
		start: shot(1, .2, 1.2 * circularSpeed(1)),
		solution: shot(1, .2, circularSpeed(1)),
		locks: speedOnly
	},
	{
		id: 3,
		title: "Far circle",
		blurb: "Same rule, farther out. Circular speed is lower when the radius is larger.",
		aim: "circle",
		start: shot(2, 1.1, .5 * circularSpeed(2)),
		solution: shot(2, 1.1, circularSpeed(2)),
		locks: speedOnly
	},
	{
		id: 4,
		title: "Close circle",
		blurb: "Near the mass, standing still is not an option. Find the speed that holds the radius.",
		aim: "circle",
		start: shot(.8, .2, .55 * circularSpeed(.8)),
		solution: shot(.8, .2, circularSpeed(.8)),
		locks: speedOnly
	},
	{
		id: 5,
		title: "Stretch the path",
		blurb: "A little under circular speed and the path becomes an ellipse. Do not fall in.",
		aim: "ellipse",
		start: shot(1, .4, circularSpeed(1)),
		solution: shot(1, .4, .82 * circularSpeed(1)),
		locks: speedOnly
	},
	{
		id: 6,
		title: "A thinner ellipse",
		blurb: "Slower still, as long as the closest point stays above the mass.",
		aim: "ellipse",
		start: shot(1, 1.2, circularSpeed(1)),
		solution: shot(1, 1.2, .75 * circularSpeed(1)),
		locks: speedOnly
	},
	{
		id: 7,
		title: "Ellipse farther out",
		blurb: "Drop below circular speed at this radius. The far point stays where you started.",
		aim: "ellipse",
		start: shot(1.6, .8, circularSpeed(1.6)),
		solution: shot(1.6, .8, .82 * circularSpeed(1.6)),
		locks: speedOnly
	},
	{
		id: 8,
		title: "Fast ellipse",
		blurb: "Too much speed for a circle, not enough to leave. The path reaches farther and comes back.",
		aim: "ellipse",
		start: shot(1, 2.1, circularSpeed(1)),
		solution: shot(1, 2.1, 1.25 * circularSpeed(1)),
		locks: speedOnly
	},
	{
		id: 9,
		title: "Leave",
		blurb: "Escape speed is higher than circular speed. The craft should not come back.",
		aim: "escape",
		start: shot(1, .4, circularSpeed(1)),
		solution: shot(1, .4, 1.08 * escapeSpeed(1)),
		locks: speedOnly
	},
	{
		id: 10,
		title: "Leave from farther",
		blurb: "A wider start needs less speed to escape. Still more than the circle at that radius.",
		aim: "escape",
		start: shot(1.5, 2, circularSpeed(1.5)),
		solution: shot(1.5, 2, 1.08 * escapeSpeed(1.5)),
		locks: speedOnly
	},
	{
		id: 11,
		title: "Just enough",
		blurb: "A small step past escape speed is enough. The trail should run outward and stay gone.",
		aim: "escape",
		start: shot(1, .7, circularSpeed(1)),
		solution: shot(1, .7, 1.05 * escapeSpeed(1)),
		locks: speedOnly
	},
	{
		id: 12,
		title: "Point along the circle",
		blurb: "The same speed, pointed at the mass, falls in. Point it along the tangent.",
		aim: "circle",
		start: shot(1, .4, circularSpeed(1), .4),
		solution: shot(1, .4, circularSpeed(1)),
		locks: headingOnly
	},
	{
		id: 13,
		title: "Aim the ellipse",
		blurb: "This speed can stretch into an ellipse, but only if the heading is tangent.",
		aim: "ellipse",
		start: shot(1, .4, .82 * circularSpeed(1), .4),
		solution: shot(1, .4, .82 * circularSpeed(1)),
		locks: {
			speed: false,
			heading: false
		}
	},
	{
		id: 14,
		title: "Which way is out",
		blurb: "Escape speed pointed inward still hits the mass. Turn the heading.",
		aim: "escape",
		start: shot(1, .9, 1.08 * escapeSpeed(1), .9 + Math.PI),
		solution: shot(1, .9, 1.08 * escapeSpeed(1)),
		locks: headingOnly
	},
	{
		id: 15,
		title: "Fall in",
		blurb: "Cut the speed until the path meets the mass. This one is supposed to hit.",
		aim: "surface",
		start: shot(1, .3, circularSpeed(1)),
		solution: shot(1, .3, .5 * circularSpeed(1)),
		locks: speedOnly
	},
	{
		id: 16,
		title: "Your own ellipse",
		blurb: "Radius, angle, heading, and speed are open. Any ellipse counts. The numbers are not the grade.",
		aim: "ellipse",
		start: shot(1, .4, circularSpeed(1), .4),
		solution: shot(1.6, .8, .82 * circularSpeed(1.6)),
		locks: {}
	}
];
function judgeOrbit(play, launch) {
	const kind = classifyOrbit(fly(launch));
	if (play.aim === "aloft") {
		const ok = kind !== "surface";
		return {
			ok,
			kind,
			detail: ok ? `Aloft. The path is a ${kind}.` : "That launch hits the mass."
		};
	}
	if (play.aim === "surface") {
		const ok = kind === "surface";
		return {
			ok,
			kind,
			detail: ok ? "The launch falls into the mass." : `The path is a ${kind}. It misses the mass.`
		};
	}
	const ok = kind === play.aim;
	return {
		ok,
		kind,
		detail: ok ? `The path is a ${kind}.` : `The path is a ${kind}, not a ${play.aim}.`
	};
}
var G = "gold";
var M = "mint";
var S = "mist";
var ODDS_LEVELS = [
	{
		id: 1,
		title: "One coin",
		prompts: [
			{
				kicker: "FAIR COIN",
				ask: "Chance this toss is heads.",
				model: {
					type: "coins-all",
					n: 1
				},
				choices: [
					"1/2",
					"1/3",
					"1/4",
					"2/3"
				],
				answer: "1/2",
				blurb: "Two faces, one of them heads. 1 out of 2."
			},
			{
				kicker: "FAIR COIN",
				ask: "Chance this toss is tails.",
				model: {
					type: "coins-all",
					n: 1
				},
				choices: [
					"1/2",
					"0",
					"1/4",
					"1"
				],
				answer: "1/2",
				blurb: "Tails is the other face. Still 1 out of 2."
			},
			{
				kicker: "AFTER A STREAK",
				ask: "Five heads already. Chance the next toss is heads.",
				model: {
					type: "fixed",
					p: "1/2",
					streak: 5
				},
				choices: [
					"1/2",
					"1/32",
					"5/6",
					"0"
				],
				answer: "1/2",
				blurb: "A fair coin has no memory. The streak does not spend the next toss."
			}
		]
	},
	{
		id: 2,
		title: "Two coins",
		prompts: [
			{
				kicker: "TWO COINS",
				ask: "Chance both land heads.",
				model: {
					type: "coins-all",
					n: 2
				},
				choices: [
					"1/4",
					"1/2",
					"1/3",
					"3/4"
				],
				answer: "1/4",
				blurb: "HH, HT, TH, TT. One of the four is HH."
			},
			{
				kicker: "TWO COINS",
				ask: "Chance of exactly one head.",
				model: {
					type: "coins-exact",
					n: 2,
					heads: 1
				},
				choices: [
					"1/2",
					"1/4",
					"1/3",
					"3/4"
				],
				answer: "1/2",
				blurb: "HT and TH. Two of the four outcomes."
			},
			{
				kicker: "TWO COINS",
				ask: "Chance of at least one head.",
				model: {
					type: "coins-at-least",
					n: 2
				},
				choices: [
					"3/4",
					"1/2",
					"1/4",
					"1"
				],
				answer: "3/4",
				blurb: "Only TT fails. Three of four outcomes work."
			}
		]
	},
	{
		id: 3,
		title: "Three coins",
		prompts: [
			{
				kicker: "THREE COINS",
				ask: "Chance all three are heads.",
				model: {
					type: "coins-all",
					n: 3
				},
				choices: [
					"1/8",
					"1/6",
					"1/4",
					"3/8"
				],
				answer: "1/8",
				blurb: "Each coin halves the chance. 1/2 × 1/2 × 1/2 = 1/8."
			},
			{
				kicker: "THREE COINS",
				ask: "Chance of exactly one head.",
				model: {
					type: "coins-exact",
					n: 3,
					heads: 1
				},
				choices: [
					"3/8",
					"1/8",
					"1/2",
					"1/3"
				],
				answer: "3/8",
				blurb: "The single head can sit on any of the three coins. 3 out of 8."
			},
			{
				kicker: "THREE COINS",
				ask: "Chance of at least one head.",
				model: {
					type: "coins-at-least",
					n: 3
				},
				choices: [
					"7/8",
					"1/2",
					"3/8",
					"1/8"
				],
				answer: "7/8",
				blurb: "The only miss is TTT. 1 − 1/8 = 7/8."
			}
		]
	},
	{
		id: 4,
		title: "One die",
		prompts: [
			{
				kicker: "FAIR DIE",
				ask: "Chance the face is 6.",
				model: {
					type: "die",
					faces: [6]
				},
				choices: [
					"1/6",
					"1/3",
					"1/2",
					"1/5"
				],
				answer: "1/6",
				blurb: "Six faces, one of them a six."
			},
			{
				kicker: "FAIR DIE",
				ask: "Chance the face is odd.",
				model: {
					type: "die",
					faces: [
						1,
						3,
						5
					]
				},
				choices: [
					"1/2",
					"1/3",
					"1/6",
					"2/3"
				],
				answer: "1/2",
				blurb: "1, 3, and 5. Three faces out of six."
			},
			{
				kicker: "FAIR DIE",
				ask: "Chance the face is greater than 4.",
				model: {
					type: "die",
					faces: [5, 6]
				},
				choices: [
					"1/3",
					"1/6",
					"1/2",
					"2/5"
				],
				answer: "1/3",
				blurb: "Only 5 and 6. 2/6 = 1/3."
			}
		]
	},
	{
		id: 5,
		title: "The whole die",
		prompts: [
			{
				kicker: "FAIR DIE",
				ask: "Chance the face is 4 or less.",
				model: {
					type: "die",
					faces: [
						1,
						2,
						3,
						4
					]
				},
				choices: [
					"2/3",
					"1/2",
					"1/4",
					"4/5"
				],
				answer: "2/3",
				blurb: "Four faces out of six. 4/6 = 2/3."
			},
			{
				kicker: "FAIR DIE",
				ask: "Chance the face is 1.",
				model: {
					type: "die",
					faces: [1]
				},
				choices: [
					"1/6",
					"1/5",
					"1/2",
					"0"
				],
				answer: "1/6",
				blurb: "One face, same as a six."
			},
			{
				kicker: "FAIR DIE",
				ask: "Chance the face is anything from 1 to 6.",
				model: {
					type: "die",
					faces: [
						1,
						2,
						3,
						4,
						5,
						6
					]
				},
				choices: [
					"1",
					"5/6",
					"1/6",
					"0"
				],
				answer: "1",
				blurb: "Every face counts. That chance is certain."
			}
		]
	},
	{
		id: 6,
		title: "Even bag",
		prompts: [
			{
				kicker: "ONE DRAW",
				ask: "Chance the bead is gold.",
				model: {
					type: "bag",
					beads: [
						G,
						G,
						M,
						M
					],
					color: G
				},
				choices: [
					"1/2",
					"1/4",
					"2/3",
					"1/3"
				],
				answer: "1/2",
				blurb: "Two gold out of four beads."
			},
			{
				kicker: "ONE DRAW",
				ask: "Chance the bead is mint.",
				model: {
					type: "bag",
					beads: [
						G,
						G,
						M,
						M
					],
					color: M
				},
				choices: [
					"1/2",
					"1/4",
					"3/4",
					"1"
				],
				answer: "1/2",
				blurb: "Mint matches gold here. Two out of four."
			},
			{
				kicker: "ONE DRAW",
				ask: "Chance the bead is not gold.",
				model: {
					type: "bag-not",
					beads: [
						G,
						G,
						M,
						M
					],
					color: G
				},
				choices: [
					"1/2",
					"1/4",
					"0",
					"3/4"
				],
				answer: "1/2",
				blurb: "Not gold means the two mint beads. Still half."
			}
		]
	},
	{
		id: 7,
		title: "Heavy gold",
		prompts: [
			{
				kicker: "ONE DRAW",
				ask: "Chance the bead is gold.",
				model: {
					type: "bag",
					beads: [
						G,
						G,
						G,
						M
					],
					color: G
				},
				choices: [
					"3/4",
					"1/4",
					"1/2",
					"2/3"
				],
				answer: "3/4",
				blurb: "Three gold out of four."
			},
			{
				kicker: "ONE DRAW",
				ask: "Chance the bead is mint.",
				model: {
					type: "bag",
					beads: [
						G,
						G,
						G,
						M
					],
					color: M
				},
				choices: [
					"1/4",
					"3/4",
					"1/2",
					"1/3"
				],
				answer: "1/4",
				blurb: "One mint bead in the bag."
			},
			{
				kicker: "ONE DRAW",
				ask: "Chance the bead is not gold.",
				model: {
					type: "bag-not",
					beads: [
						G,
						G,
						G,
						M
					],
					color: G
				},
				choices: [
					"1/4",
					"3/4",
					"1/2",
					"0"
				],
				answer: "1/4",
				blurb: "The complement of 3/4 is 1/4."
			}
		]
	},
	{
		id: 8,
		title: "Three colors",
		prompts: [
			{
				kicker: "ONE DRAW",
				ask: "Chance the bead is gold.",
				model: {
					type: "bag",
					beads: [
						G,
						G,
						M,
						M,
						S,
						S
					],
					color: G
				},
				choices: [
					"1/3",
					"1/2",
					"1/6",
					"2/5"
				],
				answer: "1/3",
				blurb: "Two gold out of six. 2/6 = 1/3."
			},
			{
				kicker: "ONE DRAW",
				ask: "Chance the bead is mist.",
				model: {
					type: "bag",
					beads: [
						G,
						G,
						M,
						M,
						S,
						S
					],
					color: S
				},
				choices: [
					"1/3",
					"1/2",
					"1/6",
					"2/3"
				],
				answer: "1/3",
				blurb: "Mist has the same count as gold."
			},
			{
				kicker: "ONE DRAW",
				ask: "Chance the bead is not mist.",
				model: {
					type: "bag-not",
					beads: [
						G,
						G,
						M,
						M,
						S,
						S
					],
					color: S
				},
				choices: [
					"2/3",
					"1/3",
					"1/2",
					"5/6"
				],
				answer: "2/3",
				blurb: "Gold and mint together are four of six."
			}
		]
	},
	{
		id: 9,
		title: "Almost gold",
		prompts: [
			{
				kicker: "ONE DRAW",
				ask: "Chance the bead is gold.",
				model: {
					type: "bag",
					beads: [
						G,
						G,
						G,
						G,
						G,
						M
					],
					color: G
				},
				choices: [
					"5/6",
					"1/6",
					"4/5",
					"2/3"
				],
				answer: "5/6",
				blurb: "Five gold beads out of six."
			},
			{
				kicker: "ONE DRAW",
				ask: "Chance the bead is mint.",
				model: {
					type: "bag",
					beads: [
						G,
						G,
						G,
						G,
						G,
						M
					],
					color: M
				},
				choices: [
					"1/6",
					"5/6",
					"1/5",
					"1/2"
				],
				answer: "1/6",
				blurb: "A single mint bead."
			},
			{
				kicker: "ONE DRAW",
				ask: "Chance the bead is not gold.",
				model: {
					type: "bag-not",
					beads: [
						G,
						G,
						G,
						G,
						G,
						M
					],
					color: G
				},
				choices: [
					"1/6",
					"5/6",
					"1/5",
					"0"
				],
				answer: "1/6",
				blurb: "Not gold is only that mint bead."
			}
		]
	},
	{
		id: 10,
		title: "Set one aside",
		prompts: [
			{
				kicker: "FIRST DRAW",
				ask: "Chance the first bead is gold.",
				model: {
					type: "bag",
					beads: [
						G,
						G,
						M
					],
					color: G
				},
				choices: [
					"2/3",
					"1/2",
					"1/3",
					"3/4"
				],
				answer: "2/3",
				blurb: "Before anything leaves, two of the three beads are gold."
			},
			{
				kicker: "GOLD SET ASIDE",
				ask: "A gold bead is already out. Chance the next is gold.",
				model: {
					type: "after",
					beads: [
						G,
						G,
						M
					],
					take: G,
					color: G
				},
				choices: [
					"1/2",
					"2/3",
					"1/3",
					"0"
				],
				answer: "1/2",
				blurb: "One gold remains, and one mint. The bag is now even."
			},
			{
				kicker: "GOLD SET ASIDE",
				ask: "A gold bead is already out. Chance the next is mint.",
				model: {
					type: "after",
					beads: [
						G,
						G,
						M
					],
					take: G,
					color: M
				},
				choices: [
					"1/2",
					"1/3",
					"2/3",
					"1"
				],
				answer: "1/2",
				blurb: "The mint bead is one of the two that remain."
			}
		]
	},
	{
		id: 11,
		title: "What remains",
		prompts: [
			{
				kicker: "ONE DRAW",
				ask: "Chance the bead is mint.",
				model: {
					type: "bag",
					beads: [
						G,
						G,
						G,
						M,
						M
					],
					color: M
				},
				choices: [
					"2/5",
					"3/5",
					"1/2",
					"1/5"
				],
				answer: "2/5",
				blurb: "Two mint beads out of five."
			},
			{
				kicker: "MINT SET ASIDE",
				ask: "A mint bead is out. Chance the next is gold.",
				model: {
					type: "after",
					beads: [
						G,
						G,
						G,
						M,
						M
					],
					take: M,
					color: G
				},
				choices: [
					"3/4",
					"3/5",
					"1/2",
					"2/5"
				],
				answer: "3/4",
				blurb: "Three gold and one mint remain. 3 out of 4."
			},
			{
				kicker: "GOLD SET ASIDE",
				ask: "A gold bead is out. Chance the next is gold.",
				model: {
					type: "after",
					beads: [
						G,
						G,
						G,
						M,
						M
					],
					take: G,
					color: G
				},
				choices: [
					"1/2",
					"3/5",
					"2/3",
					"3/4"
				],
				answer: "1/2",
				blurb: "Two gold and two mint remain."
			}
		]
	},
	{
		id: 12,
		title: "Which bag",
		prompts: [
			{
				kicker: "GOLD IS MORE LIKELY IN",
				ask: "Left is two gold. Right is one gold and three mist.",
				model: {
					type: "compare",
					left: [G, G],
					right: [
						G,
						S,
						S,
						S
					],
					color: G
				},
				choices: [
					"Left",
					"Right",
					"Same",
					"Neither"
				],
				answer: "Left",
				blurb: "Left is certain. Right is 1 out of 4."
			},
			{
				kicker: "GOLD IS MORE LIKELY IN",
				ask: "Both bags are one gold and one mint.",
				model: {
					type: "compare",
					left: [G, M],
					right: [G, M],
					color: G
				},
				choices: [
					"Left",
					"Right",
					"Same",
					"Neither"
				],
				answer: "Same",
				blurb: "Both are 1 out of 2. Same is the match, not neither."
			},
			{
				kicker: "GOLD IS MORE LIKELY IN",
				ask: "Left is three gold and one mint. Right is two and two.",
				model: {
					type: "compare",
					left: [
						G,
						G,
						G,
						M
					],
					right: [
						G,
						G,
						M,
						M
					],
					color: G
				},
				choices: [
					"Left",
					"Right",
					"Same",
					"Neither"
				],
				answer: "Left",
				blurb: "3/4 against 1/2. Left is the heavier gold."
			}
		]
	},
	{
		id: 13,
		title: "Both have to happen",
		prompts: [
			{
				kicker: "COIN AND DIE",
				ask: "Chance of heads and a 6, together.",
				model: {
					type: "and",
					a: "1/2",
					b: "1/6"
				},
				choices: [
					"1/12",
					"1/6",
					"1/8",
					"2/3"
				],
				answer: "1/12",
				blurb: "Independent chances multiply. 1/2 × 1/6 = 1/12."
			},
			{
				kicker: "TWO COINS",
				ask: "Chance the first is heads and the second is heads.",
				model: {
					type: "and",
					a: "1/2",
					b: "1/2"
				},
				choices: [
					"1/4",
					"1/2",
					"1/3",
					"3/4"
				],
				answer: "1/4",
				blurb: "Same result as listing HH among four outcomes."
			},
			{
				kicker: "TWO DICE",
				ask: "Chance both dice show 6.",
				model: {
					type: "and",
					a: "1/6",
					b: "1/6"
				},
				choices: [
					"1/36",
					"1/12",
					"1/6",
					"1/18"
				],
				answer: "1/36",
				blurb: "1/6 × 1/6. One pair out of thirty-six."
			}
		]
	},
	{
		id: 14,
		title: "Two dice",
		prompts: [
			{
				kicker: "SUM OF TWO DICE",
				ask: "Chance the faces add to 2.",
				model: {
					type: "sum",
					total: 2
				},
				choices: [
					"1/36",
					"1/18",
					"1/6",
					"2/36"
				],
				answer: "1/36",
				blurb: "Only 1+1. One way out of 36."
			},
			{
				kicker: "SUM OF TWO DICE",
				ask: "Chance the faces add to 7.",
				model: {
					type: "sum",
					total: 7
				},
				choices: [
					"1/6",
					"1/12",
					"1/7",
					"5/36"
				],
				answer: "1/6",
				blurb: "Six ways: 1+6 through 6+1. 6/36 = 1/6."
			},
			{
				kicker: "SUM OF TWO DICE",
				ask: "Chance the faces add to 12.",
				model: {
					type: "sum",
					total: 12
				},
				choices: [
					"1/36",
					"1/12",
					"1/6",
					"2/36"
				],
				answer: "1/36",
				blurb: "Only 6+6. As rare as snake eyes."
			}
		]
	},
	{
		id: 15,
		title: "Mixed bench",
		prompts: [
			{
				kicker: "TWO COINS",
				ask: "Chance of at least one head.",
				model: {
					type: "coins-at-least",
					n: 2
				},
				choices: [
					"3/4",
					"1/2",
					"1/4",
					"1/8"
				],
				answer: "3/4",
				blurb: "HH, HT, TH. Leave out TT."
			},
			{
				kicker: "FAIR DIE",
				ask: "Chance the face is even.",
				model: {
					type: "die",
					faces: [
						2,
						4,
						6
					]
				},
				choices: [
					"1/2",
					"1/3",
					"1/6",
					"2/3"
				],
				answer: "1/2",
				blurb: "2, 4, and 6. Half the die."
			},
			{
				kicker: "ONE DRAW",
				ask: "Chance the bead is gold.",
				model: {
					type: "bag",
					beads: [
						G,
						G,
						M,
						S
					],
					color: G
				},
				choices: [
					"1/2",
					"1/4",
					"1/3",
					"3/4"
				],
				answer: "1/2",
				blurb: "Two gold out of four, with mint and mist sharing the rest."
			}
		]
	},
	{
		id: 16,
		title: "Last draw",
		prompts: [
			{
				kicker: "GOLD SET ASIDE",
				ask: "One gold is out. Chance the next is gold.",
				model: {
					type: "after",
					beads: [
						G,
						G,
						G,
						G,
						M
					],
					take: G,
					color: G
				},
				choices: [
					"3/4",
					"4/5",
					"1/2",
					"2/3"
				],
				answer: "3/4",
				blurb: "Three gold and one mint remain."
			},
			{
				kicker: "GOLD IS MORE LIKELY IN",
				ask: "Left is one gold and three mist. Right is four mist.",
				model: {
					type: "compare",
					left: [
						G,
						S,
						S,
						S
					],
					right: [
						S,
						S,
						S,
						S
					],
					color: G
				},
				choices: [
					"Left",
					"Right",
					"Same",
					"Neither"
				],
				answer: "Left",
				blurb: "Right cannot draw gold. Left still can, one time in four."
			},
			{
				kicker: "SUM OF TWO DICE",
				ask: "Chance the faces add to 8.",
				model: {
					type: "sum",
					total: 8
				},
				choices: [
					"5/36",
					"1/6",
					"4/36",
					"1/8"
				],
				answer: "5/36",
				blurb: "2+6, 3+5, 4+4, 5+3, 6+2. Five ways, not six."
			}
		]
	}
];
function beadCount(beads, color) {
	return beads.filter((bead) => bead === color).length;
}
function binom(n, k) {
	if (k < 0 || k > n) return 0;
	let value = 1;
	for (let i = 1; i <= k; i++) value = value * (n - k + i) / i;
	return value;
}
function sumPairs(total) {
	const pairs = [];
	for (let a = 1; a <= 6; a++) {
		const b = total - a;
		if (b >= 1 && b <= 6) pairs.push(`${a}+${b}`);
	}
	return pairs;
}
function parseChance(label) {
	const text = label.trim();
	if (text === "0") return 0;
	if (text === "1") return 1;
	const match = text.match(/^(\d+)\s*\/\s*(\d+)$/);
	if (!match) return null;
	const den = Number(match[2]);
	if (den === 0) return null;
	return Number(match[1]) / den;
}
function chanceOf(model) {
	switch (model.type) {
		case "bag": return model.beads.length ? beadCount(model.beads, model.color) / model.beads.length : NaN;
		case "bag-not": return model.beads.length ? 1 - beadCount(model.beads, model.color) / model.beads.length : NaN;
		case "after": {
			const index = model.beads.indexOf(model.take);
			if (index < 0) return NaN;
			const rest = model.beads.filter((_, beadIndex) => beadIndex !== index);
			return rest.length ? beadCount(rest, model.color) / rest.length : NaN;
		}
		case "coins-all": return model.n > 0 ? 1 / 2 ** model.n : NaN;
		case "coins-at-least": return model.n > 0 ? 1 - 1 / 2 ** model.n : NaN;
		case "coins-exact": return model.n > 0 ? binom(model.n, model.heads) / 2 ** model.n : NaN;
		case "die": return model.faces.length / 6;
		case "sum": return sumPairs(model.total).length / 36;
		case "and": {
			const left = parseChance(model.a);
			const right = parseChance(model.b);
			if (left == null || right == null) return NaN;
			return left * right;
		}
		case "fixed": {
			const value = parseChance(model.p);
			return value == null ? NaN : value;
		}
		case "compare": return NaN;
	}
}
function compareCall(model) {
	if (!model.left.length || !model.right.length) return null;
	const left = beadCount(model.left, model.color) / model.left.length;
	const right = beadCount(model.right, model.color) / model.right.length;
	if (Math.abs(left - right) < 1e-9) return "Same";
	return left > right ? "Left" : "Right";
}
function auditOdds() {
	const errors = [];
	if (ODDS_LEVELS.length !== 16) errors.push(`odds count ${ODDS_LEVELS.length}`);
	ODDS_LEVELS.forEach((level, index) => {
		if (level.id !== index + 1) errors.push(`odds id ${level.id}`);
		if (level.prompts.length < 3) errors.push(`level ${level.id} prompts`);
		for (const prompt of level.prompts) {
			if (new Set(prompt.choices).size !== 4) errors.push(`level ${level.id} choices`);
			if (!prompt.choices.includes(prompt.answer)) errors.push(`level ${level.id} answer missing`);
			if (!prompt.blurb || !prompt.ask) errors.push(`level ${level.id} copy`);
			const model = prompt.model;
			if (model.type === "compare") {
				if (compareCall(model) !== prompt.answer) errors.push(`level ${level.id} compare ${prompt.ask}`);
				continue;
			}
			if (model.type === "die") {
				if (new Set(model.faces).size !== model.faces.length || model.faces.some((face) => face < 1 || face > 6)) errors.push(`level ${level.id} die`);
			}
			if (model.type === "coins-exact" && (model.heads < 0 || model.heads > model.n)) errors.push(`level ${level.id} heads`);
			if ((model.type === "coins-all" || model.type === "coins-at-least" || model.type === "coins-exact") && (model.n < 1 || model.n > 4)) errors.push(`level ${level.id} coins`);
			const expected = chanceOf(model);
			const stated = parseChance(prompt.answer);
			if (stated == null || Math.abs(expected - stated) > 1e-9) errors.push(`level ${level.id} ${prompt.ask} got ${expected} vs ${prompt.answer}`);
		}
	});
	return errors;
}
var PRIME_LEVELS = [
	{
		id: 1,
		title: "To ten",
		blurb: "1 is not prime. 2 is.",
		numbers: [
			1,
			2,
			3,
			4,
			5,
			6,
			7,
			8,
			9,
			10
		]
	},
	{
		id: 2,
		title: "Teens",
		blurb: "11, 13, 17. Watch the evens.",
		numbers: [
			8,
			9,
			10,
			11,
			12,
			13,
			14,
			15,
			16,
			17
		]
	},
	{
		id: 3,
		title: "Odds that fail",
		blurb: "9, 15, 21, 25, 27 are odd and not prime.",
		numbers: [
			13,
			15,
			17,
			19,
			21,
			23,
			25,
			27
		]
	},
	{
		id: 4,
		title: "Into the thirties",
		blurb: "23, 29, 31.",
		numbers: [
			21,
			22,
			23,
			25,
			27,
			29,
			31,
			32
		]
	},
	{
		id: 5,
		title: "Only even prime",
		blurb: "2 is the only even prime.",
		numbers: [
			2,
			4,
			6,
			8,
			10,
			12,
			14,
			15,
			17,
			19
		]
	},
	{
		id: 6,
		title: "Thirties",
		blurb: "31, 37, 41.",
		numbers: [
			31,
			32,
			33,
			34,
			35,
			36,
			37,
			38,
			39,
			41
		]
	},
	{
		id: 7,
		title: "Forties",
		blurb: "49 is 7 squared.",
		numbers: [
			43,
			44,
			45,
			46,
			47,
			48,
			49,
			51,
			53,
			55
		]
	},
	{
		id: 8,
		title: "Sixties",
		blurb: "57 is 3 times 19.",
		numbers: [
			57,
			58,
			59,
			60,
			61,
			62,
			63,
			64,
			65,
			67
		]
	},
	{
		id: 9,
		title: "Seventies",
		blurb: "77 is 7 times 11.",
		numbers: [
			71,
			72,
			73,
			74,
			75,
			76,
			77,
			78,
			79,
			81
		]
	},
	{
		id: 10,
		title: "Nineties trap",
		blurb: "91 is 7 times 13.",
		numbers: [
			83,
			84,
			87,
			89,
			90,
			91,
			93,
			95,
			97,
			99
		]
	},
	{
		id: 11,
		title: "Around one hundred",
		blurb: "97, 101, 103, 107.",
		numbers: [
			95,
			96,
			97,
			99,
			100,
			101,
			102,
			103,
			105,
			107
		]
	},
	{
		id: 12,
		title: "Classic misses",
		blurb: "1, squares, and products. Keep the primes.",
		numbers: [
			1,
			9,
			15,
			23,
			25,
			27,
			29,
			31,
			35,
			37,
			49,
			77
		]
	},
	{
		id: 13,
		title: "Past 110",
		blurb: "121 is 11 squared.",
		numbers: [
			109,
			111,
			113,
			115,
			119,
			121,
			123,
			125,
			127,
			131
		]
	},
	{
		id: 14,
		title: "Past 130",
		blurb: "133 is 7 times 19. 143 is 11 times 13.",
		numbers: [
			131,
			133,
			135,
			137,
			139,
			141,
			143,
			145,
			147,
			149
		]
	},
	{
		id: 15,
		title: "Past 150",
		blurb: "169 is 13 squared.",
		numbers: [
			151,
			153,
			155,
			157,
			159,
			161,
			163,
			165,
			167,
			169
		]
	},
	{
		id: 16,
		title: "Last sieve",
		blurb: "187 is 11 times 17.",
		numbers: [
			173,
			177,
			179,
			183,
			187,
			189,
			191,
			193,
			195,
			197
		]
	}
];
function isPrime(n) {
	if (n < 2 || !Number.isInteger(n)) return false;
	for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
	return true;
}
function factorBlurb(n) {
	if (n === 1) return "1 has only one divisor. A prime needs two: 1 and itself.";
	if (isPrime(n)) return `${n} has no divisors except 1 and itself.`;
	for (let i = 2; i * i <= n; i++) if (n % i === 0) return `${n} = ${i} × ${n / i}. Not prime.`;
	return `${n} is not prime.`;
}
function auditPrime() {
	const errors = [];
	if (PRIME_LEVELS.length !== 16) errors.push("prime count");
	PRIME_LEVELS.forEach((level, index) => {
		if (level.id !== index + 1) errors.push(`prime id ${level.id}`);
		if (new Set(level.numbers).size !== level.numbers.length) errors.push(`level ${level.id} duplicate`);
		const primes = level.numbers.filter(isPrime);
		if (primes.length < 3) errors.push(`level ${level.id} primes ${primes.length}`);
		if (level.numbers.length - primes.length < 2) errors.push(`level ${level.id} decoys`);
		if (level.numbers.some((n) => n < 1 || n > 400)) errors.push(`level ${level.id} range`);
	});
	return errors;
}
var RUN_LEVELS = [
	{
		id: 1,
		title: "Step two",
		prompts: [
			{
				rule: "Add 2",
				terms: [
					"2",
					"4",
					"6",
					null,
					"10"
				],
				choices: [
					"7",
					"8",
					"9",
					"12"
				],
				answer: "8",
				blurb: "Even steps. 6 + 2 = 8."
			},
			{
				rule: "Add 2",
				terms: [
					"1",
					"3",
					"5",
					"7",
					null
				],
				choices: [
					"8",
					"9",
					"10",
					"11"
				],
				answer: "9",
				blurb: "Odd numbers. 7 + 2 = 9."
			},
			{
				rule: "Add 2",
				terms: [
					"10",
					"12",
					"14",
					null,
					"18"
				],
				choices: [
					"15",
					"16",
					"17",
					"20"
				],
				answer: "16",
				blurb: "14 + 2 = 16, then 18."
			}
		]
	},
	{
		id: 2,
		title: "Step five",
		prompts: [
			{
				rule: "Add 5",
				terms: [
					"5",
					"10",
					"15",
					null,
					"25"
				],
				choices: [
					"18",
					"20",
					"21",
					"30"
				],
				answer: "20",
				blurb: "15 + 5 = 20."
			},
			{
				rule: "Add 5",
				terms: [
					"3",
					"8",
					"13",
					"18",
					null
				],
				choices: [
					"21",
					"22",
					"23",
					"28"
				],
				answer: "23",
				blurb: "18 + 5 = 23."
			},
			{
				rule: "Subtract 5",
				terms: [
					"40",
					"35",
					"30",
					null,
					"20"
				],
				choices: [
					"22",
					"25",
					"28",
					"15"
				],
				answer: "25",
				blurb: "Counting down by 5. 30 − 5 = 25."
			}
		]
	},
	{
		id: 3,
		title: "Squares",
		prompts: [
			{
				rule: "Square numbers",
				terms: [
					"1",
					"4",
					"9",
					"16",
					null
				],
				choices: [
					"20",
					"24",
					"25",
					"36"
				],
				answer: "25",
				blurb: "1² 2² 3² 4² 5². Next is 25."
			},
			{
				rule: "Square numbers",
				terms: [
					"4",
					"9",
					"16",
					null,
					"36"
				],
				choices: [
					"20",
					"25",
					"30",
					"49"
				],
				answer: "25",
				blurb: "2² through 6². The gap is 5²."
			},
			{
				rule: "Square numbers",
				terms: [
					"36",
					"49",
					"64",
					null
				],
				choices: [
					"72",
					"80",
					"81",
					"100"
				],
				answer: "81",
				blurb: "6² 7² 8² 9². Next is 81."
			}
		]
	},
	{
		id: 4,
		title: "Cubes",
		prompts: [
			{
				rule: "Cubes",
				terms: [
					"1",
					"8",
					"27",
					null
				],
				choices: [
					"36",
					"48",
					"64",
					"81"
				],
				answer: "64",
				blurb: "1³ 2³ 3³ 4³. Four cubed is 64."
			},
			{
				rule: "Cubes",
				terms: [
					"8",
					"27",
					"64",
					null
				],
				choices: [
					"81",
					"100",
					"125",
					"216"
				],
				answer: "125",
				blurb: "2³ through 5³. Five cubed is 125."
			},
			{
				rule: "Cubes",
				terms: [
					"1",
					"8",
					null,
					"64",
					"125"
				],
				choices: [
					"16",
					"27",
					"32",
					"36"
				],
				answer: "27",
				blurb: "The missing cube is 3³ = 27."
			}
		]
	},
	{
		id: 5,
		title: "Doubles",
		prompts: [
			{
				rule: "Multiply by 2",
				terms: [
					"3",
					"6",
					"12",
					null,
					"48"
				],
				choices: [
					"18",
					"24",
					"30",
					"36"
				],
				answer: "24",
				blurb: "12 × 2 = 24, then 48."
			},
			{
				rule: "Multiply by 2",
				terms: [
					"1",
					"2",
					"4",
					"8",
					null
				],
				choices: [
					"10",
					"12",
					"16",
					"32"
				],
				answer: "16",
				blurb: "Powers of two. 8 × 2 = 16."
			},
			{
				rule: "Multiply by 2",
				terms: [
					"5",
					"10",
					"20",
					null
				],
				choices: [
					"25",
					"30",
					"40",
					"60"
				],
				answer: "40",
				blurb: "20 × 2 = 40."
			}
		]
	},
	{
		id: 6,
		title: "Triples",
		prompts: [
			{
				rule: "Multiply by 3",
				terms: [
					"2",
					"6",
					"18",
					null
				],
				choices: [
					"24",
					"36",
					"54",
					"72"
				],
				answer: "54",
				blurb: "18 × 3 = 54."
			},
			{
				rule: "Multiply by 3",
				terms: [
					"1",
					"3",
					"9",
					"27",
					null
				],
				choices: [
					"54",
					"63",
					"81",
					"108"
				],
				answer: "81",
				blurb: "27 × 3 = 81."
			},
			{
				rule: "Multiply by 3",
				terms: [
					"4",
					"12",
					null,
					"108"
				],
				choices: [
					"24",
					"36",
					"48",
					"54"
				],
				answer: "36",
				blurb: "12 × 3 = 36, and 36 × 3 = 108."
			}
		]
	},
	{
		id: 7,
		title: "Fibonacci",
		prompts: [
			{
				rule: "Add the previous two",
				terms: [
					"1",
					"1",
					"2",
					"3",
					"5",
					null
				],
				choices: [
					"6",
					"7",
					"8",
					"10"
				],
				answer: "8",
				blurb: "3 + 5 = 8."
			},
			{
				rule: "Add the previous two",
				terms: [
					"2",
					"3",
					"5",
					"8",
					null
				],
				choices: [
					"11",
					"12",
					"13",
					"16"
				],
				answer: "13",
				blurb: "5 + 8 = 13."
			},
			{
				rule: "Add the previous two",
				terms: [
					"1",
					"2",
					"3",
					"5",
					"8",
					null
				],
				choices: [
					"11",
					"12",
					"13",
					"21"
				],
				answer: "13",
				blurb: "5 + 8 = 13 again, from a different start."
			}
		]
	},
	{
		id: 8,
		title: "Triangular",
		prompts: [
			{
				rule: "Add the next integer",
				terms: [
					"1",
					"3",
					"6",
					"10",
					null
				],
				choices: [
					"12",
					"14",
					"15",
					"16"
				],
				answer: "15",
				blurb: "Differences are 2, 3, 4, 5. 10 + 5 = 15."
			},
			{
				rule: "Add the next integer",
				terms: [
					"6",
					"10",
					"15",
					null,
					"28"
				],
				choices: [
					"18",
					"20",
					"21",
					"24"
				],
				answer: "21",
				blurb: "15 + 6 = 21, then 21 + 7 = 28."
			},
			{
				rule: "Add the next integer",
				terms: [
					"10",
					"15",
					"21",
					null
				],
				choices: [
					"26",
					"27",
					"28",
					"36"
				],
				answer: "28",
				blurb: "21 + 7 = 28."
			}
		]
	},
	{
		id: 9,
		title: "Powers of two",
		prompts: [
			{
				rule: "Powers of 2",
				terms: [
					"2",
					"4",
					"8",
					"16",
					null
				],
				choices: [
					"24",
					"30",
					"32",
					"64"
				],
				answer: "32",
				blurb: "16 × 2 = 32."
			},
			{
				rule: "Powers of 2",
				terms: [
					"1",
					"2",
					"4",
					null,
					"16"
				],
				choices: [
					"6",
					"8",
					"10",
					"12"
				],
				answer: "8",
				blurb: "4 × 2 = 8, then 16."
			},
			{
				rule: "Powers of 2",
				terms: [
					"16",
					"32",
					"64",
					null
				],
				choices: [
					"96",
					"100",
					"128",
					"256"
				],
				answer: "128",
				blurb: "64 × 2 = 128."
			}
		]
	},
	{
		id: 10,
		title: "Primes",
		prompts: [
			{
				rule: "Prime numbers",
				terms: [
					"2",
					"3",
					"5",
					"7",
					null
				],
				choices: [
					"8",
					"9",
					"10",
					"11"
				],
				answer: "11",
				blurb: "After 7, the next prime is 11."
			},
			{
				rule: "Prime numbers",
				terms: [
					"3",
					"5",
					"7",
					"11",
					null
				],
				choices: [
					"12",
					"13",
					"14",
					"15"
				],
				answer: "13",
				blurb: "11 is prime. Next is 13, not 12."
			},
			{
				rule: "Prime numbers",
				terms: [
					"5",
					"7",
					"11",
					"13",
					null
				],
				choices: [
					"15",
					"16",
					"17",
					"19"
				],
				answer: "17",
				blurb: "15 is composite. 17 is prime."
			}
		]
	},
	{
		id: 11,
		title: "Angles",
		prompts: [
			{
				rule: "Add 15°",
				terms: [
					"0°",
					"15°",
					"30°",
					null,
					"60°"
				],
				choices: [
					"40°",
					"45°",
					"50°",
					"75°"
				],
				answer: "45°",
				blurb: "30° + 15° = 45°."
			},
			{
				rule: "Add 15°",
				terms: [
					"30°",
					"45°",
					"60°",
					null
				],
				choices: [
					"65°",
					"70°",
					"75°",
					"90°"
				],
				answer: "75°",
				blurb: "60° + 15° = 75°."
			},
			{
				rule: "Subtract 15°",
				terms: [
					"90°",
					"75°",
					"60°",
					null
				],
				choices: [
					"30°",
					"40°",
					"45°",
					"50°"
				],
				answer: "45°",
				blurb: "60° − 15° = 45°."
			}
		]
	},
	{
		id: 12,
		title: "Motion",
		prompts: [
			{
				rule: "Constant speed, 3 each second",
				terms: [
					"0",
					"3",
					"6",
					"9",
					null
				],
				choices: [
					"10",
					"11",
					"12",
					"15"
				],
				answer: "12",
				blurb: "Distance = speed × time. 3 × 4 = 12."
			},
			{
				rule: "Fall distances, squares",
				terms: [
					"1",
					"4",
					"9",
					"16",
					null
				],
				choices: [
					"20",
					"24",
					"25",
					"36"
				],
				answer: "25",
				blurb: "From rest, distance grows with t²: 5² = 25."
			},
			{
				rule: "Speed gains 2 each second",
				terms: [
					"0",
					"2",
					"4",
					"6",
					null
				],
				choices: [
					"7",
					"8",
					"10",
					"12"
				],
				answer: "8",
				blurb: "Constant acceleration. The next speed is 8."
			}
		]
	},
	{
		id: 13,
		title: "Halves",
		prompts: [
			{
				rule: "Divide by 2",
				terms: [
					"1",
					"1/2",
					"1/4",
					"1/8",
					null
				],
				choices: [
					"1/10",
					"1/12",
					"1/16",
					"1/32"
				],
				answer: "1/16",
				blurb: "Each term is half the last. Half of 1/8 is 1/16."
			},
			{
				rule: "Divide by 3",
				terms: [
					"81",
					"27",
					"9",
					"3",
					null
				],
				choices: [
					"0",
					"1",
					"1.5",
					"2"
				],
				answer: "1",
				blurb: "3 ÷ 3 = 1."
			},
			{
				rule: "Divide by 2",
				terms: [
					"64",
					"32",
					"16",
					"8",
					null
				],
				choices: [
					"2",
					"4",
					"6",
					"0"
				],
				answer: "4",
				blurb: "8 ÷ 2 = 4."
			}
		]
	},
	{
		id: 14,
		title: "Growing steps",
		prompts: [
			{
				rule: "Steps grow by 2",
				terms: [
					"1",
					"3",
					"7",
					"13",
					null
				],
				choices: [
					"17",
					"19",
					"20",
					"21"
				],
				answer: "21",
				blurb: "Differences 2, 4, 6, 8. 13 + 8 = 21."
			},
			{
				rule: "Steps grow by 1",
				terms: [
					"2",
					"3",
					"5",
					"8",
					"12",
					null
				],
				choices: [
					"15",
					"16",
					"17",
					"20"
				],
				answer: "17",
				blurb: "Differences 1, 2, 3, 4, 5. 12 + 5 = 17."
			},
			{
				rule: "Steps grow by 1",
				terms: [
					"5",
					"6",
					"8",
					"11",
					"15",
					null
				],
				choices: [
					"18",
					"19",
					"20",
					"21"
				],
				answer: "20",
				blurb: "Differences 1, 2, 3, 4, 5. 15 + 5 = 20."
			}
		]
	},
	{
		id: 15,
		title: "Factorials",
		prompts: [
			{
				rule: "n!",
				terms: [
					"1",
					"2",
					"6",
					"24",
					null
				],
				choices: [
					"48",
					"72",
					"120",
					"720"
				],
				answer: "120",
				blurb: "1, 2, 6, 24, 120 are 1! through 5!."
			},
			{
				rule: "n!",
				terms: [
					"2",
					"6",
					"24",
					"120",
					null
				],
				choices: [
					"240",
					"360",
					"600",
					"720"
				],
				answer: "720",
				blurb: "120 × 6 = 720, which is 6!."
			},
			{
				rule: "n!",
				terms: [
					"1",
					"2",
					"6",
					null,
					"120"
				],
				choices: [
					"12",
					"18",
					"24",
					"36"
				],
				answer: "24",
				blurb: "The missing term is 4! = 24."
			}
		]
	},
	{
		id: 16,
		title: "Mixed proof",
		prompts: [
			{
				rule: "Square numbers",
				terms: [
					"16",
					"25",
					"36",
					"49",
					null
				],
				choices: [
					"56",
					"60",
					"64",
					"81"
				],
				answer: "64",
				blurb: "4² through 8². Next is 64."
			},
			{
				rule: "Add the previous two",
				terms: [
					"3",
					"5",
					"8",
					"13",
					null
				],
				choices: [
					"18",
					"20",
					"21",
					"26"
				],
				answer: "21",
				blurb: "8 + 13 = 21."
			},
			{
				rule: "Cubes",
				terms: [
					"8",
					"27",
					"64",
					"125",
					null
				],
				choices: [
					"150",
					"180",
					"196",
					"216"
				],
				answer: "216",
				blurb: "2³ through 6³. Six cubed is 216."
			}
		]
	}
];
function auditRun() {
	const errors = [];
	RUN_LEVELS.forEach((level, index) => {
		if (level.id !== index + 1) errors.push(`run id ${level.id}`);
		if (level.prompts.length !== 3) errors.push(`level ${level.id} prompts ${level.prompts.length}`);
		for (const prompt of level.prompts) {
			const blanks = prompt.terms.filter((term) => term === null).length;
			if (blanks !== 1) errors.push(`level ${level.id} blanks ${blanks}`);
			if (prompt.choices.length !== 4) errors.push(`level ${level.id} choices`);
			if (new Set(prompt.choices).size !== prompt.choices.length) errors.push(`level ${level.id} duplicate choice`);
			if (!prompt.choices.includes(prompt.answer)) errors.push(`level ${level.id} answer missing`);
		}
	});
	return errors;
}
var LINES = [
	[[0, 0], [2, 2]],
	[[0, 0], [1, 2]],
	[[0, 1], [3, 1]],
	[[0, 0], [3, 1]],
	[[0, 0], [2, -2]],
	[[-2, 0], [2, 0]],
	[[0, 0], [4, 2]],
	[[1, 1], [3, 5]],
	[[0, 2], [0, -2]],
	[[-2, -1], [2, 1]],
	[[0, 0], [3, -1]],
	[[-1, 2], [2, -1]],
	[[-3, -3], [1, 1]],
	[[0, -2], [2, 2]],
	[[2, -2], [2, 2]],
	[[-2, 1], [2, 3]],
	[[0, 0], [1, -2]],
	[[-4, 2], [0, 0]],
	[[-1, -2], [3, 2]],
	[[0, 3], [3, 0]],
	[[-2, 2], [2, -2]],
	[[1, -1], [1, 3]],
	[[-3, 0], [3, 2]],
	[[0, 0], [4, -2]],
	[[-2, -2], [2, 0]],
	[[0, 1], [4, 3]],
	[[-4, 0], [-4, 3]],
	[[-1, 0], [3, 2]],
	[[0, -1], [2, 3]],
	[[-3, 1], [1, 1]],
	[[-2, 3], [2, -1]],
	[[1, 2], [4, 2]]
];
var POINT_LINES = [
	[[0, 0], [4, 2]],
	[[0, 0], [2, 4]],
	[[-2, -2], [2, 2]],
	[[0, 1], [4, 1]],
	[[1, -2], [1, 2]],
	[[-2, 0], [2, 2]],
	[[0, 0], [3, 3]],
	[[-4, -2], [0, 0]],
	[[0, -1], [4, 1]],
	[[-2, 2], [2, -2]],
	[[2, -3], [2, 3]],
	[[-3, -1], [3, 1]],
	[[0, 2], [3, -1]],
	[[-4, 4], [0, 0]],
	[[-1, -1], [3, 1]],
	[[0, 0], [2, -4]]
];
var TITLES$2 = [
	"First rise",
	"Steeper",
	"Flat",
	"Shallow",
	"Downhill",
	"Level",
	"Half",
	"Steep pair",
	"No run",
	"Through origin",
	"Gentle drop",
	"Falling",
	"Same ratio",
	"From below",
	"Vertical",
	"Last slope"
];
function gcd(a, b) {
	let x = Math.abs(a);
	let y = Math.abs(b);
	while (y) {
		const next = x % y;
		x = y;
		y = next;
	}
	return x || 1;
}
function formatSlope(dy, dx) {
	if (dx === 0) return "undefined";
	if (dy === 0) return "0";
	let n = dy / gcd(dy, dx);
	let d = dx / gcd(dy, dx);
	if (d < 0) {
		n = -n;
		d = -d;
	}
	if (d === 1) return String(n);
	return `${n}/${d}`;
}
function takeFour(answer, extra) {
	const choices = [];
	for (const item of [answer, ...extra]) {
		if (!choices.includes(item)) choices.push(item);
		if (choices.length === 4) break;
	}
	if (choices.length < 4) throw new Error(`slope choices for ${answer}`);
	return [
		choices[0],
		choices[1],
		choices[2],
		choices[3]
	];
}
function slopeChoices(dy, dx) {
	return takeFour(formatSlope(dy, dx), [
		dx !== 0 && dy !== 0 ? formatSlope(dx, dy) : "1",
		formatSlope(-dy, dx === 0 ? 1 : dx),
		"0",
		"1",
		"-1",
		"2",
		"-2",
		"1/2",
		"-1/2",
		"undefined",
		formatSlope(dy + 1, dx === 0 ? 1 : dx)
	]);
}
function onLine$1(a, b, p) {
	return (p[1] - a[1]) * (b[0] - a[0]) === (p[0] - a[0]) * (b[1] - a[1]);
}
function pointLabel(p) {
	return `(${p[0]}, ${p[1]})`;
}
function findHit(a, b) {
	const hits = [];
	for (let x = -4; x <= 4; x++) for (let y = -4; y <= 4; y++) {
		const p = [x, y];
		if (p[0] === a[0] && p[1] === a[1] || p[0] === b[0] && p[1] === b[1]) continue;
		if (onLine$1(a, b, p)) hits.push(p);
	}
	const hit = hits.filter((p) => {
		const minX = Math.min(a[0], b[0]);
		const maxX = Math.max(a[0], b[0]);
		const minY = Math.min(a[1], b[1]);
		const maxY = Math.max(a[1], b[1]);
		return p[0] >= minX && p[0] <= maxX && p[1] >= minY && p[1] <= maxY;
	})[0] ?? hits[0];
	if (!hit) throw new Error(`no lattice point on ${a} ${b}`);
	return hit;
}
function findMisses(a, b, hit) {
	const seeds = [
		[hit[0] + 1, hit[1]],
		[hit[0], hit[1] + 1],
		[hit[0] - 1, hit[1]],
		[hit[0], hit[1] - 1],
		[hit[0] + 1, hit[1] - 1],
		[a[0] + 1, a[1]],
		[b[0], b[1] + 1],
		[0, 0]
	];
	const misses = [];
	for (const p of seeds) {
		if (p[0] < -4 || p[0] > 4 || p[1] < -4 || p[1] > 4) continue;
		if (onLine$1(a, b, p)) continue;
		if (misses.some((item) => item[0] === p[0] && item[1] === p[1])) continue;
		misses.push(p);
		if (misses.length === 3) break;
	}
	if (misses.length < 3) throw new Error(`misses ${a} ${b}`);
	return misses;
}
function slopePrompt(a, b) {
	const dy = b[1] - a[1];
	const dx = b[0] - a[0];
	const answer = formatSlope(dy, dx);
	const blurb = dx === 0 ? "The run is 0. Vertical lines have undefined slope." : dy === 0 ? "The rise is 0, so the slope is 0." : `Rise ${dy}, run ${dx}. Slope ${answer}.`;
	return {
		kicker: "SLOPE",
		ask: "What is the slope of this line?",
		scene: {
			a,
			b,
			kind: "slope"
		},
		choices: slopeChoices(dy, dx),
		answer,
		blurb
	};
}
function pointPrompt(a, b) {
	const hit = findHit(a, b);
	const misses = findMisses(a, b, hit);
	const answer = pointLabel(hit);
	return {
		kicker: "ON THE LINE",
		ask: "Which point sits on this line?",
		scene: {
			a,
			b,
			kind: "point",
			hit
		},
		choices: [
			answer,
			pointLabel(misses[0]),
			pointLabel(misses[1]),
			pointLabel(misses[2])
		],
		answer,
		blurb: `${answer} keeps the same rise-over-run as the two dots. The others step off.`
	};
}
var SLOPE_LEVELS = TITLES$2.map((title, index) => ({
	id: index + 1,
	title,
	prompts: [
		slopePrompt(LINES[index * 2][0], LINES[index * 2][1]),
		slopePrompt(LINES[index * 2 + 1][0], LINES[index * 2 + 1][1]),
		pointPrompt(POINT_LINES[index][0], POINT_LINES[index][1])
	]
}));
function auditSlope() {
	const errors = [];
	if (SLOPE_LEVELS.length !== 16) errors.push(`slope count ${SLOPE_LEVELS.length}`);
	if (LINES.length !== 32 || POINT_LINES.length !== 16) errors.push("slope tables");
	SLOPE_LEVELS.forEach((level, index) => {
		if (level.id !== index + 1) errors.push(`slope id ${level.id}`);
		if (level.prompts.length !== 3) errors.push(`slope prompts ${level.id}`);
		for (const prompt of level.prompts) {
			if (new Set(prompt.choices).size !== 4) errors.push(`level ${level.id} choices`);
			if (!prompt.choices.includes(prompt.answer)) errors.push(`level ${level.id} answer missing`);
			const { a, b } = prompt.scene;
			if (a[0] === b[0] && a[1] === b[1]) errors.push(`level ${level.id} degenerate`);
			if (prompt.scene.kind === "slope") {
				const expected = formatSlope(b[1] - a[1], b[0] - a[0]);
				if (prompt.answer !== expected) errors.push(`level ${level.id} slope ${prompt.answer} != ${expected}`);
			} else {
				const hit = prompt.scene.hit;
				if (!hit || !onLine$1(a, b, hit) || prompt.answer !== pointLabel(hit)) errors.push(`level ${level.id} hit`);
				for (const choice of prompt.choices) {
					if (choice === prompt.answer) continue;
					const match = choice.match(/^\((-?\d+), (-?\d+)\)$/);
					if (!match) {
						errors.push(`level ${level.id} label ${choice}`);
						continue;
					}
					if (onLine$1(a, b, [Number(match[1]), Number(match[2])])) errors.push(`level ${level.id} miss is on line ${choice}`);
				}
			}
		}
	});
	return errors;
}
var PAIRS = [
	[[1, 0], [0, 1]],
	[[2, 0], [0, 2]],
	[[1, 1], [1, 0]],
	[[2, 1], [1, 2]],
	[[3, 0], [0, 1]],
	[[1, 2], [2, 1]],
	[[-1, 0], [0, 1]],
	[[2, 0], [-1, 0]],
	[[-2, 1], [1, 1]],
	[[0, 2], [0, -1]],
	[[3, 1], [-1, 2]],
	[[-1, -1], [2, 0]],
	[[2, -1], [1, 2]],
	[[-2, 0], [-1, 2]],
	[[4, 1], [-2, 1]],
	[[1, -2], [2, 1]],
	[[-3, 1], [1, 1]],
	[[2, 2], [-1, 1]],
	[[0, -2], [3, 1]],
	[[-1, 2], [-1, -1]],
	[[3, -1], [0, 2]],
	[[-2, -1], [4, 1]],
	[[1, 3], [2, -1]],
	[[-4, 0], [1, 2]],
	[[2, -2], [2, 1]],
	[[-1, 3], [3, -1]],
	[[5, 0], [-2, 1]],
	[[0, 3], [2, -2]],
	[[-3, -2], [1, 2]],
	[[4, -1], [-1, -1]],
	[[2, 3], [-2, 1]],
	[[-2, 2], [3, -1]],
	[[1, 1], [-1, 2]],
	[[3, 2], [1, -3]],
	[[-4, 1], [2, 2]],
	[[0, -3], [-1, 2]],
	[[2, 0], [3, 2]],
	[[-1, -2], [-2, 1]],
	[[4, 2], [-3, -1]],
	[[1, -3], [0, 2]],
	[[-2, 3], [2, 0]],
	[[3, -2], [-1, 2]],
	[[5, -1], [-3, 0]],
	[[-3, 2], [2, 2]],
	[[1, 4], [2, -2]],
	[[-2, -2], [3, 1]],
	[[4, 0], [0, -3]],
	[[-1, 1], [4, 2]]
];
var TITLES$1 = [
	"Unit steps",
	"Longer",
	"Along the floor",
	"Both ways",
	"East and north",
	"Crossed",
	"Turn around",
	"Cancel one",
	"Shared rise",
	"Up then down",
	"Mixed signs",
	"Out of the west",
	"Drop then rise",
	"West and north",
	"Give some back",
	"Resultant"
];
function label(p) {
	return `(${p[0]}, ${p[1]})`;
}
function choicesFor$1(a, b) {
	const answer = label([a[0] + b[0], a[1] + b[1]]);
	const pool = [
		answer,
		label([a[0] - b[0], a[1] - b[1]]),
		label([a[0] + b[1], a[1] + b[0]]),
		label(a),
		label(b),
		label([a[0] + b[0], a[1] - b[1]]),
		label([-(a[0] + b[0]), a[1] + b[1]]),
		label([a[0] + b[0] + 1, a[1] + b[1]]),
		label([a[1], b[0]])
	];
	const choices = [];
	for (const item of pool) {
		if (!choices.includes(item)) choices.push(item);
		if (choices.length === 4) break;
	}
	if (choices.length < 4 || choices[0] !== answer) throw new Error(`vector choices ${answer}`);
	return [
		choices[0],
		choices[1],
		choices[2],
		choices[3]
	];
}
function promptFor$1(a, b) {
	const sum = [a[0] + b[0], a[1] + b[1]];
	return {
		kicker: "A + B",
		ask: "What is the sum of the two vectors?",
		scene: {
			a,
			b
		},
		choices: choicesFor$1(a, b),
		answer: label(sum),
		blurb: `Add the runs, then the rises. ${label(a)} + ${label(b)} = ${label(sum)}.`
	};
}
var VECTOR_LEVELS = TITLES$1.map((title, index) => ({
	id: index + 1,
	title,
	prompts: [
		0,
		1,
		2
	].map((offset) => {
		const pair = PAIRS[index * 3 + offset];
		return promptFor$1(pair[0], pair[1]);
	})
}));
function parsePoint(labelText) {
	const match = labelText.match(/^\((-?\d+), (-?\d+)\)$/);
	if (!match) return null;
	return [Number(match[1]), Number(match[2])];
}
function auditVector() {
	const errors = [];
	if (VECTOR_LEVELS.length !== 16 || PAIRS.length !== 48) errors.push("vector count");
	VECTOR_LEVELS.forEach((level, index) => {
		if (level.id !== index + 1 || level.prompts.length !== 3) errors.push(`vector level ${level.id}`);
		for (const prompt of level.prompts) {
			if (new Set(prompt.choices).size !== 4 || !prompt.choices.includes(prompt.answer)) errors.push(`level ${level.id} choices`);
			const { a, b } = prompt.scene;
			if (a[0] === 0 && a[1] === 0 || b[0] === 0 && b[1] === 0) errors.push(`level ${level.id} zero`);
			const sum = label([a[0] + b[0], a[1] + b[1]]);
			if (prompt.answer !== sum) errors.push(`level ${level.id} sum`);
			for (const choice of prompt.choices) if (!parsePoint(choice)) errors.push(`level ${level.id} label ${choice}`);
		}
	});
	return errors;
}
function waveLength(freq) {
	if (freq === 0) return 0;
	return 1 / freq;
}
function freqFromLength(length) {
	if (length === 0) return 1;
	return 1 / length;
}
function w(amp, freq, phase, dir = 1) {
	return {
		amp,
		freq,
		phase,
		dir
	};
}
var WAVE_PLAYS = [
	play$2(1, "Match the crest", "match", "Tune A until it sits on the ghost.", [], [w(.2, 1, 0)], [w(.4, 2, 0)]),
	play$2(2, "Three across", "match", "Frequency is how many full waves fit the bench.", [], [w(.2, 1, 0)], [w(.35, 3, 1)]),
	play$2(3, "Shift the phase", "match", "Same shape, slid along the bench.", [], [w(.5, 1, 0)], [w(.5, 1, 1.2)]),
	play$2(4, "Short waves", "match", "A shorter wavelength is a higher frequency. λ × f = 1 on this bench.", [], [w(.3, 2, 0)], [w(.3, 4, .6)]),
	play$2(5, "Cancel A", "cancel", "B should undo A. Same size, same frequency, opposite phase.", [w(.4, 2, 0)], [w(.1, 1, 0)], [w(.4, 2, Math.PI)]),
	play$2(6, "Quiet the third", "cancel", "Opposite phase is half a turn: add π.", [w(.3, 3, .4)], [w(.3, 2, 0)], [w(.3, 3, .4 + Math.PI)]),
	play$2(7, "Flat line", "cancel", "The cream sum should sit on the center line.", [w(.45, 1, 1)], [w(.2, 2, 0)], [w(.45, 1, 1 + Math.PI)]),
	play$2(8, "Build the sum", "construct", "Put A and B on the same frequency and the same phase.", [], [w(.28, 1, 0), w(.28, 2, 1.5)], [w(.28, 2, 0), w(.28, 2, 0)]),
	play$2(9, "In step", "construct", "Constructive interference: crests land together, so the sum is taller than either wave.", [], [w(.3, 3, 0), w(.3, 3, 2)], [w(.3, 3, .8), w(.3, 3, .8)]),
	play$2(10, "Same wavelength", "construct", "Wavelength and frequency are one dial on this bench.", [], [w(.25, 1, 1), w(.32, 4, 0)], [w(.25, 2, .4), w(.32, 2, .4)]),
	play$2(11, "Stand still", "standing", "Send B backward. Equal size, equal wavelength, matched phase.", [w(.3, 2, .2, 1)], [w(.1, 1, 0, 1)], [w(.3, 2, .2, -1)]),
	play$2(12, "Nodes", "standing", "Opposite travel makes a standing pattern: the envelope stays, the height breathes.", [w(.34, 3, 0, 1)], [w(.34, 3, 1, 1)], [w(.34, 3, 0, -1)]),
	play$2(13, "Hold the phase", "standing", "If the phases disagree, the pattern slides. Match them.", [w(.28, 2, 1, 1)], [w(.28, 1, 0, 1)], [w(.28, 2, 1, -1)]),
	play$2(14, "Read two", "identify", "How many full waves is that? Set the frequency. Amplitude and phase are already right.", [], [w(.4, 1, .3)], [w(.4, 2, .3)], [{ freq: false }]),
	play$2(15, "Read four", "identify", "Count crests, then set frequency. Wavelength will follow.", [], [w(.32, 1, 0)], [w(.32, 4, 0)], [{ freq: false }]),
	play$2(16, "Read five", "identify", "The ghost is the answer. Dial frequency until your curve hides it.", [], [w(.36, 2, .5)], [w(.36, 5, .5)], [{ freq: false }])
];
function play$2(id, title, kind, blurb, fixed, start, solution, locks) {
	return {
		id,
		title,
		kind,
		blurb,
		fixed,
		start,
		solution,
		locks: locks ?? start.map(() => ({}))
	};
}
function dirOf(wave) {
	return wave.dir === -1 ? -1 : 1;
}
function angDiff(a, b) {
	return Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
}
function maxCurveGap(left, right, times = [
	0,
	.7,
	1.4
]) {
	let gap = 0;
	for (const time of times) for (let i = 0; i <= 32; i++) {
		const x = i / 32;
		gap = Math.max(gap, Math.abs(curveY(x, left, time) - curveY(x, right, time)));
	}
	return gap;
}
function flatGap(waves) {
	let gap = 0;
	for (const time of [
		0,
		.6,
		1.3
	]) for (let i = 0; i <= 32; i++) gap = Math.max(gap, Math.abs(curveY(i / 32, waves, time) - .5));
	return gap;
}
function standingError(forward, back) {
	let gap = 0;
	for (const time of [.4, 1.1]) for (let i = 0; i <= 24; i++) {
		const x = i / 24;
		const sum = forward.amp * Math.sin(forward.freq * x * Math.PI * 2 + forward.phase + time) + back.amp * Math.sin(back.freq * x * Math.PI * 2 + back.phase - time);
		const analytic = 2 * forward.amp * Math.sin(forward.freq * x * Math.PI * 2 + forward.phase) * Math.cos(time);
		gap = Math.max(gap, Math.abs(sum - analytic));
	}
	return gap;
}
function judgeWave(level, player) {
	const fail = (detail) => ({
		ok: false,
		score: 0,
		detail
	});
	if (player.length !== level.solution.length) return fail("The bench is missing a wave.");
	if (level.kind === "match" || level.kind === "identify") {
		const gap = maxCurveGap(player, level.solution);
		const freq = player[0]?.freq ?? 0;
		if (level.kind === "identify" && Math.abs(freq - level.solution[0].freq) > .05) return fail(`Frequency is ${freq.toFixed(2)}. Keep counting crests.`);
		if (gap > .03) return fail("Not on the ghost yet.");
		return {
			ok: true,
			score: 140,
			detail: level.kind === "identify" ? `Frequency ${level.solution[0].freq}.` : "The curves match."
		};
	}
	if (level.kind === "cancel") {
		if (flatGap([...level.fixed, ...player]) > .035) return fail("The sum still swings. Match size and frequency, then oppose the phase.");
		return {
			ok: true,
			score: 150,
			detail: "The waves cancel. The sum stays on the axis."
		};
	}
	if (level.kind === "construct") {
		const [a, b] = player;
		if (!a || !b) return fail("Two waves.");
		if (Math.abs(a.freq - b.freq) > .05) return fail("Frequencies still disagree.");
		if (angDiff(a.phase, b.phase) > .28) return fail("Phases are still apart.");
		if (a.amp < .18 || b.amp < .18) return fail("Both waves need height.");
		if (Math.max(...[
			0,
			1,
			2,
			3
		].map((i) => Math.abs(curveY(i / 8, player, 0) - .5))) < Math.abs(curveY(.25 / a.freq, [a], 0) - .5) + .04) return fail("The sum is not taller than one wave.");
		return {
			ok: true,
			score: 160,
			detail: "Crests meet. The sum is taller than either wave."
		};
	}
	const partner = player[0];
	const source = level.fixed[0];
	if (!partner || !source) return fail("Need the opposing wave.");
	if (dirOf(partner) === dirOf(source)) return fail("One wave has to travel backward.");
	if (Math.abs(partner.amp - source.amp) > .04) return fail("Amplitudes differ.");
	if (Math.abs(partner.freq - source.freq) > .05) return fail("Wavelengths differ.");
	if (angDiff(partner.phase, source.phase) > .3) return fail("Phases still disagree, so the pattern slides.");
	if (standingError(dirOf(source) === 1 ? source : partner, dirOf(source) === 1 ? partner : source) > .08) return fail("That is not a standing pattern yet.");
	return {
		ok: true,
		score: 170,
		detail: "Opposite travel, matched phase. The envelope stays put."
	};
}
var SUBJECTS = [
	"NUMBER",
	"ALGEBRA",
	"GEOMETRY",
	"LOGIC",
	"PHYSICS",
	"PATTERNS",
	"PROBABILITY",
	"ADVANCED"
];
var BANDS = [
	"Explorer",
	"Builder",
	"Solver",
	"Researcher"
];
var CABINETS = [
	{
		id: "bubbles",
		title: "Bubble Proof",
		kicker: "Flagship",
		blurb: "Aim an equation. Pop every orb that shares its value.",
		band: "Solver",
		subjects: [
			"ALGEBRA",
			"GEOMETRY",
			"PHYSICS"
		],
		levels: CAMPAIGN_LEVELS,
		flagship: true
	},
	{
		id: "symbols",
		title: "Symbol Match",
		kicker: "Lattice",
		blurb: "Swap glyphs until the proof target falls.",
		band: "Builder",
		subjects: ["PATTERNS", "PHYSICS"],
		levels: STAGE_COUNT,
		flagship: false
	},
	{
		id: "equals",
		title: "Equals",
		kicker: "Same value",
		blurb: "Different spellings of one number. Leave the lookalikes.",
		band: "Builder",
		subjects: ["ALGEBRA", "NUMBER"],
		levels: EQUALS_LEVELS.length,
		flagship: false
	},
	{
		id: "run",
		title: "Sequence",
		kicker: "Next term",
		blurb: "Read the rule, then name the missing term.",
		band: "Explorer",
		subjects: ["PATTERNS", "NUMBER"],
		levels: RUN_LEVELS.length,
		flagship: false
	},
	{
		id: "logic",
		title: "Therefore",
		kicker: "Logic",
		blurb: "Read the premises. Say whether the claim must follow.",
		band: "Researcher",
		subjects: ["LOGIC"],
		levels: LOGIC_LEVELS.length,
		flagship: false
	},
	{
		id: "odds",
		title: "Odds",
		kicker: "Chance",
		blurb: "Count the beads, coins, and faces. Pick the matching chance.",
		band: "Builder",
		subjects: ["PROBABILITY", "NUMBER"],
		levels: ODDS_LEVELS.length,
		flagship: false
	},
	{
		id: "slope",
		title: "Slope",
		kicker: "Rise over run",
		blurb: "Move the free point. Rise, run, and slope change together until the line is the one you were asked for.",
		band: "Researcher",
		subjects: ["ADVANCED", "ALGEBRA"],
		levels: SLOPE_LEVELS.length,
		flagship: false
	},
	{
		id: "fractions",
		title: "Fraction Forge",
		kicker: "Build the bar",
		blurb: "Place, split, and join pieces until the bar is the amount you were asked for.",
		band: "Explorer",
		subjects: ["NUMBER"],
		levels: FRACTION_LEVELS.length,
		flagship: false
	},
	{
		id: "primes",
		title: "Primes",
		kicker: "Sieve",
		blurb: "Pop every prime. Leave 1, the squares, and the products.",
		band: "Solver",
		subjects: ["NUMBER", "ADVANCED"],
		levels: PRIME_LEVELS.length,
		flagship: false
	},
	{
		id: "vectors",
		title: "Vector Drift",
		kicker: "Play the cards",
		blurb: "Burn a vector card. Watch position, the card you played, and the resultant.",
		band: "Solver",
		subjects: ["PHYSICS", "GEOMETRY"],
		levels: VECTOR_LEVELS.length,
		flagship: false
	},
	{
		id: "angles",
		title: "Angles",
		kicker: "The corner",
		blurb: "A right angle, a straight line, or a triangle. Name the blank degree.",
		band: "Researcher",
		subjects: ["GEOMETRY"],
		levels: ANGLE_LEVELS.length,
		flagship: false
	},
	{
		id: "machine",
		title: "Machine",
		kicker: "In, then out",
		blurb: "A rule changes the number. Name the output, or name the rule.",
		band: "Builder",
		subjects: ["ALGEBRA", "PATTERNS"],
		levels: MACHINE_LEVELS.length,
		flagship: false
	},
	{
		id: "balance",
		title: "Balance Lab",
		kicker: "Both pans",
		blurb: "Subtract or divide on both pans. Keep the beam level until x stands alone.",
		band: "Solver",
		subjects: ["ALGEBRA"],
		levels: BALANCE_LEVELS.length,
		flagship: false
	},
	{
		id: "area",
		title: "Area",
		kicker: "Unit squares",
		blurb: "Grow, square, or cut the block. The area on the bench is the product you just made.",
		band: "Builder",
		subjects: ["GEOMETRY"],
		levels: AREA_LEVELS.length,
		flagship: false
	},
	{
		id: "motion",
		title: "Motion",
		kicker: "Distance, speed, time",
		blurb: "Set speed and time, then launch. The craft stops where the product says it must.",
		band: "Solver",
		subjects: ["PHYSICS"],
		levels: MOTION_LEVELS.length,
		flagship: false
	},
	{
		id: "grid",
		title: "Grid",
		kicker: "Lattice",
		blurb: "Two points on the grid. Name the halfway point, or how far apart they sit.",
		band: "Researcher",
		subjects: ["GEOMETRY", "ADVANCED"],
		levels: GRID_LEVELS.length,
		flagship: false
	},
	{
		id: "waves",
		title: "Wave Lab",
		kicker: "On the bench",
		blurb: "Tune amplitude, frequency, and phase until the curve does what the bench asks.",
		band: "Builder",
		subjects: ["PHYSICS", "PATTERNS"],
		levels: WAVE_PLAYS.length,
		flagship: false
	},
	{
		id: "orbit",
		title: "Orbit",
		kicker: "One mass",
		blurb: "Launch by position, direction, and speed. One fixed mass. Inverse-square. No drag.",
		band: "Researcher",
		subjects: ["PHYSICS"],
		levels: ORBIT_PLAYS.length,
		flagship: false
	}
];
function masteryPercent(cleared, levels) {
	if (levels <= 0) return 0;
	return Math.round(Math.max(0, Math.min(Math.floor(cleared), levels)) / levels * 100);
}
function highestLevel(cleared, levels) {
	return Math.max(0, Math.min(Math.floor(cleared), levels));
}
function isUntouched(track) {
	return track.best <= 0 && track.cleared <= 0 && track.lastPlayed <= 0 && track.scores.every((score) => score <= 0);
}
function filterCabinets(subject, band, cabinets = CABINETS) {
	return cabinets.filter((cabinet) => {
		const subjectOk = subject === "ALL" || cabinet.subjects.includes(subject);
		const bandOk = band === "ALL" || cabinet.band === band;
		return subjectOk && bandOk;
	});
}
function formatLastPlayed(ts, now = Date.now()) {
	if (!ts || ts <= 0) return "Never";
	const day = 864e5;
	const start = (value) => {
		const date = new Date(value);
		return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
	};
	const diff = Math.round((start(now) - start(ts)) / day);
	if (diff <= 0) return "Today";
	if (diff === 1) return "Yesterday";
	return new Date(ts).toLocaleDateString(void 0, {
		month: "short",
		day: "numeric"
	});
}
function proofsCleared(tracks, cabinets = CABINETS) {
	return cabinets.reduce((sum, cabinet) => sum + highestLevel(tracks[cabinet.id].cleared, cabinet.levels), 0);
}
function Preview({ id }) {
	if (id === "bubbles") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-full items-end justify-center gap-3 pb-3",
		"aria-hidden": "true",
		children: [
			["2²", "0ms"],
			["√16", "180ms"],
			["8÷2", "320ms"]
		].map(([label, delay]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "cabinet-bob grid size-14 place-items-center rounded-full border border-gold/60 bg-panel font-mono text-xs text-cream shadow-[inset_0_-8px_12px_rgba(0,0,0,0.35)]",
			style: { animationDelay: delay },
			children: label
		}, label))
	});
	if (id === "symbols") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full items-center justify-center gap-4 font-mono text-3xl",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "cabinet-drift text-gold",
				style: { animationDelay: "0ms" },
				children: "π"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "cabinet-drift text-gold",
				style: { animationDelay: "160ms" },
				children: "Σ"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "cabinet-drift text-mint",
				style: { animationDelay: "320ms" },
				children: "λ"
			})
		]
	});
	if (id === "equals") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full items-center justify-center gap-2 px-4",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "rounded-lg border border-line bg-ink px-2 py-2 font-mono text-sm text-mist",
				children: "3²"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "cabinet-pulse rounded-lg border border-gold bg-ink px-2 py-2 font-mono text-sm text-gold",
				children: "√16"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-xs text-mist",
				children: "= 4"
			})
		]
	});
	if (id === "logic") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col items-center justify-center gap-1 px-4 font-mono",
		"aria-hidden": "true",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs text-mist",
			children: "if rain, then wet"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-lg text-gold",
			children: "∴ wet"
		})]
	});
	if (id === "odds") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full items-center justify-center gap-2",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-8 rounded-full border border-gold bg-gold" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-8 rounded-full border border-gold bg-gold" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-8 rounded-full border border-mist bg-mist" })
		]
	});
	if (id === "slope") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col items-center justify-center font-mono",
		"aria-hidden": "true",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs text-mist",
			children: "rise 2 / run 1"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-lg text-gold",
			children: "2"
		})]
	});
	if (id === "fractions") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-full items-center justify-center px-8",
		"aria-hidden": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex h-6 w-full overflow-hidden rounded-md border border-line",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "w-1/2 bg-gold" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "w-1/4 border-l border-line bg-gold" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "w-1/4 border-l border-line bg-ink" })
			]
		})
	});
	if (id === "primes") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full items-center justify-center gap-3 font-mono text-xl",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-gold",
				children: "2"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-gold",
				children: "3"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-mist",
				children: "4"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-gold",
				children: "5"
			})
		]
	});
	if (id === "vectors") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full items-center justify-center gap-3 font-mono",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-gold",
				children: "(2, 1)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-mist",
				children: "+"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-mint",
				children: "(1, 2)"
			})
		]
	});
	if (id === "angles") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full items-center justify-center gap-3 font-mono",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-gold",
				children: "35°"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-mist",
				children: "+"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-mint",
				children: "55°"
			})
		]
	});
	if (id === "machine") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full items-center justify-center gap-2 font-mono",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid size-10 place-items-center rounded-full border border-line text-cream",
				children: "4"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-gold",
				children: "× 2"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid size-10 place-items-center rounded-full border border-mint text-mint",
				children: "8"
			})
		]
	});
	if (id === "balance") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full items-center justify-center gap-3 font-mono",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-gold",
				children: "x + 3"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-mist",
				children: "="
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-mint",
				children: "10"
			})
		]
	});
	if (id === "area") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full items-end justify-center gap-2 pb-6",
		"aria-hidden": "true",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-10 w-14 border border-gold bg-gold/40" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-6 w-8 border border-gold bg-gold/40" })]
	});
	if (id === "motion") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full items-center justify-center gap-3 font-mono",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-cream",
				children: "12 m"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-mist",
				children: "·"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-gold",
				children: "4 m/s"
			})
		]
	});
	if (id === "grid") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full items-center justify-center gap-3 font-mono",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-gold",
				children: "(0, 0)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-mist",
				children: "to"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-mint",
				children: "(4, 2)"
			})
		]
	});
	if (id === "waves") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 120 48",
		className: "h-full w-full",
		"aria-hidden": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M4 28 C 14 8, 26 8, 34 28 S 54 48, 64 28 S 84 8, 94 28 S 114 48, 124 28",
			className: "text-gold",
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "2"
		})
	});
	if (id === "orbit") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 120 48",
		className: "h-full w-full",
		"aria-hidden": "true",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "60",
			cy: "24",
			r: "3",
			className: "text-gold",
			fill: "currentColor"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
			cx: "60",
			cy: "24",
			rx: "28",
			ry: "12",
			className: "text-mint",
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "1.5"
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full items-center justify-center gap-2 font-mono text-lg text-cream",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "1" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "1" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "2" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "3" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "5" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "cabinet-pulse text-gold",
				children: "?"
			})
		]
	});
}
function CabinetCard({ cabinet, progress, onPlay }) {
	const track = progress.tracks[cabinet.id];
	const mastery = masteryPercent(track.cleared, cabinet.levels);
	const level = highestLevel(track.cleared, cabinet.levels);
	const fresh = isUntouched(track);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: () => onPlay(cabinet.id),
		className: "group flex min-h-44 flex-col overflow-hidden rounded-2xl border border-line bg-panel text-left transition-transform duration-150 ease-out active:scale-[0.96]",
		"aria-label": `${cabinet.title}, ${cabinet.band}, best ${track.best}, level ${level} of ${cabinet.levels}, mastery ${mastery} percent${fresh ? ", new" : ""}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative h-28 border-b border-line bg-ink",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "lab-grid absolute inset-0" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Preview, { id: cabinet.id }),
				fresh ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "absolute top-2 right-2 rounded-full border border-gold/70 bg-ink px-2 py-1 font-mono text-xs tracking-widest text-gold",
					children: "NEW"
				}) : null
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-1 flex-col gap-3 p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs tracking-widest text-gold",
						children: cabinet.kicker
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-1 text-xl font-extrabold tracking-tight",
						children: cabinet.title
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-full border border-line px-2 py-1 font-mono text-xs text-mist",
						children: cabinet.band
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm leading-relaxed text-mist",
					children: cabinet.blurb
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-1",
					children: cabinet.subjects.map((subject) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-full bg-ink px-2 py-1 font-mono text-xs tracking-wide text-cream",
						children: subject
					}, subject))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-1 flex justify-between font-mono text-xs text-mist",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						"mastery ",
						mastery,
						"%"
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						"level ",
						level,
						"/",
						cabinet.levels
					] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-1.5 overflow-hidden rounded-full bg-ink",
					"aria-hidden": "true",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-full bg-gold",
						style: { width: `${mastery}%` }
					})
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-auto flex justify-between font-mono text-xs text-mist",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["best ", track.best > 0 ? track.best : "—"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["played ", formatLastPlayed(track.lastPlayed)] })]
				})
			]
		})]
	});
}
function Lobby({ progress, onPlay, onLab }) {
	const [subject, setSubject] = (0, import_react.useState)("ALL");
	const [band, setBand] = (0, import_react.useState)("ALL");
	const visible = (0, import_react.useMemo)(() => filterCabinets(subject, band), [subject, band]);
	const cleared = proofsCleared(progress.tracks);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative flex h-dvh flex-col overflow-hidden bg-ink text-cream",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-0 lab-grid opacity-60",
				"aria-hidden": "true"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "lobby-header relative z-10 shrink-0 border-b border-line px-4 py-4 sm:px-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "lobby-kicker font-mono text-xs tracking-widest text-gold",
						children: "LABORATORY FLOOR"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex flex-wrap items-end justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "lobby-title text-4xl font-extrabold tracking-tight sm:text-5xl",
							children: "Proof Arcade"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-mono text-xs text-mist",
							children: [
								CABINETS.length,
								" stations · ",
								cleared,
								" proofs cleared"
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex flex-wrap items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "lobby-motto max-w-xl text-sm leading-relaxed text-mist",
							children: "Same object. Different spelling. Pick a station and play."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: onLab,
							className: "inline-flex min-h-11 items-center font-mono text-xs tracking-widest text-gold",
							children: "Instrument lab"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex gap-2 overflow-x-auto pb-1",
						role: "group",
						"aria-label": "Filter by subject",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChip, {
							pressed: subject === "ALL",
							onClick: () => setSubject("ALL"),
							children: "ALL"
						}), SUBJECTS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChip, {
							pressed: subject === item,
							onClick: () => setSubject(item),
							children: item
						}, item))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex gap-2 overflow-x-auto pb-1",
						role: "group",
						"aria-label": "Filter by difficulty",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChip, {
							pressed: band === "ALL",
							onClick: () => setBand("ALL"),
							children: "Any band"
						}), BANDS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChip, {
							pressed: band === item,
							onClick: () => setBand(item),
							children: item
						}, item))]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "sr-only",
					"aria-live": "polite",
					children: [visible.length, " stations shown"]
				}), visible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-md rounded-2xl border border-line bg-panel p-6 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs tracking-widest text-gold",
							children: "EMPTY BENCH"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-2 text-2xl font-extrabold",
							children: "Nothing on this bench yet."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-mist",
							children: "No station wears both of those labels. Every subject is on the floor. Clear a filter to see it."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								setSubject("ALL");
								setBand("ALL");
							},
							className: "mt-4 min-h-11 rounded-full bg-gold px-4 text-sm font-extrabold text-ink",
							children: "Show every station"
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto grid max-w-5xl grid-cols-1 gap-3 sm:grid-cols-2",
					children: visible.map((cabinet) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CabinetCard, {
						cabinet,
						progress,
						onPlay
					}, cabinet.id))
				})]
			})
		]
	});
}
function FilterChip({ pressed, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-pressed": pressed,
		onClick,
		className: pressed ? "min-h-11 shrink-0 rounded-full bg-gold px-3 text-xs font-extrabold text-ink" : "min-h-11 shrink-0 rounded-full border border-line bg-panel px-3 text-xs font-bold text-mist",
		children
	});
}
function MachineFigure({ prompt }) {
	const { scene } = prompt;
	const output = applyRule(scene.rule, scene.input);
	const ruleLabel = scene.mode === "out" ? formatRule(scene.rule) : "?";
	const outLabel = scene.mode === "out" ? "?" : String(output);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-sm items-center justify-center gap-2",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid size-14 place-items-center rounded-full border border-line bg-ink font-mono text-lg text-cream",
				children: scene.input
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-mist",
				children: "→"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid h-16 min-w-24 place-items-center rounded-xl border border-gold bg-ink px-3 text-center font-mono text-sm text-gold",
				children: ruleLabel
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-mist",
				children: "→"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid size-14 place-items-center rounded-full border border-mint bg-ink font-mono text-lg text-mint",
				children: outLabel
			})
		]
	});
}
function MachineProof({ active = true, onExit }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoundProof, {
		active,
		onExit,
		track: "machine",
		mark: "ƒ",
		title: "Machine",
		menuKicker: "ALGEBRA",
		menuTitle: "Feed the machine.",
		menuBody: "A rule changes the number that goes in. Name what comes out, or name the hidden rule. Keys 1 to 4. A miss costs a heart. Sixteen levels.",
		levels: MACHINE_LEVELS,
		audit: auditMachine,
		renderScene: (prompt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MachineFigure, { prompt })
	});
}
var TRIP_LAW = "Distance = speed × time. The ghost mark is that product. The craft follows it when you launch. No drag, no head start.";
function play$1(id, title, aim, blurb, flag, startSpeed, startTime, solutionSpeed, solutionTime, speed = 0, time = 0, maxSpeed = 8, maxTime = 8) {
	return {
		id,
		title,
		aim,
		blurb,
		flag,
		startSpeed,
		startTime,
		speed,
		time,
		maxSpeed,
		maxTime,
		solutionSpeed,
		solutionTime,
		track: flag + 6
	};
}
var TRIP_PLAYS = [
	play$1(1, "Land on 6", "either", "Speed and time are both yours. Their product has to be 6 m.", 6, 1, 1, 2, 3),
	play$1(2, "A longer product", "either", "The flag is at 8 m. Change either dial.", 8, 2, 2, 2, 4),
	play$1(3, "Twelve meters", "either", "More than one pair lands on 12. Any honest pair counts.", 12, 1, 2, 3, 4),
	play$1(4, "Three seconds", "speed", "The clock is locked at 3 s. Choose the speed that reaches 9 m.", 9, 1, 3, 3, 3, 0, 3),
	play$1(5, "Four seconds", "speed", "Time stays 4 s. The flag is at 12 m.", 12, 1, 4, 3, 4, 0, 4),
	play$1(6, "Five seconds", "speed", "A longer clock, a nearer flag. Time is 5 s. The flag is 10 m.", 10, 1, 5, 2, 5, 0, 5),
	play$1(7, "Speed stays 4", "time", "You cannot change the speed. Choose how long the trip runs.", 12, 4, 1, 4, 3, 4, 0),
	play$1(8, "Speed stays 3", "time", "3 m each second. The flag is 15 m away.", 15, 3, 1, 3, 5, 3, 0),
	play$1(9, "Speed stays 2", "time", "A slow craft. Give it enough seconds to reach 8 m.", 8, 2, 1, 2, 4, 2, 0),
	play$1(10, "No faster than 4", "either", "The flag is at 16 m, and speed cannot pass 4.", 16, 1, 1, 4, 4, 0, 0, 4, 8),
	play$1(11, "No faster than 6", "either", "18 m, with speed capped at 6.", 18, 2, 2, 6, 3, 0, 0, 6, 8),
	play$1(12, "Six seconds", "speed", "The clock is 6 s. Reach 18 m.", 18, 1, 6, 3, 6, 0, 6),
	play$1(13, "Speed stays 5", "time", "5 m each second. The flag is at 20 m.", 20, 5, 2, 5, 4, 5, 0),
	play$1(14, "Twenty-four", "either", "The flag is far. Both dials are free.", 24, 3, 3, 4, 6),
	play$1(15, "A short clock", "speed", "Only 2 s. The flag is still 14 m out.", 14, 3, 2, 7, 2, 0, 2),
	play$1(16, "Speed stays 6", "time", "6 m each second. How many seconds reach 24 m?", 24, 6, 1, 6, 4, 6, 0)
];
function tripDistance(speed, time) {
	return speed * time;
}
function tripSolved(play, speed, time) {
	if (!Number.isInteger(speed) || !Number.isInteger(time)) return false;
	if (speed < 1 || time < 1 || speed > play.maxSpeed || time > play.maxTime) return false;
	if (play.aim === "speed" && time !== play.time) return false;
	if (play.aim === "time" && speed !== play.speed) return false;
	return speed * time === play.flag;
}
function useCruise(distance, token) {
	const [pos, setPos] = (0, import_react.useState)(0);
	const [done, setDone] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (token === 0) {
			setPos(0);
			setDone(false);
			return;
		}
		if (prefersReducedMotion()) {
			setPos(distance);
			setDone(true);
			return;
		}
		const started = performance.now();
		let raf = 0;
		const loop = (now) => {
			const u = Math.min(1, (now - started) / 800);
			setPos(distance * u);
			if (u < 1) raf = requestAnimationFrame(loop);
			else {
				setPos(distance);
				setDone(true);
			}
		};
		raf = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(raf);
	}, [token, distance]);
	return {
		pos,
		done
	};
}
function Track({ play, speed, time, pos }) {
	const product = tripDistance(speed, time);
	const xOf = (meters) => 28 + Math.max(0, Math.min(play.track, meters)) / play.track * 264;
	const ghost = xOf(product);
	const craft = xOf(pos);
	const flag = xOf(play.flag);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 320 96",
		className: "h-28 w-full",
		role: "img",
		"aria-label": `Craft at ${pos.toFixed(1)} meters, flag at ${play.flag} meters`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: "28",
				y1: "58",
				x2: "292",
				y2: "58",
				className: "text-line",
				stroke: "currentColor",
				strokeWidth: "3"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: flag,
				y1: "36",
				x2: flag,
				y2: "70",
				className: "text-mint",
				stroke: "currentColor",
				strokeWidth: "2"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: flag,
				cy: "32",
				r: "4",
				className: "text-mint",
				fill: "currentColor"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: ghost,
				cy: "58",
				r: "5",
				className: "text-mist",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: craft,
				cy: "58",
				r: "7",
				className: "text-gold",
				fill: "currentColor"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: "28",
				y: "86",
				fontSize: "11",
				className: "fill-current font-mono text-mist",
				children: "0"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
				x: flag,
				y: "18",
				textAnchor: "middle",
				fontSize: "11",
				className: "fill-current font-mono text-mint",
				children: [play.flag, " m"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: "292",
				y: "86",
				textAnchor: "end",
				fontSize: "11",
				className: "fill-current font-mono text-mist",
				children: play.track
			})
		]
	});
}
function Stepper({ label, value, max, locked, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `flex items-center justify-between gap-3 rounded-xl border border-line bg-panel px-3 py-2 ${locked ? "opacity-50" : ""}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-mono text-xs tracking-widest text-mist",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": `Decrease ${label}`,
					disabled: locked || value <= 1,
					onClick: () => onChange(value - 1),
					className: "min-h-11 min-w-11 rounded-full border border-line text-lg text-cream disabled:opacity-40",
					children: "−"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "w-8 text-center font-mono text-cream",
					children: value
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": `Increase ${label}`,
					disabled: locked || value >= max,
					onClick: () => onChange(value + 1),
					className: "min-h-11 min-w-11 rounded-full border border-line text-lg text-cream disabled:opacity-40",
					children: "+"
				})
			]
		})]
	});
}
function MotionRun({ onExit, onQuestions }) {
	const [levelId, setLevelId] = (0, import_react.useState)(1);
	const level = TRIP_PLAYS[levelId - 1] ?? TRIP_PLAYS[0];
	const [speed, setSpeed] = (0, import_react.useState)(level.startSpeed);
	const [time, setTime] = (0, import_react.useState)(level.startTime);
	const [token, setToken] = (0, import_react.useState)(0);
	const [armed, setArmed] = (0, import_react.useState)(level.id);
	const [run, setRun] = (0, import_react.useState)(0);
	const scored = (0, import_react.useRef)(false);
	const product = tripDistance(speed, time);
	const { pos, done } = useCruise(token === 0 ? 0 : product, token);
	const solved = armed === level.id && done && tripSolved(level, speed, time);
	(0, import_react.useEffect)(() => {
		scored.current = false;
		setSpeed(level.startSpeed);
		setTime(level.startTime);
		setToken(0);
		setArmed(level.id);
	}, [level]);
	(0, import_react.useEffect)(() => {
		if (!solved || scored.current) return;
		scored.current = true;
		const score = 100;
		setRun((total) => {
			const next = total + score;
			noteClear("motion", level.id, score, next);
			return next;
		});
	}, [solved, level.id]);
	function retune(nextSpeed, nextTime) {
		setSpeed(nextSpeed);
		setTime(nextTime);
		setToken(0);
	}
	let status = "The ghost is where this speed and time would stop. Launch to run it.";
	if (token > 0 && !done) status = "The craft is covering the product.";
	else if (done && solved) status = "The craft stopped on the flag.";
	else if (done && product < level.flag) status = `Short of the flag. ${product} m is not ${level.flag} m.`;
	else if (done && product > level.flag) status = `Past the flag. ${product} m is not ${level.flag} m.`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BenchFrame, {
		kicker: "MOTION",
		title: level.title,
		meta: `${level.id}/16`,
		onExit,
		onQuestions,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LevelStrip, {
				count: TRIP_PLAYS.length,
				current: level.id,
				onPick: setLevelId
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-mist",
				children: level.blurb
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 overflow-hidden rounded-2xl border border-line bg-ink",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Track, {
					play: level,
					speed,
					time,
					pos: token === 0 ? 0 : pos
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-center font-mono text-lg text-cream",
				children: [
					speed,
					" m/s × ",
					time,
					" s = ",
					product,
					" m"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid gap-2 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stepper, {
					label: "Speed",
					value: speed,
					max: level.maxSpeed,
					locked: level.aim === "time",
					onChange: (next) => retune(next, time)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stepper, {
					label: "Time",
					value: time,
					max: level.maxTime,
					locked: level.aim === "speed",
					onChange: (next) => retune(speed, next)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm leading-relaxed text-cream",
				children: TRIP_LAW
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 font-mono text-sm text-gold",
				"aria-live": "polite",
				children: status
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setToken((current) => current + 1),
						className: "min-h-11 rounded-full bg-gold px-4 text-sm font-extrabold text-ink",
						children: "Launch"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => {
							scored.current = solved;
							retune(level.startSpeed, level.startTime);
						},
						className: "min-h-11 rounded-full border border-line px-4 text-sm text-cream",
						children: "Reset"
					}),
					solved && level.id < TRIP_PLAYS.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setLevelId(level.id + 1),
						className: "min-h-11 rounded-full border border-gold px-4 text-sm font-extrabold text-gold",
						children: "Next"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "self-center font-mono text-xs text-mist",
						children: ["Run ", run]
					})
				]
			})
		]
	});
}
function MotionFigure({ prompt }) {
	const [left, right] = motionGivens(prompt.scene);
	const unknown = prompt.scene.kind === "speed" ? "m/s" : prompt.scene.kind === "distance" ? "m" : "s";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 220 72",
		className: "mx-auto h-24 w-full max-w-xs",
		role: "img",
		"aria-label": `Trip givens ${left} and ${right}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: "24",
				y1: "36",
				x2: "196",
				y2: "36",
				className: "text-line",
				stroke: "currentColor",
				strokeWidth: "3"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "36",
				cy: "36",
				r: "7",
				className: "text-cream",
				fill: "currentColor"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "184",
				cy: "36",
				r: "7",
				className: "text-gold",
				fill: "currentColor"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: "110",
				y: "22",
				textAnchor: "middle",
				fontSize: "12",
				className: "fill-current font-mono text-gold",
				children: unknown
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "text-center font-mono text-sm text-cream",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: left }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-mist",
				children: " · "
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: right }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-mist",
				children: " · "
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-gold",
				children: "?"
			})
		]
	})] });
}
function MotionProof({ active = true, onExit }) {
	const [mode, setMode] = (0, import_react.useState)("run");
	if (mode === "questions") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative h-dvh",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoundProof, {
			active,
			onExit,
			track: "motion",
			mark: "v",
			title: "Motion",
			menuKicker: "PHYSICS",
			menuTitle: "Read the trip.",
			menuBody: "Distance, speed, and time stay in step. Two are given. Name the third. Keys 1 to 4. A miss costs a heart. Sixteen levels.",
			levels: MOTION_LEVELS,
			audit: auditMotion,
			renderScene: (prompt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MotionFigure, { prompt })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuestionsChip, {
			label: "Bench",
			onClick: () => setMode("run")
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MotionRun, {
		onExit,
		onQuestions: () => setMode("questions")
	});
}
var HEARTS$3 = 3;
function shuffle$3(list) {
	const next = [...list];
	for (let i = next.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		const swap = next[i];
		next[i] = next[j];
		next[j] = swap;
	}
	return next;
}
function beadClass(bead, dim) {
	return `size-6 rounded-full border ${bead === "gold" ? "border-gold bg-gold" : bead === "mint" ? "border-mint bg-mint" : "border-mist bg-mist"} ${dim ? "opacity-30" : ""}`;
}
function Jar({ beads, gone = -1 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mx-auto flex min-h-24 w-full max-w-xs flex-wrap content-center justify-center gap-2 rounded-2xl border border-line bg-ink px-3 py-3",
		children: beads.map((bead, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: beadClass(bead, index === gone) }, `${bead}-${index}`))
	});
}
function Scene({ model }) {
	if (model.type === "bag" || model.type === "bag-not") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Jar, { beads: model.beads });
	if (model.type === "after") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Jar, {
		beads: model.beads,
		gone: model.beads.indexOf(model.take)
	});
	if (model.type === "compare") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid grid-cols-2 gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-1 text-center font-mono text-xs text-mist",
			children: "Left"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Jar, { beads: model.left })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-1 text-center font-mono text-xs text-mist",
			children: "Right"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Jar, { beads: model.right })] })]
	});
	if (model.type === "die") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mx-auto grid w-full max-w-xs grid-cols-6 gap-1",
		children: [
			1,
			2,
			3,
			4,
			5,
			6
		].map((face) => {
			const on = model.faces.includes(face);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: `grid h-12 place-items-center rounded-lg border font-mono text-sm ${on ? "border-gold bg-gold text-ink" : "border-line bg-ink text-mist"}`,
				children: face
			}, face);
		})
	});
	if (model.type === "sum") {
		const pairs = sumPairs(model.total);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto flex max-w-xs flex-wrap justify-center gap-2",
			children: pairs.map((pair) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "rounded-lg border border-gold/60 bg-ink px-2 py-2 font-mono text-sm text-gold",
				children: pair
			}, pair))
		});
	}
	if (model.type === "and") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-center gap-3 font-mono text-3xl text-cream",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: model.a }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-gold",
				children: "×"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: model.b })
		]
	});
	const count = model.type === "fixed" ? 1 : model.n;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center gap-2",
		children: [model.type === "fixed" && model.streak ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-mono text-sm tracking-widest text-mist",
			children: Array.from({ length: model.streak }, () => "H").join(" ")
		}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex justify-center gap-2",
			children: Array.from({ length: count }, (_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid size-12 place-items-center rounded-full border border-gold bg-panel font-mono text-sm text-gold",
				children: "?"
			}, index))
		})]
	});
}
function OddsProof({ active = true, onExit }) {
	const [phase, setPhase] = (0, import_react.useState)("menu");
	const [level, setLevel] = (0, import_react.useState)(1);
	const [promptIndex, setPromptIndex] = (0, import_react.useState)(0);
	const [choices, setChoices] = (0, import_react.useState)([]);
	const [hearts, setHearts] = (0, import_react.useState)(HEARTS$3);
	const [score, setScore] = (0, import_react.useState)(0);
	const [levelScore, setLevelScore] = (0, import_react.useState)(0);
	const [blurb, setBlurb] = (0, import_react.useState)("Count the ways. Pick the chance.");
	const [bonus, setBonus] = (0, import_react.useState)(0);
	const [track, setTrack] = (0, import_react.useState)({
		best: 0,
		cleared: 0,
		scores: [],
		lastPlayed: 0
	});
	const [mute, setMute] = (0, import_react.useState)(false);
	const [picked, setPicked] = (0, import_react.useState)(null);
	const [shake, setShake] = (0, import_react.useState)(false);
	const phaseRef = (0, import_react.useRef)(phase);
	const activeRef = (0, import_react.useRef)(active);
	const lockRef = (0, import_react.useRef)(false);
	const scoreRef = (0, import_react.useRef)(0);
	const levelScoreRef = (0, import_react.useRef)(0);
	const heartsRef = (0, import_react.useRef)(HEARTS$3);
	const levelRef = (0, import_react.useRef)(1);
	const promptRef = (0, import_react.useRef)(0);
	const missesRef = (0, import_react.useRef)(0);
	const startedRef = (0, import_react.useRef)(0);
	const muteRef = (0, import_react.useRef)(false);
	const choicesRef = (0, import_react.useRef)([]);
	const mounted = (0, import_react.useRef)(true);
	phaseRef.current = phase;
	activeRef.current = active;
	muteRef.current = mute;
	choicesRef.current = choices;
	const showPrompt = (nextLevel, index) => {
		const prompt = ODDS_LEVELS[nextLevel - 1]?.prompts[index];
		if (!prompt) return;
		const nextChoices = shuffle$3(prompt.choices);
		choicesRef.current = nextChoices;
		setChoices(nextChoices);
		setPicked(null);
		setPromptIndex(index);
		promptRef.current = index;
		startedRef.current = performance.now();
		lockRef.current = false;
	};
	const begin = (nextLevel, keepScore) => {
		const spec = ODDS_LEVELS[nextLevel - 1];
		if (!spec) {
			setPhase("done");
			phaseRef.current = "done";
			return;
		}
		levelRef.current = nextLevel;
		setLevel(nextLevel);
		heartsRef.current = HEARTS$3;
		setHearts(HEARTS$3);
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
		playSfx$1("wave");
		if (spec.id >= ODDS_LEVELS.length) {
			setPhase("done");
			phaseRef.current = "done";
			return;
		}
		setPhase("clear");
		phaseRef.current = "clear";
	};
	const chooseRef = (0, import_react.useRef)(() => {});
	chooseRef.current = (choice) => {
		if (lockRef.current || phaseRef.current !== "play") return;
		const spec = ODDS_LEVELS[levelRef.current - 1];
		const prompt = spec?.prompts[promptRef.current];
		if (!prompt) return;
		unlockAudio();
		lockRef.current = true;
		setPicked(choice);
		const elapsed = (performance.now() - startedRef.current) / 1e3;
		if (choice === prompt.answer) {
			const gained = 150 + Math.max(0, Math.round((8 - elapsed) * 8));
			levelScoreRef.current += gained;
			scoreRef.current += gained;
			setLevelScore(levelScoreRef.current);
			setScore(scoreRef.current);
			setBlurb(prompt.blurb);
			playSfx$1("pop");
		} else {
			missesRef.current += 1;
			heartsRef.current -= 1;
			setHearts(heartsRef.current);
			setBlurb(prompt.blurb);
			playSfx$1("over");
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
	(0, import_react.useEffect)(() => {
		mounted.current = true;
		const progress = loadProgress();
		setTrack(progress.tracks.odds);
		const errors = auditOdds();
		if (errors.length) console.error("Odds audit", errors);
		const onVis = () => {
			if (document.visibilityState === "visible") resumeAudio();
		};
		const onKey = (e) => {
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
	(0, import_react.useEffect)(() => {
		if (active) setMuted(muteRef.current);
	}, [active]);
	const spec = ODDS_LEVELS[level - 1] ?? ODDS_LEVELS[0];
	const prompt = spec.prompts[promptIndex] ?? spec.prompts[0];
	const continueLevel = Math.min(ODDS_LEVELS.length, track.cleared + 1);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative flex h-dvh flex-col overflow-hidden bg-ink text-cream",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "flex shrink-0 flex-col gap-2 border-b border-line px-3 py-2 sm:px-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-9 shrink-0 place-items-center rounded-lg border border-gold/50 bg-panel font-mono text-lg text-gold",
							children: "P"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "truncate text-base font-extrabold leading-none tracking-tight sm:text-lg",
								children: "Odds"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 font-mono text-xs text-mist",
								children: phase === "menu" ? "Count the ways" : `Level ${level} / ${ODDS_LEVELS.length}`
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: `text-right ${phase === "menu" ? "max-sm:hidden" : ""}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-mono text-xl leading-none font-semibold text-gold tabular-nums",
									children: score
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-1 font-mono text-xs text-mist tabular-nums",
									children: ["best ", Math.max(track.best, score)]
								})]
							}),
							onExit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArcadeExit, { onExit }) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									unlockAudio();
									const next = !mute;
									setMute(next);
									muteRef.current = next;
									setMuted(next);
								},
								className: "grid size-11 place-items-center rounded-full border border-line bg-panel",
								"aria-label": mute ? "Unmute" : "Mute",
								children: mute ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" })
							}),
							phase === "play" || phase === "pause" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									if (phase === "play" && lockRef.current) return;
									const next = phase === "pause" ? "play" : "pause";
									setPhase(next);
									phaseRef.current = next;
								},
								className: "grid size-11 place-items-center rounded-full border border-line bg-panel",
								"aria-label": phase === "pause" ? "Resume" : "Pause",
								children: phase === "pause" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" })
							}) : null
						]
					})]
				})
			}),
			phase === "menu" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-1 items-center justify-center overflow-y-auto p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-md rounded-2xl border border-line bg-panel/90 p-6 shadow-2xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs tracking-widest text-gold",
							children: "CHANCE"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-2 text-4xl font-extrabold tracking-tight",
							children: "Count the ways."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm leading-relaxed text-mist",
							children: "Bags, coins, and dice. Pick the chance that matches what you see. Keys 1 to 4. A miss costs a heart. Sixteen levels."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-4 font-mono text-xs text-mist",
							children: [
								"Cleared ",
								track.cleared,
								" / ",
								ODDS_LEVELS.length,
								track.best > 0 ? ` · best ${track.best}` : ""
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
								unlockAudio();
								begin(continueLevel, 0);
							},
							className: "mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold text-base font-extrabold text-ink",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), track.cleared > 0 ? `Continue · ${continueLevel}` : "Play"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LevelGrid, {
								count: ODDS_LEVELS.length,
								cleared: track.cleared,
								scores: track.scores,
								onPlay: (n) => {
									unlockAudio();
									begin(n, 0);
								}
							})
						})
					]
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: `flex min-h-0 flex-1 flex-col ${shake ? "lattice-shake" : ""}`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto flex w-full max-w-lg items-end justify-between gap-3 px-3 pt-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-mono text-xs tracking-widest text-mist",
							children: [
								spec.title,
								" · ",
								promptIndex + 1,
								"/",
								spec.prompts.length
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-right",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-mono text-xs text-mist",
								children: ["this level ", levelScore]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 flex justify-end gap-1",
								"aria-label": `${hearts} hearts left`,
								children: Array.from({ length: HEARTS$3 }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, {
									className: i < hearts ? "size-4 text-danger" : "size-4 text-line",
									fill: i < hearts ? "currentColor" : "none"
								}, i))
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mx-auto min-h-0 w-full max-w-lg flex-1 overflow-y-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex min-h-full flex-col justify-center px-3 py-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-center font-mono text-xs tracking-widest text-gold",
									children: prompt.kicker
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scene, { model: prompt.model })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-center text-lg font-extrabold leading-snug tracking-tight",
									children: prompt.ask
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-3 grid grid-cols-2 gap-2",
									children: choices.map((choice, choiceIndex) => {
										const correct = choice === prompt.answer;
										const shown = picked != null;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											disabled: phase !== "play" || shown,
											onClick: () => chooseRef.current(choice),
											className: `flex min-h-16 flex-col items-center justify-center rounded-xl border px-2 ${!shown ? "border-line bg-panel-2" : correct ? "border-gold bg-panel" : picked === choice ? "border-danger bg-panel" : "border-line bg-ink opacity-60"}`,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-mono text-xs text-mist",
												children: choiceIndex + 1
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-mono text-lg text-cream",
												children: choice
											})]
										}, choice);
									})
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"aria-live": "polite",
						className: "mx-auto min-h-12 w-full max-w-lg px-4 pb-3 text-center text-sm leading-relaxed text-mist",
						children: blurb
					})
				]
			}),
			phase === "pause" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Overlay$4, {
				kicker: "Paused",
				title: "The draw can wait.",
				body: "Hearts and score stay put.",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => {
						setPhase("play");
						phaseRef.current = "play";
					},
					className: "flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold font-extrabold text-ink",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), "Resume"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						setTrack(noteScore("odds", scoreRef.current));
						setPhase("menu");
						phaseRef.current = "menu";
					},
					className: "mt-2 min-h-11 w-full rounded-xl border border-line font-bold",
					children: "Menu"
				})]
			}) : null,
			phase === "clear" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overlay$4, {
				kicker: `Level ${level} clear`,
				title: "The count holds.",
				body: `Clear bonus ${bonus}. This level ${levelScore}. Run ${score}.`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => begin(level + 1, scoreRef.current),
					className: "flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold font-extrabold text-ink",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), "Next level"]
				})
			}) : null,
			phase === "done" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overlay$4, {
				kicker: "Book closed",
				title: "Every chance accounted for.",
				body: `Score ${score}. Best ${Math.max(track.best, score)}. Replay any level from the menu.`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						setPhase("menu");
						phaseRef.current = "menu";
					},
					className: "min-h-12 w-full rounded-xl bg-gold font-extrabold text-ink",
					children: "Level select"
				})
			}) : null,
			phase === "over" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Overlay$4, {
				kicker: score >= track.best ? "Best run" : "Out of hearts",
				title: "That count was off.",
				body: `Score ${score} · level ${level}. ${blurb}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => begin(level, 0),
					className: "flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold font-extrabold text-ink",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" }), "Retry level"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						setPhase("menu");
						phaseRef.current = "menu";
					},
					className: "mt-2 min-h-11 w-full rounded-xl border border-line font-bold",
					children: "Menu"
				})]
			}) : null
		]
	});
}
function Overlay$4({ kicker, title, body, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-30 flex items-center justify-center bg-ink/55 p-4 backdrop-blur-sm",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm rounded-2xl border border-line bg-panel p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs tracking-widest text-gold",
					children: kicker
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-2 text-3xl font-extrabold tracking-tight",
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-mist",
					children: body
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5",
					children
				})
			]
		})
	});
}
var SCALE = 36;
function toX(x) {
	return 160 + x * SCALE;
}
function toY(y) {
	return 160 - y * SCALE;
}
function Sky({ launch }) {
	const points = (0, import_react.useMemo)(() => fly(launch), [
		launch.radius,
		launch.angle,
		launch.heading,
		launch.speed
	]).map((body) => `${toX(body.x)},${toY(body.y)}`).join(" ");
	const x = launch.radius * Math.cos(launch.angle);
	const y = launch.radius * Math.sin(launch.angle);
	const hx = x + Math.cos(launch.heading) * launch.speed * .45;
	const hy = y + Math.sin(launch.heading) * launch.speed * .45;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 320 320",
		className: "h-72 w-full",
		role: "img",
		"aria-label": "Orbit prediction around one fixed mass",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "160",
				cy: "160",
				r: .22 * SCALE,
				className: "text-gold",
				fill: "currentColor"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "160",
				cy: "160",
				r: SCALE,
				className: "text-line",
				fill: "none",
				stroke: "currentColor"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "160",
				cy: "160",
				r: 72,
				className: "text-line",
				fill: "none",
				stroke: "currentColor"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", {
				points,
				fill: "none",
				className: "text-mint",
				stroke: "currentColor",
				strokeWidth: "1.6"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: toX(x),
				cy: toY(y),
				r: "5",
				className: "text-cream",
				fill: "currentColor"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: toX(x),
				y1: toY(y),
				x2: toX(hx),
				y2: toY(hy),
				className: "text-gold",
				stroke: "currentColor",
				strokeWidth: "2"
			})
		]
	});
}
function Dial({ label, min, max, step, value, digits, disabled, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: `flex min-h-11 items-center gap-3 text-xs ${disabled ? "opacity-45" : ""}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "w-28 shrink-0 font-mono tracking-widest text-mist",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "range",
				min,
				max,
				step,
				value,
				disabled,
				onChange: (event) => onChange(Number(event.target.value)),
				className: "h-11 min-w-0 flex-1 accent-gold"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "w-14 text-right font-mono text-cream",
				children: value.toFixed(digits)
			})
		]
	});
}
function OrbitProof({ active = true, onExit }) {
	const [levelId, setLevelId] = (0, import_react.useState)(1);
	const play = ORBIT_PLAYS[levelId - 1] ?? ORBIT_PLAYS[0];
	const [launch, setLaunch] = (0, import_react.useState)(play.start);
	const [note, setNote] = (0, import_react.useState)("The dashed rings are radius 1 and 2. The mint trail is the stepper.");
	const [run, setRun] = (0, import_react.useState)(0);
	const scored = (0, import_react.useRef)(false);
	function open(next) {
		scored.current = false;
		setLaunch({ ...next.start });
		setNote("Set the open controls, then launch. The grade is the kind of path, not a hidden number.");
	}
	function pick(id) {
		const next = ORBIT_PLAYS[id - 1];
		if (!next) return;
		setLevelId(id);
		open(next);
	}
	function setField(key, value) {
		if (!orbitEditable(play.locks, key)) return;
		setLaunch((current) => ({
			...current,
			[key]: value
		}));
	}
	function commit() {
		const judgement = judgeOrbit(play, launch);
		setNote(judgement.detail);
		if (!judgement.ok || scored.current) return;
		scored.current = true;
		const score = 160;
		setRun((total) => {
			const next = total + score;
			noteClear("orbit", play.id, score, next);
			return next;
		});
	}
	const live = judgeOrbit(play, launch);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BenchFrame, {
		kicker: "ORBIT",
		title: play.title,
		meta: `${play.id}/16`,
		onExit,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LevelStrip, {
				count: ORBIT_PLAYS.length,
				current: play.id,
				onPick: (id) => {
					if (id === play.id) open(play);
					else pick(id);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-mist",
				children: play.blurb
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 font-mono text-xs text-gold",
				children: ["Aim: ", play.aim === "aloft" ? "stay off the mass" : play.aim === "surface" ? "meet the mass" : play.aim]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 overflow-hidden rounded-2xl border border-line bg-ink",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sky, { launch })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid gap-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dial, {
						label: "Radius",
						min: .5,
						max: 2.4,
						step: .01,
						value: launch.radius,
						digits: 2,
						disabled: !orbitEditable(play.locks, "radius"),
						onChange: (value) => setField("radius", value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dial, {
						label: "Angle rad",
						min: 0,
						max: 6.28,
						step: .01,
						value: launch.angle,
						digits: 2,
						disabled: !orbitEditable(play.locks, "angle"),
						onChange: (value) => setField("angle", value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dial, {
						label: "Heading rad",
						min: -3.14,
						max: 6.28,
						step: .01,
						value: launch.heading,
						digits: 2,
						disabled: !orbitEditable(play.locks, "heading"),
						onChange: (value) => setField("heading", value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dial, {
						label: "Speed",
						min: .2,
						max: 2.2,
						step: .01,
						value: launch.speed,
						digits: 2,
						disabled: !orbitEditable(play.locks, "speed"),
						onChange: (value) => setField("speed", value)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm leading-relaxed text-cream",
				"aria-live": "polite",
				children: note
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 font-mono text-xs text-mist",
				children: [
					"Guide reads: ",
					live.kind,
					". ",
					ORBIT_MODEL
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: commit,
						className: "min-h-11 rounded-full bg-gold px-4 text-sm font-extrabold text-ink",
						children: "Launch"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => open(play),
						className: "min-h-11 rounded-full border border-line px-4 text-sm text-cream",
						children: "Reset"
					}),
					scored.current && play.id < ORBIT_PLAYS.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => pick(play.id + 1),
						className: "min-h-11 rounded-full border border-line px-4 text-sm text-cream",
						children: "Next"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-xs text-mist",
						children: ["Run ", run]
					})
				]
			})
		]
	});
}
var HEARTS$2 = 3;
function shuffle$2(list) {
	const next = [...list];
	for (let i = next.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		const swap = next[i];
		next[i] = next[j];
		next[j] = swap;
	}
	return next;
}
function PrimeProof({ active = true, onExit }) {
	const [phase, setPhase] = (0, import_react.useState)("menu");
	const [level, setLevel] = (0, import_react.useState)(1);
	const [cards, setCards] = (0, import_react.useState)([]);
	const [hearts, setHearts] = (0, import_react.useState)(HEARTS$2);
	const [score, setScore] = (0, import_react.useState)(0);
	const [levelScore, setLevelScore] = (0, import_react.useState)(0);
	const [combo, setCombo] = (0, import_react.useState)(0);
	const [blurb, setBlurb] = (0, import_react.useState)("Pop every prime. Leave the rest.");
	const [bonus, setBonus] = (0, import_react.useState)(0);
	const [track, setTrack] = (0, import_react.useState)({
		best: 0,
		cleared: 0,
		scores: [],
		lastPlayed: 0
	});
	const [mute, setMute] = (0, import_react.useState)(false);
	const [shake, setShake] = (0, import_react.useState)(false);
	const phaseRef = (0, import_react.useRef)(phase);
	const activeRef = (0, import_react.useRef)(active);
	const lockRef = (0, import_react.useRef)(false);
	const scoreRef = (0, import_react.useRef)(0);
	const levelScoreRef = (0, import_react.useRef)(0);
	const heartsRef = (0, import_react.useRef)(HEARTS$2);
	const comboRef = (0, import_react.useRef)(0);
	const cardsRef = (0, import_react.useRef)([]);
	const levelRef = (0, import_react.useRef)(1);
	const missesRef = (0, import_react.useRef)(0);
	const muteRef = (0, import_react.useRef)(false);
	const mounted = (0, import_react.useRef)(true);
	phaseRef.current = phase;
	activeRef.current = active;
	muteRef.current = mute;
	const sync = (next) => {
		cardsRef.current = next;
		setCards(next);
	};
	const begin = (nextLevel, keepScore) => {
		const spec = PRIME_LEVELS[nextLevel - 1];
		if (!spec) {
			setPhase("done");
			phaseRef.current = "done";
			return;
		}
		const dealt = shuffle$2(spec.numbers).map((n) => ({
			n,
			prime: isPrime(n),
			gone: false,
			bad: false
		}));
		levelRef.current = nextLevel;
		setLevel(nextLevel);
		sync(dealt);
		heartsRef.current = HEARTS$2;
		setHearts(HEARTS$2);
		scoreRef.current = keepScore;
		setScore(keepScore);
		levelScoreRef.current = 0;
		setLevelScore(0);
		comboRef.current = 0;
		setCombo(0);
		missesRef.current = 0;
		setBonus(0);
		setBlurb(spec.blurb);
		lockRef.current = false;
		setPhase("play");
		phaseRef.current = "play";
	};
	const finishLevel = () => {
		lockRef.current = true;
		const spec = PRIME_LEVELS[levelRef.current - 1];
		const clearBonus = missesRef.current === 0 ? 180 * spec.id : 80 * spec.id;
		const nextLevelScore = levelScoreRef.current + clearBonus;
		const nextRun = scoreRef.current + clearBonus;
		levelScoreRef.current = nextLevelScore;
		scoreRef.current = nextRun;
		setLevelScore(nextLevelScore);
		setScore(nextRun);
		setBonus(clearBonus);
		setTrack(noteClear("primes", spec.id, nextLevelScore, nextRun));
		playSfx$1("wave");
		if (spec.id >= PRIME_LEVELS.length) {
			setPhase("done");
			phaseRef.current = "done";
			return;
		}
		setPhase("clear");
		phaseRef.current = "clear";
	};
	const pop = (n) => {
		if (lockRef.current || phaseRef.current !== "play") return;
		const card = cardsRef.current.find((item) => item.n === n);
		if (!card || card.gone) return;
		unlockAudio();
		setBlurb(factorBlurb(n));
		if (card.prime) {
			comboRef.current += 1;
			const gained = 100 * comboRef.current;
			levelScoreRef.current += gained;
			scoreRef.current += gained;
			setCombo(comboRef.current);
			setLevelScore(levelScoreRef.current);
			setScore(scoreRef.current);
			const next = cardsRef.current.map((item) => item.n === n ? {
				...item,
				gone: true
			} : item);
			sync(next);
			playSfx$1("pop", 1 + Math.min(.35, (comboRef.current - 1) * .08));
			if (next.every((item) => !item.prime || item.gone)) finishLevel();
			return;
		}
		comboRef.current = 0;
		setCombo(0);
		missesRef.current += 1;
		heartsRef.current -= 1;
		setHearts(heartsRef.current);
		sync(cardsRef.current.map((item) => item.n === n ? {
			...item,
			bad: true
		} : item));
		playSfx$1("over");
		setShake(true);
		window.setTimeout(() => {
			if (mounted.current) setShake(false);
		}, 180);
		if (heartsRef.current <= 0) {
			lockRef.current = true;
			setTrack(noteScore("primes", scoreRef.current));
			setPhase("over");
			phaseRef.current = "over";
		}
	};
	(0, import_react.useEffect)(() => {
		mounted.current = true;
		const progress = loadProgress();
		setTrack(progress.tracks.primes);
		const errors = auditPrime();
		if (errors.length) console.error("Primes audit", errors);
		const onVis = () => {
			if (document.visibilityState === "visible") resumeAudio();
		};
		const onKey = (e) => {
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
	(0, import_react.useEffect)(() => {
		if (active) setMuted(muteRef.current);
	}, [active]);
	const spec = PRIME_LEVELS[level - 1] ?? PRIME_LEVELS[0];
	const continueLevel = Math.min(PRIME_LEVELS.length, track.cleared + 1);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative flex h-dvh flex-col overflow-hidden bg-ink text-cream",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "flex shrink-0 flex-col gap-2 border-b border-line px-3 py-2 sm:px-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-9 shrink-0 place-items-center rounded-lg border border-gold/50 bg-panel font-mono text-lg text-gold",
							children: "2"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "truncate text-base font-extrabold leading-none tracking-tight sm:text-lg",
								children: "Primes"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 font-mono text-xs text-mist",
								children: [phase === "menu" ? "Leave the composites" : `Level ${level} / ${PRIME_LEVELS.length}`, combo >= 2 && phase === "play" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "ml-2 text-gold",
									children: ["×", combo]
								}) : null]
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: `text-right ${phase === "menu" ? "max-sm:hidden" : ""}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-mono text-xl leading-none font-semibold text-gold tabular-nums",
									children: score
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-1 font-mono text-xs text-mist tabular-nums",
									children: ["best ", Math.max(track.best, score)]
								})]
							}),
							onExit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArcadeExit, { onExit }) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									unlockAudio();
									const next = !mute;
									setMute(next);
									muteRef.current = next;
									setMuted(next);
								},
								className: "grid size-11 place-items-center rounded-full border border-line bg-panel",
								"aria-label": mute ? "Unmute" : "Mute",
								children: mute ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" })
							}),
							phase === "play" || phase === "pause" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									const next = phase === "pause" ? "play" : "pause";
									setPhase(next);
									phaseRef.current = next;
								},
								className: "grid size-11 place-items-center rounded-full border border-line bg-panel",
								"aria-label": phase === "pause" ? "Resume" : "Pause",
								children: phase === "pause" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" })
							}) : null
						]
					})]
				})
			}),
			phase === "menu" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-1 items-center justify-center overflow-y-auto p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-md rounded-2xl border border-line bg-panel/90 p-6 shadow-2xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs tracking-widest text-gold",
							children: "NUMBER"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-2 text-4xl font-extrabold tracking-tight",
							children: "Pop the primes."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm leading-relaxed text-mist",
							children: "Tap every prime. Leave 1, the squares, and the products. A composite costs a heart. Sixteen levels, and the best score sticks."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-4 font-mono text-xs text-mist",
							children: [
								"Cleared ",
								track.cleared,
								" / ",
								PRIME_LEVELS.length,
								track.best > 0 ? ` · best ${track.best}` : ""
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
								unlockAudio();
								begin(continueLevel, 0);
							},
							className: "mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold text-base font-extrabold text-ink",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), track.cleared > 0 ? `Continue · ${continueLevel}` : "Play"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LevelGrid, {
								count: PRIME_LEVELS.length,
								cleared: track.cleared,
								scores: track.scores,
								onPlay: (n) => {
									unlockAudio();
									begin(n, 0);
								}
							})
						})
					]
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-0 flex-1 flex-col",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto flex w-full max-w-lg items-end justify-between gap-3 px-3 pt-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs tracking-widest text-mist",
							children: spec.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-cream",
							children: spec.blurb
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-right",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-mono text-xs text-mist",
								children: ["this level ", levelScore]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 flex justify-end gap-1",
								"aria-label": `${hearts} hearts left`,
								children: Array.from({ length: HEARTS$2 }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, {
									className: i < hearts ? "size-4 text-danger" : "size-4 text-line",
									fill: i < hearts ? "currentColor" : "none"
								}, i))
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: `mx-auto min-h-0 w-full max-w-lg flex-1 overflow-y-auto px-3 py-3 ${shake ? "lattice-shake" : ""}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-3 gap-2 sm:grid-cols-4",
							children: cards.map((card) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								disabled: card.gone || phase !== "play",
								onClick: () => pop(card.n),
								className: `flex min-h-16 items-center justify-center rounded-xl border font-mono text-2xl ${card.gone ? "border-line bg-ink text-mist opacity-30" : card.bad ? "border-danger bg-panel-2 text-cream" : "border-line bg-panel-2 text-cream"}`,
								children: card.n
							}, card.n))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"aria-live": "polite",
						className: "mx-auto min-h-12 w-full max-w-lg px-4 pb-3 text-center text-sm leading-relaxed text-mist",
						children: blurb
					})
				]
			}),
			phase === "pause" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Overlay$3, {
				kicker: "Paused",
				title: "The sieve can wait.",
				body: "Hearts and score stay put.",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => {
						setPhase("play");
						phaseRef.current = "play";
					},
					className: "flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold font-extrabold text-ink",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), "Resume"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						setTrack(noteScore("primes", scoreRef.current));
						setPhase("menu");
						phaseRef.current = "menu";
					},
					className: "mt-2 min-h-11 w-full rounded-xl border border-line font-bold",
					children: "Menu"
				})]
			}) : null,
			phase === "clear" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overlay$3, {
				kicker: `Level ${level} clear`,
				title: "Only primes left the board.",
				body: `Clear bonus ${bonus}. This level ${levelScore}. Run ${score}.`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => begin(level + 1, scoreRef.current),
					className: "flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold font-extrabold text-ink",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), "Next level"]
				})
			}) : null,
			phase === "done" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overlay$3, {
				kicker: "Book closed",
				title: "The sieve is finished.",
				body: `Score ${score}. Best ${Math.max(track.best, score)}. Replay any level from the menu.`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						setPhase("menu");
						phaseRef.current = "menu";
					},
					className: "min-h-12 w-full rounded-xl bg-gold font-extrabold text-ink",
					children: "Level select"
				})
			}) : null,
			phase === "over" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Overlay$3, {
				kicker: score >= track.best ? "Best run" : "Out of hearts",
				title: "That one was not prime.",
				body: `Score ${score} · level ${level}. ${blurb}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => begin(level, 0),
					className: "flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold font-extrabold text-ink",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" }), "Retry level"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						setPhase("menu");
						phaseRef.current = "menu";
					},
					className: "mt-2 min-h-11 w-full rounded-xl border border-line font-bold",
					children: "Menu"
				})]
			}) : null
		]
	});
}
function Overlay$3({ kicker, title, body, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-30 flex items-center justify-center bg-ink/55 p-4 backdrop-blur-sm",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm rounded-2xl border border-line bg-panel p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs tracking-widest text-gold",
					children: kicker
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-2 text-3xl font-extrabold tracking-tight",
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-mist",
					children: body
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5",
					children
				})
			]
		})
	});
}
var HEARTS$1 = 3;
function shuffle$1(list) {
	const next = [...list];
	for (let i = next.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		const swap = next[i];
		next[i] = next[j];
		next[j] = swap;
	}
	return next;
}
function SequenceProof({ active = true, onExit }) {
	const [phase, setPhase] = (0, import_react.useState)("menu");
	const [level, setLevel] = (0, import_react.useState)(1);
	const [promptIndex, setPromptIndex] = (0, import_react.useState)(0);
	const [choices, setChoices] = (0, import_react.useState)([]);
	const [hearts, setHearts] = (0, import_react.useState)(HEARTS$1);
	const [score, setScore] = (0, import_react.useState)(0);
	const [levelScore, setLevelScore] = (0, import_react.useState)(0);
	const [corrects, setCorrects] = (0, import_react.useState)(0);
	const [blurb, setBlurb] = (0, import_react.useState)("Fill the blank. Three prompts, three hearts.");
	const [bonus, setBonus] = (0, import_react.useState)(0);
	const [track, setTrack] = (0, import_react.useState)({
		best: 0,
		cleared: 0,
		scores: [],
		lastPlayed: 0
	});
	const [mute, setMute] = (0, import_react.useState)(false);
	const [picked, setPicked] = (0, import_react.useState)(null);
	const phaseRef = (0, import_react.useRef)(phase);
	const activeRef = (0, import_react.useRef)(active);
	const lockRef = (0, import_react.useRef)(false);
	const scoreRef = (0, import_react.useRef)(0);
	const levelScoreRef = (0, import_react.useRef)(0);
	const heartsRef = (0, import_react.useRef)(HEARTS$1);
	const levelRef = (0, import_react.useRef)(1);
	const promptRef = (0, import_react.useRef)(0);
	const correctsRef = (0, import_react.useRef)(0);
	const startedRef = (0, import_react.useRef)(0);
	const muteRef = (0, import_react.useRef)(false);
	const choicesRef = (0, import_react.useRef)([]);
	const mounted = (0, import_react.useRef)(true);
	phaseRef.current = phase;
	activeRef.current = active;
	muteRef.current = mute;
	choicesRef.current = choices;
	const showPrompt = (nextLevel, index) => {
		const prompt = RUN_LEVELS[nextLevel - 1]?.prompts[index];
		if (!prompt) return;
		const nextChoices = shuffle$1(prompt.choices);
		choicesRef.current = nextChoices;
		setChoices(nextChoices);
		setPicked(null);
		setPromptIndex(index);
		promptRef.current = index;
		startedRef.current = performance.now();
		lockRef.current = false;
	};
	const begin = (nextLevel, keepScore) => {
		const spec = RUN_LEVELS[nextLevel - 1];
		if (!spec) {
			setPhase("done");
			phaseRef.current = "done";
			return;
		}
		levelRef.current = nextLevel;
		setLevel(nextLevel);
		heartsRef.current = HEARTS$1;
		setHearts(HEARTS$1);
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
		playSfx$1("wave");
		if (spec.id >= RUN_LEVELS.length) {
			setPhase("done");
			phaseRef.current = "done";
			return;
		}
		setPhase("clear");
		phaseRef.current = "clear";
	};
	const chooseRef = (0, import_react.useRef)(() => {});
	chooseRef.current = (choice) => {
		if (lockRef.current || phaseRef.current !== "play") return;
		const spec = RUN_LEVELS[levelRef.current - 1];
		const prompt = spec?.prompts[promptRef.current];
		if (!prompt) return;
		unlockAudio();
		lockRef.current = true;
		setPicked(choice);
		const elapsed = (performance.now() - startedRef.current) / 1e3;
		if (choice === prompt.answer) {
			const gained = 160 + Math.max(0, Math.round((8 - elapsed) * 10));
			levelScoreRef.current += gained;
			scoreRef.current += gained;
			correctsRef.current += 1;
			setLevelScore(levelScoreRef.current);
			setScore(scoreRef.current);
			setCorrects(correctsRef.current);
			setBlurb(prompt.blurb);
			playSfx$1("pop");
		} else {
			heartsRef.current -= 1;
			setHearts(heartsRef.current);
			setBlurb(`${prompt.blurb} You picked ${choice}.`);
			playSfx$1("over");
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
	(0, import_react.useEffect)(() => {
		mounted.current = true;
		const progress = loadProgress();
		setTrack(progress.tracks.run);
		const errors = auditRun();
		if (errors.length) console.error("Sequence audit", errors);
		const onVis = () => {
			if (document.visibilityState === "visible") resumeAudio();
		};
		const onKey = (e) => {
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
			const index = [
				"Digit1",
				"Digit2",
				"Digit3",
				"Digit4"
			].indexOf(e.code);
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
	(0, import_react.useEffect)(() => {
		if (active) setMuted(muteRef.current);
	}, [active]);
	const spec = RUN_LEVELS[level - 1] ?? RUN_LEVELS[0];
	const prompt = spec.prompts[promptIndex] ?? spec.prompts[0];
	const continueLevel = Math.min(RUN_LEVELS.length, track.cleared + 1);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative flex h-dvh flex-col overflow-hidden bg-ink text-cream",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "flex shrink-0 flex-col gap-2 border-b border-line px-3 py-2 sm:px-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-9 shrink-0 place-items-center rounded-lg border border-gold/50 bg-panel font-mono text-sm font-extrabold text-gold",
							children: "+1"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "truncate text-base font-extrabold leading-none tracking-tight sm:text-lg",
								children: "Sequence"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 font-mono text-xs text-mist",
								children: phase === "menu" ? "Name the missing term" : `Level ${level} / ${RUN_LEVELS.length}`
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: `text-right ${phase === "menu" ? "max-sm:hidden" : ""}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-mono text-xl leading-none font-semibold text-gold tabular-nums",
									children: score
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-1 font-mono text-xs text-mist tabular-nums",
									children: ["best ", Math.max(track.best, score)]
								})]
							}),
							onExit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArcadeExit, { onExit }) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									unlockAudio();
									const next = !mute;
									setMute(next);
									muteRef.current = next;
									setMuted(next);
								},
								className: "grid size-11 place-items-center rounded-full border border-line bg-panel",
								"aria-label": mute ? "Unmute" : "Mute",
								children: mute ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" })
							}),
							phase === "play" || phase === "pause" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									if (phase === "play" && lockRef.current) return;
									const next = phase === "pause" ? "play" : "pause";
									setPhase(next);
									phaseRef.current = next;
									if (next === "play") startedRef.current = performance.now();
								},
								className: "grid size-11 place-items-center rounded-full border border-line bg-panel",
								"aria-label": phase === "pause" ? "Resume" : "Pause",
								children: phase === "pause" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" })
							}) : null
						]
					})]
				})
			}),
			phase === "menu" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-1 items-center justify-center overflow-y-auto p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-md rounded-2xl border border-line bg-panel/90 p-6 shadow-2xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs tracking-widest text-gold",
							children: "NEXT TERM"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-2 text-4xl font-extrabold tracking-tight",
							children: "Finish the run."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm leading-relaxed text-mist",
							children: "Squares, primes, motion, factorials. Each level is three blanks. A wrong term costs a heart. Faster answers score more. Keys 1 to 4 pick an answer."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-4 font-mono text-xs text-mist",
							children: [
								"Cleared ",
								track.cleared,
								" / ",
								RUN_LEVELS.length,
								track.best > 0 ? ` · best ${track.best}` : ""
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
								unlockAudio();
								begin(continueLevel, 0);
							},
							className: "mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold text-base font-extrabold text-ink",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), track.cleared > 0 ? `Continue · ${continueLevel}` : "Play"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LevelGrid, {
								count: RUN_LEVELS.length,
								cleared: track.cleared,
								scores: track.scores,
								onPlay: (n) => {
									unlockAudio();
									begin(n, 0);
								}
							})
						})
					]
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-0 flex-1 flex-col",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto w-full max-w-lg px-4 pt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-xs tracking-widest text-gold",
								children: prompt.rule
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono text-xs text-mist",
									children: [
										promptIndex + 1,
										"/3 · ",
										levelScore
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex gap-1",
									"aria-label": `${hearts} hearts left`,
									children: Array.from({ length: HEARTS$1 }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, {
										className: i < hearts ? "size-4 text-danger" : "size-4 text-line",
										fill: i < hearts ? "currentColor" : "none"
									}, i))
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 flex flex-wrap items-center gap-2",
							children: prompt.terms.map((term, index) => term === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid h-14 min-w-16 place-items-center rounded-xl border border-dashed border-gold bg-ink px-3 font-mono text-xl text-gold",
								children: picked ?? "?"
							}, `blank-${index}`) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid h-14 min-w-14 place-items-center rounded-xl border border-line bg-panel-2 px-3 font-mono text-xl",
								children: term
							}, `${term}-${index}`))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mx-auto mt-auto grid w-full max-w-lg grid-cols-2 gap-2 px-4 pt-6 pb-4",
						children: choices.map((choice, index) => {
							const right = picked !== null && choice === prompt.answer;
							const wrong = picked === choice && choice !== prompt.answer;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								disabled: phase !== "play" || picked !== null,
								onClick: () => chooseRef.current(choice),
								className: `flex min-h-14 flex-col items-center justify-center rounded-xl border font-mono text-lg font-bold ${right ? "border-gold bg-gold text-ink" : wrong ? "border-danger text-danger" : "border-line bg-panel-2 text-cream"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs opacity-70",
									children: index + 1
								}), choice]
							}, choice);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"aria-live": "polite",
						className: "mx-auto min-h-12 w-full max-w-lg px-4 pb-4 text-center text-sm leading-relaxed text-mist",
						children: blurb
					})
				]
			}),
			phase === "pause" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Overlay$2, {
				kicker: "Paused",
				title: "The sequence holds.",
				body: "The blank is still yours.",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => {
						setPhase("play");
						phaseRef.current = "play";
						startedRef.current = performance.now();
					},
					className: "flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold font-extrabold text-ink",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), "Resume"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						setTrack(noteScore("run", scoreRef.current));
						setPhase("menu");
						phaseRef.current = "menu";
					},
					className: "mt-2 min-h-11 w-full rounded-xl border border-line font-bold",
					children: "Menu"
				})]
			}) : null,
			phase === "clear" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overlay$2, {
				kicker: `Level ${level} clear`,
				title: corrects === 3 ? "Clean run." : "The pattern held.",
				body: `Bonus ${bonus}. This level ${levelScore}. Run ${score}.`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => begin(level + 1, scoreRef.current),
					className: "flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold font-extrabold text-ink",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), "Next level"]
				})
			}) : null,
			phase === "done" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overlay$2, {
				kicker: "Book closed",
				title: "Every term named.",
				body: `Score ${score}. Best ${Math.max(track.best, score)}.`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						setPhase("menu");
						phaseRef.current = "menu";
					},
					className: "min-h-12 w-full rounded-xl bg-gold font-extrabold text-ink",
					children: "Level select"
				})
			}) : null,
			phase === "over" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Overlay$2, {
				kicker: score >= track.best ? "Best run" : "Hearts gone",
				title: "The run broke.",
				body: `Score ${score} · level ${level}. ${blurb}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => begin(level, 0),
					className: "flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold font-extrabold text-ink",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" }), "Retry level"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						setPhase("menu");
						phaseRef.current = "menu";
					},
					className: "mt-2 min-h-11 w-full rounded-xl border border-line font-bold",
					children: "Menu"
				})]
			}) : null
		]
	});
}
function Overlay$2({ kicker, title, body, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-30 flex items-center justify-center bg-ink/55 p-4 backdrop-blur-sm",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm rounded-2xl border border-line bg-panel p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs tracking-widest text-gold",
					children: kicker
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-2 text-3xl font-extrabold tracking-tight",
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-mist",
					children: body
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5",
					children
				})
			]
		})
	});
}
var LINE_LAW = {
	slope: "Slope = rise ÷ run. The same ratio at any length is the same slope. A vertical line has undefined slope.",
	through: "The mint point is on the line when its rise and run from the anchor are the same ratio as B.",
	land: "The mark is one lattice point. Slope is whatever rise and run that point makes."
};
function at(x, y) {
	return {
		x,
		y
	};
}
function play(id, title, aim, blurb, anchor, start, solution, span, extra = {}) {
	return {
		id,
		title,
		aim,
		blurb,
		anchor,
		start,
		solution,
		span,
		...extra
	};
}
var LINE_PLAYS = [
	play(1, "Rise with the run", "slope", "From the origin, move B until the slope is 1.", at(0, 0), at(2, 0), at(2, 2), 4, { slope: "1" }),
	play(2, "Twice as steep", "slope", "Rise two for every one you run.", at(0, 0), at(1, 0), at(2, 4), 4, { slope: "2" }),
	play(3, "A shallow climb", "slope", "The rise is half the run.", at(0, 0), at(0, 2), at(4, 2), 4, { slope: "1/2" }),
	play(4, "No rise", "slope", "A horizontal line has slope 0. Keep B off the anchor.", at(0, 1), at(1, 3), at(3, 1), 4, { slope: "0" }),
	play(5, "Downhill", "slope", "The line falls as fast as it runs.", at(0, 0), at(2, 1), at(2, -2), 4, { slope: "-1" }),
	play(6, "Gentle drop", "slope", "Down one for every two across.", at(0, 0), at(2, 0), at(4, -2), 4, { slope: "-1/2" }),
	play(7, "Steep", "slope", "Three up for one across.", at(0, 0), at(2, 2), at(1, 3), 4, { slope: "3" }),
	play(8, "Steep drop", "slope", "Two down for each step right.", at(0, 0), at(1, 1), at(2, -4), 4, { slope: "-2" }),
	play(9, "No run", "slope", "A vertical line has undefined slope. Same x, different y.", at(1, 0), at(3, 1), at(1, 3), 4, { slope: "undefined" }),
	play(10, "Not the origin", "slope", "The anchor has moved. Slope is still rise over run.", at(1, 1), at(3, 1), at(3, 5), 5, { slope: "2" }),
	play(11, "Hit the mint point", "through", "Move B until the line passes through the mint point.", at(0, 0), at(2, 0), at(3, 3), 4, { through: at(2, 2) }),
	play(12, "Mint on the left", "through", "The line can reach the mint point from either side.", at(2, 0), at(3, 1), at(0, 1), 4, { through: at(-2, 2) }),
	play(13, "Land on the mark", "land", "B itself has to sit on the mark.", at(0, 0), at(1, 1), at(4, 2), 4),
	play(14, "Three over two", "slope", "Rise 3, run 2, from a shifted anchor.", at(-1, 0), at(1, 0), at(1, 3), 4, { slope: "3/2" }),
	play(15, "Down three, across two", "slope", "The drop is steeper than the run.", at(0, 1), at(2, 1), at(2, -2), 4, { slope: "-3/2" }),
	play(16, "Thread the mint point", "through", "The anchor is not the origin. The line still has to pass through mint.", at(-2, -1), at(-2, 2), at(0, 0), 4, { through: at(2, 1) })
];
function samePoint(a, b) {
	return a.x === b.x && a.y === b.y;
}
function riseRun(anchor, point) {
	return {
		rise: point.y - anchor.y,
		run: point.x - anchor.x
	};
}
function slopeText(anchor, point) {
	const { rise, run } = riseRun(anchor, point);
	if (rise === 0 && run === 0) return "—";
	return formatSlope(rise, run);
}
function onLine(anchor, point, target) {
	const run = point.x - anchor.x;
	const rise = point.y - anchor.y;
	const tx = target.x - anchor.x;
	const ty = target.y - anchor.y;
	if (run === 0 && rise === 0) return false;
	return run * ty - rise * tx === 0;
}
function inSpan(point, span) {
	return point.x >= -span && point.x <= span && point.y >= -span && point.y <= span;
}
function clampPoint(point, span) {
	return {
		x: Math.max(-span, Math.min(span, point.x)),
		y: Math.max(-span, Math.min(span, point.y))
	};
}
function lineSolved(play, point) {
	if (!inSpan(point, play.span)) return false;
	if (samePoint(point, play.anchor)) return false;
	if (play.aim === "land") return samePoint(point, play.solution);
	if (play.aim === "through") return play.through ? onLine(play.anchor, point, play.through) : false;
	return slopeText(play.anchor, point) === play.slope;
}
/** The infinite line through the anchor and B, clipped to the lattice square. */
function boardSegment(anchor, point, span) {
	const dx = point.x - anchor.x;
	const dy = point.y - anchor.y;
	if (dx === 0 && dy === 0) return null;
	const hits = [];
	const consider = (t) => {
		const x = anchor.x + dx * t;
		const y = anchor.y + dy * t;
		if (x >= -span - 1e-6 && x <= span + 1e-6 && y >= -span - 1e-6 && y <= span + 1e-6) hits.push({
			x,
			y
		});
	};
	if (dx !== 0) {
		consider((-span - anchor.x) / dx);
		consider((span - anchor.x) / dx);
	}
	if (dy !== 0) {
		consider((-span - anchor.y) / dy);
		consider((span - anchor.y) / dy);
	}
	if (hits.length < 2) return {
		a: anchor,
		b: point
	};
	let best = -1;
	let pair = [hits[0], hits[1]];
	for (let i = 0; i < hits.length; i++) for (let j = i + 1; j < hits.length; j++) {
		const dist = Math.hypot(hits[i].x - hits[j].x, hits[i].y - hits[j].y);
		if (dist > best) {
			best = dist;
			pair = [hits[i], hits[j]];
		}
	}
	return {
		a: pair[0],
		b: pair[1]
	};
}
var SIZE = 280;
function mapX$1(n, span) {
	return (n + span) / (span * 2) * SIZE;
}
function mapY$1(n, span) {
	return SIZE - (n + span) / (span * 2) * SIZE;
}
function fromEvent(event, span) {
	const rect = event.currentTarget.getBoundingClientRect();
	const x = (event.clientX - rect.left) / rect.width * SIZE;
	const y = (event.clientY - rect.top) / rect.height * SIZE;
	return clampPoint({
		x: Math.round(x / SIZE * span * 2 - span),
		y: Math.round(span - y / SIZE * span * 2)
	}, span);
}
function Field$1({ play, point, onPoint }) {
	const span = play.span;
	const ticks = [];
	for (let n = -span; n <= span; n += 1) ticks.push(n);
	const { rise, run } = riseRun(play.anchor, point);
	const line = boardSegment(play.anchor, point, span);
	const slope = slopeText(play.anchor, point);
	const label = play.aim === "through" && play.through ? `Point B at ${point.x}, ${point.y}. Slope ${slope}. Mint point at ${play.through.x}, ${play.through.y}.` : `Point B at ${point.x}, ${point.y}. Slope ${slope}.`;
	function nudge(dx, dy) {
		onPoint(clampPoint({
			x: point.x + dx,
			y: point.y + dy
		}, span));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: `0 0 ${SIZE} ${SIZE}`,
		className: "mx-auto aspect-square w-full max-w-md touch-none",
		role: "application",
		tabIndex: 0,
		"aria-label": label,
		onPointerDown: (event) => {
			event.currentTarget.setPointerCapture(event.pointerId);
			onPoint(fromEvent(event, span));
		},
		onPointerMove: (event) => {
			if (event.currentTarget.hasPointerCapture(event.pointerId)) onPoint(fromEvent(event, span));
		},
		onKeyDown: (event) => {
			if (event.key === "ArrowRight") nudge(1, 0);
			else if (event.key === "ArrowLeft") nudge(-1, 0);
			else if (event.key === "ArrowUp") nudge(0, 1);
			else if (event.key === "ArrowDown") nudge(0, -1);
			else return;
			event.preventDefault();
		},
		children: [
			ticks.map((tick) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				className: "text-line",
				stroke: "currentColor",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: mapX$1(tick, span),
					y1: 0,
					x2: mapX$1(tick, span),
					y2: SIZE
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: 0,
					y1: mapY$1(tick, span),
					x2: SIZE,
					y2: mapY$1(tick, span)
				})]
			}, tick)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: mapX$1(-span, span),
				y1: mapY$1(0, span),
				x2: mapX$1(span, span),
				y2: mapY$1(0, span),
				className: "text-mist",
				stroke: "currentColor"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: mapX$1(0, span),
				y1: mapY$1(-span, span),
				x2: mapX$1(0, span),
				y2: mapY$1(span, span),
				className: "text-mist",
				stroke: "currentColor"
			}),
			line ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: mapX$1(line.a.x, span),
				y1: mapY$1(line.a.y, span),
				x2: mapX$1(line.b.x, span),
				y2: mapY$1(line.b.y, span),
				className: "text-gold",
				stroke: "currentColor",
				strokeWidth: "2.5"
			}) : null,
			!samePoint(point, play.anchor) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", {
				points: `${mapX$1(play.anchor.x, span)},${mapY$1(play.anchor.y, span)} ${mapX$1(point.x, span)},${mapY$1(play.anchor.y, span)} ${mapX$1(point.x, span)},${mapY$1(point.y, span)}`,
				fill: "none",
				className: "text-mint",
				stroke: "currentColor",
				strokeDasharray: "4 3"
			}) : null,
			play.aim === "through" && play.through ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: mapX$1(play.through.x, span),
				cy: mapY$1(play.through.y, span),
				r: "7",
				className: "text-mint",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "2"
			}) : null,
			play.aim === "land" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: mapX$1(play.solution.x, span),
				cy: mapY$1(play.solution.y, span),
				r: "8",
				className: "text-mint",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "2"
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: mapX$1(play.anchor.x, span),
				cy: mapY$1(play.anchor.y, span),
				r: "6",
				className: "text-gold",
				fill: "currentColor"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: mapX$1(point.x, span),
				cy: mapY$1(point.y, span),
				r: "6",
				className: "text-cream",
				fill: "currentColor"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("title", { children: `rise ${rise}, run ${run}` })
		]
	});
}
function SlopeLine({ onExit, onQuestions }) {
	const [levelId, setLevelId] = (0, import_react.useState)(1);
	const level = LINE_PLAYS[levelId - 1] ?? LINE_PLAYS[0];
	const [point, setPoint] = (0, import_react.useState)(level.start);
	const [armed, setArmed] = (0, import_react.useState)(level.id);
	const [run, setRun] = (0, import_react.useState)(0);
	const scored = (0, import_react.useRef)(false);
	const solved = armed === level.id && lineSolved(level, point);
	const { rise, run: runDelta } = riseRun(level.anchor, point);
	(0, import_react.useEffect)(() => {
		scored.current = false;
		setPoint(level.start);
		setArmed(level.id);
	}, [level]);
	(0, import_react.useEffect)(() => {
		if (!solved || scored.current) return;
		scored.current = true;
		const score = 100;
		setRun((total) => {
			const next = total + score;
			noteClear("slope", level.id, score, next);
			return next;
		});
	}, [solved, level.id]);
	function move(next) {
		setPoint(clampPoint(next, level.span));
	}
	const needed = level.aim === "slope" ? level.slope ?? "" : level.aim === "land" ? `(${level.solution.x}, ${level.solution.y})` : "the mint point";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BenchFrame, {
		kicker: "SLOPE",
		title: level.title,
		meta: `${level.id}/16`,
		onExit,
		onQuestions,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LevelStrip, {
				count: LINE_PLAYS.length,
				current: level.id,
				onPick: setLevelId
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-mist",
				children: level.blurb
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 font-mono text-xs text-gold",
				children: ["Needed · ", needed]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid items-start gap-3 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-hidden rounded-2xl border border-line bg-ink",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
						play: level,
						point,
						onPoint: move
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto grid w-full max-w-xs grid-cols-3 gap-2",
						"aria-label": "Move point B",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Step, {
								label: "North",
								onClick: () => move({
									x: point.x,
									y: point.y + 1
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Step, {
								label: "West",
								onClick: () => move({
									x: point.x - 1,
									y: point.y
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Step, {
								label: "East",
								onClick: () => move({
									x: point.x + 1,
									y: point.y
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Step, {
								label: "South",
								onClick: () => move({
									x: point.x,
									y: point.y - 1
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-3 grid grid-cols-2 gap-2 font-mono text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Readout$1, {
								label: "Anchor",
								value: `(${level.anchor.x}, ${level.anchor.y})`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Readout$1, {
								label: "B",
								value: `(${point.x}, ${point.y})`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Readout$1, {
								label: "Rise, run",
								value: `${rise}, ${runDelta}`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Readout$1, {
								label: "Slope",
								value: slopeText(level.anchor, point)
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm leading-relaxed text-cream",
						children: LINE_LAW[level.aim]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 font-mono text-sm text-gold",
						"aria-live": "polite",
						children: samePoint(point, level.anchor) ? "B is on the anchor. A line needs two different points." : solved ? level.aim === "through" ? "The line passes through the mint point." : level.aim === "land" ? "B is on the mark." : "That slope is the one this bench asked for." : "Drag the field, or step B. The dashed triangle is the rise and the run."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									scored.current = solved;
									setPoint(level.start);
								},
								className: "min-h-11 rounded-full border border-line px-4 text-sm text-cream",
								children: "Reset"
							}),
							solved && level.id < LINE_PLAYS.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setLevelId(level.id + 1),
								className: "min-h-11 rounded-full bg-gold px-4 text-sm font-extrabold text-ink",
								children: "Next"
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "self-center font-mono text-xs text-mist",
								children: ["Run ", run]
							})
						]
					})
				] })]
			})
		]
	});
}
function Step({ label, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: "min-h-11 rounded-xl border border-line bg-panel text-sm text-cream",
		children: label
	});
}
function Readout$1({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-line bg-panel px-3 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-mist",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "text-cream",
			children: value
		})]
	});
}
function mapX(n) {
	return 90 + n * 16;
}
function mapY(n) {
	return 90 - n * 16;
}
function SlopeFigure({ a, b }) {
	const travel = arriveDraw(useArrive(`${a[0]},${a[1]},${b[0]},${b[1]}`));
	const beadX = mix(mapX(a[0]), mapX(b[0]), travel);
	const beadY = mix(mapY(a[1]), mapY(b[1]), travel);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 180 180",
		className: "mx-auto h-40 w-full max-w-xs",
		role: "img",
		"aria-label": `Line from ${a[0]}, ${a[1]} to ${b[0]}, ${b[1]}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: "14",
				y1: "90",
				x2: "166",
				y2: "90",
				className: "text-line",
				stroke: "currentColor"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: "90",
				y1: "14",
				x2: "90",
				y2: "166",
				className: "text-line",
				stroke: "currentColor"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: mapX(a[0]),
				y1: mapY(a[1]),
				x2: mapX(b[0]),
				y2: mapY(b[1]),
				className: "text-gold",
				stroke: "currentColor",
				strokeWidth: "3"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: mapX(a[0]),
				cy: mapY(a[1]),
				r: "5",
				className: "text-gold",
				fill: "currentColor"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: mapX(b[0]),
				cy: mapY(b[1]),
				r: "5",
				className: "text-cream",
				fill: "currentColor"
			}),
			travel < .98 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: beadX,
				cy: beadY,
				r: "3.5",
				className: "text-gold-soft",
				fill: "currentColor"
			}) : null
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "mt-1 text-center font-mono text-xs text-mist",
		children: [
			"(",
			a[0],
			", ",
			a[1],
			") to (",
			b[0],
			", ",
			b[1],
			")"
		]
	})] });
}
function SlopeProof({ active = true, onExit }) {
	const [mode, setMode] = (0, import_react.useState)("line");
	if (mode === "questions") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative h-dvh",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoundProof, {
			active,
			onExit,
			track: "slope",
			mark: "Δ",
			title: "Slope",
			menuKicker: "ADVANCED",
			menuTitle: "Read the line.",
			menuBody: "Two dots mark a line. Name the slope, or name the point that stays on it. Keys 1 to 4. A miss costs a heart. Sixteen levels.",
			levels: SLOPE_LEVELS,
			audit: auditSlope,
			renderScene: (prompt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlopeFigure, {
				a: prompt.scene.a,
				b: prompt.scene.b
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuestionsChip, {
			label: "Bench",
			onClick: () => setMode("line")
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlopeLine, {
		onExit,
		onQuestions: () => setMode("questions")
	});
}
var seq = 1;
function resetIds(start = 1) {
	seq = start;
}
function makeTile(kind, special = null) {
	return {
		id: seq++,
		kind,
		special
	};
}
function cloneGrid(grid) {
	return grid.map((row) => row.map((cell) => cell ? { ...cell } : null));
}
function keyOf(r, c) {
	return `${r},${c}`;
}
function parseKey(key) {
	const [r, c] = key.split(",").map(Number);
	return {
		r,
		c
	};
}
function adjacent(a, b) {
	return Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;
}
function inBounds(grid, r, c) {
	return r >= 0 && c >= 0 && r < grid.length && c < grid[0].length;
}
function swapCells(grid, a, b) {
	const t = grid[a.r][a.c];
	grid[a.r][a.c] = grid[b.r][b.c];
	grid[b.r][b.c] = t;
}
function findRuns(grid) {
	const rows = grid.length;
	const cols = grid[0].length;
	const runs = [];
	for (let r = 0; r < rows; r++) {
		let c = 0;
		while (c < cols) {
			const tile = grid[r][c];
			if (!tile) {
				c += 1;
				continue;
			}
			let end = c + 1;
			while (end < cols && grid[r][end]?.kind === tile.kind) end += 1;
			if (end - c >= 3) {
				const cells = [];
				for (let i = c; i < end; i++) cells.push({
					r,
					c: i
				});
				runs.push({
					cells,
					orientation: "h",
					kind: tile.kind
				});
			}
			c = end;
		}
	}
	for (let c = 0; c < cols; c++) {
		let r = 0;
		while (r < rows) {
			const tile = grid[r][c];
			if (!tile) {
				r += 1;
				continue;
			}
			let end = r + 1;
			while (end < rows && grid[end][c]?.kind === tile.kind) end += 1;
			if (end - r >= 3) {
				const cells = [];
				for (let i = r; i < end; i++) cells.push({
					r: i,
					c
				});
				runs.push({
					cells,
					orientation: "v",
					kind: tile.kind
				});
			}
			r = end;
		}
	}
	return runs;
}
function findGroups(grid) {
	const runs = findRuns(grid);
	const inRun = /* @__PURE__ */ new Set();
	for (const run of runs) for (const p of run.cells) inRun.add(keyOf(p.r, p.c));
	const seen = /* @__PURE__ */ new Set();
	const groups = [];
	for (const key of inRun) {
		if (seen.has(key)) continue;
		const start = parseKey(key);
		const tile = grid[start.r][start.c];
		if (!tile) continue;
		const cells = [];
		const queue = [start];
		seen.add(key);
		while (queue.length) {
			const p = queue.pop();
			cells.push(p);
			const neighbors = [
				{
					r: p.r - 1,
					c: p.c
				},
				{
					r: p.r + 1,
					c: p.c
				},
				{
					r: p.r,
					c: p.c - 1
				},
				{
					r: p.r,
					c: p.c + 1
				}
			];
			for (const n of neighbors) {
				const nk = keyOf(n.r, n.c);
				if (!inRun.has(nk) || seen.has(nk)) continue;
				const other = grid[n.r]?.[n.c];
				if (!other || other.kind !== tile.kind) continue;
				seen.add(nk);
				queue.push(n);
			}
		}
		groups.push({
			cells,
			kind: tile.kind
		});
	}
	return groups;
}
function classify(group, runs) {
	const mine = runs.filter((run) => run.cells.every((p) => group.cells.some((g) => g.r === p.r && g.c === p.c)));
	let maxH = 0;
	let maxV = 0;
	for (const run of mine) if (run.orientation === "h") maxH = Math.max(maxH, run.cells.length);
	else maxV = Math.max(maxV, run.cells.length);
	if (Math.max(maxH, maxV) >= 5) return "nova";
	if (maxH >= 3 && maxV >= 3) return "burst";
	if (maxH >= 4) return "row";
	if (maxV >= 4) return "col";
	return null;
}
function longestRun(group, runs) {
	const mine = runs.filter((run) => run.kind === group.kind && run.cells.every((p) => group.cells.some((g) => g.r === p.r && g.c === p.c)));
	mine.sort((a, b) => b.cells.length - a.cells.length);
	return mine[0]?.cells ?? group.cells;
}
function isDirect(grid, a, b) {
	const A = grid[a.r][a.c];
	const B = grid[b.r][b.c];
	if (!A?.special && !B?.special) return false;
	if (A?.special === "nova" || B?.special === "nova") return true;
	return Boolean(A?.special && B?.special);
}
function effectKeys(grid, pos, novaKind) {
	const tile = grid[pos.r][pos.c];
	if (!tile?.special) return [];
	const keys = [];
	const rows = grid.length;
	const cols = grid[0].length;
	if (tile.special === "row") {
		for (let c = 0; c < cols; c++) if (grid[pos.r][c]) keys.push(keyOf(pos.r, c));
	} else if (tile.special === "col") {
		for (let r = 0; r < rows; r++) if (grid[r][pos.c]) keys.push(keyOf(r, pos.c));
	} else if (tile.special === "burst") {
		for (let r = pos.r - 1; r <= pos.r + 1; r++) for (let c = pos.c - 1; c <= pos.c + 1; c++) if (inBounds(grid, r, c) && grid[r][c]) keys.push(keyOf(r, c));
	} else for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (grid[r][c]?.kind === novaKind) keys.push(keyOf(r, c));
	return keys;
}
function detonate(grid, seeds, novaKind) {
	const cleared = /* @__PURE__ */ new Set();
	const fired = /* @__PURE__ */ new Set();
	const queue = [...seeds];
	while (queue.length) {
		const pos = queue.pop();
		const k = keyOf(pos.r, pos.c);
		const tile = grid[pos.r]?.[pos.c];
		if (!tile || fired.has(k)) continue;
		cleared.add(k);
		if (!tile.special) continue;
		fired.add(k);
		const kind = novaKind.get(k) ?? tile.kind;
		for (const hit of effectKeys(grid, pos, kind)) {
			cleared.add(hit);
			const hp = parseKey(hit);
			if (grid[hp.r][hp.c]?.special && !fired.has(hit)) queue.push(hp);
		}
	}
	return cleared;
}
function specialPhrase(specials) {
	if (specials.length === 0) return "";
	const label = (s) => s === "row" ? "a row clearer" : s === "col" ? "a column clearer" : s === "burst" ? "a burst" : "a nova";
	if (specials.length === 1) return ` Forged ${label(specials[0])}.`;
	return " Forged specials.";
}
function bannerFor(grid, cleared, created, chain) {
	const counts = /* @__PURE__ */ new Map();
	for (const key of cleared) {
		const p = parseKey(key);
		const tile = grid[p.r][p.c];
		if (!tile) continue;
		counts.set(tile.kind, (counts.get(tile.kind) ?? 0) + 1);
	}
	let bestKind = 0;
	let bestN = -1;
	for (const [kind, n] of counts) if (n > bestN) {
		bestN = n;
		bestKind = kind;
	}
	const symbol = SYMBOLS[bestKind] ?? SYMBOLS[0];
	return `${chain > 1 ? `Chain ×${chain}. ` : ""}${symbol.glyph} ${symbol.name} — ${symbol.blurb}${specialPhrase(created)}`;
}
function applyClear(grid, cleared, transforms, chain) {
	const next = cloneGrid(grid);
	const created = [];
	const forged = [];
	for (const [key, special] of transforms) {
		if (cleared.has(key)) continue;
		const p = parseKey(key);
		const tile = next[p.r][p.c];
		if (!tile) continue;
		tile.special = special;
		created.push({
			id: tile.id,
			special
		});
		forged.push(special);
	}
	const clearedIds = [];
	for (const key of cleared) {
		const p = parseKey(key);
		const tile = next[p.r][p.c];
		if (!tile) continue;
		clearedIds.push(tile.id);
		next[p.r][p.c] = null;
	}
	return {
		type: "clear",
		cells: next,
		clearedIds,
		created,
		score: (clearedIds.length * 30 + created.length * 60) * chain,
		banner: bannerFor(grid, cleared, forged, chain),
		chain
	};
}
function gravity(grid) {
	const rows = grid.length;
	const cols = grid[0].length;
	const next = Array.from({ length: rows }, () => Array.from({ length: cols }, () => null));
	for (let c = 0; c < cols; c++) {
		let write = rows - 1;
		for (let r = rows - 1; r >= 0; r--) {
			const tile = grid[r][c];
			if (!tile) continue;
			next[write][c] = tile;
			write -= 1;
		}
	}
	return next;
}
function refill(grid, rng, kindCount) {
	const next = cloneGrid(grid);
	for (let r = 0; r < next.length; r++) for (let c = 0; c < next[0].length; c++) if (!next[r][c]) next[r][c] = makeTile(Math.floor(rng() * kindCount));
	return next;
}
function matchClear(grid, focus, chain) {
	const groups = findGroups(grid);
	if (groups.length === 0) return null;
	const runs = findRuns(grid);
	const matched = /* @__PURE__ */ new Set();
	for (const group of groups) for (const p of group.cells) matched.add(keyOf(p.r, p.c));
	const seeds = [];
	for (const key of matched) {
		const p = parseKey(key);
		if (grid[p.r][p.c]?.special) seeds.push(p);
	}
	const detonated = detonate(grid, seeds, /* @__PURE__ */ new Map());
	const transforms = /* @__PURE__ */ new Map();
	for (const group of groups) {
		const special = classify(group, runs);
		if (!special) continue;
		const candidates = group.cells.filter((p) => {
			const k = keyOf(p.r, p.c);
			return !detonated.has(k) && !grid[p.r][p.c]?.special;
		});
		if (candidates.length === 0) continue;
		const focusHit = focus && candidates.find((p) => p.r === focus.r && p.c === focus.c);
		const run = longestRun(group, runs);
		const mid = run[Math.floor(run.length / 2)];
		const midHit = candidates.find((p) => p.r === mid.r && p.c === mid.c);
		const anchor = focusHit ?? midHit ?? candidates[Math.floor(candidates.length / 2)];
		transforms.set(keyOf(anchor.r, anchor.c), special);
	}
	const cleared = new Set(detonated);
	for (const key of matched) if (!transforms.has(key)) cleared.add(key);
	return applyClear(grid, cleared, transforms, chain);
}
function directClear(grid, a, b, chain) {
	if (!isDirect(grid, a, b)) return null;
	const A = grid[a.r][a.c];
	const B = grid[b.r][b.c];
	if (!A || !B) return null;
	if (A.special === "nova" && B.special === "nova") {
		const all = /* @__PURE__ */ new Set();
		for (let r = 0; r < grid.length; r++) for (let c = 0; c < grid[0].length; c++) if (grid[r][c]) all.add(keyOf(r, c));
		return applyClear(grid, all, /* @__PURE__ */ new Map(), chain);
	}
	const seeds = [];
	const novaKind = /* @__PURE__ */ new Map();
	if (A.special) seeds.push(a);
	if (B.special) seeds.push(b);
	if (A.special === "nova") novaKind.set(keyOf(a.r, a.c), B.kind);
	if (B.special === "nova") novaKind.set(keyOf(b.r, b.c), A.kind);
	const cleared = detonate(grid, seeds, novaKind);
	cleared.add(keyOf(a.r, a.c));
	cleared.add(keyOf(b.r, b.c));
	return applyClear(grid, cleared, /* @__PURE__ */ new Map(), chain);
}
function settle(grid, rng, kindCount) {
	let cells = cloneGrid(grid);
	for (let pass = 0; pass < 12; pass++) {
		if (findGroups(cells).length === 0) break;
		const groups = findGroups(cells);
		for (const group of groups) {
			const p = group.cells[0];
			const current = cells[p.r][p.c]?.kind ?? 0;
			let kind = current;
			for (let t = 0; t < 6; t++) {
				kind = Math.floor(rng() * kindCount);
				if (kind !== current) break;
			}
			cells[p.r][p.c] = makeTile(kind === current ? (kind + 1) % kindCount : kind);
		}
	}
	return cells;
}
function wouldScore(grid, a, b) {
	if (!adjacent(a, b)) return false;
	if (!grid[a.r]?.[a.c] || !grid[b.r]?.[b.c]) return false;
	swapCells(grid, a, b);
	const ok = isDirect(grid, a, b) || findGroups(grid).length > 0;
	swapCells(grid, a, b);
	return ok;
}
function hasMove(grid) {
	const rows = grid.length;
	const cols = grid[0].length;
	for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
		if (c + 1 < cols && wouldScore(grid, {
			r,
			c
		}, {
			r,
			c: c + 1
		})) return true;
		if (r + 1 < rows && wouldScore(grid, {
			r,
			c
		}, {
			r: r + 1,
			c
		})) return true;
	}
	return false;
}
function findHint(grid) {
	const rows = grid.length;
	const cols = grid[0].length;
	for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
		const right = {
			r,
			c: c + 1
		};
		const down = {
			r: r + 1,
			c
		};
		if (c + 1 < cols && wouldScore(grid, {
			r,
			c
		}, right)) return [{
			r,
			c
		}, right];
		if (r + 1 < rows && wouldScore(grid, {
			r,
			c
		}, down)) return [{
			r,
			c
		}, down];
	}
	return null;
}
function createBoard(kindCount, rng, rows = 8, cols = 7) {
	const count = Math.max(3, kindCount);
	for (let attempt = 0; attempt < 50; attempt++) {
		let grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => makeTile(Math.floor(rng() * count))));
		grid = settle(grid, rng, count);
		if (findGroups(grid).length === 0 && hasMove(grid)) return grid;
	}
	const grid = Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => makeTile((r + c * 2) % count)));
	return findGroups(grid).length === 0 && hasMove(grid) ? grid : settle(grid, rng, count);
}
function resolveBoard(grid, rng, kindCount, focus = null) {
	const beats = [];
	let cells = cloneGrid(grid);
	let score = 0;
	let chain = 0;
	for (let guard = 0; guard < 30; guard++) {
		const clear = matchClear(cells, chain === 0 ? focus : null, chain + 1);
		if (!clear || clear.type !== "clear" || clear.clearedIds.length === 0) break;
		chain += 1;
		beats.push(clear);
		score += clear.score;
		const fallen = refill(gravity(clear.cells), rng, kindCount);
		beats.push({
			type: "fall",
			cells: fallen
		});
		cells = fallen;
	}
	if (findGroups(cells).length > 0) {
		cells = settle(cells, rng, kindCount);
		beats.push({
			type: "fall",
			cells,
			banner: "The lattice settled."
		});
	}
	if (!hasMove(cells)) {
		cells = createBoard(kindCount, rng, cells.length, cells[0].length);
		beats.push({
			type: "fall",
			cells,
			banner: "No moves left. The lattice reshuffled."
		});
	}
	return {
		beats,
		score,
		grid: cells
	};
}
function trySwap(grid, a, b, rng, kindCount) {
	if (!adjacent(a, b) || !grid[a.r]?.[a.c] || !grid[b.r]?.[b.c]) return {
		ok: false,
		beats: [],
		score: 0,
		grid
	};
	const next = cloneGrid(grid);
	swapCells(next, a, b);
	const direct = directClear(next, a, b, 1);
	if (!direct && findGroups(next).length === 0) return {
		ok: false,
		beats: [],
		score: 0,
		grid
	};
	if (direct && direct.type === "clear") {
		const beats = [direct];
		let score = direct.score;
		let cells = refill(gravity(direct.cells), rng, kindCount);
		beats.push({
			type: "fall",
			cells
		});
		const rest = resolveBoard(cells, rng, kindCount, null);
		const extra = rest.beats;
		beats.push(...extra);
		score += rest.score;
		cells = rest.grid;
		if (!hasMove(cells)) {
			cells = createBoard(kindCount, rng, cells.length, cells[0].length);
			beats.push({
				type: "fall",
				cells,
				banner: "No moves left. The lattice reshuffled."
			});
		}
		return {
			ok: true,
			beats,
			score,
			grid: cells
		};
	}
	const resolved = resolveBoard(next, rng, kindCount, b);
	if (resolved.beats.length === 0) return {
		ok: false,
		beats: [],
		score: 0,
		grid
	};
	return {
		ok: true,
		beats: resolved.beats,
		score: resolved.score,
		grid: resolved.grid
	};
}
function safeGrid(kindCount = 5) {
	return Array.from({ length: 8 }, (_, r) => Array.from({ length: 7 }, (_, c) => makeTile((r * 3 + c) % kindCount)));
}
function paint(grid, r, c, kind, special = null) {
	grid[r][c] = makeTile(kind, special);
}
function selfCheck() {
	const errors = [];
	const eq = (cond, msg) => {
		if (!cond) errors.push(msg);
	};
	try {
		resetIds();
		eq(findGroups(safeGrid()).length === 0, "safe grid should not start matched");
		const three = safeGrid();
		paint(three, 0, 0, 4);
		paint(three, 0, 1, 4);
		paint(three, 0, 2, 4);
		const g3 = findGroups(three);
		eq(g3.length === 1 && g3[0].cells.length === 3, `horizontal 3 is one group, got ${g3.map((g) => g.cells.length).join(",")}`);
		const resolved3 = resolveBoard(three, cycleRng([
			0,
			1,
			2,
			3
		]), 5);
		const clear3 = resolved3.beats.find((b) => b.type === "clear");
		eq(clear3?.type === "clear" && clear3.clearedIds.length === 3, "horizontal 3 clears 3");
		eq(clear3?.type === "clear" && clear3.created.length === 0, "horizontal 3 forges nothing");
		eq(resolved3.beats.filter((b) => b.type === "clear").length === 1, "horizontal 3 does not cascade on this rng");
		eq(resolved3.score === 90, `3-match scores 90, got ${resolved3.score}`);
		const four = safeGrid();
		for (let c = 0; c < 4; c++) paint(four, 0, c, 3);
		const clear4 = resolveBoard(four, cycleRng([
			0,
			1,
			2,
			4
		]), 5).beats.find((b) => b.type === "clear");
		eq(clear4?.type === "clear" && clear4.created.length === 1 && clear4.created[0].special === "row", "4-match forges a row");
		eq(clear4?.type === "clear" && clear4.clearedIds.length === 3, "4-match clears the other 3");
		eq(clear4?.type === "clear" && clear4.cells.flat().some((t) => t?.special === "row" && clear4.created.some((c) => c.id === t.id)), "forged row tile stays on the board");
		const five = safeGrid();
		for (let c = 0; c < 5; c++) paint(five, 2, c, 2);
		const clear5 = resolveBoard(five, () => .2, 5).beats.find((b) => b.type === "clear");
		eq(clear5?.type === "clear" && clear5.created.some((s) => s.special === "nova"), "5-match forges a nova");
		const rowB = safeGrid();
		paint(rowB, 4, 2, 4, "row");
		paint(rowB, 4, 3, 4);
		paint(rowB, 4, 4, 4);
		const detonated = resolveBoard(rowB, cycleRng([
			0,
			1,
			2
		]), 5).beats.find((b) => b.type === "clear");
		eq(detonated?.type === "clear" && detonated.clearedIds.length >= 7, `row special should clear its row, got ${detonated?.type === "clear" ? detonated.clearedIds.length : "none"}`);
		const ell = safeGrid();
		paint(ell, 0, 2, 4);
		paint(ell, 1, 2, 4);
		paint(ell, 2, 0, 4);
		paint(ell, 2, 1, 4);
		paint(ell, 2, 2, 4);
		const clearL = resolveBoard(ell, () => .2, 5).beats.find((b) => b.type === "clear");
		eq(clearL?.type === "clear" && clearL.created.some((s) => s.special === "burst"), "L forges a burst");
		const vert = safeGrid();
		paint(vert, 4, 3, 1);
		paint(vert, 5, 3, 0);
		paint(vert, 6, 3, 0);
		paint(vert, 7, 3, 0);
		paint(vert, 7, 2, 1);
		paint(vert, 7, 4, 1);
		const beforeAbove = vert[4][3].id;
		const casc = resolveBoard(vert, () => .4, 5);
		const clears = casc.beats.filter((b) => b.type === "clear");
		eq(clears.length >= 2, `cascade should clear twice, got ${clears.length}`);
		const landed = casc.grid[7][3];
		eq(landed?.id === beforeAbove || clears.length >= 2, "cascade ran");
		const rejected = safeGrid();
		const snapshot = JSON.stringify(rejected);
		const bad = trySwap(rejected, {
			r: 0,
			c: 0
		}, {
			r: 0,
			c: 1
		}, () => .3, 5);
		if (bad.ok) eq(bad.beats.some((b) => b.type === "clear"), "accepted swap must clear");
		else eq(JSON.stringify(rejected) === snapshot, "rejected swap must not mutate the grid");
		eq(!trySwap(rejected, {
			r: 0,
			c: 0
		}, {
			r: 2,
			c: 2
		}, () => .3, 5).ok, "diagonal swap is illegal");
		const novaBoard = safeGrid();
		paint(novaBoard, 3, 3, 0, "nova");
		paint(novaBoard, 3, 4, 2);
		const novaSwap = trySwap(novaBoard, {
			r: 3,
			c: 3
		}, {
			r: 3,
			c: 4
		}, () => .15, 5);
		eq(novaSwap.ok, "nova swap should score");
		eq(novaSwap.grid.flat().filter((t) => t?.kind === 2).length === 0 || novaSwap.score > 0, "nova swap scores");
		eq(!novaSwap.grid.flat().some((t) => t?.kind === 2), "nova swap clears the partner glyph");
		const rng = mulberry32(7);
		for (let i = 0; i < 25; i++) {
			const board = createBoard(5, rng);
			eq(findGroups(board).length === 0, `board ${i} spawned with a match`);
			eq(hasMove(board), `board ${i} spawned with no move`);
			eq(board.length === 8 && board[0].length === 7, "board size");
		}
	} catch (error) {
		errors.push(error instanceof Error ? error.message : String(error));
	} finally {
		resetIds();
	}
	return errors;
}
function cycleRng(kinds) {
	let i = 0;
	return () => {
		const kind = kinds[i % kinds.length];
		i += 1;
		return (kind + .01) / 5;
	};
}
function mulberry32(seed) {
	let a = seed >>> 0;
	return () => {
		a |= 0;
		a = a + 1831565813 | 0;
		let t = Math.imul(a ^ a >>> 15, 1 | a);
		t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
var SAVE_KEY = "symbol-match-v1";
var GAP = 6;
function loadSave() {
	const empty = {
		best: 0,
		bestStage: 1,
		mute: false
	};
	try {
		const raw = localStorage.getItem(SAVE_KEY);
		if (!raw) return empty;
		const data = JSON.parse(raw);
		return {
			best: typeof data.best === "number" ? data.best : 0,
			bestStage: typeof data.bestStage === "number" ? data.bestStage : 1,
			mute: Boolean(data.mute)
		};
	} catch {
		return empty;
	}
}
function writeSave(save) {
	try {
		localStorage.setItem(SAVE_KEY, JSON.stringify(save));
	} catch {}
}
function piecesFrom(grid) {
	const out = [];
	for (let r = 0; r < grid.length; r++) for (let c = 0; c < grid[0].length; c++) {
		const tile = grid[r][c];
		if (!tile) continue;
		out.push({
			id: tile.id,
			kind: tile.kind,
			special: tile.special,
			r,
			c,
			dy: 0,
			clearing: false
		});
	}
	return out;
}
function fieldClass(kind) {
	return SYMBOLS[kind]?.field === "physics" ? "text-mint" : "text-gold";
}
function samePos(a, b) {
	return a?.r === b.r && a.c === b.c;
}
function SymbolMatch({ active = true, onExit }) {
	const [phase, setPhase] = (0, import_react.useState)("menu");
	const [pieces, setPieces] = (0, import_react.useState)([]);
	const [stage, setStage] = (0, import_react.useState)(1);
	const [moves, setMoves] = (0, import_react.useState)(stageConfig(1).moves);
	const [stageScore, setStageScore] = (0, import_react.useState)(0);
	const [total, setTotal] = (0, import_react.useState)(0);
	const [best, setBest] = (0, import_react.useState)(0);
	const [track, setTrack] = (0, import_react.useState)({
		best: 0,
		cleared: 0,
		scores: [],
		lastPlayed: 0
	});
	const [mute, setMute] = (0, import_react.useState)(false);
	const [banner, setBanner] = (0, import_react.useState)("Three of a glyph. Chains pay more.");
	const [combo, setCombo] = (0, import_react.useState)(1);
	const [bonus, setBonus] = (0, import_react.useState)(0);
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [cursor, setCursor] = (0, import_react.useState)({
		r: 0,
		c: 0
	});
	const [hint, setHint] = (0, import_react.useState)(null);
	const [learn, setLearn] = (0, import_react.useState)(null);
	const [tile, setTile] = (0, import_react.useState)(48);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [floatText, setFloatText] = (0, import_react.useState)(null);
	const [shake, setShake] = (0, import_react.useState)(false);
	const [hintEpoch, setHintEpoch] = (0, import_react.useState)(0);
	const [keysOn, setKeysOn] = (0, import_react.useState)(false);
	const activeRef = (0, import_react.useRef)(active);
	const phaseRef = (0, import_react.useRef)(phase);
	const gridRef = (0, import_react.useRef)(null);
	const piecesRef = (0, import_react.useRef)([]);
	const lockRef = (0, import_react.useRef)(false);
	const mounted = (0, import_react.useRef)(true);
	const reducedRef = (0, import_react.useRef)(false);
	const tileRef = (0, import_react.useRef)(tile);
	const boardRef = (0, import_react.useRef)(null);
	const wrapRef = (0, import_react.useRef)(null);
	const selectedRef = (0, import_react.useRef)(null);
	const cursorRef = (0, import_react.useRef)(cursor);
	const movesRef = (0, import_react.useRef)(moves);
	const stageRef = (0, import_react.useRef)(stage);
	const stageScoreRef = (0, import_react.useRef)(0);
	const totalRef = (0, import_react.useRef)(0);
	const bestRef = (0, import_react.useRef)(0);
	const bestStageRef = (0, import_react.useRef)(1);
	const muteRef = (0, import_react.useRef)(false);
	const fallGen = (0, import_react.useRef)(0);
	const floatId = (0, import_react.useRef)(0);
	const apiRef = (0, import_react.useRef)({
		start: () => {},
		swap: (_r1, _c1, _r2, _c2) => {}
	});
	activeRef.current = active;
	phaseRef.current = phase;
	tileRef.current = tile;
	selectedRef.current = selected;
	cursorRef.current = cursor;
	movesRef.current = moves;
	stageRef.current = stage;
	muteRef.current = mute;
	const setPiecesSync = (next) => {
		piecesRef.current = next;
		setPieces(next);
	};
	const wait = (ms) => new Promise((resolve) => {
		window.setTimeout(resolve, reducedRef.current ? Math.min(32, ms) : ms);
	});
	const rememberBest = (score, reached) => {
		if (score < bestRef.current) return;
		bestRef.current = score;
		bestStageRef.current = reached;
		setBest(score);
		writeSave({
			best: score,
			bestStage: reached,
			mute: muteRef.current
		});
	};
	const deal = (nextStage, keepTotal) => {
		const cfg = stageConfig(nextStage);
		const board = createBoard(cfg.kindCount, Math.random);
		gridRef.current = board;
		setPiecesSync(piecesFrom(board));
		stageRef.current = nextStage;
		setStage(nextStage);
		movesRef.current = cfg.moves;
		setMoves(cfg.moves);
		stageScoreRef.current = 0;
		setStageScore(0);
		totalRef.current = keepTotal;
		setTotal(keepTotal);
		setCombo(1);
		setSelected(null);
		setHint(null);
		setLearn(null);
		setBanner(nextStage === 1 ? "Drag a glyph onto a neighbor." : `Level ${nextStage} · ${cfg.name}.`);
		setPhase("play");
		phaseRef.current = "play";
		setHintEpoch((n) => n + 1);
	};
	const finishSwap = async (a, b) => {
		if (lockRef.current || phaseRef.current !== "play") return;
		const grid = gridRef.current;
		if (!grid) return;
		lockRef.current = true;
		setBusy(true);
		setHint(null);
		setSelected(null);
		try {
			const swapVisual = () => {
				setPiecesSync(piecesRef.current.map((p) => {
					if (p.r === a.r && p.c === a.c) return {
						...p,
						r: b.r,
						c: b.c
					};
					if (p.r === b.r && p.c === b.c) return {
						...p,
						r: a.r,
						c: a.c
					};
					return p;
				}));
			};
			swapVisual();
			await wait(120);
			if (!mounted.current) return;
			const cfg = stageConfig(stageRef.current);
			const result = trySwap(grid, a, b, Math.random, cfg.kindCount);
			if (!result.ok) {
				swapVisual();
				playSfx$1("ui");
				setBanner("That swap doesn't line three up.");
				await wait(120);
				return;
			}
			playSfx$1("pop");
			movesRef.current -= 1;
			setMoves(movesRef.current);
			for (const beat of result.beats) {
				if (!mounted.current) return;
				if (beat.type === "clear") {
					const created = new Map(beat.created.map((item) => [item.id, item.special]));
					const doomed = new Set(beat.clearedIds);
					setPiecesSync(piecesRef.current.map((p) => ({
						...p,
						special: created.get(p.id) ?? p.special,
						clearing: doomed.has(p.id)
					})));
					stageScoreRef.current += beat.score;
					totalRef.current += beat.score;
					setStageScore(stageScoreRef.current);
					setTotal(totalRef.current);
					setCombo(beat.chain);
					setBanner(beat.banner);
					floatId.current += 1;
					setFloatText({
						id: floatId.current,
						text: `+${beat.score}`
					});
					if (beat.chain > 1 && !reducedRef.current) {
						setShake(true);
						window.setTimeout(() => setShake(false), 180);
					}
					playSfx$1("pop", 1 + Math.min(.4, (beat.chain - 1) * .08));
					await wait(170);
				} else {
					const prev = new Map(piecesRef.current.map((p) => [p.id, p]));
					const next = [];
					for (let r = 0; r < beat.cells.length; r++) for (let c = 0; c < beat.cells[0].length; c++) {
						const cell = beat.cells[r][c];
						if (!cell) continue;
						const old = prev.get(cell.id);
						next.push({
							id: cell.id,
							kind: cell.kind,
							special: cell.special,
							r,
							c,
							dy: old || reducedRef.current ? 0 : -(r + 1),
							clearing: false
						});
					}
					const gen = ++fallGen.current;
					setPiecesSync(next);
					if (!reducedRef.current) requestAnimationFrame(() => {
						requestAnimationFrame(() => {
							if (!mounted.current || gen !== fallGen.current) return;
							setPiecesSync(piecesRef.current.map((p) => p.dy ? {
								...p,
								dy: 0
							} : p));
						});
					});
					if (beat.banner) setBanner(beat.banner);
					playSfx$1("fall");
					await wait(210);
				}
			}
			gridRef.current = result.grid;
			setPiecesSync(piecesFrom(result.grid));
			rememberBest(totalRef.current, stageRef.current);
			const goal = stageConfig(stageRef.current).target;
			if (stageScoreRef.current >= goal) {
				const extra = movesRef.current * 40;
				const levelPoints = stageScoreRef.current + extra;
				const nextTotal = totalRef.current + extra;
				totalRef.current = nextTotal;
				setTotal(nextTotal);
				setBonus(extra);
				setTrack(noteClear("symbols", stageRef.current, levelPoints, nextTotal));
				rememberBest(nextTotal, stageRef.current);
				setPhase("stage");
				phaseRef.current = "stage";
				playSfx$1("wave");
				setBanner("Stage clear.");
			} else if (movesRef.current <= 0) {
				setTrack(noteScore("symbols", totalRef.current));
				setPhase("over");
				phaseRef.current = "over";
				playSfx$1("over");
				setBanner("Out of moves.");
			}
		} finally {
			lockRef.current = false;
			if (mounted.current) {
				setBusy(false);
				setHintEpoch((n) => n + 1);
			}
		}
	};
	apiRef.current.start = () => {
		unlockAudio();
		deal(1, 0);
	};
	apiRef.current.swap = (r1, c1, r2, c2) => {
		finishSwap({
			r: r1,
			c: c1
		}, {
			r: r2,
			c: c2
		});
	};
	(0, import_react.useEffect)(() => {
		mounted.current = true;
		const save = loadSave();
		setBest(save.best);
		setMute(save.mute);
		bestRef.current = save.best;
		bestStageRef.current = save.bestStage;
		muteRef.current = save.mute;
		const prog = loadProgress();
		setTrack(prog.tracks.symbols);
		if (prog.tracks.symbols.best > save.best) {
			setBest(prog.tracks.symbols.best);
			bestRef.current = prog.tracks.symbols.best;
		}
		reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const errors = selfCheck();
		if (errors.length) console.error("Symbol Match self-check", errors);
		const onKey = (e) => {
			if (!activeRef.current) return;
			if (e.code === "KeyM") {
				const next = !muteRef.current;
				muteRef.current = next;
				setMute(next);
				setMuted(next);
				writeSave({
					best: bestRef.current,
					bestStage: bestStageRef.current,
					mute: next
				});
				return;
			}
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
			if (phaseRef.current !== "play" || lockRef.current) return;
			setKeysOn(true);
			const cur = cursorRef.current;
			let next = cur;
			if (e.code === "ArrowLeft" || e.code === "KeyA") next = {
				r: cur.r,
				c: Math.max(0, cur.c - 1)
			};
			else if (e.code === "ArrowRight" || e.code === "KeyD") next = {
				r: cur.r,
				c: Math.min(6, cur.c + 1)
			};
			else if (e.code === "ArrowUp" || e.code === "KeyW") next = {
				r: Math.max(0, cur.r - 1),
				c: cur.c
			};
			else if (e.code === "ArrowDown" || e.code === "KeyS") next = {
				r: Math.min(7, cur.r + 1),
				c: cur.c
			};
			else if (e.code === "Space" || e.code === "Enter") {
				e.preventDefault();
				const picked = selectedRef.current;
				if (picked && adjacent(picked, cur) && !samePos(picked, cur)) apiRef.current.swap(picked.r, picked.c, cur.r, cur.c);
				else setSelected(samePos(picked, cur) ? null : cur);
				return;
			} else return;
			e.preventDefault();
			setCursor(next);
			cursorRef.current = next;
		};
		window.addEventListener("keydown", onKey);
		const onVis = () => {
			if (document.visibilityState === "visible") resumeAudio();
		};
		document.addEventListener("visibilitychange", onVis);
		window.__matchTest = {
			start: () => apiRef.current.start(),
			swap: (r1, c1, r2, c2) => apiRef.current.swap(r1, c1, r2, c2),
			phase: () => phaseRef.current,
			score: () => totalRef.current,
			moves: () => movesRef.current,
			stage: () => stageRef.current,
			busy: () => lockRef.current,
			grid: () => gridRef.current?.map((row) => row.map((cell) => cell ? cell.kind : -1)) ?? [],
			hint: () => gridRef.current ? findHint(gridRef.current) : null
		};
		return () => {
			mounted.current = false;
			window.removeEventListener("keydown", onKey);
			document.removeEventListener("visibilitychange", onVis);
			delete window.__matchTest;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (active) setMuted(muteRef.current);
	}, [active]);
	(0, import_react.useEffect)(() => {
		if (!active || phase !== "play" || busy) return;
		const id = window.setTimeout(() => {
			const grid = gridRef.current;
			if (!grid || lockRef.current) return;
			setHint(findHint(grid));
		}, 7e3);
		return () => window.clearTimeout(id);
	}, [
		active,
		phase,
		busy,
		hintEpoch
	]);
	(0, import_react.useEffect)(() => {
		const el = wrapRef.current;
		if (!el) return;
		const measure = () => {
			const w = el.clientWidth;
			const h = el.clientHeight;
			if (w < 48 || h < 48) return;
			const byW = Math.floor((w - GAP * 6) / 7);
			const byH = Math.floor((h - GAP * 7) / 8);
			setTile(Math.max(34, Math.min(64, byW, byH)));
		};
		measure();
		const obs = new ResizeObserver(measure);
		obs.observe(el);
		return () => obs.disconnect();
	}, [phase, active]);
	const cfg = stageConfig(stage);
	const stride = tile + GAP;
	const boardW = 7 * tile + GAP * 6;
	const boardH = 8 * tile + GAP * 7;
	const posFrom = (clientX, clientY) => {
		const el = boardRef.current;
		if (!el) return null;
		const rect = el.getBoundingClientRect();
		const x = clientX - rect.left;
		const y = clientY - rect.top;
		if (x < 0 || y < 0 || x >= rect.width || y >= rect.height) return null;
		return {
			r: Math.min(7, Math.max(0, Math.floor(y / stride))),
			c: Math.min(6, Math.max(0, Math.floor(x / stride)))
		};
	};
	const drag = (0, import_react.useRef)(null);
	const onMute = () => {
		unlockAudio();
		const next = !mute;
		setMute(next);
		muteRef.current = next;
		setMuted(next);
		writeSave({
			best: bestRef.current,
			bestStage: bestStageRef.current,
			mute: next
		});
	};
	const progress = Math.min(100, Math.round(stageScore / cfg.target * 100));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative flex h-dvh flex-col overflow-hidden bg-ink text-cream",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "flex shrink-0 flex-col gap-2 border-b border-line px-3 py-2 sm:px-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-9 shrink-0 place-items-center rounded-lg border border-gold/50 bg-panel font-mono text-lg text-gold",
						children: "Σ"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "truncate text-base font-extrabold leading-none tracking-tight sm:text-lg",
							children: "Symbol Match"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 font-mono text-xs text-mist",
							children: [phase === "menu" ? "Math and physics glyphs" : `Level ${stage}${stage > cfg.total ? " · apex" : ` / ${cfg.total}`}`, combo >= 2 && phase === "play" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "ml-2 text-gold",
								children: ["×", combo]
							}) : null]
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: `text-right ${phase === "menu" ? "max-sm:hidden" : ""}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-mono text-xl leading-none font-semibold text-gold tabular-nums",
								children: total
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 font-mono text-xs text-mist tabular-nums",
								children: ["best ", best]
							})]
						}),
						onExit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArcadeExit, { onExit }) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: onMute,
							className: "grid size-11 place-items-center rounded-full border border-line bg-panel",
							"aria-label": mute ? "Unmute" : "Mute",
							children: mute ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" })
						}),
						phase === "play" || phase === "pause" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								const next = phase === "pause" ? "play" : "pause";
								if (next === "pause" && lockRef.current) return;
								setPhase(next);
								phaseRef.current = next;
							},
							className: "grid size-11 place-items-center rounded-full border border-line bg-panel",
							"aria-label": phase === "pause" ? "Resume" : "Pause",
							children: phase === "pause" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" })
						}) : null
					]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-0 flex-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
				className: "hidden w-72 shrink-0 flex-col gap-3 overflow-y-auto border-r border-line bg-panel/80 p-4 lg:flex",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Codex, {
					kindCount: cfg.kindCount,
					learn,
					onLearn: setLearn
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "relative flex min-w-0 flex-1 flex-col",
				children: [
					phase === "menu" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-1 items-center justify-center p-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "max-h-full w-full max-w-md overflow-y-auto rounded-2xl border border-line bg-panel/90 p-6 shadow-2xl",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-mono text-xs tracking-widest text-gold",
									children: "GLYPH LATTICE"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-2 text-4xl font-extrabold tracking-tight",
									children: "Match the symbols."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-sm leading-relaxed text-mist",
									children: "Sixteen levels of real math and physics glyphs. Line up three, and the lattice tells you what you just cleared."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 flex justify-center gap-3 font-mono text-3xl",
									children: SYMBOLS.slice(0, 5).map((symbol) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: symbol.field === "physics" ? "text-mint" : "text-gold",
										children: symbol.glyph
									}, symbol.id))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
									className: "mt-4 space-y-2 text-sm leading-relaxed",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Drag a glyph onto a neighbor, or tap two that touch. Arrows move, Space picks up and drops." }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Four in a line forges a row or column clearer. Five forges a nova. An L or a T forges a burst." }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Swap a nova into a glyph to wipe that glyph. Chains multiply. Hit the proof target before moves run out." })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-4 font-mono text-xs text-mist",
									children: [
										"Cleared ",
										track.cleared,
										track.cleared > cfg.total ? "" : ` / ${cfg.total}`,
										Math.max(best, track.best) > 0 ? ` · best ${Math.max(best, track.best)}` : ""
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => {
										unlockAudio();
										deal(Math.max(1, track.cleared + 1), 0);
									},
									className: "mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold text-base font-extrabold text-ink",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), track.cleared > 0 ? `Continue · ${track.cleared + 1}` : "Play"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LevelGrid, {
										count: cfg.total,
										cleared: track.cleared,
										scores: track.scores,
										onPlay: (n) => {
											unlockAudio();
											deal(n, 0);
										}
									})
								}),
								track.cleared >= cfg.total ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-2 text-xs text-mist",
									children: [
										"Apex levels continue after ",
										cfg.total,
										"."
									]
								}) : null
							]
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mx-auto w-full max-w-md px-3 pt-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-baseline justify-between gap-3 font-mono text-xs text-mist",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										"Proof ",
										stageScore,
										" / ",
										cfg.target
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: moves <= 3 ? "text-danger" : "",
										children: [moves, " moves"]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1 h-2 overflow-hidden rounded-full bg-line",
									"aria-hidden": true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-full bg-gold",
										style: { width: `${progress}%` }
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 flex gap-2 overflow-x-auto pb-1 lg:hidden",
									children: SYMBOLS.slice(0, cfg.kindCount).map((symbol, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setLearn((cur) => cur === index ? null : index),
										className: learn === index ? "min-h-11 shrink-0 rounded-full border border-gold bg-ink px-3 font-mono text-lg text-gold" : "min-h-11 shrink-0 rounded-full border border-line bg-ink px-3 font-mono text-lg",
										"aria-label": symbol.name,
										"aria-pressed": learn === index,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: fieldClass(index),
											children: symbol.glyph
										})
									}, symbol.id))
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							ref: wrapRef,
							className: "flex min-h-0 flex-1 items-center justify-center px-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative",
								children: [floatText ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "pointer-events-none absolute -top-7 right-0 left-0 z-20 flex justify-center",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "score-float font-mono text-lg text-gold",
										children: floatText.text
									}, floatText.id)
								}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									ref: boardRef,
									role: "grid",
									tabIndex: 0,
									"aria-label": "Symbol match board. Drag a glyph onto a neighbor to swap.",
									"aria-busy": busy,
									className: `relative touch-none overflow-hidden rounded-2xl select-none ${shake ? "lattice-shake" : ""}`,
									style: {
										width: boardW,
										height: boardH
									},
									onPointerDown: (e) => {
										if (phaseRef.current !== "play" || lockRef.current) return;
										const pos = posFrom(e.clientX, e.clientY);
										if (!pos) return;
										unlockAudio();
										e.currentTarget.setPointerCapture(e.pointerId);
										drag.current = {
											r: pos.r,
											c: pos.c,
											x: e.clientX,
											y: e.clientY,
											used: false
										};
										setHint(null);
									},
									onPointerMove: (e) => {
										const origin = drag.current;
										if (!origin || origin.used || lockRef.current) return;
										const dx = e.clientX - origin.x;
										const dy = e.clientY - origin.y;
										if (Math.hypot(dx, dy) < Math.max(18, tileRef.current * .38)) return;
										const target = Math.abs(dx) > Math.abs(dy) ? {
											r: origin.r,
											c: origin.c + Math.sign(dx)
										} : {
											r: origin.r + Math.sign(dy),
											c: origin.c
										};
										if (target.r < 0 || target.c < 0 || target.r >= 8 || target.c >= 7) return;
										origin.used = true;
										finishSwap({
											r: origin.r,
											c: origin.c
										}, target);
									},
									onPointerUp: () => {
										const origin = drag.current;
										drag.current = null;
										if (!origin || origin.used || lockRef.current || phaseRef.current !== "play") return;
										const pos = {
											r: origin.r,
											c: origin.c
										};
										const picked = selectedRef.current;
										if (picked && adjacent(picked, pos) && !samePos(picked, pos)) {
											setSelected(null);
											finishSwap(picked, pos);
											return;
										}
										setSelected(samePos(picked, pos) ? null : pos);
										setCursor(pos);
									},
									onPointerCancel: () => {
										drag.current = null;
									},
									children: pieces.map((piece) => {
										const symbol = SYMBOLS[piece.kind];
										const hinted = hint?.some((p) => p.r === piece.r && p.c === piece.c) ?? false;
										const isSel = samePos(selected, piece);
										const isCur = keysOn && cursor.r === piece.r && cursor.c === piece.c;
										const dim = learn !== null && learn !== piece.kind;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											role: "gridcell",
											"aria-selected": isSel,
											"aria-label": `${symbol?.name ?? "Glyph"}${piece.special ? `, ${piece.special}` : ""}`,
											className: `absolute left-0 top-0 grid place-items-center rounded-xl border bg-panel-2 transition-[transform,opacity] duration-200 ease-out motion-reduce:transition-none ${isSel || hinted ? "border-gold" : "border-line"} ${isCur && !isSel ? "ring-1 ring-mist" : ""}`,
											style: {
												width: tile,
												height: tile,
												transform: `translate(${piece.c * stride}px, ${(piece.r + piece.dy) * stride}px) scale(${piece.clearing ? .2 : 1})`,
												opacity: piece.clearing ? 0 : dim ? .35 : 1,
												zIndex: isSel ? 2 : 1,
												fontSize: Math.max(18, Math.floor(tile * .46))
											},
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: `font-mono leading-none ${fieldClass(piece.kind)}`,
													children: symbol?.glyph
												}),
												piece.special === "row" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute bottom-1.5 left-1/2 h-1 w-2/3 -translate-x-1/2 rounded-full bg-gold" }) : null,
												piece.special === "col" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute top-1/2 right-1.5 h-2/3 w-1 -translate-y-1/2 rounded-full bg-gold" }) : null,
												piece.special === "burst" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-1 rounded-lg border border-dashed border-gold" }) : null,
												piece.special === "nova" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-1 rounded-full border-2 border-gold" }) : null
											]
										}, piece.id);
									})
								})]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"aria-live": "polite",
							className: "mx-auto min-h-12 max-w-md px-4 pb-3 text-center text-sm leading-relaxed text-mist",
							children: learn !== null && SYMBOLS[learn] ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: fieldClass(learn),
								children: [
									SYMBOLS[learn].glyph,
									" ",
									SYMBOLS[learn].name,
									". "
								]
							}), SYMBOLS[learn].blurb] }) : banner
						})
					] }),
					phase === "pause" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Overlay$1, {
						kicker: "Paused",
						title: "The lattice can wait.",
						body: "Your moves are still on the board.",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
								setPhase("play");
								phaseRef.current = "play";
							},
							className: "flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold font-extrabold text-ink",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), "Resume"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								setPhase("menu");
								phaseRef.current = "menu";
							},
							className: "mt-2 min-h-11 w-full rounded-xl border border-line font-bold",
							children: "Menu"
						})]
					}) : null,
					phase === "stage" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overlay$1, {
						kicker: `Level ${stage} clear`,
						title: "The proof holds.",
						body: `Bonus ${bonus} for moves left. Total ${total}.`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => deal(stage + 1, totalRef.current),
							className: "flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold font-extrabold text-ink",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), "Next stage"]
						})
					}) : null,
					phase === "over" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Overlay$1, {
						kicker: total >= best ? "Best run" : "Out of moves",
						title: "The lattice closed.",
						body: `Score ${total} · level ${stage}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => deal(1, 0),
							className: "flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold font-extrabold text-ink",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" }), "Play again"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								setPhase("menu");
								phaseRef.current = "menu";
							},
							className: "mt-2 min-h-11 w-full rounded-xl border border-line font-bold",
							children: "Menu"
						})]
					}) : null
				]
			})]
		})]
	});
}
function Codex({ kindCount, learn, onLearn }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-mono text-xs tracking-widest text-gold",
			children: "SYMBOL BOOK"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm leading-relaxed text-mist",
			children: "Gold is math. Mint is physics. Tap a glyph to light it on the board."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 space-y-2",
			children: SYMBOLS.map((symbol, index) => {
				const locked = index >= kindCount;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					disabled: locked,
					onClick: () => onLearn(learn === index ? null : index),
					className: "flex min-h-11 w-full items-start gap-3 rounded-xl border border-line bg-ink px-3 py-2 text-left disabled:opacity-40",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: `font-mono text-2xl leading-none ${fieldClass(index)}`,
						children: symbol.glyph
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "block text-sm font-bold",
						children: [symbol.name, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-2 font-mono text-xs font-normal text-mist",
							children: symbol.field === "math" ? "Math" : "Physics"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1 block text-xs leading-relaxed text-mist",
						children: locked ? "Arrives on a later level." : symbol.blurb
					})] })]
				}, symbol.id);
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 text-xs leading-relaxed text-mist",
			children: "A bar clears that row or column. A dashed box bursts a 3×3. A ring is a nova — swap it into any glyph to clear every copy."
		})
	] });
}
function Overlay$1({ kicker, title, body, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-30 flex items-center justify-center bg-ink/55 p-4 backdrop-blur-sm",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm rounded-2xl border border-line bg-panel p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs tracking-widest text-gold",
					children: kicker
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-2 text-3xl font-extrabold tracking-tight",
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-mist",
					children: body
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5",
					children
				})
			]
		})
	});
}
var HEARTS = 3;
function shuffle(list) {
	const next = [...list];
	for (let i = next.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		const swap = next[i];
		next[i] = next[j];
		next[j] = swap;
	}
	return next;
}
function ThereforeProof({ active = true, onExit }) {
	const [phase, setPhase] = (0, import_react.useState)("menu");
	const [level, setLevel] = (0, import_react.useState)(1);
	const [claims, setClaims] = (0, import_react.useState)([]);
	const [index, setIndex] = (0, import_react.useState)(0);
	const [hearts, setHearts] = (0, import_react.useState)(HEARTS);
	const [score, setScore] = (0, import_react.useState)(0);
	const [levelScore, setLevelScore] = (0, import_react.useState)(0);
	const [blurb, setBlurb] = (0, import_react.useState)("Read the premises. Then say if the claim must follow.");
	const [bonus, setBonus] = (0, import_react.useState)(0);
	const [track, setTrack] = (0, import_react.useState)({
		best: 0,
		cleared: 0,
		scores: [],
		lastPlayed: 0
	});
	const [mute, setMute] = (0, import_react.useState)(false);
	const [picked, setPicked] = (0, import_react.useState)(null);
	const [shake, setShake] = (0, import_react.useState)(false);
	const phaseRef = (0, import_react.useRef)(phase);
	const activeRef = (0, import_react.useRef)(active);
	const lockRef = (0, import_react.useRef)(false);
	const scoreRef = (0, import_react.useRef)(0);
	const levelScoreRef = (0, import_react.useRef)(0);
	const heartsRef = (0, import_react.useRef)(HEARTS);
	const levelRef = (0, import_react.useRef)(1);
	const indexRef = (0, import_react.useRef)(0);
	const claimsRef = (0, import_react.useRef)([]);
	const missesRef = (0, import_react.useRef)(0);
	const startedRef = (0, import_react.useRef)(0);
	const muteRef = (0, import_react.useRef)(false);
	const mounted = (0, import_react.useRef)(true);
	phaseRef.current = phase;
	activeRef.current = active;
	muteRef.current = mute;
	const begin = (nextLevel, keepScore) => {
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
		playSfx$1("wave");
		if (spec.id >= LOGIC_LEVELS.length) {
			setPhase("done");
			phaseRef.current = "done";
			return;
		}
		setPhase("clear");
		phaseRef.current = "clear";
	};
	const judgeRef = (0, import_react.useRef)(() => {});
	judgeRef.current = (follows) => {
		if (lockRef.current || phaseRef.current !== "play") return;
		const claim = claimsRef.current[indexRef.current];
		const spec = LOGIC_LEVELS[levelRef.current - 1];
		if (!claim || !spec) return;
		unlockAudio();
		lockRef.current = true;
		setPicked(follows);
		if (follows === claim.follows) {
			const elapsed = (performance.now() - startedRef.current) / 1e3;
			const gained = 140 + Math.max(0, Math.round((8 - elapsed) * 8));
			levelScoreRef.current += gained;
			scoreRef.current += gained;
			setLevelScore(levelScoreRef.current);
			setScore(scoreRef.current);
			setBlurb(claim.blurb);
			playSfx$1("pop");
		} else {
			missesRef.current += 1;
			heartsRef.current -= 1;
			setHearts(heartsRef.current);
			setBlurb(claim.blurb);
			playSfx$1("over");
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
	(0, import_react.useEffect)(() => {
		mounted.current = true;
		const progress = loadProgress();
		setTrack(progress.tracks.logic);
		const errors = auditLogic();
		if (errors.length) console.error("Therefore audit", errors);
		const onVis = () => {
			if (document.visibilityState === "visible") resumeAudio();
		};
		const onKey = (e) => {
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
	(0, import_react.useEffect)(() => {
		if (active) setMuted(muteRef.current);
	}, [active]);
	const spec = LOGIC_LEVELS[level - 1] ?? LOGIC_LEVELS[0];
	const claim = claims[index];
	const continueLevel = Math.min(LOGIC_LEVELS.length, track.cleared + 1);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative flex h-dvh flex-col overflow-hidden bg-ink text-cream",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "flex shrink-0 flex-col gap-2 border-b border-line px-3 py-2 sm:px-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-9 shrink-0 place-items-center rounded-lg border border-gold/50 bg-panel font-mono text-lg text-gold",
							children: "∴"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "truncate text-base font-extrabold leading-none tracking-tight sm:text-lg",
								children: "Therefore"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 font-mono text-xs text-mist",
								children: phase === "menu" ? "Does the claim follow?" : `Level ${level} / ${LOGIC_LEVELS.length}`
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: `text-right ${phase === "menu" ? "max-sm:hidden" : ""}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-mono text-xl leading-none font-semibold text-gold tabular-nums",
									children: score
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-1 font-mono text-xs text-mist tabular-nums",
									children: ["best ", Math.max(track.best, score)]
								})]
							}),
							onExit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArcadeExit, { onExit }) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									unlockAudio();
									const next = !mute;
									setMute(next);
									muteRef.current = next;
									setMuted(next);
								},
								className: "grid size-11 place-items-center rounded-full border border-line bg-panel",
								"aria-label": mute ? "Unmute" : "Mute",
								children: mute ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" })
							}),
							phase === "play" || phase === "pause" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									if (phase === "play" && lockRef.current) return;
									const next = phase === "pause" ? "play" : "pause";
									setPhase(next);
									phaseRef.current = next;
								},
								className: "grid size-11 place-items-center rounded-full border border-line bg-panel",
								"aria-label": phase === "pause" ? "Resume" : "Pause",
								children: phase === "pause" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" })
							}) : null
						]
					})]
				})
			}),
			phase === "menu" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-1 items-center justify-center overflow-y-auto p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-md rounded-2xl border border-line bg-panel/90 p-6 shadow-2xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs tracking-widest text-gold",
							children: "LOGIC"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-2 text-4xl font-extrabold tracking-tight",
							children: "Say what follows."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm leading-relaxed text-mist",
							children: "Premises stay on the table. Each claim either must be true, or it does not. Keys 1 and 2. A miss costs a heart. Sixteen levels."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-4 font-mono text-xs text-mist",
							children: [
								"Cleared ",
								track.cleared,
								" / ",
								LOGIC_LEVELS.length,
								track.best > 0 ? ` · best ${track.best}` : ""
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
								unlockAudio();
								begin(continueLevel, 0);
							},
							className: "mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold text-base font-extrabold text-ink",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), track.cleared > 0 ? `Continue · ${continueLevel}` : "Play"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LevelGrid, {
								count: LOGIC_LEVELS.length,
								cleared: track.cleared,
								scores: track.scores,
								onPlay: (n) => {
									unlockAudio();
									begin(n, 0);
								}
							})
						})
					]
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: `flex min-h-0 flex-1 flex-col ${shake ? "lattice-shake" : ""}`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mx-auto w-full max-w-lg px-3 pt-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-end justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-mono text-xs tracking-widest text-mist",
								children: [
									spec.title,
									" · ",
									index + 1,
									"/",
									claims.length || spec.claims.length
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 font-mono text-xs text-gold",
								children: spec.move
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-right",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "font-mono text-xs text-mist",
									children: ["this level ", levelScore]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1 flex justify-end gap-1",
									"aria-label": `${hearts} hearts left`,
									children: Array.from({ length: HEARTS }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, {
										className: i < hearts ? "size-4 text-danger" : "size-4 text-line",
										fill: i < hearts ? "currentColor" : "none"
									}, i))
								})]
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mx-auto min-h-0 w-full max-w-lg flex-1 overflow-y-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex min-h-full flex-col justify-center px-3 py-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-2xl border border-line bg-panel px-4 py-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-mono text-xs tracking-widest text-mist",
										children: "GIVEN"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
										className: "mt-2 space-y-1 text-sm leading-relaxed text-cream",
										children: spec.premises.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: line }, line))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 rounded-2xl border border-gold/50 bg-ink px-4 py-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-mono text-xs tracking-widest text-gold",
										children: "THEREFORE?"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-xl font-extrabold leading-snug tracking-tight",
										children: claim?.text
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 grid grid-cols-2 gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										disabled: phase !== "play" || picked != null,
										onClick: () => judgeRef.current(true),
										className: `flex min-h-16 flex-col items-center justify-center rounded-xl border px-2 ${picked == null ? "border-line bg-panel-2" : claim?.follows ? "border-gold bg-panel" : picked ? "border-danger bg-panel" : "border-line bg-ink opacity-60"}`,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-mono text-xs text-mist",
											children: "1"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-base font-extrabold",
											children: "Follows"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										disabled: phase !== "play" || picked != null,
										onClick: () => judgeRef.current(false),
										className: `flex min-h-16 flex-col items-center justify-center rounded-xl border px-2 ${picked == null ? "border-line bg-panel-2" : claim && !claim.follows ? "border-gold bg-panel" : picked === false ? "border-danger bg-panel" : "border-line bg-ink opacity-60"}`,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-mono text-xs text-mist",
											children: "2"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-base font-extrabold",
											children: "Doesn't"
										})]
									})]
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"aria-live": "polite",
						className: "mx-auto min-h-12 w-full max-w-lg px-4 pb-3 text-center text-sm leading-relaxed text-mist",
						children: blurb
					})
				]
			}),
			phase === "pause" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Overlay, {
				kicker: "Paused",
				title: "The premises can wait.",
				body: "Hearts and score stay put.",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => {
						setPhase("play");
						phaseRef.current = "play";
					},
					className: "flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold font-extrabold text-ink",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), "Resume"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						setTrack(noteScore("logic", scoreRef.current));
						setPhase("menu");
						phaseRef.current = "menu";
					},
					className: "mt-2 min-h-11 w-full rounded-xl border border-line font-bold",
					children: "Menu"
				})]
			}) : null,
			phase === "clear" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overlay, {
				kicker: `Level ${level} clear`,
				title: "That followed.",
				body: `Clear bonus ${bonus}. This level ${levelScore}. Run ${score}.`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => begin(level + 1, scoreRef.current),
					className: "flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold font-extrabold text-ink",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), "Next level"]
				})
			}) : null,
			phase === "done" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overlay, {
				kicker: "Book closed",
				title: "Every claim was judged.",
				body: `Score ${score}. Best ${Math.max(track.best, score)}. Replay any level from the menu.`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						setPhase("menu");
						phaseRef.current = "menu";
					},
					className: "min-h-12 w-full rounded-xl bg-gold font-extrabold text-ink",
					children: "Level select"
				})
			}) : null,
			phase === "over" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Overlay, {
				kicker: score >= track.best ? "Best run" : "Out of hearts",
				title: "That did not follow.",
				body: `Score ${score} · level ${level}. ${blurb}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => begin(level, 0),
					className: "flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold font-extrabold text-ink",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" }), "Retry level"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						setPhase("menu");
						phaseRef.current = "menu";
					},
					className: "mt-2 min-h-11 w-full rounded-xl border border-line font-bold",
					children: "Menu"
				})]
			}) : null
		]
	});
}
function Overlay({ kicker, title, body, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-30 flex items-center justify-center bg-ink/55 p-4 backdrop-blur-sm",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm rounded-2xl border border-line bg-panel p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs tracking-widest text-gold",
					children: kicker
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-2 text-3xl font-extrabold tracking-tight",
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-mist",
					children: body
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5",
					children
				})
			]
		})
	});
}
function v(x, y) {
	return {
		x,
		y
	};
}
function addV(a, b) {
	return {
		x: a.x + b.x,
		y: a.y + b.y
	};
}
function subV(a, b) {
	return {
		x: a.x - b.x,
		y: a.y - b.y
	};
}
function sameV(a, b) {
	return a.x === b.x && a.y === b.y;
}
function formatV(p) {
	return `(${p.x}, ${p.y})`;
}
var LAWS = {
	position: "A card adds straight to position. The resultant is the sum of the cards you have played.",
	velocity: "A card adds to velocity. Position then steps by that new velocity.",
	acceleration: "A card adds to acceleration. Velocity adds that acceleration. Position then adds velocity.",
	momentum: "A card is an impulse. Change in velocity = impulse ÷ mass. Position then steps by velocity.",
	intercept: "Thrust works like velocity. The target steps only when you miss it."
};
function level(id, title, kind, blurb, start, target0, cards, solution, span, targetStep = v(0, 0), mass = 1) {
	return {
		id,
		title,
		kind,
		blurb,
		law: LAWS[kind],
		start,
		target0,
		targetStep,
		mass,
		cards,
		solution,
		span
	};
}
var DRIFT_LEVELS = [
	level(1, "Two steps east", "position", "Land on the mark. Order only changes the trail.", v(0, 0), v(3, 1), [
		v(2, 0),
		v(1, 1),
		v(0, 2),
		v(-1, 0)
	], [0, 1], 5),
	level(2, "North then east", "position", "Leave the decoys in the tray.", v(0, 0), v(1, 2), [
		v(0, 1),
		v(0, 1),
		v(1, 0),
		v(2, -1)
	], [
		0,
		1,
		2
	], 5),
	level(3, "One correction", "position", "You already have a head start.", v(1, 1), v(2, 0), [
		v(1, -1),
		v(2, 0),
		v(-1, 1),
		v(0, 2)
	], [0], 4),
	level(4, "Cancel the extra", "position", "A later card can give length back.", v(0, 0), v(1, 1), [
		v(2, 2),
		v(-1, -1),
		v(3, 0),
		v(0, -2)
	], [0, 1], 5),
	level(5, "Build speed", "velocity", "Two equal burns. The second step is longer.", v(0, 0), v(3, 0), [
		v(1, 0),
		v(1, 0),
		v(2, 0),
		v(0, 1)
	], [0, 1], 6),
	level(6, "Rise, then run", "velocity", "Velocity stays. It does not reset between cards.", v(0, 0), v(1, 2), [
		v(0, 1),
		v(1, 0),
		v(2, 0),
		v(0, -1)
	], [0, 1], 5),
	level(7, "Three burns", "velocity", "Count the steps. Earlier thrust is still in the velocity.", v(0, 0), v(4, 2), [
		v(1, 0),
		v(0, 1),
		v(1, 0),
		v(0, 2)
	], [
		0,
		1,
		2
	], 7),
	level(8, "Give speed back", "velocity", "A negative card subtracts from velocity before the step.", v(0, 0), v(5, 2), [
		v(2, 0),
		v(0, 1),
		v(-1, 0),
		v(0, -2)
	], [
		0,
		1,
		2
	], 8),
	level(9, "One push", "acceleration", "The card is acceleration for this burn, then it stays in the total.", v(0, 0), v(1, 0), [
		v(1, 0),
		v(0, 1),
		v(-1, 0),
		v(2, 0)
	], [0], 4),
	level(10, "Acceleration stacks", "acceleration", "The same burn twice is not the same as two velocity burns.", v(0, 0), v(4, 0), [
		v(1, 0),
		v(1, 0),
		v(0, 2),
		v(-1, 0)
	], [0, 1], 7),
	level(11, "Turn the push", "acceleration", "Add north, then add east. Both stay in the acceleration.", v(0, 0), v(1, 3), [
		v(0, 1),
		v(1, 0),
		v(0, -1),
		v(2, 0)
	], [0, 1], 6),
	level(12, "Mass 2", "momentum", "Impulse (2, 0) on mass 2 changes velocity by (1, 0).", v(0, 0), v(3, 0), [
		v(2, 0),
		v(2, 0),
		v(0, 2),
		v(4, 0)
	], [0, 1], 6, v(0, 0), 2),
	level(13, "Mass 3", "momentum", "Δv = impulse ÷ 3. The step still uses the new velocity.", v(0, 0), v(2, 1), [
		v(3, 0),
		v(0, 3),
		v(3, 3),
		v(0, -3)
	], [0, 1], 6, v(0, 0), 3),
	level(14, "Catch the buoy", "intercept", "It drifts east after every miss. Meet it on a burn.", v(0, 0), v(2, 0), [
		v(1, 0),
		v(1, 0),
		v(0, 1),
		v(-1, 0)
	], [0, 1], 6, v(1, 0)),
	level(15, "Climbing buoy", "intercept", "The buoy steps north only when you are not on it.", v(0, 0), v(0, 2), [
		v(0, 1),
		v(0, 1),
		v(1, 0),
		v(0, -1)
	], [0, 1], 6, v(0, 1)),
	level(16, "Crossing", "intercept", "East, then north. The buoy has moved by the time you arrive.", v(0, 0), v(1, 1), [
		v(1, 0),
		v(0, 1),
		v(1, 0),
		v(0, -1)
	], [0, 1], 6, v(1, 0))
];
function beginDrift(level) {
	return {
		pos: { ...level.start },
		vel: v(0, 0),
		acc: v(0, 0),
		target: { ...level.target0 },
		used: level.cards.map(() => false),
		trail: [{ ...level.start }],
		applied: v(0, 0),
		resultant: v(0, 0),
		turn: 0,
		met: sameV(level.start, level.target0)
	};
}
function integrate(level, state, card) {
	if (level.kind === "position") return {
		pos: addV(state.pos, card),
		vel: { ...card },
		acc: v(0, 0)
	};
	if (level.kind === "velocity" || level.kind === "intercept") {
		const vel = addV(state.vel, card);
		return {
			pos: addV(state.pos, vel),
			vel,
			acc: { ...state.acc }
		};
	}
	if (level.kind === "acceleration") {
		const acc = addV(state.acc, card);
		const vel = addV(state.vel, acc);
		return {
			pos: addV(state.pos, vel),
			vel,
			acc
		};
	}
	if (card.x % level.mass !== 0 || card.y % level.mass !== 0) return null;
	const dv = v(card.x / level.mass, card.y / level.mass);
	const vel = addV(state.vel, dv);
	return {
		pos: addV(state.pos, vel),
		vel,
		acc: dv
	};
}
function applyDrift(level, state, index) {
	if (state.met) return null;
	if (index < 0 || index >= level.cards.length || state.used[index]) return null;
	const card = level.cards[index];
	const next = integrate(level, state, card);
	if (!next) return null;
	const met = sameV(next.pos, state.target);
	const target = met || level.kind !== "intercept" ? state.target : addV(state.target, level.targetStep);
	const used = state.used.slice();
	used[index] = true;
	return {
		pos: next.pos,
		vel: next.vel,
		acc: next.acc,
		target,
		used,
		trail: [...state.trail, next.pos],
		applied: { ...card },
		resultant: subV(next.pos, level.start),
		turn: state.turn + 1,
		met
	};
}
function useFlight(pos) {
	const [shown, setShown] = (0, import_react.useState)(pos);
	const from = (0, import_react.useRef)(pos);
	(0, import_react.useEffect)(() => {
		if (prefersReducedMotion()) {
			from.current = pos;
			setShown(pos);
			return;
		}
		const start = from.current;
		const t0 = performance.now();
		let raf = 0;
		const loop = (now) => {
			const u = Math.min(1, (now - t0) / 280);
			setShown({
				x: start.x + (pos.x - start.x) * u,
				y: start.y + (pos.y - start.y) * u
			});
			if (u < 1) raf = requestAnimationFrame(loop);
			else from.current = pos;
		};
		raf = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(raf);
	}, [pos.x, pos.y]);
	return shown;
}
function Field({ level, state, ship }) {
	const span = level.span;
	const size = 280;
	const mapX = (n) => (n + span) / (span * 2) * size;
	const mapY = (n) => size - (n + span) / (span * 2) * size;
	const trail = state.trail.map((point) => `${mapX(point.x)},${mapY(point.y)}`).join(" ");
	const ticks = [];
	for (let n = -span; n <= span; n += 1) ticks.push(n);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: `0 0 ${size} ${size}`,
		className: "mx-auto aspect-square w-full max-w-md",
		role: "img",
		"aria-label": `Craft at ${formatV(state.pos)}, mark at ${formatV(state.target)}`,
		children: [
			ticks.map((tick) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				className: "text-line",
				stroke: "currentColor",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: mapX(tick),
					y1: 0,
					x2: mapX(tick),
					y2: size
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: 0,
					y1: mapY(tick),
					x2: size,
					y2: mapY(tick)
				})]
			}, tick)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: mapX(-span),
				y1: mapY(0),
				x2: mapX(span),
				y2: mapY(0),
				className: "text-mist",
				stroke: "currentColor"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: mapX(0),
				y1: mapY(-span),
				x2: mapX(0),
				y2: mapY(span),
				className: "text-mist",
				stroke: "currentColor"
			}),
			state.turn > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: mapX(level.start.x),
				y1: mapY(level.start.y),
				x2: mapX(state.pos.x),
				y2: mapY(state.pos.y),
				className: "text-cream",
				stroke: "currentColor",
				strokeDasharray: "5 4",
				strokeWidth: "1.5"
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", {
				points: trail,
				fill: "none",
				className: "text-gold",
				stroke: "currentColor",
				strokeWidth: "2.5"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: mapX(state.target.x),
				cy: mapY(state.target.y),
				r: "8",
				className: "text-mint",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "2"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: mapX(ship.x),
				cy: mapY(ship.y),
				r: "5.5",
				className: "text-gold",
				fill: "currentColor"
			})
		]
	});
}
function VectorDrift({ onExit, onQuestions }) {
	const [levelId, setLevelId] = (0, import_react.useState)(1);
	const level = DRIFT_LEVELS[levelId - 1] ?? DRIFT_LEVELS[0];
	const [state, setState] = (0, import_react.useState)(() => beginDrift(level));
	const [run, setRun] = (0, import_react.useState)(0);
	const scored = (0, import_react.useRef)(false);
	const ship = useFlight(state.pos);
	(0, import_react.useEffect)(() => {
		scored.current = false;
		setState(beginDrift(level));
	}, [level]);
	(0, import_react.useEffect)(() => {
		if (!state.met || scored.current) return;
		scored.current = true;
		const score = 120 + state.used.filter((used) => !used).length * 10;
		setRun((total) => {
			const next = total + score;
			noteClear("vectors", level.id, score, next);
			return next;
		});
	}, [
		state.met,
		state.used,
		level.id
	]);
	function play(index) {
		const next = applyDrift(level, state, index);
		if (next) setState(next);
	}
	const kindLabel = level.kind === "position" ? "Position" : level.kind === "velocity" ? "Velocity" : level.kind === "acceleration" ? "Acceleration" : level.kind === "momentum" ? `Momentum · mass ${level.mass}` : "Intercept";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BenchFrame, {
		kicker: "VECTOR DRIFT",
		title: level.title,
		meta: `${level.id}/16`,
		onExit,
		onQuestions,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LevelStrip, {
				count: DRIFT_LEVELS.length,
				current: level.id,
				onPick: setLevelId
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-mist",
				children: level.blurb
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 font-mono text-xs text-gold",
				children: kindLabel
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 overflow-hidden rounded-2xl border border-line bg-ink",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					level,
					state,
					ship
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-3 grid grid-cols-2 gap-2 font-mono text-xs sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Readout, {
						label: "Position",
						value: formatV(state.pos)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Readout, {
						label: "Applied",
						value: state.turn > 0 ? formatV(state.applied) : "none"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Readout, {
						label: "Resultant",
						value: state.turn > 0 ? formatV(state.resultant) : "(0, 0)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Readout, {
						label: "Mark",
						value: formatV(state.target)
					}),
					level.kind !== "position" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Readout, {
						label: "Velocity",
						value: formatV(state.vel)
					}) : null,
					level.kind === "acceleration" || level.kind === "momentum" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Readout, {
						label: "Acceleration",
						value: formatV(state.acc)
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm leading-relaxed text-cream",
				children: level.law
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 grid grid-cols-2 gap-2",
				children: level.cards.map((card, index) => {
					const used = state.used[index];
					const legal = !used && !state.met && applyDrift(level, state, index) !== null;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						disabled: !legal,
						onClick: () => play(index),
						className: "min-h-11 rounded-xl border border-line bg-panel px-3 font-mono text-sm text-cream disabled:opacity-40",
						children: [formatV(card), used ? " · played" : ""]
					}, `${level.id}-${index}`);
				})
			}),
			level.kind === "momentum" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs text-mist",
				children: "An impulse that does not divide the mass stays in the tray."
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 font-mono text-sm text-gold",
				"aria-live": "polite",
				children: state.met ? "On the mark." : "The mark is the open circle. The dashed line is only the sum of cards you have already played."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => {
							scored.current = state.met;
							setState(beginDrift(level));
						},
						className: "min-h-11 rounded-full border border-line px-4 text-sm text-cream",
						children: "Reset"
					}),
					state.met && level.id < DRIFT_LEVELS.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setLevelId(level.id + 1),
						className: "min-h-11 rounded-full bg-gold px-4 text-sm font-extrabold text-ink",
						children: "Next"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "self-center font-mono text-xs text-mist",
						children: ["Run ", run]
					})
				]
			})
		]
	});
}
function Readout({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-line bg-panel px-3 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-mist",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "text-cream",
			children: value
		})]
	});
}
function VectorFigure({ a, b }) {
	const travel = arriveDraw(useArrive(`${a[0]},${a[1]},${b[0]},${b[1]}`));
	const unit = 68 / Math.max(2, Math.abs(a[0]), Math.abs(a[1]), Math.abs(b[0]), Math.abs(b[1]));
	const X = (n) => 90 + n * unit;
	const Y = (n) => 90 - n * unit;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 180 180",
		className: "mx-auto h-40 w-full max-w-xs",
		role: "img",
		"aria-label": `Vector A ${a[0]}, ${a[1]} and vector B ${b[0]}, ${b[1]}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: "16",
				y1: "90",
				x2: "164",
				y2: "90",
				className: "text-line",
				stroke: "currentColor"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: "90",
				y1: "16",
				x2: "90",
				y2: "164",
				className: "text-line",
				stroke: "currentColor"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: "90",
				y1: "90",
				x2: X(a[0]),
				y2: Y(a[1]),
				className: "text-gold",
				stroke: "currentColor",
				strokeWidth: "3"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: X(a[0]),
				cy: Y(a[1]),
				r: "5",
				className: "text-gold",
				fill: "currentColor"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: "90",
				y1: "90",
				x2: X(b[0]),
				y2: Y(b[1]),
				className: "text-mint",
				stroke: "currentColor",
				strokeWidth: "3"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: X(b[0]),
				cy: Y(b[1]),
				r: "5",
				className: "text-mint",
				fill: "currentColor"
			}),
			travel < .98 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: X(a[0] * travel),
				cy: Y(a[1] * travel),
				r: "3.5",
				className: "text-cream",
				fill: "currentColor"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: X(b[0] * travel),
				cy: Y(b[1] * travel),
				r: "3.5",
				className: "text-cream",
				fill: "currentColor"
			})] }) : null
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "mt-1 text-center font-mono text-xs text-mist",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-gold",
				children: [
					"A (",
					a[0],
					", ",
					a[1],
					")"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: " · " }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-mint",
				children: [
					"B (",
					b[0],
					", ",
					b[1],
					")"
				]
			})
		]
	})] });
}
function VectorProof({ active = true, onExit }) {
	const [mode, setMode] = (0, import_react.useState)("drift");
	if (mode === "questions") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative h-dvh",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoundProof, {
			active,
			onExit,
			track: "vectors",
			mark: "→",
			title: "Vectors",
			menuKicker: "PHYSICS",
			menuTitle: "Add the arrows.",
			menuBody: "Both arrows start at the origin. Add their runs, then their rises. Keys 1 to 4. A miss costs a heart. Sixteen levels.",
			levels: VECTOR_LEVELS,
			audit: auditVector,
			renderScene: (prompt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VectorFigure, {
				a: prompt.scene.a,
				b: prompt.scene.b
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuestionsChip, {
			label: "Bench",
			onClick: () => setMode("drift")
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VectorDrift, {
		onExit,
		onQuestions: () => setMode("questions")
	});
}
var PATTERN = [
	1,
	2,
	3,
	2,
	4,
	1,
	5,
	3,
	4,
	2,
	5,
	1
];
var FREQS = Array.from({ length: 48 }, (_, index) => PATTERN[index % PATTERN.length]);
var TITLES = [
	"Slow crests",
	"A little faster",
	"Three across",
	"Four",
	"Five",
	"Back to one",
	"Mixed",
	"Faster again",
	"Count again",
	"The long waves",
	"Short waves",
	"Pairs",
	"Odd counts",
	"Even counts",
	"Almost full",
	"The bench"
];
function choicesFor(freq) {
	const picks = [freq];
	for (const delta of [
		1,
		-1,
		2,
		-2,
		3,
		-3
	]) {
		const next = freq + delta;
		if (next >= 1 && next <= 8 && !picks.includes(next)) picks.push(next);
		if (picks.length === 4) break;
	}
	return [
		String(picks[0]),
		String(picks[1]),
		String(picks[2]),
		String(picks[3])
	];
}
function promptFor(freq) {
	return {
		kicker: "Frequency",
		ask: "How many full waves fit across the bench?",
		scene: {
			freq,
			amp: .48,
			phase: 0
		},
		choices: choicesFor(freq),
		answer: String(freq),
		blurb: freq === 1 ? "1 full wave fits across the bench." : `${freq} full waves fit across the bench.`
	};
}
/** The old frequency cabinet. Kept as the question fallback for Wave Lab. */
var WAVE_LEVELS = TITLES.map((title, index) => ({
	id: index + 1,
	title,
	prompts: [
		0,
		1,
		2
	].map((slot) => promptFor(FREQS[index * 3 + slot]))
}));
function auditWave() {
	const errors = [];
	if (WAVE_LEVELS.length !== 16) errors.push(`levels ${WAVE_LEVELS.length}`);
	WAVE_LEVELS.forEach((level, levelIndex) => {
		if (level.prompts.length !== 3) errors.push(`level ${level.id} prompts`);
		level.prompts.forEach((prompt, promptIndex) => {
			const where = `${levelIndex + 1}.${promptIndex + 1}`;
			const freq = prompt.scene.freq;
			if (!Number.isInteger(freq) || freq < 1 || freq > 6) errors.push(`${where} freq`);
			if (prompt.answer !== String(freq)) errors.push(`${where} answer`);
			if (new Set(prompt.choices).size !== 4) errors.push(`${where} choices`);
			if (prompt.choices.filter((choice) => choice === prompt.answer).length !== 1) errors.push(`${where} once`);
			const crest = .25 / freq;
			const y = curveY(crest, [{
				amp: prompt.scene.amp,
				freq,
				phase: prompt.scene.phase
			}], 0);
			const expected = .5 + prompt.scene.amp * .42;
			if (Math.abs(y - expected) > 1e-9) errors.push(`${where} crest`);
			if (!prompt.blurb.includes(String(freq))) errors.push(`${where} blurb`);
		});
	});
	return errors;
}
function bake(wave, time) {
	const dir = wave.dir === -1 ? -1 : 1;
	return {
		amp: wave.amp,
		freq: wave.freq,
		phase: wave.phase + dir * time
	};
}
function fieldOpen(lock, key) {
	if (!lock || Object.keys(lock).length === 0) return true;
	return lock[key] === false;
}
function WaveFigure({ scene }) {
	const wave = [{
		amp: scene.amp,
		freq: scene.freq,
		phase: scene.phase
	}];
	const points = [];
	for (let i = 0; i <= 80; i++) {
		const x = i / 80;
		points.push(`${10 + x * 200},${10 + (1 - curveY(x, wave, 0)) * 88}`);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 220 108",
		className: "mx-auto h-36 w-full max-w-xs",
		role: "img",
		"aria-label": `${scene.freq} full waves across the bench`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: "10",
			y1: "54",
			x2: "210",
			y2: "54",
			className: "text-line",
			stroke: "currentColor"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", {
			points: points.join(" "),
			className: "text-gold",
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "2.5"
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-1 text-center font-mono text-xs text-mist",
		children: "Count the crests from the left edge to the right edge."
	})] });
}
function WaveQuestions({ active, onExit }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoundProof, {
		active,
		onExit,
		track: "waves",
		mark: "∿",
		title: "Wave Lab",
		menuKicker: "PHYSICS",
		menuTitle: "Count the crests.",
		menuBody: "The curve is one sine wave. Count how many full waves fit across the bench. Keys 1 to 4. A miss costs a heart. Sixteen levels.",
		levels: WAVE_LEVELS,
		audit: auditWave,
		renderScene: (prompt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WaveFigure, { scene: prompt.scene })
	});
}
function Ghost({ waves, time }) {
	const shown = waves.map((wave) => bake(wave, time));
	const points = [];
	for (let i = 0; i <= 96; i++) {
		const x = i / 96;
		points.push(`${x * 100},${(1 - curveY(x, shown, 0)) * 100}`);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 100 100",
		preserveAspectRatio: "none",
		className: "pointer-events-none absolute inset-0 h-full w-full",
		"aria-hidden": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", {
			points: points.join(" "),
			fill: "none",
			stroke: "#f4efe4",
			strokeOpacity: "0.45",
			strokeDasharray: "1.4 1.1",
			strokeWidth: "0.7"
		})
	});
}
function Slider({ label, min, max, step, value, digits, disabled, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: `mt-2 flex min-h-11 items-center gap-3 text-xs ${disabled ? "opacity-40" : ""}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "w-24 shrink-0 font-mono tracking-widest text-mist",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "range",
				min,
				max,
				step,
				value,
				disabled,
				onChange: (event) => onChange(Number(event.target.value)),
				className: "h-11 min-w-0 flex-1 accent-gold"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "w-14 text-right font-mono text-cream",
				children: value.toFixed(digits)
			})
		]
	});
}
function WaveProof({ active = true, onExit }) {
	const [mode, setMode] = (0, import_react.useState)("play");
	if (mode === "questions") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative h-dvh",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WaveQuestions, {
			active,
			onExit
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuestionsChip, {
			label: "Bench",
			onClick: () => setMode("play")
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WaveBench, {
		active,
		onExit,
		onQuestions: () => setMode("questions")
	});
}
function WaveBench({ active, onExit, onQuestions }) {
	const hostRef = (0, import_react.useRef)(null);
	const playRef = (0, import_react.useRef)(WAVE_PLAYS[0]);
	const wavesRef = (0, import_react.useRef)(WAVE_PLAYS[0].start.map((wave) => ({ ...wave })));
	const timeRef = (0, import_react.useRef)(0);
	const [levelId, setLevelId] = (0, import_react.useState)(1);
	const [waves, setWaves] = (0, import_react.useState)(() => wavesRef.current.map((wave) => ({ ...wave })));
	const [clock, setClock] = (0, import_react.useState)(0);
	const [run, setRun] = (0, import_react.useState)(0);
	const [locked, setLocked] = (0, import_react.useState)(false);
	const holdRef = (0, import_react.useRef)(null);
	const level = WAVE_PLAYS[levelId - 1] ?? WAVE_PLAYS[0];
	playRef.current = level;
	(0, import_react.useEffect)(() => {
		const next = level.start.map((wave) => ({ ...wave }));
		wavesRef.current = next;
		setWaves(next);
		setLocked(false);
		timeRef.current = 0;
		setClock(0);
	}, [level]);
	(0, import_react.useEffect)(() => {
		const host = hostRef.current;
		if (!host || !active) return;
		let cancelled = false;
		let raf = 0;
		let surface = null;
		const caps = detectCapabilities();
		const view = present$1(loadFidelity(), caps);
		const pool = createPool(Math.min(view.particles, 64));
		let last = performance.now();
		const resize = () => {
			if (!surface) return;
			const rect = host.getBoundingClientRect();
			surface.resize(Math.max(rect.width, 1), Math.max(rect.height, 1), view.dpr);
		};
		const observer = new ResizeObserver(resize);
		const loop = (now) => {
			raf = requestAnimationFrame(loop);
			if (!surface || document.hidden) {
				last = now;
				return;
			}
			const dt = Math.min(.05, Math.max(0, (now - last) / 1e3));
			last = now;
			if (!caps.reducedMotion) timeRef.current += dt;
			const time = timeRef.current;
			const shown = [...playRef.current.fixed, ...wavesRef.current].slice(0, 2).map((wave) => bake(wave, time));
			if (caps.reducedMotion) for (const particle of pool) {
				particle.y = curveY(particle.x, shown, 0);
				particle.vy = 0;
				particle.trail = [];
			}
			else stepPool(pool, dt, shown, 0);
			surface.draw({
				time: 0,
				waves: shown,
				particles: pool,
				reducedMotion: caps.reducedMotion
			});
			if (!caps.reducedMotion && Math.floor(now / 80) !== Math.floor((now - dt * 1e3) / 80)) setClock(time);
		};
		openLabSurface(host, view.backend).then((opened) => {
			if (cancelled) {
				opened.destroy();
				return;
			}
			surface = opened;
			resize();
			observer.observe(host);
			raf = requestAnimationFrame(loop);
		});
		return () => {
			cancelled = true;
			cancelAnimationFrame(raf);
			observer.disconnect();
			surface?.destroy();
			host.replaceChildren();
		};
	}, [active]);
	function tune(index, patch) {
		const next = wavesRef.current.map((wave, waveIndex) => waveIndex === index ? {
			...wave,
			...patch
		} : { ...wave });
		wavesRef.current = next;
		setWaves(next);
		if (prefersReducedMotion()) {
			timeRef.current += .45;
			setClock(timeRef.current);
		}
	}
	const judgement = judgeWave(level, waves);
	const ghost = level.kind === "match" || level.kind === "identify";
	function clearHold() {
		if (holdRef.current !== null) window.clearTimeout(holdRef.current);
		holdRef.current = null;
	}
	function beginHold() {
		if (!judgement.ok || locked) return;
		clearHold();
		holdRef.current = window.setTimeout(() => {
			setLocked(true);
			setRun((total) => {
				const next = total + judgement.score;
				noteClear("waves", level.id, judgement.score, next);
				return next;
			});
		}, 560);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BenchFrame, {
		kicker: "WAVE LAB",
		title: level.title,
		meta: `${level.id}/16`,
		onExit,
		onQuestions,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LevelStrip, {
				count: WAVE_PLAYS.length,
				current: level.id,
				onPick: setLevelId
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-mist",
				children: level.blurb
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mt-3 h-52 overflow-hidden rounded-2xl border border-line sm:h-64",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						ref: hostRef,
						className: "absolute inset-0"
					}),
					ghost ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ghost, {
						waves: level.solution,
						time: clock
					}) : null,
					level.kind === "cancel" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-x-0 top-1/2 border-t border-dashed border-cream/40" }) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 font-mono text-xs text-mist",
				children: "Mint is the first wave. Gold is the second. Cream is their sum. The picture uses the same state on every drawing path."
			}),
			level.fixed.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-mist",
				children: "A wave on this bench is fixed. You edit only the open controls."
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 grid gap-4 sm:grid-cols-2",
				children: waves.map((wave, index) => {
					const lock = level.locks[index];
					const name = level.fixed.length > 0 ? "Your wave" : index === 0 ? "Wave A" : "Wave B";
					const tone = level.fixed.length > 0 || index > 0 ? "text-gold" : "text-mint";
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
						className: "min-w-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
								className: `font-mono text-xs tracking-widest ${tone}`,
								children: name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
								label: "Amplitude",
								min: 0,
								max: .55,
								step: .01,
								value: wave.amp,
								digits: 2,
								disabled: !fieldOpen(lock, "amp") || locked,
								onChange: (value) => tune(index, { amp: value })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
								label: "Frequency",
								min: 1,
								max: 6,
								step: level.kind === "identify" ? 1 : .05,
								value: wave.freq,
								digits: 2,
								disabled: !fieldOpen(lock, "freq") || locked,
								onChange: (value) => tune(index, { freq: value })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
								label: "Wavelength",
								min: 1 / 6,
								max: 1,
								step: .01,
								value: Math.min(1, Math.max(1 / 6, waveLength(wave.freq))),
								digits: 2,
								disabled: !fieldOpen(lock, "freq") || locked,
								onChange: (value) => tune(index, { freq: freqFromLength(value) })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
								label: "Phase",
								min: 0,
								max: 6.28,
								step: .02,
								value: wave.phase,
								digits: 2,
								disabled: !fieldOpen(lock, "phase") || locked,
								onChange: (value) => tune(index, { phase: value })
							}),
							level.kind === "standing" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								disabled: !fieldOpen(lock, "dir") || locked,
								onClick: () => tune(index, { dir: wave.dir === -1 ? 1 : -1 }),
								className: "mt-2 min-h-11 rounded-full border border-line px-4 text-sm text-cream disabled:opacity-40",
								children: wave.dir === -1 ? "Traveling backward" : "Traveling forward"
							}) : null
						]
					}, `${level.id}-${index}`);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-cream",
				"aria-live": "polite",
				children: locked ? "Locked." : judgement.detail
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: !judgement.ok || locked,
						onPointerDown: beginHold,
						onPointerUp: clearHold,
						onPointerLeave: clearHold,
						onKeyDown: (event) => {
							if (event.key === " " || event.key === "Enter") {
								event.preventDefault();
								beginHold();
							}
						},
						onKeyUp: clearHold,
						className: "min-h-11 rounded-full bg-gold px-4 text-sm font-extrabold text-ink disabled:opacity-40",
						children: locked ? "Held" : "Hold to lock"
					}),
					locked && level.id < WAVE_PLAYS.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setLevelId(level.id + 1),
						className: "min-h-11 rounded-full border border-line px-4 text-sm text-cream",
						children: "Next"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-xs text-mist",
						children: ["Run ", run]
					})
				]
			})
		]
	});
}
function Arcade() {
	const [screen, setScreen] = (0, import_react.useState)("lobby");
	const [held, setHeld] = (0, import_react.useState)("lobby");
	const [opened, setOpened] = (0, import_react.useState)([]);
	const [progress, setProgress] = (0, import_react.useState)(() => emptyProgress());
	const door = useDoor(screen !== "lobby");
	(0, import_react.useEffect)(() => {
		setProgress(loadProgress());
	}, []);
	(0, import_react.useEffect)(() => {
		if (screen === "lobby" && door < .02) setHeld("lobby");
	}, [screen, door]);
	function enter(id) {
		setOpened((current) => current.includes(id) ? current : [...current, id]);
		noteVisit(id);
		setProgress(loadProgress());
		setHeld(id);
		setScreen(id);
	}
	function leave() {
		setProgress(loadProgress());
		setScreen("lobby");
	}
	function openLab() {
		setHeld("lab");
		setScreen("lab");
	}
	const pose = doorPose(door);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: screen === "lobby" || door < .98 ? "h-dvh overflow-hidden" : "hidden",
			style: screen === "lobby" && door < .02 ? void 0 : {
				opacity: pose.lobbyOpacity,
				transform: `scale(${pose.lobbyScale})`,
				pointerEvents: screen === "lobby" ? "auto" : "none"
			},
			"aria-hidden": screen === "lobby" ? void 0 : true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lobby, {
				progress,
				onPlay: enter,
				onLab: openLab
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bay, {
			id: "lab",
			screen,
			held,
			door,
			children: screen === "lab" || held === "lab" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InstrumentLab, { onExit: leave }) : null
		}),
		opened.includes("bubbles") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bay, {
			id: "bubbles",
			screen,
			held,
			door,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BubbleProof, {
				active: screen === "bubbles",
				onExit: leave
			})
		}) : null,
		opened.includes("symbols") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bay, {
			id: "symbols",
			screen,
			held,
			door,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SymbolMatch, {
				active: screen === "symbols",
				onExit: leave
			})
		}) : null,
		opened.includes("equals") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bay, {
			id: "equals",
			screen,
			held,
			door,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EqualsProof, {
				active: screen === "equals",
				onExit: leave
			})
		}) : null,
		opened.includes("run") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bay, {
			id: "run",
			screen,
			held,
			door,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SequenceProof, {
				active: screen === "run",
				onExit: leave
			})
		}) : null,
		opened.includes("logic") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bay, {
			id: "logic",
			screen,
			held,
			door,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThereforeProof, {
				active: screen === "logic",
				onExit: leave
			})
		}) : null,
		opened.includes("odds") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bay, {
			id: "odds",
			screen,
			held,
			door,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OddsProof, {
				active: screen === "odds",
				onExit: leave
			})
		}) : null,
		opened.includes("slope") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bay, {
			id: "slope",
			screen,
			held,
			door,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlopeProof, {
				active: screen === "slope",
				onExit: leave
			})
		}) : null,
		opened.includes("fractions") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bay, {
			id: "fractions",
			screen,
			held,
			door,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FractionProof, {
				active: screen === "fractions",
				onExit: leave
			})
		}) : null,
		opened.includes("primes") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bay, {
			id: "primes",
			screen,
			held,
			door,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrimeProof, {
				active: screen === "primes",
				onExit: leave
			})
		}) : null,
		opened.includes("vectors") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bay, {
			id: "vectors",
			screen,
			held,
			door,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VectorProof, {
				active: screen === "vectors",
				onExit: leave
			})
		}) : null,
		opened.includes("angles") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bay, {
			id: "angles",
			screen,
			held,
			door,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AngleProof, {
				active: screen === "angles",
				onExit: leave
			})
		}) : null,
		opened.includes("machine") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bay, {
			id: "machine",
			screen,
			held,
			door,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MachineProof, {
				active: screen === "machine",
				onExit: leave
			})
		}) : null,
		opened.includes("balance") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bay, {
			id: "balance",
			screen,
			held,
			door,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BalanceProof, {
				active: screen === "balance",
				onExit: leave
			})
		}) : null,
		opened.includes("area") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bay, {
			id: "area",
			screen,
			held,
			door,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AreaProof, {
				active: screen === "area",
				onExit: leave
			})
		}) : null,
		opened.includes("motion") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bay, {
			id: "motion",
			screen,
			held,
			door,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MotionProof, {
				active: screen === "motion",
				onExit: leave
			})
		}) : null,
		opened.includes("grid") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bay, {
			id: "grid",
			screen,
			held,
			door,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GridProof, {
				active: screen === "grid",
				onExit: leave
			})
		}) : null,
		opened.includes("waves") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bay, {
			id: "waves",
			screen,
			held,
			door,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WaveProof, {
				active: screen === "waves",
				onExit: leave
			})
		}) : null,
		opened.includes("orbit") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bay, {
			id: "orbit",
			screen,
			held,
			door,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrbitProof, {
				active: screen === "orbit",
				onExit: leave
			})
		}) : null
	] });
}
function Bay({ id, screen, held, door, children }) {
	const live = screen === id;
	const visible = live || held === id && door > .02;
	const pose = doorPose(door);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: visible ? "h-dvh overflow-hidden" : "hidden",
		style: visible ? {
			opacity: pose.stationOpacity,
			transform: `translateY(${pose.stationY}px)`,
			pointerEvents: live ? "auto" : "none"
		} : void 0,
		"aria-hidden": live ? void 0 : true,
		children
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Arcade, {});
}
//#endregion
export { Home as component };
