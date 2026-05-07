import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { reveal, lineGrow, C } from "../shared/primitives";
import type { IdentityPack, DataVizTokens } from "../shared/identity/types";
import { resolveIdentity, resolveDataVizTokens } from "../shared/identity/resolve";

export interface WaffleGridProps {
  identity?: IdentityPack;
  preset?: string;
  tokens?: Partial<DataVizTokens>;
  /** Percentage to fill (0–100) */
  percent: number;
  label: string;
  /** Color for filled cells — defaults to terracotta */
  fillColor?: string;
  source?: string;
  at?: number;
}

/**
 * WaffleGrid — 10x10 grid of squares, filled cells = percentage.
 * Fills with staggered snap — each cell pops in hard, no fade.
 * Category colors. The grid IS the data.
 */
export const WaffleGrid: React.FC<WaffleGridProps> = ({
  percent,
  label,
  fillColor,
  source,
  at = 0,
  identity,
  preset = "default",
  tokens,
}) => {
  const resolvedIdentity = resolveIdentity(identity);
  const resolvedTokens = resolveDataVizTokens(resolvedIdentity, preset, tokens);
  const resolvedFillColor = fillColor ?? resolvedIdentity.colors.accentPrimary;
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  const filledCount = Math.round(percent);
  const { typography, colors, motion, spacing } = resolvedIdentity;
  const {
    layoutInsetX,
    panelGap,
    waffleCellSize,
    waffleGap,
    numberSize,
    numberLetterSpacingEm,
    labelSize,
    sourceSize,
    accentLineMaxWidth,
    accentLineHeight,
  } = resolvedTokens;
  const accentWidth = lineGrow(frame, at + 50, motion.lineGrowDuration);
  const numberTypography = typography.number;
  const labelTypography = typography.subtitle;
  const sourceTypography = typography.meta;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.canvas }}>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: layoutInsetX,
          transform: "translateY(-50%)",
          display: "flex",
          gap: panelGap,
          alignItems: "center",
        }}
      >
        {/* Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(10, ${waffleCellSize}px)`,
            gap: waffleGap,
          }}
        >
          {Array.from({ length: 100 }, (_, i) => {
            const row = Math.floor(i / 10);
            const col = i % 10;
            // Fill bottom-left to top-right
            const fillIndex = (9 - row) * 10 + col;
            const isFilled = fillIndex < filledCount;
            // Staggered snap: each cell appears 0.5 frames apart
            const cellAt = 8 + fillIndex * 0.5;
            const visible = f >= cellAt;
            const cellOpacity = isFilled
              ? visible ? 1 : 0
              : interpolate(f, [4, 6], [0, 1], C);

            return (
              <div
                key={i}
                style={{
                  width: waffleCellSize,
                  height: waffleCellSize,
                  borderRadius: spacing.radiusSm,
                  backgroundColor: isFilled
                    ? visible
                      ? resolvedFillColor
                      : colors.surface
                    : colors.surface,
                  opacity: cellOpacity,
                  transform: isFilled && visible ? "scale(1)" : isFilled ? "scale(0)" : "scale(1)",
                }}
              />
            );
          })}
        </div>

        {/* Right panel: number + label */}
        <div style={{ maxWidth: 500 }}>
          <div
            style={{
              ...reveal(frame, at + 30),
              fontFamily: numberTypography.family,
              fontSize: numberTypography.size || numberSize,
              lineHeight: numberTypography.lineHeight || 0.9,
              color: colors.textPrimary,
              letterSpacing: `${numberTypography.letterSpacingEm ?? numberLetterSpacingEm}em`,
              fontWeight: numberTypography.weight,
            }}
          >
            {percent}%
          </div>

          {/* Accent line */}
          <div
            style={{
              width: `${accentWidth}%`,
              maxWidth: accentLineMaxWidth,
              height: accentLineHeight,
              backgroundColor: resolvedFillColor,
              marginTop: 24,
              borderRadius: 2,
            }}
          />

          <div
            style={{
              ...reveal(frame, at + 40),
              fontFamily: labelTypography.family,
              fontSize: labelTypography.size || labelSize,
              color: colors.textSecondary,
              lineHeight: labelTypography.lineHeight,
              marginTop: 20,
              fontWeight: labelTypography.weight,
              letterSpacing:
                labelTypography.letterSpacingEm !== undefined
                  ? `${labelTypography.letterSpacingEm}em`
                  : undefined,
            }}
          >
            {label}
          </div>

          {source && (
            <div
              style={{
                ...reveal(frame, at + 50),
                fontFamily: sourceTypography.family,
                fontSize: sourceTypography.size || sourceSize,
                fontWeight: sourceTypography.weight,
                letterSpacing:
                  sourceTypography.letterSpacingEm !== undefined
                    ? `${sourceTypography.letterSpacingEm}em`
                    : undefined,
                color: colors.textMuted,
                marginTop: 36,
                lineHeight: sourceTypography.lineHeight,
                textTransform: sourceTypography.textTransform,
              }}
            >
              Source: {source}
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
export const demo = {
  compositionId: "dataviz-waffle-grid",
  props: {
    "percent": 37,
    "label": "Market coverage",
    "source": "Sample data",
    "at": 15
  },
  durationInFrames: 180,
};
