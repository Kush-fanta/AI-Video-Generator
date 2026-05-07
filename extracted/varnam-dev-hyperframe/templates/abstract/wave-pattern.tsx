import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { C, FPS, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface WavePatternProps extends BaseProps {
  /** Optional hero text overlaid on the waves */
  text?: string;
  /** Number of wave lines (default 12) */
  waveCount?: number;
  /** Frame offset */
  at?: number;
}

/** Palette colors for wave cycling at low opacity */
const WAVE_COLORS = [
  P.terracotta,
  P.sage,
  P.mauve,
  P.slate,
  P.muted,
  P.light,
];

/**
 * WavePattern — Multiple sine wave lines stacked vertically.
 * Each wave has slightly different frequency, amplitude, and phase,
 * creating an organic audio-visualizer feel. Colors cycle through
 * the palette at low opacity. Continuous, elegant, breathing.
 */
export const WavePattern: React.FC<WavePatternProps> = ({
  text,
  waveCount = 12,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const t = frame - at;

  const W = 1080;
  const H = 1920;

  // Time factor — continuous motion
  const time = t / FPS;

  // Wave vertical spacing — centered in canvas
  const totalHeight = H * 0.7;
  const startY = (H - totalHeight) / 2;
  const spacing = totalHeight / (waveCount - 1);

  // Build wave SVG paths
  const waves = Array.from({ length: waveCount }, (_, i) => {
    // Each wave has unique params
    const freq = 0.008 + i * 0.0012;
    const amplitude = 30 + Math.sin(time * 0.5 + i * 0.8) * 15;
    const phase = time * (1.2 + i * 0.15) + i * 0.9;
    const baseY = startY + i * spacing;

    // Build path — sample points across width
    const points: string[] = [];
    const step = 4;
    for (let x = 0; x <= W; x += step) {
      // Layered sine for organic shape
      const y1 = Math.sin(x * freq + phase) * amplitude;
      const y2 = Math.sin(x * freq * 1.8 + phase * 0.7 + 2) * amplitude * 0.3;
      const y3 = Math.cos(x * freq * 0.5 + phase * 1.3) * amplitude * 0.15;
      const y = baseY + y1 + y2 + y3;
      points.push(`${x === 0 ? "M" : "L"} ${x} ${y.toFixed(1)}`);
    }

    // Color cycling through palette
    const color = WAVE_COLORS[i % WAVE_COLORS.length];

    // Opacity — varies per wave, breathes over time
    const breathe = interpolate(
      Math.sin(time * 0.6 + i * 0.5),
      [-1, 1],
      [0.15, 0.45],
    );

    // Entrance stagger — waves appear one by one
    const entranceOpacity = interpolate(t, [i * 3, i * 3 + 20], [0, 1], C);

    // Stroke width — slight variation for depth
    const strokeWidth = interpolate(i, [0, waveCount - 1], [1.8, 1.0]);

    return {
      path: points.join(" "),
      color,
      opacity: breathe * entranceOpacity,
      strokeWidth,
      key: i,
    };
  });

  // Secondary set — faint echoes offset vertically
  const echoes = Array.from({ length: Math.floor(waveCount / 2) }, (_, i) => {
    const srcIdx = i * 2;
    const src = waves[srcIdx];
    if (!src) return null;

    // Same path but offset and fainter
    const offsetY = 15 + Math.sin(time * 0.3 + i) * 5;

    return {
      path: src.path,
      color: P.light,
      opacity: src.opacity * 0.25,
      strokeWidth: 0.8,
      offsetY,
      key: `echo-${i}`,
    };
  }).filter(Boolean);

  // Text entrance
  const textOpacity = text ? interpolate(t, [30, 60], [0, 1], C) : 0;
  const textY = text ? interpolate(t, [30, 60], [20, 0], { ...C, easing: ease }) : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* Echo waves — behind main waves */}
        {echoes.map((echo) =>
          echo ? (
            <path
              key={echo.key}
              d={echo.path}
              fill="none"
              stroke={echo.color}
              strokeWidth={echo.strokeWidth}
              opacity={echo.opacity}
              transform={`translate(0, ${echo.offsetY})`}
            />
          ) : null,
        )}

        {/* Main waves */}
        {waves.map((wave) => (
          <path
            key={wave.key}
            d={wave.path}
            fill="none"
            stroke={wave.color}
            strokeWidth={wave.strokeWidth}
            opacity={wave.opacity}
            strokeLinecap="round"
          />
        ))}
      </svg>

      {/* Optional hero text */}
      {text && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: textOpacity,
            transform: `translateY(${textY}px)`,
          }}
        >
          <div
            style={{
              fontFamily: serif,
              fontSize: 96,
              fontStyle: "italic",
              lineHeight: 1.1,
              color: P.text,
              textAlign: "center",
              maxWidth: 860,
              padding: "0 80px",
              letterSpacing: "-0.02em",
            }}
          >
            {text}
          </div>
        </div>
      )}

      {/* Minimal bottom label */}
      <div
        style={{
          position: "absolute",
          right: 60,
          bottom: 60,
          fontFamily: sans,
          fontSize: 20,
          color: P.muted,
          letterSpacing: "0.1em",
          opacity: interpolate(t, [45, 60], [0, 0.35], C),
        }}
      >
        FREQUENCY
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "abs-wave-pattern",
  props: {
    text: "Frequency",
    at: 15,
  },
  durationInFrames: 180,
};
