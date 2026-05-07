/**
 * StatComparison — Two stats side-by-side with a red vertical divider.
 *
 * Ref frame: /tmp/swarajya-study/frames/Rc7Knnuai-Q/25s.png
 * Purpose: A vs B juxtaposition — cost, scale, or count comparison.
 *          Each side: all-caps label (18px mute) + bold number (96px display).
 *          1px red rule separates them at 60% height. Optional note below divider.
 *
 * Props: {
 *   leftLabel: string; leftValue: string;
 *   rightLabel: string; rightValue: string;
 *   note?: string; durationInFrames: number; bg?: "navy" | "black"
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

export interface StatComparisonProps {
  leftLabel: string;
  leftValue: string;
  rightLabel: string;
  rightValue: string;
  note?: string;
  durationInFrames: number;
  bg?: "navy" | "black";
  palette?: SKPaletteName;
}

const SIDE_WIDTH = 380;
const DIVIDER_HEIGHT_PERCENT = 60;

export const StatSide: React.FC<{
  label: string;
  value: string;
  scale: number;
  align?: "left" | "right";
  textColor: string;
  mutedColor: string;
}> = ({ label, value, scale, align = "left", textColor, mutedColor }) => (
  <div
    style={{
      width: SIDE_WIDTH,
      display: "flex",
      flexDirection: "column",
      alignItems: align === "left" ? "flex-end" : "flex-start",
      gap: 12,
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
      {label}
    </span>
    <span
      style={{
        fontFamily: SK.font.display,
        fontWeight: SK.weight.bold,
        fontSize: SK.size.display,
        color: textColor,
        lineHeight: 1,
        textAlign: align,
      }}
    >
      {value}
    </span>
  </div>
);

export const StatComparison: React.FC<StatComparisonProps> = ({
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
  note,
  durationInFrames,
  palette = "default",
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);
  const scale = subtleScale(frame, 0, 18);
  const pal = resolveSKPalette(palette);

  // Total layout width: 380 + 48(gap) + 1(divider) + 48(gap) + 380 = 857px — within columnWidth
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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 32,
          maxWidth: SK.safe.columnWidth,
          width: "100%",
        }}
      >
        {/* Main row: left stat | divider | right stat */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 48,
            width: "100%",
            justifyContent: "center",
          }}
        >
          <StatSide
            label={leftLabel}
            value={leftValue}
            scale={scale}
            align="right"
            textColor={pal.text}
            mutedColor={pal.textMuted}
          />

          {/* Vertical red divider */}
          <div
            style={{
              width: 1,
              height: `${DIVIDER_HEIGHT_PERCENT}px`,
              backgroundColor: pal.accent,
              alignSelf: "stretch",
              minHeight: 80,
              maxHeight: 160,
            }}
          />

          <StatSide
            label={rightLabel}
            value={rightValue}
            scale={scale}
            align="left"
            textColor={pal.text}
            mutedColor={pal.textMuted}
          />
        </div>

        {/* Optional note below */}
        {note && (
          <span
            style={{
              fontFamily: SK.font.sans,
              fontWeight: SK.weight.regular,
              fontSize: SK.size.body - 4, // 24px
              color: pal.textMuted,
              textAlign: "center",
              maxWidth: SK.safe.columnWidthNarrow,
            }}
          >
            {note}
          </span>
        )}
      </div>
    </AbsoluteFill>
  );
};

export default StatComparison;

export const demo = {
  compositionId: "sk-stat-comparison",
  durationInFrames: 180,
  props: {
    leftLabel: "Indian air-defence missile",
    leftValue: "$2M+",
    rightLabel: "Pakistani kamikaze drone",
    rightValue: "~$20K",
    note: "100x cost differential — every intercept depletes the defender",
    durationInFrames: 180,
    bg: "navy" as const,
  },
};
