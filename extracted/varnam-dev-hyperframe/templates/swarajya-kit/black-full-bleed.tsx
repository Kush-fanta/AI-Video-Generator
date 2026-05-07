/**
 * BlackFullBleed — Pure black full-bleed section card with one red accent word.
 *
 * Ref frame: /tmp/swarajya-study/frames/Rc7Knnuai-Q/95s.png
 * Purpose: Somber, weighty transition moment. Black background. Inter Bold 72px
 *          white text, column ≤ 880. ONE word (accentWord) is rendered in
 *          SK.accent.red — the word is matched case-insensitively and replaced
 *          in-place. The rest of the text remains white. If accentWord is not
 *          found in text, all text renders white (graceful fallback).
 *
 * Props: { text: string; accentWord: string; durationInFrames: number }
 */

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK } from "./_tokens";
import { fadeEnvelope } from "./_anim";

loadInter();

export interface BlackFullBleedProps {
  text: string;
  accentWord: string;
  durationInFrames: number;
}

/** Split text into spans, colouring the first match of accentWord in red. */
const AccentText: React.FC<{ text: string; accentWord: string; fontSize: number }> = ({
  text,
  accentWord,
  fontSize,
}) => {
  const baseStyle: React.CSSProperties = {
    fontFamily: SK.font.sans,
    fontWeight: SK.weight.bold,
    fontSize,
    lineHeight: 1.15,
  };

  const regex = new RegExp(`(${accentWord})`, "i");
  const parts = text.split(regex);

  return (
    <span style={{ ...baseStyle, color: SK.text.white }}>
      {parts.map((part, i) => {
        if (regex.test(part)) {
          return (
            <span key={i} style={{ color: SK.accent.red }}>
              {part}
            </span>
          );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </span>
  );
};

export const BlackFullBleed: React.FC<BlackFullBleedProps> = ({
  text,
  accentWord,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: SK.bg.black,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity,
      }}
    >
      <div
        style={{
          maxWidth: SK.safe.columnWidth,
          width: "100%",
          textAlign: "center",
        }}
      >
        <AccentText text={text} accentWord={accentWord} fontSize={72} />
      </div>
    </AbsoluteFill>
  );
};

export default BlackFullBleed;

export const demo = {
  compositionId: "sk-black-full-bleed",
  durationInFrames: 120,
  props: {
    text: "This isn't theoretical.",
    accentWord: "theoretical",
    durationInFrames: 120,
  },
};
