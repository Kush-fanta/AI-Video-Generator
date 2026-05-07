/**
 * RedFullBleed — Pure red full-bleed section-break card.
 *
 * Ref frame: /tmp/swarajya-study/frames/Rc7Knnuai-Q/70s.png
 * Purpose: High-impact narrative shift. Entire frame bleeds SK.bg.red
 *          (= SK.accent.red = #D74545). Centered white text, Inter Bold 88px,
 *          column ≤ 880. Optional small white eyebrow above in all-caps 18px
 *          at 80% alpha, letter-spacing 0.1em.
 *
 * Props: { text: string; eyebrow?: string; durationInFrames: number }
 */

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK } from "./_tokens";
import { fadeEnvelope } from "./_anim";

loadInter();

export interface RedFullBleedProps {
  text: string;
  eyebrow?: string;
  durationInFrames: number;
}

export const RedFullBleed: React.FC<RedFullBleedProps> = ({
  text,
  eyebrow,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: SK.bg.red,
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
          textAlign: "center",
        }}
      >
        {eyebrow && (
          <span
            style={{
              fontFamily: SK.font.sans,
              fontWeight: SK.weight.medium,
              fontSize: SK.size.label,
              color: "rgba(255,255,255,0.80)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            {eyebrow}
          </span>
        )}

        <span
          style={{
            fontFamily: SK.font.sans,
            fontWeight: SK.weight.bold,
            fontSize: 88,
            color: SK.text.white,
            lineHeight: 1.1,
            textAlign: "center",
          }}
        >
          {text}
        </span>
      </div>
    </AbsoluteFill>
  );
};

export default RedFullBleed;

export const demo = {
  compositionId: "sk-red-full-bleed",
  durationInFrames: 120,
  props: {
    text: "Now here's the problem.",
    eyebrow: "The cost trap",
    durationInFrames: 120,
  },
};
