/**
 * MapDots — Static SVG of India with dot overlays at relative % positions.
 * Dots pop in staggered at frame 12 + i*6.
 */

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK } from "./_tokens";
import { fadeEnvelope } from "./_anim";

loadInter();

export interface MapDotsProps {
  title: string;
  dots: Array<{ x: number; y: number; label: string }>;
  durationInFrames: number;
}

// Simplified India silhouette — recognizable blob, 8-point path in a 400×500 viewBox
const INDIA_PATH =
  "M 200 10 C 240 15 280 30 310 60 C 340 90 360 130 370 160 " +
  "C 385 195 380 230 370 260 C 355 295 335 320 310 345 " +
  "C 280 375 250 395 220 410 C 200 420 185 415 170 405 " +
  "C 145 390 130 370 120 340 C 108 308 108 275 115 245 " +
  "C 120 220 110 195 105 165 C 98 130 115 95 140 68 " +
  "C 162 44 178 8 200 10 Z";

const MAP_W = 400;
const MAP_H = 500;
const DOT_D = 16;

export const MapDots: React.FC<MapDotsProps> = ({ title, dots, durationInFrames }) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);

  const sliced = dots.slice(0, 6);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: SK.bg.navy,
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Title */}
      <div
        style={{
          fontFamily: SK.font.sans,
          fontWeight: SK.weight.bold,
          fontSize: SK.size.sub,
          color: SK.text.white,
          marginBottom: 40,
          textAlign: "center",
        }}
      >
        {title}
      </div>

      {/* Map container */}
      <div style={{ position: "relative", width: MAP_W, height: MAP_H }}>
        {/* India SVG outline */}
        <svg
          width={MAP_W}
          height={MAP_H}
          viewBox={`0 0 ${MAP_W} ${MAP_H}`}
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          <path
            d={INDIA_PATH}
            fill="rgba(255,255,255,0.04)"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth={2}
          />
        </svg>

        {/* Dots */}
        {sliced.map((dot, i) => {
          const r = interpolate(frame, [12 + i * 6, 12 + i * 6 + 10], [0, DOT_D / 2], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const labelOpacity = interpolate(frame, [12 + i * 6 + 8, 12 + i * 6 + 18], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const cx = (dot.x / 100) * MAP_W;
          const cy = (dot.y / 100) * MAP_H;

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: cx - DOT_D / 2,
                top: cy - DOT_D / 2,
              }}
            >
              <svg width={DOT_D} height={DOT_D}>
                <circle
                  cx={DOT_D / 2}
                  cy={DOT_D / 2}
                  r={r}
                  fill={SK.accent.red}
                />
              </svg>
              <div
                style={{
                  position: "absolute",
                  top: DOT_D + 4,
                  left: "50%",
                  transform: "translateX(-50%)",
                  whiteSpace: "nowrap",
                  fontFamily: SK.font.sans,
                  fontWeight: SK.weight.medium,
                  fontSize: SK.size.label,
                  color: SK.text.white,
                  opacity: labelOpacity,
                }}
              >
                {dot.label}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export default MapDots;

export const demo = {
  compositionId: "sk-map-dots",
  durationInFrames: 150,
  props: {
    title: "Defence manufacturing clusters",
    dots: [
      { x: 28, y: 22, label: "Delhi" },
      { x: 62, y: 38, label: "Kolkata" },
      { x: 20, y: 68, label: "Mumbai" },
      { x: 52, y: 75, label: "Bengaluru" },
      { x: 71, y: 58, label: "Hyderabad" },
      { x: 46, y: 54, label: "Nagpur" },
    ],
    durationInFrames: 150,
  },
};
