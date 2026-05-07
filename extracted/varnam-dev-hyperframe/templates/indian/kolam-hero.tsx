import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, ease } from "../shared/primitives";
import { KolamGrid } from "../shared/indian/patterns";
import { TEMPLE } from "../shared/indian/palettes";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface KolamHeroProps extends BaseProps {
  /** Main headline */
  title: string;
  /** Optional subtitle below headline */
  subtitle?: string;
  /** Optional category label top-left */
  categoryLabel?: string;
  /** Source attribution */
  source?: string;
  /** Animation start frame */
  at?: number;
}

/**
 * Title card with animated KolamGrid drawing in the bottom-right corner.
 * TEMPLE palette. Vermillion accent line. Large serif headline.
 * The kolam draws while the text reveals with hard snaps.
 */
export const KolamHero: React.FC<KolamHeroProps> = ({
  title,
  subtitle,
  categoryLabel,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const accentW = lineGrow(frame, at + 10, 20);

  return (
    <AbsoluteFill style={{ backgroundColor: TEMPLE.offWhite }}>
      {/* Kolam drawing in bottom-right corner */}
      <KolamGrid
        color={TEMPLE.vermillion}
        opacity={0.18}
        size={520}
        at={at}
        style={{ bottom: -60, right: -60, top: "auto" }}
      />

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
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: P.muted,
            }}
          >
            {categoryLabel}
          </div>
          <div
            style={{
              width: `${lineGrow(frame, at + 5, 12)}%`,
              maxWidth: 48,
              height: 2,
              backgroundColor: TEMPLE.vermillion,
              marginTop: 8,
              borderRadius: 1,
            }}
          />
        </div>
      )}

      {/* Main title block */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "65%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: 100,
          zIndex: 2,
        }}
      >
        <div style={reveal(frame, at + 5)}>
          <div
            style={{
              fontFamily: serif,
              fontSize: 120,
              lineHeight: 0.95,
              color: TEMPLE.charcoal,
              letterSpacing: "-0.03em",
              maxWidth: 680,
            }}
          >
            {title}
          </div>
        </div>

        {/* Vermillion accent line */}
        <div
          style={{
            width: `${accentW}%`,
            maxWidth: 120,
            height: 4,
            backgroundColor: TEMPLE.vermillion,
            marginTop: 32,
            borderRadius: 2,
          }}
        />

        {subtitle && (
          <div
            style={{
              ...reveal(frame, at + 18),
              fontFamily: sans,
              fontSize: 32,
              lineHeight: 1.4,
              color: P.sub,
              marginTop: 24,
              maxWidth: 500,
              fontWeight: 500,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>

      {/* Source */}
      {source && (
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: 100,
            ...reveal(frame, at + 28),
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
