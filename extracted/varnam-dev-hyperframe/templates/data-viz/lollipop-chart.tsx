import { AbsoluteFill, useCurrentFrame, spring, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface LollipopItem {
  label: string;
  value: number;
}

interface LollipopChartProps extends BaseProps {
  items: LollipopItem[];
  title?: string;
  source?: string;
  at?: number;
}

/**
 * LollipopChart — Horizontal lollipop chart.
 * Thin lines extending from left with circles at the end.
 * Circles spring into position. Labels on left axis. Lines grow left to right.
 * 5-8 items, sorted by value descending.
 */
export const LollipopChart: React.FC<LollipopChartProps> = ({
  items,
  title,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  // Sort items by value descending
  const sorted = [...items].sort((a, b) => b.value - a.value);
  const maxVal = Math.max(...sorted.map((it) => it.value), 1);

  // Layout
  const MARGIN = 80;
  const TOP = title ? 280 : 200;
  const LABEL_W = 280;
  const CHART_LEFT = MARGIN + LABEL_W;
  const CHART_RIGHT = 1080 - MARGIN;
  const CHART_W = CHART_RIGHT - CHART_LEFT;
  const ROW_H = 120;
  const DOT_R = 16;
  const STAGGER = 8;

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
          }}
        >
          {title}
        </div>
      )}

      {/* Axis baseline */}
      <div
        style={{
          position: "absolute",
          top: TOP - 20,
          left: CHART_LEFT,
          width: interpolate(Math.max(0, frame - at - 4), [0, 20], [0, CHART_W], C),
          height: 1,
          backgroundColor: P.light,
        }}
      />

      {/* Scale ticks at top */}
      {[0, 25, 50, 75, 100].map((tick) => {
        const x = CHART_LEFT + (tick / 100) * CHART_W;
        return (
          <div
            key={tick}
            style={{
              ...reveal(frame, at + 4),
              position: "absolute",
              top: TOP - 48,
              left: x,
              transform: tick === 100 ? "translateX(-100%)" : tick === 0 ? "none" : "translateX(-50%)",
              fontFamily: sans,
              fontSize: 20,
              fontWeight: 600,
              color: P.muted,
              letterSpacing: "0.06em",
            }}
          >
            {tick}
          </div>
        );
      })}

      {/* Lollipop rows */}
      {sorted.map((item, i) => {
        const rowAt = at + 10 + i * STAGGER;
        const f = Math.max(0, frame - rowAt);
        const rowY = TOP + i * ROW_H + ROW_H / 2;

        // Line grows from left to right
        const lineProgress = spring({
          frame: f,
          fps: FPS,
          config: { damping: 14, stiffness: 70, mass: 0.8 },
        });

        const normalizedVal = (item.value / maxVal) * 100;
        const lineEnd = CHART_LEFT + (normalizedVal / 100) * CHART_W * lineProgress;

        // Dot springs into position with slight delay
        const dotSp = spring({
          frame: Math.max(0, f - 6),
          fps: FPS,
          config: { damping: 10, stiffness: 120, mass: 0.7 },
        });

        const dotX = CHART_LEFT + (normalizedVal / 100) * CHART_W;
        const dotActualX = CHART_LEFT + (dotX - CHART_LEFT) * dotSp;

        // Grid line — subtle
        const gridOpacity = interpolate(f, [0, 8], [0, 0.12], C);

        return (
          <div key={i}>
            {/* Horizontal grid line */}
            <div
              style={{
                position: "absolute",
                top: rowY,
                left: CHART_LEFT,
                width: CHART_W,
                height: 1,
                backgroundColor: P.light,
                opacity: gridOpacity,
              }}
            />

            {/* Label */}
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

            {/* Stick line */}
            <div
              style={{
                position: "absolute",
                top: rowY - 1.5,
                left: CHART_LEFT,
                width: Math.max(0, lineEnd - CHART_LEFT),
                height: 3,
                backgroundColor: P.light,
                borderRadius: 1.5,
                opacity: f > 0 ? 1 : 0,
              }}
            />

            {/* Lollipop dot */}
            <div
              style={{
                position: "absolute",
                top: rowY - DOT_R * dotSp,
                left: dotActualX - DOT_R * dotSp,
                width: DOT_R * 2 * dotSp,
                height: DOT_R * 2 * dotSp,
                borderRadius: "50%",
                backgroundColor: i === 0 ? P.terracotta : P.slate,
                opacity: f > 6 ? 1 : 0,
              }}
            />

            {/* Value label — next to dot */}
            {f > 12 && (
              <div
                style={{
                  ...reveal(frame, rowAt + 12),
                  position: "absolute",
                  top: rowY - 20,
                  left: dotActualX + DOT_R + 12,
                  fontFamily: serif,
                  fontSize: 40,
                  color: P.text,
                  whiteSpace: "nowrap",
                }}
              >
                {item.value}
              </div>
            )}
          </div>
        );
      })}

      {/* Source */}
      {source && (
        <div
          style={{
            ...reveal(frame, at + 10 + sorted.length * STAGGER + 15),
            position: "absolute",
            bottom: 60,
            left: MARGIN,
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
  compositionId: "dataviz-lollipop-chart",
  props: {
    items: [{ label: "Bangalore", value: 500 }, { label: "Hyderabad", value: 300 }, { label: "Pune", value: 200 }, { label: "Chennai", value: 150 }],
    title: "GCCs by City",
    at: 15,
  },
  durationInFrames: 180,
};
