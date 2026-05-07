import { AbsoluteFill, useCurrentFrame, interpolate, random } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface KineticQuoteProps extends BaseProps {
  /** The quote text — split on spaces, each word placed independently */
  text: string;
  /** Optional attribution */
  attribution?: string;
  /** Frame to start */
  at?: number;
}

const ACCENT_COLORS = [P.terracotta, P.text, P.sage, P.mauve, P.slate, P.text, P.terracotta];

/**
 * Quote words arranged at different sizes/positions/rotations across the frame.
 * Not a paragraph — an explosion of words. Each word has a seeded random position,
 * size (48-140px), and rotation (-12 to 12deg). Words slam in staggered, 3 frames apart.
 * Attribution appears last, small and centered at bottom.
 */
export const KineticQuote: React.FC<KineticQuoteProps> = ({
  text,
  attribution,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const words = text.split(/\s+/);
  const stagger = 3;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {words.map((word, i) => {
        const wordAt = at + i * stagger;
        const rel = frame - wordAt;

        // Seeded random layout per word
        const x = random(`x${i}`) * 70 + 10;   // 10-80% from left
        const y = random(`y${i}`) * 60 + 12;   // 12-72% from top
        const size = 48 + random(`s${i}`) * 92; // 48-140px
        const rot = (random(`r${i}`) - 0.5) * 24; // -12 to 12deg
        const color = ACCENT_COLORS[i % ACCENT_COLORS.length];

        // Slam in: scale 1.5 → 1.0 in 3 frames, hard
        const scale = interpolate(rel, [0, 3], [1.5, 1.0], C);
        const opacity = interpolate(rel, [0, 2], [0, 1], C);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              transform: `translate(-50%, -50%) scale(${scale}) rotate(${rot}deg)`,
              fontFamily: i % 3 === 0 ? serif : sans,
              fontSize: size,
              fontWeight: i % 3 === 0 ? 400 : 700,
              color,
              opacity,
              lineHeight: 1,
              letterSpacing: "-0.03em",
              whiteSpace: "nowrap" as const,
            }}
          >
            {word}
          </div>
        );
      })}

      {/* Attribution */}
      {attribution && (
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: 0,
            width: "100%",
            textAlign: "center" as const,
            fontFamily: sans,
            fontSize: 24,
            fontWeight: 700,
            color: P.muted,
            letterSpacing: "0.08em",
            textTransform: "uppercase" as const,
            opacity: interpolate(frame, [at + words.length * stagger + 10, at + words.length * stagger + 18], [0, 1], C),
          }}
        >
          — {attribution}
        </div>
      )}
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "narr-kinetic-quote",
  props: { text: "The back office became the brain centre.", attribution: "Economic Survey 2024-25", at: 15 },
  durationInFrames: 180,
};
