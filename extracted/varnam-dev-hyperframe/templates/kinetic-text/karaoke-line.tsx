import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface WordTiming {
  word: string;
  startFrame: number;
  endFrame: number;
}

/**
 * Karaoke fill — terracotta color sweeps left-to-right through each word
 * as it is spoken. Two text layers: muted base + terracotta overlay clipped
 * to the current fill position.
 *
 * **Single-line only.** Multi-line text will cause sync errors with the
 * clip-path approach. Use `maxWidth` to enforce single-line rendering.
 *
 * Pass `wordWidths` for proportional band calculation — an array of relative
 * weights matching the word array. Callers who know their text can pass
 * hand-tuned values (e.g. proportional to each word's pixel width). Defaults
 * to equal weights.
 */
interface KaraokeLineProps extends BaseProps {
  words: WordTiming[];
  /** Global offset — shifts all timing */
  at?: number;
  /**
   * When set, enforces single-line rendering via `whiteSpace: "nowrap"`.
   * Recommended for all uses of this template.
   */
  maxWidth?: number;
  /**
   * Proportional weights per word — used to compute fill band widths.
   * Length must match `words`. Values are relative (they are normalized
   * internally). If omitted, equal bands are assumed.
   * Example: for "India now hosts GCCs" you might pass [60, 40, 55, 80]
   * to reflect each word's approximate rendered width.
   */
  wordWidths?: number[];
}

/**
 * Karaoke fill — terracotta color sweeps left-to-right through each word
 * as it is spoken. Two text layers: muted base + terracotta overlay clipped
 * to the current fill position.
 *
 * **Single-line only.** Multi-line text will cause sync errors with clip-path approach.
 */
export const KaraokeLine: React.FC<KaraokeLineProps> = ({
  words,
  at = 0,
  maxWidth,
  wordWidths,
}) => {
  const frame = useCurrentFrame();
  const t = frame - at;

  const wordCount = words.length;

  // Compute band boundaries from proportional weights (or equal if not provided)
  const weights =
    wordWidths && wordWidths.length === wordCount
      ? wordWidths
      : Array(wordCount).fill(1);

  const totalWeight = weights.reduce((a, b) => a + b, 0);

  // bandStarts[i] and bandEnds[i] are percentages 0–100
  const bandStarts: number[] = [];
  const bandEnds: number[] = [];
  let cumulative = 0;
  for (let i = 0; i < wordCount; i++) {
    const bandFrac = weights[i] / totalWeight;
    bandStarts[i] = cumulative * 100;
    cumulative += bandFrac;
    bandEnds[i] = cumulative * 100;
  }

  let fillPercent = 0;

  if (wordCount > 0) {
    for (let i = 0; i < wordCount; i++) {
      const w = words[i];
      if (t >= w.endFrame) {
        fillPercent = bandEnds[i];
      } else if (t >= w.startFrame) {
        const wordProgress = interpolate(
          t,
          [w.startFrame, w.endFrame],
          [bandStarts[i], bandEnds[i]],
          C,
        );
        fillPercent = wordProgress;
        break;
      } else {
        break;
      }
    }
  }

  const containerReveal = reveal(frame, at);

  const textStyle: React.CSSProperties = {
    fontFamily: serif,
    fontSize: 64,
    lineHeight: 1.5,
    fontWeight: 400,
    letterSpacing: "-0.01em",
    maxWidth: maxWidth ?? 1400,
    textAlign: "center",
    display: "flex",
    flexWrap: maxWidth ? "nowrap" : "wrap",
    justifyContent: "center",
    gap: "0 0.3em",
    whiteSpace: maxWidth ? "nowrap" : undefined,
    overflow: maxWidth ? "hidden" : undefined,
  };

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Top-left terracotta accent */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 120,
          width: `${lineGrow(frame, at, 20)}%`,
          maxWidth: 50,
          height: 3,
          backgroundColor: P.terracotta,
          borderRadius: 2,
        }}
      />

      {/* Main text area — centered */}
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
          padding: "80px 120px",
        }}
      >
        <div style={{ ...containerReveal, position: "relative" }}>
          {/* Layer 1: all words in muted (base layer) */}
          <div style={textStyle}>
            {words.map((w, i) => (
              <span key={i} style={{ color: P.muted, display: "inline-block" }}>
                {w.word}
              </span>
            ))}
          </div>

          {/* Layer 2: all words in terracotta, clipped to fill */}
          <div
            style={{
              ...textStyle,
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              clipPath: `inset(0 ${100 - fillPercent}% 0 0)`,
            }}
          >
            {words.map((w, i) => (
              <span
                key={i}
                style={{ color: P.terracotta, display: "inline-block" }}
              >
                {w.word}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom decorative line */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 120,
          width: `${lineGrow(frame, at + 8, 40)}%`,
          maxWidth: 280,
          height: 1,
          backgroundColor: P.light,
          opacity: 0.4,
        }}
      />
    </AbsoluteFill>
  );
};
