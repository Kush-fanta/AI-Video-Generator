import { AbsoluteFill, useCurrentFrame, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, overshootScale, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface ProportionBarProps extends BaseProps {
  percent: number;
  label: string;
  fillColor?: string;
  categoryLabel?: string;
  source?: string;
  /** Supporting stat shown right of bar — e.g. "vs 41% global avg" */
  contextStat?: string;
  at?: number;
}

/**
 * ProportionBar — THE signature data element.
 * Horizontal bar with spring-physics fill, percentage label with overshoot scale,
 * tick mark scale references (0 / 25 / 50 / 75 / 100), supporting label,
 * optional right-side context stat, category label, and source attribution.
 */
export const ProportionBar: React.FC<ProportionBarProps> = ({
  percent,
  label,
  fillColor = P.terracotta,
  categoryLabel,
  source,
  contextStat,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  // Spring-driven fill progress (0 → 1)
  const fillProgress = spring({
    frame: f,
    fps: FPS,
    config: { damping: 14, stiffness: 80, mass: 0.8 },
  });

  const fillWidth = fillProgress * percent;

  // Overshoot scale on the percentage number
  const numScale = overshootScale(frame, at + 12);

  // Bar dimensions — full-width left-anchored layout
  const barWidth = 1400;
  const barHeight = 56;

  // Scale tick labels below bar
  const scaleTicks = [0, 25, 50, 75, 100];

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* LEFT column — bar + labels */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 80,
          transform: "translateY(-50%)",
          width: barWidth,
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
              marginBottom: 32,
            }}
          >
            {categoryLabel}
          </div>
        )}

        {/* Percentage label — positioned above fill endpoint */}
        <div
          style={{
            ...reveal(frame, at + 8),
            position: "relative",
            height: 60,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: Math.min(
                Math.max(0, (barWidth * fillWidth) / 100 - 30),
                barWidth - 80
              ),
              bottom: 0,
              fontFamily: serif,
              fontSize: 72,
              color: P.text,
              transform: `scale(${numScale})`,
              transformOrigin: "bottom left",
              whiteSpace: "nowrap",
            }}
          >
            {percent}%
          </div>
        </div>

        {/* Bar track */}
        <div
          style={{
            width: barWidth,
            height: barHeight,
            backgroundColor: P.light,
            borderRadius: 8,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Tick marks on track */}
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
                opacity: 0.5,
              }}
            />
          ))}

          {/* Fill bar */}
          <div
            style={{
              width: `${fillWidth}%`,
              height: "100%",
              backgroundColor: fillColor,
              borderRadius: 8,
              transition: "none",
            }}
          />
        </div>

        {/* Scale reference labels below bar */}
        <div
          style={{
            position: "relative",
            width: barWidth,
            height: 24,
            marginTop: 6,
            ...reveal(frame, at + 6),
          }}
        >
          {scaleTicks.map((tick) => (
            <div
              key={tick}
              style={{
                position: "absolute",
                left: `${tick}%`,
                transform: tick === 100 ? "translateX(-100%)" : tick === 0 ? "none" : "translateX(-50%)",
                fontFamily: sans,
                fontSize: 20,
                fontWeight: 600,
                color: P.muted,
                letterSpacing: "0.06em",
              }}
            >
              {tick}%
            </div>
          ))}
        </div>

        {/* Supporting label */}
        <div
          style={{
            ...reveal(frame, at + 18),
            fontFamily: sans,
            fontSize: 22,
            color: P.sub,
            marginTop: 20,
            lineHeight: 1.4,
            maxWidth: contextStat ? barWidth * 0.62 : barWidth,
          }}
        >
          {label}
        </div>

        {/* Source label */}
        {source && (
          <div
            style={{
              ...reveal(frame, at + 25),
              fontFamily: sans,
              fontSize: 20,
              fontWeight: 500,
              letterSpacing: "0.08em",
              color: P.muted,
              marginTop: 32,
              textTransform: "uppercase",
            }}
          >
            Source: {source}
          </div>
        )}
      </div>

      {/* RIGHT side — context stat floated right of bar */}
      {contextStat && (
        <div
          style={(() => { const r = reveal(frame, at + 22); return {
            position: "absolute",
            right: 80,
            top: "50%",
            width: 280,
            textAlign: "right",
            opacity: r.opacity,
            transform: `translateY(-50%) ${r.transform}`,
          }; })()}
        >
          <div
            style={{
              fontFamily: sans,
              fontSize: 24,
              color: P.muted,
              lineHeight: 1.6,
              letterSpacing: "0.02em",
            }}
          >
            {contextStat}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
export const demo = {
  compositionId: "dataviz-proportion-bar",
  props: {
    "percent": 64,
    "label": "Revenue share",
    "categoryLabel": "Enterprise",
    "contextStat": "vs 41% average",
    "source": "Sample data",
    "at": 15
  },
  durationInFrames: 180,
};
