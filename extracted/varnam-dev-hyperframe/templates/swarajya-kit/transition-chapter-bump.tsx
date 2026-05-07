/**
 * TransitionChapterBump — Named chapter break on black.
 * Frame 8: red horizontal rule fades in.
 * Frame 16: label text (Inter Medium 28px white) fades in below rule.
 * Frame 48: all fades out.
 * 60 frames total.
 */

import React from "react";
import { useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK } from "./_tokens";
import { fadeIn, fadeOut } from "./_anim";

const { fontFamily: interFamily } = loadInter();

export interface TransitionChapterBumpProps {
  label: string;
  durationInFrames: number;
}

export const TransitionChapterBump: React.FC<TransitionChapterBumpProps> = ({
  label,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();

  const ruleOpacity = Math.min(
    fadeIn(frame, 8, SK.motion.fadeFrames),
    fadeOut(frame, durationInFrames, SK.motion.fadeFrames),
  );

  const labelOpacity = Math.min(
    fadeIn(frame, 16, SK.motion.fadeFrames),
    fadeOut(frame, durationInFrames, SK.motion.fadeFrames),
  );

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
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        {/* Red horizontal rule */}
        <div
          style={{
            width: 120,
            height: 2,
            backgroundColor: SK.accent.red,
            opacity: ruleOpacity,
          }}
        />
        {/* Chapter label */}
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

export default TransitionChapterBump;

export const demo = {
  compositionId: "sk-transition-chapter-bump",
  durationInFrames: 60,
  props: {
    label: "Chapter 2",
    durationInFrames: 60,
  } satisfies TransitionChapterBumpProps,
};
