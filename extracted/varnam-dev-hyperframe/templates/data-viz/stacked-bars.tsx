import { AbsoluteFill, useCurrentFrame, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, overshootScale, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

const BAR_COLORS = [P.terracotta, P.sage, P.slate, P.mauve];

interface BarItem {
  percent: number;
  label: string;
  color?: string;
}

export interface StackedBarsProps extends BaseProps {
  bars: BarItem[];
  categoryLabel?: string;
  /** Summary stat shown in right panel — e.g. total or leading category */
  summaryValue?: string;
  summaryLabel?: string;
  source?: string;
  at?: number;
}

/**
 * StackedBars — Multiple proportion bars stacked vertically.
 * Hero number LEFT + bar RIGHT for each row. Staggered reveal (20 frames apart).
 * Tick marks at 25/50/75 on each bar. Scale labels on first bar.
 * Labels sit directly below each bar — no legend panel.
 * Right panel: summary stat when provided, otherwise empty.
 */
export const StackedBars: React.FC<StackedBarsProps> = ({
  bars,
  categoryLabel,
  summaryValue,
  summaryLabel,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  const barWidth = summaryValue ? 960 : 1160;
  const barHeight = 50;
  const rowGap = 28;
  const stagger = 20;

  // Summary stat overshoot
  const summaryScale = overshootScale(frame, at + bars.length * stagger + 8);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 80,
          transform: `translateY(-${
            (bars.length * (barHeight + rowGap)) / 2 + 40
          }px)`,
          width: summaryValue ? 1400 : 1760,
        }}
      >
        {/* Category label */}
        {categoryLabel && (
          <div
            style={{
              ...reveal(frame, at + 2),
              fontFamily: sans,
              fontSize: 40,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: P.muted,
              marginBottom: 40,
            }}
          >
            {categoryLabel}
          </div>
        )}

        {bars.map((bar, i) => {
          const barAt = at + i * stagger;
          const f = Math.max(0, frame - barAt);
          const fillColor = bar.color || BAR_COLORS[i % BAR_COLORS.length];

          const fillProgress = spring({
            frame: f,
            fps: FPS,
            config: { damping: 14, stiffness: 80, mass: 0.8 },
          });

          const fillWidth = fillProgress * bar.percent;
          const numScale = overshootScale(frame, barAt + 8);

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: rowGap,
                ...reveal(frame, barAt),
              }}
            >
              {/* Hero number LEFT */}
              <div
                style={{
                  width: 170,
                  fontFamily: serif,
                  fontSize: 64,
                  color: P.text,
                  textAlign: "right",
                  paddingRight: 24,
                  transform: `scale(${numScale})`,
                  transformOrigin: "center right",
                  flexShrink: 0,
                }}
              >
                {bar.percent}%
              </div>

              {/* Bar + label RIGHT — label below bar, no separate legend */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    width: barWidth,
                    height: barHeight,
                    backgroundColor: P.light,
                    borderRadius: 6,
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  {/* Tick marks */}
                  {[25, 50, 75].map((tick) => (
                    <div
                      key={tick}
                      style={{
                        position: "absolute",
                        left: `${tick}%`,
                        top: 0,
                        width: 1,
                        height: barHeight,
                        backgroundColor: P.bg,
                        opacity: 0.4,
                      }}
                    />
                  ))}

                  {/* Fill */}
                  <div
                    style={{
                      width: `${fillWidth}%`,
                      height: "100%",
                      backgroundColor: fillColor,
                      borderRadius: 6,
                    }}
                  />
                </div>

                {/* Scale labels — only on first bar */}
                {i === 0 && (
                  <div
                    style={{
                      position: "relative",
                      width: barWidth,
                      height: 20,
                      marginTop: 4,
                      ...reveal(frame, at + 4),
                    }}
                  >
                    {[0, 25, 50, 75, 100].map((tick) => (
                      <div
                        key={tick}
                        style={{
                          position: "absolute",
                          left: `${tick}%`,
                          transform:
                            tick === 100
                              ? "translateX(-100%)"
                              : tick === 0
                              ? "none"
                              : "translateX(-50%)",
                          fontFamily: sans,
                          fontSize: 20,
                          color: P.muted,
                          fontWeight: 600,
                          letterSpacing: "0.06em",
                        }}
                      >
                        {tick}%
                      </div>
                    ))}
                  </div>
                )}

                {/* Label directly below bar — self-labeling, no legend needed */}
                <div
                  style={{
                    fontFamily: sans,
                    fontSize: 20,
                    color: P.sub,
                    marginTop: i === 0 ? 4 : 8,
                    lineHeight: 1.3,
                  }}
                >
                  {bar.label}
                </div>
              </div>
            </div>
          );
        })}

        {/* Source label */}
        {source && (
          <div
            style={{
              ...reveal(frame, at + bars.length * stagger + 15),
              fontFamily: sans,
              fontSize: 20,
              fontWeight: 500,
              letterSpacing: "0.08em",
              color: P.muted,
              marginTop: 24,
              textTransform: "uppercase",
            }}
          >
            Source: {source}
          </div>
        )}
      </div>

      {/* RIGHT panel — summary stat only (legend removed) */}
      {summaryValue && (
        <div
          style={(() => {
            const r = reveal(frame, at + bars.length * stagger + 5);
            return {
              position: "absolute",
              right: 80,
              top: "50%",
              width: 320,
              borderLeft: `2px solid ${P.light}`,
              paddingLeft: 36,
              opacity: r.opacity,
              transform: `translateY(-50%) ${r.transform}`,
            };
          })()}
        >
          <div
            style={{
              fontFamily: sans,
              fontSize: 40,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: P.muted,
              marginBottom: 12,
            }}
          >
            Total
          </div>
          <div
            style={{
              fontFamily: serif,
              fontSize: 64,
              color: P.terracotta,
              lineHeight: 1.0,
              letterSpacing: "-0.02em",
              transform: `scale(${summaryScale})`,
              transformOrigin: "left center",
            }}
          >
            {summaryValue}
          </div>
          {summaryLabel && (
            <div
              style={{
                fontFamily: sans,
                fontSize: 20,
                color: P.sub,
                marginTop: 10,
                lineHeight: 1.4,
              }}
            >
              {summaryLabel}
            </div>
          )}
        </div>
      )}
    </AbsoluteFill>
  );
};
export const demo = {
  compositionId: "dataviz-stacked-bars",
  props: {
    "bars": [
      {
        "label": "Search",
        "value": 42
      },
      {
        "label": "Social",
        "value": 28
      },
      {
        "label": "Direct",
        "value": 18
      }
    ],
    "categoryLabel": "Channel",
    "summaryValue": "88",
    "summaryLabel": "Total",
    "source": "Sample data",
    "at": 15
  },
  durationInFrames: 180,
};
