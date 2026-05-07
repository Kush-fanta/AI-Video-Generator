 "use client";

import React, { useRef } from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, C, FPS, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface GrainWashProps extends BaseProps {
  /** Optional large serif text centered on the wash */
  text?: string;
  /** Base wash color (default P.terracotta) */
  color?: string;
  /** Grain opacity 0-1 (default 0.14) */
  grainIntensity?: number;
  /** Frame offset */
  at?: number;
}

/**
 * GrainWash — Full screen color wash with slowly shifting hue.
 * Animated film grain overlay using SVG feTurbulence that re-seeds
 * each frame for organic analog texture. The background color breathes
 * through subtle hue rotation. Optional large serif text floats center.
 * Warm, analog, contemplative.
 */
export const GrainWash: React.FC<GrainWashProps> = ({
  text,
  color = P.terracotta,
  grainIntensity = 0.14,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const t = frame - at;

  // Hue rotation — slow continuous drift, 0-360 over ~12 seconds
  const hueRotate = interpolate(t, [0, FPS * 12], [0, 360], {
    extrapolateLeft: "clamp" as const,
    extrapolateRight: "extend" as const,
  });

  // Subtle brightness pulsing — breathing rhythm
  const brightness = interpolate(
    Math.sin((t / FPS) * Math.PI * 0.3),
    [-1, 1],
    [0.92, 1.08],
  );

  // Saturation drift — complementary to hue shift
  const saturation = interpolate(
    Math.sin((t / FPS) * Math.PI * 0.2 + 1),
    [-1, 1],
    [0.85, 1.15],
  );

  // Film grain — re-seed every frame for organic noise
  const grainSeed = (t * 7 + 13) % 999;
  const idSuffix = useRef(Math.random().toString(36).slice(2)).current;
  const filterId = `grain-wash-${grainSeed}-${idSuffix}`;

  // Grain frequency subtly oscillates for variation
  const grainFreq = interpolate(
    Math.sin((t / FPS) * Math.PI * 0.5),
    [-1, 1],
    [0.65, 0.85],
  );

  // Secondary color wash — soft radial overlay that drifts
  const radialX = interpolate(
    Math.sin((t / FPS) * Math.PI * 0.15),
    [-1, 1],
    [30, 70],
  );
  const radialY = interpolate(
    Math.cos((t / FPS) * Math.PI * 0.12),
    [-1, 1],
    [35, 65],
  );

  // Text entrance — slow reveal if text provided
  const textOpacity = text ? interpolate(t, [20, 50], [0, 1], C) : 0;
  const textY = text ? interpolate(t, [20, 50], [30, 0], { ...C, easing: ease }) : 0;
  // Continuous subtle float
  const textFloat = interpolate(
    Math.sin((t / FPS) * Math.PI * 0.25),
    [-1, 1],
    [-6, 6],
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: color,
        filter: `hue-rotate(${hueRotate}deg) brightness(${brightness}) saturate(${saturation})`,
      }}
    >
      {/* Secondary radial wash for depth */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 80% 70% at ${radialX}% ${radialY}%, rgba(255,255,255,0.12) 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Darker vignette at edges */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 65% 55% at 50% 50%, transparent 0%, rgba(0,0,0,0.25) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Film grain overlay via SVG turbulence */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          mixBlendMode: "overlay",
          pointerEvents: "none",
        }}
      >
        <filter id={filterId}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency={grainFreq}
            numOctaves={4}
            seed={grainSeed}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect
          width="100%"
          height="100%"
          filter={`url(#${filterId})`}
          opacity={grainIntensity}
        />
      </svg>

      {/* Coarser grain layer for extra analog texture */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          mixBlendMode: "multiply",
          pointerEvents: "none",
        }}
      >
        <filter id={`${filterId}-coarse`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency={0.35}
            numOctaves={2}
            seed={(grainSeed + 500) % 999}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect
          width="100%"
          height="100%"
          filter={`url(#${filterId}-coarse)`}
          opacity={grainIntensity * 0.4}
        />
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
            transform: `translateY(${textY + textFloat}px)`,
          }}
        >
          <div
            style={{
              fontFamily: serif,
              fontSize: 110,
              fontStyle: "italic",
              lineHeight: 1.1,
              color: P.bg,
              textAlign: "center",
              maxWidth: 900,
              padding: "0 80px",
              textShadow: "0 4px 30px rgba(0,0,0,0.3)",
              letterSpacing: "-0.02em",
            }}
          >
            {text}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "abs-grain-wash",
  props: {
    text: "Chapter One",
    at: 15,
  },
  durationInFrames: 180,
};
