import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, FPS, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface QuestionHeroProps extends BaseProps {
  question: string;
  attribution?: string;
  at?: number;
}

/**
 * QuestionHero — A giant "?" (serif 500px) in P.light as backdrop. The actual
 * question text (serif 64px+) centered on screen. The question mark slowly
 * drifts/rotates. Below the question: "—" in terracotta. Provocative,
 * makes the viewer pause.
 */
export const QuestionHero: React.FC<QuestionHeroProps> = ({
  question,
  attribution,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const t = frame - at;

  // Giant "?" backdrop — slow drift and rotation
  const qMarkOpacity = interpolate(t, [0, 20], [0, 0.12], C);
  const qMarkDriftY = interpolate(t, [0, 300], [0, -30], C);
  const qMarkRotation = interpolate(t, [0, 300], [-4, 8], C);
  const qMarkScale = interpolate(t, [0, 300], [1.0, 1.05], C);

  // Question text entrance — spring
  const textProgress = t >= 8
    ? spring({
        frame: t - 8,
        fps: FPS,
        config: { damping: 14, mass: 1.1, stiffness: 100 },
      })
    : 0;
  const textY = interpolate(textProgress, [0, 1], [24, 0], C);
  const textOpacity = interpolate(textProgress, [0, 0.3], [0, 1], C);

  // Em dash entrance
  const dashReveal = reveal(frame, at + 24, 14);

  // Attribution entrance
  const attrReveal = reveal(frame, at + 32, 14);

  // Accent line at top
  const accentW = lineGrow(frame, at + 4, 20);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Giant question mark backdrop */}
      <div
        style={{
          position: "absolute",
          top: "48%",
          left: "50%",
          transform: `translate(-50%, -50%) translateY(${qMarkDriftY}px) rotate(${qMarkRotation}deg) scale(${qMarkScale})`,
          fontFamily: serif,
          fontSize: 500,
          lineHeight: 0.8,
          color: P.light,
          opacity: qMarkOpacity,
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        ?
      </div>

      {/* Terracotta accent line — top-left */}
      <div
        style={{
          position: "absolute",
          top: 100,
          left: 100,
          width: `${accentW}%`,
          maxWidth: 80,
          height: 3,
          backgroundColor: P.terracotta,
          borderRadius: 2,
        }}
      />

      {/* Question text — centered */}
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
          padding: "0 100px",
          zIndex: 2,
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 68,
            lineHeight: 1.2,
            color: P.text,
            textAlign: "center",
            letterSpacing: "-0.02em",
            maxWidth: 860,
            opacity: textOpacity,
            transform: `translateY(${textY}px)`,
          }}
        >
          {question}
        </div>

        {/* Terracotta em dash */}
        <div
          style={{
            ...dashReveal,
            marginTop: 36,
          }}
        >
          <span
            style={{
              fontFamily: serif,
              fontSize: 48,
              color: P.terracotta,
              lineHeight: 1,
            }}
          >
            —
          </span>
        </div>

        {/* Attribution */}
        {attribution && (
          <div
            style={{
              ...attrReveal,
              fontFamily: sans,
              fontSize: 24,
              fontWeight: 500,
              color: P.muted,
              marginTop: 20,
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
            }}
          >
            {attribution}
          </div>
        )}
      </div>

      {/* Decorative dots — top right */}
      <div
        style={{
          position: "absolute",
          top: 100,
          right: 100,
          display: "flex",
          gap: 10,
          ...reveal(frame, at + 14),
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: P.light,
          }}
        />
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: P.terracotta,
            opacity: 0.6,
          }}
        />
      </div>

      {/* Bottom decorative line */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: "50%",
          transform: "translateX(-50%)",
          width: `${lineGrow(frame, at + 10, 28)}%`,
          maxWidth: 200,
          height: 1,
          backgroundColor: P.light,
          opacity: 0.35,
        }}
      />
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "hero-question-hero",
  props: {
    question: "What happens when the back office starts thinking?",
    attribution: "The GCC Question",
    at: 15,
  },
  durationInFrames: 180,
};
