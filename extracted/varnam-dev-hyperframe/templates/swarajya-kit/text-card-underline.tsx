/**
 * TextCardUnderline — Centered statement where the accent word is red AND has a red underline rule.
 *
 * Ref frame: /tmp/swarajya-study/frames/Rc7Knnuai-Q/45s.png
 * Purpose: "But how?" layout — accent word colored red with a thin red underline drawn beneath it,
 *          matching word width. Underline is 2px height, 8px below baseline.
 *
 * Props: { text: string; accentWord: string; durationInFrames: number; bg?: "navy" | "black" }
 *
 * Implementation note: The underline is achieved with `borderBottom` on an inline-block span,
 * which tracks word width exactly without measuring the DOM.
 */

import React from "react";
import { useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK } from "./_tokens";
import { fadeEnvelope } from "./_anim";

loadInter();

export interface TextCardUnderlineProps {
  text: string;
  accentWord: string;
  durationInFrames: number;
  bg?: "navy" | "black";
}

function splitOnFirstMatch(
  text: string,
  word: string,
): [string, string, string] | null {
  const idx = text.toLowerCase().indexOf(word.toLowerCase());
  if (idx === -1) return null;
  return [text.slice(0, idx), text.slice(idx, idx + word.length), text.slice(idx + word.length)];
}

export const TextCardUnderline: React.FC<TextCardUnderlineProps> = ({
  text,
  accentWord,
  durationInFrames,
  bg = "navy",
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);

  const backgroundColor = bg === "black" ? SK.bg.black : SK.bg.navy;
  const segments = splitOnFirstMatch(text, accentWord);

  const textStyle: React.CSSProperties = {
    fontFamily: SK.font.sans,
    fontWeight: SK.weight.bold,
    fontSize: SK.size.headline,
    color: SK.text.white,
    lineHeight: 1.2,
    margin: 0,
    padding: 0,
    maxWidth: SK.safe.columnWidth,
    width: "100%",
    textAlign: "center",
  };

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
      <p style={textStyle}>
        {segments === null ? (
          text
        ) : (
          <>
            {segments[0]}
            <span
              style={{
                color: SK.accent.red,
                display: "inline-block",
                borderBottom: `3px solid ${SK.accent.red}`,
                paddingBottom: 8,
              }}
            >
              {segments[1]}
            </span>
            {segments[2]}
          </>
        )}
      </p>
    </div>
  );
};

export default TextCardUnderline;

export const demo = {
  compositionId: "sk-text-card-underline",
  durationInFrames: 120,
  props: {
    text: "But how?",
    accentWord: "how?",
    durationInFrames: 120,
    bg: "navy" as const,
  },
};
