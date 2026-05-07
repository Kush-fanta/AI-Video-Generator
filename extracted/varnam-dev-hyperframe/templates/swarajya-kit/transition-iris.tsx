/**
 * TransitionIris — Navy circle grows from center to cover the full frame.
 * Radius animates 0 → 1200px via clipPath over 30 frames, then holds.
 * Achieved with clipPath: "circle(Rpx at center)" on a navy full-frame div.
 * 45 frames total.
 */

import React from "react";
import { useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK } from "./_tokens";

loadInter();

const progress = (frame: number, start: number, n: number) =>
  Math.min(1, Math.max(0, (frame - start) / n));

const eased = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

export interface TransitionIrisProps {
  durationInFrames: number;
}

export const TransitionIris: React.FC<TransitionIrisProps> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();

  const expandFrames = Math.round(durationInFrames * (30 / 45)); // 30 frames
  const t = eased(progress(frame, 0, expandFrames));

  // Radius 0 → 1200px (large enough to cover 1920×1080 from center)
  const radius = Math.round(1200 * t);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "transparent",
      }}
    >
      {/* Navy iris fill — clips as circle expanding from center */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: SK.bg.navy,
          clipPath: `circle(${radius}px at center)`,
        }}
      />
    </div>
  );
};

export default TransitionIris;

export const demo = {
  compositionId: "sk-transition-iris",
  durationInFrames: 45,
  props: { durationInFrames: 45 } satisfies TransitionIrisProps,
};
