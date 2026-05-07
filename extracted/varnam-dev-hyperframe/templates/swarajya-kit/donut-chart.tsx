/**
 * DonutChart — SVG donut with animated segment draw, center label, right legend.
 * Up to 5 segments. Segments animate via strokeDashoffset staggered from frame 12.
 */

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK } from "./_tokens";
import { fadeEnvelope, fadeIn } from "./_anim";

loadInter();

export interface DonutChartProps {
  title: string;
  segments: Array<{ label: string; value: number }>;
  unit?: string;
  durationInFrames: number;
}

const OR = 200, IR = 120, SW = OR - IR, MR = IR + SW / 2, CIRC = 2 * Math.PI * MR;
const COLORS = [SK.accent.red, "rgba(255,255,255,0.45)", "rgba(255,255,255,0.30)", "rgba(255,255,255,0.15)", SK.accent.gold];

export const DonutChart: React.FC<DonutChartProps> = ({ title, segments, unit, durationInFrames }) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);
  const sliced = segments.slice(0, 5);
  const total = sliced.reduce((s, seg) => s + seg.value, 0);
  let cumAngle = -90;
  const arcs = sliced.map((seg, i) => {
    const frac = seg.value / total;
    const start = cumAngle;
    cumAngle += frac * 360;
    return { seg, frac, start, color: COLORS[i] };
  });
  const legendOp = fadeIn(frame, 44, 10);

  return (
    <AbsoluteFill style={{ backgroundColor: SK.bg.navy, opacity, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingLeft: SK.safe.sideMargin, paddingRight: SK.safe.sideMargin }}>
      <div style={{ fontFamily: SK.font.sans, fontWeight: SK.weight.bold, fontSize: SK.size.sub, color: SK.text.white, marginBottom: 48, textAlign: "center" }}>{title}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 80 }}>
        <svg width={OR * 2 + 20} height={OR * 2 + 20} viewBox={`${-OR - 10} ${-OR - 10} ${OR * 2 + 20} ${OR * 2 + 20}`}>
          {arcs.map((arc, i) => {
            const p = interpolate(frame, [12 + i * 5, 40 + i * 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const segLen = arc.frac * CIRC * p;
            return (
              <circle key={i} cx={0} cy={0} r={MR} fill="none" stroke={arc.color} strokeWidth={SW}
                strokeDasharray={`${segLen} ${CIRC - segLen}`} strokeDashoffset={CIRC - arc.frac * CIRC}
                transform={`rotate(${arc.start})`} strokeLinecap="butt" />
            );
          })}
          <text x={0} y={-10} textAnchor="middle" fontFamily={SK.font.sans} fontWeight={SK.weight.black} fontSize={SK.size.headline} fill={SK.text.white}>{arcs[0]?.seg.value}</text>
          {unit && <text x={0} y={28} textAnchor="middle" fontFamily={SK.font.sans} fontWeight={SK.weight.black} fontSize={SK.size.sub} fill={SK.text.white}>{unit}</text>}
        </svg>
        <div style={{ display: "flex", flexDirection: "column", gap: 24, opacity: legendOp }}>
          {arcs.map((arc, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", backgroundColor: arc.color, flexShrink: 0 }} />
              <span style={{ fontFamily: SK.font.sans, fontWeight: SK.weight.medium, fontSize: 24, color: SK.text.white }}>{arc.seg.label}</span>
              <span style={{ fontFamily: SK.font.sans, fontWeight: SK.weight.medium, fontSize: 24, color: SK.text.mute, marginLeft: 8 }}>{Math.round(arc.frac * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default DonutChart;

export const demo = {
  compositionId: "sk-donut-chart",
  durationInFrames: 150,
  props: {
    title: "Force composition",
    segments: [
      { label: "Army", value: 55 },
      { label: "Navy", value: 25 },
      { label: "Air", value: 20 },
    ],
    unit: "%",
    durationInFrames: 150,
  },
};
