import React from "react";
import { AbsoluteFill, useCurrentFrame, Img, staticFile } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow } from "../shared/primitives";
import type { ImageRef, BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface QuoteCardProps extends BaseProps {
  quote: string;
  source: string;
  highlights?: string[];
  image?: ImageRef;
  at?: number;
}

/**
 * Renders quote text with highlighted phrases in terracotta bold.
 */
const HighlightedQuote: React.FC<{
  text: string;
  highlights: string[];
}> = ({ text, highlights }) => {
  if (!highlights || highlights.length === 0) {
    return <>{text}</>;
  }

  // Build regex from all highlight phrases
  const escaped = highlights.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) => {
        const isHighlight = highlights.some(
          (h) => h.toLowerCase() === part.toLowerCase()
        );
        return isHighlight ? (
          <span key={i} style={{ color: P.terracotta, fontWeight: 700 }}>
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </>
  );
};

/**
 * Editorial blockquote.
 * Left 3px terracotta border. Source pill above. Quote in 44px serif.
 * Highlighted phrases in terracotta bold. Optional image cutout right at 0.3 opacity.
 * One short accent line below quote.
 */
export const QuoteCard: React.FC<QuoteCardProps> = ({
  quote,
  source,
  highlights = [],
  image,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const borderHeight = lineGrow(frame, at + 4, 28);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Optional background image — right side, low opacity */}
      {image && (
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "40%",
            height: "100%",
            ...(() => { const r = reveal(frame, at + 8); return { ...r, opacity: r.opacity * 0.3 }; })(),
          }}
        >
          <Img
            src={staticFile(image)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              objectPosition: "right center",
            }}
          />
        </div>
      )}

      {/* Quote block */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: image ? "65%" : "78%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: 120,
          paddingRight: 60,
          zIndex: 2,
        }}
      >
        {/* Source pill */}
        <div
          style={{
            ...reveal(frame, at + 2),
            marginBottom: 28,
          }}
        >
          <span
            style={{
              fontFamily: sans,
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: P.sub,
            }}
          >
            {source}
          </span>
        </div>

        {/* Left terracotta border + quote */}
        <div
          style={{
            position: "relative",
            paddingLeft: 32,
          }}
        >
          {/* Animated left border */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 3,
              height: `${borderHeight}%`,
              backgroundColor: P.terracotta,
              borderRadius: 2,
            }}
          />

          <div
            style={{
              ...reveal(frame, at + 8),
              fontFamily: serif,
              fontSize: 44,
              lineHeight: 1.35,
              color: P.text,
              maxWidth: 820,
            }}
          >
            <HighlightedQuote text={quote} highlights={highlights} />
          </div>
        </div>

      </div>
    </AbsoluteFill>
  );
};
