import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, C, FPS, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface HighlightItem {
  phrase: string;
  color?: string;
}

interface HighlightSweepProps extends BaseProps {
  text: string;
  highlights: HighlightItem[];
  at?: number;
}

/**
 * HighlightSweep — Text displayed normally, then translucent
 * yellow-terracotta highlights sweep left-to-right across key
 * phrases like a highlighter pen. Multiple highlights fire
 * in sequence with staggered timing. Portrait 1080x1920.
 */
export const HighlightSweep: React.FC<HighlightSweepProps> = ({
  text,
  highlights,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  const textReveal = reveal(frame, at);

  // Sweep starts after text is visible
  const sweepStart = 22;
  const sweepDur = 16;
  const stagger = 18;

  // Default highlight color: warm terracotta wash
  const defaultColor = "rgba(193,122,72,0.22)";

  // Build rendered segments — split text around highlights
  const renderText = () => {
    if (!highlights.length) {
      return <span style={{ color: P.text }}>{text}</span>;
    }

    const sorted = [...highlights].sort(
      (a, b) => text.indexOf(a.phrase) - text.indexOf(b.phrase),
    );

    const parts: React.ReactNode[] = [];
    let lastIdx = 0;

    sorted.forEach((hl, i) => {
      const idx = text.indexOf(hl.phrase, lastIdx);
      if (idx === -1) return;

      // Plain text before this highlight
      if (idx > lastIdx) {
        parts.push(
          <span key={`t-${i}`} style={{ color: P.text }}>
            {text.slice(lastIdx, idx)}
          </span>,
        );
      }

      // Sweep progress for this highlight
      const hlAt = sweepStart + i * stagger;
      const sweep = interpolate(f, [hlAt, hlAt + sweepDur], [0, 100], {
        ...C,
        easing: ease,
      });

      const bgColor = hl.color || defaultColor;

      parts.push(
        <span
          key={`h-${i}`}
          style={{
            position: "relative",
            display: "inline",
            color: P.text,
          }}
        >
          {/* Highlight sweep layer — clipped to progress */}
          <span
            style={{
              position: "absolute",
              top: -4,
              left: -4,
              right: -4,
              bottom: -2,
              background: bgColor,
              borderRadius: 3,
              clipPath: `inset(0 ${100 - sweep}% 0 0)`,
              zIndex: -1,
            }}
          />
          <span style={{ position: "relative", zIndex: 1 }}>
            {hl.phrase}
          </span>
        </span>,
      );

      lastIdx = idx + hl.phrase.length;
    });

    // Remaining text
    if (lastIdx < text.length) {
      parts.push(
        <span key="tail" style={{ color: P.text }}>
          {text.slice(lastIdx)}
        </span>,
      );
    }

    return parts;
  };

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 80,
          ...textReveal,
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 64,
            lineHeight: 1.55,
            color: P.text,
            letterSpacing: "-0.01em",
            maxWidth: 920,
            textAlign: "left",
          }}
        >
          {renderText()}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "annot-highlight-sweep",
  props: {
    text: "The transformation from cost arbitrage to capability arbitrage.",
    highlights: [{ phrase: "capability arbitrage" }],
    at: 15,
  },
  durationInFrames: 180,
};
