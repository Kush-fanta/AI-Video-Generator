/**
 * RatioTile — Big ratio expression: "100x", "24:1", or "396%".
 *
 * Ref frame: /tmp/swarajya-study/frames/Rc7Knnuai-Q/25s.png
 * Purpose: Single dominant ratio number that communicates scale at a glance.
 *          The number (Space Grotesk Bold 180px) + suffix (80px, baseline-
 *          aligned) are the visual anchor. Small all-caps label sits above;
 *          short caption sits below.
 *
 * Props: {
 *   label: string; ratio: string; suffix: "x" | ":1" | "%";
 *   caption?: string; durationInFrames: number; bg?: "navy" | "black"
 * }
 */

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadSpaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { SK } from "./_tokens";
import { fadeEnvelope, subtleScale } from "./_anim";

loadInter();
loadSpaceGrotesk();

export interface RatioTileProps {
  label: string;
  ratio: string;
  suffix: "x" | ":1" | "%";
  caption?: string;
  durationInFrames: number;
  bg?: "navy" | "black";
}

export const RatioTile: React.FC<RatioTileProps> = ({
  label,
  ratio,
  suffix,
  caption,
  durationInFrames,
  bg = "navy",
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);
  const scale = subtleScale(frame, 0, 18);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bg === "black" ? SK.bg.black : SK.bg.navy,
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
          gap: 20,
          maxWidth: SK.safe.columnWidth,
          width: "100%",
        }}
      >
        {/* Eyebrow label */}
        <span
          style={{
            fontFamily: SK.font.sans,
            fontWeight: SK.weight.medium,
            fontSize: SK.size.label,
            color: SK.text.mute,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            textAlign: "center",
          }}
        >
          {label}
        </span>

        {/* Ratio number + suffix — inline, baseline-aligned */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            transform: `scale(${scale})`,
            transformOrigin: "center bottom",
          }}
        >
          <span
            style={{
              fontFamily: SK.font.display,
              fontWeight: SK.weight.bold,
              fontSize: 180,
              color: SK.text.white,
              lineHeight: 1,
            }}
          >
            {ratio}
          </span>
          <span
            style={{
              fontFamily: SK.font.display,
              fontWeight: SK.weight.bold,
              fontSize: 80,
              color: SK.accent.red,
              lineHeight: 1,
              marginLeft: 8,
            }}
          >
            {suffix}
          </span>
        </div>

        {/* Caption below */}
        {caption && (
          <span
            style={{
              fontFamily: SK.font.sans,
              fontWeight: SK.weight.medium,
              fontSize: 24,
              color: SK.text.mute,
              textAlign: "center",
              maxWidth: SK.safe.columnWidthNarrow,
              lineHeight: 1.5,
            }}
          >
            {caption}
          </span>
        )}
      </div>
    </AbsoluteFill>
  );
};

export default RatioTile;

export const demo = {
  compositionId: "sk-ratio-tile",
  durationInFrames: 150,
  props: {
    label: "Cost differential",
    ratio: "100",
    suffix: "x" as const,
    caption: "Every intercept of a cheap drone depletes a premium missile",
    durationInFrames: 150,
    bg: "navy" as const,
  },
};
