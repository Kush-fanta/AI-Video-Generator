import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, FPS, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface DefinitionCardProps extends BaseProps {
  word: string;
  pronunciation?: string;
  partOfSpeech: string;
  definition: string;
  etymology?: string;
  at?: number;
}

/**
 * DefinitionCard — Dictionary entry layout. Word in large serif bold with
 * pronunciation in italic below. Part of speech in small caps (sans).
 * Definition text indented. Etymology note in muted. Thin horizontal rules
 * separating sections. Very typographic.
 */
export const DefinitionCard: React.FC<DefinitionCardProps> = ({
  word,
  pronunciation,
  partOfSpeech,
  definition,
  etymology,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const t = frame - at;

  // Word entrance — spring
  const wordProgress = t >= 4
    ? spring({ frame: t - 4, fps: FPS, config: { damping: 16, mass: 1.0, stiffness: 110 } })
    : 0;
  const wordY = interpolate(wordProgress, [0, 1], [20, 0], C);
  const wordOpacity = interpolate(wordProgress, [0, 0.3], [0, 1], C);

  // Section reveal timings
  const pronAt = at + 14;
  const posAt = at + 22;
  const defAt = at + 30;
  const etymAt = at + 44;

  // Horizontal rules
  const rule1W = lineGrow(frame, at + 18, 20);
  const rule2W = lineGrow(frame, at + 40, 20);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Main content — dictionary entry */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: 120,
          paddingRight: 120,
        }}
      >
        {/* Word */}
        <div
          style={{
            opacity: wordOpacity,
            transform: `translateY(${wordY}px)`,
          }}
        >
          <span
            style={{
              fontFamily: serif,
              fontSize: 96,
              fontWeight: 400,
              color: P.text,
              lineHeight: 1.0,
              letterSpacing: "-0.03em",
            }}
          >
            {word}
          </span>
        </div>

        {/* Pronunciation */}
        {pronunciation && (
          <div
            style={{
              ...reveal(frame, pronAt),
              marginTop: 16,
            }}
          >
            <span
              style={{
                fontFamily: serif,
                fontSize: 32,
                fontStyle: "italic",
                color: P.muted,
                lineHeight: 1.3,
              }}
            >
              /{pronunciation}/
            </span>
          </div>
        )}

        {/* Rule 1 */}
        <div
          style={{
            width: `${rule1W}%`,
            maxWidth: 780,
            height: 1,
            backgroundColor: P.light,
            marginTop: 28,
            marginBottom: 28,
          }}
        />

        {/* Part of speech */}
        <div
          style={{
            ...reveal(frame, posAt),
          }}
        >
          <span
            style={{
              fontFamily: sans,
              fontSize: 22,
              fontWeight: 600,
              color: P.terracotta,
              letterSpacing: "0.18em",
              textTransform: "uppercase" as const,
            }}
          >
            {partOfSpeech}
          </span>
        </div>

        {/* Definition — indented */}
        <div
          style={{
            ...reveal(frame, defAt, 20),
            marginTop: 24,
            paddingLeft: 32,
            borderLeft: `3px solid ${P.terracotta}`,
            maxWidth: 740,
          }}
        >
          <span
            style={{
              fontFamily: sans,
              fontSize: 40,
              fontWeight: 500,
              color: P.text,
              lineHeight: 1.4,
            }}
          >
            {definition}
          </span>
        </div>

        {/* Rule 2 — only if etymology */}
        {etymology && (
          <div
            style={{
              width: `${rule2W}%`,
              maxWidth: 500,
              height: 1,
              backgroundColor: P.light,
              marginTop: 36,
              marginBottom: 24,
            }}
          />
        )}

        {/* Etymology */}
        {etymology && (
          <div
            style={{
              ...reveal(frame, etymAt, 18),
              paddingLeft: 32,
            }}
          >
            <span
              style={{
                fontFamily: sans,
                fontSize: 20,
                fontWeight: 500,
                color: P.muted,
                letterSpacing: "0.06em",
              }}
            >
              ORIGIN{" "}
            </span>
            <span
              style={{
                fontFamily: serif,
                fontSize: 26,
                fontStyle: "italic",
                color: P.sub,
                lineHeight: 1.5,
              }}
            >
              {etymology}
            </span>
          </div>
        )}
      </div>

      {/* Ghost letter — massive background */}
      <div
        style={{
          position: "absolute",
          top: "44%",
          right: -60,
          transform: "translateY(-50%)",
          fontFamily: serif,
          fontSize: 700,
          lineHeight: 0.8,
          color: P.dark,
          opacity: interpolate(t, [6, 22], [0, 0.03], C),
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        {word.charAt(0).toUpperCase()}
      </div>

      {/* Decorative terracotta dot — top-right */}
      <div
        style={{
          position: "absolute",
          top: 100,
          right: 120,
          ...reveal(frame, at + 12),
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: P.terracotta,
          }}
        />
      </div>

      {/* Bottom rule */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 120,
          width: `${lineGrow(frame, at + 8, 28)}%`,
          maxWidth: 180,
          height: 1,
          backgroundColor: P.light,
          opacity: 0.35,
        }}
      />
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "hero-definition-card",
  props: {
    word: "GCC",
    pronunciation: "/dʒiː.siː.siː/",
    partOfSpeech: "noun",
    definition: "A company-owned offshore operation handling core business functions.",
    at: 15,
  },
  durationInFrames: 180,
};
