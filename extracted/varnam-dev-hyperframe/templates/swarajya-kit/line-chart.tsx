/**
 * LineChart — SVG line chart with animated stroke-dashoffset draw.
 * Red line draws left-to-right frames 12→40, dots appear at frame 40.
 */

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK, resolveSKPalette, type SKPaletteName } from "./_tokens";
import { fadeEnvelope, fadeIn } from "./_anim";

loadInter();

export interface LineChartProps {
  title: string;
  points: Array<{ label: string; value: number }>;
  unit?: string;
  durationInFrames: number;
  palette?: SKPaletteName;
  /**
   * preDrawn: when true, the curve appears at full completion from frame 0 (no draw animation).
   * Use for motif-return beats (B77) where the chart is referenced, not re-introduced.
   * Default: false — draw animation plays left→right over ~60 frames (2s at 30fps).
   */
  preDrawn?: boolean;
  /**
   * endpointLabelsOnly: when true, only the first and last points get visible dot+label.
   * Intermediate axis labels still show but without dots.
   * Default: false — all points get dots.
   */
  endpointLabelsOnly?: boolean;
}

const SW = 1200, SH = 500, PL = 80, PR = 60, PT = 60, PB = 70;

export const LineChart: React.FC<LineChartProps> = ({
  title,
  points,
  unit,
  durationInFrames,
  palette = "default",
  preDrawn = false,
  endpointLabelsOnly = false,
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);
  const pal = resolveSKPalette(palette);
  const maxVal = Math.max(...points.map((p) => p.value));
  const cW = SW - PL - PR;
  const cH = SH - PT - PB;
  const toX = (i: number) => PL + (i / (points.length - 1)) * cW;
  const toY = (v: number) => PT + cH - (v / maxVal) * cH;
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(p.value)}`).join(" ");
  const pathLen = points.reduce((acc, p, i) => {
    if (i === 0) return 0;
    const dx = toX(i) - toX(i - 1);
    const dy = toY(p.value) - toY(points[i - 1].value);
    return acc + Math.sqrt(dx * dx + dy * dy);
  }, 0);
  // Draw over 60 frames (2s at 30fps) starting at frame 12 (after fade-in). preDrawn skips this.
  const DRAW_START = 12;
  const DRAW_END = 72; // 60-frame draw window = 2s
  const drawP = preDrawn
    ? 1
    : interpolate(frame, [DRAW_START, DRAW_END], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // Dots appear after draw completes (or immediately for preDrawn)
  const dotOp = preDrawn ? 1 : fadeIn(frame, DRAW_END, 8);

  return (
    <AbsoluteFill style={{ backgroundColor: pal.background, opacity, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: SK.font.sans, fontWeight: SK.weight.bold, fontSize: SK.size.sub, color: pal.text, marginBottom: 24, textAlign: "center" }}>
        {title}{unit ? <span style={{ fontWeight: SK.weight.regular, fontSize: SK.size.body, color: pal.textMuted, marginLeft: 12 }}>({unit})</span> : null}
      </div>
      <svg width={SW} height={SH}>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <g key={t}>
            <line x1={PL} y1={PT + cH * (1 - t)} x2={PL + cW} y2={PT + cH * (1 - t)} stroke={pal.chartAxis} strokeWidth={1} />
            <text x={PL - 10} y={PT + cH * (1 - t) + 5} textAnchor="end" fontFamily={SK.font.sans} fontSize={SK.size.micro} fill={pal.textMuted}>{Math.round(t * maxVal)}</text>
          </g>
        ))}
        <path d={pathD} fill="none" stroke={pal.accent} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={pathLen} strokeDashoffset={pathLen * (1 - drawP)} />
        {points.map((p, i) => {
          // When endpointLabelsOnly is true, only the first and last points render a dot.
          const isEndpoint = i === 0 || i === points.length - 1;
          if (endpointLabelsOnly && !isEndpoint) return null;
          return (
            <circle key={i} cx={toX(i)} cy={toY(p.value)} r={7} fill={pal.accent} opacity={dotOp} />
          );
        })}
        {/* Value callouts at endpoints — landmark numbers beside the first and last dots */}
        {endpointLabelsOnly && points.length > 0 && (
          <>
            {/* First endpoint: label to the right of the dot, above the curve */}
            <text
              x={toX(0) + 22}
              y={toY(points[0].value) - 12}
              textAnchor="start"
              fontFamily={SK.font.sans}
              fontWeight={SK.weight.bold}
              fontSize={SK.size.sub}
              fill={pal.accent}
              opacity={dotOp}
            >
              {points[0].value}
            </text>
            {/* Last endpoint: label to the left of the dot */}
            <text
              x={toX(points.length - 1) - 22}
              y={toY(points[points.length - 1].value) - 12}
              textAnchor="end"
              fontFamily={SK.font.sans}
              fontWeight={SK.weight.bold}
              fontSize={SK.size.sub}
              fill={pal.accent}
              opacity={dotOp}
            >
              {points[points.length - 1].value}
            </text>
          </>
        )}
        {points.map((p, i) => (
          <text key={i} x={toX(i)} y={SH - 16} textAnchor="middle" fontFamily={SK.font.sans} fontWeight={SK.weight.medium} fontSize={SK.size.label} fill={pal.textMuted}>{p.label}</text>
        ))}
      </svg>
    </AbsoluteFill>
  );
};

export default LineChart;

export const demo = {
  compositionId: "sk-line-chart",
  durationInFrames: 150,
  props: {
    title: "Growth trajectory",
    points: [
      { label: "2019", value: 8 },
      { label: "2020", value: 12 },
      { label: "2021", value: 19 },
      { label: "2022", value: 31 },
      { label: "2023", value: 48 },
    ],
    unit: "$ bn",
    durationInFrames: 150,
  },
};
