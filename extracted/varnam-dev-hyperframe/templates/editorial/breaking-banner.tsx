import React from "react";
import { AbsoluteFill, useCurrentFrame, spring, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface BreakingBannerProps extends BaseProps {
  headline: string;
  subtext?: string;
  at?: number;
}

/**
 * BreakingBanner — Urgent breaking news.
 * Terracotta banner slides down from top with spring physics.
 * "BREAKING" in white uppercase sans on the banner.
 * Large serif headline below on cream bg.
 * Subtle pulse animation on the banner for urgency.
 */
export const BreakingBanner: React.FC<BreakingBannerProps> = ({
  headline,
  subtext,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  /* Banner slides down from top with spring */
  const bannerY = spring({
    frame: f,
    fps: FPS,
    config: { damping: 14, stiffness: 100, mass: 1 },
  });
  const bannerTranslate = interpolate(bannerY, [0, 1], [-120, 0], C);

  /* Subtle pulse on banner — 2s cycle */
  const pulsePhase = (f % 60) / 60;
  const pulse = 1 + Math.sin(pulsePhase * Math.PI * 2) * 0.015;

  /* Headline entrance — spring driven */
  const headlineY = spring({
    frame: Math.max(0, f - 10),
    fps: FPS,
    config: { damping: 16, stiffness: 70, mass: 1.1 },
  });

  /* Red alert dot blink */
  const dotOpacity = interpolate(
    Math.sin(f * 0.2),
    [-1, 1],
    [0.3, 1],
    C,
  );

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Terracotta banner */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          transform: `translateY(${bannerTranslate}px) scaleY(${pulse})`,
          transformOrigin: "top center",
          backgroundColor: P.terracotta,
          padding: "44px 80px",
          display: "flex",
          alignItems: "center",
          gap: 24,
          zIndex: 10,
        }}
      >
        {/* Alert dot */}
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: 7,
            backgroundColor: "#FFFFFF",
            opacity: dotOpacity,
            flexShrink: 0,
          }}
        />

        {/* BREAKING text */}
        <span
          style={{
            fontFamily: sans,
            fontSize: 40,
            fontWeight: 700,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#FFFFFF",
          }}
        >
          BREAKING
        </span>

        {/* Thin white line extending */}
        <div
          style={{
            flex: 1,
            height: 2,
            backgroundColor: "rgba(255,255,255,0.35)",
            borderRadius: 1,
          }}
        />
      </div>

      {/* Headline content — centered below banner */}
      <div
        style={{
          position: "absolute",
          top: 180,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: 80,
          paddingRight: 80,
        }}
      >
        {/* Headline */}
        <div
          style={{
            opacity: headlineY,
            transform: `translateY(${interpolate(headlineY, [0, 1], [30, 0], C)}px)`,
          }}
        >
          <h1
            style={{
              fontFamily: serif,
              fontSize: 80,
              lineHeight: 1.08,
              color: P.text,
              letterSpacing: "-0.02em",
              margin: 0,
              maxWidth: 880,
            }}
          >
            {headline}
          </h1>
        </div>

        {/* Terracotta rule */}
        <div
          style={{
            ...reveal(frame, at + 18),
            width: 80,
            height: 3,
            backgroundColor: P.terracotta,
            marginTop: 36,
            borderRadius: 2,
          }}
        />

        {/* Subtext */}
        {subtext && (
          <div
            style={{
              ...reveal(frame, at + 24),
              marginTop: 28,
            }}
          >
            <p
              style={{
                fontFamily: sans,
                fontSize: 30,
                lineHeight: 1.5,
                color: P.sub,
                margin: 0,
                maxWidth: 760,
              }}
            >
              {subtext}
            </p>
          </div>
        )}

        {/* Timestamp feel */}
        <div
          style={{
            ...reveal(frame, at + 32),
            marginTop: 48,
          }}
        >
          <span
            style={{
              fontFamily: sans,
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: "0.1em",
              color: P.muted,
              textTransform: "uppercase",
            }}
          >
            Developing story
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "edit-breaking-banner",
  props: {
    headline: "India GCC Revenue Crosses $100 Billion",
    subtext: "First emerging market to achieve this milestone",
    at: 15,
  },
  durationInFrames: 180,
};
