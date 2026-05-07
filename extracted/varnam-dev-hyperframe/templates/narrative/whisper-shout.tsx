import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, FPS, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface WhisperShoutProps extends BaseProps {
  text: string;
  /** Frame when the whisper explodes to shout (default: 35) */
  shoutAt?: number;
  at?: number;
}

/**
 * WhisperShout — Text starts very small (24px but readable) centered in frame,
 * then EXPLODES to fill the screen (spring scale to 300px+). The scale
 * transition is dramatic — spring with low damping for overshoot.
 * The whisper-to-shout IS the rhetoric.
 */
export const WhisperShout: React.FC<WhisperShoutProps> = ({
  text,
  shoutAt = 35,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const t = frame - at;

  // Phase detection
  const isWhisperPhase = t < shoutAt;
  const shoutT = t - shoutAt;

  // Whisper phase — small text fades in and breathes slightly
  const whisperOpacity = interpolate(t, [0, 12], [0, 1], C);
  const whisperBreath = isWhisperPhase
    ? 1 + Math.sin(t * 0.12) * 0.03 // subtle breathing
    : 1;

  // Shout phase — explosive spring with LOW damping for dramatic overshoot
  const shoutSpring = shoutT >= 0
    ? spring({
        frame: shoutT,
        fps: FPS,
        config: { damping: 6, mass: 1.4, stiffness: 80 },
      })
    : 0;

  // Font size interpolation: 24px whisper -> 140px shout
  const WHISPER_SIZE = 28;
  const SHOUT_SIZE = 140;
  const fontSize = isWhisperPhase
    ? WHISPER_SIZE
    : interpolate(shoutSpring, [0, 1], [WHISPER_SIZE, SHOUT_SIZE], C);

  // Color shift: muted in whisper -> terracotta in shout
  const colorProgress = interpolate(shoutT, [0, 8], [0, 1], C);

  // Background pulse on shout — brief terracotta flash
  const bgFlash = shoutT >= 0 && shoutT <= 10
    ? interpolate(shoutT, [0, 3, 10], [0, 0.08, 0], C)
    : 0;

  // Screen shake on shout impact
  const shakeX = shoutT >= 2 && shoutT < 8
    ? Math.sin(shoutT * 4) * interpolate(shoutT, [2, 8], [6, 0], C)
    : 0;
  const shakeY = shoutT >= 2 && shoutT < 8
    ? Math.cos(shoutT * 5) * interpolate(shoutT, [2, 8], [4, 0], C)
    : 0;

  // Font weight shifts from light to bold
  const fontWeight = isWhisperPhase ? 300 : 700;

  // Letter spacing tightens as text grows
  const letterSpacing = isWhisperPhase
    ? "0.15em"
    : `${interpolate(shoutSpring, [0, 1], [0.15, -0.03], C)}em`;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: P.bg,
      }}
    >
      {/* Terracotta flash overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: P.terracotta,
          opacity: bgFlash,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Radiating circles on shout — visual explosion */}
      {shoutT >= 0 && (
        <>
          {[0, 4, 8].map((delay, i) => {
            const ringT = shoutT - delay;
            if (ringT < 0) return null;
            const ringScale = interpolate(ringT, [0, 24], [0.1, 3.5], C);
            const ringOpacity = interpolate(ringT, [0, 4, 24], [0, 0.12, 0], C);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: 300,
                  height: 300,
                  borderRadius: "50%",
                  border: `2px solid ${P.terracotta}`,
                  transform: `translate(-50%, -50%) scale(${ringScale})`,
                  opacity: ringOpacity,
                  pointerEvents: "none",
                }}
              />
            );
          })}
        </>
      )}

      {/* Text container — centered with shake */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 80px",
          transform: `translate(${shakeX}px, ${shakeY}px)`,
        }}
      >
        <div
          style={{
            fontFamily: isWhisperPhase ? sans : serif,
            fontSize,
            fontWeight,
            color: isWhisperPhase
              ? P.muted
              : colorProgress < 0.5 ? P.text : P.terracotta,
            lineHeight: 1.1,
            letterSpacing,
            textAlign: "center",
            opacity: whisperOpacity,
            transform: isWhisperPhase ? `scale(${whisperBreath})` : undefined,
            textTransform: isWhisperPhase ? "lowercase" as const : "uppercase" as const,
            maxWidth: 950,
            transition: "font-family 0s",
          }}
        >
          {text}
        </div>
      </div>

      {/* Bottom accent — only visible in whisper phase */}
      <div
        style={{
          position: "absolute",
          bottom: 120,
          left: "50%",
          transform: "translateX(-50%)",
          width: `${lineGrow(frame, at + 8, 20)}%`,
          maxWidth: 60,
          height: 2,
          backgroundColor: P.muted,
          opacity: isWhisperPhase ? 0.4 : interpolate(shoutT, [0, 6], [0.4, 0], C),
          borderRadius: 1,
        }}
      />
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "narr-whisper-shout",
  props: {
    text: "$100 BILLION",
    shoutAt: 35,
    at: 15,
  },
  durationInFrames: 180,
};
