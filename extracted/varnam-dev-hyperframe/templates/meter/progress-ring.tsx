import { AbsoluteFill, useCurrentFrame, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, overshootScale, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface ProgressRingProps extends BaseProps {
  percent: number;
  label: string;
  sublabel?: string;
  at?: number;
}

/**
 * ProgressRing — Large circular ring that fills clockwise with spring physics.
 * Giant percentage in the center with overshoot. Track = P.light, fill = terracotta.
 */
export const ProgressRing: React.FC<ProgressRingProps> = ({
  percent,
  label,
  sublabel,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  const fillProgress = spring({
    frame: f,
    fps: FPS,
    config: { damping: 14, stiffness: 50, mass: 1.4 },
  });

  const numScale = overshootScale(frame, at + 8);
  const clamped = Math.min(Math.max(percent, 0), 100);
  const displayPercent = Math.round(fillProgress * clamped);

  // Ring geometry
  const cx = 540;
  const cy = 860;
  const r = 320;
  const strokeW = 36;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - (fillProgress * clamped) / 100);

  // Tick marks every 10%
  const ticks = Array.from({ length: 11 }).map((_, i) => {
    const angle = -90 + (i / 10) * 360;
    const rad = (angle * Math.PI) / 180;
    const isMajor = i % 5 === 0;
    const innerR = r + strokeW / 2 + 8;
    const outerR = innerR + (isMajor ? 20 : 12);
    return {
      x1: cx + innerR * Math.cos(rad),
      y1: cy + innerR * Math.sin(rad),
      x2: cx + outerR * Math.cos(rad),
      y2: cy + outerR * Math.sin(rad),
      isMajor,
    };
  });

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        {/* Track ring */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={P.light}
          strokeWidth={strokeW}
        />

        {/* Fill ring */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={P.terracotta}
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${cx} ${cy})`}
        />

        {/* Tick marks */}
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={P.muted}
            strokeWidth={t.isMajor ? 3 : 1.5}
            opacity={0.5}
          />
        ))}
      </svg>

      {/* Percentage in center */}
      <div
        style={{
          position: "absolute",
          top: cy - 100,
          left: 0,
          width: 1080,
          textAlign: "center",
          ...reveal(frame, at + 4),
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 180,
            color: P.text,
            lineHeight: 1,
            letterSpacing: "-0.04em",
            transform: `scale(${numScale})`,
          }}
        >
          {displayPercent}
          <span style={{ fontSize: 80, color: P.sub }}>%</span>
        </div>
      </div>

      {/* Label below ring */}
      <div
        style={{
          position: "absolute",
          top: cy + r + strokeW / 2 + 60,
          left: 0,
          width: 1080,
          textAlign: "center",
          ...reveal(frame, at + 16),
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontSize: 48,
            color: P.sub,
            lineHeight: 1.3,
            fontWeight: 600,
            maxWidth: 700,
            margin: "0 auto",
          }}
        >
          {label}
        </div>
      </div>

      {/* Sublabel */}
      {sublabel && (
        <div
          style={{
            position: "absolute",
            top: cy + r + strokeW / 2 + 130,
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
              color: P.muted,
              lineHeight: 1.4,
              maxWidth: 640,
              margin: "0 auto",
            }}
          >
            {sublabel}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "meter-progress-ring",
  props: {
    percent: 73,
    label: "Engineers on core product",
    sublabel: "Not support roles",
    at: 15,
  },
  durationInFrames: 180,
};
