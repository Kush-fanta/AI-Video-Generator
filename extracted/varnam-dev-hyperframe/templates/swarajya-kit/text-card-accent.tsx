/**
 * TextCardAccent — Centered statement with one word rendered in SK.accent.red.
 *
 * Ref frame: /tmp/swarajya-study/frames/Rc7Knnuai-Q/95s.png
 * Purpose: Statement card where one emphasized word (accentWord) is colored red inline.
 *          First case-insensitive match is accented; rest stays white.
 *
 * Props: { text: string; accentWord: string; durationInFrames: number; bg?: "navy" | "black" }
 */

import React from "react";
import { useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK, resolveSKPalette, type SKPaletteName } from "./_tokens";
import { fadeEnvelope } from "./_anim";

loadInter();

export interface TextCardAccentProps {
  text: string;
  accentWord: string;
  durationInFrames: number;
  bg?: "navy" | "black";
  palette?: SKPaletteName;
}

/** Split text into segments: before, matched word, after. Returns null if no match. */
function splitOnFirstMatch(
  text: string,
  word: string,
): [string, string, string] | null {
  const idx = text.toLowerCase().indexOf(word.toLowerCase());
  if (idx === -1) return null;
  return [text.slice(0, idx), text.slice(idx, idx + word.length), text.slice(idx + word.length)];
}

export const TextCardAccent: React.FC<TextCardAccentProps> = ({
  text,
  accentWord,
  durationInFrames,
  palette = "default",
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);
  const pal = resolveSKPalette(palette);
  const segments = splitOnFirstMatch(text, accentWord);

  const textStyle: React.CSSProperties = {
    fontFamily: SK.font.sans,
    fontWeight: SK.weight.bold,
    fontSize: SK.size.headline,
    lineHeight: 1.2,
    margin: 0,
    padding: 0,
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: pal.background,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity,
      }}
    >
      <p
        style={{
          ...textStyle,
          color: pal.text,
          maxWidth: SK.safe.columnWidth,
          width: "100%",
          textAlign: "center",
        }}
      >
        {segments === null ? (
          text
        ) : (
          <>
            {segments[0]}
            <span style={{ color: pal.accent }}>{segments[1]}</span>
            {segments[2]}
          </>
        )}
      </p>
    </div>
  );
};

export default TextCardAccent;

export const demo = {
  compositionId: "sk-text-card-accent",
  durationInFrames: 120,
  props: {
    text: "Now here's the problem.",
    accentWord: "problem",
    durationInFrames: 120,
    bg: "navy" as const,
  },
};
