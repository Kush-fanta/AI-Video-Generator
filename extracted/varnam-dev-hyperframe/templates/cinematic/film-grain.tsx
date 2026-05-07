 "use client";

import React, { useRef } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { BaseProps } from "../shared/types";

interface FilmGrainProps extends BaseProps {
  /** Grain opacity — 0.08 subtle, 0.15 heavy analog feel (default 0.12) */
  opacity?: number;
  /** Base frequency of the fractal noise (default 0.85) */
  baseFrequency?: number;
}

/**
 * FilmGrain — animated SVG noise overlay.
 * Renders feTurbulence fractal noise that re-seeds every frame,
 * producing organic analog texture. Uses mixBlendMode "overlay" so
 * grain is visible on both light and dark content. Layer on top of
 * any content via <Sequence>.
 */
export const FilmGrain: React.FC<FilmGrainProps> = ({
  opacity = 0.12,
  baseFrequency = 0.85,
}) => {
  const frame = useCurrentFrame();

  // Large seed pool with irregular stepping avoids obvious pattern repetition
  const seed = (frame * 7 + 13) % 999;

  // Unique filterId per instance — avoids collisions when multiple instances render
  const idSuffix = useRef(Math.random().toString(36).slice(2)).current;
  const filterId = `grain-${seed}-${idSuffix}`;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          mixBlendMode: "overlay",
        }}
      >
        <filter id={filterId}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency={baseFrequency}
            numOctaves={3}
            seed={seed}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect
          width="100%"
          height="100%"
          filter={`url(#${filterId})`}
          opacity={opacity}
        />
      </svg>
    </AbsoluteFill>
  );
};
