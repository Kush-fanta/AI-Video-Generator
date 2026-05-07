/**
 * ImageSourceCredit — Full-frame image with a source attribution pill top-right.
 *
 * Purpose: Clean editorial attribution — image holds the frame, pill marks provenance
 *          without interrupting composition.
 *
 * Props: { src: string; source: string; durationInFrames: number }
 */

import React from "react";
import { useCurrentFrame, Img } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK } from "./_tokens";
import { fadeEnvelope } from "./_anim";

loadInter();

export interface ImageSourceCreditProps {
  src: string;
  source: string;
  durationInFrames: number;
}

export const ImageSourceCredit: React.FC<ImageSourceCreditProps> = ({
  src,
  source,
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
        overflow: "hidden",
        opacity,
      }}
    >
      {/* Full-frame cover image */}
      <Img
        src={src}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      {/* Source pill — top-right corner */}
      <div
        style={{
          position: "absolute",
          top: 24,
          right: 24,
          backgroundColor: "rgba(0,0,0,0.65)",
          borderRadius: 6,
          padding: "8px 16px",
        }}
      >
        <span
          style={{
            fontFamily: SK.font.sans,
            fontWeight: SK.weight.regular,
            fontSize: 16,
            color: SK.text.white,
            whiteSpace: "nowrap",
          }}
        >
          {`Source: ${source}`}
        </span>
      </div>
    </div>
  );
};

export default ImageSourceCredit;

export const demo = {
  compositionId: "sk-image-source-credit",
  durationInFrames: 150,
  props: {
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop",
    source: "Ministry of Defence",
    durationInFrames: 150,
  },
};
