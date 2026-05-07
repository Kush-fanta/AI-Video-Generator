import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { C, FPS, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface MeshGradientProps extends BaseProps {
  /** Optional centered text */
  text?: string;
  /** Frame offset */
  at?: number;
}

/** Gradient orb config */
interface Orb {
  color: string;
  size: number;
  /** Motion parameters — unique orbit for each orb */
  xFreq: number;
  yFreq: number;
  xPhase: number;
  yPhase: number;
  xCenter: number;
  yCenter: number;
  xAmplitude: number;
  yAmplitude: number;
  opacity: number;
}

const ORBS: Orb[] = [
  {
    color: P.terracotta,
    size: 700,
    xFreq: 0.08, yFreq: 0.06,
    xPhase: 0, yPhase: 0.5,
    xCenter: 540, yCenter: 700,
    xAmplitude: 200, yAmplitude: 250,
    opacity: 0.35,
  },
  {
    color: P.sage,
    size: 600,
    xFreq: 0.1, yFreq: 0.07,
    xPhase: 2, yPhase: 1.2,
    xCenter: 300, yCenter: 1100,
    xAmplitude: 180, yAmplitude: 200,
    opacity: 0.3,
  },
  {
    color: P.mauve,
    size: 550,
    xFreq: 0.06, yFreq: 0.09,
    xPhase: 4, yPhase: 3,
    xCenter: 750, yCenter: 500,
    xAmplitude: 220, yAmplitude: 180,
    opacity: 0.28,
  },
  {
    color: P.slate,
    size: 500,
    xFreq: 0.09, yFreq: 0.05,
    xPhase: 1.5, yPhase: 4.2,
    xCenter: 200, yCenter: 1500,
    xAmplitude: 160, yAmplitude: 220,
    opacity: 0.25,
  },
  {
    color: P.light,
    size: 800,
    xFreq: 0.04, yFreq: 0.035,
    xPhase: 3.5, yPhase: 2,
    xCenter: 540, yCenter: 960,
    xAmplitude: 250, yAmplitude: 300,
    opacity: 0.2,
  },
  {
    color: P.terracotta,
    size: 400,
    xFreq: 0.12, yFreq: 0.08,
    xPhase: 5, yPhase: 0.8,
    xCenter: 800, yCenter: 1300,
    xAmplitude: 140, yAmplitude: 160,
    opacity: 0.22,
  },
];

/**
 * MeshGradient — Soft blurred color orbs drifting slowly.
 * 6 large circles of different palette colors at low opacity,
 * each on its own orbital path. Heavy CSS blur creates the mesh
 * gradient effect where overlapping regions blend. Dreamy, warm,
 * atmospheric. Optional centered text floats above.
 */
export const MeshGradient: React.FC<MeshGradientProps> = ({
  text,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  const time = t / FPS;

  // Text entrance
  const textOpacity = text ? interpolate(t, [20, 50], [0, 1], C) : 0;
  const textY = text ? interpolate(t, [20, 50], [24, 0], { ...C, easing: ease }) : 0;
  const textFloat = interpolate(
    Math.sin(time * Math.PI * 0.2),
    [-1, 1],
    [-5, 5],
  );

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Orb container — heavy blur */}
      <div
        style={{
          position: "absolute",
          inset: -100, // overflow for blur edge bleed
          filter: "blur(120px)",
          pointerEvents: "none",
        }}
      >
        {ORBS.map((orb, i) => {
          // Orbital position
          const x = orb.xCenter + Math.sin(time * orb.xFreq * Math.PI * 2 + orb.xPhase) * orb.xAmplitude;
          const y = orb.yCenter + Math.cos(time * orb.yFreq * Math.PI * 2 + orb.yPhase) * orb.yAmplitude;

          // Opacity breathing — each orb pulses at its own rate
          const breathe = interpolate(
            Math.sin(time * 0.5 + i * 1.2),
            [-1, 1],
            [orb.opacity * 0.7, orb.opacity],
          );

          // Scale pulse — subtle size variation
          const scale = interpolate(
            Math.sin(time * 0.3 + i * 0.9),
            [-1, 1],
            [0.9, 1.1],
          );

          // Entrance — orbs fade in with stagger
          const entrance = interpolate(t, [i * 4, i * 4 + 25], [0, 1], C);

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x - orb.size / 2 + 100, // offset for inset -100
                top: y - orb.size / 2 + 100,
                width: orb.size,
                height: orb.size,
                borderRadius: "50%",
                backgroundColor: orb.color,
                opacity: breathe * entrance,
                transform: `scale(${scale})`,
              }}
            />
          );
        })}
      </div>

      {/* Subtle noise texture on top for organic feel */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`,
          backgroundSize: "256px 256px",
          mixBlendMode: "overlay",
          opacity: 0.5,
          pointerEvents: "none",
        }}
      />

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
              fontSize: 92,
              fontStyle: "italic",
              lineHeight: 1.15,
              color: P.text,
              textAlign: "center",
              maxWidth: 860,
              padding: "0 80px",
              letterSpacing: "-0.02em",
              textShadow: "0 2px 40px rgba(237,234,228,0.8)",
            }}
          >
            {text}
          </div>
        </div>
      )}

      {/* Subtle corner label */}
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
          opacity: interpolate(t, [35, 50], [0, 0.3], C),
        }}
      >
        ATMOSPHERE
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "abs-mesh-gradient",
  props: {
    text: "Atmosphere",
    at: 15,
  },
  durationInFrames: 180,
};
