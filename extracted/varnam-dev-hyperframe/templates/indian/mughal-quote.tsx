import { AbsoluteFill, useCurrentFrame } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C } from "../shared/primitives";
import { MUGHAL } from "../shared/indian/palettes";
import { JaliPattern, ScallopedBorder } from "../shared/indian/patterns";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface MughalQuoteProps extends BaseProps {
  /** The quote text */
  quote: string;
  /** Attribution / speaker name */
  attribution?: string;
  /** Frame offset */
  at?: number;
}

/**
 * Dark background (MUGHAL.onyx), large quote in MUGHAL.ivory serif italic.
 * JaliPattern as subtle bg. ScallopedBorder top and bottom.
 * Attribution in MUGHAL.gold.
 */
export const MughalQuote: React.FC<MughalQuoteProps> = ({
  quote,
  attribution,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: MUGHAL.onyx }}>
      {/* Jali background */}
      <JaliPattern color={MUGHAL.gold} opacity={0.05} rows={6} cols={8} at={at} />

      {/* Scalloped border top */}
      <ScallopedBorder color={MUGHAL.gold} opacity={0.2} scallops={14} side="top" at={at + 3} />

      {/* Scalloped border bottom */}
      <ScallopedBorder color={MUGHAL.gold} opacity={0.2} scallops={14} side="bottom" at={at + 5} />

      {/* Quote content */}
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
          alignItems: "center",
          padding: "80px 120px",
          zIndex: 2,
        }}
      >
        {/* Opening quote mark */}
        <div
          style={{
            ...reveal(frame, at + 6),
            fontFamily: serif,
            fontSize: 120,
            lineHeight: 0.5,
            color: MUGHAL.gold,
            opacity: 0.3,
            marginBottom: 20,
          }}
        >
          {"\u201C"}
        </div>

        {/* Quote text */}
        <div
          style={{
            ...reveal(frame, at + 10),
            fontFamily: serif,
            fontSize: 42,
            fontStyle: "italic",
            lineHeight: 1.45,
            color: MUGHAL.ivory,
            textAlign: "center",
            maxWidth: 820,
          }}
        >
          {quote}
        </div>

        {/* Gold accent line */}
        <div
          style={{
            width: `${lineGrow(frame, at + 22, 18)}%`,
            maxWidth: 80,
            height: 2,
            backgroundColor: MUGHAL.gold,
            marginTop: 36,
            borderRadius: 1,
          }}
        />

        {/* Attribution */}
        {attribution && (
          <div
            style={{
              ...reveal(frame, at + 28),
              fontFamily: sans,
              fontSize: 18,
              fontWeight: 500,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: MUGHAL.gold,
              marginTop: 22,
            }}
          >
            {attribution}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
