/**
 * PullQuote — Full-card pull quote on dark background.
 *
 * Purpose: Large IBM Plex Serif Italic 48px quote centered in column 880.
 *          Inter Medium 18px all-caps attribution below (SK.text.mute), 32px gap.
 *          Optional opening red " (72px) positioned top-left of the quote block.
 *
 * Props: { quote: string; attribution: string; showMark?: boolean;
 *          durationInFrames: number; bg?: "navy" | "black" }
 */

import React from "react";
import { useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadIBMPlexSerif } from "@remotion/google-fonts/IBMPlexSerif";
import { SK } from "./_tokens";
import { fadeEnvelope } from "./_anim";

loadInter();
loadIBMPlexSerif();

export interface PullQuoteProps {
  quote: string;
  attribution: string;
  showMark?: boolean;
  durationInFrames: number;
  /**
   * bg: colour register for this beat.
   * "navy" (default) — prosecution register, white text, red mark.
   * "black" — same as navy on black background.
   * "cream" — evidence register (#F5F5F5 bg), ink text (#202020), coral mark (#DC7070).
   *   Use for sourced pull-quotes in cream chapters (e.g. B56 Singur/investor read).
   */
  bg?: "navy" | "black" | "cream";
}

export const PullQuote: React.FC<PullQuoteProps> = ({
  quote,
  attribution,
  showMark = true,
  durationInFrames,
  bg = "navy",
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);
  const isCream = bg === "cream";
  const backgroundColor = bg === "black" ? SK.bg.black : isCream ? SK.bg.cream : SK.bg.navy;
  // Cream register: ink text + coral mark. Dark registers: white text + red mark.
  const quoteColor = isCream ? SK.text.ink : SK.text.white;
  const markColor = isCream ? "#DC7070" : SK.accent.red;
  const attrColor = isCream ? "rgba(32,32,32,0.55)" : SK.text.mute;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity,
      }}
    >
      {/* Quote block — positioned relative so the mark can anchor to it */}
      <div
        style={{
          maxWidth: SK.safe.columnWidth,
          width: "100%",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 32,
          // Top padding so the oversized " mark doesn't clip above the block
          paddingTop: showMark ? 48 : 0,
        }}
      >
        {/* Opening quotation mark — mark colour per register, 72px, top-left of block */}
        {showMark ? (
          <span
            style={{
              position: "absolute",
              top: -16,
              left: 0,
              fontFamily: SK.font.serif,
              fontWeight: SK.weight.bold,
              fontSize: 72,
              color: markColor,
              lineHeight: 1,
              userSelect: "none",
              pointerEvents: "none",
            }}
          >
            {"\u201C"}
          </span>
        ) : null}

        {/* Quote text — IBM Plex Serif Italic 48px */}
        <p
          style={{
            fontFamily: SK.font.serif,
            fontWeight: SK.weight.regular,
            fontStyle: "italic",
            fontSize: 48,
            color: quoteColor,
            textAlign: "center",
            lineHeight: 1.45,
            margin: 0,
            padding: 0,
          }}
        >
          {quote}
        </p>

        {/* Attribution — Inter Medium 18px all-caps, colour per register */}
        <p
          style={{
            fontFamily: SK.font.sans,
            fontWeight: SK.weight.medium,
            fontSize: 18,
            color: attrColor,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            textAlign: "center",
            margin: 0,
            padding: 0,
            lineHeight: 1.2,
          }}
        >
          {attribution}
        </p>
      </div>
    </div>
  );
};

export default PullQuote;

export const demo = {
  compositionId: "sk-pull-quote",
  durationInFrames: 150,
  props: {
    quote: "The poverty of our ambition is matched only by the abundance of our excuses.",
    attribution: "— Arun Shourie",
    showMark: true,
    durationInFrames: 150,
    bg: "navy" as const,
  },
};
