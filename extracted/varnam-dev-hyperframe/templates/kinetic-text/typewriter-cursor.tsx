import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, FPS, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface TypewriterCursorProps extends BaseProps {
  text: string;
  charsPerSecond?: number;
  at?: number;
}

/**
 * TypewriterCursor — Characters appear one by one from left, with a blinking
 * cursor (terracotta vertical bar). Monospace-like spacing. The cursor blinks
 * at the end. Classic typewriter cadence — not too fast.
 * Optional "paper" texture bg.
 */
export const TypewriterCursor: React.FC<TypewriterCursorProps> = ({
  text,
  charsPerSecond = 8,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const t = frame - at;

  const framesPerChar = Math.round(FPS / charsPerSecond);
  const totalChars = text.length;
  const typingDuration = totalChars * framesPerChar;

  // How many characters are visible
  const visibleCount = Math.min(
    totalChars,
    Math.max(0, Math.floor(t / framesPerChar)),
  );

  const visibleText = text.slice(0, visibleCount);
  const isTyping = t >= 0 && visibleCount < totalChars;
  const isDone = visibleCount >= totalChars;

  // Cursor blink — steady while typing, blinks when done
  const cursorVisible = isTyping
    ? true
    : isDone
      ? Math.floor((t - typingDuration) / 10) % 2 === 0
      : false;

  // Container reveal
  const containerReveal = reveal(frame, at);

  // Paper texture lines — subtle horizontal rules
  const paperLines = Array.from({ length: 20 }, (_, i) => i);
  const LINE_SPACING = 96;
  const TOP_MARGIN = 400;

  // Figure out which line we're on (for multi-line text wrapping)
  const CHARS_PER_LINE = 18;
  const lines: string[] = [];
  for (let i = 0; i < visibleText.length; i += CHARS_PER_LINE) {
    lines.push(visibleText.slice(i, i + CHARS_PER_LINE));
  }

  // Also compute lines for the full text to know total line count
  const fullLines: string[] = [];
  for (let i = 0; i < text.length; i += CHARS_PER_LINE) {
    fullLines.push(text.slice(i, i + CHARS_PER_LINE));
  }

  // Cursor position
  const cursorLineIndex = lines.length - 1;
  const cursorCharIndex = lines.length > 0 ? lines[lines.length - 1].length : 0;

  // Keystroke sound indicator — subtle dot that flashes on each new char
  const justTyped = isTyping && t % framesPerChar === 0 && t > 0;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Paper texture — faint horizontal rules */}
      {paperLines.map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 100,
            right: 100,
            top: TOP_MARGIN + i * LINE_SPACING,
            height: 1,
            backgroundColor: P.light,
            opacity: interpolate(t, [i * 2, i * 2 + 10], [0, 0.2], C),
          }}
        />
      ))}

      {/* Left margin line — editorial red margin */}
      <div
        style={{
          position: "absolute",
          left: 160,
          top: TOP_MARGIN - 20,
          width: 2,
          height: interpolate(t, [0, 30], [0, 1200], { ...C, easing: ease }),
          backgroundColor: P.terracotta,
          opacity: 0.2,
        }}
      />

      {/* Text area */}
      <div
        style={{
          position: "absolute",
          left: 190,
          right: 100,
          top: TOP_MARGIN,
          ...containerReveal,
        }}
      >
        {lines.map((line, lineIdx) => (
          <div
            key={lineIdx}
            style={{
              height: LINE_SPACING,
              display: "flex",
              alignItems: "center",
              position: "relative",
            }}
          >
            <span
              style={{
                fontFamily: serif,
                fontSize: 64,
                fontWeight: 400,
                color: P.text,
                letterSpacing: "0.02em",
                lineHeight: 1,
                whiteSpace: "pre",
              }}
            >
              {line}
            </span>

            {/* Cursor — on the current line */}
            {lineIdx === cursorLineIndex && cursorVisible && (
              <span
                style={{
                  display: "inline-block",
                  width: 4,
                  height: 56,
                  backgroundColor: P.terracotta,
                  marginLeft: 2,
                  borderRadius: 1,
                  verticalAlign: "middle",
                }}
              />
            )}
          </div>
        ))}

        {/* Cursor on empty state */}
        {lines.length === 0 && t >= 0 && cursorVisible && (
          <div style={{ height: LINE_SPACING, display: "flex", alignItems: "center" }}>
            <span
              style={{
                display: "inline-block",
                width: 4,
                height: 56,
                backgroundColor: P.terracotta,
                borderRadius: 1,
              }}
            />
          </div>
        )}
      </div>

      {/* Keystroke indicator — flashes on each new character */}
      {justTyped && (
        <div
          style={{
            position: "absolute",
            top: 80,
            right: 100,
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: P.terracotta,
            opacity: 0.6,
          }}
        />
      )}

      {/* Character counter bottom-right */}
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
        {visibleCount} / {totalChars}
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
          opacity: 0.3,
        }}
      />
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "ktext-typewriter-cursor",
  props: {
    text: "India is no longer the back office.",
    at: 15,
  },
  durationInFrames: 180,
};
