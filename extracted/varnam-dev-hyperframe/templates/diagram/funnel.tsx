import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface FunnelStage {
  label: string;
  value: string;
  percent: number;
}

export interface FunnelProps extends BaseProps {
  stages: FunnelStage[];
  title?: string;
  category?: string;
  source?: string;
  at?: number;
}

const STAGE_COLORS = [P.slate, P.sage, P.terracotta, P.mauve];

/**
 * Funnel — Horizontal bars decreasing in width from top to bottom.
 * Portrait 1080×1920, left-aligned editorial layout.
 * Bars spring-animate from 0 to final width. Each bar labeled with
 * value on the right side. SVG trapezoid connectors between bars.
 */
export const Funnel: React.FC<FunnelProps> = ({
  stages,
  title,
  category = "FUNNEL",
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  const count = stages.length;
  const stagger = 22;
  const maxBarWidth = 820;
  const barHeight = 88;
  const barGap = 20;
  const connectorHeight = 36;
  const barLeft = 100;
  const startY = title ? 380 : 300;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Category label */}
      <div
        style={{
          position: "absolute",
          top: 100,
          left: 100,
          ...reveal(frame, at + 2),
          fontFamily: sans,
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: P.muted,
        }}
      >
        {category}
      </div>

      {/* Title */}
      {title && (
        <div
          style={{
            position: "absolute",
            top: 160,
            left: 100,
            right: 100,
            ...reveal(frame, at + 4),
            fontFamily: serif,
            fontSize: 68,
            color: P.text,
            lineHeight: 1.15,
          }}
        >
          {title}
        </div>
      )}

      {/* SVG connectors between bars */}
      <svg
        width={1080}
        height={1920}
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      >
        {stages.slice(0, -1).map((_, i) => {
          const connAt = at + 10 + (i + 1) * stagger - 6;
          const topBarWidth = (stages[i].percent / 100) * maxBarWidth;
          const botBarWidth = (stages[i + 1].percent / 100) * maxBarWidth;

          const topY = startY + i * (barHeight + connectorHeight + barGap) + barHeight;
          const botY = topY + connectorHeight;

          const connSpring = spring({
            frame: Math.max(0, frame - connAt),
            fps: FPS,
            config: { damping: 16, stiffness: 60, mass: 0.5 },
          });

          const animBotRight = interpolate(
            connSpring, [0, 1],
            [barLeft + topBarWidth, barLeft + botBarWidth], C
          );

          return (
            <polygon
              key={i}
              points={[
                `${barLeft},${topY}`,
                `${barLeft + topBarWidth},${topY}`,
                `${animBotRight},${botY}`,
                `${barLeft},${botY}`,
              ].join(" ")}
              fill={P.light}
              opacity={0.4 * connSpring}
            />
          );
        })}
      </svg>

      {/* Bars */}
      {stages.map((stage, i) => {
        const barAt = at + 10 + i * stagger;
        const y = startY + i * (barHeight + connectorHeight + barGap);
        const finalWidth = (stage.percent / 100) * maxBarWidth;
        const barColor = STAGE_COLORS[i % STAGE_COLORS.length];

        const widthSpring = spring({
          frame: Math.max(0, frame - barAt),
          fps: FPS,
          config: { damping: 14, stiffness: 70, mass: 0.6 },
        });

        const currentWidth = finalWidth * widthSpring;
        const labelOpacity = interpolate(widthSpring, [0.6, 1], [0, 1], C);

        return (
          <div key={i}>
            {/* Bar */}
            <div
              style={{
                position: "absolute",
                left: barLeft,
                top: y,
                width: currentWidth,
                height: barHeight,
                backgroundColor: barColor,
                borderRadius: "6px 10px 10px 6px",
                display: "flex",
                alignItems: "center",
                paddingLeft: 24,
              }}
            >
              <span
                style={{
                  fontFamily: sans,
                  fontSize: 24,
                  fontWeight: 700,
                  color: P.bg,
                  opacity: labelOpacity,
                  letterSpacing: "0.02em",
                  whiteSpace: "nowrap",
                }}
              >
                {stage.label}
              </span>
            </div>

            {/* Value + percent — right of bar */}
            <div
              style={{
                position: "absolute",
                left: barLeft + finalWidth + 24,
                top: y,
                height: barHeight,
                display: "flex",
                alignItems: "center",
                gap: 10,
                ...reveal(frame, barAt + 14),
              }}
            >
              <span
                style={{
                  fontFamily: serif,
                  fontSize: 36,
                  color: barColor,
                  lineHeight: 1,
                }}
              >
                {stage.value}
              </span>
              <span
                style={{
                  fontFamily: sans,
                  fontSize: 22,
                  color: P.muted,
                  fontWeight: 600,
                }}
              >
                {stage.percent}%
              </span>
            </div>
          </div>
        );
      })}

      {/* Source */}
      {source && (
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: 100,
            ...reveal(frame, at + count * stagger + 30),
            fontFamily: sans,
            fontSize: 22,
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
  compositionId: "diagram-funnel",
  props: {
    "stages": [
      {
        "label": "Visit",
        "value": "12.4M",
        "percent": 100
      },
      {
        "label": "Sign up",
        "value": "4.1M",
        "percent": 66
      },
      {
        "label": "Activate",
        "value": "1.6M",
        "percent": 36
      },
      {
        "label": "Pay",
        "value": "540K",
        "percent": 18
      }
    ],
    "title": "User funnel",
    "category": "ACQUISITION",
    "source": "Sample data",
    "at": 15
  },
  durationInFrames: 180,
};
