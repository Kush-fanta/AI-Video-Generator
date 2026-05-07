/**
 * LowerThird — Talking-head name/role identifier overlay.
 *
 * Ref frame: /tmp/swarajya-study/frames/LLI-2y79-G4/50s.png (contextual lower-third over footage)
 * Purpose: Semi-transparent dark bar at bottom with name (Inter Bold 36px) and role (Inter Medium 22px),
 *          left-aligned inside bar, with a 3px × 60px red accent rule at the left edge.
 *          No background — layers over Video or Img supplied by the caller.
 *
 * Props: { name: string; role: string; durationInFrames: number }
 */

import React from "react";
import { useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK } from "./_tokens";
import { fadeEnvelope } from "./_anim";

loadInter();

export interface LowerThirdProps {
  name: string;
  role: string;
  durationInFrames: number;
}

// Bar geometry — 72% of 1920px frame width = 1382px, centered
const BAR_WIDTH_RATIO = 0.72;
const FRAME_WIDTH = 1920;
const BAR_WIDTH = Math.round(FRAME_WIDTH * BAR_WIDTH_RATIO);
const BAR_HEIGHT = 120;
const BAR_PADDING = 24;
const RED_RULE_WIDTH = 3;
const RED_RULE_HEIGHT = 60;
const RED_RULE_GAP = 20; // gap between rule and text

export const LowerThird: React.FC<LowerThirdProps> = ({
  name,
  role,
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
      {/* Bar positioned at bottom, centered horizontally */}
      <div
        style={{
          position: "absolute",
          bottom: SK.safe.bottomLowerThird,
          left: "50%",
          transform: "translateX(-50%)",
          width: BAR_WIDTH,
          height: BAR_HEIGHT,
          backgroundColor: "rgba(0,0,0,0.72)",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          padding: `0 ${BAR_PADDING}px`,
          boxSizing: "border-box",
        }}
      >
        {/* Red accent rule */}
        <div
          style={{
            width: RED_RULE_WIDTH,
            height: RED_RULE_HEIGHT,
            backgroundColor: SK.accent.red,
            flexShrink: 0,
            marginRight: RED_RULE_GAP,
          }}
        />

        {/* Name + role stack */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            minWidth: 0,
          }}
        >
          <p
            style={{
              fontFamily: SK.font.sans,
              fontWeight: SK.weight.bold,
              fontSize: 36,
              color: SK.text.white,
              margin: 0,
              padding: 0,
              lineHeight: 1.1,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {name}
          </p>
          <p
            style={{
              fontFamily: SK.font.sans,
              fontWeight: SK.weight.medium,
              fontSize: 22,
              color: SK.text.mute,
              margin: 0,
              padding: 0,
              lineHeight: 1.1,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {role}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LowerThird;

export const demo = {
  compositionId: "sk-lower-third",
  durationInFrames: 150,
  props: {
    name: "Dr Gautam Desiraju",
    role: "Structural chemist — IISc Bangalore",
    durationInFrames: 150,
  },
};
