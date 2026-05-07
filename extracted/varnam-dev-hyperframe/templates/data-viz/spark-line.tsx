import { AbsoluteFill, useCurrentFrame, spring, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, overshootScale, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface SparkLineProps extends BaseProps {
  value: string;
  trend: number[];
  label: string;
  trendLabel?: string;
  source?: string;
  at?: number;
}

/**
 * SparkLine — Minimal inline chart with hero number.
 * Large hero number on the left, sparkline SVG on the right showing trend.
 * Line draws itself via strokeDashoffset. Endpoint has a terracotta dot.
 * Clean editorial feel — generous whitespace.
 */
export const SparkLine: React.FC<SparkLineProps> = ({
  value,
  trend,
  label,
  trendLabel,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  // Hero number overshoot
  const numScale = overshootScale(frame, at + 8);

  // Sparkline dimensions
  const SPARK_W = 480;
  const SPARK_H = 200;
  const PADDING = 20;

  // Normalize trend values to fit sparkline area
  const minVal = Math.min(...trend);
  const maxVal = Math.max(...trend);
  const range = maxVal - minVal || 1;

  const points = trend.map((v, i) => {
    const x = PADDING + (i / (trend.length - 1)) * (SPARK_W - PADDING * 2);
    const y = PADDING + (1 - (v - minVal) / range) * (SPARK_H - PADDING * 2);
    return { x, y };
  });

  // SVG path
  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");

  // Path length approximation for dash animation
  let pathLen = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    pathLen += Math.sqrt(dx * dx + dy * dy);
  }

  // Draw animation
  const drawProgress = interpolate(f, [8, 38], [pathLen, 0], C);

  // Endpoint dot — appears when line is fully drawn
  const lastPt = points[points.length - 1];
  const dotSp = spring({
    frame: Math.max(0, f - 36),
    fps: FPS,
    config: { damping: 10, stiffness: 140, mass: 0.6 },
  });

  // Layout positioning — vertically centered
  const BLOCK_TOP = 700;
  const LEFT_X = 80;
  const SPARK_LEFT = 520;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Hero number — left side */}
      <div
        style={{
          ...reveal(frame, at + 4),
          position: "absolute",
          top: BLOCK_TOP,
          left: LEFT_X,
          width: 400,
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 140,
            color: P.text,
            lineHeight: 1.0,
            letterSpacing: "-0.03em",
            transform: `scale(${numScale})`,
            transformOrigin: "left center",
          }}
        >
          {value}
        </div>
        <div
          style={{
            ...reveal(frame, at + 14),
            fontFamily: sans,
            fontSize: 40,
            color: P.sub,
            marginTop: 16,
            lineHeight: 1.3,
            maxWidth: 380,
          }}
        >
          {label}
        </div>
      </div>

      {/* Sparkline — right side */}
      <div
        style={{
          ...reveal(frame, at + 6),
          position: "absolute",
          top: BLOCK_TOP + 20,
          left: SPARK_LEFT,
          width: SPARK_W,
          height: SPARK_H,
        }}
      >
        <svg
          width={SPARK_W}
          height={SPARK_H}
          viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
        >
          {/* Baseline — muted horizontal line at bottom */}
          <line
            x1={PADDING}
            y1={SPARK_H - PADDING}
            x2={SPARK_W - PADDING}
            y2={SPARK_H - PADDING}
            stroke={P.light}
            strokeWidth={1.5}
            opacity={0.6}
          />

          {/* Spark line — draws itself */}
          <path
            d={pathD}
            fill="none"
            stroke={P.text}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={pathLen}
            strokeDashoffset={drawProgress}
          />

          {/* Endpoint dot — terracotta */}
          {lastPt && (
            <circle
              cx={lastPt.x}
              cy={lastPt.y}
              r={10 * dotSp}
              fill={P.terracotta}
              opacity={f > 36 ? 1 : 0}
            />
          )}

          {/* Start point dot — subtle */}
          {points.length > 0 && (
            <circle
              cx={points[0].x}
              cy={points[0].y}
              r={4}
              fill={P.muted}
              opacity={f > 8 ? 0.6 : 0}
            />
          )}
        </svg>

        {/* Trend label below sparkline */}
        {trendLabel && (
          <div
            style={{
              ...reveal(frame, at + 40),
              fontFamily: sans,
              fontSize: 24,
              color: P.muted,
              marginTop: 12,
              textAlign: "center",
            }}
          >
            {trendLabel}
          </div>
        )}
      </div>

      {/* Divider line between hero and sparkline */}
      <div
        style={{
          position: "absolute",
          top: BLOCK_TOP + 10,
          left: SPARK_LEFT - 30,
          width: 2,
          height: interpolate(f, [4, 20], [0, SPARK_H - 20], C),
          backgroundColor: P.light,
        }}
      />

      {/* Source */}
      {source && (
        <div
          style={{
            ...reveal(frame, at + 45),
            position: "absolute",
            bottom: 60,
            left: LEFT_X,
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
  compositionId: "dataviz-spark-line",
  props: {
    value: "$100B",
    trend: [20, 30, 45, 55, 70, 85, 100],
    label: "GCC Revenue",
    trendLabel: "2016-2024",
    source: "NASSCOM",
    at: 15,
  },
  durationInFrames: 180,
};
