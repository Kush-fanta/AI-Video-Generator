import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: sans } = loadSans();

export interface CountdownBeatProps extends BaseProps {
  /** Frame when "3" appears (default 0). Each number gets ~20 frames. */
  at?: number;
  /** Numbers to count down (default ["3","2","1"]) */
  numbers?: string[];
  /** Duration per beat in frames (default 20) */
  beatDuration?: number;
}

/**
 * CountdownBeat — 3...2...1 with each number slamming in full-screen
 * then hard-cutting. Builds tension before a reveal. Pure kinetic energy.
 */
export const CountdownBeat: React.FC<CountdownBeatProps> = ({
  at = 0,
  numbers = ["3", "2", "1"],
  beatDuration = 20,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Which beat are we on?
  const beatIndex = Math.floor((frame - at) / beatDuration);
  const beatFrame = (frame - at) % beatDuration;
  const isActive = frame >= at && beatIndex < numbers.length;
  const currentNumber = isActive ? numbers[beatIndex] : null;

  // Scale: slams from 1.4 to 1.0
  const scale = isActive && beatFrame >= 0
    ? spring({ frame: beatFrame, fps, config: { damping: 14, stiffness: 100, mass: 0.6 }, from: 1.4, to: 1.0 })
    : 1.4;

  // Opacity: instant in, hard cut out
  const opacity = isActive
    ? interpolate(beatFrame, [0, 1, beatDuration - 2, beatDuration - 1], [0, 1, 1, 0], C)
    : 0;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: P.dark,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {currentNumber && (
        <div
          style={{
            opacity,
            transform: `scale(${scale})`,
            fontFamily: sans,
            fontSize: 280,
            fontWeight: 700,
            color: P.terracotta,
            letterSpacing: "-0.04em",
          }}
        >
          {currentNumber}
        </div>
      )}
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "trans-countdown-beat",
  props: { at: 15 },
  durationInFrames: 180,
};
