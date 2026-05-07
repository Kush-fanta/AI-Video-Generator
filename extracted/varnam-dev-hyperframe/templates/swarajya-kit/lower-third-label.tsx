/**
 * LowerThirdLabel — Single contextual word/phrase overlay at the bottom of frame.
 *
 * Ref frame: /tmp/swarajya-study/frames/LLI-2y79-G4/15s.png ("to strengthen" italic label over footage)
 * Ref frame: /tmp/swarajya-study/frames/LLI-2y79-G4/50s.png ("These include" with subtle backing)
 * Purpose: Minimal label for talking-head context. Inter Medium 32px italic, white, bottom-center,
 *          80px from bottom. Drop-shadow for legibility. No bar, no background — pure text overlay.
 *
 * Props: { label: string; durationInFrames: number }
 */

import React from "react";
import { useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK } from "./_tokens";
import { fadeEnvelope } from "./_anim";

loadInter();

export interface LowerThirdLabelProps {
  label: string;
  durationInFrames: number;
}

export const LowerThirdLabel: React.FC<LowerThirdLabelProps> = ({
  label,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        opacity,
      }}
    >
      <p
        style={{
          position: "absolute",
          bottom: 80,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: SK.font.sans,
          fontWeight: SK.weight.medium,
          fontStyle: "italic",
          fontSize: 32,
          color: SK.text.white,
          margin: 0,
          padding: 0,
          lineHeight: 1.2,
          // Legibility drop-shadow over any footage or background
          textShadow: "0 2px 8px rgba(0,0,0,0.85), 0 1px 2px rgba(0,0,0,0.9)",
        }}
      >
        {label}
      </p>
    </div>
  );
};

export default LowerThirdLabel;

export const demo = {
  compositionId: "sk-lower-third-label",
  durationInFrames: 120,
  props: {
    label: "to strengthen",
    durationInFrames: 120,
  },
};
