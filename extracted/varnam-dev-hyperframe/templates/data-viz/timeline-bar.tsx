import { AbsoluteFill, useCurrentFrame, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

const ROW_COLORS = [P.light, P.slate, P.sage, P.terracotta];

interface BarRow {
  label: string;
  /** 0–100 bar width percentage */
  value: number;
  /** Optional display value shown at bar end */
  displayValue?: string;
  color?: string;
  category?: string;
}

export interface TimelineBarProps extends BaseProps {
  rows: BarRow[];
  headline?: string;
  source?: string;
  at?: number;
}

/**
 * TimelineBar — Horizontal bars at different time points (Gantt-like).
 * Each row: year/label on left, horizontal bar extending right.
 * Bars spring-animate width, staggered by row. Color varies by category.
 */
export const TimelineBar: React.FC<TimelineBarProps> = ({
  rows,
  headline,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  const maxRows = Math.min(rows.length, 8);
  const rowHeight = 72;
  const rowGap = 20;
  const barMaxWidth = 600;
  const labelWidth = 220;
  const leftMargin = 100;
  const stagger = 8;

  const totalHeight = maxRows * rowHeight + (maxRows - 1) * rowGap;
  const startY = (1920 - totalHeight) / 2 + (headline ? 80 : 0);

  // Build category color map
  const categoryMap = new Map<string, string>();
  let colorIdx = 0;
  rows.slice(0, maxRows).forEach((row) => {
    const cat = row.category || row.label;
    if (!categoryMap.has(cat)) {
      categoryMap.set(cat, ROW_COLORS[colorIdx % ROW_COLORS.length]);
      colorIdx++;
    }
  });

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Headline */}
      {headline && (
        <div
          style={{
            position: "absolute",
            top: startY - 120,
            left: leftMargin,
            right: 100,
            ...reveal(frame, at + 2),
            fontFamily: serif,
            fontSize: 48,
            color: P.text,
            lineHeight: 1.2,
          }}
        >
          {headline}
        </div>
      )}

      {/* Rows */}
      {rows.slice(0, maxRows).map((row, i) => {
        const rowAt = at + 10 + i * stagger;
        const y = startY + i * (rowHeight + rowGap);

        const color =
          row.color ||
          categoryMap.get(row.category || row.label) ||
          P.terracotta;

        // Spring for bar width
        const barF = Math.max(0, frame - rowAt);
        const barSpring = spring({
          frame: barF,
          fps: FPS,
          config: { damping: 18 + i * 0.5, stiffness: 95, mass: 0.9 },
        });
        const barWidth = barSpring * (row.value / 100) * barMaxWidth;

        return (
          <div key={i}>
            {/* Label */}
            <div
              style={{
                position: "absolute",
                top: y,
                left: leftMargin,
                width: labelWidth,
                height: rowHeight,
                display: "flex",
                alignItems: "center",
                ...reveal(frame, rowAt - 4),
              }}
            >
              <div
                style={{
                  fontFamily: sans,
                  fontSize: 26,
                  fontWeight: 700,
                  color: P.text,
                  lineHeight: 1.2,
                }}
              >
                {row.label}
              </div>
            </div>

            {/* Bar track (background) */}
            <div
              style={{
                position: "absolute",
                top: y + (rowHeight - 40) / 2,
                left: leftMargin + labelWidth + 16,
                width: barMaxWidth,
                height: 40,
                backgroundColor: P.light,
                borderRadius: 6,
                opacity: reveal(frame, rowAt - 2).opacity,
                overflow: "hidden",
              }}
            >
              {/* Bar fill */}
              <div
                style={{
                  width: barWidth,
                  height: "100%",
                  backgroundColor: color,
                  borderRadius: 6,
                }}
              />
            </div>

            {/* Value at bar end */}
            {row.displayValue && (
              <div
                style={{
                  position: "absolute",
                  top: y + (rowHeight - 32) / 2,
                  left: leftMargin + labelWidth + 16 + barWidth + 14,
                  ...reveal(frame, rowAt + 6),
                  fontFamily: serif,
                  fontSize: 32,
                  color: P.text,
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                }}
              >
                {row.displayValue}
              </div>
            )}
          </div>
        );
      })}

      {/* Source */}
      {source && (
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: leftMargin,
            ...reveal(frame, at + maxRows * stagger + 20),
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
export const demo = {
  compositionId: "dataviz-timeline-bar",
  props: {
    "rows": [
      {
        "label": "2019",
        "value": 22,
        "displayValue": "22%",
        "category": "Base"
      },
      {
        "label": "2021",
        "value": 58,
        "displayValue": "58%",
        "category": "Growth"
      },
      {
        "label": "2023",
        "value": 84,
        "displayValue": "84%",
        "category": "Scale"
      }
    ],
    "headline": "Revenue timeline",
    "source": "Sample data",
    "at": 15
  },
  durationInFrames: 180,
};
