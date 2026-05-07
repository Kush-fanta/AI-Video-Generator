import { AbsoluteFill, useCurrentFrame, interpolate, interpolateColors } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface WordTiming {
  word: string;
  /** Frame this word becomes active */
  at: number;
}

interface WordByWordProps extends BaseProps {
  words: WordTiming[];
  /** Optional small category label */
  label?: string;
  /** Global frame offset */
  at?: number;
}

/**
 * WordByWord — All words visible at once in a centered text block.
 * Current word terracotta + slightly scaled, past words P.sub,
 * future words P.muted. Smooth color transitions between states.
 * Left terracotta accent bar, editorial label top-left.
 * Underline indicator tracks the active word.
 */
export const WordByWord: React.FC<WordByWordProps> = ({
  words,
  label,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const t = frame - at;

  // Find active word index
  const activeIndex = words.reduce(
    (acc, w, i) => (t >= w.at ? i : acc),
    -1,
  );

  // Progress counter — how many words have been spoken
  const spokenCount = activeIndex + 1;
  const totalCount = words.length;

  // Container reveal
  const containerReveal = reveal(frame, at);

  // Progress bar at bottom
  const progressFrac =
    totalCount > 0
      ? interpolate(spokenCount, [0, totalCount], [0, 100], C)
      : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Left-edge vertical terracotta bar */}
      <div
        style={{
          position: "absolute",
          left: 80,
          top: 600,
          width: 4,
          height: interpolate(t, [4, 30], [0, 500], { ...C, easing: ease }),
          backgroundColor: P.terracotta,
          borderRadius: 2,
          opacity: 0.7,
        }}
      />

      {/* Label top-left */}
      {label && (
        <div
          style={{
            position: "absolute",
            top: 100,
            left: 100,
            ...reveal(frame, at),
            fontFamily: sans,
            fontSize: 26,
            fontWeight: 600,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: P.muted,
          }}
        >
          {label}
        </div>
      )}

      {/* Terracotta accent dash below label */}
      {label && (
        <div
          style={{
            position: "absolute",
            top: 140,
            left: 100,
            width: `${lineGrow(frame, at + 4, 18)}%`,
            maxWidth: 40,
            height: 3,
            backgroundColor: P.terracotta,
            borderRadius: 2,
          }}
        />
      )}

      {/* Word block — centered vertically */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 110px",
        }}
      >
        <div style={containerReveal}>
          <div
            style={{
              fontFamily: serif,
              fontSize: 68,
              lineHeight: 1.5,
              fontWeight: 400,
              letterSpacing: "-0.01em",
              maxWidth: 860,
              textAlign: "center",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "0 0.3em",
            }}
          >
            {words.map((w, i) => {
              const isActive = i === activeIndex;
              const isPast = activeIndex >= 0 && i < activeIndex;
              const isFuture = activeIndex < 0 || i > activeIndex;

              // Smooth transition into active state (6 frames)
              const enterProg = isActive
                ? interpolate(t, [w.at, w.at + 6], [0, 1], C)
                : 0;

              // Smooth transition out of active state
              const nextAt =
                i < words.length - 1 ? words[i + 1].at : w.at + 30;
              const exitProg = isPast
                ? interpolate(t, [nextAt, nextAt + 6], [0, 1], C)
                : 0;

              // Color: future=muted, active=terracotta, past=sub
              let color: string;
              if (isActive) {
                color = interpolateColors(enterProg, [0, 1], [P.muted, P.terracotta]);
              } else if (isPast) {
                color = interpolateColors(exitProg, [0, 1], [P.terracotta, P.sub]);
              } else {
                color = P.muted;
              }

              // Scale bump for active word
              const scale = isActive
                ? interpolate(enterProg, [0, 0.5, 1], [1, 1.12, 1.08], C)
                : 1;

              // Active word gets a subtle underline
              const underlineWidth = isActive
                ? interpolate(enterProg, [0, 1], [0, 100], C)
                : 0;

              return (
                <span
                  key={i}
                  style={{
                    display: "inline-block",
                    position: "relative",
                    color,
                    transform: `scale(${scale})`,
                    fontWeight: isActive ? 600 : 400,
                    transition: "none",
                  }}
                >
                  {w.word}
                  {/* Underline indicator */}
                  {isActive && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: 2,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: `${underlineWidth}%`,
                        height: 3,
                        backgroundColor: P.terracotta,
                        borderRadius: 2,
                        opacity: 0.6,
                      }}
                    />
                  )}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          left: 100,
          right: 100,
          height: 2,
          backgroundColor: P.light,
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progressFrac}%`,
            backgroundColor: P.terracotta,
            borderRadius: 1,
            opacity: 0.7,
          }}
        />
      </div>

      {/* Word counter bottom-right */}
      <div
        style={{
          position: "absolute",
          bottom: 116,
          right: 100,
          fontFamily: sans,
          fontSize: 22,
          fontWeight: 500,
          color: P.muted,
          letterSpacing: "0.08em",
          opacity: interpolate(t, [10, 22], [0, 0.6], C),
        }}
      >
        {spokenCount}/{totalCount}
      </div>
    </AbsoluteFill>
  );
};
