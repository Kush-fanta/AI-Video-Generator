/**
 * ProgressMulti — Row of circular progress rings, up to 4.
 * Each ring: SVG circle, SK.accent.red progress stroke via strokeDashoffset.
 * All rings animate simultaneously frames 12→40.
 */

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK } from "./_tokens";
import { fadeEnvelope } from "./_anim";

loadInter();

export interface ProgressMultiProps {
  title: string;
  items: Array<{ label: string; percent: number }>;
  durationInFrames: number;
}

const RING_D = 160;
const R = (RING_D - 12) / 2 - 6;
const STROKE_W = 12;
const CIRC = 2 * Math.PI * R;

export const ProgressMulti: React.FC<ProgressMultiProps> = ({ title, items, durationInFrames }) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);

  const animProgress = interpolate(frame, [12, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const sliced = items.slice(0, 4);

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
          marginBottom: 64,
          textAlign: "center",
        }}
      >
        {title}
      </div>

      {/* Rings row */}
      <div style={{ display: "flex", gap: 80, alignItems: "flex-start" }}>
        {sliced.map((item, i) => {
          const filled = (item.percent / 100) * CIRC * animProgress;
          const dashOffset = CIRC - filled;
          const cx = RING_D / 2;
          const cy = RING_D / 2;

          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 20,
              }}
            >
              <svg width={RING_D} height={RING_D}>
                {/* Background ring */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={R}
                  fill="none"
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth={STROKE_W}
                />
                {/* Progress ring — starts from top (rotate -90°) */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={R}
                  fill="none"
                  stroke={SK.accent.red}
                  strokeWidth={STROKE_W}
                  strokeLinecap="round"
                  strokeDasharray={CIRC}
                  strokeDashoffset={dashOffset}
                  transform={`rotate(-90 ${cx} ${cy})`}
                />
                {/* Center percent */}
                <text
                  x={cx}
                  y={cy + 6}
                  textAnchor="middle"
                  fontFamily={SK.font.sans}
                  fontWeight={SK.weight.black}
                  fontSize={48}
                  fill={SK.text.white}
                >
                  {Math.round(item.percent * animProgress)}%
                </text>
              </svg>
              {/* Label */}
              <span
                style={{
                  fontFamily: SK.font.sans,
                  fontWeight: SK.weight.medium,
                  fontSize: 20,
                  color: SK.text.mute,
                  textAlign: "center",
                }}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export default ProgressMulti;

export const demo = {
  compositionId: "sk-progress-multi",
  durationInFrames: 150,
  props: {
    title: "Indigenisation progress",
    items: [
      { label: "Army", percent: 78 },
      { label: "Navy", percent: 65 },
      { label: "Air", percent: 82 },
      { label: "Space", percent: 45 },
    ],
    durationInFrames: 150,
  },
};
