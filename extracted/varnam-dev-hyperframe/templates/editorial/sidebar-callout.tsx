import React from "react";
import { AbsoluteFill, useCurrentFrame, spring, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, overshootScale, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface SidebarCalloutProps extends BaseProps {
  mainText: string;
  sidebarStat: string;
  sidebarLabel: string;
  source?: string;
  at?: number;
}

/**
 * SidebarCallout — Main content left (70%), sidebar callout right (25%).
 * Sidebar has darker cream background with a stat or key fact.
 * Vertical rule between columns. Print-layout feel.
 */
export const SidebarCallout: React.FC<SidebarCalloutProps> = ({
  mainText,
  sidebarStat,
  sidebarLabel,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  /* Vertical rule grows from center */
  const ruleHeight = spring({
    frame: f,
    fps: FPS,
    config: { damping: 20, stiffness: 50, mass: 1.2 },
  });

  /* Sidebar stat overshoot */
  const statScale = overshootScale(frame, at + 14);

  /* Sidebar slide-in */
  const sidebarX = spring({
    frame: Math.max(0, f - 4),
    fps: FPS,
    config: { damping: 18, stiffness: 70, mass: 1 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Main content — left column */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "68%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: 80,
          paddingRight: 60,
        }}
      >
        {/* Section label */}
        <div style={reveal(frame, at + 2)}>
          <span
            style={{
              fontFamily: sans,
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: P.terracotta,
            }}
          >
            Analysis
          </span>
        </div>

        {/* Top rule */}
        <div
          style={{
            width: `${lineGrow(frame, at + 4, 20)}%`,
            maxWidth: 100,
            height: 2,
            backgroundColor: P.terracotta,
            marginTop: 16,
            marginBottom: 36,
            borderRadius: 1,
          }}
        />

        {/* Main body text */}
        <div style={reveal(frame, at + 8)}>
          <p
            style={{
              fontFamily: serif,
              fontSize: 42,
              lineHeight: 1.42,
              color: P.text,
              margin: 0,
              maxWidth: 580,
            }}
          >
            {mainText}
          </p>
        </div>

        {/* Source */}
        {source && (
          <div
            style={{
              ...reveal(frame, at + 28),
              marginTop: 40,
            }}
          >
            <span
              style={{
                fontFamily: sans,
                fontSize: 20,
                fontWeight: 500,
                letterSpacing: "0.08em",
                color: P.muted,
                textTransform: "uppercase",
              }}
            >
              Source: {source}
            </span>
          </div>
        )}
      </div>

      {/* Vertical rule — divider */}
      <div
        style={{
          position: "absolute",
          left: "70%",
          top: `${50 - ruleHeight * 35}%`,
          width: 1,
          height: `${ruleHeight * 70}%`,
          backgroundColor: P.light,
        }}
      />

      {/* Sidebar callout — right column */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "28%",
          height: "100%",
          backgroundColor: "rgba(193,122,72,0.06)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: 40,
          paddingRight: 48,
          transform: `translateX(${interpolate(sidebarX, [0, 1], [40, 0], C)}px)`,
          opacity: sidebarX,
        }}
      >
        {/* Sidebar accent */}
        <div
          style={{
            width: 32,
            height: 3,
            backgroundColor: P.terracotta,
            marginBottom: 28,
            borderRadius: 2,
            ...reveal(frame, at + 10),
          }}
        />

        {/* Stat */}
        <div
          style={{
            ...reveal(frame, at + 14),
            transform: `scale(${statScale})`,
            transformOrigin: "left center",
          }}
        >
          <span
            style={{
              fontFamily: serif,
              fontSize: 72,
              lineHeight: 1.0,
              color: P.terracotta,
              letterSpacing: "-0.02em",
            }}
          >
            {sidebarStat}
          </span>
        </div>

        {/* Label */}
        <div
          style={{
            ...reveal(frame, at + 20),
            marginTop: 20,
          }}
        >
          <span
            style={{
              fontFamily: sans,
              fontSize: 24,
              lineHeight: 1.4,
              color: P.sub,
              fontWeight: 500,
            }}
          >
            {sidebarLabel}
          </span>
        </div>

        {/* Decorative bottom border */}
        <div
          style={{
            width: `${lineGrow(frame, at + 26, 18)}%`,
            maxWidth: 60,
            height: 1,
            backgroundColor: P.light,
            marginTop: 32,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "edit-sidebar-callout",
  props: {
    mainText: "The transformation from cost arbitrage to capability arbitrage marks a fundamental shift.",
    sidebarStat: "73%",
    sidebarLabel: "On core product",
    source: "Zinnov",
    at: 15,
  },
  durationInFrames: 180,
};
