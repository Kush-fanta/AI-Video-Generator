import React from "react";
import { useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { C, FPS } from "../shared/primitives";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface SpeakerIdProps {
  name: string;
  role: string;
  organization: string;
  at?: number;
}

export const SpeakerId: React.FC<SpeakerIdProps> = ({
  name,
  role,
  organization,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  const slideIn = spring({
    frame: Math.max(0, frame - at),
    fps: FPS,
    config: { damping: 14, stiffness: 120, mass: 0.8 },
  });

  const holdEnd = 120;
  const slideOut =
    frame > holdEnd
      ? spring({
          frame: frame - holdEnd,
          fps: FPS,
          config: { damping: 16, stiffness: 100, mass: 0.7 },
        })
      : 0;

  // Entry: slide from left; Exit: drop down (Y+30)
  const translateX = interpolate(slideIn, [0, 1], [-420, 0], C);
  const translateY = interpolate(slideOut, [0, 1], [0, 30], C);

  const opacity =
    interpolate(slideIn, [0, 1], [0, 1], C) *
    interpolate(slideOut, [0.7, 1], [1, 0], C);

  // Accent bar reaches full width aggressively by frame 6 (~spring value ~0.85 at frame 6)
  const accentWidth = interpolate(slideIn, [0, 0.85], [0, 4], C);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 120,
        left: 0,
        zIndex: 80,
        transform: `translateX(${translateX}px) translateY(${translateY}px)`,
        opacity,
      }}
    >
      {/* Dark background rect for contrast demo */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: P.dark,
          opacity: 0.7,
          borderRadius: "0 6px 6px 0",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          position: "relative",
        }}
      >
        {/* Terracotta accent bar */}
        <div
          style={{
            width: accentWidth,
            backgroundColor: P.terracotta,
            borderRadius: "2px 0 0 2px",
            flexShrink: 0,
          }}
        />

        {/* Content panel */}
        <div
          style={{
            backgroundColor: P.dark,
            padding: "18px 40px 18px 24px",
            borderRadius: "0 6px 6px 0",
            display: "flex",
            flexDirection: "column",
            gap: 6,
            minWidth: 300,
          }}
        >
          {/* Name */}
          <div
            style={{
              fontFamily: serif,
              fontSize: 32,
              lineHeight: 1.15,
              color: P.bg,
              letterSpacing: "-0.01em",
            }}
          >
            {name}
          </div>

          {/* Horizontal rule */}
          <div
            style={{
              height: 1,
              backgroundColor: P.light,
              opacity: 0.35,
              marginTop: 2,
              marginBottom: 2,
            }}
          />

          {/* Role */}
          <div
            style={{
              fontFamily: sans,
              fontSize: 20,
              fontWeight: 500,
              letterSpacing: "0.06em",
              color: P.bg,
              lineHeight: 1.3,
            }}
          >
            {role}
          </div>

          {/* Organization */}
          <div
            style={{
              fontFamily: sans,
              fontSize: 20,
              fontWeight: 400,
              color: P.muted,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              lineHeight: 1.3,
            }}
          >
            {organization}
          </div>
        </div>
      </div>
    </div>
  );
};

export const demo = {
  compositionId: "lower-speaker-id",
  props: {
    name: "Asha Mehta",
    role: "Product Strategy Lead",
    organization: "North Star Studio"
  },
  durationInFrames: 180,
};
