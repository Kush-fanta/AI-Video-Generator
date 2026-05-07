import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, overshootScale, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface FunnelTier {
  label: string;
  value: string;
  /** Width percentage (0–100). First tier should be 100. */
  widthPercent: number;
}

export interface FunnelChartProps extends BaseProps {
  tiers: FunnelTier[];
  headline?: string;
  source?: string;
  at?: number;
}

/**
 * FunnelChart — Descending width bars (100% → smaller). Each tier snaps in
 * with hard timing. Dropout percentage labels on the side. No smooth fades.
 */
export const FunnelChart: React.FC<FunnelChartProps> = ({
  tiers,
  headline,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  const MAX_W = 800;
  const TIER_H = 64;
  const TIER_GAP = 10;

  const tierColors = [P.terracotta, P.sage, P.slate, P.mauve, P.muted];

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: 1400,
        }}
      >
        {/* Headline */}
        {headline && (
          <div
            style={{
              ...reveal(frame, at + 4),
              fontFamily: sans,
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: "0.12em",
              color: P.muted,
              textTransform: "uppercase",
              marginBottom: 40,
            }}
          >
            {headline}
          </div>
        )}

        {/* Funnel tiers */}
        {tiers.map((tier, i) => {
          const tierAt = 8 + i * 8;
          const barWidth = interpolate(
            f,
            [tierAt, tierAt + 4],
            [0, (tier.widthPercent / 100) * MAX_W],
            C,
          );
          const scale = overshootScale(frame, at + tierAt + 2);
          const dropPercent =
            i > 0
              ? Math.round(
                  ((tiers[i - 1].widthPercent - tier.widthPercent) /
                    tiers[i - 1].widthPercent) *
                    100,
                )
              : null;

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                marginBottom: TIER_GAP,
                width: MAX_W + 300,
              }}
            >
              {/* Drop label (left side) */}
              <div style={{ width: 100, textAlign: "right" }}>
                {dropPercent !== null && (
                  <div
                    style={{
                      ...reveal(frame, at + tierAt + 4),
                      fontFamily: sans,
                      fontSize: 22,
                      fontWeight: 700,
                      color: P.terracotta,
                    }}
                  >
                    −{dropPercent}%
                  </div>
                )}
              </div>

              {/* Bar */}
              <div
                style={{
                  width: MAX_W,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: barWidth,
                    height: TIER_H,
                    backgroundColor: tierColors[i % tierColors.length],
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transform: `scaleY(${scale})`,
                    transformOrigin: "center",
                    overflow: "hidden",
                  }}
                >
                  {f > tierAt + 3 && (
                    <div
                      style={{
                        fontFamily: sans,
                        fontSize: 20,
                        fontWeight: 700,
                        color: P.bg,
                        letterSpacing: "0.04em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {tier.label}
                    </div>
                  )}
                </div>
              </div>

              {/* Value (right side) */}
              <div
                style={{
                  ...reveal(frame, at + tierAt + 2),
                  width: 120,
                  fontFamily: serif,
                  fontSize: 36,
                  color: P.text,
                }}
              >
                {tier.value}
              </div>
            </div>
          );
        })}

        {/* Source */}
        {source && (
          <div
            style={{
              ...reveal(frame, at + 8 + tiers.length * 8 + 10),
              fontFamily: sans,
              fontSize: 20,
              fontWeight: 500,
              letterSpacing: "0.08em",
              color: P.muted,
              marginTop: 36,
              textTransform: "uppercase",
            }}
          >
            Source: {source}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
export const demo = {
  compositionId: "dataviz-funnel-chart",
  props: {
    "tiers": [
      {
        "label": "Visit",
        "value": "12.4M",
        "widthPercent": 100
      },
      {
        "label": "Sign up",
        "value": "4.1M",
        "widthPercent": 66
      },
      {
        "label": "Activate",
        "value": "1.6M",
        "widthPercent": 36
      },
      {
        "label": "Pay",
        "value": "540K",
        "widthPercent": 18
      }
    ],
    "headline": "User funnel",
    "source": "Sample data",
    "at": 15
  },
  durationInFrames: 180,
};
