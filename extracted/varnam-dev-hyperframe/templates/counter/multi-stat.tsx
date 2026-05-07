import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, overshootScale, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface StatItem {
  value: string;
  label: string;
  suffix?: string;
  prefix?: string;
}

export interface MultiStatProps extends BaseProps {
  stats: StatItem[];
  source?: string;
  at?: number;
}

/**
 * MultiStat — Vertical stack of 3-4 stats, left-aligned.
 * Primary stat is largest with terracotta accent; rest diminish in size.
 * Portrait 1080x1920 layout.
 */
export const MultiStat: React.FC<MultiStatProps> = ({
  stats,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  const sizes = [200, 130, 110, 96];
  const labelSizes = [32, 26, 24, 22];
  const stagger = 16;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      <div
        style={{
          position: "absolute",
          left: 100,
          top: 380,
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
      >
        {stats.slice(0, 4).map((stat, i) => {
          const itemAt = at + 6 + i * stagger;
          const isPrimary = i === 0;
          const fontSize = sizes[i] ?? 96;
          const labelSize = labelSizes[i] ?? 22;
          const color = isPrimary ? P.terracotta : P.text;
          const numScale = isPrimary ? overshootScale(frame, itemAt + 20) : 1;

          return (
            <div
              key={i}
              style={{
                ...reveal(frame, itemAt),
                marginBottom: isPrimary ? 56 : 40,
              }}
            >
              {/* Number row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  transform: `scale(${numScale})`,
                  transformOrigin: "left bottom",
                }}
              >
                {stat.prefix && (
                  <span
                    style={{
                      fontFamily: sans,
                      fontSize: fontSize * 0.35,
                      fontWeight: 500,
                      color: P.muted,
                      marginRight: 4,
                    }}
                  >
                    {stat.prefix}
                  </span>
                )}
                <span
                  style={{
                    fontFamily: serif,
                    fontSize,
                    lineHeight: 0.9,
                    color,
                    letterSpacing: "-0.04em",
                  }}
                >
                  {stat.value}
                </span>
                {stat.suffix && (
                  <span
                    style={{
                      fontFamily: sans,
                      fontSize: fontSize * 0.25,
                      fontWeight: 500,
                      color: P.sub,
                      marginLeft: 8,
                    }}
                  >
                    {stat.suffix}
                  </span>
                )}
              </div>

              {/* Accent line — only on primary */}
              {isPrimary && (
                <div
                  style={{
                    width: lineGrow(frame, itemAt + 10, 22) * 0.9,
                    maxWidth: 90,
                    height: 3,
                    backgroundColor: P.terracotta,
                    marginTop: 16,
                    borderRadius: 2,
                  }}
                />
              )}

              {/* Label */}
              <div
                style={{
                  ...reveal(frame, itemAt + 10),
                  fontFamily: sans,
                  fontSize: labelSize,
                  fontWeight: 400,
                  color: isPrimary ? P.sub : P.muted,
                  marginTop: isPrimary ? 16 : 10,
                  lineHeight: 1.35,
                  maxWidth: 620,
                }}
              >
                {stat.label}
              </div>

              {/* Subtle separator for non-primary */}
              {!isPrimary && i < Math.min(stats.length, 4) - 1 && (
                <div
                  style={{
                    width: 40,
                    height: 1,
                    backgroundColor: P.light,
                    marginTop: 20,
                    opacity: 0.6,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Source */}
      {source && (
        <div
          style={{
            position: "absolute",
            bottom: 100,
            left: 100,
            ...reveal(frame, at + 6 + Math.min(stats.length, 4) * stagger + 12),
            fontFamily: sans,
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: "0.12em",
            color: P.muted,
            textTransform: "uppercase",
          }}
        >
          {source}
        </div>
      )}
    </AbsoluteFill>
  );
};
export const demo = {
  compositionId: "counter-multi-stat",
  props: {
    "stats": [
      {
        "value": "12.8M",
        "label": "Annual revenue"
      },
      {
        "value": "91%",
        "label": "Retention"
      },
      {
        "value": "38",
        "label": "Median latency",
        "suffix": "ms"
      }
    ],
    "source": "Sample data",
    "at": 15
  },
  durationInFrames: 180,
};
