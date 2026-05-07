import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { C, FPS, ease, lineGrow } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface TextSpiralProps extends BaseProps {
  text: string;
  at?: number;
}

/**
 * TextSpiral — Characters of a word are arranged in a spiral pattern,
 * each appearing with stagger. They spiral outward from center.
 * Uses sin/cos for positioning. Each character has its own spring-animated
 * opacity and position.
 */
export const TextSpiral: React.FC<TextSpiralProps> = ({
  text,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const t = frame - at;

  const chars = text.split("");
  const STAGGER = 4; // frames between each character
  const CENTER_X = 540; // 1080/2
  const CENTER_Y = 960; // 1920/2

  // Spiral parameters
  const BASE_RADIUS = 40;
  const RADIUS_STEP = 36; // how much radius grows per character
  const ANGLE_STEP = 0.85; // radians between characters (~49 degrees)

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Faint center dot */}
      <div
        style={{
          position: "absolute",
          left: CENTER_X - 4,
          top: CENTER_Y - 4,
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: P.terracotta,
          opacity: interpolate(t, [0, 10], [0, 0.3], C),
        }}
      />

      {/* Spiral characters */}
      {chars.map((char, i) => {
        const charAt = i * STAGGER;

        // Spring for this character's entrance
        const charSpring = spring({
          frame: Math.max(0, t - charAt),
          fps: FPS,
          config: {
            damping: 14,
            mass: 1.0,
            stiffness: 100,
          },
        });

        // Spiral position
        const angle = i * ANGLE_STEP;
        const radius = BASE_RADIUS + i * RADIUS_STEP;

        // Animate from center outward
        const currentRadius = interpolate(charSpring, [0, 1], [0, radius], C);
        const currentAngle = interpolate(
          charSpring,
          [0, 1],
          [angle - Math.PI, angle], // rotate in during entrance
          C,
        );

        const x = CENTER_X + Math.cos(currentAngle) * currentRadius;
        const y = CENTER_Y + Math.sin(currentAngle) * currentRadius;

        // Opacity
        const opacity = interpolate(charSpring, [0, 0.3], [0, 1], C);

        // Scale: pop in
        const scale = interpolate(charSpring, [0, 0.5, 1], [0.3, 1.1, 1], C);

        // Rotation — character rotates to face outward
        const rotation = (currentAngle * 180) / Math.PI + 90;

        // Color — first char terracotta, rest text, spaces invisible
        const isSpace = char === " ";
        const color = i === 0 ? P.terracotta : P.text;

        // Continuous subtle drift after placement
        const driftPhase = Math.max(0, t - charAt - 20);
        const driftX = Math.sin(driftPhase * 0.08 + i) * 2;
        const driftY = Math.cos(driftPhase * 0.06 + i * 1.3) * 2;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + driftX,
              top: y + driftY,
              transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
              opacity: isSpace ? 0 : opacity,
              fontFamily: serif,
              fontSize: 72,
              fontWeight: 400,
              color,
              lineHeight: 1,
              pointerEvents: "none",
            }}
          >
            {char}
          </div>
        );
      })}

      {/* Ghost text — full word in muted at bottom for readability */}
      <div
        style={{
          position: "absolute",
          bottom: 180,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: sans,
          fontSize: 28,
          fontWeight: 500,
          color: P.muted,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          opacity: interpolate(
            t,
            [chars.length * STAGGER, chars.length * STAGGER + 15],
            [0, 0.5],
            C,
          ),
        }}
      >
        {text}
      </div>

      {/* Decorative line bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 100,
          width: `${lineGrow(frame, at + 8, 30)}%`,
          maxWidth: 160,
          height: 1,
          backgroundColor: P.light,
          opacity: 0.35,
        }}
      />
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "ktext-text-spiral",
  props: {
    text: "TRANSFORM",
    at: 15,
  },
  durationInFrames: 180,
};
