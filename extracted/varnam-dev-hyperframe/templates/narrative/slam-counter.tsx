import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface SlamCounterProps extends BaseProps {
  /** Final number to display */
  value: number;
  /** Label below the number */
  label?: string;
  /** Optional prefix (e.g. "$", "₹") */
  prefix?: string;
  /** Optional suffix (e.g. "%", "M", "Cr") */
  suffix?: string;
  /** Frame to start the count */
  at?: number;
  /** Duration of count-up in frames (default 24) */
  countDuration?: number;
}

/**
 * Numbers count up rapidly then SLAM to the final value with overshoot.
 * Each digit overshoots scale on landing. For dramatic stat reveals.
 * Hard snap aesthetic — no spring physics, pure interpolate with overshoot keyframes.
 */
export const SlamCounter: React.FC<SlamCounterProps> = ({
  value,
  label,
  prefix = "",
  suffix = "",
  at = 0,
  countDuration = 24,
}) => {
  const frame = useCurrentFrame();
  const rel = frame - at;

  // Count-up: rapid numbers cycling, lands on final value
  const progress = interpolate(rel, [0, countDuration], [0, 1], C);
  const displayValue = rel < 0 ? 0 : rel >= countDuration
    ? value
    : Math.round(value * progress + (Math.random() * value * 0.05 * (1 - progress)));

  // SLAM: overshoot scale 1.4 → 0.95 → 1.0 in 10 frames after count ends
  const slamStart = countDuration;
  const scale = rel < slamStart
    ? 1
    : interpolate(rel, [slamStart, slamStart + 3, slamStart + 7, slamStart + 10], [1.4, 0.96, 1.03, 1.0], C);

  // Shake on slam — 4 frames of x/y jitter
  const shakeX = rel >= slamStart && rel < slamStart + 4
    ? (rel % 2 === 0 ? -6 : 6) : 0;
  const shakeY = rel >= slamStart && rel < slamStart + 4
    ? (rel % 2 === 0 ? 4 : -4) : 0;

  const opacity = interpolate(rel, [0, 4], [0, 1], C);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Accent line top */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 120,
          width: `${lineGrow(frame, at, 20)}%`,
          maxWidth: 60,
          height: 3,
          backgroundColor: P.terracotta,
          borderRadius: 2,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 0, left: 0, width: "100%", height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity,
          transform: `scale(${scale}) translate(${shakeX}px, ${shakeY}px)`,
        }}
      >
        {/* Number */}
        <div
          style={{
            fontFamily: serif,
            fontSize: 220,
            fontWeight: 400,
            color: P.terracotta,
            lineHeight: 1,
            letterSpacing: "-0.04em",
          }}
        >
          {prefix}{rel < 0 ? 0 : displayValue.toLocaleString()}{suffix}
        </div>

        {/* Label */}
        {label && (
          <div
            style={{
              ...reveal(frame, at + countDuration + 8),
              fontFamily: sans,
              fontSize: 42,
              fontWeight: 700,
              color: P.sub,
              marginTop: 24,
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
            }}
          >
            {label}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "narr-slam-counter",
  props: { value: 1850, label: "GCCs in India", at: 15 },
  durationInFrames: 180,
};
