import { AbsoluteFill, useCurrentFrame, spring, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, overshootScale, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface HealthBarProps extends BaseProps {
  current: number;
  max: number;
  label: string;
  at?: number;
}

/**
 * HealthBar — Video game style health bar.
 * Thick horizontal bar with segmented fill. Current HP / Max HP displayed.
 * Pulse animation on fill. Sage when healthy, terracotta when low.
 */
export const HealthBar: React.FC<HealthBarProps> = ({
  current,
  max,
  label,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  const fillProgress = spring({
    frame: f,
    fps: FPS,
    config: { damping: 12, stiffness: 60, mass: 1.2 },
  });

  const numScale = overshootScale(frame, at + 8);
  const ratio = Math.min(current / max, 1);
  const fillWidth = fillProgress * ratio * 100;

  // Color based on health ratio
  const fillColor = ratio < 0.25 ? P.terracotta : ratio < 0.5 ? P.slate : P.sage;

  // Pulse: subtle brightness oscillation after fill completes
  const pulsePhase = Math.sin((f - 30) * 0.12);
  const pulseOpacity = f > 30 ? interpolate(pulsePhase, [-1, 1], [0.85, 1.0], C) : 1;

  // Bar layout
  const barX = 100;
  const barY = 880;
  const barW = 880;
  const barH = 80;
  const borderW = 6;
  const segmentCount = 20;
  const segGap = 4;

  // Animated HP display
  const displayHP = Math.round(fillProgress * current);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Label */}
      <div
        style={{
          position: "absolute",
          top: 640,
          left: 0,
          width: 1080,
          textAlign: "center",
          ...reveal(frame, at + 2),
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontSize: 40,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: P.muted,
          }}
        >
          {label}
        </div>
      </div>

      {/* HP display */}
      <div
        style={{
          position: "absolute",
          top: 700,
          left: 0,
          width: 1080,
          textAlign: "center",
          ...reveal(frame, at + 4),
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 160,
            color: P.text,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            transform: `scale(${numScale})`,
          }}
        >
          {displayHP}
          <span style={{ fontSize: 64, color: P.muted }}> / {max}</span>
        </div>
      </div>

      {/* Health bar frame */}
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        {/* Outer border — chunky */}
        <rect
          x={barX - borderW}
          y={barY - borderW}
          width={barW + borderW * 2}
          height={barH + borderW * 2}
          rx={12}
          fill="none"
          stroke={P.text}
          strokeWidth={borderW}
        />

        {/* Background */}
        <rect
          x={barX}
          y={barY}
          width={barW}
          height={barH}
          rx={6}
          fill={P.dark}
          opacity={0.12}
        />

        {/* Segmented fill */}
        {Array.from({ length: segmentCount }).map((_, i) => {
          const segW = (barW - (segmentCount - 1) * segGap) / segmentCount;
          const segX = barX + i * (segW + segGap);
          const segThreshold = ((i + 1) / segmentCount) * 100;
          const visible = fillWidth >= segThreshold;
          const partial = fillWidth > (i / segmentCount) * 100 && !visible;

          if (!visible && !partial) return null;

          return (
            <rect
              key={i}
              x={segX}
              y={barY + 4}
              width={segW}
              height={barH - 8}
              rx={3}
              fill={fillColor}
              opacity={pulseOpacity * (partial ? 0.5 : 1)}
            />
          );
        })}

        {/* Damage zone (lost HP) — darker segments */}
        {ratio < 1 &&
          Array.from({ length: segmentCount }).map((_, i) => {
            const segW = (barW - (segmentCount - 1) * segGap) / segmentCount;
            const segX = barX + i * (segW + segGap);
            const segStart = (i / segmentCount) * 100;
            if (segStart < fillWidth) return null;

            return (
              <rect
                key={`d-${i}`}
                x={segX}
                y={barY + 4}
                width={segW}
                height={barH - 8}
                rx={3}
                fill={P.terracotta}
                opacity={0.12}
              />
            );
          })}
      </svg>

      {/* Percentage on bar right */}
      <div
        style={{
          position: "absolute",
          top: barY + barH + 24,
          left: barX,
          width: barW,
          display: "flex",
          justifyContent: "space-between",
          ...reveal(frame, at + 12),
        }}
      >
        <div style={{ fontFamily: sans, fontSize: 28, fontWeight: 700, color: fillColor }}>
          {Math.round(ratio * 100)}%
        </div>
        <div style={{ fontFamily: sans, fontSize: 28, fontWeight: 600, color: P.muted }}>
          HP
        </div>
      </div>

      {/* Status text */}
      <div
        style={{
          position: "absolute",
          top: barY + barH + 90,
          left: 0,
          width: 1080,
          textAlign: "center",
          ...reveal(frame, at + 18),
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 64,
            color: fillColor,
            lineHeight: 1.2,
          }}
        >
          {ratio < 0.25 ? "Critical" : ratio < 0.5 ? "Damaged" : ratio < 0.75 ? "Stable" : "Healthy"}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "meter-health-bar",
  props: {
    current: 73,
    max: 100,
    label: "Talent Pipeline Health",
    at: 15,
  },
  durationInFrames: 180,
};
