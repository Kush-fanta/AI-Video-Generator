import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface ZoomPunchProps extends BaseProps {
  /** The thesis text — "Brain Centre", "Innovation Node" */
  text: string;
  /** Text color override (default: P.text) */
  color?: string;
  /** Optional subtitle below */
  subtitle?: string;
  /** Frame when zoom begins (default 0) */
  at?: number;
}

/**
 * ZoomPunch — element EXPLODES from zero to fill frame.
 * Scale 0→1.0 over 20-24 frames with spring overshoot pulse at landing.
 * Good for thesis moments. Accent line at bottom after landing.
 */
export const ZoomPunch: React.FC<ZoomPunchProps> = ({
  text,
  color,
  subtitle,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = frame - at;

  // Explosive spring: 0 → overshoot → 1.0
  // damping 12 = pronounced bounce, stiffness 110 = explosive snap, mass 0.8 = light fast
  // These values keep overshoot visible (~1.07) before settling — the EXPLOSION is the point
  const scale = progress >= 0
    ? spring({ frame: progress, fps, config: { damping: 12, stiffness: 110, mass: 0.8 }, from: 0, to: 1.0 })
    : 0;

  const textOpacity = interpolate(frame, [at, at + 2], [0, 1], C);

  // Accent line appears after landing (roughly at + 20 with faster spring)
  const lineAt = at + 20;
  const accentWidth = lineGrow(frame, lineAt, 20);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* The text — explosive arrival */}
        <div
          style={{
            opacity: textOpacity,
            transform: `scale(${scale})`,
            transformOrigin: "center center",
          }}
        >
          <div
            style={{
              fontFamily: serif,
              fontSize: 100,
              lineHeight: 1.05,
              color: color ?? P.text,
              textAlign: "center",
              letterSpacing: "-0.03em",
              maxWidth: 1400,
              padding: "0 80px",
            }}
          >
            {text}
          </div>
        </div>

        {/* Subtitle — arrives after explosion settles */}
        {subtitle && (
          <div
            style={{
              ...reveal(frame, at + 28),
              fontFamily: sans,
              fontSize: 26,
              color: P.sub,
              marginTop: 24,
              textAlign: "center",
              maxWidth: 700,
              fontWeight: 400,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>

      {/* Accent line at bottom — appears after landing */}
      <div
        style={{
          position: "absolute",
          bottom: 120,
          left: "50%",
          transform: "translateX(-50%)",
          width: `${accentWidth}%`,
          maxWidth: 500,
          height: 4,
          backgroundColor: P.terracotta,
          borderRadius: 2,
          opacity: interpolate(frame, [lineAt, lineAt + 6], [0, 0.85], C),
        }}
      />

      {/* Decorative side lines — structural framing */}
      <div
        style={{
          position: "absolute",
          left: 60,
          top: "35%",
          width: 1,
          height: `${lineGrow(frame, at + 18, 20)}%`,
          maxHeight: 180,
          backgroundColor: P.light,
          opacity: 0.3,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 60,
          top: "35%",
          width: 1,
          height: `${lineGrow(frame, at + 18, 20)}%`,
          maxHeight: 180,
          backgroundColor: P.light,
          opacity: 0.3,
        }}
      />
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "trans-zoom-punch",
  props: {
    text: "THE PIVOT",
    subtitle: "This is where the frame locks in."
  },
  durationInFrames: 180,
};
