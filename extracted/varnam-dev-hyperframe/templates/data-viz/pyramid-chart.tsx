import { AbsoluteFill, useCurrentFrame, spring, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface PyramidItem {
  label: string;
  left: number;
  right: number;
}

interface PyramidChartProps extends BaseProps {
  items: PyramidItem[];
  leftLabel: string;
  rightLabel: string;
  title?: string;
  at?: number;
}

/**
 * PyramidChart — Population pyramid / distribution chart.
 * Horizontal bars extending left and right from a center axis.
 * Left bars in sage, right bars in terracotta. Labels on center axis.
 * Bars spring outward from center. Classic demographic visualization.
 */
export const PyramidChart: React.FC<PyramidChartProps> = ({
  items,
  leftLabel,
  rightLabel,
  title,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  // Layout
  const MARGIN = 80;
  const TOP = title ? 320 : 240;
  const CENTER_X = 540; // center of 1080
  const LABEL_W = 140;
  const BAR_MAX_W = CENTER_X - MARGIN - LABEL_W - 20;
  const BAR_H = 44;
  const ROW_GAP = 16;
  const ROW_H = BAR_H + ROW_GAP;
  const STAGGER = 6;

  // Find max for normalization
  const allValues = items.flatMap((it) => [it.left, it.right]);
  const maxVal = Math.max(...allValues, 1);

  // Center axis grow animation
  const axisH = items.length * ROW_H;
  const axisGrow = interpolate(f, [2, 16], [0, axisH], C);

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

      {/* Column headers */}
      <div
        style={{
          ...reveal(frame, at + 4),
          position: "absolute",
          top: TOP - 80,
          left: MARGIN,
          width: CENTER_X - MARGIN - 10,
          textAlign: "center",
          fontFamily: sans,
          fontSize: 32,
          fontWeight: 700,
          color: P.sage,
          letterSpacing: "0.06em",
        }}
      >
        {leftLabel}
      </div>
      <div
        style={{
          ...reveal(frame, at + 4),
          position: "absolute",
          top: TOP - 80,
          left: CENTER_X + 10,
          width: CENTER_X - MARGIN - 10,
          textAlign: "center",
          fontFamily: sans,
          fontSize: 32,
          fontWeight: 700,
          color: P.terracotta,
          letterSpacing: "0.06em",
        }}
      >
        {rightLabel}
      </div>

      {/* Center axis */}
      <div
        style={{
          position: "absolute",
          top: TOP,
          left: CENTER_X - 1,
          width: 2,
          height: axisGrow,
          backgroundColor: P.text,
          opacity: 0.3,
        }}
      />

      {/* Rows */}
      {items.map((item, i) => {
        const rowAt = at + 10 + i * STAGGER;
        const rowF = Math.max(0, frame - rowAt);
        const rowY = TOP + i * ROW_H;

        // Left bar springs from center to left
        const leftSp = spring({
          frame: rowF,
          fps: FPS,
          config: { damping: 14, stiffness: 80, mass: 0.8 },
        });

        // Right bar springs from center to right
        const rightSp = spring({
          frame: Math.max(0, rowF - 2),
          fps: FPS,
          config: { damping: 14, stiffness: 80, mass: 0.8 },
        });

        const leftBarW = (item.left / maxVal) * BAR_MAX_W * leftSp;
        const rightBarW = (item.right / maxVal) * BAR_MAX_W * rightSp;

        return (
          <div key={i}>
            {/* Left bar — grows rightward toward center, visually extends left */}
            <div
              style={{
                position: "absolute",
                top: rowY,
                right: 1080 - CENTER_X + LABEL_W / 2 + 10,
                width: leftBarW,
                height: BAR_H,
                backgroundColor: P.sage,
                borderRadius: "6px 0 0 6px",
                opacity: rowF > 0 ? 1 : 0,
              }}
            />

            {/* Right bar — grows from center to right */}
            <div
              style={{
                position: "absolute",
                top: rowY,
                left: CENTER_X + LABEL_W / 2 + 10,
                width: rightBarW,
                height: BAR_H,
                backgroundColor: P.terracotta,
                borderRadius: "0 6px 6px 0",
                opacity: rowF > 0 ? 1 : 0,
              }}
            />

            {/* Center label */}
            <div
              style={{
                ...reveal(frame, rowAt + 2),
                position: "absolute",
                top: rowY + (BAR_H - 30) / 2,
                left: CENTER_X - LABEL_W / 2,
                width: LABEL_W,
                textAlign: "center",
                fontFamily: sans,
                fontSize: 24,
                fontWeight: 600,
                color: P.text,
                lineHeight: 1.2,
              }}
            >
              {item.label}
            </div>

            {/* Left value */}
            {rowF > 10 && (
              <div
                style={{
                  ...reveal(frame, rowAt + 10),
                  position: "absolute",
                  top: rowY + (BAR_H - 28) / 2,
                  right: 1080 - CENTER_X + LABEL_W / 2 + leftBarW + 20,
                  fontFamily: serif,
                  fontSize: 28,
                  color: P.sage,
                  whiteSpace: "nowrap",
                }}
              >
                {item.left}
              </div>
            )}

            {/* Right value */}
            {rowF > 10 && (
              <div
                style={{
                  ...reveal(frame, rowAt + 10),
                  position: "absolute",
                  top: rowY + (BAR_H - 28) / 2,
                  left: CENTER_X + LABEL_W / 2 + rightBarW + 20,
                  fontFamily: serif,
                  fontSize: 28,
                  color: P.terracotta,
                  whiteSpace: "nowrap",
                }}
              >
                {item.right}
              </div>
            )}
          </div>
        );
      })}

      {/* Scale reference */}
      <div
        style={{
          ...reveal(frame, at + 10 + items.length * STAGGER + 10),
          position: "absolute",
          top: TOP + items.length * ROW_H + 30,
          left: MARGIN,
          right: MARGIN,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontSize: 20,
            fontWeight: 600,
            color: P.muted,
            letterSpacing: "0.06em",
          }}
        >
          {maxVal}
        </div>
        <div
          style={{
            fontFamily: sans,
            fontSize: 20,
            fontWeight: 600,
            color: P.muted,
            letterSpacing: "0.06em",
          }}
        >
          0
        </div>
        <div
          style={{
            fontFamily: sans,
            fontSize: 20,
            fontWeight: 600,
            color: P.muted,
            letterSpacing: "0.06em",
          }}
        >
          0
        </div>
        <div
          style={{
            fontFamily: sans,
            fontSize: 20,
            fontWeight: 600,
            color: P.muted,
            letterSpacing: "0.06em",
          }}
        >
          {maxVal}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "dataviz-pyramid-chart",
  props: {
    items: [{ label: "Junior", left: 45, right: 50 }, { label: "Mid", left: 30, right: 35 }, { label: "Senior", left: 15, right: 20 }],
    leftLabel: "2019",
    rightLabel: "2024",
    title: "Talent Pyramid",
    at: 15,
  },
  durationInFrames: 180,
};
