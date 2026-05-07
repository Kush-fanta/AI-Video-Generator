import { AbsoluteFill, useCurrentFrame, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, overshootScale, lineGrow, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface HeroNumberProps extends BaseProps {
  value: string;
  label: string;
  showCurve?: boolean;
  /** Supporting stat shown right panel — e.g. "+12% YoY" */
  supportingStat?: string;
  supportingLabel?: string;
  source?: string;
  at?: number;
}

/**
 * HeroNumber — Giant number (300px) with overshoot scale pulse.
 * Accent line below. Label in 36px sans. Optional growth curve SVG behind.
 * Right panel always populated: curve + scale tick labels OR supporting stat.
 * Left-of-center positioning.
 */
export const HeroNumber: React.FC<HeroNumberProps> = ({
  value,
  label,
  showCurve = false,
  supportingStat,
  supportingLabel,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  const numScale = overshootScale(frame, at + 6);
  const accentWidth = lineGrow(frame, at + 16, 30);

  // Growth curve animation progress
  const curveProgress = spring({
    frame: f,
    fps: FPS,
    config: { damping: 20, stiffness: 50, mass: 1.2 },
  });

  // Growth curve SVG path — exponential style
  const curvePathD = (() => {
    const w = 680;
    const h = 420;
    const points: string[] = [`M 0 ${h}`];
    const steps = 80;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      if (t > curveProgress) break;
      const x = t * w;
      const y = h - Math.pow(t, 2.2) * h;
      points.push(`L ${x} ${y}`);
    }
    return points.join(" ");
  })();

  // Scale tick labels for right panel when curve is shown
  const curveTickLabels = ["0", "25", "50", "75", "100"];

  // Supporting stat overshoot
  const statScale = overshootScale(frame, at + 22);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Main content — left panel */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 120,
          transform: "translateY(-55%)",
          width: 820,
        }}
      >
        {/* Hero number */}
        <div
          style={{
            ...reveal(frame, at + 4),
            fontFamily: serif,
            fontSize: 300,
            lineHeight: 0.9,
            color: P.text,
            letterSpacing: "-0.03em",
            transform: `scale(${numScale})`,
            transformOrigin: "left bottom",
          }}
        >
          {value}
        </div>

        {/* Accent line */}
        <div
          style={{
            width: `${accentWidth}%`,
            maxWidth: 240,
            height: 4,
            backgroundColor: P.terracotta,
            marginTop: 28,
            borderRadius: 2,
          }}
        />

        {/* Label */}
        <div
          style={{
            ...reveal(frame, at + 18),
            fontFamily: sans,
            fontSize: 36,
            color: P.sub,
            marginTop: 22,
            lineHeight: 1.35,
            maxWidth: 620,
          }}
        >
          {label}
        </div>

        {/* Source */}
        {source && (
          <div
            style={{
              ...reveal(frame, at + 28),
              fontFamily: sans,
              fontSize: 20,
              fontWeight: 500,
              letterSpacing: "0.08em",
              color: P.muted,
              marginTop: 48,
              textTransform: "uppercase",
            }}
          >
            Source: {source}
          </div>
        )}
      </div>

      {/* RIGHT panel — growth curve with scale ticks OR supporting stat */}
      {showCurve ? (
        <div
          style={{
            position: "absolute",
            top: "50%",
            right: 80,
            transform: "translateY(-50%)",
            width: 780,
            height: 460,
          }}
        >
          {/* Y-axis scale tick labels */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              height: 420,
              display: "flex",
              flexDirection: "column-reverse",
              justifyContent: "space-between",
              ...reveal(frame, at + 8),
            }}
          >
            {curveTickLabels.map((t) => (
              <div
                key={t}
                style={{
                  fontFamily: sans,
                  fontSize: 20,
                  color: P.muted,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textAlign: "right",
                  width: 28,
                }}
              >
                {t}
              </div>
            ))}
          </div>

          {/* Horizontal guide lines */}
          <svg
            style={{ position: "absolute", top: 0, left: 36 }}
            width={680}
            height={420}
            viewBox="0 0 680 420"
          >
            {[0, 0.25, 0.5, 0.75, 1.0].map((frac, i) => (
              <line
                key={i}
                x1={0}
                y1={420 - frac * 420}
                x2={680}
                y2={420 - frac * 420}
                stroke={P.light}
                strokeWidth={1}
                opacity={0.5}
              />
            ))}
            <path
              d={curvePathD}
              fill="none"
              stroke={P.terracotta}
              strokeWidth={3}
              strokeLinecap="round"
            />
          </svg>
        </div>
      ) : supportingStat ? (
        /* Supporting stat panel */
        <div
          style={(() => { const r = reveal(frame, at + 22); return {
            position: "absolute",
            right: 120,
            top: "50%",
            width: 360,
            textAlign: "left",
            borderLeft: `3px solid ${P.light}`,
            paddingLeft: 40,
            opacity: r.opacity,
            transform: `translateY(-50%) ${r.transform}`,
          }; })()}
        >
          <div
            style={{
              fontFamily: serif,
              fontSize: 88,
              color: P.terracotta,
              lineHeight: 1.0,
              letterSpacing: "-0.02em",
              transform: `scale(${statScale})`,
              transformOrigin: "left center",
            }}
          >
            {supportingStat}
          </div>
          {supportingLabel && (
            <div
              style={{
                fontFamily: sans,
                fontSize: 20,
                color: P.sub,
                marginTop: 12,
                lineHeight: 1.4,
              }}
            >
              {supportingLabel}
            </div>
          )}
        </div>
      ) : (
        /* Fallback: decorative scale marks panel */
        <div
          style={(() => { const r = reveal(frame, at + 20); return {
            position: "absolute",
            right: 120,
            top: "50%",
            width: 200,
            height: 300,
            opacity: r.opacity,
            transform: `translateY(-50%) ${r.transform}`,
          }; })()}
        >
          {[100, 75, 50, 25, 0].map((tick, i) => (
            <div
              key={tick}
              style={{
                position: "absolute",
                top: `${i * 25}%`,
                left: 0,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 1,
                  backgroundColor: P.light,
                }}
              />
              <div
                style={{
                  fontFamily: sans,
                  fontSize: 20,
                  color: P.muted,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                }}
              >
                {tick}
              </div>
            </div>
          ))}
        </div>
      )}
    </AbsoluteFill>
  );
};
export const demo = {
  compositionId: "dataviz-hero-number",
  props: {
    "value": "12.8M",
    "label": "Annual revenue",
    "showCurve": true,
    "supportingStat": "+18% YoY",
    "supportingLabel": "Growth",
    "source": "Sample data",
    "at": 15
  },
  durationInFrames: 180,
};
