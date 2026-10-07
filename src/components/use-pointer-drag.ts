import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

export type DragPoint = { left: number; top: number };
export type DragSize = { width: number; height: number };

export type ActivePointerDrag<T> = {
  pointerId: number;
  payload: T;
  origin: DragPoint;
  current: DragPoint;
  pointerStart: { x: number; y: number };
  grabOffset: { x: number; y: number };
  size: DragSize;
  phase: "dragging" | "snapping" | "returning";
};

export type DragBounds = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

export type DropResolution = {
  accepted: boolean;
  target?: DragPoint;
  settleMs?: number;
  onAccepted?: () => void;
  onRejected?: () => void;
};

export function pointInside(bounds: DragBounds, x: number, y: number, padding = 0): boolean {
  return (
    x >= bounds.left - padding &&
    x <= bounds.right + padding &&
    y >= bounds.top - padding &&
    y <= bounds.bottom + padding
  );
}

export function magneticPoint(
  bounds: DragBounds,
  size: DragSize,
  pointerX: number,
  pointerY: number,
  inset = 8,
): DragPoint {
  const minLeft = bounds.left + inset;
  const maxLeft = Math.max(minLeft, bounds.right - size.width - inset);
  const minTop = bounds.top + inset;
  const maxTop = Math.max(minTop, bounds.bottom - size.height - inset);
  return {
    left: Math.min(maxLeft, Math.max(minLeft, pointerX - size.width / 2)),
    top: Math.min(maxTop, Math.max(minTop, pointerY - size.height / 2)),
  };
}

export function useReducedMotionPreference(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}

export function usePointerDrag<T>(threshold = 6) {
  const [drag, setDrag] = useState<ActivePointerDrag<T> | null>(null);
  const dragRef = useRef<ActivePointerDrag<T> | null>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressClickUntil = useRef(0);

  const commitDrag = useCallback((next: ActivePointerDrag<T> | null) => {
    dragRef.current = next;
    setDrag(next);
  }, []);

  const clearTimer = useCallback(() => {
    if (settleTimer.current) clearTimeout(settleTimer.current);
    settleTimer.current = null;
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  const beginDrag = useCallback(
    (event: ReactPointerEvent<HTMLElement>, payload: T) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      clearTimer();
      const rect = event.currentTarget.getBoundingClientRect();
      event.currentTarget.setPointerCapture?.(event.pointerId);
      commitDrag({
        pointerId: event.pointerId,
        payload,
        origin: { left: rect.left, top: rect.top },
        current: { left: rect.left, top: rect.top },
        pointerStart: { x: event.clientX, y: event.clientY },
        grabOffset: { x: event.clientX - rect.left, y: event.clientY - rect.top },
        size: { width: rect.width, height: rect.height },
        phase: "dragging",
      });
    },
    [clearTimer, commitDrag],
  );

  const moveDrag = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const active = dragRef.current;
      if (!active || active.pointerId !== event.pointerId || active.phase !== "dragging") return;
      commitDrag({
        ...active,
        current: {
          left: event.clientX - active.grabOffset.x,
          top: event.clientY - active.grabOffset.y,
        },
      });
    },
    [commitDrag],
  );

  const finishDrag = useCallback(
    (
      event: ReactPointerEvent<HTMLElement>,
      resolve: (
        payload: T,
        pointer: { x: number; y: number },
        size: DragSize,
      ) => DropResolution,
      reducedMotion = false,
    ): boolean => {
      const active = dragRef.current;
      if (!active || active.pointerId !== event.pointerId) return false;

      try {
        event.currentTarget.releasePointerCapture?.(event.pointerId);
      } catch {
        // Capture can already be released by the browser during cancellation.
      }

      const dx = event.clientX - active.pointerStart.x;
      const dy = event.clientY - active.pointerStart.y;
      const moved = Math.hypot(dx, dy) >= threshold;
      if (!moved) {
        commitDrag(null);
        return false;
      }

      suppressClickUntil.current = Date.now() + 160;
      const resolution = resolve(
        active.payload,
        { x: event.clientX, y: event.clientY },
        active.size,
      );

      const settle = () => {
        commitDrag(null);
        if (resolution.accepted) resolution.onAccepted?.();
        else resolution.onRejected?.();
      };

      if (reducedMotion) {
        settle();
        return true;
      }

      const target = resolution.accepted
        ? resolution.target ?? active.current
        : active.origin;
      commitDrag({
        ...active,
        current: target,
        phase: resolution.accepted ? "snapping" : "returning",
      });
      settleTimer.current = setTimeout(settle, resolution.settleMs ?? 160);
      return true;
    },
    [commitDrag, threshold],
  );

  const cancelDrag = useCallback(() => {
    const active = dragRef.current;
    if (!active) return;
    commitDrag({ ...active, current: active.origin, phase: "returning" });
    settleTimer.current = setTimeout(() => commitDrag(null), 120);
  }, [commitDrag]);

  const consumeSuppressedClick = useCallback(() => {
    if (Date.now() > suppressClickUntil.current) return false;
    suppressClickUntil.current = 0;
    return true;
  }, []);

  return {
    drag,
    beginDrag,
    moveDrag,
    finishDrag,
    cancelDrag,
    consumeSuppressedClick,
  };
}
