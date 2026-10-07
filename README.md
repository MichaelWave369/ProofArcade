# Proof Arcade

**A living mathematics and physics arcade where the relationship becomes the game mechanic.**

Proof Arcade is an experimental educational game collection built around direct manipulation, visual reasoning, and mathematical correctness. Instead of wrapping worksheets in arcade graphics, the project tries to make the underlying relationship itself playable.

**Live build:** https://michaelwave369.github.io/ProofArcade/

## Current arcade

Proof Arcade currently contains 18 stations:

| Station | Core idea |
| --- | --- |
| Bubble Proof | Match mathematically equivalent expressions through an arcade bubble engine |
| Symbol Match | Learn mathematical symbols through match-3 play |
| Equals | Recognize equivalent representations |
| Sequence | Discover and extend patterns |
| Therefore | Practice logical implication and formal reasoning |
| Odds | Build probability intuition |
| Slope | Explore rise, run, coordinates, and line behavior |
| Fraction Forge | Construct, split, simplify, and combine exact fractions |
| Primes | Classify primes, composites, factors, and number structure |
| Vector Drift | Apply vectors to navigate state and motion |
| Angles | Reason about geometric angle relationships |
| Machine | Infer hidden function rules from input/output behavior |
| Balance Lab | Solve equations by preserving equality on both sides |
| Area | Construct and reason about geometric area |
| Motion | Explore constant-speed distance, speed, and time relationships |
| Grid | Work with coordinate distance and midpoint relationships |
| Wave Lab | Manipulate amplitude, frequency, wavelength, phase, and interference |
| Orbit | Experiment with a simplified inverse-square gravity model |

## Design principles

- **Arcade first, mathematics underneath.** The interaction should feel like a game, not an LMS.
- **Make the relationship playable.** Prefer constructing, dragging, launching, balancing, predicting, and experimenting over simply choosing an answer.
- **Mathematical truth is authoritative.** Rendering never gets to invent or override the underlying state.
- **Progressive enhancement.** Rich graphics are optional; the game must remain usable when a high-end renderer is unavailable.
- **Mobile and accessibility matter.** Touch, keyboard operation, reduced motion, and readable fallbacks are part of the product rather than cleanup work.

## Rendering architecture

The game separates simulation/math state from presentation.

```text
math + game state
       |
       +--> semantic React / DOM UI
       +--> Canvas fallback
       +--> WebGL2 renderer
       +--> WebGPU enhanced renderer
```

The renderer capability layer can step down when a backend is unavailable. WebGPU support is treated as an enhancement, not a requirement. A lower-fidelity renderer is valid behavior, not an error.

The project also includes an Instrument Lab used to exercise renderer capability detection, frame statistics, waves, particles, and GPU fallback behavior.

## Local development

Requirements:

- Node.js 22
- npm

Install dependencies:

```bash
npm ci
```

Start the development server:

```bash
npm run dev
```

The application uses the repository's existing environment wrapper and development configuration. Authentication and database deployment are currently disabled for the arcade build.

## Quality gates

The repository exposes the following checks:

```bash
npm test
npm run typecheck
npm run lint
npm run build
npm run build:pages
```

`npm run build` keeps the Grok/Vercel deployment target. `npm run build:pages`
produces a static GitHub Pages build under `dist/client` with the project
base path `/ProofArcade/`.

Pull requests run these checks in GitHub Actions.

Tests cover platform behavior plus arcade systems such as progression, content registration, renderer capability selection, motion/spring behavior, mathematical engines, and save migration.

## Project structure

```text
src/game/            game engines, content, progression, rendering
src/routes/          application routes
src/components/      shared UI
scripts/             build, PWA, QA, and repository tooling
server/              deployed middleware
public/              public assets
screenshots/         retained QA/reference captures
```

Grok workspace support files are intentionally retained while the project is still actively round-tripping through Grok. Generated Vercel build output is not source and is ignored going forward.

## Status

Proof Arcade is an active prototype. Some stations already use direct-manipulation mechanics while others still retain question-based modes as tutorials, accessibility paths, or fallback content.

The next development focus is deeper direct manipulation, stronger game feel, renderer qualification, and mechanical polish rather than simply increasing the station count.

## License

MIT. See [LICENSE](LICENSE).
