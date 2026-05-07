import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, overshootScale, lineGrow, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface IconArrayProps extends BaseProps {
  /** How many to highlight */
  highlighted: number;
  /** Total count in the grid */
  total: number;
  label: string;
  /** e.g. "3 out of 10" */
  ratioText?: string;
  highlightColor?: string;
  source?: string;
  at?: number;
}

/**
 * IconArray — Grid of small circles where a subset lights up (colored)
 * to show a ratio. "3 out of 10" visualized. Each highlighted circle
 * snaps on with stagger — hard pop, no crossfade.
 */
export const IconArray: React.FC<IconArrayProps> = ({
  highlighted,
  total,
  label,
  ratioText,
  highlightColor = P.terracotta,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  const COLS = Math.min(total, 10);
  const ROWS = Math.ceil(total / COLS);
  const DOT_SIZE = 40;
  const GAP = 14;
  const accentWidth = lineGrow(frame, at + 40, 25);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 160,
          transform: "translateY(-50%)",
          display: "flex",
          gap: 120,
          alignItems: "center",
        }}
      >
        {/* Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${COLS}, ${DOT_SIZE}px)`,
            gap: GAP,
            ...reveal(frame, at + 4),
          }}
        >
          {Array.from({ length: total }, (_, i) => {
            const isHighlighted = i < highlighted;
            const dotAt = isHighlighted ? 10 + i * 2 : 6;
            const popped = f >= dotAt;

            return (
              <div
                key={i}
                style={{
                  width: DOT_SIZE,
                  height: DOT_SIZE,
                  borderRadius: "50%",
                  backgroundColor: isHighlighted && popped ? highlightColor : P.light,
                  transform: isHighlighted && popped ? "scale(1)" : isHighlighted ? "scale(0)" : "scale(1)",
                  opacity: isHighlighted ? (popped ? 1 : 0) : interpolate(f, [4, 6], [0, 0.6], C),
                }}
              />
            );
          })}
        </div>

        {/* Right panel */}
        <div style={{ maxWidth: 500 }}>
          {/* Ratio text */}
          {ratioText && (
            <div
              style={{
                ...reveal(frame, at + 20),
                fontFamily: serif,
                fontSize: 120,
                lineHeight: 0.9,
                color: P.text,
                letterSpacing: "-0.03em",
                transform: `scale(${overshootScale(frame, at + 22)})`,
                transformOrigin: "left bottom",
              }}
            >
              {ratioText}
            </div>
          )}

          {/* Accent */}
          <div
            style={{
              width: `${accentWidth}%`,
              maxWidth: 180,
              height: 4,
              backgroundColor: highlightColor,
              marginTop: 24,
              borderRadius: 2,
            }}
          />

          <div
            style={{
              ...reveal(frame, at + 32),
              fontFamily: sans,
              fontSize: 32,
              color: P.sub,
              marginTop: 20,
              lineHeight: 1.35,
            }}
          >
            {label}
          </div>

          {source && (
            <div
              style={{
                ...reveal(frame, at + 44),
                fontFamily: sans,
                fontSize: 20,
                fontWeight: 500,
                letterSpacing: "0.08em",
                color: P.muted,
                marginTop: 36,
                textTransform: "uppercase",
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
  compositionId: "dataviz-icon-array",
  props: {
    "highlighted": 14,
    "total": 20,
    "label": "Segments covered",
    "ratioText": "14 of 20",
    "source": "Sample data",
    "at": 15
  },
  durationInFrames: 180,
};
