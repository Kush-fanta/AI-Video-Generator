/**
 * ImageStrip — Top half image strip, bottom half navy text block.
 *
 * Purpose: Horizontal editorial split — image sets the scene, text block below
 *          delivers the argument in a clean navy field.
 *
 * Props: { src: string; headline: string; body?: string; durationInFrames: number }
 */

import React from "react";
import { useCurrentFrame, Img } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK } from "./_tokens";
import { fadeEnvelope } from "./_anim";

loadInter();

export interface ImageStripProps {
  src: string;
  headline: string;
  body?: string;
  durationInFrames: number;
}

export const ImageStrip: React.FC<ImageStripProps> = ({
  src,
  headline,
  body,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        opacity,
      }}
    >
      {/* Top 540px — image strip */}
      <div style={{ position: "relative", width: "100%", height: 540, flexShrink: 0 }}>
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
      </div>

      {/* Bottom 540px — navy text block */}
      <div
        style={{
          flex: 1,
          backgroundColor: SK.bg.navy,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: `0 ${SK.safe.sideMargin}px`,
        }}
      >
        <div style={{ maxWidth: SK.safe.columnWidth, width: "100%", textAlign: "center" }}>
          <p
            style={{
              fontFamily: SK.font.sans,
              fontWeight: SK.weight.bold,
              fontSize: SK.size.headline,
              color: SK.text.white,
              lineHeight: 1.15,
              margin: 0,
              padding: 0,
            }}
          >
            {headline}
          </p>
          {body && (
            <p
              style={{
                fontFamily: SK.font.sans,
                fontWeight: SK.weight.medium,
                fontSize: SK.size.body,
                color: SK.text.mute,
                lineHeight: 1.5,
                margin: "20px 0 0 0",
                padding: 0,
              }}
            >
              {body}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageStrip;

export const demo = {
  compositionId: "sk-image-strip",
  durationInFrames: 150,
  props: {
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=540&fit=crop",
    headline: "Supply chains broke — and nobody noticed",
    body: "Three years of compounding decisions led here.",
    durationInFrames: 150,
  },
};
