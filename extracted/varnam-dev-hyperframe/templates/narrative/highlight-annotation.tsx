import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { P } from "../shared/palette";
import { reveal, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();

interface HighlightWord {
  word: string;
  at: number;
}

export interface HighlightAnnotationProps extends BaseProps {
  text: string;
  highlights: HighlightWord[];
  at?: number;
}

/**
 * A sentence/paragraph with specific words that HIGHLIGHT in terracotta bold
 * at specific frame timestamps. The rest stays muted.
 * Like a document being annotated in real-time.
 * One short terracotta accent above the text block.
 */
export const HighlightAnnotation: React.FC<HighlightAnnotationProps> = ({
  text,
  highlights,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  /** Build annotated text with highlight transitions */
  const renderAnnotatedText = () => {
    if (highlights.length === 0) {
      return <span style={{ color: P.muted }}>{text}</span>;
    }

    // Sort by position in text for left-to-right processing
    const sortedHighlights = [...highlights].sort(
      (a, b) => text.indexOf(a.word) - text.indexOf(b.word),
    );

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    sortedHighlights.forEach((hl, i) => {
      const idx = text.indexOf(hl.word, lastIndex);
      if (idx === -1) return;

      // Muted text before this highlight
      if (idx > lastIndex) {
        parts.push(
          <span key={`pre-${i}`} style={{ color: P.muted }}>
            {text.slice(lastIndex, idx)}
          </span>,
        );
      }

      // Animated highlight — transitions from muted to terracotta bold
      const progress = interpolate(frame, [hl.at, hl.at + 8], [0, 1], C);
      const hlColor = lerpColor(progress, P.muted, P.terracotta);

      parts.push(
        <span
          key={`hl-${i}`}
          style={{
            color: hlColor,
            fontWeight: progress > 0.5 ? 700 : 400,
            position: "relative",
            display: "inline",
          }}
        >
          {hl.word}
          {/* Underline accent on highlighted word */}
          {progress > 0.3 && (
            <span
              style={{
                position: "absolute",
                bottom: -4,
                left: 0,
                width: `${progress * 100}%`,
                height: 2,
                backgroundColor: P.terracotta,
                borderRadius: 1,
                opacity: progress * 0.7,
              }}
            />
          )}
        </span>,
      );

      lastIndex = idx + hl.word.length;
    });

    // Remaining muted text
    if (lastIndex < text.length) {
      parts.push(
        <span key="tail" style={{ color: P.muted }}>
          {text.slice(lastIndex)}
        </span>,
      );
    }

    return parts;
  };

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Main text block — centered vertically */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          paddingLeft: 120,
          paddingRight: 120,
        }}
      >
        <div style={reveal(frame, at)}>
          <div
            style={{
              fontFamily: serif,
              fontSize: 50,
              lineHeight: 1.55,
              fontWeight: 400,
              letterSpacing: "-0.01em",
              maxWidth: 960,
            }}
          >
            {renderAnnotatedText()}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Linear interpolation between two hex colors */
function lerpColor(t: number, from: string, to: string): string {
  const f = hexToRgb(from);
  const tt = hexToRgb(to);
  const r = Math.round(f.r + (tt.r - f.r) * t);
  const g = Math.round(f.g + (tt.g - f.g) * t);
  const b = Math.round(f.b + (tt.b - f.b) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

export const demo = {
  compositionId: "narr-highlight-annotation",
  props: {
    text: "The team shipped the defaults, then tightened the edge cases.",
    highlights: [
      {
        word: "defaults",
        at: 12
      },
      {
        word: "edge cases",
        at: 28
      }
    ]
  },
  durationInFrames: 180,
};
