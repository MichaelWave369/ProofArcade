import { RoundProof } from "@/components/round-proof";
import { ANGLE_LEVELS, angleCaption, auditAngle, type AnglePrompt, type AngleScene } from "@/game/angle/levels";

function at(x: number, y: number, deg: number, r: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: x + r * Math.cos(rad), y: y - r * Math.sin(rad) };
}

function wedge(x: number, y: number, start: number, end: number, r: number) {
  const a = at(x, y, start, r);
  const b = at(x, y, end, r);
  const large = end - start > 180 ? 1 : 0;
  return `M ${x} ${y} L ${a.x} ${a.y} A ${r} ${r} 0 ${large} 0 ${b.x} ${b.y} Z`;
}

function Label({ x, y, text, tone }: { x: number; y: number; text: string; tone: string }) {
  return (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="13" className={`font-mono ${tone}`} fill="currentColor">
      {text}
    </text>
  );
}

function AngleFigure({ scene }: { scene: AngleScene }) {
  if (scene.kind === "complement") {
    const o = { x: 36, y: 112 };
    const ray = at(o.x, o.y, scene.a, 100);
    const known = at(o.x, o.y, scene.a / 2, 46);
    const unknown = at(o.x, o.y, (scene.a + 90) / 2, 46);
    return (
      <svg viewBox="0 0 180 140" className="mx-auto h-40 w-full max-w-xs" role="img" aria-label={angleCaption(scene)}>
        <path d={wedge(o.x, o.y, 0, scene.a, 28)} className="text-gold/30" fill="currentColor" />
        <path d={wedge(o.x, o.y, scene.a, 90, 28)} className="text-mint/30" fill="currentColor" />
        <line x1={o.x} y1={o.y} x2={156} y2={o.y} className="text-cream" stroke="currentColor" strokeWidth="2" />
        <line x1={o.x} y1={o.y} x2={o.x} y2={16} className="text-cream" stroke="currentColor" strokeWidth="2" />
        <line x1={o.x} y1={o.y} x2={ray.x} y2={ray.y} className="text-gold" stroke="currentColor" strokeWidth="2" />
        <path d={`M ${o.x + 14} ${o.y} L ${o.x + 14} ${o.y - 14} L ${o.x} ${o.y - 14}`} className="text-line" fill="none" stroke="currentColor" />
        <Label x={known.x} y={known.y} text={`${scene.a}°`} tone="text-gold" />
        <Label x={unknown.x} y={unknown.y} text="?" tone="text-mint" />
      </svg>
    );
  }
  if (scene.kind === "supplement") {
    const o = { x: 90, y: 96 };
    const ray = at(o.x, o.y, scene.a, 78);
    const known = at(o.x, o.y, scene.a / 2, 40);
    const unknown = at(o.x, o.y, (scene.a + 180) / 2, 40);
    return (
      <svg viewBox="0 0 180 140" className="mx-auto h-40 w-full max-w-xs" role="img" aria-label={angleCaption(scene)}>
        <path d={wedge(o.x, o.y, 0, scene.a, 30)} className="text-gold/30" fill="currentColor" />
        <path d={wedge(o.x, o.y, scene.a, 180, 30)} className="text-mint/30" fill="currentColor" />
        <line x1={12} y1={o.y} x2={168} y2={o.y} className="text-cream" stroke="currentColor" strokeWidth="2" />
        <line x1={o.x} y1={o.y} x2={ray.x} y2={ray.y} className="text-gold" stroke="currentColor" strokeWidth="2" />
        <Label x={known.x} y={known.y} text={`${scene.a}°`} tone="text-gold" />
        <Label x={unknown.x} y={unknown.y} text="?" tone="text-mint" />
      </svg>
    );
  }
  if (scene.kind === "vertical") {
    const o = { x: 90, y: 72 };
    const arm = at(o.x, o.y, scene.a, 70);
    const back = at(o.x, o.y, scene.a + 180, 70);
    const known = at(o.x, o.y, scene.a / 2, 36);
    const unknown = at(o.x, o.y, 180 + scene.a / 2, 36);
    return (
      <svg viewBox="0 0 180 140" className="mx-auto h-40 w-full max-w-xs" role="img" aria-label={angleCaption(scene)}>
        <path d={wedge(o.x, o.y, 0, scene.a, 26)} className="text-gold/30" fill="currentColor" />
        <path d={wedge(o.x, o.y, 180, 180 + scene.a, 26)} className="text-mint/30" fill="currentColor" />
        <line x1={18} y1={o.y} x2={162} y2={o.y} className="text-cream" stroke="currentColor" strokeWidth="2" />
        <line x1={back.x} y1={back.y} x2={arm.x} y2={arm.y} className="text-gold" stroke="currentColor" strokeWidth="2" />
        <Label x={known.x} y={known.y} text={`${scene.a}°`} tone="text-gold" />
        <Label x={unknown.x} y={unknown.y} text="?" tone="text-mint" />
      </svg>
    );
  }
  const A = { x: 28, y: 118 };
  const B = { x: 154, y: 118 };
  const C = meet(A.x, A.y, scene.a, B.x, B.y, 180 - scene.b);
  const pts = [A, B, C];
  const minX = Math.min(...pts.map((p) => p.x)) - 28;
  const maxX = Math.max(...pts.map((p) => p.x)) + 28;
  const minY = Math.min(...pts.map((p) => p.y)) - 28;
  const maxY = Math.max(...pts.map((p) => p.y)) + 28;
  const outward = (from: { x: number; y: number }, amount: number) => {
    const cx = (A.x + B.x + C.x) / 3;
    const cy = (A.y + B.y + C.y) / 3;
    const dx = from.x - cx;
    const dy = from.y - cy;
    const len = Math.hypot(dx, dy) || 1;
    return { x: from.x + (dx / len) * amount, y: from.y + (dy / len) * amount };
  };
  const la = outward(A, 18);
  const lb = outward(B, 18);
  const lc = outward(C, 16);
  return (
    <svg viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`} className="mx-auto h-40 w-full max-w-xs" role="img" aria-label={angleCaption(scene)}>
      <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`} className="text-line" fill="none" stroke="currentColor" strokeWidth="2" />
      <Label x={la.x} y={la.y} text={`${scene.a}°`} tone="text-gold" />
      <Label x={lb.x} y={lb.y} text={`${scene.b}°`} tone="text-gold" />
      <Label x={lc.x} y={lc.y} text="?" tone="text-mint" />
    </svg>
  );
}

