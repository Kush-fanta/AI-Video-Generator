import { AbsoluteFill, useCurrentFrame, interpolate, Img, staticFile } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface CountryItem {
  code: string;
  name: string;
  highlighted?: boolean;
  /**
   * Optional path to a flag image (PNG/SVG) via staticFile.
   * When provided, renders as an <Img> — reliable in all Remotion environments.
   * When absent, renders a large emoji flag as fallback.
   * Recommended: use images for production renders (emoji flags may not render
   * on headless Linux/Chrome). Source: flagcdn.com, countryflags.io, or local public/.
   */
  flagUrl?: string;
}

interface FlagGridProps extends BaseProps {
  countries: CountryItem[];
  categoryLabel?: string;
  source?: string;
  at?: number;
}

/**
 * FlagGrid — Country flags as emoji in a grid.
 * Highlighted countries stay vivid; muted ones go grayscale + low opacity.
 * Staggered reveal. Good for 'G7 nations', 'BRICS members', etc.
 */

/** Convert ISO 3166-1 alpha-2 country code to regional indicator emoji flag */
const getFlagEmoji = (code: string): string => {
  const base = 0x1f1e6;
  return String.fromCodePoint(
    base + (code.toUpperCase().charCodeAt(0) - 65),
    base + (code.toUpperCase().charCodeAt(1) - 65),
  );
};

export const FlagGrid: React.FC<FlagGridProps> = ({
  countries,
  categoryLabel,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const cols = countries.length > 9 ? 4 : 3;
  const rows = Math.ceil(countries.length / cols);
  const stagger = 5;

  // After all flags revealed, highlight phase begins
  const allRevealedAt = at + 16 + countries.length * stagger;
  const highlightPhase = interpolate(
    frame,
    [allRevealedAt, allRevealedAt + 20],
    [0, 1],
    C,
  );

  const highlightedCount = countries.filter((c) => c.highlighted).length;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Category label */}
      {categoryLabel && (
        <div
          style={{
            position: "absolute",
            top: 72,
            left: 100,
            ...reveal(frame, at),
            fontFamily: sans,
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: P.muted,
          }}
        >
          {categoryLabel}
        </div>
      )}

      {/* Accent line */}
      <div
        style={{
          position: "absolute",
          top: 100,
          left: 100,
          width: `${lineGrow(frame, at + 4, 22)}%`,
          maxWidth: 48,
          height: 3,
          backgroundColor: P.terracotta,
          borderRadius: 2,
        }}
      />

      {/* Flag grid */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 30,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            gap: 24,
            width: cols === 4 ? 1400 : 1100,
            maxHeight: 760,
          }}
        >
          {countries.map((country, i) => {
            const cardAt = at + 16 + i * stagger;
            const isHighlighted = country.highlighted ?? false;

            const baseOpacity = interpolate(
              frame,
              [cardAt, cardAt + 12],
              [0, 1],
              C,
            );

            // Muted flags go grayscale during highlight phase
            const grayAmount = isHighlighted
              ? 0
              : interpolate(highlightPhase, [0, 1], [0, 1], C);

            const dimAmount = isHighlighted
              ? 1
              : interpolate(highlightPhase, [0, 1], [1, 0.35], C);

            return (
              <div
                key={i}
                style={{
                  ...reveal(frame, cardAt),
                  opacity: baseOpacity * dimAmount,
                  filter: `grayscale(${grayAmount})`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                  padding: "20px 12px",
                  borderRadius: 10,
                  border: isHighlighted
                    ? `2px solid ${P.terracotta}`
                    : "2px solid rgba(200, 194, 182, 0.3)",
                  backgroundColor: isHighlighted
                    ? `rgba(193, 122, 72, ${0.06 * highlightPhase})`
                    : "rgba(200, 194, 182, 0.08)",
                }}
              >
                {/* Flag: image if provided (reliable), emoji as fallback */}
                {country.flagUrl ? (
                  <Img
                    src={staticFile(country.flagUrl)}
                    style={{
                      width: cols === 4 ? 100 : 120,
                      height: cols === 4 ? 66 : 80,
                      objectFit: "cover",
                      borderRadius: 4,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                      opacity: isHighlighted ? 1 : 0.7,
                    }}
                  />
                ) : (
                  /* Emoji flag fallback — 100px ensures visibility even if partial rendering */
                  <div style={{
                    fontSize: cols === 4 ? 88 : 100,
                    lineHeight: 1,
                    filter: isHighlighted ? "none" : "saturate(0.6)",
                  }}>
                    {getFlagEmoji(country.code)}
                  </div>
                )}

                {/* Country name — 40px minimum */}
                <div
                  style={{
                    fontFamily: sans,
                    fontSize: cols === 4 ? 20 : 22,
                    fontWeight: 600,
                    color: isHighlighted ? P.text : P.sub,
                    textAlign: "center",
                    lineHeight: 1.2,
                    marginTop: 4,
                  }}
                >
                  {country.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Highlighted count ghost */}
      <div
        style={{
          position: "absolute",
          right: 80,
          bottom: 90,
          fontFamily: serif,
          fontSize: 180,
          fontWeight: 400,
          color: P.terracotta,
          opacity: interpolate(
            frame,
            [allRevealedAt, allRevealedAt + 18],
            [0, 0.06],
            C,
          ),
          lineHeight: 1,
          letterSpacing: "-0.04em",
        }}
      >
        {highlightedCount}
      </div>

      {/* Source */}
      {source && (
        <div
          style={{
            position: "absolute",
            bottom: 48,
            left: 100,
            ...reveal(frame, allRevealedAt + 8),
            fontFamily: sans,
            fontSize: 20,
            fontWeight: 500,
            letterSpacing: "0.08em",
            color: P.muted,
            textTransform: "uppercase",
          }}
        >
          Source: {source}
        </div>
      )}
    </AbsoluteFill>
  );
};
