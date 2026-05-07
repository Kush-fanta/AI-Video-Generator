import { AbsoluteFill, useCurrentFrame, spring, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface ScatterPoint {
  x: number;
  y: number;
  /** Size of the dot (radius in px) */
  size: number;
  label?: string;
  color?: string;
}

export interface ScatterBurstProps extends BaseProps {
  points: ScatterPoint[];
  headline?: string;
  xAxis?: string;
  yAxis?: string;
  source?: string;
  at?: number;
}

/**
 * ScatterBurst — Data points burst outward from center to their positions.
 * Spring physics on each point. Size = magnitude. Points don't fade,
 * they SNAP into position with spring overshoot.
 */
export const ScatterBurst: React.FC<ScatterBurstProps> = ({
  points,
  headline,
  xAxis,
  yAxis,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  const PLOT_W = 900;
  const PLOT_H = 600;
  const PLOT_X = 280;
  const PLOT_Y = 140;

  const pointColors = [P.terracotta, P.sage, P.slate, P.mauve];

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Headline */}
      {headline && (
        <div
          style={{
            ...reveal(frame, at + 4),
            position: "absolute",
            top: 60,
            left: PLOT_X,
            fontFamily: sans,
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: "0.12em",
            color: P.muted,
            textTransform: "uppercase",
          }}
        >
          {headline}
        </div>
      )}

      {/* Y-axis label */}
      {yAxis && (
        <div
          style={{
            ...reveal(frame, at + 6),
            position: "absolute",
            top: PLOT_Y + PLOT_H / 2,
            left: PLOT_X - 60,
            transform: "rotate(-90deg)",
            fontFamily: sans,
            fontSize: 18,
            color: P.muted,
            fontWeight: 500,
            letterSpacing: "0.06em",
            whiteSpace: "nowrap",
          }}
        >
          {yAxis}
        </div>
      )}

      {/* X-axis label */}
      {xAxis && (
        <div
          style={{
            ...reveal(frame, at + 6),
            position: "absolute",
            top: PLOT_Y + PLOT_H + 30,
            left: PLOT_X + PLOT_W / 2,
            transform: "translateX(-50%)",
            fontFamily: sans,
            fontSize: 18,
            color: P.muted,
            fontWeight: 500,
            letterSpacing: "0.06em",
          }}
        >
          {xAxis}
        </div>
      )}

      {/* Plot area */}
      <svg
        style={{ position: "absolute", top: PLOT_Y, left: PLOT_X }}
        width={PLOT_W}
        height={PLOT_H}
        viewBox={`0 0 ${PLOT_W} ${PLOT_H}`}
      >
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((frac) => (
          <line
            key={`h-${frac}`}
            x1={0}
            y1={PLOT_H * frac}
            x2={PLOT_W}
            y2={PLOT_H * frac}
            stroke={P.light}
            strokeWidth={1}
            opacity={interpolate(f, [4, 8], [0, 0.5], C)}
          />
        ))}
        {[0.25, 0.5, 0.75].map((frac) => (
          <line
            key={`v-${frac}`}
            x1={PLOT_W * frac}
            y1={0}
            x2={PLOT_W * frac}
            y2={PLOT_H}
            stroke={P.light}
            strokeWidth={1}
            opacity={interpolate(f, [4, 8], [0, 0.5], C)}
          />
        ))}

        {/* Data points */}
        {points.map((pt, i) => {
          const pointDelay = 10 + i * 2;
          const sp = spring({
            frame: Math.max(0, f - pointDelay),
            fps: FPS,
            config: { damping: 10, stiffness: 120, mass: 0.8 },
          });

          const targetX = (pt.x / 100) * PLOT_W;
          const targetY = PLOT_H - (pt.y / 100) * PLOT_H;
          const centerX = PLOT_W / 2;
          const centerY = PLOT_H / 2;

          const cx = centerX + (targetX - centerX) * sp;
          const cy = centerY + (targetY - centerY) * sp;
          const r = pt.size * sp;
          const color = pt.color || pointColors[i % pointColors.length];

          return (
            <g key={i}>
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill={color}
                opacity={f > pointDelay ? 0.85 : 0}
              />
              {pt.label && f > pointDelay + 8 && (
                <text
                  x={cx}
                  y={cy - r - 8}
                  textAnchor="middle"
                  fontFamily={sans}
                  fontSize={16}
                  fontWeight={600}
                  fill={P.sub}
                >
                  {pt.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Source */}
      {source && (
        <div
          style={{
            ...reveal(frame, at + 50),
            position: "absolute",
            bottom: 50,
            left: PLOT_X,
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
  compositionId: "dataviz-scatter-burst",
  props: {
    "points": [
      {
        "x": 18,
        "y": 64,
        "size": 22,
        "label": "A"
      },
      {
        "x": 52,
        "y": 35,
        "size": 16,
        "label": "B"
      },
      {
        "x": 82,
        "y": 78,
        "size": 26,
        "label": "C"
      }
    ],
    "headline": "Cluster spread",
    "xAxis": "Reach",
    "yAxis": "Impact",
    "source": "Sample data",
    "at": 15
  },
  durationInFrames: 180,
};
