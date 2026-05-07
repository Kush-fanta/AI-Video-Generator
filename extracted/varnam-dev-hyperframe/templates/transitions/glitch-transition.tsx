import { AbsoluteFill, useCurrentFrame, interpolate, random } from "remotion";
import { P } from "../shared/palette";
import { C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

export interface GlitchTransitionProps extends BaseProps {
  /** Frame when glitch starts */
  at: number;
  /** Content behind the glitch */
  children?: React.ReactNode;
}

/**
 * GlitchTransition — 6 frames of scan lines, color channel offset,
 * horizontal slice displacement. Digital corruption cut.
 */
export const GlitchTransition: React.FC<GlitchTransitionProps> = ({
  at,
  children,
}) => {
  const frame = useCurrentFrame();

  const glitchDuration = 6;
  const isGlitching = frame >= at && frame < at + glitchDuration;
  const intensity = isGlitching
    ? interpolate(frame, [at, at + glitchDuration], [1, 0.2], C)
    : 0;

  // Horizontal slice offsets — 5 slices
  const slices = isGlitching
    ? Array.from({ length: 5 }, (_, i) => ({
        top: `${i * 20}%`,
        height: "20%",
        transform: `translateX(${(random(`glitch-${frame}-${i}`) * 2 - 1) * 40 * intensity}px)`,
      }))
    : null;

  // Color channel offset
  const rgbShift = isGlitching ? Math.round(intensity * 8) : 0;

  // Scan line overlay opacity
  const scanOpacity = isGlitching ? 0.3 * intensity : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: P.dark }}>
      {/* Content layer with RGB shift when glitching */}
      <AbsoluteFill
        style={{
          filter: isGlitching
            ? `drop-shadow(${rgbShift}px 0 0 rgba(255,0,0,0.5)) drop-shadow(-${rgbShift}px 0 0 rgba(0,255,255,0.5))`
            : undefined,
        }}
      >
        {/* Sliced content during glitch, normal otherwise */}
        {isGlitching && slices
          ? slices.map((s, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: s.top,
                  left: 0,
                  width: "100%",
                  height: s.height,
                  overflow: "hidden",
                  transform: s.transform,
                }}
              >
                <AbsoluteFill style={{ top: `-${i * 20}%`, height: "500%" }}>
                  {children}
                </AbsoluteFill>
              </div>
            ))
          : children}
      </AbsoluteFill>

      {/* Scan lines overlay */}
      {isGlitching && (
        <AbsoluteFill
          style={{
            opacity: scanOpacity,
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)",
            pointerEvents: "none",
          }}
        />
      )}
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "trans-glitch-transition",
  props: { at: 15 },
  durationInFrames: 180,
};
