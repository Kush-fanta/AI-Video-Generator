/**
 * Gauge — SVG semicircle gauge. Outer arc gray (full 180°), inner arc red grows
 * from 0 to percent via strokeDashoffset over frames 12→40.
 */

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK } from "./_tokens";
import { fadeEnvelope } from "./_anim";

loadInter();

export interface GaugeProps {
  percent: number;
  label: string;
  durationInFrames: number;
}

const CX = 300;
const CY = 300;
const R = 220;
const STROKE_W = 28;

// Semicircle arc: starts at 180° (left), sweeps to 0° (right), going through top.
// For SVG path: we draw the arc from left point to right point along the top.
const arcPath = (cx: number, cy: number, r: number, startDeg: number, endDeg: number) => {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const x1 = cx + r * Math.cos(toRad(startDeg));
  const y1 = cy + r * Math.sin(toRad(startDeg));
  const x2 = cx + r * Math.cos(toRad(endDeg));
  const y2 = cy + r * Math.sin(toRad(endDeg));
  const largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
  const sweep = endDeg > startDeg ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} ${sweep} ${x2} ${y2}`;
};

const HALF_CIRC = Math.PI * R; // half circumference

export const Gauge: React.FC<GaugeProps> = ({ percent, label, durationInFrames }) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);

  const animPct = interpolate(frame, [12, 40], [0, percent], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Visual arc caps at 100% of the half-circle; values above that mean "beyond the scale".
  const arcFillPct = Math.min(100, animPct);
  const filled = (arcFillPct / 100) * HALF_CIRC;
  const dashOffset = HALF_CIRC - filled;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: SK.bg.navy,
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width={600} height={420} viewBox="0 0 600 420">
        {/* Background arc: gray, full 180° from 180° to 0° (top half) */}
        <path
          d={arcPath(CX, CY, R, 180, 0)}
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={STROKE_W}
          strokeLinecap="round"
        />
        {/* Active arc: red, grows from 180° using dashoffset */}
        <path
          d={arcPath(CX, CY, R, 180, 0)}
          fill="none"
          stroke={SK.accent.red}
          strokeWidth={STROKE_W}
          strokeLinecap="round"
          strokeDasharray={HALF_CIRC}
          strokeDashoffset={dashOffset}
        />
        {/* Center: percent value — sits inside the arc, vertically centred on horizontal diameter */}
        <text
          x={CX}
          y={CY - 20}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily={SK.font.sans}
          fontWeight={SK.weight.black}
          fontSize={SK.size.display}
          fill={SK.text.white}
        >
          {Math.round(animPct)}%
        </text>
        {/* Label below arc, inside SVG bounds */}
        <text
          x={CX}
          y={CY + 80}
          textAnchor="middle"
          fontFamily={SK.font.sans}
          fontWeight={SK.weight.medium}
          fontSize={SK.size.body}
          fill={SK.text.mute}
        >
          {label}
        </text>
      </svg>
    </AbsoluteFill>
  );
};

export default Gauge;

export const demo = {
  compositionId: "sk-gauge",
  durationInFrames: 150,
  props: {
    percent: 73,
    label: "Indigenisation target achieved",
    durationInFrames: 150,
  },
};
