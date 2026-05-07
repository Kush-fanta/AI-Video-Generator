import React from "react";
import { useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK } from "./_tokens";
import { fadeEnvelope, fadeIn } from "./_anim";

loadInter();

export interface CalloutBoxProps {
  eyebrow: string;
  body: string;
  durationInFrames: number;
}

export const CalloutBox: React.FC<CalloutBoxProps> = ({
  eyebrow,
  body,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);
  const eyebrowOpacity = fadeIn(frame, 0, SK.motion.fadeFrames);
  const bodyOpacity = fadeIn(frame, 10, SK.motion.fadeFrames);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: SK.bg.navy,
        fontFamily: SK.font.sans,
        opacity,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: `0 ${SK.safe.sideMargin}px`,
      }}
    >
      <div
        style={{
          maxWidth: 960,
          width: "100%",
          backgroundColor: "rgba(215,69,69,0.08)",
          borderLeft: `4px solid ${SK.accent.red}`,
          borderRadius: "0 4px 4px 0",
          padding: "40px 48px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <span
          style={{
            fontFamily: SK.font.sans,
            fontWeight: SK.weight.semibold,
            fontSize: SK.size.label,
            color: SK.accent.red,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            opacity: eyebrowOpacity,
          }}
        >
          {eyebrow}
        </span>
        <p
          style={{
            fontFamily: SK.font.sans,
            fontWeight: SK.weight.medium,
            fontSize: 32,
            color: SK.text.white,
            lineHeight: 1.5,
            margin: 0,
            opacity: bodyOpacity,
          }}
        >
          {body}
        </p>
      </div>
    </div>
  );
};

export default CalloutBox;

export const demo = {
  compositionId: "sk-callout-box",
  durationInFrames: 150,
  props: {
    eyebrow: "Key insight",
    body: "India's defence exports grew 10× in a decade — faster than any other major economy.",
    durationInFrames: 150,
  },
};
