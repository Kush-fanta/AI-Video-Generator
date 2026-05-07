import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, FPS, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface TextWaveProps extends BaseProps {
  text: string;
  amplitude?: number;
  speed?: number;
  at?: number;
}

/**
 * TextWave — Characters of a sentence undulate in a sine wave pattern.
 * Each character's Y position is offset by sin(frame + charIndex).
 * The wave moves continuously. Text is large serif.
 * Hypnotic, rhythmic feel.
 */
export const TextWave: React.FC<TextWaveProps> = ({
  text,
  amplitude = 40,
  speed = 0.12,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const t = frame - at;

  const chars = text.split("");

  // Characters enter with stagger
  const STAGGER = 2;
  const CHAR_WIDTH = 48; // approximate at 72px font
  const TOTAL_WIDTH = chars.length * CHAR_WIDTH;
  const START_X = Math.max(60, (1080 - TOTAL_WIDTH) / 2);
  const CENTER_Y = 920;

  // Wave entrance — amplitude ramps up
  const waveEntrance = interpolate(t, [0, 30], [0, 1], { ...C, easing: ease });

  // Spring for initial appearance
  const enterSpring = spring({
    frame: Math.max(0, t),
    fps: FPS,
    config: { damping: 14, mass: 1, stiffness: 100 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Faint horizontal baseline */}
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          top: CENTER_Y,
          height: 1,
          backgroundColor: P.light,
          opacity: interpolate(t, [5, 20], [0, 0.2], C),
        }}
      />

      {/* Wave characters */}
      {chars.map((char, i) => {
        const charAt = i * STAGGER;

        // Character entrance
        const charEntrance = interpolate(t, [charAt, charAt + 10], [0, 1], C);

        // Sine wave Y offset — continuous motion
        const waveOffset =
          Math.sin(t * speed + i * 0.5) * amplitude * waveEntrance;

        // Secondary harmonic for organic feel
        const wave2 =
          Math.sin(t * speed * 0.7 + i * 0.35 + 1.5) *
          amplitude *
          0.3 *
          waveEntrance;

        const totalY = waveOffset + wave2;

        // Scale variation follows the wave — peaks are slightly larger
        const scaleWave = 1 + Math.sin(t * speed + i * 0.5) * 0.06 * waveEntrance;

        // Color — subtle hue shift along the wave
        // Characters at wave peak get terracotta tint
        const wavePhase = Math.sin(t * speed + i * 0.5);
        const isAtPeak = wavePhase > 0.7;

        // X position
        const x = START_X + i * CHAR_WIDTH;

        // Rotation — slight tilt following wave direction
        const nextWave = Math.sin(t * speed + (i + 1) * 0.5);
        const slope = (nextWave - wavePhase) * 6; // degrees

        const isSpace = char === " ";

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: CENTER_Y + totalY,
              transform: `translate(-50%, -50%) scale(${scaleWave}) rotate(${slope}deg)`,
              opacity: isSpace ? 0 : charEntrance * enterSpring,
              fontFamily: serif,
              fontSize: 72,
              fontWeight: 400,
              color: isAtPeak ? P.terracotta : P.text,
              lineHeight: 1,
              pointerEvents: "none",
              transition: "none",
            }}
          >
            {char}
          </div>
        );
      })}

      {/* Ghost text — readable version below */}
      <div
        style={{
          position: "absolute",
          bottom: 260,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: sans,
          fontSize: 24,
          fontWeight: 500,
          color: P.muted,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          opacity: interpolate(t, [20, 35], [0, 0.4], C),
          padding: "0 100px",
        }}
      >
        {text}
      </div>

      {/* Terracotta accent dot — top left */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 80,
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: P.terracotta,
          opacity: interpolate(t, [4, 14], [0, 0.6], C),
        }}
      />

      {/* Bottom decorative line */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 100,
          width: `${lineGrow(frame, at + 8, 30)}%`,
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
  compositionId: "ktext-text-wave",
  props: {
    text: "CAPABILITY ARBITRAGE",
    at: 15,
  },
  durationInFrames: 180,
};
