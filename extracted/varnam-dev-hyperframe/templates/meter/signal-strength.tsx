import { AbsoluteFill, useCurrentFrame, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, overshootScale, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

const LABELS = ["Very Weak", "Weak", "Moderate", "Strong", "Full"] as const;

export interface SignalStrengthProps extends BaseProps {
  strength: 1 | 2 | 3 | 4 | 5;
  label: string;
  description?: string;
  at?: number;
}

/**
 * SignalStrength — 5 ascending bars like phone signal.
 * Bars fill in sequence with spring. Active = terracotta, inactive = P.light.
 */
export const SignalStrength: React.FC<SignalStrengthProps> = ({
  strength,
  label,
  description,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  const barWidth = 100;
  const gap = 28;
  const maxBarHeight = 560;
  const minBarHeight = 140;
  const totalWidth = barWidth * 5 + gap * 4;
  const startX = (1080 - totalWidth) / 2;
  const baseY = 1060;

  // Per-bar spring (staggered)
  const barScale = (idx: number) => {
    const delay = idx * 5;
    return spring({
      frame: Math.max(0, f - delay),
      fps: FPS,
      config: { damping: 12, stiffness: 90, mass: 0.7 },
    });
  };

  const numScale = overshootScale(frame, at + 6);
  const signalLabel = LABELS[strength - 1];

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Signal level display */}
      <div
        style={{
          position: "absolute",
          top: 400,
          left: 0,
          width: 1080,
          textAlign: "center",
          ...reveal(frame, at + 2),
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 180,
            color: P.text,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            transform: `scale(${numScale})`,
          }}
        >
          {strength}/5
        </div>
      </div>

      {/* Bars */}
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        {Array.from({ length: 5 }).map((_, i) => {
          const isActive = i < strength;
          const heightFrac = (i + 1) / 5;
          const barH = minBarHeight + (maxBarHeight - minBarHeight) * heightFrac;
          const x = startX + i * (barWidth + gap);
          const scale = barScale(i);
          const scaledH = barH * scale;

          return (
            <rect
              key={i}
              x={x}
              y={baseY - scaledH}
              width={barWidth}
              height={scaledH}
              rx={14}
              fill={isActive ? P.terracotta : P.light}
            />
          );
        })}
      </svg>

      {/* Label */}
      <div
        style={{
          position: "absolute",
          top: baseY + 40,
          left: 0,
          width: 1080,
          textAlign: "center",
          ...reveal(frame, at + 14),
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 72,
            color: P.terracotta,
            lineHeight: 1.2,
          }}
        >
          {signalLabel}
        </div>
      </div>

      {/* Main label */}
      <div
        style={{
          position: "absolute",
          top: baseY + 140,
          left: 0,
          width: 1080,
          textAlign: "center",
          ...reveal(frame, at + 18),
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontSize: 44,
            color: P.sub,
            lineHeight: 1.3,
            maxWidth: 740,
            margin: "0 auto",
          }}
        >
          {label}
        </div>
      </div>

      {/* Description */}
      {description && (
        <div
          style={{
            position: "absolute",
            top: baseY + 220,
            left: 120,
            width: 840,
            textAlign: "center",
            ...reveal(frame, at + 24),
          }}
        >
          <div
            style={{
              fontFamily: sans,
              fontSize: 32,
              color: P.muted,
              lineHeight: 1.4,
            }}
          >
            {description}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "meter-signal-strength",
  props: {
    strength: 4,
    label: "India GCC Readiness",
    description: "Strong infrastructure, growing talent pipeline",
    at: 15,
  },
  durationInFrames: 180,
};
