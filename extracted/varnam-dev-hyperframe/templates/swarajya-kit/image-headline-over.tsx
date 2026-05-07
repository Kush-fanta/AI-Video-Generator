/**
 * ImageHeadlineOver — Full-frame image with a centered headline burned over it.
 *
 * Purpose: Maximum visual impact — the image carries emotional weight, the headline
 *          drives the argument. Radial gradient behind text only for legibility.
 *
 * Props: { src: string; headline: string; durationInFrames: number }
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

export interface ImageHeadlineOverProps {
  src: string;
  headline: string;
  durationInFrames: number;
  /** "white" = cream register → Mode B grade applied. "default" = navy/dark → unfiltered. Defaults to "white". */
  palette?: "white" | "default";
  /**
   * "cover" (default) — image fills the frame; crops to 16:9. Use for landscape frames.
   * "contain" — image fits entirely; sides/top letterbox with palette-appropriate fill.
   *   Use for portrait assets where cropping cuts the subject's face or body.
   */
  fit?: "cover" | "contain";
}

export const ImageHeadlineOver: React.FC<ImageHeadlineOverProps> = ({
  src,
  headline,
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

      {/* Radial gradient behind text — center only */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 900px 300px at center, rgba(0,0,0,0.7) 0%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Centered headline */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: `0 ${SK.safe.sideMargin}px`,
        }}
      >
        <p
          style={{
            fontFamily: SK.font.sans,
            fontWeight: SK.weight.black,
            fontSize: SK.size.display,
            color: SK.text.white,
            textAlign: "center",
            lineHeight: 1.1,
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

export default ImageHeadlineOver;

export const demo = {
  compositionId: "sk-image-headline-over",
  durationInFrames: 150,
  props: {
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop",
    headline: "The line no one was watching",
    durationInFrames: 150,
  },
};
