import { AbsoluteFill, useCurrentFrame, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, overshootScale, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface DialGaugeProps extends BaseProps {
  value: number;
  maxValue: number;
  label: string;
  unit?: string;
  source?: string;
  at?: number;
}

/**
 * DialGauge — Large semicircular speedometer gauge.
 * Needle springs from 0 to target value. Tick marks around the arc.
 * Color transitions sage (low) → slate (mid) → terracotta (high).
 */
export const DialGauge: React.FC<DialGaugeProps> = ({
  value,
  maxValue,
  label,
  unit = "",
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  const needleProgress = spring({
    frame: f,
    fps: FPS,
    config: { damping: 12, stiffness: 60, mass: 1.4 },
  });

  const ratio = Math.min(value / maxValue, 1);
  const needleAngle = -90 + needleProgress * ratio * 180;
  const numScale = overshootScale(frame, at + 10);

  // Arc geometry
  const cx = 540;
  const cy = 960;
  const r = 360;
  const tickCount = 21;

  // Color based on ratio
  const gaugeColor = ratio < 0.33 ? P.sage : ratio < 0.66 ? P.slate : P.terracotta;

  // SVG arc path helper
  const arcPath = (startDeg: number, endDeg: number, radius: number) => {
    const s = (startDeg * Math.PI) / 180;
    const e = (endDeg * Math.PI) / 180;
    const x1 = cx + radius * Math.cos(s);
    const y1 = cy + radius * Math.sin(s);
    const x2 = cx + radius * Math.cos(e);
    const y2 = cy + radius * Math.sin(e);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`;
  };

  // Filled arc angle
  const fillEndDeg = -180 + needleProgress * ratio * 180;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        {/* Track arc */}
        <path
          d={arcPath(-180, 0, r)}
          fill="none"
          stroke={P.light}
          strokeWidth={32}
          strokeLinecap="round"
        />

        {/* Filled arc */}
        {needleProgress > 0.01 && (
          <path
            d={arcPath(-180, fillEndDeg, r)}
            fill="none"
            stroke={gaugeColor}
            strokeWidth={32}
            strokeLinecap="round"
          />
        )}

        {/* Tick marks */}
        {Array.from({ length: tickCount }).map((_, i) => {
          const angle = -180 + (i / (tickCount - 1)) * 180;
          const rad = (angle * Math.PI) / 180;
          const isMajor = i % 5 === 0;
          const innerR = r - (isMajor ? 52 : 36);
          const outerR = r - 20;
          return (
            <line
              key={i}
              x1={cx + innerR * Math.cos(rad)}
              y1={cy + innerR * Math.sin(rad)}
              x2={cx + outerR * Math.cos(rad)}
              y2={cy + outerR * Math.sin(rad)}
              stroke={P.muted}
              strokeWidth={isMajor ? 3 : 1.5}
              opacity={0.6}
            />
          );
        })}

        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={cx + (r - 60) * Math.cos((needleAngle * Math.PI) / 180)}
          y2={cy + (r - 60) * Math.sin((needleAngle * Math.PI) / 180)}
          stroke={P.text}
          strokeWidth={6}
          strokeLinecap="round"
        />

        {/* Needle center dot */}
        <circle cx={cx} cy={cy} r={14} fill={P.text} />
        <circle cx={cx} cy={cy} r={6} fill={P.bg} />
      </svg>

      {/* Value display */}
      <div
        style={{
          position: "absolute",
          top: cy - 100,
          left: 0,
          width: 1080,
          textAlign: "center",
          ...reveal(frame, at + 6),
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 160,
            color: P.text,
            lineHeight: 1,
            transform: `scale(${numScale})`,
            letterSpacing: "-0.03em",
          }}
        >
          {Math.round(needleProgress * value)}
          {unit && (
            <span style={{ fontSize: 64, color: P.sub, marginLeft: 8 }}>
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* Label */}
      <div
        style={{
          position: "absolute",
          top: cy + 60,
          left: 0,
          width: 1080,
          textAlign: "center",
          ...reveal(frame, at + 16),
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontSize: 44,
            color: P.sub,
            lineHeight: 1.3,
            maxWidth: 700,
            margin: "0 auto",
          }}
        >
          {label}
        </div>
      </div>

      {/* Min / Max labels */}
      <div
        style={{
          position: "absolute",
          top: cy + 10,
          left: cx - r - 20,
          ...reveal(frame, at + 12),
        }}
      >
        <div style={{ fontFamily: sans, fontSize: 28, color: P.muted, fontWeight: 600 }}>
          0
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: cy + 10,
          left: cx + r - 20,
          ...reveal(frame, at + 12),
        }}
      >
        <div style={{ fontFamily: sans, fontSize: 28, color: P.muted, fontWeight: 600 }}>
          {maxValue}
        </div>
      </div>

      {/* Source */}
      {source && (
        <div
          style={{
            position: "absolute",
            bottom: 480,
            left: 0,
            width: 1080,
            textAlign: "center",
            ...reveal(frame, at + 24),
          }}
        >
          <div
            style={{
              fontFamily: sans,
              fontSize: 22,
              fontWeight: 500,
              letterSpacing: "0.08em",
              color: P.muted,
              textTransform: "uppercase",
            }}
          >
            Source: {source}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "meter-dial-gauge",
  props: {
    value: 73,
    maxValue: 100,
    label: "GCC Maturity Index",
    unit: "%",
    source: "Zinnov 2024",
    at: 15,
  },
  durationInFrames: 180,
};
