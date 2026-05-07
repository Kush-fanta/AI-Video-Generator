/**
 * ImageGrid2x2 — Four images in a 2×2 grid, edge to edge, no gap.
 *
 * Purpose: Multi-image evidence block — four equal-weight visuals filling the
 *          frame. Each cell is exactly 960×540px at cover fit.
 *
 * Props: { src1: string; src2: string; src3: string; src4: string; durationInFrames: number }
 */

import React from "react";
import { useCurrentFrame, Img } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK } from "./_tokens";
import { fadeEnvelope } from "./_anim";

loadInter();

// Mode B grade for cream register — sepia(15%) contrast(1.03) brightness(0.97)
const MODE_B_FILTER = "sepia(15%) contrast(1.03) brightness(0.97)";

export interface ImageGrid2x2Props {
  src1: string;
  src2: string;
  src3: string;
  src4: string;
  durationInFrames: number;
  /** "white" = cream register → Mode B grade applied. "default" = navy/dark → unfiltered. Defaults to "white". */
  palette?: "white" | "default";
}

const GridCell: React.FC<{ src: string; imgFilter?: string }> = ({ src, imgFilter }) => (
  <div style={{ position: "relative", width: 960, height: 540, overflow: "hidden", flexShrink: 0 }}>
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
);

export const ImageGrid2x2: React.FC<ImageGrid2x2Props> = ({
  src1,
  src2,
  src3,
  src4,
  durationInFrames,
  palette = "white",
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);
  const imgFilter = palette === "white" ? MODE_B_FILTER : undefined;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        opacity,
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", flexDirection: "row", flexShrink: 0 }}>
        <GridCell src={src1} imgFilter={imgFilter} />
        <GridCell src={src2} imgFilter={imgFilter} />
      </div>
      {/* Bottom row */}
      <div style={{ display: "flex", flexDirection: "row", flexShrink: 0 }}>
        <GridCell src={src3} imgFilter={imgFilter} />
        <GridCell src={src4} imgFilter={imgFilter} />
      </div>
    </div>
  );
};

export default ImageGrid2x2;

export const demo = {
  compositionId: "sk-image-grid-2x2",
  durationInFrames: 150,
  props: {
    src1: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=960&h=540&fit=crop",
    src2: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=960&h=540&fit=crop",
    src3: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=960&h=540&fit=crop",
    src4: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=960&h=540&fit=crop",
    durationInFrames: 150,
  },
};
