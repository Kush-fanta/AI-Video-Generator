/**
 * ImageFullBleed — Full-frame image with bottom gradient and optional caption.
 *
 * Purpose: Hero visual backing — cover image fills the frame, gradient protects
 *          legibility of optional caption text at the bottom.
 *
 * Props: { src: string; caption?: string; durationInFrames: number }
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

export interface ImageFullBleedProps {
  src: string;
  caption?: string;
  durationInFrames: number;
  /** "white" = cream register → Mode B grade applied. "default" = navy/dark → unfiltered. Defaults to "white". */
  palette?: "white" | "default";
  /**
   * "cover" (default) — image fills the frame, crops edges to match 16:9.
   *   Use for landscape archival with negative space that tolerates cropping.
   * "contain" — image fits entirely inside frame; letterbox/pillarbox bars fill the
   *   surrounding area with the palette's background tone (dark for navy, cream for white).
   *   Use for portraits (single subject), historical frames with important edge detail,
   *   or any asset where cropping would cut the subject's face/body.
   */
  fit?: "cover" | "contain";
}

export const ImageFullBleed: React.FC<ImageFullBleedProps> = ({
  src,
  caption,
  durationInFrames,
  palette = "white",
  fit = "cover",
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);
  const imgFilter = palette === "white" ? MODE_B_FILTER : undefined;
  // Letterbox background: dark for navy register, cream-ish for white register.
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

      {/* Bottom-to-top gradient overlay (only when caption is present) */}
      {caption && <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 400,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 100%)",
          pointerEvents: "none",
        }}
      />}

      {/* Optional caption — bottom-center over gradient */}
      {caption && (
        <div
          style={{
            position: "absolute",
            bottom: SK.safe.bottomLowerThird,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: SK.font.sans,
              fontWeight: SK.weight.medium,
              fontSize: SK.size.body,
              color: SK.text.white,
              textAlign: "center",
              maxWidth: SK.safe.columnWidth,
            }}
          >
            {caption}
          </span>
        </div>
      )}
    </div>
  );
};

export default ImageFullBleed;

export const demo = {
  compositionId: "sk-image-full-bleed",
  durationInFrames: 150,
  props: {
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop",
    caption: "The valley at dawn",
    durationInFrames: 150,
  },
};
