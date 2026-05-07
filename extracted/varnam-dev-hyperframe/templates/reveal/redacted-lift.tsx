import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface RedactedLiftProps extends BaseProps {
  text: string;
  redactedWords: string[];
  liftAt?: number;
  at?: number;
}

/**
 * RedactedLift — CIA-style redacted document. Text visible with black rectangles
 * covering key words. The rectangles lift off (spring upward + fade) in sequence
 * to reveal hidden words in terracotta. Very investigative journalism.
 */
export const RedactedLift: React.FC<RedactedLiftProps> = ({
  text,
  redactedWords,
  liftAt = 30,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - at;

  // Document entrance
  const docReveal = reveal(frame, at + 5);

  // Parse text into segments (normal text + redacted words)
  const buildSegments = () => {
    const segments: Array<{ text: string; redacted: boolean; index: number }> = [];
    let remaining = text;
    let redactedIndex = 0;

    while (remaining.length > 0) {
      let earliest = -1;
      let earliestWord = "";
      let earliestIdx = 0;

      // Find the next redacted word in remaining text
      for (let i = 0; i < redactedWords.length; i++) {
        const pos = remaining.indexOf(redactedWords[i]);
        if (pos !== -1 && (earliest === -1 || pos < earliest)) {
          earliest = pos;
          earliestWord = redactedWords[i];
          earliestIdx = i;
        }
      }

      if (earliest === -1) {
        // No more redacted words — push remaining as normal text
        segments.push({ text: remaining, redacted: false, index: -1 });
        break;
      }

      // Push normal text before the redacted word
      if (earliest > 0) {
        segments.push({
          text: remaining.slice(0, earliest),
          redacted: false,
          index: -1,
        });
      }

      // Push redacted word
      segments.push({
        text: earliestWord,
        redacted: true,
        index: redactedIndex++,
      });

      remaining = remaining.slice(earliest + earliestWord.length);
    }

    return segments;
  };

  const segments = buildSegments();

  // Stagger: each redacted word lifts 10 frames after the previous
  const staggerInterval = 10;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Document paper feel — slightly elevated white area */}
      <div
        style={{
          position: "absolute",
          top: 200,
          left: 80,
          right: 80,
          bottom: 200,
          backgroundColor: "#F5F3EF",
          borderRadius: 8,
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          padding: 80,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          ...docReveal,
        }}
      >
        {/* Top-left "CLASSIFIED" stamp */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 60,
            fontFamily: sans,
            fontSize: 20,
            color: P.muted,
            letterSpacing: "0.2em",
            textTransform: "uppercase" as const,
            opacity: 0.4,
            borderBottom: `1px solid ${P.light}`,
            paddingBottom: 8,
          }}
        >
          CLASSIFIED
        </div>

        {/* Main text with redacted words */}
        <div
          style={{
            fontFamily: serif,
            fontSize: 52,
            lineHeight: 1.6,
            color: P.text,
            position: "relative",
          }}
        >
          {segments.map((seg, i) => {
            if (!seg.redacted) {
              return (
                <span key={i} style={{ color: P.sub }}>
                  {seg.text}
                </span>
              );
            }

            // Redacted word — with lifting black rectangle
            const wordLiftAt = liftAt + seg.index * staggerInterval;
            const isLifting = f >= wordLiftAt;

            // Rectangle lift animation
            const liftY = isLifting
              ? spring({
                  frame: f - wordLiftAt,
                  fps,
                  config: { damping: 10, stiffness: 80, mass: 0.7 },
                  from: 0,
                  to: -40,
                })
              : 0;
            const rectOpacity = isLifting
              ? interpolate(f, [wordLiftAt, wordLiftAt + 15], [1, 0], C)
              : 1;

            // Revealed word color transition
            const wordOpacity = isLifting
              ? interpolate(f, [wordLiftAt + 5, wordLiftAt + 12], [0, 1], C)
              : 0;

            // Word scale pop on reveal
            const wordScale = isLifting && f >= wordLiftAt + 8
              ? spring({
                  frame: f - wordLiftAt - 8,
                  fps,
                  config: { damping: 14, stiffness: 100, mass: 0.7 },
                  from: 1.08,
                  to: 1.0,
                })
              : 1.0;

            return (
              <span
                key={i}
                style={{
                  position: "relative",
                  display: "inline",
                }}
              >
                {/* Revealed word underneath */}
                <span
                  style={{
                    color: P.terracotta,
                    fontWeight: 700,
                    opacity: wordOpacity,
                    transform: `scale(${wordScale})`,
                    display: "inline-block",
                    transformOrigin: "center bottom",
                  }}
                >
                  {seg.text}
                </span>

                {/* Black redaction rectangle */}
                <span
                  style={{
                    position: "absolute",
                    top: "5%",
                    left: -4,
                    right: -4,
                    bottom: "10%",
                    backgroundColor: P.dark,
                    borderRadius: 3,
                    opacity: rectOpacity,
                    transform: `translateY(${liftY}px)`,
                    pointerEvents: "none" as const,
                  }}
                />
              </span>
            );
          })}
        </div>

        {/* Bottom document line */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: 60,
            right: 60,
            height: 1,
            backgroundColor: P.light,
            opacity: 0.5,
          }}
        />

        {/* Page number */}
        <div
          style={{
            position: "absolute",
            bottom: 48,
            right: 60,
            fontFamily: sans,
            fontSize: 20,
            color: P.muted,
            opacity: 0.3,
          }}
        >
          PAGE 1
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "reveal-redacted-lift",
  props: {
    text: "India moved from back office to brain centre in a decade",
    redactedWords: ["brain centre", "a decade"],
    liftAt: 30,
    at: 15,
  },
  durationInFrames: 180,
};
