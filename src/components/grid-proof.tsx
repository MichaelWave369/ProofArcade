import { RoundProof } from "@/components/round-proof";
import { GRID_LEVELS, auditGrid, gridCaption, type GridPrompt, type Pt } from "@/game/grid/levels";

function mapX(n: number) {
  return 90 + n * 12;
}

function mapY(n: number) {
  return 90 - n * 12;
}

function GridFigure({ a, b }: { a: Pt; b: Pt }) {
  return (
    <svg viewBox="0 0 180 180" className="mx-auto h-40 w-full max-w-xs" role="img" aria-label={`Points ${a[0]}, ${a[1]} and ${b[0]}, ${b[1]}`}>
      <line x1="14" y1="90" x2="166" y2="90" className="text-line" stroke="currentColor" />
      <line x1="90" y1="14" x2="90" y2="166" className="text-line" stroke="currentColor" />
      <line x1={mapX(a[0])} y1={mapY(a[1])} x2={mapX(b[0])} y2={mapY(b[1])} className="text-gold" stroke="currentColor" strokeWidth="2" />
      <circle cx={mapX(a[0])} cy={mapY(a[1])} r="5" className="text-gold" fill="currentColor" />
      <circle cx={mapX(b[0])} cy={mapY(b[1])} r="5" className="text-mint" fill="currentColor" />
    </svg>
  );
}

export function GridProof({ active = true, onExit }: { active?: boolean; onExit?: () => void }) {
  return (
    <RoundProof<GridPrompt>
      active={active}
      onExit={onExit}
      track="grid"
      mark="+"
      title="Grid"
      menuKicker="GEOMETRY"
      menuTitle="Two lattice points."
      menuBody="Name the halfway point, or the straight-line distance. Keys 1 to 4. A miss costs a heart. Sixteen levels."
      levels={GRID_LEVELS}
      audit={auditGrid}
      renderScene={(prompt) => (
        <div>
          <GridFigure a={prompt.scene.a} b={prompt.scene.b} />
          <p className="mt-1 text-center font-mono text-xs text-mist">
            <span className="text-gold">{prompt.scene.a[0]}, {prompt.scene.a[1]}</span>
            <span> to </span>
            <span className="text-mint">{prompt.scene.b[0]}, {prompt.scene.b[1]}</span>
          </p>
          <p className="sr-only">{gridCaption(prompt.scene)}</p>
        </div>
      )}
    />
  );
}
