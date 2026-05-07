import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { C, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: sans } = loadSans();

interface Sentence {
  text: string;
  /** Frame this sentence appears */
  at: number;
}

interface SentenceSubtitleProps extends BaseProps {
  sentences: Sentence[];
  /** Global frame offset */
  at?: number;
}

/**
 * SentenceSubtitle — Editorial subtitle overlay, bottom-third.
 * Sentences fade in one at a time. The active sentence is bright,
 * previous sentences dim and shift up slightly. Left-aligned,
 * sans-serif, with a thin terracotta left border on the active line.
 * Clean, readable — like a well-designed documentary subtitle.
 */
export const SentenceSubtitle: React.FC<SentenceSubtitleProps> = ({
  sentences,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const t = frame - at;

  // Find which sentence is currently active
  const activeIndex = sentences.reduce(
    (acc, s, i) => (t >= s.at ? i : acc),
    -1,
  );

  // We show active sentence + up to 2 previous (dimmed)
  const VISIBLE_COUNT = 3;
  const SENTENCE_SPACING = 80;
  const BASE_BOTTOM = 320; // bottom-third area
  const MARGIN = 100;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Subtle background gradient at bottom to anchor text */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 600,
          background: `linear-gradient(to bottom, transparent 0%, rgba(10,10,10,0.04) 100%)`,
          pointerEvents: "none",
        }}
      />

      {/* Sentence stack — bottom-third, left-aligned */}
      {sentences.map((sentence, i) => {
        if (i > activeIndex) return null; // future — hidden
        if (i < activeIndex - (VISIBLE_COUNT - 1)) return null; // too old — hidden

        const isActive = i === activeIndex;
        const age = activeIndex - i; // 0 = active, 1 = previous, etc.

        // Entry animation for each sentence
        const entryProg = interpolate(t, [sentence.at, sentence.at + 16], [0, 1], {
          ...C,
          easing: ease,
        });

        // Fade in
        const opacity = isActive
          ? entryProg
          : interpolate(age, [0, 1, 2], [1, 0.35, 0.15], C);

        // Slide up from below on entry
        const entryY = isActive
          ? interpolate(entryProg, [0, 1], [24, 0], C)
          : 0;

        // Previous sentences shift up as new ones arrive
        const shiftUp = age * SENTENCE_SPACING;

        // Active sentence has terracotta left accent
        const accentOpacity = isActive
          ? interpolate(entryProg, [0.3, 0.7], [0, 0.9], C)
          : 0;

        // Scale down slightly for older sentences
        const scale = interpolate(age, [0, 2], [1, 0.95], C);

        const bottomPos = BASE_BOTTOM + shiftUp;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: MARGIN,
              right: MARGIN,
              bottom: bottomPos,
              opacity,
              transform: `translateY(${entryY}px) scale(${scale})`,
              transformOrigin: "left bottom",
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              gap: 20,
            }}
          >
            {/* Terracotta left accent bar */}
            <div
              style={{
                width: 4,
                minHeight: 48,
                backgroundColor: P.terracotta,
                borderRadius: 2,
                opacity: accentOpacity,
                flexShrink: 0,
                marginTop: 6,
              }}
            />

            {/* Sentence text */}
            <div
              style={{
                fontFamily: sans,
                fontSize: 48,
                fontWeight: isActive ? 500 : 400,
                color: isActive ? P.text : P.sub,
                lineHeight: 1.35,
                letterSpacing: "-0.01em",
                maxWidth: 820,
              }}
            >
              {sentence.text}
            </div>
          </div>
        );
      })}

      {/* Bottom rule — thin editorial line */}
      <div
        style={{
          position: "absolute",
          left: MARGIN,
          right: MARGIN,
          bottom: 200,
          height: 1,
          backgroundColor: P.light,
          opacity: interpolate(t, [8, 24], [0, 0.4], C),
        }}
      />

      {/* Sentence counter bottom-right */}
      {activeIndex >= 0 && (
        <div
          style={{
            position: "absolute",
            right: MARGIN,
            bottom: 210,
            fontFamily: sans,
            fontSize: 22,
            fontWeight: 500,
            color: P.muted,
            letterSpacing: "0.1em",
            opacity: interpolate(t, [sentences[0].at, sentences[0].at + 20], [0, 0.5], C),
          }}
        >
          {activeIndex + 1} / {sentences.length}
        </div>
      )}
    </AbsoluteFill>
  );
};
