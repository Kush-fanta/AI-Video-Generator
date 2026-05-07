/**
 * EvidenceList — Bulleted stack of 3–5 evidence points.
 * Red square bullets, stagger-fade each item 4 frames after the previous.
 * Optional eyebrow label above.
 */

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK, resolveSKPalette, type SKPaletteName } from "./_tokens";
import { fadeEnvelope, fadeIn } from "./_anim";

const { fontFamily: interFamily } = loadInter();

export interface EvidenceListProps {
  eyebrow?: string;
  items: string[];
  durationInFrames: number;
  bg?: "navy" | "black";
  palette?: SKPaletteName;
  /**
   * itemStaggerFrames: frames between each successive item's fade-in.
   * Default: 5 (≈167ms at 30fps). Storyboard spec is 180ms ≈ 5–6 frames.
   */
  itemStaggerFrames?: number;
}

export const EvidenceList: React.FC<EvidenceListProps> = ({
  eyebrow,
  items,
  durationInFrames,
  palette = "default",
  itemStaggerFrames = 5,
}) => {
  const frame = useCurrentFrame();
  const rootOpacity = fadeEnvelope(frame, durationInFrames);
  const pal = resolveSKPalette(palette);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: pal.background,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: rootOpacity,
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
        {eyebrow && (
          <span
            style={{
              fontFamily: interFamily,
              fontWeight: SK.weight.medium,
              fontSize: 18,
              color: pal.textMuted,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 28,
            }}
          >
            {eyebrow}
          </span>
        )}

        {/* Evidence items */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {items.map((item, i) => {
            // Each item fades in itemStaggerFrames after the previous, starting at frame 8
            const itemStartFrame = 8 + i * itemStaggerFrames;
            const itemOpacity = fadeIn(frame, itemStartFrame, SK.motion.fadeFrames);

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 16,
                  opacity: itemOpacity,
                }}
              >
                {/* Accent square bullet */}
                <div
                  style={{
                    width: 8,
                    height: 8,
                    backgroundColor: pal.accent,
                    flexShrink: 0,
                    marginTop: 10,
                  }}
                />
                {/* Evidence text */}
                <span
                  style={{
                    fontFamily: interFamily,
                    fontWeight: SK.weight.medium,
                    fontSize: 26,
                    color: pal.text,
                    lineHeight: 1.4,
                  }}
                >
                  {item}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default EvidenceList;

export const demo = {
  compositionId: "sk-evidence-list",
  durationInFrames: 150,
  props: {
    eyebrow: "Key findings",
    items: [
      "India intercepted over 2,100 drones in a single engagement",
      "Each intercept cost $2M+ using Akash and Barak-8 systems",
      "Pakistan's kamikaze drones cost ~$20K each — a 100x deficit",
      "Radar saturation tactics overwhelmed fixed defence batteries",
      "No country has yet solved the asymmetric interception problem",
    ],
    durationInFrames: 150,
    bg: "navy",
  } satisfies EvidenceListProps,
};
