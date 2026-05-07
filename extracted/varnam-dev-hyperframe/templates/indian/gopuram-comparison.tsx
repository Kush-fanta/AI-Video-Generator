import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, ease } from "../shared/primitives";
import { TempleGopuram, DiamondLattice } from "../shared/indian/patterns";
import { TEMPLE } from "../shared/indian/palettes";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface ComparisonItem {
  value: string;
  label: string;
}

interface GopuramComparisonProps extends BaseProps {
  /** Left column data */
  left: ComparisonItem;
  /** Right column data */
  right: ComparisonItem;
  /** Optional heading above comparison */
  heading?: string;
  /** Source attribution */
  source?: string;
  /** Animation start frame */
  at?: number;
}

/**
 * Two columns of data/text with TempleGopuram silhouettes flanking each side
 * as architectural framing. DiamondLattice as subtle background texture.
 * For side-by-side comparisons with an Indian temple frame. TEMPLE palette.
 */
export const GopuramComparison: React.FC<GopuramComparisonProps> = ({
  left,
  right,
  heading,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const dividerH = lineGrow(frame, at + 12, 28);

  return (
    <AbsoluteFill style={{ backgroundColor: TEMPLE.offWhite }}>
      {/* Diamond lattice background */}
      <DiamondLattice
        color={TEMPLE.turmeric}
        opacity={0.05}
        rows={10}
        cols={14}
        at={at}
      />

      {/* Left gopuram */}
      <TempleGopuram
        color={TEMPLE.charcoal}
        opacity={0.04}
        at={at}
        style={{ left: -20, bottom: 0 }}
      />

      {/* Right gopuram */}
      <TempleGopuram
        color={TEMPLE.charcoal}
        opacity={0.04}
        at={at + 5}
        style={{ right: -20, bottom: 0, transform: "scaleX(-1)" }}
      />

      {/* Heading */}
      {heading && (
        <div
          style={{
            position: "absolute",
            top: 90,
            left: "50%",
          textAlign: "center",
            zIndex: 2,
            ...reveal(frame, at + 2),
          }}
        >
          <div
            style={{
              fontFamily: sans,
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: P.muted,
            }}
          >
            {heading}
          </div>
          <div
            style={{
              width: `${lineGrow(frame, at + 6, 14)}%`,
              maxWidth: 60,
              height: 2,
              backgroundColor: TEMPLE.vermillion,
              margin: "10px auto 0",
              borderRadius: 1,
            }}
          />
        </div>
      )}

      {/* Center divider */}
      <div
        style={{
          position: "absolute",
          top: "25%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 1,
          height: `${dividerH * 0.5}%`,
          maxHeight: 400,
          backgroundColor: TEMPLE.vermillion,
          opacity: 0.25,
          zIndex: 2,
        }}
      />

      {/* Left column */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          width: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 2,
        }}
      >
        <div style={reveal(frame, at + 8)}>
          <div
            style={{
              fontFamily: serif,
              fontSize: 140,
              lineHeight: 0.9,
              color: TEMPLE.brass,
              textAlign: "center",
              letterSpacing: "-0.04em",
            }}
          >
            {left.value}
          </div>
        </div>
        <div
          style={{
            ...reveal(frame, at + 18),
            fontFamily: sans,
            fontSize: 26,
            color: P.sub,
            marginTop: 20,
            textAlign: "center",
            maxWidth: 340,
            fontWeight: 500,
          }}
        >
          {left.label}
        </div>
      </div>

      {/* Right column */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          right: 0,
          width: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 2,
        }}
      >
        <div style={reveal(frame, at + 14)}>
          <div
            style={{
              fontFamily: serif,
              fontSize: 140,
              lineHeight: 0.9,
              color: TEMPLE.vermillion,
              textAlign: "center",
              letterSpacing: "-0.04em",
            }}
          >
            {right.value}
          </div>
        </div>
        <div
          style={{
            ...reveal(frame, at + 24),
            fontFamily: sans,
            fontSize: 26,
            color: P.sub,
            marginTop: 20,
            textAlign: "center",
            maxWidth: 340,
            fontWeight: 500,
          }}
        >
          {right.label}
        </div>
      </div>

      {/* Source */}
      {source && (
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: 100,
            ...reveal(frame, at + 34),
            fontFamily: sans,
            fontSize: 18,
            letterSpacing: "0.1em",
            color: P.muted,
            textTransform: "uppercase",
            zIndex: 3,
          }}
        >
          Source: {source}
        </div>
      )}
    </AbsoluteFill>
  );
};
