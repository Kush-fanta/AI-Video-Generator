/**
 * ArchivalCaption — Full-bleed B&W photo with serif date/place caption box.
 *
 * Ref frame: /tmp/swarajya-study/frames/gPIKnV-kjgY/60s.png
 * Purpose: Lower-left dark box, IBM Plex Serif Bold 22px all-caps caption,
 *          thin red rule (2px × 40px) to the left of text.
 *          Ken-burns scale 1.0 → 1.04 on photo over duration.
 *
 * PHOTO_PLACEHOLDER: photoSrc is caller-supplied. Demo uses a dark gray
 * inline SVG data URI so the catalog renders without a real asset.
 *
 * Props: { photoSrc: string; caption: string; durationInFrames: number }
 */

import React from "react";
import { useCurrentFrame, interpolate, Easing, Img } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadIBMPlexSerif } from "@remotion/google-fonts/IBMPlexSerif";
import { SK } from "./_tokens";
import { fadeEnvelope } from "./_anim";

loadInter();
loadIBMPlexSerif();

// Mode B grade for cream register — sepia(15%) contrast(1.03) brightness(0.97)
// Cream register also applies 2px coral (#DC7070) border per visuals.md archival frame rule.
const MODE_B_FILTER = "sepia(15%) contrast(1.03) brightness(0.97)";
const CORAL_BORDER = "2px solid #DC7070";

export interface ArchivalCaptionProps {
  photoSrc: string;
  caption: string;
  durationInFrames: number;
  /** "white" = cream register → Mode B grade + coral border. "default" = navy → grayscale dark. Defaults to "default". */
  palette?: "white" | "default";
}

const BOX_PADDING = 24;
const RED_RULE_W = 2;
const RED_RULE_H = 40;
const RED_RULE_GAP = 14;

export const ArchivalCaption: React.FC<ArchivalCaptionProps> = ({
  photoSrc,
  caption,
  durationInFrames,
  palette = "default",
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);
  const isCream = palette === "white";
  const imgFilter = isCream ? MODE_B_FILTER : "grayscale(100%)";

  // Ken-burns: 1.0 → 1.04 over full duration
  const scale = interpolate(frame, [0, durationInFrames], [1.0, 1.04], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        opacity,
        backgroundColor: isCream ? "#F5F5F5" : SK.bg.black,
        ...(isCream ? { border: CORAL_BORDER, boxSizing: "border-box" } : {}),
      }}
    >
      {/* Photo layer — scales for ken-burns, transform-origin center */}
      <Img
        src={photoSrc}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          filter: imgFilter,
        }}
      />

      {/* Caption box — lower-left */}
      <div
        style={{
          position: "absolute",
          bottom: SK.safe.bottomLowerThird,
          left: SK.safe.sideMargin,
          backgroundColor: "rgba(0,0,0,0.72)",
          padding: BOX_PADDING,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          maxWidth: SK.safe.columnWidth,
        }}
      >
        {/* Thin red rule */}
        <div
          style={{
            width: RED_RULE_W,
            height: RED_RULE_H,
            backgroundColor: SK.accent.red,
            flexShrink: 0,
            marginRight: RED_RULE_GAP,
          }}
        />

        {/* Caption text */}
        <p
          style={{
            fontFamily: SK.font.serif,
            fontWeight: SK.weight.bold,
            fontSize: 22,
            color: SK.text.white,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            margin: 0,
            padding: 0,
            lineHeight: 1.3,
          }}
        >
          {caption}
        </p>
      </div>
    </div>
  );
};

export default ArchivalCaption;

// Dark gray gradient SVG stand-in for demo — no external file required
const DEMO_PHOTO =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23333'/%3E%3Cstop offset='1' stop-color='%23111'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1920' height='1080' fill='url(%23g)'/%3E%3C/svg%3E";

export const demo = {
  compositionId: "sk-archival-caption",
  durationInFrames: 150,
  props: {
    photoSrc: DEMO_PHOTO,
    caption: "DECEMBER 1971 / NEW DELHI",
    durationInFrames: 150,
  },
};
