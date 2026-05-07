/**
 * LowerThirdQuote — Pull-quote lower-third for talking-head footage.
 *
 * Purpose: Semi-transparent dark bar at bottom, 80% frame width, centered.
 *          Inside: italic IBM Plex Serif 32px quote (2 lines max), then
 *          Inter Medium 16px all-caps attribution right-aligned below.
 *          3px red rule at left edge of bar.
 *          No background — layers over Video or Img supplied by the caller.
 *
 * Props: { quote: string; attribution: string; durationInFrames: number }
 */

import React from "react";
import { useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadIBMPlexSerif } from "@remotion/google-fonts/IBMPlexSerif";
import { SK } from "./_tokens";
import { fadeEnvelope } from "./_anim";

loadInter();
loadIBMPlexSerif();

export interface LowerThirdQuoteProps {
  quote: string;
  attribution: string;
  durationInFrames: number;
}

const FRAME_WIDTH = 1920;
const BAR_WIDTH = Math.round(FRAME_WIDTH * 0.8);
const BAR_PADDING_V = 28;
const BAR_PADDING_H = 32;
const RED_RULE_W = 3;

export const LowerThirdQuote: React.FC<LowerThirdQuoteProps> = ({
  quote,
  attribution,
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
      {/* Bar — bottom-center */}
      <div
        style={{
          position: "absolute",
          bottom: SK.safe.bottomLowerThird,
          left: "50%",
          transform: "translateX(-50%)",
          width: BAR_WIDTH,
          backgroundColor: "rgba(0,0,0,0.78)",
          padding: `${BAR_PADDING_V}px ${BAR_PADDING_H}px`,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
        }}
      >
        {/* Red rule — left edge */}
        <div
          style={{
            width: RED_RULE_W,
            backgroundColor: SK.accent.red,
            flexShrink: 0,
            marginRight: 24,
            alignSelf: "stretch",
          }}
        />

        {/* Quote + attribution stack */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            flex: 1,
            minWidth: 0,
          }}
        >
          {/* Quote — IBM Plex Serif Italic 32px */}
          <p
            style={{
              fontFamily: SK.font.serif,
              fontWeight: SK.weight.regular,
              fontStyle: "italic",
              fontSize: 32,
              color: SK.text.white,
              margin: 0,
              padding: 0,
              lineHeight: 1.4,
              // Clamp to 2 lines via overflow ellipsis
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {quote}
          </p>

          {/* Attribution — Inter Medium 16px all-caps, right-aligned */}
          <p
            style={{
              fontFamily: SK.font.sans,
              fontWeight: SK.weight.medium,
              fontSize: 16,
              color: SK.text.mute,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              margin: 0,
              padding: 0,
              lineHeight: 1.2,
              textAlign: "right",
            }}
          >
            {attribution}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LowerThirdQuote;

export const demo = {
  compositionId: "sk-lower-third-quote",
  durationInFrames: 180,
  props: {
    quote: "We were not ready — and the people who were supposed to know, knew.",
    attribution: "— Narasimha Rao, 1991",
    durationInFrames: 180,
  },
};
