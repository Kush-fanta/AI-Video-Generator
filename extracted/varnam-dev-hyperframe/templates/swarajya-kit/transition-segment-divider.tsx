/**
 * TransitionSegmentDivider — Centered pill badge on black with segment title.
 * Inter SemiBold 36px red text, black bg, red 1px border, 8px radius.
 * Entire badge uses fadeEnvelope over 60 frames with SK.motion.fadeFrames.
 * 60 frames total.
 */

import React from "react";
import { useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK } from "./_tokens";
import { fadeEnvelope } from "./_anim";

const { fontFamily: interFamily } = loadInter();

export interface TransitionSegmentDividerProps {
  segmentTitle: string;
  durationInFrames: number;
}

export const TransitionSegmentDivider: React.FC<TransitionSegmentDividerProps> = ({
  segmentTitle,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: SK.bg.black,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          opacity,
          border: `1px solid ${SK.accent.red}`,
          borderRadius: 8,
          padding: "12px 32px",
          backgroundColor: SK.bg.black,
        }}
      >
        <span
          style={{
            fontFamily: interFamily,
            fontWeight: SK.weight.semibold,
            fontSize: 36,
            color: SK.accent.red,
            letterSpacing: "0.02em",
          }}
        >
          {segmentTitle}
        </span>
      </div>
    </div>
  );
};

export default TransitionSegmentDivider;

export const demo = {
  compositionId: "sk-transition-segment-divider",
  durationInFrames: 60,
  props: {
    segmentTitle: "The Numbers",
    durationInFrames: 60,
  } satisfies TransitionSegmentDividerProps,
};
