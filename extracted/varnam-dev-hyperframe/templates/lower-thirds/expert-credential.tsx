import React from "react";
import { useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { C, FPS } from "../shared/primitives";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface ExpertCredentialProps {
  name: string;
  role: string;
  institution: string;
  headshot?: string;
  at?: number;
  /** Duration before exit begins, in frames. Default 120. */
  holdFrames?: number;
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  return words
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * ExpertCredential — Elevated premium lower-third card.
 * Full-width rectangular card (80% frame width) at bottom 15% of frame.
 * Left side: 80px avatar circle (headshot or initials on terracotta).
 * Right: NAME in 48px InstrumentSerif, ROLE in 28px DM Sans P.sub, INSTITUTION in 24px DM Sans P.muted.
 * Dark frosted card: rgba(10,10,10,0.85), border-radius 6px.
 * 4px terracotta left border (full card height).
 * Entry: spring slide-up + scale 0.97→1.0 (damping 14, stiffness 80).
 * Exit: drift down + opacity fade.
 */
export const ExpertCredential: React.FC<ExpertCredentialProps> = ({
  name,
  role,
  institution,
  headshot,
  at = 0,
  holdFrames = 120,
}) => {
  const frame = useCurrentFrame();

  // Entry spring
  const entrySpring = spring({
    frame: Math.max(0, frame - at),
    fps: FPS,
    config: { damping: 14, stiffness: 80, mass: 0.9 },
  });

  // Exit spring — starts after holdFrames
  const exitStart = at + holdFrames;
  const exitSpring = frame > exitStart
    ? spring({
        frame: frame - exitStart,
        fps: FPS,
        config: { damping: 16, stiffness: 100, mass: 0.7 },
      })
    : 0;

  // Y translation: entry slides up from 80px, exit drifts down to 20px
  const translateY =
    interpolate(entrySpring, [0, 1], [80, 0], C) +
    interpolate(exitSpring, [0, 1], [0, 20], C);

  // Scale: 0.97 → 1.0 on entry
  const scale = interpolate(entrySpring, [0, 1], [0.97, 1.0], C);

  // Opacity: fade in on entry, fade out on exit over 10 frames
  const entryOpacity = interpolate(entrySpring, [0, 0.15], [0, 1], C);
  const exitOpacity = frame > exitStart
    ? interpolate(frame - exitStart, [0, 10], [1, 0], C)
    : 1;
  const opacity = entryOpacity * exitOpacity;

  // Avatar scale — enters slightly after card
  const avatarSpring = spring({
    frame: Math.max(0, frame - at - 8),
    fps: FPS,
    config: { damping: 12, stiffness: 110, mass: 0.5 },
  });

  const initials = getInitials(name);

  // Avatar spring — enters slightly after name
  const avatarSpringScale = interpolate(avatarSpring, [0, 1], [0.7, 1.0], C);
  const avatarOpacity = interpolate(avatarSpring, [0, 0.2], [0, 1], C);

  return (
    <div
      style={{
        position: "absolute",
        bottom: "10%",
        left: 0,
        width: "100%",
        zIndex: 80,
        transform: `translateY(${translateY}px) scale(${scale})`,
        transformOrigin: "bottom left",
        opacity,
      }}
    >
      {/* Asymmetric layout: terracotta slash left edge, name huge left, credential right */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 0,
          paddingLeft: 60,
          paddingRight: 80,
        }}
      >
        {/* Terracotta vertical bar — editorial anchor */}
        <div
          style={{
            width: 6,
            height: 160,
            backgroundColor: P.terracotta,
            borderRadius: 3,
            flexShrink: 0,
            marginRight: 36,
            alignSelf: "center",
          }}
        />

        {/* Name block — dominant left, serif, large */}
        <div
          style={{
            flex: "0 0 auto",
            paddingBottom: 8,
          }}
        >
          {/* Eyebrow — role in small caps above name */}
          <div
            style={{
              fontFamily: sans,
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: P.terracotta,
              marginBottom: 8,
            }}
          >
            {role}
          </div>

          {/* Big name — hero typography */}
          <div
            style={{
              fontFamily: serif,
              fontSize: 80,
              lineHeight: 0.95,
              color: P.dark,
              letterSpacing: "-0.03em",
              whiteSpace: "nowrap",
            }}
          >
            {name}
          </div>
        </div>

        {/* Divider slash */}
        <div
          style={{
            width: 1,
            height: 100,
            backgroundColor: P.light,
            margin: "0 48px 12px",
            flexShrink: 0,
          }}
        />

        {/* Right block — institution + optional avatar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            paddingBottom: 12,
            flex: 1,
          }}
        >
          {/* Avatar circle — headshot or initials */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              backgroundColor: headshot ? "transparent" : P.terracotta,
              flexShrink: 0,
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${avatarSpringScale})`,
              transformOrigin: "center center",
              opacity: avatarOpacity,
              border: `2px solid ${P.dark}`,
            }}
          >
            {headshot ? (
              <img
                src={headshot}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  fontFamily: sans,
                  fontSize: 28,
                  fontWeight: 700,
                  color: P.bg,
                  letterSpacing: "-0.01em",
                  lineHeight: 1,
                  userSelect: "none",
                }}
              >
                {initials}
              </div>
            )}
          </div>

          {/* Institution — tracked caps, muted */}
          <div
            style={{
              fontFamily: sans,
              fontSize: 24,
              fontWeight: 500,
              color: P.muted,
              lineHeight: 1.3,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              maxWidth: 400,
            }}
          >
            {institution}
          </div>
        </div>
      </div>

      {/* Ground line — full width, thin */}
      <div
        style={{
          marginTop: 16,
          marginLeft: 60,
          height: 1,
          width: "calc(100% - 140px)",
          backgroundColor: P.dark,
          opacity: 0.12,
        }}
      />
    </div>
  );
};

export const demo = {
  compositionId: "lower-expert-credential",
  props: {
    name: "Asha Mehta",
    role: "Product Strategy",
    institution: "North Star Studio",
    holdFrames: 120
  },
  durationInFrames: 180,
};
