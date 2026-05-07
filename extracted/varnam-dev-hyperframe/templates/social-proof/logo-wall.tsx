import { AbsoluteFill, useCurrentFrame, interpolate, interpolateColors, Img } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface LogoItem {
  name: string;
  subtitle?: string;
  highlighted?: boolean;
  /** URL or staticFile path to logo image. Falls back to name text when absent. */
  logoUrl?: string;
}

interface LogoWallProps extends BaseProps {
  logos: LogoItem[];
  categoryLabel?: string;
  source?: string;
  at?: number;
}

/**
 * LogoWall — Grid of company/country name cards with staggered reveal.
 * Highlighted items get terracotta border; others fade to muted opacity.
 * Auto-selects 4x3 or 3x3 grid based on item count.
 */
export const LogoWall: React.FC<LogoWallProps> = ({
  logos,
  categoryLabel,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const cols = logos.length >= 10 ? 4 : 3;
  const rows = Math.ceil(logos.length / cols);
  const stagger = 9;

  // After all cards revealed, dim non-highlighted ones
  const allRevealedAt = at + 20 + logos.length * stagger;
  const highlightPhase = interpolate(
    frame,
    [allRevealedAt, allRevealedAt + 20],
    [0, 1],
    C,
  );

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Category label — top left */}
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

      {/* Terracotta accent line below category */}
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

      {/* Logo grid */}
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
          paddingTop: 40,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            gap: 24,
            width: cols === 4 ? 1400 : 1100,
            maxHeight: 680,
          }}
        >
          {logos.map((logo, i) => {
            const cardAt = at + 12 + i * stagger;
            const isHighlighted = logo.highlighted ?? false;

            // Base reveal
            const baseOpacity = interpolate(
              frame,
              [cardAt, cardAt + 14],
              [0, 1],
              C,
            );

            // Highlight phase: non-highlighted cards dim
            const finalOpacity = isHighlighted
              ? baseOpacity
              : baseOpacity * interpolate(highlightPhase, [0, 1], [1, 0.25], C);

            const borderProg = isHighlighted
              ? interpolate(highlightPhase, [0, 1], [0, 1], C)
              : 0;
            const borderColor = isHighlighted
              ? interpolateColors(borderProg, [0, 1], [P.light, P.terracotta])
              : P.light;

            return (
              <div
                key={i}
                style={{
                  ...reveal(frame, cardAt),
                  opacity: finalOpacity,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: cols === 4 ? 140 : 160,
                  backgroundColor: isHighlighted
                    ? `rgba(193, 122, 72, ${0.06 * highlightPhase})`
                    : "rgba(200, 194, 182, 0.15)",
                  border: `2px solid ${borderColor}`,
                  borderRadius: 12,
                  padding: "20px 28px",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                  {logo.logoUrl ? (
                    <Img
                      src={logo.logoUrl}
                      style={{
                        height: cols === 4 ? 72 : 80,
                        maxWidth: cols === 4 ? 200 : 220,
                        objectFit: "contain",
                        opacity: isHighlighted ? 1 : 0.65,
                      }}
                    />
                  ) : (
                    /* Fallback: text treated as a logo — large, bold */
                    <span
                      style={{
                        fontFamily: sans,
                        fontSize: cols === 4 ? 28 : 32,
                        fontWeight: 800,
                        color: isHighlighted ? P.text : P.sub,
                        letterSpacing: "-0.02em",
                        textAlign: "center",
                        lineHeight: 1.1,
                      }}
                    >
                      {logo.name}
                    </span>
                  )}
                  {logo.subtitle && (
                    <span
                      style={{
                        fontFamily: sans,
                        fontSize: 20,
                        fontWeight: 500,
                        color: isHighlighted ? P.muted : P.light,
                        letterSpacing: "0.04em",
                        textAlign: "center",
                        lineHeight: 1.2,
                        textTransform: "uppercase",
                      }}
                    >
                      {logo.subtitle}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Highlighted count — ghost number, bottom right */}
      <div
        style={{
          position: "absolute",
          right: 80,
          bottom: 100,
          fontFamily: serif,
          fontSize: 180,
          fontWeight: 400,
          color: P.terracotta,
          opacity: interpolate(
            frame,
            [allRevealedAt, allRevealedAt + 18],
            [0, 0.12],
            C,
          ),
          lineHeight: 1,
          letterSpacing: "-0.04em",
        }}
      >
        {logos.filter((l) => l.highlighted).length}
      </div>

      {/* Source — bottom left */}
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
