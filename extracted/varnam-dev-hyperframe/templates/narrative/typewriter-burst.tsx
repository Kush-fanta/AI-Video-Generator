import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { lineGrow, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface TypewriterBurstProps extends BaseProps {
  /** Full text — last word(s) after burstAt will burst in */
  text: string;
  /** Frame to start typing */
  at?: number;
  /** Frame when remaining text bursts in all at once */
  burstAt?: number;
  /** Frames per character during typewriter phase (default 2) */
  speed?: number;
}

/**
 * Text appears char-by-char at variable speed, then remaining words BURST in
 * all at once at the punchline. The burst uses a scale slam from 1.15 and
 * slight rotation. Cursor blinks during type, vanishes on burst.
 */
export const TypewriterBurst: React.FC<TypewriterBurstProps> = ({
  text,
  at = 0,
  burstAt,
  speed = 2,
}) => {
  const frame = useCurrentFrame();
  const rel = frame - at;

  const chars = text.split("");
  const typedCount = Math.max(0, Math.floor(rel / speed));
  const effectiveBurstAt = burstAt ? burstAt - at : Math.floor(chars.length * 0.65) * speed;
  const isBurst = rel >= effectiveBurstAt;

  // Characters to show
  const visibleChars = isBurst ? chars.length : Math.min(typedCount, chars.length);

  // Burst scale slam
  const burstScale = isBurst
    ? interpolate(rel, [effectiveBurstAt, effectiveBurstAt + 3, effectiveBurstAt + 6], [1.12, 0.98, 1.0], C)
    : 1;

  // Cursor blink (toggle every 8 frames)
  const showCursor = !isBurst && rel >= 0 && Math.floor(rel / 8) % 2 === 0;

  const opacity = interpolate(rel, [0, 3], [0, 1], C);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 120,
          width: `${lineGrow(frame, at, 20)}%`,
          maxWidth: 60,
          height: 3,
          backgroundColor: P.terracotta,
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
          opacity,
          transform: `scale(${burstScale})`,
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 80,
            fontWeight: 400,
            color: P.text,
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
            maxWidth: 1200,
          }}
        >
          {chars.slice(0, visibleChars).map((char, i) => {
            // Burst chars get terracotta color
            const isBurstChar = isBurst && i >= Math.min(typedCount, chars.length);
            return (
              <span
                key={i}
                style={{
                  color: isBurstChar ? P.terracotta : P.text,
                  fontWeight: isBurstChar ? 400 : 400,
                }}
              >
                {char}
              </span>
            );
          })}
          {showCursor && (
            <span style={{ color: P.terracotta, fontWeight: 700 }}>|</span>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "narr-typewriter-burst",
  props: { text: "India is no longer the back office.", at: 15 },
  durationInFrames: 180,
};
