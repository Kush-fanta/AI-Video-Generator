/**
 * TransitionBreakLine — Red line sweeps full width, then fades out.
 * White background. Red 3px horizontal line grows from width 0 to 1920 over 20 frames.
 * Frames 20–45: entire composition fades to white (line fades out).
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

export interface TransitionBreakLineProps {
  durationInFrames: number;
}

export const TransitionBreakLine: React.FC<TransitionBreakLineProps> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();

  const growFrames = 20;
  const holdAndFadeStart = 20;
  const fadeFrames = durationInFrames - holdAndFadeStart; // 25

  // Line width: 0 → 1920 over first 20 frames
  const lineWidth = 1920 * eased(progress(frame, 0, growFrames));

  // Fade out the line after frame 20
  const lineOpacity = frame < holdAndFadeStart
    ? 1
    : 1 - progress(frame, holdAndFadeStart, fadeFrames);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        position: "relative",
      }}
    >
      {/* Red horizontal sweep line */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          width: lineWidth,
          height: 3,
          backgroundColor: SK.accent.red,
          transform: "translateY(-50%)",
          opacity: lineOpacity,
        }}
      />
    </div>
  );
};

export default TransitionBreakLine;

export const demo = {
  compositionId: "sk-transition-break-line",
  durationInFrames: 45,
  props: { durationInFrames: 45 } satisfies TransitionBreakLineProps,
};
