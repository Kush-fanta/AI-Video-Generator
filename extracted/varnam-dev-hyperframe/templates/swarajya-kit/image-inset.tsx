/**
 * ImageInset — Navy background with large headline and a small inset image top-right.
 *
 * Purpose: Text-dominant layout with supporting visual evidence — headline takes
 *          the lead, inset image provides reference without overwhelming.
 *
 * Props: { src: string; headline: string; durationInFrames: number }
 */

import React from "react";
import { useCurrentFrame, Img } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK } from "./_tokens";
import { fadeEnvelope } from "./_anim";

loadInter();

export interface ImageInsetProps {
  src: string;
  headline: string;
  durationInFrames: number;
}

export const ImageInset: React.FC<ImageInsetProps> = ({
  src,
  headline,
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
        backgroundColor: SK.bg.navy,
        opacity,
      }}
    >
      {/* Inset image — top-right, 480×320, 120px margin, red 3px border */}
      <div
        style={{
          position: "absolute",
          top: SK.safe.sideMargin,
          right: SK.safe.sideMargin,
          width: 480,
          height: 320,
          border: `3px solid ${SK.accent.red}`,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <Img
          src={src}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </div>

      {/* Headline — left-aligned at sideMargin, vertically centered */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          paddingLeft: SK.safe.sideMargin,
          paddingRight: 480 + SK.safe.sideMargin + 60,
        }}
      >
        <p
          style={{
            fontFamily: SK.font.sans,
            fontWeight: SK.weight.bold,
            fontSize: SK.size.headline,
            color: SK.text.white,
            lineHeight: 1.15,
            margin: 0,
            padding: 0,
            maxWidth: SK.safe.columnWidth,
          }}
        >
          {headline}
        </p>
      </div>
    </div>
  );
};

export default ImageInset;

export const demo = {
  compositionId: "sk-image-inset",
  durationInFrames: 150,
  props: {
    src: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=480&h=320&fit=crop",
    headline: "The border that shifted without a shot fired",
    durationInFrames: 150,
  },
};