function meet(ax: number, ay: number, aDeg: number, bx: number, by: number, bDeg: number) {
  const ar = (aDeg * Math.PI) / 180;
  const br = (bDeg * Math.PI) / 180;
  const adx = Math.cos(ar);
  const ady = -Math.sin(ar);
  const bdx = Math.cos(br);
  const bdy = -Math.sin(br);
  const det = adx * bdy - ady * bdx;
  if (Math.abs(det) < 1e-6) return { x: (ax + bx) / 2, y: ay - 70 };
  const t = ((bx - ax) * bdy - (by - ay) * bdx) / det;
  return { x: ax + t * adx, y: ay + t * ady };
}

export function AngleProof({ active = true, onExit }: { active?: boolean; onExit?: () => void }) {
  return (
    <RoundProof<AnglePrompt>
      active={active}
      onExit={onExit}
      track="angles"
      mark="∠"
      title="Angles"
      menuKicker="GEOMETRY"
      menuTitle="Read the corner."
      menuBody="A right angle, a straight line, a triangle, or a crossing. The mark is given. Name the blank. Keys 1 to 4. A miss costs a heart. Sixteen levels."
      levels={ANGLE_LEVELS}
      audit={auditAngle}
      renderScene={(prompt) => (
        <div>
          <AngleFigure scene={prompt.scene} />
          <p className="mt-1 text-center font-mono text-xs text-mist">{angleCaption(prompt.scene)}</p>
        </div>
      )}
    />
  );
}
