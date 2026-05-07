/**
 * TransitionRedSweep — SK.accent.red rectangle sweeps across the frame.
 * Frames 0–20: sweeps in from left (translateX -1920 → 0).
 * Frames 20–30: sweeps out to right (translateX 0 → 1920).
 * High-energy scene divider.
 */

import React from "react";
import { useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK } from "./_tokens";

loadInter();

const progress = (frame: number, start: number, n: number) =>
  Math.min(1, Math.max(0, (frame - start) / n));

const eased = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

export interface TransitionRedSweepProps {
  durationInFrames: number;
}

export const TransitionRedSweep: React.FC<TransitionRedSweepProps> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();

  const sweepInFrames = Math.round(durationInFrames * 0.667); // 20 of 30
  const sweepOutFrames = durationInFrames - sweepInFrames;     // 10 of 30

  // Sweep in: x from -1920 to 0
  const tIn = eased(progress(frame, 0, sweepInFrames));
  const xIn = -1920 + 1920 * tIn;

  // Sweep out: x from 0 to 1920
  const tOut = eased(progress(frame, sweepInFrames, sweepOutFrames));
  const xOut = 1920 * tOut;

  const translateX = frame < sweepInFrames ? xIn : xOut;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1920,
          height: "100%",
          backgroundColor: SK.accent.red,
          transform: `translateX(${translateX}px)`,
        }}
      />
    </div>
  );
};

export default TransitionRedSweep;

export const demo = {
  compositionId: "sk-transition-red-sweep",
  durationInFrames: 30,
  props: { durationInFrames: 30 } satisfies TransitionRedSweepProps,
};
