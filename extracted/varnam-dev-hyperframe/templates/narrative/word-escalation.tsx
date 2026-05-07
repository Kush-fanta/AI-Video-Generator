import { AbsoluteFill, useCurrentFrame, interpolate, Img } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, dimTo, C, ease } from "../shared/primitives";
import type { ImageRef, BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface EscalationWord {
  text: string;
  at: number;
  size?: number;
  color?: string;
}

export interface WordEscalationProps extends BaseProps {
  words: EscalationWord[];
  /**
   * Optional image for the right half. When provided, replaces the ghost word echo
   * with a photographic/painterly image at 85-90% opacity.
   * Pass a staticFile path or URL.
   */
  image?: ImageRef;
}

/**
 * Three words rise from below with INCREASING size and intensity.
 * Each stays visible but dims when next arrives.
 * Accumulation = the feeling. Last word in terracotta is the climax.
 * When `image` is provided, right half shows a photographic image at 85-90% opacity.
 * When no `image`, right half shows the ghost echo of the last word.
 */
export const WordEscalation: React.FC<WordEscalationProps> = ({ words, image }) => {
  const frame = useCurrentFrame();
  const sorted = [...words].sort((a, b) => a.at - b.at);
  const defaultSizes = [48, 84, 140];
  const lastWord = sorted[sorted.length - 1];

  // Image fade-in tied to last word
  const imageOpacity = lastWord
    ? interpolate(frame, [lastWord.at + 4, lastWord.at + 22], [0, 0.88], C)
    : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Right half — image panel */}
      {image && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: "48%",
            height: "100%",
            opacity: imageOpacity,
          }}
        >
          <Img
            src={image}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
      )}

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: image ? "52%" : "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          paddingLeft: 120,
          paddingRight: image ? 60 : 120,
        }}
      >
        {sorted.map((word, i) => {
          const isLast = i === sorted.length - 1;
          const nextAt = isLast ? null : sorted[i + 1].at;
          const fontSize = word.size ?? defaultSizes[Math.min(i, defaultSizes.length - 1)];
          const color = word.color ?? (isLast ? P.terracotta : (i === 0 ? P.muted : P.text));

          // Dim previous words when next appears
          const dimOp = nextAt !== null
            ? dimTo(frame, nextAt, 0.12, 8)
            : 1;

          // Rise from below — larger offset for bigger words
          const riseOffset = interpolate(
            frame,
            [word.at, word.at + 18],
            [Math.min(fontSize * 0.3, 44), 0],
            { ...C, easing: ease },
          );
          const fadeIn = interpolate(frame, [word.at, word.at + 14], [0, 1], C);

          return (
            <div
              key={i}
              style={{
                opacity: frame >= word.at ? fadeIn * dimOp : 0,
                transform: `translateY(${riseOffset}px)`,
                marginBottom: i < sorted.length - 1 ? 8 : 0,
              }}
            >
              <div
                style={{
                  fontFamily: isLast ? serif : sans,
                  fontSize,
                  lineHeight: 1.0,
                  color,
                  fontWeight: isLast ? 400 : 700,
                  letterSpacing: isLast ? "-0.03em" : "-0.01em",
                }}
              >
                {word.text}
              </div>
            </div>
          );
        })}

      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "narr-word-escalation",
  props: {
    words: [
      {
        text: "signal",
        at: 0,
        size: 52
      },
      {
        text: "clarity",
        at: 18,
        size: 88
      },
      {
        text: "momentum",
        at: 36,
        size: 140,
        color: P.terracotta
      }
    ]
  },
  durationInFrames: 180,
};
