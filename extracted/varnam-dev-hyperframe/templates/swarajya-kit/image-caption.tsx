/**
 * ImageCaption — Full-frame image with a narrow caption bar pinned to the bottom.
 *
 * Purpose: Photojournalistic treatment — image fills the frame, 48px opaque bar
 *          carries the caption and optional source credit without obscuring content.
 *
 * Props: { src: string; caption: string; source?: string; durationInFrames: number }
 */

import React from "react";
import { useCurrentFrame, Img } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK } from "./_tokens";
import { fadeEnvelope } from "./_anim";

loadInter();

// Mode B grade: sepia(15%) contrast(1.03) brightness(0.97)
// Applied when palette="white" (cream register). Navy register: unfiltered.
const MODE_B_FILTER = "sepia(15%) contrast(1.03) brightness(0.97)";

export interface ImageCaptionProps {
  src: string;
  caption: string;
  source?: string;
  durationInFrames: number;
  /** "white" = cream register → Mode B grade applied. "default" = navy/dark → unfiltered. Defaults to "white". */
  palette?: "white" | "default";
  /** "cover" (default) fills the frame; "contain" letterboxes so subject isn't cropped. */
  fit?: "cover" | "contain";
}

export const ImageCaption: React.FC<ImageCaptionProps> = ({
  src,
  caption,
  source,
  durationInFrames,
  palette = "white",
  fit = "cover",
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);
  const imgFilter = palette === "white" ? MODE_B_FILTER : undefined;
  const bg = palette === "default" ? "#0A1220" : "#EAE4D8";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        opacity,
        backgroundColor: bg,
      }}
    >
      {/* Image — cover fills, contain letterboxes. */}
      <Img
        src={src}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: fit,
          ...(imgFilter ? { filter: imgFilter } : {}),
        }}
      />

      {/* Caption bar — 48px, pinned to bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 48,
          backgroundColor: "rgba(0,0,0,0.80)",
          display: "flex",
          alignItems: "center",
          paddingLeft: 40,
          paddingRight: 40,
        }}
      >
        {/* Caption — left-aligned */}
        <span
          style={{
            fontFamily: SK.font.sans,
            fontWeight: SK.weight.medium,
            fontSize: 22,
            color: SK.text.white,
            flex: 1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {caption}
        </span>

        {/* Source — right-aligned */}
        {source && (
          <span
            style={{
              fontFamily: SK.font.sans,
              fontWeight: SK.weight.regular,
              fontSize: SK.size.label,
              color: SK.text.mute,
              flexShrink: 0,
              marginLeft: 24,
              whiteSpace: "nowrap",
            }}
          >
            {source}
          </span>
        )}
      </div>
    </div>
  );
};

export default ImageCaption;

export const demo = {
  compositionId: "sk-image-caption",
  durationInFrames: 150,
  props: {
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop",
    caption: "Soldiers cross the northern ridge at dusk",
    source: "Reuters / 2024",
    durationInFrames: 150,
  },
};
