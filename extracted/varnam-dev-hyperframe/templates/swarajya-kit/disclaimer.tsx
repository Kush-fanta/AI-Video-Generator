import React from "react";
import { useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK } from "./_tokens";
import { fadeEnvelope } from "./_anim";

loadInter();

export interface DisclaimerProps {
  text: string;
  durationInFrames: number;
}

export const Disclaimer: React.FC<DisclaimerProps> = ({
  text,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: SK.bg.cream,
        fontFamily: SK.font.sans,
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
        padding: `0 ${SK.safe.sideMargin}px`,
      }}
    >
      <h2
        style={{
          fontFamily: SK.font.sans,
          fontWeight: SK.weight.bold,
          fontSize: 32,
          color: SK.text.ink,
          margin: 0,
          textAlign: "center",
        }}
      >
        Disclaimer
      </h2>

      <p
        style={{
          fontFamily: SK.font.sans,
          fontWeight: SK.weight.regular,
          fontSize: 22,
          color: SK.text.ink,
          maxWidth: 1200,
          lineHeight: 1.6,
          textAlign: "center",
          margin: 0,
        }}
      >
        {text}
      </p>

      <div
        style={{
          width: 120,
          height: 2,
          backgroundColor: SK.accent.red,
        }}
      />
    </div>
  );
};

export default Disclaimer;

export const demo = {
  compositionId: "sk-disclaimer",
  durationInFrames: 150,
  props: {
    text: "This video is for informational purposes only. All figures sourced from publicly available government data.",
    durationInFrames: 150,
  },
};
