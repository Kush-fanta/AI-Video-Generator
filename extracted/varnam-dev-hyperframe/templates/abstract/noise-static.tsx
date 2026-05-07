 "use client";

import React, { useMemo, useRef } from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, C, FPS, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface NoiseStaticProps extends BaseProps {
  /** Text revealed when static resolves */
  text: string;
  /** Frame when static begins resolving to clean (default 45) */
  resolveAt?: number;
  /** Frame offset */
  at?: number;
}

/** Simple deterministic hash for pseudo-random values */
const hash = (x: number, y: number, seed: number): number => {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.3) * 43758.5453;
  return n - Math.floor(n);
};

/**
 * NoiseStatic — Animated TV static that gradually resolves to clean frame.
 * Grid of small rectangles rapidly switching between light and dark,
 * simulating analog broadcast noise. Over time the static fades and a
 * clean cream surface with text emerges — like a broadcast coming into
 * focus. Retro, analog, dramatic reveal.
 */
export const NoiseStatic: React.FC<NoiseStaticProps> = ({
  text,
  resolveAt = 45,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame - at;

  const cellW = 20;
  const cellH = 16;
  const cols = Math.ceil(1080 / cellW);
  const rows = Math.ceil(1920 / cellH);

  const resolveProgress = t >= resolveAt
    ? interpolate(t, [resolveAt, resolveAt + 50], [1, 0], { ...C, easing: ease })
    : 1;
  const scanlineY = t >= resolveAt
    ? interpolate(t, [resolveAt, resolveAt + 40], [0, 1920], C) : -100;
  const flashOpacity = interpolate(t, [0, 3, 6], [1, 0.8, 0], C);
  const staticSeed = t * 13 + 7;

  const isResolved = (row: number): boolean => {
    if (resolveProgress >= 1) return false;
    return row * cellH < scanlineY * resolveProgress * 0.5 + (1 - resolveProgress) * 1920;
  };

  const staticBlocks = useMemo(() => {
    const blocks: Array<{ x: number; y: number; w: number; h: number }> = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        blocks.push({ x: c * cellW, y: r * cellH, w: cellW, h: cellH });
      }
    }
    return blocks;
  }, [rows, cols, cellW, cellH]);

  const textAppear = t >= resolveAt + 20;
  const textOpacity = textAppear ? interpolate(t, [resolveAt + 20, resolveAt + 45], [0, 1], C) : 0;
  const textScale = textAppear
    ? spring({ frame: t - resolveAt - 20, fps, config: { damping: 14, stiffness: 70, mass: 0.9 }, from: 1.06, to: 1.0 })
    : 1.06;

  const postGrainOpacity = interpolate(resolveProgress, [0.2, 0], [0, 0.06], C);
  const grainId = useRef(`static-grain-${Math.random().toString(36).slice(2)}`).current;
  const interferenceY1 = (t * 7.3) % 1920;
  const interferenceY2 = (t * 11.1 + 400) % 1920;
  const interferenceOpacity = resolveProgress * 0.15;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Initial flash */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#fff",
          opacity: flashOpacity,
          pointerEvents: "none",
        }}
      />

      {/* Static noise layer */}
      {resolveProgress > 0.01 && (
        <svg
          width="1080"
          height="1920"
          viewBox="0 0 1080 1920"
          style={{
            position: "absolute",
            inset: 0,
            opacity: resolveProgress,
          }}
        >
          {staticBlocks.map((block, i) => {
            const row = Math.floor(i / cols);
            if (isResolved(row) && resolveProgress < 0.5) return null;

            const val = hash(block.x, block.y, staticSeed);
            // Bias toward light/dark extremes for crispy static
            const brightness = val > 0.5 ? (val > 0.75 ? 240 : 180) : (val > 0.25 ? 80 : 30);
            const color = `rgb(${brightness},${brightness},${brightness})`;

            return (
              <rect
                key={i}
                x={block.x}
                y={block.y}
                width={block.w}
                height={block.h}
                fill={color}
                opacity={0.9}
              />
            );
          })}
        </svg>
      )}

      {/* Horizontal interference bars */}
      {resolveProgress > 0.1 && (<>
        <div style={{ position: "absolute", left: 0, right: 0, top: interferenceY1, height: 4, backgroundColor: "#fff", opacity: interferenceOpacity, mixBlendMode: "overlay" as const }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: interferenceY2, height: 2, backgroundColor: "#000", opacity: interferenceOpacity * 0.7, mixBlendMode: "overlay" as const }} />
      </>)}

      {/* Scanline sweep — visible during resolve */}
      {resolveProgress > 0 && resolveProgress < 1 && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: scanlineY - 3,
            height: 6,
            background: `linear-gradient(to bottom, transparent, ${P.terracotta}, transparent)`,
            opacity: 0.6,
          }}
        />
      )}

      {/* Post-resolve grain */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          mixBlendMode: "overlay",
          pointerEvents: "none",
        }}
      >
        <filter id={grainId}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency={0.8}
            numOctaves={3}
            seed={(t * 7) % 500}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect
          width="100%"
          height="100%"
          filter={`url(#${grainId})`}
          opacity={postGrainOpacity + resolveProgress * 0.04}
        />
      </svg>

      {/* Revealed text */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: textOpacity,
          transform: `scale(${textScale})`,
          transformOrigin: "center center",
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 100,
            lineHeight: 1.1,
            color: P.text,
            textAlign: "center",
            maxWidth: 900,
            padding: "0 80px",
            letterSpacing: "-0.02em",
          }}
        >
          {text}
        </div>

        {/* Thin accent line */}
        <div
          style={{
            width: interpolate(
              t,
              [resolveAt + 30, resolveAt + 50],
              [0, 160],
              { ...C, easing: ease },
            ),
            height: 2,
            backgroundColor: P.terracotta,
            marginTop: 28,
            borderRadius: 1,
            opacity: interpolate(t, [resolveAt + 30, resolveAt + 40], [0, 0.8], C),
          }}
        />
      </div>

      {/* Broadcast label */}
      <div
        style={{
          position: "absolute",
          left: 60,
          bottom: 60,
          fontFamily: sans,
          fontSize: 20,
          color: P.muted,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          opacity: interpolate(t, [resolveAt + 40, resolveAt + 55], [0, 0.35], C),
        }}
      >
        SIGNAL
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "abs-noise-static",
  props: {
    text: "Transmission",
    resolveAt: 35,
    at: 15,
  },
  durationInFrames: 180,
};
