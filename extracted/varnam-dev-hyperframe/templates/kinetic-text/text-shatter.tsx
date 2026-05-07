import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, overshootScale, C, FPS, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface TextShatterProps extends BaseProps {
  beforeWord: string;
  afterWord: string;
  shatterAt?: number;
  at?: number;
}

/**
 * TextShatter — A word appears solid, holds for a beat, then "shatters" —
 * each character flies outward in a random direction with spring physics.
 * Reveals a new word behind it. Dramatic replacement moment.
 */

// Deterministic pseudo-random based on index
const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const TextShatter: React.FC<TextShatterProps> = ({
  beforeWord,
  afterWord,
  shatterAt = 30,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const t = frame - at;

  const chars = beforeWord.split("");
  const isShattered = t >= shatterAt;
  const shatterT = Math.max(0, t - shatterAt);

  // Before word entrance
  const enterSpring = spring({
    frame: Math.max(0, t),
    fps: FPS,
    config: { damping: 14, mass: 1.2, stiffness: 120 },
  });

  // Before word scale
  const beforeScale = interpolate(enterSpring, [0, 1], [0.9, 1], C);
  const beforeOpacity = interpolate(enterSpring, [0, 0.3], [0, 1], C);

  // After word entrance — springs in with overshoot
  const afterSpring = spring({
    frame: Math.max(0, shatterT - 4),
    fps: FPS,
    config: { damping: 10, mass: 1.5, stiffness: 140 },
  });

  // After word scale with overshoot
  const afterScale = interpolate(
    afterSpring,
    [0, 0.5, 0.75, 1],
    [0.4, 1.12, 0.96, 1],
    C,
  );
  const afterOpacity = interpolate(afterSpring, [0, 0.2], [0, 1], C);

  // Pre-shatter vibration (warning shake)
  const preShakeWindow = shatterAt - t;
  const isPreShake = preShakeWindow > 0 && preShakeWindow < 8;
  const preShakeIntensity = isPreShake
    ? interpolate(preShakeWindow, [8, 0], [0, 4], C)
    : 0;
  const preShakeX = Math.sin(t * 6) * preShakeIntensity;
  const preShakeY = Math.cos(t * 7.3) * preShakeIntensity * 0.5;

  // Flash on shatter
  const flashOpacity =
    shatterT > 0 && shatterT < 6
      ? interpolate(shatterT, [0, 3, 6], [0, 0.2, 0], C)
      : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Flash overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: P.terracotta,
          opacity: flashOpacity,
          pointerEvents: "none",
        }}
      />

      {/* AFTER word — behind, revealed when before shatters */}
      {isShattered && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: afterOpacity,
            transform: `scale(${afterScale})`,
          }}
        >
          <span
            style={{
              fontFamily: serif,
              fontSize: 120,
              fontWeight: 400,
              color: P.terracotta,
              letterSpacing: "-0.02em",
              lineHeight: 1,
              textAlign: "center",
            }}
          >
            {afterWord}
          </span>

          {/* Accent line under after word */}
          <div
            style={{
              width: interpolate(afterSpring, [0, 1], [0, 120], C),
              height: 3,
              backgroundColor: P.terracotta,
              borderRadius: 2,
              marginTop: 20,
              opacity: 0.5,
            }}
          />
        </div>
      )}

      {/* BEFORE word — shatters into individual characters */}
      {!isShattered ? (
        // Solid before word
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: beforeOpacity,
            transform: `scale(${beforeScale}) translate(${preShakeX}px, ${preShakeY}px)`,
          }}
        >
          <span
            style={{
              fontFamily: serif,
              fontSize: 120,
              fontWeight: 400,
              color: P.text,
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            {beforeWord}
          </span>
        </div>
      ) : (
        // Shattered characters flying outward
        chars.map((char, i) => {
          // Each character gets a unique random direction
          const angle = seededRandom(i * 3 + 1) * Math.PI * 2;
          const distance = 400 + seededRandom(i * 3 + 2) * 600;
          const rotationEnd = (seededRandom(i * 3 + 3) - 0.5) * 720;

          // Spring for flying outward
          const flySpring = spring({
            frame: shatterT,
            fps: FPS,
            config: {
              damping: 20,
              mass: 0.8 + seededRandom(i + 10) * 0.6,
              stiffness: 80 + seededRandom(i + 20) * 60,
            },
          });

          const flyX = Math.cos(angle) * distance * flySpring;
          const flyY = Math.sin(angle) * distance * flySpring;
          const rotation = rotationEnd * flySpring;
          const charOpacity = interpolate(flySpring, [0, 0.6, 1], [1, 0.5, 0], C);

          // Starting position — approximate char position in the word
          const charWidth = 60; // approximate per-char width at 120px font
          const wordWidth = chars.length * charWidth;
          const startX = 540 - wordWidth / 2 + i * charWidth + charWidth / 2;
          const startY = 960;

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: startX + flyX,
                top: startY + flyY,
                transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                opacity: charOpacity,
                fontFamily: serif,
                fontSize: 120,
                fontWeight: 400,
                color: P.text,
                lineHeight: 1,
                pointerEvents: "none",
              }}
            >
              {char}
            </div>
          );
        })
      )}

      {/* Bottom decorative line */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 100,
          width: `${lineGrow(frame, at + 6, 30)}%`,
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
  compositionId: "ktext-text-shatter",
  props: {
    beforeWord: "OUTSOURCE",
    afterWord: "INNOVATE",
    shatterAt: 40,
    at: 15,
  },
  durationInFrames: 180,
};
