import React from "react";
import { useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK } from "./_tokens";
import { fadeIn, fadeOut } from "./_anim";

loadInter();

export interface MidRollHookProps {
  hook: string;
  cta?: string;
  durationInFrames: number;
}

export const MidRollHook: React.FC<MidRollHookProps> = ({
  hook,
  cta,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const exitFrame = durationInFrames - 20;

  const entryOpacity = fadeIn(frame, 0, SK.motion.fadeFrames);
  const exitOpacity = fadeOut(frame, durationInFrames, 8);
  const opacity = frame >= exitFrame ? exitOpacity : entryOpacity;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: SK.bg.black,
        fontFamily: SK.font.sans,
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        padding: `0 ${SK.safe.sideMargin}px`,
      }}
    >
      <h1
        style={{
          fontFamily: SK.font.sans,
          fontWeight: SK.weight.black,
          fontSize: SK.size.headline,
          color: SK.text.white,
          maxWidth: SK.safe.columnWidth,
          textAlign: "center",
          margin: 0,
          lineHeight: 1.15,
        }}
      >
        {hook}
      </h1>

      <div
        style={{
          width: 120,
          height: 2,
          backgroundColor: SK.accent.red,
        }}
      />

      {cta && (
        <span
          style={{
            fontFamily: SK.font.sans,
            fontWeight: SK.weight.medium,
            fontSize: 24,
            color: SK.text.mute,
            textAlign: "center",
          }}
        >
          {cta}
        </span>
      )}
    </div>
  );
};

export default MidRollHook;

export const demo = {
  compositionId: "sk-mid-roll-hook",
  durationInFrames: 90,
  props: {
    hook: "But here's what no one told you.",
    cta: "Stay for the data.",
    durationInFrames: 90,
  },
};
