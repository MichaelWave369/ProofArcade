import { useEffect, useRef, useState } from "react";
import { ARRIVE_KICK, ARRIVE_SPRING, DOOR_SPRING } from "@/game/render/stage";
import { createClock, createSpring, kick, stepSpring } from "@/game/render/motion";

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches === true;
}

/** 0 while a mark is traveling, 1 when it has arrived. Reduced motion snaps to 1. */
export function useArrive(token: string): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion()) {
      setValue(1);
      return;
    }
    const spring = createSpring(0, { target: 1, ...ARRIVE_SPRING });
    kick(spring, ARRIVE_KICK);
    const clock = createClock();
    let raf = 0;
    let last = performance.now();
    let frames = 0;
    const loop = (now: number) => {
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      stepSpring(spring, dt, clock);
      frames += 1;
      const settled = Math.abs(spring.value - 1) < 0.012 && Math.abs(spring.velocity) < 0.08;
      if (settled || frames > 180) {
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

export function useDoor(open: boolean): number {
  const [value, setValue] = useState(open ? 1 : 0);
  const valueRef = useRef(value);
  valueRef.current = value;
  useEffect(() => {
    const target = open ? 1 : 0;
    if (prefersReducedMotion()) {
      setValue(target);
      return;
    }
    const spring = createSpring(valueRef.current, { target, ...DOOR_SPRING });
    const clock = createClock();
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      stepSpring(spring, dt, clock);
      const settled = Math.abs(spring.value - target) < 0.01 && Math.abs(spring.velocity) < 0.08;
      if (settled) {
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
