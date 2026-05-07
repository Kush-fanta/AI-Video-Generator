import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { C, FPS, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface DotFieldProps extends BaseProps {
  /** Optional text overlay */
  text?: string;
  /** Number of dot rows (default 35) */
  rows?: number;
  /** Number of dot columns (default 20) */
  cols?: number;
  /** Frame offset */
  at?: number;
}

/**
 * DotField — Grid of small dots with organic wave motion.
 * Dots ripple like wind on grass — each dot's Y position is offset
 * by sin/cos based on its grid position and the current frame.
 * A central cluster glows terracotta while the field remains muted.
 * Optional text overlaid. Hypnotic, generative, meditative.
 */
export const DotField: React.FC<DotFieldProps> = ({
  text,
  rows = 35,
  cols = 20,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const t = frame - at;

  // Canvas dimensions
  const W = 1080;
  const H = 1920;

  // Grid spacing
  const spacingX = W / (cols + 1);
  const spacingY = H / (rows + 1);

  // Center of the field — for terracotta cluster
  const centerX = W / 2;
  const centerY = H / 2;
  const clusterRadius = 180;

  // Precompute time values
  const timeA = (t / FPS) * Math.PI * 0.4;
  const timeB = (t / FPS) * Math.PI * 0.3;
  const timeC = (t / FPS) * Math.PI * 0.55;

  // Build dot array
  const dots = useMemo(() => {
    const result: Array<{ x: number; y: number; row: number; col: number }> = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        result.push({
          x: spacingX * (c + 1),
          y: spacingY * (r + 1),
          row: r,
          col: c,
        });
      }
    }
    return result;
  }, [rows, cols, spacingX, spacingY]);

  // Text entrance
  const textOpacity = text ? interpolate(t, [25, 50], [0, 1], C) : 0;
  const textY = text ? interpolate(t, [25, 50], [24, 0], { ...C, easing: ease }) : 0;

  // Field entrance — dots fade in as a wave from top
  const fieldEntrance = interpolate(t, [0, 30], [0, 1], C);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {dots.map((dot) => {
          // Wave displacement — multiple overlapping sine waves
          const wave1 = Math.sin(timeA + dot.col * 0.4 + dot.row * 0.15) * 8;
          const wave2 = Math.cos(timeB + dot.row * 0.3 - dot.col * 0.2) * 5;
          const wave3 = Math.sin(timeC + (dot.col + dot.row) * 0.25) * 3;
          const yOffset = wave1 + wave2 + wave3;

          // X displacement — subtler lateral sway
          const xOffset = Math.sin(timeB + dot.row * 0.2 + dot.col * 0.1) * 3;

          // Distance from center — for cluster coloring
          const dx = dot.x - centerX;
          const dy = dot.y - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Terracotta cluster — warm glow near center
          const inCluster = dist < clusterRadius;
          const clusterFade = inCluster
            ? interpolate(dist, [0, clusterRadius], [1, 0], C)
            : 0;

          // Dot size — slightly larger near center
          const baseSize = 3;
          const sizeBoost = inCluster ? interpolate(dist, [0, clusterRadius], [1.5, 0], C) : 0;
          const dotSize = baseSize + sizeBoost;

          // Dot opacity — entrance wave from top
          const entranceDelay = dot.row * 0.5;
          const dotOpacity = interpolate(
            t,
            [entranceDelay, entranceDelay + 15],
            [0, inCluster ? 0.9 : 0.35],
            C,
          );

          // Color blend between muted and terracotta
          const color = clusterFade > 0.3 ? P.terracotta : P.light;
          const opacity = clusterFade > 0.3
            ? dotOpacity * interpolate(clusterFade, [0.3, 1], [0.5, 1], C)
            : dotOpacity;

          return (
            <circle
              key={`${dot.row}-${dot.col}`}
              cx={dot.x + xOffset}
              cy={dot.y + yOffset}
              r={dotSize}
              fill={color}
              opacity={opacity * fieldEntrance}
            />
          );
        })}
      </svg>

      {/* Optional centered text */}
      {text && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
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
              padding: "0 100px",
              letterSpacing: "-0.02em",
            }}
          >
            {text}
          </div>
        </div>
      )}

      {/* Subtle label */}
      <div
        style={{
          position: "absolute",
          left: 60,
          bottom: 60,
          fontFamily: sans,
          fontSize: 20,
          color: P.muted,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          opacity: interpolate(t, [40, 55], [0, 0.35], C),
        }}
      >
        FIELD
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "abs-dot-field",
  props: {
    text: "Signal",
    at: 15,
  },
  durationInFrames: 180,
};
