import React from "react";
import { useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { C, FPS, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface ChapterLowerProps extends BaseProps {
  number: string;
  title: string;
  at?: number;
}

export const ChapterLower: React.FC<ChapterLowerProps> = ({
  number,
  title,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  const enterSpring = spring({
    frame: Math.max(0, frame - at),
    fps: FPS,
    config: { damping: 13, stiffness: 100, mass: 0.8 },
  });

  const fadeOut = interpolate(frame, [90, 110], [1, 0], { ...C, easing: ease });

  const translateY = interpolate(enterSpring, [0, 1], [60, 0], C);
  const opacity = interpolate(enterSpring, [0, 1], [0, 1], C) * fadeOut;

  const accentWidth = interpolate(enterSpring, [0, 1], [0, 48], C);

  const labelReveal = spring({
    frame: Math.max(0, frame - at - 6),
    fps: FPS,
    config: { damping: 18, stiffness: 90, mass: 0.6 },
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 100,
        left: 80,
        zIndex: 80,
        transform: `translateY(${translateY}px)`,
        opacity,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
      >
        <div
          style={{
            width: accentWidth,
            height: 4,
            backgroundColor: P.terracotta,
            borderRadius: 2,
            marginBottom: 14,
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 16,
            opacity: interpolate(labelReveal, [0, 1], [0, 1], C),
            transform: `translateY(${interpolate(labelReveal, [0, 1], [10, 0], C)}px)`,
          }}
        >
          <div
            style={{
              fontFamily: sans,
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: P.terracotta,
              lineHeight: 1,
            }}
          >
            Chapter {number}
          </div>
        </div>
        <div
          style={{
            fontFamily: serif,
            fontSize: 44,
            lineHeight: 1.15,
            color: P.bg,
            letterSpacing: "-0.01em",
            marginTop: 6,
            textShadow: `0 2px 16px ${P.dark}88`,
            maxWidth: 600,
            opacity: interpolate(labelReveal, [0, 1], [0, 1], C),
            transform: `translateY(${interpolate(labelReveal, [0, 1], [14, 0], C)}px)`,
          }}
        >
          {title}
        </div>
      </div>
    </div>
  );
};

export const demo = {
  compositionId: "lower-chapter-lower",
  props: {
    number: "02",
    title: "The frame settles here."
  },
  durationInFrames: 150,
};
