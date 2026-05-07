import { AbsoluteFill, useCurrentFrame, spring, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P, type Palette } from "../shared/palette";
import { reveal, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface SlopeItem {
  label: string;
  start: number;
  end: number;
}

interface SlopeChartProps extends BaseProps {
  startLabel: string;
  endLabel: string;
  items: SlopeItem[];
  title?: string;
  at?: number;
  palette?: Partial<Palette>;
}

/**
 * SlopeChart — Two vertical axes (time points) connected by slope lines.
 * Lines going up are sage, lines going down are mauve.
 * Dots at each endpoint. Labels at each end. Shows change over time.
 */
export const SlopeChart: React.FC<SlopeChartProps> = ({
  startLabel,
  endLabel,
  items,
  title,
  at = 0,
  palette,
}) => {
  const pal = { ...P, ...palette };
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  // Layout
  const MARGIN = 80;
  const TOP = title ? 320 : 240;
  const BOTTOM_PAD = 200;
  const LEFT_AXIS_X = 300;
  const RIGHT_AXIS_X = 780;
  const AXIS_TOP = TOP;
  const AXIS_H = 1920 - TOP - BOTTOM_PAD;

  // Find value range for normalization
  const allValues = items.flatMap((it) => [it.start, it.end]);
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const range = maxVal - minVal || 1;

  // Map value to Y position (higher value = higher on screen = lower Y)
  const valToY = (val: number) =>
    AXIS_TOP + (1 - (val - minVal) / range) * AXIS_H;

  // Axis vertical line animation
  const axisGrow = interpolate(f, [2, 18], [0, AXIS_H], C);

  const DOT_R = 12;
  const STAGGER = 8;

  return (
    <AbsoluteFill style={{ backgroundColor: pal.bg }}>
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
            color: pal.muted,
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
          top: TOP - 70,
          left: LEFT_AXIS_X,
          transform: "translateX(-50%)",
          fontFamily: sans,
          fontSize: 36,
          fontWeight: 700,
          color: pal.text,
          letterSpacing: "0.04em",
        }}
      >
        {startLabel}
      </div>
      <div
        style={{
          ...reveal(frame, at + 4),
          position: "absolute",
          top: TOP - 70,
          left: RIGHT_AXIS_X,
          transform: "translateX(-50%)",
          fontFamily: sans,
          fontSize: 36,
          fontWeight: 700,
          color: pal.text,
          letterSpacing: "0.04em",
        }}
      >
        {endLabel}
      </div>

      {/* Vertical axis lines */}
      <div
        style={{
          position: "absolute",
          top: AXIS_TOP,
          left: LEFT_AXIS_X,
          width: 2,
          height: axisGrow,
          backgroundColor: pal.light,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: AXIS_TOP,
          left: RIGHT_AXIS_X,
          width: 2,
          height: axisGrow,
          backgroundColor: pal.light,
        }}
      />

      {/* SVG slope lines */}
      <svg
        style={{ position: "absolute", top: 0, left: 0 }}
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
      >
        {items.map((item, i) => {
          const lineAt = 14 + i * STAGGER;
          const lineSp = spring({
            frame: Math.max(0, f - lineAt),
            fps: FPS,
            config: { damping: 14, stiffness: 70, mass: 0.9 },
          });

          const y1 = valToY(item.start);
          const y2 = valToY(item.end);
          const isUp = item.end > item.start;
          const color = isUp ? pal.sage : item.end < item.start ? pal.mauve : pal.slate;

          // Line interpolates from start to end
          const currentY2 = y1 + (y2 - y1) * lineSp;

          return (
            <line
              key={i}
              x1={LEFT_AXIS_X}
              y1={y1}
              x2={LEFT_AXIS_X + (RIGHT_AXIS_X - LEFT_AXIS_X) * lineSp}
              y2={currentY2}
              stroke={color}
              strokeWidth={3}
              strokeLinecap="round"
              opacity={f > lineAt ? 0.8 : 0}
            />
          );
        })}
      </svg>

      {/* Dots and labels */}
      {items.map((item, i) => {
        const dotAt = 14 + i * STAGGER;
        const dotF = Math.max(0, f - dotAt);

        const dotSp = spring({
          frame: dotF,
          fps: FPS,
          config: { damping: 10, stiffness: 120, mass: 0.6 },
        });

        const y1 = valToY(item.start);
        const y2 = valToY(item.end);
        const isUp = item.end > item.start;
        const color = isUp ? pal.sage : item.end < item.start ? pal.mauve : pal.slate;

        return (
          <div key={i}>
            {/* Start dot */}
            <div
              style={{
                position: "absolute",
                top: y1 - DOT_R * dotSp,
                left: LEFT_AXIS_X - DOT_R * dotSp,
                width: DOT_R * 2 * dotSp,
                height: DOT_R * 2 * dotSp,
                borderRadius: "50%",
                backgroundColor: color,
                opacity: f > dotAt ? 1 : 0,
              }}
            />

            {/* End dot */}
            <div
              style={{
                position: "absolute",
                top: y2 - DOT_R * dotSp,
                left: RIGHT_AXIS_X - DOT_R * dotSp,
                width: DOT_R * 2 * dotSp,
                height: DOT_R * 2 * dotSp,
                borderRadius: "50%",
                backgroundColor: color,
                opacity: f > dotAt + 6 ? 1 : 0,
              }}
            />

            {/* Start label — left of start dot */}
            <div
              style={{
                ...reveal(frame, at + dotAt + 4),
                position: "absolute",
                top: y1 - 16,
                right: 1080 - LEFT_AXIS_X + DOT_R + 16,
                fontFamily: sans,
                fontSize: 26,
                fontWeight: 600,
                color: pal.sub,
                textAlign: "right",
                whiteSpace: "nowrap",
              }}
            >
              {item.label}
            </div>

            {/* Start value */}
            <div
              style={{
                ...reveal(frame, at + dotAt + 4),
                position: "absolute",
                top: y1 - 22,
                right: 1080 - LEFT_AXIS_X + DOT_R + 16,
                marginTop: 28,
                fontFamily: serif,
                fontSize: 32,
                color: pal.text,
                textAlign: "right",
                whiteSpace: "nowrap",
              }}
            >
              {item.start}
            </div>

            {/* End value — right of end dot */}
            <div
              style={{
                ...reveal(frame, at + dotAt + 10),
                position: "absolute",
                top: y2 - 14,
                left: RIGHT_AXIS_X + DOT_R + 16,
                fontFamily: serif,
                fontSize: 32,
                color: pal.text,
                whiteSpace: "nowrap",
              }}
            >
              {item.end}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "dataviz-slope-chart",
  props: {
    startLabel: "2019",
    endLabel: "2024",
    items: [{ label: "IT Services", start: 60, end: 45 }, { label: "Engineering", start: 25, end: 40 }],
    title: "Revenue Mix Shift",
    at: 15,
  },
  durationInFrames: 180,
};
