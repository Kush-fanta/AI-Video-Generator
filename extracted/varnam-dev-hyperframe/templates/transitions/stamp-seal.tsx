import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { P } from "../shared/palette";
import { C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();

export interface StampSealProps extends BaseProps {
  /** The verdict word or phrase */
  text: string;
  /** Frame when stamp lands */
  at: number;
  /** Stamp color (default terracotta) */
  color?: string;
  /** Initial rotation angle in degrees (default -12) */
  rotation?: number;
}

/**
 * StampSeal — large text rotates in from angle, lands with bounce.
 * Red/terracotta. Section verdict or conclusion. SLAM energy.
 */
export const StampSeal: React.FC<StampSealProps> = ({
  text,
  at,
  color = P.terracotta,
  rotation = -12,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = frame - at;

  // Scale: starts at 2.5, slams down to 1.0 with aggressive spring
  const scale = progress >= 0
    ? spring({ frame: progress, fps, config: { damping: 10, stiffness: 120, mass: 0.7 }, from: 2.5, to: 1.0 })
    : 2.5;

  // Rotation: starts rotated, snaps to 0
  const rot = progress >= 0
    ? spring({ frame: progress, fps, config: { damping: 10, stiffness: 120, mass: 0.7 }, from: rotation, to: 0 })
    : rotation;

  // Opacity: instant appearance
  const opacity = interpolate(frame, [at, at + 2], [0, 1], C);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: P.dark,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          opacity,
          transform: `scale(${scale}) rotate(${rot}deg)`,
          transformOrigin: "center center",
          fontFamily: serif,
          fontSize: 140,
          fontWeight: "bold",
          color,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          textAlign: "center",
          lineHeight: 1.0,
          padding: "0 60px",
          maxWidth: 1400,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "trans-stamp-seal",
  props: { text: "APPROVED", at: 15 },
  durationInFrames: 180,
};
