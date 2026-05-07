import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface EditorialQuoteProps extends BaseProps {
  quote: string;
  attribution: string;
  at?: number;
}

/**
 * Large pull quote — decorative terracotta opening quote mark,
 * serif italic quote text (56px), muted sans attribution below.
 * Vertical terracotta rule anchored to left edge.
 */
export const EditorialQuote: React.FC<EditorialQuoteProps> = ({
  quote,
  attribution,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  const ruleHeight = lineGrow(frame, at + 2, 35);
  const quoteMarkOpacity = interpolate(frame, [at, at + 20], [0, 0.12], C);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Vertical terracotta rule — left edge */}
      <div
        style={{
          position: "absolute",
          left: 80,
          top: "18%",
          width: 4,
          height: `${ruleHeight * 0.6}%`,
          maxHeight: 680,
          backgroundColor: P.terracotta,
          borderRadius: 2,
        }}
      />

      {/* Decorative opening quotation mark */}
      <div
        style={{
          position: "absolute",
          left: 110,
          top: "22%",
          fontFamily: serif,
          fontSize: 320,
          lineHeight: 1,
          color: P.terracotta,
          opacity: quoteMarkOpacity,
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        &ldquo;
      </div>

      {/* Content container */}
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
          paddingLeft: 130,
          paddingRight: 140,
        }}
      >
        {/* Quote text */}
        <div
          style={{
            ...reveal(frame, at + 8),
            fontFamily: serif,
            fontSize: 56,
            fontStyle: "italic",
            lineHeight: 1.45,
            color: P.text,
            maxWidth: 780,
            letterSpacing: "-0.01em",
          }}
        >
          {quote}
        </div>

        {/* Terracotta dash separator */}
        <div
          style={{
            width: `${lineGrow(frame, at + 22, 20)}%`,
            maxWidth: 56,
            height: 3,
            backgroundColor: P.terracotta,
            marginTop: 48,
            borderRadius: 2,
          }}
        />

        {/* Attribution */}
        <div
          style={{
            ...reveal(frame, at + 28),
            fontFamily: sans,
            fontSize: 24,
            fontWeight: 500,
            color: P.muted,
            marginTop: 24,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          {attribution}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "narr-editorial-quote",
  props: {
    quote: "The point is to be legible before it is clever.",
    attribution: "Editorial desk"
  },
  durationInFrames: 180,
};
