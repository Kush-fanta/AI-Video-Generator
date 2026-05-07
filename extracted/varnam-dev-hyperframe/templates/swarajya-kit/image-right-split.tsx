/**
 * ImageRightSplit — Left half navy text column, right half image.
 *
 * Purpose: Mirror of ImageLeftSplit. Text leads on the left; image closes on the right.
 *          Use to alternate rhythm when pairing split layouts in sequence.
 *
 * Props: { src: string; headline: string; subtext?: string; durationInFrames: number }
 */

import React from "react";
import { useCurrentFrame, Img } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK, resolveSKPalette } from "./_tokens";
import { fadeEnvelope } from "./_anim";

loadInter();

// Mode B grade: sepia(15%) contrast(1.03) brightness(0.97)
// Applied when palette="white" (cream register). Navy register: unfiltered.
const MODE_B_FILTER = "sepia(15%) contrast(1.03) brightness(0.97)";

export interface ImageRightSplitProps {
  src: string;
  headline: string;
  subtext?: string;
  durationInFrames: number;
  /** "white" = cream register → Mode B grade applied. "default" = navy/dark → unfiltered. Defaults to "white". */
  palette?: "white" | "default";
}

export const ImageRightSplit: React.FC<ImageRightSplitProps> = ({
  src,
  headline,
  subtext,
  durationInFrames,
  palette = "white",
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);
  const imgFilter = palette === "white" ? MODE_B_FILTER : undefined;
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
      {/* Left half — text column (register-aware) */}
      <div
        style={{
          width: 960,
          flexShrink: 0,
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

      {/* Right half — image */}
      <div style={{ position: "relative", flex: 1, height: "100%" }}>
        <Img
          src={src}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            ...(imgFilter ? { filter: imgFilter } : {}),
          }}
        />
      </div>
    </div>
  );
};

export default ImageRightSplit;

export const demo = {
  compositionId: "sk-image-right-split",
  durationInFrames: 150,
  props: {
    src: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=960&h=1080&fit=crop",
    headline: "The numbers tell a different story",
    subtext: "Growth outpaced official projections for three consecutive quarters.",
    durationInFrames: 150,
  },
};
