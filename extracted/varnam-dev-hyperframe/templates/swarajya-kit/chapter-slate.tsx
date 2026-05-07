/**
 * ChapterSlate — Chapter divider.
 * "CHAPTER" (small all-caps mute) → big serif number (red) → thin red rule → bold chapter title.
 */

import { AbsoluteFill, useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadSerif } from "@remotion/google-fonts/IBMPlexSerif";
import { SK } from "./_tokens";
import { fadeEnvelope } from "./_anim";

const { fontFamily: interFamily } = loadInter();
const { fontFamily: serifFamily } = loadSerif();

export interface ChapterSlateProps {
  chapterNumber: string | number;
  chapterTitle: string;
  durationInFrames: number;
  bg?: "navy" | "black";
}

export const ChapterSlate: React.FC<ChapterSlateProps> = ({
  chapterNumber,
  chapterTitle,
  durationInFrames,
  bg = "navy",
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bg === "navy" ? SK.bg.navy : SK.bg.black,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity,
      }}
    >
      <div
        style={{
          width: SK.safe.columnWidth,
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
      >
        {/* "CHAPTER" label */}
        <span
          style={{
            fontFamily: interFamily,
            fontWeight: SK.weight.medium,
            fontSize: 16,
            color: SK.text.mute,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          Chapter
        </span>

        {/* Big chapter number */}
        <span
          style={{
            fontFamily: serifFamily,
            fontWeight: SK.weight.bold,
            fontSize: 140,
            color: SK.accent.red,
            lineHeight: 1,
            marginBottom: 20,
          }}
        >
          {chapterNumber}
        </span>

        {/* Thin red rule */}
        <div
          style={{
            width: 120,
            height: 1,
            backgroundColor: SK.accent.red,
            marginBottom: 24,
          }}
        />

        {/* Chapter title */}
        <span
          style={{
            fontFamily: interFamily,
            fontWeight: SK.weight.bold,
            fontSize: 48,
            color: SK.text.white,
            lineHeight: 1.15,
          }}
        >
          {chapterTitle}
        </span>
      </div>
    </AbsoluteFill>
  );
};

export default ChapterSlate;

export const demo = {
  compositionId: "sk-chapter-slate",
  durationInFrames: 90,
  props: {
    chapterNumber: "02",
    chapterTitle: "The Cost Equation Nobody Talks About",
    durationInFrames: 90,
    bg: "navy",
  } satisfies ChapterSlateProps,
};
