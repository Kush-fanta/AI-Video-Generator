import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface ScreenPinProps extends BaseProps {
  /** Target x coordinate */
  x: number;
  /** Target y coordinate */
  y: number;
  /** Label text */
  label: string;
  /** Optional secondary label */
  sublabel?: string;
  /** Frame offset */
  at?: number;
  /** Direction the label floats relative to the pin */
  labelDirection?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  /** Length of the connecting line */
  lineLength?: number;
  /** Theme: "dark" = dark frosted panel, "light" = warm frosted panel */
  theme?: "light" | "dark";
}

/**
 * ScreenPin — Pulsing dot at target coordinates with a connecting line to a
 * floating label. Pulse oscillator normalized to FPS for consistent animation.
 * Supports dark and light themes. Sublabel below primary label.
 */
export const ScreenPin: React.FC<ScreenPinProps> = ({
  x,
  y,
  label,
  sublabel,
  at = 0,
  labelDirection = "top-right",
  lineLength = 200,
  theme = "dark",
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  // Dot appears with scale spring
  const dotSpring = spring({
    frame: f,
    fps: FPS,
    config: { damping: 10, stiffness: 140, mass: 0.5 },
  });

  // FPS-normalized pulse oscillator — time-based, not frame-count-based
  const timeSeconds = f / FPS;
  const pulsePhase = (timeSeconds * Math.PI * 2) % 1;
  const pulse1Scale = 1 + 0.8 * pulsePhase;
  const pulse1Opacity = 0.4 * (1 - pulsePhase);
  const pulse2Phase = (pulsePhase + 0.5) % 1;
  const pulse2Scale = 1 + 0.8 * pulse2Phase;
  const pulse2Opacity = 0.4 * (1 - pulse2Phase);

  // Line draws from dot toward label
  const lineProgress = interpolate(f, [8, 22], [0, 1], C);

  // Direction offsets
  let dx: number, dy: number;
  switch (labelDirection) {
    case "top-left":
      dx = -1; dy = -1; break;
    case "bottom-right":
      dx = 1; dy = 1; break;
    case "bottom-left":
      dx = -1; dy = 1; break;
    case "top-right":
    default:
      dx = 1; dy = -1; break;
  }

  const diagLen = Math.sqrt(dx * dx + dy * dy);
  const ndx = dx / diagLen;
  const ndy = dy / diagLen;

  const lineEndX = x + ndx * lineLength;
  const lineEndY = y + ndy * lineLength;
  const lineCurrX = x + ndx * lineLength * lineProgress;
  const lineCurrY = y + ndy * lineLength * lineProgress;

  const labelX = lineEndX + ndx * 10;
  const labelY = lineEndY + ndy * 10;

  let labelTransform: string;
  switch (labelDirection) {
    case "top-left":
      labelTransform = "translate(-100%, -100%)"; break;
    case "bottom-right":
      labelTransform = "translate(0%, 0%)"; break;
    case "bottom-left":
      labelTransform = "translate(-100%, 0%)"; break;
    case "top-right":
    default:
      labelTransform = "translate(0%, -100%)"; break;
  }

  // Label spring
  const labelSpring = spring({
    frame: Math.max(0, f - 20),
    fps: FPS,
    config: { damping: 14, stiffness: 80, mass: 0.8 },
  });
  const labelOpacity = interpolate(f, [20, 30], [0, 1], C);

  const dotRadius = 6;

  // Theme-based styles
  const isDark = theme === "dark";
  const panelBg = isDark ? "rgba(10,10,10,0.85)" : "rgba(237,234,228,0.94)";
  const textColor = isDark ? P.bg : P.text;
  const subColor = isDark ? P.muted : P.sub;
  const borderStyle = isDark
    ? { borderLeft: `3px solid ${P.terracotta}` }
    : { borderLeft: `3px solid ${P.terracotta}` };

  return (
    <AbsoluteFill>
      <svg
        width={1920}
        height={1080}
        viewBox="0 0 1920 1080"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {/* Pulse rings */}
        {f > 2 && (
          <>
            <circle
              cx={x}
              cy={y}
              r={dotRadius * pulse1Scale}
              fill="none"
              stroke={P.terracotta}
              strokeWidth={1.5}
              opacity={pulse1Opacity}
            />
            <circle
              cx={x}
              cy={y}
              r={dotRadius * pulse2Scale}
              fill="none"
              stroke={P.terracotta}
              strokeWidth={1}
              opacity={pulse2Opacity}
            />
          </>
        )}

        {/* Core dot */}
        <circle
          cx={x}
          cy={y}
          r={dotRadius * dotSpring}
          fill={P.terracotta}
        />

        {/* Inner bright spot */}
        <circle
          cx={x}
          cy={y}
          r={2 * dotSpring}
          fill="#FFFFFF"
          opacity={0.6}
        />

        {/* Connecting line */}
        {lineProgress > 0 && (
          <line
            x1={x}
            y1={y}
            x2={lineCurrX}
            y2={lineCurrY}
            stroke={P.terracotta}
            strokeWidth={1.5}
            strokeLinecap="round"
            opacity={0.7}
          />
        )}

        {/* Small dot at line endpoint */}
        {lineProgress > 0.9 && (
          <circle
            cx={lineEndX}
            cy={lineEndY}
            r={2.5}
            fill={P.terracotta}
            opacity={lineProgress}
          />
        )}
      </svg>

      {/* Floating label */}
      <div
        style={{
          position: "absolute",
          left: labelX,
          top: labelY,
          transform: `${labelTransform} scale(${0.85 + 0.15 * labelSpring})`,
          opacity: labelOpacity,
          transformOrigin: "center center",
        }}
      >
        <div
          style={{
            fontFamily: sans,
            whiteSpace: "nowrap",
            padding: "8px 16px",
            backgroundColor: panelBg,
            borderRadius: 4,
            boxShadow: "0 2px 16px rgba(0,0,0,0.18)",
            ...borderStyle,
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: textColor,
              letterSpacing: "0.03em",
            }}
          >
            {label}
          </div>
          {sublabel && (
            <div
              style={{
                fontSize: 20,
                fontWeight: 400,
                color: subColor,
                letterSpacing: "0.03em",
                marginTop: 3,
              }}
            >
              {sublabel}
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "callout-screen-pin",
  props: {
    x: 760,
    y: 520,
    label: "Reference point",
    sublabel: "Anchor the eye here.",
    labelDirection: "top-right",
    lineLength: 210,
    theme: "dark"
  },
  durationInFrames: 180,
};
