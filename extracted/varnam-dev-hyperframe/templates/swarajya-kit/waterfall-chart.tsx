/**
 * WaterfallChart — Cascade chart. Bars float from previous total.
 * Positive: rgba(255,255,255,0.3). Negative: SK.accent.red. Total: SK.accent.gold.
 * Staggered height animation (frame 12 + i*6). Dashed connector lines.
 */

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK } from "./_tokens";
import { fadeEnvelope } from "./_anim";

loadInter();

export interface WaterfallChartProps {
  title: string;
  items: Array<{ label: string; value: number; isTotal?: boolean }>;
  durationInFrames: number;
}

const BAR_W = 120;
const BAR_GAP = 32;
const MAX_H = 380;
const BASELINE_Y = 420;
const PAD_L = 80;

export const WaterfallChart: React.FC<WaterfallChartProps> = ({ title, items, durationInFrames }) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);

  const sliced = items.slice(0, 6);

  // Compute running totals and bar geometry
  let running = 0;
  const bars = sliced.map((item, i) => {
    const isTotal = item.isTotal ?? false;
    const startY = isTotal ? 0 : running;
    const endY = isTotal ? item.value : running + item.value;
    const barBottom = Math.max(startY, endY);
    const barTop = Math.min(startY, endY);
    const barH = Math.abs(item.value);
    if (!isTotal) running += item.value;

    const color = isTotal
      ? SK.accent.gold
      : item.value < 0
      ? SK.accent.red
      : "rgba(255,255,255,0.3)";

    return { item, i, barTop, barH, barBottom, endY, color, isTotal };
  });

  // Scale: find max absolute value for height mapping
  const allValues = sliced.map((it) => Math.abs(it.value));
  const maxAbsVal = Math.max(...allValues, 1);

  const svgW = PAD_L + sliced.length * (BAR_W + BAR_GAP) + 40;
  const svgH = BASELINE_Y + 60;

  const toPixH = (v: number) => (v / maxAbsVal) * MAX_H;
  const toPixY = (runVal: number) => BASELINE_Y - toPixH(runVal);

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
          marginBottom: 40,
          alignSelf: "flex-start",
        }}
      >
        {title}
      </div>

      <svg width={svgW} height={svgH} style={{ overflow: "visible" }}>
        {/* Baseline */}
        <line
          x1={PAD_L - 20} y1={BASELINE_Y}
          x2={svgW - 20} y2={BASELINE_Y}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={1}
        />

        {bars.map((bar, idx) => {
          const animP = interpolate(
            frame,
            [12 + idx * 6, 12 + idx * 6 + 20],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          const x = PAD_L + idx * (BAR_W + BAR_GAP);
          const fullH = toPixH(bar.barH);
          const animH = fullH * animP;

          // For positive bars: grow upward from baseline or from running
          // barTop is the lower running value, barBottom is the higher
          const baselinePixY = toPixY(bar.barTop);
          const barY = baselinePixY - animH;

          // Connector line to next bar
          const nextBar = bars[idx + 1];
          const connectorY = bar.isTotal ? toPixY(0) : toPixY(bar.endY);

          return (
            <g key={idx}>
              {/* Bar */}
              <rect
                x={x}
                y={barY}
                width={BAR_W}
                height={animH}
                fill={bar.color}
                rx={3}
              />

              {/* Value label above bar */}
              <text
                x={x + BAR_W / 2}
                y={barY - 10}
                textAnchor="middle"
                fontFamily={SK.font.sans}
                fontWeight={SK.weight.bold}
                fontSize={SK.size.label}
                fill={SK.text.white}
              >
                {bar.item.value > 0 ? `+${bar.item.value}` : bar.item.value}
              </text>

              {/* Label below baseline */}
              <text
                x={x + BAR_W / 2}
                y={BASELINE_Y + 36}
                textAnchor="middle"
                fontFamily={SK.font.sans}
                fontWeight={SK.weight.medium}
                fontSize={SK.size.label}
                fill={SK.text.mute}
              >
                {bar.item.label}
              </text>

              {/* Dashed connector to next bar */}
              {nextBar && animP >= 1 && (
                <line
                  x1={x + BAR_W}
                  y1={connectorY}
                  x2={x + BAR_W + BAR_GAP}
                  y2={connectorY}
                  stroke={SK.text.mute}
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
              )}
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

export default WaterfallChart;

export const demo = {
  compositionId: "sk-waterfall-chart",
  durationInFrames: 150,
  props: {
    title: "Defence budget cascade (₹ bn)",
    items: [
      { label: "Start", value: 100 },
      { label: "+Export", value: 45 },
      { label: "-Import", value: -28 },
      { label: "+Services", value: 12 },
      { label: "Total", value: 129, isTotal: true },
    ],
    durationInFrames: 150,
  },
};
