/**
 * TransitionCutBlack — Pure black fill transition.
 * Fades from transparent to black over first 15 frames, holds black for remainder.
 * Use between segments when a hard reset is needed.
 */

import React from "react";
import { useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK } from "./_tokens";
import { fadeIn } from "./_anim";

loadInter();

export interface TransitionCutBlackProps {
  durationInFrames: number;
}

export const TransitionCutBlack: React.FC<TransitionCutBlackProps> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeIn(frame, 0, Math.round(durationInFrames / 2));

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: SK.bg.black,
        opacity,
      }}
    />
  );
};

export default TransitionCutBlack;

export const demo = {
  compositionId: "sk-transition-cut-black",
  durationInFrames: 30,
  props: { durationInFrames: 30 } satisfies TransitionCutBlackProps,
};
