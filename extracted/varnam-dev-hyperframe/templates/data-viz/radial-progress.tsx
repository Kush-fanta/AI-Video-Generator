import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, overshootScale, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface RadialProgressProps extends BaseProps {
  /** Percentage (0–100) */
  percent: number;
  label: string;
  /** Color for the arc — defaults to terracotta */
  arcColor?: string;
  source?: string;
  at?: number;
}

/**
 * RadialProgress — Circular arc fills with speed variation: slow start,
 * fast middle, decelerate. Number in center with overshoot scale.
 * The arc IS the story — bold, not decorative.
 */
export const RadialProgress: React.FC<RadialProgressProps> = ({
  percent,
  label,
  arcColor = P.terracotta,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  const SIZE = 480;
  const STROKE = 32;
  const RADIUS = (SIZE - STROKE) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  // Ease with slow-fast-slow (sine-based)
  const rawProgress = interpolate(f, [8, 50], [0, 1], C);
  // Apply ease-in-out for speed variation
  const eased = rawProgress < 0.5
    ? 2 * rawProgress * rawProgress
    : 1 - Math.pow(-2 * rawProgress + 2, 2) / 2;
  const arcProgress = eased * (percent / 100);
  const dashOffset = CIRCUMFERENCE * (1 - arcProgress);

  // Number overshoot
  const numScale = overshootScale(frame, at + 35);
  const displayNum = Math.round(arcProgress * 100);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          alignItems: "center",
          gap: 100,
        }}
      >
        {/* Arc */}
        <div style={{ position: "relative", width: SIZE, height: SIZE }}>
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
            {/* Track */}
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={P.light}
              strokeWidth={STROKE}
            />
            {/* Progress arc */}
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={arcColor}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            />
          </svg>
          {/* Center number */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: `translate(-50%, -50%) scale(${numScale})`,
              fontFamily: serif,
              fontSize: 140,
              color: P.text,
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            {displayNum}%
          </div>
        </div>

        {/* Right panel: label */}
        <div style={{ maxWidth: 500 }}>
          <div
            style={{
              ...reveal(frame, at + 40),
              fontFamily: sans,
              fontSize: 36,
              color: P.sub,
              lineHeight: 1.35,
            }}
          >
            {label}
          </div>

          {source && (
            <div
              style={{
                ...reveal(frame, at + 50),
                fontFamily: sans,
                fontSize: 20,
                fontWeight: 500,
                letterSpacing: "0.08em",
                color: P.muted,
                marginTop: 36,
                textTransform: "uppercase",
              }}
            >
              Source: {source}
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
export const demo = {
  compositionId: "dataviz-radial-progress",
  props: {
    "percent": 42,
    "label": "Completion",
    "source": "Sample data",
    "at": 15
  },
  durationInFrames: 180,
};
