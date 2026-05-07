import React from "react";
import { useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK } from "./_tokens";
import { fadeEnvelope } from "./_anim";

loadInter();

export interface ScrollTickerProps {
  items: string[];
  durationInFrames: number;
}

export const ScrollTicker: React.FC<ScrollTickerProps> = ({
  items,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);
  const tickerText = items.join("  ·  ");
  const translateX = -frame * 2;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        fontFamily: SK.font.sans,
        position: "relative",
        opacity,
      }}
    >
      {/* Bottom ticker bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 56,
          backgroundColor: SK.bg.black,
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          paddingLeft: 16,
          gap: 16,
        }}
      >
        {/* LIVE pill */}
        <div
          style={{
            backgroundColor: SK.accent.red,
            borderRadius: 4,
            padding: "3px 10px",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: SK.font.sans,
              fontWeight: SK.weight.black,
              fontSize: SK.size.micro,
              color: SK.text.white,
              letterSpacing: "0.06em",
            }}
          >
            LIVE
          </span>
        </div>

        {/* Scrolling ticker text */}
        <div style={{ overflow: "hidden", flex: 1 }}>
          <span
            style={{
              fontFamily: SK.font.sans,
              fontWeight: SK.weight.medium,
              fontSize: 24,
              color: SK.text.white,
              whiteSpace: "nowrap",
              display: "inline-block",
              transform: `translateX(${translateX}px)`,
            }}
          >
            {tickerText}&nbsp;&nbsp;&nbsp;&nbsp;{tickerText}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ScrollTicker;

export const demo = {
  compositionId: "sk-scroll-ticker",
  durationInFrames: 150,
  props: {
    items: [
      "Defence exports hit ₹21,083 cr",
      "HAL delivers 15 Tejas in Q3",
      "DRDO budget up 12%",
    ],
    durationInFrames: 150,
  },
};
