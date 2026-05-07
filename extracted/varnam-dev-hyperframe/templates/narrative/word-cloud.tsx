import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, C, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface WordCloudProps extends BaseProps {
  heroWord: string;
  terms: string[];
  at?: number;
}

// Deterministic pseudo-random from index
const seed = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

interface TermLayout {
  x: number;
  y: number;
  size: number;
  rotation: number;
  opacity: number;
}

const layoutTerm = (i: number): TermLayout => {
  const s = seed;
  return {
    x: 80 + s(i * 3) * 820,
    y: 200 + s(i * 3 + 1) * 1400,
    size: 24 + s(i * 3 + 2) * 32,
    rotation: (s(i * 7) - 0.5) * 16,
    opacity: 0.12 + s(i * 11) * 0.18,
  };
};

/**
 * Scattered terms around a hero word. Hero word left-aligned in terracotta
 * at 140px. Background terms at low opacity, various sizes, slight rotations.
 * Staggered appearance.
 */
export const WordCloud: React.FC<WordCloudProps> = ({
  heroWord,
  terms,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Background scattered terms */}
      {terms.map((term, i) => {
        const layout = layoutTerm(i);
        const termAt = at + 4 + i * 3;
        const opacity = interpolate(frame, [termAt, termAt + 14], [0, layout.opacity], C);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: layout.x,
              top: layout.y,
              fontFamily: sans,
              fontSize: layout.size,
              fontWeight: 500,
              color: P.muted,
              opacity,
              transform: `rotate(${layout.rotation}deg)`,
              userSelect: "none",
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
          >
            {term}
          </div>
        );
      })}

      {/* Hero word — left-aligned, terracotta, dominant */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 100,
          ...reveal(frame, at + 8),
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 140,
            fontWeight: 400,
            color: P.terracotta,
            lineHeight: 1,
            letterSpacing: "-0.03em",
          }}
        >
          {heroWord}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "narr-word-cloud",
  props: {
    heroWord: "Clarity",
    terms: [
      "signal",
      "taste",
      "timing",
      "draft",
      "shape",
      "focus",
      "proof"
    ]
  },
  durationInFrames: 180,
};
