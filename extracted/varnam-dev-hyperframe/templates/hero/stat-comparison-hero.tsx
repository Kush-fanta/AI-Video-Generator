import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, overshootScale, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface StatComparisonHeroProps extends BaseProps {
  valueA: string;
  valueB: string;
  labelA?: string;
  labelB?: string;
  /** Which side wins: "a" or "b". Winner gets terracotta. */
  winner?: "a" | "b";
  source?: string;
  categoryLabel?: string;
  at?: number;
  palette?: Partial<typeof P>;
}

/**
 * Two big numbers with "vs" between them. Winner in terracotta.
 * Immediate visual comparison. Both numbers punch in with overshoot,
 * "vs" snaps between them.
 */
export const StatComparisonHero: React.FC<StatComparisonHeroProps> = ({
  valueA,
  valueB,
  labelA,
  labelB,
  winner = "b",
  source,
  categoryLabel,
  at = 0,
  palette,
}) => {
  const pal = { ...P, ...palette };
  const frame = useCurrentFrame();
  const scaleA = overshootScale(frame, at + 4);
  const scaleB = overshootScale(frame, at + 10);
  const vsOpacity = interpolate(frame, [at + 7, at + 11], [0, 1], C);

  return (
    <AbsoluteFill style={{ backgroundColor: pal.bg }}>
      {/* Category label */}
      {categoryLabel && (
        <div
          style={{
            position: "absolute",
            top: 80,
            left: 100,
            ...reveal(frame, at + 2),
            fontFamily: sans,
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: pal.muted,
          }}
        >
          {categoryLabel}
        </div>
      )}

      {/* Comparison row */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          right: 0,
          transform: "translateY(-50%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 48,
        }}
      >
        {/* Value A */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              ...reveal(frame, at + 4),
              transform: `scale(${scaleA})`,
            }}
          >
            <div
              style={{
                fontFamily: serif,
                fontSize: 160,
                lineHeight: 0.9,
                color: winner === "a" ? pal.terracotta : pal.text,
                letterSpacing: "-0.04em",
              }}
            >
              {valueA}
            </div>
          </div>
          {labelA && (
            <div
              style={{
                ...reveal(frame, at + 18),
                fontFamily: sans,
                fontSize: 22,
                color: pal.sub,
                marginTop: 16,
                fontWeight: 500,
              }}
            >
              {labelA}
            </div>
          )}
        </div>

        {/* VS */}
        <div
          style={{
            opacity: vsOpacity,
            fontFamily: sans,
            fontSize: 28,
            fontWeight: 700,
            color: pal.muted,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          vs
        </div>

        {/* Value B */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              ...reveal(frame, at + 10),
              transform: `scale(${scaleB})`,
            }}
          >
            <div
              style={{
                fontFamily: serif,
                fontSize: 160,
                lineHeight: 0.9,
                color: winner === "b" ? P.terracotta : P.text,
                letterSpacing: "-0.04em",
              }}
            >
              {valueB}
            </div>
          </div>
          {labelB && (
            <div
              style={{
                ...reveal(frame, at + 22),
                fontFamily: sans,
                fontSize: 22,
                color: pal.sub,
                marginTop: 16,
                fontWeight: 500,
              }}
            >
              {labelB}
            </div>
          )}
        </div>
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
            color: pal.muted,
            textTransform: "uppercase",
          }}
        >
          Source: {source}
        </div>
      )}

      {/* Bottom accent line */}
      <div
        style={{
          position: "absolute",
          bottom: 120,
          left: "50%",
          transform: "translateX(-50%)",
          width: `${lineGrow(frame, at + 20, 24) * 0.25}%`,
          maxWidth: 200,
          height: 2,
          backgroundColor: pal.terracotta,
          opacity: 0.4,
        }}
      />
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "hero-stat-comparison-hero",
  props: { valueA: "$46B", valueB: "$100B", labelA: "2019", labelB: "2024", winner: "b", source: "NASSCOM", categoryLabel: "GCC REVENUE", at: 15 },
  durationInFrames: 180,
};
