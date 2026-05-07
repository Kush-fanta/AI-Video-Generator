/**
 * CostBarCompare — Horizontal bar comparison, two rows.
 *
 * Ref frame: /tmp/swarajya-study/frames/Rc7Knnuai-Q/25s.png
 * Purpose: Visualise a cost or scale asymmetry with a top (expensive/red)
 *          row and a bottom (cheap/gold) row. Bars fill proportionally to
 *          the supplied ratio (0–1). Value label sits right-aligned at the
 *          bar's trailing edge. Optional note below.
 *
 * Props: {
 *   topLabel: string; topValue: string; topRatio: number;
 *   bottomLabel: string; bottomValue: string; bottomRatio: number;
 *   note?: string; durationInFrames: number; bg?: "navy" | "black"
 * }
 */

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadSpaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { SK } from "./_tokens";
import { fadeEnvelope } from "./_anim";

loadInter();
loadSpaceGrotesk();

export interface CostBarCompareProps {
  topLabel: string;
  topValue: string;
  topRatio: number;
  bottomLabel: string;
  bottomValue: string;
  bottomRatio: number;
  note?: string;
  durationInFrames: number;
  bg?: "navy" | "black";
}

const LABEL_WIDTH = 240;
const BAR_MAX_WIDTH = 480; // label(240) + gap(24) + bar(480) + gap(16) + value ~ 880
const BAR_HEIGHT = 32;

const BarRow: React.FC<{
  label: string;
  value: string;
  ratio: number;
  barColor: string;
  barWidth: number; // animated actual width px
}> = ({ label, value, ratio: _ratio, barColor, barWidth }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 24,
      width: "100%",
    }}
  >
    {/* Left label */}
    <span
      style={{
        fontFamily: SK.font.sans,
        fontWeight: SK.weight.medium,
        fontSize: SK.size.label,
        color: SK.text.mute,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        width: LABEL_WIDTH,
        flexShrink: 0,
        textAlign: "right",
      }}
    >
      {label}
    </span>

    {/* Bar + value */}
    <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}>
      <div
        style={{
          width: barWidth,
          height: BAR_HEIGHT,
          backgroundColor: barColor,
          flexShrink: 0,
          borderRadius: 2,
        }}
      />
      <span
        style={{
          fontFamily: SK.font.display,
          fontWeight: SK.weight.bold,
          fontSize: 48,
          color: SK.text.white,
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </span>
    </div>
  </div>
);

export const CostBarCompare: React.FC<CostBarCompareProps> = ({
  topLabel,
  topValue,
  topRatio,
  bottomLabel,
  bottomValue,
  bottomRatio,
  note,
  durationInFrames,
  bg = "navy",
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);

  // Bars grow in during the first 20 frames after fade-in completes
  const barProgress = interpolate(frame, [SK.motion.fadeFrames, SK.motion.fadeFrames + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const topBarWidth = BAR_MAX_WIDTH * topRatio * barProgress;
  const bottomBarWidth = BAR_MAX_WIDTH * bottomRatio * barProgress;

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
          gap: 32,
          maxWidth: SK.safe.columnWidth,
          width: "100%",
          paddingLeft: SK.safe.sideMargin,
          paddingRight: SK.safe.sideMargin,
          boxSizing: "border-box",
        }}
      >
        <BarRow
          label={topLabel}
          value={topValue}
          ratio={topRatio}
          barColor={SK.accent.red}
          barWidth={topBarWidth}
        />
        <BarRow
          label={bottomLabel}
          value={bottomValue}
          ratio={bottomRatio}
          barColor={SK.accent.gold}
          barWidth={bottomBarWidth}
        />

        {note && (
          <span
            style={{
              fontFamily: SK.font.sans,
              fontWeight: SK.weight.medium,
              fontSize: 22,
              color: SK.text.mute,
              textAlign: "center",
              maxWidth: SK.safe.columnWidthNarrow,
              alignSelf: "center",
              lineHeight: 1.4,
            }}
          >
            {note}
          </span>
        )}
      </div>
    </AbsoluteFill>
  );
};

export default CostBarCompare;

export const demo = {
  compositionId: "sk-cost-bar-compare",
  durationInFrames: 180,
  props: {
    topLabel: "Indian Air Defence Missile",
    topValue: "$2M+",
    topRatio: 1,
    bottomLabel: "Pakistani Kamikaze Drone",
    bottomValue: "~$20K",
    bottomRatio: 0.01,
    note: "100x cost differential — every intercept depletes the defender",
    durationInFrames: 180,
    bg: "navy" as const,
  },
};
