import { AbsoluteFill, useCurrentFrame, spring, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface RadarAxis {
  label: string;
  value: number; // 0-100
}

interface RadarChartProps extends BaseProps {
  axes: RadarAxis[];
  title?: string;
  fillColor?: string;
  at?: number;
}

/**
 * RadarChart — Spider/radar chart using SVG.
 * 5-6 axes radiating from center. Filled polygon expands from center
 * with spring physics. Grid lines at 25/50/75/100%. Axis labels at tips.
 */
export const RadarChart: React.FC<RadarChartProps> = ({
  axes,
  title,
  fillColor = P.terracotta,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  const n = axes.length;
  const SIZE = 720;
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const maxR = 280;

  // Spring for polygon expansion
  const expand = spring({
    frame: f,
    fps: FPS,
    config: { damping: 12, stiffness: 60, mass: 1.0 },
  });

  // Grid fade
  const gridOpacity = interpolate(f, [0, 12], [0, 0.4], C);

  // Helper: point on axis i at radius fraction (0-1)
  const axisPoint = (i: number, fraction: number) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    return {
      x: cx + maxR * fraction * Math.cos(angle),
      y: cy + maxR * fraction * Math.sin(angle),
    };
  };

  // Grid polygon path at a given fraction
  const gridPath = (fraction: number) => {
    const pts = Array.from({ length: n }, (_, i) => axisPoint(i, fraction));
    return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + "Z";
  };

  // Data polygon — expanded by spring
  const dataPath = () => {
    const pts = axes.map((axis, i) => {
      const fraction = (axis.value / 100) * expand;
      return axisPoint(i, fraction);
    });
    return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + "Z";
  };

  // Label positions — outside the chart
  const labelOffset = maxR + 56;

  const CHART_LEFT = (1080 - SIZE) / 2;
  const CHART_TOP = title ? 300 : 200;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Title */}
      {title && (
        <div
          style={{
            ...reveal(frame, at + 2),
            position: "absolute",
            top: 80,
            left: 80,
            right: 80,
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

      {/* Chart SVG */}
      <div
        style={{
          position: "absolute",
          top: CHART_TOP,
          left: CHART_LEFT,
          width: SIZE,
          height: SIZE,
        }}
      >
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          {/* Grid rings: 25%, 50%, 75%, 100% */}
          {[0.25, 0.5, 0.75, 1.0].map((frac) => (
            <path
              key={frac}
              d={gridPath(frac)}
              fill="none"
              stroke={P.light}
              strokeWidth={1.5}
              opacity={gridOpacity}
            />
          ))}

          {/* Axis lines */}
          {Array.from({ length: n }, (_, i) => {
            const tip = axisPoint(i, 1);
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={tip.x}
                y2={tip.y}
                stroke={P.light}
                strokeWidth={1}
                opacity={gridOpacity}
              />
            );
          })}

          {/* Data polygon — filled */}
          <path
            d={dataPath()}
            fill={fillColor}
            fillOpacity={0.2}
            stroke={fillColor}
            strokeWidth={3}
            strokeLinejoin="round"
            opacity={f > 2 ? 1 : 0}
          />

          {/* Data points — dots at each axis value */}
          {axes.map((axis, i) => {
            const fraction = (axis.value / 100) * expand;
            const pt = axisPoint(i, fraction);
            const dotDelay = 12 + i * 3;
            const dotSp = spring({
              frame: Math.max(0, f - dotDelay),
              fps: FPS,
              config: { damping: 10, stiffness: 140, mass: 0.6 },
            });
            return (
              <circle
                key={i}
                cx={pt.x}
                cy={pt.y}
                r={8 * dotSp}
                fill={fillColor}
                opacity={f > dotDelay ? 1 : 0}
              />
            );
          })}
        </svg>
      </div>

      {/* Axis labels — positioned outside the chart */}
      {axes.map((axis, i) => {
        const angle = (2 * Math.PI * i) / n - Math.PI / 2;
        const lx = cx + labelOffset * Math.cos(angle);
        const ly = cy + labelOffset * Math.sin(angle);

        // Determine text alignment based on position
        const isLeft = Math.cos(angle) < -0.1;
        const isRight = Math.cos(angle) > 0.1;
        const textAlign: "left" | "right" | "center" = isLeft
          ? "right"
          : isRight
          ? "left"
          : "center";

        return (
          <div
            key={i}
            style={{
              ...reveal(frame, at + 18 + i * 3),
              position: "absolute",
              top: CHART_TOP + ly - 20,
              left: CHART_LEFT + lx - 100,
              width: 200,
              textAlign,
              fontFamily: sans,
              fontSize: 28,
              fontWeight: 600,
              color: P.sub,
              lineHeight: 1.2,
            }}
          >
            {axis.label}
            <div
              style={{
                fontFamily: serif,
                fontSize: 40,
                color: P.text,
                marginTop: 2,
              }}
            >
              {axis.value}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "dataviz-radar-chart",
  props: {
    axes: [{ label: "Talent", value: 85 }, { label: "Cost", value: 90 }, { label: "Infra", value: 70 }, { label: "Innovation", value: 75 }, { label: "Scale", value: 80 }],
    title: "India Scorecard",
    at: 15,
  },
  durationInFrames: 180,
};
