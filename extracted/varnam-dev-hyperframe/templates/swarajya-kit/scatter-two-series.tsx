/**
 * ScatterTwoSeries — SVG scatter plot, two series. Points pop in via r animation.
 * Series A: SK.accent.red. Series B: rgba(255,255,255,0.6).
 */

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK } from "./_tokens";
import { fadeEnvelope } from "./_anim";

loadInter();

export interface ScatterTwoSeriesProps {
  title: string;
  seriesA: Array<{ x: number; y: number }>;
  seriesB: Array<{ x: number; y: number }>;
  labelA: string;
  labelB: string;
  durationInFrames: number;
}

const SVG_W = 1200;
const SVG_H = 520;
const PAD_L = 72;
const PAD_R = 48;
const PAD_T = 48;
const PAD_B = 64;
const AXIS_COLOR = "rgba(255,255,255,0.2)";
const TICK_COLOR = "rgba(255,255,255,0.5)";
const MAX_R = 8;

export const ScatterTwoSeries: React.FC<ScatterTwoSeriesProps> = ({
  title,
  seriesA,
  seriesB,
  labelA,
  labelB,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);

  const allX = [...seriesA, ...seriesB].map((p) => p.x);
  const allY = [...seriesA, ...seriesB].map((p) => p.y);
  const minX = Math.min(...allX);
  const maxX = Math.max(...allX);
  const minY = Math.min(...allY);
  const maxY = Math.max(...allY);

  const chartW = SVG_W - PAD_L - PAD_R;
  const chartH = SVG_H - PAD_T - PAD_B;

  const toSvgX = (x: number) => PAD_L + ((x - minX) / (maxX - minX || 1)) * chartW;
  const toSvgY = (y: number) => PAD_T + chartH - ((y - minY) / (maxY - minY || 1)) * chartH;

  const renderPoints = (
    series: Array<{ x: number; y: number }>,
    color: string,
    startIndex: number
  ) =>
    series.map((pt, i) => {
      const r = interpolate(frame, [12 + (startIndex + i) * 3, 12 + (startIndex + i) * 3 + 10], [0, MAX_R], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      return (
        <circle
          key={i}
          cx={toSvgX(pt.x)}
          cy={toSvgY(pt.y)}
          r={r}
          fill={color}
        />
      );
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
          marginBottom: 40,
          alignSelf: "flex-start",
        }}
      >
        {title}
      </div>

      <svg width={SVG_W} height={SVG_H} style={{ overflow: "visible" }}>
        {/* Axes */}
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + chartH} stroke={AXIS_COLOR} strokeWidth={1} />
        <line x1={PAD_L} y1={PAD_T + chartH} x2={PAD_L + chartW} y2={PAD_T + chartH} stroke={AXIS_COLOR} strokeWidth={1} />

        {/* X-axis ticks */}
        {[minX, (minX + maxX) / 2, maxX].map((v, i) => (
          <text
            key={i}
            x={toSvgX(v)}
            y={PAD_T + chartH + 28}
            textAnchor="middle"
            fontFamily={SK.font.sans}
            fontSize={SK.size.micro}
            fontWeight={SK.weight.medium}
            fill={TICK_COLOR}
          >
            {v}
          </text>
        ))}

        {/* Y-axis ticks */}
        {[minY, (minY + maxY) / 2, maxY].map((v, i) => (
          <text
            key={i}
            x={PAD_L - 12}
            y={toSvgY(v) + 5}
            textAnchor="end"
            fontFamily={SK.font.sans}
            fontSize={SK.size.micro}
            fontWeight={SK.weight.medium}
            fill={TICK_COLOR}
          >
            {v}
          </text>
        ))}

        {/* Series B (behind A) */}
        {renderPoints(seriesB, "rgba(255,255,255,0.6)", seriesA.length)}

        {/* Series A */}
        {renderPoints(seriesA, SK.accent.red, 0)}

        {/* Legend top-right */}
        <g transform={`translate(${PAD_L + chartW - 200}, ${PAD_T})`}>
          <circle cx={8} cy={8} r={7} fill={SK.accent.red} />
          <text x={22} y={13} fontFamily={SK.font.sans} fontSize={SK.size.label} fontWeight={SK.weight.medium} fill={SK.text.white}>
            {labelA}
          </text>
          <circle cx={8} cy={34} r={7} fill="rgba(255,255,255,0.6)" />
          <text x={22} y={39} fontFamily={SK.font.sans} fontSize={SK.size.label} fontWeight={SK.weight.medium} fill={SK.text.white}>
            {labelB}
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

export default ScatterTwoSeries;

export const demo = {
  compositionId: "sk-scatter-two-series",
  durationInFrames: 150,
  props: {
    title: "GDP vs Defence spend",
    seriesA: [{ x: 2.1, y: 4.2 }, { x: 3.5, y: 6.8 }, { x: 5.0, y: 9.1 }, { x: 6.8, y: 12.4 }],
    seriesB: [{ x: 1.8, y: 8.5 }, { x: 2.9, y: 11.2 }, { x: 4.1, y: 14.8 }, { x: 5.5, y: 18.3 }],
    labelA: "India",
    labelB: "Peers avg",
    durationInFrames: 150,
  },
};
