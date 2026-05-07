import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface CircleHighlightProps extends BaseProps {
  /** Center x of the circled region */
  x: number;
  /** Center y of the circled region */
  y: number;
  /** Radius of the highlight circle */
  radius?: number;
  /** Optional label text */
  label?: string;
  /** Optional secondary label line */
  sublabel?: string;
  /** Frame offset */
  at?: number;
  /** Label position relative to circle */
  labelSide?: "top" | "bottom" | "left" | "right";
}

/**
 * CircleHighlight — SVG circle draws around a region using dasharray animation.
 * After the circle completes, a single pulse ring expands outward (80px range, 0.25 opacity).
 * Optional label on dark frosted panel connected by a 2px leader line.
 * Supports primary label + sublabel.
 */
export const CircleHighlight: React.FC<CircleHighlightProps> = ({
  x,
  y,
  radius = 80,
  label,
  sublabel,
  at = 0,
  labelSide = "right",
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  const circumference = 2 * Math.PI * radius;

  // Circle draw over 30 frames
  const drawProgress = interpolate(f, [0, 30], [0, 1], C);
  const dashOffset = circumference * (1 - drawProgress);

  // Single pulse ring — expands from radius to radius+80px, opacity 0.25 → 0
  const pulseActive = f > 32;
  const pulseFrame = Math.max(0, f - 32);
  const pulseRadius = radius + interpolate(pulseFrame, [0, 40], [0, 80], C);
  const pulseOpacity = 0.25 * interpolate(pulseFrame, [0, 10, 40], [0, 1, 0], C);

  // Label animation — springs in after circle drawn
  const labelSpring = spring({
    frame: Math.max(0, f - 32),
    fps: FPS,
    config: { damping: 14, stiffness: 80, mass: 0.8 },
  });
  const labelOpacity = interpolate(f, [32, 42], [0, 1], C);

  // Leader line endpoints
  const leaderGap = 12;
  const leaderLength = 60;
  let leaderStartX: number, leaderStartY: number;
  let leaderEndX: number, leaderEndY: number;
  let labelAnchorX: number, labelAnchorY: number;
  let labelTransform: string;

  switch (labelSide) {
    case "top":
      leaderStartX = x;
      leaderStartY = y - radius - leaderGap;
      leaderEndX = x;
      leaderEndY = y - radius - leaderGap - leaderLength;
      labelAnchorX = leaderEndX;
      labelAnchorY = leaderEndY - 12;
      labelTransform = "translate(-50%, -100%)";
      break;
    case "bottom":
      leaderStartX = x;
      leaderStartY = y + radius + leaderGap;
      leaderEndX = x;
      leaderEndY = y + radius + leaderGap + leaderLength;
      labelAnchorX = leaderEndX;
      labelAnchorY = leaderEndY + 12;
      labelTransform = "translate(-50%, 0%)";
      break;
    case "left":
      leaderStartX = x - radius - leaderGap;
      leaderStartY = y;
      leaderEndX = x - radius - leaderGap - leaderLength;
      leaderEndY = y;
      labelAnchorX = leaderEndX - 12;
      labelAnchorY = leaderEndY;
      labelTransform = "translate(-100%, -50%)";
      break;
    case "right":
    default:
      leaderStartX = x + radius + leaderGap;
      leaderStartY = y;
      leaderEndX = x + radius + leaderGap + leaderLength;
      leaderEndY = y;
      labelAnchorX = leaderEndX + 12;
      labelAnchorY = leaderEndY;
      labelTransform = "translate(0%, -50%)";
      break;
  }

  // Leader line draw progress
  const leaderProgress = interpolate(f, [30, 38], [0, 1], C);
  const leaderCurrX = leaderStartX + (leaderEndX - leaderStartX) * leaderProgress;
  const leaderCurrY = leaderStartY + (leaderEndY - leaderStartY) * leaderProgress;

  return (
    <AbsoluteFill>
      <svg
        width={1920}
        height={1080}
        viewBox="0 0 1920 1080"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {/* Main circle — draws in via dasharray */}
        <circle
          cx={x}
          cy={y}
          r={radius}
          fill="none"
          stroke={P.terracotta}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90, ${x}, ${y})`}
        />

        {/* Single pulse ring */}
        {pulseActive && (
          <circle
            cx={x}
            cy={y}
            r={pulseRadius}
            fill="none"
            stroke={P.terracotta}
            strokeWidth={1.5}
            opacity={pulseOpacity}
          />
        )}

        {/* Leader line — 2px, full opacity */}
        {label && leaderProgress > 0 && (
          <line
            x1={leaderStartX}
            y1={leaderStartY}
            x2={leaderCurrX}
            y2={leaderCurrY}
            stroke={P.terracotta}
            strokeWidth={2}
            strokeLinecap="round"
            opacity={1}
          />
        )}

        {/* Dot at leader-circle junction */}
        {label && leaderProgress > 0 && (
          <circle
            cx={leaderStartX}
            cy={leaderStartY}
            r={3}
            fill={P.terracotta}
            opacity={1}
          />
        )}
      </svg>

      {/* Label — dark frosted panel */}
      {label && (
        <div
          style={{
            position: "absolute",
            left: labelAnchorX,
            top: labelAnchorY,
            transform: `${labelTransform} scale(${0.85 + 0.15 * labelSpring})`,
            opacity: labelOpacity,
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(10,10,10,0.80)",
              borderRadius: 4,
              padding: "8px 14px",
              whiteSpace: "nowrap",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}
          >
            <div
              style={{
                fontFamily: sans,
                fontSize: 20,
                fontWeight: 600,
                color: P.bg,
                letterSpacing: "0.03em",
              }}
            >
              {label}
            </div>
            {sublabel && (
              <div
                style={{
                  fontFamily: sans,
                  fontSize: 20,
                  fontWeight: 400,
                  color: P.muted,
                  letterSpacing: "0.03em",
                  marginTop: 3,
                }}
              >
                {sublabel}
              </div>
            )}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "callout-circle-highlight",
  props: {
    x: 980,
    y: 500,
    radius: 92,
    label: "Primary metric",
    sublabel: "This is the number to repeat.",
    labelSide: "right"
  },
  durationInFrames: 180,
};
