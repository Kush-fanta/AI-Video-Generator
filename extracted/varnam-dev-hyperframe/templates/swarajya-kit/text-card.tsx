/**
 * TextCard — Plain centered statement card.
 *
 * Ref frame: /tmp/swarajya-study/frames/Rc7Knnuai-Q/95s.png
 * Purpose: Dark-field card for bridge statements and rhetorical hooks (e.g. "This isn't theoretical.")
 *
 * Props: { text: string; durationInFrames: number; bg?: "navy" | "black" }
 */

import React from "react";
import { useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK, resolveSKPalette, type SKPaletteName } from "./_tokens";
import { fadeEnvelope } from "./_anim";

loadInter();

export interface TextCardProps {
  text: string;
  durationInFrames: number;
  bg?: "navy" | "black";
  palette?: SKPaletteName;
}

export const TextCard: React.FC<TextCardProps> = ({
  text,
  durationInFrames,
  palette = "default",
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);
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
        opacity,
      }}
    >
      <p
        style={{
          fontFamily: SK.font.sans,
          fontWeight: SK.weight.bold,
          fontSize: SK.size.headline,
          color: pal.text,
          maxWidth: SK.safe.columnWidth,
          width: "100%",
          textAlign: "center",
          lineHeight: 1.2,
          margin: 0,
          padding: 0,
        }}
      >
        {text}
      </p>
    </div>
  );
};

export default TextCard;

export const demo = {
  compositionId: "sk-text-card",
  durationInFrames: 120,
  props: {
    text: "This isn't theoretical.",
    durationInFrames: 120,
    bg: "navy" as const,
  },
};
