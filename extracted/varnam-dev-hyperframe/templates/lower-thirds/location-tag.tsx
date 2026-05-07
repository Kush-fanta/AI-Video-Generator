import React from "react";
import { useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { C, FPS } from "../shared/primitives";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface LocationTagProps {
  city: string;
  country: string;
  at?: number;
}

export const LocationTag: React.FC<LocationTagProps> = ({
  city,
  country,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  // Entry spring — tighter spring config (less bouncy)
  const slideIn = spring({
    frame: Math.max(0, frame - at),
    fps: FPS,
    config: { damping: 12, stiffness: 160, mass: 0.5 },
  });

  // Exit spring — collapses back to left
  const exitStart = 90;
  const slideOut =
    frame > exitStart
      ? spring({
          frame: frame - exitStart,
          fps: FPS,
          config: { damping: 12, stiffness: 160, mass: 0.5 },
        })
      : 0;

  const translateX =
    interpolate(slideIn, [0, 1], [-200, 0], C) +
    interpolate(slideOut, [0, 1], [0, -200], C);

  const opacity =
    interpolate(slideIn, [0, 0.3], [0, 1], C) *
    interpolate(slideOut, [0.7, 1], [1, 0], C);

  // Pin icon — same spring config, slight delay
  const dotScale = spring({
    frame: Math.max(0, frame - at - 8),
    fps: FPS,
    config: { damping: 12, stiffness: 160, mass: 0.5 },
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 80,
        left: 60,
        zIndex: 80,
        transform: `translateX(${translateX}px)`,
        opacity,
      }}
    >
      <div
        style={{
          position: "relative",
          borderRadius: 6,
          overflow: "hidden",
        }}
      >
        {/* Blurred background layer — filter on absolute div, not backdrop-filter */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            filter: "blur(8px)",
            backgroundColor: `${P.dark}DD`,
            borderRadius: 6,
          }}
        />
        {/* 2px terracotta bottom border */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 2,
            backgroundColor: P.terracotta,
          }}
        />
        {/* Content layer — sits above blur background */}
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "12px 28px 12px 18px",
          }}
        >
        {/* Pin icon */}
        <div
          style={{
            width: 22,
            height: 22,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transform: `scale(${dotScale})`,
          }}
        >
          <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
            <path
              d="M9 0C4.03 0 0 4.03 0 9c0 6.75 9 13 9 13s9-6.25 9-13c0-4.97-4.03-9-9-9Zm0 12.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Z"
              fill={P.terracotta}
            />
          </svg>
        </div>

        {/* Text */}
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* City name — Instrument Serif 30px */}
          <div
            style={{
              fontFamily: serif,
              fontSize: 30,
              lineHeight: 1.15,
              color: P.bg,
              letterSpacing: "-0.01em",
            }}
          >
            {city}
          </div>
          {/* Country — DM Sans 11px muted all-caps */}
          <div
            style={{
              fontFamily: sans,
              fontSize: 20,
              fontWeight: 500,
              color: P.muted,
              lineHeight: 1.3,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            {country}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export const demo = {
  compositionId: "lower-location-tag",
  props: {
    city: "New Delhi",
    country: "India"
  },
  durationInFrames: 120,
};
