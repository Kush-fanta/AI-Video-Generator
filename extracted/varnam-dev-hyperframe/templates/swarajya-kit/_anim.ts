import { interpolate, Easing } from "remotion";

/** Fade-in over SK.motion.fadeFrames. Use for text entry and card arrivals. */
export const fadeIn = (frame: number, startFrame = 0, durationFrames = 12) =>
  interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) },
  );

/** Fade-out ending at endFrame. Pair with fadeIn for entry + exit. */
export const fadeOut = (frame: number, endFrame: number, durationFrames = 12) =>
  interpolate(
    frame,
    [endFrame - durationFrames, endFrame],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) },
  );

/** Combined fade envelope — 1.0 inside, 0 at edges. */
export const fadeEnvelope = (
  frame: number,
  durationFrames: number,
  fadeFrames = 12,
) => Math.min(fadeIn(frame, 0, fadeFrames), fadeOut(frame, durationFrames, fadeFrames));

/** Slight scale-in for stat numbers — 0.96 → 1.00, subtle. */
export const subtleScale = (frame: number, startFrame = 0, durationFrames = 18) =>
  interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [0.96, 1.0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) },
  );

/**
 * Stat overshoot scale — 0.88 → 1.04 → 1.0 in three keyframes.
 * Matches the channel's stat entry spec: scale in, slight overshoot, settle.
 * durationFrames: total frames for the enter+settle (default 18 ≈ 0.6s at 30fps).
 */
export const statScaleOvershoot = (frame: number, startFrame = 0, durationFrames = 18) => {
  const peakFrame = startFrame + Math.round(durationFrames * 0.6);  // 60% of duration = peak
  const settleFrame = startFrame + durationFrames;
  return interpolate(
    frame,
    [startFrame, peakFrame, settleFrame],
    [0.88, 1.04, 1.0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) },
  );
};

/**
 * Count-up from 0 to a numeric target.
 * Returns the display value (number) at any frame. Caller formats as string.
 * startFrame: frame when counting begins.
 * durationFrames: frames over which the count-up runs (eased out).
 * target: the final numeric value.
 * decimals: decimal places to preserve in the return value.
 */
export const countUp = (
  frame: number,
  target: number,
  startFrame = 0,
  durationFrames = 30,
  decimals = 0,
): number => {
  const t = interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [0, target],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) },
  );
  const factor = Math.pow(10, decimals);
  return Math.round(t * factor) / factor;
};
