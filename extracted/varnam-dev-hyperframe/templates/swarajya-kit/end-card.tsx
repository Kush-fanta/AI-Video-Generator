/**
 * EndCard — Closing statement with attribution.
 * Centered composition: punch line → gap → attribution with red square dot prefix.
 */

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK, resolveSKPalette, type SKPaletteName } from "./_tokens";
import { fadeEnvelope } from "./_anim";

const { fontFamily: interFamily } = loadInter();

export interface EndCardProps {
  statement: string;
  attribution: string;
  durationInFrames: number;
  bg?: "navy" | "black";
  palette?: SKPaletteName;
}

export const EndCard: React.FC<EndCardProps> = ({
  statement,
  attribution,
  durationInFrames,
  palette = "default",
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames);
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
          width: SK.safe.columnWidthNarrow,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 0,
        }}
      >
        {/* Punch line */}
        <span
          style={{
            fontFamily: interFamily,
            fontWeight: SK.weight.bold,
            fontSize: 60,
            color: pal.text,
            lineHeight: 1.15,
          }}
        >
          {statement}
        </span>

        {/* Gap */}
        <div style={{ height: 48 }} />

        {/* Attribution row */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            textAlign: "left",
          }}
        >
          {/* Accent square dot */}
          <div
            style={{
              width: 6,
              height: 6,
              backgroundColor: pal.accent,
              flexShrink: 0,
              marginTop: 6,
            }}
          />
          <span
            style={{
              fontFamily: interFamily,
              fontWeight: SK.weight.medium,
              fontSize: 18,
              color: pal.textMuted,
              lineHeight: 1.5,
              maxWidth: SK.safe.columnWidthNarrow - 20,
            }}
          >
            {attribution}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default EndCard;

export const demo = {
  compositionId: "sk-end-card",
  durationInFrames: 120,
  props: {
    statement: "The drone era just rewrote the rules of air defence.",
    attribution: "Source: Ministry of Defence press brief, April 2025",
    durationInFrames: 120,
    bg: "navy",
  } satisfies EndCardProps,
};
