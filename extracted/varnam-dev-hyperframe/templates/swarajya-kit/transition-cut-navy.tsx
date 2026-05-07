/**
 * TransitionCutNavy — Navy fill transition.
 * Same timing as cut-black but uses SK.bg.navy for continuity with dark segments.
 * Fades from transparent to navy over first 15 frames, holds for remainder.
 */

import React from "react";
import { useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK } from "./_tokens";
import { fadeIn } from "./_anim";

loadInter();

export interface TransitionCutNavyProps {
  durationInFrames: number;
}

export const TransitionCutNavy: React.FC<TransitionCutNavyProps> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeIn(frame, 0, Math.round(durationInFrames / 2));

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: SK.bg.navy,
        opacity,
      }}
    />
  );
};

export default TransitionCutNavy;

export const demo = {
  compositionId: "sk-transition-cut-navy",
  durationInFrames: 30,
  props: { durationInFrames: 30 } satisfies TransitionCutNavyProps,
};
