import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, overshootScale, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface MirrorStatProps extends BaseProps {
  topValue: string;
  topLabel: string;
  bottomValue: string;
  bottomLabel: string;
  source?: string;
  at?: number;
}

/**
 * MirrorStat — Two identical layouts mirrored vertically.
 * Top half has stat A (serif 140px), bottom half has stat B (serif 140px).
 * Horizontal divider separates them. Same structure, different numbers.
 * Top is terracotta, bottom is slate.
 */
export const MirrorStat: React.FC<MirrorStatProps> = ({
  topValue,
  topLabel,
  bottomValue,
  bottomLabel,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  // Top stat entrance
  const topScale = overshootScale(frame, at + 6);
  // Bottom stat entrance (staggered)
  const bottomScale = overshootScale(frame, at + 16);

  // Divider line
  const dividerWidth = lineGrow(frame, at + 10, 30);

  // Slide entrances for each half
  const topSlide = spring({
    frame: f,
    fps: FPS,
    config: { damping: 16, stiffness: 80, mass: 1.0 },
  });
  const topY = interpolate(topSlide, [0, 1], [-60, 0], C);

  const bottomSlide = spring({
    frame: Math.max(0, f - 8),
    fps: FPS,
    config: { damping: 16, stiffness: 80, mass: 1.0 },
  });
  const bottomY = interpolate(bottomSlide, [0, 1], [60, 0], C);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Top half */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1080,
          height: 960,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `translateY(${topY}px)`,
          opacity: topSlide,
        }}
      >
        <div style={{ textAlign: "center", padding: "0 100px" }}>
          <div
            style={{
              fontFamily: serif,
              fontSize: 140,
              color: P.terracotta,
              lineHeight: 1.0,
              letterSpacing: "-0.03em",
              transform: `scale(${topScale})`,
            }}
          >
            {topValue}
          </div>
          <div
            style={{
              ...reveal(frame, at + 12),
              fontFamily: sans,
              fontSize: 40,
              color: P.sub,
              marginTop: 24,
              lineHeight: 1.3,
            }}
          >
            {topLabel}
          </div>
        </div>
      </div>

      {/* Horizontal divider */}
      <div
        style={{
          position: "absolute",
          top: 960,
          left: "50%",
          transform: "translateX(-50%)",
          width: `${dividerWidth}%`,
          maxWidth: 800,
          height: 4,
          backgroundColor: P.light,
          borderRadius: 2,
        }}
      />

      {/* Bottom half */}
      <div
        style={{
          position: "absolute",
          top: 960,
          left: 0,
          width: 1080,
          height: 960,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `translateY(${bottomY}px)`,
          opacity: bottomSlide,
        }}
      >
        <div style={{ textAlign: "center", padding: "0 100px" }}>
          <div
            style={{
              fontFamily: serif,
              fontSize: 140,
              color: P.slate,
              lineHeight: 1.0,
              letterSpacing: "-0.03em",
              transform: `scale(${bottomScale})`,
            }}
          >
            {bottomValue}
          </div>
          <div
            style={{
              ...reveal(frame, at + 22),
              fontFamily: sans,
              fontSize: 40,
              color: P.sub,
              marginTop: 24,
              lineHeight: 1.3,
            }}
          >
            {bottomLabel}
          </div>
        </div>
      </div>

      {/* Source */}
      {source && (
        <div
          style={{
            ...reveal(frame, at + 30),
            position: "absolute",
            bottom: 80,
            left: 0,
            width: 1080,
            textAlign: "center",
            fontFamily: sans,
            fontSize: 20,
            fontWeight: 500,
            letterSpacing: "0.08em",
            color: P.muted,
            textTransform: "uppercase",
          }}
        >
          Source: {source}
        </div>
      )}
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "comp-mirror-stat",
  props: {
    topValue: "1,850",
    topLabel: "GCCs in India today",
    bottomValue: "400",
    bottomLabel: "GCCs in India, 2015",
    source: "NASSCOM",
    at: 15,
  },
  durationInFrames: 180,
};
