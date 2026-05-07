import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

export interface HardCutFlashProps extends BaseProps {
  /** Frame when the flash fires */
  at: number;
  /** Content to show after the flash */
  children?: React.ReactNode;
}

/**
 * HardCutFlash — white flash (2 frames) between scenes.
 * Simple but violent scene break. Flash peaks instantly, cuts to black.
 */
export const HardCutFlash: React.FC<HardCutFlashProps> = ({ at, children }) => {
  const frame = useCurrentFrame();

  // Flash: full white for 2 frames, then gone
  const flashOpacity = interpolate(
    frame,
    [at, at + 1, at + 2, at + 4],
    [0, 1, 1, 0],
    C,
  );

  // Content fades in after flash
  const contentOpacity = interpolate(frame, [at + 3, at + 5], [0, 1], C);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0A0A0A" }}>
      {/* Content behind */}
      {children && (
        <AbsoluteFill style={{ opacity: contentOpacity }}>
          {children}
        </AbsoluteFill>
      )}
      {/* White flash overlay */}
      <AbsoluteFill
        style={{
          backgroundColor: "#FFFFFF",
          opacity: flashOpacity,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "trans-hard-cut-flash",
  props: { at: 15 },
  durationInFrames: 180,
};
