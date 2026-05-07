import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, ease } from "../shared/primitives";
import { DiamondLattice, KolamGrid } from "../shared/indian/patterns";
import { TEXTILE } from "../shared/indian/palettes";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface TextileQuoteProps extends BaseProps {
  /** The quote text */
  quote: string;
  /** Attribution / speaker */
  attribution?: string;
  /** Optional context line */
  context?: string;
  /** Animation start frame */
  at?: number;
}

/**
 * Quote on a warm TEXTILE.cream background. DiamondLattice pattern as subtle texture.
 * KolamGrid in the bottom-left corner. Quote in serif, TEXTILE.indigo.
 * Handloom/artisanal feel. Hard snap reveals.
 */
export const TextileQuote: React.FC<TextileQuoteProps> = ({
  quote,
  attribution,
  context,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const accentW = lineGrow(frame, at + 8, 18);

  return (
    <AbsoluteFill style={{ backgroundColor: TEXTILE.cream }}>
      {/* Diamond lattice texture */}
      <DiamondLattice
        color={TEXTILE.turmeric}
        opacity={0.06}
        rows={10}
        cols={14}
        at={at}
      />

      {/* Kolam in bottom-left corner */}
      <KolamGrid
        color={TEXTILE.madder}
        opacity={0.1}
        size={360}
        at={at + 5}
        style={{ bottom: -40, left: -40, top: "auto" }}
      />

      {/* Quote block — centered */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          maxWidth: 900,
          zIndex: 2,
        }}
      >
        {/* Opening quotation mark */}
        <div
          style={{
            ...reveal(frame, at + 2),
            fontFamily: serif,
            fontSize: 120,
            lineHeight: 0.5,
            color: TEXTILE.madder,
            opacity: 0.25,
            marginBottom: 20,
          }}
        >
          {"\u201C"}
        </div>

        {/* Quote text */}
        <div
          style={{
            ...reveal(frame, at + 6),
            fontFamily: serif,
            fontSize: 52,
            lineHeight: 1.35,
            color: TEXTILE.indigo,
            textAlign: "center",
            letterSpacing: "-0.01em",
          }}
        >
          {quote}
        </div>

        {/* Accent line */}
        <div
          style={{
            width: `${accentW}%`,
            maxWidth: 80,
            height: 3,
            backgroundColor: TEXTILE.madder,
            marginTop: 36,
            borderRadius: 1,
          }}
        />

        {/* Attribution */}
        {attribution && (
          <div
            style={{
              ...reveal(frame, at + 22),
              fontFamily: sans,
              fontSize: 22,
              fontWeight: 600,
              color: TEXTILE.iron,
              marginTop: 24,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {attribution}
          </div>
        )}

        {/* Context */}
        {context && (
          <div
            style={{
              ...reveal(frame, at + 28),
              fontFamily: sans,
              fontSize: 18,
              color: P.muted,
              marginTop: 10,
            }}
          >
            {context}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
