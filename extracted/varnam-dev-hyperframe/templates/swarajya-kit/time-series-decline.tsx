/**
 * TimeSeriesDecline — Minimalist two-point line chart showing a decline.
 *
 * Purpose: Left dot (fromYear, fromValue) is higher; right dot (toYear, toValue)
 *          is lower. A red line connects them. The line draws left-to-right via
 *          SVG strokeDashoffset animation. Dots fade in after the line completes.
 *          Chart area: 720×200 centered. Title above, caption below.
 *
 * Props: {
 *   title: string; fromYear: string; fromValue: string;
 *   toYear: string; toValue: string;
 *   caption?: string; durationInFrames: number; bg?: "navy" | "black"
 * }
 */

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadSpaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { SK, resolveSKPalette, type SKPaletteName } from "./_tokens";
import { fadeEnvelope, fadeIn } from "./_anim";

loadInter();
loadSpaceGrotesk();

export interface TimeSeriesDeclineProps {
  title: string;
  fromYear: string;
  fromValue: string;
  toYear: string;
  toValue: string;
  caption?: string;
  durationInFrames: number;
  bg?: "navy" | "black";
  palette?: SKPaletteName;
}

const CHART_W = 720;
const CHART_H = 200;
const DOT_R = 8;
// Left dot is higher (y small = up), right is lower
const LEFT_X = 40;
const LEFT_Y = 30; // near top
const RIGHT_X = CHART_W - 40;
const RIGHT_Y = CHART_H - 30; // near bottom
const LINE_LENGTH = Math.hypot(RIGHT_X - LEFT_X, RIGHT_Y - LEFT_Y);

// Line draws over frames 12–30; dots appear frames 30–42
const LINE_START = 12;
const LINE_END = 32;
const DOT_START = 32;
const DOT_END = 44;

export const TimeSeriesDecline: React.FC<TimeSeriesDeclineProps> = ({
  title,
  fromYear,
  fromValue,
  toYear,
  toValue,
  caption,
  durationInFrames,
  bg = "navy",
  palette,
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);
  const pal = palette ? resolveSKPalette(palette) : null;
  const bgColor = pal ? pal.background : (bg === "black" ? SK.bg.black : SK.bg.navy);
  const textColor = pal ? pal.text : SK.text.white;
  const mutedColor = pal ? pal.textMuted : SK.text.mute;
  const accentColor = pal ? pal.accent : SK.accent.red;
  const dotFromColor = pal ? pal.text : SK.text.white;

  const lineProgress = interpolate(frame, [LINE_START, LINE_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dashOffset = LINE_LENGTH * (1 - lineProgress);
  const dotOpacity = fadeIn(frame, DOT_START, DOT_END - DOT_START);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bgColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 32,
        opacity,
      }}
    >
      {/* Title */}
      <span
        style={{
          fontFamily: SK.font.sans,
          fontWeight: SK.weight.bold,
          fontSize: 28,
          color: textColor,
          textAlign: "center",
          maxWidth: SK.safe.columnWidthNarrow,
          lineHeight: 1.3,
        }}
      >
        {title}
      </span>

      {/* Chart area */}
      <div style={{ position: "relative", width: CHART_W, height: CHART_H }}>
        <svg
          width={CHART_W}
          height={CHART_H}
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          {/* Decline line */}
          <line
            x1={LEFT_X}
            y1={LEFT_Y}
            x2={RIGHT_X}
            y2={RIGHT_Y}
            stroke={accentColor}
            strokeWidth={2}
            strokeDasharray={LINE_LENGTH}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
          />

          {/* Left dot */}
          <circle cx={LEFT_X} cy={LEFT_Y} r={DOT_R} fill={dotFromColor} opacity={dotOpacity} />

          {/* Right dot */}
          <circle cx={RIGHT_X} cy={RIGHT_Y} r={DOT_R} fill={accentColor} opacity={dotOpacity} />
        </svg>

        {/* From value label (above left dot) */}
        <span
          style={{
            position: "absolute",
            left: LEFT_X - 40,
            top: LEFT_Y - 48,
            fontFamily: SK.font.display,
            fontWeight: SK.weight.bold,
            fontSize: 32,
            color: textColor,
            opacity: dotOpacity,
            whiteSpace: "nowrap",
          }}
        >
          {fromValue}
        </span>

        {/* From year label (below left dot) */}
        <span
          style={{
            position: "absolute",
            left: LEFT_X - 24,
            top: LEFT_Y + DOT_R + 10,
            fontFamily: SK.font.sans,
            fontWeight: SK.weight.medium,
            fontSize: SK.size.label,
            color: mutedColor,
            opacity: dotOpacity,
            whiteSpace: "nowrap",
          }}
        >
          {fromYear}
        </span>

        {/* To value label (above right dot) */}
        <span
          style={{
            position: "absolute",
            left: RIGHT_X - 60,
            top: RIGHT_Y - 48,
            fontFamily: SK.font.display,
            fontWeight: SK.weight.bold,
            fontSize: 32,
            color: accentColor,
            opacity: dotOpacity,
            whiteSpace: "nowrap",
          }}
        >
          {toValue}
        </span>

        {/* To year label (below right dot) */}
        <span
          style={{
            position: "absolute",
            left: RIGHT_X - 24,
            top: RIGHT_Y + DOT_R + 10,
            fontFamily: SK.font.sans,
            fontWeight: SK.weight.medium,
            fontSize: SK.size.label,
            color: mutedColor,
            opacity: dotOpacity,
            whiteSpace: "nowrap",
          }}
        >
          {toYear}
        </span>
      </div>

      {/* Caption */}
      {caption && (
        <span
          style={{
            fontFamily: SK.font.sans,
            fontWeight: SK.weight.medium,
            fontSize: 22,
            color: mutedColor,
            textAlign: "center",
            maxWidth: SK.safe.columnWidthNarrow,
            lineHeight: 1.4,
          }}
        >
          {caption}
        </span>
      )}
    </AbsoluteFill>
  );
};

export default TimeSeriesDecline;

export const demo = {
  compositionId: "sk-time-series-decline",
  durationInFrames: 180,
  props: {
    title: "India's share of global manufacturing exports",
    fromYear: "2000",
    fromValue: "1.8%",
    toYear: "2023",
    toValue: "1.1%",
    caption: "While China's share grew from 4% to 14% in the same period",
    durationInFrames: 180,
    bg: "navy" as const,
  },
};
