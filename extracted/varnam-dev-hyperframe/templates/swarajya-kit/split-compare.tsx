/**
 * SplitCompare — Two vertical columns with eyebrow / stat / descriptor.
 *
 * Purpose: Side-by-side comparison. Each column: all-caps eyebrow (18px mute),
 *          large stat (Space Grotesk Bold 80px), descriptor (Inter Medium 22px,
 *          max 360px wide). A 1px red vertical divider sits between the columns
 *          at 80% height of the stat rows. Total layout width ≤ 880.
 *
 * Props: {
 *   leftEyebrow: string; leftStat: string; leftDescriptor: string;
 *   rightEyebrow: string; rightStat: string; rightDescriptor: string;
 *   durationInFrames: number; bg?: "navy" | "black"
 * }
 */

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadSpaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { SK, resolveSKPalette, type SKPaletteName } from "./_tokens";
import { fadeEnvelope, subtleScale } from "./_anim";

loadInter();
loadSpaceGrotesk();

export interface SplitCompareProps {
  leftEyebrow: string;
  leftStat: string;
  leftDescriptor: string;
  rightEyebrow: string;
  rightStat: string;
  rightDescriptor: string;
  durationInFrames: number;
  bg?: "navy" | "black";
  palette?: SKPaletteName;
}

const COL_WIDTH = 360;
const DIVIDER_HEIGHT = 200; // 80% of ~250px stat block

const Column: React.FC<{
  eyebrow: string;
  stat: string;
  descriptor: string;
  align: "left" | "right";
  scale: number;
  textColor: string;
  mutedColor: string;
}> = ({ eyebrow, stat, descriptor, align, scale, textColor, mutedColor }) => (
  <div
    style={{
      width: COL_WIDTH,
      display: "flex",
      flexDirection: "column",
      alignItems: align === "left" ? "flex-end" : "flex-start",
      gap: 14,
      transform: `scale(${scale})`,
      transformOrigin: align === "left" ? "right center" : "left center",
    }}
  >
    <span
      style={{
        fontFamily: SK.font.sans,
        fontWeight: SK.weight.medium,
        fontSize: SK.size.label,
        color: mutedColor,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        textAlign: align,
      }}
    >
      {eyebrow}
    </span>
    <span
      style={{
        fontFamily: SK.font.display,
        fontWeight: SK.weight.bold,
        fontSize: 80,
        color: textColor,
        lineHeight: 1,
        textAlign: align,
      }}
    >
      {stat}
    </span>
    <span
      style={{
        fontFamily: SK.font.sans,
        fontWeight: SK.weight.medium,
        fontSize: 22,
        color: mutedColor,
        lineHeight: 1.4,
        maxWidth: COL_WIDTH,
        textAlign: align,
      }}
    >
      {descriptor}
    </span>
  </div>
);

export const SplitCompare: React.FC<SplitCompareProps> = ({
  leftEyebrow,
  leftStat,
  leftDescriptor,
  rightEyebrow,
  rightStat,
  rightDescriptor,
  durationInFrames,
  palette = "default",
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);
  const scale = subtleScale(frame, 0, 18);
  const pal = resolveSKPalette(palette);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: pal.background,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity,
      }}
    >
      {/* 360 + 48(gap) + 1(divider) + 48(gap) + 360 = 817px — within 880 */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 48,
          maxWidth: SK.safe.columnWidth,
        }}
      >
        <Column
          eyebrow={leftEyebrow}
          stat={leftStat}
          descriptor={leftDescriptor}
          align="right"
          scale={scale}
          textColor={pal.text}
          mutedColor={pal.textMuted}
        />

        {/* Red vertical divider at 80% height of stat area */}
        <div
          style={{
            width: 1,
            height: DIVIDER_HEIGHT,
            backgroundColor: pal.accent,
            flexShrink: 0,
          }}
        />

        <Column
          eyebrow={rightEyebrow}
          stat={rightStat}
          descriptor={rightDescriptor}
          align="left"
          scale={scale}
          textColor={pal.text}
          mutedColor={pal.textMuted}
        />
      </div>
    </AbsoluteFill>
  );
};

export default SplitCompare;

export const demo = {
  compositionId: "sk-split-compare",
  durationInFrames: 180,
  props: {
    leftEyebrow: "Indian Air Defence Missile",
    leftStat: "$2M+",
    leftDescriptor: "Cost per interception of an incoming threat",
    rightEyebrow: "Pakistani Kamikaze Drone",
    rightStat: "~$20K",
    rightDescriptor: "Cost to manufacture and deploy each drone unit",
    durationInFrames: 180,
    bg: "navy" as const,
  },
};
