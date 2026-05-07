import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, overshootScale, C } from "../shared/primitives";
import { MUGHAL } from "../shared/indian/palettes";
import { JaliPattern } from "../shared/indian/patterns";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface JaliOverlayStatProps extends BaseProps {
  /** The stat number displayed large */
  value: string;
  /** Label describing the stat */
  label: string;
  /** Optional source attribution */
  source?: string;
  /** Optional category label */
  categoryLabel?: string;
  /** Frame offset */
  at?: number;
}

/**
 * Stat/number hero with JaliPattern overlay at 0.1 opacity. Number in
 * MUGHAL.gold. The lattice IS the visual identity -- it frames the data.
 */
export const JaliOverlayStat: React.FC<JaliOverlayStatProps> = ({
  value,
  label,
  source,
  categoryLabel,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const heroScale = overshootScale(frame, at + 5);

  return (
    <AbsoluteFill style={{ backgroundColor: MUGHAL.onyx }}>
      {/* Jali overlay -- the visual identity */}
      <JaliPattern color={MUGHAL.gold} opacity={0.1} rows={7} cols={10} at={at} />

      {/* Category label */}
      {categoryLabel && (
        <div
          style={{
            position: "absolute",
            top: 80,
            left: 100,
            zIndex: 3,
          }}
        >
          <div
            style={{
              ...reveal(frame, at + 2),
              fontFamily: sans,
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: MUGHAL.gold,
              opacity: 0.6,
            }}
          >
            {categoryLabel}
          </div>
        </div>
      )}

      {/* Main stat */}
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
          paddingLeft: 100,
          zIndex: 2,
        }}
      >
        <div
          style={{
            ...reveal(frame, at + 3),
            transform: `scale(${heroScale})`,
            transformOrigin: "left center",
          }}
        >
          <div
            style={{
              fontFamily: serif,
              fontSize: 260,
              lineHeight: 0.88,
              color: MUGHAL.gold,
              letterSpacing: "-0.04em",
            }}
          >
            {value}
          </div>
        </div>

        {/* Gold accent */}
        <div
          style={{
            width: `${lineGrow(frame, at + 12, 22)}%`,
            maxWidth: 110,
            height: 3,
            backgroundColor: MUGHAL.gold,
            marginTop: 32,
            borderRadius: 2,
          }}
        />

        {/* Label */}
        <div
          style={{
            ...reveal(frame, at + 16),
            fontFamily: sans,
            fontSize: 32,
            lineHeight: 1.4,
            color: MUGHAL.ivory,
            marginTop: 22,
            maxWidth: 500,
            fontWeight: 500,
          }}
        >
          {label}
        </div>
      </div>

      {/* Source */}
      {source && (
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: 100,
            ...reveal(frame, at + 30),
            fontFamily: sans,
            fontSize: 16,
            letterSpacing: "0.1em",
            color: MUGHAL.ivory,
            opacity: 0.4,
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
