/**
 * StatStacked — Single-column stacked stat: eyebrow → number → thin red rule → descriptor.
 *
 * Ref frame: /tmp/swarajya-study/frames/gPIKnV-kjgY/15s.png ("8 BALLISTIC MISSILES" dark overlay)
 * Purpose: Compressed variant of StatBigNumber. All elements stack vertically in tight rhythm.
 *          Eyebrow sets context (14px, micro, all-caps), number carries the claim (120px bold),
 *          a 2px × 60px red rule separates, descriptor resolves (24px, offwhite, 2 lines max).
 *
 * Props: { eyebrow: string; number: string; descriptor: string; durationInFrames: number; bg?: "navy" | "black" }
 */

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadSpaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { SK, resolveSKPalette, type SKPaletteName } from "./_tokens";
import { fadeEnvelope, subtleScale } from "./_anim";

loadInter();
loadSpaceGrotesk();

export interface StatStackedProps {
  eyebrow: string;
  number: string;
  descriptor: string;
  durationInFrames: number;
  bg?: "navy" | "black";
  palette?: SKPaletteName;
}

export const StatStacked: React.FC<StatStackedProps> = ({
  eyebrow,
  number,
  descriptor,
  durationInFrames,
  palette = "default",
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);
  const scale = subtleScale(frame, 0, 18);
  const pal = resolveSKPalette(palette);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: pal.background,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          maxWidth: SK.safe.columnWidthNarrow,
          width: "100%",
          // Compact vertical rhythm
          gap: 0,
        }}
      >
        {/* Eyebrow — smallest, most muted */}
        <span
          style={{
            fontFamily: SK.font.sans,
            fontWeight: SK.weight.medium,
            fontSize: SK.size.micro, // 14px
            color: pal.textMuted,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            textAlign: "center",
            marginBottom: 12,
          }}
        >
          {eyebrow}
        </span>

        {/* Number — dominant payload */}
        <span
          style={{
            fontFamily: SK.font.display,
            fontWeight: SK.weight.bold,
            fontSize: 120,
            color: pal.text,
            lineHeight: 1,
            textAlign: "center",
            transform: `scale(${scale})`,
            transformOrigin: "center center",
            display: "block",
            marginBottom: 20,
          }}
        >
          {number}
        </span>

        {/* Thin red rule: 2px × 60px */}
        <div
          style={{
            width: 60,
            height: 2,
            backgroundColor: pal.accent,
            marginBottom: 20,
            flexShrink: 0,
          }}
        />

        {/* Descriptor — resolves the number */}
        <p
          style={{
            fontFamily: SK.font.sans,
            fontWeight: SK.weight.medium,
            fontSize: 24,
            color: pal.textMuted,
            textAlign: "center",
            lineHeight: 1.45,
            maxWidth: SK.safe.columnWidthNarrow,
            margin: 0,
          }}
        >
          {descriptor}
        </p>
      </div>
    </AbsoluteFill>
  );
};

export default StatStacked;

export const demo = {
  compositionId: "sk-stat-stacked",
  durationInFrames: 150,
  props: {
    eyebrow: "In a single night",
    number: "600",
    descriptor: "drones intercepted across the northwest border",
    durationInFrames: 150,
    bg: "navy" as const,
  },
};
