/**
 * ArchivalEditorial — Full-bleed B&W photo with multi-line editorial caption box.
 *
 * Purpose: 60% frame-width dark box lower-left. IBM Plex Serif Bold 16px all-caps
 *          eyebrow (date/place), 16px gap, optional small red rule, then
 *          IBM Plex Serif Regular 24px body text.
 *
 * PHOTO_PLACEHOLDER: photoSrc is caller-supplied. Demo uses a dark gray
 * inline SVG data URI so the catalog renders without a real asset.
 *
 * Props: { photoSrc: string; eyebrow: string; body: string; durationInFrames: number }
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

export interface ArchivalEditorialProps {
  photoSrc: string;
  eyebrow: string;
  body: string;
  durationInFrames: number;
  /** "white" = cream register → Mode B grade + coral border. "default" = navy → grayscale dark. Defaults to "default". */
  palette?: "white" | "default";
}

const FRAME_WIDTH = 1920;
const BOX_WIDTH = Math.round(FRAME_WIDTH * 0.6); // 60% of frame
const BOX_PADDING = 32;
const RED_RULE_W = 40;
const RED_RULE_H = 2;

export const ArchivalEditorial: React.FC<ArchivalEditorialProps> = ({
  photoSrc,
  eyebrow,
  body,
  durationInFrames,
  palette = "default",
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);
  const isCream = palette === "white";
  const imgFilter = isCream ? MODE_B_FILTER : "grayscale(100%)";

  // Ken-burns: 1.0 → 1.03
  const scale = interpolate(frame, [0, durationInFrames], [1.0, 1.03], {
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
      {/* Photo */}
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

      {/* Editorial caption box — lower-left */}
      <div
        style={{
          position: "absolute",
          bottom: SK.safe.bottomLowerThird,
          left: SK.safe.sideMargin,
          width: BOX_WIDTH,
          backgroundColor: "rgba(0,0,0,0.80)",
          padding: BOX_PADDING,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* Eyebrow — Bold 16px all-caps */}
        <p
          style={{
            fontFamily: SK.font.serif,
            fontWeight: SK.weight.bold,
            fontSize: 16,
            color: SK.text.mute,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            margin: 0,
            padding: 0,
            lineHeight: 1.2,
          }}
        >
          {eyebrow}
        </p>

        {/* Small red rule above body */}
        <div
          style={{
            width: RED_RULE_W,
            height: RED_RULE_H,
            backgroundColor: SK.accent.red,
            flexShrink: 0,
          }}
        />

        {/* Body — Regular 24px */}
        <p
          style={{
            fontFamily: SK.font.serif,
            fontWeight: SK.weight.regular,
            fontSize: 24,
            color: SK.text.white,
            margin: 0,
            padding: 0,
            lineHeight: 1.5,
          }}
        >
          {body}
        </p>
      </div>
    </div>
  );
};

export default ArchivalEditorial;

const DEMO_PHOTO =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'%3E%3CdefinE%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23282828'/%3E%3Cstop offset='1' stop-color='%230a0a0a'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1920' height='1080' fill='url(%23g)'/%3E%3C/svg%3E";

export const demo = {
  compositionId: "sk-archival-editorial",
  durationInFrames: 180,
  props: {
    photoSrc: DEMO_PHOTO,
    eyebrow: "JUNE 1984 / AMRITSAR",
    body: "The operation changed the calculus of internal security for a generation.",
    durationInFrames: 180,
  },
};
