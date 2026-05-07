import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface SplitArgumentProps extends BaseProps {
  leftHeader: string;
  leftPoints: string[];
  rightHeader: string;
  rightPoints: string[];
  accentSide?: "left" | "right";
  at?: number;
}

/**
 * Two-column comparison. Left and right headers in serif, points in sans.
 * Thin vertical divider between columns. One side accented in terracotta.
 * Staggered point reveals.
 */
export const SplitArgument: React.FC<SplitArgumentProps> = ({
  leftHeader,
  leftPoints,
  rightHeader,
  rightPoints,
  accentSide = "right",
  at = 0,
}) => {
  const frame = useCurrentFrame();

  const dividerH = lineGrow(frame, at + 10, 30);

  const renderColumn = (
    header: string,
    points: string[],
    isAccent: boolean,
    baseAt: number,
  ) => (
    <div style={{ flex: 1 }}>
      {/* Header */}
      <div
        style={{
          ...reveal(frame, baseAt),
          fontFamily: serif,
          fontSize: 40,
          color: isAccent ? P.terracotta : P.text,
          marginBottom: 40,
          lineHeight: 1.3,
          letterSpacing: "-0.01em",
        }}
      >
        {header}
      </div>

      {/* Points */}
      {points.map((pt, i) => (
        <div
          key={i}
          style={{
            ...reveal(frame, baseAt + 14 + i * 16),
            display: "flex",
            alignItems: "flex-start",
            gap: 14,
            marginBottom: 28,
          }}
        >
          <span
            style={{
              fontFamily: sans,
              fontSize: 18,
              color: isAccent ? P.terracotta : P.muted,
              marginTop: 8,
            }}
          >
            {"\u25CF"}
          </span>
          <span
            style={{
              fontFamily: sans,
              fontSize: 34,
              fontWeight: 500,
              color: isAccent ? P.text : P.sub,
              lineHeight: 1.4,
            }}
          >
            {pt}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          paddingLeft: 80,
          paddingRight: 80,
          gap: 0,
        }}
      >
        {/* Left column */}
        <div style={{ flex: 1, paddingRight: 36 }}>
          {renderColumn(leftHeader, leftPoints, accentSide === "left", at + 4)}
        </div>

        {/* Vertical divider */}
        <div
          style={{
            width: 2,
            height: `${dividerH * 0.45}%`,
            maxHeight: 520,
            backgroundColor: P.light,
            borderRadius: 1,
            flexShrink: 0,
          }}
        />

        {/* Right column */}
        <div style={{ flex: 1, paddingLeft: 36 }}>
          {renderColumn(rightHeader, rightPoints, accentSide === "right", at + 12)}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "narr-split-argument",
  props: {
    leftHeader: "What we thought",
    leftPoints: [
      "More options help.",
      "More motion feels premium."
    ],
    rightHeader: "What worked",
    rightPoints: [
      "One strong frame wins.",
      "Motion needs a reason."
    ],
    accentSide: "right"
  },
  durationInFrames: 180,
};
