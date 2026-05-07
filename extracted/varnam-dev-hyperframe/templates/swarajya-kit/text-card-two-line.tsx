/**
 * TextCardTwoLine — Headline + subhead stacked on a dark card.
 *
 * Ref frame: /tmp/swarajya-study/frames/Rc7Knnuai-Q/25s.png (title/headline with sub-label hierarchy)
 * Purpose: Two-tier text card — Inter Bold 64px headline, Inter Medium 28px subhead, 32px gap.
 *          Subhead fades in 6 frames after headline for a staggered reveal.
 *
 * Props: { headline: string; subhead: string; durationInFrames: number; bg?: "navy" | "black" }
 */

import React from "react";
import { useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK, resolveSKPalette, type SKPaletteName } from "./_tokens";
import { fadeEnvelope, fadeIn } from "./_anim";

loadInter();

export interface TextCardTwoLineProps {
  headline: string;
  subhead: string;
  durationInFrames: number;
  bg?: "navy" | "black";
  palette?: SKPaletteName;
}

const SUBHEAD_DELAY = 6; // frames

export const TextCardTwoLine: React.FC<TextCardTwoLineProps> = ({
  headline,
  subhead,
  durationInFrames,
  palette = "default",
}) => {
  const frame = useCurrentFrame();

  // Entire card envelope — fade in at 0, fade out before end
  const cardOpacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);

  // Subhead staggered fade-in (independent of card envelope, clamps to 1 and holds)
  const subheadOpacity = fadeIn(frame, SUBHEAD_DELAY, SK.motion.fadeFrames);

  const pal = resolveSKPalette(palette);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: pal.background,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: cardOpacity,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 32,
          maxWidth: SK.safe.columnWidth,
          width: "100%",
        }}
      >
        <p
          style={{
            fontFamily: SK.font.sans,
            fontWeight: SK.weight.bold,
            fontSize: SK.size.headline,
            color: pal.text,
            margin: 0,
            padding: 0,
            textAlign: "center",
            lineHeight: 1.2,
          }}
        >
          {headline}
        </p>
        <p
          style={{
            fontFamily: SK.font.sans,
            fontWeight: SK.weight.medium,
            fontSize: SK.size.body,
            color: pal.text,
            margin: 0,
            padding: 0,
            textAlign: "center",
            lineHeight: 1.4,
            opacity: subheadOpacity,
          }}
        >
          {subhead}
        </p>
      </div>
    </div>
  );
};

export default TextCardTwoLine;

export const demo = {
  compositionId: "sk-text-card-two-line",
  durationInFrames: 150,
  props: {
    headline: "India didn't just defend.",
    subhead: "It reorganised the air-defence doctrine overnight.",
    durationInFrames: 150,
    bg: "navy" as const,
  },
};
