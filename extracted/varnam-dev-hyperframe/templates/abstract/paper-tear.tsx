 "use client";

import React, { useRef } from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, C, FPS, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface PaperTearProps extends BaseProps {
  /** Content on the top (dark) half — optional text */
  topContent?: string;
  /** Content revealed on the bottom (cream) half */
  bottomContent: string;
  /** Frame when the tear begins (default 30) */
  tearAt?: number;
  /** Frame offset */
  at?: number;
}

/**
 * PaperTear — Screen split horizontally with a jagged tear.
 * Top half tears away upward (translate + slight rotation), revealing
 * a different colored surface beneath. The tear line is an organic
 * jagged edge via SVG clip path. Top: dark surface with muted content.
 * Bottom: cream with bold new content. Physical, tactile, dramatic.
 */
export const PaperTear: React.FC<PaperTearProps> = ({
  topContent,
  bottomContent,
  tearAt = 30,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame - at;

  // Generate jagged tear line — deterministic but organic
  const clipId = useRef(`tear-${Math.random().toString(36).slice(2)}`).current;
  const tearPoints: string[] = [];
  const tearY = 960; // midpoint of 1920
  const jaggedness = 35;
  const steps = 54; // number of horizontal segments

  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * 1080;
    // Deterministic pseudo-random jag using sin harmonics
    const jag =
      Math.sin(i * 1.7) * jaggedness +
      Math.sin(i * 3.1 + 0.5) * jaggedness * 0.5 +
      Math.sin(i * 5.3 + 1.2) * jaggedness * 0.25;
    tearPoints.push(`${x},${tearY + jag}`);
  }

  // Top clip path — everything above the jagged line
  const topClipPath = `M 0,0 L 1080,0 L 1080,${tearY + 40} ${tearPoints.reverse().map((p) => `L ${p}`).join(" ")} L 0,${tearY + 40} Z`;
  // Bottom clip path — everything below the jagged line
  tearPoints.reverse(); // restore order
  const bottomClipPath = `M ${tearPoints[0]} ${tearPoints.map((p) => `L ${p}`).join(" ")} L 1080,1920 L 0,1920 Z`;

  // Tear animation — top sheet lifts away
  const tearProgress = t >= tearAt
    ? spring({ frame: t - tearAt, fps, config: { damping: 18, stiffness: 50, mass: 1.2 } })
    : 0;

  const topTranslateY = interpolate(tearProgress, [0, 1], [0, -1200], C);
  const topRotate = interpolate(tearProgress, [0, 1], [0, -3], C);
  const topOpacity = interpolate(tearProgress, [0.6, 1], [1, 0], C);

  // Shadow under the lifting paper
  const shadowOpacity = interpolate(tearProgress, [0, 0.3, 1], [0, 0.25, 0], C);
  const shadowBlur = interpolate(tearProgress, [0, 0.5], [0, 40], C);

  // Top content — appears before tear
  const topTextOpacity = topContent
    ? interpolate(t, [5, 20, tearAt, tearAt + 10], [0, 0.8, 0.8, 0], C)
    : 0;

  // Bottom content — revealed as tear happens
  const bottomTextOpacity = interpolate(t, [tearAt + 15, tearAt + 40], [0, 1], C);
  const bottomTextY = interpolate(t, [tearAt + 15, tearAt + 40], [30, 0], { ...C, easing: ease });

  // Subtle paper texture — thin horizontal lines
  const paperLines = Array.from({ length: 8 }, (_, i) => i);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg, overflow: "hidden" }}>
      {/* SVG defs for clip paths */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <clipPath id={`${clipId}-top`} clipPathUnits="userSpaceOnUse">
            <path d={topClipPath} />
          </clipPath>
          <clipPath id={`${clipId}-bottom`} clipPathUnits="userSpaceOnUse">
            <path d={bottomClipPath} />
          </clipPath>
        </defs>
      </svg>

      {/* Bottom layer — cream with revealed content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          clipPath: `url(#${clipId}-bottom)`,
          backgroundColor: P.bg,
        }}
      >
        {/* Subtle texture lines */}
        {paperLines.map((i) => (
          <div
            key={`bl-${i}`}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: tearY + 80 + i * 100,
              height: 1,
              backgroundColor: P.light,
              opacity: 0.15,
            }}
          />
        ))}

        {/* Terracotta accent bar */}
        <div
          style={{
            position: "absolute",
            left: 120,
            top: tearY + 120,
            width: interpolate(t, [tearAt + 20, tearAt + 50], [0, 200], { ...C, easing: ease }),
            height: 4,
            backgroundColor: P.terracotta,
            borderRadius: 2,
            opacity: interpolate(t, [tearAt + 20, tearAt + 35], [0, 0.9], C),
          }}
        />

        {/* Bottom content text */}
        <div
          style={{
            position: "absolute",
            left: 120,
            right: 120,
            top: tearY + 160,
            opacity: bottomTextOpacity,
            transform: `translateY(${bottomTextY}px)`,
          }}
        >
          <div
            style={{
              fontFamily: serif,
              fontSize: 78,
              lineHeight: 1.15,
              color: P.text,
              letterSpacing: "-0.02em",
              maxWidth: 840,
            }}
          >
            {bottomContent}
          </div>
        </div>
      </div>

      {/* Shadow along tear line */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: tearY - 20,
          height: 60,
          background: `linear-gradient(to bottom, transparent, rgba(0,0,0,${shadowOpacity}))`,
          filter: `blur(${shadowBlur}px)`,
          transform: `translateY(${topTranslateY * 0.3}px)`,
          pointerEvents: "none",
        }}
      />

      {/* Top layer — dark sheet that tears away */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          clipPath: `url(#${clipId}-top)`,
          backgroundColor: P.dark,
          transform: `translateY(${topTranslateY}px) rotate(${topRotate}deg)`,
          transformOrigin: "50% 0%",
          opacity: topOpacity,
        }}
      >
        {/* Grain texture on dark sheet */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,255,255,0.03), transparent)`,
          }}
        />

        {/* Top content text */}
        {topContent && (
          <div
            style={{
              position: "absolute",
              left: 120,
              right: 120,
              top: tearY - 300,
              opacity: topTextOpacity,
            }}
          >
            <div
              style={{
                fontFamily: serif,
                fontSize: 64,
                fontStyle: "italic",
                lineHeight: 1.2,
                color: P.muted,
                maxWidth: 840,
              }}
            >
              {topContent}
            </div>
          </div>
        )}
      </div>

      {/* Editorial label */}
      <div
        style={{
          position: "absolute",
          right: 60,
          bottom: 60,
          fontFamily: sans,
          fontSize: 20,
          color: P.muted,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          opacity: interpolate(t, [tearAt + 30, tearAt + 45], [0, 0.35], C),
        }}
      >
        REVEAL
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "abs-paper-tear",
  props: {
    bottomContent: "The truth underneath",
    tearAt: 30,
    at: 15,
  },
  durationInFrames: 180,
};
