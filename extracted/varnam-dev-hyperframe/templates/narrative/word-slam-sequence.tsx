import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { mergePalette } from "../shared/palette";
import { C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();

export interface WordSlamSequenceProps extends BaseProps {
  /** The sentence — split on spaces */
  text: string;
  /** Frame to start */
  at?: number;
  /** Frames each word holds (default 4) */
  holdFrames?: number;
  /** Color for the last word (default terracotta) */
  lastColor?: string;
}

/**
 * Each word of a sentence appears one at a time, full-screen, 4-frame hold each.
 * Rapid fire Vox-style word-by-word. Each word enters with a hard scale slam
 * from 1.3 → 1.0 in 2 frames. No fade, no softness — pure kinetic punch.
 */
export const WordSlamSequence: React.FC<WordSlamSequenceProps> = ({
  text,
  at = 0,
  holdFrames = 4,
  lastColor,
  palette,
}) => {
  const frame = useCurrentFrame();
  const CP = mergePalette(palette);
  const rel = frame - at;
  const words = text.split(/\s+/);

  if (rel < 0) return <AbsoluteFill style={{ backgroundColor: CP.bg }} />;

  const wordIndex = Math.min(Math.floor(rel / holdFrames), words.length - 1);
  const wordRel = rel - wordIndex * holdFrames; // frames into current word

  const isLast = wordIndex === words.length - 1;

  // Hard scale slam: 1.3 → 1.0 in 2 frames
  const scale = interpolate(wordRel, [0, 2], [1.3, 1.0], C);

  // Slight rotation jitter per word
  const rotation = wordIndex % 2 === 0 ? -1.5 : 1.5;
  const rot = interpolate(wordRel, [0, 2], [rotation, 0], C);

  return (
    <AbsoluteFill style={{ backgroundColor: CP.bg }}>
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, width: "100%", height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${scale}) rotate(${rot}deg)`,
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 180,
            fontWeight: 400,
            color: isLast ? (lastColor ?? CP.terracotta) : CP.text,
            lineHeight: 1,
            letterSpacing: "-0.04em",
            textAlign: "center" as const,
            textTransform: "uppercase" as const,
          }}
        >
          {words[wordIndex]}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "narr-word-slam-sequence",
  props: { text: "Cost. Talent. Scale. Innovation.", at: 15 },
  durationInFrames: 180,
};
