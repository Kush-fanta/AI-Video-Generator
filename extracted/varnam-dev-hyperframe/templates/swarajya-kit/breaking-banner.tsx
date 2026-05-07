import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK } from "./_tokens";
import { fadeEnvelope } from "./_anim";

loadInter();

export interface BreakingBannerProps {
  headline: string;
  subtext?: string;
  durationInFrames: number;
}

export const BreakingBanner: React.FC<BreakingBannerProps> = ({ headline, subtext, durationInFrames }) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);
  const barY = interpolate(frame, [0, 12], [-80, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic),
  });

  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: SK.bg.navy, fontFamily: SK.font.sans, opacity, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 80, backgroundColor: SK.bg.red, transform: `translateY(${barY}px)`, display: "flex", alignItems: "center", paddingLeft: SK.safe.sideMargin, paddingRight: SK.safe.sideMargin, gap: 20 }}>
        <div style={{ backgroundColor: SK.text.white, borderRadius: 8, padding: "6px 14px", flexShrink: 0 }}>
          <span style={{ fontFamily: SK.font.sans, fontWeight: SK.weight.black, fontSize: 16, color: SK.bg.black, letterSpacing: "0.05em" }}>BREAKING</span>
        </div>
        <span style={{ fontFamily: SK.font.sans, fontWeight: SK.weight.bold, fontSize: 32, color: SK.text.white, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
          {headline}
        </span>
      </div>
      {subtext && (
        <div style={{ position: "absolute", top: 80, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: SK.font.sans, fontWeight: SK.weight.medium, fontSize: SK.size.body, color: SK.text.white, textAlign: "center" }}>
            {subtext}
          </span>
        </div>
      )}
    </div>
  );
};

export default BreakingBanner;

export const demo = {
  compositionId: "sk-breaking-banner",
  durationInFrames: 150,
  props: { headline: "India crosses ₹21,000 cr in defence exports", subtext: "A 10× jump in a decade", durationInFrames: 150 },
};
