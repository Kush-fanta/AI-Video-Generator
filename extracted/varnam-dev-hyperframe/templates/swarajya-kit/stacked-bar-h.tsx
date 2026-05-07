/**
 * StackedBarH — Horizontal stacked bar with sequential segment animation.
 * Segments animate width from 0 sequentially. Legend below.
 */

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK } from "./_tokens";
import { fadeEnvelope } from "./_anim";

loadInter();

export interface StackedBarHProps {
  title: string;
  segments: Array<{ label: string; value: number; color?: string }>;
  durationInFrames: number;
}

const BAR_H = 80;
const BAR_MAX_W = 1400;
const SEGMENT_COLORS = [
  SK.accent.red,
  SK.accent.gold,
  "rgba(255,255,255,0.4)",
  "rgba(255,255,255,0.2)",
];

const progress = (frame: number, start: number, n: number) =>
  Math.min(1, Math.max(0, (frame - start) / n));

export const StackedBarH: React.FC<StackedBarHProps> = ({ title, segments, durationInFrames }) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);

  const sliced = segments.slice(0, 4);
  const total = sliced.reduce((s, seg) => s + seg.value, 0);

  // Compute each segment's animated width
  const segWidths = sliced.map((seg, i) => {
    const p = progress(frame, 12 + i * 8, 20);
    return (seg.value / total) * BAR_MAX_W * p;
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: SK.bg.navy,
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingLeft: SK.safe.sideMargin,
        paddingRight: SK.safe.sideMargin,
      }}
    >
      {/* Title */}
      <div
        style={{
          fontFamily: SK.font.sans,
          fontWeight: SK.weight.bold,
          fontSize: SK.size.sub,
          color: SK.text.white,
          marginBottom: 48,
          alignSelf: "flex-start",
        }}
      >
        {title}
      </div>

      {/* Stacked bar */}
      <div style={{ display: "flex", width: BAR_MAX_W, height: BAR_H, borderRadius: 6, overflow: "hidden" }}>
        {sliced.map((seg, i) => {
          const color = seg.color ?? SEGMENT_COLORS[i];
          return (
            <div
              key={i}
              style={{
                width: segWidths[i],
                height: BAR_H,
                backgroundColor: color,
                flexShrink: 0,
              }}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: 40,
          marginTop: 36,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {sliced.map((seg, i) => {
          const color = seg.color ?? SEGMENT_COLORS[i];
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 14, height: 14, borderRadius: "50%", backgroundColor: color, flexShrink: 0 }} />
              <span style={{ fontFamily: SK.font.sans, fontWeight: SK.weight.medium, fontSize: SK.size.label, color: SK.text.mute }}>
                {seg.label}
              </span>
              <span style={{ fontFamily: SK.font.sans, fontWeight: SK.weight.bold, fontSize: SK.size.label, color: SK.text.white }}>
                {seg.value}%
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export default StackedBarH;

export const demo = {
  compositionId: "sk-stacked-bar-h",
  durationInFrames: 150,
  props: {
    title: "Budget split",
    segments: [
      { label: "Army", value: 55 },
      { label: "Navy", value: 25 },
      { label: "Air", value: 20 },
    ],
    durationInFrames: 150,
  },
};
