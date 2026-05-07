/**
 * AreaChart — SVG area chart with animated stroke then fill.
 * Stroke draws via strokeDashoffset (frames 12→40), fill fades at frame 40.
 */

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK, type SKPaletteName, resolveSKPalette } from "./_tokens";
import { fadeEnvelope } from "./_anim";

loadInter();

export interface AreaChartProps {
  title: string;
  points: Array<{ label: string; value: number }>;
  palette?: SKPaletteName;
  durationInFrames: number;
}

const SVG_W = 1400;
const SVG_H = 480;
const PAD_L = 40;
const PAD_R = 40;
const PAD_T = 40;
const PAD_B = 60;

const progress = (frame: number, start: number, n: number) =>
  Math.min(1, Math.max(0, (frame - start) / n));

export const AreaChart: React.FC<AreaChartProps> = ({
  title,
  points,
  palette,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);
  const theme = resolveSKPalette(palette);

  const sliced = points.slice(0, 12);
  const maxVal = Math.max(...sliced.map((p) => p.value));
  const chartW = SVG_W - PAD_L - PAD_R;
  const chartH = SVG_H - PAD_T - PAD_B;

  const toX = (i: number) => PAD_L + (i / (sliced.length - 1)) * chartW;
  const toY = (v: number) => PAD_T + chartH - (v / maxVal) * chartH;

  const pathPoints = sliced.map((p, i) => `${toX(i)},${toY(p.value)}`).join(" L ");
  const strokePath = `M ${pathPoints}`;
  const fillPath = `M ${PAD_L},${PAD_T + chartH} L ${pathPoints} L ${toX(sliced.length - 1)},${PAD_T + chartH} Z`;

  // Approximate path length for strokeDashoffset animation
  const approxLen = chartW * 1.3;
  const strokeProg = progress(frame, 12, 28);
  const dashOffset = approxLen * (1 - strokeProg);

  const fillOpacity = interpolate(frame, [40, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.background,
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingLeft: SK.safe.sideMargin,
        paddingRight: SK.safe.sideMargin,
      }}
    >
      <div
        style={{
          fontFamily: SK.font.sans,
          fontWeight: SK.weight.bold,
          fontSize: SK.size.sub,
          color: theme.text,
          marginBottom: 40,
          alignSelf: "flex-start",
        }}
      >
        {title}
      </div>

      <svg width={SVG_W} height={SVG_H} style={{ overflow: "visible" }}>
        {/* Fill */}
        <path d={fillPath} fill={theme.chartFill} opacity={fillOpacity} />
        {/* Stroke */}
        <path
          d={strokePath}
          fill="none"
          stroke={theme.accent}
          strokeWidth={3}
          strokeDasharray={approxLen}
          strokeDashoffset={dashOffset}
        />
        {/* X-axis baseline */}
        <line
          x1={PAD_L} y1={PAD_T + chartH}
          x2={PAD_L + chartW} y2={PAD_T + chartH}
          stroke={theme.chartAxis}
          strokeWidth={1}
        />
        {/* X-axis labels */}
        {sliced.map((p, i) => (
          <text
            key={i}
            x={toX(i)}
            y={PAD_T + chartH + 36}
            textAnchor="middle"
            fontFamily={SK.font.sans}
            fontWeight={SK.weight.medium}
            fontSize={SK.size.label}
            fill={theme.textMuted}
          >
            {p.label}
          </text>
        ))}
      </svg>
    </AbsoluteFill>
  );
};

export default AreaChart;

export const demo = {
  compositionId: "sk-area-chart",
  durationInFrames: 150,
  props: {
    title: "Budget allocation (₹ cr)",
    points: [
      { label: "2018", value: 4 },
      { label: "2019", value: 8 },
      { label: "2020", value: 12 },
      { label: "2021", value: 20 },
      { label: "2022", value: 31 },
      { label: "2023", value: 48 },
    ],
    palette: "forest",
    durationInFrames: 150,
  },
};
