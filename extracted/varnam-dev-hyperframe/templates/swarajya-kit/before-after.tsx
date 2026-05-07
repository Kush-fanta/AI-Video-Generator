/**
 * BeforeAfter — Two-column card layout. Left = muted before, right = red after.
 * Staggered fadeIn: left at frame 0, right at frame 12.
 */

import React from "react";
import { AbsoluteFill, useCurrentFrame, Img } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK, resolveSKPalette, type SKPaletteName } from "./_tokens";
import { fadeEnvelope, fadeIn } from "./_anim";

loadInter();

export interface BeforeAfterProps {
  before: string;
  after: string;
  label: string;
  durationInFrames: number;
  /**
   * palette: colour register for this beat.
   * Default: "default" (navy). Pass "white" for cream register (e.g. B55 Singur/Sanand compare).
   */
  palette?: SKPaletteName;
  /**
   * beforeSrc / afterSrc: optional photo backgrounds for each card.
   * When provided, the card renders the photo full-bleed with Mode B grade
   * (cream register) or unfiltered (navy register), with the text lockup
   * sitting on a bottom gradient wash. Use for photographic compares like
   * B55 (Singur shell vs Sanand operational).
   */
  beforeSrc?: string;
  afterSrc?: string;
}

const Pill: React.FC<{ text: string; color: string }> = ({ text, color }) => (
  <div
    style={{
      display: "inline-block",
      padding: "6px 18px",
      borderRadius: 20,
      border: `1.5px solid ${color}`,
      fontFamily: SK.font.sans,
      fontWeight: SK.weight.medium,
      fontSize: SK.size.label,
      color,
      marginBottom: 32,
      letterSpacing: "0.06em",
      textTransform: "uppercase" as const,
    }}
  >
    {text}
  </div>
);

const MODE_B_FILTER = "sepia(15%) contrast(1.03) brightness(0.97)";

const PhotoCard: React.FC<{
  src: string;
  side: "before" | "after";
  opacity: number;
  label: string;
  palette: SKPaletteName;
}> = ({ src, side, opacity, label, palette }) => {
  const pal = resolveSKPalette(palette);
  const isAfter = side === "after";
  const pillColor = isAfter ? pal.accent : pal.textMuted;
  const filter = palette === "white" ? MODE_B_FILTER : undefined;
  // Cream register → dark gradient, ink text; navy register → cream gradient, cream text
  const gradientBase = palette === "white" ? "rgba(32,32,32,0.82)" : "rgba(15,27,45,0.86)";
  const textOnGradient = palette === "white" ? "#F5F5F5" : pal.text;

  return (
    <div
      style={{
        flex: 1,
        position: "relative",
        overflow: "hidden",
        borderRadius: 12,
        opacity,
      }}
    >
      <Img
        src={src}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          ...(filter ? { filter } : {}),
        }}
      />
      {/* Bottom gradient wash for text legibility */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(to top, ${gradientBase} 0%, ${gradientBase.replace("0.8", "0.0").replace("82", "00").replace("86", "00")} 48%, transparent 62%)`,
        }}
      />
      {/* Text lockup bottom-left */}
      <div
        style={{
          position: "absolute",
          left: 40,
          right: 40,
          bottom: 40,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Pill text={isAfter ? "After" : "Before"} color={pillColor} />
        <div
          style={{
            fontFamily: SK.font.sans,
            fontWeight: SK.weight.bold,
            fontSize: SK.size.headline,
            color: isAfter ? pal.accent : textOnGradient,
            lineHeight: 1.05,
            marginBottom: 12,
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
};

export const BeforeAfter: React.FC<BeforeAfterProps> = ({ before, after, label, durationInFrames, palette = "default", beforeSrc, afterSrc }) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);
  const leftOpacity = fadeIn(frame, 0, 12);
  const rightOpacity = fadeIn(frame, 12, 12);
  const pal = resolveSKPalette(palette);
  const usePhotos = Boolean(beforeSrc && afterSrc);

  const cardBase: React.CSSProperties = {
    flex: 1,
    borderRadius: 12,
    padding: "64px 60px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: pal.background,
        opacity,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingLeft: SK.safe.sideMargin,
        paddingRight: SK.safe.sideMargin,
      }}
    >
      <div style={{ display: "flex", gap: 8, width: "100%", maxWidth: 1528, height: usePhotos ? 720 : undefined }}>
        {usePhotos ? (
          <>
            <PhotoCard src={beforeSrc!} side="before" opacity={leftOpacity} label={before} palette={palette} />
            <PhotoCard src={afterSrc!} side="after" opacity={rightOpacity} label={after} palette={palette} />
          </>
        ) : (
          <>
            {/* Text-only Before */}
            <div style={{ ...cardBase, backgroundColor: palette === "white" ? "rgba(32,32,32,0.05)" : "rgba(255,255,255,0.05)", opacity: leftOpacity }}>
              <Pill text="Before" color={pal.textMuted} />
              <div style={{ fontFamily: SK.font.sans, fontWeight: SK.weight.black, fontSize: SK.size.display, color: pal.textMuted, lineHeight: 1, textAlign: "center", marginBottom: 24 }}>
                {before}
              </div>
              <div style={{ fontFamily: SK.font.sans, fontWeight: SK.weight.medium, fontSize: SK.size.body, color: pal.textMuted, textAlign: "center" }}>{label}</div>
            </div>
            {/* Text-only After */}
            <div style={{ ...cardBase, backgroundColor: "rgba(215,69,69,0.15)", opacity: rightOpacity }}>
              <Pill text="After" color={pal.accent} />
              <div style={{ fontFamily: SK.font.sans, fontWeight: SK.weight.black, fontSize: SK.size.display, color: pal.accent, lineHeight: 1, textAlign: "center", marginBottom: 24 }}>
                {after}
              </div>
              <div style={{ fontFamily: SK.font.sans, fontWeight: SK.weight.medium, fontSize: SK.size.body, color: pal.textMuted, textAlign: "center" }}>{label}</div>
            </div>
          </>
        )}
      </div>
    </AbsoluteFill>
  );
};

export default BeforeAfter;

export const demo = {
  compositionId: "sk-before-after",
  durationInFrames: 150,
  props: {
    before: "₹1,941 cr",
    after: "₹21,083 cr",
    label: "Defence exports",
    durationInFrames: 150,
  },
};
