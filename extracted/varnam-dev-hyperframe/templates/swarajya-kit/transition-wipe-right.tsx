/**
 * TransitionWipeRight — Navy bar grows from left edge then retreats.
 * Frames 0–20: width 0 → 1920 (bar grows from left).
 * Frames 20–30: width 1920 → 0 (bar shrinks from left, revealing next).
 * Clean geometric wipe pattern.
 */

import React from "react";
import { useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK } from "./_tokens";

loadInter();

const progress = (frame: number, start: number, n: number) =>
  Math.min(1, Math.max(0, (frame - start) / n));

const eased = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

export interface TransitionWipeRightProps {
  durationInFrames: number;
}

export const TransitionWipeRight: React.FC<TransitionWipeRightProps> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();

  const growFrames = Math.round(durationInFrames * 0.667); // 20 of 30
  const shrinkFrames = durationInFrames - growFrames;       // 10 of 30

  const tGrow = eased(progress(frame, 0, growFrames));
  const tShrink = eased(progress(frame, growFrames, shrinkFrames));

  const barWidth = frame < growFrames ? 1920 * tGrow : 1920 * (1 - tShrink);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: barWidth,
          height: "100%",
          backgroundColor: SK.bg.navy,
        }}
      />
    </div>
  );
};

export default TransitionWipeRight;

export const demo = {
  compositionId: "sk-transition-wipe-right",
  durationInFrames: 30,
  props: { durationInFrames: 30 } satisfies TransitionWipeRightProps,
};
