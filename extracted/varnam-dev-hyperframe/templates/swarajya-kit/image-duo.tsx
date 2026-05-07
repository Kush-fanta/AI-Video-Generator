/**
 * ImageDuo — Two images side by side with 8px gap and optional corner labels.
 *
 * Purpose: Direct visual comparison — two images at equal weight, labels identify
 *          each without competing with the images themselves.
 *
 * Props: { srcLeft: string; srcRight: string; labelLeft?: string; labelRight?: string; durationInFrames: number }
 */

import React from "react";
import { useCurrentFrame, Img } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK } from "./_tokens";
import { fadeEnvelope } from "./_anim";

loadInter();

export interface ImageDuoProps {
  srcLeft: string;
  srcRight: string;
  labelLeft?: string;
  labelRight?: string;
  durationInFrames: number;
}

const DuoPanel: React.FC<{ src: string; label?: string }> = ({ src, label }) => (
  <div style={{ position: "relative", width: 956, height: "100%", flexShrink: 0 }}>
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
    {label && (
      <div
        style={{
          position: "absolute",
          top: 24,
          left: 24,
          backgroundColor: "rgba(0,0,0,0.6)",
          padding: "6px 12px",
        }}
      >
        <span
          style={{
            fontFamily: SK.font.sans,
            fontWeight: SK.weight.medium,
            fontSize: 20,
            color: SK.text.white,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>
      </div>
    )}
  </div>
);

export const ImageDuo: React.FC<ImageDuoProps> = ({
  srcLeft,
  srcRight,
  labelLeft,
  labelRight,
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
        flexDirection: "row",
        gap: 8,
        overflow: "hidden",
        opacity,
      }}
    >
      <DuoPanel src={srcLeft} label={labelLeft} />
      <DuoPanel src={srcRight} label={labelRight} />
    </div>
  );
};

export default ImageDuo;

export const demo = {
  compositionId: "sk-image-duo",
  durationInFrames: 150,
  props: {
    srcLeft: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=960&h=1080&fit=crop",
    srcRight: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=960&h=1080&fit=crop",
    labelLeft: "2014",
    labelRight: "2024",
    durationInFrames: 150,
  },
};
