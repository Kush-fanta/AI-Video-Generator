/**
 * ArchivalActionOverlay — Full-bleed B&W photo with centered italic action text.
 *
 * Ref frame: /tmp/swarajya-study/frames/vFpwyeIpM5I/25s.png
 * Purpose: Archival photo darkened to 0.65 brightness. Short all-caps italic
 *          phrase centered — "IT REORGANISED.", "THEY DID NOTHING."
 *          Inter Medium Italic 64px white. Period included in actionText prop.
 *
 * PHOTO_PLACEHOLDER: photoSrc is caller-supplied. Demo uses a dark gray
 * inline SVG data URI so the catalog renders without a real asset.
 *
 * Props: { photoSrc: string; actionText: string; durationInFrames: number }
 */

import React from "react";
import { useCurrentFrame, Img } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK } from "./_tokens";
import { fadeEnvelope, fadeIn, fadeOut } from "./_anim";

loadInter();

// Mode B grade for cream register — sepia(15%) contrast(1.03) brightness(0.97)
// Cream register also applies 2px coral (#DC7070) border per visuals.md archival frame rule.
const MODE_B_FILTER = "sepia(15%) contrast(1.03) brightness(0.97)";
const CORAL_BORDER = "2px solid #DC7070";

export interface ArchivalActionOverlayProps {
  photoSrc: string;
  actionText: string;
  durationInFrames: number;
  /** "white" = cream register → Mode B grade + coral border. "default" = navy → grayscale+dark. Defaults to "default". */
  palette?: "white" | "default";
}

export const ArchivalActionOverlay: React.FC<ArchivalActionOverlayProps> = ({
  photoSrc,
  actionText,
  durationInFrames,
  palette = "default",
}) => {
  const frame = useCurrentFrame();
  const isCream = palette === "white";
  const imgFilter = isCream
    ? MODE_B_FILTER
    : "grayscale(100%) brightness(0.65)";
  // Root envelope fades the whole composition
  const rootOpacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);
  // Text gets its own fade that starts slightly after the photo
  const textOpacity = Math.min(
    fadeIn(frame, SK.motion.fadeFrames, SK.motion.fadeFrames),
    fadeOut(frame, durationInFrames, SK.motion.fadeFrames),
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        opacity: rootOpacity,
        backgroundColor: isCream ? "#F5F5F5" : SK.bg.black,
        ...(isCream ? { border: CORAL_BORDER, boxSizing: "border-box" } : {}),
      }}
    >
      {/* Photo — cream: Mode B grade; navy: grayscale+darkened */}
      <Img
        src={photoSrc}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: imgFilter,
        }}
      />

      {/* Centered italic action text */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: textOpacity,
        }}
      >
        <p
          style={{
            fontFamily: SK.font.sans,
            fontWeight: SK.weight.medium,
            fontStyle: "italic",
            fontSize: 64,
            color: SK.text.white,
            textTransform: "uppercase",
            letterSpacing: "0.03em",
            textAlign: "center",
            maxWidth: SK.safe.columnWidth,
            margin: 0,
            padding: 0,
            lineHeight: 1.15,
          }}
        >
          {actionText}
        </p>
      </div>
    </div>
  );
};

export default ArchivalActionOverlay;

const DEMO_PHOTO =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'%3E%3CdefinE%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23303030'/%3E%3Cstop offset='1' stop-color='%230d0d0d'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1920' height='1080' fill='url(%23g)'/%3E%3C/svg%3E";

export const demo = {
  compositionId: "sk-archival-action-overlay",
  durationInFrames: 120,
  props: {
    photoSrc: DEMO_PHOTO,
    actionText: "IT REORGANISED.",
    durationInFrames: 120,
  },
};
