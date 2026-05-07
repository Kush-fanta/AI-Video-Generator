import { AbsoluteFill, useCurrentFrame, spring, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, overshootScale, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface ConfidenceIntervalProps extends BaseProps {
  low: number;
  high: number;
  estimate: number;
  rangeMin?: number;
  rangeMax?: number;
  label: string;
  at?: number;
}

/**
 * ConfidenceInterval — Horizontal bar showing a range.
 * Thin line for full range, thick colored section for confidence interval,
 * dot marks the point estimate. Spring animation on dot landing.
 */
export const ConfidenceInterval: React.FC<ConfidenceIntervalProps> = ({
  low,
  high,
  estimate,
  rangeMin,
  rangeMax,
  label,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  const rMin = rangeMin ?? Math.floor(low - (high - low) * 0.5);
  const rMax = rangeMax ?? Math.ceil(high + (high - low) * 0.5);
  const range = rMax - rMin;

  // Animations
  const lineProgress = spring({
    frame: f,
    fps: FPS,
    config: { damping: 20, stiffness: 80, mass: 0.8 },
  });

  const intervalProgress = spring({
    frame: Math.max(0, f - 8),
    fps: FPS,
    config: { damping: 16, stiffness: 70, mass: 1.0 },
  });

  const dotProgress = spring({
    frame: Math.max(0, f - 16),
    fps: FPS,
    config: { damping: 10, stiffness: 80, mass: 1.2 },
  });

  const numScale = overshootScale(frame, at + 14);

  // Layout
  const barLeft = 120;
  const barRight = 960;
  const barWidth = barRight - barLeft;
  const barY = 960;

  const toX = (val: number) => barLeft + ((val - rMin) / range) * barWidth;

  const lowX = toX(low);
  const highX = toX(high);
  const estX = toX(estimate);

  // Animated positions
  const animLowX = interpolate(intervalProgress, [0, 1], [toX((low + high) / 2), lowX], C);
  const animHighX = interpolate(intervalProgress, [0, 1], [toX((low + high) / 2), highX], C);
  const animEstX = interpolate(dotProgress, [0, 1], [toX((low + high) / 2), estX], C);

  // Tick marks
  const tickCount = 5;
  const tickStep = range / (tickCount - 1);
  const ticks = Array.from({ length: tickCount }).map((_, i) => rMin + i * tickStep);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Label */}
      <div
        style={{
          position: "absolute",
          top: 680,
          left: 0,
          width: 1080,
          textAlign: "center",
          ...reveal(frame, at + 2),
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 72,
            color: P.text,
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
            maxWidth: 800,
            margin: "0 auto",
          }}
        >
          {label}
        </div>
      </div>

      {/* Estimate value */}
      <div
        style={{
          position: "absolute",
          top: 790,
          left: 0,
          width: 1080,
          textAlign: "center",
          ...reveal(frame, at + 6),
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 140,
            color: P.terracotta,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            transform: `scale(${numScale})`,
          }}
        >
          {estimate}
        </div>
      </div>

      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        {/* Full range thin line */}
        <line
          x1={barLeft}
          y1={barY}
          x2={barLeft + barWidth * lineProgress}
          y2={barY}
          stroke={P.light}
          strokeWidth={4}
          strokeLinecap="round"
        />

        {/* Confidence interval thick bar */}
        <line
          x1={animLowX}
          y1={barY}
          x2={animHighX}
          y2={barY}
          stroke={P.terracotta}
          strokeWidth={20}
          strokeLinecap="round"
          opacity={intervalProgress}
        />

        {/* Low end cap */}
        <line
          x1={animLowX}
          y1={barY - 30}
          x2={animLowX}
          y2={barY + 30}
          stroke={P.terracotta}
          strokeWidth={4}
          opacity={intervalProgress}
        />

        {/* High end cap */}
        <line
          x1={animHighX}
          y1={barY - 30}
          x2={animHighX}
          y2={barY + 30}
          stroke={P.terracotta}
          strokeWidth={4}
          opacity={intervalProgress}
        />

        {/* Point estimate dot */}
        <circle
          cx={animEstX}
          cy={barY}
          r={16 * dotProgress}
          fill={P.text}
        />
        <circle
          cx={animEstX}
          cy={barY}
          r={7 * dotProgress}
          fill={P.bg}
        />

        {/* Scale ticks */}
        {ticks.map((tick, i) => {
          const x = toX(tick);
          return (
            <line
              key={i}
              x1={x}
              y1={barY + 24}
              x2={x}
              y2={barY + 40}
              stroke={P.muted}
              strokeWidth={2}
              opacity={lineProgress * 0.6}
            />
          );
        })}
      </svg>

      {/* Tick labels */}
      <div
        style={{
          position: "absolute",
          top: barY + 48,
          left: 0,
          width: 1080,
          ...reveal(frame, at + 6),
        }}
      >
        {ticks.map((tick, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: toX(tick),
              transform: "translateX(-50%)",
              fontFamily: sans,
              fontSize: 24,
              color: P.muted,
              fontWeight: 600,
            }}
          >
            {Math.round(tick)}
          </div>
        ))}
      </div>

      {/* Low / High labels */}
      <div
        style={{
          position: "absolute",
          top: barY - 60,
          left: animLowX - 40,
          ...reveal(frame, at + 12),
        }}
      >
        <div style={{ fontFamily: sans, fontSize: 28, color: P.sub, fontWeight: 600 }}>
          {low}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: barY - 60,
          left: animHighX - 20,
          ...reveal(frame, at + 12),
        }}
      >
        <div style={{ fontFamily: sans, fontSize: 28, color: P.sub, fontWeight: 600 }}>
          {high}
        </div>
      </div>

      {/* Range description */}
      <div
        style={{
          position: "absolute",
          top: barY + 120,
          left: 0,
          width: 1080,
          textAlign: "center",
          ...reveal(frame, at + 22),
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontSize: 32,
            color: P.sub,
            lineHeight: 1.4,
          }}
        >
          Confidence interval: {low} – {high}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "meter-confidence-interval",
  props: {
    low: 95,
    high: 125,
    estimate: 110,
    label: "GCC Revenue 2030 ($B)",
    at: 15,
  },
  durationInFrames: 180,
};
