import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, C, FPS, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface TopographyLinesProps extends BaseProps {
  /** Optional text overlay centered on the map */
  text?: string;
  /** Number of contour line groups (default 8) */
  lineCount?: number;
  /** Frame offset */
  at?: number;
}

/**
 * TopographyLines — Animated topographic contour lines.
 * Nested elliptical contours drift slowly upward like terrain
 * shifting beneath a cartographer's lens. Multiple concentric
 * rings at different centers create the feel of a real elevation
 * map. Optional text overlay for labeling. Meditative, geographic.
 */
export const TopographyLines: React.FC<TopographyLinesProps> = ({
  text,
  lineCount = 8,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const t = frame - at;

  // Continuous upward drift — loops every 6s
  const drift = (t / (FPS * 6)) * 100;

  // Contour centers — two focal points for natural terrain feel
  const cx1 = 540 + Math.sin((t / FPS) * Math.PI * 0.1) * 80;
  const cy1 = 960 + Math.cos((t / FPS) * Math.PI * 0.08) * 60;
  const cx2 = 380 + Math.cos((t / FPS) * Math.PI * 0.12) * 60;
  const cy2 = 700 + Math.sin((t / FPS) * Math.PI * 0.09) * 50;

  // Build contour ring sets
  const contours1 = Array.from({ length: lineCount }, (_, i) => {
    const rx = 80 + i * 55 + Math.sin((t / FPS) * 0.4 + i) * 10;
    const ry = 50 + i * 40 + Math.cos((t / FPS) * 0.3 + i) * 8;
    const rotation = i * 12 + (t / FPS) * 2;
    const opacity = interpolate(i, [0, lineCount - 1], [0.5, 0.15]);
    return { cx: cx1, cy: cy1, rx, ry, rotation, opacity, key: `a${i}` };
  });

  const contours2 = Array.from({ length: Math.floor(lineCount * 0.75) }, (_, i) => {
    const rx = 60 + i * 50 + Math.cos((t / FPS) * 0.35 + i) * 12;
    const ry = 40 + i * 35 + Math.sin((t / FPS) * 0.28 + i) * 9;
    const rotation = -i * 15 + (t / FPS) * -1.5;
    const opacity = interpolate(i, [0, Math.floor(lineCount * 0.75) - 1], [0.4, 0.1]);
    return { cx: cx2, cy: cy2, rx, ry, rotation, opacity, key: `b${i}` };
  });

  // Third cluster — bottom region
  const cx3 = 650 + Math.sin((t / FPS) * Math.PI * 0.07) * 40;
  const cy3 = 1400 + Math.cos((t / FPS) * Math.PI * 0.06) * 30;
  const contours3 = Array.from({ length: Math.floor(lineCount * 0.5) }, (_, i) => {
    const rx = 100 + i * 65;
    const ry = 60 + i * 45;
    const rotation = i * 8 + (t / FPS) * 1;
    const opacity = interpolate(i, [0, Math.floor(lineCount * 0.5) - 1], [0.35, 0.08]);
    return { cx: cx3, cy: cy3, rx, ry, rotation, opacity, key: `c${i}` };
  });

  const allContours = [...contours1, ...contours2, ...contours3];

  // Text entrance
  const textOpacity = text ? interpolate(t, [30, 55], [0, 1], C) : 0;
  const textY = text ? interpolate(t, [30, 55], [20, 0], { ...C, easing: ease }) : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Subtle vertical drift container */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translateY(${-drift % 50}px)`,
        }}
      >
        <svg
          width="1080"
          height="1920"
          viewBox="0 0 1080 1920"
          style={{ position: "absolute", inset: 0 }}
        >
          {allContours.map((c) => (
            <ellipse
              key={c.key}
              cx={c.cx}
              cy={c.cy}
              rx={c.rx}
              ry={c.ry}
              fill="none"
              stroke={P.light}
              strokeWidth={1.2}
              opacity={c.opacity}
              transform={`rotate(${c.rotation} ${c.cx} ${c.cy})`}
            />
          ))}

          {/* Index markers — small dots at contour intersections */}
          {contours1.filter((_, i) => i % 2 === 0).map((c, i) => (
            <circle
              key={`dot-${i}`}
              cx={c.cx + c.rx * 0.7}
              cy={c.cy}
              r={2.5}
              fill={P.muted}
              opacity={0.4}
            />
          ))}
        </svg>
      </div>

      {/* Thin horizontal reference lines — cartographic feel */}
      {Array.from({ length: 5 }, (_, i) => {
        const y = 300 + i * 330;
        const lineOpacity = interpolate(t, [10 + i * 5, 30 + i * 5], [0, 0.08], C);
        return (
          <div
            key={`hline-${i}`}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: y,
              height: 1,
              backgroundColor: P.muted,
              opacity: lineOpacity,
            }}
          />
        );
      })}

      {/* Optional centered text */}
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
              fontSize: 88,
              fontStyle: "italic",
              lineHeight: 1.15,
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

      {/* Coordinate label — bottom right */}
      <div
        style={{
          position: "absolute",
          right: 60,
          bottom: 60,
          fontFamily: sans,
          fontSize: 20,
          color: P.muted,
          letterSpacing: "0.1em",
          opacity: interpolate(t, [40, 55], [0, 0.4], C),
        }}
      >
        ELEVATION
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "abs-topography-lines",
  props: {
    text: "Terrain",
    at: 15,
  },
  durationInFrames: 180,
};
