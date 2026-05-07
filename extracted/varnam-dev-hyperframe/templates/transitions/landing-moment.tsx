import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface LandingMomentProps extends BaseProps {
  /** The word/phrase that LANDS */
  word: string;
  /** Optional small supporting text above */
  supportingText?: string;
  /** Frame when landing begins (default 0) */
  at?: number;
}

/**
 * LandingMoment — single word/phrase arrival with impact.
 * Scale 0.5→1.0 with spring overshoot (1.06→1.0). Full-width terracotta accent line
 * explodes from center. Optional supporting text above in muted sans. The arrival.
 */
export const LandingMoment: React.FC<LandingMomentProps> = ({
  word,
  supportingText,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = frame - at;

  // Spring scale: 0.5 → overshoot → settle 1.0
  // damping 13 = visible overshoot (~1.05) with clean settle
  // stiffness 100 = snappy enough to feel like arrival, mass 0.9 = weight to the landing
  const scale = progress >= 0
    ? spring({ frame: progress, fps, config: { damping: 13, stiffness: 100, mass: 0.9 }, from: 0.5, to: 1.0 })
    : 0.5;

  const wordOpacity = interpolate(frame, [at, at + 4], [0, 1], C);

  // Accent line EXPLODES from center after landing — spring-driven, not ease
  const lineAt = at + 14;
  const lineProgress = frame - lineAt;
  const lineWidth = lineProgress >= 0
    ? spring({ frame: lineProgress, fps, config: { damping: 14, stiffness: 120, mass: 0.8 }, from: 0, to: 100 })
    : 0;

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
        {/* Supporting text — small, above */}
        {supportingText && (
          <div
            style={{
              ...reveal(frame, at + 8),
              fontFamily: sans,
              fontSize: 20,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: P.muted,
              marginBottom: 20,
              fontWeight: 500,
            }}
          >
            {supportingText}
          </div>
        )}

        {/* The word — impact landing */}
        <div
          style={{
            opacity: wordOpacity,
            transform: `scale(${scale})`,
            transformOrigin: "center center",
          }}
        >
          <div
            style={{
              fontFamily: serif,
              fontSize: 120,
              lineHeight: 1,
              color: P.text,
              textAlign: "center",
              letterSpacing: "-0.03em",
              maxWidth: 1400,
              padding: "0 60px",
            }}
          >
            {word}
          </div>
        </div>

        {/* Accent line — explodes from center */}
        <div
          style={{
            width: `${lineWidth}%`,
            maxWidth: 600,
            height: 4,
            backgroundColor: P.terracotta,
            marginTop: 32,
            borderRadius: 2,
            opacity: interpolate(frame, [lineAt, lineAt + 6], [0, 1], C),
          }}
        />
      </div>

      {/* Bottom decorative line — simple clamp interpolate, no ease needed */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: "50%",
          transform: "translateX(-50%)",
          width: `${interpolate(frame, [at + 24, at + 50], [0, 100], C)}%`,
          maxWidth: 200,
          height: 1,
          backgroundColor: P.light,
          opacity: 0.4,
        }}
      />
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "trans-landing-moment",
  props: {
    word: "ARRIVAL",
    supportingText: "This is the thesis landing."
  },
  durationInFrames: 180,
};
