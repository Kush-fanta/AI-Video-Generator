import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, overshootScale, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface DashboardKPIProps extends BaseProps {
  /** The KPI value — large display number */
  value: string;
  /** Label below the value */
  label: string;
  /** Trend direction */
  trend: "up" | "down" | "flat";
  /** Trend percentage string, e.g. "+12.4%" */
  trendPercent?: string;
  /** Time period context, e.g. "vs last quarter" */
  period?: string;
  /** Frame when element appears */
  at?: number;
}

/**
 * Single KPI widget — Bloomberg/Stripe dashboard aesthetic.
 * Dark card (P.dark) with rounded corners. Large number in light text.
 * Trend arrow in sage (up) or terracotta (down). Sparkline below.
 * Canvas: 1080×1920 portrait.
 */
export const DashboardKPI: React.FC<DashboardKPIProps> = ({
  value,
  label,
  trend,
  trendPercent,
  period,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  // Card entrance
  const cardScale = spring({
    frame: Math.max(0, f),
    fps: FPS,
    config: { damping: 16, stiffness: 100, mass: 1.0 },
    from: 0.92,
    to: 1.0,
  });
  const cardOpacity = interpolate(f, [0, 10], [0, 1], C);

  // Value scale with overshoot
  const valueScale = overshootScale(frame, at + 12);

  // Trend color
  const trendColor =
    trend === "up" ? P.sage : trend === "down" ? P.terracotta : P.muted;

  // Sparkline: generate deterministic points based on trend
  const sparkPoints = Array.from({ length: 20 }, (_, i) => {
    const base = trend === "up" ? 40 + i * 3 : trend === "down" ? 100 - i * 3 : 70;
    const noise = Math.sin(i * 2.1 + 3.7) * 15 + Math.cos(i * 1.3) * 10;
    return Math.max(10, Math.min(110, base + noise));
  });

  // Sparkline draw progress
  const sparkProgress = interpolate(f, [20, 55], [0, 1], C);
  const visiblePoints = Math.floor(sparkProgress * sparkPoints.length);

  const sparkW = 860;
  const sparkH = 120;
  const stepX = sparkW / (sparkPoints.length - 1);

  const pathData = sparkPoints
    .slice(0, Math.max(2, visiblePoints))
    .map((y, i) => `${i === 0 ? "M" : "L"}${i * stepX},${y}`)
    .join(" ");

  // Trend arrow
  const TrendArrow = () => {
    if (trend === "flat") {
      return (
        <svg width="28" height="20" viewBox="0 0 28 20" fill="none">
          <path
            d="M4 10H24M20 5L25 10L20 15"
            stroke={trendColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }
    const isUp = trend === "up";
    return (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path
          d={isUp ? "M14 24V4M6 12L14 4L22 12" : "M14 4V24M6 16L14 24L22 16"}
          stroke={trendColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <AbsoluteFill style={{ backgroundColor: "#111111" }}>
      {/* KPI Card */}
      <div
        style={{
          position: "absolute",
          top: 280,
          left: 72,
          right: 72,
          borderRadius: 24,
          backgroundColor: P.dark,
          border: "1px solid #222222",
          padding: "64px 56px 48px",
          boxShadow:
            "0 20px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)",
          transform: `scale(${cardScale})`,
          opacity: cardOpacity,
        }}
      >
        {/* Label */}
        <div
          style={{
            ...reveal(frame, at + 6),
            fontFamily: sans,
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: P.muted,
            marginBottom: 20,
          }}
        >
          {label}
        </div>

        {/* Value row */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 24,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontFamily: serif,
              fontSize: 112,
              lineHeight: 1.0,
              color: P.bg,
              letterSpacing: "-0.03em",
              transform: `scale(${valueScale})`,
              transformOrigin: "left bottom",
            }}
          >
            {value}
          </div>

          {/* Trend badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
              ...reveal(frame, at + 18),
            }}
          >
            <TrendArrow />
            {trendPercent && (
              <span
                style={{
                  fontFamily: sans,
                  fontSize: 32,
                  fontWeight: 700,
                  color: trendColor,
                }}
              >
                {trendPercent}
              </span>
            )}
          </div>
        </div>

        {/* Period */}
        {period && (
          <div
            style={{
              ...reveal(frame, at + 22),
              fontFamily: sans,
              fontSize: 22,
              color: P.sub,
              marginBottom: 40,
            }}
          >
            {period}
          </div>
        )}

        {/* Sparkline */}
        <div
          style={{
            marginTop: 16,
            opacity: interpolate(f, [16, 24], [0, 1], C),
          }}
        >
          <svg
            width={sparkW}
            height={sparkH}
            viewBox={`0 0 ${sparkW} ${sparkH}`}
            fill="none"
            style={{ display: "block" }}
          >
            {/* Gradient fill under the line */}
            <defs>
              <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={trendColor} stopOpacity="0.2" />
                <stop offset="100%" stopColor={trendColor} stopOpacity="0" />
              </linearGradient>
            </defs>
            {visiblePoints >= 2 && (
              <>
                <path
                  d={`${pathData} L${(visiblePoints - 1) * stepX},${sparkH} L0,${sparkH} Z`}
                  fill="url(#sparkGrad)"
                />
                <path
                  d={pathData}
                  stroke={trendColor}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Current point dot */}
                <circle
                  cx={(visiblePoints - 1) * stepX}
                  cy={sparkPoints[visiblePoints - 1]}
                  r="6"
                  fill={trendColor}
                />
              </>
            )}
          </svg>
        </div>
      </div>

      {/* Accent line below card */}
      <div
        style={{
          position: "absolute",
          bottom: 560,
          left: 128,
          width: `${lineGrow(frame, at + 30, 24)}%`,
          maxWidth: 160,
          height: 3,
          backgroundColor: trendColor,
          borderRadius: 2,
        }}
      />

      {/* Secondary context — large serif below */}
      <div
        style={{
          position: "absolute",
          bottom: 280,
          left: 72,
          right: 72,
          ...reveal(frame, at + 36),
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 64,
            lineHeight: 1.15,
            color: P.bg,
            letterSpacing: "-0.02em",
          }}
        >
          {label}
        </div>
        {period && (
          <div
            style={{
              fontFamily: sans,
              fontSize: 24,
              color: P.muted,
              marginTop: 12,
            }}
          >
            {period}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "screen-dashboard-kpi",
  props: {
    value: "$100B",
    label: "GCC Revenue",
    trend: "up",
    trendPercent: "+12% YoY",
    period: "FY 2024",
    at: 15,
  },
  durationInFrames: 180,
};
