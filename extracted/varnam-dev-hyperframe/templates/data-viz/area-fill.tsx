import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, overshootScale, C, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface AreaDataPoint {
  x: number;
  y: number;
  label?: string;
}

export interface AreaFillProps extends BaseProps {
  points: AreaDataPoint[];
  headline?: string;
  xAxis?: string;
  yAxis?: string;
  fillColor?: string;
  source?: string;
  at?: number;
}

/**
 * AreaFill — Filled area chart that draws left to right. Gradient fill.
 * Key value labels snap onto the line at peaks. Hard reveal, not a slow draw.
 */
export const AreaFill: React.FC<AreaFillProps> = ({
  points,
  headline,
  xAxis,
  yAxis,
  fillColor = P.terracotta,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  const PLOT_W = 1000;
  const PLOT_H = 500;
  const PLOT_X = 240;
  const PLOT_Y = 120;

  // Draw progress: left to right reveal
  const drawProgress = interpolate(f, [8, 45], [0, 1], { ...C, easing: ease });

  // Normalize points to plot area
  const maxY = Math.max(...points.map((p) => p.y));
  const maxX = Math.max(...points.map((p) => p.x));
  const norm = points.map((p) => ({
    px: (p.x / maxX) * PLOT_W,
    py: PLOT_H - (p.y / maxY) * PLOT_H * 0.85,
    ...p,
  }));

  // Build line and fill paths up to drawProgress
  const visibleCount = Math.ceil(drawProgress * norm.length);
  const visible = norm.slice(0, visibleCount);

  const linePath = visible.map((p, i) => `${i === 0 ? "M" : "L"} ${p.px} ${p.py}`).join(" ");
  const fillPath =
    visible.length > 1
      ? `${linePath} L ${visible[visible.length - 1].px} ${PLOT_H} L ${visible[0].px} ${PLOT_H} Z`
      : "";

  // Find peaks for labels
  const peaks = points.filter((p, i) => {
    if (!p.label) return false;
    const prev = points[i - 1]?.y ?? 0;
    const next = points[i + 1]?.y ?? 0;
    return p.y >= prev && p.y >= next;
  });

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Headline */}
      {headline && (
        <div
          style={{
            ...reveal(frame, at + 4),
            position: "absolute",
            top: 50,
            left: PLOT_X,
            fontFamily: sans,
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: "0.12em",
            color: P.muted,
            textTransform: "uppercase",
          }}
        >
          {headline}
        </div>
      )}

      {/* Y-axis */}
      {yAxis && (
        <div
          style={{
            ...reveal(frame, at + 6),
            position: "absolute",
            top: PLOT_Y + PLOT_H / 2,
            left: PLOT_X - 70,
            transform: "rotate(-90deg)",
            fontFamily: sans,
            fontSize: 18,
            color: P.muted,
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          {yAxis}
        </div>
      )}

      {/* X-axis */}
      {xAxis && (
        <div
          style={{
            ...reveal(frame, at + 6),
            position: "absolute",
            top: PLOT_Y + PLOT_H + 30,
            left: PLOT_X + PLOT_W / 2,
            transform: "translateX(-50%)",
            fontFamily: sans,
            fontSize: 18,
            color: P.muted,
            fontWeight: 500,
          }}
        >
          {xAxis}
        </div>
      )}

      {/* Plot */}
      <svg
        style={{ position: "absolute", top: PLOT_Y, left: PLOT_X }}
        width={PLOT_W}
        height={PLOT_H}
        viewBox={`0 0 ${PLOT_W} ${PLOT_H}`}
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fillColor} stopOpacity={0.4} />
            <stop offset="100%" stopColor={fillColor} stopOpacity={0.02} />
          </linearGradient>
        </defs>

        {/* Horizontal guides */}
        {[0.25, 0.5, 0.75].map((frac) => (
          <line
            key={frac}
            x1={0}
            y1={PLOT_H * frac}
            x2={PLOT_W}
            y2={PLOT_H * frac}
            stroke={P.light}
            strokeWidth={1}
            opacity={0.5}
          />
        ))}

        {/* Filled area */}
        {fillPath && <path d={fillPath} fill="url(#areaGrad)" />}

        {/* Line */}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke={fillColor}
            strokeWidth={3}
            strokeLinecap="round"
          />
        )}
      </svg>

      {/* Peak labels — snap in */}
      {peaks.map((peak, i) => {
        const px = PLOT_X + (peak.x / maxX) * PLOT_W;
        const py = PLOT_Y + PLOT_H - (peak.y / maxY) * PLOT_H * 0.85;
        const labelAt = at + 30 + i * 6;
        const scale = overshootScale(frame, labelAt);
        const peakVisible = (peak.x / maxX) <= drawProgress;

        if (!peakVisible) return null;

        return (
          <div
            key={i}
            style={{
              ...reveal(frame, labelAt),
              position: "absolute",
              left: px,
              top: py - 48,
              transform: `translateX(-50%) scale(${scale})`,
              fontFamily: serif,
              fontSize: 32,
              fontWeight: 400,
              color: P.text,
              whiteSpace: "nowrap",
            }}
          >
            {peak.label}
          </div>
        );
      })}

      {/* Source */}
      {source && (
        <div
          style={{
            ...reveal(frame, at + 55),
            position: "absolute",
            bottom: 50,
            left: PLOT_X,
            fontFamily: sans,
            fontSize: 20,
            fontWeight: 500,
            letterSpacing: "0.08em",
            color: P.muted,
            textTransform: "uppercase",
          }}
        >
          Source: {source}
        </div>
      )}
    </AbsoluteFill>
  );
};
export const demo = {
  compositionId: "dataviz-area-fill",
  props: {
    "points": [
      {
        "x": 0,
        "y": 18,
        "label": "Start"
      },
      {
        "x": 45,
        "y": 72,
        "label": "Peak"
      },
      {
        "x": 100,
        "y": 54,
        "label": "Close"
      }
    ],
    "headline": "Daily signups",
    "xAxis": "DAY",
    "yAxis": "USERS",
    "source": "Sample data",
    "at": 15
  },
  durationInFrames: 180,
};
