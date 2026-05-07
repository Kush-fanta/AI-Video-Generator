import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, FPS, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface MassiveWordProps extends BaseProps {
  word: string;
  sublabel?: string;
  dark?: boolean;
  at?: number;
}

/**
 * MassiveWord — ONE word fills the entire screen at 400px+ serif.
 * Enters with a camera-shake effect: rapid x/y oscillation that dampens
 * via spring physics. The word IS the frame.
 * Optional tiny label below in sans. Dark bg variant.
 */
export const MassiveWord: React.FC<MassiveWordProps> = ({
  word,
  sublabel,
  dark = false,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const t = frame - at;

  const bg = dark ? P.dark : P.bg;
  const fg = dark ? P.bg : P.text;
  const accent = P.terracotta;
  const mutedColor = dark ? P.muted : P.sub;

  // Spring for overall entrance (opacity + scale)
  const enterSpring = spring({
    frame: t,
    fps: FPS,
    config: { damping: 12, mass: 1.4, stiffness: 120 },
  });

  // Camera shake — rapid oscillation that dampens
  // Use multiple sine waves at different frequencies for organic shake
  const shakeDampen = interpolate(t, [0, 6, 18], [1, 0.7, 0], C);
  const shakeIntensity = 18 * shakeDampen;

  const shakeX =
    Math.sin(t * 2.8) * shakeIntensity +
    Math.sin(t * 4.3) * shakeIntensity * 0.4;
  const shakeY =
    Math.cos(t * 3.1) * shakeIntensity * 0.8 +
    Math.cos(t * 5.7) * shakeIntensity * 0.3;

  // Scale: starts slightly oversized, settles via spring
  const scale = interpolate(enterSpring, [0, 1], [1.15, 1], C);

  // Word opacity
  const wordOpacity = interpolate(t, [0, 4], [0, 1], C);

  // Sublabel enters after the word settles
  const sublabelReveal = reveal(frame, at + 18, 14);

  // Decorative line — terracotta accent
  const lineWidth = lineGrow(frame, at + 12, 20);

  return (
    <AbsoluteFill style={{ backgroundColor: bg }}>
      {/* Main word — dead center */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transform: `translate(${shakeX}px, ${shakeY}px) scale(${scale})`,
          opacity: wordOpacity,
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: Math.max(400, 420),
            fontWeight: 400,
            color: fg,
            lineHeight: 0.9,
            letterSpacing: "-0.04em",
            textAlign: "center",
            padding: "0 60px",
            textTransform: "uppercase",
          }}
        >
          {word}
        </div>

        {/* Terracotta accent line below word */}
        <div
          style={{
            width: `${lineWidth}%`,
            maxWidth: 180,
            height: 4,
            backgroundColor: accent,
            borderRadius: 2,
            marginTop: 32,
          }}
        />

        {/* Sublabel */}
        {sublabel && (
          <div
            style={{
              ...sublabelReveal,
              fontFamily: sans,
              fontSize: 32,
              fontWeight: 500,
              color: mutedColor,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginTop: 28,
              textAlign: "center",
            }}
          >
            {sublabel}
          </div>
        )}
      </div>

      {/* Corner accent — top-left dot */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 80,
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: accent,
          opacity: interpolate(t, [6, 14], [0, 0.7], C),
        }}
      />

      {/* Bottom rule */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 80,
          width: `${lineGrow(frame, at + 10, 30)}%`,
          maxWidth: 200,
          height: 1,
          backgroundColor: dark ? P.sub : P.light,
          opacity: 0.4,
        }}
      />
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "ktext-massive-word",
  props: {
    word: "SHIFT",
    sublabel: "The GCC transformation",
    at: 15,
  },
  durationInFrames: 180,
};
