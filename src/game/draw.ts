import { DOMAIN_GLASS, SPECIAL_GLASS, type Glass } from "./bank";
import {
  COLS,
  DANGER_Y,
  SHOOTER_X,
  SHOOTER_Y,
  WORLD_H,
  WORLD_W,
  centerOf,
  type Game,
  type Orb,
} from "./engine";

export type Layout = {
  scale: number;
  ox: number;
  oy: number;
  w: number;
  h: number;
};

export function layoutOf(w: number, h: number): Layout {
  const pad = 14;
  const scale = Math.min((w - pad * 2) / WORLD_W, (h - pad * 2) / WORLD_H);
  return {
    scale: Math.max(1, scale),
    ox: (w - WORLD_W * scale) / 2,
    oy: (h - WORLD_H * scale) / 2,
    w,
    h,
  };
}

export function screenToWorld(layout: Layout, sx: number, sy: number) {
  return {
    x: (sx - layout.ox) / layout.scale,
    y: (sy - layout.oy) / layout.scale,
  };
}

export function glassOf(orb: Pick<Orb, "domain" | "special">): Glass {
  if (orb.special) return SPECIAL_GLASS[orb.special];
  return DOMAIN_GLASS[orb.domain];
}

function worldX(layout: Layout, x: number) {
  return layout.ox + x * layout.scale;
}
function worldY(layout: Layout, y: number) {
  return layout.oy + y * layout.scale;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function popIn(t: number, placed: number) {
  const u = (t - placed) / 0.2;
  if (u >= 1 || u <= 0) return 1;
  const c1 = 1.70158;
  const c3 = c1 + 1;
  const x = u - 1;
  return 0.62 + 0.38 * (1 + c3 * x * x * x + c1 * x * x);
}

export function drawOrb(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  orb: Pick<Orb, "a" | "b" | "domain" | "special">,
  alpha = 1,
) {
  if (radius < 2) return;
  const glass = glassOf(orb);
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y);

  ctx.beginPath();
  ctx.arc(0, radius * 0.18, radius * 0.92, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.fill();

  const body = ctx.createRadialGradient(-radius * 0.32, -radius * 0.38, radius * 0.12, 0, 0, radius);
  body.addColorStop(0, glass.hi);
  body.addColorStop(0.42, glass.mid);
  body.addColorStop(1, glass.deep);
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.96, 0, Math.PI * 2);
  ctx.fillStyle = body;
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(-radius * 0.08, radius * 0.22, radius * 0.46, radius * 0.28, -0.5, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(-radius * 0.28, -radius * 0.34, radius * 0.26, radius * 0.15, -0.7, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.78)";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.96, 0, Math.PI * 2);
  ctx.strokeStyle = glass.rim;
  ctx.lineWidth = Math.max(1.25, radius * 0.055);
  ctx.stroke();

  const maxW = radius * 1.45;
  const lines = orb.b ? [orb.a, orb.b] : [orb.a];
  let size = orb.b ? radius * 0.4 : radius * 0.48;
  const fontFor = (px: number) => `600 ${Math.max(8, px)}px "IBM Plex Mono", ui-monospace, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let guard = 0; guard < 12; guard++) {
    ctx.font = fontFor(size);
    const widest = Math.max(...lines.map((line) => ctx.measureText(line).width));
    if (widest <= maxW || size <= 8) break;
    size -= 1;
  }
  const lineH = size * 1.05;
  const blockH = lineH * lines.length;
  const pillW = Math.min(radius * 1.7, maxW + radius * 0.28);
  const pillH = blockH + radius * 0.18;
  ctx.fillStyle = "rgba(7,8,13,0.62)";
  roundRect(ctx, -pillW / 2, -pillH / 2, pillW, pillH, radius * 0.16);
  ctx.fill();
  lines.forEach((line, i) => {
    ctx.fillStyle = i === 0 ? "#f4efe4" : "#f3d7a1";
    ctx.fillText(line, 0, -blockH / 2 + lineH * 0.5 + i * lineH);
  });

  ctx.restore();
}

function drawLattice(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  ctx.save();
  ctx.translate(w * 0.5, h * 0.42);
  ctx.rotate(t * 0.04);
  ctx.strokeStyle = "rgba(228,177,90,0.09)";
  ctx.lineWidth = 1;
  const R = Math.max(w, h) * 0.55;
  for (let ring = 1; ring <= 5; ring++) {
    ctx.beginPath();
    for (let i = 0; i <= 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      const x = Math.cos(a) * R * (ring / 5);
      const y = Math.sin(a) * R * (ring / 5);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(0, 0, R * 0.72, 0, Math.PI * 2);
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
    a += 0.28 * phi;
  }
  ctx.strokeStyle = "rgba(143,208,176,0.08)";
  ctx.stroke();
  ctx.restore();
}

export function drawGame(
  ctx: CanvasRenderingContext2D,
  g: Game,
  cssW: number,
  cssH: number,
  dpr: number,
) {
  const layout = layoutOf(cssW, cssH);
  const amp = g.shake && !g.reduced ? g.trauma * g.trauma : 0;
  const ox = Math.sin(g.t * 43) * 8 * amp;
  const oy = Math.cos(g.t * 31) * 6 * amp;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);

  const bg = ctx.createLinearGradient(0, 0, 0, cssH);
  bg.addColorStop(0, "#10131c");
  bg.addColorStop(0.45, "#07080d");
  bg.addColorStop(1, "#0c0b10");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, cssW, cssH);

  for (let i = 0; i < 28; i++) {
    const sx = ((i * 97) % 100) / 100 * cssW;
    const sy = ((i * 53) % 100) / 100 * cssH;
    const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(g.t * 0.8 + i));
    ctx.fillStyle = `rgba(244,239,228,${0.04 + tw * 0.12})`;
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
  if (g.phase !== "menu") {
    for (let r = 0; r < g.grid.length; r++) {
      for (let c = 0; c < g.grid[r].length; c++) {
        if (!g.grid[r][c]) continue;
        nearest = Math.min(nearest, DANGER_Y - (centerOf(g, r, c).y + 0.92));
      }
    }
  }
  const hot = nearest < 1.7;
  ctx.save();
  ctx.setLineDash([6, 8]);
  ctx.strokeStyle = hot ? `rgba(224,122,106,${0.55 + 0.25 * Math.sin(g.t * 6)})` : "rgba(224,122,106,0.28)";
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  ctx.moveTo(worldX(layout, 0.2), dangerSy);
  ctx.lineTo(worldX(layout, WORLD_W - 0.2), dangerSy);
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = hot ? "rgba(224,122,106,0.8)" : "rgba(163,156,144,0.55)";
  ctx.font = `600 ${Math.max(9, R * 0.28)}px Syne, sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "bottom";
  ctx.fillText("LIMIT", worldX(layout, 0.25), dangerSy - 4);

  if (g.grid.length) {
    const ceilY = worldY(layout, centerOf(g, 0, 0).y - 1.15);
    const x0 = worldX(layout, 0.15);
    const x1 = worldX(layout, WORLD_W - 0.15);
    ctx.strokeStyle = "rgba(228,177,90,0.85)";
    ctx.lineWidth = Math.max(2, R * 0.08);
    ctx.beginPath();
    ctx.moveTo(x0, ceilY);
    ctx.lineTo(x1, ceilY);
    ctx.stroke();
    ctx.fillStyle = "#e4b15a";
    const ticks = COLS;
    for (let i = 0; i <= ticks; i++) {
      const x = x0 + ((x1 - x0) * i) / ticks;
      ctx.beginPath();
      ctx.arc(x, ceilY, Math.max(1.5, R * 0.06), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if ((g.phase === "menu" || g.phase === "over") && !g.shot) {
    for (const d of g.drift) {
      ctx.save();
      ctx.translate(worldX(layout, d.x), worldY(layout, d.y));
      ctx.rotate(d.rot * 0.15);
      drawOrb(ctx, 0, 0, R * 0.92, d.orb, 0.9);
      ctx.restore();
    }
  }

  const showAim = g.phase === "play" && !g.shot && g.waveDelay <= 0;
  if (showAim && g.aimPath.length > 1) {
    const glass = glassOf(g.current);
    ctx.fillStyle = glass.rim;
    for (let i = 0; i < g.aimPath.length; i += 2) {
      const p = g.aimPath[i];
      const fade = 0.15 + (i / g.aimPath.length) * 0.45;
      ctx.globalAlpha = fade;
      ctx.beginPath();
      ctx.arc(worldX(layout, p.x), worldY(layout, p.y), Math.max(1.5, R * 0.07), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  const previewSet = new Set(g.preview.map((p) => `${p.r},${p.c}`));
  for (let r = 0; r < g.grid.length; r++) {
    for (let c = 0; c < g.grid[r].length; c++) {
      const orb = g.grid[r][c];
      if (!orb) continue;
      const p = centerOf(g, r, c);
      const grow = popIn(g.t, orb.placedT);
      const sx = worldX(layout, p.x);
      const sy = worldY(layout, p.y);
      drawOrb(ctx, sx, sy, R * 0.96 * grow, orb, 1);
      const hovered = g.hoverCanon && orb.canon === g.hoverCanon && !orb.special;
      const marked = previewSet.has(`${r},${c}`);
      if (hovered || marked) {
        ctx.beginPath();
        ctx.arc(sx, sy, R * (marked ? 1.05 + Math.sin(g.t * 8) * 0.04 : 1.04), 0, Math.PI * 2);
        ctx.strokeStyle = marked ? "rgba(244,239,228,0.9)" : "rgba(228,177,90,0.95)";
        ctx.lineWidth = marked ? 2.5 : 2;
        ctx.stroke();
      }
    }
  }

  if (showAim && g.previewLand) {
    drawOrb(
      ctx,
      worldX(layout, g.previewLand.x),
      worldY(layout, g.previewLand.y),
      R * 0.96,
      g.current,
      g.preview.length ? 0.72 : 0.4,
    );
  }

  for (const f of g.falling) {
    ctx.save();
    ctx.translate(worldX(layout, f.x), worldY(layout, f.y));
    ctx.rotate(f.rot);
    drawOrb(ctx, 0, 0, R * 0.96, f.orb, 1);
    ctx.restore();
  }

  if (g.shot) {
    const ang = Math.atan2(g.shot.vy, g.shot.vx);
    const stretch = g.reduced ? 1 : 1.16;
    const squash = g.reduced ? 1 : 0.88;
    ctx.save();
    ctx.translate(worldX(layout, g.shot.x), worldY(layout, g.shot.y));
    ctx.rotate(ang);
    ctx.scale(stretch, squash);
    ctx.rotate(-ang);
    drawOrb(ctx, 0, 0, R * 0.96, g.shot.orb, 1);
    ctx.restore();
  }

  if (g.phase === "play" || g.phase === "pause") {
    const bob = Math.sin(g.t * 2.5) * R * 0.04;
    const recoil = g.reduced ? 0 : g.recoil * R * 0.12;
    const sx = worldX(layout, SHOOTER_X);
    const sy = worldY(layout, SHOOTER_Y) + bob + recoil;
    const vane = 1.55 * R;
    ctx.strokeStyle = "rgba(228,177,90,0.9)";
    ctx.lineWidth = Math.max(2, R * 0.07);
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + Math.cos(g.angle) * vane, sy + Math.sin(g.angle) * vane);
    ctx.stroke();
    ctx.fillStyle = "#e4b15a";
    ctx.beginPath();
    ctx.arc(sx + Math.cos(g.angle) * vane, sy + Math.sin(g.angle) * vane, Math.max(2.5, R * 0.08), 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(228,177,90,0.35)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(sx, sy + R * 0.15, R * 1.15, Math.PI * 1.08, Math.PI * 1.92);
    ctx.stroke();

    if (!g.shot) drawOrb(ctx, sx, sy, R * 0.98, g.current, 1);
  }

  for (const p of g.particles) {
    const alpha = Math.max(0, p.life / p.max);
    const sx = worldX(layout, p.x);
    const sy = worldY(layout, p.y);
    if (p.kind === "ring") {
      const rad = R * (0.4 + (1 - alpha) * 1.6);
      ctx.beginPath();
      ctx.arc(sx, sy, rad, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(243,215,161,${alpha * 0.7})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (p.kind === "glyph" && p.glyph) {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.font = `600 ${Math.max(11, R * 0.42)}px "IBM Plex Mono", ui-monospace, monospace`;
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
    const alpha = Math.max(0, f.life / f.max);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = f.color;
    ctx.font = `700 ${Math.max(14, R * 0.55)}px Syne, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(f.text, worldX(layout, f.x), worldY(layout, f.y));
    ctx.globalAlpha = 1;
  }

  if (g.bannerT > 0 && g.banner && g.phase !== "over") {
    const alpha = Math.min(1, g.bannerT * 2);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#f4efe4";
    ctx.font = `800 ${Math.max(22, R * 0.85)}px Syne, sans-serif`;
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

  const vignette = ctx.createRadialGradient(
    cssW / 2,
    cssH / 2,
    Math.min(cssW, cssH) * 0.35,
    cssW / 2,
    cssH / 2,
    Math.max(cssW, cssH) * 0.72,
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.38)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, cssW, cssH);
}
