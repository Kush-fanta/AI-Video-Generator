/**
 * DataCallout — Dark card with eyebrow, dominant value, label, and optional delta.
 * Red left-border rule on eyebrow. highlight prop makes value SK.accent.red.
 */

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK } from "./_tokens";
import { fadeEnvelope, fadeIn, subtleScale } from "./_anim";

loadInter();

export interface DataCalloutProps {
  eyebrow: string;
  value: string;
  label: string;
  delta?: string;
  highlight?: boolean;
  durationInFrames: number;
}

export const DataCallout: React.FC<DataCalloutProps> = ({
  eyebrow,
  value,
  label,
  delta,
  highlight = false,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);
  const cardOpacity = fadeIn(frame, 0, 12);
  const scale = subtleScale(frame, 0, 18);
  const valueColor = highlight ? SK.accent.red : SK.text.white;

  // Delta color: red if starts with ↑ or +, gold if ↓ or -
  const deltaColor =
    delta && (delta.startsWith("↑") || delta.startsWith("+"))
      ? SK.accent.red
      : SK.accent.gold;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: SK.bg.navy,
        opacity,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(255,255,255,0.06)",
          borderRadius: 8,
          padding: "64px 80px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minWidth: 560,
          maxWidth: 800,
          opacity: cardOpacity,
        }}
      >
        {/* Eyebrow with red left-border rule */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <div
            style={{
              width: 2,
              height: 16,
              backgroundColor: SK.accent.red,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: SK.font.sans,
              fontWeight: SK.weight.medium,
              fontSize: SK.size.label,
              color: SK.text.mute,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {eyebrow}
          </span>
        </div>

        {/* Dominant value */}
        <div
          style={{
            fontFamily: SK.font.sans,
            fontWeight: SK.weight.black,
            fontSize: SK.size.display,
            color: valueColor,
            lineHeight: 1,
            textAlign: "center",
            marginBottom: 24,
            transform: `scale(${scale})`,
            transformOrigin: "center center",
          }}
        >
          {value}
        </div>

        {/* Label */}
        <div
          style={{
            fontFamily: SK.font.sans,
            fontWeight: SK.weight.medium,
            fontSize: SK.size.body,
            color: SK.text.mute,
            textAlign: "center",
            marginBottom: delta ? 20 : 0,
          }}
        >
          {label}
        </div>

        {/* Optional delta */}
        {delta && (
          <div
            style={{
              fontFamily: SK.font.sans,
              fontWeight: SK.weight.semibold,
              fontSize: 24,
              color: deltaColor,
              textAlign: "center",
            }}
          >
            {delta}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

export default DataCallout;

export const demo = {
  compositionId: "sk-data-callout",
  durationInFrames: 150,
  props: {
    eyebrow: "FY 2023-24",
    value: "₹21,083 cr",
    label: "Total defence exports",
    delta: "↑ 32.5%",
    highlight: true,
    durationInFrames: 150,
  },
};
