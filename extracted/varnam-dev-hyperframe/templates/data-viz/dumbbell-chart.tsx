import { AbsoluteFill, useCurrentFrame, spring, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface DumbbellItem {
  label: string;
  start: number;
  end: number;
}

interface DumbbellChartProps extends BaseProps {
  items: DumbbellItem[];
  startLabel: string;
  endLabel: string;
  title?: string;
  at?: number;
}

/**
 * DumbbellChart — Horizontal dumbbell/connected dot plot.
 * Each row has two dots (before/after or A/B) connected by a line.
 * Dots spring into position. Left dot is slate, right dot is terracotta.
 * The gap between dots tells the story.
 */
export const DumbbellChart: React.FC<DumbbellChartProps> = ({
  items,
  startLabel,
  endLabel,
  title,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  // Layout
  const MARGIN = 80;
  const TOP = title ? 320 : 240;
  const LABEL_W = 260;
  const CHART_LEFT = MARGIN + LABEL_W;
  const CHART_RIGHT = 1080 - MARGIN;
  const CHART_W = CHART_RIGHT - CHART_LEFT;
  const ROW_H = 130;
  const DOT_R = 14;
  const STAGGER = 10;

  // Find global min/max for normalization
  const allValues = items.flatMap((it) => [it.start, it.end]);
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const range = maxVal - minVal || 1;

  // Map value to X position
  const valToX = (val: number) =>
    CHART_LEFT + ((val - minVal) / range) * CHART_W;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Title */}
      {title && (
        <div
          style={{
            ...reveal(frame, at + 2),
            position: "absolute",
            top: 80,
            left: MARGIN,
            right: MARGIN,
            fontFamily: sans,
            fontSize: 42,
            fontWeight: 700,
            letterSpacing: "0.10em",
            textTransform: "uppercase",
            color: P.muted,
            textAlign: "center",
          }}
        >
          {title}
        </div>
      )}

      {/* Legend */}
      <div
        style={{
          ...reveal(frame, at + 4),
          position: "absolute",
          top: TOP - 80,
          left: CHART_LEFT,
          display: "flex",
          gap: 40,
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              backgroundColor: P.slate,
            }}
          />
          <span
            style={{
              fontFamily: sans,
              fontSize: 24,
              fontWeight: 600,
              color: P.sub,
            }}
          >
            {startLabel}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              backgroundColor: P.terracotta,
            }}
          />
          <span
            style={{
              fontFamily: sans,
              fontSize: 24,
              fontWeight: 600,
              color: P.sub,
            }}
          >
            {endLabel}
          </span>
        </div>
      </div>

      {/* Scale ticks */}
      {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
        const x = CHART_LEFT + frac * CHART_W;
        const val = Math.round(minVal + frac * range);
        return (
          <div key={frac}>
            {/* Vertical gridline */}
            <div
              style={{
                position: "absolute",
                top: TOP - 10,
                left: x,
                width: 1,
                height: interpolate(
                  Math.max(0, frame - at - 4),
                  [0, 16],
                  [0, items.length * ROW_H],
                  C,
                ),
                backgroundColor: P.light,
                opacity: 0.3,
              }}
            />
            {/* Tick label */}
            <div
              style={{
                ...reveal(frame, at + 4),
                position: "absolute",
                top: TOP + items.length * ROW_H + 16,
                left: x,
                transform:
                  frac === 1
                    ? "translateX(-100%)"
                    : frac === 0
                    ? "none"
                    : "translateX(-50%)",
                fontFamily: sans,
                fontSize: 20,
                fontWeight: 600,
                color: P.muted,
                letterSpacing: "0.06em",
              }}
            >
              {val}
            </div>
          </div>
        );
      })}

      {/* Dumbbell rows */}
      {items.map((item, i) => {
        const rowAt = at + 10 + i * STAGGER;
        const f = Math.max(0, frame - rowAt);
        const rowY = TOP + i * ROW_H + ROW_H / 2;

        const x1 = valToX(item.start);
        const x2 = valToX(item.end);
        const leftX = Math.min(x1, x2);
        const rightX = Math.max(x1, x2);

        // Connecting line grows
        const lineSp = spring({
          frame: f,
          fps: FPS,
          config: { damping: 14, stiffness: 70, mass: 0.8 },
        });

        // Dots spring in
        const dotSp = spring({
          frame: Math.max(0, f - 4),
          fps: FPS,
          config: { damping: 10, stiffness: 120, mass: 0.7 },
        });

        return (
          <div key={i}>
            {/* Row label */}
            <div
              style={{
                ...reveal(frame, rowAt),
                position: "absolute",
                top: rowY - 18,
                left: MARGIN,
                width: LABEL_W - 20,
                textAlign: "right",
                fontFamily: sans,
                fontSize: 30,
                fontWeight: 600,
                color: P.text,
                lineHeight: 1.2,
              }}
            >
              {item.label}
            </div>

            {/* Connecting line */}
            <div
              style={{
                position: "absolute",
                top: rowY - 2,
                left: leftX,
                width: (rightX - leftX) * lineSp,
                height: 4,
                backgroundColor: P.light,
                borderRadius: 2,
                opacity: f > 0 ? 1 : 0,
              }}
            />

            {/* Start dot — slate */}
            <div
              style={{
                position: "absolute",
                top: rowY - DOT_R * dotSp,
                left: x1 - DOT_R * dotSp,
                width: DOT_R * 2 * dotSp,
                height: DOT_R * 2 * dotSp,
                borderRadius: "50%",
                backgroundColor: P.slate,
                opacity: f > 4 ? 1 : 0,
              }}
            />

            {/* End dot — terracotta */}
            <div
              style={{
                position: "absolute",
                top: rowY - DOT_R * dotSp,
                left: x2 - DOT_R * dotSp,
                width: DOT_R * 2 * dotSp,
                height: DOT_R * 2 * dotSp,
                borderRadius: "50%",
                backgroundColor: P.terracotta,
                opacity: f > 4 ? 1 : 0,
              }}
            />

            {/* Start value */}
            {f > 10 && (
              <div
                style={{
                  ...reveal(frame, rowAt + 10),
                  position: "absolute",
                  top: rowY - DOT_R - 32,
                  left: x1,
                  transform: "translateX(-50%)",
                  fontFamily: serif,
                  fontSize: 28,
                  color: P.slate,
                  whiteSpace: "nowrap",
                }}
              >
                {item.start}
              </div>
            )}

            {/* End value */}
            {f > 10 && (
              <div
                style={{
                  ...reveal(frame, rowAt + 10),
                  position: "absolute",
                  top: rowY + DOT_R + 6,
                  left: x2,
                  transform: "translateX(-50%)",
                  fontFamily: serif,
                  fontSize: 28,
                  color: P.terracotta,
                  whiteSpace: "nowrap",
                }}
              >
                {item.end}
              </div>
            )}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "dataviz-dumbbell-chart",
  props: {
    items: [{ label: "Revenue ($B)", start: 30, end: 100 }, { label: "Headcount (K)", start: 800, end: 2000 }],
    startLabel: "2015",
    endLabel: "2024",
    title: "GCC Growth",
    at: 15,
  },
  durationInFrames: 180,
};
