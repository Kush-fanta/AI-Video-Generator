/**
 * AnnotatedStat — Large central stat number with unit suffix, label below,
 * and optional left/right annotation pills appearing at frame 20.
 */

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK } from "./_tokens";
import { fadeEnvelope, fadeIn } from "./_anim";

loadInter();

export interface AnnotatedStatProps {
  value: string;
  unit?: string;
  label: string;
  annotationLeft?: string;
  annotationRight?: string;
  durationInFrames: number;
}

const Pill: React.FC<{ text: string; opacity: number }> = ({ text, opacity }) => (
  <div style={{ opacity, backgroundColor: "rgba(255,255,255,0.10)", borderRadius: 6, padding: "8px 16px", fontFamily: SK.font.sans, fontWeight: SK.weight.medium, fontSize: 20, color: SK.text.white, whiteSpace: "nowrap" }}>
    {text}
  </div>
);

export const AnnotatedStat: React.FC<AnnotatedStatProps> = ({ value, unit, label, annotationLeft, annotationRight, durationInFrames }) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);
  const pillOp = fadeIn(frame, 20, SK.motion.fadeFrames);

  return (
    <AbsoluteFill style={{ backgroundColor: SK.bg.navy, opacity, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingLeft: SK.safe.sideMargin, paddingRight: SK.safe.sideMargin }}>
      {/* Pill row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 40, marginBottom: 32, minHeight: 48 }}>
        {annotationLeft ? <Pill text={annotationLeft} opacity={pillOp} /> : <div style={{ width: 200 }} />}
        <div style={{ width: 340 }} />
        {annotationRight ? <Pill text={annotationRight} opacity={pillOp} /> : <div style={{ width: 200 }} />}
      </div>
      {/* Central stat */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 12, lineHeight: 1 }}>
        <span style={{ fontFamily: SK.font.sans, fontWeight: SK.weight.black, fontSize: SK.size.mega, color: SK.accent.red, lineHeight: 1 }}>{value}</span>
        {unit && <span style={{ fontFamily: SK.font.sans, fontWeight: SK.weight.black, fontSize: 48, color: SK.text.white, lineHeight: 1, paddingBottom: 14 }}>{unit}</span>}
      </div>
      {/* Label */}
      <span style={{ fontFamily: SK.font.sans, fontWeight: SK.weight.medium, fontSize: SK.size.sub, color: SK.text.mute, marginTop: 24, textAlign: "center" }}>{label}</span>
    </AbsoluteFill>
  );
};

export default AnnotatedStat;

export const demo = {
  compositionId: "sk-annotated-stat",
  durationInFrames: 150,
  props: {
    value: "21,083",
    unit: "cr",
    label: "Defence exports 2023",
    annotationLeft: "↑ 10× since 2014",
    annotationRight: "Target: ₹50,000 cr",
    durationInFrames: 150,
  },
};
