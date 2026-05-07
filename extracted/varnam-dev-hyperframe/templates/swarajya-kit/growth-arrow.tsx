/**
 * GrowthArrow — Before/after with large upward arrow between.
 * FROM value left (mute), TO value right (white), red SVG arrow grows center.
 */

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK } from "./_tokens";
import { fadeEnvelope, fadeIn } from "./_anim";

loadInter();

export interface GrowthArrowProps {
  from: string;
  to: string;
  label: string;
  durationInFrames: number;
}

export const GrowthArrow: React.FC<GrowthArrowProps> = ({ from, to, label, durationInFrames }) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);
  const arrowScale = interpolate(frame, [12, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const labelOp = fadeIn(frame, 28, SK.motion.fadeFrames);

  return (
    <AbsoluteFill style={{ backgroundColor: SK.bg.navy, opacity, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingLeft: SK.safe.sideMargin, paddingRight: SK.safe.sideMargin, gap: 48 }}>
      {/* Main row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 64, width: "100%", maxWidth: SK.safe.columnWidth + 200 }}>
        <span style={{ fontFamily: SK.font.sans, fontWeight: SK.weight.black, fontSize: SK.size.display, color: SK.text.mute, lineHeight: 1, textAlign: "center", flex: 1 }}>{from}</span>
        {/* Arrow */}
        <div style={{ transform: `scale(${arrowScale})`, transformOrigin: "center center", flexShrink: 0 }}>
          <svg width={80} height={120} viewBox="0 0 80 120">
            <rect x={32} y={40} width={16} height={70} fill={SK.accent.red} rx={2} />
            <polygon points="40,0 80,50 0,50" fill={SK.accent.red} />
          </svg>
        </div>
        <span style={{ fontFamily: SK.font.sans, fontWeight: SK.weight.black, fontSize: SK.size.display, color: SK.text.white, lineHeight: 1, textAlign: "center", flex: 1 }}>{to}</span>
      </div>
      {/* Label */}
      <span style={{ fontFamily: SK.font.sans, fontWeight: SK.weight.medium, fontSize: SK.size.body, color: SK.text.mute, textAlign: "center", opacity: labelOp }}>{label}</span>
    </AbsoluteFill>
  );
};

export default GrowthArrow;

export const demo = {
  compositionId: "sk-growth-arrow",
  durationInFrames: 150,
  props: {
    from: "₹1,941 cr",
    to: "₹21,083 cr",
    label: "Defence exports — 2013 to 2023",
    durationInFrames: 150,
  },
};
