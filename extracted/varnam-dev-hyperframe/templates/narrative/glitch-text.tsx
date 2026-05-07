import { AbsoluteFill, useCurrentFrame, interpolate, random } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { P } from "../shared/palette";
import { lineGrow, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();

export interface GlitchTextProps extends BaseProps {
  /** Text to display */
  text: string;
  /** Frame to enter clean */
  at?: number;
  /** Frame when glitch starts (default: at + 30) */
  glitchAt?: number;
  /** Duration of glitch in frames (default 10) */
  glitchDuration?: number;
}

/**
 * Text enters clean, then glitches — random x/y offsets per character,
 * color channel split (red/cyan shadows), screen shake. After glitch frames,
 * text settles back to clean. Digital corruption aesthetic with hard snaps.
 */
export const GlitchText: React.FC<GlitchTextProps> = ({
  text,
  at = 0,
  glitchAt,
  glitchDuration = 10,
}) => {
  const frame = useCurrentFrame();
  const rel = frame - at;
  const effectiveGlitchAt = glitchAt ?? at + 30;
  const glitchRel = frame - effectiveGlitchAt;
  const isGlitching = glitchRel >= 0 && glitchRel < glitchDuration;

  // Fade in
  const opacity = interpolate(rel, [0, 8], [0, 1], C);

  // Screen shake during glitch
  const shakeX = isGlitching ? (random(`sx${frame}`) - 0.5) * 16 : 0;
  const shakeY = isGlitching ? (random(`sy${frame}`) - 0.5) * 10 : 0;

  const chars = text.split("");

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 120,
          width: `${lineGrow(frame, at, 20)}%`,
          maxWidth: 60,
          height: 3,
          backgroundColor: P.terracotta,
          borderRadius: 2,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 0, left: 0, width: "100%", height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 100px",
          opacity,
          transform: `translate(${shakeX}px, ${shakeY}px)`,
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 96,
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            display: "flex",
            flexWrap: "wrap" as const,
            justifyContent: "center",
          }}
        >
          {chars.map((char, i) => {
            // Per-character glitch offset
            const dx = isGlitching ? (random(`dx${i}${frame}`) - 0.5) * 24 : 0;
            const dy = isGlitching ? (random(`dy${i}${frame}`) - 0.5) * 18 : 0;

            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  position: "relative",
                  color: P.text,
                  transform: `translate(${dx}px, ${dy}px)`,
                }}
              >
                {/* Red channel shadow */}
                {isGlitching && (
                  <span
                    style={{
                      position: "absolute",
                      left: -3,
                      top: 1,
                      color: "rgba(200, 40, 40, 0.6)",
                      zIndex: -1,
                    }}
                  >
                    {char}
                  </span>
                )}
                {/* Cyan channel shadow */}
                {isGlitching && (
                  <span
                    style={{
                      position: "absolute",
                      left: 3,
                      top: -1,
                      color: "rgba(40, 200, 200, 0.5)",
                      zIndex: -1,
                    }}
                  >
                    {char}
                  </span>
                )}
                {char}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "narr-glitch-text",
  props: { text: "DISRUPTION", at: 15 },
  durationInFrames: 180,
};
