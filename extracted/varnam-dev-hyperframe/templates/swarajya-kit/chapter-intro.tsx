import React from "react";
import { useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK, resolveSKPalette, type SKPaletteName } from "./_tokens";
import { fadeEnvelope, fadeIn } from "./_anim";

loadInter();

export interface ChapterIntroProps {
  partLabel?: string;
  chapter: string;
  title: string;
  descriptor?: string;
  durationInFrames: number;
  palette?: SKPaletteName;
}

export const ChapterIntro: React.FC<ChapterIntroProps> = ({ partLabel, chapter, title, descriptor, durationInFrames, palette = "default" }) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);
  const chapterOpacity = fadeIn(frame, 0, SK.motion.fadeFrames);
  const titleOpacity = fadeIn(frame, 10, SK.motion.fadeFrames);
  const descriptorOpacity = fadeIn(frame, 20, SK.motion.fadeFrames);
  const pal = resolveSKPalette(palette);

  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: pal.background, fontFamily: SK.font.sans, opacity, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: `0 ${SK.safe.sideMargin}px`, position: "relative" }}>
      {partLabel && (
        <div style={{ position: "absolute", top: 80, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 8, backgroundColor: "rgba(128,128,128,0.12)", borderRadius: 6, padding: "6px 16px" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: pal.accent, flexShrink: 0 }} />
          <span style={{ fontFamily: SK.font.sans, fontWeight: SK.weight.medium, fontSize: SK.size.label, color: pal.text }}>{partLabel}</span>
        </div>
      )}
      <span style={{ fontFamily: SK.font.sans, fontWeight: SK.weight.black, fontSize: SK.size.mega, color: pal.accent, lineHeight: 1, opacity: chapterOpacity }}>
        {chapter}
      </span>
      <h1 style={{ fontFamily: SK.font.sans, fontWeight: SK.weight.bold, fontSize: SK.size.headline, color: pal.text, margin: 0, textAlign: "center", opacity: titleOpacity }}>
        {title}
      </h1>
      {descriptor && (
        <p style={{ fontFamily: SK.font.sans, fontWeight: SK.weight.medium, fontSize: SK.size.body, color: pal.textMuted, margin: 0, textAlign: "center", opacity: descriptorOpacity }}>
          {descriptor}
        </p>
      )}
    </div>
  );
};

export default ChapterIntro;

export const demo = {
  compositionId: "sk-chapter-intro",
  durationInFrames: 180,
  props: { partLabel: "Part 2", chapter: "02", title: "The Export Machine", descriptor: "How India built a defence industry from scratch", durationInFrames: 180 },
};
