/**
 * BarChartV — Vertical bar chart, up to 8 bars, centered cluster.
 * Bars grow upward from baseline, labels below, values above.
 */

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK, type SKPaletteName, resolveSKPalette } from "./_tokens";
import { fadeEnvelope } from "./_anim";

loadInter();

export interface BarChartVProps {
  title: string;
  items: Array<{ label: string; value: number; highlight?: boolean }>;
  palette?: SKPaletteName;
  durationInFrames: number;
}

const BAR_MAX_H = 420, BAR_W = 80, GAP = 32;

export const BarChartV: React.FC<BarChartVProps> = ({
  title,
  items,
  palette,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);
  const sliced = items.slice(0, 8);
  const maxVal = Math.max(...sliced.map((i) => i.value));
  const svgW = sliced.length * (BAR_W + GAP) - GAP;
  const svgH = BAR_MAX_H + 80;
  const theme = resolveSKPalette(palette);

  return (
    <AbsoluteFill style={{ backgroundColor: theme.background, opacity, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: SK.font.sans, fontWeight: SK.weight.bold, fontSize: SK.size.sub, color: theme.text, marginBottom: 48, textAlign: "center" }}>{title}</div>
      <svg width={svgW} height={svgH} overflow="visible">
        {sliced.map((item, i) => {
          const p = interpolate(frame, [12 + i * 3, 32 + i * 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const barH = (item.value / maxVal) * BAR_MAX_H * p;
          const x = i * (BAR_W + GAP);
          return (
            <g key={i}>
              <rect x={x} y={BAR_MAX_H - barH} width={BAR_W} height={barH} fill={item.highlight ? theme.accent : theme.chartNeutral} rx={3} />
              <text x={x + BAR_W / 2} y={BAR_MAX_H - barH - 10} textAnchor="middle" fontFamily={SK.font.sans} fontWeight={SK.weight.bold} fontSize={28} fill={theme.text}>{item.value}</text>
              <text x={x + BAR_W / 2} y={BAR_MAX_H + 36} textAnchor="middle" fontFamily={SK.font.sans} fontWeight={SK.weight.medium} fontSize={SK.size.label} fill={theme.textMuted}>{item.label}</text>
            </g>
          );
        })}
        <line x1={0} y1={BAR_MAX_H} x2={svgW} y2={BAR_MAX_H} stroke={theme.chartAxis} strokeWidth={1} />
      </svg>
    </AbsoluteFill>
  );
};

export default BarChartV;

export const demo = {
  compositionId: "sk-bar-chart-v",
  durationInFrames: 150,
  props: {
    title: "Export growth",
    items: [
      { label: "2019", value: 12 },
      { label: "2020", value: 18 },
      { label: "2021", value: 28 },
      { label: "2022", value: 45 },
      { label: "2023", value: 72, highlight: true },
    ],
    palette: "slate",
    durationInFrames: 150,
  },
};
