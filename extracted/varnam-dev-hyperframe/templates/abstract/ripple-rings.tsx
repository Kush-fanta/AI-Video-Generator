import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { C, FPS, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface RippleRingsProps extends BaseProps {
  /** Optional text at the impact point */
  text?: string;
  /** Number of ripple waves (default 6) */
  ringCount?: number;
  /** Frame offset */
  at?: number;
}

/**
 * RippleRings — Concentric circles expanding from center.
 * Like a stone dropped in water — SVG circles with increasing radius,
 * fading as they expand. Multiple staggered waves create continuous
 * rippling. Terracotta rings on cream. Text sits at the impact point.
 * Meditative, rhythmic, mesmerizing.
 */
export const RippleRings: React.FC<RippleRingsProps> = ({
  text,
  ringCount = 6,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame - at;

  // Impact point — center of canvas
  const cx = 540;
  const cy = 960;

  // Maximum ring radius — enough to reach corners
  const maxRadius = 900;

  // Wave cycle duration — frames for one ring to expand fully
  const cycleDuration = FPS * 3; // 3 seconds per ring cycle

  // Number of concurrent wave sets for continuous rippling
  const waveSets = 3;

  // Build all rings across all wave sets
  const rings: Array<{
    radius: number;
    opacity: number;
    strokeWidth: number;
    key: string;
  }> = [];

  for (let wave = 0; wave < waveSets; wave++) {
    // Each wave set starts at a different time offset
    const waveOffset = wave * (cycleDuration / waveSets);

    for (let i = 0; i < ringCount; i++) {
      // Each ring within a wave starts with a stagger
      const ringDelay = i * 8;
      const ringT = t - waveOffset - ringDelay;

      // Looping — ring restarts after completing a cycle
      const cycleT = ((ringT % cycleDuration) + cycleDuration) % cycleDuration;

      // Only show if we're past the initial delay
      if (ringT < 0) continue;

      // Radius expands over the cycle
      const progress = cycleT / cycleDuration;
      const radius = interpolate(progress, [0, 1], [0, maxRadius]);

      // Opacity fades as ring expands — sharp start, long tail
      const opacity = interpolate(progress, [0, 0.1, 0.6, 1], [0, 0.7, 0.2, 0]);

      // Stroke width decreases as ring expands
      const strokeWidth = interpolate(progress, [0, 1], [3, 0.5]);

      rings.push({
        radius,
        opacity: opacity * interpolate(t, [0, 15], [0, 1], C), // entrance fade
        strokeWidth,
        key: `${wave}-${i}`,
      });
    }
  }

  // Central dot — the impact point, pulses
  const dotPulse = interpolate(
    Math.sin((t / FPS) * Math.PI * 1.5),
    [-1, 1],
    [4, 7],
  );
  const dotOpacity = interpolate(
    Math.sin((t / FPS) * Math.PI * 1.5),
    [-1, 1],
    [0.5, 0.9],
  );

  // Text entrance — appears at impact point
  const textOpacity = text ? interpolate(t, [20, 45], [0, 1], C) : 0;
  const textY = text ? interpolate(t, [20, 45], [16, 0], { ...C, easing: ease }) : 0;

  // Subtle background rings — very faint static concentric circles for depth
  const bgRings = Array.from({ length: 4 }, (_, i) => ({
    radius: 200 + i * 180,
    key: `bg-${i}`,
  }));

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      <svg
        width="1080"
        height="1920"
        viewBox="0 0 1080 1920"
        style={{ position: "absolute", inset: 0 }}
      >
        {/* Static background reference rings */}
        {bgRings.map((ring) => (
          <circle
            key={ring.key}
            cx={cx}
            cy={cy}
            r={ring.radius}
            fill="none"
            stroke={P.light}
            strokeWidth={0.5}
            opacity={0.15}
            strokeDasharray="4 8"
          />
        ))}

        {/* Animated ripple rings */}
        {rings.map((ring) => (
          <circle
            key={ring.key}
            cx={cx}
            cy={cy}
            r={ring.radius}
            fill="none"
            stroke={P.terracotta}
            strokeWidth={ring.strokeWidth}
            opacity={ring.opacity}
          />
        ))}

        {/* Central impact dot */}
        <circle
          cx={cx}
          cy={cy}
          r={dotPulse}
          fill={P.terracotta}
          opacity={dotOpacity * interpolate(t, [0, 10], [0, 1], C)}
        />

        {/* Cross-hair at center — subtle cartographic touch */}
        <line
          x1={cx - 20}
          y1={cy}
          x2={cx + 20}
          y2={cy}
          stroke={P.light}
          strokeWidth={0.8}
          opacity={0.3}
        />
        <line
          x1={cx}
          y1={cy - 20}
          x2={cx}
          y2={cy + 20}
          stroke={P.light}
          strokeWidth={0.8}
          opacity={0.3}
        />
      </svg>

      {/* Text at impact point — offset below center */}
      {text && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: cy + 40,
            display: "flex",
            justifyContent: "center",
            opacity: textOpacity,
            transform: `translateY(${textY}px)`,
          }}
        >
          <div
            style={{
              fontFamily: serif,
              fontSize: 80,
              fontStyle: "italic",
              lineHeight: 1.15,
              color: P.text,
              textAlign: "center",
              maxWidth: 800,
              padding: "0 80px",
              letterSpacing: "-0.02em",
            }}
          >
            {text}
          </div>
        </div>
      )}

      {/* Distance label */}
      <div
        style={{
          position: "absolute",
          right: 60,
          bottom: 60,
          fontFamily: sans,
          fontSize: 20,
          color: P.muted,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          opacity: interpolate(t, [35, 50], [0, 0.35], C),
        }}
      >
        IMPACT
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "abs-ripple-rings",
  props: {
    text: "Origin",
    at: 15,
  },
  durationInFrames: 180,
};
