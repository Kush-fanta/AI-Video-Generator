import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, C, ease } from "../shared/primitives";
import { MUGHAL } from "../shared/indian/palettes";
import { ScallopedBorder } from "../shared/indian/patterns";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface PillarChartItem {
  label: string;
  value: number;
  /** Optional display value, e.g. "₹4.2T" */
  displayValue?: string;
}

interface PillarChartProps {
  items: PillarChartItem[];
  /** Chart title */
  title?: string;
  source?: string;
  at?: number;
}

/**
 * PillarChart — Bar chart where bars are styled as haveli palace columns.
 * Tapered columns with scalloped capitals. MUGHAL palette (jade, gold, ivory).
 */
export const PillarChart: React.FC<PillarChartProps> = ({
  items,
  title,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const maxVal = Math.max(...items.map((d) => d.value));

  const columnColors = [
    MUGHAL.jade,
    MUGHAL.gold,
    MUGHAL.lapis,
    MUGHAL.deepRed,
    MUGHAL.rose,
    MUGHAL.jade,
  ];

  const chartBottom = 600;
  const chartTop = 120;
  const maxBarHeight = chartBottom - chartTop;
  const barAreaWidth = 1000;
  const barWidth = Math.min(100, barAreaWidth / items.length - 30);
  const startX = (1920 - barAreaWidth) / 2;

  return (
    <AbsoluteFill style={{ backgroundColor: MUGHAL.ivory }}>
      <ScallopedBorder color={MUGHAL.gold} opacity={0.15} scallops={16} side="top" at={at} />
      <ScallopedBorder color={MUGHAL.gold} opacity={0.15} scallops={16} side="bottom" at={at + 5} />

      {/* Title */}
      {title && (
        <div
          style={{
            position: "absolute",
            top: 45,
            left: "50%",
            ...reveal(frame, at + 2),
            fontFamily: sans,
            fontSize: 28,
            color: MUGHAL.onyx,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          {title}
        </div>
      )}

      {/* Baseline */}
      <div
        style={{
          position: "absolute",
          top: chartBottom,
          left: startX - 20,
          width: barAreaWidth + 40,
          height: 3,
          backgroundColor: MUGHAL.onyx,
          opacity: interpolate(frame, [at + 5, at + 15], [0, 0.3], C),
        }}
      />

      {/* Haveli columns */}
      {items.map((item, i) => {
        const barDelay = at + 10 + i * 8;
        const growProgress = interpolate(frame, [barDelay, barDelay + 25], [0, 1], { ...C, easing: ease });
        const barHeight = (item.value / maxVal) * maxBarHeight * growProgress;
        const x = startX + i * (barAreaWidth / items.length) + (barAreaWidth / items.length - barWidth) / 2;
        const color = columnColors[i % columnColors.length];

        return (
          <React.Fragment key={i}>
            {/* Column body — tapered */}
            <div
              style={{
                position: "absolute",
                bottom: 1080 - chartBottom,
                left: x,
                width: barWidth,
                height: barHeight,
                background: `linear-gradient(180deg, ${color} 0%, ${color}DD 60%, ${color}99 100%)`,
                borderRadius: "6px 6px 0 0",
                clipPath: `polygon(8% 0%, 92% 0%, 100% 100%, 0% 100%)`,
              }}
            >
              {/* Scalloped capital (top ornament) — wider header with arch cutouts */}
              <div
                style={{
                  position: "absolute",
                  top: -12,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: barWidth + 20,
                  height: 16,
                  backgroundColor: color,
                  borderRadius: "8px 8px 0 0",
                  boxShadow: `0 -2px 6px rgba(0,0,0,0.12)`,
                }}
              />
              {/* Gold accent line below capital */}
              <div
                style={{
                  position: "absolute",
                  top: 4,
                  left: "15%",
                  width: "70%",
                  height: 2,
                  backgroundColor: MUGHAL.gold,
                  opacity: 0.5,
                }}
              />
              {/* Vertical groove lines */}
              <div
                style={{
                  position: "absolute",
                  top: 14,
                  left: "30%",
                  width: 1,
                  height: "75%",
                  backgroundColor: "rgba(0,0,0,0.1)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 14,
                  right: "30%",
                  width: 1,
                  height: "75%",
                  backgroundColor: "rgba(0,0,0,0.1)",
                }}
              />
            </div>

            {/* Scalloped border at top of each bar */}
            {growProgress > 0.5 && (
              <svg
                viewBox="0 0 100 12"
                preserveAspectRatio="none"
                style={{
                  position: "absolute",
                  bottom: 1080 - chartBottom + barHeight + 4,
                  left: x - 4,
                  width: barWidth + 8,
                  height: 14,
                  opacity: interpolate(frame, [barDelay + 12, barDelay + 20], [0, 0.6], C),
                  pointerEvents: "none",
                }}
              >
                <path
                  d="M 0,12 Q 12.5,0 25,12 Q 37.5,0 50,12 Q 62.5,0 75,12 Q 87.5,0 100,12"
                  fill="none"
                  stroke={MUGHAL.gold}
                  strokeWidth={1.5}
                />
              </svg>
            )}

            {/* Value label */}
            <div
              style={{
                position: "absolute",
                bottom: 1080 - chartBottom + barHeight + 22,
                left: x,
                width: barWidth,
                textAlign: "center",
                ...reveal(frame, barDelay + 15),
                fontFamily: serif,
                fontSize: 28,
                color: MUGHAL.onyx,
              }}
            >
              {item.displayValue || item.value}
            </div>

            {/* Label */}
            <div
              style={{
                position: "absolute",
                top: chartBottom + 16,
                left: x,
                width: barWidth,
                textAlign: "center",
                ...reveal(frame, barDelay + 10),
                fontFamily: sans,
                fontSize: 18,
                color: P.sub,
                fontWeight: 600,
              }}
            >
              {item.label}
            </div>
          </React.Fragment>
        );
      })}

      {/* Source */}
      {source && (
        <div
          style={{
            position: "absolute",
            bottom: 40,
            right: 80,
            ...reveal(frame, at + 60),
            fontFamily: sans,
            fontSize: 16,
            color: P.muted,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Source: {source}
        </div>
      )}
    </AbsoluteFill>
  );
};
