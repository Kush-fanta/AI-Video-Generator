import { AbsoluteFill, useCurrentFrame, spring, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, overshootScale, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface RangeVizProps extends BaseProps {
  min: number;
  max: number;
  current: number;
  unit?: string;
  minLabel?: string;
  maxLabel?: string;
  headline?: string;
  source?: string;
  at?: number;
}

/**
 * RangeViz — Horizontal range visualization.
 * Track in P.light, filled portion with terracotta gradient,
 * min/max labels at ends, current value marker with number above.
 * Spring-animated fill width.
 */
export const RangeViz: React.FC<RangeVizProps> = ({
  min,
  max,
  current,
  unit = "",
  minLabel,
  maxLabel,
  headline,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  const trackWidth = 880;
  const trackHeight = 20;
  const trackLeft = 100;
  const trackTop = 980;

  const range = max - min;
  const currentPct = Math.min(1, Math.max(0, (current - min) / range));

  // Spring for fill
  const fillF = Math.max(0, frame - (at + 10));
  const fillSpring = spring({
    frame: fillF,
    fps: FPS,
    config: { damping: 20, stiffness: 85, mass: 1 },
  });
  const fillWidth = fillSpring * currentPct * trackWidth;

  // Marker position
  const markerX = trackLeft + fillWidth;

  // Marker scale
  const markerScale = overshootScale(frame, at + 18);

  // Track reveal
  const trackReveal = reveal(frame, at + 6);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Headline */}
      {headline && (
        <div
          style={{
            position: "absolute",
            top: 340,
            left: 100,
            right: 100,
            ...reveal(frame, at + 2),
            fontFamily: serif,
            fontSize: 54,
            color: P.text,
            lineHeight: 1.18,
          }}
        >
          {headline}
        </div>
      )}

      {/* Current value — hero display above track */}
      <div
        style={{
          position: "absolute",
          top: trackTop - 220,
          left: trackLeft,
          ...reveal(frame, at + 14),
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: P.muted,
            marginBottom: 8,
          }}
        >
          Current
        </div>
        <div
          style={{
            fontFamily: serif,
            fontSize: 160,
            color: P.terracotta,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            transform: `scale(${markerScale})`,
            transformOrigin: "left bottom",
          }}
        >
          {current}{unit}
        </div>
      </div>

      {/* Track background */}
      <div
        style={{
          position: "absolute",
          top: trackTop,
          left: trackLeft,
          width: trackWidth,
          height: trackHeight,
          backgroundColor: P.light,
          borderRadius: trackHeight / 2,
          ...trackReveal,
        }}
      />

      {/* Track fill — terracotta gradient */}
      <div
        style={{
          position: "absolute",
          top: trackTop,
          left: trackLeft,
          width: fillWidth,
          height: trackHeight,
          background: `linear-gradient(90deg, ${P.sage} 0%, ${P.terracotta} 100%)`,
          borderRadius: trackHeight / 2,
          opacity: trackReveal.opacity,
        }}
      />

      {/* Current value marker — diamond */}
      <div
        style={{
          position: "absolute",
          top: trackTop + trackHeight / 2 - 14,
          left: markerX - 14,
          width: 28,
          height: 28,
          backgroundColor: P.terracotta,
          borderRadius: 4,
          border: `3px solid ${P.bg}`,
          transform: `rotate(45deg) scale(${fillSpring})`,
          boxShadow: `0 2px 12px ${P.terracotta}44`,
        }}
      />

      {/* Vertical marker line */}
      <div
        style={{
          position: "absolute",
          top: trackTop - 20,
          left: markerX - 0.75,
          width: 1.5,
          height: trackHeight + 40,
          backgroundColor: P.terracotta,
          opacity: interpolate(frame, [at + 14, at + 22], [0, 0.4], C),
        }}
      />

      {/* Min label — left end */}
      <div
        style={{
          position: "absolute",
          top: trackTop + trackHeight + 28,
          left: trackLeft,
          ...reveal(frame, at + 10),
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 36,
            color: P.text,
            lineHeight: 1,
          }}
        >
          {min}{unit}
        </div>
        {minLabel && (
          <div
            style={{
              fontFamily: sans,
              fontSize: 20,
              color: P.muted,
              marginTop: 4,
            }}
          >
            {minLabel}
          </div>
        )}
      </div>

      {/* Max label — right end */}
      <div
        style={{
          position: "absolute",
          top: trackTop + trackHeight + 28,
          right: 1080 - trackLeft - trackWidth,
          textAlign: "right",
          ...reveal(frame, at + 12),
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 36,
            color: P.text,
            lineHeight: 1,
          }}
        >
          {max}{unit}
        </div>
        {maxLabel && (
          <div
            style={{
              fontFamily: sans,
              fontSize: 20,
              color: P.muted,
              marginTop: 4,
            }}
          >
            {maxLabel}
          </div>
        )}
      </div>

      {/* Range extent label */}
      <div
        style={{
          position: "absolute",
          top: trackTop + trackHeight + 110,
          left: trackLeft,
          ...reveal(frame, at + 24),
          fontFamily: sans,
          fontSize: 22,
          color: P.sub,
          lineHeight: 1.5,
        }}
      >
        Range of {max - min}{unit} between minimum and maximum
      </div>

      {/* Source */}
      {source && (
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: 100,
            ...reveal(frame, at + 30),
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
  compositionId: "dataviz-range-viz",
  props: {
    "min": 10,
    "max": 90,
    "current": 64,
    "unit": "ms",
    "minLabel": "Low",
    "maxLabel": "High",
    "headline": "Latency band",
    "source": "Sample data",
    "at": 15
  },
  durationInFrames: 180,
};
