/**
 * StatDelta — Before → After pattern. Muted "from" value, red arrow, dominant "to" value.
 *
 * Ref frame: /tmp/swarajya-study/frames/Rc7Knnuai-Q/120s.png (stat weight hierarchy)
 * Purpose: Show a directional change. The "from" recedes (mute, 80px), the arrow
 *          signals movement (red, 48px), the "to" dominates (white, 120px).
 *          All-caps label above the row. Optional 1-line caption below.
 *
 * Props: {
 *   label: string; fromValue: string; toValue: string;
 *   caption?: string; durationInFrames: number; bg?: "navy" | "black"
 * }
 */

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadSpaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { SK } from "./_tokens";
import { fadeEnvelope, subtleScale } from "./_anim";

loadInter();
loadSpaceGrotesk();

export interface StatDeltaProps {
  label: string;
  fromValue: string;
  toValue: string;
  caption?: string;
  durationInFrames: number;
  bg?: "navy" | "black";
}

export const StatDelta: React.FC<StatDeltaProps> = ({
  label,
  fromValue,
  toValue,
  caption,
  durationInFrames,
  bg = "navy",
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);
  const scale = subtleScale(frame, 0, 18);

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
          gap: 20,
          maxWidth: SK.safe.columnWidth,
          width: "100%",
        }}
      >
        {/* All-caps label above the row */}
        <span
          style={{
            fontFamily: SK.font.sans,
            fontWeight: SK.weight.medium,
            fontSize: SK.size.label,
            color: SK.text.mute,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            textAlign: "center",
          }}
        >
          {label}
        </span>

        {/* Delta row: from → to */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "baseline",
            gap: 24,
            transform: `scale(${scale})`,
            transformOrigin: "center center",
          }}
        >
          {/* "From" value — muted, smaller */}
          <span
            style={{
              fontFamily: SK.font.display,
              fontWeight: SK.weight.bold,
              fontSize: 80,
              color: SK.text.mute,
              lineHeight: 1,
            }}
          >
            {fromValue}
          </span>

          {/* Arrow — red, mid-size, baseline aligned */}
          <span
            style={{
              fontFamily: SK.font.display,
              fontWeight: SK.weight.regular,
              fontSize: 48,
              color: SK.accent.red,
              lineHeight: 1,
              // Shift up to optically align with the midpoint between 80 and 120
              position: "relative",
              bottom: 6,
            }}
          >
            →
          </span>

          {/* "To" value — dominant */}
          <span
            style={{
              fontFamily: SK.font.display,
              fontWeight: SK.weight.bold,
              fontSize: 120,
              color: SK.text.white,
              lineHeight: 1,
            }}
          >
            {toValue}
          </span>
        </div>

        {/* Optional caption below */}
        {caption && (
          <span
            style={{
              fontFamily: SK.font.sans,
              fontWeight: SK.weight.medium,
              fontSize: 24,
              color: SK.text.mute,
              textAlign: "center",
              maxWidth: SK.safe.columnWidthNarrow,
              lineHeight: 1.4,
            }}
          >
            {caption}
          </span>
        )}
      </div>
    </AbsoluteFill>
  );
};

export default StatDelta;

export const demo = {
  compositionId: "sk-stat-delta",
  durationInFrames: 180,
  props: {
    label: "Debt-to-GDP",
    fromValue: "24.6%",
    toValue: "37.7%",
    caption: "West Bengal, 1990 → 2023",
    durationInFrames: 180,
    bg: "navy" as const,
  },
};
