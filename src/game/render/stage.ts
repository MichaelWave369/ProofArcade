export const DOOR_SPRING = { stiffness: 260, damping: 28, mass: 1 } as const;
export const ARRIVE_SPRING = { stiffness: 170, damping: 12, mass: 1 } as const;
export const ARRIVE_KICK = -2.2;

export function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

/** Draw position for a traveling mark. Negative anticipation stays at the start. */
export function arriveDraw(t: number): number {
  if (!Number.isFinite(t)) return 0;
  return Math.min(1, Math.max(0, t));
}

export function mix(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

export function doorPose(t: number): { lobbyOpacity: number; lobbyScale: number; stationOpacity: number; stationY: number } {
  const u = clamp01(t);
  return {
    lobbyOpacity: clamp01(1 - t),
    lobbyScale: 1 + u * 0.035,
    stationOpacity: u,
    stationY: (1 - t) * 22,
  };
}
