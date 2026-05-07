/**
 * ImageLeftSplit — Left half image, right half navy text column.
 *
 * Purpose: Paired visual-text layout — image argues visually on the left,
 *          headline and subtext anchor the argument on the right.
 *
 * Props: { src: string; headline: string; subtext?: string; durationInFrames: number }
 */

import React from "react";
import { useCurrentFrame, Img } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK, resolveSKPalette, type SKPaletteName } from "./_tokens";
import { fadeEnvelope } from "./_anim";

loadInter();

export interface ImageLeftSplitProps {
  src: string;
  headline: string;
  subtext?: string;
  durationInFrames: number;
  palette?: SKPaletteName;
}

export const ImageLeftSplit: React.FC<ImageLeftSplitProps> = ({
  src,
  headline,
  subtext,
  durationInFrames,
  palette = "default",
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);
  const pal = resolveSKPalette(palette);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "row",
        opacity,
      }}
    >
      {/* Left half — image */}
      <div style={{ position: "relative", width: 960, height: "100%", flexShrink: 0 }}>
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

      {/* Right half — palette background text column */}
      <div
        style={{
          flex: 1,
          backgroundColor: pal.background,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: `0 ${SK.safe.sideMargin}px`,
        }}
      >
        <div style={{ maxWidth: SK.safe.columnWidth, width: "100%" }}>
          <p
            style={{
              fontFamily: SK.font.sans,
              fontWeight: SK.weight.bold,
              fontSize: SK.size.headline,
              color: pal.text,
              lineHeight: 1.15,
              margin: 0,
              padding: 0,
            }}
          >
            {headline}
          </p>
          {subtext && (
            <p
              style={{
                fontFamily: SK.font.sans,
                fontWeight: SK.weight.medium,
                fontSize: SK.size.body,
                color: pal.textMuted,
                lineHeight: 1.5,
                margin: "20px 0 0 0",
                padding: 0,
              }}
            >
              {subtext}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageLeftSplit;

export const demo = {
  compositionId: "sk-image-left-split",
  durationInFrames: 150,
  props: {
    src: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=960&h=1080&fit=crop",
    headline: "A city rebuilt in ten years",
    subtext: "Infrastructure investment reached record levels by 2023.",
    durationInFrames: 150,
  },
};
