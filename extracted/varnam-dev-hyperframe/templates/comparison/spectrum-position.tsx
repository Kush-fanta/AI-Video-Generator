import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface SpectrumPositionProps extends BaseProps {
  leftLabel: string;
  rightLabel: string;
  position: number; // 0–100
  positionLabel?: string;
  source?: string;
  at?: number;
}

/**
 * SpectrumPosition — Horizontal gradient bar from one extreme to another.
 * A marker dot (terracotta, spring-animated) lands at a position.
 * Left/right labels mark the extremes. Position value shown above marker.
 */
export const SpectrumPosition: React.FC<SpectrumPositionProps> = ({
  leftLabel,
  rightLabel,
  position,
  positionLabel,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  // Bar reveal
  const barGrow = lineGrow(frame, at + 4, 30);

  // Marker position with spring
  const markerProgress = spring({
    frame: Math.max(0, f - 12),
    fps: FPS,
    config: { damping: 12, stiffness: 60, mass: 1.2 },
  });
  const clampedPosition = Math.max(0, Math.min(100, position));
  const markerX = interpolate(markerProgress, [0, 1], [0, clampedPosition], C);

  // Marker scale entrance (bounce)
  const markerScale = spring({
    frame: Math.max(0, f - 14),
    fps: FPS,
    config: { damping: 10, stiffness: 140, mass: 0.5 },
  });

  // Label float entrance
  const labelFloat = spring({
    frame: Math.max(0, f - 20),
    fps: FPS,
    config: { damping: 14, stiffness: 80, mass: 0.8 },
  });
  const labelY = interpolate(labelFloat, [0, 1], [20, 0], C);

  const barWidth = 840;
  const barHeight = 24;
  const barLeft = 120;
  const barTop = 960;
  const dotSize = 40;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Extreme labels */}
      <div
        style={{
          ...reveal(frame, at + 2),
          position: "absolute",
          top: barTop - 120,
          left: barLeft,
          fontFamily: sans,
          fontSize: 40,
          fontWeight: 700,
          color: P.sub,
          letterSpacing: "0.04em",
        }}
      >
        {leftLabel}
      </div>
      <div
        style={{
          ...reveal(frame, at + 4),
          position: "absolute",
          top: barTop - 120,
          right: 120,
          fontFamily: sans,
          fontSize: 40,
          fontWeight: 700,
          color: P.sub,
          letterSpacing: "0.04em",
          textAlign: "right",
        }}
      >
        {rightLabel}
      </div>

      {/* Gradient bar */}
      <div
        style={{
          position: "absolute",
          top: barTop,
          left: barLeft,
          width: `${(barGrow / 100) * barWidth}px`,
          height: barHeight,
          borderRadius: barHeight / 2,
          background: `linear-gradient(90deg, ${P.slate} 0%, ${P.light} 50%, ${P.terracotta} 100%)`,
          overflow: "hidden",
        }}
      />

      {/* Full-width track background */}
      <div
        style={{
          position: "absolute",
          top: barTop,
          left: barLeft,
          width: barWidth,
          height: barHeight,
          borderRadius: barHeight / 2,
          backgroundColor: P.light,
          opacity: 0.3,
          zIndex: -1,
        }}
      />

      {/* Tick marks */}
      {[0, 25, 50, 75, 100].map((tick) => (
        <div
          key={tick}
          style={{
            ...reveal(frame, at + 6),
            position: "absolute",
            top: barTop + barHeight + 12,
            left: barLeft + (tick / 100) * barWidth,
            transform: "translateX(-50%)",
            fontFamily: sans,
            fontSize: 20,
            color: P.muted,
            fontWeight: 600,
          }}
        >
          {tick}
        </div>
      ))}

      {/* Marker dot */}
      <div
        style={{
          position: "absolute",
          top: barTop + barHeight / 2 - dotSize / 2,
          left: barLeft + (markerX / 100) * barWidth - dotSize / 2,
          width: dotSize,
          height: dotSize,
          borderRadius: "50%",
          backgroundColor: P.terracotta,
          border: `4px solid ${P.bg}`,
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          transform: `scale(${markerScale})`,
          zIndex: 5,
        }}
      />

      {/* Position label above marker */}
      {positionLabel && (
        <div
          style={{
            position: "absolute",
            top: barTop - 60,
            left: barLeft + (markerX / 100) * barWidth,
            transform: `translateX(-50%) translateY(${labelY}px)`,
            opacity: labelFloat,
            fontFamily: serif,
            fontSize: 64,
            color: P.terracotta,
            whiteSpace: "nowrap",
            zIndex: 5,
          }}
        >
          {positionLabel}
        </div>
      )}

      {/* Source */}
      {source && (
        <div
          style={{
            ...reveal(frame, at + 28),
            position: "absolute",
            bottom: 200,
            left: 0,
            width: 1080,
            textAlign: "center",
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
  compositionId: "comp-spectrum-position",
  props: {
    leftLabel: "Cost Centre",
    rightLabel: "Innovation Hub",
    position: 78,
    positionLabel: "India GCCs",
    source: "Zinnov 2024",
    at: 15,
  },
  durationInFrames: 180,
};
