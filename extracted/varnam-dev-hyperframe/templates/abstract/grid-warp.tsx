import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { C, FPS, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface GridWarpProps extends BaseProps {
  /** Optional text at the distortion center */
  text?: string;
  /** Grid cell size in pixels (default 60) */
  gridSize?: number;
  /** Frame offset */
  at?: number;
}

/**
 * GridWarp — Regular grid of fine lines with gravitational distortion.
 * Near the center, grid lines curve toward/away from a focal point
 * using inverse-square displacement. The distortion strength pulses
 * subtly over time. Text sits at the warp center. Gravitational lens
 * feel — scientific, mysterious, hypnotic.
 */
export const GridWarp: React.FC<GridWarpProps> = ({
  text,
  gridSize = 60,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const t = frame - at;

  const W = 1080;
  const H = 1920;
  const time = t / FPS;

  const warpCx = W / 2 + Math.sin(time * 0.2) * 20;
  const warpCy = H / 2 + Math.cos(time * 0.15) * 15;
  const strength = 8000 * interpolate(Math.sin(time * Math.PI * 0.4), [-1, 1], [0.7, 1.3]);
  const gridOpacity = interpolate(t, [0, 25], [0, 1], C);
  const effectRadius = 500;

  /** Displace point via inverse-square attraction with smooth falloff */
  const displace = (px: number, py: number): [number, number] => {
    const dx = px - warpCx;
    const dy = py - warpCy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 1 || dist > effectRadius) return [px, py];
    const falloff = Math.max(0, 1 - dist / effectRadius);
    const force = (strength / (dist * dist)) * falloff * falloff;
    return [px - (dx / dist) * force, py - (dy / dist) * force];
  };

  const cols = Math.ceil(W / gridSize) + 1;
  const rows = Math.ceil(H / gridSize) + 1;
  const samplePoints = 40;
  const verticalLines = useMemo(() => Array.from({ length: cols }, (_, c) => c), [cols]);
  const horizontalLines = useMemo(() => Array.from({ length: rows }, (_, r) => r), [rows]);

  const verticalPath = (col: number): string => {
    const x = col * gridSize;
    const points: string[] = [];
    for (let i = 0; i <= samplePoints; i++) {
      const y = (i / samplePoints) * H;
      const [dx, dy] = displace(x, y);
      points.push(`${i === 0 ? "M" : "L"} ${dx.toFixed(1)} ${dy.toFixed(1)}`);
    }
    return points.join(" ");
  };

  const horizontalPath = (row: number): string => {
    const y = row * gridSize;
    const points: string[] = [];
    for (let i = 0; i <= samplePoints; i++) {
      const x = (i / samplePoints) * W;
      const [dx, dy] = displace(x, y);
      points.push(`${i === 0 ? "M" : "L"} ${dx.toFixed(1)} ${dy.toFixed(1)}`);
    }
    return points.join(" ");
  };

  const pulse04 = Math.sin(time * Math.PI * 0.4);
  const glowRadius = interpolate(pulse04, [-1, 1], [120, 180]);
  const glowOpacity = interpolate(pulse04, [-1, 1], [0.04, 0.1]);
  const textOpacity = text ? interpolate(t, [25, 50], [0, 1], C) : 0;
  const textScale = text ? interpolate(t, [25, 50], [0.95, 1], { ...C, easing: ease }) : 1;

  const distFromCenter = (bx: number, by: number) => Math.sqrt((bx - W / 2) ** 2 + (by - H / 2) ** 2);
  const lineColor = (bx: number, by: number) => distFromCenter(bx, by) < 200 ? P.terracotta : P.light;
  const lineOpacityForDist = (bx: number, by: number) => distFromCenter(bx, by) < 200 ? 0.5 : 0.25;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Warp center glow */}
      <div
        style={{
          position: "absolute",
          left: warpCx - glowRadius,
          top: warpCy - glowRadius,
          width: glowRadius * 2,
          height: glowRadius * 2,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${P.terracotta} 0%, transparent 70%)`,
          opacity: glowOpacity,
          pointerEvents: "none",
        }}
      />

      {/* Warped grid */}
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        style={{
          position: "absolute",
          inset: 0,
          opacity: gridOpacity,
        }}
      >
        {/* Vertical lines */}
        {verticalLines.map((col) => {
          const baseX = col * gridSize;
          return (
            <path
              key={`v-${col}`}
              d={verticalPath(col)}
              fill="none"
              stroke={lineColor(baseX, H / 2)}
              strokeWidth={lineColor(baseX, H / 2) === P.terracotta ? 1.2 : 0.8}
              opacity={lineOpacityForDist(baseX, H / 2)}
            />
          );
        })}

        {/* Horizontal lines */}
        {horizontalLines.map((row) => {
          const baseY = row * gridSize;
          return (
            <path
              key={`h-${row}`}
              d={horizontalPath(row)}
              fill="none"
              stroke={lineColor(W / 2, baseY)}
              strokeWidth={lineColor(W / 2, baseY) === P.terracotta ? 1.2 : 0.8}
              opacity={lineOpacityForDist(W / 2, baseY)}
            />
          );
        })}

        {/* Center cross — marks the singularity */}
        <circle
          cx={warpCx}
          cy={warpCy}
          r={3}
          fill={P.terracotta}
          opacity={interpolate(
            Math.sin(time * Math.PI * 0.8),
            [-1, 1],
            [0.4, 0.8],
          )}
        />
      </svg>

      {/* Text at warp center */}
      {text && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: warpCy - 60,
            display: "flex",
            justifyContent: "center",
            opacity: textOpacity,
            transform: `scale(${textScale})`,
            transformOrigin: "center center",
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
              maxWidth: 780,
              padding: "0 80px",
              letterSpacing: "-0.02em",
            }}
          >
            {text}
          </div>
        </div>
      )}

      {/* Grid label */}
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
          opacity: interpolate(t, [35, 50], [0, 0.35], C),
        }}
      >
        GRAVITY
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "abs-grid-warp",
  props: {
    text: "Gravity",
    at: 15,
  },
  durationInFrames: 180,
};
