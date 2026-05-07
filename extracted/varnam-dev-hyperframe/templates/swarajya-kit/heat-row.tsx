/**
 * HeatRow — Single horizontal row of cells, background color interpolated from
 * neutral to SK.accent.red based on value. Staggered cell fade-in.
 */

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK } from "./_tokens";
import { fadeEnvelope } from "./_anim";

loadInter();

export interface HeatRowProps {
  title: string;
  label: string;
  cells: Array<{ value: number; caption?: string }>;
  durationInFrames: number;
}

const CELL_W = 120;
const CELL_H = 80;
const LABEL_W = 180;

// Interpolate hex color component
const lerpColor = (t: number) => {
  // from rgba(255,255,255,0.1) → #D74545 at t=1
  const r = Math.round(interpolate(t, [0, 1], [255, 215]));
  const g = Math.round(interpolate(t, [0, 1], [255, 69]));
  const b = Math.round(interpolate(t, [0, 1], [255, 69]));
  const a = interpolate(t, [0, 1], [0.1, 1]);
  return `rgba(${r},${g},${b},${a})`;
};

export const HeatRow: React.FC<HeatRowProps> = ({ title, label, cells, durationInFrames }) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);

  const sliced = cells.slice(0, 12);
  const maxVal = Math.max(...sliced.map((c) => c.value));

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

      {/* Row */}
      <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
        {/* Row label */}
        <div
          style={{
            width: LABEL_W,
            fontFamily: SK.font.sans,
            fontWeight: SK.weight.medium,
            fontSize: 22,
            color: SK.text.mute,
            textAlign: "right",
            paddingRight: 24,
            flexShrink: 0,
          }}
        >
          {label}
        </div>

        {/* Cells */}
        {sliced.map((cell, i) => {
          const cellOpacity = interpolate(frame, [12 + i * 2, 12 + i * 2 + 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const t = cell.value / maxVal;
          const bg = lerpColor(t);
          const textColor = t > 0.5 ? SK.text.white : SK.text.mute;

          return (
            <div
              key={i}
              style={{
                width: CELL_W,
                height: CELL_H,
                backgroundColor: bg,
                opacity: cellOpacity,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                borderRight: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <span
                style={{
                  fontFamily: SK.font.sans,
                  fontWeight: SK.weight.bold,
                  fontSize: SK.size.body,
                  color: textColor,
                  lineHeight: 1,
                }}
              >
                {cell.value}
              </span>
              {cell.caption && (
                <span
                  style={{
                    fontFamily: SK.font.sans,
                    fontWeight: SK.weight.regular,
                    fontSize: SK.size.micro,
                    color: textColor,
                    marginTop: 4,
                    opacity: 0.8,
                  }}
                >
                  {cell.caption}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export default HeatRow;

export const demo = {
  compositionId: "sk-heat-row",
  durationInFrames: 150,
  props: {
    title: "Annual contract value (₹ cr)",
    label: "FY",
    cells: [
      { value: 12, caption: "18" },
      { value: 18, caption: "19" },
      { value: 28, caption: "20" },
      { value: 45, caption: "21" },
      { value: 67, caption: "22" },
      { value: 89, caption: "23" },
    ],
    durationInFrames: 150,
  },
};
