import React from "react";
import { useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK } from "./_tokens";
import { fadeEnvelope } from "./_anim";
import { interpolate, Easing } from "remotion";

loadInter();

export interface ProgressBarHProps {
  label: string;
  percent: number;
  sublabel?: string;
  durationInFrames: number;
}

export const ProgressBarH: React.FC<ProgressBarHProps> = ({
  label,
  percent,
  sublabel,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);

  const fillPercent = interpolate(frame, [12, 40], [0, percent], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

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
      <div style={{ width: "100%", maxWidth: 1200, display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Label row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span
            style={{
              fontFamily: SK.font.sans,
              fontWeight: SK.weight.medium,
              fontSize: 24,
              color: SK.text.white,
            }}
          >
            {label}
          </span>
          <span
            style={{
              fontFamily: SK.font.sans,
              fontWeight: SK.weight.bold,
              fontSize: 24,
              color: SK.accent.red,
            }}
          >
            {percent}%
          </span>
        </div>

        {/* Track */}
        <div
          style={{
            width: "100%",
            height: 16,
            backgroundColor: "rgba(255,255,255,0.15)",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${fillPercent}%`,
              backgroundColor: SK.accent.red,
              borderRadius: 8,
            }}
          />
        </div>

        {/* Sublabel */}
        {sublabel && (
          <span
            style={{
              fontFamily: SK.font.sans,
              fontWeight: SK.weight.regular,
              fontSize: SK.size.label,
              color: SK.text.mute,
            }}
          >
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
};

export default ProgressBarH;

export const demo = {
  compositionId: "sk-progress-bar-h",
  durationInFrames: 150,
  props: {
    label: "Indigenisation target",
    percent: 73,
    sublabel: "FY 2023-24",
    durationInFrames: 150,
  },
};
