import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, C, ease } from "../shared/primitives";
import { TEXTILE } from "../shared/indian/palettes";
import { DiamondLattice } from "../shared/indian/patterns";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

/** Textile dye colors for waffle cells */
const CELL_COLORS = [
  TEXTILE.indigo,
  TEXTILE.madder,
  TEXTILE.turmeric,
  TEXTILE.pomegranate,
];

interface SaffronWaffleProps {
  /** Percentage to fill (0-100) */
  percent: number;
  /** Description label */
  label: string;
  /** Optional source */
  source?: string;
  /** Grid dimensions */
  rows?: number;
  cols?: number;
  at?: number;
}

/**
 * SaffronWaffle — Waffle/grid chart using Indian textile dye palette.
 * Indigo, madder, turmeric, pomegranate cells. DiamondLattice overlay.
 * For percentage data visualization.
 */
export const SaffronWaffle: React.FC<SaffronWaffleProps> = ({
  percent,
  label,
  source,
  rows = 10,
  cols = 10,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const total = rows * cols;
  const filledCount = Math.round((percent / 100) * total);

  // Cells fill in with staggered hard snaps
  const fillProgress = interpolate(frame, [at + 10, at + 60], [0, 1], { ...C, easing: ease });

  const getColor = (idx: number): string => {
    // Cycle through textile dye colors by row bands
    const row = Math.floor(idx / cols);
    return CELL_COLORS[row % CELL_COLORS.length];
  };

  return (
    <AbsoluteFill style={{ backgroundColor: TEXTILE.cream }}>
      <DiamondLattice color={TEXTILE.turmeric} opacity={0.06} rows={6} cols={8} at={at} />

      {/* Percentage hero */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 120,
          ...reveal(frame, at + 4),
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 180,
            color: TEXTILE.indigo,
            lineHeight: 0.9,
            letterSpacing: "-0.03em",
          }}
        >
          {percent}%
        </div>
        <div
          style={{
            fontFamily: sans,
            fontSize: 32,
            color: P.sub,
            marginTop: 16,
            maxWidth: 500,
            lineHeight: 1.35,
            ...reveal(frame, at + 14),
          }}
        >
          {label}
        </div>
      </div>

      {/* Waffle grid */}
      <div
        style={{
          position: "absolute",
          right: 100,
          top: "50%",
          transform: "translateY(-50%)",
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 44px)`,
          gridTemplateRows: `repeat(${rows}, 44px)`,
          gap: 4,
        }}
      >
        {Array.from({ length: total }).map((_, idx) => {
          const isFilled = idx < filledCount;
          const cellDelay = idx / total;
          const cellVisible = fillProgress > cellDelay;
          const cellOpacity = cellVisible
            ? interpolate(fillProgress, [cellDelay, Math.min(1, cellDelay + 0.05)], [0, 1], C)
            : 0;

          return (
            <div
              key={idx}
              style={{
                width: 44,
                height: 44,
                borderRadius: 4,
                backgroundColor: isFilled ? getColor(idx) : TEXTILE.khaki + "44",
                opacity: cellOpacity,
              }}
            />
          );
        })}
      </div>

      {/* Source */}
      {source && (
        <div
          style={{
            position: "absolute",
            bottom: 50,
            left: 120,
            ...reveal(frame, at + 50),
            fontFamily: sans,
            fontSize: 18,
            color: P.muted,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Source: {source}
        </div>
      )}
    </AbsoluteFill>
  );
};
