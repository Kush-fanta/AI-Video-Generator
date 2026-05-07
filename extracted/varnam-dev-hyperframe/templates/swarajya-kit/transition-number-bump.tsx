/**
 * TransitionNumberBump — Large number center stage on navy.
 * Inter Black 140px in SK.accent.red scales 0.8→1.0 over first 12 frames.
 * Below number: Inter Medium 28px white label fades in at frame 12.
 * All fades out at frame 48.
 * 60 frames total.
 */

import React from "react";
import { useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK } from "./_tokens";
import { fadeIn, fadeOut } from "./_anim";

const { fontFamily: interFamily } = loadInter();

const progress = (frame: number, start: number, n: number) =>
  Math.min(1, Math.max(0, (frame - start) / n));

export interface TransitionNumberBumpProps {
  number: string;
  label: string;
  durationInFrames: number;
}

export const TransitionNumberBump: React.FC<TransitionNumberBumpProps> = ({
  number,
  label,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();

  // Scale 0.8 → 1.0 over 12 frames
  const scale = 0.8 + 0.2 * progress(frame, 0, 12);

  const numberOpacity = Math.min(
    fadeIn(frame, 0, SK.motion.fadeFrames),
    fadeOut(frame, durationInFrames, SK.motion.fadeFrames),
  );

  const labelOpacity = Math.min(
    fadeIn(frame, 12, SK.motion.fadeFrames),
    fadeOut(frame, durationInFrames, SK.motion.fadeFrames),
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: SK.bg.navy,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* Large number */}
        <span
          style={{
            fontFamily: interFamily,
            fontWeight: SK.weight.black,
            fontSize: SK.size.mega,
            color: SK.accent.red,
            lineHeight: 1,
            transform: `scale(${scale})`,
            transformOrigin: "center center",
            display: "block",
            opacity: numberOpacity,
          }}
        >
          {number}
        </span>
        {/* Sub-label */}
        <span
          style={{
            fontFamily: interFamily,
            fontWeight: SK.weight.medium,
            fontSize: 28,
            color: SK.text.white,
            letterSpacing: "0.04em",
            opacity: labelOpacity,
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
};

export default TransitionNumberBump;

export const demo = {
  compositionId: "sk-transition-number-bump",
  durationInFrames: 60,
  props: {
    number: "3",
    label: "next",
    durationInFrames: 60,
  } satisfies TransitionNumberBumpProps,
};
