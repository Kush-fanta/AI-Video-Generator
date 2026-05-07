import { AbsoluteFill, useCurrentFrame, interpolate, random } from "remotion";
import { C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

export interface ShakeImpactProps extends BaseProps {
  /** Frame when shake starts */
  at: number;
  /** Shake intensity in pixels (default 12) */
  intensity?: number;
  /** Content to shake */
  children?: React.ReactNode;
}

/**
 * ShakeImpact — frame shakes with random x/y offsets for 8 frames.
 * Impact/explosion punctuation. Wraps any content and rattles it.
 */
export const ShakeImpact: React.FC<ShakeImpactProps> = ({
  at,
  intensity = 12,
  children,
}) => {
  const frame = useCurrentFrame();

  const shakeDuration = 8;
  const isShaking = frame >= at && frame < at + shakeDuration;

  // Decay: starts strong, dies fast
  const decay = isShaking
    ? interpolate(frame, [at, at + shakeDuration], [1, 0], C)
    : 0;

  // Deterministic random offsets per frame
  const offsetX = isShaking
    ? (random(`shake-x-${frame}`) * 2 - 1) * intensity * decay
    : 0;
  const offsetY = isShaking
    ? (random(`shake-y-${frame}`) * 2 - 1) * intensity * decay
    : 0;

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          transform: `translate(${offsetX}px, ${offsetY}px)`,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "trans-shake-impact",
  props: { at: 15 },
  durationInFrames: 180,
};
