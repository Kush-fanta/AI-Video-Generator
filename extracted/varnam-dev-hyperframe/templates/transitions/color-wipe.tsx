import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { P } from "../shared/palette";
import { C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

export interface ColorWipeProps extends BaseProps {
  /** Frame when wipe starts */
  at: number;
  /** Wipe color (default terracotta) */
  color?: string;
  /** Content revealed after wipe passes */
  children?: React.ReactNode;
}

/**
 * ColorWipe — solid terracotta rectangle wipes across frame left to right
 * over 12 frames, revealing new background behind it. Bold, physical.
 */
export const ColorWipe: React.FC<ColorWipeProps> = ({
  at,
  color = P.terracotta,
  children,
}) => {
  const frame = useCurrentFrame();

  // Wipe bar: leading edge enters from left, trailing edge follows
  const leadEdge = interpolate(frame, [at, at + 8], [0, 100], C);
  const trailEdge = interpolate(frame, [at + 4, at + 12], [0, 100], C);

  // Content opacity: visible once wipe passes midpoint
  const contentOpacity = interpolate(frame, [at + 6, at + 8], [0, 1], C);

  return (
    <AbsoluteFill style={{ backgroundColor: P.dark }}>
      {/* New content revealed behind wipe */}
      {children && (
        <AbsoluteFill style={{ opacity: contentOpacity }}>
          {children}
        </AbsoluteFill>
      )}
      {/* Wipe bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: `${trailEdge}%`,
          width: `${Math.max(0, leadEdge - trailEdge)}%`,
          height: "100%",
          backgroundColor: color,
        }}
      />
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "trans-color-wipe",
  props: { at: 15 },
  durationInFrames: 180,
};
