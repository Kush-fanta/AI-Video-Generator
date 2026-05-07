import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { lineGrow, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface RedactionWord {
  text: string;
  redacted?: boolean;
  revealAt?: number;
}

export interface RedactionRevealProps extends BaseProps {
  /** Words with optional redaction bars */
  words: RedactionWord[];
  /** Frame to show the full sentence */
  at?: number;
  palette?: Partial<typeof P>;
}

/**
 * Text appears with black redaction bars over key words. Bars lift one by one
 * to reveal the real story. Each bar lifts with a hard snap (translateY up + scale).
 * Revealed words flash terracotta then settle to text color.
 */
export const RedactionReveal: React.FC<RedactionRevealProps> = ({
  words,
  at = 0,
  palette,
}) => {
  const pal = { ...P, ...palette };
  const frame = useCurrentFrame();
  const rel = frame - at;

  const textOpacity = interpolate(rel, [0, 10], [0, 1], C);

  return (
    <AbsoluteFill style={{ backgroundColor: pal.bg }}>
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 120,
          width: `${lineGrow(frame, at, 20)}%`,
          maxWidth: 60,
          height: 3,
          backgroundColor: pal.terracotta,
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
          padding: "0 120px",
          opacity: textOpacity,
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 72,
            fontWeight: 400,
            color: pal.text,
            lineHeight: 1.4,
            letterSpacing: "-0.02em",
            maxWidth: 1200,
            display: "flex",
            flexWrap: "wrap" as const,
            gap: "0 16px",
            alignItems: "baseline",
          }}
        >
          {words.map((word, i) => {
            const revealAt = word.revealAt ?? 999;
            const isRedacted = word.redacted && frame < revealAt;
            const justRevealed = word.redacted && frame >= revealAt;

            // Bar lift animation
            const barY = justRevealed
              ? interpolate(frame, [revealAt, revealAt + 6], [0, -120], C)
              : 0;
            const barOpacity = justRevealed
              ? interpolate(frame, [revealAt, revealAt + 6], [1, 0], C)
              : isRedacted ? 1 : 0;

            // Revealed word color flash
            const wordColor = justRevealed
              ? frame < revealAt + 15 ? pal.terracotta : pal.text
              : pal.text;

            // Scale slam on reveal
            const wordScale = justRevealed
              ? interpolate(frame, [revealAt, revealAt + 4, revealAt + 8], [1.2, 0.97, 1.0], C)
              : 1;

            return (
              <span
                key={i}
                style={{
                  position: "relative",
                  display: "inline-block",
                  transform: `scale(${wordScale})`,
                }}
              >
                {/* The word text — hidden under bar if redacted */}
                <span style={{
                  color: isRedacted ? "transparent" : wordColor,
                  transition: "color 0.1s",
                }}>
                  {word.text}
                </span>

                {/* Redaction bar */}
                {(isRedacted || justRevealed) && (
                  <span
                    style={{
                      position: "absolute",
                      left: -4,
                      right: -4,
                      top: "10%",
                      bottom: "5%",
                      backgroundColor: pal.dark,
                      borderRadius: 2,
                      opacity: barOpacity,
                      transform: `translateY(${barY}px)`,
                    }}
                  />
                )}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "narr-redaction-reveal",
  props: { words: [{ text: "India", redacted: false }, { text: "is the", redacted: false }, { text: "brain centre", redacted: true }, { text: "of global tech", redacted: false }], at: 15 },
  durationInFrames: 180,
};
