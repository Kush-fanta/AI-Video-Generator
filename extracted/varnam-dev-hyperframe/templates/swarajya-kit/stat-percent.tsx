/**
 * StatPercent — Percentage number with smaller inline "%" sign and descriptor below.
 *
 * Ref frame: /tmp/swarajya-study/frames/Rc7Knnuai-Q/120s.png (stat dominance pattern)
 * Purpose: Percent stat with visual weight on the number. The % is 80px and
 *          baseline-lowered so it reads as a qualifier, not equal to the digits.
 *          Descriptor phrase below in Inter Medium 28px, max 2 lines, 720px column.
 *
 * Props: { percent: number; descriptor: string; durationInFrames: number; bg?: "navy" | "black" }
 */

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadSpaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { SK } from "./_tokens";
import { fadeEnvelope, statScaleOvershoot, countUp } from "./_anim";

loadInter();
loadSpaceGrotesk();

export interface StatPercentProps {
  percent: number;
  descriptor: string;
  durationInFrames: number;
  bg?: "navy" | "black";
  /**
   * animation: "count-up" animates the number from 0 to percent over ~40 frames.
   * "fade-in" (default) — just fades and scales in with no numeric animation.
   */
  animation?: "count-up" | "fade-in";
}

export const StatPercent: React.FC<StatPercentProps> = ({
  percent,
  descriptor,
  durationInFrames,
  bg = "navy",
  animation = "fade-in",
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);
  // 0.88→1.04→1.0 overshoot per channel spec
  const scale = statScaleOvershoot(frame, 0, 18);

  // Count-up: resolve display value. Decimals = 1 if percent has a fractional part.
  const decimals = Number.isInteger(percent) ? 0 : 1;
  const displayValue =
    animation === "count-up"
      ? countUp(frame, percent, 0, 40, decimals)
      : percent;

  // Preserve one decimal if the number has one, e.g. 37.7 → "37.7"
  const formatted =
    Number.isInteger(displayValue) ? String(displayValue) : displayValue.toFixed(decimals);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bg === "black" ? SK.bg.black : SK.bg.navy,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          maxWidth: SK.safe.columnWidth,
          width: "100%",
        }}
      >
        {/* Number row with inline % */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "baseline",
            transform: `scale(${scale})`,
            transformOrigin: "center center",
          }}
        >
          <span
            style={{
              fontFamily: SK.font.display,
              fontWeight: SK.weight.bold,
              fontSize: SK.size.mega, // 140px
              color: SK.text.white,
              lineHeight: 1,
            }}
          >
            {formatted}
          </span>
          {/* % at 80px, sits on the baseline — visually subordinate */}
          <span
            style={{
              fontFamily: SK.font.display,
              fontWeight: SK.weight.bold,
              fontSize: 80,
              color: SK.text.white,
              lineHeight: 1,
              marginLeft: 6,
              // baseline-lowered: push it down slightly relative to the digits
              position: "relative",
              top: 8,
            }}
          >
            %
          </span>
        </div>

        {/* Descriptor phrase */}
        <p
          style={{
            fontFamily: SK.font.sans,
            fontWeight: SK.weight.medium,
            fontSize: SK.size.body, // 28px
            color: SK.text.offwhite,
            maxWidth: SK.safe.columnWidthNarrow,
            textAlign: "center",
            lineHeight: 1.45,
            margin: 0,
          }}
        >
          {descriptor}
        </p>
      </div>
    </AbsoluteFill>
  );
};

export default StatPercent;

export const demo = {
  compositionId: "sk-stat-percent",
  durationInFrames: 150,
  props: {
    percent: 37.7,
    descriptor: "Share of state GDP owed — twice the national average",
    durationInFrames: 150,
    bg: "navy" as const,
  },
};
