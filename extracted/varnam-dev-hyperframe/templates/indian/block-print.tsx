import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, C } from "../shared/primitives";
import { DiamondLattice } from "../shared/indian/patterns";
import { TEXTILE } from "../shared/indian/palettes";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

const ease = (t: number) => 1 - Math.pow(1 - t, 3);

interface BlockPrintProps {
  /** Main text displayed stamp-style */
  text: string;
  /** Optional smaller subtext */
  subtext?: string;
  /** Optional source */
  source?: string;
  /** Frame offset */
  at?: number;
}

/**
 * Text on DiamondLattice pattern background, TEXTILE.indigo text.
 * Stamp-like entry — slight rotation and hard snap into place.
 */
export const BlockPrint: React.FC<BlockPrintProps> = ({
  text,
  subtext,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  // Stamp snap: scale from 1.2 -> 1, rotation from 3deg -> 0, hard
  const stampScale = interpolate(frame, [at + 6, at + 12], [1.25, 1], { ...C, easing: ease });
  const stampRotate = interpolate(frame, [at + 6, at + 12], [3, 0], { ...C, easing: ease });
  const stampOpacity = interpolate(frame, [at + 6, at + 9], [0, 1], C);

  return (
    <AbsoluteFill style={{ backgroundColor: TEXTILE.cream }}>
      {/* Diamond lattice background */}
      <DiamondLattice color={TEXTILE.indigo} opacity={0.06} rows={10} cols={14} at={at} />

      {/* Stamp text */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${stampScale}) rotate(${stampRotate}deg)`,
          opacity: stampOpacity,
          textAlign: "center",
        }}
      >
        {/* Border frame around text — stamp style */}
        <div
          style={{
            border: `3px solid ${TEXTILE.indigo}`,
            borderRadius: 4,
            padding: "40px 60px",
            position: "relative",
          }}
        >
          {/* Inner border */}
          <div
            style={{
              position: "absolute",
              top: 6,
              left: 6,
              right: 6,
              bottom: 6,
              border: `1px solid ${TEXTILE.indigo}44`,
              borderRadius: 2,
            }}
          />

          <div
            style={{
              fontFamily: serif,
              fontSize: 72,
              lineHeight: 1.1,
              color: TEXTILE.indigo,
              letterSpacing: "-0.02em",
              maxWidth: 700,
            }}
          >
            {text}
          </div>

          {subtext && (
            <div
              style={{
                fontFamily: sans,
                fontSize: 22,
                color: TEXTILE.madder,
                marginTop: 18,
                fontWeight: 500,
                letterSpacing: "0.05em",
              }}
            >
              {subtext}
            </div>
          )}
        </div>
      </div>

      {/* Source bottom */}
      {source && (
        <div
          style={{
            position: "absolute",
            bottom: 60,
            right: 100,
            ...reveal(frame, at + 22),
            fontFamily: sans,
            fontSize: 15,
            color: TEXTILE.iron,
            opacity: 0.5,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          {source}
        </div>
      )}
    </AbsoluteFill>
  );
};
