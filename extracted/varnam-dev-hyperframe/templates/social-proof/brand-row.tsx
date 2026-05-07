import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface BrandRowProps extends BaseProps {
  /** Header text e.g. "Featured in" or "Trusted by" */
  header?: string;
  /** List of brand names */
  brands: string[];
  /** Optional source attribution */
  source?: string;
  /** Frame offset */
  at?: number;
}

/**
 * BrandRow — Clean social-proof grid of brand names (text only, no logos).
 * Left-aligned editorial layout. Header top-left with terracotta accent.
 * Brand names in a 2-column grid, staggered reveals, muted color.
 * Understated authority — the names speak for themselves.
 */
export const BrandRow: React.FC<BrandRowProps> = ({
  header = "Featured in",
  brands,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  const MARGIN = 100;
  const stagger = 6;
  const items = brands.slice(0, 10);

  // Split into two columns
  const mid = Math.ceil(items.length / 2);
  const col1 = items.slice(0, mid);
  const col2 = items.slice(mid);

  // Header reveal
  const headerReveal = reveal(frame, at);

  // Accent line below header
  const accentWidth = lineGrow(frame, at + 6, 20);

  // Divider line between header and brands
  const dividerOpacity = interpolate(frame, [at + 12, at + 24], [0, 1], C);

  const renderBrand = (name: string, i: number, colOffset: number) => {
    const entryAt = at + 20 + (colOffset + i) * stagger;
    const opacity = interpolate(frame, [entryAt, entryAt + 14], [0, 1], C);
    const translateY = interpolate(frame, [entryAt, entryAt + 14], [18, 0], {
      ...C,
      easing: ease,
    });

    return (
      <div
        key={`${colOffset}-${i}`}
        style={{
          opacity,
          transform: `translateY(${translateY}px)`,
          fontFamily: sans,
          fontSize: 44,
          fontWeight: 400,
          color: P.sub,
          lineHeight: 1,
          paddingTop: 36,
          paddingBottom: 36,
          borderBottom: `1px solid ${P.light}`,
          letterSpacing: "-0.01em",
        }}
      >
        {name}
      </div>
    );
  };

  // Source reveal
  const sourceAt = at + 20 + items.length * stagger + 10;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Header */}
      <div
        style={{
          position: "absolute",
          top: 260,
          left: MARGIN,
          ...headerReveal,
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 72,
            fontWeight: 400,
            fontStyle: "italic",
            color: P.text,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          {header}
        </div>
      </div>

      {/* Terracotta accent line */}
      <div
        style={{
          position: "absolute",
          top: 352,
          left: MARGIN,
          width: `${accentWidth}%`,
          maxWidth: 56,
          height: 3,
          backgroundColor: P.terracotta,
          borderRadius: 2,
        }}
      />

      {/* Full-width divider */}
      <div
        style={{
          position: "absolute",
          top: 400,
          left: MARGIN,
          right: MARGIN,
          height: 1,
          backgroundColor: P.light,
          opacity: dividerOpacity,
        }}
      />

      {/* Two-column brand grid */}
      <div
        style={{
          position: "absolute",
          top: 440,
          left: MARGIN,
          right: MARGIN,
          display: "flex",
          flexDirection: "row",
          gap: 60,
        }}
      >
        {/* Column 1 */}
        <div style={{ flex: 1 }}>
          {col1.map((name, i) => renderBrand(name, i, 0))}
        </div>

        {/* Vertical separator */}
        <div
          style={{
            width: 1,
            backgroundColor: P.light,
            opacity: dividerOpacity,
            alignSelf: "stretch",
          }}
        />

        {/* Column 2 */}
        <div style={{ flex: 1 }}>
          {col2.map((name, i) => renderBrand(name, i, mid))}
        </div>
      </div>

      {/* Source attribution */}
      {source && (
        <div
          style={{
            position: "absolute",
            bottom: 100,
            left: MARGIN,
            ...reveal(frame, sourceAt),
            fontFamily: sans,
            fontSize: 24,
            fontWeight: 500,
            color: P.muted,
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
