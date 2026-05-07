import React from "react";
import { useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK } from "./_tokens";
import { fadeIn, fadeOut } from "./_anim";

loadInter();

export interface SourceCardProps {
  source: string;
  url?: string;
  durationInFrames: number;
}

export const SourceCard: React.FC<SourceCardProps> = ({
  source,
  url,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const fadeInOpacity = fadeIn(frame, 6, SK.motion.fadeFrames);
  const fadeOutOpacity = fadeOut(frame, durationInFrames, SK.motion.fadeFrames);
  const opacity = Math.min(fadeInOpacity, fadeOutOpacity);

  const truncatedUrl = url && url.length > 50 ? url.slice(0, 50) + "..." : url;

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
      <div
        style={{
          position: "absolute",
          bottom: 40,
          right: 40,
          maxWidth: 480,
          backgroundColor: "rgba(0,0,0,0.80)",
          borderRadius: 8,
          padding: "20px 24px",
        }}
      >
        <div style={{ display: "flex", gap: 6, alignItems: "baseline" }}>
          <span
            style={{
              fontFamily: SK.font.sans,
              fontWeight: SK.weight.medium,
              fontSize: 16,
              color: SK.text.mute,
              flexShrink: 0,
            }}
          >
            Source:
          </span>
          <span
            style={{
              fontFamily: SK.font.sans,
              fontWeight: SK.weight.semibold,
              fontSize: 16,
              color: SK.text.white,
            }}
          >
            {source}
          </span>
        </div>

        {truncatedUrl && (
          <div style={{ marginTop: 4 }}>
            <span
              style={{
                fontFamily: SK.font.sans,
                fontWeight: SK.weight.regular,
                fontSize: SK.size.micro,
                color: SK.text.mute,
              }}
            >
              {truncatedUrl}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SourceCard;

export const demo = {
  compositionId: "sk-source-card",
  durationInFrames: 150,
  props: {
    source: "Ministry of Defence, Annual Report 2023",
    durationInFrames: 150,
  },
};
