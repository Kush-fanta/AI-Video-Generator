/**
 * TransitionFlash — White flash into black.
 * Frames 0–5: white at full opacity.
 * Frames 5–15: white fades out as black fades in.
 * Frames 15–30: holds black.
 * Signals a hard cut with visual energy.
 */

import React from "react";
import { useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK } from "./_tokens";

loadInter();

const progress = (frame: number, start: number, n: number) =>
  Math.min(1, Math.max(0, (frame - start) / n));

export interface TransitionFlashProps {
  durationInFrames: number;
}

export const TransitionFlash: React.FC<TransitionFlashProps> = ({
  durationInFrames: _durationInFrames,
}) => {
  const frame = useCurrentFrame();

  // White layer: full opacity 0–5, fades out 5–15
  const whiteOpacity = frame < 5 ? 1 : 1 - progress(frame, 5, 10);

  // Black layer: fades in 5–15, full opacity 15+
  const blackOpacity = progress(frame, 5, 10);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {/* Black base */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: SK.bg.black,
          opacity: blackOpacity,
        }}
      />
      {/* White flash on top */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#FFFFFF",
          opacity: whiteOpacity,
        }}
      />
    </div>
  );
};

export default TransitionFlash;

export const demo = {
  compositionId: "sk-transition-flash",
  durationInFrames: 30,
  props: { durationInFrames: 30 } satisfies TransitionFlashProps,
};
