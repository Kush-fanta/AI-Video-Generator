import React from "react";
import { useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { C, FPS } from "../shared/primitives";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface SourceCitationProps {
  publication: string;
  year: string;
  holdDuration?: number;
  at?: number;
}

export const SourceCitation: React.FC<SourceCitationProps> = ({
  publication,
  year,
  holdDuration = 60,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  // Entry spring — pill width grows from narrow to full
  const entrySpring = spring({
    frame: Math.max(0, frame - at),
    fps: FPS,
    config: { damping: 14, stiffness: 120, mass: 0.8 },
  });

  // Exit spring — triggered after holdDuration
  const exitStart = at + holdDuration;
  const exitSpring =
    frame > exitStart
      ? spring({
          frame: frame - exitStart,
          fps: FPS,
          config: { damping: 14, stiffness: 120, mass: 0.8 },
        })
      : 0;

  // Pill width via clipPath: spring drives 0→100% entry, exit collapses back
  const pillProgress = Math.max(0, entrySpring - exitSpring);
  const clipPercent = interpolate(pillProgress, [0, 1], [0, 100], C);

  // "SOURCE" label: spring translateX from left
  const labelX = interpolate(entrySpring, [0, 1], [-60, 0], C);
  const labelX_out = interpolate(exitSpring, [0, 1], [0, -60], C);
  const labelTranslateX = labelX + labelX_out;
  const labelOpacity = interpolate(entrySpring, [0, 0.2], [0, 1], C) * interpolate(exitSpring, [0.8, 1], [1, 0], C);

  // Publication name snaps in 5 frames after entry
  const pubSpring = spring({
    frame: Math.max(0, frame - at - 5),
    fps: FPS,
    config: { damping: 14, stiffness: 120, mass: 0.8 },
  });
  const pubOpacity =
    interpolate(pubSpring, [0, 0.4], [0, 1], C) *
    interpolate(exitSpring, [0.8, 1], [1, 0], C);

  // Year fades in slightly after pub
  const yearSpring = spring({
    frame: Math.max(0, frame - at - 8),
    fps: FPS,
    config: { damping: 14, stiffness: 120, mass: 0.8 },
  });
  const yearOpacity =
    interpolate(yearSpring, [0, 0.4], [0, 1], C) *
    interpolate(exitSpring, [0.8, 1], [1, 0], C);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 36,
        left: 60,
        zIndex: 70,
      }}
    >
      <div
        style={{
          position: "relative",
          borderRadius: 6,
          clipPath: `inset(0 ${100 - clipPercent}% 0 0 round 6px)`,
        }}
      >
        {/* Blurred background layer — filter on absolute div, not backdrop-filter */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            filter: "blur(8px)",
            backgroundColor: `${P.dark}D9`,
            borderRadius: 6,
          }}
        />
        {/* Content layer — sits above blur background */}
        <div
          style={{
            position: "relative",
            padding: "10px 22px 10px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
        {/* SOURCE eyebrow label */}
        <div
          style={{
            fontFamily: sans,
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: P.terracotta,
            userSelect: "none",
            flexShrink: 0,
            transform: `translateX(${labelTranslateX}px)`,
            opacity: labelOpacity,
          }}
        >
          SOURCE
        </div>

        {/* Divider */}
        <div
          style={{
            width: 1,
            height: 20,
            backgroundColor: P.light,
            opacity: 0.35,
            flexShrink: 0,
          }}
        />

        {/* Publication name */}
        <div
          style={{
            fontFamily: serif,
            fontStyle: "italic",
            fontSize: 20,
            color: P.bg,
            lineHeight: 1.3,
            opacity: pubOpacity,
            userSelect: "none",
          }}
        >
          {publication}
        </div>

        {/* Year */}
        <div
          style={{
            fontFamily: sans,
            fontSize: 20,
            fontWeight: 400,
            color: P.muted,
            letterSpacing: "0.06em",
            flexShrink: 0,
            opacity: yearOpacity,
            userSelect: "none",
          }}
        >
          {year}
        </div>
        </div>
      </div>
    </div>
  );
};

export const demo = {
  compositionId: "lower-source-citation",
  props: {
    publication: "Internal memo",
    year: "2026",
    holdDuration: 60
  },
  durationInFrames: 120,
};
