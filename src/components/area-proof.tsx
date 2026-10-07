import { useState } from "react";
import { AreaBench } from "@/components/area-bench";
import { QuestionsChip } from "@/components/bench-frame";
import { RoundProof } from "@/components/round-proof";
import { AREA_LEVELS, areaCaption, auditArea, type AreaPrompt, type AreaScene } from "@/game/area/levels";

function cellSize(span: number) {
  return span > 10 ? 12 : 16;
}

function GoldBlock({ w, h, x, y, cell }: { w: number; h: number; x: number; y: number; cell: number }) {
  const lines = [];
  for (let i = 0; i <= w; i++) {
    lines.push(<line key={`v${i}`} x1={x + i * cell} y1={y} x2={x + i * cell} y2={y + h * cell} className="text-line" stroke="currentColor" />);
  }
  for (let j = 0; j <= h; j++) {
    lines.push(<line key={`h${j}`} x1={x} y1={y + j * cell} x2={x + w * cell} y2={y + j * cell} className="text-line" stroke="currentColor" />);
  }
  return (
    <g>
      <rect x={x} y={y} width={w * cell} height={h * cell} className="text-gold/30" fill="currentColor" />
      {lines}
    </g>
  );
}

function SideLabel({ x, y, value, anchor }: { x: number; y: number; value: number; anchor: "middle" | "start" }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize="12" className="fill-current font-mono text-cream">
      {value}
    </text>
  );
}

function AreaFigure({ scene }: { scene: AreaScene }) {
  if (scene.kind === "rect") {
    const cell = cellSize(Math.max(scene.w, scene.h));
    const width = 28 + scene.w * cell + 28;
    const height = 20 + scene.h * cell + 28;
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="mx-auto h-40 w-full max-w-xs" role="img" aria-label={`Rectangle ${scene.w} by ${scene.h}`}>
        <GoldBlock w={scene.w} h={scene.h} x={28} y={12} cell={cell} />
        <SideLabel x={28 + (scene.w * cell) / 2} y={height - 8} value={scene.w} anchor="middle" />
        <SideLabel x={10} y={12 + (scene.h * cell) / 2} value={scene.h} anchor="middle" />
      </svg>
    );
  }
  if (scene.kind === "tri") {
    const cell = cellSize(Math.max(scene.a, scene.b));
    const width = 28 + scene.a * cell + 28;
    const height = 20 + scene.b * cell + 28;
    const x = 28;
    const y = 12;
    const points = `${x},${y + scene.b * cell} ${x + scene.a * cell},${y + scene.b * cell} ${x},${y}`;
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="mx-auto h-40 w-full max-w-xs" role="img" aria-label={`Right triangle legs ${scene.a} and ${scene.b}`}>
        <polygon points={points} className="text-gold/30" fill="currentColor" />
        <polygon points={points} className="text-gold" fill="none" stroke="currentColor" strokeWidth="2" />
        <SideLabel x={x + (scene.a * cell) / 2} y={height - 8} value={scene.a} anchor="middle" />
        <SideLabel x={10} y={y + (scene.b * cell) / 2} value={scene.b} anchor="middle" />
      </svg>
    );
  }
  if (scene.kind === "add") {
    const cell = cellSize(Math.max(scene.w, scene.h, scene.w2, scene.h2));
    const gap = 16;
    const tall = Math.max(scene.h, scene.h2);
    const width = 28 + scene.w * cell + gap + scene.w2 * cell + 28;
    const height = 20 + tall * cell + 28;
    const x2 = 28 + scene.w * cell + gap;
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="mx-auto h-40 w-full max-w-xs" role="img" aria-label={`Two blocks, ${scene.w} by ${scene.h} and ${scene.w2} by ${scene.h2}`}>
        <GoldBlock w={scene.w} h={scene.h} x={28} y={12 + (tall - scene.h) * cell} cell={cell} />
        <GoldBlock w={scene.w2} h={scene.h2} x={x2} y={12 + (tall - scene.h2) * cell} cell={cell} />
        <SideLabel x={28 + (scene.w * cell) / 2} y={height - 8} value={scene.w} anchor="middle" />
        <SideLabel x={x2 + (scene.w2 * cell) / 2} y={height - 8} value={scene.w2} anchor="middle" />
      </svg>
    );
  }
  const cell = cellSize(Math.max(scene.w, scene.h));
  const width = 28 + scene.w * cell + 28;
  const height = 20 + scene.h * cell + 28;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="mx-auto h-40 w-full max-w-xs" role="img" aria-label={`Rectangle ${scene.w} by ${scene.h} with a ${scene.w2} by ${scene.h2} cut`}>
      <GoldBlock w={scene.w} h={scene.h} x={28} y={12} cell={cell} />
      <rect x={28} y={12} width={scene.w2 * cell} height={scene.h2 * cell} className="text-ink" fill="currentColor" />
      <rect x={28} y={12} width={scene.w2 * cell} height={scene.h2 * cell} className="text-line" fill="none" stroke="currentColor" />
      <SideLabel x={28 + (scene.w * cell) / 2} y={height - 8} value={scene.w} anchor="middle" />
      <SideLabel x={10} y={12 + (scene.h * cell) / 2} value={scene.h} anchor="middle" />
    </svg>
  );
}

export function AreaProof({ active = true, onExit }: { active?: boolean; onExit?: () => void }) {
  const [mode, setMode] = useState<"bench" | "questions">("bench");
  if (mode === "questions") {
    return (
      <div className="relative h-dvh">
        <RoundProof<AreaPrompt>
          active={active}
          onExit={onExit}
          track="area"
          mark="□"
          title="Area"
          menuKicker="GEOMETRY"
          menuTitle="Count the gold."
          menuBody="Rectangles, triangles, and blocks with a piece missing. The unit square is 1. Keys 1 to 4. A miss costs a heart. Sixteen levels."
          levels={AREA_LEVELS}
          audit={auditArea}
          renderScene={(prompt) => (
            <div>
              <AreaFigure scene={prompt.scene} />
              <p className="mt-1 text-center font-mono text-xs text-mist">{areaCaption(prompt.scene)}</p>
            </div>
          )}
        />
        <QuestionsChip label="Bench" onClick={() => setMode("bench")} />
      </div>
    );
  }
  return <AreaBench onExit={onExit} onQuestions={() => setMode("questions")} />;
}
