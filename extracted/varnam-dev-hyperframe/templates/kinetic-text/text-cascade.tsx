import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { C, FPS, ease, lineGrow } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface TextCascadeProps extends BaseProps {
  words: string[];
  at?: number;
}

/**
 * TextCascade — Words fall from top in sequence, stacking vertically.
 * Each word enters from above with gravity-like easing (accelerates down,
 * bounces on landing). Words stack centered. 5-8 words max.
 * Creates a vertical poem feel.
 */
export const TextCascade: React.FC<TextCascadeProps> = ({
  words,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const t = frame - at;

  const STAGGER = 8; // frames between each word drop
  const DROP_DISTANCE = -600; // starts above viewport
  const WORD_HEIGHT = 120; // vertical spacing per word

  // Total stack height to center everything
  const totalHeight = words.length * WORD_HEIGHT;
  const startY = (1920 - totalHeight) / 2;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Terracotta vertical rule — center spine */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: startY - 40,
          width: 2,
          height: interpolate(
            t,
            [0, words.length * STAGGER + 20],
            [0, totalHeight + 80],
            { ...C, easing: ease },
          ),
          backgroundColor: P.terracotta,
          opacity: 0.15,
          transform: "translateX(-50%)",
        }}
      />

      {/* Words falling in sequence */}
      {words.map((word, i) => {
        const wordAt = i * STAGGER;

        // Spring for bounce landing
        const landSpring = spring({
          frame: Math.max(0, t - wordAt),
          fps: FPS,
          config: {
            damping: 10,
            mass: 1.2 + i * 0.1, // heavier words later = slower settle
            stiffness: 140,
          },
        });

        // Y position: falls from above, lands at its stack position
        const targetY = startY + i * WORD_HEIGHT;
        const y = interpolate(landSpring, [0, 1], [DROP_DISTANCE, targetY], C);

        // Opacity: snap on when word starts falling
        const opacity = interpolate(t, [wordAt, wordAt + 3], [0, 1], C);

        // Slight scale bounce on landing
        const scaleY = interpolate(
          landSpring,
          [0, 0.7, 0.85, 1],
          [0.8, 1.08, 0.97, 1],
          C,
        );

        // Color: most recent word is terracotta, older ones fade to text
        const isNewest = t >= wordAt && (i === words.length - 1 || t < (i + 1) * STAGGER);
        const age = Math.max(0, t - wordAt);
        const colorFade = interpolate(age, [0, 30], [0, 1], C);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              transform: `translateY(${y}px) scaleY(${scaleY})`,
              opacity,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontFamily: serif,
                fontSize: 80,
                fontWeight: 400,
                color: isNewest ? P.terracotta : colorFade < 1 ? P.terracotta : P.text,
                letterSpacing: "-0.02em",
                textAlign: "center",
                lineHeight: 1,
                transition: "none",
              }}
            >
              {word}
            </span>
          </div>
        );
      })}

      {/* Word count — bottom right */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          right: 100,
          fontFamily: sans,
          fontSize: 22,
          fontWeight: 500,
          color: P.muted,
          letterSpacing: "0.08em",
          opacity: interpolate(t, [10, 24], [0, 0.5], C),
        }}
      >
        {Math.min(
          words.length,
          words.reduce((acc, _, i) => (t >= i * STAGGER ? i + 1 : acc), 0),
        )}{" "}
        / {words.length}
      </div>

      {/* Bottom decorative line */}
      <div
        style={{
          position: "absolute",
          bottom: 70,
          left: 100,
          width: `${lineGrow(frame, at + 6, 30)}%`,
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
  compositionId: "ktext-text-cascade",
  props: {
    words: ["Cost", "Talent", "Scale", "Innovation", "Ownership"],
    at: 15,
  },
  durationInFrames: 180,
};
