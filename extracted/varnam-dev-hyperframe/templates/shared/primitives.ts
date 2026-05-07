import { interpolate, spring } from "remotion";

export const FPS = 30;
export const s = (sec: number) => Math.round(sec * FPS);
export const ease = (t: number) => 1 - Math.pow(1 - t, 3);
export const C = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

/** 18-frame snappy reveal: fade + translateY(14→0) */
export const reveal = (frame: number, at: number, dur = 18) => ({
  opacity: interpolate(frame, [at, at + dur], [0, 1], C),
  transform: `translateY(${interpolate(frame, [at, at + dur], [14, 0], { ...C, easing: ease })}px)`,
});

/** Accent line grows from 0→100% width */
export const lineGrow = (frame: number, at: number, dur = 25) =>
  interpolate(frame, [at, at + dur], [0, 100], { ...C, easing: ease });

/** Ken Burns: slow scale drift over duration */
export const kenBurns = (frame: number, dur: number, from = 1.03, to = 1.08) =>
  interpolate(frame, [0, dur], [from, to], C);

/** Spring with overshoot for hero numbers */
export const overshootScale = (frame: number, at: number) =>
  interpolate(frame, [at, at + 10, at + 18, at + 28], [1.05, 1.0, 1.015, 1.0], C);

/** Spring-like elastic easing for proportion bar fills */
export const springEase = (t: number) => {
  const c4 = (2 * Math.PI) / 3;
  return t === 0 ? 0 : t === 1 ? 1
    : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
};

/** Dim previous element when next one arrives */
export const dimTo = (frame: number, at: number, target = 0.15, dur = 10) =>
  interpolate(frame, [at - dur / 2, at + dur / 2], [1, target], C);
