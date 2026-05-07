/**
 * TitleCard — Opening hook card with three-tier hierarchy.
 * Eyebrow (all-caps) → red rule → large headline → detail line.
 * Ref: Rc7Knnuai-Q/25s.png — "THE DECOY STRATEGY" / big headline / comparison data below.
 */

import { AbsoluteFill, useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK } from "./_tokens";
import { fadeEnvelope } from "./_anim";

const { fontFamily: interFamily } = loadInter();

export interface TitleCardProps {
  eyebrow: string;
  headline: string;
  detail?: string;
  durationInFrames: number;
  bg?: "navy" | "black";
}

export const TitleCard: React.FC<TitleCardProps> = ({
  eyebrow,
  headline,
  detail,
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
        {/* Eyebrow */}
        <span
          style={{
            fontFamily: interFamily,
            fontWeight: SK.weight.medium,
            fontSize: 18,
            color: SK.accent.red,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          {eyebrow}
        </span>

        {/* Red rule */}
        <div
          style={{
            width: 60,
            height: 3,
            backgroundColor: SK.accent.red,
            marginBottom: 24,
          }}
        />

        {/* Headline */}
        <span
          style={{
            fontFamily: interFamily,
            fontWeight: SK.weight.bold,
            fontSize: 80,
            color: SK.text.white,
            lineHeight: 1.1,
            marginBottom: detail ? 28 : 0,
          }}
        >
          {headline}
        </span>

        {/* Detail */}
        {detail && (
          <span
            style={{
              fontFamily: interFamily,
              fontWeight: SK.weight.medium,
              fontSize: 24,
              color: SK.text.mute,
              lineHeight: 1.4,
            }}
          >
            {detail}
          </span>
        )}
      </div>
    </AbsoluteFill>
  );
};

export default TitleCard;

export const demo = {
  compositionId: "sk-title-card",
  durationInFrames: 120,
  props: {
    eyebrow: "THE DECOY STRATEGY",
    headline: "Make India waste its best missiles on cheap drones",
    detail: "100x cost differential — every intercept depletes the defender",
    durationInFrames: 120,
    bg: "navy",
  } satisfies TitleCardProps,
};
