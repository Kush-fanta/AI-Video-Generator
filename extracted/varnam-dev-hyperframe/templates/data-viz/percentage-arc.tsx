import { AbsoluteFill, useCurrentFrame, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, overshootScale, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface PercentageArcProps extends BaseProps {
  percent: number;
  label: string;
  supportingText?: string;
  color?: string;
  source?: string;
  at?: number;
}

/**
 * PercentageArc — Circular percentage visualization.
 * SVG arc that fills to percentage with spring animation.
 * Arc floats in generous negative space — left-of-centre when supportingText
 * is present, fully centred when solo.
 * Hero percentage in centre (120px). Label below arc with breathing room.
 */
export const PercentageArc: React.FC<PercentageArcProps> = ({
  percent,
  label,
  supportingText,
  color = P.terracotta,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  // Spring-driven arc progress
  const arcProgress = spring({
    frame: f,
    fps: FPS,
    config: { damping: 14, stiffness: 60, mass: 0.9 },
  });

  const currentPercent = arcProgress * percent;

  // Arc parameters — larger arc for more presence
  const size = 440;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - currentPercent / 100);

  // Overshoot on hero number
  const numScale = overshootScale(frame, at + 12);

  // Tick marks at 0/25/50/75%
  const tickData = [
    { angle: 0,   label: "0%"  },
    { angle: 90,  label: "25%" },
    { angle: 180, label: "50%" },
    { angle: 270, label: "75%" },
  ];

  // Canvas: 1920x1080 (landscape 16:9)
  const canvasW = 1920;
  const canvasH = 1080;

  // When supporting text present, arc shifts left and text goes right (two-column).
  // When solo, arc is centred on canvas.
  const arcCentreX = supportingText ? canvasW * 0.38 : canvasW / 2;
  const arcLeft = arcCentreX - size / 2;
  // Vertically centred on 1080-tall canvas with slight upward nudge
  const arcTop = (canvasH - size) / 2 - 40;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Arc visualization */}
      <div
        style={{
          position: "absolute",
          top: arcTop,
          left: arcLeft,
          width: size,
          height: size,
          ...reveal(frame, at + 4),
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: "rotate(-90deg)" }}
        >
          {/* Track */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={P.light}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Tick marks */}
          {tickData.map((td, i) => {
            const rad = (td.angle * Math.PI) / 180;
            const innerR = radius - strokeWidth / 2 - 2;
            const outerR = radius + strokeWidth / 2 + 2;
            return (
              <line
                key={i}
                x1={cx + innerR * Math.cos(rad)}
                y1={cy + innerR * Math.sin(rad)}
                x2={cx + outerR * Math.cos(rad)}
                y2={cy + outerR * Math.sin(rad)}
                stroke={P.bg}
                strokeWidth={3}
                strokeLinecap="round"
              />
            );
          })}

          {/* Filled arc */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>

        {/* Hero percentage — centred in arc */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: size,
            height: size,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            ...reveal(frame, at + 10),
          }}
        >
          <div
            style={{
              fontFamily: serif,
              fontSize: 120,
              color: P.text,
              lineHeight: 1.0,
              letterSpacing: "-0.03em",
              transform: `scale(${numScale})`,
              transformOrigin: "center center",
            }}
          >
            {percent}
          </div>
          <div
            style={{
              fontFamily: sans,
              fontSize: 40,
              color: P.muted,
              marginTop: 4,
              fontWeight: 500,
            }}
          >
            percent
          </div>
        </div>
      </div>

      {/* Label — below arc when solo, right-side column when supporting text */}
      <div
        style={{
          position: "absolute",
          ...(supportingText
            ? {
                top: arcTop,
                left: canvasW * 0.58,
                right: 80,
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                height: size,
              }
            : {
                top: arcTop + size + 48,
                left: 80,
                right: 80,
                textAlign: "center",
              }),
          ...reveal(frame, at + 20),
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontSize: 40,
            color: P.sub,
            lineHeight: 1.4,
            maxWidth: 580,
            ...(supportingText ? {} : { margin: "0 auto" }),
          }}
        >
          {label}
        </div>

        {/* Supporting text — below label in the right column */}
        {supportingText && (
          <div
            style={{
              fontFamily: sans,
              fontSize: 32,
              color: P.sub,
              lineHeight: 1.6,
              maxWidth: 580,
              marginTop: 24,
              ...reveal(frame, at + 26),
            }}
          >
            {supportingText}
          </div>
        )}
      </div>

      {/* Source */}
      {source && (
        <div
          style={{
            position: "absolute",
            bottom: 56,
            left: 80,
            ...reveal(frame, at + 32),
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
  compositionId: "dataviz-percentage-arc",
  props: {
    "percent": 78,
    "label": "Adoption",
    "supportingText": "North America",
    "source": "Sample data",
    "at": 15
  },
  durationInFrames: 180,
};
