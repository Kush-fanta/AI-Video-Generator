import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { C, ease, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: sans } = loadSans();

export interface SectionWipeProps extends BaseProps {
  /** Label for the new section (e.g. "Part II", "The Pivot") */
  categoryLabel?: string;
  /** Color of the wipe bar (default: terracotta) */
  wipeColor?: string;
  /** Frame when wipe begins (default 0) */
  at?: number;
}

/**
 * SectionWipe — horizontal wipe transition.
 * A color bar (terracotta) sweeps left→right over 20 frames, revealing the new section.
 * Category label settles into place with spring physics after the wipe clears.
 * Clean structural break.
 */
export const SectionWipe: React.FC<SectionWipeProps> = ({
  categoryLabel,
  wipeColor = P.terracotta,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  // Wipe bar: leading edge sweeps across, then trailing edge follows
  const leadingEdge = interpolate(
    frame,
    [at, at + 20],
    [0, 120],
    { ...C, easing: ease },
  );
  const trailingEdge = interpolate(
    frame,
    [at + 6, at + 26],
    [0, 120],
    { ...C, easing: ease },
  );

  // Wipe bar position as percentages
  const barLeft = `${trailingEdge}%`;
  const barWidth = `${Math.max(0, leadingEdge - trailingEdge)}%`;

  // Label appears after wipe finishes — spring physics for weight and intention
  const labelAt = at + 28;
  const labelF = Math.max(0, frame - labelAt);

  const labelSpring = spring({
    frame: labelF,
    fps: FPS,
    config: { damping: 18, stiffness: 80, mass: 1.2 },
  });

  // Spring drives translateY from 32px down to 0 — label falls into place
  const labelY = interpolate(labelSpring, [0, 1], [32, 0], C);
  const labelOpacity = interpolate(frame, [labelAt, labelAt + 12], [0, 1], C);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* The wipe bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: barLeft,
          width: barWidth,
          height: "100%",
          backgroundColor: wipeColor,
          zIndex: 2,
        }}
      />

      {/* Category label — mask reveal from left + spring scale */}
      {categoryLabel && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
            overflow: "hidden",
          }}
        >
          {/* Clip mask: label slides in from left — revealed as wipe bar passes */}
          <div
            style={{
              overflow: "hidden",
              clipPath: `inset(0 ${Math.max(0, 100 - labelOpacity * 100)}% 0 0)`,
            }}
          >
            <div
              style={{
                fontFamily: sans,
                fontSize: 72,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: P.text,
                fontWeight: 600,
                opacity: Math.min(1, labelOpacity * 1.5),
                transform: `translateY(${labelY}px) scale(${interpolate(
                  spring({ frame: Math.max(0, frame - labelAt), fps: FPS, config: { damping: 20, stiffness: 100, mass: 1.0 } }),
                  [0, 1], [0.92, 1.0], C
                )})`,
                transformOrigin: "center center",
                whiteSpace: "nowrap",
              }}
            >
              {categoryLabel}
            </div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "trans-section-wipe",
  props: {
    categoryLabel: "PART II",
    wipeColor: P.terracotta
  },
  durationInFrames: 150,
};
